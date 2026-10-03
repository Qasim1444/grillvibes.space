<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * A recorded expense — money spent on rent, utilities, supplies, repairs and so
 * on. Optionally tied to a vendor, optionally paid out of a petty-cash float
 * (in which case it mirrors a signed disbursement onto {@see PettyCashTransaction}).
 * Follows a raise → approve/reject flow.
 */
class Expense extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'expense_number', 'branch_id', 'category', 'vendor_id', 'payee',
        'expense_date', 'amount', 'paid_via', 'petty_cash_account_id',
        'expense_voucher_id', 'status', 'reference', 'description', 'notes',
        'created_by', 'approved_by', 'approved_at',
    ];

    protected $casts = [
        'expense_date' => 'date',
        'amount' => 'decimal:2',
        'approved_at' => 'datetime',
    ];

    public const CATEGORIES = [
        'rent', 'utilities', 'salaries', 'supplies', 'repairs_maintenance',
        'marketing', 'transport', 'licenses_fees', 'bank_charges', 'misc',
    ];

    public const PAID_VIA = ['cash', 'bank', 'card', 'petty_cash'];

    public const STATUSES = ['pending', 'approved', 'rejected'];

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function pettyCashAccount(): BelongsTo
    {
        return $this->belongsTo(PettyCashAccount::class);
    }

    public function pettyCashTransactions(): HasMany
    {
        return $this->hasMany(PettyCashTransaction::class);
    }

    /** The claim voucher settling this expense, when it has been claimed. */
    public function voucher(): BelongsTo
    {
        return $this->belongsTo(ExpenseVoucher::class, 'expense_voucher_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /** True when this expense should mirror a disbursement onto a float. */
    public function isPettyCash(): bool
    {
        return $this->paid_via === 'petty_cash' && $this->petty_cash_account_id !== null;
    }

    /** True while this expense should carry its OWN petty-cash line — i.e. it is
     *  paid from a float and is not being settled through a voucher. Once it is
     *  claimed, the voucher posts one combined line for the whole batch instead,
     *  so the float is never deducted twice for the same spend. */
    public function postsOwnPettyCashLine(): bool
    {
        return $this->isPettyCash() && $this->expense_voucher_id === null;
    }

    /** True when a voucher currently owns the money for this expense. */
    public function isClaimed(): bool
    {
        return $this->expense_voucher_id !== null;
    }

    /** Auto-generate expense number: EXP-YYYYMMDD-XXXX */
    public static function generateExpenseNumber(): string
    {
        $prefix = 'EXP-'.now()->format('Ymd').'-';
        $last = static::withTrashed()->where('expense_number', 'like', $prefix.'%')
            ->orderByDesc('id')->value('expense_number');
        $seq = $last ? ((int) substr($last, -4)) + 1 : 1;

        return $prefix.str_pad($seq, 4, '0', STR_PAD_LEFT);
    }
}
