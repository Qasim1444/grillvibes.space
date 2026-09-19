<?php

namespace App\Http\Controllers\Web\Maintenance;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use App\Models\Vendor;
use App\Support\CurrentBranch;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AssetController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $category = $request->query('category', '');
        $status = $request->query('status', '');
        $branchId = $request->query('branch_id', CurrentBranch::id());
        $flag = $request->query('flag', ''); // due | warranty

        $assets = Asset::with(['branch:id,name', 'vendor:id,name'])
            ->when($search, fn ($q) => $q->where(fn ($w) => $w
                ->where('name', 'like', "%{$search}%")
                ->orWhere('asset_code', 'like', "%{$search}%")
                ->orWhere('serial_number', 'like', "%{$search}%")))
            ->when($category, fn ($q) => $q->where('category', $category))
            ->when($status, fn ($q) => $q->where('status', $status))
            ->when($branchId, fn ($q) => $q->where('branch_id', $branchId))
            ->when($flag === 'due', fn ($q) => $q->serviceDue())
            ->when($flag === 'warranty', fn ($q) => $q
                ->whereNotNull('warranty_expiry')
                ->whereDate('warranty_expiry', '>=', now())
                ->whereDate('warranty_expiry', '<=', now()->addDays(30)))
            ->orderByDesc('id')
            ->paginate(15)
            ->withQueryString()
            ->through(fn ($a) => [
                ...$a->only(
                    'id', 'asset_code', 'name', 'category', 'branch_id', 'location',
                    'serial_number', 'vendor_id', 'purchase_date', 'purchase_cost',
                    'warranty_expiry', 'status', 'maintenance_interval_days',
                    'last_maintenance_date', 'next_maintenance_date', 'notes'
                ),
                'branch_name' => $a->branch?->name ?? 'All Branches',
                'vendor_name' => $a->vendor?->name,
                'records_count' => $a->maintenanceRecords()->count(),
                'is_maintenance_due' => $a->isMaintenanceDue(),
                'is_warranty_expiring' => $a->isWarrantyExpiring(),
            ]);

        return Inertia::render('Maintenance/Assets', [
            'assets' => $assets,
            'branches' => CurrentBranch::all(),
            'vendors' => Vendor::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'categories' => Asset::CATEGORIES,
            'statuses' => Asset::STATUSES,
            'summary' => $this->summary($branchId ? (int) $branchId : null),
            'filters' => [
                'search' => $search, 'category' => $category, 'status' => $status,
                'branch_id' => $branchId, 'flag' => $flag,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);

        $asset = new Asset($data);
        $asset->asset_code = Asset::generateAssetCode();
        $asset->branch_id = $data['branch_id'] ?? CurrentBranch::id();
        $asset->status = $data['status'] ?? 'active';
        $asset->next_maintenance_date = $asset->computeNextMaintenanceDate();
        $asset->save();

        return back()->with('success', 'Asset added to the register.');
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $asset = Asset::findOrFail($id);
        $data = $this->validated($request);

        $asset->fill($data);
        // Roll the next service date whenever the cadence or last-service anchor moves.
        $asset->next_maintenance_date = $asset->computeNextMaintenanceDate();
        $asset->save();

        return back()->with('success', 'Asset updated.');
    }

    public function destroy(int $id): RedirectResponse
    {
        Asset::findOrFail($id)->delete();

        return back()->with('success', 'Asset removed from the register.');
    }

    /** Shared validation for store/update. */
    private function validated(Request $request): array
    {
        return $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|in:'.implode(',', Asset::CATEGORIES),
            'branch_id' => 'nullable|exists:branches,id',
            'location' => 'nullable|string|max:120',
            'serial_number' => 'nullable|string|max:100',
            'vendor_id' => 'nullable|exists:vendors,id',
            'purchase_date' => 'nullable|date',
            'purchase_cost' => 'nullable|numeric|min:0',
            'warranty_expiry' => 'nullable|date',
            'status' => 'nullable|in:'.implode(',', Asset::STATUSES),
            'maintenance_interval_days' => 'nullable|integer|min:1|max:3650',
            'last_maintenance_date' => 'nullable|date',
            'notes' => 'nullable|string|max:2000',
        ]);
    }

    /** Register KPIs — counted across all outlets (unfiltered). */
    private function summary(?int $branchId): array
    {
        return [
            'total' => Asset::when($branchId, fn ($q) => $q->where('branch_id', $branchId))->count(),
            'active' => Asset::when($branchId, fn ($q) => $q->where('branch_id', $branchId))->where('status', 'active')->count(),
            'under_maintenance' => Asset::when($branchId, fn ($q) => $q->where('branch_id', $branchId))->where('status', 'under_maintenance')->count(),
            'maintenance_due' => Asset::when($branchId, fn ($q) => $q->where('branch_id', $branchId))->serviceDue()->count(),
            'warranty_expiring' => Asset::whereNotNull('warranty_expiry')
                ->when($branchId, fn ($q) => $q->where('branch_id', $branchId))
                ->whereDate('warranty_expiry', '>=', now())
                ->whereDate('warranty_expiry', '<=', now()->addDays(30))
                ->count(),
        ];
    }
}
