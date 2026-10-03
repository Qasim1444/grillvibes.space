<?php

namespace Database\Seeders;

use App\Models\FoodCategory;
use App\Models\FoodItem;
use Illuminate\Database\Seeder;

class FoodItemsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reuse existing categories, or create a few if none exist yet, so the
        // food_items.foodcategory_id foreign key always resolves.
        $categories = FoodCategory::all();
        if ($categories->isEmpty()) {
            $categories = FoodCategory::factory(5)->create();
        }

        FoodItem::factory(15)->recycle($categories)->create();
    }
}
