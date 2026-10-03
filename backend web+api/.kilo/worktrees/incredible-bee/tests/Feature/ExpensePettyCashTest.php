<?php

namespace Tests\Feature;

use App\Models\Expense;
use App\Models\PettyCashAccount;
use App\Models\PettyCashTransaction;
use App\Models\Role;
use App\Models\User;
use App\Support\CurrentBranch;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\Phase5PermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExpensePettyCashTest extends TestCase
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

    public function test_expenses_page_renders_with_its_management_props(): void
    {
        $this->actingAs($this->superAdmin())
            ->get('/finance/expenses')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Finance/Expenses')
                ->has('expenses')
                ->has('branches')
                ->has('vendors')
                ->has('accounts')
                ->has('categories')
                ->has('paidVia')
                ->has('statuses')
                ->has('summary')
            );
    }

    public function test_petty_cash_page_renders_with_its_management_props(): void
    {
        $this->actingAs($this->superAdmin())
            ->get('/finance/petty-cash')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Finance/PettyCash')
                ->has('accounts')
                ->has('transactions')
                ->has('branches')
                ->has('types')
                ->has('summary')
            );
    }

    public function test_creating_an_expense_generates_a_number_and_defaults_branch_and_status(): void
    {
        $user = $this->superAdmin();

        CurrentBranch::flush();
        $expectedBranchId = CurrentBranch::id();

        $this->actingAs($user)
            ->post('/finance/expenses', [
                'category' => 'utilities',
                'expense_date' => now()->toDateString(),
                'amount' => 4500,
                'paid_via' => 'cash',
                'description' => 'October electricity bill',
            ])
            ->assertRedirect();

        $expense = Expense::firstOrFail();
        $this->assertStringStartsWith('EXP-', $expense->expense_number);
        $this->assertSame($expectedBranchId, $expense->branch_id);
        $this->assertSame('pending', $expense->status);
        $this->assertSame($user->id, $expense->created_by);
    }

    public function test_paying_an_expense_from_petty_cash_posts_a_signed_disbursement(): void
    {
        $user = $this->superAdmin();
        $fund = $this->fund(['opening_balance' => 2000]);

        $this->actingAs($user)
            ->post('/finance/expenses', [
                'category' => 'supplies',
                'expense_date' => now()->toDateString(),
                'amount' => 500,
                'paid_via' => 'petty_cash',
                'petty_cash_account_id' => $fund->id,
                'description' => 'Cleaning supplies',
            ])
            ->assertRedirect();

        $expense = Expense::firstOrFail();

        // A single mirror line was posted, negative, linked back to the expense.
        $txn = PettyCashTransaction::where('expense_id', $expense->id)->firstOrFail();
        $this->assertSame('disbursement', $txn->type);
        $this->assertSame(-500.0, (float) $txn->amount);
        $this->assertSame($fund->id, $txn->petty_cash_account_id);

        // The float balance fell by the expense amount.
        $this->assertSame(1500.0, (float) $fund->fresh()->current_balance);
    }

    public function test_petty_cash_paid_expense_requires_a_fund(): void
    {
        $this->actingAs($this->superAdmin())
            ->post('/finance/expenses', [
                'category' => 'supplies',
                'expense_date' => now()->toDateString(),
                'amount' => 500,
                'paid_via' => 'petty_cash',
                'description' => 'Missing the fund',
            ])
            ->assertSessionHasErrors('petty_cash_account_id');
    }

    public function test_approving_an_expense_stamps_the_approver(): void
    {
        $user = $this->superAdmin();
        $expense = Expense::create([
            'expense_number' => Expense::generateExpenseNumber(),
            'category' => 'misc',
            'expense_date' => now()->toDateString(),
            'amount' => 100,
            'paid_via' => 'cash',
            'status' => 'pending',
            'description' => 'Sundry',
        ]);

        $this->actingAs($user)
            ->put("/finance/expenses/{$expense->id}/approve")
            ->assertRedirect();

        $expense->refresh();
        $this->assertSame('approved', $expense->status);
        $this->assertSame($user->id, $expense->approved_by);
        $this->assertNotNull($expense->approved_at);
    }

    public function test_deleting_a_petty_cash_expense_reverses_the_fund(): void
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

        $expense = Expense::firstOrFail();
        $this->assertSame(1500.0, (float) $fund->fresh()->current_balance);

        $this->actingAs($user)
            ->delete("/finance/expenses/{$expense->id}")
            ->assertRedirect();

        // The mirror line is gone and the float is whole again.
        $this->assertSame(0, PettyCashTransaction::where('expense_id', $expense->id)->count());
        $this->assertSame(2000.0, (float) $fund->fresh()->current_balance);
    }

    public function test_creating_a_fund_seeds_its_balance_from_the_opening(): void
    {
        $user = $this->superAdmin();
        CurrentBranch::flush();
        $expectedBranchId = CurrentBranch::id();

        $this->actingAs($user)
            ->post('/finance/petty-cash/accounts', [
                'name' => 'Kitchen float',
                'opening_balance' => 1000,
                'is_active' => true,
            ])
            ->assertRedirect();

        $account = PettyCashAccount::where('name', 'Kitchen float')->firstOrFail();
        $this->assertSame(1000.0, (float) $account->current_balance);
        $this->assertSame($expectedBranchId, $account->branch_id);
    }

    public function test_transactions_move_the_balance_by_type(): void
    {
        $user = $this->superAdmin();
        $fund = $this->fund(['opening_balance' => 1000]);

        // Top-up adds regardless of the sign entered.
        $this->actingAs($user)->post('/finance/petty-cash/transactions', [
            'petty_cash_account_id' => $fund->id,
            'type' => 'top_up',
            'amount' => 500,
        ])->assertRedirect();
        $this->assertSame(1500.0, (float) $fund->fresh()->current_balance);

        // Disbursement deducts regardless of the sign entered.
        $this->actingAs($user)->post('/finance/petty-cash/transactions', [
            'petty_cash_account_id' => $fund->id,
            'type' => 'disbursement',
            'amount' => 300,
        ])->assertRedirect();
        $this->assertSame(1200.0, (float) $fund->fresh()->current_balance);

        // Adjustment keeps the entered sign (negative reduces the float).
        $this->actingAs($user)->post('/finance/petty-cash/transactions', [
            'petty_cash_account_id' => $fund->id,
            'type' => 'adjustment',
            'amount' => -200,
        ])->assertRedirect();
        $this->assertSame(1000.0, (float) $fund->fresh()->current_balance);

        // Running balance is stamped on the latest line.
        $latest = $fund->transactions()->orderByDesc('id')->first();
        $this->assertSame(1000.0, (float) $latest->balance_after);
    }

    public function test_a_fund_with_history_cannot_be_deleted(): void
    {
        $user = $this->superAdmin();
        $fund = $this->fund();

        PettyCashTransaction::create([
            'petty_cash_account_id' => $fund->id,
            'type' => 'top_up',
            'amount' => 100,
            'balance_after' => 2100,
            'occurred_on' => now()->toDateString(),
        ]);

        $this->actingAs($user)
            ->delete("/finance/petty-cash/accounts/{$fund->id}")
            ->assertRedirect()
            ->assertSessionHas('error');

        $this->assertNotNull($fund->fresh());
    }

    public function test_manager_can_open_finance_pages_after_permissions_are_seeded(): void
    {
        $this->seed(PermissionSeeder::class);
        $this->seed(Phase5PermissionsSeeder::class);

        $manager = User::factory()->create();
        $manager->assignRole(Role::where('slug', 'manager')->firstOrFail());

        foreach (['/finance/expenses', '/finance/petty-cash'] as $url) {
            $this->actingAs($manager->fresh())->get($url)->assertOk();
        }
    }
}
