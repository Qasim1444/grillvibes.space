<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Support\CurrentBranch;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

/**
 * Outlet switcher for the topbar. The Branches management page (CRUD) was
 * removed, but branch scoping itself stays — so any authenticated user can
 * still switch which outlet their UI is scoped to.
 */
class BranchController extends Controller
{
    /** Switch the active outlet the UI is scoped to (topbar switcher). */
    public function switch(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'branch_id' => 'required|exists:branches,id',
        ]);

        $branchId = (int) $data['branch_id'];

        if (! CurrentBranch::all()->contains('id', $branchId)) {
            return back()->with('error', 'You do not have access to that branch.');
        }

        CurrentBranch::set($branchId);

        return back()->with('success', 'Switched outlet.');
    }

    /** Update the branch geofence used by employee attendance punches. */
    public function updateAttendanceSettings(Request $request, int $id): RedirectResponse
    {
        $data = $request->validate([
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'attendance_radius_meters' => ['required', 'integer', 'min:10', 'max:5000'],
            'attendance_start_time' => ['nullable', 'date_format:H:i'],
        ]);

        Branch::findOrFail($id)->update($data);

        return back()->with('success', 'Attendance location updated.');
    }
}
