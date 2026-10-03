<?php

namespace App\Http\Controllers\Web\HR;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Branch;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Attendance is entered as a day sheet, not row by row — marking 50 staff one
 * modal at a time is unusable. `index()` therefore returns the full roster for
 * the chosen date with any already-saved row merged in, and `bulkStore()` upserts
 * the whole day in one POST.
 */
class AttendanceController extends Controller
{
    // Mobile GPS commonly reports 100-200m accuracy indoors. The geofence
    // distance check below remains authoritative for the submitted coordinate.
    private const MAX_LOCATION_ACCURACY_METERS = 200;

    public function punchPage(): Response
    {
        $employee = request()->user()->load('place.branch');
        $branch = $employee->place?->branch;
        $attendance = Attendance::query()
            ->where('user_id', $employee->id)
            ->whereDate('date', Carbon::today())
            ->first();

        return Inertia::render('HR/AttendancePunch', [
            'employee' => ['name' => $employee->name],
            'branch' => $branch?->only(['name', 'attendance_radius_meters']),
            'locationIssue' => ! $employee->place
                ? 'no_place'
                : (! $branch ? 'no_branch' : (($branch->latitude === null || $branch->longitude === null) ? 'not_configured' : null)),
            'state' => $attendance?->check_out ? 'complete' : ($attendance?->check_in ? 'check_out' : 'check_in'),
        ]);
    }

    public function index(Request $request): Response
    {
        $date = $this->resolveDate($request->query('date'));
        $search = trim((string) $request->query('search', ''));

        $employees = User::query()
            ->payable()
            ->with('designation:id,name')
            ->when($search !== '', fn ($q) => $q->where(function ($w) use ($search) {
                $w->where('name', 'like', "%{$search}%")
                    ->orWhere('employee_code', 'like', "%{$search}%");
            }))
            ->orderBy('name')
            ->get(['id', 'name', 'employee_code', 'designation_id']);

        $saved = Attendance::query()
            ->whereIn('user_id', $employees->pluck('id'))
            ->whereDate('date', $date)
            ->get()
            ->keyBy('user_id');

        // The roster is one row per employee for one day — it never needs paging,
        // and paging it would make "save the whole sheet" lose the other pages.
        $roster = $employees->map(function (User $u) use ($saved) {
            $row = $saved->get($u->id);

            return [
                'user_id' => $u->id,
                'name' => $u->name,
                'employee_code' => $u->employee_code,
                'designation_name' => $u->designation?->name,
                'attendance_id' => $row?->id,
                'status' => $row->status ?? 'present',
                'check_in' => $row ? substr((string) $row->check_in, 0, 5) : null,
                'check_out' => $row ? substr((string) $row->check_out, 0, 5) : null,
                'late_minutes' => (int) ($row->late_minutes ?? 0),
                'note' => $row->note ?? null,
                'check_in_distance_meters' => $row?->check_in_distance_meters,
                'check_out_distance_meters' => $row?->check_out_distance_meters,
            ];
        })->values();

        return Inertia::render('HR/Attendance', [
            'date' => $date->toDateString(),
            'roster' => $roster,
            'statuses' => Attendance::STATUSES,
            'filters' => ['search' => $search],
            // The day's own tallies are computed on the page so they stay live
            // while the sheet is being edited; this is month-to-date context.
            'monthSummary' => $this->monthSummary($date),
            'branches' => Branch::query()
                ->orderBy('name')
                ->get(['id', 'name', 'latitude', 'longitude', 'attendance_radius_meters', 'attendance_start_time']),
        ]);
    }

