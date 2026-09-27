<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Role;
use App\Models\User;
use App\Support\CurrentBranch;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RiderController extends Controller
{
    private const RIDER_ROLE = 'rider';

    private const DELIVERY_STATUSES = [
        'unassigned',
        'assigned',
        'accepted',
        'rejected',
        'picked_up',
        'on_way',
        'delivered',
        'failed',
        'cancelled',
    ];

    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $branchId = CurrentBranch::id();
        $riderRole = $this->riderRole();

        $riders = User::query()
            ->select([
                'id',
                'name',
                'email',
                'phone',
                'address',
                'vehicle_type',
                'vehicle_number',
                'is_available',
                'last_lat',
                'last_lng',
                'last_location_at',
                'created_at',
            ])
            ->whereHas('roles', fn ($q) => $q->where('slug', self::RIDER_ROLE))
            ->withCount([
                'assignedDeliveryOrders as active_deliveries_count' => fn ($q) => $q
                    ->where('type', 'delivery')
                    ->whereIn('delivery_status', ['assigned', 'accepted', 'picked_up', 'on_way']),
                'assignedDeliveryOrders as delivered_count' => fn ($q) => $q
                    ->where('type', 'delivery')
                    ->where('delivery_status', 'delivered'),
                'assignedDeliveryOrders as today_delivered_count' => fn ($q) => $q
                    ->where('type', 'delivery')
                    ->where('delivery_status', 'delivered')
                    ->whereDate(DB::raw('COALESCE(delivered_at, order_datetime)'), today()),
            ])
            ->withSum([
                'assignedDeliveryOrders as delivered_sales_total' => fn ($q) => $q
                    ->where('type', 'delivery')
                    ->where('delivery_status', 'delivered'),
            ], 'grand_total')
            ->withSum([
                'assignedDeliveryOrders as today_delivered_sales_total' => fn ($q) => $q
                    ->where('type', 'delivery')
                    ->where('delivery_status', 'delivered')
                    ->whereDate(DB::raw('COALESCE(delivered_at, order_datetime)'), today()),
            ], 'grand_total')
            ->when($search !== '', fn ($q) => $q->where(function ($w) use ($search) {
                $w->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('vehicle_number', 'like', "%{$search}%");
            }))
            ->orderByDesc('is_available')
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        $riders->getCollection()->transform(function (User $rider) {
            $deliveredSales = (float) ($rider->delivered_sales_total ?? 0);
            $todayDeliveredSales = (float) ($rider->today_delivered_sales_total ?? 0);

            $rider->delivered_sales_total = $deliveredSales;
            $rider->today_delivered_sales_total = $todayDeliveredSales;
            $rider->earning_total = round($deliveredSales * 0.10, 2);
            $rider->today_earning_total = round($todayDeliveredSales * 0.10, 2);

            return $rider;
        });

        $orders = Order::query()
            ->with('customer:id,name,address,contact', 'rider:id,name,phone')
            ->where('type', 'delivery')
            ->when($branchId, fn ($q) => $q->where('branch_id', $branchId))
            ->whereIn('delivery_status', ['unassigned', 'assigned', 'accepted', 'picked_up', 'on_way', 'rejected'])
            ->orderByRaw("FIELD(delivery_status, 'unassigned', 'rejected', 'assigned', 'accepted', 'picked_up', 'on_way')")
            ->orderByDesc('id')
            ->limit(50)
            ->get();

        return Inertia::render('Riders', [
            'riders' => $riders,
            'deliveryOrders' => $orders,
            'deliveryStatuses' => self::DELIVERY_STATUSES,
            'filters' => ['search' => $search],
            'hasRiderRole' => $riderRole !== null,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $riderRole = $this->ensureRiderRole();

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:1000'],
            'password' => ['required', 'string', 'min:6'],
            'vehicle_type' => ['nullable', 'string', 'max:50'],
            'vehicle_number' => ['nullable', 'string', 'max:50'],
            'is_available' => ['required', 'boolean'],
        ]);

        $data['password'] = Hash::make($data['password']);

        $user = User::create($data);
        $user->assignRole($riderRole);

        return back()->with('success', 'Rider created.');
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $riderRole = $this->ensureRiderRole();
        $rider = User::whereHas('roles', fn ($q) => $q->where('slug', self::RIDER_ROLE))->findOrFail($id);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($rider->id)],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:1000'],
            'password' => ['nullable', 'string', 'min:6'],
            'vehicle_type' => ['nullable', 'string', 'max:50'],
            'vehicle_number' => ['nullable', 'string', 'max:50'],
            'is_available' => ['required', 'boolean'],
        ]);

        if (! filled($data['password'] ?? null)) {
            unset($data['password']);
        } else {
            $data['password'] = Hash::make($data['password']);
        }

        $rider->update($data);
        $rider->assignRole($riderRole);

        return back()->with('success', 'Rider updated.');
    }

    public function destroy(int $id): RedirectResponse
    {
        $rider = User::whereHas('roles', fn ($q) => $q->where('slug', self::RIDER_ROLE))->findOrFail($id);

        $activeCount = $rider->assignedDeliveryOrders()
            ->whereIn('delivery_status', ['assigned', 'accepted', 'picked_up', 'on_way'])
            ->count();

        if ($activeCount > 0) {
            return back()->with('error', 'This rider has active deliveries. Reassign or complete them before deleting.');
        }

        $rider->forgetPermissionCache();
        $rider->delete();

        return back()->with('success', 'Rider deleted.');
    }

    public function assign(Request $request, int $orderId): RedirectResponse
    {
        $branchId = CurrentBranch::id();

        $data = $request->validate([
            'rider_id' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        $order = Order::query()
            ->where('type', 'delivery')
            ->when($branchId, fn ($q) => $q->where('branch_id', $branchId))
            ->findOrFail($orderId);

        if (empty($data['rider_id'])) {
            $order->update([
                'rider_id' => null,
                'delivery_status' => 'unassigned',
                'assigned_at' => null,
                'accepted_at' => null,
                'picked_up_at' => null,
                'on_way_at' => null,
                'delivered_at' => null,
                'delivery_rejection_reason' => null,
            ]);

            return back()->with('success', 'Delivery unassigned.');
        }

        $rider = User::whereHas('roles', fn ($q) => $q->where('slug', self::RIDER_ROLE))
            ->findOrFail($data['rider_id']);

        if (! $rider->is_available) {
            throw ValidationException::withMessages([
                'rider_id' => 'This rider is currently marked unavailable.',
            ]);
        }

        DB::transaction(function () use ($order, $rider) {
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
        });

        return back()->with('success', 'Delivery assigned to '.$rider->name.'.');
    }

    public function status(Request $request, int $orderId): RedirectResponse
    {
        $branchId = CurrentBranch::id();
        $data = $request->validate([
            'delivery_status' => ['required', Rule::in(self::DELIVERY_STATUSES)],
        ]);

        $order = Order::query()
            ->where('type', 'delivery')
            ->when($branchId, fn ($q) => $q->where('branch_id', $branchId))
            ->findOrFail($orderId);

        $updates = ['delivery_status' => $data['delivery_status']];

        if ($data['delivery_status'] === 'delivered') {
            $updates['status'] = 'completed';
            $updates['paid'] = true;
            $updates['delivered_at'] = now();
        }

        $order->update($updates);

        return back()->with('success', 'Delivery status updated.');
    }

    private function riderRole(): ?Role
    {
        return Role::where('slug', self::RIDER_ROLE)->first();
    }

    private function ensureRiderRole(): Role
    {
        return Role::firstOrCreate(
            ['slug' => self::RIDER_ROLE],
            [
                'name' => 'Rider',
                'description' => 'Delivery rider mobile app access.',
                'is_locked' => false,
            ]
        );
    }
}
