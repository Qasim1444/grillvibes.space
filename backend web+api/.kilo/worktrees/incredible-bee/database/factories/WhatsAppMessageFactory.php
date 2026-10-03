<?php

namespace Database\Factories;

use App\Models\WhatsAppMessage;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<WhatsAppMessage>
 */
class WhatsAppMessageFactory extends Factory
{
    protected $model = WhatsAppMessage::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'wa_message_id' => Str::uuid()->toString(),
            'number' => $this->faker->numerify('03#########'),
            'customer_id' => null,
            'direction' => $this->faker->randomElement(['incoming', 'outgoing']),
            'message_type' => 'text',
            'text' => $this->faker->sentence(),
            'media_url' => null,
            'media_mime' => null,
            'status' => $this->faker->randomElement(['received', 'sent', 'read']),
            'name' => $this->faker->name(),
            'sent_at' => $this->faker->dateTimeBetween('-1 week', 'now'),
        ];
    }
}
