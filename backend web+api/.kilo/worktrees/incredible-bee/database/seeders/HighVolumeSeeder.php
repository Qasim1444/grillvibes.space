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
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Generates a large, foreign-key-coherent dataset for load / performance
 * testing — the volume the new indexes and sargable report queries are meant
 * to be exercised against.
 *
 * Opt-in only: this is NOT called from DatabaseSeeder, so `db:seed` stays fast
 * and production-safe. Run it explicitly:
 *
 *   php artisan db:seed --class=HighVolumeSeeder
 *
 * Volume scales without code changes (multiplies the base counts below):
 *
 *   SEED_SCALE=5 php artisan db:seed --class=HighVolumeSeeder
 *
 * The high-volume tables are written with chunked bulk INSERTs built from the
 * existing factories via make()->getAttributes(), so the factory definitions
 * remain the single source of truth while the writes stay fast.
 */
class HighVolumeSeeder extends Seeder
{
    /** Rows per INSERT statement. */
    private const CHUNK = 1000;

    /** Base row counts, multiplied by SEED_SCALE. */
    private const BASE = [
        'customers' => 5000,
        'food_items' => 800,
        'orders' => 40000,
        'whatsapp_messages' => 15000,
        'whatsapp_calls' => 4000,
    ];

    public function run(): void
    {
        if (app()->environment('production')
            && ! filter_var(env('SEED_FORCE', false), FILTER_VALIDATE_BOOLEAN)) {
            $this->command?->error('HighVolumeSeeder refused to run in production. Set SEED_FORCE=true to override.');

            return;
        }

        DB::connection()->disableQueryLog();
        $counts = $this->resolveCounts();

        // Admin login + a settings row so the seeded app is immediately usable.
        $this->call(UserSeeder::class);
        if (Setting::count() === 0) {
            Setting::factory()->create();
        }

        $this->command?->info("Seeding high-volume dataset ({$counts['customers']} customers, {$counts['orders']} orders)…");

        [$placeIds, $deviceIds, $categoryIds] = $this->seedReferenceData();

        $customerIds = $this->seedCustomers($counts['customers']);
        $itemCategory = $this->seedFoodItems($counts['food_items'], $categoryIds);
        $orderIds = $this->seedOrders($counts['orders'], $customerIds, $placeIds, $deviceIds);

        $this->seedOrderItems($orderIds, $itemCategory);
        $this->seedMedia($orderIds, 0.3);
        $this->seedWhatsApp($counts['whatsapp_messages'], $counts['whatsapp_calls']);

        $this->command?->info('High-volume dataset seeded.');
    }

    /**
     * Row counts = base x SEED_SCALE, with an optional per-entity override
     * (e.g. SEED_ORDERS=100) that wins over the scaled value.
     *
     * @return array<string, int>
     */
    private function resolveCounts(): array
    {
        $scale = max(1, (int) env('SEED_SCALE', 1));
        $counts = [];

        foreach (self::BASE as $key => $base) {
            $counts[$key] = max(0, (int) env('SEED_'.strtoupper($key), $base * $scale));
        }

        return $counts;
    }

    /**
     * Small reference tables that everything else points at. Created with
     * Eloquent (counts are tiny, and their factories use unique() slugs).
     *
     * @return array{0: array<int>, 1: array<int>, 2: array<int>}
     */
    private function seedReferenceData(): array
    {
        $placeIds = Place::factory(12)->create()->pluck('id')->all();
        $deviceIds = Whatsapp::factory(8)->create()->pluck('id')->all();
        $categoryIds = FoodCategory::factory(30)->create()->pluck('id')->all();

        $this->command?->info('  reference data ready (places, devices, categories).');

        return [$placeIds, $deviceIds, $categoryIds];
    }

    /**
     * @return array<int> the new customer ids
     */
    private function seedCustomers(int $count): array
    {
        $faker = fake();
        $ids = $this->seedReturningIds((new Customer)->getTable(), $count, function (int $i) {
            // Reuse the factory for shape, but force globally-unique keys so
            // faker's unique() pool (reset per chunk) never overflows.
            return Customer::factory()->make([
                'contact' => '03'.str_pad((string) ($i + 1), 9, '0', STR_PAD_LEFT),
                'email' => "customer{$i}@seed.test",
            ])->getAttributes();
        }, resetUnique: true);

        $this->command?->info('  customers: '.count($ids));

        return $ids;
    }

    /**
     * @param  array<int>  $categoryIds
     * @return array<int, int> map of food_item id => its category id
     */
    private function seedFoodItems(int $count, array $categoryIds): array
    {
        $table = (new FoodItem)->getTable();
        $start = $this->lastId($table);

        $this->bulkInsert($table, $count, fn () => FoodItem::factory()->make([
            'foodcategory_id' => $categoryIds[array_rand($categoryIds)],
        ])->getAttributes());

        $map = DB::table($table)->where('id', '>', $start)
            ->pluck('foodcategory_id', 'id')->all();

        $this->command?->info('  food_items: '.count($map));

        return $map;
    }

    /**
     * @param  array<int>  $customerIds
     * @param  array<int>  $placeIds
     * @param  array<int>  $deviceIds
     * @return array<int> the new order ids
     */
    private function seedOrders(int $count, array $customerIds, array $placeIds, array $deviceIds): array
    {
        $ids = $this->seedReturningIds((new Order)->getTable(), $count, fn () => Order::factory()->make([
            'customer_id' => $customerIds[array_rand($customerIds)],
            'place_id' => $placeIds[array_rand($placeIds)],
            'device_id' => $deviceIds[array_rand($deviceIds)],
        ])->getAttributes());

        $this->command?->info('  orders: '.count($ids));

        return $ids;
    }

