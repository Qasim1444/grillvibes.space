<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;

trait settingtrait
{
    public function getFoodItem(): JsonResponse
    {
        $model = $this->model;
        $items = $model::all();

        // Transform the items to include food category name

        $items = $items->map(function ($item) {
            // Return a transformed item with the food category name
            return [
                'id' => $item->id,
                'foodcategory_id' => $item->foodcategory_id,
                'foodcategory_name' => $item->foodCategory ? $item->foodCategory->name : null, // Safely handle null food category
                'name' => $item->name,
                'image' => $item->image,
                'description' => $item->description,
                'code' => $item->code,
                'price' => $item->price,
                'status' => $item->status,
                'created_at' => $item->created_at,
                'updated_at' => $item->updated_at,
            ];
        });

        return response()->json($items, 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function storeFoodItem($request): JsonResponse
    {
        $model = $this->model;
        $data = $request->validate($this->validationRules());

        if ($image = $request->file('image')) {
            $data['image'] = $this->uploadImage($image);  // Call the uploadImage function
        }

        $item = $model::create($data);

        return response()->json($item, 201);
    }

    /**
     * Display the specified resource.
     */
    public function showFoodItem($id): JsonResponse
    {
        $model = $this->model;
        $item = $model::with('foodCategory')->findOrFail($id);

        $transformedItem = [
            'id' => $item->id,
            'foodcategory_id' => $item->foodcategory_id,
            'foodcategory_name' => $item->foodCategory ? $item->foodCategory->name : null,
            'name' => $item->name,
            'image' => $item->image,
            'description' => $item->description,
            'code' => $item->code,
            'price' => $item->price,
            'status' => $item->status,
            'created_at' => $item->created_at,
            'updated_at' => $item->updated_at,
        ];

        return response()->json($transformedItem, 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function updateFoodItem($request, $id): JsonResponse
    {
        $model = $this->model;
        $item = $model::findOrFail($id);

        $data = $request->validate($this->validationRules($id));

        unset($data['image']);

        if ($request->hasFile('image')) {
            $data['image'] = $this->uploadImage($request->file('image'));
        }

        $item->update($data);

        return response()->json($item, 200);
    }

    public function uploadImage($image)
    {
        $disk = 'public';
        $filename = date('YmdHis').'.'.$image->getClientOriginalExtension();

        Storage::disk($disk)->putFileAs('images', $image, $filename);

        // Return the full URL to the image
        return asset('storage/images/'.$filename);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroyFoodItem($id): JsonResponse
    {
        $model = $this->model;
        $item = $model::findOrFail($id);
        if ($item->image) {
            Storage::disk('public')->delete('images/'.$item->image);
        }
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
