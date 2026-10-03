<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\FoodItem;
use App\Models\LoyaltySetting;
use App\Models\LoyaltyTransaction;
use App\Models\Order;
use App\Models\Place;
use App\Models\Role;
use App\Models\User;
use App\Services\LoyaltyService;
use App\Services\ReceiptGenerator;
use Database\Seeders\PermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;
use Mockery;
use Tests\TestCase;

/**
 * The points ledger and its checkout wiring.
 *
 * The invariant every test here leans on: `customers.loyalty_points_balance` is
 * only ever a cache of the newest `loyalty_transactions.balance_after`. If those
 * two can drift, the POS shows a balance the checkout will refuse.
 */
class LoyaltyTest extends TestCase
{
    use RefreshDatabase;

    private function loyalty(): LoyaltyService
    {
        return app(LoyaltyService::class);
    }

    /** Turn the programme on with known rates: 1 point per unit, 1 unit per point. */
    private function settings(array $overrides = []): LoyaltySetting
    {
        $settings = LoyaltySetting::current();

        $settings->update(array_merge([
            'is_active' => true,
            'points_per_currency' => 1,
            'currency_per_point' => 1,
            'min_redeem_points' => 100,
            'max_redeem_percent' => 50,
            'points_expiry_days' => 0,
        ], $overrides));

        return $settings->fresh();
    }

    /** A customer holding `$points`, credited through the ledger rather than poked in. */
    private function customerWith(int $points): Customer
    {
        $customer = Customer::factory()->create();

        if ($points > 0) {
            $this->loyalty()->adjust($customer, $points, 'Opening balance');
        }

        return $customer->fresh();
    }

    private function superAdmin(): User
    {
        $this->seed(PermissionSeeder::class);

        $user = User::factory()->create();
        $user->roles()->sync([Role::where('slug', 'super-admin')->value('id')]);

        return $user->fresh();
    }

    /** See PromoCodeTest — the renderer needs GD, a font and an HTTP round trip. */
    private function fakeReceipt(): void
    {
        Http::fake();

        $path = storage_path('app/testing/receipt.png');
        File::ensureDirectoryExists(dirname($path));
        File::put($path, 'not-really-a-png');

        $generator = Mockery::mock(ReceiptGenerator::class);
        $generator->shouldReceive('generate')->andReturn([
            'path' => $path,
            'relative' => 'receipts/receipt.png',
            'filename' => 'receipt.png',
        ]);

        $this->instance(ReceiptGenerator::class, $generator);
    }

    private function payload(array $overrides = []): array
    {
        $item = FoodItem::factory()->create(['price' => 250]);

        return array_merge([
            'order_datetime' => now()->toDateTimeString(),
            'status' => 'complete',
            'paid' => true,
            'type' => 'dining',
            'qty' => 4,
            'subtotal' => 1000,
            'discount_type' => 'amount',
            'discount_amount' => 0,
            'service_charges' => 0,
            'service_charges_percentage' => 0,
            'grand_total' => 1,
            'place_id' => Place::factory()->create()->id,
            'order_items' => [[
                'fooditems_id' => $item->id,
                'category_id' => $item->foodcategory_id,
                'quantity' => 4,
                'sub_total' => 1000,
            ]],
        ], $overrides);
    }

    /** The one invariant: the cached balance equals the newest ledger row. */
    private function assertLedgerAgrees(Customer $customer): void
    {
        $latest = LoyaltyTransaction::where('customer_id', $customer->id)
            ->orderByDesc('id')
            ->first();

        $this->assertNotNull($latest, 'Expected at least one ledger row.');
        $this->assertSame(
            (int) $latest->balance_after,
            (int) $customer->fresh()->loyalty_points_balance,
            'The cached balance drifted from the ledger.'
        );

        // The running total of the signed column must land on the same number.
        $this->assertSame(
            (int) LoyaltyTransaction::where('customer_id', $customer->id)->sum('points'),
            (int) $latest->balance_after
        );
    }

