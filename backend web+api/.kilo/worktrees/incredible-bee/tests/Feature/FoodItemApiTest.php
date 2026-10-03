<?php

namespace Tests\Feature;

use App\Models\FoodCategory;
use App\Models\FoodItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class FoodItemApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_lists_food_items_with_category(): void
    {
        FoodItem::factory(3)->create();

        $this->getJson('/api/food-items')
            ->assertStatus(200)
            ->assertJsonCount(3)
            ->assertJsonStructure([['id', 'name', 'foodcategory_name', 'price']]);
    }

    public function test_it_creates_a_food_item_with_an_uploaded_image(): void
    {
        Storage::fake('public');
        $category = FoodCategory::factory()->create();

        $response = $this->postJson('/api/food-items', [
            'foodcategory_id' => $category->id,
            'name' => 'Cheese Burger',
            'image' => UploadedFile::fake()->image('burger.jpg'),
            'description' => 'A tasty burger',
            'code' => 'BURGER01',
            'price' => 9.99,
            'status' => true,
        ]);

        $response->assertStatus(201)
            ->assertJsonFragment(['name' => 'Cheese Burger']);

        $this->assertDatabaseHas('food_items', [
            'name' => 'Cheese Burger',
            'code' => 'BURGER01',
        ]);
    }

    public function test_it_validates_food_item_creation(): void
    {
        $this->postJson('/api/food-items', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors([
                'foodcategory_id', 'name', 'image', 'description', 'code', 'price', 'status',
            ]);
    }

    public function test_it_shows_a_food_item(): void
    {
        $item = FoodItem::factory()->create();

        $this->getJson("/api/food-items/{$item->id}")
            ->assertStatus(200)
            ->assertJsonFragment(['id' => $item->id]);
    }

    public function test_it_deletes_a_food_item(): void
    {
        $item = FoodItem::factory()->create();

        $this->deleteJson("/api/food-items/{$item->id}")
            ->assertStatus(200);

        $this->assertDatabaseMissing('food_items', ['id' => $item->id]);
    }
}
