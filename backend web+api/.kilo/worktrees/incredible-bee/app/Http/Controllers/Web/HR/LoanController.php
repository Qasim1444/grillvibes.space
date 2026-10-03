<?php

namespace App\Http\Controllers\Web\HR;

use App\Http\Controllers\Controller;
use App\Models\Loan;
use App\Models\LoanRepayment;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Loans and salary advances. `outstanding` is the live balance — payroll
 * decrements it when a run is marked paid, and manual repayments here do the
 * same, so both paths agree.
 */
class LoanController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $status = trim((string) $request->query('status', ''));

        $loans = Loan::query()
            ->when($search !== '', fn ($q) => $q->whereHas('employee', fn ($w) => $w->where(fn ($x) => $x
                ->where('name', 'like', "%{$search}%")
                ->orWhere('employee_code', 'like', "%{$search}%"))))
            ->when($status !== '', fn ($q) => $q->where('status', $status))
            ->with(['employee:id,name,employee_code', 'repayments'])
            ->latest('disbursed_on')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (Loan $l) => [
                'id' => $l->id,
                'user_id' => $l->user_id,
                'employee_name' => $l->employee?->name,
                'employee_code' => $l->employee?->employee_code,
                'type' => $l->type,
                'amount' => (float) $l->amount,
                'installment_amount' => (float) $l->installment_amount,
                'outstanding' => (float) $l->outstanding,
                'recovered' => round((float) $l->amount - (float) $l->outstanding, 2),
                'disbursed_on' => $l->disbursed_on?->toDateString(),
                'status' => $l->status,
                'note' => $l->note,
                'repayments' => $l->repayments
                    ->sortByDesc('paid_on')
                    ->map(fn (LoanRepayment $r) => [
                        'id' => $r->id,
                        'amount' => (float) $r->amount,
                        'paid_on' => $r->paid_on?->toDateString(),
                        'payroll_run_id' => $r->payroll_run_id,
                    ])->values(),
            ]);

        return Inertia::render('HR/Loans', [
            'loans' => $loans,
            'filters' => ['search' => $search, 'status' => $status],
            'employees' => $this->employeeOptions(),
            'stats' => [
                'active' => Loan::where('status', 'active')->count(),
                'disbursed' => (float) Loan::sum('amount'),
                'outstanding' => (float) Loan::where('status', 'active')->sum('outstanding'),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);
        // A fresh loan owes the whole amount.
        $data['outstanding'] = $data['amount'];
        $data['status'] = 'active';

        Loan::create($data);

        return redirect()->back()->with('success', 'Loan recorded.');
    }

    public function update(Request $request, $id): RedirectResponse
    {
        $loan = Loan::findOrFail($id);
        $data = $this->validated($request);

        $recovered = round((float) $loan->amount - (float) $loan->outstanding, 2);

        // Reducing the principal below what has already been collected would put
        // the balance underwater.
        if ((float) $data['amount'] < $recovered) {
            return redirect()->back()->with('error', 'Amount cannot be less than the '.number_format($recovered, 2).' already recovered.');
        }

        $data['outstanding'] = round((float) $data['amount'] - $recovered, 2);
        $data['status'] = $data['outstanding'] <= 0 ? 'closed' : 'active';

        $loan->update($data);

        return redirect()->back()->with('success', 'Loan updated.');
    }

    /** Off-payroll repayment (cash back to the till, for instance). */
    public function repay(Request $request, $id): RedirectResponse
    {
        $loan = Loan::findOrFail($id);

        $data = $request->validate([
            'amount' => ['required', 'numeric', 'min:0.01', 'max:'.max((float) $loan->outstanding, 0.01)],
            'paid_on' => ['required', 'date'],
        ]);

        if ((float) $loan->outstanding <= 0) {
            return redirect()->back()->with('error', 'This loan is already fully recovered.');
        }

        DB::transaction(function () use ($loan, $data) {
            LoanRepayment::create([
                'loan_id' => $loan->id,
                'amount' => $data['amount'],
                'paid_on' => $data['paid_on'],
            ]);

            $loan->outstanding = round((float) $loan->outstanding - (float) $data['amount'], 2);

            if ($loan->outstanding <= 0) {
                $loan->outstanding = 0;
                $loan->status = 'closed';
            }

            $loan->save();
        });

        return redirect()->back()->with('success', 'Repayment recorded.');
    }

    public function destroy($id): RedirectResponse
    {
        $loan = Loan::findOrFail($id);

        if ($loan->repayments()->exists()) {
            return redirect()->back()->with('error', 'This loan has repayments against it and cannot be deleted.');
        }

        $loan->delete();

        return redirect()->back()->with('success', 'Loan deleted.');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'type' => ['required', Rule::in(['loan', 'advance'])],
            'amount' => ['required', 'numeric', 'min:1'],
            'installment_amount' => ['required', 'numeric', 'min:0', 'lte:amount'],
            'disbursed_on' => ['required', 'date'],
            'note' => ['nullable', 'string', 'max:255'],
        ]);
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
