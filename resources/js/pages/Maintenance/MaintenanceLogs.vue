<template>
  <div class="page">
    <PageHeader title="Maintenance Logs" subtitle="Schedule preventive services, log repairs and inspections, and complete work orders — the asset's status and next-service date update automatically.">
      <template #actions>
        <button v-if="can('maintenance.logs.create')" class="ui-btn ui-btn--primary" @click="openCreate">+ Log Maintenance</button>
      </template>
    </PageHeader>

    <!-- Summary strip -->
    <div class="ml__kpis">
      <div class="ml__kpi">
        <span class="ml__kpi-label">Scheduled</span>
        <span class="ml__kpi-val">{{ props.summary.scheduled }}</span>
        <span class="ml__kpi-sub">awaiting work</span>
      </div>
      <div class="ml__kpi ml__kpi--info">
        <span class="ml__kpi-label">In Progress</span>
        <span class="ml__kpi-val">{{ props.summary.in_progress }}</span>
        <span class="ml__kpi-sub">being serviced now</span>
      </div>
      <div class="ml__kpi ml__kpi--ok">
        <span class="ml__kpi-label">Completed (mo.)</span>
        <span class="ml__kpi-val">{{ props.summary.completed_this_month }}</span>
        <span class="ml__kpi-sub">this month</span>
      </div>
      <div class="ml__kpi">
        <span class="ml__kpi-label">Cost (mo.)</span>
        <span class="ml__kpi-val">{{ fmt(props.summary.cost_this_month) }}</span>
        <span class="ml__kpi-sub">completed this month</span>
      </div>
    </div>

    <!-- Filters -->
    <div class="ml__filters">
      <input v-model="search" class="ui-input ml__search" placeholder="Search # / asset / description…" />
      <select v-model="assetFilter" class="ui-input" style="width:200px">
        <option value="">All Assets</option>
        <option v-for="a in props.assets" :key="a.id" :value="a.id">{{ a.name }}</option>
      </select>
      <select v-model="typeFilter" class="ui-input" style="width:150px">
        <option value="">All Types</option>
        <option v-for="t in props.types" :key="t" :value="t">{{ titleize(t) }}</option>
      </select>
      <select v-model="statusFilter" class="ui-input" style="width:160px">
        <option value="">All Statuses</option>
        <option v-for="s in props.statuses" :key="s" :value="s">{{ statusLabel(s) }}</option>
      </select>
      <select v-model="branchFilter" class="ui-input" style="width:180px">
        <option value="">All Branches</option>
        <option v-for="branch in props.branches" :key="branch.id" :value="branch.id">{{ branch.name }}</option>
      </select>
    </div>

    <DataTable :columns="columns" :rows="records" index empty-text="No maintenance records yet.">
      <template #cell:asset="{ row }">
        <strong>{{ row.asset_name }}</strong>
        <span class="ml__code">{{ row.asset_code }}</span>
      </template>
      <template #cell:type="{ value }">
        <span class="ui-badge ui-badge--muted">{{ titleize(value) }}</span>
      </template>
      <template #cell:scheduled_date="{ value }">{{ fmtDate(value) }}</template>
      <template #cell:completed_date="{ value }">{{ fmtDate(value) }}</template>
      <template #cell:cost="{ value }">{{ fmt(value) }}</template>
      <template #cell:performed_by="{ row }">
        <span v-if="row.performed_by || row.vendor_name">{{ row.performed_by || row.vendor_name }}</span>
        <span v-else class="ml__muted">—</span>
      </template>
      <template #cell:status="{ value }">
        <span class="ui-badge" :class="statusClass(value)">{{ statusLabel(value) }}</span>
      </template>
      <template #actions="{ row }">
        <button v-if="can('maintenance.logs.update') && !['completed','cancelled'].includes(row.status)"
          class="ui-btn ui-btn--secondary ui-btn--sm" @click="openComplete(row)">Complete</button>
        <button v-if="can('maintenance.logs.update')" class="ui-btn ui-btn--ghost ui-btn--sm" @click="openEdit(row)">Edit</button>
        <button v-if="can('maintenance.logs.delete')" class="ui-btn ui-btn--danger ui-btn--sm" @click="del(row)">Delete</button>
      </template>
    </DataTable>

    <Pagination :paginator="props.records" :only="['records']" />

    <!-- Create / Edit -->
    <Modal v-model="showModal" :title="form.id ? 'Edit Maintenance Record' : 'Log Maintenance'" width="680px">
      <FormField v-model="form.asset_id" label="Asset *" type="select" :error="form.errors.asset_id">
        <option value="" disabled>Select asset</option>
        <option v-for="a in props.assets" :key="a.id" :value="a.id">{{ a.name }} ({{ a.asset_code }})</option>
      </FormField>
      <FormField v-model="form.description" label="Description *" placeholder="What needs doing / the fault" :error="form.errors.description" />
      <div class="form-grid-2">
        <FormField v-model="form.type" label="Type *" type="select" :error="form.errors.type">
          <option v-for="t in props.types" :key="t" :value="t">{{ titleize(t) }}</option>
        </FormField>
        <FormField v-model="form.status" label="Status" type="select" :error="form.errors.status">
          <option v-for="s in props.statuses" :key="s" :value="s">{{ statusLabel(s) }}</option>
        </FormField>
        <FormField v-model="form.scheduled_date" label="Scheduled Date" type="date" :error="form.errors.scheduled_date" />
        <FormField v-model="form.performed_by" label="Performed By" placeholder="Technician / staff name" :error="form.errors.performed_by" />
        <FormField v-model="form.vendor_id" label="Service Vendor" type="select" :error="form.errors.vendor_id">
          <option value="">— None —</option>
          <option v-for="v in props.vendors" :key="v.id" :value="v.id">{{ v.name }}</option>
        </FormField>
        <FormField v-model.number="form.cost" label="Cost" type="number" step="0.01" :error="form.errors.cost" />
        <FormField v-model.number="form.downtime_hours" label="Downtime (hours)" type="number" step="0.5" :error="form.errors.downtime_hours" />
      </div>
      <FormField v-model="form.notes" label="Notes" type="textarea" :error="form.errors.notes" />

      <template #footer>
        <button class="ui-btn ui-btn--ghost" @click="showModal = false">Cancel</button>
        <button class="ui-btn ui-btn--primary" :disabled="form.processing" @click="save">Save</button>
      </template>
    </Modal>

    <!-- Complete -->
    <Modal v-model="showComplete" title="Complete Maintenance" width="480px">
      <p class="ml__hint">Marking <strong>{{ completeRow?.maintenance_number }}</strong> on <strong>{{ completeRow?.asset_name }}</strong> as completed. This rolls the asset's next-service date forward and returns it to active.</p>
      <FormField v-model="completeForm.completed_date" label="Completed Date" type="date" :error="completeForm.errors.completed_date" />
      <div class="form-grid-2">
        <FormField v-model.number="completeForm.cost" label="Final Cost" type="number" step="0.01" :error="completeForm.errors.cost" />
        <FormField v-model.number="completeForm.downtime_hours" label="Downtime (hours)" type="number" step="0.5" :error="completeForm.errors.downtime_hours" />
      </div>
      <FormField v-model="completeForm.notes" label="Notes" type="textarea" :error="completeForm.errors.notes" />
      <template #footer>
        <button class="ui-btn ui-btn--ghost" @click="showComplete = false">Cancel</button>
        <button class="ui-btn ui-btn--primary" :disabled="completeForm.processing" @click="doComplete">Mark Completed</button>
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
  records:  { type: Object, default: () => ({ data: [] }) },
  assets:   { type: Array,  default: () => [] },
  branches: { type: Array,  default: () => [] },
  vendors:  { type: Array,  default: () => [] },
  types:    { type: Array,  default: () => [] },
  statuses: { type: Array,  default: () => [] },
  summary:  { type: Object, default: () => ({ scheduled: 0, in_progress: 0, completed_this_month: 0, cost_this_month: 0 }) },
  filters:  { type: Object, default: () => ({}) },
});

