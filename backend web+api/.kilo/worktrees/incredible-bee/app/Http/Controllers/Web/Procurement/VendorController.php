<?php

namespace App\Http\Controllers\Web\Procurement;

use App\Http\Controllers\Controller;
use App\Models\Vendor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Supplier master data — the "who we buy from" behind every purchase order.
 *
 * These rows are shared: Expenses, Assets and Maintenance point at the same
 * vendors, which is why retiring one is a soft delete and why the delete guard
 * looks at open purchase orders rather than at history.
 */
class VendorController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $status = $request->query('status', '');

        $vendors = Vendor::query()
            ->withCount([
                'purchaseOrders',
                'openPurchaseOrders as open_purchase_orders_count',
                'goodsReceipts',
            ])
            // Lifetime spend with this supplier, from what actually arrived rather
            // than what was ordered — a cancelled PO never cost anything.
            ->withSum('goodsReceipts as received_total', 'total')
            ->when($search !== '', fn ($q) => $q->where(fn ($w) => $w
                ->where('name', 'like', "%{$search}%")
                ->orWhere('contact_person', 'like', "%{$search}%")
                ->orWhere('phone', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")))
            ->when($status !== '', fn ($q) => $q->where('is_active', $status === 'active'))
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Vendor $vendor) => [
                ...$vendor->only(
                    'id', 'name', 'contact_person', 'phone', 'email',
                    'address', 'tax_number', 'payment_terms', 'is_active', 'notes'
                ),
                'purchase_orders' => $vendor->purchase_orders_count,
                'open_purchase_orders' => $vendor->open_purchase_orders_count,
                'goods_receipts' => $vendor->goods_receipts_count,
                'received_total' => round((float) $vendor->received_total, 2),
            ]);

        return Inertia::render('Procurement/Vendors', [
            'vendors' => $vendors,
            'summary' => $this->summary(),
            'filters' => ['search' => $search, 'status' => $status],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Vendor::create($this->validated($request));

        return back()->with('success', 'Vendor created.');
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $vendor = Vendor::findOrFail($id);
        $vendor->update($this->validated($request, $id));

        return back()->with('success', 'Vendor updated.');
    }

    /**
     * Retire a vendor.
     *
     * Refused while deliveries are still expected — losing the supplier off the
     * pickers mid-order leaves those POs impossible to receive against. Cancel or
     * complete them first. Past orders are no obstacle: the soft delete keeps the
     * name resolvable on everything already booked.
     */
    public function destroy(int $id): RedirectResponse
    {
        $vendor = Vendor::findOrFail($id);
        $open = $vendor->openPurchaseOrders()->count();

        if ($open > 0) {
            return back()->with('error', "{$vendor->name} has {$open} purchase order(s) still open. Receive or cancel them first.");
        }

        $vendor->delete();

        return back()->with('success', 'Vendor deleted.');
    }

    private function validated(Request $request, ?int $id = null): array
    {
        return $request->validate([
            'name' => 'required|string|max:150|unique:vendors,name,'.($id ?? 'NULL').',id,deleted_at,NULL',
            'contact_person' => 'nullable|string|max:150',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:2000',
            'tax_number' => 'nullable|string|max:50',
            'payment_terms' => 'nullable|string|max:100',
            'is_active' => 'required|boolean',
            'notes' => 'nullable|string|max:2000',
        ]);
    }

    private function summary(): array
    {
        $counts = Vendor::selectRaw('COUNT(*) as total')
            ->selectRaw('SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active')
            ->first();

        return [
            'total' => (int) ($counts->total ?? 0),
            'active' => (int) ($counts->active ?? 0),
            'with_open_orders' => Vendor::whereHas('openPurchaseOrders')->count(),
            'spend_this_month' => round((float) DB::table('goods_receipts')
                ->whereNull('deleted_at')
                ->whereBetween('received_at', [now()->startOfMonth()->toDateString(), now()->endOfMonth()->toDateString()])
                ->sum('total'), 2),
        ];
    }
}
