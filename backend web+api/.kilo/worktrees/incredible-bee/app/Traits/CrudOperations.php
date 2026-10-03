<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

trait CrudOperations
{
    public function index(): JsonResponse
    {
        $model = $this->model;
        $items = $model::all();

        return response()->json($items, 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {

        $model = $this->model;
        $data = $request->validate($this->validationRules());
        $item = $model::create($data);

        return response()->json($item, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id): JsonResponse
    {
        $model = $this->model;
        $item = $model::findOrFail($id);

        return response()->json($item, 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $model = $this->model;
        $item = $model::findOrFail($id);
        $data = $request->validate($this->validationRules($id)); // pass $id here
        $item->update($data);

        return response()->json($item, 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id): JsonResponse
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
