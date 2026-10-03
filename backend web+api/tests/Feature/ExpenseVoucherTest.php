<?php

namespace Tests\Feature;

use App\Models\Expense;
use App\Models\ExpenseVoucher;
use App\Models\PettyCashAccount;
use App\Models\PettyCashTransaction;
use App\Models\Role;
use App\Models\User;
use App\Support\CurrentBranch;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\Phase5PermissionsSeeder;
use Database\Seeders\Phase6PermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Covers the voucher-claim invariant: exactly one petty-cash line exists per unit
 * of spend. An expense posts its own line only while it is unclaimed; a voucher
 * posts exactly one line for its total.
 */
class ExpenseVoucherTest extends TestCase
{
    use RefreshDatabase;

    private function superAdmin(): User
    {
        $user = User::factory()->create();
        $role = Role::firstOrCreate(
            ['slug' => Role::SUPER_ADMIN],
            ['name' => 'Super Admin', 'description' => 'Full access', 'is_locked' => true]
        );
        $user->assignRole($role);

        return $user;
    }

    private function fund(array $overrides = []): PettyCashAccount
    {
        $opening = $overrides['opening_balance'] ?? 2000;

        return PettyCashAccount::create(array_merge([
            'name' => 'Front-desk float',
            'opening_balance' => $opening,
            'current_balance' => $opening,
            'is_active' => true,
        ], $overrides));
    }

    /** An expense created straight through the model — no HTTP, no mirror line. */
    private function expense(array $overrides = []): Expense
    {
        return Expense::create(array_merge([
            'expense_number' => Expense::generateExpenseNumber(),
            'category' => 'supplies',
            'expense_date' => now()->toDateString(),
            'amount' => 400,
            'paid_via' => 'cash',
            'status' => 'pending',
            'description' => 'Site-visit taxi fare',
        ], $overrides));
    }

    /** @param  array<int, int>  $expenseIds */
    private function payload(PettyCashAccount $fund, array $expenseIds, array $overrides = []): array
    {
        return array_merge([
            'petty_cash_account_id' => $fund->id,
            'voucher_date' => now()->toDateString(),
            'purpose' => 'September out-of-pocket reimbursement',
            'expense_ids' => $expenseIds,
        ], $overrides);
    }

