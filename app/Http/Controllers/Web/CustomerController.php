<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\FoodItem;
use App\Models\Order;
use App\Support\CurrentBranch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Inertia (server-rendered) Customers page — replaces the old /api customer
 * endpoints consumed by axios. CRUD actions redirect back with a flash message;
 * Inertia then refreshes the page props so the table reflects the change.
 */
class CustomerController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $branchId = CurrentBranch::id();

        // The customers table can hold hundreds of thousands of rows, so it is
        // NEVER loaded in full — that exhausts PHP's memory_limit. Paginate and
        // filter server-side; the page requests a slice at a time.
        $customers = Customer::query()
            ->when($search !== '', fn ($q) => $q->where(function ($w) use ($search) {
                $w->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('contact', 'like', "%{$search}%");
            }))
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Customers', [
            'customers' => $customers,
            'filters' => ['search' => $search],
            // Powers the per-customer order-history modal (previously fetched
            // once via the API). Eager-load line items for the item breakdown.
            // Orders are few (unlike customers), so loading them all is fine.
            'orders' => Order::query()
                ->with('orderItems')
                ->when($branchId, fn ($q) => $q->where('branch_id', $branchId))
                ->get(['id', 'customer_id', 'status', 'paid', 'type', 'order_datetime', 'grand_total']),
            // Menu items — used to resolve line-item names in the modal.
            'foodItems' => FoodItem::get(['id', 'name']),
        ]);
    }

    /**
     * Typeahead search for the Orders / POS customer pickers. Returns a small
     * capped slice as JSON (not an Inertia page) so those pages can look
     * customers up on demand instead of shipping the whole table as props.
     */
    public function search(Request $request): JsonResponse
    {
        $q = trim((string) $request->query('q', ''));

        $customers = Customer::query()
            ->when($q !== '', fn ($query) => $query->where(function ($w) use ($q) {
                $w->where('name', 'like', "%{$q}%")
                    ->orWhere('contact', 'like', "%{$q}%");
            }))
            ->orderBy('name')
            ->limit(20)
            // The balance rides along so POS can offer points redemption straight
            // off the pick, without a second round trip.
            ->get(['id', 'name', 'contact', 'loyalty_points_balance']);

        return response()->json($customers);
    }

    /**
     * Resolve a single customer by phone number, used by the Customers page to
     * label incoming WhatsApp calls / typed numbers now that the full customer
     * list is no longer held client-side. Returns the match or null.
     */
    public function lookup(Request $request): JsonResponse
    {
        $contact = preg_replace('/\D+/', '', (string) $request->query('contact', ''));

        if ($contact === '') {
            return response()->json(null);
        }

        // Match on the trailing digits so stored/typed formatting differences
        // (leading 0 vs country code) still resolve.
        $tail = substr($contact, -10);

        $customer = Customer::query()
            ->where('contact', 'like', "%{$tail}")
            ->first(['id', 'name', 'contact']);

        return response()->json($customer);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate($this->rules());
        Customer::create($data);

        return redirect()->back()->with('success', 'Customer created.');
    }

    public function update(Request $request, $id): RedirectResponse
    {
        $customer = Customer::findOrFail($id);
        $data = $request->validate($this->rules($id));
        $customer->update($data);

        return redirect()->back()->with('success', 'Customer updated.');
    }

    public function destroy($id): RedirectResponse
    {
        Customer::findOrFail($id)->delete();

        return redirect()->back()->with('success', 'Customer deleted.');
    }

    /** Validation rules — mirrors the former API CustomerController. */
    private function rules($id = null): array
    {
        return [
            'name' => 'required|string|max:255',
            'contact' => 'required',
            'address' => 'required|string',
            'email' => [
                'nullable',
                'email:rfc,dns',
                'string',
                'max:255',
                Rule::unique('customers', 'email')->ignore($id),
            ],
            'date_of_birth' => 'nullable|date',
        ];
    }
}