    /** Save (or re-save) an entire day's sheet. */
    public function bulkStore(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'date' => ['required', 'date'],
            'rows' => ['required', 'array', 'min:1'],
            'rows.*.user_id' => ['required', 'integer', 'exists:users,id'],
            'rows.*.status' => ['required', Rule::in(Attendance::STATUSES)],
            'rows.*.check_in' => ['nullable', 'date_format:H:i'],
            'rows.*.check_out' => ['nullable', 'date_format:H:i'],
            'rows.*.late_minutes' => ['nullable', 'integer', 'min:0', 'max:1440'],
            'rows.*.note' => ['nullable', 'string', 'max:255'],
        ]);

        $date = Carbon::parse($data['date'])->toDateString();

        DB::transaction(function () use ($data, $date) {
            foreach ($data['rows'] as $row) {
                // Deliberately not updateOrCreate: its match clause is a plain
                // equality, and the `date` cast writes "2026-08-03 00:00:00" —
                // which MySQL truncates but SQLite keeps verbatim, so the match
                // would miss and re-saving a day would hit the unique index.
                $attendance = Attendance::query()
                    ->where('user_id', $row['user_id'])
                    ->whereDate('date', $date)
                    ->first() ?? new Attendance(['user_id' => $row['user_id'], 'date' => $date]);

                $attendance->fill([
                    'status' => $row['status'],
                    'check_in' => $row['check_in'] ?? null,
                    'check_out' => $row['check_out'] ?? null,
                    'worked_minutes' => $this->workedMinutes($row['check_in'] ?? null, $row['check_out'] ?? null),
                    'late_minutes' => $row['late_minutes'] ?? 0,
                    'note' => $row['note'] ?? null,
                ])->save();
            }
        });

        return redirect()->back()->with('success', 'Attendance saved for '.Carbon::parse($date)->format('d M Y').'.');
    }

    /** Mark the authenticated employee's next attendance event using GPS. */
    public function punch(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'accuracy' => ['required', 'numeric', 'min:0', 'max:10000'],
        ]);

        $employee = $request->user()->load('place.branch');
        $branch = $employee->place?->branch;

        if (! $employee->is_employee || $employee->employment_status !== 'active') {
            throw ValidationException::withMessages(['location' => 'Only active employees can mark attendance.']);
        }
        if (! $branch || $branch->latitude === null || $branch->longitude === null) {
            throw ValidationException::withMessages(['location' => 'Your branch has not configured an attendance location yet.']);
        }
        if ((float) $data['accuracy'] > self::MAX_LOCATION_ACCURACY_METERS) {
            throw ValidationException::withMessages(['location' => 'Location accuracy is too low. Please enable precise GPS and try again.']);
        }

        $distance = $this->distanceMeters((float) $data['latitude'], (float) $data['longitude'], (float) $branch->latitude, (float) $branch->longitude);
        if ($distance > (int) $branch->attendance_radius_meters) {
            throw ValidationException::withMessages(['location' => sprintf('You are about %d meters away. Attendance is allowed within %d meters of %s.', $distance, $branch->attendance_radius_meters, $branch->name)]);
        }

        $now = Carbon::now();
        $date = $now->toDateString();
        $attendance = Attendance::query()->where('user_id', $employee->id)->whereDate('date', $date)->first();
        if ($attendance?->check_out) {
            throw ValidationException::withMessages(['location' => 'Your attendance is already complete for today.']);
        }

        if (! $attendance || ! $attendance->check_in) {
            $lateMinutes = $branch->attendance_start_time
                ? max(0, Carbon::parse($date.' '.$branch->attendance_start_time)->diffInMinutes($now, false))
                : 0;
            $attendance ??= new Attendance(['user_id' => $employee->id, 'date' => $date]);
            $attendance->fill([
                'check_in' => $now->format('H:i:s'),
                'status' => $lateMinutes > 0 ? 'late' : 'present',
                'late_minutes' => $lateMinutes,
                'check_in_latitude' => $data['latitude'],
                'check_in_longitude' => $data['longitude'],
                'check_in_accuracy' => $data['accuracy'],
                'check_in_distance_meters' => $distance,
            ])->save();

            return back()->with('success', 'Check-in recorded successfully.');
        }

        $checkOut = $now->format('H:i:s');
        $attendance->fill([
            'check_out' => $checkOut,
            'worked_minutes' => $this->workedMinutes($attendance->check_in, $checkOut),
            'check_out_latitude' => $data['latitude'],
            'check_out_longitude' => $data['longitude'],
            'check_out_accuracy' => $data['accuracy'],
            'check_out_distance_meters' => $distance,
        ])->save();

        return back()->with('success', 'Check-out recorded successfully.');
    }

    public function destroy($id): RedirectResponse
    {
        Attendance::findOrFail($id)->delete();

        return redirect()->back()->with('success', 'Attendance entry removed.');
    }

    private function resolveDate(mixed $value): Carbon
    {
        try {
            return filled($value) ? Carbon::parse((string) $value)->startOfDay() : Carbon::today();
        } catch (\Throwable) {
            return Carbon::today();
        }
    }

    /** Minutes between check-in and check-out; overnight shifts roll past midnight. */
    private function workedMinutes(?string $in, ?string $out): int
    {
        if (blank($in) || blank($out)) {
            return 0;
        }

        [$inH, $inM] = array_map('intval', explode(':', $in));
        [$outH, $outM] = array_map('intval', explode(':', $out));
        $minutes = (($outH * 60) + $outM) - (($inH * 60) + $inM);

        return $minutes < 0 ? $minutes + 1440 : $minutes;
    }

    private function distanceMeters(float $latitude, float $longitude, float $targetLatitude, float $targetLongitude): int
    {
        $earthRadius = 6371000;
        $latDelta = deg2rad($targetLatitude - $latitude);
        $longitudeDelta = deg2rad($targetLongitude - $longitude);
        $a = sin($latDelta / 2) ** 2 + cos(deg2rad($latitude)) * cos(deg2rad($targetLatitude)) * sin($longitudeDelta / 2) ** 2;

        return (int) round($earthRadius * 2 * atan2(sqrt($a), sqrt(1 - $a)));
    }

    /** Headline numbers for the month the chosen date falls in. */
    private function monthSummary(Carbon $date): array
    {
        $rows = Attendance::query()
            ->whereBetween('date', [$date->copy()->startOfMonth(), $date->copy()->endOfMonth()])
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        return [
            'month' => $date->format('F Y'),
            'present' => (int) ($rows['present'] ?? 0) + (int) ($rows['late'] ?? 0),
            'absent' => (int) ($rows['absent'] ?? 0),
            'leave' => (int) ($rows['leave'] ?? 0),
            'marked_days' => Attendance::query()
                ->whereBetween('date', [$date->copy()->startOfMonth(), $date->copy()->endOfMonth()])
                ->distinct()
                ->count('date'),
        ];
    }
}
