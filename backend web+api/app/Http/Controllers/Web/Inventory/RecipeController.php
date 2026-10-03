<?php

namespace App\Http\Controllers\Web\Inventory;

use App\Http\Controllers\Controller;
use App\Models\FoodCategory;
use App\Models\FoodItem;
use App\Models\Ingredient;
use App\Services\RecipeCostService;
use App\Support\CurrentBranch;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The recipe builder — where the menu meets inventory.
 *
 * A dish's cost is never stored; it is derived from its recipe lines and the
 * current outlet's average ingredient costs every time this page is opened. So
 * the food-cost % shown here moves on its own as supplier prices move, and the
 * same dish can read differently in two outlets.
 */
class RecipeController extends Controller
{
    public function __construct(private readonly RecipeCostService $costing) {}

    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $category = $request->query('category', '');
        $view = $request->query('view', '');   // '' | costed | uncosted
        $branchId = CurrentBranch::id();

        $paginator = FoodItem::query()
            ->with(['foodCategory:id,name', 'recipeItems.ingredient:id,name,unit'])
            ->when($search !== '', fn ($q) => $q->where(fn ($w) => $w
                ->where('name', 'like', "%{$search}%")
                ->orWhere('code', 'like', "%{$search}%")))
            ->when($category !== '', fn ($q) => $q->where('foodcategory_id', $category))
            ->when($view === 'costed', fn ($q) => $q->whereHas('recipeItems'))
            ->when($view === 'uncosted', fn ($q) => $q->whereDoesntHave('recipeItems'))
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString();

        // Cost the whole page in one pass, then map — one stock query for all 15
        // dishes rather than one per row.
        $costs = $this->costing->summariseMany($paginator->getCollection(), $branchId);

        return Inertia::render('Inventory/Recipes', [
            'items' => $paginator->through(fn (FoodItem $item) => $this->present($item, $costs[$item->getKey()])),
            'categories' => FoodCategory::orderBy('name')->get(['id', 'name']),
            'ingredients' => $this->ingredientOptions($branchId),
            'summary' => $this->summary($branchId),
            'filters' => ['search' => $search, 'category' => $category, 'view' => $view],
            // Deep link from the Food Items page: ?food_item=12 opens that builder.
            'openFoodItem' => $request->query('food_item') ? (int) $request->query('food_item') : null,
        ]);
    }

    /**
     * Replace a dish's whole recipe in one write.
     *
     * Rewriting rather than diffing keeps it simple and idempotent — the posted
     * lines ARE the recipe afterwards. Past sales are unaffected: they carry the
     * cost that was snapshotted onto `order_items.cost_price` at the time.
     */
    public function update(Request $request, int $foodItemId): RedirectResponse
    {
        $item = FoodItem::findOrFail($foodItemId);

        $data = $request->validate([
            'lines' => 'present|array',
            'lines.*.ingredient_id' => 'required|integer|exists:ingredients,id',
            'lines.*.quantity' => 'required|numeric|min:0.0001',
            'lines.*.note' => 'nullable|string|max:255',
        ]);

        $lines = collect($data['lines']);

        // The unique index on (food_item_id, ingredient_id) would reject this at
        // the database, but a validation error points at the actual mistake.
        if ($lines->pluck('ingredient_id')->duplicates()->isNotEmpty()) {
            throw ValidationException::withMessages([
                'lines' => 'The same ingredient is listed twice — combine the quantities into one line.',
            ]);
        }

        DB::transaction(function () use ($item, $lines) {
            $item->recipeItems()->delete();

            foreach ($lines as $line) {
                $item->recipeItems()->create([
                    'ingredient_id' => $line['ingredient_id'],
                    'quantity' => $line['quantity'],
                    'note' => $line['note'] ?? null,
                ]);
            }
        });

        return back()->with('success', $lines->isEmpty()
            ? "Recipe cleared for {$item->name}."
            : "Recipe saved — {$lines->count()} ingredient(s) for {$item->name}.");
    }

    /**
     * The ingredient picker, each option carrying this outlet's live valuation so
     * the builder can price a line the moment a quantity is typed — without a
     * round trip per keystroke.
     */
    private function ingredientOptions(?int $branchId): array
    {
        return Ingredient::active()
            ->with(['stockLevels' => fn ($q) => $q->where('branch_id', $branchId)])
            ->orderBy('name')
            ->get(['id', 'name', 'unit'])
            ->map(fn (Ingredient $ingredient) => [
                ...$ingredient->only('id', 'name', 'unit'),
                'average_cost' => (float) ($ingredient->stockLevels->first()?->average_cost ?? 0),
            ])
            ->all();
    }

    /**
     * One dish, costed, with its recipe lines ready for the builder.
     *
     * @param  array<string, mixed>  $cost  the dish's entry from RecipeCostService::summariseMany()
     */
    private function present(FoodItem $item, array $cost): array
    {
        // Notes live on the recipe line, not in the costing, so they are matched
        // back on by ingredient — the pair is unique per dish.
        $notes = $item->recipeItems->pluck('note', 'ingredient_id');

        return [
            'id' => $item->id,
            'name' => $item->name,
            'code' => $item->code,
            'category_name' => $item->foodCategory?->name,
            'price' => (float) $item->price,
            'dish_cost' => $cost['dish_cost'],
            'food_cost_percent' => $cost['food_cost_percent'],
            'margin' => $cost['margin'],
            'portions_available' => $cost['portions_available'],
            'line_count' => count($cost['lines']),
            'lines' => array_map(fn (array $line) => [
                ...$line,
                'note' => $notes[$line['ingredient_id']] ?? null,
            ], $cost['lines']),
        ];
    }

    /**
     * Menu-wide costing KPIs.
     *
     * Every costed dish is priced, but against a single read of the outlet's
     * stock — so this is one query for the set, not one per dish.
     */
    private function summary(?int $branchId): array
    {
        $withRecipes = FoodItem::with('recipeItems.ingredient:id,name,unit')
            ->whereHas('recipeItems')
            ->get();

        $percentages = $this->costing->summariseMany($withRecipes, $branchId)
            ->pluck('food_cost_percent')
            ->filter(fn (?float $percent) => $percent !== null);

        return [
            'total_dishes' => FoodItem::count(),
            'costed' => $withRecipes->count(),
            'uncosted' => FoodItem::whereDoesntHave('recipeItems')->count(),
            'avg_food_cost' => $percentages->isEmpty() ? null : round($percentages->avg(), 2),
            // A dish costing more than 40% of its price is where margin leaks.
            'over_target' => $percentages->filter(fn (float $percent) => $percent > 40)->count(),
        ];
    }
}
