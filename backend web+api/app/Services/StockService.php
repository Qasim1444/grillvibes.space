<?php

namespace App\Services;

use App\Models\StockLevel;
use App\Models\StockMovement;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

/**
 * The only sanctioned way to change stock.
 *
 * Every method here does the same two things atomically: it moves
 * `stock_levels` and it appends the matching row to `stock_movements`. Nothing
 * else in the app should write to either table directly — if it does, the ledger
 * stops explaining the balance and inventory becomes unauditable.
 *
 * Callers are expected to already be inside a transaction (goods receipts and
 * order checkout both are), so these methods deliberately do not open their own.
 */
class StockService
{
    /**
     * Bring stock in and re-value it using the moving-average formula:
     *
     *   new_avg = (old_qty * old_avg + in_qty * in_cost) / (old_qty + in_qty)
     *
     * This is the ONLY operation that changes what an ingredient is worth.
     */
    public function receive(
        int $branchId,
        int $ingredientId,
        float $quantity,
        float $unitCost,
        ?Model $reference = null,
        string $type = StockMovement::TYPE_PURCHASE,
        ?string $note = null,
    ): StockLevel {
        $level = $this->lockLevel($branchId, $ingredientId);

        $oldQty = (float) $level->quantity;
        $oldAvg = (float) $level->average_cost;
        $newQty = $oldQty + $quantity;

        // Blending only makes sense against a positive balance. With nothing on
        // hand — or a negative balance left by over-selling — the old average
        // describes stock that isn't there, so adopt the new purchase price
        // outright rather than averaging against a fiction.
        $newAvg = ($oldQty > 0 && $newQty > 0)
            ? (($oldQty * $oldAvg) + ($quantity * $unitCost)) / $newQty
            : $unitCost;

        $level->update([
            'quantity' => $newQty,
            'average_cost' => $newAvg,
        ]);

        $this->log($level, $type, $quantity, $unitCost, $newQty, $reference, $note);

        return $level;
    }

    /**
     * Take stock out at its current valuation.
     *
     * `average_cost` is deliberately untouched — that is the whole point of a
     * moving average: issuing stock consumes value, it does not re-price what
     * remains.
     *
     * The balance is allowed to go negative. In a kitchen the sale has already
     * happened by the time this runs, and refusing it would break the till over a
     * bookkeeping discrepancy; a negative balance is a visible signal that a
     * receipt or a stock take is missing.
     */
    public function issue(
        int $branchId,
        int $ingredientId,
        float $quantity,
        ?Model $reference = null,
        string $type = StockMovement::TYPE_SALE,
        ?string $note = null,
    ): StockLevel {
        $level = $this->lockLevel($branchId, $ingredientId);

        $newQty = (float) $level->quantity - $quantity;
        $level->update(['quantity' => $newQty]);

        $this->log($level, $type, -$quantity, (float) $level->average_cost, $newQty, $reference, $note);

        return $level;
    }

    /**
     * Correct stock to a counted figure (stock take), logging the difference.
     *
     * Returns the delta that was applied, so a caller can report "3 kg written
     * off" without recomputing it.
     */
    public function adjustTo(
        int $branchId,
        int $ingredientId,
        float $countedQuantity,
        string $type = StockMovement::TYPE_ADJUSTMENT,
        ?string $note = null,
    ): float {
        $level = $this->lockLevel($branchId, $ingredientId);

        $delta = $countedQuantity - (float) $level->quantity;

        if (abs($delta) < 0.00005) { // below the column's 4-dp resolution
            return 0.0;
        }

        $level->update(['quantity' => $countedQuantity]);

        $this->log($level, $type, $delta, (float) $level->average_cost, $countedQuantity, null, $note);

        return round($delta, 4);
    }

    /** Write off stock that was thrown away, at its carrying cost. */
    public function writeOff(
        int $branchId,
        int $ingredientId,
        float $quantity,
        ?string $note = null,
    ): StockLevel {
        return $this->issue(
            $branchId, $ingredientId, $quantity, null, StockMovement::TYPE_WASTAGE, $note
        );
    }

    /**
     * Fetch the (branch, ingredient) stock row for update, creating it on first
     * touch. The unique index on the pair is what makes this safe.
     */
    private function lockLevel(int $branchId, int $ingredientId): StockLevel
    {
        $level = StockLevel::firstOrCreate(
            ['branch_id' => $branchId, 'ingredient_id' => $ingredientId],
            ['quantity' => 0, 'average_cost' => 0],
        );

        // Re-read under a row lock so two concurrent tills cannot both compute a
        // new balance from the same stale quantity.
        return StockLevel::whereKey($level->getKey())->lockForUpdate()->first() ?? $level;
    }

    private function log(
        StockLevel $level,
        string $type,
        float $quantity,
        float $unitCost,
        float $balanceAfter,
        ?Model $reference,
        ?string $note,
    ): StockMovement {
        return StockMovement::create([
            'branch_id' => $level->branch_id,
            'ingredient_id' => $level->ingredient_id,
            'type' => $type,
            'quantity' => round($quantity, 4),
            'unit_cost' => round($unitCost, 4),
            'balance_after' => round($balanceAfter, 4),
            'reference_type' => $reference ? $reference::class : null,
            'reference_id' => $reference?->getKey(),
            'created_by' => Auth::id(),
            'note' => $note,
        ]);
    }
}
