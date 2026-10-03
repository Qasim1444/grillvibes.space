<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RiderLocationController extends Controller
{
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user || (! $user->hasRole('rider') && ! $user->isSuperAdmin())) {
            abort(403, 'This endpoint is only available to riders.');
        }

        $data = $request->validate([
            'lat' => ['required', 'numeric', 'between:-90,90'],
            'lng' => ['required', 'numeric', 'between:-180,180'],
            'accuracy' => ['nullable', 'numeric', 'min:0'],
        ]);

        $user->update([
            'last_lat' => $data['lat'],
            'last_lng' => $data['lng'],
            'last_location_at' => now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Location updated.',
        ]);
    }
}
