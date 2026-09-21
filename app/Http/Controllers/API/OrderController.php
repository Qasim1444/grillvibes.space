<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\KdsStation;
use App\Models\Media;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Place;
use App\Models\Whatsapp;
use App\Services\ReceiptGenerator;
use App\Services\StockConsumptionService;
use App\Support\CurrentBranch;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

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
            'device_id' => 'nullable|exists:whatsapps,id',
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
        ];
    }

    public function store(Request $request): JsonResponse
    {
        set_time_limit(120); // Allow time for receipt rendering + WhatsApp upload

        $data = $request->validate($this->validationRules());

        // If device_id is not set, assign the first device id from whatsapps table
        if (empty($data['device_id'])) {
            $data['device_id'] = Whatsapp::query()->value('id');
        }

        // Mobile/API checkouts do not have the web session branch switcher, but
        // the dashboard, orders page and reports are branch-scoped. Assign the
        // order to the selected place's branch so API-created sales show beside
        // web POS sales.
        $data['branch_id'] = $this->resolveBranchId((int) $data['place_id']);

        $orderItems = $data['order_items'];
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
        $order->load('orderItems.item', 'customer', 'sender');

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

    /**
     * Regenerate the receipt PNG for an existing order and return its URL.
     * Pass ?send=1 (or send=true) to also resend it over WhatsApp.
     */
    public function receipt(Request $request, $id): JsonResponse
    {
        $order = $this->model::with('orderItems.item', 'customer', 'sender')->findOrFail($id);

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
        }

        return response()->json($response, 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $order = $this->model::findOrFail($id);
        $data = $request->validate($this->validationRules());
        $orderItems = $data['order_items'] ?? [];
        unset($data['order_items']);

        $data['branch_id'] = $this->resolveBranchId((int) $data['place_id']);

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

    private function resolveBranchId(int $placeId): ?int
    {
        return Place::whereKey($placeId)->value('branch_id') ?: CurrentBranch::id();
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
