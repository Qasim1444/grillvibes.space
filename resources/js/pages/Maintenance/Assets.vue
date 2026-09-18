<template>
  <div class="page">
    <PageHeader title="Assets" subtitle="Your equipment register — ovens, refrigeration, POS hardware and more, with warranty and preventive-service tracking per outlet.">
      <template #actions>
        <button v-if="can('maintenance.assets.create')" class="ui-btn ui-btn--primary" @click="openCreate">+ New Asset</button>
      </template>
    </PageHeader>

    <!-- Summary strip -->
    <div class="am__kpis">
      <div class="am__kpi">
        <span class="am__kpi-label">Total Assets</span>
        <span class="am__kpi-val">{{ props.summary.total }}</span>
        <span class="am__kpi-sub">in the register</span>
      </div>
      <div class="am__kpi">
        <span class="am__kpi-label">Active</span>
        <span class="am__kpi-val">{{ props.summary.active }}</span>
        <span class="am__kpi-sub">in service</span>
      </div>
      <div class="am__kpi am__kpi--info">
        <span class="am__kpi-label">Under Maintenance</span>
        <span class="am__kpi-val">{{ props.summary.under_maintenance }}</span>
        <span class="am__kpi-sub">currently down</span>
      </div>
      <button type="button" class="am__kpi am__kpi--warn am__kpi--btn" :class="{ 'am__kpi--on': flag === 'due' }" @click="toggleFlag('due')">
        <span class="am__kpi-label">Service Due</span>
        <span class="am__kpi-val">{{ props.summary.maintenance_due }}</span>
        <span class="am__kpi-sub">overdue or flagged</span>
      </button>
      <button type="button" class="am__kpi am__kpi--danger am__kpi--btn" :class="{ 'am__kpi--on': flag === 'warranty' }" @click="toggleFlag('warranty')">
        <span class="am__kpi-label">Warranty ≤ 30d</span>
        <span class="am__kpi-val">{{ props.summary.warranty_expiring }}</span>
        <span class="am__kpi-sub">expiring soon</span>
      </button>
    </div>

    <!-- Filters -->
    <div class="am__filters">
      <input v-model="search" class="ui-input am__search" placeholder="Search name / code / serial…" />
      <select v-model="categoryFilter" class="ui-input" style="width:180px">
        <option value="">All Categories</option>
        <option v-for="c in props.categories" :key="c" :value="c">{{ catLabel(c) }}</option>
      </select>
      <select v-model="statusFilter" class="ui-input" style="width:170px">
        <option value="">All Statuses</option>
        <option v-for="s in props.statuses" :key="s" :value="s">{{ statusLabel(s) }}</option>
      </select>
      <select v-model="branchFilter" class="ui-input" style="width:190px">
        <option value="">All Branches</option>
        <option v-for="branch in props.branches" :key="branch.id" :value="branch.id">{{ branch.name }}</option>
      </select>
      <select v-model="flag" class="ui-input" style="width:180px">
        <option value="">All Service Status</option>
        <option value="due">Service Due</option>
        <option value="warranty">Warranty ≤ 30d</option>
      </select>
    </div>

    <DataTable :columns="columns" :rows="assets" index empty-text="No assets found. Add your first piece of equipment.">
      <template #cell:name="{ row }">
        <strong>{{ row.name }}</strong>
        <span class="am__code">{{ row.asset_code }}</span>
        <span v-if="row.location" class="am__muted"> · {{ row.location }}</span>
      </template>
      <template #cell:category="{ value }">{{ catLabel(value) }}</template>
      <template #cell:warranty_expiry="{ row }">
        <span v-if="row.warranty_expiry">
          {{ fmtDate(row.warranty_expiry) }}
          <span v-if="row.is_warranty_expiring" class="ui-badge ui-badge--danger am__pill">Expiring</span>
        </span>
        <span v-else class="am__muted">—</span>
      </template>
      <template #cell:next_maintenance_date="{ row }">
        <span v-if="row.next_maintenance_date">
          {{ fmtDate(row.next_maintenance_date) }}
          <span v-if="row.is_maintenance_due" class="ui-badge ui-badge--warning am__pill">Due</span>
        </span>
        <span v-else class="am__muted">—</span>
      </template>
      <template #cell:purchase_cost="{ value }">{{ fmt(value) }}</template>
      <template #cell:status="{ value }">
        <span class="ui-badge" :class="statusClass(value)">{{ statusLabel(value) }}</span>
      </template>
      <template #actions="{ row }">
        <button v-if="can('maintenance.assets.update')" class="ui-btn ui-btn--ghost ui-btn--sm" @click="openEdit(row)">Edit</button>
        <button v-if="can('maintenance.assets.delete')" class="ui-btn ui-btn--danger ui-btn--sm" @click="del(row)">Delete</button>
      </template>
    </DataTable>

    <Pagination :paginator="props.assets" :only="['assets']" />

    <!-- Create / Edit -->
    <Modal v-model="showModal" :title="form.id ? 'Edit Asset' : 'New Asset'" width="720px">
      <div class="form-grid-2">
        <FormField v-model="form.name" label="Name *" placeholder="e.g. Rational Combi Oven" :error="form.errors.name" />
        <FormField v-model="form.category" label="Category *" type="select" :error="form.errors.category">
          <option v-for="c in props.categories" :key="c" :value="c">{{ catLabel(c) }}</option>
        </FormField>
        <FormField v-model="form.branch_id" label="Branch" type="select" :error="form.errors.branch_id">
          <option value="">Current Outlet</option>
          <option v-for="branch in props.branches" :key="branch.id" :value="branch.id">{{ branch.name }}</option>
        </FormField>
        <FormField v-model="form.location" label="Location" placeholder="e.g. Main Kitchen" :error="form.errors.location" />
        <FormField v-model="form.serial_number" label="Serial Number" :error="form.errors.serial_number" />
        <FormField v-model="form.vendor_id" label="Vendor / Supplier" type="select" :error="form.errors.vendor_id">
          <option value="">— None —</option>
          <option v-for="v in props.vendors" :key="v.id" :value="v.id">{{ v.name }}</option>
        </FormField>
        <FormField v-model="form.purchase_date" label="Purchase Date" type="date" :error="form.errors.purchase_date" />
        <FormField v-model.number="form.purchase_cost" label="Purchase Cost" type="number" step="0.01" :error="form.errors.purchase_cost" />
        <FormField v-model="form.warranty_expiry" label="Warranty Expiry" type="date" :error="form.errors.warranty_expiry" />
        <FormField v-model="form.status" label="Status" type="select" :error="form.errors.status">
          <option v-for="s in props.statuses" :key="s" :value="s">{{ statusLabel(s) }}</option>
        </FormField>
        <FormField v-model.number="form.maintenance_interval_days" label="Service Interval (days)" type="number" step="1" placeholder="e.g. 90" :error="form.errors.maintenance_interval_days" />
        <FormField v-model="form.last_maintenance_date" label="Last Serviced" type="date" :error="form.errors.last_maintenance_date" />
      </div>
      <p class="am__hint">Next service is calculated from the last-serviced date (or purchase date) plus the interval.</p>
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
  assets:     { type: Object, default: () => ({ data: [] }) },
  branches:   { type: Array,  default: () => [] },
  vendors:    { type: Array,  default: () => [] },
  categories: { type: Array,  default: () => [] },
  statuses:   { type: Array,  default: () => [] },
  summary:    { type: Object, default: () => ({ total: 0, active: 0, under_maintenance: 0, maintenance_due: 0, warranty_expiring: 0 }) },
  filters:    { type: Object, default: () => ({}) },
});