const columns = [
  { key: 'maintenance_number', label: 'Work Order #' },
  { key: 'asset',              label: 'Asset' },
  { key: 'type',               label: 'Type' },
  { key: 'scheduled_date',     label: 'Scheduled' },
  { key: 'completed_date',     label: 'Completed' },
  { key: 'performed_by',       label: 'By' },
  { key: 'cost',               label: 'Cost' },
  { key: 'status',             label: 'Status' },
];

const records = computed(() => props.records?.data ?? []);
const search = ref(props.filters?.search ?? '');
const assetFilter = ref(props.filters?.asset_id ?? '');
const typeFilter = ref(props.filters?.type ?? '');
const statusFilter = ref(props.filters?.status ?? '');
const branchFilter = ref(props.filters?.branch_id ?? '');

let timer = null;
const reload = () => router.get('/maintenance/logs',
  {
    search: search.value || undefined,
    asset_id: assetFilter.value || undefined,
    type: typeFilter.value || undefined,
    status: statusFilter.value || undefined,
    branch_id: branchFilter.value || undefined,
  },
  { preserveState: true, preserveScroll: true, replace: true, only: ['records', 'summary', 'filters'] });
watch([search, assetFilter, typeFilter, statusFilter, branchFilter], () => { clearTimeout(timer); timer = setTimeout(reload, 300); });

