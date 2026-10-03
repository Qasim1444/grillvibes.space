<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Turns `users` into the employee master (per the "extend users" decision) and
 * adds the HR tables that hang off it.
 *
 * `email` and `password` become nullable so non-login staff (kitchen, waiters)
 * can exist as employee rows without credentials. The login flow already
 * requires a matching email + password, so a credential-less row cannot sign in.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('designations')) {
            Schema::create('designations', function (Blueprint $table) {
                $table->id();
                $table->string('name')->unique();
                $table->string('description')->nullable();
                $table->timestamps();
            });
        }

        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'employee_code')) {
                $table->string('employee_code')->nullable()->unique()->after('id');
            }
            if (! Schema::hasColumn('users', 'is_employee')) {
                // Distinguishes payroll staff from plain admin logins.
                $table->boolean('is_employee')->default(false)->after('address');
            }
            if (! Schema::hasColumn('users', 'designation_id')) {
                $table->foreignId('designation_id')->nullable()->after('is_employee')
                    ->constrained('designations')->nullOnDelete();
            }
            if (! Schema::hasColumn('users', 'place_id')) {
                $table->unsignedBigInteger('place_id')->nullable()->after('designation_id');
                $table->index('place_id');
            }
            if (! Schema::hasColumn('users', 'joining_date')) {
                $table->date('joining_date')->nullable()->after('place_id');
            }
            if (! Schema::hasColumn('users', 'leaving_date')) {
                $table->date('leaving_date')->nullable()->after('joining_date');
            }
            if (! Schema::hasColumn('users', 'employment_status')) {
                $table->string('employment_status', 20)->default('active')->after('leaving_date');
            }
            if (! Schema::hasColumn('users', 'cnic')) {
                $table->string('cnic', 30)->nullable()->after('employment_status');
            }
            if (! Schema::hasColumn('users', 'gender')) {
                $table->string('gender', 10)->nullable()->after('cnic');
            }
            if (! Schema::hasColumn('users', 'date_of_birth')) {
                $table->date('date_of_birth')->nullable()->after('gender');
            }
            if (! Schema::hasColumn('users', 'basic_salary')) {
                $table->decimal('basic_salary', 12, 2)->default(0)->after('date_of_birth');
            }
        });

        // Nullable credentials for non-login staff. `->change()` is native in
        // Laravel 11+ (no doctrine/dbal) and, unlike a raw `ALTER ... MODIFY`,
        // it also works on the SQLite connection the test suite runs on.
        Schema::table('users', function (Blueprint $table) {
            $table->string('email')->nullable()->change();
            $table->string('password')->nullable()->change();
        });

        if (! Schema::hasTable('attendances')) {
            Schema::create('attendances', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->date('date');
                $table->time('check_in')->nullable();
                $table->time('check_out')->nullable();
                // present | absent | late | half_day | leave | holiday
                $table->string('status', 20)->default('present');
                $table->unsignedInteger('worked_minutes')->default(0);
                $table->unsignedInteger('late_minutes')->default(0);
                $table->string('note')->nullable();
                $table->timestamps();

                // One row per employee per day — the bulk day-sheet upserts on this.
                $table->unique(['user_id', 'date']);
                $table->index('date');
            });
        }

        if (! Schema::hasTable('leave_types')) {
            Schema::create('leave_types', function (Blueprint $table) {
                $table->id();
                $table->string('name')->unique();
                $table->unsignedSmallInteger('days_per_year')->default(0);
                // Unpaid leave days are treated as absent by the payroll formula.
                $table->boolean('is_paid')->default(true);
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('leaves')) {
            Schema::create('leaves', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->foreignId('leave_type_id')->constrained('leave_types')->restrictOnDelete();
                $table->date('from_date');
                $table->date('to_date');
                $table->decimal('days', 5, 1)->default(0);
                $table->string('reason', 500)->nullable();
                // pending | approved | rejected
                $table->string('status', 20)->default('pending');
                $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamp('approved_at')->nullable();
                $table->timestamps();

                $table->index(['user_id', 'from_date']);
                $table->index('status');
            });
        }

        if (! Schema::hasTable('overtimes')) {
            Schema::create('overtimes', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->date('date');
                $table->decimal('hours', 6, 2)->default(0);
                $table->decimal('rate_per_hour', 10, 2)->default(0);
                // Stored rather than derived so a rate change can't rewrite history.
                $table->decimal('amount', 12, 2)->default(0);
                $table->string('status', 20)->default('pending');
                $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamp('approved_at')->nullable();
                $table->string('note')->nullable();
                $table->timestamps();

                $table->index(['user_id', 'date']);
                $table->index('status');
            });
        }

        if (! Schema::hasTable('loans')) {
            Schema::create('loans', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                // loan | advance
                $table->string('type', 20)->default('loan');
                $table->decimal('amount', 12, 2);
                $table->decimal('installment_amount', 12, 2)->default(0);
                // Running balance; decremented when a payroll run is marked paid.
                $table->decimal('outstanding', 12, 2)->default(0);
                $table->date('disbursed_on');
                // active | closed
                $table->string('status', 20)->default('active');
                $table->string('note')->nullable();
                $table->timestamps();

                $table->index(['user_id', 'status']);
            });
        }

        if (! Schema::hasTable('payroll_runs')) {
            Schema::create('payroll_runs', function (Blueprint $table) {
                $table->id();
                // Always the first day of the payroll month.
                $table->date('month')->unique();
                // draft | approved | paid
                $table->string('status', 20)->default('draft');
                $table->decimal('total_gross', 14, 2)->default(0);
                $table->decimal('total_deductions', 14, 2)->default(0);
                $table->decimal('total_net', 14, 2)->default(0);
                $table->foreignId('processed_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamp('approved_at')->nullable();
                $table->timestamp('paid_at')->nullable();
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('payslips')) {
            Schema::create('payslips', function (Blueprint $table) {
                $table->id();
                $table->foreignId('payroll_run_id')->constrained()->cascadeOnDelete();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                $table->decimal('basic', 12, 2)->default(0);
                $table->decimal('allowances', 12, 2)->default(0);
                $table->decimal('overtime_amount', 12, 2)->default(0);
                $table->decimal('deductions_amount', 12, 2)->default(0);
                $table->decimal('loan_deduction', 12, 2)->default(0);
                $table->decimal('gross', 12, 2)->default(0);
                $table->decimal('net', 12, 2)->default(0);
                $table->decimal('present_days', 5, 1)->default(0);
                $table->decimal('absent_days', 5, 1)->default(0);
                $table->decimal('leave_days', 5, 1)->default(0);
                $table->unsignedSmallInteger('payable_days')->default(0);
                // Frozen copy of the inputs so later master-data edits (salary,
                // attendance) can't silently rewrite an issued payslip.
                $table->json('snapshot')->nullable();
                $table->timestamps();

                $table->unique(['payroll_run_id', 'user_id']);
            });
        }

        if (! Schema::hasTable('deductions')) {
            Schema::create('deductions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->cascadeOnDelete();
                // Set once the deduction has been consumed by a run.
                $table->foreignId('payroll_run_id')->nullable()->constrained()->nullOnDelete();
                $table->string('title');
                $table->decimal('amount', 12, 2);
                // Recurring rows apply every month and are never consumed.
                $table->boolean('is_recurring')->default(false);
                $table->date('effective_month')->nullable();
                $table->timestamps();

                $table->index(['user_id', 'is_recurring']);
            });
        }

        if (! Schema::hasTable('loan_repayments')) {
            Schema::create('loan_repayments', function (Blueprint $table) {
                $table->id();
                $table->foreignId('loan_id')->constrained()->cascadeOnDelete();
                $table->foreignId('payroll_run_id')->nullable()->constrained()->nullOnDelete();
                $table->decimal('amount', 12, 2);
                $table->date('paid_on');
                $table->timestamps();

                $table->index('loan_id');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('loan_repayments');
        Schema::dropIfExists('deductions');
        Schema::dropIfExists('payslips');
        Schema::dropIfExists('payroll_runs');
        Schema::dropIfExists('loans');
        Schema::dropIfExists('overtimes');
        Schema::dropIfExists('leaves');
        Schema::dropIfExists('leave_types');
        Schema::dropIfExists('attendances');

        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('designation_id');
            $table->dropColumn([
                'employee_code', 'is_employee', 'place_id', 'joining_date',
                'leaving_date', 'employment_status', 'cnic', 'gender',
                'date_of_birth', 'basic_salary',
            ]);
        });

        Schema::dropIfExists('designations');
    }
};
