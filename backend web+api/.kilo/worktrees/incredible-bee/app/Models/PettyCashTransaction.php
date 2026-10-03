<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * One signed line in a petty-cash float's sub-ledger:
 *   top_up       (+) — money added to the box
 *   disbursement (−) — money paid out (often mirroring a petty-cash expense)
 *   adjustment   (±) — a manual correction, signed as entered
 * balance_after holds the running float balance after this line is applied.
 */
class PettyCashTransaction extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'petty_cash_account_id', 'branch_id', 'type', 'amount', 'balance_after',
        'expense_id', 'expense_voucher_id', 'reference', 'description',
        'occurred_on', 'created_by',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'balance_after' => 'decimal:2',
        'occurred_on' => 'date',
    ];

    public const TYPES = ['top_up', 'disbursement', 'adjustment'];

    public function account(): BelongsTo
    {
        return $this->belongsTo(PettyCashAccount::class, 'petty_cash_account_id');
    }

    public function expense(): BelongsTo
    {
        return $this->belongsTo(Expense::class);
    }

    /** Set on the single combined line a voucher claim posts. */
    public function voucher(): BelongsTo
    {
        return $this->belongsTo(ExpenseVoucher::class, 'expense_voucher_id');
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
