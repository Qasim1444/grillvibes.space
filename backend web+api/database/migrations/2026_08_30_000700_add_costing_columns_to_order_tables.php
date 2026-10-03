<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The sales <-> inventory bridge.
 *
 * Three additive, nullable columns are all it takes to wire the existing order
 * schema into recipe costing. Nothing existing changes shape or meaning, and every
 * order written before this migration simply carries NULLs (= "never costed"),
 * which reports can filter out cleanly.
 *
 *   order_items.cost_price     COGS for the line: quantity * dish cost at sale time.
 *                              Snapshotted, NOT recomputed later — a burger sold in
 *                              January must keep January's beef price even after the
 *                              ingredient's average_cost moves. This is what makes
 *                              historical margin reporting correct.
 *
 *   orders.cogs_total          Sum of the line cost_prices. Denormalised so gross
 *                              margin (grand_total - cogs_total) is one query with
 *                              no join.
 *
 *   orders.stock_consumed_at   The idempotency guard. Set once, when ingredients have
 *                              been deducted for this order. Its presence is what
 *                              stops a retried request, a double-submit or a re-save
 *                              from draining the store room twice.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('order_items', 'cost_price')) {
            Schema::table('order_items', function (Blueprint $table) {
                $table->decimal('cost_price', 15, 4)->nullable()->after('quantity');
            });
        }

        Schema::table('orders', function (Blueprint $table) {
            if (! Schema::hasColumn('orders', 'cogs_total')) {
                $table->decimal('cogs_total', 15, 2)->nullable()->after('grand_total');
            }

            if (! Schema::hasColumn('orders', 'stock_consumed_at')) {
                $table->timestamp('stock_consumed_at')->nullable()->after('grand_total');
            }
        });
    }

    public function down(): void
    {
        if (Schema::hasColumn('order_items', 'cost_price')) {
            Schema::table('order_items', fn (Blueprint $t) => $t->dropColumn('cost_price'));
        }

        foreach (['cogs_total', 'stock_consumed_at'] as $column) {
            if (Schema::hasColumn('orders', $column)) {
                Schema::table('orders', fn (Blueprint $t) => $t->dropColumn($column));
            }
        }
    }
};
