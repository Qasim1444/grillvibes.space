<?php

namespace Tests\Feature;

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
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class FactoriesTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Every factory should persist a valid model whose foreign keys resolve.
     *
     * @return array<string, array{0: class-string}>
     */
    public static function factoryProvider(): array
    {
        return [
            'customer' => [Customer::class],
            'place' => [Place::class],
            'setting' => [Setting::class],
            'whatsapp device' => [Whatsapp::class],
            'food category' => [FoodCategory::class],
            'food item' => [FoodItem::class],
            'order' => [Order::class],
            'order item' => [OrderItem::class],
            'media' => [Media::class],
            'whatsapp message' => [WhatsAppMessage::class],
            'whatsapp call' => [WhatsAppCall::class],
        ];
    }

    #[DataProvider('factoryProvider')]
    public function test_factory_creates_a_persisted_model(string $model): void
    {
        $instance = $model::factory()->create();

        $this->assertTrue($instance->exists, "{$model} factory did not persist a row.");
        $this->assertDatabaseHas($instance->getTable(), [
            $instance->getKeyName() => $instance->getKey(),
        ]);
    }

    public function test_order_factory_states_apply(): void
    {
        $order = Order::factory()->type('dining')->paid()->create();

        $this->assertSame('dining', $order->type);
        $this->assertTrue($order->paid);
    }

    public function test_food_item_belongs_to_its_category(): void
    {
        $item = FoodItem::factory()->create();

        $this->assertNotNull($item->foodCategory);
        $this->assertSame($item->foodcategory_id, $item->foodCategory->id);
    }
}
