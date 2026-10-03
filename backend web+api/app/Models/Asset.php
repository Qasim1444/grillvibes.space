<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * A physical asset / piece of equipment in the register (oven, fridge, POS
 * terminal, furniture…). Scoped to the outlet it lives at. Preventive
 * scheduling is folded in: {@see $maintenance_interval_days} +
 * {@see $next_maintenance_date} drive the "due for service" list, and the
 * dates are rolled forward automatically when a maintenance record completes.
 */
class Asset extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'asset_code', 'name', 'category', 'branch_id', 'location',
        'serial_number', 'vendor_id', 'purchase_date', 'purchase_cost',
        'warranty_expiry', 'status', 'maintenance_interval_days',
        'last_maintenance_date', 'next_maintenance_date', 'notes',
    ];

    protected $casts = [
        'purchase_date' => 'date',
        'warranty_expiry' => 'date',
        'last_maintenance_date' => 'date',
        'next_maintenance_date' => 'date',
        'purchase_cost' => 'decimal:2',
        'maintenance_interval_days' => 'integer',
    ];

    public const CATEGORIES = [
        'kitchen_equipment', 'refrigeration', 'hvac', 'pos_hardware',
        'furniture', 'vehicle', 'utility', 'other',
    ];

    public const STATUSES = ['active', 'service_due', 'under_maintenance', 'retired', 'disposed'];

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function maintenanceRecords(): HasMany
    {
        return $this->hasMany(MaintenanceRecord::class);
    }

    /**
     * Assets needing service: either manually flagged with the `service_due`
     * status, or past their computed next-service date. Retired/disposed assets
     * are excluded. Drives the "Service Due" KPI and the due filter alike.
     */
    public function scopeServiceDue(Builder $query): Builder
    {
        return $query->whereNotIn('status', ['retired', 'disposed'])
            ->where(fn (Builder $q) => $q
                ->where('status', 'service_due')
                ->orWhere(fn (Builder $w) => $w
                    ->whereNotNull('next_maintenance_date')
                    ->whereDate('next_maintenance_date', '<=', now())));
    }

    /** Auto-generate asset code: AST-YYYYMMDD-XXXX */
    public static function generateAssetCode(): string
    {
        $prefix = 'AST-'.now()->format('Ymd').'-';
        $last = static::withTrashed()->where('asset_code', 'like', $prefix.'%')
            ->orderByDesc('id')->value('asset_code');
        $seq = $last ? ((int) substr($last, -4)) + 1 : 1;

        return $prefix.str_pad($seq, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Recompute the next preventive service date from an anchor (last service,
     * else purchase date, else today) plus the interval. Null when no interval
     * is configured — the asset simply never surfaces as "due".
     */
    public function computeNextMaintenanceDate(): ?string
    {
        if (! $this->maintenance_interval_days) {
            return null;
        }

        $anchor = $this->last_maintenance_date
            ?? $this->purchase_date
            ?? now();

        return Carbon::parse($anchor)->addDays($this->maintenance_interval_days)->toDateString();
    }

    /** Preventive service is due (or overdue) as of today. */
    public function isMaintenanceDue(): bool
    {
        return $this->next_maintenance_date !== null
            && ! $this->next_maintenance_date->isFuture();
    }

    /** Warranty lapses within the given window (default 30 days). */
    public function isWarrantyExpiring(int $days = 30): bool
    {
        return $this->warranty_expiry !== null
            && $this->warranty_expiry->isBetween(now()->startOfDay(), now()->addDays($days)->endOfDay());
    }
}
