<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * A delivery that physically arrived.
 *
 * This is the only document that adds stock and the only one that changes an
 * ingredient's average cost. `purchase_order_id` is nullable because ad-hoc
 * deliveries (the cash-and-carry run) are normal in a kitchen.
 *
 * Posting is done by {@see \App\Services\GoodsReceiptService::post()} — never by
 * creating rows directly, or stock and the ledger will disagree.
 */
class GoodsReceipt extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'branch_id', 'vendor_id', 'purchase_order_id', 'grn_number',
        'invoice_number', 'received_at', 'total', 'notes', 'created_by',
    ];

    protected $casts = [
        'received_at' => 'date',
        'total' => 'decimal:2',
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    public function purchaseOrder()
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function items()
    {
        return $this->hasMany(GoodsReceiptItem::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /** The ledger rows this receipt produced. */
    public function movements()
    {
        return $this->morphMany(StockMovement::class, 'reference');
    }
}
