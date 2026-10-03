<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PayrollRun extends Model
{
    use HasFactory;

    public const DRAFT = 'draft';

    public const APPROVED = 'approved';

    public const PAID = 'paid';

    protected $fillable = [
        'month',
        'status',
        'total_gross',
        'total_deductions',
        'total_net',
        'processed_by',
        'approved_at',
        'paid_at',
    ];

    protected $casts = [
        'month' => 'date',
        'total_gross' => 'decimal:2',
        'total_deductions' => 'decimal:2',
        'total_net' => 'decimal:2',
        'approved_at' => 'datetime',
        'paid_at' => 'datetime',
    ];

    public function payslips(): HasMany
    {
        return $this->hasMany(Payslip::class);
    }

    public function processor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    /** Only a draft may be regenerated or deleted; issued runs are immutable. */
    public function isEditable(): bool
    {
        return $this->status === self::DRAFT;
    }
}
