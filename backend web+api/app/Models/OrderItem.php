<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class OrderItem extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = [];

    protected $casts = [
        'kds_sent_at'   => 'datetime',
        'kds_bumped_at' => 'datetime',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function foodCategory()
    {
        return $this->belongsTo(FoodCategory::class, 'category_id', 'id');
    }

    public function item()
    {
        return $this->belongsTo(FoodItem::class, 'fooditems_id', 'id');
    }

    public function kdsStation()
    {
        return $this->belongsTo(\App\Models\KdsStation::class, 'kds_station_id');
    }

    /** Seconds elapsed since the item was sent to the kitchen. */
    public function ageSeconds(): int
    {
        if (! $this->kds_sent_at) {
            return 0;
        }

        return (int) $this->kds_sent_at->diffInSeconds(now());
    }
}
