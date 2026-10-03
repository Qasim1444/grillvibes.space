<?php

namespace App\Http\Controllers\Web\Procurement;

use App\Http\Controllers\Controller;
use App\Models\Ingredient;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Vendor;
use App\Services\PurchaseOrderService;
use App\Support\CurrentBranch;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use InvalidArgumentException;
use RuntimeException;

/**
 * Purchase orders — the commitment half of procurement.
 *
 * Nothing on this screen moves stock or changes a cost: a PO only records what
 * was ordered, from whom, at what price. Value enters inventory when the delivery
 * is booked on the Goods Receipts screen.
 *
 * Status is not a field anyone types. It starts at draft, becomes ordered when the
 * PO is sent, and from then on is re-derived from received quantities by
 * {@see PurchaseOrder::syncStatusFromReceipts()}.
 */
class PurchaseOrderController extends Controller
{
    public function __construct(private readonly PurchaseOrderService $orders) {}

    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $status = $request->query('status', '');
        $vendorId = $request->query('vendor_id', '');
        $branchId = CurrentBranch::id();

        $orders = PurchaseOrder::query()
            ->with(['vendor:id,name', 'creator:id,name', 'items.ingredient:id,name,unit'])
            ->where('branch_id', $branchId)
            ->when($search !== '', fn ($q) => $q->where(fn ($w) => $w
                ->where('po_number', 'like', "%{$search}%")
                ->orWhereHas('vendor', fn ($v) => $v->where('name', 'like', "%{$search}%"))))
            ->when($status !== '', fn ($q) => $q->where('status', $status))
            ->when($vendorId !== '', fn ($q) => $q->where('vendor_id', $vendorId))
            ->orderByDesc('id')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (PurchaseOrder $order) => $this->present($order));

        return Inertia::render('Procurement/PurchaseOrders', [
            'orders' => $orders,
            'vendors' => Vendor::active()->orderBy('name')->get(['id', 'name', 'payment_terms']),
            'ingredients' => Ingredient::active()->orderBy('name')->get(['id', 'name', 'unit']),
            'statuses' => self::STATUSES,
            'summary' => $this->summary($branchId),
            'filters' => ['search' => $search, 'status' => $status, 'vendor_id' => $vendorId],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);
        $branchId = CurrentBranch::id();

        if (! $branchId) {
            return back()->with('error', 'No outlet is selected, so there is nowhere to deliver this order.');
        }

        try {
            $order = $this->orders->create([
                'branch_id' => $branchId,
                'vendor_id' => $data['vendor_id'],
                'expected_at' => $data['expected_at'] ?? null,
                'notes' => $data['notes'] ?? null,
                'created_by' => $request->user()?->id,
            ], $data['lines']);
        } catch (InvalidArgumentException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', "Purchase order {$order->po_number} created as a draft.");
    }

    /**
     * Re-line a draft. The service refuses once the PO has been sent, because
     * goods may already be arriving against the quantities it lists.
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        $order = PurchaseOrder::findOrFail($id);
        $data = $this->validated($request);

        try {
            $order->update([
                'vendor_id' => $data['vendor_id'],
                'expected_at' => $data['expected_at'] ?? null,
                'notes' => $data['notes'] ?? null,
            ]);

            $this->orders->updateLines($order, $data['lines']);
        } catch (RuntimeException|InvalidArgumentException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', "Purchase order {$order->po_number} updated.");
    }

    /** Send it to the vendor: draft -> ordered. */
    public function markOrdered(int $id): RedirectResponse
    {
        $order = PurchaseOrder::findOrFail($id);

        try {
            $this->orders->markOrdered($order);
        } catch (RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', "Purchase order {$order->po_number} sent to {$order->vendor?->name}.");
    }

    /** Abandon whatever is still outstanding. Delivered lines keep their stock. */
    public function cancel(Request $request, int $id): RedirectResponse
    {
        $order = PurchaseOrder::findOrFail($id);
        $data = $request->validate(['reason' => 'nullable|string|max:255']);

        try {
            $this->orders->cancel($order, $data['reason'] ?? null);
        } catch (RuntimeException $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', "Purchase order {$order->po_number} cancelled.");
    }

    /**
     * Delete a purchase order.
     *
     * Only a draft can go: once it has been sent it is part of the audit trail,
     * and once anything has been received against it the receipt lines point at
     * its rows. Cancel those instead.
     */
    public function destroy(int $id): RedirectResponse
    {
        $order = PurchaseOrder::findOrFail($id);

        if ($order->status !== PurchaseOrder::STATUS_DRAFT) {
            return back()->with('error', "Purchase order {$order->po_number} has been sent, so it can be cancelled but not deleted.");
        }

        $order->delete();

        return back()->with('success', 'Draft purchase order deleted.');
    }

    /** @return array<string, mixed> */
    private function present(PurchaseOrder $order): array
    {
        $lines = $order->items->map(fn (PurchaseOrderItem $item) => [
            'id' => $item->id,
            'ingredient_id' => (int) $item->ingredient_id,
            'name' => $item->ingredient?->name,
            'unit' => $item->ingredient?->unit,
            'quantity' => (float) $item->quantity,
            'unit_cost' => (float) $item->unit_cost,
            'line_total' => (float) $item->line_total,
            'received_qty' => (float) $item->received_qty,
            'outstanding_qty' => $item->outstandingQty(),
        ]);

        return [
            'id' => $order->id,
            'po_number' => $order->po_number,
            'vendor_id' => (int) $order->vendor_id,
            'vendor_name' => $order->vendor?->name,
            'status' => $order->status,
            'status_label' => self::STATUSES[$order->status] ?? $order->status,
            'ordered_at' => $order->ordered_at?->toDateString(),
            'expected_at' => $order->expected_at?->toDateString(),
            'total' => (float) $order->total,
            'notes' => $order->notes,
            'created_by_name' => $order->creator?->name,
            'line_count' => $lines->count(),
            'lines' => $lines->all(),
            // What the vendor still owes, so a buyer can see it without opening the PO.
            'outstanding_value' => round($lines->sum(fn (array $line) => $line['outstanding_qty'] * $line['unit_cost']), 2),
            'is_draft' => $order->status === PurchaseOrder::STATUS_DRAFT,
            'is_receivable' => in_array($order->status, [
                PurchaseOrder::STATUS_ORDERED,
                PurchaseOrder::STATUS_PARTIALLY_RECEIVED,
            ], true),
            // A late delivery is the thing a buyer most needs surfacing.
            'is_overdue' => $order->expected_at
                && $order->expected_at->isPast()
                && in_array($order->status, [
                    PurchaseOrder::STATUS_ORDERED,
                    PurchaseOrder::STATUS_PARTIALLY_RECEIVED,
                ], true),
        ];
    }

    private function validated(Request $request): array
    {
        $data = $request->validate([
            'vendor_id' => 'required|integer|exists:vendors,id',
            'expected_at' => 'nullable|date',
            'notes' => 'nullable|string|max:2000',
            'lines' => 'required|array|min:1',
            'lines.*.ingredient_id' => 'required|integer|exists:ingredients,id',
            'lines.*.quantity' => 'required|numeric|min:0.0001',
            'lines.*.unit_cost' => 'required|numeric|min:0',
        ]);

        // Two lines for the same ingredient would total correctly but make the
        // received-vs-ordered tally ambiguous when the delivery arrives.
        if (collect($data['lines'])->pluck('ingredient_id')->duplicates()->isNotEmpty()) {
            throw ValidationException::withMessages([
                'lines' => 'The same ingredient is listed twice — combine the quantities into one line.',
            ]);
        }

        return $data;
    }

    private function summary(?int $branchId): array
    {
        $base = fn () => PurchaseOrder::where('branch_id', $branchId);

        $open = [PurchaseOrder::STATUS_ORDERED, PurchaseOrder::STATUS_PARTIALLY_RECEIVED];

        return [
            'draft' => $base()->where('status', PurchaseOrder::STATUS_DRAFT)->count(),
            'open' => $base()->whereIn('status', $open)->count(),
            'open_value' => round((float) $base()->whereIn('status', $open)->sum('total'), 2),
            'overdue' => $base()->whereIn('status', $open)
                ->whereNotNull('expected_at')
                ->whereDate('expected_at', '<', now()->toDateString())
                ->count(),
            'received_this_month' => $base()
                ->where('status', PurchaseOrder::STATUS_RECEIVED)
                ->whereBetween('ordered_at', [now()->startOfMonth()->toDateString(), now()->endOfMonth()->toDateString()])
                ->count(),
        ];
    }

    /** Display labels; the values are the constants on {@see PurchaseOrder}. */
    public const STATUSES = [
        PurchaseOrder::STATUS_DRAFT => 'Draft',
        PurchaseOrder::STATUS_ORDERED => 'Ordered',
        PurchaseOrder::STATUS_PARTIALLY_RECEIVED => 'Partially received',
        PurchaseOrder::STATUS_RECEIVED => 'Received',
        PurchaseOrder::STATUS_CANCELLED => 'Cancelled',
    ];
}
