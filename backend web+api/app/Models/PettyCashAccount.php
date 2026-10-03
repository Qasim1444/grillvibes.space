<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * A petty-cash float held by a custodian at an outlet. The balance is a
 * maintained mirror of {@see recomputeBalance()} = opening_balance plus the
 * signed sum of its transactions, so the ledger and the headline figure can
 * never drift.
 */
class PettyCashAccount extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name', 'branch_id', 'custodian_name', 'opening_balance',
        'current_balance', 'is_active', 'notes',
    ];

    protected $casts = [
        'opening_balance' => 'decimal:2',
        'current_balance' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(PettyCashTransaction::class);
    }

    /**
     * Rebuild the running balance from opening_balance + signed transactions,
     * re-stamping each line's balance_after in chronological order. Called after
     * any transaction is posted, edited or reversed so the float never drifts.
     */
    public function recomputeBalance(): void
    {
        $running = (float) $this->opening_balance;

        foreach ($this->transactions()->orderBy('id')->get() as $txn) {
            $running += (float) $txn->amount;
            $txn->update(['balance_after' => $running]);
        }

        $this->current_balance = $running;
        $this->save();
    }
}
