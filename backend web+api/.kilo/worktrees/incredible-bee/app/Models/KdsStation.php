<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class KdsStation extends Model
{
    protected $fillable = [
        'name', 'branch_id', 'color', 'description',
        'category_ids', 'is_active', 'sort_order',
    ];

    protected $casts = [
        'category_ids' => 'array',
        'is_active' => 'boolean',
    ];

    public const KDS_STATUSES = ['new', 'sent', 'preparing', 'ready', 'bumped', 'recalled'];

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    /**
     * Active order items currently on this station's board.
     * Excludes bumped/recalled so the board only shows live tickets.
     */
    public function liveItems(): HasMany
    {
        return $this->hasMany(OrderItem::class, 'kds_station_id')
            ->whereNotIn('kds_status', ['bumped', 'recalled'])
            ->whereNull('order_items.deleted_at');
    }

    /**
     * Auto-assign a station to an order item based on the item's food category.
     * Called from OrderController::syncItems after KDS columns are added.
     */
    public static function resolveForItem(OrderItem $item): ?self
    {
        return static::where('is_active', true)
            ->when($item->order?->branch_id, fn ($q, $branchId) => $q->where(function ($sq) use ($branchId) {
                $sq->where('branch_id', $branchId)->orWhereNull('branch_id');
            }))
            ->get()
            ->first(function (self $station) use ($item) {
                $cats = $station->category_ids ?? [];

                return empty($cats) || in_array((int) $item->category_id, array_map('intval', $cats));
            });
    }
}
