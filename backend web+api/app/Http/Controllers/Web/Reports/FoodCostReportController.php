<?php

namespace App\Http\Controllers\Web\Reports;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\FoodCategory;
use App\Models\FoodItem;
use App\Models\Order;
use App\Support\CurrentBranch;
use App\Services\RecipeCostService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Food cost and margin — the report the whole inventory module exists to produce.
 *
 * Two questions, answered side by side:
 *
 *   Per dish   What does it cost to make TODAY, at this outlet's current
 *              ingredient prices, and what does that leave once it sells?
 *              Derived live, so it moves as suppliers move.
 *
 *   Per order  What did the food we actually sold in this period cost?
 *              Read from the COGS snapshotted onto each sale at the time, NOT
 *              recomputed — January's burgers must keep January's beef price, or
 *              last month's margin would silently rewrite itself every time a
 *              delivery is booked.
 *
 * The two figures answering to different clocks is the point, not a discrepancy.
 */
class FoodCostReportController extends Controller
{
    /** A dish costing more than this share of its price is where margin leaks. */
    public const TARGET_FOOD_COST = 35.0;

    public function __construct(private readonly RecipeCostService $costing) {}

    public function index(Request $request): Response
    {
        $data = $request->validate([
            'from' => 'nullable|date',
            'to' => 'nullable|date',
            'category' => 'nullable|integer|exists:food_categories,id',
            'sort' => 'nullable|in:revenue,food_cost,margin,units,name',
        ]);

        $from = Carbon::parse($data['from'] ?? now()->startOfMonth())->startOfDay();
        $to = Carbon::parse($data['to'] ?? now())->endOfDay();

        // A reversed range is a slip at the date pickers, not a request for an
        // empty report — read it the way it was obviously meant.
        if ($to->lt($from)) {
            [$from, $to] = [$to->copy()->startOfDay(), $from->copy()->endOfDay()];
        }

        $category = $data['category'] ?? '';
        $sort = $data['sort'] ?? 'revenue';
        $branchId = CurrentBranch::id();

        $dishes = $this->dishes($branchId, $from, $to, $category, $sort);

        return Inertia::render('Reports/FoodCost', [
            'dishes' => $dishes->all(),
            'totals' => $this->totals($dishes),
            'orders' => $this->orderSummary($branchId, $from, $to),
            'categories' => FoodCategory::orderBy('name')->get(['id', 'name']),
            'branchName' => Branch::whereKey($branchId)->value('name'),
            'target' => self::TARGET_FOOD_COST,
            'filters' => [
                'from' => $from->toDateString(),
                'to' => $to->toDateString(),
                'category' => $category,
                'sort' => $sort,
            ],
        ]);
    }

    /**
     * Every dish, priced live and matched against what it actually sold.
     *
     * Returned whole rather than paginated: the sorts that matter here (worst
     * food-cost %, thinnest margin) are computed, not columns, so a page of SQL
     * rows could not be ordered by them. A menu is bounded — this is the one
     * screen where reading all of it is the cheaper answer.
     *
     * @return Collection<int, array<string, mixed>>
     */
    private function dishes(?int $branchId, Carbon $from, Carbon $to, $category, string $sort): Collection
    {
        $items = FoodItem::query()
            ->with(['foodCategory:id,name', 'recipeItems.ingredient:id,name,unit'])
            ->when($category !== '', fn ($q) => $q->where('foodcategory_id', $category))
            ->orderBy('name')
            ->get();

        $costs = $this->costing->summariseMany($items, $branchId);
        $sales = $this->salesByDish($branchId, $from, $to);

        $rows = $items->map(function (FoodItem $item) use ($costs, $sales) {
            $cost = $costs[$item->getKey()];
            $sold = $sales->get($item->getKey());

            $units = (float) ($sold->units ?? 0);
            $revenue = round((float) ($sold->revenue ?? 0), 2);
            // Actual COGS from the snapshots, so it reflects the prices at the
            // time of sale — not what the dish would cost to make today.
            $cogs = round((float) ($sold->cogs ?? 0), 2);

            return [
                'id' => $item->id,
                'name' => $item->name,
                'category_name' => $item->foodCategory?->name,
                'price' => (float) $item->price,
                'has_recipe' => $cost['lines'] !== [],
                'dish_cost' => $cost['dish_cost'],
                'food_cost_percent' => $cost['food_cost_percent'],
                'margin' => $cost['margin'],
                'units_sold' => $units,
                'revenue' => $revenue,
                'cogs' => $cogs,
                'gross_profit' => round($revenue - $cogs, 2),
                'gross_margin_percent' => $revenue > 0 ? round(($revenue - $cogs) / $revenue * 100, 2) : null,
                // A dish that sold without a recipe contributed revenue but no
                // COGS, so it flatters every total it lands in.
                'understates_cogs' => $units > 0 && $cost['lines'] === [],
                'over_target' => $cost['food_cost_percent'] !== null
                    && $cost['food_cost_percent'] > self::TARGET_FOOD_COST,
            ];
        });

        return $this->sorted($rows, $sort);
    }

