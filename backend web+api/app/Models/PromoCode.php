<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

class PromoCode extends Model
{
    public const FIXED = 'fixed';

    public const PERCENTAGE = 'percentage';

    protected $fillable = [
        'code',
        'description',
        'type',
        'value',
        'max_discount',
        'min_order_amount',
        'starts_at',
        'ends_at',
        'usage_limit',
        'usage_limit_per_customer',
        'used_count',
        'is_active',
    ];

    protected $casts = [
        'value' => 'decimal:2',
        'max_discount' => 'decimal:2',
        'min_order_amount' => 'decimal:2',
        'starts_at' => 'date',
        'ends_at' => 'date',
        'usage_limit' => 'integer',
        'usage_limit_per_customer' => 'integer',
        'used_count' => 'integer',
        'is_active' => 'boolean',
    ];

    public function redemptions(): HasMany
    {
        return $this->hasMany(PromoRedemption::class);
    }

    /** Codes are typed by hand, so they are stored and matched upper-cased. */
    public function setCodeAttribute(?string $value): void
    {
        $this->attributes['code'] = strtoupper(trim((string) $value));
    }

    public function hasStarted(): bool
    {
        return $this->starts_at === null || Carbon::parse($this->starts_at)->startOfDay()->lte(now());
    }

    public function hasExpired(): bool
    {
        return $this->ends_at !== null && Carbon::parse($this->ends_at)->endOfDay()->lt(now());
    }

    public function isExhausted(): bool
    {
        return $this->usage_limit !== null && $this->used_count >= $this->usage_limit;
    }

    /** Live enough to appear as usable in the admin list. */
    public function isUsable(): bool
    {
        return $this->is_active && $this->hasStarted() && ! $this->hasExpired() && ! $this->isExhausted();
    }

    /**
     * Discount this code produces on `$subtotal`, capped by `max_discount` and
     * never more than the bill itself.
     */
    public function discountFor(float $subtotal): float
    {
        $raw = $this->type === self::PERCENTAGE
            ? $subtotal * ((float) $this->value / 100)
            : (float) $this->value;

        if ($this->max_discount !== null) {
            $raw = min($raw, (float) $this->max_discount);
        }

        return round(min($raw, $subtotal), 2);
    }
}
