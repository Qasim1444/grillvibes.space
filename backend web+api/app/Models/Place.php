<?php

namespace App\Models;

use Database\Factories\PlaceFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Place extends Model
{
    /** @use HasFactory<PlaceFactory> */
    use HasFactory;

    protected $fillable = [
        'branch_id',
        'name',
        'status',
    ];

    protected $casts = [
        'status' => 'boolean',
    ];

    /** The outlet this seating area belongs to. */
    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }
}
