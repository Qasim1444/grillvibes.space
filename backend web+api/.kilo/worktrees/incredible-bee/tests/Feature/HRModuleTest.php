<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\Branch;
use App\Models\Deduction;
use App\Models\Designation;
use App\Models\Leave;
use App\Models\LeaveType;
use App\Models\Loan;
use App\Models\Overtime;
use App\Models\Place;
use App\Models\PayrollRun;
use App\Models\Role;
use App\Models\User;
use App\Services\PayrollService;
use Database\Seeders\PermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

/**
 * Smoke coverage for the HR module: every page renders for a super admin, the
 * permission guards actually block the URL (not just the sidebar link), and the
 * payroll lifecycle produces the numbers PayrollService documents.
 */
class HRModuleTest extends TestCase
{
    use RefreshDatabase;

    private function superAdmin(): User
    {
        $this->seed(PermissionSeeder::class);

        $user = User::factory()->create();
        $user->roles()->sync([Role::where('slug', 'super-admin')->value('id')]);

        return $user->fresh();
    }

    /** An employee with no login, which is the whole point of nullable credentials. */
    private function employee(array $attributes = []): User
    {
        return User::create(array_merge([
            'name' => 'Kitchen Hand',
            'employee_code' => 'EMP-001',
            'is_employee' => true,
            'employment_status' => 'active',
            'basic_salary' => 31000,
            'joining_date' => '2020-01-01',
        ], $attributes));
    }

    public function test_every_hr_page_renders_for_a_super_admin(): void
    {
        $admin = $this->superAdmin();

        foreach ([
            '/hr/employees',
            '/hr/designations',
            '/hr/attendance',
            '/hr/leaves',
            '/hr/overtime',
            '/hr/loans',
            '/hr/payroll',
        ] as $url) {
            $this->actingAs($admin)->get($url)->assertOk();
        }
    }

    public function test_hr_pages_are_blocked_without_the_permission(): void
    {
        $this->seed(PermissionSeeder::class);
        $cashier = User::factory()->create();
        $cashier->roles()->sync([Role::where('slug', 'cashier')->value('id')]);

        // The URL itself must 403 — hiding the sidebar link is cosmetic.
        $this->actingAs($cashier->fresh())->get('/hr/payroll')->assertForbidden();
        $this->actingAs($cashier->fresh())->get('/hr/employees')->assertForbidden();
    }

    public function test_an_employee_can_be_created_without_login_credentials(): void
    {
        $admin = $this->superAdmin();
        $designation = Designation::create(['name' => 'Chef']);

        $this->actingAs($admin)->post('/hr/employees', [
            'name' => 'Silent Sam',
            'employee_code' => 'EMP-777',
            'designation_id' => $designation->id,
            'employment_status' => 'active',
            'basic_salary' => 25000,
            'joining_date' => '2024-05-01',
        ])->assertRedirect();

        $this->assertDatabaseHas('users', [
            'employee_code' => 'EMP-777',
            'email' => null,
            'is_employee' => true,
        ]);
    }

    public function test_a_whole_days_attendance_saves_in_one_post(): void
    {
        $admin = $this->superAdmin();
        $a = $this->employee(['employee_code' => 'EMP-A', 'name' => 'A']);
        $b = $this->employee(['employee_code' => 'EMP-B', 'name' => 'B']);

        $this->actingAs($admin)->post('/hr/attendance/bulk', [
            'date' => '2026-08-03',
            'rows' => [
                ['user_id' => $a->id, 'status' => 'present', 'check_in' => '09:00', 'check_out' => '17:30'],
                ['user_id' => $b->id, 'status' => 'absent'],
            ],
        ])->assertRedirect();

        $this->assertSame(510, Attendance::where('user_id', $a->id)->value('worked_minutes'));
        $this->assertSame('absent', Attendance::where('user_id', $b->id)->value('status'));

        // Re-saving the same day updates rather than duplicating.
        $this->actingAs($admin)->post('/hr/attendance/bulk', [
            'date' => '2026-08-03',
            'rows' => [['user_id' => $b->id, 'status' => 'present']],
        ])->assertRedirect();

        $this->assertSame(1, Attendance::where('user_id', $b->id)->count());
        $this->assertSame('present', Attendance::where('user_id', $b->id)->value('status'));
    }