    public function test_a_paid_order_earns_points_and_the_ledger_matches_the_cache(): void
    {
        $this->settings(['points_per_currency' => 0.5]);

        $customer = Customer::factory()->create();
        $order = Order::factory()->create([
            'customer_id' => $customer->id,
            'paid' => true,
            'grand_total' => 1250,
        ]);

        $transaction = $this->loyalty()->earn($order);

        // floor(1250 * 0.5)
        $this->assertSame(625, $transaction->points);
        $this->assertSame(LoyaltyTransaction::EARN, $transaction->type);
        $this->assertSame(625, (int) $order->fresh()->loyalty_points_earned);
        $this->assertSame(625, (int) $customer->fresh()->loyalty_points_balance);
        $this->assertLedgerAgrees($customer);
    }

    public function test_an_unpaid_order_earns_nothing(): void
    {
        $this->settings();

        $customer = Customer::factory()->create();
        $order = Order::factory()->create([
            'customer_id' => $customer->id,
            'paid' => false,
            'grand_total' => 900,
        ]);

        $this->assertNull($this->loyalty()->earn($order));
        $this->assertSame(0, (int) $customer->fresh()->loyalty_points_balance);
        $this->assertDatabaseCount('loyalty_transactions', 0);
    }

    public function test_earning_twice_on_the_same_order_pays_out_once(): void
    {
        $this->settings();

        $customer = Customer::factory()->create();
        $order = Order::factory()->create([
            'customer_id' => $customer->id,
            'paid' => true,
            'grand_total' => 400,
        ]);

        $this->loyalty()->earn($order);
        // A `paid` toggle, a re-save, a retried request — all land here again.
        $this->assertNull($this->loyalty()->earn($order->fresh()));

        $this->assertSame(400, (int) $customer->fresh()->loyalty_points_balance);
        $this->assertSame(1, LoyaltyTransaction::where('order_id', $order->id)->count());
    }

    public function test_nothing_is_earned_while_the_programme_is_off(): void
    {
        $this->settings(['is_active' => false]);

        $customer = Customer::factory()->create();
        $order = Order::factory()->create([
            'customer_id' => $customer->id,
            'paid' => true,
            'grand_total' => 1000,
        ]);

        $this->assertNull($this->loyalty()->earn($order));
        $this->assertDatabaseCount('loyalty_transactions', 0);
    }

    public function test_a_redemption_within_the_percentage_cap_is_priced_and_posted(): void
    {
        $this->settings(['currency_per_point' => 0.5, 'max_redeem_percent' => 50]);

        $customer = $this->customerWith(2000);
        $order = Order::factory()->create(['customer_id' => $customer->id]);

        // 50% of a 1000 bill is 500, and at 0.5 per point that is 1000 points.
        $this->assertSame(1000, $this->loyalty()->maxRedeemablePoints(1000, 2000));

        $discount = $this->loyalty()->quoteRedemption($customer, 800, 1000);
        $this->assertSame(400.0, $discount);

        $this->loyalty()->applyRedemption($order, $customer, 800, $discount);

        $this->assertSame(1200, (int) $customer->fresh()->loyalty_points_balance);
        $this->assertLedgerAgrees($customer);
        $this->assertDatabaseHas('loyalty_transactions', [
            'order_id' => $order->id,
            'type' => LoyaltyTransaction::REDEEM,
            'points' => -800,
        ]);
    }

    public function test_redeeming_past_the_percentage_cap_fails(): void
    {
        $this->settings(['max_redeem_percent' => 20]);

        $customer = $this->customerWith(5000);

        try {
            // 20% of 1000 leaves room for 200 points, not 400.
            $this->loyalty()->quoteRedemption($customer, 400, 1000);
            $this->fail('The percentage cap should have refused this.');
        } catch (ValidationException $e) {
            $this->assertStringContainsString('at most 20%', $e->errors()['redeem_points'][0]);
        }

        $this->assertSame(5000, (int) $customer->fresh()->loyalty_points_balance);
    }

