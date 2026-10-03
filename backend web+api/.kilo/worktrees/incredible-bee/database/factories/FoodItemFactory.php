<?php

namespace Database\Factories;

use App\Models\FoodCategory;
use App\Models\FoodItem;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<FoodItem>
 */
class FoodItemFactory extends Factory
{
    protected $model = FoodItem::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'foodcategory_id' => FoodCategory::factory(),
            'name' => ucfirst($this->faker->words(2, true)),
            'image' => 'food-items/'.$this->faker->uuid().'.jpg',
            'description' => $this->faker->sentence(),
            'code' => strtoupper(Str::random(10)),
            'status' => $this->faker->boolean(90),
            'price' => $this->faker->randomFloat(2, 1, 100),
        ];
    }
}
