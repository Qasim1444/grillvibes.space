<?php

namespace Database\Seeders;

use App\Models\FoodItem;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Database\Seeder;

class OrderItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reference real parents so every foreign key resolves and each line's
        // category_id matches the food item's own category (coherent data).
        $orders = Order::all();
        if ($orders->isEmpty()) {
            $orders = Order::factory(10)->create();
        }

        $items = FoodItem::all();
        if ($items->isEmpty()) {
            $items = FoodItem::factory(15)->create();
        }

        foreach ($orders as $order) {
            foreach (range(1, rand(1, 4)) as $line) {
                $item = $items->random();

                OrderItem::factory()->create([
                    'order_id' => $order->id,
                    'fooditems_id' => $item->id,
                    'category_id' => $item->foodcategory_id,
                ]);
            }
        }
    }
}
