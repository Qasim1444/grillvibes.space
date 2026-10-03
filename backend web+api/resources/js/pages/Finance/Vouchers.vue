<template>
  <div class="page">
    <PageHeader title="Expense Vouchers" subtitle="Bundle receipts into a single reimbursement claim and pay the batch out of a petty-cash float. The claim total is deducted from the fund the moment the voucher is raised.">
      <template #actions>
        <button v-if="can('vouchers.create')" class="ui-btn ui-btn--primary" @click="openCreate">+ New Voucher</button>
      </template>
    </PageHeader>

    <!-- Summary strip -->
    <div class="vc__kpis">
      <div class="vc__kpi vc__kpi--warn">
        <span class="vc__kpi-label">Pending</span>
        <span class="vc__kpi-val">{{ props.summary.pending }}</span>
        <span class="vc__kpi-sub">awaiting approval</span>
      </div>
      <div class="vc__kpi">
        <span class="vc__kpi-label">Pending Amount</span>
        <span class="vc__kpi-val">{{ fmt(props.summary.pending_amount) }}</span>
        <span class="vc__kpi-sub">already out of the funds</span>
      </div>
      <div class="vc__kpi vc__kpi--info">
        <span class="vc__kpi-label">Claimed (mo.)</span>
        <span class="vc__kpi-val">{{ fmt(props.summary.claimed_this_month) }}</span>
        <span class="vc__kpi-sub">this month, excl. rejected</span>
      </div>
      <div class="vc__kpi vc__kpi--ok">
        <span class="vc__kpi-label">Approved (mo.)</span>
        <span class="vc__kpi-val">{{ fmt(props.summary.approved_this_month) }}</span>
        <span class="vc__kpi-sub">signed off this month</span>
      </div>
    </div>

    <!-- Filters -->
    <div class="vc__filters">
      <input v-model="search" class="ui-input vc__search" placeholder="Search # / purpose / claimant…" />
      <select v-model="statusFilter" class="ui-input" style="width:150px">
        <option value="">All Statuses</option>
        <option v-for="s in props.statuses" :key="s" :value="s">{{ statusLabel(s) }}</option>
      </select>
      <select v-model="accountFilter" class="ui-input" style="width:220px">
        <option value="">All Funds</option>
        <option v-for="a in props.accounts" :key="a.id" :value="a.id">{{ a.name }}</option>
      </select>
      <select v-model="branchFilter" class="ui-input" style="width:180px">
        <option value="">All Branches</option>
        <option v-for="branch in props.branches" :key="branch.id" :value="branch.id">{{ branch.name }}</option>
      </select>
    </div>

    <DataTable :columns="columns" :rows="vouchers" index empty-text="No vouchers yet. Raise your first claim.">
      <template #cell:voucher_date="{ value }">{{ fmtDate(value) }}</template>
      <template #cell:claimant_label="{ value }">
        <span v-if="value">{{ value }}</span>
        <span v-else class="vc__muted">—</span>
      </template>
      <template #cell:purpose="{ row }">
        {{ row.purpose }}
        <span v-if="row.reference" class="vc__code">{{ row.reference }}</span>
      </template>
      <template #cell:expenses="{ row }">
        <span v-if="!row.expenses.length" class="vc__muted">—</span>
        <span v-for="e in row.expenses" :key="e.id" class="vc__chip" :title="e.description">{{ e.expense_number }}</span>
      </template>
      <template #cell:amount="{ value }"><strong>{{ fmt(value) }}</strong></template>
      <template #cell:status="{ row }">
        <span class="ui-badge" :class="statusClass(row.status)">{{ statusLabel(row.status) }}</span>
        <span v-if="row.rejection_reason" class="vc__code" :title="row.rejection_reason">why?</span>
      </template>
      <template #actions="{ row }">
        <button v-if="can('vouchers.approve') && row.status === 'pending'"
          class="ui-btn ui-btn--secondary ui-btn--sm" @click="approve(row)">Approve</button>
        <button v-if="can('vouchers.approve') && row.status === 'pending'"
          class="ui-btn ui-btn--ghost ui-btn--sm" @click="reject(row)">Reject</button>
        <button v-if="can('vouchers.update') && row.status === 'pending'"
          class="ui-btn ui-btn--ghost ui-btn--sm" @click="openEdit(row)">Edit</button>
        <button v-if="can('vouchers.delete')" class="ui-btn ui-btn--danger ui-btn--sm" @click="del(row)">Delete</button>
      </template>
    </DataTable>

    <Pagination :paginator="props.vouchers" :only="['vouchers']" />

    <!-- Create / Edit -->
    <Modal v-model="showModal" :title="form.id ? 'Edit Voucher' : 'New Expense Voucher'" width="820px">
      <FormField v-model="form.purpose" label="Purpose *" placeholder="e.g. September site-visit reimbursement" :error="form.errors.purpose" />
      <div class="form-grid-2">
        <FormField v-model="form.claimant_id" label="Claimant" type="select" :error="form.errors.claimant_id">
          <option value="">— Not a system user —</option>
          <option v-for="c in props.claimants" :key="c.id" :value="c.id">{{ c.name }}</option>
        </FormField>
        <FormField v-if="!form.claimant_id" v-model="form.claimant_name" label="Claimant Name" placeholder="Free-text name" :error="form.errors.claimant_name" />
        <FormField v-model="form.voucher_date" label="Voucher Date *" type="date" :error="form.errors.voucher_date" />
        <FormField v-model="form.petty_cash_account_id" label="Paying Fund *" type="select" :error="form.errors.petty_cash_account_id">
          <option value="" disabled>Select fund</option>
          <option v-for="a in props.accounts" :key="a.id" :value="a.id">{{ a.name }} ({{ fmt(a.current_balance) }})</option>
        </FormField>
        <FormField v-model="form.branch_id" label="Branch" type="select" :error="form.errors.branch_id">
          <option value="">Current Outlet</option>
          <option v-for="branch in props.branches" :key="branch.id" :value="branch.id">{{ branch.name }}</option>
        </FormField>
        <FormField v-model="form.reference" label="Reference" :error="form.errors.reference" />
      </div>

      <!-- Expense picker -->
      <h3 class="vc__picker-title">
        Expenses Claimed *
        <span class="vc__muted vc__picker-hint">{{ pickerHint }}</span>
      </h3>
      <p v-if="form.errors.expense_ids" class="vc__err">{{ form.errors.expense_ids }}</p>
      <div class="vc__picker">
        <p v-if="!pickable.length" class="vc__muted vc__picker-empty">No unclaimed expenses available. Record an expense first.</p>
        <label v-for="e in pickable" :key="e.id" class="vc__row" :class="{ 'vc__row--on': isPicked(e.id) }">
          <input type="checkbox" :checked="isPicked(e.id)" @change="toggle(e.id)" />
          <span class="vc__row-num">{{ e.expense_number }}</span>
          <span class="vc__row-desc">
            {{ e.description }}
            <span class="vc__code">{{ fmtDate(e.expense_date) }} · {{ paidViaLabel(e.paid_via) }}</span>
          </span>
          <span class="vc__row-amt">{{ fmt(e.amount) }}</span>
        </label>
      </div>

      <div class="vc__totals">
        <div class="vc__total-row">
          <span>Total claim</span>
          <strong>{{ fmt(claimTotal) }}</strong>
        </div>
        <div v-if="selectedFund" class="vc__total-row vc__total-row--sub" :class="{ 'vc__over': balanceAfter < 0 }">
          <span>{{ selectedFund.name }} balance after</span>
          <strong>{{ fmt(balanceAfter) }}</strong>
        </div>
        <p v-if="selectedFund && balanceAfter < 0" class="vc__err">
          This claim is larger than the fund holds — top the float up, or split the claim.
        </p>
      </div>

      <FormField v-model="form.notes" label="Notes" type="textarea" :error="form.errors.notes" />
      <p class="vc__hint">Raising the voucher posts one combined disbursement to the fund's ledger. A claimed expense stops posting its own petty-cash line, so a petty-cash expense is never deducted twice.</p>

      <template #footer>
        <button class="ui-btn ui-btn--ghost" @click="showModal = false">Cancel</button>
        <button class="ui-btn ui-btn--primary" :disabled="form.processing" @click="save">Save</button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { confirmDialog } from "../../composables/useNotifications";
