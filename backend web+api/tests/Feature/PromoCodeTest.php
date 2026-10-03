<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\FoodItem;
use App\Models\Order;
use App\Models\Place;
use App\Models\PromoCode;
use App\Models\PromoRedemption;
use App\Models\Role;
use App\Models\User;
use App\Services\PromoService;
use App\Services\ReceiptGenerator;
use Database\Seeders\PermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;
use Mockery;
use Tests\TestCase;

/**
 * Promo-code rules, and the checkout path that applies them.
 *
 * The service tests pin each individual rule; the checkout tests prove the
 * money columns are written from the database's own numbers rather than from
 * whatever the client posted.
 */
class PromoCodeTest extends TestCase
{
    use RefreshDatabase;

    private function promos(): PromoService
    {
        return app(PromoService::class);
    }

    private function superAdmin(): User
    {
        $this->seed(PermissionSeeder::class);

        $user = User::factory()->create();
        $user->roles()->sync([Role::where('slug', 'super-admin')->value('id')]);

        return $user->fresh();
    }

    /**
     * The receipt renderer needs GD, a TTF font and a writable storage path, and
     * then does a 60s WhatsApp upload — none of which belong in a unit test. The
     * mock stands in for it so `store()` can be exercised end to end.
     */
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

    /**
     * A one-line, 1000-currency order. `grand_total` is deliberately nonsense so
     * a passing assertion proves the server recomputed it.
     */
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

    public function test_an_expired_code_is_rejected(): void
    {
        PromoCode::create([
            'code' => 'GONE',
            'type' => PromoCode::FIXED,
            'value' => 100,
            'ends_at' => now()->subDay()->toDateString(),
        ]);

        $this->expectException(ValidationException::class);
        $this->expectExceptionMessage('expired');

        $this->promos()->validate('GONE', 1000);
    }

    public function test_a_code_that_has_not_started_is_rejected(): void
    {
        PromoCode::create([
            'code' => 'SOON',
            'type' => PromoCode::FIXED,
            'value' => 100,
            'starts_at' => now()->addWeek()->toDateString(),
        ]);

        $this->expectException(ValidationException::class);
        $this->expectExceptionMessage('starts on');

        $this->promos()->validate('SOON', 1000);
    }

    public function test_min_order_amount_is_enforced(): void
    {
        PromoCode::create([
            'code' => 'FLAT100',
            'type' => PromoCode::FIXED,
            'value' => 100,
            'min_order_amount' => 500,
        ]);

        try {
            $this->promos()->validate('FLAT100', 499);
            $this->fail('A bill below min_order_amount should not have been accepted.');
        } catch (ValidationException $e) {
            $this->assertStringContainsString('minimum order of 500.00', $e->errors()['promo_code'][0]);
        }

        // One rupee over the line and the same code goes through.
        $this->assertSame(100.0, $this->promos()->validate('FLAT100', 500)['discount']);
    }

    public function test_the_global_usage_limit_is_respected(): void
    {
        $promo = PromoCode::create([
            'code' => 'FIRST5',
            'type' => PromoCode::FIXED,
            'value' => 50,
            'usage_limit' => 1,
        ]);

        $order = Order::factory()->create();
        $this->promos()->redeem($order, $promo, 50);

        $this->assertSame(1, $promo->fresh()->used_count);

        try {
            $this->promos()->validate('FIRST5', 1000);
            $this->fail('The code was exhausted and should have been refused.');
        } catch (ValidationException $e) {
            $this->assertStringContainsString('usage limit', $e->errors()['promo_code'][0]);
        }

        // The order that consumed it may still re-validate its own code on an
        // edit — otherwise saving an unrelated field would fail the whole form.
        $this->assertSame(50.0, $this->promos()->validate('FIRST5', 1000, null, $order->id)['discount']);
    }

