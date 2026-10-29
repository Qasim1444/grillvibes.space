<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Support\CurrentBranch;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class BranchController extends Controller
{
    /**
     * Tables that retain branch-owned operational data. Deleting a branch with
     * any of these records would either cascade-delete data or orphan it.
     *
     * @var list<string>
     */
    private const BRANCH_DATA_TABLES = [
        'branch_user',
        'places',
        'orders',
        'kds_stations',
        'dining_tables',
        'reservations',
        'waitlist_entries',
        'qr_codes',
        'qr_sessions',
        'expense_vouchers',
        'expenses',
        'petty_cash_accounts',
        'petty_cash_transactions',
        'assets',
        'maintenance_records',
        'purchase_orders',
        'goods_receipts',
        'stock_levels',
        'stock_movements',
    ];

    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));

        $branches = Branch::query()
            ->when($search !== '', fn (Builder $query) => $query->where(function (Builder $query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('manager_name', 'like', "%{$search}%");
            }))
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Branches', [
            'branches' => $branches,
            'filters' => ['search' => $search],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Branch::create($request->validate($this->rules()));

        return back()->with('success', 'Branch created.');
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        Branch::findOrFail($id)->update($request->validate($this->rules()));

        return back()->with('success', 'Branch updated.');
    }

    public function destroy(int $id): RedirectResponse
    {
        $branch = Branch::findOrFail($id);

        if (Branch::count() <= 1) {
            throw ValidationException::withMessages([
                'branch' => 'The last branch cannot be deleted.',
            ]);
        }

        foreach (self::BRANCH_DATA_TABLES as $table) {
            if (Schema::hasTable($table)
                && Schema::hasColumn($table, 'branch_id')
                && DB::table($table)->where('branch_id', $branch->id)->exists()) {
                throw ValidationException::withMessages([
                    'branch' => 'This branch cannot be deleted while it has associated records.',
                ]);
            }
        }

        $branch->delete();

        return back()->with('success', 'Branch deleted.');
    }

    /** Switch the active outlet the UI is scoped to (topbar switcher). */
    public function switch(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'branch_id' => 'required|exists:branches,id',
        ]);

        $branchId = (int) $data['branch_id'];

        if (! CurrentBranch::all()->contains('id', $branchId)) {
            return back()->with('error', 'You do not have access to that branch.');
        }

        CurrentBranch::set($branchId);

        return back()->with('success', 'Switched outlet.');
    }

    /** Update the branch geofence used by employee attendance punches. */
    public function updateAttendanceSettings(Request $request, int $id): RedirectResponse
    {
        $data = $request->validate([
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'attendance_radius_meters' => ['required', 'integer', 'min:10', 'max:5000'],
            'attendance_start_time' => ['nullable', 'date_format:H:i'],
        ]);

        Branch::findOrFail($id)->update($data);

        return back()->with('success', 'Attendance location updated.');
    }

    private function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'manager_name' => ['nullable', 'string', 'max:255'],
            'status' => ['required', 'boolean'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'attendance_radius_meters' => ['required', 'integer', 'min:10', 'max:5000'],
            'attendance_start_time' => ['nullable', 'date_format:H:i'],
        ];
    }
}
