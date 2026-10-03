<template>
  <div class="page">
    <PageHeader title="Expenses" subtitle="Record what the business spends — rent, utilities, supplies, repairs and more — against vendors or petty cash, with a simple approve / reject flow per outlet.">
      <template #actions>
        <button v-if="can('expenses.create')" class="ui-btn ui-btn--primary" @click="openCreate">+ New Expense</button>
      </template>
    </PageHeader>

    <!-- Summary strip -->
    <div class="ex__kpis">
      <div class="ex__kpi ex__kpi--warn">
        <span class="ex__kpi-label">Pending</span>
        <span class="ex__kpi-val">{{ props.summary.pending }}</span>
        <span class="ex__kpi-sub">awaiting approval</span>
      </div>
      <div class="ex__kpi">
        <span class="ex__kpi-label">Pending Amount</span>
        <span class="ex__kpi-val">{{ fmt(props.summary.pending_amount) }}</span>
        <span class="ex__kpi-sub">to be approved</span>
      </div>
      <div class="ex__kpi ex__kpi--ok">
        <span class="ex__kpi-label">Approved (mo.)</span>
        <span class="ex__kpi-val">{{ fmt(props.summary.approved_this_month) }}</span>
        <span class="ex__kpi-sub">this month</span>
      </div>
      <div class="ex__kpi ex__kpi--info">
        <span class="ex__kpi-label">Total (mo.)</span>
        <span class="ex__kpi-val">{{ fmt(props.summary.total_this_month) }}</span>
        <span class="ex__kpi-sub">all expenses this month</span>
      </div>
    </div>

    <!-- Filters -->
    <div class="ex__filters">
      <input v-model="search" class="ui-input ex__search" placeholder="Search # / description / payee…" />
      <select v-model="categoryFilter" class="ui-input" style="width:190px">
        <option value="">All Categories</option>
        <option v-for="c in props.categories" :key="c" :value="c">{{ catLabel(c) }}</option>
      </select>
      <select v-model="statusFilter" class="ui-input" style="width:150px">
        <option value="">All Statuses</option>
        <option v-for="s in props.statuses" :key="s" :value="s">{{ statusLabel(s) }}</option>
      </select>
      <select v-model="paidViaFilter" class="ui-input" style="width:160px">
        <option value="">All Payment Methods</option>
        <option v-for="p in props.paidVia" :key="p" :value="p">{{ paidViaLabel(p) }}</option>
      </select>
      <select v-model="branchFilter" class="ui-input" style="width:180px">
        <option value="">All Branches</option>
        <option v-for="branch in props.branches" :key="branch.id" :value="branch.id">{{ branch.name }}</option>
      </select>
    </div>

    <DataTable :columns="columns" :rows="expenses" index empty-text="No expenses found. Record your first expense.">
      <template #cell:expense_date="{ value }">{{ fmtDate(value) }}</template>
      <template #cell:category="{ value }">
        <span class="ui-badge ui-badge--muted">{{ catLabel(value) }}</span>
      </template>
      <template #cell:payee="{ row }">
        <span v-if="row.vendor_name || row.payee">{{ row.vendor_name || row.payee }}</span>
        <span v-else class="ex__muted">—</span>
      </template>
      <template #cell:amount="{ value }"><strong>{{ fmt(value) }}</strong></template>
      <template #cell:paid_via="{ row }">
        {{ paidViaLabel(row.paid_via) }}
        <span v-if="row.account_name" class="ex__code">{{ row.account_name }}</span>
      </template>
      <template #cell:status="{ row }">
        <span class="ui-badge" :class="statusClass(row.status)">{{ statusLabel(row.status) }}</span>
        <span v-if="row.voucher_number" class="ui-badge ui-badge--info ex__pill" :title="`Claimed on voucher ${row.voucher_number}`">
          Claimed · {{ row.voucher_number }}
        </span>
      </template>
      <template #actions="{ row }">
        <button v-if="can('expenses.approve') && row.status === 'pending'"
          class="ui-btn ui-btn--secondary ui-btn--sm" @click="approve(row)">Approve</button>
        <button v-if="can('expenses.approve') && row.status === 'pending'"
          class="ui-btn ui-btn--ghost ui-btn--sm" @click="reject(row)">Reject</button>
        <template v-if="!row.expense_voucher_id">
          <button v-if="can('expenses.update')" class="ui-btn ui-btn--ghost ui-btn--sm" @click="openEdit(row)">Edit</button>
          <button v-if="can('expenses.delete')" class="ui-btn ui-btn--danger ui-btn--sm" @click="del(row)">Delete</button>
        </template>
        <span v-else class="ex__muted" style="font-size:0.78rem">on voucher</span>
      </template>
    </DataTable>

    <Pagination :paginator="props.expenses" :only="['expenses']" />

    <!-- Create / Edit -->
    <Modal v-model="showModal" :title="form.id ? 'Edit Expense' : 'New Expense'" width="720px">
      <FormField v-model="form.description" label="Description *" placeholder="e.g. October electricity bill" :error="form.errors.description" />
      <div class="form-grid-2">
        <FormField v-model="form.category" label="Category *" type="select" :error="form.errors.category">
          <option v-for="c in props.categories" :key="c" :value="c">{{ catLabel(c) }}</option>
        </FormField>
        <FormField v-model="form.branch_id" label="Branch" type="select" :error="form.errors.branch_id">
          <option value="">Current Outlet</option>
          <option v-for="branch in props.branches" :key="branch.id" :value="branch.id">{{ branch.name }}</option>
        </FormField>
        <FormField v-model="form.expense_date" label="Expense Date *" type="date" :error="form.errors.expense_date" />
        <FormField v-model.number="form.amount" label="Amount *" type="number" step="0.01" :error="form.errors.amount" />
        <FormField v-model="form.paid_via" label="Paid Via *" type="select" :error="form.errors.paid_via">
          <option v-for="p in props.paidVia" :key="p" :value="p">{{ paidViaLabel(p) }}</option>
        </FormField>
        <FormField v-if="form.paid_via === 'petty_cash'" v-model="form.petty_cash_account_id" label="Petty-Cash Fund *" type="select" :error="form.errors.petty_cash_account_id">
          <option value="" disabled>Select fund</option>
          <option v-for="a in props.accounts" :key="a.id" :value="a.id">{{ a.name }}</option>
        </FormField>
        <FormField v-model="form.vendor_id" label="Vendor" type="select" :error="form.errors.vendor_id">
          <option value="">— None —</option>
          <option v-for="v in props.vendors" :key="v.id" :value="v.id">{{ v.name }}</option>
        </FormField>
        <FormField v-model="form.payee" label="Payee" placeholder="Free-text (if no vendor)" :error="form.errors.payee" />
        <FormField v-model="form.reference" label="Reference / Bill No." :error="form.errors.reference" />
      </div>
      <p v-if="form.paid_via === 'petty_cash'" class="ex__hint">Paying from a fund posts a matching disbursement to its petty-cash ledger — unless the expense is claimed on a voucher, in which case the voucher's combined line covers it instead.</p>
      <FormField v-model="form.notes" label="Notes" type="textarea" :error="form.errors.notes" />

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
  expenses:   { type: Object, default: () => ({ data: [] }) },
  branches:   { type: Array,  default: () => [] },
  vendors:    { type: Array,  default: () => [] },
  accounts:   { type: Array,  default: () => [] },
  categories: { type: Array,  default: () => [] },
  paidVia:    { type: Array,  default: () => [] },
  statuses:   { type: Array,  default: () => [] },
  summary:    { type: Object, default: () => ({ pending: 0, pending_amount: 0, approved_this_month: 0, total_this_month: 0 }) },
  filters:    { type: Object, default: () => ({}) },
});

