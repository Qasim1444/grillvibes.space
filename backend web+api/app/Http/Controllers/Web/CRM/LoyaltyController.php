<?php

namespace App\Http\Controllers\Web\CRM;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\LoyaltySetting;
use App\Models\LoyaltyTransaction;
use App\Services\LoyaltyService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Loyalty programme settings plus a read-only view of the points ledger.
 *
 * The ledger is append-only, so this controller offers no edit or delete — a
 * mistake is fixed with an `adjust` row, which `LoyaltyService` writes together
 * with the customer's cached balance in one transaction.
 */
class LoyaltyController extends Controller
{
    public function __construct(private readonly LoyaltyService $loyalty) {}

    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $type = trim((string) $request->query('type', ''));
        $settings = LoyaltySetting::current();

        $ledger = LoyaltyTransaction::query()
            ->when($search !== '', fn ($q) => $q->where(fn ($w) => $w
                ->where('order_id', 'like', "%{$search}%")
                ->orWhere('note', 'like', "%{$search}%")
                ->orWhereHas('customer', fn ($c) => $c->where('name', 'like', "%{$search}%"))))
            ->when($type !== '', fn ($q) => $q->where('type', $type))
            ->with(['customer:id,name,contact', 'creator:id,name'])
            ->orderByDesc('id')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (LoyaltyTransaction $t) => [
                'id' => $t->id,
                'customer_id' => $t->customer_id,
                'customer_name' => $t->customer?->name,
                'order_id' => $t->order_id,
                'type' => $t->type,
                'points' => $t->points,
                'balance_after' => $t->balance_after,
                'points_remaining' => $t->points_remaining,
                'note' => $t->note,
                'created_by_name' => $t->creator?->name,
                'expires_at' => $t->expires_at?->toDateString(),
                'created_at' => $t->created_at?->format('d M Y H:i'),
            ]);

        return Inertia::render('CRM/Loyalty', [
            'settings' => [
                'is_active' => $settings->is_active,
                'points_per_currency' => (float) $settings->points_per_currency,
                'currency_per_point' => (float) $settings->currency_per_point,
                'min_redeem_points' => $settings->min_redeem_points,
                'max_redeem_percent' => $settings->max_redeem_percent,
                'points_expiry_days' => $settings->points_expiry_days,
            ],
            'ledger' => $ledger,
            'filters' => ['search' => $search, 'type' => $type],
            'types' => [
                LoyaltyTransaction::EARN,
                LoyaltyTransaction::REDEEM,
                LoyaltyTransaction::ADJUST,
                LoyaltyTransaction::EXPIRE,
            ],
            'stats' => [
                'outstanding' => (int) Customer::sum('loyalty_points_balance'),
                'members' => Customer::where('loyalty_points_balance', '>', 0)->count(),
                'earned' => (int) LoyaltyTransaction::where('points', '>', 0)->sum('points'),
                'redeemed' => (int) abs((int) LoyaltyTransaction::where('type', LoyaltyTransaction::REDEEM)->sum('points')),
            ],
            // Top balances give the page something useful above the ledger.
            'topCustomers' => Customer::query()
                ->where('loyalty_points_balance', '>', 0)
                ->orderByDesc('loyalty_points_balance')
                ->limit(10)
                ->get(['id', 'name', 'contact', 'loyalty_points_balance'])
                ->map(fn (Customer $c) => [
                    'id' => $c->id,
                    'name' => $c->name,
                    'contact' => $c->contact,
                    'balance' => (int) $c->loyalty_points_balance,
                ]),
        ]);
    }

    public function updateSettings(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'is_active' => ['boolean'],
            'points_per_currency' => ['required', 'numeric', 'min:0', 'max:1000'],
            'currency_per_point' => ['required', 'numeric', 'min:0', 'max:1000'],
            'min_redeem_points' => ['required', 'integer', 'min:0', 'max:1000000'],
            'max_redeem_percent' => ['required', 'integer', 'min:1', 'max:100'],
            'points_expiry_days' => ['required', 'integer', 'min:0', 'max:3650'],
        ]);

        $data['is_active'] = (bool) ($data['is_active'] ?? false);

        LoyaltySetting::current()->update($data);

        return redirect()->back()->with('success', 'Loyalty settings saved.');
    }

    /** Manual correction — a signed adjustment with a mandatory reason. */
    public function adjust(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'customer_id' => ['required', 'integer', 'exists:customers,id'],
            'points' => ['required', 'integer', 'not_in:0'],
            'note' => ['required', 'string', 'max:255'],
        ]);

        $customer = Customer::findOrFail($data['customer_id']);

        $this->loyalty->adjust($customer, (int) $data['points'], $data['note'], $request->user()->id);

        return redirect()->back()->with('success', 'Points adjusted for '.$customer->name.'.');
    }

    /**
     * Run the expiry sweep now. Also scheduled daily as `loyalty:expire`, but the
     * button exists because shared hosting often has no cron.
     */
    public function expire(): RedirectResponse
    {
        $points = $this->loyalty->expireDuePoints();

        return redirect()->back()->with(
            'success',
            $points > 0 ? "Expired {$points} point(s)." : 'No points were due to expire.'
        );
    }
}