import { computed, ref, watch } from 'vue';
import { router, useForm } from '@inertiajs/vue3';
import AdminLayout from '../../layouts/AdminLayout.vue';
import PageHeader from '../../components/ui/PageHeader.vue';
import DataTable from '../../components/ui/DataTable.vue';
import Pagination from '../../components/ui/Pagination.vue';
import Modal from '../../components/ui/Modal.vue';
import FormField from '../../components/ui/FormField.vue';
import { usePermissions } from '../../composables/usePermissions';

defineOptions({ layout: AdminLayout });
const { can } = usePermissions();

const props = defineProps({
  vouchers:          { type: Object, default: () => ({ data: [] }) },
  claimableExpenses: { type: Array,  default: () => [] },
  accounts:          { type: Array,  default: () => [] },
  claimants:         { type: Array,  default: () => [] },
  branches:          { type: Array,  default: () => [] },
  statuses:          { type: Array,  default: () => [] },
  summary:           { type: Object, default: () => ({ pending: 0, pending_amount: 0, claimed_this_month: 0, approved_this_month: 0 }) },
  filters:           { type: Object, default: () => ({}) },
});

const columns = [
  { key: 'voucher_number',  label: 'Voucher #' },
  { key: 'voucher_date',    label: 'Date' },
  { key: 'claimant_label',  label: 'Claimant' },
  { key: 'purpose',         label: 'Purpose' },
  { key: 'expenses',        label: 'Expenses' },
  { key: 'amount',          label: 'Amount' },
  { key: 'account_name',    label: 'Fund' },
  { key: 'status',          label: 'Status' },
];

