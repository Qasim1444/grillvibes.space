<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Live stock for one ingredient in one outlet.
 *
 * `average_cost` is the valuation every downstream figure depends on — recipe
 * cost, order COGS, food-cost %, closing stock value. It is written only by a
 * goods receipt, through {@see \App\Services\StockService::receive()}.
 */
class StockLevel extends Model
{
    protected $fillable = [
        'branch_id', 'ingredient_id', 'quantity', 'average_cost',
    ];

    protected $casts = [
        'quantity' => 'decimal:4',
        'average_cost' => 'decimal:4',
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function ingredient()
    {
        return $this->belongsTo(Ingredient::class);
    }

    /** What the quantity on hand is worth. */
    public function value(): float
    {
        return round((float) $this->quantity * (float) $this->average_cost, 2);
    }

    /** At or below the ingredient's reorder threshold. */
    public function needsReorder(): bool
    {
        return (float) $this->quantity <= (float) ($this->ingredient->reorder_level ?? 0);
    }
}
