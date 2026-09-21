<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Support\CurrentBranch;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    private function branchId(Request $request): ?int
    {
        return $request->filled('branch_id') ? (int) $request->input('branch_id') : CurrentBranch::id();
    }

    private function dateRange(Request $request): array
    {
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $startInput = (string) $request->start_date;
            $endInput = (string) $request->end_date;
            $start = Carbon::parse($startInput);
            $end = Carbon::parse($endInput);

            if (! str_contains($startInput, ':')) {
                $start = $start->startOfDay();
            }

            if (! str_contains($endInput, ':')) {
                $end = $end->endOfDay();
            }

            return [$start, $end];
        }

        return [Carbon::today()->startOfDay(), Carbon::today()->endOfDay()];
    }

    public function dailySummaryReport(Request $request): JsonResponse
    {
        $branchId = $this->branchId($request);

        [$start, $end] = $this->dateRange($request);

        // Get sum of grand_total for each type for today
        $ordersByType = Order::select('type', DB::raw('SUM(grand_total) as grand_total'))
            ->when($branchId, fn ($q) => $q->where('branch_id', $branchId))
            ->whereBetween('order_datetime', [$start, $end])
            ->groupBy('type')
            ->get();

        // Get total grand_total for all orders today
        $totalGrandTotal = Order::when($branchId, fn ($q) => $q->where('branch_id', $branchId))
            ->whereBetween('order_datetime', [$start, $end])
            ->sum('grand_total');

        // Prepare the response data

        $data = [
            'message' => 'Order data for today retrieved successfully.',
            'ordersByType' => $ordersByType->isEmpty() ? [] : $ordersByType,
            'totalGrandTotal' => (float) $totalGrandTotal, // Ensure numeric type
        ];

        // Return JSON response with explicit status code
        return response()->json($data, 200);
    }

    public function dailySummaryReportdelivery(Request $request): JsonResponse
    {
        $branchId = $this->branchId($request);

        [$start, $end] = $this->dateRange($request);

        $dsr = Order::with('customer:id,name')
            ->select('id', 'discount_amount', 'subtotal', 'grand_total', 'customer_id', 'type', 'service_charges')
            ->when($branchId, fn ($q) => $q->where('branch_id', $branchId))
            ->where('type', 'delivery')
            ->whereBetween('order_datetime', [$start, $end])
            ->get();

        $ordersByType = Order::select('type', DB::raw('SUM(grand_total) as grand_total'))
            ->when($branchId, fn ($q) => $q->where('branch_id', $branchId))
            ->where('type', 'delivery')
            ->whereBetween('order_datetime', [$start, $end])
            ->groupBy('type')
            ->get();

        $totalGrandTotal = Order::where('type', 'delivery')
            ->when($branchId, fn ($q) => $q->where('branch_id', $branchId))
            ->whereBetween('order_datetime', [$start, $end])
            ->sum('grand_total');

        return response()->json([
            'message' => 'Order data retrieved successfully.',
            'ordersByType' => $ordersByType,
            'totalGrandTotal' => $totalGrandTotal,
            'othercolumns' => $dsr,
        ]);
    }

    public function dailySummaryReportdining(Request $request): JsonResponse
    {
        $branchId = $this->branchId($request);
        [$start, $end] = $this->dateRange($request);

        $dsr = Order::with('customer:id,name')
            ->select('id', 'discount_amount', 'order_datetime', 'subtotal', 'grand_total', 'customer_id', 'type', 'service_charges')
            ->when($branchId, fn ($q) => $q->where('branch_id', $branchId))
            ->where('type', 'dining')
            ->whereBetween('order_datetime', [$start, $end])
            ->get();

        $ordersByType = Order::select('type', DB::raw('SUM(grand_total) as grand_total'))
            ->when($branchId, fn ($q) => $q->where('branch_id', $branchId))
            ->where('type', 'dining')
            ->whereBetween('order_datetime', [$start, $end])
            ->groupBy('type')
            ->get();

        $totalGrandTotal = Order::where('type', 'dining')
            ->when($branchId, fn ($q) => $q->where('branch_id', $branchId))
            ->whereBetween('order_datetime', [$start, $end])
            ->sum('grand_total');

        return response()->json([
            'message' => 'Order data retrieved successfully.',
            'ordersByType' => $ordersByType,
            'totalGrandTotal' => $totalGrandTotal,
            'othercolumns' => $dsr,
        ]);
    }

    public function dailySummaryReportonway(Request $request): JsonResponse
    {
        $branchId = $this->branchId($request);

        [$start, $end] = $this->dateRange($request);

        $dsr = Order::with('customer:id,name')
            ->select('id', 'discount_amount', 'subtotal', 'grand_total', 'customer_id', 'type', 'service_charges')
            ->when($branchId, fn ($q) => $q->where('branch_id', $branchId))
            ->where('type', 'on-way')
            ->whereBetween('order_datetime', [$start, $end])
            ->get();

        $ordersByType = Order::select('type', DB::raw('SUM(grand_total) as grand_total'))
            ->when($branchId, fn ($q) => $q->where('branch_id', $branchId))
            ->where('type', 'on-way')
            ->whereBetween('order_datetime', [$start, $end])
            ->groupBy('type')
            ->get();

        $totalGrandTotal = Order::where('type', 'on-way')
            ->when($branchId, fn ($q) => $q->where('branch_id', $branchId))
            ->whereBetween('order_datetime', [$start, $end])
            ->sum('grand_total');

        return response()->json([
            'message' => 'Order data retrieved successfully.',
            'ordersByType' => $ordersByType,
            'totalGrandTotal' => $totalGrandTotal,
            'othercolumns' => $dsr,
        ]);
    }

    public function dailyCategorySalesReport(Request $request): JsonResponse
    {
        $branchId = $this->branchId($request);

        [$start, $end] = $this->dateRange($request);
        // Get sum of subtotal for each category and apply discount
        $ordersByCategory = OrderItem::select(
            'order_items.category_id',
            'food_categories.name as category_name',
            DB::raw('SUM(order_items.sub_total) as total_subtotal'),  // Sum of subtotal for each category
            DB::raw('SUM(order_items.discount_amount) as discount_amount') // Sum of discount_amount for each category
        )
            ->join('food_categories', 'order_items.category_id', '=', 'food_categories.id') // Join with food_categories
            ->join('orders', 'order_items.order_id', '=', 'orders.id') // Join with orders table
            ->when($branchId, fn ($q) => $q->where('orders.branch_id', $branchId))
            ->whereBetween('orders.order_datetime', [$start, $end])
            ->groupBy('order_items.category_id', 'food_categories.name') // Group by category_id and category_name
            ->get();

        // Apply the discount to total subtotal
        $ordersByCategory->map(function ($item) {
            // Subtract the discount from the total subtotal (if discount is applied)
            $item->grand_total = $item->total_subtotal - $item->discount_amount;

            return $item;
        });

        // Prepare the data to return
        $data = [
            'message' => 'Order data for today retrieved successfully.',
            'ordersByCategory' => $ordersByCategory, // Collection of orders grouped by category with grand_total per category
        ];

        return response()->json($data);
    }

    public function dailyCategorySalesByItemQuantityReport(Request $request): JsonResponse
    {
        $branchId = $this->branchId($request);

        [$start, $end] = $this->dateRange($request);
        // 1. Get all order items with related item and category
        $orderItems = OrderItem::with('item:id,name', 'foodCategory:id,name')->select(
            'fooditems_id',
            'category_id',
            DB::raw('SUM(quantity) as total_quantity'),
            DB::raw('SUM(sub_total) as total_subtotal'),
            DB::raw('SUM(discount_amount) as discount_amount')
        )
            ->whereHas('order', function ($q) use ($start, $end, $branchId) {
                $q->whereBetween('order_datetime', [$start, $end]);
                $q->when($branchId, fn ($sq) => $sq->where('branch_id', $branchId));
            })
            ->groupBy('fooditems_id', 'category_id')
            ->get();

        // 2. Group and summarize by category
        $groupedByCategory = [];

        foreach ($orderItems as $orderItem) {
            $categoryName = isset($orderItem['foodCategory']['name']) ? $orderItem['foodCategory']['name'] : 'Unknown Category';
            $itemName = isset($orderItem['item']['name']) ? $orderItem['item']['name'] : 'Unknown Item';

            if (! isset($groupedByCategory[$categoryName])) {
                $groupedByCategory[$categoryName] = [
                    'category_name' => $categoryName,
                    'total_quantity' => 0,
                    'total_subtotal' => 0,
                    'discount_amount' => 0,
                    'items' => [],
                ];
            }

            $groupedByCategory[$categoryName]['total_quantity'] += (int) $orderItem['total_quantity'];
            $groupedByCategory[$categoryName]['total_subtotal'] += (float) $orderItem['total_subtotal'];
            $groupedByCategory[$categoryName]['discount_amount'] += (float) $orderItem['discount_amount'];

            $groupedByCategory[$categoryName]['total_subtotal'] = round($groupedByCategory[$categoryName]['total_subtotal'], 2);
            $groupedByCategory[$categoryName]['discount_amount'] = round($groupedByCategory[$categoryName]['discount_amount'], 2);

            $groupedByCategory[$categoryName]['items'][] = [
                'fooditems_id' => $orderItem['fooditems_id'] ?? null,
                'item_name' => $itemName,
                'total_quantity' => $orderItem['total_quantity'] ?? 0,
                'total_subtotal' => $orderItem['total_subtotal'] ?? 0,
                'discount_amount' => $orderItem['discount_amount'] ?? 0,
            ];
        }

        // 3. Convert to indexed array
        $finalResult = array_values($groupedByCategory);

        // 4. Get total service charge for today (sargable range so the created_at index is used)
        $totalServiceCharge = Order::whereBetween('created_at', [Carbon::today()->startOfDay(), Carbon::today()->endOfDay()])
            ->when($branchId, fn ($q) => $q->where('branch_id', $branchId))
            ->sum('service_charges');

        // 5. Build and return final response
        $response = [
            'service_charge_total' => $totalServiceCharge,
            'categories' => $finalResult,
        ];

        return response()->json($response);

    }

    public function dailyCategorySalesByItemQuantityReportcurrentdate(Request $request): JsonResponse
    {
        $branchId = $this->branchId($request);
        [$start, $end] = $this->dateRange($request);

        $orderItems = OrderItem::with(['item:id,name', 'foodCategory:id,name'])
            ->whereHas('order', function ($q) use ($start, $end, $branchId) {
                $q->whereBetween('order_datetime', [$start, $end]);
                $q->when($branchId, fn ($sq) => $sq->where('branch_id', $branchId));
            })
            ->select(
                'fooditems_id',
                'category_id',
                DB::raw('SUM(quantity) as total_quantity'),
                DB::raw('SUM(sub_total) as total_subtotal'),
                DB::raw('SUM(discount_amount) as discount_amount')
            )
            ->groupBy('fooditems_id', 'category_id')
            ->get();

        $groupedByCategory = [];

        foreach ($orderItems as $orderItem) {
            // Check if the category and item exist in the current orderItem
            $categoryName = isset($orderItem['foodCategory']['name']) ? $orderItem['foodCategory']['name'] : 'Unknown Category';
            $itemName = isset($orderItem['item']['name']) ? $orderItem['item']['name'] : 'Unknown Item';

            // If the category doesn't exist yet, create an empty structure for it
            if (! isset($groupedByCategory[$categoryName])) {
                $groupedByCategory[$categoryName] = [
                    'category_name' => $categoryName,
                    'total_quantity' => 0,
                    'total_subtotal' => 0,
                    'discount_amount' => 0,
                    'items' => [],
                ];
            }

            // Sum the total quantity and subtotal for the category
            $groupedByCategory[$categoryName]['total_quantity'] += (int) $orderItem['total_quantity'];
            $groupedByCategory[$categoryName]['total_subtotal'] += (float) $orderItem['total_subtotal'];
            $groupedByCategory[$categoryName]['discount_amount'] += (float) $orderItem['discount_amount'];

            $groupedByCategory[$categoryName]['total_subtotal'] = round($groupedByCategory[$categoryName]['total_subtotal'], 2);
            $groupedByCategory[$categoryName]['discount_amount'] = round($groupedByCategory[$categoryName]['discount_amount'], 2);

            // Add the item to the category's items array
            $groupedByCategory[$categoryName]['items'][] = [
                'fooditems_id' => isset($orderItem['fooditems_id']) ? $orderItem['fooditems_id'] : null,
                'item_name' => $itemName,
                'total_quantity' => isset($orderItem['total_quantity']) ? $orderItem['total_quantity'] : 0,
                'total_subtotal' => isset($orderItem['total_subtotal']) ? $orderItem['total_subtotal'] : 0,
                'discount_amount' => isset($orderItem['discount_amount']) ? $orderItem['discount_amount'] : 0,
            ];
        }

        // Convert the grouped data back into an array (optional)
        $finalResult = array_values($groupedByCategory);

        $today = Carbon::today();
        // 2. Get total service charge for today (sargable range so the order_datetime index is used)
        $totalServiceCharge = Order::whereBetween('order_datetime', [$today->copy()->startOfDay(), $today->copy()->endOfDay()])
            ->when($branchId, fn ($q) => $q->where('branch_id', $branchId))
            ->sum('service_charges');
        // 3. Append service charge to the final result

        $totalGrandTotal = Order::when($branchId, fn ($q) => $q->where('branch_id', $branchId))
            ->whereBetween('order_datetime', [$start, $end])
            ->sum('grand_total');

        $response = [
            'service_charge_total' => $totalServiceCharge,
            'categories' => $finalResult,
            'totalGrandTotal' => (float) $totalGrandTotal,
        ];

        // Return JSON response
        return response()->json($response, 200, [], JSON_PRETTY_PRINT);

    }

    public function dailySummaryQuickReport(?Request $request = null)
    {
        $request ??= request();
        [$start, $end] = $this->dateRange($request);
        $branchId = $this->branchId($request);

        $orders = Order::with('customer')->
        when($branchId, fn ($q) => $q->where('branch_id', $branchId))->
        whereBetween('order_datetime', [$start, $end])
            ->get();

        return response()->json($orders, 200);
    }

    public function dailySummaryTopTenReport(?Request $request = null)
    {
        $request ??= request();
        [$start, $end] = $this->dateRange($request);
        $branchId = $this->branchId($request);

        $orders = Order::with('customer')
            ->when($branchId, fn ($q) => $q->where('branch_id', $branchId))
            ->whereBetween('order_datetime', [$start, $end])
            ->orderBy('order_datetime', 'desc') // optional: sort by latest first
            ->take(10)
            ->get();

        return response()->json($orders, 200);
    }
}
