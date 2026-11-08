<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\KdsStation;
use App\Models\FoodItem;
use App\Models\Ingredient;
use App\Models\Media;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Place;
use App\Services\ReceiptGenerator;
use App\Services\StockConsumptionService;
use App\Support\CurrentBranch;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;

class OrderController extends Controller
{
    protected $model;

    public function __construct(Order $model)
    {
        $this->model = $model;
    }

    protected function validationRules(): array
    {
        return [
            'customer_id' => 'required_unless:type,dining,on-way|exists:customers,id',
            'order_datetime' => 'required|date',
            'status' => 'required|string|max:255',
            'paid' => 'required|boolean',
            'type' => 'nullable|in:dining,delivery,on-way',
            'qty' => 'required|integer|min:1',
            'subtotal' => 'required|numeric|min:0',
            'discount_type' => 'required|in:amount,percentage',
            'discount_amount' => 'required|numeric|min:0',
            'service_charges' => 'required|numeric|min:0',
            'service_charges_percentage' => [
                'required',
                'numeric',
                'between:0,100',
                'regex:/^\d+(\.\d{1,2})?$/',
            ],
            'grand_total' => 'required|numeric|min:0',
            'place_id' => 'required|exists:places,id',
            'order_items' => 'required|array',
            'order_items.*.fooditems_id' => 'required|exists:food_items,id',
            'order_items.*.quantity' => 'required|integer|min:1',
            'order_items.*.discount_amount' => 'nullable',
            'order_items.*.sub_total' => 'nullable',
            'order_items.*.category_id' => 'required|integer',
            'order_items.*.add_note' => 'nullable|string',
            'order_items.*.kds_station_id' => 'nullable|exists:kds_stations,id',
            'order_items.*.extras' => 'nullable|array',
            'order_items.*.extras.*.ingredient_id' => [
                'required', 'integer',
                \Illuminate\Validation\Rule::exists('ingredients', 'id')->whereNull('deleted_at')->where('is_active', true),
            ],
            'order_items.*.extras.*.quantity' => 'required|numeric|min:0.0001',
        ];
    }

    public function store(Request $request): JsonResponse
    {
        set_time_limit(120); // Allow time for receipt rendering + WhatsApp upload

        $data = $request->validate($this->validationRules());

        $data = $this->normalizeOrderData($data);

        $orderItems = $data['order_items'];
        $data['subtotal'] = $this->priceOrderItems($orderItems, $this->resolveBranchId((int) $data['place_id']));
        $this->recalculateTotals($data);
        unset($data['order_items']);

        // The sale, its lines and the ingredient draw-down commit together, so a
        // failed deduction can never leave a saved order with untouched stock.
        $order = DB::transaction(function () use ($data, $orderItems) {
            $order = $this->model::create($data);

            foreach ($orderItems as $item) {
                $this->createOrderItem($order, $item);
            }

            // Recipe -> ingredients -> stock deduction, and this order's COGS.
            app(StockConsumptionService::class)->consumeForOrder($order);

            return $order;
        });

        // Load relationships for receipt generation
        $order->load('orderItems.item', 'customer');

        // Generate the receipt as a PNG using PHP GD (no Node/Puppeteer needed).
        $receipt = app(ReceiptGenerator::class)->generate($order);

        $media = Media::create([
            'order_id' => $order->id,
            'file_path' => $receipt['relative'],
            'type' => 'image/png',
            'uploaded_at' => now(),
        ]);

        $response = [
            'status' => 'success',
            'message' => 'Order saved and receipt generated.',
            'data' => $order,
            'receipt_media' => $media,
            'receipt_url' => asset('storage/'.$receipt['relative']),
        ];

        $this->sendReceiptWhatsApp($order, $receipt['path'], $receipt['filename'], $response);
        $this->sendReceiptEmail($order, $receipt['path'], $receipt['filename'], $response);

        return response()->json($response, 201);
    }

