<?php

namespace App\Http\Controllers\Web\HR;

use App\Http\Controllers\Controller;
use App\Models\Deduction;
use App\Models\PayrollRun;
use App\Models\Payslip;
use App\Models\User;
use App\Services\PayrollService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Payroll is a three-step lifecycle: generate a **draft** (recomputable),
 * **approve** it (locks the numbers, consumes one-off deductions), then
 * **mark paid** (writes loan repayments and reduces balances).
 *
 * Deduction master data lives here too — it exists only to feed payroll, so it
 * shares the `hr.payroll.*` permissions rather than getting its own module.
 */
class PayrollController extends Controller
{
    public function __construct(private readonly PayrollService $payroll) {}

    public function index(Request $request): Response
    {
        // A hand-edited `?month=` must not error the page out — fall back to now.
        try {
            $month = $this->payroll->normalizeMonth($request->query('month', now()->format('Y-m')));
        } catch (ValidationException) {
            $month = $this->payroll->normalizeMonth(now());
        }

        $run = PayrollRun::query()
            ->whereDate('month', $month->toDateString())
            ->with(['payslips.employee:id,name,employee_code,designation_id', 'payslips.employee.designation:id,name', 'processor:id,name'])
            ->first();

        return Inertia::render('HR/Payroll', [
            'month' => $month->format('Y-m'),
            'monthLabel' => $month->format('F Y'),
            // A saved run shows what was issued; otherwise a live preview of what
            // generating would produce.
            'run' => $run ? $this->presentRun($run) : null,
            'preview' => $run ? null : $this->payroll->preview($month),
            'runs' => PayrollRun::query()
                ->withCount('payslips')
                ->orderByDesc('month')
                ->paginate(10, ['*'], 'runs_page')
                ->withQueryString()
                ->through(fn (PayrollRun $r) => [
                    'id' => $r->id,
                    'month' => Carbon::parse($r->month)->format('Y-m'),
                    'month_label' => Carbon::parse($r->month)->format('F Y'),
                    'status' => $r->status,
                    'payslips_count' => $r->payslips_count,
                    'total_gross' => (float) $r->total_gross,
                    'total_deductions' => (float) $r->total_deductions,
                    'total_net' => (float) $r->total_net,
                    'paid_at' => $r->paid_at?->format('d M Y'),
                ]),
            'deductions' => Deduction::query()
                ->with('employee:id,name,employee_code')
                ->whereNull('payroll_run_id')
                ->orderByDesc('id')
                ->limit(50)
                ->get()
                ->map(fn (Deduction $d) => [
                    'id' => $d->id,
                    'user_id' => $d->user_id,
                    'employee_name' => $d->employee?->name,
                    'title' => $d->title,
                    'amount' => (float) $d->amount,
                    'is_recurring' => (bool) $d->is_recurring,
                    'effective_month' => $d->effective_month?->format('Y-m'),
                ]),
            'employees' => User::query()
                ->employees()
                ->orderBy('name')
                ->get(['id', 'name', 'employee_code'])
                ->map(fn (User $u) => [
                    'id' => $u->id,
                    'name' => $u->employee_code ? "{$u->name} ({$u->employee_code})" : $u->name,
                ]),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate(['month' => ['required', 'string']]);

        $run = $this->payroll->generate($request->input('month'), $request->user()->id);

        return redirect()
            ->route('hr.payroll.index', ['month' => Carbon::parse($run->month)->format('Y-m')])
            ->with('success', 'Draft payroll generated for '.Carbon::parse($run->month)->format('F Y').'.');
    }

    public function approve(Request $request, $id): RedirectResponse
    {
        $run = PayrollRun::with('payslips')->findOrFail($id);
        $this->payroll->approve($run, $request->user()->id);

        return redirect()->back()->with('success', 'Payroll approved. It is now locked.');
    }

    public function markPaid($id): RedirectResponse
    {
        $run = PayrollRun::with('payslips')->findOrFail($id);
        $this->payroll->markPaid($run);

        return redirect()->back()->with('success', 'Payroll marked paid — loan balances updated.');
    }

    public function destroy($id): RedirectResponse
    {
        $run = PayrollRun::findOrFail($id);

        if (! $run->isEditable()) {
            return redirect()->back()->with('error', "An {$run->status} payroll run cannot be deleted.");
        }

        $run->delete();

        return redirect()->back()->with('success', 'Draft payroll deleted.');
    }

    // ── Deductions ───────────────────────────────────────────────────────────

    public function storeDeduction(Request $request): RedirectResponse
    {
        $data = $this->deductionRules($request);
        Deduction::create($data);

        return redirect()->back()->with('success', 'Deduction added.');
    }

    public function updateDeduction(Request $request, $id): RedirectResponse
    {
        $deduction = Deduction::findOrFail($id);

        if ($deduction->payroll_run_id) {
            return redirect()->back()->with('error', 'This deduction has already been charged on a payroll run.');
        }

        $deduction->update($this->deductionRules($request));

        return redirect()->back()->with('success', 'Deduction updated.');
    }

    public function destroyDeduction($id): RedirectResponse
    {
        $deduction = Deduction::findOrFail($id);

        if ($deduction->payroll_run_id) {
            return redirect()->back()->with('error', 'This deduction has already been charged on a payroll run.');
        }

        $deduction->delete();

        return redirect()->back()->with('success', 'Deduction deleted.');
    }

    private function deductionRules(Request $request): array
    {
        $data = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'title' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'is_recurring' => ['boolean'],
            'effective_month' => ['nullable', 'string'],
        ]);

        $data['is_recurring'] = (bool) ($data['is_recurring'] ?? false);
        // Recurring rows apply every month, so the month field is meaningless.
        $data['effective_month'] = ! $data['is_recurring'] && filled($data['effective_month'] ?? null)
            ? $this->payroll->normalizeMonth($data['effective_month'])->toDateString()
            : null;

        return $data;
    }

