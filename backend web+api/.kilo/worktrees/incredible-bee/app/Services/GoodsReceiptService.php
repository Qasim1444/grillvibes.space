<?php

namespace App\Services;

use App\Models\GoodsReceipt;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\StockMovement;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

/**
 * Posts a delivery.
 *
 * This is the single entry point for stock coming IN, and therefore the only
 * place an ingredient's value changes. Creating `goods_receipts` rows directly
 * would leave `stock_levels` and `stock_movements` untouched and silently corrupt
 * every cost figure downstream — always go through `post()`.
 *
 * Everything happens in one transaction: the receipt, its lines, the stock
 * movements, the re-valuation, the purchase-order tally and the PO status.
 */
class GoodsReceiptService
{
    public function __construct(private readonly StockService $stock) {}

    /**
     * @param  array{branch_id:int, vendor_id:int, purchase_order_id?:int|null, received_at?:mixed, grn_number?:string, invoice_number?:string|null, notes?:string|null}  $attributes
     * @param  array<int, array{ingredient_id:int, quantity:float|string, unit_cost:float|string, purchase_order_item_id?:int|null}>  $lines
     */
    public function post(array $attributes, array $lines): GoodsReceipt
    {
        if ($lines === []) {
            throw new InvalidArgumentException('A goods receipt needs at least one line.');
        }

        return DB::transaction(function () use ($attributes, $lines) {
            $receipt = GoodsReceipt::create([
                'branch_id' => $attributes['branch_id'],
                'vendor_id' => $attributes['vendor_id'],
                'purchase_order_id' => $attributes['purchase_order_id'] ?? null,
                'grn_number' => $attributes['grn_number'] ?? $this->nextGrnNumber(),
                'invoice_number' => $attributes['invoice_number'] ?? null,
                'received_at' => $attributes['received_at'] ?? now()->toDateString(),
                'total' => 0,
                'notes' => $attributes['notes'] ?? null,
                'created_by' => $attributes['created_by'] ?? Auth::id(),
            ]);

            $total = 0.0;

            foreach ($lines as $line) {
                $quantity = (float) $line['quantity'];
                $unitCost = (float) $line['unit_cost'];

                if ($quantity <= 0) {
                    throw new InvalidArgumentException('Received quantity must be greater than zero.');
                }

                $lineTotal = round($quantity * $unitCost, 2);

                $receipt->items()->create([
                    'ingredient_id' => $line['ingredient_id'],
                    'purchase_order_item_id' => $line['purchase_order_item_id'] ?? null,
                    'quantity' => $quantity,
                    'unit_cost' => $unitCost,
                    'line_total' => $lineTotal,
                ]);

                // Stock in + re-valuation + ledger row.
                $this->stock->receive(
                    (int) $receipt->branch_id,
                    (int) $line['ingredient_id'],
                    $quantity,
                    $unitCost,
                    $receipt,
                    StockMovement::TYPE_PURCHASE,
                );

                $this->tallyPurchaseOrderLine($line['purchase_order_item_id'] ?? null, $quantity);

                $total += $lineTotal;
            }

            $receipt->update(['total' => round($total, 2)]);

            // Let the PO re-derive draft/partially_received/received from its lines.
            $receipt->purchaseOrder?->syncStatusFromReceipts();

            return $receipt->refresh();
        });
    }

    /**
     * Receive a purchase order in full, at the prices that were agreed on it.
     *
     * The convenience path for the common case: the delivery matched the order.
     * Short or over deliveries should call `post()` with the real figures instead.
     */
    public function receiveInFull(PurchaseOrder $order, array $attributes = []): GoodsReceipt
    {
        $lines = $order->items()
            ->get()
            ->filter(fn (PurchaseOrderItem $item) => $item->outstandingQty() > 0)
            ->map(fn (PurchaseOrderItem $item) => [
                'ingredient_id' => (int) $item->ingredient_id,
                'purchase_order_item_id' => (int) $item->getKey(),
                'quantity' => $item->outstandingQty(),
                'unit_cost' => (float) $item->unit_cost,
            ])
            ->values()
            ->all();

        if ($lines === []) {
            throw new InvalidArgumentException("Purchase order {$order->po_number} has nothing outstanding to receive.");
        }

        return $this->post(array_merge([
            'branch_id' => $order->branch_id,
            'vendor_id' => $order->vendor_id,
            'purchase_order_id' => $order->getKey(),
        ], $attributes), $lines);
    }

    /** Add what just arrived to the PO line's running received total. */
    private function tallyPurchaseOrderLine(?int $purchaseOrderItemId, float $quantity): void
    {
        if (! $purchaseOrderItemId) {
            return; // ad-hoc delivery with no purchase order behind it
        }

        PurchaseOrderItem::whereKey($purchaseOrderItemId)->increment('received_qty', $quantity);
    }

    /**
     * Sequential document number. The unique index on `grn_number` is the real
     * guard — a rare concurrent collision fails loudly rather than duplicating.
     */
    private function nextGrnNumber(): string
    {
        $next = (int) GoodsReceipt::withTrashed()->max('id') + 1;

        return 'GRN-'.str_pad((string) $next, 6, '0', STR_PAD_LEFT);
    }
}
