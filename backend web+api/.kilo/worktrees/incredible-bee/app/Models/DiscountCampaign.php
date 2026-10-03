<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * A standing discount that applies without a code — the POS shows whichever
 * matching campaign has the highest `priority`.
 */
class DiscountCampaign extends Model
{
    public const FIXED = 'fixed';

    public const PERCENTAGE = 'percentage';

    protected $fillable = [
        'name',
        'type',
        'value',
        'max_discount',
        'min_order_amount',
        'applies_to',
        'target_ids',
        'order_types',
        'starts_at',
        'ends_at',
        'is_active',
        'priority',
    ];

    protected $casts = [
        'value' => 'decimal:2',
        'max_discount' => 'decimal:2',
        'min_order_amount' => 'decimal:2',
        'target_ids' => 'array',
        'order_types' => 'array',
        'starts_at' => 'date',
        'ends_at' => 'date',
        'is_active' => 'boolean',
        'priority' => 'integer',
    ];

    /** Active today, ordered so the first row wins. */
    public function scopeLive(Builder $query): Builder
    {
        $today = now()->toDateString();

        return $query->where('is_active', true)
            ->where(fn ($q) => $q->whereNull('starts_at')->orWhereDate('starts_at', '<=', $today))
            ->where(fn ($q) => $q->whereNull('ends_at')->orWhereDate('ends_at', '>=', $today))
            ->orderByDesc('priority')
            ->orderByDesc('id');
    }

    public function isLive(): bool
    {
        if (! $this->is_active) {
            return false;
        }

        $startsOk = $this->starts_at === null || Carbon::parse($this->starts_at)->startOfDay()->lte(now());
        $endsOk = $this->ends_at === null || Carbon::parse($this->ends_at)->endOfDay()->gte(now());

        return $startsOk && $endsOk;
    }

    /** Whether this campaign covers the given order type (empty list = all). */
    public function coversOrderType(?string $orderType): bool
    {
        $types = $this->order_types ?? [];

        return $types === [] || $orderType === null || in_array($orderType, $types, true);
    }

    public function discountFor(float $subtotal): float
    {
        if ($subtotal < (float) $this->min_order_amount) {
            return 0.0;
        }

        $raw = $this->type === self::PERCENTAGE
            ? $subtotal * ((float) $this->value / 100)
            : (float) $this->value;

        if ($this->max_discount !== null) {
            $raw = min($raw, (float) $this->max_discount);
        }

        return round(min($raw, $subtotal), 2);
    }
}
