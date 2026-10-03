<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\Expense;
use App\Models\ExpenseVoucher;
use App\Models\PettyCashAccount;
use App\Models\PettyCashTransaction;
use App\Models\User;
use App\Models\Vendor;
use App\Support\PettyCashPoster;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Seeds realistic demo data for the Expense & Petty-Cash feature:
 *   - 2 petty-cash floats (front-desk + kitchen)
 *   - ~15 ledger transactions across both floats
 *   - ~12 expenses (various categories, paid via cash / bank / petty_cash)
 *   - 3 voucher claims (pending / approved / rejected) wrapping some of them
 *
 * Safe to re-run — guards against duplicate data.
 */
class FinanceDemoSeeder extends Seeder
{
    public function run(): void
    {
        if (PettyCashAccount::count() > 0) {
            $this->command?->info('Finance demo data already exists — skipping.');
            return;
        }

        $branch  = Branch::orderBy('id')->first();
        $admin   = User::orderBy('id')->first();
        $vendor  = Vendor::orderBy('id')->first();
        $vendor2 = Vendor::orderBy('id')->skip(1)->first() ?? $vendor;

        if (! $branch) {
            $this->command?->warn('No branch found — skipping FinanceDemoSeeder.');
            return;
        }

        // ── Petty-cash floats ──────────────────────────────────────────────────
        $frontDesk = PettyCashAccount::create([
            'name'            => 'Front-Desk Float',
            'branch_id'       => $branch->id,
            'custodian_name'  => 'Sarah Ahmed',
            'opening_balance' => 5000.00,
            'current_balance' => 5000.00,
            'is_active'       => true,
            'notes'           => 'Daily operational cash kept at the reception.',
        ]);

        $kitchen = PettyCashAccount::create([
            'name'            => 'Kitchen Petty Cash',
            'branch_id'       => $branch->id,
            'custodian_name'  => 'Chef Tariq',
            'opening_balance' => 3000.00,
            'current_balance' => 3000.00,
            'is_active'       => true,
            'notes'           => 'Used for emergency ingredient purchases.',
        ]);

        // ── Ledger transactions ────────────────────────────────────────────────
        $now = now();

        $frontDeskTxns = [
            ['type' => 'top_up',       'amount' =>  2000.00, 'description' => 'Monthly top-up from management',   'occurred_on' => $now->copy()->subDays(28)->toDateString()],
            ['type' => 'disbursement', 'amount' =>   350.00, 'description' => 'Office supplies — printer paper',   'occurred_on' => $now->copy()->subDays(25)->toDateString()],
            ['type' => 'disbursement', 'amount' =>   120.00, 'description' => 'Courier charges',                   'occurred_on' => $now->copy()->subDays(22)->toDateString()],
            ['type' => 'top_up',       'amount' =>  1000.00, 'description' => 'Emergency top-up',                  'occurred_on' => $now->copy()->subDays(18)->toDateString()],
            ['type' => 'disbursement', 'amount' =>   450.00, 'description' => 'Cleaning supplies',                 'occurred_on' => $now->copy()->subDays(14)->toDateString()],
            ['type' => 'disbursement', 'amount' =>    80.00, 'description' => 'Tea & coffee for staff',            'occurred_on' => $now->copy()->subDays(10)->toDateString()],
            ['type' => 'adjustment',   'amount' =>   -50.00, 'description' => 'Shortage correction after count',   'occurred_on' => $now->copy()->subDays(7)->toDateString()],
            ['type' => 'disbursement', 'amount' =>   200.00, 'description' => 'Maintenance — door lock repair',    'occurred_on' => $now->copy()->subDays(3)->toDateString()],
        ];

        $kitchenTxns = [
            ['type' => 'top_up',       'amount' =>  1500.00, 'description' => 'Monthly kitchen top-up',            'occurred_on' => $now->copy()->subDays(27)->toDateString()],
            ['type' => 'disbursement', 'amount' =>   600.00, 'description' => 'Fresh produce — emergency buy',     'occurred_on' => $now->copy()->subDays(20)->toDateString()],
            ['type' => 'disbursement', 'amount' =>   220.00, 'description' => 'Gas cylinder replacement',          'occurred_on' => $now->copy()->subDays(15)->toDateString()],
            ['type' => 'top_up',       'amount' =>   500.00, 'description' => 'Top-up for weekend rush',           'occurred_on' => $now->copy()->subDays(8)->toDateString()],
            ['type' => 'disbursement', 'amount' =>   180.00, 'description' => 'Disposable containers & wrap',      'occurred_on' => $now->copy()->subDays(4)->toDateString()],
            ['type' => 'disbursement', 'amount' =>   350.00, 'description' => 'Spices & dry goods restock',        'occurred_on' => $now->copy()->subDays(1)->toDateString()],
        ];

        foreach ($frontDeskTxns as $t) {
            $this->postTransaction($frontDesk, $t, $admin->id);
        }
        foreach ($kitchenTxns as $t) {
            $this->postTransaction($kitchen, $t, $admin->id);
        }

        // Recompute both floats so current_balance and balance_after are exact.
        $frontDesk->recomputeBalance();
        $kitchen->recomputeBalance();

        // ── Expenses ───────────────────────────────────────────────────────────
        $expenses = [
            // Approved expenses (older)
            [
                'category'    => 'utilities',
                'description' => 'Electricity bill — July',
                'expense_date'=> $now->copy()->subDays(30)->toDateString(),
                'amount'      => 18500.00,
                'paid_via'    => 'bank',
                'vendor_id'   => $vendor?->id,
                'status'      => 'approved',
            ],
            [
                'category'    => 'rent',
                'description' => 'Monthly premises rent — July',
                'expense_date'=> $now->copy()->subDays(30)->toDateString(),
                'amount'      => 75000.00,
                'paid_via'    => 'bank',
                'status'      => 'approved',
            ],
            [
                'category'    => 'supplies',
                'description' => 'Printer cartridges & stationery',
                'expense_date'=> $now->copy()->subDays(24)->toDateString(),
                'amount'      => 3200.00,
                'paid_via'    => 'petty_cash',
                'petty_cash_account_id' => $frontDesk->id,
                'status'      => 'approved',
            ],
            [
                'category'    => 'transport',
                'description' => 'Fuel reimbursement — delivery runs',
                'expense_date'=> $now->copy()->subDays(21)->toDateString(),
                'amount'      => 2400.00,
                'paid_via'    => 'cash',
                'status'      => 'approved',
            ],
            [
                'category'    => 'repairs_maintenance',
                'description' => 'Air conditioning service — dining area',
                'expense_date'=> $now->copy()->subDays(17)->toDateString(),
                'amount'      => 8500.00,
                'paid_via'    => 'bank',
                'vendor_id'   => $vendor2?->id,
                'status'      => 'approved',
            ],
            [
                'category'    => 'marketing',
                'description' => 'Social media ads — Eid campaign',
                'expense_date'=> $now->copy()->subDays(14)->toDateString(),
                'amount'      => 12000.00,
                'paid_via'    => 'card',
                'status'      => 'approved',
            ],
            [
                'category'    => 'supplies',
                'description' => 'Kitchen cleaning chemicals',
                'expense_date'=> $now->copy()->subDays(11)->toDateString(),
                'amount'      => 1800.00,
                'paid_via'    => 'petty_cash',
                'petty_cash_account_id' => $kitchen->id,
                'status'      => 'approved',
            ],
            [
                'category'    => 'licenses_fees',
                'description' => 'Annual health & safety permit renewal',
                'expense_date'=> $now->copy()->subDays(9)->toDateString(),
                'amount'      => 5000.00,
                'paid_via'    => 'bank',
                'status'      => 'approved',
            ],
            // Pending expenses (recent, awaiting approval)
            [
                'category'    => 'utilities',
                'description' => 'Gas bill — August',
                'expense_date'=> $now->copy()->subDays(5)->toDateString(),
                'amount'      => 9200.00,
                'paid_via'    => 'bank',
                'status'      => 'pending',
            ],
            [
                'category'    => 'repairs_maintenance',
                'description' => 'Refrigerator compressor repair',
                'expense_date'=> $now->copy()->subDays(4)->toDateString(),
                'amount'      => 6500.00,
                'paid_via'    => 'petty_cash',
                'petty_cash_account_id' => $kitchen->id,
                'status'      => 'pending',
            ],
            [
                'category'    => 'supplies',
                'description' => 'Packaging materials restock',
                'expense_date'=> $now->copy()->subDays(2)->toDateString(),
                'amount'      => 4100.00,
                'paid_via'    => 'cash',
                'vendor_id'   => $vendor?->id,
                'status'      => 'pending',
            ],
            [
                'category'    => 'misc',
                'description' => 'Staff birthday celebration',
                'expense_date'=> $now->copy()->subDays(1)->toDateString(),
                'amount'      => 1500.00,
                'paid_via'    => 'petty_cash',
                'petty_cash_account_id' => $frontDesk->id,
                'status'      => 'pending',
            ],
        ];

        foreach ($expenses as $data) {
            DB::transaction(function () use ($data, $branch, $admin, $frontDesk, $kitchen) {
                $expense = Expense::create([
                    'expense_number'        => Expense::generateExpenseNumber(),
                    'branch_id'             => $branch->id,
                    'category'              => $data['category'],
                    'vendor_id'             => $data['vendor_id'] ?? null,
                    'payee'                 => $data['payee'] ?? null,
                    'expense_date'          => $data['expense_date'],
                    'amount'                => $data['amount'],
                    'paid_via'              => $data['paid_via'],
                    'petty_cash_account_id' => $data['petty_cash_account_id'] ?? null,
                    'status'                => $data['status'],
                    'description'           => $data['description'],
                    'created_by'            => $admin->id,
                    'approved_by'           => $data['status'] === 'approved' ? $admin->id : null,
                    'approved_at'           => $data['status'] === 'approved' ? now() : null,
                ]);

                // Mirror petty-cash expenses as disbursement lines.
                if ($expense->isPettyCash()) {
                    PettyCashTransaction::create([
                        'petty_cash_account_id' => $expense->petty_cash_account_id,
                        'branch_id'             => $branch->id,
                        'type'                  => 'disbursement',
                        'amount'                => -abs((float) $expense->amount),
                        'expense_id'            => $expense->id,
                        'reference'             => $expense->expense_number,
                        'description'           => 'Expense: ' . $expense->description,
                        'occurred_on'           => $expense->expense_date->toDateString(),
                        'created_by'            => $admin->id,
                    ]);
                }
            });
        }

        // Final balance recompute after all disbursements have been posted.
        $frontDesk->recomputeBalance();
        $kitchen->recomputeBalance();

        $this->seedVouchers($frontDesk, $kitchen, $branch, $admin);

        $this->command?->info('Finance demo data seeded (2 funds, '.PettyCashTransaction::count().' transactions, '.Expense::count().' expenses, '.ExpenseVoucher::count().' vouchers).');
    }

