<template>
  <div class="page">
    <PageHeader title="Petty Cash" subtitle="Manage cash floats held at each outlet — top up, record disbursements and corrections. Balances stay in step with the ledger and with any petty-cash expenses automatically.">
      <template #actions>
        <button v-if="can('petty-cash.create')" class="ui-btn ui-btn--secondary" @click="openTxn(null)">+ Record Transaction</button>
        <button v-if="can('petty-cash.create')" class="ui-btn ui-btn--primary" @click="openAccountCreate">+ New Fund</button>
      </template>
    </PageHeader>

    <!-- Summary strip -->
    <div class="pc__kpis">
      <div class="pc__kpi ex__kpi--ok">
        <span class="pc__kpi-label">Total Balance</span>
        <span class="pc__kpi-val">{{ fmt(props.summary.total_balance) }}</span>
        <span class="pc__kpi-sub">across active funds</span>
      </div>
      <div class="pc__kpi">
        <span class="pc__kpi-label">Active Funds</span>
        <span class="pc__kpi-val">{{ props.summary.active_funds }}</span>
        <span class="pc__kpi-sub">cash floats</span>
      </div>
      <div class="pc__kpi pc__kpi--danger">
        <span class="pc__kpi-label">Disbursed (mo.)</span>
        <span class="pc__kpi-val">{{ fmt(props.summary.disbursed_this_month) }}</span>
        <span class="pc__kpi-sub">paid out this month</span>
      </div>
      <div class="pc__kpi pc__kpi--info">
        <span class="pc__kpi-label">Topped Up (mo.)</span>
        <span class="pc__kpi-val">{{ fmt(props.summary.topped_up_this_month) }}</span>
        <span class="pc__kpi-sub">added this month</span>
      </div>
    </div>

    <!-- Funds -->
    <h2 class="pc__section">Cash Floats</h2>
    <DataTable :columns="accountColumns" :rows="props.accounts" empty-text="No petty-cash funds yet. Create your first float.">
      <template #cell:name="{ row }">
        <strong>{{ row.name }}</strong>
        <span v-if="!row.is_active" class="ui-badge ui-badge--muted pc__pill">Inactive</span>
      </template>
      <template #cell:current_balance="{ value }"><strong>{{ fmt(value) }}</strong></template>
      <template #cell:custodian_name="{ value }">
        <span v-if="value">{{ value }}</span>
        <span v-else class="pc__muted">—</span>
      </template>
      <template #actions="{ row }">
        <button v-if="can('petty-cash.create')" class="ui-btn ui-btn--secondary ui-btn--sm" @click="openTxn(row)">Add Txn</button>
        <button v-if="can('petty-cash.update')" class="ui-btn ui-btn--ghost ui-btn--sm" @click="openAccountEdit(row)">Edit</button>
        <button v-if="can('petty-cash.delete')" class="ui-btn ui-btn--danger ui-btn--sm" @click="delAccount(row)">Delete</button>
      </template>
    </DataTable>

    <!-- Ledger -->
    <h2 class="pc__section">Ledger</h2>
    <div class="pc__filters">
      <select v-model="accountFilter" class="ui-input" style="width:220px">
        <option value="">All Funds</option>
        <option v-for="a in props.accounts" :key="a.id" :value="a.id">{{ a.name }}</option>
      </select>
      <select v-model="typeFilter" class="ui-input" style="width:170px">
        <option value="">All Types</option>
        <option v-for="t in props.types" :key="t" :value="t">{{ typeLabel(t) }}</option>
      </select>
    </div>

    <DataTable :columns="txnColumns" :rows="transactions" empty-text="No transactions recorded yet.">
      <template #cell:occurred_on="{ value }">{{ fmtDate(value) }}</template>
      <template #cell:type="{ value }">
        <span class="ui-badge" :class="typeClass(value)">{{ typeLabel(value) }}</span>
      </template>
      <template #cell:description="{ row }">
        <span v-if="row.description">{{ row.description }}</span>
        <span v-else class="pc__muted">—</span>
        <span v-if="row.expense_number" class="pc__code">{{ row.expense_number }}</span>
        <span v-else-if="row.voucher_number" class="pc__code">{{ row.voucher_number }}</span>
        <span v-else-if="row.reference" class="pc__code">{{ row.reference }}</span>
      </template>
      <template #cell:amount="{ value }">
        <strong :class="Number(value) < 0 ? 'pc__out' : 'pc__in'">{{ signed(value) }}</strong>
      </template>
      <template #cell:balance_after="{ value }">{{ fmt(value) }}</template>
      <template #actions="{ row }">
        <button
          v-if="can('petty-cash.delete') && !row.expense_id && !row.expense_voucher_id"
          class="ui-btn ui-btn--danger ui-btn--sm"
          @click="delTxn(row)"
        >Delete</button>
        <span v-else-if="row.expense_id" class="pc__muted" style="font-size:0.78rem">via expense</span>
        <span v-else-if="row.expense_voucher_id" class="pc__muted" style="font-size:0.78rem">via voucher</span>
      </template>
    </DataTable>

    <Pagination :paginator="props.transactions" :only="['transactions']" />

    <!-- Fund create / edit -->
    <Modal v-model="showAccount" :title="accForm.id ? 'Edit Fund' : 'New Petty-Cash Fund'" width="620px">
      <div class="form-grid-2">
        <FormField v-model="accForm.name" label="Fund Name *" placeholder="e.g. Front-desk float" :error="accForm.errors.name" />
        <FormField v-model="accForm.branch_id" label="Branch" type="select" :error="accForm.errors.branch_id">
          <option value="">Current Outlet</option>
          <option v-for="branch in props.branches" :key="branch.id" :value="branch.id">{{ branch.name }}</option>
        </FormField>
        <FormField v-model="accForm.custodian_name" label="Custodian" placeholder="Who holds the cash" :error="accForm.errors.custodian_name" />
        <FormField v-model.number="accForm.opening_balance" label="Opening Balance" type="number" step="0.01" :error="accForm.errors.opening_balance" />
      </div>
      <label class="pc__check">
        <input type="checkbox" v-model="accForm.is_active" />
        <span>Active fund</span>
      </label>
      <p v-if="accForm.id" class="pc__hint">Changing the opening balance re-rolls the running balance across the whole ledger.</p>
      <FormField v-model="accForm.notes" label="Notes" type="textarea" :error="accForm.errors.notes" />
      <template #footer>
        <button class="ui-btn ui-btn--ghost" @click="showAccount = false">Cancel</button>
        <button class="ui-btn ui-btn--primary" :disabled="accForm.processing" @click="saveAccount">Save</button>
      </template>
    </Modal>

    <!-- Transaction -->
    <Modal v-model="showTxn" title="Record Transaction" width="520px">
      <FormField v-model="txnForm.petty_cash_account_id" label="Fund *" type="select" :error="txnForm.errors.petty_cash_account_id">
        <option value="" disabled>Select fund</option>
        <option v-for="a in activeAccounts" :key="a.id" :value="a.id">{{ a.name }} ({{ fmt(a.current_balance) }})</option>
      </FormField>
      <div class="form-grid-2">
        <FormField v-model="txnForm.type" label="Type *" type="select" :error="txnForm.errors.type">
          <option v-for="t in props.types" :key="t" :value="t">{{ typeLabel(t) }}</option>
        </FormField>
        <FormField v-model.number="txnForm.amount" label="Amount *" type="number" step="0.01" :error="txnForm.errors.amount" />
        <FormField v-model="txnForm.occurred_on" label="Date" type="date" :error="txnForm.errors.occurred_on" />
        <FormField v-model="txnForm.reference" label="Reference" :error="txnForm.errors.reference" />
      </div>
      <FormField v-model="txnForm.description" label="Details" placeholder="What was this for?" :error="txnForm.errors.description" />
      <p class="pc__hint">{{ txnHint }}</p>
      <template #footer>
        <button class="ui-btn ui-btn--ghost" @click="showTxn = false">Cancel</button>
        <button class="ui-btn ui-btn--primary" :disabled="txnForm.processing" @click="saveTxn">Record</button>
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
  accounts:     { type: Array,  default: () => [] },
  transactions: { type: Object, default: () => ({ data: [] }) },
  branches:     { type: Array,  default: () => [] },
  types:        { type: Array,  default: () => [] },
  summary:      { type: Object, default: () => ({ total_balance: 0, active_funds: 0, disbursed_this_month: 0, topped_up_this_month: 0 }) },
  filters:      { type: Object, default: () => ({}) },
});