    public function test_employee_punches_in_and_out_only_inside_their_branch_geofence(): void
    {
        $branch = Branch::create([
            'name' => 'Main Branch',
            'latitude' => 24.8607,
            'longitude' => 67.0011,
            'attendance_radius_meters' => 100,
            'attendance_start_time' => '09:00',
        ]);
        $place = Place::create(['branch_id' => $branch->id, 'name' => 'Main Floor', 'status' => true]);
        $employee = $this->employee(['place_id' => $place->id]);

        Carbon::setTestNow('2026-09-04 10:15:00');
        $this->actingAs($employee)->post('/hr/attendance/punch', [
            'latitude' => 24.8607,
            'longitude' => 67.0011,
            'accuracy' => 150,
        ])->assertRedirect();

        $attendance = Attendance::where('user_id', $employee->id)->firstOrFail();
        $this->assertSame('late', $attendance->status);
        $this->assertSame(75, $attendance->late_minutes);
        $this->assertSame(0, $attendance->check_in_distance_meters);

        Carbon::setTestNow('2026-09-04 18:00:00');
        $this->actingAs($employee)->post('/hr/attendance/punch', [
            'latitude' => 24.8607,
            'longitude' => 67.0011,
            'accuracy' => 15,
        ])->assertRedirect();

        $this->assertSame('18:00:00', Attendance::find($attendance->id)->check_out);
        $this->assertSame(465, Attendance::find($attendance->id)->worked_minutes);

        $this->actingAs($employee)->post('/hr/attendance/punch', [
            'latitude' => 24.8700,
            'longitude' => 67.0011,
            'accuracy' => 12,
        ])->assertSessionHasErrors('location');

        $this->assertSame(1, Attendance::where('user_id', $employee->id)->count());
        Carbon::setTestNow();
    }

    public function test_an_authorized_user_can_update_branch_attendance_location(): void
    {
        $admin = $this->superAdmin();
        $branch = Branch::create(['name' => 'Configurable Branch']);

        $this->actingAs($admin)->put("/branches/{$branch->id}/attendance-settings", [
            'latitude' => 30,
            'longitude' => 72,
            'attendance_radius_meters' => 250,
            'attendance_start_time' => '09:30',
        ])->assertRedirect();

        $saved = Branch::findOrFail($branch->id);
        $this->assertSame(30.0, (float) $saved->latitude);
        $this->assertSame(72.0, (float) $saved->longitude);
        $this->assertSame(250, $saved->attendance_radius_meters);
        $this->assertSame('09:30', substr((string) $saved->attendance_start_time, 0, 5));
    }

    public function test_approved_overtime_is_locked_against_edits(): void
    {
        $admin = $this->superAdmin();
        $employee = $this->employee();

        $this->actingAs($admin)->post('/hr/overtime', [
            'user_id' => $employee->id,
            'date' => '2026-08-05',
            'hours' => 4,
            'rate_per_hour' => 250,
        ])->assertRedirect();

        $overtime = Overtime::first();
        // Amount is stored, not derived, so a later rate change can't rewrite it.
        $this->assertSame(1000.0, (float) $overtime->amount);
        $this->assertSame('pending', $overtime->status);

        $this->actingAs($admin)->put("/hr/overtime/{$overtime->id}/decide", ['status' => 'approved']);

        $this->actingAs($admin)
            ->put("/hr/overtime/{$overtime->id}", [
                'user_id' => $employee->id,
                'date' => '2026-08-05',
                'hours' => 8,
                'rate_per_hour' => 250,
            ])
            ->assertSessionHas('error');

        $this->assertSame(4.0, (float) $overtime->fresh()->hours);
    }

