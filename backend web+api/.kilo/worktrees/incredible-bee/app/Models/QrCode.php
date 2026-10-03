<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class QrCode extends Model
{
    protected $fillable = [
        'slug', 'branch_id', 'place_id', 'dining_table_id',
        'label', 'is_active', 'scan_count', 'last_scanned_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'last_scanned_at' => 'datetime',
    ];

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

    public function sessions(): HasMany
    {
        return $this->hasMany(QrSession::class);
    }

    /** Generate a cryptographically random URL-safe slug. */
    public static function generateSlug(): string
    {
        do {
            $slug = Str::random(12);
        } while (static::where('slug', $slug)->exists());

        return $slug;
    }

    /** Full public URL for this QR code. */
    public function menuUrl(): string
    {
        return url('/menu/'.$this->slug);
    }
}
