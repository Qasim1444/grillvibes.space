<?php

namespace Database\Factories;

use App\Models\Ingredient;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Ingredient>
 */
class IngredientFactory extends Factory
{
    protected $model = Ingredient::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => ucfirst($this->faker->unique()->words(2, true)),
            'sku' => 'ING-'.strtoupper(Str::random(6)),
            'unit' => $this->faker->randomElement(['kg', 'g', 'litre', 'ml', 'pcs']),
            'reorder_level' => $this->faker->randomFloat(2, 0, 10),
            'is_active' => true,
            'notes' => null,
        ];
    }

    /** State: measured in whole units, for readable recipe arithmetic in tests. */
    public function unit(string $unit): static
    {
        return $this->state(fn (array $attributes) => ['unit' => $unit]);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => ['is_active' => false]);
    }
}
