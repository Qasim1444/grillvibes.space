<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Expense voucher claims.
 *
 *   expense_vouchers — a reimbursement claim that wraps one or more existing
 *                      expenses and pays the batch out of a single petty-cash
 *                      float. Its `amount` is maintained = Σ claimed expenses.
 *
 * The claim's lines *are* {@see App\Models\Expense} rows: `expenses.expense_voucher_id`
 * points at the voucher that settles it, which enforces "claimed at most once" at
 * the schema level without a pivot table.
 *
 * `petty_cash_transactions.expense_voucher_id` is the exact analogue of the
 * existing `expense_id` column — it makes the single combined disbursement line
 * traceable back to the voucher that cut the float.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expense_vouchers', function (Blueprint $table) {
            $table->id();
            $table->string('voucher_number', 50)->unique();          // VCH-YYYYMMDD-XXXX
            $table->foreignId('branch_id')->nullable()->constrained('branches')->nullOnDelete();
            $table->foreignId('petty_cash_account_id')->constrained('petty_cash_accounts')->cascadeOnDelete();
            $table->foreignId('claimant_id')->nullable()->constrained('users')->nullOnDelete();   // employees live in `users`
            $table->string('claimant_name', 150)->nullable();        // free-text when the claimant isn't a system user
            $table->date('voucher_date');
            $table->decimal('amount', 14, 2)->default(0);            // maintained = Σ claimed expense amounts
            $table->string('status', 20)->default('pending');        // pending|approved|rejected
            $table->string('purpose');
            $table->string('reference', 100)->nullable();
            $table->text('notes')->nullable();
            $table->string('rejection_reason')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['status', 'voucher_date']);
            $table->index('branch_id');
            $table->index('petty_cash_account_id');
        });

        if (! Schema::hasColumn('expenses', 'expense_voucher_id')) {
            Schema::table('expenses', function (Blueprint $table) {
                $table->foreignId('expense_voucher_id')
                    ->nullable()
                    ->after('petty_cash_account_id')
                    ->constrained('expense_vouchers')
                    ->nullOnDelete();
                $table->index('expense_voucher_id');
            });
        }

        if (! Schema::hasColumn('petty_cash_transactions', 'expense_voucher_id')) {
            Schema::table('petty_cash_transactions', function (Blueprint $table) {
                $table->foreignId('expense_voucher_id')
                    ->nullable()
                    ->after('expense_id')
                    ->constrained('expense_vouchers')
                    ->nullOnDelete();
                $table->index('expense_voucher_id');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('petty_cash_transactions', 'expense_voucher_id')) {
            Schema::table('petty_cash_transactions', function (Blueprint $table) {
                $table->dropForeign(['expense_voucher_id']);
                $table->dropColumn('expense_voucher_id');
            });
        }

        if (Schema::hasColumn('expenses', 'expense_voucher_id')) {
            Schema::table('expenses', function (Blueprint $table) {
                $table->dropForeign(['expense_voucher_id']);
                $table->dropColumn('expense_voucher_id');
            });
        }

        Schema::dropIfExists('expense_vouchers');
    }
};
