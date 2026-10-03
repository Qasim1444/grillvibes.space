<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * A supplier.
 *
 * Shared master data: procurement raises purchase orders and books deliveries
 * against a vendor, and Expenses, Assets and Maintenance all reference the same
 * rows — so a vendor is retired by soft delete, never removed.
 */
class Vendor extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name', 'contact_person', 'phone', 'email',
        'address', 'tax_number', 'payment_terms',
        'is_active', 'notes',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function purchaseOrders()
    {
        return $this->hasMany(PurchaseOrder::class);
    }

    public function goodsReceipts()
    {
        return $this->hasMany(GoodsReceipt::class);
    }

    /** Purchase orders still awaiting delivery — what a buyer chases. */
    public function openPurchaseOrders()
    {
        return $this->purchaseOrders()->whereIn('status', [
            PurchaseOrder::STATUS_DRAFT,
            PurchaseOrder::STATUS_ORDERED,
            PurchaseOrder::STATUS_PARTIALLY_RECEIVED,
        ]);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
