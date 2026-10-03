<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * A raw material that recipes consume and procurement buys.
 *
 * Master data only — carries no quantity and no cost. Stock is per-outlet and
 * lives in {@see StockLevel}, reachable via {@see stockAt()}.
 */
class Ingredient extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name', 'sku', 'unit', 'reorder_level', 'is_active', 'notes',
    ];

    protected $casts = [
        'reorder_level' => 'decimal:4',
        'is_active' => 'boolean',
    ];

    public function stockLevels()
    {
        return $this->hasMany(StockLevel::class);
    }

    public function movements()
    {
        return $this->hasMany(StockMovement::class);
    }

    /** Recipe lines that consume this ingredient — i.e. "which dishes use it?". */
    public function recipeItems()
    {
        return $this->hasMany(RecipeItem::class);
    }

    /**
     * The stock row for one outlet, created on first touch so callers never have
     * to null-check. This is the single entry point for reading or writing stock.
     */
    public function stockAt(int $branchId): StockLevel
    {
        return $this->stockLevels()->firstOrCreate(
            ['branch_id' => $branchId],
            ['quantity' => 0, 'average_cost' => 0],
        );
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