const accountColumns = [
  { key: 'name',           label: 'Fund' },
  { key: 'branch_name',    label: 'Branch' },
  { key: 'custodian_name', label: 'Custodian' },
  { key: 'current_balance', label: 'Balance' },
];

const txnColumns = [
  { key: 'occurred_on',   label: 'Date' },
  { key: 'account_name',  label: 'Fund' },
  { key: 'type',          label: 'Type' },
  { key: 'description',   label: 'Details' },
  { key: 'amount',        label: 'Amount' },
  { key: 'balance_after', label: 'Balance' },
];

const transactions = computed(() => props.transactions?.data ?? []);
const activeAccounts = computed(() => props.accounts.filter(a => a.is_active));

const accountFilter = ref(props.filters?.account_id ?? '');
const typeFilter = ref(props.filters?.type ?? '');

let timer = null;
const reload = () => router.get('/finance/petty-cash',
  { account_id: accountFilter.value || undefined, type: typeFilter.value || undefined },
  { preserveState: true, preserveScroll: true, replace: true, only: ['transactions', 'filters'] });
watch([accountFilter, typeFilter], () => { clearTimeout(timer); timer = setTimeout(reload, 300); });

const typeLabel = t => ({ top_up: 'Top-up', disbursement: 'Disbursement', adjustment: 'Adjustment' }[t] ?? t);
const typeClass = t => ({
  top_up: 'ui-badge--success', disbursement: 'ui-badge--warning', adjustment: 'ui-badge--info',
}[t] ?? 'ui-badge--muted');

