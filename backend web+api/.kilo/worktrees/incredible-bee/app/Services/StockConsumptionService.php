<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Place;
use App\Models\StockMovement;
use App\Support\CurrentBranch;

/**
 * The bridge from a sale to the store room.
 *
 * ORDER -> ORDER ITEM -> FOOD ITEM -> RECIPE -> INGREDIENTS -> STOCK DEDUCTION
 *
 * Selling three burgers issues three buns, 0.45 kg of patty and 0.06 kg of
 * cheese, and stamps each order line with what it cost to make. Both directions
 * are idempotent, which is what makes them safe to call from a checkout endpoint
 * that might be retried or re-saved.
 */
class StockConsumptionService
{
    public function __construct(private readonly StockService $stock) {}

    /**
     * Deduct every ordered dish's ingredients and record the order's COGS.
     *
     * Guarded by `orders.stock_consumed_at`: a second call is a no-op, so a
     * double-submitted checkout cannot drain the store room twice.
     *
     * A dish with no recipe is skipped rather than rejected — an uncosted menu
     * item must still be sellable, it simply contributes no COGS. That is why
     * `cogs_total` is a floor on true cost, not a guarantee, until every dish has
     * a recipe.
     *
     * Expects to be called inside the caller's transaction so the stock movement
     * and the sale commit or roll back together.
     */
    public function consumeForOrder(Order $order): void
    {
        if ($order->stock_consumed_at !== null) {
            return;
        }

        $branchId = $this->resolveBranchId($order);

        if ($branchId === null) {
            return; // no outlet configured yet — nothing to deduct against
        }

        $order->loadMissing('orderItems.item.recipeItems');

        $cogsTotal = 0.0;

        foreach ($order->orderItems as $line) {
            $dish = $line->item;

            if (! $dish) {
                continue;
            }

            $recipe = $dish->recipeItems;

            if ($recipe->isEmpty()) {
                continue;
            }

            $portions = max(1, (int) ($line->quantity ?? 1));
            $lineCost = 0.0;

            foreach ($recipe as $recipeLine) {
                $required = $portions * (float) $recipeLine->quantity;

                // issue() leaves average_cost alone, so the level it hands back
                // still carries the valuation this stock left the shelf at.
                $level = $this->stock->issue(
                    $branchId,
                    (int) $recipeLine->ingredient_id,
                    $required,
                    $order,
                    StockMovement::TYPE_SALE,
                );

                $lineCost += $required * (float) $level->average_cost;
            }

            // Snapshotted, never recomputed: this sale must keep today's
            // ingredient prices even after the moving average drifts.
            $line->update(['cost_price' => round($lineCost, 4)]);

            $cogsTotal += $lineCost;
        }

        $order->update([
            'cogs_total' => round($cogsTotal, 2),
            'stock_consumed_at' => now(),
        ]);
    }

    /**
     * Put back exactly what the sale took — for an edited, cancelled or voided
     * order.
     *
     * Quantities are replayed from the ledger rather than re-derived from the
     * recipe, because the recipe may have been changed since the sale. The ledger
     * is what actually happened; the recipe is only what was planned.
     *
     * Pair it with `consumeForOrder()` to re-apply an edit, exactly as the promo
     * and loyalty services are released then re-applied.
     */
    public function reverseForOrder(Order $order): void
    {
        if ($order->stock_consumed_at === null) {
            return; // never consumed, nothing to unwind
        }

        $movements = StockMovement::query()
            ->where('reference_type', Order::class)
            ->where('reference_id', $order->getKey())
            ->where('type', StockMovement::TYPE_SALE)
            ->get();

        foreach ($movements as $movement) {
            // Returned at the cost it left at, so quantity and value are both
            // restored; a receipt booked in the meantime simply re-blends.
            $this->stock->receive(
                (int) $movement->branch_id,
                (int) $movement->ingredient_id,
                abs((float) $movement->quantity),
                (float) $movement->unit_cost,
                $order,
                StockMovement::TYPE_SALE_REVERSAL,
                'Reversal of order #'.$order->getKey(),
            );
        }

        $order->orderItems()->update(['cost_price' => null]);

        $order->update([
            'cogs_total' => null,
            'stock_consumed_at' => null,
        ]);
    }

    /**
     * Which outlet's stock this sale draws from.
     *
     * POS orders carry `branch_id` directly. Guest/QR orders only know their
     * table, so fall back to that table's branch, then to the active outlet.
     */
    private function resolveBranchId(Order $order): ?int
    {
        if ($order->branch_id) {
            return (int) $order->branch_id;
        }

        $fromPlace = $order->place_id
            ? Place::whereKey($order->place_id)->value('branch_id')
            : null;

        return $fromPlace ? (int) $fromPlace : CurrentBranch::id();
    }
}
