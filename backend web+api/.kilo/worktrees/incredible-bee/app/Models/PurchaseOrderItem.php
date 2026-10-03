<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * One ordered line of a purchase order.
 *
 * `received_qty` is a running tally maintained by goods receipts, so
 * `quantity - received_qty` is the outstanding amount still owed by the vendor.
 */
class PurchaseOrderItem extends Model
{
    protected $fillable = [
        'purchase_order_id', 'ingredient_id', 'quantity',
        'unit_cost', 'line_total', 'received_qty',
    ];

    protected $casts = [
        'quantity' => 'decimal:4',
        'unit_cost' => 'decimal:4',
        'line_total' => 'decimal:2',
        'received_qty' => 'decimal:4',
    ];

    public function purchaseOrder()
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function ingredient()
    {
        return $this->belongsTo(Ingredient::class);
    }

    /** How much of this line is still undelivered (never negative). */
    public function outstandingQty(): float
    {
        return max(0, (float) $this->quantity - (float) $this->received_qty);
    }
}
