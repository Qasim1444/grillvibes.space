<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'customer_id',
        'rider_id',
        'order_datetime',
        'status',
        'delivery_status',
        'assigned_at',
        'accepted_at',
        'picked_up_at',
        'on_way_at',
        'delivered_at',
        'delivery_notes',
        'delivery_rejection_reason',
        'delivery_proof_path',
        'cash_collected',
        'paid',
        'type',
        'qty',
        'subtotal',
        'discount_type',
        'service_charges_percentage',
        'discount_amount',
        'service_charges',
        'grand_total',
        'place_id',
        'branch_id',
        'promo_code_id',
        'promo_discount',
        'loyalty_points_redeemed',
        'loyalty_discount',
        'loyalty_points_earned',
        // Recipe costing: total cost of goods sold, and the guard that records
        // ingredients have already been deducted for this order.
        'cogs_total',
        'stock_consumed_at',
    ];

    protected $casts = [
        'order_datetime' => 'datetime',
        'assigned_at' => 'datetime',
        'accepted_at' => 'datetime',
        'picked_up_at' => 'datetime',
        'on_way_at' => 'datetime',
        'delivered_at' => 'datetime',
        'paid' => 'boolean',
        'discount_amount' => 'decimal:2',
        'service_charges' => 'decimal:2',
        'grand_total' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'promo_discount' => 'decimal:2',
        'loyalty_discount' => 'decimal:2',
        'loyalty_points_redeemed' => 'integer',
        'loyalty_points_earned' => 'integer',
        'cogs_total' => 'decimal:2',
        'cash_collected' => 'decimal:2',
        'stock_consumed_at' => 'datetime',
    ];

    /** Gross margin on this sale, or null if it was never costed. */
    public function grossProfit(): ?float
    {
        if ($this->cogs_total === null) {
            return null;
        }

        return round((float) $this->grand_total - (float) $this->cogs_total, 2);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customer_id');
    }

    public function rider()
    {
        return $this->belongsTo(User::class, 'rider_id');
    }

    /** The outlet this sale belongs to (drives reports, KDS routing, stock). */
    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    /** The seating area (table) for a dine-in order. */
    public function place()
    {
        return $this->belongsTo(Place::class);
    }

    public function fooditem()
    {
        return $this->belongsTo(FoodItem::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function promoCode()
    {
        return $this->belongsTo(PromoCode::class, 'promo_code_id');
    }

    public function promoRedemption()
    {
        return $this->hasOne(PromoRedemption::class);
    }

    public function loyaltyTransactions()
    {
        return $this->hasMany(LoyaltyTransaction::class);
    }

    public function feedback()
    {
        return $this->hasOne(Feedback::class);
    }
}
