<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Procurement step 2 — goods receipts (GRN).
 *
 * This is the ONLY document that adds stock and the ONLY document that changes
 * what an ingredient is worth. Posting a receipt does three things per line,
 * inside one transaction:
 *
 *   1. recomputes stock_levels.average_cost via the moving-average formula
 *   2. increases stock_levels.quantity
 *   3. writes a `purchase` row to stock_movements
 *
 * `purchase_order_id` is nullable on purpose: real kitchens take ad-hoc deliveries
 * (the cash-and-carry run, the emergency milk) that were never formally ordered.
 * When it IS linked, each line can also point at the specific PO line it fulfils
 * so `received_qty` can be tallied and over-delivery detected.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('goods_receipts')) {
            Schema::create('goods_receipts', function (Blueprint $table) {
                $table->id();

                // The outlet receiving the goods — stock lands against this branch.
                $table->foreignId('branch_id')->constrained('branches')->cascadeOnDelete();
                $table->foreignId('vendor_id')->constrained('vendors')->restrictOnDelete();

                // Null for an ad-hoc delivery with no preceding purchase order.
                $table->foreignId('purchase_order_id')->nullable()->constrained('purchase_orders')->nullOnDelete();

                $table->string('grn_number', 50)->unique();
                $table->string('invoice_number', 50)->nullable(); // the vendor's own document
                $table->date('received_at');

                $table->decimal('total', 15, 2)->default(0); // sum of line_total
                $table->text('notes')->nullable();

                $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamps();
                $table->softDeletes();

                $table->index(['branch_id', 'received_at']);
            });
        }

        if (! Schema::hasTable('goods_receipt_items')) {
            Schema::create('goods_receipt_items', function (Blueprint $table) {
                $table->id();
                $table->foreignId('goods_receipt_id')->constrained('goods_receipts')->cascadeOnDelete();
                $table->foreignId('ingredient_id')->constrained('ingredients')->restrictOnDelete();

                // Which PO line this fulfils, when the receipt came from a PO.
                $table->foreignId('purchase_order_item_id')->nullable()
                    ->constrained('purchase_order_items')->nullOnDelete();

                $table->decimal('quantity', 15, 4);  // actually delivered
                $table->decimal('unit_cost', 15, 4); // actually invoiced — may differ from the PO
                $table->decimal('line_total', 15, 2)->default(0);

                $table->timestamps();

                $table->index('ingredient_id');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('goods_receipt_items');
        Schema::dropIfExists('goods_receipts');
    }
};
