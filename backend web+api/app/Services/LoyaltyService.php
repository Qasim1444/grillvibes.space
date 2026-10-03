<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\LoyaltySetting;
use App\Models\LoyaltyTransaction;
use App\Models\Order;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * The points ledger.
 *
 * `loyalty_transactions` is append-only: a mistake is corrected with a new
 * `adjust` row, never by editing history. Every row records `balance_after`, and
 * `customers.loyalty_points_balance` is a cache of the latest one, written in the
 * same transaction so the two can never disagree.
 *
 * A positive row (earn, or a positive adjust) opens a **lot** carrying
 * `points_remaining` and an optional `expires_at`. Negative rows consume the
 * oldest lots first, which is what lets `points_expiry_days` be enforced without
 * ever expiring points the customer already spent.
 */
class LoyaltyService
{
    public function settings(): LoyaltySetting
    {
        return LoyaltySetting::current();
    }

    public function balance(Customer $customer): int
    {
        return (int) $customer->loyalty_points_balance;
    }

    /**
     * Most points that may be spent on this bill — the smaller of the balance and
     * the `max_redeem_percent` cap. Drives the POS hint, but `quoteRedemption()`
     * re-checks it server-side.
     */
    public function maxRedeemablePoints(float $subtotal, int $balance): int
    {
        $settings = $this->settings();
        $rate = (float) $settings->currency_per_point;

        if (! $settings->is_active || $rate <= 0 || $balance <= 0) {
            return 0;
        }

        $cap = $subtotal * ((int) $settings->max_redeem_percent / 100);

        return (int) min($balance, floor($cap / $rate));
    }

    /**
     * Currency value of spending `$points` on a bill of `$subtotal`, with every
     * programme rule enforced.
     *
     * @throws ValidationException
     */
    public function quoteRedemption(Customer $customer, int $points, float $subtotal): float
    {
        $settings = $this->settings();

        if (! $settings->is_active) {
            $this->fail('The loyalty programme is switched off.');
        }

        if ($points <= 0) {
            $this->fail('Enter how many points to redeem.');
        }

        $balance = $this->balance($customer);

        if ($points > $balance) {
            $this->fail("{$customer->name} only has {$balance} point(s).");
        }

        if ($points < (int) $settings->min_redeem_points) {
            $this->fail('At least '.$settings->min_redeem_points.' points are needed to redeem.');
        }

        $allowed = $this->maxRedeemablePoints($subtotal, $balance);

        if ($points > $allowed) {
            $this->fail("Points may cover at most {$settings->max_redeem_percent}% of this order — {$allowed} point(s) here.");
        }

        return round($points * (float) $settings->currency_per_point, 2);
    }

    /** Spend points against an order. Assumes `quoteRedemption()` already passed. */
    public function applyRedemption(Order $order, Customer $customer, int $points, float $discount): LoyaltyTransaction
    {
        return $this->post(
            $customer,
            LoyaltyTransaction::REDEEM,
            -abs($points),
            [
                'order_id' => $order->id,
                'note' => 'Redeemed on order #'.$order->id.' ('.number_format($discount, 2).' off)',
            ],
        );
    }

    /**
     * Grant points for a paid order. Silent no-op when the programme is off, the
     * order has no customer, it is not paid, or it has already earned — that last
     * guard is what stops a `paid` toggle from paying out twice.
     */
    public function earn(Order $order): ?LoyaltyTransaction
    {
        $settings = $this->settings();

        if (! $settings->is_active || ! $order->paid || $order->customer_id === null) {
            return null;
        }

        if ((int) $order->loyalty_points_earned > 0) {
            return null;
        }

        $points = (int) floor((float) $order->grand_total * (float) $settings->points_per_currency);

        if ($points <= 0) {
            return null;
        }

        $customer = Customer::find($order->customer_id);

        if (! $customer) {
            return null;
        }

        $transaction = $this->post($customer, LoyaltyTransaction::EARN, $points, [
            'order_id' => $order->id,
            'note' => 'Earned on order #'.$order->id,
        ]);

        $order->forceFill(['loyalty_points_earned' => $points])->save();

        return $transaction;
    }

    /**
     * Undo everything an order did to the ledger, so an edit can re-apply from
     * scratch. Reversals are compensating `adjust` rows — history is never
     * deleted. A reversal is clamped to the live balance, since points that were
     * already spent elsewhere cannot be clawed back into a negative balance.
     */
    public function reverseOrder(Order $order): void
    {
        $rows = LoyaltyTransaction::where('order_id', $order->id)
            ->whereIn('type', [LoyaltyTransaction::EARN, LoyaltyTransaction::REDEEM])
            ->orderBy('id')
            ->get();

        foreach ($rows as $row) {
            $customer = Customer::find($row->customer_id);

            if (! $customer) {
                continue;
            }

            $points = -$row->points;

            if ($points < 0) {
                // Reversing an earn: never past zero.
                $points = -min(abs($points), $this->balance($customer));
            }

            if ($points === 0) {
                continue;
            }

            $this->post($customer, LoyaltyTransaction::ADJUST, $points, [
                'order_id' => $order->id,
                'note' => 'Reversed '.$row->type.' for order #'.$order->id,
            ]);
        }

        $order->forceFill([
            'loyalty_points_earned' => 0,
            'loyalty_points_redeemed' => 0,
            'loyalty_discount' => 0,
        ])->save();
    }