const columns = [
  { key: 'expense_number', label: 'Expense #' },
  { key: 'expense_date',   label: 'Date' },
  { key: 'category',       label: 'Category' },
  { key: 'payee',          label: 'Payee / Vendor' },
  { key: 'amount',         label: 'Amount' },
  { key: 'paid_via',       label: 'Paid Via' },
  { key: 'status',         label: 'Status' },
];

const expenses = computed(() => props.expenses?.data ?? []);
const search = ref(props.filters?.search ?? '');
const categoryFilter = ref(props.filters?.category ?? '');
const statusFilter = ref(props.filters?.status ?? '');
const paidViaFilter = ref(props.filters?.paid_via ?? '');
const branchFilter = ref(props.filters?.branch_id ?? '');

let timer = null;
const reload = () => router.get('/finance/expenses',
  {
    search: search.value || undefined,
    category: categoryFilter.value || undefined,
    status: statusFilter.value || undefined,
    paid_via: paidViaFilter.value || undefined,
    branch_id: branchFilter.value || undefined,
  },
  { preserveState: true, preserveScroll: true, replace: true, only: ['expenses', 'summary', 'filters'] });
watch([search, categoryFilter, statusFilter, paidViaFilter, branchFilter], () => { clearTimeout(timer); timer = setTimeout(reload, 300); });

