<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\FoodCategory;
use App\Models\FoodItem;
use App\Models\Media;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Place;
use App\Models\Setting;
use App\Models\Whatsapp;
use App\Models\WhatsAppCall;
use App\Models\WhatsAppMessage;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        /*
        |--------------------------------------------------------------------------
        | Users & Permissions
        |--------------------------------------------------------------------------
        */

        // Always ensure the admin user exists.
        $this->call(UserSeeder::class);

        // Base roles + permission catalogue.
        $this->call(PermissionSeeder::class);

        // Phase 2 permissions.
        $this->call(Phase2PermissionsSeeder::class);

        // Phase 4 permissions.
        $this->call(Phase4PermissionsSeeder::class);

        // Phase 5 permissions.
        $this->call(Phase5PermissionsSeeder::class);


        // Phase 6: Expense Voucher Claims permissions.
        $this->call(Phase6PermissionsSeeder::class);

        // Phase 7: Inventory, Procurement and food-cost reporting permissions.
        $this->call(Phase7PermissionsSeeder::class);

        // Demo "Sub Admin" role + login (subadmin@gmail.com) — a scoped role to
        // demonstrate permission-driven UI next to the Super Admin. Runs after
        // the permission catalogue so all keys it references exist.
        $this->call(DemoSubAdminSeeder::class);


        /*
        |--------------------------------------------------------------------------
        | Optional Finance Demo
        |--------------------------------------------------------------------------
        */

        // $this->call(DemoSubAdminSeeder::class);

        // $this->call(FinanceDemoSeeder::class);


        /*
        |--------------------------------------------------------------------------
        | Optional Restaurant Demo Data
        |--------------------------------------------------------------------------
        |
        | Uncomment this section if you also want restaurant demo data.
        |--------------------------------------------------------------------------
        */

        /*
        if (Customer::count() === 0) {

            $this->command?->info('Seeding restaurant demo dataset...');

            // Settings
            if (Setting::count() === 0) {
                Setting::factory()->create();
            }

            // Places
            $places = Place::factory(3)->create();

            // WhatsApp devices
            $devices = Whatsapp::factory(2)->create();

            // Food categories
            $categories = FoodCategory::factory(8)->create();

            // Food items
            $items = FoodItem::factory(25)
                ->recycle($categories)
                ->create();

            // Customers
            $customers = Customer::factory(15)->create();

            // Orders
            $orders = Order::factory(30)
                ->recycle($customers)
                ->create([
                    'place_id' => fn () => $places->random()->id,
                    'device_id' => fn () => $devices->random()->id,
                ]);

            // Order items
            foreach ($orders as $order) {

                $numberOfLines = rand(1, 4);

                foreach (range(1, $numberOfLines) as $line) {

                    $item = $items->random();

                    OrderItem::factory()->create([
                        'order_id' => $order->id,
                        'fooditems_id' => $item->id,
                        'category_id' => $item->foodcategory_id,
                    ]);
                }

                // Approximately 60% of orders get a receipt.
                if (rand(1, 10) <= 6) {

                    Media::factory()->create([
                        'order_id' => $order->id,
                    ]);
                }
            }

            // WhatsApp history
            WhatsAppMessage::factory(40)->create();

            WhatsAppCall::factory(15)->create();

            $this->command?->info(
                'Restaurant demo dataset seeded successfully.'
            );
        }
        */


        /*
        |--------------------------------------------------------------------------
        | Finished
        |--------------------------------------------------------------------------
        */

        $this->command?->info('Database seeding completed successfully.');
    }
}