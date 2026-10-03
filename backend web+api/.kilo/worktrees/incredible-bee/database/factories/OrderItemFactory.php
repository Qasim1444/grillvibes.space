<?php

namespace Database\Factories;

use App\Models\FoodCategory;
use App\Models\FoodItem;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OrderItem>
 */
class OrderItemFactory extends Factory
{
    protected $model = OrderItem::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $item = FoodItem::factory();
        $quantity = $this->faker->numberBetween(1, 5);
        $subtotal = $this->faker->randomFloat(2, 5, 200);

        return [
            'order_id' => Order::factory(),
            'fooditems_id' => $item,
            'category_id' => FoodCategory::factory(),
            'quantity' => $quantity,
            'discount_amount' => $this->faker->randomFloat(2, 0, 20),
            'sub_total' => $subtotal,
            'add_note' => $this->faker->optional()->sentence(),
        ];
    }
}