const vouchers = computed(() => props.vouchers?.data ?? []);
const search = ref(props.filters?.search ?? '');
const statusFilter = ref(props.filters?.status ?? '');
const accountFilter = ref(props.filters?.account_id ?? '');
const branchFilter = ref(props.filters?.branch_id ?? '');

let timer = null;
const reload = () => router.get('/finance/vouchers',
  {
    search: search.value || undefined,
    status: statusFilter.value || undefined,
    account_id: accountFilter.value || undefined,
    branch_id: branchFilter.value || undefined,
  },
  { preserveState: true, preserveScroll: true, replace: true, only: ['vouchers', 'summary', 'filters'] });
watch([search, statusFilter, accountFilter, branchFilter], () => { clearTimeout(timer); timer = setTimeout(reload, 300); });

const paidViaLabel = p => ({ cash: 'Cash', bank: 'Bank', card: 'Card', petty_cash: 'Petty Cash' }[p] ?? p);

const statusLabel = s => ({ pending: 'Pending', approved: 'Approved', rejected: 'Rejected' }[s] ?? s);
const statusClass = s => ({
  pending: 'ui-badge--warning', approved: 'ui-badge--success', rejected: 'ui-badge--danger',
}[s] ?? 'ui-badge--muted');

// ── Modal ───────────────────────────────────────────────────────────────────
const today = () => new Date().toISOString().slice(0, 10);

const defaults = () => ({
  id: null, branch_id: '', petty_cash_account_id: '', claimant_id: '', claimant_name: '',
  voucher_date: today(), purpose: '', reference: '', notes: '', expense_ids: [],
});

const showModal = ref(false);
const form = useForm(defaults());

// The expenses already on the voucher being edited — they aren't in the
// unclaimed pool, so they're merged in to stay visible and de-selectable.
const editingExpenses = ref([]);

const pickable = computed(() => {
  const pool = [...props.claimableExpenses];
  const seen = new Set(pool.map(e => e.id));
  editingExpenses.value.forEach(e => { if (!seen.has(e.id)) pool.push(e); });

  return pool;
});

const isPicked = id => form.expense_ids.includes(id);
const toggle = id => {
  form.expense_ids = isPicked(id)
    ? form.expense_ids.filter(x => x !== id)
    : [...form.expense_ids, id];
};

const claimTotal = computed(() => pickable.value
  .filter(e => isPicked(e.id))
  .reduce((sum, e) => sum + Number(e.amount || 0), 0));

const selectedFund = computed(() =>
  props.accounts.find(a => String(a.id) === String(form.petty_cash_account_id)) ?? null);

// The claim total and fund at the moment Edit was opened.
const originalAmount = ref(0);
const originalFundId = ref('');

// On edit, this voucher's existing line is already out of the fund — add it back
// before subtracting the new total, so the projection isn't double-counted.
const balanceAfter = computed(() => {
  if (!selectedFund.value) return 0;
  const alreadyOut = form.id && String(originalFundId.value) === String(form.petty_cash_account_id)
    ? Number(originalAmount.value || 0)
    : 0;

  return Number(selectedFund.value.current_balance || 0) + alreadyOut - claimTotal.value;
});

const pickerHint = computed(() => {
  const n = form.expense_ids.length;

  return n ? `${n} selected` : 'pick the receipts this claim covers';
});

// A system-user claimant supersedes the free-text name.
watch(() => form.claimant_id, v => { if (v) form.claimant_name = ''; });

const openCreate = () => {
  form.defaults(defaults());
  form.reset(); form.clearErrors();
  editingExpenses.value = [];
  originalAmount.value = 0;
  originalFundId.value = '';
  form.petty_cash_account_id = props.accounts[0]?.id ?? '';
  showModal.value = true;
};

