<?php

namespace App\Services;

use App\Models\FoodItem;
use App\Models\StockLevel;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use App\Support\CurrentBranch;
use Illuminate\Support\Collection;

/**
 * Turns a recipe into money.
 *
 * Dish cost is always DERIVED, never stored on `food_items`: it is the sum of
 * each recipe line's quantity multiplied by that ingredient's current
 * `stock_levels.average_cost`. So the moment a supplier's price moves and a
 * delivery is booked in, every affected dish's food-cost % moves with it —
 * without a recalculation job.
 *
 *   dish_cost   = SUM(recipe_items.quantity * stock_levels.average_cost)
 *   food_cost_% = dish_cost / food_items.price * 100
 *
 * Cost is branch-specific, because the same ingredient can carry a different
 * average cost in each outlet.
 *
 * {@see summarise()} is the entry point to prefer: every figure below comes from
 * one pass over the recipe, so asking for the cost, the percentage, the margin
 * and the lines costs the same as asking for any one of them. Use
 * {@see summariseMany()} for a whole menu — it reads the outlet's stock once for
 * the entire set rather than once per dish.
 */
class RecipeCostService
{
    /** Cost to produce one portion of the dish, in the branch's valuation. */
    public function dishCost(FoodItem $item, ?int $branchId = null): float
    {
        return $this->summarise($item, $branchId)['dish_cost'];
    }

    /**
     * Food cost as a percentage of the selling price — the number kitchens
     * actually manage against (a typical target is 25–35%).
     *
     * Null when the dish has no price or no recipe, which is meaningfully
     * different from 0% and should not be charted as if it were.
     */
    public function foodCostPercent(FoodItem $item, ?int $branchId = null): ?float
    {
        return $this->summarise($item, $branchId)['food_cost_percent'];
    }

    /** Selling price less the cost of making it. Null for an uncosted dish. */
    public function contributionMargin(FoodItem $item, ?int $branchId = null): ?float
    {
        return $this->summarise($item, $branchId)['margin'];
    }

    /**
     * Per-ingredient costing lines, for a recipe-costing screen or an export.
     *
     * @return array<int, array{ingredient_id:int, name:string, unit:string, quantity:float, unit_cost:float, line_cost:float}>
     */
    public function breakdown(FoodItem $item, ?int $branchId = null): array
    {
        return $this->summarise($item, $branchId)['lines'];
    }

    /**
     * How many portions of the dish the branch's current stock can produce,
     * i.e. the limiting ingredient. Null when the dish has no recipe.
     */
    public function portionsAvailable(FoodItem $item, ?int $branchId = null): ?int
    {
        return $this->summarise($item, $branchId)['portions_available'];
    }

    /**
     * Every costing figure for one dish, from a single read of the outlet's stock.
     *
     * @return array{dish_cost:float, food_cost_percent:float|null, margin:float|null, portions_available:int|null, lines:array<int, array<string, mixed>>}
     */
    public function summarise(FoodItem $item, ?int $branchId = null): array
    {
        $branchId ??= CurrentBranch::id();

        $lines = $item->relationLoaded('recipeItems')
            ? $item->recipeItems
            : $item->recipeItems()->with('ingredient')->get();

        // The recipe may have been eager-loaded by a caller that didn't need the
        // ingredients (checkout does exactly that) — pull them in one query rather
        // than one per line.
        $lines->loadMissing('ingredient');

        return $this->compose(
            $item,
            $this->stockFor($branchId, $lines->pluck('ingredient_id')->all())
        );
    }

    /**
     * The same figures for a whole set of dishes, keyed by food item id.
     *
     * One stock query covers every ingredient in the set, so costing a 200-dish
     * menu is a single round trip instead of 200. Pass the models with
     * `recipeItems.ingredient` eager-loaded where possible.
     *
     * @param  EloquentCollection<int, FoodItem>  $items
     * @return Collection<int, array<string, mixed>>
     */
    public function summariseMany(EloquentCollection $items, ?int $branchId = null): Collection
    {
        $branchId ??= CurrentBranch::id();

        $items->loadMissing('recipeItems.ingredient');

        $ingredientIds = $items
            ->flatMap(fn (FoodItem $item) => $item->recipeItems->pluck('ingredient_id'))
            ->unique()
            ->values()
            ->all();

        $stock = $this->stockFor($branchId, $ingredientIds);

        return $items->mapWithKeys(fn (FoodItem $item) => [
            $item->getKey() => $this->compose($item, $stock),
        ]);
    }

    /**
     * Cost one dish against an already-fetched stock map.
     *
     * @param  Collection<int, StockLevel>  $stock  keyed by ingredient id
     */
    private function compose(FoodItem $item, Collection $stock): array
    {
        $lines = $item->recipeItems;
        $price = (float) $item->price;

        if ($lines->isEmpty()) {
            return [
                'dish_cost' => 0.0,
                'food_cost_percent' => null,
                'margin' => null,
                'portions_available' => null,
                'lines' => [],
            ];
        }

        $cost = 0.0;
        $portions = null;
        $rows = [];

        foreach ($lines as $line) {
            $quantity = (float) $line->quantity;
            $level = $stock->get($line->ingredient_id);

            // No stock row for this outlet means no valuation yet, so the line is
            // worth nothing — not a guess at what it might cost.
            $unitCost = (float) ($level->average_cost ?? 0);
            $onHand = (float) ($level->quantity ?? 0);
            $lineCost = round($quantity * $unitCost, 4);

            $cost += $lineCost;

            $rows[] = [
                'ingredient_id' => (int) $line->ingredient_id,
                'name' => (string) ($line->ingredient->name ?? ''),
                'unit' => (string) ($line->ingredient->unit ?? ''),
                'quantity' => $quantity,
                'unit_cost' => round($unitCost, 4),
                'line_cost' => $lineCost,
            ];

            // The limiting ingredient decides how many portions can be made. A
            // zero-quantity line never limits production, so it is skipped.
            if ($quantity > 0) {
                $possible = (int) max(0, floor($onHand / $quantity));
                $portions = $portions === null ? $possible : min($portions, $possible);
            }
        }

        $cost = round($cost, 4);

        return [
            'dish_cost' => $cost,
            'food_cost_percent' => $price > 0 ? round($cost / $price * 100, 2) : null,
            'margin' => round($price - $cost, 2),
            'portions_available' => $portions,
            'lines' => $rows,
        ];
    }

    /**
     * One query for every ingredient's stock row in this branch.
     *
     * With no branch configured at all there is no stock and therefore no cost,
     * so every ingredient resolves to 0 rather than guessing a figure.
     *
     * @return Collection<int, StockLevel>  keyed by ingredient id
     */
    private function stockFor(?int $branchId, array $ingredientIds): Collection
    {
        if ($branchId === null || $ingredientIds === []) {
            return collect();
        }

        return StockLevel::where('branch_id', $branchId)
            ->whereIn('ingredient_id', $ingredientIds)
            ->get(['ingredient_id', 'quantity', 'average_cost'])
            ->keyBy('ingredient_id');
    }
}
