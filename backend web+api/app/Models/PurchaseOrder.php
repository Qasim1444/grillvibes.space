<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * An intent to buy from a vendor.
 *
 * A purchase order moves no stock and changes no costs — it is a commitment
 * document. Stock only arrives when a {@see GoodsReceipt} is posted against it.
 */
class PurchaseOrder extends Model
{
    use SoftDeletes;

    public const STATUS_DRAFT = 'draft';
    public const STATUS_ORDERED = 'ordered';
    public const STATUS_PARTIALLY_RECEIVED = 'partially_received';
    public const STATUS_RECEIVED = 'received';
    public const STATUS_CANCELLED = 'cancelled';

    protected $fillable = [
        'branch_id', 'vendor_id', 'po_number', 'status',
        'ordered_at', 'expected_at', 'total', 'notes', 'created_by',
    ];

    protected $casts = [
        'ordered_at' => 'date',
        'expected_at' => 'date',
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

    public function items()
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }

    public function goodsReceipts()
    {
        return $this->hasMany(GoodsReceipt::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Derive the status from what has actually been received, so it can never
     * drift out of step with the receipt lines.
     */
    public function syncStatusFromReceipts(): void
    {
        if (in_array($this->status, [self::STATUS_DRAFT, self::STATUS_CANCELLED], true)) {
            return;
        }

        $items = $this->items()->get();

        $fullyReceived = $items->every(
            fn (PurchaseOrderItem $item) => (float) $item->received_qty >= (float) $item->quantity
        );
        $anyReceived = $items->contains(fn (PurchaseOrderItem $item) => (float) $item->received_qty > 0);

        $this->update([
            'status' => match (true) {
                $fullyReceived => self::STATUS_RECEIVED,
                $anyReceived => self::STATUS_PARTIALLY_RECEIVED,
                default => self::STATUS_ORDERED,
            },
        ]);
    }

    /** Recalculate the header total from its lines. */
    public function recalculateTotal(): void
    {
        $this->update(['total' => round((float) $this->items()->sum('line_total'), 2)]);
    }
}
