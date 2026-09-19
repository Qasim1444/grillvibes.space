<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\FoodItem;
use App\Models\KdsStation;
use App\Models\Media;
use App\Models\Order;
use App\Models\Place;
use App\Models\Whatsapp;
use App\Services\LoyaltyService;
use App\Services\PromoService;
use App\Services\ReceiptGenerator;
use App\Services\StockConsumptionService;
use App\Support\CurrentBranch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Inertia (server-rendered) Orders page — replaces the old /api order endpoints.
 * The list, its line items and the lookup collections (food items, places,
 * customers) all arrive as page props, so the client makes no XHR calls.
 * Creating an order still generates a receipt and (best-effort) sends it over
 * WhatsApp, matching the previous API OrderController behaviour.
 *
 * Checkout also settles the CRM side: a promo code and a points redemption are
 * resolved here, never client-side, and `grand_total` is recomputed from the
 * result — see `applyDiscounts()`.
 */
class OrderController extends Controller
{
    public function __construct(
        private readonly PromoService $promos,
        private readonly LoyaltyService $loyalty,
        private readonly StockConsumptionService $stock,
    ) {}

    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $branchId = CurrentBranch::id();

        // Base query shared by the paginated list and the summary aggregates, so
        // the stat cards reflect the whole (filtered) result set — not just the
        // current 10-row page.
        $base = Order::query()
            ->when($branchId, fn ($q) => $q->where('branch_id', $branchId))
            ->when($search !== '', fn ($q) => $q->where(function ($w) use ($search) {
                $w->where('id', 'like', "%{$search}%")
                    ->orWhere('status', 'like', "%{$search}%")
                    ->orWhere('type', 'like', "%{$search}%")
                    ->orWhereHas('customer', fn ($c) => $c->where('name', 'like', "%{$search}%"));
            }));

