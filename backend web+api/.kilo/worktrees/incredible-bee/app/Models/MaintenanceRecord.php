<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * A single maintenance job against an {@see Asset}: a scheduled preventive
 * service, a corrective repair, an inspection or a calibration. Its lifecycle
 * (scheduled → in_progress → completed / cancelled) drives the asset's own
 * status, and completing it rolls the asset's next service date forward.
 */
class MaintenanceRecord extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'maintenance_number', 'asset_id', 'branch_id', 'type', 'status',
        'scheduled_date', 'completed_date', 'performed_by', 'vendor_id',
        'cost', 'downtime_hours', 'description', 'notes', 'created_by',
    ];

    protected $casts = [
        'scheduled_date' => 'date',
        'completed_date' => 'date',
        'cost' => 'decimal:2',
        'downtime_hours' => 'decimal:2',
    ];

    public const TYPES = ['preventive', 'corrective', 'inspection', 'calibration'];

    public const STATUSES = ['scheduled', 'in_progress', 'completed', 'cancelled'];

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /** Auto-generate maintenance number: MNT-YYYYMMDD-XXXX */
    public static function generateMaintenanceNumber(): string
    {
        $prefix = 'MNT-'.now()->format('Ymd').'-';
        $last = static::withTrashed()->where('maintenance_number', 'like', $prefix.'%')
            ->orderByDesc('id')->value('maintenance_number');
        $seq = $last ? ((int) substr($last, -4)) + 1 : 1;

        return $prefix.str_pad($seq, 4, '0', STR_PAD_LEFT);
    }
}