    public function test_redeeming_more_than_the_balance_fails(): void
    {
        $this->settings();

        $customer = $this->customerWith(150);

        try {
            $this->loyalty()->quoteRedemption($customer, 400, 5000);
            $this->fail('Spending points the customer does not hold should fail.');
        } catch (ValidationException $e) {
            $this->assertStringContainsString('only has 150 point(s)', $e->errors()['redeem_points'][0]);
        }
    }

    public function test_redeeming_below_the_minimum_fails(): void
    {
        $this->settings(['min_redeem_points' => 100]);

        $customer = $this->customerWith(500);

        try {
            $this->loyalty()->quoteRedemption($customer, 50, 5000);
            $this->fail('A redemption under min_redeem_points should fail.');
        } catch (ValidationException $e) {
            $this->assertStringContainsString('At least 100 points', $e->errors()['redeem_points'][0]);
        }
    }

    public function test_redeeming_while_the_programme_is_off_fails(): void
    {
        $this->settings(['is_active' => false]);

        $customer = Customer::factory()->create(['loyalty_points_balance' => 500]);

        $this->expectException(ValidationException::class);
        $this->expectExceptionMessage('switched off');

        $this->loyalty()->quoteRedemption($customer, 200, 5000);
    }

    public function test_a_manual_deduction_cannot_go_below_zero(): void
    {
        $this->settings();

        $customer = $this->customerWith(100);

        try {
            $this->loyalty()->adjust($customer, -400, 'Typo');
            $this->fail('Deducting more than the balance should fail.');
        } catch (ValidationException $e) {
            $this->assertStringContainsString('only has 100 point(s)', $e->errors()['points'][0]);
        }

        $this->assertSame(100, (int) $customer->fresh()->loyalty_points_balance);
    }

    public function test_expired_lots_are_written_off_once(): void
    {
        $this->settings(['points_expiry_days' => 30]);

        $customer = $this->customerWith(0);

        // An old lot, then a fresh one. Only the old lot is due.
        $this->loyalty()->adjust($customer, 300, 'Old credit');
        LoyaltyTransaction::where('customer_id', $customer->id)
            ->update(['expires_at' => now()->subDay()->toDateString()]);
        $this->loyalty()->adjust($customer, 200, 'Recent credit');

        $this->assertSame(300, $this->loyalty()->expireDuePoints());
        $this->assertSame(200, (int) $customer->fresh()->loyalty_points_balance);
        $this->assertLedgerAgrees($customer);

        // Idempotent: the swept lot is already at zero remaining.
        $this->assertSame(0, $this->loyalty()->expireDuePoints());
        $this->assertSame(200, (int) $customer->fresh()->loyalty_points_balance);
    }

    public function test_redemptions_consume_the_oldest_lot_first(): void
    {
        $this->settings(['points_expiry_days' => 30, 'min_redeem_points' => 1]);

        $customer = $this->customerWith(0);

        $first = $this->loyalty()->adjust($customer, 300, 'First lot');
        $second = $this->loyalty()->adjust($customer, 300, 'Second lot');

        $order = Order::factory()->create(['customer_id' => $customer->id]);
        $this->loyalty()->applyRedemption($order, $customer, 400, 400);

        // 300 out of the first lot, then 100 out of the second.
        $this->assertSame(0, (int) $first->fresh()->points_remaining);
        $this->assertSame(200, (int) $second->fresh()->points_remaining);
        $this->assertLedgerAgrees($customer);
    }

    public function test_checkout_prices_the_redemption_and_recomputes_the_total(): void
    {
        $this->fakeReceipt();
        $this->settings(['currency_per_point' => 0.5, 'points_per_currency' => 1]);
        $admin = $this->superAdmin();

        $customer = $this->customerWith(1000);

        $this->actingAs($admin)
            ->post('/orders', $this->payload([
                'customer_id' => $customer->id,
                'redeem_points' => 400,
            ]))
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $order = Order::latest('id')->first();

        // 400 points at 0.5 = 200 off a 1000 bill, so 800 to pay.
        $this->assertSame(400, (int) $order->loyalty_points_redeemed);
        $this->assertSame('200.00', $order->loyalty_discount);
        $this->assertSame('800.00', $order->grand_total);

        // Spent 400, then earned 800 back on the paid total: 1000 - 400 + 800.
        $this->assertSame(800, (int) $order->loyalty_points_earned);
        $this->assertSame(1400, (int) $customer->fresh()->loyalty_points_balance);
        $this->assertLedgerAgrees($customer);
    }

