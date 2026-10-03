<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Recipe step 1 — the bill of materials that links the menu to the store room.
 *
 * This is the single join between the existing sales schema and the new inventory
 * schema: `food_items` (a sellable dish) --< recipe_items >-- `ingredients`.
 *
 * `quantity` is the amount consumed by ONE portion of the dish, expressed in the
 * ingredient's own `unit`. So a burger might be:
 *
 *   food_item "Beef Burger"  ->  bun     x 1     (pcs)
 *                            ->  patty   x 0.15  (kg)
 *                            ->  cheese  x 0.02  (kg)
 *
 * Selling 3 burgers therefore issues 3 buns, 0.45 kg patty and 0.06 kg cheese.
 * The dish cost is never stored on the dish — it is derived on demand from the
 * current `stock_levels.average_cost` of each ingredient, so a change in supplier
 * price is reflected in the food-cost % immediately.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('recipe_items')) {
            Schema::create('recipe_items', function (Blueprint $table) {
                $table->id();

                // The sellable dish. Cascade: deleting a dish removes its recipe.
                $table->foreignId('food_item_id')->constrained('food_items')->cascadeOnDelete();

                // The raw material. Restrict: an ingredient in use by a live recipe
                // must not disappear underneath a costing calculation.
                $table->foreignId('ingredient_id')->constrained('ingredients')->restrictOnDelete();

                $table->decimal('quantity', 15, 4); // per ONE portion, in ingredient.unit
                $table->string('note')->nullable();
                $table->timestamps();

                // An ingredient appears at most once per dish; quantities are summed
                // into a single line rather than duplicated.
                $table->unique(['food_item_id', 'ingredient_id']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('recipe_items');
    }
};