    public function test_the_per_customer_limit_is_respected(): void
    {
        $promo = PromoCode::create([
            'code' => 'ONEEACH',
            'type' => PromoCode::FIXED,
            'value' => 75,
            'usage_limit_per_customer' => 1,
        ]);

        $customer = Customer::factory()->create();
        $other = Customer::factory()->create();

        $order = Order::factory()->create(['customer_id' => $customer->id]);
        $this->promos()->redeem($order, $promo, 75);

        try {
            $this->promos()->validate('ONEEACH', 1000, $customer->id);
            $this->fail('The customer had already used the code.');
        } catch (ValidationException $e) {
            $this->assertStringContainsString('already used', $e->errors()['promo_code'][0]);
        }

        // A per-customer cap is unenforceable on a walk-in, so it is refused
        // outright rather than silently treated as unlimited.
        try {
            $this->promos()->validate('ONEEACH', 1000);
            $this->fail('A per-customer code should not apply without a customer.');
        } catch (ValidationException $e) {
            $this->assertStringContainsString('pick a customer first', $e->errors()['promo_code'][0]);
        }

        $this->assertSame(75.0, $this->promos()->validate('ONEEACH', 1000, $other->id)['discount']);
    }

    public function test_max_discount_caps_a_percentage_code(): void
    {
        PromoCode::create([
            'code' => 'SAVE20',
            'type' => PromoCode::PERCENTAGE,
            'value' => 20,
            'max_discount' => 150,
        ]);

        // 20% of 500 is under the cap.
        $this->assertSame(100.0, $this->promos()->validate('SAVE20', 500)['discount']);
        // 20% of 2000 is 400, clipped to the 150 ceiling.
        $this->assertSame(150.0, $this->promos()->validate('SAVE20', 2000)['discount']);
    }

    public function test_a_fixed_code_never_exceeds_the_bill(): void
    {
        PromoCode::create(['code' => 'BIG', 'type' => PromoCode::FIXED, 'value' => 500]);

        $this->assertSame(200.0, $this->promos()->validate('BIG', 200)['discount']);
    }

    public function test_an_inactive_or_unknown_code_is_rejected(): void
    {
        PromoCode::create([
            'code' => 'OFF',
            'type' => PromoCode::FIXED,
            'value' => 100,
            'is_active' => false,
        ]);

        foreach (['OFF' => 'switched off', 'NOPE' => 'does not exist'] as $code => $expected) {
            try {
                $this->promos()->validate($code, 1000);
                $this->fail("{$code} should have been refused.");
            } catch (ValidationException $e) {
                $this->assertStringContainsString($expected, $e->errors()['promo_code'][0]);
            }
        }
    }

    public function test_checkout_prices_the_code_server_side_and_ignores_the_posted_total(): void
    {
        $this->fakeReceipt();
        $admin = $this->superAdmin();

        PromoCode::create([
            'code' => 'save10',
            'type' => PromoCode::PERCENTAGE,
            'value' => 10,
        ]);

        $this->actingAs($admin)
            ->post('/orders', $this->payload([
                'promo_code' => 'save10',
                'service_charges_percentage' => 5,
            ]))
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $order = Order::latest('id')->first();

        // 10% of 1000 = 100 off, then 5% service on the 900 that remains.
        $this->assertSame('100.00', $order->promo_discount);
        $this->assertSame('45.00', $order->service_charges);
        $this->assertSame('945.00', $order->grand_total);
        $this->assertSame('SAVE10', $order->promoCode->code);

        // The redemption is recorded and the cached counter agrees with it.
        $this->assertDatabaseHas('promo_redemptions', [
            'order_id' => $order->id,
            'discount_amount' => 100,
        ]);
        $this->assertSame(1, PromoCode::where('code', 'SAVE10')->value('used_count'));
    }

    public function test_checkout_refuses_a_code_whose_rules_do_not_pass(): void
    {
        $this->fakeReceipt();
        $admin = $this->superAdmin();

        PromoCode::create([
            'code' => 'FLAT100',
            'type' => PromoCode::FIXED,
            'value' => 100,
            'min_order_amount' => 5000,
        ]);

        $this->actingAs($admin)
            ->post('/orders', $this->payload(['promo_code' => 'FLAT100']))
            ->assertSessionHasErrors('promo_code');

        // The whole checkout rolls back — no half-saved order behind the error.
        $this->assertDatabaseCount('orders', 0);
        $this->assertDatabaseCount('order_items', 0);
    }

