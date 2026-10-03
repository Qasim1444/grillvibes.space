<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    protected $model = Order::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $subtotal = $this->faker->randomFloat(2, 10, 500);
        $discount = $this->faker->randomFloat(2, 0, min(50, $subtotal));
        $serviceCharges = $this->faker->randomFloat(2, 0, 30);

        return [
            'place_id' => null,
            'customer_id' => Customer::factory(),
            'device_id' => null,
            'order_datetime' => $this->faker->dateTimeBetween('-1 month', 'now'),
            'status' => $this->faker->randomElement(['pending', 'completed']),
            'paid' => $this->faker->boolean(),
            'type' => $this->faker->randomElement(['delivery', 'dining', 'on-way']),
            'qty' => $this->faker->numberBetween(1, 10),
            'subtotal' => $subtotal,
            'discount_type' => $this->faker->randomElement(['amount', 'percentage']),
            'discount_amount' => $discount,
            'service_charges' => $serviceCharges,
            'service_charges_percentage' => $this->faker->randomFloat(2, 0, 20),
            'grand_total' => round($subtotal - $discount + $serviceCharges, 2),
        ];
    }

    /**
     * State: an order of a specific type.
     */
    public function type(string $type): static
    {
        return $this->state(fn (array $attributes) => ['type' => $type]);
    }

    /**
     * State: a paid order.
     */
    public function paid(): static
    {
        return $this->state(fn (array $attributes) => ['paid' => true]);
    }
}
