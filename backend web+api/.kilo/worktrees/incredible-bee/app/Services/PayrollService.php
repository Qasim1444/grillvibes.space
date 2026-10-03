<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\Deduction;
use App\Models\Leave;
use App\Models\Loan;
use App\Models\LoanRepayment;
use App\Models\Overtime;
use App\Models\PayrollRun;
use App\Models\Payslip;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * The one place payroll numbers are decided.
 *
 * Formula per employee, per month:
 *
 *     earned basic = basic_salary / payable_days * (payable_days - absent_days)
 *     gross        = earned basic + allowances + approved overtime
 *     net          = gross - deductions - loan installment
 *
 * `payable_days` is the calendar length of the month. Only **explicitly marked**
 * absence costs money: an `absent` attendance row, a `half_day` (counts 0.5), or
 * an approved leave on an unpaid leave type. An employee with no attendance rows
 * at all therefore draws full salary — otherwise a month where nobody remembered
 * to open the attendance sheet would silently pay everyone zero.
 *
 * `generate()` freezes every input into `payslips.snapshot`, so editing a salary
 * or backdating an attendance row later cannot rewrite an issued payslip.
 */
class PayrollService
{
    /**
     * Accepts `2026-08`, `2026-08-17`, or a date instance; returns the 1st of that month.
     *
     * Garbage input raises a validation error rather than a Carbon parse
     * exception, so a bad `month` reads as a 422 the page can display.
     *
     * @throws ValidationException
     */
    public function normalizeMonth(mixed $month): Carbon
    {
        if ($month instanceof \DateTimeInterface) {
            return Carbon::instance($month)->startOfMonth();
        }

        $value = trim((string) $month);

        if (preg_match('/^\d{4}-\d{2}$/', $value)) {
            $value .= '-01';
        }

        try {
            return Carbon::parse($value === '' ? 'now' : $value)->startOfMonth();
        } catch (\Throwable) {
            throw ValidationException::withMessages([
                'month' => 'Use a month in YYYY-MM form.',
            ]);
        }
    }

    /**
     * Compute the whole month without writing anything. Used by the Payroll page
     * to show what a run *would* produce before the user commits to it.
     *
     * @return array{month: string, payable_days: int, rows: list<array<string, mixed>>, totals: array<string, float|int>}
     */
    public function preview(mixed $month): array
    {
        $start = $this->normalizeMonth($month);
        $end = $start->copy()->endOfMonth();
        $payableDays = (int) $start->daysInMonth;

        $employees = User::query()
            ->payable()
            ->with('designation:id,name')
            // Somebody hired mid-month still earns; somebody who left before it
            // started does not appear at all.
            ->where(function ($q) use ($end) {
                $q->whereNull('joining_date')->orWhere('joining_date', '<=', $end);
            })
            ->where(function ($q) use ($start) {
                $q->whereNull('leaving_date')->orWhere('leaving_date', '>=', $start);
            })
            ->orderBy('name')
            ->get();

        if ($employees->isEmpty()) {
            return [
                'month' => $start->format('Y-m'),
                'payable_days' => $payableDays,
                'rows' => [],
                'totals' => ['employees' => 0, 'gross' => 0.0, 'deductions' => 0.0, 'net' => 0.0],
            ];
        }

        $ids = $employees->pluck('id')->all();

        $attendance = Attendance::query()
            ->whereIn('user_id', $ids)
            ->whereBetween('date', [$start, $end])
            ->get(['user_id', 'date', 'status'])
            ->groupBy('user_id');

        $leaves = Leave::query()
            ->whereIn('user_id', $ids)
            ->where('status', 'approved')
            ->where('from_date', '<=', $end)
            ->where('to_date', '>=', $start)
            ->with('leaveType:id,name,is_paid')
            ->get()
            ->groupBy('user_id');

        $overtimes = Overtime::query()
            ->whereIn('user_id', $ids)
            ->where('status', 'approved')
            ->whereBetween('date', [$start, $end])
            ->get(['id', 'user_id', 'date', 'hours', 'rate_per_hour', 'amount'])
            ->groupBy('user_id');

        $deductions = Deduction::query()
            ->whereIn('user_id', $ids)
            ->where(function ($q) use ($start, $end) {
                // Recurring rows apply every month; one-offs only in their own
                // month and only until a run has consumed them.
                $q->where('is_recurring', true)
                    ->orWhere(fn ($w) => $w->where('is_recurring', false)
                        ->whereNull('payroll_run_id')
                        ->where(fn ($m) => $m->whereNull('effective_month')
                            ->orWhereBetween('effective_month', [$start, $end])));
            })
            ->get(['id', 'user_id', 'title', 'amount', 'is_recurring'])
            ->groupBy('user_id');

        $loans = Loan::query()
            ->whereIn('user_id', $ids)
            ->where('status', 'active')
            ->where('outstanding', '>', 0)
            ->get(['id', 'user_id', 'type', 'installment_amount', 'outstanding'])
            ->groupBy('user_id');

        $rows = [];
        $totalGross = 0.0;
        $totalDeductions = 0.0;
        $totalNet = 0.0;

        foreach ($employees as $employee) {
            $row = $this->buildRow(
                $employee,
                $payableDays,
                $start,
                $end,
                $attendance->get($employee->id) ?? collect(),
                $leaves->get($employee->id) ?? collect(),
                $overtimes->get($employee->id) ?? collect(),
                $deductions->get($employee->id) ?? collect(),
                $loans->get($employee->id) ?? collect(),
            );

            $totalGross += $row['gross'];
            $totalDeductions += $row['deductions_amount'] + $row['loan_deduction'];
            $totalNet += $row['net'];

            $rows[] = $row;
        }

        return [
            'month' => $start->format('Y-m'),
            'payable_days' => $payableDays,
            'rows' => $rows,
            'totals' => [
                'employees' => count($rows),
                'gross' => round($totalGross, 2),
                'deductions' => round($totalDeductions, 2),
                'net' => round($totalNet, 2),
            ],
        ];
    }

