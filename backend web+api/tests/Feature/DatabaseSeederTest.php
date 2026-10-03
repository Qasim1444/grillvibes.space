<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DatabaseSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_seeder_builds_a_coherent_dataset(): void
    {
        $this->seed(DatabaseSeeder::class);

        // Idempotent admin + gated demo data.
        $this->assertDatabaseHas('users', ['email' => 'admin@gmail.com']);
        $this->assertGreaterThan(0, Customer::count());
        $this->assertGreaterThan(0, Order::count());
        $this->assertGreaterThan(0, OrderItem::count());

        // Every order line points at a real order and food item.
        $this->assertDatabaseMissing('order_items', ['order_id' => null]);
        foreach (OrderItem::all() as $line) {
            $this->assertNotNull(Order::find($line->order_id), 'Order line references a missing order.');
        }
    }

    public function test_seeder_is_idempotent_and_skips_demo_data_when_populated(): void
    {
        // Pretend the DB is already populated (e.g. production).
        Customer::factory()->create();
        $before = Customer::count();

        $this->seed(DatabaseSeeder::class);

        // Admin is still ensured, but bulk demo data is skipped.
        $this->assertDatabaseHas('users', ['email' => 'admin@gmail.com']);
        $this->assertSame($before, Customer::count());
        $this->assertSame(1, User::where('email', 'admin@gmail.com')->count());
    }
}
