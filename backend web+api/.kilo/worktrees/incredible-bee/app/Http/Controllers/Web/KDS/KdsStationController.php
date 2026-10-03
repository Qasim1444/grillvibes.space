<?php

namespace App\Http\Controllers\Web\KDS;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\FoodCategory;
use App\Models\KdsStation;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class KdsStationController extends Controller
{
    // ── Station management page ───────────────────────────────────────────────
    public function index(): Response
    {
        return Inertia::render('KDS/Stations', [
            'stations' => KdsStation::with('branch:id,name')
                ->orderBy('sort_order')->orderBy('name')
                ->get()
                ->map(fn ($s) => [
                    ...$s->only('id', 'name', 'color', 'description',
                        'category_ids', 'is_active', 'sort_order'),
                    'branch_id' => $s->branch_id,
                    'branch_name' => $s->branch?->name ?? 'All Branches',
                ]),
            'branches' => Branch::where('status', true)->orderBy('name')->get(['id', 'name']),
            'categories' => FoodCategory::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'branch_id' => 'nullable|exists:branches,id',
            'color' => 'nullable|string|max:20',
            'description' => 'nullable|string|max:500',
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'integer|exists:food_categories,id',
            'is_active' => 'boolean',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        KdsStation::create($data);

        return back()->with('success', 'KDS station created.');
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $station = KdsStation::findOrFail($id);

        $data = $request->validate([
            'name' => 'required|string|max:100',
            'branch_id' => 'nullable|exists:branches,id',
            'color' => 'nullable|string|max:20',
            'description' => 'nullable|string|max:500',
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'integer|exists:food_categories,id',
            'is_active' => 'boolean',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $station->update($data);

        return back()->with('success', 'Station updated.');
    }

    public function destroy(int $id): RedirectResponse
    {
        $station = KdsStation::findOrFail($id);
        $station->delete();

        return back()->with('success', 'Station deleted.');
    }

    // ── KDS Board (Inertia page + JSON polling endpoint) ─────────────────────

    /**
     * The Inertia board page — renders the shell with station + branch props.
     * The live ticket data is fetched separately via /kds/board/tickets (JSON)
     * so the board can poll without full-page reloads.
     */
    public function board(Request $request): Response
    {
        $stationId = $request->query('station_id', '');
        $branchId = $request->query('branch_id', '');

        return Inertia::render('KDS/Board', [
            'stations' => KdsStation::where('is_active', true)
                ->when($branchId, fn ($q) => $q->where(function ($sq) use ($branchId) {
                    $sq->where('branch_id', $branchId)->orWhereNull('branch_id');
                }))
                ->orderBy('sort_order')->orderBy('name')
                ->get(['id', 'name', 'color', 'branch_id']),
            'branches' => Branch::where('status', true)->orderBy('name')->get(['id', 'name']),
            'initialStationId' => $stationId ? (int) $stationId : null,
            'initialBranchId' => $branchId ? (int) $branchId : null,
        ]);
    }

    /**
     * JSON polling endpoint — returns live tickets for a station.
     * Called every few seconds by the KDS board Vue page.
     *
     * Response shape:
     * { tickets: [ { order_id, order_number, table, type, placed_at, age_seconds,
     *                kds_status, items: [{id, name, qty, note, kds_status}] } ] }
     */
    public function tickets(Request $request): JsonResponse
    {
        $stationId = $request->query('station_id');
        $branchId = $request->query('branch_id');

        // Fetch non-bumped order items for the requested station
        $items = OrderItem::with(['order:id,type,place_id,branch_id,order_datetime,status', 'item:id,name', 'kdsStation:id,name,color'])
            ->when($stationId, fn ($q) => $q->where('kds_station_id', $stationId))
            ->when(! $stationId && $branchId, fn ($q) => $q->whereHas(
                'order', fn ($oq) => $oq->where('branch_id', $branchId)
            ))
            ->whereNotIn('kds_status', ['bumped', 'recalled'])
            ->whereNull('deleted_at')
            ->orderBy('kds_sent_at')
            ->get();

        // Group by order
        $tickets = $items
            ->groupBy('order_id')
            ->map(function ($lines) {
                $order = $lines->first()->order;

                return [
                    'order_id' => $order->id,
                    'order_number' => '#'.str_pad($order->id, 4, '0', STR_PAD_LEFT),
                    'type' => $order->type,
                    'branch_id' => $order->branch_id,
                    'place_id' => $order->place_id,
                    'placed_at' => $order->order_datetime?->toIso8601String(),
                    'age_seconds' => $lines->min(fn ($i) => $i->ageSeconds()),
                    'kds_status' => $this->resolveTicketStatus($lines),
                    'items' => $lines->map(fn ($i) => [
                        'id' => $i->id,
                        'name' => $i->item?->name ?? '—',
                        'qty' => $i->quantity,
                        'note' => $i->add_note,
                        'kds_status' => $i->kds_status,
                        'age_seconds' => $i->ageSeconds(),
                        'station_id' => $i->kds_station_id,
                        'station_name' => $i->kdsStation?->name,
                        'station_color' => $i->kdsStation?->color ?? '#6366f1',
                    ])->values(),
                ];
            })
            ->values();

        return response()->json(['tickets' => $tickets, 'polled_at' => now()->toIso8601String()]);
    }

    /** Ticket status = worst status among its items (new > sent > preparing > ready). */
    private function resolveTicketStatus($items): string
    {
        $priority = array_flip(['ready', 'preparing', 'sent', 'new']);

        return $items
            ->map(fn ($i) => $i->kds_status)
            ->sortBy(fn ($s) => $priority[$s] ?? 99)
            ->last() ?? 'new';
    }

    /**
     * Bump a single item (mark ready/done and record timestamp).
     * Called from the KDS board when a cook taps "Done" on an item.
     */
    public function bumpItem(Request $request, int $itemId): JsonResponse
    {
        $item = OrderItem::findOrFail($itemId);

        $item->update([
            'kds_status' => 'bumped',
            'kds_bumped_at' => now(),
        ]);

        // If all items on this order are bumped, auto-advance order status
        $allBumped = OrderItem::where('order_id', $item->order_id)
            ->whereNull('deleted_at')
            ->where('kds_status', '!=', 'bumped')
            ->doesntExist();

        if ($allBumped) {
            $item->order()->update(['status' => 'ready']);
        }

        return response()->json(['ok' => true, 'all_bumped' => $allBumped]);
    }

    /**
     * Bump an entire order at once — convenience action.
     */
    public function bumpOrder(Request $request, int $orderId): JsonResponse
    {
        DB::transaction(function () use ($orderId) {
            OrderItem::where('order_id', $orderId)
                ->whereNull('deleted_at')
                ->whereNotIn('kds_status', ['bumped'])
                ->update(['kds_status' => 'bumped', 'kds_bumped_at' => now()]);

            Order::where('id', $orderId)->update(['status' => 'ready']);
        });

        return response()->json(['ok' => true]);
    }

    /**
     * Update the kds_status of a single item (sent → preparing → ready).
     */
    public function updateItemStatus(Request $request, int $itemId): JsonResponse
    {
        $data = $request->validate([
            'kds_status' => 'required|in:'.implode(',', KdsStation::KDS_STATUSES),
        ]);

        $item = OrderItem::findOrFail($itemId);
        $item->update($data + ['kds_sent_at' => $item->kds_sent_at ?? now()]);

        return response()->json(['ok' => true, 'kds_status' => $item->kds_status]);
    }

    /**
     * Recall a bumped item (put it back on the board).
     */
    public function recallItem(int $itemId): JsonResponse
    {
        OrderItem::findOrFail($itemId)->update([
            'kds_status' => 'sent',
            'kds_bumped_at' => null,
        ]);

        return response()->json(['ok' => true]);
    }
}
