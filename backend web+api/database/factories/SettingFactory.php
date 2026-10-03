<?php

namespace Database\Factories;

use App\Models\Setting;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Setting>
 */
class SettingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $company = $this->faker->company();

        return [
            'name' => $company,
            'logo' => 'settings/'.Str::uuid()->toString().'.png',
            'company' => $company,
            'address' => $this->faker->address(),
            'email' => $this->faker->safeEmail(),
            'phone' => $this->faker->numerify('03#########'),
            'message' => $this->faker->sentence(),
        ];
    }
}
