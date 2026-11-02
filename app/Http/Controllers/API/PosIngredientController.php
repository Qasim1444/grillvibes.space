<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Ingredient;
use App\Models\Place;
use App\Support\CurrentBranch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PosIngredientController extends Controller
{
    /** GET /api/pos/ingredients?place_id=… */
    public function index(Request $request): JsonResponse
    {
        $data = $request->validate(['place_id' => 'nullable|integer|exists:places,id']);
        $branchId = ! empty($data['place_id'])
            ? (Place::whereKey($data['place_id'])->value('branch_id') ?: CurrentBranch::id())
            : CurrentBranch::id();

        $ingredients = Ingredient::active()
            ->with(['stockLevels' => fn ($query) => $query->where('branch_id', $branchId)])
            ->orderBy('name')
            ->get(['id', 'name', 'unit'])
            ->map(fn (Ingredient $ingredient) => [
                'id' => $ingredient->id,
                'name' => $ingredient->name,
                'unit' => $ingredient->unit,
                'available_quantity' => (float) ($ingredient->stockLevels->first()?->quantity ?? 0),
                'average_cost' => (float) ($ingredient->stockLevels->first()?->average_cost ?? 0),
            ]);

        return response()->json(['ingredients' => $ingredients->values()]);
    }
}