const statusLabel = s => ({
  scheduled: 'Scheduled', in_progress: 'In Progress', completed: 'Completed', cancelled: 'Cancelled',
}[s] ?? s);
const statusClass = s => ({
  scheduled: 'ui-badge--muted', in_progress: 'ui-badge--info',
  completed: 'ui-badge--success', cancelled: 'ui-badge--danger',
}[s] ?? 'ui-badge--muted');

const defaults = () => ({
  id: null, asset_id: '', description: '', type: 'corrective', status: 'scheduled',
  scheduled_date: '', performed_by: '', vendor_id: '', cost: 0, downtime_hours: 0, notes: '',
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
  form.asset_id = row.asset_id ?? '';
  form.description = row.description ?? '';
  form.type = row.type ?? 'corrective';
  form.status = row.status ?? 'scheduled';
  form.scheduled_date = date(row.scheduled_date);
  form.performed_by = row.performed_by ?? '';
  form.vendor_id = row.vendor_id ?? '';
  form.cost = row.cost ?? 0;
  form.downtime_hours = row.downtime_hours ?? 0;
  form.notes = row.notes ?? '';
  form.clearErrors();
  showModal.value = true;
};

const save = () => {
  const opts = { preserveScroll: true, onSuccess: () => (showModal.value = false) };
  if (form.id) form.put(`/maintenance/logs/${form.id}`, opts);
  else form.post('/maintenance/logs', opts);
};

const del = async row => {
  if (!(await confirmDialog(`Delete work order ${row.maintenance_number}?`))) return;
  router.delete(`/maintenance/logs/${row.id}`, { preserveScroll: true });
};

// Complete
const showComplete = ref(false);
const completeRow = ref(null);
const completeForm = useForm({ completed_date: '', cost: 0, downtime_hours: 0, notes: '' });
const openComplete = row => {
  completeRow.value = row;
  completeForm.reset(); completeForm.clearErrors();
  completeForm.completed_date = today();
  completeForm.cost = row.cost ?? 0;
  completeForm.downtime_hours = row.downtime_hours ?? 0;
  completeForm.notes = row.notes ?? '';
  showComplete.value = true;
};
const doComplete = () => completeForm.put(`/maintenance/logs/${completeRow.value.id}/complete`,
  { preserveScroll: true, onSuccess: () => (showComplete.value = false) });

const titleize = s => String(s || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
const fmt      = v => 'Rs ' + Number(v || 0).toLocaleString('en-PK', { minimumFractionDigits: 2 });
const fmtDate  = v => v ? new Date(v).toLocaleDateString() : '—';
const date     = v => v ? String(v).slice(0, 10) : '';
const today    = () => new Date().toISOString().slice(0, 10);
</script>

<style scoped>
.ml__kpis    { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 18px; }
.ml__kpi     { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px 16px; display: flex; flex-direction: column; gap: 2px; }
.ml__kpi--info { border-left: 3px solid var(--brand, #6366f1); }
.ml__kpi--ok   { border-left: 3px solid var(--success, #16a34a); }
.ml__kpi-label { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-soft); font-weight: 600; }
.ml__kpi-val   { font-size: 1.5rem; font-weight: 700; }
.ml__kpi-sub   { font-size: 0.72rem; color: var(--text-soft); }
.ml__filters { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.ml__search  { flex: 1; max-width: 300px; }
.ml__muted   { color: var(--text-soft); }
.ml__code    { color: var(--text-soft); font-size: 0.76rem; margin-left: 8px; }
.ml__hint    { font-size: 0.85rem; color: var(--text-soft); margin: 0 0 12px; }
.form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; }
@media (max-width: 900px) { .ml__kpis { grid-template-columns: repeat(2, 1fr); } .form-grid-2 { grid-template-columns: 1fr; } }
</style>
