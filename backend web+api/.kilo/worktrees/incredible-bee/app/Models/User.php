<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Traits\HasPermissions;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * Doubles as the employee master: HR columns live here rather than in a separate
 * `employees` table. `is_employee` separates payroll staff from plain admin
 * logins, and `email`/`password` are nullable so non-login staff can exist.
 */
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, HasPermissions, Notifiable;

    public const EMPLOYMENT_STATUSES = ['active', 'inactive', 'left'];

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'address',
        'password',
        'otp',
        // Employee (HR) attributes
        'employee_code',
        'is_employee',
        'designation_id',
        'place_id',
        'joining_date',
        'leaving_date',
        'employment_status',
        'cnic',
        'gender',
        'date_of_birth',
        'basic_salary',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_employee' => 'boolean',
            'joining_date' => 'date',
            'leaving_date' => 'date',
            'date_of_birth' => 'date',
            'basic_salary' => 'decimal:2',
        ];
    }

    // ── Employee scopes ──────────────────────────────────────────────────────

    /** Rows that represent staff, whether or not they can log in. */
    public function scopeEmployees(Builder $query): Builder
    {
        return $query->where('is_employee', true);
    }

    /** Employees eligible for payroll in the given month. */
    public function scopePayable(Builder $query): Builder
    {
        return $query->where('is_employee', true)->where('employment_status', 'active');
    }

    // ── HR relations ─────────────────────────────────────────────────────────

    public function designation(): BelongsTo
    {
        return $this->belongsTo(Designation::class);
    }

    public function place(): BelongsTo
    {
        return $this->belongsTo(Place::class);
    }

    public function branches(): BelongsToMany
    {
        return $this->belongsToMany(Branch::class);
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    public function leaves(): HasMany
    {
        return $this->hasMany(Leave::class);
    }

    public function overtimes(): HasMany
    {
        return $this->hasMany(Overtime::class);
    }

    public function loans(): HasMany
    {
        return $this->hasMany(Loan::class);
    }

    public function deductions(): HasMany
    {
        return $this->hasMany(Deduction::class);
    }

    public function payslips(): HasMany
    {
        return $this->hasMany(Payslip::class);
    }
}
