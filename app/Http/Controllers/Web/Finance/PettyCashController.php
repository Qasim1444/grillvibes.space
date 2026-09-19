<?php

namespace App\Http\Controllers\Web\Finance;

use App\Http\Controllers\Controller;
use App\Models\PettyCashAccount;
use App\Models\PettyCashTransaction;
use App\Support\CurrentBranch;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PettyCashController extends Controller
{
    public function index(Request $request): Response
    {
        $accountId = $request->query('account_id', '');
        $type = $request->query('type', '');
        $branchId = CurrentBranch::id();

        $transactions = PettyCashTransaction::with([
            'account:id,name', 'branch:id,name', 'expense:id,expense_number',
            'voucher:id,voucher_number', 'createdBy:id,name',
        ])
            ->when($branchId, fn ($q) => $q->where('branch_id', $branchId))
            ->when($accountId, fn ($q) => $q->where('petty_cash_account_id', $accountId))
            ->when($type, fn ($q) => $q->where('type', $type))
            ->orderByDesc('id')
            ->paginate(15)
            ->withQueryString()
            ->through(fn ($t) => [
                ...$t->only(
                    'id', 'petty_cash_account_id', 'branch_id', 'type', 'amount',
                    'balance_after', 'expense_id', 'expense_voucher_id', 'reference',
                    'description', 'occurred_on'
                ),
                'account_name' => $t->account?->name,
                'branch_name' => $t->branch?->name ?? 'All Branches',
                'expense_number' => $t->expense?->expense_number,
                'voucher_number' => $t->voucher?->voucher_number,
                'created_by_name' => $t->createdBy?->name,
            ]);

        $accounts = PettyCashAccount::with('branch:id,name')
            ->when($branchId, fn ($q) => $q->where('branch_id', $branchId))
            ->orderByDesc('is_active')->orderBy('name')->get()
            ->map(fn ($a) => [
                ...$a->only(
                    'id', 'name', 'branch_id', 'custodian_name',
                    'opening_balance', 'current_balance', 'is_active', 'notes'
                ),
                'branch_name' => $a->branch?->name ?? 'All Branches',
            ]);

        return Inertia::render('Finance/PettyCash', [
            'accounts' => $accounts,
            'transactions' => $transactions,
            'branches' => CurrentBranch::all(),
            'types' => PettyCashTransaction::TYPES,
            'summary' => $this->summary($branchId),
            'filters' => ['account_id' => $accountId, 'type' => $type],
        ]);
    }

    public function storeAccount(Request $request): RedirectResponse
    {
        $data = $this->validatedAccount($request);

        $account = new PettyCashAccount($data);
        $account->branch_id = $data['branch_id'] ?? CurrentBranch::id();
        $account->current_balance = $data['opening_balance'] ?? 0;   // no lines yet → balance = opening
        $account->is_active = $data['is_active'] ?? true;
        $account->save();

        return back()->with('success', 'Petty-cash fund created.');
    }

    public function updateAccount(Request $request, int $id): RedirectResponse
    {
        $account = PettyCashAccount::findOrFail($id);
        $data = $this->validatedAccount($request);

        $account->fill($data);
        $account->save();
        // The opening balance may have been corrected — re-roll the running total.
        $account->recomputeBalance();

        return back()->with('success', 'Petty-cash fund updated.');
    }

    public function destroyAccount(int $id): RedirectResponse
    {
        $account = PettyCashAccount::findOrFail($id);

        // Preserve the audit trail: a float with ledger history is deactivated,
        // never deleted.
        if ($account->transactions()->exists()) {
            return back()->with('error', 'This fund has transactions and cannot be deleted — deactivate it instead.');
        }

        $account->delete();

        return back()->with('success', 'Petty-cash fund removed.');
    }

    public function storeTransaction(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'petty_cash_account_id' => 'required|exists:petty_cash_accounts,id',
            'type' => 'required|in:'.implode(',', PettyCashTransaction::TYPES),
            'amount' => 'required|numeric',
            'occurred_on' => 'nullable|date',
            'reference' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:255',
        ]);

        $account = PettyCashAccount::findOrFail($data['petty_cash_account_id']);

        // Sign is derived from the type; adjustments keep the sign the user typed
        // (a negative value reduces the float).
        $magnitude = abs((float) $data['amount']);
        $amount = match ($data['type']) {
            'top_up' => $magnitude,
            'disbursement' => -$magnitude,
            default => (float) $data['amount'],
        };

        DB::transaction(function () use ($account, $data, $amount, $request) {
            PettyCashTransaction::create([
                'petty_cash_account_id' => $account->id,
                'branch_id' => $account->branch_id,   // denormalised from the float
                'type' => $data['type'],
                'amount' => $amount,
                'reference' => $data['reference'] ?? null,
                'description' => $data['description'] ?? null,
                'occurred_on' => $data['occurred_on'] ?? now()->toDateString(),
                'created_by' => $request->user()?->id,
            ]);

            $account->recomputeBalance();
        });

        return back()->with('success', 'Transaction recorded.');
    }

    public function destroyTransaction(int $id): RedirectResponse
    {
        $txn = PettyCashTransaction::findOrFail($id);

        // Auto-mirrored lines must be removed by deleting the document that
        // created them, not here — that keeps the audit trail intact.
        if ($txn->expense_id) {
            return back()->with('error', 'This transaction was created automatically from an expense. Delete the expense to remove it.');
        }

        if ($txn->expense_voucher_id) {
            return back()->with('error', 'This transaction was created automatically from a voucher claim. Reject or delete the voucher to remove it.');
        }

        $accountId = $txn->petty_cash_account_id;

        DB::transaction(function () use ($txn, $accountId) {
            $txn->delete();
            PettyCashAccount::find($accountId)?->recomputeBalance();
        });

        return back()->with('success', 'Transaction deleted.');
    }

    /** Shared validation for account store/update. */
    private function validatedAccount(Request $request): array
    {
        return $request->validate([
            'name' => 'required|string|max:150',
            'branch_id' => 'nullable|exists:branches,id',
            'custodian_name' => 'nullable|string|max:120',
            'opening_balance' => 'nullable|numeric|min:0',
            'is_active' => 'boolean',
            'notes' => 'nullable|string|max:2000',
        ]);
    }

    /** Petty-cash KPIs — across active floats. */
    private function summary(?int $branchId): array
    {
        $monthStart = now()->startOfMonth();
        $monthEnd = now()->endOfMonth();

        return [
            'total_balance' => (float) PettyCashAccount::when($branchId, fn ($q) => $q->where('branch_id', $branchId))->where('is_active', true)->sum('current_balance'),
            'active_funds' => PettyCashAccount::when($branchId, fn ($q) => $q->where('branch_id', $branchId))->where('is_active', true)->count(),
            'disbursed_this_month' => (float) abs((float) PettyCashTransaction::where('amount', '<', 0)
                ->when($branchId, fn ($q) => $q->where('branch_id', $branchId))
                ->whereBetween('occurred_on', [$monthStart, $monthEnd])
                ->sum('amount')),
            'topped_up_this_month' => (float) PettyCashTransaction::where('type', 'top_up')
                ->when($branchId, fn ($q) => $q->where('branch_id', $branchId))
                ->whereBetween('occurred_on', [$monthStart, $monthEnd])
                ->sum('amount'),
        ];
    }
}