        return Inertia::render('Orders', [
            // order_items + customer are eager-loaded so the View/Edit modals
            // need no follow-up request.
            'orders' => (clone $base)
                ->with('orderItems', 'customer:id,name,address,contact', 'promoCode:id,code')
                ->orderByDesc('id')
                ->paginate(10)
                ->withQueryString(),
            // Aggregates over the full filtered set (the paginator only holds a
            // slice, so these can't be derived client-side any more).
            'stats' => [
                'total' => (clone $base)->count(),
                'paid' => (clone $base)->where('paid', true)->count(),
                'revenue' => (float) (clone $base)->sum('grand_total'),
            ],
            'foodItems' => FoodItem::orderBy('name')->get(['id', 'name', 'price', 'foodcategory_id']),
            'places' => Place::when($branchId, fn ($q) => $q->where('branch_id', $branchId))
                ->orderBy('name')
                ->get(['id', 'name']),
            'kdsStations' => KdsStation::where('is_active', true)
                ->where(function ($q) {
                    $q->where('branch_id', CurrentBranch::id())->orWhereNull('branch_id');
                })
                ->orderBy('name')
                ->get(['id', 'name', 'color', 'branch_id']),
            'filters' => ['search' => $search],
            // Customers are NOT shipped here — the table can hold 100k+ rows and
            // would exhaust memory. The edit modal resolves them via the
            // /customers/search typeahead instead.
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        set_time_limit(120); // Allow time for receipt rendering + WhatsApp upload.

        $data = $this->normalize($request->validate($this->rules()));
        $orderItems = $data['order_items'];
        $promoCode = $data['promo_code'] ?? null;
        $redeemPoints = (int) ($data['redeem_points'] ?? 0);
        unset($data['order_items'], $data['promo_code'], $data['redeem_points']);

        // The sale belongs to the outlet the cashier is currently scoped to; the
        // client never picks it, so a tampered payload can't misattribute the order.
        $data['branch_id'] = CurrentBranch::id();

        // The order, its lines, the promo redemption, the points ledger and the
        // ingredient draw-down commit together — a half-applied discount would
        // leave the money columns lying, and a half-applied deduction would leave
        // the store room lying.
        $order = DB::transaction(function () use ($data, $orderItems, $promoCode, $redeemPoints) {
            $order = Order::create($data);
            $this->syncItems($order, $orderItems);
            $this->applyDiscounts($order, $promoCode, $redeemPoints);
            // Recipe -> ingredients -> stock deduction, and this order's COGS.
            $this->stock->consumeForOrder($order);

            return $order;
        });

        // Both of these live outside the transaction: earning reads the committed
        // grand total, and the receipt does a 60s HTTP upload that must not hold
        // row locks open.
        $this->loyalty->earn($order);
        $this->generateAndSendReceipt($order);

        return back()->with('success', 'Order #'.$order->id.' placed successfully.');
    }

    public function update(Request $request, $id): RedirectResponse
    {
        $order = Order::where('branch_id', CurrentBranch::id())->findOrFail($id);

        $data = $this->normalize($request->validate($this->rules()));
        $orderItems = $data['order_items'];
        $promoCode = $data['promo_code'] ?? null;
        $redeemPoints = (int) ($data['redeem_points'] ?? 0);
        unset($data['order_items'], $data['promo_code'], $data['redeem_points']);

        DB::transaction(function () use ($order, $data, $orderItems, $promoCode, $redeemPoints) {
            // Unwind what this order previously did to the promo counters, the
            // points ledger and the store room, so the edit re-applies from a
            // clean slate. All three are no-ops when the order carried nothing.
            $this->promos->release($order);
            $this->loyalty->reverseOrder($order);
            $this->stock->reverseForOrder($order);

            $order->update($data);
            $order->orderItems()->delete();
            $this->syncItems($order, $orderItems);
            $this->applyDiscounts($order, $promoCode, $redeemPoints);
            // Re-deduct against the edited lines; the reversal above cleared the
            // `stock_consumed_at` guard so this runs rather than short-circuiting.
            $this->stock->consumeForOrder($order);
        });

        // `reverseOrder()` zeroed `loyalty_points_earned`, so a still-paid order
        // earns again on the new total — and an unpaid one earns nothing.
        $this->loyalty->earn($order->refresh());

        return back()->with('success', 'Order #'.$order->id.' updated.');
    }

    public function destroy($id): RedirectResponse
    {
        $order = Order::with('orderItems')->where('branch_id', CurrentBranch::id())->findOrFail($id);

        DB::transaction(function () use ($order) {
            // Voiding a sale returns its ingredients to the shelf, before the
            // lines are removed — the reversal reads the stock ledger, but the
            // COGS columns it clears live on the order items.
            $this->stock->reverseForOrder($order);

            $order->orderItems()->delete();
            $order->delete(); // soft delete — surfaces under "Deleted Orders" on the dashboard
        });

        return back()->with('success', 'Order deleted.');
    }

    /**
     * A printable HTML receipt for an order. Opened in a hidden iframe by the POS
     * right after checkout (the page auto-triggers the browser print dialog), and
     * reachable directly to reprint. Vector HTML prints crisper on an 80mm roll
     * than the PNG that goes out over WhatsApp.
     */
    public function receipt($id): \Illuminate\Contracts\View\View
    {
        $order = Order::with(['orderItems.item', 'customer'])->findOrFail($id);

        return view('receipts.order', [
            'order' => $order,
            'settings' => \App\Models\Setting::first(),
        ]);
    }

    /**
     * Price a promo code for the POS "Apply" button.
     *
     * A GET because it writes nothing — the code is validated again at checkout
     * against the saved order, so this is only ever a preview.
     */
    public function quotePromo(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:50'],
            'subtotal' => ['required', 'numeric', 'min:0'],
            'customer_id' => ['nullable', 'integer', 'exists:customers,id'],
            'order_id' => ['nullable', 'integer'],
        ]);

        $resolved = $this->promos->validate(
            $data['code'],
            (float) $data['subtotal'],
            $data['customer_id'] ?? null,
            $data['order_id'] ?? null,
        );

