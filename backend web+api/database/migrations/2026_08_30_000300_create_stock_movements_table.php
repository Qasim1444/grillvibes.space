<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Inventory step 3 — the append-only stock ledger.
 *
 * `stock_levels` answers "how much do I have?". This table answers "why?".
 * Every single change to stock writes exactly one row here, and rows are never
 * updated or deleted. `balance_after` snapshots the resulting quantity so the
 * ledger can be replayed and reconciled against `stock_levels` without having
 * to re-derive it.
 *
 * Sign convention: quantity is POSITIVE for stock coming in, NEGATIVE for stock
 * going out. `reference` morphs to whatever caused the movement — a GoodsReceipt
 * for a purchase, an Order for a sale — so any figure can be drilled back to its
 * source document.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('stock_movements')) {
            Schema::create('stock_movements', function (Blueprint $table) {
                $table->id();
                $table->foreignId('branch_id')->constrained('branches')->cascadeOnDelete();
                $table->foreignId('ingredient_id')->constrained('ingredients')->cascadeOnDelete();

                // purchase | sale | sale_reversal | wastage | adjustment | opening_balance
                $table->string('type', 30);

                $table->decimal('quantity', 15, 4);                  // + in / - out
                $table->decimal('unit_cost', 15, 4)->default(0);     // valuation at movement time
                $table->decimal('balance_after', 15, 4)->default(0); // stock_levels.quantity after this row

                // GoodsReceipt, Order, … whatever caused it.
                $table->nullableMorphs('reference');

                $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
                $table->string('note')->nullable();
                $table->timestamps();

                // Ledger replay for one ingredient, in insertion order.
                $table->index(['ingredient_id', 'id']);
                // "What did this outlet consume / receive this period?"
                $table->index(['branch_id', 'type', 'created_at']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
    }
};
