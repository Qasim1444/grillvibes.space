<?php

namespace App\Services;

use App\Models\Order;
use App\Models\PromoCode;
use App\Models\PromoRedemption;
use Illuminate\Validation\ValidationException;

/**
 * Promo-code validation and redemption.
 *
 * Every rule check throws a `promo_code` validation message so Inertia surfaces
 * it next to the POS input, and `discount()` is the single place a code's payout
 * is computed — the client only ever sends the code string, never an amount.
 */
class PromoService
{
    /**
     * Resolve a code and compute its discount for this bill.
     *
     * `$ignoreOrderId` lets an edit of an order re-validate the code it already
     * carries without its own past redemption counting against the limits.
     *
     * @return array{code: PromoCode, discount: float}
     *
     * @throws ValidationException
     */
    public function validate(
        string $code,
        float $subtotal,
        ?int $customerId = null,
        ?int $ignoreOrderId = null,
    ): array {
        $code = strtoupper(trim($code));

        if ($code === '') {
            $this->fail('Enter a promo code.');
        }

        $promo = PromoCode::where('code', $code)->first();

        if (! $promo) {
            $this->fail("Promo code {$code} does not exist.");
        }

        if (! $promo->is_active) {
            $this->fail("Promo code {$code} is switched off.");
        }

        if (! $promo->hasStarted()) {
            $this->fail("Promo code {$code} starts on ".$promo->starts_at->format('d M Y').'.');
        }

        if ($promo->hasExpired()) {
            $this->fail("Promo code {$code} expired on ".$promo->ends_at->format('d M Y').'.');
        }

        if ($subtotal < (float) $promo->min_order_amount) {
            $this->fail('This code needs a minimum order of '.number_format((float) $promo->min_order_amount, 2).'.');
        }

        $used = $this->usageCount($promo, null, $ignoreOrderId);

        if ($promo->usage_limit !== null && $used >= $promo->usage_limit) {
            $this->fail("Promo code {$code} has reached its usage limit.");
        }

        if ($promo->usage_limit_per_customer !== null) {
            if ($customerId === null) {
                $this->fail("Promo code {$code} is limited per customer — pick a customer first.");
            }

            if ($this->usageCount($promo, $customerId, $ignoreOrderId) >= $promo->usage_limit_per_customer) {
                $this->fail('This customer has already used '.$code.' the maximum number of times.');
            }
        }

        $discount = $promo->discountFor($subtotal);

        if ($discount <= 0) {
            $this->fail("Promo code {$code} produces no discount on this order.");
        }

        return ['code' => $promo, 'discount' => $discount];
    }

    /**
     * Record that an order used a code. `used_count` is a cache of
     * `promo_redemptions`, kept in step here so the limit checks stay cheap.
     */
    public function redeem(Order $order, PromoCode $promo, float $discount): PromoRedemption
    {
        $redemption = PromoRedemption::create([
            'promo_code_id' => $promo->id,
            'order_id' => $order->id,
            'customer_id' => $order->customer_id,
            'discount_amount' => round($discount, 2),
        ]);

        $promo->increment('used_count');

        return $redemption;
    }

    /**
     * Undo an order's redemption — called before an edit re-applies whatever the
     * order now carries, so a code swap cannot leave two redemptions behind.
     */
    public function release(Order $order): void
    {
        PromoRedemption::where('order_id', $order->id)
            ->get()
            ->each(function (PromoRedemption $redemption) {
                PromoCode::where('id', $redemption->promo_code_id)
                    ->where('used_count', '>', 0)
                    ->decrement('used_count');

                $redemption->delete();
            });
    }

    /** Redemptions counted from the ledger table rather than the cached counter. */
    private function usageCount(PromoCode $promo, ?int $customerId, ?int $ignoreOrderId): int
    {
        return PromoRedemption::where('promo_code_id', $promo->id)
            ->when($customerId !== null, fn ($q) => $q->where('customer_id', $customerId))
            ->when($ignoreOrderId !== null, fn ($q) => $q->where(fn ($w) => $w
                ->whereNull('order_id')
                ->orWhere('order_id', '!=', $ignoreOrderId)))
            ->count();
    }

    /** @throws ValidationException */
    private function fail(string $message): never
    {
        throw ValidationException::withMessages(['promo_code' => $message]);
    }
}
