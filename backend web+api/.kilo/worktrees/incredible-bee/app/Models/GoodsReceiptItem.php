<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * One delivered line of a goods receipt.
 *
 * `unit_cost` is what was actually invoiced, which may differ from the price
 * agreed on the purchase order — the invoiced figure is the one that feeds the
 * moving-average valuation, because that is the money genuinely spent.
 */
class GoodsReceiptItem extends Model
{
    protected $fillable = [
        'goods_receipt_id', 'ingredient_id', 'purchase_order_item_id',
        'quantity', 'unit_cost', 'line_total',
    ];

    protected $casts = [
        'quantity' => 'decimal:4',
        'unit_cost' => 'decimal:4',
        'line_total' => 'decimal:2',
    ];

    public function goodsReceipt()
    {
        return $this->belongsTo(GoodsReceipt::class);
    }

    public function ingredient()
    {
        return $this->belongsTo(Ingredient::class);
    }

    public function purchaseOrderItem()
    {
        return $this->belongsTo(PurchaseOrderItem::class);
    }
}
