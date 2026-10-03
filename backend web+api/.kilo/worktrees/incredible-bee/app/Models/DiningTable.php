<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DiningTable extends Model
{
    protected $fillable = [
        'branch_id', 'place_id', 'table_number', 'capacity', 'shape',
        'pos_x', 'pos_y', 'status', 'current_order_id', 'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public const STATUSES = ['available', 'occupied', 'reserved', 'cleaning'];

    public const SHAPES = ['rectangle', 'circle', 'square'];

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function place(): BelongsTo
    {
        return $this->belongsTo(Place::class);
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }

    public function currentOrder(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'current_order_id');
    }

    public function isAvailable(): bool
    {
        return $this->status === 'available';
    }
}
