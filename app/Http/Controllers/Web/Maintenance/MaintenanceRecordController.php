<?php

namespace App\Http\Controllers\Web\Maintenance;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use App\Models\MaintenanceRecord;
use App\Models\Vendor;
use App\Support\CurrentBranch;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class MaintenanceRecordController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $type = $request->query('type', '');
        $status = $request->query('status', '');
        $branchId = $request->query('branch_id', CurrentBranch::id());
        $assetId = $request->query('asset_id', '');

        $records = MaintenanceRecord::with(['asset:id,name,asset_code', 'branch:id,name', 'vendor:id,name', 'createdBy:id,name'])
            ->when($search, fn ($q) => $q->where(fn ($w) => $w
                ->where('maintenance_number', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%")
                ->orWhereHas('asset', fn ($aq) => $aq
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('asset_code', 'like', "%{$search}%"))))
            ->when($type, fn ($q) => $q->where('type', $type))
            ->when($status, fn ($q) => $q->where('status', $status))
            ->when($branchId, fn ($q) => $q->where('branch_id', $branchId))
            ->when($assetId, fn ($q) => $q->where('asset_id', $assetId))
            ->orderByDesc('id')
            ->paginate(15)
            ->withQueryString()
            ->through(fn ($r) => [
                ...$r->only(
                    'id', 'maintenance_number', 'asset_id', 'branch_id', 'type', 'status',
                    'scheduled_date', 'completed_date', 'performed_by', 'vendor_id',
                    'cost', 'downtime_hours', 'description', 'notes'
                ),
                'asset_name' => $r->asset?->name,
                'asset_code' => $r->asset?->asset_code,
                'branch_name' => $r->branch?->name ?? 'All Branches',
                'vendor_name' => $r->vendor?->name,
                'created_by_name' => $r->createdBy?->name,
            ]);

        return Inertia::render('Maintenance/MaintenanceLogs', [
            'records' => $records,
            'assets' => Asset::when($branchId, fn ($q) => $q->where('branch_id', $branchId))
                ->whereNotIn('status', ['disposed'])
                ->orderBy('name')
                ->get(['id', 'name', 'asset_code']),
            'branches' => CurrentBranch::all(),
            'vendors' => Vendor::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'types' => MaintenanceRecord::TYPES,
            'statuses' => MaintenanceRecord::STATUSES,
            'summary' => $this->summary($branchId ? (int) $branchId : null),
            'filters' => [
                'search' => $search, 'type' => $type, 'status' => $status,
                'branch_id' => $branchId, 'asset_id' => $assetId,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);
        $asset = Asset::findOrFail($data['asset_id']);

        DB::transaction(function () use ($data, $asset, $request) {
            $record = MaintenanceRecord::create([
                ...$data,
                'maintenance_number' => MaintenanceRecord::generateMaintenanceNumber(),
                'branch_id' => $asset->branch_id,   // denormalised from the asset
                'status' => $data['status'] ?? 'scheduled',
                'created_by' => $request->user()?->id,
            ]);

            $this->syncAsset($record->fresh('asset'));
        });

        return back()->with('success', 'Maintenance record logged.');
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $record = MaintenanceRecord::findOrFail($id);
        $data = $this->validated($request);

        DB::transaction(function () use ($record, $data) {
            // A record is never moved to another asset; keep its branch in step
            // with the asset it belongs to in case the asset was re-homed.
            $data['branch_id'] = $record->asset?->branch_id;
            // If marked completed here (rather than via the Complete action),
            // stamp a completion date so the record isn't "done" with no date.
            if (($data['status'] ?? null) === 'completed' && empty($data['completed_date'])) {
                $data['completed_date'] = $record->completed_date?->toDateString() ?? now()->toDateString();
            }
            $record->update($data);
            $this->syncAsset($record->fresh('asset'));
        });

        return back()->with('success', 'Maintenance record updated.');
    }

    /** Mark a job done — stamps completion and rolls the asset's service dates. */
    public function complete(Request $request, int $id): RedirectResponse
    {
        $record = MaintenanceRecord::findOrFail($id);

        $data = $request->validate([
            'completed_date' => 'nullable|date',
            'cost' => 'nullable|numeric|min:0',
            'downtime_hours' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:2000',
        ]);

        DB::transaction(function () use ($record, $data) {
            $record->update([
                'status' => 'completed',
                'completed_date' => $data['completed_date'] ?? now()->toDateString(),
                'cost' => $data['cost'] ?? $record->cost,
                'downtime_hours' => $data['downtime_hours'] ?? $record->downtime_hours,
                'notes' => $data['notes'] ?? $record->notes,
            ]);

            $this->syncAsset($record->fresh('asset'));
        });

        return back()->with('success', 'Maintenance completed.');
    }

    public function destroy(int $id): RedirectResponse
    {
        MaintenanceRecord::findOrFail($id)->delete();

        return back()->with('success', 'Maintenance record deleted.');
    }

    /** Shared validation for store/update. */
    private function validated(Request $request): array
    {
        return $request->validate([
            'asset_id' => 'required|exists:assets,id',
            'type' => 'required|in:'.implode(',', MaintenanceRecord::TYPES),
            'status' => 'nullable|in:'.implode(',', MaintenanceRecord::STATUSES),
            'scheduled_date' => 'nullable|date',
            'completed_date' => 'nullable|date',
            'performed_by' => 'nullable|string|max:120',
            'vendor_id' => 'nullable|exists:vendors,id',
            'cost' => 'nullable|numeric|min:0',
            'downtime_hours' => 'nullable|numeric|min:0',
            'description' => 'required|string|max:255',
            'notes' => 'nullable|string|max:2000',
        ]);
    }

    /**
     * Reflect a record's lifecycle onto its asset:
     *   in_progress → asset under_maintenance
     *   completed   → stamp last service, roll next service, return asset to active
     * Never overrides a retired/disposed asset.
     */
    private function syncAsset(MaintenanceRecord $record): void
    {
        $asset = $record->asset;

        if (! $asset) {
            return;
        }

        $terminal = in_array($asset->status, ['retired', 'disposed'], true);

        if ($record->status === 'completed') {
            $asset->last_maintenance_date = $record->completed_date ?? now()->toDateString();
            $asset->next_maintenance_date = $asset->computeNextMaintenanceDate();

            if (! $terminal) {
                $asset->status = 'active';
            }

            $asset->save();
        } elseif ($record->status === 'in_progress' && ! $terminal) {
            $asset->status = 'under_maintenance';
            $asset->save();
        }
    }

    /** Work-order KPIs. */
    private function summary(?int $branchId): array
    {
        return [
            'scheduled' => MaintenanceRecord::when($branchId, fn ($q) => $q->where('branch_id', $branchId))->where('status', 'scheduled')->count(),
            'in_progress' => MaintenanceRecord::when($branchId, fn ($q) => $q->where('branch_id', $branchId))->where('status', 'in_progress')->count(),
            'completed_this_month' => MaintenanceRecord::where('status', 'completed')
                ->when($branchId, fn ($q) => $q->where('branch_id', $branchId))
                ->whereBetween('completed_date', [now()->startOfMonth(), now()->endOfMonth()])
                ->count(),
            'cost_this_month' => (float) MaintenanceRecord::where('status', 'completed')
                ->when($branchId, fn ($q) => $q->where('branch_id', $branchId))
                ->whereBetween('completed_date', [now()->startOfMonth(), now()->endOfMonth()])
                ->sum('cost'),
        ];
    }
}
