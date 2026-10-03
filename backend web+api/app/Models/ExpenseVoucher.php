<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * An expense voucher — a reimbursement claim that wraps one or more existing
 * {@see Expense} records and pays the batch out of a single petty-cash float.
 *
 * The claim's lines *are* expenses: `expenses.expense_voucher_id` points back
 * here, so an expense can sit on at most one voucher. `amount` is maintained =
 * Σ claimed expense amounts (see {@see recomputeAmount()}), the same
 * maintained-mirror philosophy as {@see PettyCashAccount::recomputeBalance()}.
 *
 * The float is cut the moment the voucher is created — one combined signed
 * disbursement line, posted by {@see \App\Support\PettyCashPoster}. While an
 * expense is on a voucher it does *not* post its own line, so the float is
 * never hit twice for the same spend.
 */
class ExpenseVoucher extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'voucher_number', 'branch_id', 'petty_cash_account_id',
        'claimant_id', 'claimant_name', 'voucher_date', 'amount', 'status',
        'purpose', 'reference', 'notes', 'rejection_reason',
        'created_by', 'approved_by', 'approved_at',
    ];

    protected $casts = [
        'voucher_date' => 'date',
        'amount' => 'decimal:2',
        'approved_at' => 'datetime',
    ];

    public const STATUSES = ['pending', 'approved', 'rejected'];

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function pettyCashAccount(): BelongsTo
    {
        return $this->belongsTo(PettyCashAccount::class);
    }

    /** Who is being reimbursed — an employee (a `users` row flagged is_employee). */
    public function claimant(): BelongsTo
    {
        return $this->belongsTo(User::class, 'claimant_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /** The expenses this voucher claims — its line items. */
    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class);
    }

    public function pettyCashTransactions(): HasMany
    {
        return $this->hasMany(PettyCashTransaction::class);
    }

    /** True when this voucher should cut its float. Rejected and deleted claims
     *  never do — their money goes back in the box. */
    public function cutsPettyCash(): bool
    {
        return $this->status !== 'rejected'
            && ! $this->trashed()
            && $this->petty_cash_account_id !== null
            && (float) $this->amount > 0;
    }

    /** Re-roll the claim total from the expenses currently attached. */
    public function recomputeAmount(): void
    {
        $this->amount = (float) $this->expenses()->sum('amount');
        $this->save();
    }

    /** Auto-generate voucher number: VCH-YYYYMMDD-XXXX */
    public static function generateVoucherNumber(): string
    {
        $prefix = 'VCH-'.now()->format('Ymd').'-';
        $last = static::withTrashed()->where('voucher_number', 'like', $prefix.'%')
            ->orderByDesc('id')->value('voucher_number');
        $seq = $last ? ((int) substr($last, -4)) + 1 : 1;

        return $prefix.str_pad($seq, 4, '0', STR_PAD_LEFT);
    }
}