    /** @return array<string, mixed> */
    private function presentRun(PayrollRun $run): array
    {
        return [
            'id' => $run->id,
            'month' => Carbon::parse($run->month)->format('Y-m'),
            'month_label' => Carbon::parse($run->month)->format('F Y'),
            'status' => $run->status,
            'is_editable' => $run->isEditable(),
            'total_gross' => (float) $run->total_gross,
            'total_deductions' => (float) $run->total_deductions,
            'total_net' => (float) $run->total_net,
            'processor_name' => $run->processor?->name,
            'approved_at' => $run->approved_at?->format('d M Y H:i'),
            'paid_at' => $run->paid_at?->format('d M Y H:i'),
            'payslips' => $run->payslips
                ->sortBy(fn (Payslip $p) => $p->employee?->name)
                ->map(fn (Payslip $p) => [
                    'id' => $p->id,
                    'user_id' => $p->user_id,
                    'name' => $p->employee?->name ?? ($p->snapshot['name'] ?? '—'),
                    'employee_code' => $p->employee?->employee_code ?? ($p->snapshot['employee_code'] ?? null),
                    'designation' => $p->employee?->designation?->name ?? ($p->snapshot['designation'] ?? null),
                    'basic' => (float) $p->basic,
                    'allowances' => (float) $p->allowances,
                    'overtime_amount' => (float) $p->overtime_amount,
                    'deductions_amount' => (float) $p->deductions_amount,
                    'loan_deduction' => (float) $p->loan_deduction,
                    'gross' => (float) $p->gross,
                    'net' => (float) $p->net,
                    'present_days' => (float) $p->present_days,
                    'absent_days' => (float) $p->absent_days,
                    'leave_days' => (float) $p->leave_days,
                    'payable_days' => (int) $p->payable_days,
                    'snapshot' => $p->snapshot,
                ])->values(),
        ];
    }
}
