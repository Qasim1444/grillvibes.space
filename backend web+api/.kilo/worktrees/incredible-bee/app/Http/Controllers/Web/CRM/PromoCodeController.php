<?php

namespace App\Http\Controllers\Web\CRM;

use App\Http\Controllers\Controller;
use App\Models\PromoCode;
use App\Models\PromoRedemption;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Promo-code master data. The codes are only *applied* at checkout — see
 * `PromoService`, which is the single place a discount is computed, so nothing
 * here trusts a client-side amount.
 */
class PromoCodeController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $status = trim((string) $request->query('status', ''));

        $base = PromoCode::query()
            ->when($search !== '', fn ($q) => $q->where(fn ($w) => $w
                ->where('code', 'like', '%'.strtoupper($search).'%')
                ->orWhere('description', 'like', "%{$search}%")))
            ->when($status === 'active', fn ($q) => $q->where('is_active', true))
            ->when($status === 'inactive', fn ($q) => $q->where('is_active', false))
            ->when($status === 'expired', fn ($q) => $q->whereNotNull('ends_at')
                ->whereDate('ends_at', '<', now()->toDateString()));

        return Inertia::render('CRM/PromoCodes', [
            'promoCodes' => (clone $base)
                ->orderByDesc('id')
                ->paginate(10)
                ->withQueryString()
                ->through(fn (PromoCode $p) => [
                    'id' => $p->id,
                    'code' => $p->code,
                    'description' => $p->description,
                    'type' => $p->type,
                    'value' => (float) $p->value,
                    'max_discount' => $p->max_discount === null ? null : (float) $p->max_discount,
                    'min_order_amount' => (float) $p->min_order_amount,
                    'starts_at' => $p->starts_at?->toDateString(),
                    'ends_at' => $p->ends_at?->toDateString(),
                    'usage_limit' => $p->usage_limit,
                    'usage_limit_per_customer' => $p->usage_limit_per_customer,
                    'used_count' => $p->used_count,
                    'is_active' => $p->is_active,
                    // Why a code is unusable matters more than the flag alone.
                    'state' => $this->state($p),
                    'redeemed_total' => (float) $p->redemptions()->sum('discount_amount'),
                ]),
            'filters' => ['search' => $search, 'status' => $status],
            'stats' => [
                'total' => PromoCode::count(),
                'active' => PromoCode::where('is_active', true)->count(),
                'redemptions' => PromoRedemption::count(),
                'discount_given' => (float) PromoRedemption::sum('discount_amount'),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        PromoCode::create($this->validated($request));

        return redirect()->back()->with('success', 'Promo code created.');
    }

    public function update(Request $request, $id): RedirectResponse
    {
        $promo = PromoCode::findOrFail($id);
        $promo->update($this->validated($request, $promo->id));

        return redirect()->back()->with('success', 'Promo code updated.');
    }

    public function destroy($id): RedirectResponse
    {
        $promo = PromoCode::findOrFail($id);

        // Deleting would take the redemption history with it, which orders
        // reference — switching the code off is the reversible equivalent.
        if ($promo->redemptions()->exists()) {
            return redirect()->back()->with('error', 'This code has already been used on an order. Switch it off instead of deleting it.');
        }

        $promo->delete();

        return redirect()->back()->with('success', 'Promo code deleted.');
    }

    private function validated(Request $request, ?int $ignoreId = null): array
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:50', 'regex:/^[A-Za-z0-9_-]+$/', Rule::unique('promo_codes', 'code')->ignore($ignoreId)],
            'description' => ['nullable', 'string', 'max:255'],
            'type' => ['required', Rule::in([PromoCode::FIXED, PromoCode::PERCENTAGE])],
            'value' => ['required', 'numeric', 'min:0.01'],
            'max_discount' => ['nullable', 'numeric', 'min:0'],
            'min_order_amount' => ['nullable', 'numeric', 'min:0'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'usage_limit' => ['nullable', 'integer', 'min:1'],
            'usage_limit_per_customer' => ['nullable', 'integer', 'min:1'],
            'is_active' => ['boolean'],
        ], [
            'code.regex' => 'A code may only contain letters, numbers, dashes and underscores.',
        ]);

        if ($data['type'] === PromoCode::PERCENTAGE && (float) $data['value'] > 100) {
            throw ValidationException::withMessages([
                'value' => 'A percentage code cannot exceed 100%.',
            ]);
        }

        $data['min_order_amount'] = $data['min_order_amount'] ?? 0;
        $data['is_active'] = (bool) ($data['is_active'] ?? true);

        return $data;
    }

    /** usable | inactive | scheduled | expired | exhausted */
    private function state(PromoCode $promo): string
    {
        return match (true) {
            ! $promo->is_active => 'inactive',
            $promo->hasExpired() => 'expired',
            ! $promo->hasStarted() => 'scheduled',
            $promo->isExhausted() => 'exhausted',
            default => 'usable',
        };
    }
}
