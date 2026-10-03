<?php

namespace App\Http\Controllers\Web\HR;

use App\Http\Controllers\Controller;
use App\Models\Designation;
use App\Models\Place;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Employees live in `users` (the "extend users" decision), flagged by
 * `is_employee`. Credentials are optional here: kitchen and floor staff need to
 * exist for attendance and payroll but never log in, and the login flow requires
 * both an email and a password, so a credential-less row cannot sign in.
 */
class EmployeeController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $status = trim((string) $request->query('status', ''));

        $employees = User::query()
            ->employees()
            ->with(['designation:id,name', 'place:id,name'])
            ->when($search !== '', fn ($q) => $q->where(function ($w) use ($search) {
                $w->where('name', 'like', "%{$search}%")
                    ->orWhere('employee_code', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('cnic', 'like', "%{$search}%");
            }))
            ->when($status !== '', fn ($q) => $q->where('employment_status', $status))
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (User $u) => [
                'id' => $u->id,
                'employee_code' => $u->employee_code,
                'name' => $u->name,
                'email' => $u->email,
                'phone' => $u->phone,
                'address' => $u->address,
                'cnic' => $u->cnic,
                'gender' => $u->gender,
                'date_of_birth' => $u->date_of_birth?->toDateString(),
                'designation_id' => $u->designation_id,
                'designation_name' => $u->designation?->name,
                'place_id' => $u->place_id,
                'place_name' => $u->place?->name,
                'joining_date' => $u->joining_date?->toDateString(),
                'leaving_date' => $u->leaving_date?->toDateString(),
                'employment_status' => $u->employment_status,
                'basic_salary' => (float) $u->basic_salary,
                'has_login' => filled($u->email),
            ]);

        return Inertia::render('HR/Employees', [
            'employees' => $employees,
            'filters' => ['search' => $search, 'status' => $status],
            'designations' => Designation::orderBy('name')->get(['id', 'name']),
            'places' => Place::orderBy('name')->get(['id', 'name']),
            'statuses' => User::EMPLOYMENT_STATUSES,
            'stats' => [
                'total' => User::employees()->count(),
                'active' => User::employees()->where('employment_status', 'active')->count(),
                'payroll' => (float) User::query()->payable()->sum('basic_salary'),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);
        $data['is_employee'] = true;
        $data['password'] = filled($data['password'] ?? null) ? Hash::make($data['password']) : null;

        if (blank($data['password'])) {
            unset($data['password']);
        }

        User::create($data);

        return redirect()->back()->with('success', 'Employee created.');
    }

    public function update(Request $request, $id): RedirectResponse
    {
        $employee = User::findOrFail($id);
        $data = $this->validated($request, (int) $id);
        $data['is_employee'] = true;

        // Blank password field means "leave it alone", not "clear it".
        if (blank($data['password'] ?? null)) {
            unset($data['password']);
        } else {
            $data['password'] = Hash::make($data['password']);
        }

        $employee->update($data);

        return redirect()->back()->with('success', 'Employee updated.');
    }

    /**
     * Employees carry attendance, payslips and loans, so a hard delete would
     * cascade history away. Only rows with no payroll footprint are deletable;
     * everything else must be marked "left" instead.
     */
    public function destroy(Request $request, $id): RedirectResponse
    {
        $employee = User::findOrFail($id);

        if ((int) $id === (int) $request->user()->id) {
            return redirect()->back()->with('error', 'You cannot delete your own account.');
        }

        if ($employee->payslips()->exists()) {
            return redirect()->back()->with('error', 'This employee has payslips — set their status to "left" instead of deleting.');
        }

        // Keep the login if this row is also an admin user; just drop the HR flag.
        if (filled($employee->email) && filled($employee->password)) {
            $employee->update(['is_employee' => false, 'employment_status' => 'left', 'leaving_date' => now()->toDateString()]);

            return redirect()->back()->with('success', 'Employee removed from HR (login kept).');
        }

        $employee->delete();

        return redirect()->back()->with('success', 'Employee deleted.');
    }

    private function validated(Request $request, ?int $ignoreId = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'employee_code' => ['nullable', 'string', 'max:50', Rule::unique('users', 'employee_code')->ignore($ignoreId)],
            'email' => ['nullable', 'email', 'max:255', Rule::unique('users', 'email')->ignore($ignoreId)],
            // Optional on both create and edit — blank on edit keeps the old hash.
            'password' => ['nullable', 'string', 'min:6'],
            'phone' => ['nullable', 'string', 'max:30'],
            'address' => ['nullable', 'string', 'max:500'],
            'cnic' => ['nullable', 'string', 'max:30'],
            'gender' => ['nullable', 'in:male,female,other'],
            'date_of_birth' => ['nullable', 'date'],
            'designation_id' => ['nullable', 'integer', 'exists:designations,id'],
            'place_id' => ['nullable', 'integer', 'exists:places,id'],
            'joining_date' => ['nullable', 'date'],
            'leaving_date' => ['nullable', 'date', 'after_or_equal:joining_date'],
            'employment_status' => ['required', Rule::in(User::EMPLOYMENT_STATUSES)],
            'basic_salary' => ['required', 'numeric', 'min:0'],
        ]);
    }
}