    /**
     * Send the receipt image to the customer over WhatsApp and record the
     * outcome on the response payload (passed by reference).
     */
    private function sendReceiptWhatsApp(Order $order, string $imagePath, string $fileName, array &$response): void
    {
        if (empty($order->customer?->contact)) {
            $response['whatsapp_notification'] = 'No notification sent - missing customer contact.';

            return;
        }

        try {
            // Send the image as a multipart file upload so the WhatsApp
            // server does not need to reach a public URL (localhost is not
            // reachable from the remote API server).
            $apiResponse = Http::timeout(60)
                ->attach('file', file_get_contents($imagePath), $fileName)
                ->post('https://webwhatsappjs.codewiresolutions.com/send-image', [
                    'number' => $order->customer->contact,
                    'caption' => 'Thank you for your order! Here is your receipt.',
                ]);

            $response['whatsapp_response'] = $apiResponse->json();
            $response['message'] = 'Order saved, receipt created, and WhatsApp notification sent.';
        } catch (Exception $e) {
            $response['whatsapp_error'] = $e->getMessage();
            $response['message'] = 'Order saved and receipt created, but WhatsApp notification failed.';
        }
    }

    /** Send the same receipt image by email when the customer has an address. */
    private function sendReceiptEmail(Order $order, string $imagePath, string $fileName, array &$response): void
    {
        $email = trim((string) $order->customer?->email);
        if ($email === '') {
            $response['email_notification'] = 'No notification sent - missing customer email.';
            return;
        }

        try {
            Mail::send([], [], function ($message) use ($email, $imagePath, $fileName, $order) {
                $message->to($email, $order->customer?->name)
                    ->subject('Your Grill Vibes order receipt #'.$order->id)
                    ->html('<p>Thank you for your order. Your receipt is attached.</p>')
                    ->attach($imagePath, ['as' => $fileName, 'mime' => 'image/png']);
            });
            $response['email_notification'] = 'Receipt emailed to '.$email.'.';
        } catch (Exception $e) {
            $response['email_error'] = $e->getMessage();
        }
    }

