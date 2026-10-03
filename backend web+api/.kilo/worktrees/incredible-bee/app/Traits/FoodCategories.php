<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

trait FoodCategories
{
    public function getFoodCategories(): JsonResponse
    {
        $model = $this->model;
        $items = $model::all();

        return response()->json($items, 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function storeFoodCategory($request): JsonResponse
    {
        $model = $this->model;
        $data = $request->validate($this->validationRules());

        // Auto-generate slug if not provided
        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        // Check if the slug is unique before storing
        $existingSlug = $model::where('slug', $data['slug'])->first();
        if ($existingSlug) {
            return response()->json(['error' => 'Slug must be unique.'], 422);
        }

        // Store the data
        $item = $model::create($data);

        return response()->json($item, 201);
    }

    /**
     * Display the specified resource.
     */
    public function showFoodCategory($id): JsonResponse
    {
        $model = $this->model;
        $item = $model::findOrFail($id);

        return response()->json($item, 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function updateFoodCategory($request, $id): JsonResponse
    {
        $model = $this->model;
        $item = $model::findOrFail($id);
        $data = $request->validate($this->validationRules());

        // Check if the name has changed
        if (isset($data['name']) && $data['name'] !== $item->name) {
            // Regenerate the slug based on the new name
            $data['slug'] = Str::slug($data['name']);

            // Ensure the slug is unique
            $existingSlug = $model::where('slug', $data['slug'])->where('id', '!=', $id)->first();
            if ($existingSlug) {
                return response()->json(['error' => 'Slug must be unique.'], 422);
            }
        }

        // Update the item with the new data
        $item->update($data);

        return response()->json($item, 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroyFoodCategory($id): JsonResponse
    {
        $model = $this->model;
        $item = $model::findOrFail($id);
        $item->delete();

        return response()->json(['message' => 'Deleted successfully'], 200);
    }

    /**
     * Define validation rules (to be overridden in controller).
     */
    protected function validationRules(): array
    {
        return [];
    }
}
