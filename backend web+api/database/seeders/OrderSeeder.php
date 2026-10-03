<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Order;
use App\Models\Place;
use Illuminate\Database\Seeder;

class OrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ensure the referenced parents exist so every foreign key resolves.
        $customers = Customer::all();
        if ($customers->isEmpty()) {
            $customers = Customer::factory(10)->create();
        }

        $places = Place::all();

        Order::factory(10)
            ->recycle($customers)
            ->create([
                // place_id is a real id (or null) — never a raw uuid.
                'place_id' => fn () => $places->isNotEmpty() ? $places->random()->id : null,
            ]);
    }
}