    /**
     * Persist a month as a draft run with one payslip per employee.
     *
     * Re-running a draft month replaces its payslips (so the user can fix
     * attendance and regenerate); an approved or paid run is immutable.
     */
    public function generate(mixed $month, ?int $processedBy = null): PayrollRun
    {
        $start = $this->normalizeMonth($month);
        // whereDate, not a plain equality: the `date` cast writes
        // "2026-08-01 00:00:00", which MySQL truncates but SQLite keeps verbatim,
        // so an `= '2026-08-01'` comparison misses the row on SQLite and the
        // regenerate path would try to insert a duplicate month.
        $existing = PayrollRun::whereDate('month', $start->toDateString())->first();

        if ($existing && ! $existing->isEditable()) {
            throw ValidationException::withMessages([
                'month' => "Payroll for {$start->format('F Y')} is already {$existing->status} and can no longer be regenerated.",
            ]);
        }

        $preview = $this->preview($start);

        if ($preview['rows'] === []) {
            throw ValidationException::withMessages([
                'month' => 'No active employees to pay for this month. Add employees under HR → Employees first.',
            ]);
        }

        return DB::transaction(function () use ($start, $existing, $preview, $processedBy) {
            $run = $existing ?: new PayrollRun(['month' => $start->toDateString()]);

            $run->fill([
                'month' => $start->toDateString(),
                'status' => PayrollRun::DRAFT,
                'total_gross' => $preview['totals']['gross'],
                'total_deductions' => $preview['totals']['deductions'],
                'total_net' => $preview['totals']['net'],
                'processed_by' => $processedBy,
            ])->save();

            // Full replace rather than upsert — a removed employee must not keep
            // a stale payslip on the run.
            $run->payslips()->delete();

            foreach ($preview['rows'] as $row) {
                $run->payslips()->create([
                    'user_id' => $row['user_id'],
                    'basic' => $row['earned_basic'],
                    'allowances' => $row['allowances'],
                    'overtime_amount' => $row['overtime_amount'],
                    'deductions_amount' => $row['deductions_amount'],
                    'loan_deduction' => $row['loan_deduction'],
                    'gross' => $row['gross'],
                    'net' => $row['net'],
                    'present_days' => $row['present_days'],
                    'absent_days' => $row['absent_days'],
                    'leave_days' => $row['leave_days'],
                    'payable_days' => $row['payable_days'],
                    'snapshot' => $row['snapshot'],
                ]);
            }

            return $run->fresh();
        });
    }

