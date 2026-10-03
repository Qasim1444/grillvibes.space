<template>
  <div class="page">
    <PageHeader
      title="Ingredients"
      subtitle="The raw materials recipes consume and procurement buys. Quantities and costs are shown here but owned by stock — they change only when a delivery is booked or a stock take is recorded."
    >
      <template #actions>
        <button v-if="can('inventory.ingredients.create')" class="ui-btn ui-btn--primary" @click="openCreate">
          + New Ingredient
        </button>
      </template>
    </PageHeader>

    <!-- Summary strip -->
    <div class="ing__kpis">
      <div class="ing__kpi ing__kpi--info">
        <span class="ing__kpi-label">Ingredients</span>
        <span class="ing__kpi-val">{{ props.summary.total }}</span>
        <span class="ing__kpi-sub">on the master list</span>
      </div>
      <div class="ing__kpi ing__kpi--ok">
        <span class="ing__kpi-label">Stock Value</span>
        <span class="ing__kpi-val">{{ fmt(props.summary.stock_value) }}</span>
        <span class="ing__kpi-sub">at this outlet</span>
      </div>
      <div class="ing__kpi ing__kpi--warn">
        <span class="ing__kpi-label">Low Stock</span>
        <span class="ing__kpi-val">{{ props.summary.low_stock }}</span>
        <span class="ing__kpi-sub">at or below reorder level</span>
      </div>
      <div class="ing__kpi" :class="props.summary.negative > 0 ? 'ing__kpi--danger' : ''">
        <span class="ing__kpi-label">Negative</span>
        <span class="ing__kpi-val">{{ props.summary.negative }}</span>
        <span class="ing__kpi-sub">sold more than was received</span>
      </div>
    </div>

    <!-- Filters -->
    <div class="ing__filters">
      <input v-model="search" class="ui-input ing__search" placeholder="Search name / SKU…" />
      <select v-model="statusFilter" class="ui-input" style="width:160px">
        <option value="">All Statuses</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
    </div>

    <DataTable
      :columns="columns"
      :rows="ingredients"
      index
      empty-text="No ingredients yet. Add the things your recipes are made of."
    >
      <template #cell:name="{ row }">
        <strong>{{ row.name }}</strong>
        <span v-if="row.sku" class="ing__code">{{ row.sku }}</span>
        <span v-if="!row.is_active" class="ui-badge ui-badge--muted ing__pill">Inactive</span>
      </template>

      <template #cell:quantity="{ row }">
        <span :class="qtyClass(row)">{{ qty(row.quantity) }} {{ row.unit }}</span>
        <span v-if="row.needs_reorder" class="ui-badge ui-badge--warning ing__pill">Reorder</span>
      </template>

      <template #cell:reorder_level="{ row }">
        <span class="ing__muted">{{ qty(row.reorder_level) }} {{ row.unit }}</span>
      </template>

      <template #cell:average_cost="{ row }">
        <span v-if="row.average_cost > 0">{{ fmt(row.average_cost) }} <span class="ing__muted">/ {{ row.unit }}</span></span>
        <span v-else class="ing__muted" title="No delivery has been booked yet, so there is no valuation.">—</span>
      </template>

      <template #cell:stock_value="{ value }">
        <strong>{{ fmt(value) }}</strong>
      </template>

      <template #cell:used_in_recipes="{ value }">
        <span v-if="value > 0" class="ui-badge ui-badge--info">{{ value }} dish{{ value === 1 ? '' : 'es' }}</span>
        <span v-else class="ing__muted">unused</span>
      </template>

      <template #actions="{ row }">
        <button v-if="can('inventory.ingredients.update')" class="ui-btn ui-btn--ghost ui-btn--sm" @click="openEdit(row)">Edit</button>
        <button v-if="can('inventory.ingredients.delete')" class="ui-btn ui-btn--danger ui-btn--sm" @click="del(row)">Delete</button>
      </template>
    </DataTable>

    <Pagination :paginator="props.ingredients" :only="['ingredients', 'summary']" />

    <!-- Create / Edit -->
    <Modal v-model="showModal" :title="form.id ? 'Edit Ingredient' : 'New Ingredient'" width="620px">
      <FormField v-model="form.name" label="Name *" placeholder="e.g. Beef mince" :error="form.errors.name" />

      <div class="form-grid-2">
        <FormField v-model="form.sku" label="SKU / Code" placeholder="Optional" :error="form.errors.sku" />
        <FormField v-model="form.unit" label="Unit of Measure *" type="select" :error="form.errors.unit">
          <option v-for="u in props.units" :key="u" :value="u">{{ u }}</option>
        </FormField>
        <FormField
          v-model.number="form.reorder_level"
          label="Reorder Level *"
          type="number"
          step="0.0001"
          :error="form.errors.reorder_level"
        />
        <FormField v-model="form.is_active" label="Status *" type="select" :error="form.errors.is_active">
          <option :value="true">Active</option>
          <option :value="false">Inactive</option>
        </FormField>
      </div>

      <p class="ing__hint">
        The unit is how this ingredient is counted, bought and used in recipes — pick it once and stick to it, because
        every quantity and cost in the system is expressed in it. Flag the ingredient when stock drops to the reorder level.
      </p>

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
  ingredients: { type: Object, default: () => ({ data: [] }) },
  units:       { type: Array,  default: () => [] },
  summary:     { type: Object, default: () => ({ total: 0, stock_value: 0, low_stock: 0, negative: 0 }) },
  filters:     { type: Object, default: () => ({}) },
});