// ── Fund modal ──────────────────────────────────────────────────────────────
const accDefaults = () => ({
  id: null, name: '', branch_id: '', custodian_name: '', opening_balance: 0, is_active: true, notes: '',
});
const showAccount = ref(false);
const accForm = useForm(accDefaults());

const openAccountCreate = () => {
  accForm.defaults(accDefaults());
  accForm.reset(); accForm.clearErrors();
  showAccount.value = true;
};
const openAccountEdit = row => {
  accForm.id = row.id;
  accForm.name = row.name ?? '';
  accForm.branch_id = row.branch_id ?? '';
  accForm.custodian_name = row.custodian_name ?? '';
  accForm.opening_balance = row.opening_balance ?? 0;
  accForm.is_active = !!row.is_active;
  accForm.notes = row.notes ?? '';
  accForm.clearErrors();
  showAccount.value = true;
};
const saveAccount = () => {
  const opts = { preserveScroll: true, onSuccess: () => (showAccount.value = false) };
  if (accForm.id) accForm.put(`/finance/petty-cash/accounts/${accForm.id}`, opts);
  else accForm.post('/finance/petty-cash/accounts', opts);
};
const delAccount = async row => {
  if (!(await confirmDialog(`Delete fund "${row.name}"?`))) return;
  router.delete(`/finance/petty-cash/accounts/${row.id}`, { preserveScroll: true });
};

// ── Transaction modal ─────────────────────────────────────────────────────────
const today = () => new Date().toISOString().slice(0, 10);

const txnForm = useForm({ petty_cash_account_id: '', type: 'top_up', amount: 0, occurred_on: today(), reference: '', description: '' });
const showTxn = ref(false);
const openTxn = row => {
  txnForm.reset(); txnForm.clearErrors();
  txnForm.occurred_on = today();
  txnForm.petty_cash_account_id = row?.id ?? (activeAccounts.value[0]?.id ?? '');
  showTxn.value = true;
};
const saveTxn = () => txnForm.post('/finance/petty-cash/transactions',
  { preserveScroll: true, onSuccess: () => (showTxn.value = false) });

const delTxn = async row => {
  if (!(await confirmDialog(`Delete this ${typeLabel(row.type)} transaction of ${signed(row.amount)}? The fund balance will be recalculated.`))) return;
  router.delete(`/finance/petty-cash/transactions/${row.id}`, { preserveScroll: true });
};

const txnHint = computed(() => {
  if (txnForm.type === 'top_up') return 'Adds the amount to the fund.';
  if (txnForm.type === 'disbursement') return 'Deducts the amount from the fund.';
  return 'Correction — enter a negative amount to reduce the balance.';
});

const fmt     = v => 'Rs ' + Number(v || 0).toLocaleString('en-PK', { minimumFractionDigits: 2 });
const signed  = v => (Number(v) < 0 ? '− ' : '+ ') + 'Rs ' + Math.abs(Number(v || 0)).toLocaleString('en-PK', { minimumFractionDigits: 2 });
const fmtDate = v => v ? new Date(v).toLocaleDateString() : '—';
</script>

<style scoped>
.pc__kpis    { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 18px; }
.pc__kpi     { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px 16px; display: flex; flex-direction: column; gap: 2px; }
.pc__kpi--info   { border-left: 3px solid var(--brand, #6366f1); }
.pc__kpi--danger { border-left: 3px solid var(--danger, #dc2626); }
.ex__kpi--ok     { border-left: 3px solid var(--success, #16a34a); }
.pc__kpi-label   { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-soft); font-weight: 600; }
.pc__kpi-val     { font-size: 1.5rem; font-weight: 700; }
.pc__kpi-sub     { font-size: 0.72rem; color: var(--text-soft); }
.pc__section { font-size: 1rem; font-weight: 700; margin: 22px 0 12px; }
.pc__filters { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.pc__muted   { color: var(--text-soft); }
.pc__code    { color: var(--text-soft); font-size: 0.76rem; margin-left: 8px; }
.pc__pill    { margin-left: 6px; }
.pc__hint    { font-size: 0.78rem; color: var(--text-soft); margin: 4px 0 12px; }
.pc__in      { color: var(--success, #16a34a); }
.pc__out     { color: var(--danger, #dc2626); }
.pc__check   { display: flex; align-items: center; gap: 8px; margin: 4px 0 12px; font-size: 0.9rem; cursor: pointer; }
.pc__check input { width: 16px; height: 16px; }
.form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; }
@media (max-width: 900px) { .pc__kpis { grid-template-columns: repeat(2, 1fr); } .form-grid-2 { grid-template-columns: 1fr; } }
</style>
