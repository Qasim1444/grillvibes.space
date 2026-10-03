<template>
  <div class="page">
    <PageHeader
      title="Vendors"
      subtitle="Who you buy from. These suppliers are shared with Expenses, Assets and Maintenance, so retiring one keeps its name readable on everything already booked against it."
    >
      <template #actions>
        <button v-if="can('procurement.vendors.create')" class="ui-btn ui-btn--primary" @click="openCreate">
          + New Vendor
        </button>
      </template>
    </PageHeader>

    <!-- Summary strip -->
    <div class="vd__kpis">
      <div class="vd__kpi vd__kpi--info">
        <span class="vd__kpi-label">Vendors</span>
        <span class="vd__kpi-val">{{ props.summary.total }}</span>
        <span class="vd__kpi-sub">{{ props.summary.active }} active</span>
      </div>
      <div class="vd__kpi vd__kpi--warn">
        <span class="vd__kpi-label">Awaiting Delivery</span>
        <span class="vd__kpi-val">{{ props.summary.with_open_orders }}</span>
        <span class="vd__kpi-sub">vendors with open orders</span>
      </div>
      <div class="vd__kpi vd__kpi--ok">
        <span class="vd__kpi-label">Received This Month</span>
        <span class="vd__kpi-val">{{ fmt(props.summary.spend_this_month) }}</span>
        <span class="vd__kpi-sub">goods actually delivered</span>
      </div>
    </div>

    <!-- Filters -->
    <div class="vd__filters">
      <input v-model="search" class="ui-input vd__search" placeholder="Search name / contact / phone / email…" />
      <select v-model="statusFilter" class="ui-input" style="width:160px">
        <option value="">All Statuses</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
    </div>

    <DataTable
      :columns="columns"
      :rows="vendors"
      index
      empty-text="No vendors yet. Add a supplier before raising a purchase order."
    >
      <template #cell:name="{ row }">
        <strong>{{ row.name }}</strong>
        <span v-if="!row.is_active" class="ui-badge ui-badge--muted vd__pill">Inactive</span>
        <span v-if="row.contact_person" class="vd__sub">{{ row.contact_person }}</span>
      </template>

      <template #cell:contact="{ row }">
        <span v-if="row.phone" class="vd__block">{{ row.phone }}</span>
        <span v-if="row.email" class="vd__block vd__muted">{{ row.email }}</span>
        <span v-if="!row.phone && !row.email" class="vd__muted">—</span>
      </template>

      <template #cell:payment_terms="{ value }">
        <span v-if="value">{{ value }}</span>
        <span v-else class="vd__muted">—</span>
      </template>

      <template #cell:purchase_orders="{ row }">
        <span>{{ row.purchase_orders }}</span>
        <span v-if="row.open_purchase_orders > 0" class="ui-badge ui-badge--warning vd__pill">
          {{ row.open_purchase_orders }} open
        </span>
      </template>

      <template #cell:received_total="{ row }">
        <strong>{{ fmt(row.received_total) }}</strong>
        <span class="vd__sub">{{ row.goods_receipts }} delivery(s)</span>
      </template>

      <template #actions="{ row }">
        <button v-if="can('procurement.vendors.update')" class="ui-btn ui-btn--ghost ui-btn--sm" @click="openEdit(row)">Edit</button>
        <button v-if="can('procurement.vendors.delete')" class="ui-btn ui-btn--danger ui-btn--sm" @click="del(row)">Delete</button>
      </template>
    </DataTable>

    <Pagination :paginator="props.vendors" :only="['vendors', 'summary']" />

    <!-- Create / Edit -->
    <Modal v-model="showModal" :title="form.id ? 'Edit Vendor' : 'New Vendor'" width="680px">
      <FormField v-model="form.name" label="Vendor Name *" placeholder="e.g. Metro Cash & Carry" :error="form.errors.name" />

      <div class="form-grid-2">
        <FormField v-model="form.contact_person" label="Contact Person" :error="form.errors.contact_person" />
        <FormField v-model="form.phone" label="Phone" :error="form.errors.phone" />
        <FormField v-model="form.email" label="Email" type="email" :error="form.errors.email" />
        <FormField v-model="form.tax_number" label="NTN / Tax Number" :error="form.errors.tax_number" />
        <FormField v-model="form.payment_terms" label="Payment Terms" placeholder="e.g. Net 30" :error="form.errors.payment_terms" />
        <FormField v-model="form.is_active" label="Status *" type="select" :error="form.errors.is_active">
          <option :value="true">Active</option>
          <option :value="false">Inactive</option>
        </FormField>
      </div>

      <FormField v-model="form.address" label="Address" type="textarea" :error="form.errors.address" />
      <FormField v-model="form.notes" label="Notes" type="textarea" :error="form.errors.notes" />

      <p class="vd__hint">
        Mark a vendor inactive to keep it off new purchase orders without touching its history.
      </p>

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
  vendors: { type: Object, default: () => ({ data: [] }) },
  summary: { type: Object, default: () => ({ total: 0, active: 0, with_open_orders: 0, spend_this_month: 0 }) },
  filters: { type: Object, default: () => ({}) },
});