        return response()->json([
            'code' => $resolved['code']->code,
            'description' => $resolved['code']->description,
            'discount' => $resolved['discount'],
        ]);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Resolve the promo code and points redemption, then rewrite the order's
     * money columns from what the database says they are worth.
     *
     * The client sends a code string and a points count — never an amount — so a
     * tampered payload cannot buy a discount. `discount_amount` keeps its old
     * meaning (the cashier's own markdown, already resolved to currency even when
     * `discount_type` is percentage); promo and points are separate columns, and
     * `grand_total` is the sum of all three. Runs on create and on every edit,
     * which is why it writes zeros when nothing applies.
     *
     * @throws ValidationException
     */
    private function applyDiscounts(Order $order, ?string $promoCode, int $redeemPoints): void
    {
        $subtotal = (float) $order->subtotal;
        $manualDiscount = min($subtotal, (float) $order->discount_amount);

        $promo = null;
        $promoDiscount = 0.0;

        if ($promoCode !== null && trim($promoCode) !== '') {
            $resolved = $this->promos->validate($promoCode, $subtotal, $order->customer_id, $order->id);
            $promo = $resolved['code'];
            $promoDiscount = $resolved['discount'];
        }

        $customer = null;
        $loyaltyDiscount = 0.0;

        if ($redeemPoints > 0) {
            $customer = Customer::find($order->customer_id);

            if (! $customer) {
                throw ValidationException::withMessages([
                    'redeem_points' => 'Pick a customer before redeeming points.',
                ]);
            }

            $loyaltyDiscount = $this->loyalty->quoteRedemption($customer, $redeemPoints, $subtotal);
        }

        $totalDiscount = $manualDiscount + $promoDiscount + $loyaltyDiscount;

        // Refused rather than silently trimmed: clipping would either overstate a
        // column or spend points that bought nothing.
        if ($totalDiscount > $subtotal) {
            throw ValidationException::withMessages([
                'discount_amount' => 'The discounts together ('
                    .number_format($totalDiscount, 2)
                    .') exceed the order subtotal — reduce one of them.',
            ]);
        }

        $taxable = $subtotal - $totalDiscount;
        $serviceCharges = round($taxable * ((float) $order->service_charges_percentage / 100), 2);

        $order->forceFill([
            'promo_code_id' => $promo?->id,
            'promo_discount' => round($promoDiscount, 2),
            'loyalty_points_redeemed' => $customer ? $redeemPoints : 0,
            'loyalty_discount' => round($loyaltyDiscount, 2),
            'service_charges' => $serviceCharges,
            'grand_total' => round(max(0, $taxable + $serviceCharges), 2),
        ])->save();

        if ($promo !== null) {
            $this->promos->redeem($order, $promo, $promoDiscount);
        }

        if ($customer !== null && $redeemPoints > 0) {
            $this->loyalty->applyRedemption($order, $customer, $redeemPoints, $loyaltyDiscount);
        }
    }

    /**
     * Normalise optional foreign keys. `customer_id` is validated with
     * `exists` (skipped when empty), but an empty string would be rejected by a
     * bigint column — coerce it to null. `device_id` falls back to the first
     * registered WhatsApp device, matching the old API controller.
     */
    private function normalize(array $data): array
    {
        $data['customer_id'] = empty($data['customer_id']) ? null : $data['customer_id'];

        if (empty($data['device_id'])) {
            $data['device_id'] = Whatsapp::query()->value('id');
        }

        return $data;
    }

    private function syncItems(Order $order, array $orderItems): void
    {
        foreach ($orderItems as $item) {
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
        }
    }

    /**
     * Render the receipt PNG, record it as Media, and try to WhatsApp it to the
     * customer. Failures are swallowed — the order is already saved.
     */
    private function generateAndSendReceipt(Order $order): void
    {
        $order->load('orderItems.item', 'customer', 'sender');

        $receipt = app(ReceiptGenerator::class)->generate($order);

        Media::create([
            'order_id' => $order->id,
            'file_path' => $receipt['relative'],
            'type' => 'image/png',
            'uploaded_at' => now(),
        ]);

        if (empty($order->customer?->contact)) {
            return;
        }

        try {
            Http::timeout(60)
                ->attach('file', file_get_contents($receipt['path']), $receipt['filename'])
                ->post('https://webwhatsappjs.codewiresolutions.com/send-image', [
                    'number' => $order->customer->contact,
                    'caption' => 'Thank you for your order! Here is your receipt.',
                ]);
        } catch (\Exception $e) {
            // Best-effort notification; ignore delivery failures.
        }
    }

    /** Mirrors the former API OrderController::validationRules(). */
    private function rules(): array
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
            'service_charges_percentage' => ['required', 'numeric', 'between:0,100', 'regex:/^\d+(\.\d{1,2})?$/'],
            // Validated for shape, then overwritten by applyDiscounts() — the
            // client's total is never the one that gets stored.
            'grand_total' => 'required|numeric|min:0',
            'place_id' => 'required|integer',
            // CRM inputs: a code and a points count, both priced server-side.
            'promo_code' => 'nullable|string|max:50',
            'redeem_points' => 'nullable|integer|min:0',
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
}
