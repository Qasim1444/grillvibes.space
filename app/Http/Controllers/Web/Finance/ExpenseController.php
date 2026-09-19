<?php

namespace App\Http\Controllers\Web\Finance;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Expense;
use App\Models\PettyCashAccount;
use App\Models\PettyCashTransaction;
use App\Models\Vendor;
use App\Support\CurrentBranch;
use App\Support\PettyCashPoster;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ExpenseController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $category = $request->query('category', '');
        $status = $request->query('status', '');
        $paidVia = $request->query('paid_via', '');
        $branchId = $request->query('branch_id', CurrentBranch::id());

        $expenses = Expense::with([
            'branch:id,name', 'vendor:id,name', 'pettyCashAccount:id,name',
            'voucher:id,voucher_number,status', 'createdBy:id,name', 'approvedBy:id,name',
        ])
            ->when($search, fn ($q) => $q->where(fn ($w) => $w
                ->where('expense_number', 'like', "%{$search}%")
                ->orWhere('description', 'like', "%{$search}%")
                ->orWhere('payee', 'like', "%{$search}%")
                ->orWhere('reference', 'like', "%{$search}%")))
            ->when($category, fn ($q) => $q->where('category', $category))
            ->when($status, fn ($q) => $q->where('status', $status))
            ->when($paidVia, fn ($q) => $q->where('paid_via', $paidVia))
            ->when($branchId, fn ($q) => $q->where('branch_id', $branchId))
            ->orderByDesc('id')
            ->paginate(15)
            ->withQueryString()
            ->through(fn ($e) => [
                ...$e->only(
                    'id', 'expense_number', 'branch_id', 'category', 'vendor_id', 'payee',
                    'expense_date', 'amount', 'paid_via', 'petty_cash_account_id',
                    'expense_voucher_id', 'status', 'reference', 'description', 'notes', 'approved_at'
                ),
                'branch_name' => $e->branch?->name ?? 'All Branches',
                'vendor_name' => $e->vendor?->name,
                'account_name' => $e->pettyCashAccount?->name,
                'voucher_number' => $e->voucher?->voucher_number,
                'created_by_name' => $e->createdBy?->name,
                'approved_by_name' => $e->approvedBy?->name,
            ]);

        return Inertia::render('Finance/Expenses', [
            'expenses' => $expenses,
            'branches' => CurrentBranch::all(),
            'vendors' => Vendor::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'accounts' => PettyCashAccount::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'categories' => Expense::CATEGORIES,
            'paidVia' => Expense::PAID_VIA,
            'statuses' => Expense::STATUSES,
            'summary' => $this->summary($branchId ? (int) $branchId : null),
            'filters' => [
                'search' => $search, 'category' => $category, 'status' => $status,
                'paid_via' => $paidVia, 'branch_id' => $branchId,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);

        DB::transaction(function () use ($data, $request) {
            $expense = Expense::create([
                ...$data,
                'expense_number' => Expense::generateExpenseNumber(),
                'branch_id' => $data['branch_id'] ?? CurrentBranch::id(),
                'status' => 'pending',   // status transitions go through approve/reject
                'created_by' => $request->user()?->id,
            ]);

            $this->syncMoney($expense->fresh(), $request);
        });

        return back()->with('success', 'Expense recorded.');
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $expense = Expense::findOrFail($id);
        $data = $this->validated($request);

        DB::transaction(function () use ($expense, $data, $request) {
            $expense->update($data);
            $this->syncMoney($expense->fresh(), $request);
        });

        return back()->with('success', 'Expense updated.');
    }

    /** Approve an expense — stamps who signed it off and when. */
    public function approve(Request $request, int $id): RedirectResponse
    {
        Expense::findOrFail($id)->update([
            'status' => 'approved',
            'approved_by' => $request->user()?->id,
            'approved_at' => now(),
        ]);

        return back()->with('success', 'Expense approved.');
    }

    /** Reject an expense — the petty-cash mirror (if any) is left intact; the
     *  money already left the box, so reverse it by deleting the expense. */
    public function reject(Request $request, int $id): RedirectResponse
    {
        Expense::findOrFail($id)->update([
            'status' => 'rejected',
            'approved_by' => $request->user()?->id,
            'approved_at' => now(),
        ]);

        return back()->with('success', 'Expense rejected.');
    }

    public function destroy(Request $request, int $id): RedirectResponse
    {
        $expense = Expense::findOrFail($id);

        DB::transaction(function () use ($expense, $request) {
            $voucher = $expense->voucher;

            $accountIds = PettyCashTransaction::where('expense_id', $expense->id)
                ->pluck('petty_cash_account_id')->all();

            PettyCashTransaction::where('expense_id', $expense->id)->forceDelete();
            $expense->update(['expense_voucher_id' => null]);   // release before it goes
            $expense->delete();

            foreach (array_unique(array_filter($accountIds)) as $accountId) {
                PettyCashAccount::find($accountId)?->recomputeBalance();
            }

            // The claim it sat on is now worth less — re-roll its total and its
            // combined petty-cash line.
            if ($voucher) {
                $voucher->recomputeAmount();
                PettyCashPoster::syncVoucher($voucher->fresh(), $request->user()?->id);
            }
        });

        return back()->with('success', 'Expense deleted.');
    }

    /** Shared validation for store/update. Status/approval fields are handled by
     *  the dedicated approve/reject actions, not mass-assigned here. */
    private function validated(Request $request): array
    {
        return $request->validate([
            'branch_id' => 'nullable|exists:branches,id',
            'category' => 'required|in:'.implode(',', Expense::CATEGORIES),
            'vendor_id' => 'nullable|exists:vendors,id',
            'payee' => 'nullable|string|max:150',
            'expense_date' => 'required|date',
            'amount' => 'required|numeric|min:0',
            'paid_via' => 'required|in:'.implode(',', Expense::PAID_VIA),
            'petty_cash_account_id' => 'nullable|required_if:paid_via,petty_cash|exists:petty_cash_accounts,id',
            'reference' => 'nullable|string|max:100',
            'description' => 'required|string|max:255',
            'notes' => 'nullable|string|max:2000',
        ]);
    }

    /**
     * Keep the petty-cash sub-ledger in step with an expense.
     *
     * An unclaimed expense mirrors its own signed disbursement (dropped and
     * re-posted idempotently). A claimed one has no line of its own — its
     * voucher owns the money — so the claim total and the voucher's single
     * combined line are re-rolled instead. Safe to call on store and update.
     */
    private function syncMoney(Expense $expense, Request $request): void
    {
        $userId = $request->user()?->id;
        $voucher = $expense->voucher;

        if (! $voucher) {
            PettyCashPoster::syncExpense($expense, $userId);

            return;
        }

        $voucher->recomputeAmount();
        PettyCashPoster::syncVoucher($voucher->fresh(), $userId);
    }

    /** Expense KPIs — counted across all outlets (unfiltered). */
    private function summary(?int $branchId): array
    {
        $monthStart = now()->startOfMonth();
        $monthEnd = now()->endOfMonth();

        return [
            'pending' => Expense::when($branchId, fn ($q) => $q->where('branch_id', $branchId))->where('status', 'pending')->count(),
            'pending_amount' => (float) Expense::when($branchId, fn ($q) => $q->where('branch_id', $branchId))->where('status', 'pending')->sum('amount'),
            'approved_this_month' => (float) Expense::where('status', 'approved')
                ->when($branchId, fn ($q) => $q->where('branch_id', $branchId))
                ->whereBetween('expense_date', [$monthStart, $monthEnd])
                ->sum('amount'),
            'total_this_month' => (float) Expense::when($branchId, fn ($q) => $q->where('branch_id', $branchId))
                ->whereBetween('expense_date', [$monthStart, $monthEnd])
                ->sum('amount'),
        ];
    }
}