const columns = [
  { key: 'name',                  label: 'Asset' },
  { key: 'category',              label: 'Category' },
  { key: 'branch_name',           label: 'Branch' },
  { key: 'vendor_name',           label: 'Vendor' },
  { key: 'warranty_expiry',       label: 'Warranty' },
  { key: 'next_maintenance_date', label: 'Next Service' },
  { key: 'purchase_cost',         label: 'Cost' },
  { key: 'status',                label: 'Status' },
];

const assets = computed(() => props.assets?.data ?? []);
const search = ref(props.filters?.search ?? '');
const categoryFilter = ref(props.filters?.category ?? '');
const statusFilter = ref(props.filters?.status ?? '');
const branchFilter = ref(props.filters?.branch_id ?? '');
const flag = ref(props.filters?.flag ?? '');

let timer = null;
const reload = () => router.get('/maintenance/assets',
  {
    search: search.value || undefined,
    category: categoryFilter.value || undefined,
    status: statusFilter.value || undefined,
    branch_id: branchFilter.value || undefined,
    flag: flag.value || undefined,
  },
  { preserveState: true, preserveScroll: true, replace: true, only: ['assets', 'summary', 'filters'] });
watch([search, categoryFilter, statusFilter, branchFilter, flag], () => { clearTimeout(timer); timer = setTimeout(reload, 300); });

const toggleFlag = f => { flag.value = flag.value === f ? '' : f; };

