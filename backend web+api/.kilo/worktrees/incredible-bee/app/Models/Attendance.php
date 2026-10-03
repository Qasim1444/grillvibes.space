<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attendance extends Model
{
    use HasFactory;

    /** Statuses that count as a paid working day in the payroll formula. */
    public const PAID_STATUSES = ['present', 'late', 'holiday'];

    public const STATUSES = ['present', 'absent', 'late', 'half_day', 'leave', 'holiday'];

    protected $fillable = [
        'user_id',
        'date',
        'check_in',
        'check_out',
        'check_in_latitude',
        'check_in_longitude',
        'check_in_accuracy',
        'check_in_distance_meters',
        'check_out_latitude',
        'check_out_longitude',
        'check_out_accuracy',
        'check_out_distance_meters',
        'status',
        'worked_minutes',
        'late_minutes',
        'note',
    ];

    protected $casts = [
        'date' => 'date',
        'worked_minutes' => 'integer',
        'late_minutes' => 'integer',
        'check_in_latitude' => 'decimal:7',
        'check_in_longitude' => 'decimal:7',
        'check_in_accuracy' => 'decimal:2',
        'check_in_distance_meters' => 'integer',
        'check_out_latitude' => 'decimal:7',
        'check_out_longitude' => 'decimal:7',
        'check_out_accuracy' => 'decimal:2',
        'check_out_distance_meters' => 'integer',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
