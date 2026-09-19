<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\DiscountCampaign;
use App\Models\FoodCategory;
use App\Models\FoodItem;
use App\Models\KdsStation;
use App\Models\LoyaltySetting;
use App\Models\Order;
use App\Models\Place;
use App\Support\CurrentBranch;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Inertia (server-rendered) Point-of-Sale page. The menu, categories, places
 * and customers arrive as page props. The two "today" reports are exposed as
 * optional props (Inertia::optional): they're skipped on the initial load and
 * only evaluated when the client asks for them via a partial reload —
 * router.reload({ only: ['quickReport'] }) — when their modal opens.
 *
 * Placing an order is handled by the shared Web\OrderController@store (POST
 * /orders), which also generates the receipt and notifies the customer.
 */
class POSController extends Controller
{
    public function index(): Response
    {
        $branchId = CurrentBranch::id();

        return Inertia::render('POS', [
            'foodItems' => FoodItem::where('status', 1)
                ->orderBy('name')
                ->get(['id', 'name', 'price', 'image', 'foodcategory_id']),
            'categories' => FoodCategory::orderBy('name')->get(['id', 'name']),
            'places' => Place::when($branchId, fn ($q) => $q->where('branch_id', $branchId))
                ->orderBy('name')
                ->get(['id', 'name']),
            'kdsStations' => KdsStation::where('is_active', true)
                ->where(function ($q) {
                    $q->where('branch_id', CurrentBranch::id())->orWhereNull('branch_id');
                })
                ->orderBy('name')
                ->get(['id', 'name', 'color', 'branch_id']),
            // Customers are NOT shipped here — the table can hold 100k+ rows.
            // The POS customer field resolves them via /customers/search.

            // Loyalty rates so the cashier sees what a points redemption is worth
            // before submitting. The server re-prices it at checkout regardless.
            'loyalty' => $this->loyaltyRates(),
            // Standing campaigns are suggestions, not automatic markdowns: the
            // cashier applies one to the discount field, so the order's discount
            // stays a deliberate act with a person behind it.
            'campaigns' => DiscountCampaign::live()
                ->get(['id', 'name', 'type', 'value', 'max_discount', 'min_order_amount', 'applies_to', 'target_ids', 'order_types']),
            // On-demand "today" reports — only resolved on partial reloads.
            'quickReport' => Inertia::optional(fn () => $this->todaysOrders()),
            'topTen' => Inertia::optional(fn () => $this->todaysOrders(10)),
        ]);
    }

    /**
     * The loyalty numbers POS needs to preview a redemption: the rates plus the
     * caps that decide how many points a given bill can absorb.
     */
    private function loyaltyRates(): array
    {
        $settings = LoyaltySetting::current();

        return [
            'is_active' => $settings->is_active,
            'points_per_currency' => (float) $settings->points_per_currency,
            'currency_per_point' => (float) $settings->currency_per_point,
            'min_redeem_points' => $settings->min_redeem_points,
            'max_redeem_percent' => $settings->max_redeem_percent,
        ];
    }

    /**
     * Today's orders with their customer, newest first. An optional $limit
     * powers the "Top 10 Deals" view.
     */
    private function todaysOrders(?int $limit = null)
    {
        return Order::with('customer:id,name')
            ->when(CurrentBranch::id(), fn ($q, $branchId) => $q->where('branch_id', $branchId))
            ->whereBetween('order_datetime', [Carbon::today()->startOfDay(), Carbon::today()->endOfDay()])
            ->orderByDesc('order_datetime')
            ->when($limit, fn ($q) => $q->take($limit))
            ->get();
    }
}
