<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Reservation extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'dining_table_id', 'branch_id', 'place_id', 'customer_id',
        'guest_name', 'guest_phone', 'guest_email',
        'party_size', 'reserved_at', 'duration_minutes',
        'status', 'occasion', 'notes', 'source', 'created_by',
    ];

    protected $casts = [
        'reserved_at' => 'datetime',
    ];

    public const STATUSES = ['pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show'];

    public const SOURCES = ['walk_in', 'phone', 'online', 'qr'];

    public function diningTable(): BelongsTo
    {
        return $this->belongsTo(DiningTable::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function place(): BelongsTo
    {
        return $this->belongsTo(Place::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /** Compute when the booking window ends. */
    public function endsAt(): Carbon
    {
        return $this->reserved_at->addMinutes($this->duration_minutes);
    }
}
