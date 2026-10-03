<?php

namespace Tests\Feature;

use App\Models\FoodCategory;
use App\Models\FoodItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Branch;
use App\Models\Place;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_daily_summary_report_totals_todays_orders(): void
    {
        $branch = Branch::create(['name' => 'Main Outlet', 'status' => true]);

        Order::factory()->create(['branch_id' => $branch->id, 'order_datetime' => now(), 'type' => 'delivery', 'grand_total' => 100]);
        Order::factory()->create(['branch_id' => $branch->id, 'order_datetime' => now(), 'type' => 'dining', 'grand_total' => 50]);
        // An old order that must NOT be counted in today's totals.
        Order::factory()->create([
            'branch_id' => $branch->id,
            'order_datetime' => now()->subMonths(2),
            'grand_total' => 999,
            'created_at' => now()->subMonths(2),
            'updated_at' => now()->subMonths(2),
        ]);

        $response = $this->getJson('/api/daily-summary/report?branch_id='.$branch->id)->assertStatus(200);

        $this->assertEqualsWithDelta(150, $response->json('totalGrandTotal'), 0.01);
    }

    public function test_daily_delivery_report_only_includes_delivery_orders(): void
    {
        $branch = Branch::create(['name' => 'Main Outlet', 'status' => true]);

        Order::factory()->create(['branch_id' => $branch->id, 'order_datetime' => now(), 'type' => 'delivery', 'grand_total' => 80]);
        Order::factory()->create(['branch_id' => $branch->id, 'order_datetime' => now(), 'type' => 'dining', 'grand_total' => 40]);

        $response = $this->getJson('/api/daily-summary/reportdelivery?branch_id='.$branch->id)->assertStatus(200);

        $this->assertEqualsWithDelta(80, $response->json('totalGrandTotal'), 0.01);
    }

    public function test_daily_category_sales_report_groups_by_category(): void
    {
        $category = FoodCategory::factory()->create(['name' => 'Pizzas']);
        $item = FoodItem::factory()->create(['foodcategory_id' => $category->id]);
        $branch = Branch::create(['name' => 'Main Outlet', 'status' => true]);
        $order = Order::factory()->create(['branch_id' => $branch->id, 'order_datetime' => now()]);

        OrderItem::factory()->create([
            'order_id' => $order->id,
            'fooditems_id' => $item->id,
            'category_id' => $category->id,
            'sub_total' => 120,
        ]);

        $this->getJson('/api/daily-category-sales/report?branch_id='.$branch->id)
            ->assertStatus(200)
            ->assertJsonFragment(['category_name' => 'Pizzas']);
    }

    public function test_quick_report_returns_todays_orders(): void
    {
        $branch = Branch::create(['name' => 'Main Outlet', 'status' => true]);

        Order::factory(2)->create(['branch_id' => $branch->id, 'order_datetime' => now()]);
        Order::factory()->create([
            'branch_id' => $branch->id,
            'order_datetime' => now()->subMonths(2),
            'created_at' => now()->subMonths(2),
            'updated_at' => now()->subMonths(2),
        ]);

        $this->getJson('/api/daily-summary/quick-report?branch_id='.$branch->id)
            ->assertStatus(200)
            ->assertJsonCount(2);
    }

    public function test_reports_include_api_orders_by_order_date_and_branch(): void
    {
        $branch = Branch::create(['name' => 'Mobile Outlet', 'status' => true]);
        $place = Place::factory()->create(['branch_id' => $branch->id, 'status' => true]);
        $category = FoodCategory::factory()->create(['name' => 'Deals']);
        $item = FoodItem::factory()->create(['foodcategory_id' => $category->id, 'name' => 'Mobile Burger']);
        $orderDate = now()->setTime(15, 30);

        $order = Order::factory()->create([
            'branch_id' => $branch->id,
            'place_id' => $place->id,
            'order_datetime' => $orderDate,
            'type' => 'dining',
            'grand_total' => 250,
            'service_charges' => 10,
        ]);

        $line = OrderItem::factory()->create([
            'order_id' => $order->id,
            'fooditems_id' => $item->id,
            'category_id' => $category->id,
            'quantity' => 2,
            'sub_total' => 240,
            'discount_amount' => 0,
        ]);
        $line->forceFill(['updated_at' => now()->subDays(3)])->save();

        $params = http_build_query([
            'start_date' => now()->toDateString(),
            'end_date' => now()->toDateString(),
            'branch_id' => $branch->id,
        ]);

        $this->getJson('/api/daily-summary/report?'.$params)
            ->assertStatus(200)
            ->assertJsonPath('totalGrandTotal', 250);

        $this->getJson('/api/daily-summary/quick-report?'.$params)
            ->assertStatus(200)
            ->assertJsonCount(1)
            ->assertJsonFragment(['id' => $order->id]);

        $this->getJson('/api/daily-summary/top-ten-deals-report?'.$params)
            ->assertStatus(200)
            ->assertJsonCount(1)
            ->assertJsonFragment(['id' => $order->id]);

        $this->getJson('/api/daily-category-sales-by-item-quantity/reportcurrentdate?'.$params)
            ->assertStatus(200)
            ->assertJsonPath('totalGrandTotal', 250)
            ->assertJsonFragment(['item_name' => 'Mobile Burger']);

        $this->getJson('/api/daily-category-sales-by-item-quantity/report?'.$params)
            ->assertStatus(200)
            ->assertJsonFragment(['item_name' => 'Mobile Burger']);
    }

    public function test_reports_include_existing_mobile_orders_shifted_to_created_local_date(): void
    {
        $branch = Branch::create(['name' => 'Mobile Outlet', 'status' => true]);
        $place = Place::factory()->create(['branch_id' => $branch->id, 'status' => true]);
        $category = FoodCategory::factory()->create(['name' => 'BBQ']);
        $item = FoodItem::factory()->create(['foodcategory_id' => $category->id, 'name' => 'Shifted Tikka']);

        $order = Order::factory()->create([
            'branch_id' => $branch->id,
            'place_id' => $place->id,
            'order_datetime' => '2026-09-20 19:30:00',
            'type' => 'dining',
            'grand_total' => 650,
            'service_charges' => 0,
            'created_at' => '2026-09-21 00:30:00',
            'updated_at' => '2026-09-21 00:30:00',
        ]);

        OrderItem::factory()->create([
            'order_id' => $order->id,
            'fooditems_id' => $item->id,
            'category_id' => $category->id,
            'quantity' => 1,
            'sub_total' => 650,
            'discount_amount' => 0,
            'created_at' => '2026-09-21 00:30:00',
            'updated_at' => '2026-09-21 00:30:00',
        ]);

        $params = http_build_query([
            'start_date' => '2026-09-21',
            'end_date' => '2026-09-21',
            'branch_id' => $branch->id,
        ]);

        $this->getJson('/api/daily-summary/report?'.$params)
            ->assertStatus(200)
            ->assertJsonPath('totalGrandTotal', 650);

        $this->getJson('/api/daily-summary/quick-report?'.$params)
            ->assertStatus(200)
            ->assertJsonFragment(['id' => $order->id]);

        $this->getJson('/api/daily-summary/top-ten-deals-report?'.$params)
            ->assertStatus(200)
            ->assertJsonFragment(['id' => $order->id]);

        $this->getJson('/api/daily-category-sales-by-item-quantity/reportcurrentdate?'.$params)
            ->assertStatus(200)
            ->assertJsonFragment(['item_name' => 'Shifted Tikka']);
    }
}