    /**
     * Lock the run. One-off deductions are stamped with the run id here so they
     * are never charged twice, which is also why drafts leave them untouched.
     */
    public function approve(PayrollRun $run, ?int $approvedBy = null): PayrollRun
    {
        if ($run->status !== PayrollRun::DRAFT) {
            throw ValidationException::withMessages([
                'status' => "Only a draft run can be approved; this one is {$run->status}.",
            ]);
        }

        return DB::transaction(function () use ($run, $approvedBy) {
            $consumed = [];

            foreach ($run->payslips as $payslip) {
                foreach ($payslip->snapshot['deductions'] ?? [] as $deduction) {
                    if (empty($deduction['recurring']) && ! empty($deduction['id'])) {
                        $consumed[] = $deduction['id'];
                    }
                }
            }

            if ($consumed !== []) {
                Deduction::whereIn('id', $consumed)
                    ->whereNull('payroll_run_id')
                    ->update(['payroll_run_id' => $run->id]);
            }

            $run->update([
                'status' => PayrollRun::APPROVED,
                'approved_at' => now(),
                'processed_by' => $run->processed_by ?: $approvedBy,
            ]);

            return $run->fresh();
        });
    }

    /**
     * Money has left the building: record the loan repayments the payslips
     * charged for and reduce the outstanding balances.
     */
    public function markPaid(PayrollRun $run): PayrollRun
    {
        if ($run->status !== PayrollRun::APPROVED) {
            throw ValidationException::withMessages([
                'status' => "Only an approved run can be marked paid; this one is {$run->status}.",
            ]);
        }

        return DB::transaction(function () use ($run) {
            $paidOn = now()->toDateString();

            foreach ($run->payslips as $payslip) {
                foreach ($payslip->snapshot['loans'] ?? [] as $allocation) {
                    $loan = Loan::find($allocation['loan_id'] ?? null);

                    if (! $loan) {
                        continue;
                    }

                    // Cap at the live balance: two draft months can each charge an
                    // installment against the same balance, and we must not collect
                    // more than is actually owed.
                    $amount = round(min((float) ($allocation['amount'] ?? 0), (float) $loan->outstanding), 2);

                    if ($amount <= 0) {
                        continue;
                    }

                    LoanRepayment::create([
                        'loan_id' => $loan->id,
                        'payroll_run_id' => $run->id,
                        'amount' => $amount,
                        'paid_on' => $paidOn,
                    ]);

                    $loan->outstanding = round((float) $loan->outstanding - $amount, 2);

                    if ($loan->outstanding <= 0) {
                        $loan->outstanding = 0;
                        $loan->status = 'closed';
                    }

                    $loan->save();
                }
            }

            $run->update(['status' => PayrollRun::PAID, 'paid_at' => now()]);

            return $run->fresh();
        });
    }

