<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Inventory step 2 — live stock, per outlet.
 *
 * One row per (branch, ingredient). Two numbers matter:
 *
 *   quantity     — how much is on hand, in the ingredient's unit.
 *   average_cost — what ONE unit is currently worth (moving average).
 *
 * `average_cost` is the number every downstream cost figure is built on: recipe
 * cost, order COGS, food-cost %, closing stock value. It is only ever written by
 * a goods receipt, using the moving-average formula:
 *
 *   new_avg = (old_qty * old_avg + received_qty * received_cost)
 *             / (old_qty + received_qty)
 *
 * Moving average (rather than FIFO/lot tracking) is the usual restaurant choice:
 * supplier prices drift constantly and you want one blended cost per ingredient
 * rather than chasing individual delivery batches.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('stock_levels')) {
            Schema::create('stock_levels', function (Blueprint $table) {
                $table->id();
                $table->foreignId('branch_id')->constrained('branches')->cascadeOnDelete();
                $table->foreignId('ingredient_id')->constrained('ingredients')->cascadeOnDelete();

                $table->decimal('quantity', 15, 4)->default(0);
                $table->decimal('average_cost', 15, 4)->default(0);

                $table->timestamps();

                // One stock row per ingredient per outlet — this is what makes
                // firstOrCreate() safe as the upsert entry point.
                $table->unique(['branch_id', 'ingredient_id']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_levels');
    }
};
