<?php

namespace Tests\Feature;

use App\Models\FoodCategory;
use App\Models\FoodItem;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_daily_summary_report_totals_todays_orders(): void
    {
        Order::factory()->create(['order_datetime' => now(), 'type' => 'delivery', 'grand_total' => 100]);
        Order::factory()->create(['order_datetime' => now(), 'type' => 'dining', 'grand_total' => 50]);
        // An old order that must NOT be counted in today's totals.
        Order::factory()->create(['order_datetime' => now()->subMonths(2), 'grand_total' => 999]);

        $response = $this->getJson('/api/daily-summary/report')->assertStatus(200);

        $this->assertEqualsWithDelta(150, $response->json('totalGrandTotal'), 0.01);
    }

    public function test_daily_delivery_report_only_includes_delivery_orders(): void
    {
        Order::factory()->create(['order_datetime' => now(), 'type' => 'delivery', 'grand_total' => 80]);
        Order::factory()->create(['order_datetime' => now(), 'type' => 'dining', 'grand_total' => 40]);

        $response = $this->getJson('/api/daily-summary/reportdelivery')->assertStatus(200);

        $this->assertEqualsWithDelta(80, $response->json('totalGrandTotal'), 0.01);
    }

    public function test_daily_category_sales_report_groups_by_category(): void
    {
        $category = FoodCategory::factory()->create(['name' => 'Pizzas']);
        $item = FoodItem::factory()->create(['foodcategory_id' => $category->id]);
        $order = Order::factory()->create(['order_datetime' => now()]);

        OrderItem::factory()->create([
            'order_id' => $order->id,
            'fooditems_id' => $item->id,
            'category_id' => $category->id,
            'sub_total' => 120,
        ]);

        $this->getJson('/api/daily-category-sales/report')
            ->assertStatus(200)
            ->assertJsonFragment(['category_name' => 'Pizzas']);
    }

    public function test_quick_report_returns_todays_orders(): void
    {
        Order::factory(2)->create(['order_datetime' => now()]);
        Order::factory()->create(['order_datetime' => now()->subMonths(2)]);

        $this->getJson('/api/daily-summary/quick-report')
            ->assertStatus(200)
            ->assertJsonCount(2);
    }
}