const columns = [
  { key: 'name',             label: 'Ingredient' },
  { key: 'quantity',         label: 'On Hand' },
  { key: 'reorder_level',    label: 'Reorder At' },
  { key: 'average_cost',     label: 'Avg. Cost' },
  { key: 'stock_value',      label: 'Value' },
  { key: 'used_in_recipes',  label: 'Used In' },
];

const ingredients = computed(() => props.ingredients?.data ?? []);
const search = ref(props.filters?.search ?? '');
const statusFilter = ref(props.filters?.status ?? '');

let timer = null;
const reload = () => router.get('/inventory/ingredients',
  { search: search.value || undefined, status: statusFilter.value || undefined },
  { preserveState: true, preserveScroll: true, replace: true, only: ['ingredients', 'summary', 'filters'] });
watch([search, statusFilter], () => { clearTimeout(timer); timer = setTimeout(reload, 300); });

const defaults = () => ({
  id: null, name: '', sku: '', unit: props.units[0] ?? 'kg',
  reorder_level: 0, is_active: true, notes: '',
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
  form.sku = row.sku ?? '';
  form.unit = row.unit ?? 'kg';
  form.reorder_level = row.reorder_level ?? 0;
  form.is_active = row.is_active ?? true;
  form.notes = row.notes ?? '';
  form.clearErrors();
  showModal.value = true;
};

const save = () => {
  const opts = { preserveScroll: true, onSuccess: () => (showModal.value = false) };
  if (form.id) form.put(`/inventory/ingredients/${form.id}`, opts);
  else form.post('/inventory/ingredients', opts);
};

const del = async row => {
  const warning = row.used_in_recipes > 0
    ? `${row.name} is used in ${row.used_in_recipes} recipe(s) and cannot be deleted until it is taken off them. Try anyway?`
    : `Delete ${row.name}? Its stock history is kept.`;
  if (!(await confirmDialog(warning))) return;
  router.delete(`/inventory/ingredients/${row.id}`, { preserveScroll: true });
};

const qtyClass = row => row.quantity < 0 ? 'ing__neg' : (row.needs_reorder ? 'ing__low' : '');

const fmt = v => 'Rs ' + Number(v || 0).toLocaleString('en-PK', { minimumFractionDigits: 2 });
// Trailing zeros are noise on a quantity — 2.5 kg reads better than 2.5000 kg.
const qty = v => Number(v || 0).toLocaleString('en-PK', { maximumFractionDigits: 4 });
</script>

<style scoped>
.ing__kpis    { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 18px; }
.ing__kpi     { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px 16px; display: flex; flex-direction: column; gap: 2px; }
.ing__kpi--warn   { border-left: 3px solid var(--warning, #d97706); }
.ing__kpi--ok     { border-left: 3px solid var(--success, #16a34a); }
.ing__kpi--info   { border-left: 3px solid var(--brand, #6366f1); }
.ing__kpi--danger { border-left: 3px solid var(--danger, #dc2626); }
.ing__kpi-label   { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-soft); font-weight: 600; }
.ing__kpi-val     { font-size: 1.5rem; font-weight: 700; }
.ing__kpi-sub     { font-size: 0.72rem; color: var(--text-soft); }
.ing__filters { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.ing__search  { flex: 1; max-width: 320px; }
.ing__muted   { color: var(--text-soft); }
.ing__code    { color: var(--text-soft); font-size: 0.76rem; margin-left: 8px; }
.ing__pill    { margin-left: 6px; }
.ing__low     { color: var(--warning, #d97706); font-weight: 600; }
.ing__neg     { color: var(--danger, #dc2626); font-weight: 700; }
.ing__hint    { font-size: 0.78rem; color: var(--text-soft); margin: 4px 0 12px; line-height: 1.5; }
.form-grid-2  { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; }
@media (max-width: 900px) { .ing__kpis { grid-template-columns: repeat(2, 1fr); } .form-grid-2 { grid-template-columns: 1fr; } }
</style>