    public function test_payroll_runs_through_draft_approve_and_paid(): void
    {
        $admin = $this->superAdmin();
        $employee = $this->employee(['basic_salary' => 31000]);

        // 31 days in August; five absent days cost 5 000.
        foreach (['2026-08-01', '2026-08-02', '2026-08-03', '2026-08-04', '2026-08-05'] as $date) {
            Attendance::create(['user_id' => $employee->id, 'date' => $date, 'status' => 'absent']);
        }

        Overtime::create([
            'user_id' => $employee->id,
            'date' => '2026-08-10',
            'hours' => 4,
            'rate_per_hour' => 250,
            'amount' => 1000,
            'status' => 'approved',
        ]);

        // A pending row must not be paid.
        Overtime::create([
            'user_id' => $employee->id,
            'date' => '2026-08-11',
            'hours' => 4,
            'rate_per_hour' => 250,
            'amount' => 1000,
            'status' => 'pending',
        ]);

        Deduction::create([
            'user_id' => $employee->id,
            'title' => 'Uniform',
            'amount' => 750,
            'is_recurring' => false,
        ]);

        $loan = Loan::create([
            'user_id' => $employee->id,
            'type' => 'loan',
            'amount' => 8000,
            'installment_amount' => 2000,
            'outstanding' => 8000,
            'disbursed_on' => '2026-07-01',
            'status' => 'active',
        ]);

        $this->actingAs($admin)->post('/hr/payroll', ['month' => '2026-08'])->assertRedirect();

        $run = PayrollRun::first();
        $payslip = $run->payslips()->first();

        $this->assertSame('draft', $run->status);
        $this->assertSame(26000.0, (float) $payslip->basic);          // earned basic
        $this->assertSame(1000.0, (float) $payslip->overtime_amount); // pending row ignored
        $this->assertSame(27000.0, (float) $payslip->gross);
        $this->assertSame(24250.0, (float) $payslip->net);            // − 750 − 2 000

        // Regenerating a draft replaces its payslips rather than duplicating them.
        $this->actingAs($admin)->post('/hr/payroll', ['month' => '2026-08'])->assertRedirect();
        $this->assertSame(1, $run->fresh()->payslips()->count());

        // Approving consumes the one-off deduction so it can never be charged twice.
        $this->actingAs($admin)->put("/hr/payroll/{$run->id}/approve")->assertRedirect();
        $this->assertSame('approved', $run->fresh()->status);
        $this->assertSame($run->id, Deduction::first()->payroll_run_id);

        // An approved run is immutable.
        $this->actingAs($admin)->delete("/hr/payroll/{$run->id}")->assertSessionHas('error');
        $this->assertSame(1, PayrollRun::count());

        // Marking paid collects the installment.
        $this->actingAs($admin)->put("/hr/payroll/{$run->id}/paid")->assertRedirect();
        $this->assertSame('paid', $run->fresh()->status);
        $this->assertSame(6000.0, (float) $loan->fresh()->outstanding);
        $this->assertDatabaseHas('loan_repayments', ['loan_id' => $loan->id, 'amount' => 2000]);
    }

    public function test_unpaid_leave_and_absence_on_the_same_day_is_only_charged_once(): void
    {
        $admin = $this->superAdmin();
        $employee = $this->employee(['basic_salary' => 30000]);
        $unpaid = LeaveType::create(['name' => 'Unpaid Leave', 'days_per_year' => 0, 'is_paid' => false]);

        Attendance::create(['user_id' => $employee->id, 'date' => '2026-09-02', 'status' => 'absent']);
        Leave::create([
            'user_id' => $employee->id,
            'leave_type_id' => $unpaid->id,
            'from_date' => '2026-09-02',
            'to_date' => '2026-09-02',
            'days' => 1,
            'status' => 'approved',
        ]);

        // 30 days in September: exactly one day lost, not two.
        $preview = app(PayrollService::class)->preview('2026-09');

        $this->assertSame(1.0, (float) $preview['rows'][0]['absent_days']);
        $this->assertSame(29000.0, (float) $preview['rows'][0]['earned_basic']);
    }

    public function test_a_month_with_no_attendance_at_all_pays_full_salary(): void
    {
        $this->employee(['basic_salary' => 40000]);

        $preview = app(PayrollService::class)->preview('2026-10');

        $this->assertSame(0.0, (float) $preview['rows'][0]['absent_days']);
        $this->assertSame(40000.0, (float) $preview['rows'][0]['earned_basic']);
    }

    public function test_a_loan_cannot_be_reduced_below_what_was_already_recovered(): void
    {
        $admin = $this->superAdmin();
        $employee = $this->employee();

        $loan = Loan::create([
            'user_id' => $employee->id,
            'type' => 'advance',
            'amount' => 10000,
            'installment_amount' => 2500,
            'outstanding' => 10000,
            'disbursed_on' => '2026-08-01',
            'status' => 'active',
        ]);

        $this->actingAs($admin)
            ->post("/hr/loans/{$loan->id}/repay", ['amount' => 4000, 'paid_on' => '2026-08-20'])
            ->assertRedirect();

        $this->assertSame(6000.0, (float) $loan->fresh()->outstanding);

        $this->actingAs($admin)
            ->put("/hr/loans/{$loan->id}", [
                'user_id' => $employee->id,
                'type' => 'advance',
                'amount' => 3000,
                'installment_amount' => 1000,
                'disbursed_on' => '2026-08-01',
            ])
            ->assertSessionHas('error');

        $this->assertSame(10000.0, (float) $loan->fresh()->amount);
    }
}