    /**
     * Units, revenue and snapshotted COGS per dish for the period.
     *
     * `order_items.sub_total` is the line total (there is no unit-price column),
     * and `cost_price` is the line's cost at the moment it was sold.
     *
     * @return Collection<int, object>  keyed by food item id
     */
    private function salesByDish(?int $branchId, Carbon $from, Carbon $to): Collection
    {
        return DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->whereNull('order_items.deleted_at')
            ->whereNull('orders.deleted_at')
            ->whereBetween('orders.order_datetime', [$from, $to])
            ->tap(fn ($q) => $this->scopeToBranch($q, $branchId))
            ->groupBy('order_items.fooditems_id')
            ->selectRaw('order_items.fooditems_id as food_item_id')
            ->selectRaw('SUM(order_items.quantity) as units')
            ->selectRaw('SUM(order_items.sub_total) as revenue')
            ->selectRaw('SUM(order_items.cost_price) as cogs')
            ->get()
            ->keyBy('food_item_id');
    }

    /**
     * Period totals from the sales side.
     *
     * `cogs_total` is read straight off the orders rather than summed from the
     * dish rows, so the headline figure is the ledger's own and cannot drift from
     * it because of a category filter above.
     */
    private function orderSummary(?int $branchId, Carbon $from, Carbon $to): array
    {
        $orders = Order::query()
            ->whereBetween('order_datetime', [$from, $to])
            ->tap(fn ($q) => $this->scopeToBranch($q, $branchId, 'orders'))
            ->selectRaw('COUNT(*) as orders')
            ->selectRaw('SUM(grand_total) as revenue')
            ->selectRaw('SUM(cogs_total) as cogs')
            ->selectRaw('SUM(CASE WHEN cogs_total IS NULL THEN 1 ELSE 0 END) as uncosted')
            ->first();

        $revenue = round((float) ($orders->revenue ?? 0), 2);
        $cogs = round((float) ($orders->cogs ?? 0), 2);
        $count = (int) ($orders->orders ?? 0);
        $uncosted = (int) ($orders->uncosted ?? 0);

        return [
            'orders' => $count,
            'revenue' => $revenue,
            'cogs' => $cogs,
            'gross_profit' => round($revenue - $cogs, 2),
            'gross_margin_percent' => $revenue > 0 ? round(($revenue - $cogs) / $revenue * 100, 2) : null,
            'food_cost_percent' => $revenue > 0 ? round($cogs / $revenue * 100, 2) : null,
            // Sales that never had their ingredients costed — placed before recipes
            // existed, or reversed since. Until this is zero, COGS is a floor.
            'uncosted_orders' => $uncosted,
            'costed_orders' => $count - $uncosted,
        ];
    }

    /** @param  Collection<int, array<string, mixed>>  $dishes */
    private function totals(Collection $dishes): array
    {
        $sold = $dishes->filter(fn (array $dish) => $dish['units_sold'] > 0);
        $revenue = round((float) $sold->sum('revenue'), 2);
        $cogs = round((float) $sold->sum('cogs'), 2);

        return [
            'dishes' => $dishes->count(),
            'costed' => $dishes->filter(fn (array $dish) => $dish['has_recipe'])->count(),
            'over_target' => $dishes->filter(fn (array $dish) => $dish['over_target'])->count(),
            'sold' => $sold->count(),
            'units_sold' => round((float) $sold->sum('units_sold'), 2),
            'revenue' => $revenue,
            'cogs' => $cogs,
            'gross_profit' => round($revenue - $cogs, 2),
            'gross_margin_percent' => $revenue > 0 ? round(($revenue - $cogs) / $revenue * 100, 2) : null,
            // The dishes making every figure above look better than it is.
            'understating' => $dishes->filter(fn (array $dish) => $dish['understates_cogs'])->count(),
        ];
    }

    /**
     * Restrict to one outlet the same way stock deduction does.
     *
     * POS orders carry `branch_id`; guest/QR orders only know their table, so the
     * outlet comes from `places`. Filtering on `orders.branch_id` alone would drop
     * every QR sale, and the report's COGS would then disagree with the stock that
     * actually moved.
     */
    private function scopeToBranch($query, ?int $branchId, string $table = 'orders'): void
    {
        if ($branchId === null) {
            return;   // no outlet configured — report across everything
        }

        $query->where(fn ($q) => $q
            ->where("{$table}.branch_id", $branchId)
            ->orWhere(fn ($w) => $w
                ->whereNull("{$table}.branch_id")
                ->whereIn("{$table}.place_id", fn ($sub) => $sub
                    ->select('id')->from('places')->where('branch_id', $branchId))));
    }

    /**
     * @param  Collection<int, array<string, mixed>>  $rows
     * @return Collection<int, array<string, mixed>>
     */
    private function sorted(Collection $rows, string $sort): Collection
    {
        return match ($sort) {
            // Worst offenders first; an uncosted dish has no percentage to rank by
            // so it sorts last rather than as if it were free.
            'food_cost' => $rows->sortByDesc(fn (array $r) => $r['food_cost_percent'] ?? -1)->values(),
            'margin' => $rows->sortBy(fn (array $r) => $r['margin'] ?? PHP_INT_MAX)->values(),
            'units' => $rows->sortByDesc('units_sold')->values(),
            'name' => $rows->values(),
            default => $rows->sortByDesc('revenue')->values(),
        };
    }
}
