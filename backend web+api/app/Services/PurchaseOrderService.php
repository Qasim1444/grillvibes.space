<?php

namespace App\Services;

use App\Models\PurchaseOrder;
use App\Support\CurrentBranch;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;
use RuntimeException;

/**
 * Raises and progresses purchase orders — the front of the procurement flow.
 *
 * Nothing here touches stock or cost. A PO is a commitment document; value only
 * enters inventory when {@see GoodsReceiptService::post()} books the delivery.
 */
class PurchaseOrderService
{
    /**
     * @param  array<int, array{ingredient_id:int, quantity:float|string, unit_cost:float|string}>  $lines
     */
    public function create(array $attributes, array $lines): PurchaseOrder
    {
        if ($lines === []) {
            throw new InvalidArgumentException('A purchase order needs at least one line.');
        }

        return DB::transaction(function () use ($attributes, $lines) {
            $order = PurchaseOrder::create([
                'branch_id' => $attributes['branch_id'] ?? CurrentBranch::id(),
                'vendor_id' => $attributes['vendor_id'],
                'po_number' => $attributes['po_number'] ?? $this->nextPoNumber(),
                'status' => $attributes['status'] ?? PurchaseOrder::STATUS_DRAFT,
                'ordered_at' => $attributes['ordered_at'] ?? null,
                'expected_at' => $attributes['expected_at'] ?? null,
                'total' => 0,
                'notes' => $attributes['notes'] ?? null,
                'created_by' => $attributes['created_by'] ?? Auth::id(),
            ]);

            $this->replaceLines($order, $lines);

            return $order->refresh();
        });
    }

    /**
     * Rewrite a draft's lines. Refused once the PO has been sent to the vendor —
     * editing an order that goods may already be arriving against would leave
     * `received_qty` pointing at quantities nobody agreed to.
     */
    public function updateLines(PurchaseOrder $order, array $lines): PurchaseOrder
    {
        if ($order->status !== PurchaseOrder::STATUS_DRAFT) {
            throw new RuntimeException("Purchase order {$order->po_number} is no longer a draft and cannot be re-lined.");
        }

        return DB::transaction(function () use ($order, $lines) {
            $order->items()->delete();
            $this->replaceLines($order, $lines);

            return $order->refresh();
        });
    }

    /** Send the PO to the vendor: draft -> ordered. */
    public function markOrdered(PurchaseOrder $order): PurchaseOrder
    {
        if ($order->status !== PurchaseOrder::STATUS_DRAFT) {
            throw new RuntimeException("Purchase order {$order->po_number} has already been sent.");
        }

        $order->update([
            'status' => PurchaseOrder::STATUS_ORDERED,
            'ordered_at' => $order->ordered_at ?? now()->toDateString(),
        ]);

        return $order;
    }

    /**
     * Cancel the remainder of a PO.
     *
     * Allowed on a partially received order — the delivered portion keeps its
     * stock and its ledger rows, only the outstanding balance is abandoned. Not
     * allowed once fully received, since there would be nothing to cancel.
     */
    public function cancel(PurchaseOrder $order, ?string $reason = null): PurchaseOrder
    {
        if ($order->status === PurchaseOrder::STATUS_RECEIVED) {
            throw new RuntimeException("Purchase order {$order->po_number} is fully received and cannot be cancelled.");
        }

        $order->update([
            'status' => PurchaseOrder::STATUS_CANCELLED,
            'notes' => trim(($order->notes ? $order->notes."\n" : '').'Cancelled: '.($reason ?? 'no reason given')),
        ]);

        return $order;
    }

    private function replaceLines(PurchaseOrder $order, array $lines): void
    {
        foreach ($lines as $line) {
            $quantity = (float) $line['quantity'];
            $unitCost = (float) $line['unit_cost'];

            if ($quantity <= 0) {
                throw new InvalidArgumentException('Ordered quantity must be greater than zero.');
            }

            $order->items()->create([
                'ingredient_id' => $line['ingredient_id'],
                'quantity' => $quantity,
                'unit_cost' => $unitCost,
                'line_total' => round($quantity * $unitCost, 2),
                'received_qty' => 0,
            ]);
        }

        $order->recalculateTotal();
    }

    /** Sequential document number; the unique index on `po_number` is the guard. */
    private function nextPoNumber(): string
    {
        $next = (int) PurchaseOrder::withTrashed()->max('id') + 1;

        return 'PO-'.str_pad((string) $next, 6, '0', STR_PAD_LEFT);
    }
}
