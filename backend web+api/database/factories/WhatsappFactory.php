<?php

namespace Database\Factories;

use App\Models\Whatsapp;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Whatsapp>
 */
class WhatsappFactory extends Factory
{
    protected $model = Whatsapp::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'device' => $this->faker->numerify('device-####'),
            'api_key' => Str::random(40),
        ];
    }
}
