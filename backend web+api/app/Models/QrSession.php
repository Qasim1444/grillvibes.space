<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class QrSession extends Model
{
    protected $fillable = [
        'session_token', 'qr_code_id', 'branch_id', 'place_id', 'dining_table_id',
        'guest_name', 'guest_phone', 'cart', 'order_id',
        'status', 'expires_at',
    ];

    protected $casts = [
        'cart' => 'array',
        'expires_at' => 'datetime',
    ];

    public const STATUSES = ['active', 'ordered', 'expired'];

    public function qrCode(): BelongsTo
    {
        return $this->belongsTo(QrCode::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function place(): BelongsTo
    {
        return $this->belongsTo(Place::class);
    }

    public function diningTable(): BelongsTo
    {
        return $this->belongsTo(DiningTable::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast() || $this->status === 'expired';
    }

    public static function generateToken(): string
    {
        return Str::random(48);
    }
}