    public function test_vouchers_page_renders_with_its_management_props(): void
    {
        $this->actingAs($this->superAdmin())
            ->get('/finance/vouchers')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Finance/Vouchers')
                ->has('vouchers')
                ->has('claimableExpenses')
                ->has('accounts')
                ->has('claimants')
                ->has('branches')
                ->has('statuses')
                ->has('summary')
            );
    }

    public function test_raising_a_voucher_numbers_it_totals_the_claim_and_cuts_the_fund_once(): void
    {
        $user = $this->superAdmin();
        $fund = $this->fund(['opening_balance' => 2000]);

        CurrentBranch::flush();
        $expectedBranchId = CurrentBranch::id();

        $a = $this->expense(['amount' => 400]);
        $b = $this->expense(['amount' => 350, 'description' => 'Courier charges']);

        $this->actingAs($user)
            ->post('/finance/vouchers', $this->payload($fund, [$a->id, $b->id]))
            ->assertRedirect();

        $voucher = ExpenseVoucher::firstOrFail();
        $this->assertStringStartsWith('VCH-', $voucher->voucher_number);
        $this->assertSame($expectedBranchId, $voucher->branch_id);
        $this->assertSame('pending', $voucher->status);
        $this->assertSame($user->id, $voucher->created_by);
        $this->assertSame(750.0, (float) $voucher->amount);

        // Both expenses were claimed by this voucher.
        $this->assertSame($voucher->id, $a->fresh()->expense_voucher_id);
        $this->assertSame($voucher->id, $b->fresh()->expense_voucher_id);

        // Exactly one combined line, negative, traceable to the voucher.
        $lines = PettyCashTransaction::where('expense_voucher_id', $voucher->id)->get();
        $this->assertCount(1, $lines);
        $this->assertSame('disbursement', $lines[0]->type);
        $this->assertSame(-750.0, (float) $lines[0]->amount);
        $this->assertSame($voucher->voucher_number, $lines[0]->reference);

        // The fund fell by the claim total, once.
        $this->assertSame(1250.0, (float) $fund->fresh()->current_balance);
    }

    public function test_claiming_a_cash_expense_is_a_new_cut_from_the_fund(): void
    {
        $user = $this->superAdmin();
        $fund = $this->fund(['opening_balance' => 1000]);

        // A cash expense never touches petty cash on its own.
        $expense = $this->expense(['amount' => 600, 'paid_via' => 'cash']);
        $this->assertSame(1000.0, (float) $fund->fresh()->current_balance);

        $this->actingAs($user)
            ->post('/finance/vouchers', $this->payload($fund, [$expense->id]))
            ->assertRedirect();

        // Reimbursing it out of the float is a genuine new deduction.
        $this->assertSame(400.0, (float) $fund->fresh()->current_balance);
    }

    public function test_claiming_a_petty_cash_expense_does_not_deduct_the_fund_twice(): void
    {
        $user = $this->superAdmin();
        $fund = $this->fund(['opening_balance' => 2000]);

        // Raise it through HTTP so it posts its own mirror line.
        $this->actingAs($user)->post('/finance/expenses', [
            'category' => 'supplies',
            'expense_date' => now()->toDateString(),
            'amount' => 500,
            'paid_via' => 'petty_cash',
            'petty_cash_account_id' => $fund->id,
            'description' => 'Cleaning supplies',
        ])->assertRedirect();

        $expense = Expense::firstOrFail();
        $this->assertSame(1500.0, (float) $fund->fresh()->current_balance);
        $this->assertSame(1, PettyCashTransaction::where('expense_id', $expense->id)->count());

        $this->actingAs($user)
            ->post('/finance/vouchers', $this->payload($fund, [$expense->id]))
            ->assertRedirect();

        $voucher = ExpenseVoucher::firstOrFail();

        // The individual line was replaced by the combined one — net effect nil.
        $this->assertSame(0, PettyCashTransaction::where('expense_id', $expense->id)->count());
        $this->assertSame(1, PettyCashTransaction::where('expense_voucher_id', $voucher->id)->count());
        $this->assertSame(1500.0, (float) $fund->fresh()->current_balance);
    }

    public function test_editing_the_claimed_set_re_rolls_the_total_and_the_fund(): void
    {
        $user = $this->superAdmin();
        $fund = $this->fund(['opening_balance' => 2000]);

        $a = $this->expense(['amount' => 400]);
        $b = $this->expense(['amount' => 350, 'description' => 'Courier charges']);

        $this->actingAs($user)
            ->post('/finance/vouchers', $this->payload($fund, [$a->id, $b->id]))
            ->assertRedirect();

        $voucher = ExpenseVoucher::firstOrFail();
        $this->assertSame(1250.0, (float) $fund->fresh()->current_balance);

        // Drop the Rs 350 line.
        $this->actingAs($user)
            ->put("/finance/vouchers/{$voucher->id}", $this->payload($fund, [$a->id]))
            ->assertRedirect();

        $voucher->refresh();
        $this->assertSame(400.0, (float) $voucher->amount);
        $this->assertNull($b->fresh()->expense_voucher_id);
        $this->assertSame(1600.0, (float) $fund->fresh()->current_balance);
        $this->assertSame(1, PettyCashTransaction::where('expense_voucher_id', $voucher->id)->count());
    }

    public function test_releasing_a_petty_cash_expense_restores_its_own_line(): void
    {
        $user = $this->superAdmin();
        $fund = $this->fund(['opening_balance' => 2000]);

        $this->actingAs($user)->post('/finance/expenses', [
            'category' => 'supplies',
            'expense_date' => now()->toDateString(),
            'amount' => 500,
            'paid_via' => 'petty_cash',
            'petty_cash_account_id' => $fund->id,
            'description' => 'Cleaning supplies',
        ])->assertRedirect();

        $pettyExpense = Expense::firstOrFail();
        $cashExpense = $this->expense(['amount' => 200]);

        $this->actingAs($user)
            ->post('/finance/vouchers', $this->payload($fund, [$pettyExpense->id, $cashExpense->id]))
            ->assertRedirect();

        $voucher = ExpenseVoucher::firstOrFail();
        $this->assertSame(1300.0, (float) $fund->fresh()->current_balance);   // 2000 − 700

        // Release the petty-cash one; it must regain its own −500 line.
        $this->actingAs($user)
            ->put("/finance/vouchers/{$voucher->id}", $this->payload($fund, [$cashExpense->id]))
            ->assertRedirect();

        $this->assertSame(1, PettyCashTransaction::where('expense_id', $pettyExpense->id)->count());
        $this->assertSame(200.0, (float) $voucher->fresh()->amount);
        $this->assertSame(1300.0, (float) $fund->fresh()->current_balance);   // 2000 − 500 − 200
    }

    public function test_editing_a_claimed_expense_amount_re_rolls_the_voucher_and_the_fund(): void
    {
        $user = $this->superAdmin();
        $fund = $this->fund(['opening_balance' => 2000]);
        $expense = $this->expense(['amount' => 400]);

        $this->actingAs($user)
            ->post('/finance/vouchers', $this->payload($fund, [$expense->id]))
            ->assertRedirect();

        $voucher = ExpenseVoucher::firstOrFail();
        $this->assertSame(1600.0, (float) $fund->fresh()->current_balance);

        $this->actingAs($user)
            ->put("/finance/expenses/{$expense->id}", [
                'category' => $expense->category,
                'expense_date' => $expense->expense_date->toDateString(),
                'amount' => 900,
                'paid_via' => 'cash',
                'description' => $expense->description,
            ])
            ->assertRedirect();

        $this->assertSame(900.0, (float) $voucher->fresh()->amount);
        $this->assertSame(1, PettyCashTransaction::where('expense_voucher_id', $voucher->id)->count());
        $this->assertSame(1100.0, (float) $fund->fresh()->current_balance);
    }

    public function test_deleting_a_claimed_expense_shrinks_the_voucher_and_credits_the_fund(): void
    {
        $user = $this->superAdmin();
        $fund = $this->fund(['opening_balance' => 2000]);

        $a = $this->expense(['amount' => 400]);
        $b = $this->expense(['amount' => 350, 'description' => 'Courier charges']);

        $this->actingAs($user)
            ->post('/finance/vouchers', $this->payload($fund, [$a->id, $b->id]))
            ->assertRedirect();

        $voucher = ExpenseVoucher::firstOrFail();

        $this->actingAs($user)->delete("/finance/expenses/{$b->id}")->assertRedirect();

        $this->assertSame(400.0, (float) $voucher->fresh()->amount);
        $this->assertSame(1600.0, (float) $fund->fresh()->current_balance);
    }

    public function test_approving_a_voucher_only_stamps_the_approver(): void
    {
        $user = $this->superAdmin();
        $fund = $this->fund(['opening_balance' => 2000]);
        $expense = $this->expense(['amount' => 400]);

        $this->actingAs($user)
            ->post('/finance/vouchers', $this->payload($fund, [$expense->id]))
            ->assertRedirect();

        $voucher = ExpenseVoucher::firstOrFail();

        $this->actingAs($user)
            ->put("/finance/vouchers/{$voucher->id}/approve")
            ->assertRedirect();

        $voucher->refresh();
        $this->assertSame('approved', $voucher->status);
        $this->assertSame($user->id, $voucher->approved_by);
        $this->assertNotNull($voucher->approved_at);

        // The money left on submission — approval must not move it again.
        $this->assertSame(1600.0, (float) $fund->fresh()->current_balance);
        $this->assertSame(1, PettyCashTransaction::where('expense_voucher_id', $voucher->id)->count());
    }

    public function test_rejecting_a_voucher_reverses_the_line_and_releases_the_expenses(): void
    {
        $user = $this->superAdmin();
        $fund = $this->fund(['opening_balance' => 2000]);
        $expense = $this->expense(['amount' => 400]);

        $this->actingAs($user)
            ->post('/finance/vouchers', $this->payload($fund, [$expense->id]))
            ->assertRedirect();

        $voucher = ExpenseVoucher::firstOrFail();
        $this->assertSame(1600.0, (float) $fund->fresh()->current_balance);

        $this->actingAs($user)
            ->put("/finance/vouchers/{$voucher->id}/reject", ['rejection_reason' => 'Missing receipts'])
            ->assertRedirect();

        $voucher->refresh();
        $this->assertSame('rejected', $voucher->status);
        $this->assertSame('Missing receipts', $voucher->rejection_reason);

        // Line gone, expense released, fund whole. The claim total stays on the
        // record so the rejected voucher still shows what was asked for.
        $this->assertSame(0, PettyCashTransaction::where('expense_voucher_id', $voucher->id)->count());
        $this->assertNull($expense->fresh()->expense_voucher_id);
        $this->assertSame(2000.0, (float) $fund->fresh()->current_balance);
        $this->assertSame(400.0, (float) $voucher->amount);
    }

    public function test_deleting_a_voucher_releases_its_expenses_and_leaves_the_fund_whole(): void
    {
        $user = $this->superAdmin();
        $fund = $this->fund(['opening_balance' => 2000]);

        $a = $this->expense(['amount' => 400]);
        $b = $this->expense(['amount' => 350, 'description' => 'Courier charges']);

        $this->actingAs($user)
            ->post('/finance/vouchers', $this->payload($fund, [$a->id, $b->id]))
            ->assertRedirect();

        $voucher = ExpenseVoucher::firstOrFail();

        $this->actingAs($user)
            ->delete("/finance/vouchers/{$voucher->id}")
            ->assertRedirect();

        $this->assertSoftDeleted('expense_vouchers', ['id' => $voucher->id]);
        $this->assertNull($a->fresh()->expense_voucher_id);
        $this->assertNull($b->fresh()->expense_voucher_id);
        $this->assertSame(0, PettyCashTransaction::where('expense_voucher_id', $voucher->id)->count());
        $this->assertSame(2000.0, (float) $fund->fresh()->current_balance);
    }

    public function test_an_expense_already_on_another_voucher_cannot_be_claimed_again(): void
    {
        $user = $this->superAdmin();
        $fund = $this->fund(['opening_balance' => 5000]);
        $expense = $this->expense(['amount' => 400]);

        $this->actingAs($user)
            ->post('/finance/vouchers', $this->payload($fund, [$expense->id]))
            ->assertRedirect();

        $this->actingAs($user)
            ->post('/finance/vouchers', $this->payload($fund, [$expense->id], ['purpose' => 'Second bite']))
            ->assertSessionHasErrors('expense_ids');

        $this->assertSame(1, ExpenseVoucher::count());
        $this->assertSame(4600.0, (float) $fund->fresh()->current_balance);
    }

    public function test_a_voucher_needs_a_fund_and_at_least_one_expense(): void
    {
        $user = $this->superAdmin();
        $fund = $this->fund();

        $this->actingAs($user)
            ->post('/finance/vouchers', [
                'voucher_date' => now()->toDateString(),
                'purpose' => 'No fund, no lines',
                'expense_ids' => [],
            ])
            ->assertSessionHasErrors(['petty_cash_account_id', 'expense_ids']);

        $this->assertSame(0, ExpenseVoucher::count());
    }

    public function test_only_pending_vouchers_can_be_edited(): void
    {
        $user = $this->superAdmin();
        $fund = $this->fund(['opening_balance' => 2000]);
        $expense = $this->expense(['amount' => 400]);

        $this->actingAs($user)
            ->post('/finance/vouchers', $this->payload($fund, [$expense->id]))
            ->assertRedirect();

        $voucher = ExpenseVoucher::firstOrFail();
        $this->actingAs($user)->put("/finance/vouchers/{$voucher->id}/approve")->assertRedirect();

        $this->actingAs($user)
            ->put("/finance/vouchers/{$voucher->id}", $this->payload($fund, [$expense->id], ['purpose' => 'Sneaky edit']))
            ->assertRedirect()
            ->assertSessionHas('error');

        $this->assertSame('September out-of-pocket reimbursement', $voucher->fresh()->purpose);
    }

    public function test_a_claimed_expense_is_excluded_from_the_claimable_pool(): void
    {
        $user = $this->superAdmin();
        $fund = $this->fund(['opening_balance' => 2000]);

        $claimed = $this->expense(['amount' => 400]);
        $free = $this->expense(['amount' => 250, 'description' => 'Stationery']);

        $this->actingAs($user)
            ->post('/finance/vouchers', $this->payload($fund, [$claimed->id]))
            ->assertRedirect();

        $this->actingAs($user)
            ->get('/finance/vouchers')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('claimableExpenses', fn ($pool) => collect($pool)->pluck('id')->all() === [$free->id])
            );
    }

    public function test_the_combined_line_cannot_be_deleted_from_the_petty_cash_ledger(): void
    {
        $user = $this->superAdmin();
        $fund = $this->fund(['opening_balance' => 2000]);
        $expense = $this->expense(['amount' => 400]);

        $this->actingAs($user)
            ->post('/finance/vouchers', $this->payload($fund, [$expense->id]))
            ->assertRedirect();

        $line = PettyCashTransaction::whereNotNull('expense_voucher_id')->firstOrFail();

        $this->actingAs($user)
            ->delete("/finance/petty-cash/transactions/{$line->id}")
            ->assertRedirect()
            ->assertSessionHas('error');

        $this->assertNotNull($line->fresh());
        $this->assertSame(1600.0, (float) $fund->fresh()->current_balance);
    }

    public function test_manager_can_open_the_vouchers_page_after_permissions_are_seeded(): void
    {
        $this->seed(PermissionSeeder::class);
        $this->seed(Phase5PermissionsSeeder::class);
        $this->seed(Phase6PermissionsSeeder::class);

        $manager = User::factory()->create();
        $manager->assignRole(Role::where('slug', 'manager')->firstOrFail());

        $this->actingAs($manager->fresh())->get('/finance/vouchers')->assertOk();
    }
}