const columns = [
  { key: 'name',            label: 'Vendor' },
  { key: 'contact',         label: 'Contact' },
  { key: 'payment_terms',   label: 'Terms' },
  { key: 'purchase_orders', label: 'Orders' },
  { key: 'received_total',  label: 'Received' },
];

const vendors = computed(() => props.vendors?.data ?? []);
const search = ref(props.filters?.search ?? '');
const statusFilter = ref(props.filters?.status ?? '');

let timer = null;
const reload = () => router.get('/procurement/vendors',
  { search: search.value || undefined, status: statusFilter.value || undefined },
  { preserveState: true, preserveScroll: true, replace: true, only: ['vendors', 'summary', 'filters'] });
watch([search, statusFilter], () => { clearTimeout(timer); timer = setTimeout(reload, 300); });

const defaults = () => ({
  id: null, name: '', contact_person: '', phone: '', email: '',
  address: '', tax_number: '', payment_terms: '', is_active: true, notes: '',
});

const showModal = ref(false);
const form = useForm(defaults());

const openCreate = () => {
  form.defaults(defaults());
  form.reset(); form.clearErrors();
  showModal.value = true;
};

const openEdit = row => {
  Object.assign(form, {
    id: row.id,
    name: row.name ?? '',
    contact_person: row.contact_person ?? '',
    phone: row.phone ?? '',
    email: row.email ?? '',
    address: row.address ?? '',
    tax_number: row.tax_number ?? '',
    payment_terms: row.payment_terms ?? '',
    is_active: row.is_active ?? true,
    notes: row.notes ?? '',
  });
  form.clearErrors();
  showModal.value = true;
};

const save = () => {
  const opts = { preserveScroll: true, onSuccess: () => (showModal.value = false) };
  if (form.id) form.put(`/procurement/vendors/${form.id}`, opts);
  else form.post('/procurement/vendors', opts);
};

const del = async row => {
  const warning = row.open_purchase_orders > 0
    ? `${row.name} has ${row.open_purchase_orders} purchase order(s) still open — receive or cancel them first.`
    : `Delete ${row.name}? Past orders and receipts keep the name.`;
  if (!(await confirmDialog(warning))) return;
  router.delete(`/procurement/vendors/${row.id}`, { preserveScroll: true });
};

const fmt = v => 'Rs ' + Number(v || 0).toLocaleString('en-PK', { minimumFractionDigits: 2 });
</script>

<style scoped>
.vd__kpis    { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 18px; }
.vd__kpi     { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px 16px; display: flex; flex-direction: column; gap: 2px; }
.vd__kpi--warn { border-left: 3px solid var(--warning, #d97706); }
.vd__kpi--ok   { border-left: 3px solid var(--success, #16a34a); }
.vd__kpi--info { border-left: 3px solid var(--brand, #6366f1); }
.vd__kpi-label { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-soft); font-weight: 600; }
.vd__kpi-val   { font-size: 1.5rem; font-weight: 700; }
.vd__kpi-sub   { font-size: 0.72rem; color: var(--text-soft); }
.vd__filters { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.vd__search  { flex: 1; max-width: 360px; }
.vd__muted   { color: var(--text-soft); }
.vd__block   { display: block; }
.vd__sub     { display: block; font-size: 0.72rem; color: var(--text-soft); }
.vd__pill    { margin-left: 6px; }
.vd__hint    { font-size: 0.78rem; color: var(--text-soft); margin: 4px 0 0; }
.form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; }
@media (max-width: 900px) { .vd__kpis { grid-template-columns: 1fr; } .form-grid-2 { grid-template-columns: 1fr; } }
</style>