    /** Manual correction from the admin — signed points, reason required. */
    public function adjust(Customer $customer, int $points, string $note, ?int $by = null): LoyaltyTransaction
    {
        if ($points === 0) {
            $this->fail('Enter a non-zero number of points.', 'points');
        }

        if ($points < 0 && abs($points) > $this->balance($customer)) {
            $this->fail("{$customer->name} only has ".$this->balance($customer).' point(s) to deduct.', 'points');
        }

        return $this->post($customer, LoyaltyTransaction::ADJUST, $points, [
            'note' => $note,
            'created_by' => $by,
        ]);
    }

    /**
     * Write off lots whose `expires_at` has passed, oldest first, one `expire`
     * row per customer. Idempotent — a swept lot has `points_remaining` 0 and is
     * skipped next time.
     *
     * @return int points written off
     */
    public function expireDuePoints(): int
    {
        $due = LoyaltyTransaction::query()
            ->where('points_remaining', '>', 0)
            ->whereNotNull('expires_at')
            ->whereDate('expires_at', '<', now()->toDateString())
            ->orderBy('id')
            ->get()
            ->groupBy('customer_id');

        $total = 0;

        foreach ($due as $customerId => $lots) {
            $customer = Customer::find($customerId);

            if (! $customer) {
                continue;
            }

            DB::transaction(function () use ($customer, $lots, &$total) {
                $points = (int) $lots->sum('points_remaining');
                // Cannot write off more than the customer actually holds.
                $points = min($points, $this->balance($customer));

                LoyaltyTransaction::whereIn('id', $lots->pluck('id'))->update(['points_remaining' => 0]);

                if ($points <= 0) {
                    return;
                }

                // The specific lots are already zeroed above, so this row must not
                // consume lots again.
                $this->post($customer, LoyaltyTransaction::EXPIRE, -$points, [
                    'note' => 'Points expired',
                ], consumeLots: false);

                $total += $points;
            });
        }

        return $total;
    }

    /**
     * The only writer. Locks the customer row, appends the ledger entry with its
     * resulting balance, refreshes the cached balance, and moves the lots.
     *
     * @param  array<string, mixed>  $extra
     */
    private function post(
        Customer $customer,
        string $type,
        int $points,
        array $extra = [],
        bool $consumeLots = true,
    ): LoyaltyTransaction {
        return DB::transaction(function () use ($customer, $type, $points, $extra, $consumeLots) {
            // Serialises concurrent checkouts for one customer so two redemptions
            // cannot both read the same balance.
            $locked = Customer::whereKey($customer->id)->lockForUpdate()->first() ?? $customer;
            $balance = (int) $locked->loyalty_points_balance + $points;

            if ($balance < 0) {
                $this->fail('That would take the points balance below zero.');
            }

            $settings = $this->settings();
            $expiryDays = (int) $settings->points_expiry_days;

            $transaction = LoyaltyTransaction::create(array_merge([
                'customer_id' => $customer->id,
                'type' => $type,
                'points' => $points,
                'balance_after' => $balance,
                'points_remaining' => max(0, $points),
                'expires_at' => $points > 0 && $expiryDays > 0
                    ? now()->addDays($expiryDays)->toDateString()
                    : null,
            ], $extra));

            if ($points < 0 && $consumeLots) {
                $this->consumeLots($customer->id, abs($points));
            }

            $locked->forceFill(['loyalty_points_balance' => $balance])->save();
            $customer->loyalty_points_balance = $balance;

            return $transaction;
        });
    }

    /** Draw `$points` from the oldest unspent lots (FIFO). */
    private function consumeLots(int $customerId, int $points): void
    {
        $lots = LoyaltyTransaction::where('customer_id', $customerId)
            ->where('points_remaining', '>', 0)
            ->orderBy('id')
            ->get();

        foreach ($lots as $lot) {
            if ($points <= 0) {
                break;
            }

            $take = min((int) $lot->points_remaining, $points);
            $lot->forceFill(['points_remaining' => (int) $lot->points_remaining - $take])->save();
            $points -= $take;
        }
    }

    /** @throws ValidationException */
    private function fail(string $message, string $field = 'redeem_points'): never
    {
        throw ValidationException::withMessages([$field => $message]);
    }
}
