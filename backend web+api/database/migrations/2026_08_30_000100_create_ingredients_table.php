<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Inventory step 1 — the raw-material master.
 *
 * An "ingredient" is anything a recipe consumes and procurement buys: flour,
 * chicken, cooking oil, a takeaway box. It is deliberately NOT a `food_items`
 * row — `food_items` is the sellable menu dish, this is what the dish is made
 * of. The two are joined by `recipe_items`.
 *
 * This table holds master data only: no quantities and no money. Stock is
 * per-outlet and lives in `stock_levels`, because the same ingredient can be
 * plentiful in one branch and out in another.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('ingredients')) {
            Schema::create('ingredients', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('sku', 60)->nullable()->unique();

                // Stock-keeping unit of measure. Recipe quantities and purchase
                // quantities are both expressed in this unit, so there is never
                // a conversion to get wrong: buy in kg, cost in kg, cook in kg.
                $table->string('unit', 20)->default('unit'); // kg, g, litre, ml, pcs, box

                // Purchase-suggestion threshold. A branch whose stock_levels.quantity
                // falls to or below this is surfaced as "needs reordering".
                $table->decimal('reorder_level', 15, 4)->default(0);

                $table->boolean('is_active')->default(true);
                $table->text('notes')->nullable();
                $table->timestamps();
                $table->softDeletes();

                $table->index('is_active');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('ingredients');
    }
};
