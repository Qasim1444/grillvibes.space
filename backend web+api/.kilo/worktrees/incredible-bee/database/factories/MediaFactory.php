<?php

namespace Database\Factories;

use App\Models\Media;
use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Media>
 */
class MediaFactory extends Factory
{
    protected $model = Media::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'file_path' => 'receipts/'.$this->faker->uuid().'.png',
            'type' => 'image/png',
            'uploaded_at' => now(),
        ];
    }
}
