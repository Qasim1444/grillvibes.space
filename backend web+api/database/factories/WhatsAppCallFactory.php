<?php

namespace Database\Factories;

use App\Models\WhatsAppCall;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<WhatsAppCall>
 */
class WhatsAppCallFactory extends Factory
{
    protected $model = WhatsAppCall::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'wa_call_id' => Str::uuid()->toString(),
            'number' => $this->faker->numerify('03#########'),
            'customer_id' => null,
            'direction' => $this->faker->randomElement(['incoming', 'outgoing']),
            'status' => $this->faker->randomElement(['ringing', 'offer', 'rejected', 'missed']),
            'is_video' => $this->faker->boolean(),
            'caller_jid' => $this->faker->numerify('03#########').'@s.whatsapp.net',
            'name' => $this->faker->name(),
            'call_time' => $this->faker->dateTimeBetween('-1 week', 'now'),
        ];
    }
}