    /**
     * Three demo claims — pending, approved and rejected — wrapping some of the
     * cash-paid expenses above. Each pending/approved voucher cuts its fund once
     * for the batch total; the rejected one releases its expenses and leaves the
     * fund whole, so the demo data is internally consistent.
     */
    private function seedVouchers(
        PettyCashAccount $frontDesk,
        PettyCashAccount $kitchen,
        Branch $branch,
        User $admin
    ): void {
        // Draw claim lines from the cash-paid expenses — the reimbursement case.
        $pool = Expense::where('paid_via', 'cash')->orderBy('id')->get();

        if ($pool->isEmpty()) {
            return;
        }

        $now = now();

        $claims = [
            [
                'purpose' => 'Delivery fuel & sundries reimbursement',
                'account' => $frontDesk,
                'claimant_name' => 'Bilal Hussain',
                'voucher_date' => $now->copy()->subDays(20)->toDateString(),
                'status' => 'approved',
                'expenses' => $pool->slice(0, 1),
            ],
            [
                'purpose' => 'Packaging restock — advanced by staff',
                'account' => $kitchen,
                'claimant_name' => 'Chef Tariq',
                'voucher_date' => $now->copy()->subDays(2)->toDateString(),
                'status' => 'pending',
                'expenses' => $pool->slice(1, 1),
            ],
            [
                'purpose' => 'Duplicate claim — filed twice in error',
                'account' => $frontDesk,
                'claimant_name' => 'Sarah Ahmed',
                'voucher_date' => $now->copy()->subDays(1)->toDateString(),
                'status' => 'rejected',
                'rejection_reason' => 'Already reimbursed on an earlier voucher.',
                'expenses' => collect(),
            ],
        ];

        foreach ($claims as $claim) {
            DB::transaction(function () use ($claim, $branch, $admin) {
                $rejected = $claim['status'] === 'rejected';

                $voucher = ExpenseVoucher::create([
                    'voucher_number' => ExpenseVoucher::generateVoucherNumber(),
                    'branch_id' => $branch->id,
                    'petty_cash_account_id' => $claim['account']->id,
                    'claimant_name' => $claim['claimant_name'],
                    'voucher_date' => $claim['voucher_date'],
                    'status' => $claim['status'],
                    'purpose' => $claim['purpose'],
                    'rejection_reason' => $claim['rejection_reason'] ?? null,
                    'created_by' => $admin->id,
                    'approved_by' => $claim['status'] === 'pending' ? null : $admin->id,
                    'approved_at' => $claim['status'] === 'pending' ? null : now(),
                ]);

                if ($claim['expenses']->isNotEmpty()) {
                    Expense::whereIn('id', $claim['expenses']->pluck('id'))
                        ->update(['expense_voucher_id' => $voucher->id]);
                    $voucher->recomputeAmount();
                }

                // A rejected claim keeps its total for the record but releases the
                // receipts; give it a nominal amount so the demo row isn't blank.
                if ($rejected) {
                    $voucher->update(['amount' => 1250.00]);
                }

                PettyCashPoster::syncVoucher($voucher->fresh(), $admin->id);
            });
        }
    }

    /** Helper: sign the amount by type and persist the transaction. */
    private function postTransaction(PettyCashAccount $account, array $t, int $userId): void
    {
        $magnitude = abs((float) $t['amount']);
        $signed = match ($t['type']) {
            'top_up'       => $magnitude,
            'disbursement' => -$magnitude,
            default        => (float) $t['amount'],   // adjustment — keep sign as-is
        };

        PettyCashTransaction::create([
            'petty_cash_account_id' => $account->id,
            'branch_id'             => $account->branch_id,
            'type'                  => $t['type'],
            'amount'                => $signed,
            'balance_after'         => 0,   // recomputeBalance() fixes this afterwards
            'reference'             => $t['reference'] ?? null,
            'description'           => $t['description'] ?? null,
            'occurred_on'           => $t['occurred_on'],
            'created_by'            => $userId,
        ]);
    }
}
