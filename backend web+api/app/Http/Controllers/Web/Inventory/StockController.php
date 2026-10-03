<?php

namespace App\Http\Controllers\Web\Inventory;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\GoodsReceipt;
use App\Models\Ingredient;
use App\Models\Order;
use App\Models\PurchaseOrder;
use App\Models\StockLevel;
use App\Models\StockMovement;
use App\Services\StockService;
use App\Support\CurrentBranch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Stock on hand for one outlet, plus the two corrections a kitchen actually makes:
 * a stock take (count it and set it) and a write-off (it went in the bin).
 *
 * Deliberately NOT a way to add stock — value only enters inventory through a
 * goods receipt, which is what sets the average cost. Both actions here go
 * through {@see StockService} so the ledger keeps explaining every balance.
 */
class StockController extends Controller
{
    public function __construct(private readonly StockService $stock) {}

    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $view = $request->query('view', '');   // '' | low | negative
        $branchId = CurrentBranch::id();

        $levels = StockLevel::query()
            ->where('branch_id', $branchId)
            ->join('ingredients', 'ingredients.id', '=', 'stock_levels.ingredient_id')
            ->whereNull('ingredients.deleted_at')
            ->when($search !== '', fn ($q) => $q->where(fn ($w) => $w
                ->where('ingredients.name', 'like', "%{$search}%")
                ->orWhere('ingredients.sku', 'like', "%{$search}%")))
            // Both filters are column-to-column comparisons, so they stay in SQL
            // rather than being re-filtered after pagination (which would give
            // short pages and a wrong total).
            ->when($view === 'low', fn ($q) => $q->whereColumn('stock_levels.quantity', '<=', 'ingredients.reorder_level'))
            ->when($view === 'negative', fn ($q) => $q->where('stock_levels.quantity', '<', 0))
            ->orderBy('ingredients.name')
            ->select([
                'stock_levels.id', 'stock_levels.ingredient_id',
                'stock_levels.quantity', 'stock_levels.average_cost',
                'ingredients.name', 'ingredients.sku', 'ingredients.unit',
                'ingredients.reorder_level',
            ])
            ->paginate(20)
            ->withQueryString()
            ->through(fn ($row) => [
                'id' => $row->id,
                'ingredient_id' => $row->ingredient_id,
                'name' => $row->name,
                'sku' => $row->sku,
                'unit' => $row->unit,
                'quantity' => (float) $row->quantity,
                'average_cost' => (float) $row->average_cost,
                'stock_value' => round((float) $row->quantity * (float) $row->average_cost, 2),
                'reorder_level' => (float) $row->reorder_level,
                'needs_reorder' => (float) $row->quantity <= (float) $row->reorder_level,
            ]);

