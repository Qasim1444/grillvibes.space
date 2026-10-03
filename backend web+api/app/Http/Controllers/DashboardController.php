<?php

namespace App\Http\Controllers;

use App\Http\Controllers\API\Admin\ReportController;
use App\Http\Controllers\API\OrderController;
use App\Models\Customer;
use App\Models\Feedback;
use App\Models\FoodCategory;
use App\Models\FoodItem;
use App\Models\Order;
use App\Models\User;
use App\Support\CurrentBranch;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    private const RIDER_EARNING_RATE = 0.10;

    public function index(Request $request): Response
    {
        // Date range for the report blocks. Default to today. The report SQL
        // filters on the `order_datetime`/`updated_at` datetime columns via
        // whereBetween — bare dates would collapse the end to 00:00:00 and drop
        // same-day orders, so widen to cover the full day(s).
        $startDate = $request->input('start_date', Carbon::today()->toDateString());
        $endDate = $request->input('end_date', Carbon::today()->toDateString());
        $branchId = CurrentBranch::id();

        $rangeRequest = new Request([
            'start_date' => $startDate.' 00:00:00',
            'end_date' => $endDate.' 23:59:59',
            'branch_id' => $branchId,
        ]);

        $reports = new ReportController;
        $orders = new OrderController(new Order);

        // ── Overview counts ──────────────────────────────────────────────
        $counts = [
            'users' => User::count(),
            'customers' => Customer::count(),
            'foodItems' => FoodItem::count(),
            'orders' => Order::when($branchId, fn ($q) => $q->where('branch_id', $branchId))->count(),
        ];

        // ── Recent orders (latest 5) ─────────────────────────────────────
        $recentOrders = Order::with('customer:id,name')
            ->when($branchId, fn ($q) => $q->where('branch_id', $branchId))
            ->latest('id')
            ->take(5)
            ->get(['id', 'customer_id', 'type', 'status', 'grand_total']);

        // ── Top categories (ranked by number of food items) ──────────────
        $categories = FoodCategory::query()
            ->withCount(['foodItems'])
            ->get(['id', 'name']);
        $maxCount = max(1, $categories->max('food_items_count') ?? 0);
        $topCategories = $categories
            ->sortByDesc('food_items_count')
            ->take(5)
            ->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'count' => $c->food_items_count,
                'pct' => (int) round(($c->food_items_count / $maxCount) * 100),
            ])
            ->values();

        // ── Feedback (latest 5 + average rating) ─────────────────────────
        $feedback = Feedback::with('customer:id,name')
            ->whereHas('customer.orders', fn ($q) => $q->when($branchId, fn ($sq) => $sq->where('branch_id', $branchId)))
            ->orderByDesc('id')
            ->take(5)
            ->get(['id', 'customer_id', 'rating', 'comment', 'created_at']);

        $feedbackStats = [
            'avg_rating' => round((float) Feedback::whereHas('customer.orders', fn ($q) => $q->when($branchId, fn ($sq) => $sq->where('branch_id', $branchId)))->avg('rating'), 1),
            'total'      => Feedback::whereHas('customer.orders', fn ($q) => $q->when($branchId, fn ($sq) => $sq->where('branch_id', $branchId)))->count(),
        ];

        // ── Report blocks (reuse the existing JSON report logic) ──────────
        $summaryData = $reports->dailySummaryReport($rangeRequest)->getData(true);
        $diningData = $reports->dailySummaryReportdining($rangeRequest)->getData(true);
        $deliveryData = $reports->dailySummaryReportdelivery($rangeRequest)->getData(true);
        $onwayData = $reports->dailySummaryReportonway($rangeRequest)->getData(true);
        $categorySalesData = $reports->dailyCategorySalesReport($rangeRequest)->getData(true);
        $itemQtyData = $reports->dailyCategorySalesByItemQuantityReport($rangeRequest)->getData(true);
        $itemQtyCurrentData = $reports->dailyCategorySalesByItemQuantityReportcurrentdate($rangeRequest)->getData(true);
        $quickData = $reports->dailySummaryQuickReport($rangeRequest)->getData(true);
        $topTenData = $reports->dailySummaryTopTenReport($rangeRequest)->getData(true);
        $deletedData = $orders->deletereport()->getData(true);
        $deliveryDashboard = $this->deliveryDashboard($startDate, $endDate, $branchId);

        return Inertia::render('Dashboard', [
            'counts' => $counts,
            'recentOrders' => $recentOrders,
            'topCategories' => $topCategories,
            'feedback' => $feedback,
            'feedbackStats' => $feedbackStats,
            'range' => ['start_date' => $startDate, 'end_date' => $endDate],
            'reports' => [
                'summary' => [
                    'ordersByType' => $summaryData['ordersByType'] ?? [],
                    'totalGrandTotal' => (float) ($summaryData['totalGrandTotal'] ?? 0),
                ],
                'dining' => [
                    'totalGrandTotal' => (float) ($diningData['totalGrandTotal'] ?? 0),
                    'rows' => $diningData['othercolumns'] ?? [],
                ],
                'delivery' => [
                    'totalGrandTotal' => (float) ($deliveryData['totalGrandTotal'] ?? 0),
                    'rows' => $deliveryData['othercolumns'] ?? [],
                ],
                'onway' => [
                    'totalGrandTotal' => (float) ($onwayData['totalGrandTotal'] ?? 0),
                    'rows' => $onwayData['othercolumns'] ?? [],
                ],
                'categorySales' => $categorySalesData['ordersByCategory'] ?? [],
                'itemQty' => [
                    'service_charge_total' => (float) ($itemQtyData['service_charge_total'] ?? 0),
                    'categories' => $itemQtyData['categories'] ?? [],
                ],
                'itemQtyCurrent' => [
                    'service_charge_total' => (float) ($itemQtyCurrentData['service_charge_total'] ?? 0),
                    'categories' => $itemQtyCurrentData['categories'] ?? [],
                    'totalGrandTotal' => (float) ($itemQtyCurrentData['totalGrandTotal'] ?? 0),
                ],
                'quickReport' => $quickData ?? [],
                'topTen' => $topTenData ?? [],
                'deletedOrders' => $deletedData['data'] ?? [],
                'deliveryDashboard' => $deliveryDashboard,
            ],
        ]);
    }

    private function deliveryDashboard(string $startDate, string $endDate, ?int $branchId): array
    {
        $rangeStart = $startDate.' 00:00:00';
        $rangeEnd = $endDate.' 23:59:59';

        $base = Order::query()
            ->where('type', 'delivery')
            ->when($branchId, fn ($q) => $q->where('branch_id', $branchId));

        $rangeOrders = (clone $base)->whereBetween('order_datetime', [$rangeStart, $rangeEnd]);
        $deliveredOrders = (clone $base)
            ->where('delivery_status', 'delivered')
            ->whereBetween(DB::raw('COALESCE(delivered_at, order_datetime)'), [$rangeStart, $rangeEnd]);

        $activeDeliveriesCount = (clone $base)
            ->whereIn('delivery_status', ['assigned', 'accepted', 'picked_up', 'on_way'])
            ->count();

        $activeOrders = (clone $base)
            ->with('customer:id,name,contact,address', 'rider:id,name,phone,last_lat,last_lng,last_location_at')
            ->whereIn('delivery_status', ['assigned', 'accepted', 'picked_up', 'on_way'])
            ->latest('order_datetime')
            ->limit(10)
            ->get();

        $riderRows = User::query()
            ->select('users.id', 'users.name', 'users.phone', 'users.vehicle_type', 'users.vehicle_number')
            ->whereHas('roles', fn ($q) => $q->where('slug', 'rider'))
            ->withCount([
                'assignedDeliveryOrders as active_deliveries_count' => fn ($q) => $q
                    ->where('type', 'delivery')
                    ->whereIn('delivery_status', ['assigned', 'accepted', 'picked_up', 'on_way'])
                    ->when($branchId, fn ($sq) => $sq->where('branch_id', $branchId)),
                'assignedDeliveryOrders as delivered_count' => fn ($q) => $q
                    ->where('type', 'delivery')
                    ->where('delivery_status', 'delivered')
                    ->whereBetween(DB::raw('COALESCE(delivered_at, order_datetime)'), [$rangeStart, $rangeEnd])
                    ->when($branchId, fn ($sq) => $sq->where('branch_id', $branchId)),
            ])
            ->withSum([
                'assignedDeliveryOrders as delivered_sales_total' => fn ($q) => $q
                    ->where('type', 'delivery')
                    ->where('delivery_status', 'delivered')
                    ->whereBetween(DB::raw('COALESCE(delivered_at, order_datetime)'), [$rangeStart, $rangeEnd])
                    ->when($branchId, fn ($sq) => $sq->where('branch_id', $branchId)),
            ], 'grand_total')
            ->orderByDesc('delivered_count')
            ->orderBy('name')
            ->limit(8)
            ->get()
            ->map(fn (User $rider) => [
                'id' => $rider->id,
                'name' => $rider->name,
                'phone' => $rider->phone,
                'vehicle' => trim(collect([$rider->vehicle_type, $rider->vehicle_number])->filter()->join(' · ')),
                'active_deliveries_count' => (int) $rider->active_deliveries_count,
                'delivered_count' => (int) $rider->delivered_count,
                'delivered_sales_total' => (float) ($rider->delivered_sales_total ?? 0),
                'earnings_total' => round((float) ($rider->delivered_sales_total ?? 0) * self::RIDER_EARNING_RATE, 2),
            ]);

        $deliveredTotal = (float) (clone $deliveredOrders)->sum('grand_total');

        return [
            'summary' => [
                'total_delivery_orders' => (clone $rangeOrders)->count(),
                'active_deliveries' => $activeDeliveriesCount,
                'delivered_orders' => (clone $deliveredOrders)->count(),
                'delivery_sales_total' => $deliveredTotal,
                'rider_earnings_total' => round($deliveredTotal * self::RIDER_EARNING_RATE, 2),
            ],
            'active_orders' => $activeOrders->map(fn (Order $order) => [
                'id' => $order->id,
                'order_code' => '#GRV-'.str_pad((string) $order->id, 4, '0', STR_PAD_LEFT),
                'customer' => $order->customer,
                'rider' => $order->rider,
                'delivery_status' => $order->delivery_status,
                'grand_total' => (float) $order->grand_total,
                'order_datetime' => optional($order->order_datetime)->toDateTimeString(),
            ]),
            'riders' => $riderRows,
        ];
    }
}
