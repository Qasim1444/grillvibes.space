<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\FoodCategory;
use App\Traits\FoodCategories;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FoodCategoryController extends Controller
{
    use FoodCategories;

    protected $model = FoodCategory::class;

    protected function validationRules(): array
    {
        return [
            'name' => 'required|string|max:255',

            'status' => 'required|boolean',
        ];
    }

    public function index(): JsonResponse
    {
        return $this->getFoodCategories();
    }

    public function store(Request $request): JsonResponse
    {
        return $this->storeFoodCategory($request);
    }

    public function update(Request $request, $id): JsonResponse
    {
        return $this->updateFoodCategory($request, $id);
    }

    public function destroy($id): JsonResponse
    {
        return $this->destroyFoodCategory($id);
    }

    public function show($id): JsonResponse
    {
        return $this->showFoodCategory($id);
    }
}