    public function test_checkout_refuses_discounts_that_together_exceed_the_bill(): void
    {
        $this->fakeReceipt();
        $admin = $this->superAdmin();

        PromoCode::create(['code' => 'HALF', 'type' => PromoCode::PERCENTAGE, 'value' => 50]);

        $this->actingAs($admin)
            ->post('/orders', $this->payload([
                'promo_code' => 'HALF',
                'discount_amount' => 600, // 600 manual + 500 promo on a 1000 bill
            ]))
            ->assertSessionHasErrors('discount_amount');

        $this->assertDatabaseCount('orders', 0);
    }

    public function test_swapping_the_code_on_an_edit_leaves_one_redemption_behind(): void
    {
        $this->fakeReceipt();
        $admin = $this->superAdmin();

        PromoCode::create(['code' => 'TEN', 'type' => PromoCode::PERCENTAGE, 'value' => 10]);
        PromoCode::create(['code' => 'TWENTY', 'type' => PromoCode::PERCENTAGE, 'value' => 20]);

        $payload = $this->payload(['promo_code' => 'TEN']);
        $this->actingAs($admin)->post('/orders', $payload)->assertSessionHasNoErrors();

        $order = Order::latest('id')->first();

        $this->actingAs($admin)
            ->put("/orders/{$order->id}", array_merge($payload, ['promo_code' => 'TWENTY']))
            ->assertSessionHasNoErrors();

        $order->refresh();

        $this->assertSame('200.00', $order->promo_discount);
        $this->assertSame('800.00', $order->grand_total);
        $this->assertSame('TWENTY', $order->promoCode->code);

        // The old code's counter is handed back, the new one's is taken.
        $this->assertSame(0, PromoCode::where('code', 'TEN')->value('used_count'));
        $this->assertSame(1, PromoCode::where('code', 'TWENTY')->value('used_count'));
        $this->assertSame(1, PromoRedemption::where('order_id', $order->id)->count());
    }

    public function test_dropping_the_code_on_an_edit_clears_the_discount(): void
    {
        $this->fakeReceipt();
        $admin = $this->superAdmin();

        PromoCode::create(['code' => 'TEN', 'type' => PromoCode::PERCENTAGE, 'value' => 10]);

        $payload = $this->payload(['promo_code' => 'TEN']);
        $this->actingAs($admin)->post('/orders', $payload)->assertSessionHasNoErrors();

        $order = Order::latest('id')->first();
        unset($payload['promo_code']);

        $this->actingAs($admin)->put("/orders/{$order->id}", $payload)->assertSessionHasNoErrors();

        $order->refresh();

        $this->assertNull($order->promo_code_id);
        $this->assertSame('0.00', $order->promo_discount);
        $this->assertSame('1000.00', $order->grand_total);
        $this->assertSame(0, PromoCode::where('code', 'TEN')->value('used_count'));
        $this->assertSame(0, PromoRedemption::where('order_id', $order->id)->count());
    }

    public function test_the_quote_endpoint_previews_without_redeeming(): void
    {
        $admin = $this->superAdmin();

        PromoCode::create(['code' => 'SAVE20', 'type' => PromoCode::PERCENTAGE, 'value' => 20]);

        $this->actingAs($admin)
            ->getJson('/orders/quote-promo?code=save20&subtotal=1000')
            ->assertOk()
            ->assertJson(['code' => 'SAVE20', 'discount' => 200]);

        // A preview must not consume the code.
        $this->assertSame(0, PromoCode::where('code', 'SAVE20')->value('used_count'));
        $this->assertDatabaseCount('promo_redemptions', 0);
    }

    public function test_the_quote_endpoint_returns_the_rule_failure_as_a_field_error(): void
    {
        $admin = $this->superAdmin();

        PromoCode::create([
            'code' => 'FLAT100',
            'type' => PromoCode::FIXED,
            'value' => 100,
            'min_order_amount' => 500,
        ]);

        $this->actingAs($admin)
            ->getJson('/orders/quote-promo?code=FLAT100&subtotal=100')
            ->assertStatus(422)
            ->assertJsonValidationErrors('promo_code');
    }

    public function test_the_quote_endpoint_is_blocked_without_permission(): void
    {
        $this->seed(PermissionSeeder::class);

        $this->actingAs(User::factory()->create())
            ->get('/orders/quote-promo?code=X&subtotal=100')
            ->assertForbidden();
    }
}
