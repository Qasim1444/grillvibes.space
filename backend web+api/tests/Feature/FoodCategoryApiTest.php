<?php

namespace Tests\Feature;

use App\Models\FoodCategory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FoodCategoryApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_lists_food_categories(): void
    {
        FoodCategory::factory(4)->create();

        $this->getJson('/api/food-categories')
            ->assertStatus(200)
            ->assertJsonCount(4);
    }

    public function test_it_creates_a_food_category_and_generates_a_slug(): void
    {
        $this->postJson('/api/food-categories', [
            'name' => 'Hot Beverages',
            'status' => true,
        ])->assertStatus(201)
            ->assertJsonFragment([
                'name' => 'Hot Beverages',
                'slug' => 'hot-beverages',
            ]);

        $this->assertDatabaseHas('food_categories', ['slug' => 'hot-beverages']);
    }

    public function test_it_rejects_a_duplicate_slug(): void
    {
        FoodCategory::factory()->create([
            'name' => 'Desserts',
            'slug' => 'desserts',
        ]);

        $this->postJson('/api/food-categories', [
            'name' => 'Desserts',
            'status' => true,
        ])->assertStatus(422)
            ->assertJsonFragment(['error' => 'Slug must be unique.']);
    }

    public function test_it_validates_food_category_creation(): void
    {
        $this->postJson('/api/food-categories', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'status']);
    }

    public function test_it_deletes_a_food_category(): void
    {
        $category = FoodCategory::factory()->create();

        $this->deleteJson("/api/food-categories/{$category->id}")
            ->assertStatus(200);

        $this->assertDatabaseMissing('food_categories', ['id' => $category->id]);
    }
}
