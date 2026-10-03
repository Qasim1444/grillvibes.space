<?php

namespace App\Http\Controllers\Web\CRM;

use App\Http\Controllers\Controller;
use App\Models\DiscountCampaign;
use App\Models\FoodCategory;
use App\Models\FoodItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Standing discounts that need no code. The POS reads the highest-priority live
 * campaign as a *suggestion* — the cashier still confirms it, so a campaign never
 * silently rewrites a bill.
 */
class DiscountCampaignController extends Controller
{
    /** Order types a campaign can be limited to (mirrors `orders.type`). */
    private const ORDER_TYPES = ['dining', 'delivery', 'on-way'];

    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $status = trim((string) $request->query('status', ''));

        $base = DiscountCampaign::query()
            ->when($search !== '', fn ($q) => $q->where('name', 'like', "%{$search}%"))
            ->when($status === 'active', fn ($q) => $q->where('is_active', true))
            ->when($status === 'inactive', fn ($q) => $q->where('is_active', false))
            ->when($status === 'expired', fn ($q) => $q->whereNotNull('ends_at')
                ->whereDate('ends_at', '<', now()->toDateString()));

        return Inertia::render('CRM/Discounts', [
            'campaigns' => (clone $base)
                ->orderByDesc('priority')
                ->orderByDesc('id')
                ->paginate(10)
                ->withQueryString()
                ->through(fn (DiscountCampaign $c) => [
                    'id' => $c->id,
                    'name' => $c->name,
                    'type' => $c->type,
                    'value' => (float) $c->value,
                    'max_discount' => $c->max_discount === null ? null : (float) $c->max_discount,
                    'min_order_amount' => (float) $c->min_order_amount,
                    'applies_to' => $c->applies_to,
                    'target_ids' => $c->target_ids ?? [],
                    'target_labels' => $this->targetLabels($c),
                    'order_types' => $c->order_types ?? [],
                    'starts_at' => $c->starts_at?->toDateString(),
                    'ends_at' => $c->ends_at?->toDateString(),
                    'is_active' => $c->is_active,
                    'priority' => $c->priority,
                    'is_live' => $c->isLive(),
                ]),
            'filters' => ['search' => $search, 'status' => $status],
            'orderTypes' => self::ORDER_TYPES,
            // Target pickers — both lists are small enough to ship whole.
            'categories' => FoodCategory::orderBy('name')->get(['id', 'name']),
            'foodItems' => FoodItem::orderBy('name')->get(['id', 'name']),
            'stats' => [
                'total' => DiscountCampaign::count(),
                'live' => DiscountCampaign::live()->count(),
                'inactive' => DiscountCampaign::where('is_active', false)->count(),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        DiscountCampaign::create($this->validated($request));

        return redirect()->back()->with('success', 'Discount campaign created.');
    }

    public function update(Request $request, $id): RedirectResponse
    {
        DiscountCampaign::findOrFail($id)->update($this->validated($request));

        return redirect()->back()->with('success', 'Discount campaign updated.');
    }

    public function destroy($id): RedirectResponse
    {
        DiscountCampaign::findOrFail($id)->delete();

        return redirect()->back()->with('success', 'Discount campaign deleted.');
    }

    private function validated(Request $request): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', Rule::in([DiscountCampaign::FIXED, DiscountCampaign::PERCENTAGE])],
            'value' => ['required', 'numeric', 'min:0.01'],
            'max_discount' => ['nullable', 'numeric', 'min:0'],
            'min_order_amount' => ['nullable', 'numeric', 'min:0'],
            'applies_to' => ['required', Rule::in(['all', 'category', 'item'])],
            'target_ids' => ['nullable', 'array'],
            'target_ids.*' => ['integer'],
            'order_types' => ['nullable', 'array'],
            'order_types.*' => [Rule::in(self::ORDER_TYPES)],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'is_active' => ['boolean'],
            'priority' => ['nullable', 'integer', 'min:0', 'max:9999'],
        ]);

        if ($data['type'] === DiscountCampaign::PERCENTAGE && (float) $data['value'] > 100) {
            throw ValidationException::withMessages([
                'value' => 'A percentage campaign cannot exceed 100%.',
            ]);
        }

        if ($data['applies_to'] !== 'all' && empty($data['target_ids'])) {
            throw ValidationException::withMessages([
                'target_ids' => 'Pick at least one '.$data['applies_to'].'.',
            ]);
        }

        // A scope-wide campaign has no targets to remember.
        $data['target_ids'] = $data['applies_to'] === 'all' ? null : array_values($data['target_ids']);
        $data['order_types'] = empty($data['order_types']) ? null : array_values($data['order_types']);
        $data['min_order_amount'] = $data['min_order_amount'] ?? 0;
        $data['priority'] = $data['priority'] ?? 0;
        $data['is_active'] = (bool) ($data['is_active'] ?? true);

        return $data;
    }

    /** Human-readable target names for the list column. */
    private function targetLabels(DiscountCampaign $campaign): array
    {
        $ids = $campaign->target_ids ?? [];

        if ($ids === []) {
            return [];
        }

        return match ($campaign->applies_to) {
            'category' => FoodCategory::whereIn('id', $ids)->pluck('name')->all(),
            'item' => FoodItem::whereIn('id', $ids)->pluck('name')->all(),
            default => [],
        };
    }
}
