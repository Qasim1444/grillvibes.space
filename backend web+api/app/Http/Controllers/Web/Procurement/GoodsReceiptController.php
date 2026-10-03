<?php

namespace App\Http\Controllers\Web\Procurement;

use App\Http\Controllers\Controller;
use App\Models\GoodsReceipt;
use App\Models\GoodsReceiptItem;
use App\Models\Ingredient;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Vendor;
use App\Services\GoodsReceiptService;
use App\Support\CurrentBranch;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use InvalidArgumentException;

/**
 * Goods receipts — where a delivery becomes stock and money.
 *
 * Posting one is the only event in the system that raises stock and re-values an
 * ingredient, so every dish's food cost moves off the back of this screen. It is
 * therefore append-only: a receipt is never edited or deleted, because the average
 * cost it produced has already been consumed by orders costed after it. A mistake
 * is corrected with a stock take or a write-off on the Stock screen.
 *
 * Prices default to the ones agreed on the purchase order but are editable, since
 * what the invoice says is what actually got paid.
 */
class GoodsReceiptController extends Controller
{
    public function __construct(private readonly GoodsReceiptService $receipts) {}

    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $vendorId = $request->query('vendor_id', '');
        $branchId = CurrentBranch::id();

        $receipts = GoodsReceipt::query()
            ->with(['vendor:id,name', 'purchaseOrder:id,po_number', 'creator:id,name', 'items.ingredient:id,name,unit'])
            ->where('branch_id', $branchId)
            ->when($search !== '', fn ($q) => $q->where(fn ($w) => $w
                ->where('grn_number', 'like', "%{$search}%")
                ->orWhere('invoice_number', 'like', "%{$search}%")
                ->orWhereHas('vendor', fn ($v) => $v->where('name', 'like', "%{$search}%"))))
            ->when($vendorId !== '', fn ($q) => $q->where('vendor_id', $vendorId))
            ->orderByDesc('id')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (GoodsReceipt $receipt) => [
                'id' => $receipt->id,
                'grn_number' => $receipt->grn_number,
                'vendor_name' => $receipt->vendor?->name,
                'po_number' => $receipt->purchaseOrder?->po_number,
                'invoice_number' => $receipt->invoice_number,
                'received_at' => $receipt->received_at?->toDateString(),
                'total' => (float) $receipt->total,
                'notes' => $receipt->notes,
                'created_by_name' => $receipt->creator?->name,
                'line_count' => $receipt->items->count(),
                'lines' => $receipt->items->map(fn (GoodsReceiptItem $item) => [
                    'name' => $item->ingredient?->name,
                    'unit' => $item->ingredient?->unit,
                    'quantity' => (float) $item->quantity,
                    'unit_cost' => (float) $item->unit_cost,
                    'line_total' => (float) $item->line_total,
                ])->all(),
            ]);

        return Inertia::render('Procurement/GoodsReceipts', [
            'receipts' => $receipts,
            'openOrders' => $this->openOrders($branchId),
            'vendors' => Vendor::active()->orderBy('name')->get(['id', 'name']),
            'ingredients' => Ingredient::active()->orderBy('name')->get(['id', 'name', 'unit']),
            'summary' => $this->summary($branchId),
            'filters' => ['search' => $search, 'vendor_id' => $vendorId],
        ]);
    }

    /**
     * Book a delivery.
     *
     * Handles both shapes: against a purchase order (lines carry the PO line they
     * settle, so the outstanding tally stays right) and ad hoc, with no PO at all.
     */
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'vendor_id' => 'required|integer|exists:vendors,id',
            'purchase_order_id' => 'nullable|integer|exists:purchase_orders,id',
            'invoice_number' => 'nullable|string|max:100',
            'received_at' => 'required|date',
            'notes' => 'nullable|string|max:2000',
            'lines' => 'required|array|min:1',
            'lines.*.ingredient_id' => 'required|integer|exists:ingredients,id',
            'lines.*.purchase_order_item_id' => 'nullable|integer|exists:purchase_order_items,id',
            'lines.*.quantity' => 'required|numeric|min:0.0001',
            'lines.*.unit_cost' => 'required|numeric|min:0',
        ]);

        $branchId = CurrentBranch::id();

        if (! $branchId) {
            return back()->with('error', 'No outlet is selected, so there is nowhere to receive this delivery into.');
        }

        $this->guardPurchaseOrder($data, $branchId);

        try {
            $receipt = $this->receipts->post([
                'branch_id' => $branchId,
                'vendor_id' => $data['vendor_id'],
                'purchase_order_id' => $data['purchase_order_id'] ?? null,
                'invoice_number' => $data['invoice_number'] ?? null,
                'received_at' => $data['received_at'],
                'notes' => $data['notes'] ?? null,
                'created_by' => $request->user()?->id,
            ], $data['lines']);
        } catch (InvalidArgumentException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', sprintf(
            '%s posted — stock raised and costs re-valued (%s).',
            $receipt->grn_number,
            number_format((float) $receipt->total, 2)
        ));
    }

    /**
     * The common case: everything on the order turned up, at the agreed prices.
     *
     * Saves re-typing lines that are already on the PO. A short or over delivery
     * should go through `store()` with the real figures instead.
     */
    public function receiveInFull(Request $request, int $purchaseOrderId): RedirectResponse
    {
        $order = PurchaseOrder::findOrFail($purchaseOrderId);

        if ($order->branch_id !== CurrentBranch::id()) {
            return back()->with('error', "Purchase order {$order->po_number} belongs to another outlet.");
        }

        if (! in_array($order->status, [PurchaseOrder::STATUS_ORDERED, PurchaseOrder::STATUS_PARTIALLY_RECEIVED], true)) {
            return back()->with('error', "Purchase order {$order->po_number} is {$order->status} — only a sent order can be received.");
        }

        $data = $request->validate([
            'invoice_number' => 'nullable|string|max:100',
            'received_at' => 'nullable|date',
        ]);

        try {
            $receipt = $this->receipts->receiveInFull($order, [
                'invoice_number' => $data['invoice_number'] ?? null,
                'received_at' => $data['received_at'] ?? now()->toDateString(),
                'created_by' => $request->user()?->id,
            ]);
        } catch (InvalidArgumentException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', "{$receipt->grn_number} posted in full against {$order->po_number}.");
    }

    /**
     * Reject a receipt whose lines don't belong to the purchase order it claims to
     * settle. `exists:` proves the PO line is real, not that it is on THIS order —
     * without this the delivery would tally against a stranger's order.
     */
    private function guardPurchaseOrder(array $data, int $branchId): void
    {
        $orderId = $data['purchase_order_id'] ?? null;
        $lineIds = collect($data['lines'])->pluck('purchase_order_item_id')->filter()->unique();

        if (! $orderId) {
            if ($lineIds->isNotEmpty()) {
                throw ValidationException::withMessages([
                    'purchase_order_id' => 'These lines settle a purchase order, so the receipt has to name it.',
                ]);
            }

            return;
        }

        $order = PurchaseOrder::whereKey($orderId)->first();

        if (! $order || $order->branch_id !== $branchId) {
            throw ValidationException::withMessages([
                'purchase_order_id' => 'That purchase order belongs to another outlet.',
            ]);
        }

        if ($order->vendor_id !== (int) $data['vendor_id']) {
            throw ValidationException::withMessages([
                'vendor_id' => "Purchase order {$order->po_number} was raised on a different vendor.",
            ]);
        }

        if ($lineIds->isEmpty()) {
            return;
        }

        $belong = PurchaseOrderItem::whereKey($lineIds)
            ->where('purchase_order_id', $order->getKey())
            ->count();

        if ($belong !== $lineIds->count()) {
            throw ValidationException::withMessages([
                'lines' => "Some lines are not on purchase order {$order->po_number}.",
            ]);
        }
    }

    /**
     * Sent purchase orders with something still outstanding, pre-filled so the
     * receiving screen can offer "receive this" without a second round trip.
     */
    private function openOrders(?int $branchId): array
    {
        return PurchaseOrder::with(['vendor:id,name', 'items.ingredient:id,name,unit'])
            ->where('branch_id', $branchId)
            ->whereIn('status', [PurchaseOrder::STATUS_ORDERED, PurchaseOrder::STATUS_PARTIALLY_RECEIVED])
            ->orderBy('expected_at')
            ->get()
            ->map(fn (PurchaseOrder $order) => [
                'id' => $order->id,
                'po_number' => $order->po_number,
                'vendor_id' => (int) $order->vendor_id,
                'vendor_name' => $order->vendor?->name,
                'status' => $order->status,
                'expected_at' => $order->expected_at?->toDateString(),
                'is_overdue' => $order->expected_at && $order->expected_at->isPast(),
                'lines' => $order->items
                    ->filter(fn (PurchaseOrderItem $item) => $item->outstandingQty() > 0)
                    ->map(fn (PurchaseOrderItem $item) => [
                        'purchase_order_item_id' => $item->id,
                        'ingredient_id' => (int) $item->ingredient_id,
                        'name' => $item->ingredient?->name,
                        'unit' => $item->ingredient?->unit,
                        'ordered_qty' => (float) $item->quantity,
                        'received_qty' => (float) $item->received_qty,
                        // What the receiving form starts at — editable, because the
                        // delivery note is the truth, not the order.
                        'quantity' => $item->outstandingQty(),
                        'unit_cost' => (float) $item->unit_cost,
                    ])
                    ->values()
                    ->all(),
            ])
            // An order with nothing outstanding is already settled, whatever its status says.
            ->filter(fn (array $order) => $order['lines'] !== [])
            ->values()
            ->all();
    }

    private function summary(?int $branchId): array
    {
        $monthStart = now()->startOfMonth()->toDateString();
        $monthEnd = now()->endOfMonth()->toDateString();

        return [
            'this_month' => GoodsReceipt::where('branch_id', $branchId)
                ->whereBetween('received_at', [$monthStart, $monthEnd])->count(),
            'spend_this_month' => round((float) GoodsReceipt::where('branch_id', $branchId)
                ->whereBetween('received_at', [$monthStart, $monthEnd])->sum('total'), 2),
            'awaiting_delivery' => PurchaseOrder::where('branch_id', $branchId)
                ->whereIn('status', [PurchaseOrder::STATUS_ORDERED, PurchaseOrder::STATUS_PARTIALLY_RECEIVED])
                ->count(),
            // Deliveries booked with no purchase order behind them — normal for a
            // cash-and-carry run, worth watching if it becomes the habit.
            'ad_hoc_this_month' => GoodsReceipt::where('branch_id', $branchId)
                ->whereNull('purchase_order_id')
                ->whereBetween('received_at', [$monthStart, $monthEnd])->count(),
        ];
    }
}
