<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * One line of the append-only points ledger. Rows are never updated or deleted —
 * a mistake is corrected by writing an `adjust` row, which keeps the running
 * `balance_after` trail intact.
 */
class LoyaltyTransaction extends Model
{
    public const EARN = 'earn';

    public const REDEEM = 'redeem';

    public const ADJUST = 'adjust';

    public const EXPIRE = 'expire';

    protected $fillable = [
        'customer_id',
        'order_id',
        'type',
        'points',
        'balance_after',
        'points_remaining',
        'note',
        'created_by',
        'expires_at',
    ];

    protected $casts = [
        'points' => 'integer',
        'balance_after' => 'integer',
        'points_remaining' => 'integer',
        'expires_at' => 'date',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