const CATEGORY_LABELS = {
  kitchen_equipment: 'Kitchen Equipment', refrigeration: 'Refrigeration', hvac: 'HVAC',
  pos_hardware: 'POS Hardware', furniture: 'Furniture', vehicle: 'Vehicle',
  utility: 'Utility', other: 'Other',
};
const catLabel = c => CATEGORY_LABELS[c] ?? c;

const statusLabel = s => ({
  active: 'Active', service_due: 'Service Due', under_maintenance: 'Under Maintenance', retired: 'Retired', disposed: 'Disposed',
}[s] ?? s);
const statusClass = s => ({
  active: 'ui-badge--success', service_due: 'ui-badge--warning', under_maintenance: 'ui-badge--info',
  retired: 'ui-badge--muted', disposed: 'ui-badge--danger',
}[s] ?? 'ui-badge--muted');

const defaults = () => ({
  id: null, name: '', category: 'kitchen_equipment', branch_id: '', location: '',
  serial_number: '', vendor_id: '', purchase_date: '', purchase_cost: 0,
  warranty_expiry: '', status: 'active', maintenance_interval_days: '',
  last_maintenance_date: '', notes: '',
});

const showModal = ref(false);
const form = useForm(defaults());

const openCreate = () => {
  form.defaults(defaults());
  form.reset(); form.clearErrors();
  showModal.value = true;
};

const openEdit = row => {
  form.id = row.id;
  form.name = row.name ?? '';
  form.category = row.category ?? 'other';
  form.branch_id = row.branch_id ?? '';
  form.location = row.location ?? '';
  form.serial_number = row.serial_number ?? '';
  form.vendor_id = row.vendor_id ?? '';
  form.purchase_date = date(row.purchase_date);
  form.purchase_cost = row.purchase_cost ?? 0;
  form.warranty_expiry = date(row.warranty_expiry);
  form.status = row.status ?? 'active';
  form.maintenance_interval_days = row.maintenance_interval_days ?? '';
  form.last_maintenance_date = date(row.last_maintenance_date);
  form.notes = row.notes ?? '';
  form.clearErrors();
  showModal.value = true;
};

const save = () => {
  const opts = { preserveScroll: true, onSuccess: () => (showModal.value = false) };
  if (form.id) form.put(`/maintenance/assets/${form.id}`, opts);
  else form.post('/maintenance/assets', opts);
};

const del = async row => {
  if (!(await confirmDialog(`Delete asset "${row.name}"? Its maintenance history will be removed too.`))) return;
  router.delete(`/maintenance/assets/${row.id}`, { preserveScroll: true });
};

const fmt     = v => 'Rs ' + Number(v || 0).toLocaleString('en-PK', { minimumFractionDigits: 2 });
const fmtDate = v => v ? new Date(v).toLocaleDateString() : '—';
// Normalise an incoming date (ISO or date-only) to a YYYY-MM-DD value for <input type=date>.
const date    = v => v ? String(v).slice(0, 10) : '';
</script>

<style scoped>
.am__kpis    { display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; margin-bottom: 18px; }
.am__kpi     { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px 16px; display: flex; flex-direction: column; gap: 2px; text-align: left; }
.am__kpi--info   { border-left: 3px solid var(--brand, #6366f1); }
.am__kpi--warn   { border-left: 3px solid var(--warning, #d97706); }
.am__kpi--danger { border-left: 3px solid var(--danger, #dc2626); }
.am__kpi--btn    { cursor: pointer; font-family: inherit; transition: box-shadow 0.15s ease, border-color 0.15s ease; }
.am__kpi--btn:hover { box-shadow: var(--shadow, 0 2px 8px rgba(0,0,0,0.06)); }
.am__kpi--on     { box-shadow: 0 0 0 2px var(--brand, #6366f1) inset; }
.am__kpi-label   { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-soft); font-weight: 600; }
.am__kpi-val     { font-size: 1.5rem; font-weight: 700; }
.am__kpi-sub     { font-size: 0.72rem; color: var(--text-soft); }
.am__filters { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.am__search  { flex: 1; max-width: 320px; }
.am__muted   { color: var(--text-soft); font-size: 0.82rem; }
.am__code    { color: var(--text-soft); font-size: 0.76rem; margin-left: 8px; }
.am__pill    { margin-left: 6px; }
.am__hint    { font-size: 0.78rem; color: var(--text-soft); margin: 4px 0 12px; }
.form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; }
@media (max-width: 1100px) { .am__kpis { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 700px)  { .am__kpis { grid-template-columns: repeat(2, 1fr); } .form-grid-2 { grid-template-columns: 1fr; } }
</style>
