<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Procurement step 1 — purchase orders.
 *
 * A PO is an *intent* to buy: it commits nothing to stock and touches no costs.
 * Stock only moves when the goods physically arrive and a goods receipt is posted
 * against this PO. That separation is what makes the ledger trustworthy — an
 * order that never gets delivered can never inflate inventory.
 *
 * `received_qty` on each line is the running tally of what has actually turned up,
 * which is what drives the draft -> ordered -> partially_received -> received
 * status progression and the "what is still outstanding?" report.
 *
 * Vendors already exist as shared master data (also used by Expenses, Assets and
 * Maintenance), so this migration only adds the ordering documents.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('purchase_orders')) {
            Schema::create('purchase_orders', function (Blueprint $table) {
                $table->id();

                // The outlet doing the buying — stock will land here on receipt.
                $table->foreignId('branch_id')->nullable()->constrained('branches')->nullOnDelete();

                // Restrict: a vendor with purchase history must not be hard-deleted.
                $table->foreignId('vendor_id')->constrained('vendors')->restrictOnDelete();

                $table->string('po_number', 50)->unique();

                // draft | ordered | partially_received | received | cancelled
                $table->string('status', 30)->default('draft');

                $table->date('ordered_at')->nullable();
                $table->date('expected_at')->nullable();

                $table->decimal('total', 15, 2)->default(0); // sum of line_total
                $table->text('notes')->nullable();

                $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamps();
                $table->softDeletes();

                $table->index(['branch_id', 'status']);
                $table->index('status');
            });
        }

        if (! Schema::hasTable('purchase_order_items')) {
            Schema::create('purchase_order_items', function (Blueprint $table) {
                $table->id();
                $table->foreignId('purchase_order_id')->constrained('purchase_orders')->cascadeOnDelete();
                $table->foreignId('ingredient_id')->constrained('ingredients')->restrictOnDelete();

                $table->decimal('quantity', 15, 4);            // ordered, in ingredient.unit
                $table->decimal('unit_cost', 15, 4);           // agreed price per unit
                $table->decimal('line_total', 15, 2)->default(0);

                // Running total of what has actually been received against this line.
                // Deliberately NOT unique on ingredient: the same ingredient may be
                // ordered twice at two different agreed prices.
                $table->decimal('received_qty', 15, 4)->default(0);

                $table->timestamps();

                $table->index('ingredient_id');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_order_items');
        Schema::dropIfExists('purchase_orders');
    }
};
