<?php

namespace Database\Factories;

use App\Models\FoodCategory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<FoodCategory>
 */
class FoodCategoryFactory extends Factory
{
    protected $model = FoodCategory::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = $this->faker->unique()->words(2, true);

        return [
            'name' => ucfirst($name),
            'slug' => Str::slug($name).'-'.$this->faker->unique()->numberBetween(1, 999999),
            'status' => $this->faker->boolean(90),
        ];
    }
}