const openEdit = row => {
  form.id = row.id;
  form.branch_id = row.branch_id ?? '';
  form.petty_cash_account_id = row.petty_cash_account_id ?? '';
  form.claimant_id = row.claimant_id ?? '';
  form.claimant_name = row.claimant_name ?? '';
  form.voucher_date = date(row.voucher_date);
  form.purpose = row.purpose ?? '';
  form.reference = row.reference ?? '';
  form.notes = row.notes ?? '';
  form.expense_ids = [...(row.expense_ids ?? [])];
  form.clearErrors();

  editingExpenses.value = [...(row.expenses ?? [])];
  originalAmount.value = Number(row.amount || 0);
  originalFundId.value = row.petty_cash_account_id ?? '';
  showModal.value = true;
};

const save = () => {
  const opts = { preserveScroll: true, onSuccess: () => (showModal.value = false) };
  if (form.id) form.put(`/finance/vouchers/${form.id}`, opts);
  else form.post('/finance/vouchers', opts);
};

const approve = row => router.put(`/finance/vouchers/${row.id}/approve`, {}, { preserveScroll: true });

const reject = row => {
  const reason = prompt(`Reject voucher ${row.voucher_number}? The fund will be credited back and the expenses released.\n\nReason (optional):`);
  if (reason === null) return;
  router.put(`/finance/vouchers/${row.id}/reject`, { rejection_reason: reason || null }, { preserveScroll: true });
};

const del = async row => {
  if (!(await confirmDialog(`Delete voucher ${row.voucher_number}? The fund will be credited back and its ${row.expenses.length} expense(s) released.`))) return;
  router.delete(`/finance/vouchers/${row.id}`, { preserveScroll: true });
};

const fmt     = v => 'Rs ' + Number(v || 0).toLocaleString('en-PK', { minimumFractionDigits: 2 });
const fmtDate = v => v ? new Date(v).toLocaleDateString() : '—';
const date    = v => v ? String(v).slice(0, 10) : '';
</script>

<style scoped>
.vc__kpis    { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 18px; }
.vc__kpi     { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px 16px; display: flex; flex-direction: column; gap: 2px; }
.vc__kpi--warn   { border-left: 3px solid var(--warning, #d97706); }
.vc__kpi--ok     { border-left: 3px solid var(--success, #16a34a); }
.vc__kpi--info   { border-left: 3px solid var(--brand, #6366f1); }
.vc__kpi-label   { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-soft); font-weight: 600; }
.vc__kpi-val     { font-size: 1.5rem; font-weight: 700; }
.vc__kpi-sub     { font-size: 0.72rem; color: var(--text-soft); }
.vc__filters { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.vc__search  { flex: 1; max-width: 300px; }
.vc__muted   { color: var(--text-soft); }
.vc__code    { color: var(--text-soft); font-size: 0.76rem; margin-left: 8px; }
.vc__hint    { font-size: 0.78rem; color: var(--text-soft); margin: 4px 0 12px; }
.vc__err     { font-size: 0.78rem; color: var(--danger, #dc2626); margin: 4px 0 8px; }
.vc__chip    { display: inline-block; background: var(--surface-2, #f1f5f9); border: 1px solid var(--border); border-radius: 4px;
               padding: 1px 6px; margin: 1px 4px 1px 0; font-size: 0.72rem; color: var(--text-soft); }

.vc__picker-title { font-size: 0.86rem; font-weight: 700; margin: 14px 0 8px; }
.vc__picker-hint  { font-weight: 400; font-size: 0.76rem; margin-left: 8px; }
.vc__picker  { border: 1px solid var(--border); border-radius: var(--radius); max-height: 260px; overflow-y: auto; }
.vc__picker-empty { padding: 16px; font-size: 0.84rem; margin: 0; }
.vc__row     { display: grid; grid-template-columns: 20px 130px 1fr auto; align-items: center; gap: 10px;
               padding: 8px 12px; border-bottom: 1px solid var(--border); cursor: pointer; font-size: 0.84rem; }
.vc__row:last-child { border-bottom: none; }
.vc__row--on { background: var(--surface-2, #f8fafc); }
.vc__row input { width: 16px; height: 16px; }
.vc__row-num { font-weight: 600; font-size: 0.78rem; }
.vc__row-amt { font-weight: 600; }

.vc__totals  { border: 1px solid var(--border); border-radius: var(--radius); padding: 10px 14px; margin: 12px 0; }
.vc__total-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.9rem; }
.vc__total-row--sub { font-size: 0.82rem; color: var(--text-soft); margin-top: 4px; }
.vc__over    { color: var(--danger, #dc2626); }

.form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; }
@media (max-width: 900px) {
  .vc__kpis { grid-template-columns: repeat(2, 1fr); }
  .form-grid-2 { grid-template-columns: 1fr; }
  .vc__row { grid-template-columns: 20px 1fr auto; }
  .vc__row-num { grid-column: 2; }
}
</style>
