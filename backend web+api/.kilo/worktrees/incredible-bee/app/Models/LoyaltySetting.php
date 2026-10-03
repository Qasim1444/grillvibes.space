<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Single-row configuration for the loyalty programme. `current()` guarantees a
 * row exists so callers never have to null-check the settings.
 */
class LoyaltySetting extends Model
{
    protected $fillable = [
        'is_active',
        'points_per_currency',
        'currency_per_point',
        'min_redeem_points',
        'max_redeem_percent',
        'points_expiry_days',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'points_per_currency' => 'decimal:4',
        'currency_per_point' => 'decimal:4',
        'min_redeem_points' => 'integer',
        'max_redeem_percent' => 'integer',
        'points_expiry_days' => 'integer',
    ];

    public static function current(): self
    {
        return static::query()->firstOrCreate([], []);
    }
}