    /**
     * One to four coherent lines per order (category matches the chosen item).
     *
     * @param  array<int>  $orderIds
     * @param  array<int, int>  $itemCategory
     */
    private function seedOrderItems(array $orderIds, array $itemCategory): void
    {
        $table = (new OrderItem)->getTable();
        $itemIds = array_keys($itemCategory);
        $faker = fake();
        $now = $this->now();
        $buffer = [];
        $total = 0;

        foreach ($orderIds as $orderId) {
            foreach (range(1, random_int(1, 4)) as $ignored) {
                $itemId = $itemIds[array_rand($itemIds)];
                $buffer[] = [
                    'order_id' => $orderId,
                    'fooditems_id' => $itemId,
                    'category_id' => $itemCategory[$itemId],
                    'quantity' => random_int(1, 5),
                    'discount_amount' => $faker->randomFloat(2, 0, 20),
                    'sub_total' => $faker->randomFloat(2, 5, 200),
                    'add_note' => $faker->optional()->sentence(),
                ];

                if (count($buffer) >= self::CHUNK) {
                    $this->insertChunk($table, $buffer, $now);
                    $total += count($buffer);
                    $buffer = [];
                }
            }
        }

        if ($buffer) {
            $this->insertChunk($table, $buffer, $now);
            $total += count($buffer);
        }

        $this->command?->info('  order_items: '.$total);
    }

    /**
     * A receipt on a fraction of orders.
     *
     * @param  array<int>  $orderIds
     */
    private function seedMedia(array $orderIds, float $ratio): void
    {
        $table = (new Media)->getTable();
        $faker = fake();
        $now = $this->now();
        $buffer = [];
        $total = 0;

        foreach ($orderIds as $orderId) {
            if (mt_rand(1, 100) > $ratio * 100) {
                continue;
            }

            $buffer[] = [
                'order_id' => $orderId,
                'file_path' => 'receipts/'.$faker->uuid().'.png',
                'type' => 'image/png',
                'uploaded_at' => $now,
            ];

            if (count($buffer) >= self::CHUNK) {
                $this->insertChunk($table, $buffer, $now);
                $total += count($buffer);
                $buffer = [];
            }
        }

        if ($buffer) {
            $this->insertChunk($table, $buffer, $now);
            $total += count($buffer);
        }

        $this->command?->info('  media: '.$total);
    }

    private function seedWhatsApp(int $messages, int $calls): void
    {
        $this->bulkInsert((new WhatsAppMessage)->getTable(), $messages,
            fn () => WhatsAppMessage::factory()->make()->getAttributes());

        $this->bulkInsert((new WhatsAppCall)->getTable(), $calls,
            fn () => WhatsAppCall::factory()->make()->getAttributes());

        $this->command?->info("  whatsapp_messages: {$messages}, whatsapp_calls: {$calls}");
    }

    // ---- bulk-insert plumbing -------------------------------------------------

    /**
     * Insert $count factory-built rows in chunked multi-row INSERTs.
     *
     * @param  callable(int): array<string, mixed>  $row  receives the 0-based global index
     */
    private function bulkInsert(string $table, int $count, callable $row, bool $resetUnique = false): void
    {
        $now = $this->now();

        for ($done = 0; $done < $count; $done += self::CHUNK) {
            // Keep faker's unique() memory bounded per chunk (only safe when the
            // caller forces its own globally-unique values — see seedCustomers).
            if ($resetUnique) {
                fake()->unique(true);
            }

            $size = min(self::CHUNK, $count - $done);
            $rows = [];

            for ($j = 0; $j < $size; $j++) {
                $attrs = $row($done + $j);

                // make() yields in-memory values; normalise dates for the query builder.
                foreach ($attrs as $key => $value) {
                    if ($value instanceof \DateTimeInterface) {
                        $attrs[$key] = $value->format('Y-m-d H:i:s');
                    }
                }

                $rows[] = $attrs;
            }

            $this->insertChunk($table, $rows, $now);
        }
    }

    /**
     * bulkInsert that also returns the ids of the rows it created. Relies on the
     * single-writer, monotonic auto-increment that holds during seeding.
     *
     * @param  callable(int): array<string, mixed>  $row
     * @return array<int>
     */
    private function seedReturningIds(string $table, int $count, callable $row, bool $resetUnique = false): array
    {
        if ($count < 1) {
            return [];
        }

        $start = $this->lastId($table);
        $this->bulkInsert($table, $count, $row, $resetUnique);

        return range($start + 1, $start + $count);
    }

    /**
     * Stamp timestamps (when the table has them) and insert one chunk.
     *
     * @param  array<int, array<string, mixed>>  $rows
     */
    private function insertChunk(string $table, array $rows, string $now): void
    {
        if ($this->hasTimestamps($table)) {
            foreach ($rows as &$r) {
                $r += ['created_at' => $now, 'updated_at' => $now];
            }
            unset($r);
        }

        DB::table($table)->insert($rows);
    }

    private array $tsCache = [];

    private function hasTimestamps(string $table): bool
    {
        return $this->tsCache[$table] ??= Schema::hasColumn($table, 'created_at');
    }

    private function lastId(string $table): int
    {
        return (int) (DB::table($table)->max('id') ?? 0);
    }

    private function now(): string
    {
        return now()->format('Y-m-d H:i:s');
    }
}