        return Inertia::render('Inventory/Stock', [
            'levels' => $levels,
            'ingredients' => Ingredient::active()->orderBy('name')->get(['id', 'name', 'unit']),
            'movements' => $this->recentMovements($branchId),
            'summary' => $this->summary($branchId),
            'branchName' => Branch::whereKey($branchId)->value('name'),
            'filters' => ['search' => $search, 'view' => $view],
        ]);
    }

    /**
     * The ledger behind one ingredient's balance — fetched on demand when a row is
     * expanded, so the page load isn't paying for history nobody opened.
     */
    public function ledger(int $ingredientId): JsonResponse
    {
        $branchId = CurrentBranch::id();

        $movements = StockMovement::with(['ingredient:id,name,unit', 'reference'])
            ->where('branch_id', $branchId)
            ->where('ingredient_id', $ingredientId)
            ->orderByDesc('id')
            ->limit(100)
            ->get()
            ->map(fn (StockMovement $movement) => [
                'id' => $movement->id,
                'type' => $movement->type,
                'quantity' => (float) $movement->quantity,
                'unit_cost' => (float) $movement->unit_cost,
                'balance_after' => (float) $movement->balance_after,
                'value' => $movement->value(),
                'reference' => $this->referenceLabel($movement),
                'note' => $movement->note,
                'created_at' => $movement->created_at?->toDateTimeString(),
            ]);

        return response()->json([
            'ingredient' => Ingredient::whereKey($ingredientId)->first(['id', 'name', 'unit']),
            'movements' => $movements,
        ]);
    }

    /** Stock take: set the balance to what was physically counted. */
    public function adjust(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'ingredient_id' => 'required|integer|exists:ingredients,id',
            'counted_quantity' => 'required|numeric',
            'note' => 'nullable|string|max:255',
        ]);

        $branchId = $this->requireBranch();

        if (! $branchId) {
            return back()->with('error', 'No outlet is selected, so there is nowhere to record the count.');
        }

        $delta = DB::transaction(fn () => $this->stock->adjustTo(
            $branchId,
            (int) $data['ingredient_id'],
            (float) $data['counted_quantity'],
            StockMovement::TYPE_ADJUSTMENT,
            $data['note'] ?? 'Stock take',
        ));

        if ($delta === 0.0) {
            return back()->with('success', 'Count matched the system balance — nothing to correct.');
        }

        return back()->with('success', sprintf(
            'Stock corrected by %s%s.', $delta > 0 ? '+' : '', rtrim(rtrim(number_format($delta, 4, '.', ''), '0'), '.')
        ));
    }

    /** Wastage: stock that was thrown away, written off at its carrying cost. */
    public function writeOff(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'ingredient_id' => 'required|integer|exists:ingredients,id',
            'quantity' => 'required|numeric|min:0.0001',
            'note' => 'required|string|max:255',
        ]);

        $branchId = $this->requireBranch();

        if (! $branchId) {
            return back()->with('error', 'No outlet is selected, so there is nowhere to record the write-off.');
        }

        DB::transaction(fn () => $this->stock->writeOff(
            $branchId,
            (int) $data['ingredient_id'],
            (float) $data['quantity'],
            $data['note'],
        ));

        return back()->with('success', 'Wastage recorded.');
    }

    private function requireBranch(): ?int
    {
        return CurrentBranch::id();
    }

    /** The last few ledger rows across all ingredients — the activity feed. */
    private function recentMovements(?int $branchId): array
    {
        return StockMovement::with(['ingredient:id,name,unit', 'reference'])
            ->where('branch_id', $branchId)
            ->orderByDesc('id')
            ->limit(15)
            ->get()
            ->map(fn (StockMovement $movement) => [
                'id' => $movement->id,
                'ingredient_name' => $movement->ingredient?->name,
                'unit' => $movement->ingredient?->unit,
                'type' => $movement->type,
                'quantity' => (float) $movement->quantity,
                'balance_after' => (float) $movement->balance_after,
                'value' => $movement->value(),
                'reference' => $this->referenceLabel($movement),
                'note' => $movement->note,
                'created_at' => $movement->created_at?->toDateTimeString(),
            ])
            ->all();
    }

    /**
     * A short human label for the document that caused a movement, so the ledger
     * reads as "GRN-000004" or "Order #182" rather than a class name and an id.
     */
    private function referenceLabel(StockMovement $movement): ?string
    {
        if (! $movement->reference_type) {
            return null;
        }

        $reference = $movement->reference;   // eager-loaded through the morph

        return match (true) {
            $reference === null => null,
            $reference instanceof GoodsReceipt => $reference->grn_number,
            $reference instanceof PurchaseOrder => $reference->po_number,
            $reference instanceof Order => 'Order #'.$reference->getKey(),
            default => '#'.$reference->getKey(),
        };
    }

    private function summary(?int $branchId): array
    {
        $rows = StockLevel::where('branch_id', $branchId)
            ->join('ingredients', 'ingredients.id', '=', 'stock_levels.ingredient_id')
            ->whereNull('ingredients.deleted_at')
            ->selectRaw('SUM(stock_levels.quantity * stock_levels.average_cost) as value')
            ->selectRaw('SUM(CASE WHEN stock_levels.quantity < 0 THEN 1 ELSE 0 END) as negative')
            ->selectRaw('SUM(CASE WHEN stock_levels.quantity <= ingredients.reorder_level THEN 1 ELSE 0 END) as low')
            ->selectRaw('COUNT(*) as tracked')
            ->first();

        return [
            'stock_value' => round((float) ($rows->value ?? 0), 2),
            'low_stock' => (int) ($rows->low ?? 0),
            'negative' => (int) ($rows->negative ?? 0),
            'tracked' => (int) ($rows->tracked ?? 0),
            // Wastage is the number a kitchen is judged on, so it gets its own KPI.
            'wastage_this_month' => round((float) abs(
                StockMovement::where('branch_id', $branchId)
                    ->where('type', StockMovement::TYPE_WASTAGE)
                    ->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()])
                    ->sum(DB::raw('quantity * unit_cost'))
            ), 2),
        ];
    }
}
