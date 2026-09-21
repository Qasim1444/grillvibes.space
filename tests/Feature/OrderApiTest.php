<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\FoodCategory;
use App\Models\FoodItem;
use App\Models\Order;
use App\Models\Place;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_lists_orders_with_totals(): void
    {
        Order::factory(3)->create();

        $this->getJson('/api/orders')
            ->assertStatus(200)
            ->assertJson([
                'status' => 'success',
                'total_orders' => 3,
            ])
            ->assertJsonCount(3, 'data');
    }

    public function test_it_shows_an_order_with_its_items(): void
    {
        $order = Order::factory()->create();

        $this->getJson("/api/orders/{$order->id}")
            ->assertStatus(200)
            ->assertJsonFragment(['id' => $order->id])
            ->assertJsonStructure(['id', 'order_items']);
    }

    public function test_it_updates_an_order_and_syncs_its_items(): void
    {
        $customer = Customer::factory()->create();
        $category = FoodCategory::factory()->create();
        $item = FoodItem::factory()->create(['foodcategory_id' => $category->id]);
        $place = Place::factory()->create();
        $order = Order::factory()->create(['customer_id' => $customer->id]);

        $payload = [
            'customer_id' => $customer->id,
            'order_datetime' => now()->toDateTimeString(),
            'status' => 'completed',
            'paid' => true,
            'type' => 'delivery',
            'qty' => 2,
            'subtotal' => 100,
            'discount_type' => 'amount',
            'discount_amount' => 10,
            'service_charges' => 5,
            'service_charges_percentage' => 5,
            'grand_total' => 95,
            'place_id' => $place->id,
            'order_items' => [
                [
                    'fooditems_id' => $item->id,
                    'quantity' => 2,
                    'category_id' => $category->id,
                    'sub_total' => 100,
                    'discount_amount' => 0,
                ],
            ],
        ];

        $this->putJson("/api/orders/{$order->id}", $payload)
            ->assertStatus(200)
            ->assertJsonFragment(['status' => 'completed']);

        $this->assertDatabaseHas('order_items', [
            'order_id' => $order->id,
            'fooditems_id' => $item->id,
            'quantity' => 2,
        ]);
    }

    public function test_it_soft_deletes_an_order(): void
    {
        $order = Order::factory()->create();

        $this->deleteJson("/api/orders/{$order->id}")
            ->assertStatus(200)
            ->assertJson(['status' => 'success']);

        $this->assertSoftDeleted('orders', ['id' => $order->id]);
    }
}
