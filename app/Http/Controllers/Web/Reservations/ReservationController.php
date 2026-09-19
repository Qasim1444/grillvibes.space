<?php

namespace App\Http\Controllers\Web\Reservations;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\DiningTable;
use App\Models\Reservation;
use App\Models\WaitlistEntry;
use App\Support\CurrentBranch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ReservationController extends Controller
{
    // ── Reservations list + CRUD ──────────────────────────────────────────────
    public function index(Request $request): Response
    {
        $date     = $request->query('date', now()->toDateString());
        $branchId = $request->query('branch_id', CurrentBranch::id());
        $status   = $request->query('status', '');

        $reservations = Reservation::with(['diningTable:id,table_number', 'branch:id,name'])
            ->whereDate('reserved_at', $date)
            ->when($branchId, fn ($q) => $q->where('branch_id', $branchId))
            ->when($status,  fn ($q) => $q->where('status', $status))
            ->orderBy('reserved_at')
            ->get()
            ->map(fn ($r) => [
                ...$r->only('id', 'guest_name', 'guest_phone', 'party_size',
                             'reserved_at', 'duration_minutes', 'status', 'occasion', 'notes', 'source',
                             'dining_table_id', 'branch_id'),
                'table_number' => $r->diningTable?->table_number,
                'branch_name'  => $r->branch?->name,
                'ends_at'      => $r->endsAt()->toIso8601String(),
            ]);

        $waitlist = WaitlistEntry::with('branch:id,name')
            ->whereDate('checked_in_at', $date)
            ->when($branchId, fn ($q) => $q->where('branch_id', $branchId))
            ->whereIn('status', ['waiting'])
            ->orderBy('checked_in_at')
            ->get()
            ->map(fn ($w) => [
                ...$w->only('id', 'guest_name', 'guest_phone', 'party_size',
                             'status', 'checked_in_at', 'notified_at', 'estimated_wait_minutes', 'notes', 'branch_id'),
                'branch_name' => $w->branch?->name,
                'wait_minutes'=> $w->waitMinutes(),
            ]);

        return Inertia::render('Reservations/Index', [
            'reservations'  => $reservations,
            'waitlist'      => $waitlist,
            'branches'      => CurrentBranch::all(),
            'tables'        => DiningTable::where('is_active', true)
                ->when($branchId, fn ($q) => $q->where('branch_id', $branchId))
                ->orderBy('table_number')
                ->get(['id', 'table_number', 'capacity', 'status', 'branch_id']),
            'statuses'      => Reservation::STATUSES,
            'sources'       => Reservation::SOURCES,
            'filters'       => ['date' => $date, 'branch_id' => $branchId, 'status' => $status],
        ]);
    }

    /**
     * Conflict check against existing active (pending/confirmed/seated)
     * reservations:
     *  1. Same date & time as another reservation → blocked, regardless of
     *     table.
     *  2. Overlapping window on the same table → blocked (double booking).
     */
    private function hasConflict(?int $branchId, ?int $tableId, string $reservedAt, int $duration, ?int $ignoreId = null): bool
    {
        $start = \Carbon\Carbon::parse($reservedAt);
        $end   = $start->copy()->addMinutes($duration);

        return Reservation::whereIn('status', ['pending', 'confirmed', 'seated'])
            ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
            ->when($branchId, fn ($q) => $q->where(fn ($bq) => $bq->where('branch_id', $branchId)->orWhereNull('branch_id')))
            ->get()
            ->contains(function (Reservation $r) use ($start, $end, $tableId) {
                $rStart = \Carbon\Carbon::parse($r->reserved_at);
                $rEnd   = $rStart->copy()->addMinutes($r->duration_minutes ?? 90);

                if (! $start->lt($rEnd) || ! $rStart->lt($end)) {
                    return false; // windows don't overlap
                }

                // Same exact date & time → always a conflict
                if ($rStart->equalTo($start)) {
                    return true;
                }

                // Overlapping window on the same table → double booking
                return $tableId && $r->dining_table_id === $tableId;
            });
    }

    public function store(Request $request): RedirectResponse
    {
        
        $data = $request->validate([
            'dining_table_id'  => 'nullable|exists:dining_tables,id',
            'branch_id'        => 'nullable|exists:branches,id',
            'place_id'         => 'nullable|exists:places,id',
            'guest_name'       => 'required|string|max:255',
            'guest_phone'      => 'nullable|string|max:50',
            'guest_email'      => 'nullable|email|max:255',
            'party_size'       => 'required|integer|min:1',
            'reserved_at'      => 'required|date',
            'duration_minutes' => 'nullable|integer|min:15|max:480',
            'status'           => 'nullable|in:' . implode(',', Reservation::STATUSES),
            'occasion'         => 'nullable|string|max:100',
            'notes'            => 'nullable|string|max:1000',
            'source'           => 'nullable|in:' . implode(',', Reservation::SOURCES),
        ]);

        if ($this->hasConflict(
            $data['branch_id'] ?? null,
            $data['dining_table_id'] ?? null,
            $data['reserved_at'],
            $data['duration_minutes'] ?? 90
        )) {
            return back()->withErrors(
                'reserved_at',
                'A reservation already exists at this date & time (or the selected table is double-booked).'
            )->withInput();
        }

        Reservation::create([
            ...$data,
            'branch_id'  => $data['branch_id'] ?? CurrentBranch::id(),
            'status'     => $data['status'] ?? 'confirmed',
            'created_by' => $request->user()->id,
        ]);

        return back()->with('success', 'Reservation created.');
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $reservation = Reservation::findOrFail($id);

        $data = $request->validate([
            'dining_table_id'  => 'nullable|exists:dining_tables,id',
            'branch_id'        => 'nullable|exists:branches,id',
            'place_id'         => 'nullable|exists:places,id',
            'guest_name'       => 'required|string|max:255',
            'guest_phone'      => 'nullable|string|max:50',
            'guest_email'      => 'nullable|email|max:255',
            'party_size'       => 'required|integer|min:1',
            'reserved_at'      => 'required|date',
            'duration_minutes' => 'nullable|integer|min:15|max:480',
            'status'           => 'required|in:' . implode(',', Reservation::STATUSES),
            'occasion'         => 'nullable|string|max:100',
            'notes'            => 'nullable|string|max:1000',
        ]);

        if ($this->hasConflict(
            $data['branch_id'] ?? null,
            $data['dining_table_id'] ?? null,
            $data['reserved_at'],
            $data['duration_minutes'] ?? 90,
            $reservation->id
        )) {
            return back()->withErrors(
                'reserved_at',
                'A reservation already exists at this date & time (or the selected table is double-booked).'
            )->withInput();
        }

        $reservation->update($data);

        // Sync table status when reservation is seated
        if ($data['status'] === 'seated' && $reservation->dining_table_id) {
            DiningTable::where('id', $reservation->dining_table_id)
                ->update(['status' => 'occupied']);
        }

        return back()->with('success', 'Reservation updated.');
    }

    public function destroy(int $id): RedirectResponse
    {
        Reservation::findOrFail($id)->delete();

        return back()->with('success', 'Reservation deleted.');
    }

    // ── Floor Plan ────────────────────────────────────────────────────────────

    public function floorPlan(Request $request): Response
    {
        $branchId = $request->query('branch_id', CurrentBranch::id());

        $tables = DiningTable::with('currentOrder:id,type,order_datetime')
            ->where('is_active', true)
            ->when($branchId, fn ($q) => $q->where('branch_id', $branchId))
            ->get()
            ->map(fn ($t) => [
                ...$t->only('id', 'table_number', 'capacity', 'shape',
                             'pos_x', 'pos_y', 'status', 'current_order_id', 'branch_id'),
                'current_order_type' => $t->currentOrder?->type,
            ]);

        // Today's upcoming reservations to overlay on the floor plan
        $todayReservations = Reservation::whereDate('reserved_at', now())
            ->whereIn('status', ['confirmed', 'pending'])
            ->when($branchId, fn ($q) => $q->where('branch_id', $branchId))
            ->get(['id', 'dining_table_id', 'guest_name', 'party_size', 'reserved_at', 'status']);

        return Inertia::render('Reservations/FloorPlan', [
            'tables'           => $tables,
            'todayReservations'=> $todayReservations,
            'branches'         => CurrentBranch::all(),
            'tableStatuses'    => DiningTable::STATUSES,
            'tableShapes'      => DiningTable::SHAPES,
            'selectedBranchId' => $branchId ? (int) $branchId : null,
        ]);
    }

    /**
     * Save updated table positions from the drag-drop floor-plan editor.
     * Body: { tables: [{id, pos_x, pos_y}] }
     */
    public function saveFloorPlan(Request $request): JsonResponse
    {
        $data = $request->validate([
            'tables'          => 'required|array',
            'tables.*.id'     => 'required|integer|exists:dining_tables,id',
            'tables.*.pos_x'  => 'required|integer|min:0',
            'tables.*.pos_y'  => 'required|integer|min:0',
        ]);

        DB::transaction(function () use ($data) {
            foreach ($data['tables'] as $t) {
                DiningTable::where('id', $t['id'])
                    ->update(['pos_x' => $t['pos_x'], 'pos_y' => $t['pos_y']]);
            }
        });

        return response()->json(['ok' => true]);
    }

    /**
     * CRUD for dining tables (used in both floor plan and reservation pages).
     */
    public function storeDiningTable(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'branch_id'    => 'nullable|exists:branches,id',
            'place_id'     => 'nullable|exists:places,id',
            'table_number' => 'required|string|max:20',
            'capacity'     => 'required|integer|min:1|max:50',
            'shape'        => 'required|in:' . implode(',', DiningTable::SHAPES),
            'pos_x'        => 'nullable|integer|min:0',
            'pos_y'        => 'nullable|integer|min:0',
        ]);

        DiningTable::create([
            ...$data,
            'branch_id' => $data['branch_id'] ?? CurrentBranch::id(),
            'status' => 'available',
            'is_active' => true,
        ]);

        return back()->with('success', 'Table added.');
    }

    public function updateDiningTable(Request $request, int $id): RedirectResponse
    {
        $table = DiningTable::findOrFail($id);

        $data = $request->validate([
            'branch_id'    => 'nullable|exists:branches,id',
            'table_number' => 'required|string|max:20',
            'capacity'     => 'required|integer|min:1|max:50',
            'shape'        => 'required|in:' . implode(',', DiningTable::SHAPES),
            'status'       => 'required|in:' . implode(',', DiningTable::STATUSES),
            'is_active'    => 'boolean',
        ]);

        $table->update($data);

        return back()->with('success', 'Table updated.');
    }

    public function destroyDiningTable(int $id): RedirectResponse
    {
        DiningTable::findOrFail($id)->delete();

        return back()->with('success', 'Table removed.');
    }

    // ── Waitlist ──────────────────────────────────────────────────────────────

    public function storeWaitlist(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'branch_id'              => 'nullable|exists:branches,id',
            'place_id'               => 'nullable|exists:places,id',
            'guest_name'             => 'required|string|max:255',
            'guest_phone'            => 'nullable|string|max:50',
            'party_size'             => 'required|integer|min:1',
            'estimated_wait_minutes' => 'nullable|integer|min:1',
            'notes'                  => 'nullable|string|max:500',
        ]);

        WaitlistEntry::create([
            ...$data,
            'branch_id'      => $data['branch_id'] ?? CurrentBranch::id(),
            'status'         => 'waiting',
            'checked_in_at'  => now(),
            'created_by'     => $request->user()->id,
        ]);

        return back()->with('success', 'Added to waitlist.');
    }

    public function updateWaitlist(Request $request, int $id): RedirectResponse
    {
        $entry = WaitlistEntry::findOrFail($id);

        $data = $request->validate([
            'status'                 => 'required|in:' . implode(',', WaitlistEntry::STATUSES),
            'estimated_wait_minutes' => 'nullable|integer|min:1',
            'notes'                  => 'nullable|string|max:500',
            'notify'                 => 'nullable|boolean',
        ]);

        $extra = [];
        if ($data['status'] === 'seated' && ! $entry->seated_at) {
            $extra['seated_at'] = now();
        }

        $wasNotified = (bool) $entry->notified_at; // capture BEFORE the update

        $entry->update(array_merge($data, $extra));

        // "Notify" action — send a WhatsApp message via the gateway and
        // record when the guest was notified. Stamp the first notify only.
        if (! empty($data['notify']) && ! $wasNotified) {
            if ($entry->guest_phone) {
                $venue   = $entry->branch?->name ?? config('app.name', 'GrillVibes');
                $message = "Assalam-o-Alaikum {$entry->guest_name}! \xF0\x9F\x8D\xBD Your table at {$venue} is ready. Please see the host desk. Thank you!";
                $sent    = $this->sendWhatsApp($entry->guest_phone, $message);

                return $sent
                    ? back()->with('success', 'WhatsApp message sent — guest notified.')
                    : back()->with('error', 'WhatsApp gateway did not confirm delivery. Guest marked as notified — please call them.');
            }

            return back()->with('error', 'No phone number on file — guest marked as notified but no message sent.');
        }

        return back()->with('success', 'Waitlist updated.');
    }

    /**
     * Send a text WhatsApp message through the webwhatsappjs gateway.
     * Number is normalized to international format (PK local numbers
     * starting with 0 are converted to 92...). Returns true on 2xx.
     */
    private function sendWhatsApp(string $phone, string $message): bool
    {
        $digits = preg_replace('/\D/', '', $phone);
        if ($digits === '') {
            return false;
        }
        if (str_starts_with($digits, '0')) {
            $digits = '92' . substr($digits, 1);
        } elseif (strlen($digits) === 10) {
            $digits = '92' . $digits;
        }

        $base = rtrim(config('services.whatsapp.base_url'), '/');

        try {
            $response = \Illuminate\Support\Facades\Http::timeout(20)
                ->post("{$base}/send-message", [
                    'number'  => $digits,
                    'message' => $message,
                ]);

            return $response->successful();
        } catch (\Throwable $e) {
            report($e);

            return false;
        }
    }
}
