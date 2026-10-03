<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\FoodItem;
use App\Traits\FoodItemTraits;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FoodItemController extends Controller
{
    use FoodItemTraits;

    protected $model = FoodItem::class;

    protected function validationRules($id = null): array
    {
        return [
            'foodcategory_id' => 'required|exists:food_categories,id',
            'name' => 'required|string|max:255',
            'image' => $id ? 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048' : 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
            'description' => 'required|string',
            'code' => 'required|string|unique:food_items,code,'.($id ?? 'NULL').',id|max:255',
            'price' => 'required|numeric|min:0',
            'status' => 'required|boolean',
        ];
    }

    public function index(): JsonResponse
    {

        return $this->getFoodItem();
    }

    public function store(Request $request)
    {
        return $this->storeFoodItem($request);

    }

    public function update(Request $request, $id)
    {

        return $this->updateFoodItem($request, $id);
    }

    public function destroy($id): JsonResponse
    {
        return $this->destroyFoodItem($id);

    }

    public function show($id): JsonResponse
    {
        return $this->showFoodItem($id);

    }
}
