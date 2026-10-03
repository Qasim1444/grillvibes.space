<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WaitlistEntry extends Model
{
    protected $fillable = [
        'branch_id', 'place_id', 'guest_name', 'guest_phone', 'party_size',
        'customer_id', 'status', 'checked_in_at', 'notified_at',
        'seated_at', 'estimated_wait_minutes', 'notes', 'created_by',
    ];

    protected $casts = [
        'checked_in_at' => 'datetime',
        'notified_at' => 'datetime',
        'seated_at' => 'datetime',
    ];

    public const STATUSES = ['waiting', 'seated', 'left', 'expired'];

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

    /** Minutes waiting since check-in. */
    public function waitMinutes(): int
    {
        return (int) $this->checked_in_at->diffInMinutes(now());
    }
}
