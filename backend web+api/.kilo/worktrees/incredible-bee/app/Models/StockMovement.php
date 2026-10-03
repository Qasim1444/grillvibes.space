<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * One immutable line in the stock ledger.
 *
 * Rows are appended, never updated or deleted: this is the audit trail that
 * explains why {@see StockLevel::$quantity} is what it is. `quantity` is positive
 * for stock in, negative for stock out, and `reference` morphs to the document
 * that caused it (a {@see GoodsReceipt}, an {@see Order}, …).
 */
class StockMovement extends Model
{
    public const TYPE_PURCHASE = 'purchase';
    public const TYPE_SALE = 'sale';
    public const TYPE_SALE_REVERSAL = 'sale_reversal';
    public const TYPE_WASTAGE = 'wastage';
    public const TYPE_ADJUSTMENT = 'adjustment';
    public const TYPE_OPENING_BALANCE = 'opening_balance';

    protected $fillable = [
        'branch_id', 'ingredient_id', 'type', 'quantity', 'unit_cost',
        'balance_after', 'reference_type', 'reference_id', 'created_by', 'note',
    ];

    protected $casts = [
        'quantity' => 'decimal:4',
        'unit_cost' => 'decimal:4',
        'balance_after' => 'decimal:4',
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function ingredient()
    {
        return $this->belongsTo(Ingredient::class);
    }

    public function reference()
    {
        return $this->morphTo();
    }

    /** Signed money impact of this movement. */
    public function value(): float
    {
        return round((float) $this->quantity * (float) $this->unit_cost, 2);
    }
}
