<?php

namespace App\Http\Controllers\Web\HR;

use App\Http\Controllers\Controller;
use App\Models\Leave;
use App\Models\LeaveType;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class LeaveController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $status = trim((string) $request->query('status', ''));

        $leaves = Leave::query()
            // The inner group matters: whereHas appends the callback's clauses
            // beside its own FK constraint, so a bare orWhere would escape it.
            ->when($search !== '', fn ($q) => $q->whereHas('employee', fn ($w) => $w->where(fn ($x) => $x
                ->where('name', 'like', "%{$search}%")
                ->orWhere('employee_code', 'like', "%{$search}%"))))
            ->when($status !== '', fn ($q) => $q->where('status', $status))
            ->with(['employee:id,name,employee_code', 'leaveType:id,name,is_paid', 'approver:id,name'])
            ->latest('from_date')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (Leave $l) => [
                'id' => $l->id,
                'user_id' => $l->user_id,
                'employee_name' => $l->employee?->name,
                'employee_code' => $l->employee?->employee_code,
                'leave_type_id' => $l->leave_type_id,
                'leave_type_name' => $l->leaveType?->name,
                'is_paid' => (bool) $l->leaveType?->is_paid,
                'from_date' => $l->from_date?->toDateString(),
                'to_date' => $l->to_date?->toDateString(),
                'days' => (float) $l->days,
                'reason' => $l->reason,
                'status' => $l->status,
                'approver_name' => $l->approver?->name,
                'approved_at' => $l->approved_at?->format('d M Y H:i'),
            ]);

        return Inertia::render('HR/Leaves', [
            'leaves' => $leaves,
            'filters' => ['search' => $search, 'status' => $status],
            'employees' => $this->employeeOptions(),
            'leaveTypes' => LeaveType::orderBy('name')->get(['id', 'name', 'days_per_year', 'is_paid']),
            'stats' => [
                'pending' => Leave::where('status', 'pending')->count(),
                'approved' => Leave::where('status', 'approved')->count(),
                'rejected' => Leave::where('status', 'rejected')->count(),
            ],
        ]);
    }

    // ── Leave type management ─────────────────────────────────────────────────

    public function storeLeaveType(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name'          => ['required', 'string', 'max:100', 'unique:leave_types,name'],
            'days_per_year' => ['nullable', 'integer', 'min:0', 'max:365'],
            'is_paid'       => ['boolean'],
        ]);

        LeaveType::create($data + ['is_paid' => $data['is_paid'] ?? true]);

        return back()->with('success', 'Leave type added.');
    }

    public function updateLeaveType(Request $request, int $id): RedirectResponse
    {
        $type = LeaveType::findOrFail($id);

        $data = $request->validate([
            'name'          => ['required', 'string', 'max:100', Rule::unique('leave_types', 'name')->ignore($id)],
            'days_per_year' => ['nullable', 'integer', 'min:0', 'max:365'],
            'is_paid'       => ['boolean'],
        ]);

        $type->update($data);

        return back()->with('success', 'Leave type updated.');
    }

    public function destroyLeaveType(int $id): RedirectResponse
    {
        $type = LeaveType::findOrFail($id);

        // Existing leave requests reference this type (FK restrict) —
        // block deletion instead of orphaning them.
        if (Leave::where('leave_type_id', $id)->exists()) {
            return back()->with('error', "Cannot delete “{$type->name}” — it is used by existing leave requests.");
        }

        $type->delete();

        return back()->with('success', 'Leave type deleted.');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);
        $data['days'] = $this->days($data['from_date'], $data['to_date']);
        $data['status'] = 'pending';

        Leave::create($data);

        return redirect()->back()->with('success', 'Leave request recorded.');
    }

    public function update(Request $request, $id): RedirectResponse
    {
        $leave = Leave::findOrFail($id);

        // Once decided, a leave affects payroll — reopen it by changing the
        // decision rather than silently editing the dates underneath.
        if ($leave->status !== 'pending') {
            return redirect()->back()->with('error', 'This request has already been '.$leave->status.'. Reset it to pending first.');
        }

        $data = $this->validated($request);
        $data['days'] = $this->days($data['from_date'], $data['to_date']);

        $leave->update($data);

        return redirect()->back()->with('success', 'Leave request updated.');
    }

    /** Approve / reject / reset — the single decision endpoint. */
    public function decide(Request $request, $id): RedirectResponse
    {
        $leave = Leave::findOrFail($id);

        $data = $request->validate([
            'status' => ['required', Rule::in(['pending', 'approved', 'rejected'])],
        ]);

        $decided = $data['status'] !== 'pending';

        $leave->update([
            'status' => $data['status'],
            'approved_by' => $decided ? $request->user()->id : null,
            'approved_at' => $decided ? now() : null,
        ]);

        return redirect()->back()->with('success', 'Leave request '.$data['status'].'.');
    }

    public function destroy($id): RedirectResponse
    {
        Leave::findOrFail($id)->delete();

        return redirect()->back()->with('success', 'Leave request deleted.');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'leave_type_id' => ['required', 'integer', 'exists:leave_types,id'],
            'from_date' => ['required', 'date'],
            'to_date' => ['required', 'date', 'after_or_equal:from_date'],
            'reason' => ['nullable', 'string', 'max:500'],
        ]);
    }

    /** Inclusive day count — a one-day leave is 1, not 0. */
    private function days(string $from, string $to): float
    {
        return (float) ((int) Carbon::parse($from)->startOfDay()->diffInDays(Carbon::parse($to)->startOfDay()) + 1);
    }

    /** @return Collection<int, array<string, mixed>> */
    private function employeeOptions()
    {
        return User::query()
            ->employees()
            ->orderBy('name')
            ->get(['id', 'name', 'employee_code'])
            ->map(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->employee_code ? "{$u->name} ({$u->employee_code})" : $u->name,
            ]);
    }
}
