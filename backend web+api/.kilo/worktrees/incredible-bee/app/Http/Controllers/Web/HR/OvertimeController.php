<?php

namespace App\Http\Controllers\Web\HR;

use App\Http\Controllers\Controller;
use App\Models\Overtime;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class OvertimeController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $status = trim((string) $request->query('status', ''));
        $month = trim((string) $request->query('month', ''));
        // A hand-edited query string must not 500 the page, so an unparseable
        // month simply drops the filter.
        $monthStart = $this->monthStart($month);

        $overtimes = Overtime::query()
            ->when($search !== '', fn ($q) => $q->whereHas('employee', fn ($w) => $w->where(fn ($x) => $x
                ->where('name', 'like', "%{$search}%")
                ->orWhere('employee_code', 'like', "%{$search}%"))))
            ->when($status !== '', fn ($q) => $q->where('status', $status))
            ->when($monthStart !== null, function ($q) use ($monthStart) {
                $q->whereBetween('date', [$monthStart, $monthStart->copy()->endOfMonth()]);
            })
            ->with(['employee:id,name,employee_code', 'approver:id,name'])
            ->latest('date')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (Overtime $o) => [
                'id' => $o->id,
                'user_id' => $o->user_id,
                'employee_name' => $o->employee?->name,
                'employee_code' => $o->employee?->employee_code,
                'date' => $o->date?->toDateString(),
                'hours' => (float) $o->hours,
                'rate_per_hour' => (float) $o->rate_per_hour,
                'amount' => (float) $o->amount,
                'status' => $o->status,
                'note' => $o->note,
                'approver_name' => $o->approver?->name,
                'approved_at' => $o->approved_at?->format('d M Y H:i'),
            ]);

        return Inertia::render('HR/Overtime', [
            'overtimes' => $overtimes,
            'filters' => ['search' => $search, 'status' => $status, 'month' => $month],
            'employees' => $this->employeeOptions(),
            'stats' => [
                'pending' => Overtime::where('status', 'pending')->count(),
                'approved_hours' => (float) Overtime::where('status', 'approved')->sum('hours'),
                'approved_amount' => (float) Overtime::where('status', 'approved')->sum('amount'),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);
        $data['amount'] = $this->amount($data);
        $data['status'] = 'pending';

        Overtime::create($data);

        return redirect()->back()->with('success', 'Overtime logged.');
    }

    public function update(Request $request, $id): RedirectResponse
    {
        $overtime = Overtime::findOrFail($id);

        if ($overtime->status === 'approved') {
            return redirect()->back()->with('error', 'Approved overtime is locked because payroll consumes it. Reset it to pending first.');
        }

        $data = $this->validated($request);
        $data['amount'] = $this->amount($data);

        $overtime->update($data);

        return redirect()->back()->with('success', 'Overtime updated.');
    }

    public function decide(Request $request, $id): RedirectResponse
    {
        $overtime = Overtime::findOrFail($id);

        $data = $request->validate([
            'status' => ['required', Rule::in(['pending', 'approved', 'rejected'])],
        ]);

        $decided = $data['status'] !== 'pending';

        $overtime->update([
            'status' => $data['status'],
            'approved_by' => $decided ? $request->user()->id : null,
            'approved_at' => $decided ? now() : null,
        ]);

        return redirect()->back()->with('success', 'Overtime '.$data['status'].'.');
    }

    public function destroy($id): RedirectResponse
    {
        $overtime = Overtime::findOrFail($id);

        if ($overtime->status === 'approved') {
            return redirect()->back()->with('error', 'Approved overtime cannot be deleted — reject it instead so the record stays auditable.');
        }

        $overtime->delete();

        return redirect()->back()->with('success', 'Overtime deleted.');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'date' => ['required', 'date'],
            'hours' => ['required', 'numeric', 'min:0.25', 'max:24'],
            'rate_per_hour' => ['required', 'numeric', 'min:0'],
            'note' => ['nullable', 'string', 'max:255'],
        ]);
    }

    /** Stored on the row so a later rate change cannot rewrite past overtime. */
    private function amount(array $data): float
    {
        return round((float) $data['hours'] * (float) $data['rate_per_hour'], 2);
    }

    /** First day of a `YYYY-MM` filter, or null when absent/unparseable. */
    private function monthStart(string $month): ?Carbon
    {
        if ($month === '') {
            return null;
        }

        try {
            return Carbon::parse($month.'-01')->startOfMonth();
        } catch (\Throwable) {
            return null;
        }
    }

    /** @return Collection<int, array<string, mixed>> */
    private function employeeOptions()
    {
        return User::query()
            ->employees()
            ->orderBy('name')
            ->get(['id', 'name', 'employee_code', 'basic_salary'])
            ->map(fn (User $u) => [
                'id' => $u->id,
                'name' => $u->employee_code ? "{$u->name} ({$u->employee_code})" : $u->name,
                // Suggested hourly rate — monthly salary over 30 days × 8 hours.
                'suggested_rate' => round(((float) $u->basic_salary) / 240, 2),
            ]);
    }
}
