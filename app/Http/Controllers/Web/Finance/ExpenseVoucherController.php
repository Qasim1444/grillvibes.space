<?php

namespace App\Http\Controllers\Web\Finance;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Expense;
use App\Models\ExpenseVoucher;
use App\Models\PettyCashAccount;
use App\Models\User;
use App\Support\CurrentBranch;
use App\Support\PettyCashPoster;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Expense voucher claims: bundle unclaimed expenses into one reimbursement and
 * pay the batch out of a petty-cash float. The float is cut on submission — the
 * moment the voucher is created — not on approval.
 *
 * A claimed expense stops posting its own petty-cash line, so wrapping a
 * petty-cash expense in a voucher leaves the float exactly where it was; the
 * combined voucher line replaces the individual one. Wrapping a cash expense is
 * a genuinely new cut — that is the reimbursement case.
 */
class ExpenseVoucherController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $status = $request->query('status', '');
        $accountId = $request->query('account_id', '');
        $branchId = $request->query('branch_id', CurrentBranch::id());

        $vouchers = ExpenseVoucher::with([
            'branch:id,name', 'pettyCashAccount:id,name', 'claimant:id,name',
            'createdBy:id,name', 'approvedBy:id,name',
            'expenses:id,expense_voucher_id,expense_number,expense_date,amount,paid_via,description',
        ])
            ->when($search, fn ($q) => $q->where(fn ($w) => $w
                ->where('voucher_number', 'like', "%{$search}%")
                ->orWhere('purpose', 'like', "%{$search}%")
                ->orWhere('reference', 'like', "%{$search}%")
                ->orWhere('claimant_name', 'like', "%{$search}%")))
            ->when($status, fn ($q) => $q->where('status', $status))
            ->when($accountId, fn ($q) => $q->where('petty_cash_account_id', $accountId))
            ->when($branchId, fn ($q) => $q->where('branch_id', $branchId))
            ->orderByDesc('id')
            ->paginate(15)
            ->withQueryString()
            ->through(fn ($v) => [
                ...$v->only(
                    'id', 'voucher_number', 'branch_id', 'petty_cash_account_id',
                    'claimant_id', 'claimant_name', 'voucher_date', 'amount', 'status',
                    'purpose', 'reference', 'notes', 'rejection_reason', 'approved_at'
                ),
                'branch_name' => $v->branch?->name ?? 'All Branches',
                'account_name' => $v->pettyCashAccount?->name,
                'claimant_label' => $v->claimant?->name ?? $v->claimant_name,
                'created_by_name' => $v->createdBy?->name,
                'approved_by_name' => $v->approvedBy?->name,
                'expense_ids' => $v->expenses->pluck('id'),
                'expenses' => $v->expenses->map(fn ($e) => [
                    'id' => $e->id,
                    'expense_number' => $e->expense_number,
                    'expense_date' => $e->expense_date,
                    'amount' => $e->amount,
                    'paid_via' => $e->paid_via,
                    'description' => $e->description,
                ]),
            ]);

        return Inertia::render('Finance/Vouchers', [
            'vouchers' => $vouchers,
            'claimableExpenses' => $this->claimableExpenses($branchId ? (int) $branchId : null),
            'accounts' => PettyCashAccount::where('is_active', true)->orderBy('name')
                ->get(['id', 'name', 'current_balance']),
            'claimants' => User::employees()->orderBy('name')->get(['id', 'name']),
            'branches' => CurrentBranch::all(),
            'statuses' => ExpenseVoucher::STATUSES,
            'summary' => $this->summary($branchId ? (int) $branchId : null),
            'filters' => [
                'search' => $search, 'status' => $status,
                'account_id' => $accountId, 'branch_id' => $branchId,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);
        $expenseIds = $data['expense_ids'];
        unset($data['expense_ids']);

        DB::transaction(function () use ($data, $expenseIds, $request) {
            $voucher = ExpenseVoucher::create([
                ...$data,
                'voucher_number' => ExpenseVoucher::generateVoucherNumber(),
                'branch_id' => $data['branch_id'] ?? CurrentBranch::id(),
                'status' => 'pending',   // status transitions go through approve/reject
                'created_by' => $request->user()?->id,
            ]);

            Expense::whereIn('id', $expenseIds)->update(['expense_voucher_id' => $voucher->id]);

            $voucher->recomputeAmount();
            PettyCashPoster::syncVoucher($voucher->fresh(), $request->user()?->id);
        });

        return back()->with('success', 'Voucher raised — the claim total was deducted from the fund.');
    }

    /** Edit a still-pending claim: the expense set, the paying fund and the
     *  header fields. Released expenses regain their own petty-cash lines. */
    public function update(Request $request, int $id): RedirectResponse
    {
        $voucher = ExpenseVoucher::findOrFail($id);

        if ($voucher->status !== 'pending') {
            return back()->with('error', 'Only pending vouchers can be edited.');
        }

        $data = $this->validated($request, $voucher);
        $expenseIds = $data['expense_ids'];
        unset($data['expense_ids']);

        DB::transaction(function () use ($voucher, $data, $expenseIds, $request) {
            $voucher->update([
                ...$data,
                'branch_id' => $data['branch_id'] ?? CurrentBranch::id(),
            ]);

            // Diff the claimed set: release what was dropped, claim what was added.
            $current = $voucher->expenses()->pluck('id')->all();
            $released = array_values(array_diff($current, $expenseIds));

            if ($released) {
                Expense::whereIn('id', $released)->update(['expense_voucher_id' => null]);
            }

            Expense::whereIn('id', $expenseIds)->update(['expense_voucher_id' => $voucher->id]);

            $voucher->recomputeAmount();
            PettyCashPoster::syncVoucher($voucher->fresh(), $request->user()?->id, $released);
        });

        return back()->with('success', 'Voucher updated.');
    }

    /** Approve a claim — the money already left the box on submission, so this
     *  only stamps who signed it off. */
    public function approve(Request $request, int $id): RedirectResponse
    {
        $voucher = ExpenseVoucher::findOrFail($id);

        if ($voucher->status !== 'pending') {
            return back()->with('error', 'Only pending vouchers can be approved.');
        }

        $voucher->update([
            'status' => 'approved',
            'approved_by' => $request->user()?->id,
            'approved_at' => now(),
            'rejection_reason' => null,
        ]);

        return back()->with('success', 'Voucher approved.');
    }

    /** Reject a claim — reverses the combined line and releases the expenses back
     *  to the claimable pool, each regaining its own petty-cash line. The claim
     *  total is deliberately left frozen so the rejected record still shows what
     *  was asked for. */
    public function reject(Request $request, int $id): RedirectResponse
    {
        $voucher = ExpenseVoucher::findOrFail($id);

        if ($voucher->status !== 'pending') {
            return back()->with('error', 'Only pending vouchers can be rejected.');
        }

        $data = $request->validate(['rejection_reason' => 'nullable|string|max:255']);

        DB::transaction(function () use ($voucher, $data, $request) {
            $released = $voucher->expenses()->pluck('id')->all();

            $voucher->update([
                'status' => 'rejected',
                'approved_by' => $request->user()?->id,
                'approved_at' => now(),
                'rejection_reason' => $data['rejection_reason'] ?? null,
            ]);

            if ($released) {
                Expense::whereIn('id', $released)->update(['expense_voucher_id' => null]);
            }

            PettyCashPoster::syncVoucher($voucher->fresh(), $request->user()?->id, $released);
        });

        return back()->with('success', 'Voucher rejected — the fund was credited back.');
    }

    public function destroy(Request $request, int $id): RedirectResponse
    {
        $voucher = ExpenseVoucher::findOrFail($id);

        DB::transaction(function () use ($voucher, $request) {
            $released = $voucher->expenses()->pluck('id')->all();

            if ($released) {
                Expense::whereIn('id', $released)->update(['expense_voucher_id' => null]);
            }

            $voucher->delete();

            // Drop the combined line and restore each released expense's own line.
            // A trashed voucher cuts nothing, so the sync reverses cleanly.
            PettyCashPoster::syncVoucher($voucher->fresh(), $request->user()?->id, $released);
        });

        return back()->with('success', 'Voucher deleted — the claimed expenses were released.');
    }

    /**
     * Shared validation for store/update. Status and approval fields are handled
     * by the dedicated approve/reject actions, not mass-assigned here.
     */
    private function validated(Request $request, ?ExpenseVoucher $voucher = null): array
    {
        $data = $request->validate([
            'branch_id' => 'nullable|exists:branches,id',
            'petty_cash_account_id' => 'required|exists:petty_cash_accounts,id',
            'claimant_id' => 'nullable|exists:users,id',
            'claimant_name' => 'nullable|string|max:150',
            'voucher_date' => 'required|date',
            'purpose' => 'required|string|max:255',
            'reference' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:2000',
            'expense_ids' => 'required|array|min:1',
            'expense_ids.*' => 'integer|exists:expenses,id',
        ]);

        $data['expense_ids'] = array_values(array_unique(array_map('intval', $data['expense_ids'])));

        // Claim-once guard: every picked expense must be unclaimed, or already
        // sitting on *this* voucher.
        $taken = Expense::whereIn('id', $data['expense_ids'])
            ->whereNotNull('expense_voucher_id')
            ->when($voucher, fn ($q) => $q->where('expense_voucher_id', '!=', $voucher->id))
            ->pluck('expense_number')
            ->all();

        if ($taken) {
            throw ValidationException::withMessages([
                'expense_ids' => 'Already claimed on another voucher: '.implode(', ', $taken).'.',
            ]);
        }

        return $data;
    }

    /** The unclaimed pool the picker draws from — newest first. */
    private function claimableExpenses(?int $branchId): \Illuminate\Support\Collection
    {
        return Expense::with(['pettyCashAccount:id,name', 'vendor:id,name'])
            ->whereNull('expense_voucher_id')
            ->where('status', '!=', 'rejected')
            ->when($branchId, fn ($q) => $q->where('branch_id', $branchId))
            ->orderByDesc('expense_date')->orderByDesc('id')
            ->limit(200)
            ->get()
            ->map(fn ($e) => [
                ...$e->only(
                    'id', 'expense_number', 'expense_date', 'amount', 'category',
                    'paid_via', 'petty_cash_account_id', 'status', 'description'
                ),
                'payee_label' => $e->vendor?->name ?? $e->payee,
                'account_name' => $e->pettyCashAccount?->name,
            ]);
    }

    /** Voucher KPIs — counted across all outlets (unfiltered). */
    private function summary(?int $branchId): array
    {
        $monthStart = now()->startOfMonth();
        $monthEnd = now()->endOfMonth();

        return [
            'pending' => ExpenseVoucher::when($branchId, fn ($q) => $q->where('branch_id', $branchId))->where('status', 'pending')->count(),
            'pending_amount' => (float) ExpenseVoucher::when($branchId, fn ($q) => $q->where('branch_id', $branchId))->where('status', 'pending')->sum('amount'),
            'claimed_this_month' => (float) ExpenseVoucher::where('status', '!=', 'rejected')
                ->when($branchId, fn ($q) => $q->where('branch_id', $branchId))
                ->whereBetween('voucher_date', [$monthStart, $monthEnd])
                ->sum('amount'),
            'approved_this_month' => (float) ExpenseVoucher::where('status', 'approved')
                ->when($branchId, fn ($q) => $q->where('branch_id', $branchId))
                ->whereBetween('voucher_date', [$monthStart, $monthEnd])
                ->sum('amount'),
        ];
    }
}
