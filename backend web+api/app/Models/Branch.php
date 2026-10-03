<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Branch extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'address',
        'phone',
        'manager_name',
        'status',
        'latitude',
        'longitude',
        'attendance_radius_meters',
        'attendance_start_time',
    ];

    protected $casts = [
        'status' => 'boolean',
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
        'attendance_radius_meters' => 'integer',
    ];

    /** Seating areas that belong to this outlet. */
    public function places(): HasMany
    {
        return $this->hasMany(Place::class);
    }

    /** Sales booked against this outlet. */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class);
    }
}
