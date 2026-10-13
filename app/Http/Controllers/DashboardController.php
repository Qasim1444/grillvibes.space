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
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
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
            ],
        ]);
    }
}
