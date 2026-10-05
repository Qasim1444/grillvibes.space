<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class RiderOrderController extends Controller
{
    private const RIDER_ROLE = 'rider';

    private const DELIVERY_COMMISSION_RATE = 0.10;

    private const ACTIVE_STATUSES = [
        'assigned',
        'accepted',
        'picked_up',
        'on_way',
    ];

    public function index(Request $request): JsonResponse
    {
        $this->authorizeRider($request);

        $data = Order::query()
            ->with(['customer:id,name,contact,address,latitude,longitude,email', 'branch:id,name,address,phone,latitude,longitude'])
            ->withCount('orderItems as items_count')
            ->where('type', 'delivery')
            ->where(function ($query) use ($request) {
                $query->where('rider_id', $request->user()->id)
                    ->orWhere(function ($query) {
                        $query->whereNull('rider_id')
                            ->where(function ($query) {
                                $query->whereNull('delivery_status')
                                    ->orWhereIn('delivery_status', ['unassigned', 'assigned']);
                            });
                    });
            })
            ->where(function ($query) {
                $query->whereNull('delivery_status')
                    ->orWhereIn('delivery_status', array_merge(self::ACTIVE_STATUSES, ['unassigned']));
            })
            ->when($request->filled('status'), fn ($q) => $q->where('delivery_status', $request->query('status')))
            ->when($request->filled('date'), fn ($q) => $q->whereDate('order_datetime', $request->query('date')))
            ->latest('order_datetime')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $data->map(fn (Order $order) => $this->orderCard($order)),
        ]);
    }

    public function home(Request $request): JsonResponse
    {
        $this->authorizeRider($request);

        $orders = Order::query()
            ->with(['customer:id,name,contact,address,latitude,longitude,email', 'branch:id,name,address,phone,latitude,longitude'])
            ->withCount('orderItems as items_count')
            ->where('type', 'delivery')
            ->where(function ($query) use ($request) {
                $query->where('rider_id', $request->user()->id)
                    ->orWhere(function ($query) {
                        $query->whereNull('rider_id')
                            ->where(function ($query) {
                                $query->whereNull('delivery_status')
                                    ->orWhereIn('delivery_status', ['unassigned', 'assigned']);
                            });
                    });
            })
            ->where(function ($query) {
                $query->whereNull('delivery_status')
                    ->orWhereIn('delivery_status', array_merge(self::ACTIVE_STATUSES, ['unassigned']));
            })
            ->latest('order_datetime')
            ->get();

        $newOrders = $orders->filter(fn (Order $order) => $order->delivery_status === null || in_array($order->delivery_status, ['unassigned', 'assigned'], true))->values();
        $myOrders = $orders->whereIn('delivery_status', ['accepted', 'picked_up', 'on_way'])->values();

        return response()->json([
            'status' => 'success',
            'data' => [
                'rider' => $this->riderProfile($request->user()),
                'summary' => [
                    'new_orders' => $newOrders->count(),
                    'active_orders' => $myOrders->count(),
                    'today_delivered' => $this->deliveredOrdersQuery($request)->whereDate('delivered_at', today())->count(),
                    'today_earnings' => $this->earningsTotal($this->deliveredOrdersQuery($request)->whereDate('delivered_at', today())->get()),
                ],
                'tabs' => [
                    'new_orders' => $newOrders->map(fn (Order $order) => $this->orderCard($order)),
                    'my_orders' => $myOrders->map(fn (Order $order) => $this->orderCard($order)),
                    'history_preview' => $this->deliveredOrdersQuery($request)
                        ->latest('delivered_at')
                        ->limit(5)
                        ->get()
                        ->map(fn (Order $order) => $this->historyCard($order)),
                ],
            ],
        ]);
    }

    public function availableRiders(Request $request): JsonResponse
    {
        $this->authorizeDispatcher($request);

        $data = User::query()
            ->where('is_available', true)
            ->whereHas('roles', fn ($q) => $q->where('slug', self::RIDER_ROLE))
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'phone', 'vehicle_type', 'vehicle_number', 'last_lat', 'last_lng', 'last_location_at']);

        return response()->json([
            'status' => 'success',
            'data' => $data,
        ]);
    }

    public function show(Request $request, Order $order): JsonResponse
    {
        $this->authorizeRiderOrder($request, $order, true);

        return response()->json([
            'status' => 'success',
            'data' => $this->orderDetail($order->load(
                'customer:id,name,contact,address,latitude,longitude,email',
                'branch:id,name,address,phone,latitude,longitude',
                'orderItems.item'
            )),
        ]);
    }

    public function assign(Request $request, Order $order): JsonResponse
    {
        $this->authorizeDispatcher($request);

        $data = $request->validate([
            'rider_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        if ($order->type !== 'delivery') {
            throw ValidationException::withMessages([
                'order' => 'Only delivery orders can be assigned to riders.',
            ]);
        }

        $rider = User::findOrFail($data['rider_id']);

        $order->update([
            'rider_id' => $rider->id,
            'delivery_status' => 'assigned',
            'assigned_at' => now(),
            'accepted_at' => null,
            'picked_up_at' => null,
            'on_way_at' => null,
            'delivered_at' => null,
            'delivery_rejection_reason' => null,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Delivery assigned.',
            'data' => $order->fresh()->load('rider:id,name,email,phone,vehicle_type,vehicle_number'),
        ]);
    }

    public function accept(Request $request, Order $order): JsonResponse
    {
        $this->authorizeRiderOrder($request, $order, true);
        $this->assertDeliveryStatus($order, [null, 'unassigned', 'assigned']);

        $order->update([
            'rider_id' => $request->user()->id,
            'delivery_status' => 'accepted',
            'assigned_at' => $order->assigned_at ?? now(),
            'accepted_at' => now(),
            'delivery_rejection_reason' => null,
        ]);

        return $this->statusResponse('Delivery accepted.', $order);
    }

    public function reject(Request $request, Order $order): JsonResponse
    {
        $this->authorizeRiderOrder($request, $order);
        $this->assertDeliveryStatus($order, ['assigned']);

        $data = $request->validate([
            'reason' => ['nullable', 'string', 'max:1000'],
        ]);

        $order->update([
            'rider_id' => null,
            'delivery_status' => 'rejected',
            'delivery_rejection_reason' => $data['reason'] ?? null,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Delivery rejected.',
        ]);
    }

    public function pickedUp(Request $request, Order $order): JsonResponse
    {
        $this->authorizeRiderOrder($request, $order);
        $this->assertDeliveryStatus($order, ['accepted']);

        $order->update([
            'delivery_status' => 'picked_up',
            'picked_up_at' => now(),
        ]);

        return $this->statusResponse('Order marked as picked up.', $order);
    }

    public function onWay(Request $request, Order $order): JsonResponse
    {
        $this->authorizeRiderOrder($request, $order);
        $this->assertDeliveryStatus($order, ['picked_up']);

        $order->update([
            'delivery_status' => 'on_way',
            'on_way_at' => now(),
        ]);

        return $this->statusResponse('Order marked as on the way.', $order);
    }

    public function delivered(Request $request, Order $order): JsonResponse
    {
        $this->authorizeRiderOrder($request, $order);
        $this->assertDeliveryStatus($order, ['on_way']);

        $data = $request->validate([
            'notes' => ['nullable', 'string', 'max:2000'],
            'cash_collected' => [$order->paid ? 'nullable' : 'required', 'numeric', 'min:0'],
        ]);

        $proofPath = $this->storeProofImage($request);

        DB::transaction(function () use ($order, $data, $proofPath) {
            $order->update([
                'status' => 'completed',
                'delivery_status' => 'delivered',
                'paid' => true,
                'delivered_at' => now(),
                'delivery_notes' => $data['notes'] ?? null,
                'delivery_proof_path' => $proofPath,
                'cash_collected' => $data['cash_collected'] ?? null,
            ]);
        });

        return $this->statusResponse('Order delivered.', $order->fresh());
    }

    public function history(Request $request): JsonResponse
    {
        $this->authorizeRider($request);

        $data = $this->deliveredOrdersQuery($request)
            ->when($request->filled('from'), fn ($q) => $q->whereDate('delivered_at', '>=', $request->query('from')))
            ->when($request->filled('to'), fn ($q) => $q->whereDate('delivered_at', '<=', $request->query('to')))
            ->latest('delivered_at')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $data->map(fn (Order $order) => $this->historyCard($order)),
        ]);
    }

    public function tracking(Request $request, Order $order): JsonResponse
    {
        $this->authorizeRiderOrder($request, $order);

        $order->load('customer:id,name,contact,address,latitude,longitude,email', 'branch:id,name,address,phone,latitude,longitude');
        $this->syncDeliveryCoordinatesFromCustomer($order);

        return response()->json([
            'status' => 'success',
            'data' => [
                'order' => $this->orderCard($order),
                'rider' => [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'phone' => $request->user()->phone,
                    'lat' => $this->floatOrNull($request->user()->current_latitude ?? $request->user()->last_lat),
                    'lng' => $this->floatOrNull($request->user()->current_longitude ?? $request->user()->last_lng),
                    'last_location_at' => $this->dateTime($request->user()->location_updated_at ?? $request->user()->last_location_at),
                ],
                'pickup' => $this->pickupPoint($order),
                'dropoff' => $this->dropoffPoint($order),
                'route' => [
                    'status' => $order->delivery_status,
                    'target' => $order->delivery_status === 'accepted' ? 'pickup' : 'dropoff',
                    'polyline_provider' => 'in_app',
                    'mode' => 'DRIVING',
                ],
                'timeline' => $this->deliveryTimeline($order),
            ],
        ]);
    }

    public function route(Request $request, Order $order): JsonResponse
    {
        $this->authorizeRiderOrder($request, $order);

        $order->load('customer:id,name,contact,address,latitude,longitude,email', 'branch:id,name,address,phone,latitude,longitude');
        $this->syncDeliveryCoordinatesFromCustomer($order);

        $rider = [
            'latitude' => $this->floatOrNull($request->user()->current_latitude ?? $request->user()->last_lat),
            'longitude' => $this->floatOrNull($request->user()->current_longitude ?? $request->user()->last_lng),
        ];

        $customer = [
            'latitude' => $this->floatOrNull($order->delivery_latitude ?? $order->customer?->latitude),
            'longitude' => $this->floatOrNull($order->delivery_longitude ?? $order->customer?->longitude),
        ];

        if ($rider['latitude'] === null || $rider['longitude'] === null) {
            return response()->json([
                'success' => false,
                'message' => 'Rider location is not available yet.',
            ], 422);
        }

        if ($customer['latitude'] === null || $customer['longitude'] === null) {
            return response()->json([
                'success' => false,
                'message' => 'Customer delivery coordinates are missing for this order.',
            ], 422);
        }

        $baseUrl = rtrim((string) config('services.osrm.base_url'), '/');
        $coordinates = $rider['longitude'].','.$rider['latitude'].';'.$customer['longitude'].','.$customer['latitude'];

        try {
            $response = Http::timeout(8)->get($baseUrl.'/route/v1/driving/'.$coordinates, [
                'overview' => 'full',
                'geometries' => 'geojson',
                'steps' => 'true',
            ]);
        } catch (\Throwable) {
            return response()->json([
                'success' => false,
                'message' => 'Route service is unavailable. Please try again shortly.',
            ], 503);
        }

        if (! $response->ok()) {
            return response()->json([
                'success' => false,
                'message' => 'Route service could not calculate this delivery route.',
            ], 503);
        }

        $route = $response->json('routes.0');
        $distance = (float) ($route['distance'] ?? 0);
        $duration = (float) ($route['duration'] ?? 0);
        $coordinates = $route['geometry']['coordinates'] ?? [];

        if (! is_array($coordinates) || count($coordinates) === 0) {
            return response()->json([
                'success' => false,
                'message' => 'Route service returned an invalid route.',
            ], 502);
        }

        return response()->json([
            'success' => true,
            'rider' => $rider,
            'customer' => $customer,
            'route' => [
                'distance_meters' => round($distance),
                'distance_km' => round($distance / 1000, 2),
                'duration_seconds' => round($duration),
                'duration_minutes' => max(1, (int) ceil($duration / 60)),
                'coordinates' => $coordinates,
            ],
        ]);
    }

    public function earnings(Request $request): JsonResponse
    {
        $this->authorizeRider($request);

        $period = $request->query('period', 'daily');
        $date = $request->query('date') ? Carbon::parse($request->query('date')) : today();

        $query = $this->deliveredOrdersQuery($request);

        if ($period === 'weekly') {
            $query->whereBetween('delivered_at', [$date->copy()->startOfWeek(), $date->copy()->endOfWeek()]);
        } elseif ($period === 'monthly') {
            $query->whereYear('delivered_at', $date->year)->whereMonth('delivered_at', $date->month);
        } else {
            $query->whereDate('delivered_at', $date);
        }

        $orders = $query->latest('delivered_at')->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'period' => $period,
                'total_earnings' => $this->earningsTotal($orders),
                'completed_orders' => $orders->count(),
                'average_per_delivery' => $orders->count() > 0 ? round($this->earningsTotal($orders) / $orders->count(), 2) : 0,
                'recent' => $orders->take(10)->map(fn (Order $order) => $this->earningCard($order)),
                'chart' => $this->earningsChart($request, $date),
            ],
        ]);
    }

    public function profile(Request $request): JsonResponse
    {
        $this->authorizeRider($request);

        return response()->json([
            'status' => 'success',
            'data' => $this->riderProfile($request->user()),
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $this->authorizeRider($request);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:1000'],
            'vehicle_type' => ['nullable', 'string', 'max:50'],
            'vehicle_number' => ['nullable', 'string', 'max:50'],
            'is_available' => ['nullable', 'boolean'],
        ]);

        $request->user()->fill($data)->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Rider profile updated.',
            'data' => $this->riderProfile($request->user()->fresh()),
        ]);
    }

    public function updatePushToken(Request $request): JsonResponse
    {
        $this->authorizeRider($request);

        $data = $request->validate([
            'expo_push_token' => ['required', 'string', 'max:255'],
        ]);

        $request->user()->forceFill([
            'expo_push_token' => $data['expo_push_token'],
        ])->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Push notification token saved.',
        ]);
    }

    public function settings(Request $request): JsonResponse
    {
        $this->authorizeRider($request);

        return response()->json([
            'status' => 'success',
            'data' => [
                'notifications_enabled' => true,
                'location_sharing_enabled' => (bool) $request->user()->is_available,
                'language' => 'English',
                'dark_mode' => false,
                'support_phone' => config('app.support_phone'),
                'app_version' => config('app.version'),
            ],
        ]);
    }

    public function notifications(Request $request): JsonResponse
    {
        $this->authorizeRider($request);

        $orders = Order::query()
            ->with('customer:id,name,contact,address,latitude,longitude,email')
            ->where('type', 'delivery')
            ->where('rider_id', $request->user()->id)
            ->latest('updated_at')
            ->limit(30)
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $orders->map(fn (Order $order) => [
                'id' => 'order-'.$order->id.'-'.$order->delivery_status,
                'type' => 'order',
                'title' => $this->notificationTitle($order),
                'message' => $this->orderCode($order).' - Rs '.$this->money($order->grand_total),
                'order_id' => $order->id,
                'order_code' => $this->orderCode($order),
                'delivery_status' => $order->delivery_status,
                'created_at' => $this->dateTime($order->updated_at),
            ]),
        ]);
    }

    private function statusResponse(string $message, Order $order): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'message' => $message,
            'data' => $order->only([
                'id',
                'status',
                'delivery_status',
                'paid',
                'assigned_at',
                'accepted_at',
                'picked_up_at',
                'on_way_at',
                'delivered_at',
                'cash_collected',
            ]),
        ]);
    }

    private function deliveredOrdersQuery(Request $request)
    {
        return Order::query()
            ->with(['customer:id,name,contact,address,latitude,longitude,email', 'branch:id,name,address,phone,latitude,longitude'])
            ->where('type', 'delivery')
            ->where('rider_id', $request->user()->id)
            ->where('delivery_status', 'delivered');
    }

    private function orderCard(Order $order): array
    {
        return [
            'id' => $order->id,
            'order_code' => $this->orderCode($order),
            'type' => $order->type,
            'status' => $order->status,
            'delivery_status' => $order->delivery_status,
            'delivery_status_label' => in_array($order->delivery_status, [null, 'unassigned'], true)
                ? 'Available'
                : Str::of($order->delivery_status ?? 'unassigned')->replace('_', ' ')->title()->toString(),
            'paid' => (bool) $order->paid,
            'payment_label' => $order->paid ? 'Paid' : 'Cash on Delivery',
            'grand_total' => (float) $order->grand_total,
            'grand_total_formatted' => 'Rs '.$this->money($order->grand_total),
            'earning' => $this->earningForOrder($order),
            'earning_formatted' => 'Rs '.$this->money($this->earningForOrder($order)),
            'distance_text' => '2.5 km',
            'eta_text' => '8 min',
            'items_count' => $order->items_count ?? $order->orderItems->count(),
            'customer' => $this->customerPayload($order),
            'pickup' => $this->pickupPoint($order),
            'dropoff' => $this->dropoffPoint($order),
            'actions' => $this->allowedActions($order),
            'assigned_at' => $this->dateTime($order->assigned_at),
            'order_datetime' => $this->dateTime($order->order_datetime),
        ];
    }

    private function orderDetail(Order $order): array
    {
        return array_merge($this->orderCard($order), [
            'subtotal' => (float) $order->subtotal,
            'service_charges' => (float) $order->service_charges,
            'discount_amount' => (float) $order->discount_amount,
            'cash_collected' => $order->cash_collected !== null ? (float) $order->cash_collected : null,
            'notes' => $order->delivery_notes,
            'rejection_reason' => $order->delivery_rejection_reason,
            'proof_url' => $order->delivery_proof_path ? Storage::disk('public')->url($order->delivery_proof_path) : null,
            'items' => $order->orderItems->map(fn ($item) => [
                'id' => $item->id,
                'fooditems_id' => $item->fooditems_id,
                'name' => $item->item->name ?? $item->item->item_name ?? 'Item',
                'quantity' => (int) $item->quantity,
                'sub_total' => (float) $item->sub_total,
                'sub_total_formatted' => 'Rs '.$this->money($item->sub_total),
                'note' => $item->add_note,
            ]),
            'timeline' => $this->deliveryTimeline($order),
        ]);
    }

    private function historyCard(Order $order): array
    {
        return array_merge($this->orderCard($order), [
            'delivered_at' => $this->dateTime($order->delivered_at),
            'delivered_date_label' => optional($order->delivered_at)->format('M d, Y - h:i A'),
        ]);
    }

    private function earningCard(Order $order): array
    {
        return [
            'order_id' => $order->id,
            'order_code' => $this->orderCode($order),
            'earned' => $this->earningForOrder($order),
            'earned_formatted' => '+Rs '.$this->money($this->earningForOrder($order)),
            'delivered_at' => $this->dateTime($order->delivered_at),
            'delivered_label' => optional($order->delivered_at)->format('M d, h:i A'),
        ];
    }

    private function earningsChart(Request $request, Carbon $date): array
    {
        $start = $date->copy()->subDays(6)->startOfDay();

        return collect(range(0, 6))->map(function (int $index) use ($request, $start) {
            $day = $start->copy()->addDays($index);
            $orders = $this->deliveredOrdersQuery($request)->whereDate('delivered_at', $day)->get();

            return [
                'date' => $day->toDateString(),
                'label' => $day->format('d'),
                'earnings' => $this->earningsTotal($orders),
                'orders' => $orders->count(),
            ];
        })->all();
    }

    private function riderProfile(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'address' => $user->address,
            'vehicle_type' => $user->vehicle_type,
            'vehicle_number' => $user->vehicle_number,
            'is_available' => (bool) $user->is_available,
            'last_lat' => $this->floatOrNull($user->last_lat),
            'last_lng' => $this->floatOrNull($user->last_lng),
            'last_location_at' => $this->dateTime($user->last_location_at),
            'current_latitude' => $this->floatOrNull($user->current_latitude),
            'current_longitude' => $this->floatOrNull($user->current_longitude),
            'location_updated_at' => $this->dateTime($user->location_updated_at),
            'notifications_enabled' => filled($user->expo_push_token),
        ];
    }

    private function customerPayload(Order $order): array
    {
        return [
            'id' => $order->customer?->id,
            'name' => $order->customer?->name,
            'contact' => $order->customer?->contact,
            'address' => $order->customer?->address,
            'latitude' => $this->floatOrNull($order->customer?->latitude),
            'longitude' => $this->floatOrNull($order->customer?->longitude),
            'email' => $order->customer?->email,
        ];
    }

    private function pickupPoint(Order $order): array
    {
        return [
            'name' => $order->branch?->name ?? 'GrillVibes Restaurant',
            'address' => $order->branch?->address,
            'lat' => $this->floatOrNull($order->branch?->latitude),
            'lng' => $this->floatOrNull($order->branch?->longitude),
            'phone' => $order->branch?->phone,
        ];
    }

    private function dropoffPoint(Order $order): array
    {
        [$latitude, $longitude] = $this->deliveryCoordinates($order);

        return [
            'name' => $order->customer?->name,
            'address' => $order->customer?->address,
            'lat' => $latitude,
            'lng' => $longitude,
            'latitude' => $latitude,
            'longitude' => $longitude,
            'phone' => $order->customer?->contact,
            'needs_geocoding' => $latitude === null || $longitude === null,
        ];
    }

    /**
     * @return array{0: ?float, 1: ?float}
     */
    private function deliveryCoordinates(Order $order): array
    {
        return [
            $this->floatOrNull($order->delivery_latitude ?? $order->customer?->latitude),
            $this->floatOrNull($order->delivery_longitude ?? $order->customer?->longitude),
        ];
    }

    private function syncDeliveryCoordinatesFromCustomer(Order $order): void
    {
        if ($order->delivery_latitude !== null && $order->delivery_longitude !== null) {
            return;
        }

        if ($order->customer?->latitude === null || $order->customer?->longitude === null) {
            return;
        }

        $order->forceFill([
            'delivery_latitude' => $order->delivery_latitude ?? $order->customer->latitude,
            'delivery_longitude' => $order->delivery_longitude ?? $order->customer->longitude,
        ])->save();
    }

    private function deliveryTimeline(Order $order): array
    {
        return [
            ['key' => 'accepted', 'label' => 'Accepted', 'at' => $this->dateTime($order->accepted_at), 'done' => $order->accepted_at !== null],
            ['key' => 'picked_up', 'label' => 'Picked Up', 'at' => $this->dateTime($order->picked_up_at), 'done' => $order->picked_up_at !== null],
            ['key' => 'on_way', 'label' => 'On Way', 'at' => $this->dateTime($order->on_way_at), 'done' => $order->on_way_at !== null],
            ['key' => 'delivered', 'label' => 'Delivered', 'at' => $this->dateTime($order->delivered_at), 'done' => $order->delivered_at !== null],
        ];
    }

    private function allowedActions(Order $order): array
    {
        return match ($order->delivery_status) {
            null, 'unassigned' => ['accept'],
            'assigned' => ['accept', 'reject'],
            'accepted' => ['picked_up'],
            'picked_up' => ['on_way'],
            'on_way' => ['delivered', 'call_customer', 'open_maps'],
            default => [],
        };
    }

    private function notificationTitle(Order $order): string
    {
        return match ($order->delivery_status) {
            'assigned' => 'New Order',
            'accepted' => 'Order Accepted',
            'picked_up' => 'Order Picked Up',
            'on_way' => 'Order On The Way',
            'delivered' => 'Order Delivered',
            'rejected' => 'Order Rejected',
            default => 'Order Update',
        };
    }

    private function orderCode(Order $order): string
    {
        return '#GRV-'.str_pad((string) $order->id, 4, '0', STR_PAD_LEFT);
    }

    private function earningForOrder(Order $order): float
    {
        return round((float) $order->grand_total * self::DELIVERY_COMMISSION_RATE, 2);
    }

    private function earningsTotal($orders): float
    {
        return round($orders->sum(fn (Order $order) => $this->earningForOrder($order)), 2);
    }

    private function dateTime(mixed $value): ?string
    {
        return $value ? Carbon::parse($value)->toDateTimeString() : null;
    }

    private function floatOrNull(mixed $value): ?float
    {
        return $value === null ? null : (float) $value;
    }

    private function money(mixed $value): string
    {
        return number_format((float) $value, 0);
    }

    /**
     * Mobile clients may send proof as multipart file or as a base64/data URL.
     *
     * @return array<int, mixed>
     */
    private function proofImageRules(Request $request): array
    {
        if (! $request->has('proof_image') && ! $request->hasFile('proof_image')) {
            return ['nullable'];
        }

        if ($request->hasFile('proof_image')) {
            return [
                'bail',
                'nullable',
                'file',
                'max:5120',
                function (string $attribute, mixed $value, \Closure $fail) {
                    $image = $this->inspectUploadedProofImage($value);

                    if ($image === null) {
                        $fail('The proof image must be a valid JPG, PNG, or WebP image.');

                        return;
                    }

                    if ($image['size'] > 5 * 1024 * 1024) {
                        $fail('The proof image may not be greater than 5 MB.');
                    }
                },
            ];
        }

        return [
            'bail',
            'nullable',
            'string',
            function (string $attribute, mixed $value, \Closure $fail) {
                if ($value === null || $value === '') {
                    return;
                }

                $decoded = $this->decodeProofImage($value);

                if ($decoded === null) {
                    $fail('The proof image must be a JPG, PNG, or WebP image file or base64 image.');

                    return;
                }

                if (strlen($decoded['binary']) > 5 * 1024 * 1024) {
                    $fail('The proof image may not be greater than 5 MB.');
                }
            },
        ];
    }

    private function storeProofImage(Request $request): ?string
    {
        if ($request->hasFile('proof_image')) {
            $image = $this->inspectUploadedProofImage($request->file('proof_image'));

            if ($image === null) {
                return null;
            }

            return $request->file('proof_image')->storeAs(
                'delivery-proofs',
                Str::uuid().'.'.$image['extension'],
                'public'
            );
        }

        $decoded = $this->decodeProofImage($request->input('proof_image'));

        if ($decoded === null) {
            return null;
        }

        $path = 'delivery-proofs/'.Str::uuid().'.'.$decoded['extension'];
        Storage::disk('public')->put($path, $decoded['binary']);

        return $path;
    }

    /**
     * @return array{extension: string, size: int}|null
     */
    private function inspectUploadedProofImage(mixed $file): ?array
    {
        if (! $file instanceof \Illuminate\Http\UploadedFile || ! $file->isValid()) {
            return null;
        }

        $path = $file->getRealPath();

        if (! $path || ! is_file($path)) {
            return null;
        }

        $imageInfo = @getimagesize($path);

        if ($imageInfo === false) {
            return null;
        }

        $mimeToExtension = [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
        ];

        $mime = $imageInfo['mime'] ?? null;

        if (! isset($mimeToExtension[$mime])) {
            return null;
        }

        return [
            'extension' => $mimeToExtension[$mime],
            'size' => $file->getSize() ?: 0,
        ];
    }

    /**
     * @return array{binary: string, extension: string}|null
     */
    private function decodeProofImage(mixed $value): ?array
    {
        if (! is_string($value) || trim($value) === '') {
            return null;
        }

        $value = trim($value);
        $extension = 'jpg';

        if (preg_match('/^data:image\/(jpeg|jpg|png|webp);base64,/i', $value, $matches)) {
            $extension = strtolower($matches[1]) === 'jpeg' ? 'jpg' : strtolower($matches[1]);
            $value = substr($value, strpos($value, ',') + 1);
        }

        if (! preg_match('/^[A-Za-z0-9+\/=\r\n]+$/', $value)) {
            return null;
        }

        $binary = base64_decode($value, true);

        if ($binary === false) {
            return null;
        }

        $imageInfo = @getimagesizefromstring($binary);

        if ($imageInfo === false) {
            return null;
        }

        $mimeToExtension = [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
        ];

        $mime = $imageInfo['mime'] ?? null;

        if (! isset($mimeToExtension[$mime])) {
            return null;
        }

        return [
            'binary' => $binary,
            'extension' => $mimeToExtension[$mime] ?? $extension,
        ];
    }

    private function authorizeRider(Request $request): void
    {
        $user = $request->user();

        if (! $user || (! $user->hasRole(self::RIDER_ROLE) && ! $user->isSuperAdmin())) {
            abort(403, 'This endpoint is only available to riders.');
        }
    }

    private function authorizeRiderOrder(Request $request, Order $order, bool $allowUnassigned = false): void
    {
        $this->authorizeRider($request);

        if ($order->type !== 'delivery') {
            abort(404);
        }

        if ($allowUnassigned && $order->rider_id === null && in_array($order->delivery_status, [null, 'unassigned', 'assigned'], true)) {
            return;
        }

        if (! $request->user()->isSuperAdmin() && (int) $order->rider_id !== (int) $request->user()->id) {
            abort(403, 'This delivery is not assigned to the logged-in rider.');
        }
    }

    private function authorizeDispatcher(Request $request): void
    {
        $user = $request->user();

        if (! $user || (! $user->isSuperAdmin() && ! $user->hasPermission('orders.update') && ! $user->hasPermission('orders.create'))) {
            abort(403, 'You are not allowed to assign riders.');
        }
    }

    /**
     * @param  array<int, string>  $allowed
     */
    private function assertDeliveryStatus(Order $order, array $allowed): void
    {
        if (! in_array($order->delivery_status, $allowed, true)) {
            throw ValidationException::withMessages([
                'delivery_status' => 'This action is not allowed while delivery status is '.$order->delivery_status.'.',
            ]);
        }
    }
}
