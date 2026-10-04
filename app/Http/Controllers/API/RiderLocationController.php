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
            'latitude' => ['required_without:lat', 'numeric', 'between:-90,90'],
            'longitude' => ['required_without:lng', 'numeric', 'between:-180,180'],
            'lat' => ['required_without:latitude', 'numeric', 'between:-90,90'],
            'lng' => ['required_without:longitude', 'numeric', 'between:-180,180'],
            'accuracy' => ['nullable', 'numeric', 'min:0'],
        ]);

        $latitude = $data['latitude'] ?? $data['lat'];
        $longitude = $data['longitude'] ?? $data['lng'];

        $user->update([
            'last_lat' => $latitude,
            'last_lng' => $longitude,
            'last_location_at' => now(),
            'current_latitude' => $latitude,
            'current_longitude' => $longitude,
            'location_updated_at' => now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Location updated.',
            'data' => [
                'latitude' => (float) $latitude,
                'longitude' => (float) $longitude,
                'location_updated_at' => now()->toDateTimeString(),
            ],
        ]);
    }
}