    /**
     * Regenerate the receipt PNG for an existing order and return its URL.
     * Pass ?send=1 (or send=true) to also resend it over WhatsApp.
     */
    public function receipt(Request $request, $id): JsonResponse
    {
        $order = $this->model::with('orderItems.item', 'customer')->findOrFail($id);

        $receipt = app(ReceiptGenerator::class)->generate($order);

        $media = Media::create([
            'order_id' => $order->id,
            'file_path' => $receipt['relative'],
            'type' => 'image/png',
            'uploaded_at' => now(),
        ]);

        $response = [
            'status' => 'success',
            'message' => 'Receipt generated.',
            'order_id' => $order->id,
            'receipt_media' => $media,
            'receipt_url' => asset('storage/'.$receipt['relative']),
        ];

        if ($request->boolean('send')) {
            $this->sendReceiptWhatsApp($order, $receipt['path'], $receipt['filename'], $response);
            $this->sendReceiptEmail($order, $receipt['path'], $receipt['filename'], $response);
        }

        return response()->json($response, 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $order = $this->model::findOrFail($id);
        $data = $request->validate($this->validationRules());
        $orderItems = $data['order_items'] ?? [];
        unset($data['order_items']);

        $data = $this->normalizeOrderData($data);
        $data['subtotal'] = $this->priceOrderItems($orderItems, $this->resolveBranchId((int) $data['place_id']));
        $this->recalculateTotals($data);

        DB::transaction(function () use ($order, $data, $orderItems) {
            $stock = app(StockConsumptionService::class);

            // Return what the previous version of this order took, so the edit
            // re-deducts from a clean slate. A no-op if it was never costed.
            $stock->reverseForOrder($order);

            $order->update($data);

            // Sync order items if provided
            if (! empty($orderItems)) {
                $order->orderItems()->delete();
                foreach ($orderItems as $item) {
                    $this->createOrderItem($order, $item);
                }
            }

            $stock->consumeForOrder($order);
        });

        return response()->json($order->load('orderItems'), 200);
    }

    /**
     * Create an order line and route it to the matching KDS station.
     */
    private function createOrderItem(Order $order, array $item): OrderItem
    {
        $line = $order->orderItems()->create([
            'fooditems_id' => $item['fooditems_id'],
            'category_id' => $item['category_id'],
            'quantity' => $item['quantity'],
            'discount_amount' => $item['discount_amount'] ?? 0,
            'sub_total' => $item['sub_total'] ?? 0,
            'add_note' => $item['add_note'] ?? '',
            'extras' => $item['extras'] ?? [],
        ]);

        // Use the station chosen on the order page, or fall back to
        // auto-routing by category/branch.
        if (! empty($item['kds_station_id'])) {
            $line->update([
                'kds_station_id' => $item['kds_station_id'],
                'kds_status' => 'sent',
                'kds_sent_at' => now(),
            ]);
        } else {
            $line->setRelation('order', $order);
            $station = KdsStation::resolveForItem($line);

            $line->update([
                'kds_station_id' => $station?->id,
                'kds_status' => $station ? 'sent' : 'new',
                'kds_sent_at' => now(),
            ]);
        }

        return $line;
    }

    /** Price toppings from branch moving-average cost; never trust app-sent prices or totals. */
    private function priceOrderItems(array &$items, ?int $branchId): float
    {
        $foodPrices = FoodItem::whereIn('id', collect($items)->pluck('fooditems_id')->unique())->pluck('price', 'id');
        $ingredientIds = collect($items)->flatMap(fn (array $item) => collect($item['extras'] ?? [])->pluck('ingredient_id'))->unique();
        $ingredients = Ingredient::with(['stockLevels' => fn ($q) => $q->where('branch_id', $branchId)])
            ->whereIn('id', $ingredientIds)->get(['id', 'name', 'unit'])->keyBy('id');

        $subtotal = 0.0;
        foreach ($items as &$item) {
            $extras = [];
            foreach ($item['extras'] ?? [] as $extra) {
                $ingredient = $ingredients->get((int) $extra['ingredient_id']);
                $qty = (float) $extra['quantity'];
                $extras[] = [
                    'ingredient_id' => (int) $extra['ingredient_id'],
                    'ingredient_name' => $ingredient?->name ?? 'Ingredient',
                    'unit' => $ingredient?->unit ?? '',
                    'quantity' => $qty,
                    'price' => round($qty * (float) ($ingredient?->stockLevels->first()?->average_cost ?? 0), 2),
                ];
            }
            $item['extras'] = $extras;
            $item['sub_total'] = round(((float) ($foodPrices[$item['fooditems_id']] ?? 0) + collect($extras)->sum('price')) * (int) $item['quantity'], 2);
            $subtotal += $item['sub_total'];
        }
        unset($item);
        return round($subtotal, 2);
    }

    private function recalculateTotals(array &$data): void
    {
        $subtotal = (float) $data['subtotal'];
        $discount = min($subtotal, (float) ($data['discount_amount'] ?? 0));
        $taxable = max(0, $subtotal - $discount);
        $data['service_charges'] = round($taxable * ((float) ($data['service_charges_percentage'] ?? 0) / 100), 2);
        $data['grand_total'] = round($taxable + $data['service_charges'], 2);
    }

    private function resolveBranchId(int $placeId): ?int
    {
        return Place::whereKey($placeId)->value('branch_id') ?: CurrentBranch::id();
    }

    private function normalizeOrderData(array $data): array
    {
        // Mobile apps commonly send ISO/UTC timestamps via new Date().toISOString().
        // Reports use the restaurant's local business date, so store the local time.
        $data['order_datetime'] = Carbon::parse($data['order_datetime'])
            ->timezone(config('app.timezone'))
            ->toDateTimeString();

        // Mobile/API checkouts do not have the web session branch switcher, but
        // the dashboard, orders page and reports are branch-scoped. Assign the
        // order to the selected place's branch so API-created sales show beside
        // web POS sales.
        $data['branch_id'] = $this->resolveBranchId((int) $data['place_id']);

        return $data;
    }

    public function show($id): JsonResponse
    {
        $order = $this->model::with('orderItems')->findOrFail($id);

        return response()->json($order, 200);
    }

    public function index(): JsonResponse
    {
        $orders = Order::with('orderItems', 'customer:id,name,address,contact')->get();

        return response()->json([
            'status' => 'success',
            'data' => $orders,
            'total_orders' => $orders->count(),
        ], 200);
    }

    public function deletereport(): JsonResponse
    {
        // Sargable range (instead of whereDate) so the deleted_at index is used.
        $orders = Order::onlyTrashed()
            ->whereBetween('deleted_at', [Carbon::today()->startOfDay(), Carbon::today()->endOfDay()])
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $orders,
        ], 200);
    }

    public function destroy($id): JsonResponse
    {
        try {
            $order = $this->model::with('orderItems')->findOrFail($id);

            DB::transaction(function () use ($order) {
                // Voiding a sale returns its ingredients to the shelf.
                app(StockConsumptionService::class)->reverseForOrder($order);

                // Delete related order items first
                $order->orderItems()->delete();

                // Soft delete the order
                $order->delete();
            });

            return response()->json([
                'status' => 'success',
                'message' => 'Order deleted successfully',
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete order',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    // … other methods
}
