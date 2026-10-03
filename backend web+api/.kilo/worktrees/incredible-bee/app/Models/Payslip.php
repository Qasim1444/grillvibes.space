<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payslip extends Model
{
    use HasFactory;

    protected $fillable = [
        'payroll_run_id',
        'user_id',
        'basic',
        'allowances',
        'overtime_amount',
        'deductions_amount',
        'loan_deduction',
        'gross',
        'net',
        'present_days',
        'absent_days',
        'leave_days',
        'payable_days',
        'snapshot',
    ];

    protected $casts = [
        'basic' => 'decimal:2',
        'allowances' => 'decimal:2',
        'overtime_amount' => 'decimal:2',
        'deductions_amount' => 'decimal:2',
        'loan_deduction' => 'decimal:2',
        'gross' => 'decimal:2',
        'net' => 'decimal:2',
        'present_days' => 'decimal:1',
        'absent_days' => 'decimal:1',
        'leave_days' => 'decimal:1',
        'payable_days' => 'integer',
        'snapshot' => 'array',
    ];

    public function payrollRun(): BelongsTo
    {
        return $this->belongsTo(PayrollRun::class);
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
