<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Loan extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'amount',
        'installment_amount',
        'outstanding',
        'disbursed_on',
        'status',
        'note',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'installment_amount' => 'decimal:2',
        'outstanding' => 'decimal:2',
        'disbursed_on' => 'date',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function repayments(): HasMany
    {
        return $this->hasMany(LoanRepayment::class);
    }

    /**
     * What this loan takes from a single payroll run — the installment, or the
     * remaining balance when that is smaller (so it never over-collects).
     */
    public function installmentDue(): float
    {
        return (float) min((float) $this->installment_amount, (float) $this->outstanding);
    }
}