const CATEGORY_LABELS = {
  rent: 'Rent', utilities: 'Utilities', salaries: 'Salaries', supplies: 'Supplies',
  repairs_maintenance: 'Repairs & Maintenance', marketing: 'Marketing', transport: 'Transport',
  licenses_fees: 'Licenses & Fees', bank_charges: 'Bank Charges', misc: 'Miscellaneous',
};
const catLabel = c => CATEGORY_LABELS[c] ?? c;

const paidViaLabel = p => ({ cash: 'Cash', bank: 'Bank', card: 'Card', petty_cash: 'Petty Cash' }[p] ?? p);

const statusLabel = s => ({ pending: 'Pending', approved: 'Approved', rejected: 'Rejected' }[s] ?? s);
const statusClass = s => ({
  pending: 'ui-badge--warning', approved: 'ui-badge--success', rejected: 'ui-badge--danger',
}[s] ?? 'ui-badge--muted');

const today = () => new Date().toISOString().slice(0, 10);

const defaults = () => ({
  id: null, category: 'supplies', branch_id: '', vendor_id: '', payee: '',
  expense_date: today(), amount: 0, paid_via: 'cash', petty_cash_account_id: '',
  reference: '', description: '', notes: '',
});

const showModal = ref(false);
const form = useForm(defaults());

// Clear the fund picker when the payment method isn't petty cash.
watch(() => form.paid_via, v => { if (v !== 'petty_cash') form.petty_cash_account_id = ''; });

const openCreate = () => {
  form.defaults(defaults());
  form.reset(); form.clearErrors();
  showModal.value = true;
};

const openEdit = row => {
  form.id = row.id;
  form.category = row.category ?? 'misc';
  form.branch_id = row.branch_id ?? '';
  form.vendor_id = row.vendor_id ?? '';
  form.payee = row.payee ?? '';
  form.expense_date = date(row.expense_date);
  form.amount = row.amount ?? 0;
  form.paid_via = row.paid_via ?? 'cash';
  form.petty_cash_account_id = row.petty_cash_account_id ?? '';
  form.reference = row.reference ?? '';
  form.description = row.description ?? '';
  form.notes = row.notes ?? '';
  form.clearErrors();
  showModal.value = true;
};

const save = () => {
  const opts = { preserveScroll: true, onSuccess: () => (showModal.value = false) };
  if (form.id) form.put(`/finance/expenses/${form.id}`, opts);
  else form.post('/finance/expenses', opts);
};

const approve = row => router.put(`/finance/expenses/${row.id}/approve`, {}, { preserveScroll: true });
const reject = async row => {
  if (!(await confirmDialog(`Reject expense ${row.expense_number}?`))) return;
  router.put(`/finance/expenses/${row.id}/reject`, {}, { preserveScroll: true });
};

const del = async row => {
  if (!(await confirmDialog(`Delete expense ${row.expense_number}? Any petty-cash entry it created will be reversed.`))) return;
  router.delete(`/finance/expenses/${row.id}`, { preserveScroll: true });
};

const fmt     = v => 'Rs ' + Number(v || 0).toLocaleString('en-PK', { minimumFractionDigits: 2 });
const fmtDate = v => v ? new Date(v).toLocaleDateString() : '—';
const date    = v => v ? String(v).slice(0, 10) : '';
</script>

<style scoped>
.ex__kpis    { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 18px; }
.ex__kpi     { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px 16px; display: flex; flex-direction: column; gap: 2px; }
.ex__kpi--warn   { border-left: 3px solid var(--warning, #d97706); }
.ex__kpi--ok     { border-left: 3px solid var(--success, #16a34a); }
.ex__kpi--info   { border-left: 3px solid var(--brand, #6366f1); }
.ex__kpi-label   { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-soft); font-weight: 600; }
.ex__kpi-val     { font-size: 1.5rem; font-weight: 700; }
.ex__kpi-sub     { font-size: 0.72rem; color: var(--text-soft); }
.ex__filters { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.ex__search  { flex: 1; max-width: 300px; }
.ex__muted   { color: var(--text-soft); }
.ex__code    { color: var(--text-soft); font-size: 0.76rem; margin-left: 8px; }
.ex__pill    { margin-left: 6px; }
.ex__hint    { font-size: 0.78rem; color: var(--text-soft); margin: 4px 0 12px; }
.form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; }
@media (max-width: 900px) { .ex__kpis { grid-template-columns: repeat(2, 1fr); } .form-grid-2 { grid-template-columns: 1fr; } }
</style>