    /**
     * One employee's numbers for the month.
     *
     * @param  Collection<int, Attendance>  $attendance
     * @param  Collection<int, Leave>  $leaves
     * @param  Collection<int, Overtime>  $overtimes
     * @param  Collection<int, Deduction>  $deductions
     * @param  Collection<int, Loan>  $loans
     * @return array<string, mixed>
     */
    private function buildRow(
        User $employee,
        int $payableDays,
        Carbon $start,
        Carbon $end,
        $attendance,
        $leaves,
        $overtimes,
        $deductions,
        $loans,
    ): array {
        $statusCounts = [];
        $absentDates = [];
        $halfDates = [];

        foreach ($attendance as $row) {
            $status = (string) $row->status;
            $statusCounts[$status] = ($statusCounts[$status] ?? 0) + 1;
            $date = Carbon::parse($row->date)->toDateString();

            if ($status === 'absent') {
                $absentDates[$date] = true;
            } elseif ($status === 'half_day') {
                $halfDates[$date] = true;
            }
        }

        // Approved leave, clipped to the month. Paid days cost nothing; unpaid
        // days are treated exactly like absence.
        $paidLeaveDays = 0.0;
        $unpaidLeaveDates = [];
        $leaveDetail = [];

        foreach ($leaves as $leave) {
            $from = Carbon::parse($leave->from_date)->startOfDay();
            $to = Carbon::parse($leave->to_date)->startOfDay();
            $from = $from->lt($start) ? $start->copy()->startOfDay() : $from;
            $to = $to->gt($end) ? $end->copy()->startOfDay() : $to;
            $days = (int) $from->diffInDays($to) + 1;
            $isPaid = (bool) ($leave->leaveType->is_paid ?? true);

            if ($isPaid) {
                $paidLeaveDays += $days;
            } else {
                foreach ($from->copy()->toPeriod($to->copy()) as $day) {
                    $unpaidLeaveDates[$day->toDateString()] = true;
                }
            }

            $leaveDetail[] = [
                'type' => $leave->leaveType->name ?? 'Leave',
                'from' => $from->toDateString(),
                'to' => $to->toDateString(),
                'days' => $days,
                'paid' => $isPaid,
            ];
        }

        // Union the date sets so a day marked absent *and* covered by unpaid
        // leave is only charged once.
        $lostDates = $absentDates + $unpaidLeaveDates;
        $halfLost = array_diff_key($halfDates, $lostDates);
        $absentDays = count($lostDates) + (0.5 * count($halfLost));
        $absentDays = min($absentDays, $payableDays);

        $presentDays = ($statusCounts['present'] ?? 0)
            + ($statusCounts['late'] ?? 0)
            + ($statusCounts['holiday'] ?? 0)
            + (0.5 * ($statusCounts['half_day'] ?? 0));

        $basic = (float) $employee->basic_salary;
        $dailyRate = $payableDays > 0 ? $basic / $payableDays : 0.0;
        $earnedBasic = round($dailyRate * ($payableDays - $absentDays), 2);

        $overtimeAmount = round((float) $overtimes->sum(fn ($o) => (float) $o->amount), 2);

        $deductionDetail = $deductions->map(fn ($d) => [
            'id' => $d->id,
            'title' => $d->title,
            'amount' => round((float) $d->amount, 2),
            'recurring' => (bool) $d->is_recurring,
        ])->values()->all();
        $deductionsAmount = round(array_sum(array_column($deductionDetail, 'amount')), 2);

        $loanDetail = [];
        $loanDeduction = 0.0;

        foreach ($loans as $loan) {
            $due = round($loan->installmentDue(), 2);

            if ($due <= 0) {
                continue;
            }

            $loanDeduction += $due;
            $loanDetail[] = ['loan_id' => $loan->id, 'type' => $loan->type, 'amount' => $due];
        }

        $loanDeduction = round($loanDeduction, 2);
        $allowances = 0.0;
        $gross = round($earnedBasic + $allowances + $overtimeAmount, 2);
        $net = round($gross - $deductionsAmount - $loanDeduction, 2);

        return [
            'user_id' => $employee->id,
            'employee_code' => $employee->employee_code,
            'name' => $employee->name,
            'designation' => $employee->designation->name ?? null,
            'basic' => round($basic, 2),
            'payable_days' => $payableDays,
            'present_days' => round($presentDays, 1),
            'absent_days' => round($absentDays, 1),
            'leave_days' => round($paidLeaveDays + count($unpaidLeaveDates), 1),
            'earned_basic' => $earnedBasic,
            'allowances' => $allowances,
            'overtime_amount' => $overtimeAmount,
            'deductions_amount' => $deductionsAmount,
            'loan_deduction' => $loanDeduction,
            'gross' => $gross,
            'net' => max($net, 0.0),
            // Everything the numbers above were derived from.
            'snapshot' => [
                'month' => $start->format('Y-m'),
                'name' => $employee->name,
                'employee_code' => $employee->employee_code,
                'designation' => $employee->designation->name ?? null,
                'basic_salary' => round($basic, 2),
                'daily_rate' => round($dailyRate, 2),
                'payable_days' => $payableDays,
                'attendance' => $statusCounts,
                'leaves' => $leaveDetail,
                'paid_leave_days' => round($paidLeaveDays, 1),
                'unpaid_leave_days' => count($unpaidLeaveDates),
                'overtime' => $overtimes->map(fn ($o) => [
                    'date' => Carbon::parse($o->date)->toDateString(),
                    'hours' => (float) $o->hours,
                    'rate_per_hour' => (float) $o->rate_per_hour,
                    'amount' => (float) $o->amount,
                ])->values()->all(),
                'deductions' => $deductionDetail,
                'loans' => $loanDetail,
                'generated_at' => now()->toDateTimeString(),
            ],
        ];
    }
}
