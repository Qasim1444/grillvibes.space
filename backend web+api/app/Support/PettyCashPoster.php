<?php

namespace App\Support;

use App\Models\Expense;
use App\Models\ExpenseVoucher;
use App\Models\PettyCashAccount;
use App\Models\PettyCashTransaction;

/**
 * Keeps the petty-cash sub-ledger in step with the documents that spend from it.
 *
 * Two document types cut a float: an {@see Expense} paid directly from it, and an
 * {@see ExpenseVoucher} claim that settles a batch of expenses out of it. They
 * must never both cut for the same spend, so this class owns the single
 * invariant that makes that safe:
 *
 *   > Exactly one petty-cash line exists per unit of spend. An expense posts its
 *   > own line only while it is not on a voucher; a voucher posts exactly one
 *   > line for its total.
 *
 * Both entry points are idempotent: prior mirror lines for the document are
 * force-deleted, fresh ones are posted if applicable, then every touched float
 * is re-rolled through {@see PettyCashAccount::recomputeBalance()}. Safe to call
 * on store, update, reject and delete alike.
 */
final class PettyCashPoster
{
    /**
     * Re-post one expense's own mirror line. Posts nothing while the expense
     * sits on a voucher — the voucher's combined line covers it.
     */
    public static function syncExpense(Expense $expense, ?int $userId): void
    {
        self::recompute(self::postExpense($expense, $userId));
    }

    /**
     * Re-post a voucher's single combined line, then re-sync every expense it
     * currently claims plus any it just released (so a released expense gets its
     * own line back). Floats are recomputed once, after all lines have moved.
     *
     * @param  array<int, int>  $releasedExpenseIds  expenses detached by this same edit
     */
    public static function syncVoucher(ExpenseVoucher $voucher, ?int $userId, array $releasedExpenseIds = []): void
    {
        $affected = self::clearMirrors('expense_voucher_id', $voucher->id);

        if ($voucher->cutsPettyCash()) {
            PettyCashTransaction::create([
                'petty_cash_account_id' => $voucher->petty_cash_account_id,
                'branch_id' => $voucher->branch_id,
                'type' => 'disbursement',
                'amount' => -abs((float) $voucher->amount),   // money out of the box
                'expense_voucher_id' => $voucher->id,
                'reference' => $voucher->voucher_number,
                'description' => 'Voucher claim: '.$voucher->purpose,
                'occurred_on' => $voucher->voucher_date?->toDateString() ?? now()->toDateString(),
                'created_by' => $userId,
            ]);
            $affected[] = $voucher->petty_cash_account_id;
        }

        // Claimed expenses must drop their own lines; released ones regain them.
        $ids = array_unique(array_merge(
            $voucher->expenses()->pluck('id')->all(),
            array_filter($releasedExpenseIds)
        ));

        foreach (Expense::whereIn('id', $ids)->get() as $expense) {
            $affected = array_merge($affected, self::postExpense($expense, $userId));
        }

        self::recompute($affected);
    }

    /**
     * Drop then re-post an expense's own line, without recomputing.
     *
     * @return array<int, int|null>  floats this touched
     */
    private static function postExpense(Expense $expense, ?int $userId): array
    {
        $affected = self::clearMirrors('expense_id', $expense->id);

        if ($expense->postsOwnPettyCashLine()) {
            PettyCashTransaction::create([
                'petty_cash_account_id' => $expense->petty_cash_account_id,
                'branch_id' => $expense->branch_id,
                'type' => 'disbursement',
                'amount' => -abs((float) $expense->amount),   // money out of the box
                'expense_id' => $expense->id,
                'reference' => $expense->expense_number,
                'description' => 'Expense: '.$expense->description,
                'occurred_on' => $expense->expense_date?->toDateString() ?? now()->toDateString(),
                'created_by' => $userId,
            ]);
            $affected[] = $expense->petty_cash_account_id;
        }

        return $affected;
    }

    /**
     * Force-delete every mirror line tied to one document, returning the floats
     * they sat on so the caller can re-roll them.
     *
     * @return array<int, int|null>
     */
    private static function clearMirrors(string $column, int $id): array
    {
        $affected = PettyCashTransaction::where($column, $id)
            ->pluck('petty_cash_account_id')->all();

        PettyCashTransaction::where($column, $id)->forceDelete();

        return $affected;
    }

    /** @param  array<int, int|null>  $accountIds */
    private static function recompute(array $accountIds): void
    {
        foreach (array_unique(array_filter($accountIds)) as $accountId) {
            PettyCashAccount::find($accountId)?->recomputeBalance();
        }
    }
}
