<?php

namespace App\Http\Controllers\Web\Inventory;

use App\Http\Controllers\Controller;
use App\Models\Ingredient;
use App\Support\CurrentBranch;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Ingredient master data — the raw materials recipes consume and procurement buys.
 *
 * Quantities and costs are NOT edited here: they belong to `stock_levels` and are
 * written only by a goods receipt or a stock take. This screen owns the name, the
 * unit of measure and the reorder threshold, and shows the current outlet's
 * balance read-only so the two are never confused.
 */
class IngredientController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $status = $request->query('status', '');
        $branchId = CurrentBranch::id();

        $ingredients = Ingredient::query()
            // Only the current outlet's row — the page reports one branch at a time.
            ->with(['stockLevels' => fn ($q) => $q->where('branch_id', $branchId)])
            ->withCount('recipeItems')
            ->when($search !== '', fn ($q) => $q->where(fn ($w) => $w
                ->where('name', 'like', "%{$search}%")
                ->orWhere('sku', 'like', "%{$search}%")))
            ->when($status !== '', fn ($q) => $q->where('is_active', $status === 'active'))
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString()
            ->through(function (Ingredient $ingredient) {
                $level = $ingredient->stockLevels->first();
                $quantity = (float) ($level->quantity ?? 0);
                $averageCost = (float) ($level->average_cost ?? 0);

                return [
                    ...$ingredient->only('id', 'name', 'sku', 'unit', 'is_active', 'notes'),
                    'reorder_level' => (float) $ingredient->reorder_level,
                    'quantity' => $quantity,
                    'average_cost' => $averageCost,
                    'stock_value' => round($quantity * $averageCost, 2),
                    'needs_reorder' => $quantity <= (float) $ingredient->reorder_level,
                    'used_in_recipes' => $ingredient->recipe_items_count,
                ];
            });

        return Inertia::render('Inventory/Ingredients', [
            'ingredients' => $ingredients,
            'units' => self::UNITS,
            'summary' => $this->summary($branchId),
            'filters' => ['search' => $search, 'status' => $status],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Ingredient::create($this->validated($request));

        return back()->with('success', 'Ingredient created.');
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $ingredient = Ingredient::findOrFail($id);
        $ingredient->update($this->validated($request, $id));

        return back()->with('success', 'Ingredient updated.');
    }

    /**
     * Retire an ingredient.
     *
     * Refused while a recipe still calls for it: removing it would leave those
     * dishes costing an ingredient that no longer resolves, quietly understating
     * their food cost. Take it off the recipes first.
     */
    public function destroy(int $id): RedirectResponse
    {
        $ingredient = Ingredient::findOrFail($id);

        if ($ingredient->recipeItems()->exists()) {
            $dishes = $ingredient->recipeItems()->with('foodItem:id,name')->get()
                ->pluck('foodItem.name')->filter()->take(5)->implode(', ');

            return back()->with('error', "Still used by: {$dishes}. Remove it from those recipes first.");
        }

        // A soft delete — the stock ledger keeps referencing the row, so the
        // history of what was bought and consumed stays readable.
        $ingredient->delete();

        return back()->with('success', 'Ingredient deleted.');
    }

    private function validated(Request $request, ?int $id = null): array
    {
        return $request->validate([
            'name' => 'required|string|max:150',
            'sku' => 'nullable|string|max:60|unique:ingredients,sku,'.($id ?? 'NULL').',id',
            'unit' => 'required|string|max:20',
            'reorder_level' => 'required|numeric|min:0',
            'is_active' => 'required|boolean',
            'notes' => 'nullable|string|max:2000',
        ]);
    }

    /** Inventory KPIs for the current outlet. */
    private function summary(?int $branchId): array
    {
        $ingredients = Ingredient::query()
            ->with(['stockLevels' => fn ($q) => $q->where('branch_id', $branchId)])
            ->get(['id', 'reorder_level']);

        $value = 0.0;
        $low = 0;
        $negative = 0;

        foreach ($ingredients as $ingredient) {
            $level = $ingredient->stockLevels->first();
            $quantity = (float) ($level->quantity ?? 0);

            $value += $quantity * (float) ($level->average_cost ?? 0);

            if ($quantity <= (float) $ingredient->reorder_level) {
                $low++;
            }

            if ($quantity < 0) {
                $negative++;
            }
        }

        return [
            'total' => $ingredients->count(),
            'stock_value' => round($value, 2),
            'low_stock' => $low,
            'negative' => $negative,
        ];
    }

    /** Offered in the unit picker; the column is free text, so this is a shortlist. */
    public const UNITS = ['kg', 'g', 'litre', 'ml', 'pcs', 'dozen', 'pack', 'bottle', 'can', 'bunch'];
}
