<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Expense & petty-cash management.
 *
 *   petty_cash_accounts     — a physical cash float held by a custodian at an
 *                             outlet. current_balance is maintained = opening +
 *                             Σ transactions.
 *   expenses                — money spent (rent, utilities, supplies, repairs…),
 *                             optionally against a vendor, optionally paid out of
 *                             a petty-cash float. Raise → approve/reject.
 *   petty_cash_transactions — the signed sub-ledger for a float: top-ups (+),
 *                             disbursements (−) and adjustments (±). A petty-cash
 *                             expense auto-posts a disbursement here.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('petty_cash_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('branch_id')->nullable()->constrained('branches')->nullOnDelete();
            $table->string('custodian_name', 120)->nullable();
            $table->decimal('opening_balance', 14, 2)->default(0);
            $table->decimal('current_balance', 14, 2)->default(0);   // maintained = opening + Σ transactions
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index('branch_id');
        });

        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->string('expense_number', 50)->unique();          // EXP-YYYYMMDD-XXXX
            $table->foreignId('branch_id')->nullable()->constrained('branches')->nullOnDelete();
            $table->string('category', 40)->default('misc');         // rent|utilities|salaries|supplies|repairs_maintenance|marketing|transport|licenses_fees|bank_charges|misc
            $table->foreignId('vendor_id')->nullable()->constrained('vendors')->nullOnDelete();
            $table->string('payee', 150)->nullable();                // free-text payee when there's no vendor
            $table->date('expense_date');
            $table->decimal('amount', 14, 2)->default(0);
            $table->string('paid_via', 20)->default('cash');         // cash|bank|card|petty_cash
            $table->foreignId('petty_cash_account_id')->nullable()->constrained('petty_cash_accounts')->nullOnDelete();
            $table->string('status', 20)->default('pending');        // pending|approved|rejected
            $table->string('reference', 100)->nullable();
            $table->string('description');
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['status', 'category']);
            $table->index('branch_id');
            $table->index('expense_date');
        });

        Schema::create('petty_cash_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('petty_cash_account_id')->constrained('petty_cash_accounts')->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained('branches')->nullOnDelete();   // denormalised from the account
            $table->string('type', 20);                              // top_up|disbursement|adjustment
            $table->decimal('amount', 14, 2);                        // SIGNED: + money in, − money out
            $table->decimal('balance_after', 14, 2)->default(0);     // running float balance after this line
            $table->foreignId('expense_id')->nullable()->constrained('expenses')->nullOnDelete();  // set when mirroring a petty-cash expense
            $table->string('reference', 100)->nullable();
            $table->string('description')->nullable();
            $table->date('occurred_on');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
            $table->index('petty_cash_account_id');
            $table->index(['type', 'occurred_on']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('petty_cash_transactions');
        Schema::dropIfExists('expenses');
        Schema::dropIfExists('petty_cash_accounts');
    }
};