    public function test_checkout_refuses_a_redemption_the_customer_cannot_afford(): void
    {
        $this->fakeReceipt();
        $this->settings();
        $admin = $this->superAdmin();

        $customer = $this->customerWith(100);

        $this->actingAs($admin)
            ->post('/orders', $this->payload([
                'customer_id' => $customer->id,
                'redeem_points' => 400,
            ]))
            ->assertSessionHasErrors('redeem_points');

        // Rolled back whole: no order, and the balance is untouched.
        $this->assertDatabaseCount('orders', 0);
        $this->assertSame(100, (int) $customer->fresh()->loyalty_points_balance);
    }

    public function test_checkout_refuses_points_without_a_customer(): void
    {
        $this->fakeReceipt();
        $this->settings();
        $admin = $this->superAdmin();

        $this->actingAs($admin)
            ->post('/orders', $this->payload(['redeem_points' => 200]))
            ->assertSessionHasErrors('redeem_points');

        $this->assertDatabaseCount('orders', 0);
    }

    public function test_editing_an_order_reverses_and_reapplies_the_points(): void
    {
        $this->fakeReceipt();
        $this->settings(['currency_per_point' => 1, 'points_per_currency' => 1]);
        $admin = $this->superAdmin();

        $customer = $this->customerWith(1000);

        $payload = $this->payload([
            'customer_id' => $customer->id,
            'redeem_points' => 300,
        ]);

        $this->actingAs($admin)->post('/orders', $payload)->assertSessionHasNoErrors();

        $order = Order::latest('id')->first();
        // 1000 - 300 spent + 700 earned on the 700 bill.
        $this->assertSame(1400, (int) $customer->fresh()->loyalty_points_balance);

        // Halve the redemption; the total and both ledger effects must follow.
        $this->actingAs($admin)
            ->put("/orders/{$order->id}", array_merge($payload, ['redeem_points' => 150]))
            ->assertSessionHasNoErrors();

        $order->refresh();

        $this->assertSame(150, (int) $order->loyalty_points_redeemed);
        $this->assertSame('150.00', $order->loyalty_discount);
        $this->assertSame('850.00', $order->grand_total);
        $this->assertSame(850, (int) $order->loyalty_points_earned);
        // 1000 - 150 spent + 850 earned.
        $this->assertSame(1700, (int) $customer->fresh()->loyalty_points_balance);
        $this->assertLedgerAgrees($customer);
    }

    public function test_marking_an_edited_order_unpaid_takes_the_earned_points_back(): void
    {
        $this->fakeReceipt();
        $this->settings();
        $admin = $this->superAdmin();

        $customer = $this->customerWith(0);

        $payload = $this->payload(['customer_id' => $customer->id]);
        $this->actingAs($admin)->post('/orders', $payload)->assertSessionHasNoErrors();

        $order = Order::latest('id')->first();
        $this->assertSame(1000, (int) $customer->fresh()->loyalty_points_balance);

        $this->actingAs($admin)
            ->put("/orders/{$order->id}", array_merge($payload, ['paid' => false]))
            ->assertSessionHasNoErrors();

        $this->assertSame(0, (int) $order->fresh()->loyalty_points_earned);
        $this->assertSame(0, (int) $customer->fresh()->loyalty_points_balance);
        $this->assertLedgerAgrees($customer);
    }

    public function test_the_customer_search_ships_the_balance_for_the_pos_picker(): void
    {
        $this->settings();
        $admin = $this->superAdmin();

        $customer = $this->customerWith(250);

        $this->actingAs($admin)
            ->getJson('/customers/search?q='.urlencode($customer->name))
            ->assertOk()
            ->assertJsonFragment([
                'id' => $customer->id,
                'loyalty_points_balance' => 250,
            ]);
    }
}
