<template>
  <div class="page">
    <PageHeader
      title="Stock on Hand"
      :subtitle="`What is physically in ${props.branchName || 'this outlet'} right now, and the ledger that explains every balance. Stock rises only when a delivery is booked and falls when dishes are sold — the two corrections below are for when reality disagrees.`"
    >
      <template #actions>
        <button v-if="can('inventory.stock.adjust')" class="ui-btn ui-btn--secondary" @click="openWriteOff()">
          Record Wastage
        </button>
        <button v-if="can('inventory.stock.adjust')" class="ui-btn ui-btn--primary" @click="openCount()">
          Stock Take
        </button>
      </template>
    </PageHeader>

    <!-- Summary strip -->
    <div class="st__kpis">
      <div class="st__kpi st__kpi--ok">
        <span class="st__kpi-label">Stock Value</span>
        <span class="st__kpi-val">{{ fmt(props.summary.stock_value) }}</span>
        <span class="st__kpi-sub">{{ props.summary.tracked }} ingredient(s) tracked</span>
      </div>
      <div class="st__kpi st__kpi--warn">
        <span class="st__kpi-label">Low Stock</span>
        <span class="st__kpi-val">{{ props.summary.low_stock }}</span>
        <span class="st__kpi-sub">at or below reorder level</span>
      </div>
      <div class="st__kpi" :class="props.summary.negative > 0 ? 'st__kpi--danger' : ''">
        <span class="st__kpi-label">Negative</span>
        <span class="st__kpi-val">{{ props.summary.negative }}</span>
        <span class="st__kpi-sub">count these first</span>
      </div>
      <div class="st__kpi st__kpi--info">
        <span class="st__kpi-label">Wastage This Month</span>
        <span class="st__kpi-val">{{ fmt(props.summary.wastage_this_month) }}</span>
        <span class="st__kpi-sub">written off at carrying cost</span>
      </div>
    </div>

    <!-- Filters -->
    <div class="st__filters">
      <input v-model="search" class="ui-input st__search" placeholder="Search ingredient / SKU…" />
      <div class="st__tabs">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          class="st__tab"
          :class="{ 'st__tab--on': viewFilter === tab.value }"
          @click="viewFilter = tab.value"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <DataTable
      :columns="columns"
      :rows="levels"
      empty-text="Nothing in stock yet. Book a goods receipt and the ingredients will appear here."
    >
      <template #cell:name="{ row }">
        <strong>{{ row.name }}</strong>
        <span v-if="row.sku" class="st__muted st__code">{{ row.sku }}</span>
      </template>

      <template #cell:quantity="{ row }">
        <span :class="qtyClass(row)">{{ qty(row.quantity) }} {{ row.unit }}</span>
        <span v-if="row.quantity < 0" class="ui-badge ui-badge--danger st__pill">Negative</span>
        <span v-else-if="row.needs_reorder" class="ui-badge ui-badge--warning st__pill">Reorder</span>
      </template>

      <template #cell:reorder_level="{ row }">
        <span class="st__muted">{{ qty(row.reorder_level) }} {{ row.unit }}</span>
      </template>

      <template #cell:average_cost="{ row }">
        <span v-if="row.average_cost > 0">{{ fmt(row.average_cost) }}<span class="st__muted"> / {{ row.unit }}</span></span>
        <span v-else class="st__muted">—</span>
      </template>

      <template #cell:stock_value="{ value }">
        <strong>{{ fmt(value) }}</strong>
      </template>

      <template #actions="{ row }">
        <button class="ui-btn ui-btn--ghost ui-btn--sm" @click="openLedger(row)">Ledger</button>
        <button v-if="can('inventory.stock.adjust')" class="ui-btn ui-btn--secondary ui-btn--sm" @click="openCount(row)">Count</button>
      </template>
    </DataTable>

    <Pagination :paginator="props.levels" :only="['levels', 'summary', 'movements']" />

    <!-- Recent activity -->
    <section class="st__feed">
      <h3 class="st__feed-title">Recent Movements</h3>
      <p v-if="!props.movements.length" class="st__muted">No stock has moved at this outlet yet.</p>
      <table v-else class="st__feed-table">
        <thead>
          <tr>
            <th>When</th>
            <th>Ingredient</th>
            <th>Type</th>
            <th class="st__right">Change</th>
            <th class="st__right">Balance</th>
            <th class="st__right">Value</th>
            <th>Reference</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in props.movements" :key="m.id">
            <td class="st__muted st__nowrap">{{ fmtDateTime(m.created_at) }}</td>
            <td>{{ m.ingredient_name }}</td>
            <td><span class="ui-badge" :class="typeBadge(m.type)">{{ typeLabel(m.type) }}</span></td>
            <td class="st__right" :class="m.quantity < 0 ? 'st__out' : 'st__in'">
              {{ m.quantity > 0 ? '+' : '' }}{{ qty(m.quantity) }} {{ m.unit }}
            </td>
            <td class="st__right">{{ qty(m.balance_after) }}</td>
            <td class="st__right st__muted">{{ fmt(m.value) }}</td>
            <td class="st__muted">
              {{ m.reference || '—' }}
              <span v-if="m.note" class="st__note" :title="m.note">{{ m.note }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- Stock take -->
    <Modal v-model="showCount" title="Stock Take" width="560px">
      <p class="st__hint">
        Enter what you physically counted. The system writes the difference to the ledger as an adjustment — it does not
        create value, so the ingredient keeps its existing average cost.
      </p>

      <FormField v-model="countForm.ingredient_id" label="Ingredient *" type="select" :error="countForm.errors.ingredient_id">
        <option value="">Select an ingredient…</option>
        <option v-for="i in props.ingredients" :key="i.id" :value="i.id">{{ i.name }} ({{ i.unit }})</option>
      </FormField>

      <div class="form-grid-2">
        <FormField
          v-model.number="countForm.counted_quantity"
          label="Counted Quantity *"
          type="number"
          step="0.0001"
          :error="countForm.errors.counted_quantity"
        >
          <template #hint>In {{ unitOf(countForm.ingredient_id) || 'the ingredient\'s unit' }}.</template>
        </FormField>
        <FormField v-model="systemBalanceLabel" label="System Says" readonly />
      </div>

      <p v-if="countDelta !== null" class="st__delta" :class="countDelta === 0 ? '' : (countDelta > 0 ? 'st__in' : 'st__out')">
        <template v-if="countDelta === 0">Count matches the system balance — nothing will be written.</template>
        <template v-else>Will adjust by {{ countDelta > 0 ? '+' : '' }}{{ qty(countDelta) }} {{ unitOf(countForm.ingredient_id) }}.</template>
      </p>

      <FormField v-model="countForm.note" label="Note" placeholder="e.g. Monthly count, walk-in freezer" :error="countForm.errors.note" />

      <template #footer>
        <button class="ui-btn ui-btn--ghost" @click="showCount = false">Cancel</button>
        <button class="ui-btn ui-btn--primary" :disabled="countForm.processing" @click="saveCount">Record Count</button>
      </template>
    </Modal>

    <!-- Wastage -->
    <Modal v-model="showWriteOff" title="Record Wastage" width="560px">
      <p class="st__hint">
        Stock that was spoiled, spilled or binned. It leaves at its carrying cost and lands in this month's wastage figure —
        use a stock take instead if you are correcting a counting error.
      </p>

      <FormField v-model="wasteForm.ingredient_id" label="Ingredient *" type="select" :error="wasteForm.errors.ingredient_id">
        <option value="">Select an ingredient…</option>
        <option v-for="i in props.ingredients" :key="i.id" :value="i.id">{{ i.name }} ({{ i.unit }})</option>
      </FormField>

      <FormField
        v-model.number="wasteForm.quantity"
        label="Quantity Wasted *"
        type="number"
        step="0.0001"
        :error="wasteForm.errors.quantity"
      >
        <template #hint>In {{ unitOf(wasteForm.ingredient_id) || 'the ingredient\'s unit' }}.</template>
      </FormField>

      <FormField v-model="wasteForm.note" label="Reason *" placeholder="e.g. Spoiled — fridge failure overnight" :error="wasteForm.errors.note" />

      <template #footer>
        <button class="ui-btn ui-btn--ghost" @click="showWriteOff = false">Cancel</button>
        <button class="ui-btn ui-btn--danger" :disabled="wasteForm.processing" @click="saveWriteOff">Write Off</button>
      </template>
    </Modal>

    <!-- Full ledger for one ingredient -->
    <Modal v-model="showLedger" :title="ledgerTitle" width="820px">
      <p v-if="ledgerLoading" class="st__muted">Loading…</p>
      <p v-else-if="ledgerError" class="st__out">{{ ledgerError }}</p>
      <p v-else-if="!ledger.length" class="st__muted">No movements recorded for this ingredient.</p>
      <table v-else class="st__feed-table">
        <thead>
          <tr>
            <th>When</th>
            <th>Type</th>
            <th class="st__right">Change</th>
            <th class="st__right">Unit Cost</th>
            <th class="st__right">Balance</th>
            <th class="st__right">Value</th>
            <th>Reference</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in ledger" :key="m.id">
            <td class="st__muted st__nowrap">{{ fmtDateTime(m.created_at) }}</td>
            <td><span class="ui-badge" :class="typeBadge(m.type)">{{ typeLabel(m.type) }}</span></td>
            <td class="st__right" :class="m.quantity < 0 ? 'st__out' : 'st__in'">
              {{ m.quantity > 0 ? '+' : '' }}{{ qty(m.quantity) }}
            </td>
            <td class="st__right st__muted">{{ fmt(m.unit_cost) }}</td>
            <td class="st__right">{{ qty(m.balance_after) }}</td>
            <td class="st__right st__muted">{{ fmt(m.value) }}</td>
            <td class="st__muted">{{ m.reference || m.note || '—' }}</td>
          </tr>
        </tbody>
      </table>

      <template #footer>
        <button class="ui-btn ui-btn--ghost" @click="showLedger = false">Close</button>
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
  levels:      { type: Object, default: () => ({ data: [] }) },
  ingredients: { type: Array,  default: () => [] },
  movements:   { type: Array,  default: () => [] },
  summary:     { type: Object, default: () => ({ stock_value: 0, low_stock: 0, negative: 0, tracked: 0, wastage_this_month: 0 }) },
  branchName:  { type: String, default: '' },
  filters:     { type: Object, default: () => ({}) },
});

const columns = [
  { key: 'name',          label: 'Ingredient' },
  { key: 'quantity',      label: 'On Hand' },
  { key: 'reorder_level', label: 'Reorder At' },
  { key: 'average_cost',  label: 'Avg. Cost' },
  { key: 'stock_value',   label: 'Value' },
];

const tabs = [
  { value: '',         label: 'All' },
  { value: 'low',      label: 'Low Stock' },
  { value: 'negative', label: 'Negative' },
];

const levels = computed(() => props.levels?.data ?? []);
const search = ref(props.filters?.search ?? '');
const viewFilter = ref(props.filters?.view ?? '');

let timer = null;
const reload = () => router.get('/inventory/stock',
  { search: search.value || undefined, view: viewFilter.value || undefined },
  { preserveState: true, preserveScroll: true, replace: true, only: ['levels', 'summary', 'movements', 'filters'] });
watch([search, viewFilter], () => { clearTimeout(timer); timer = setTimeout(reload, 300); });

// ── Stock take ──────────────────────────────────────────────────────────────
const showCount = ref(false);
const countForm = useForm({ ingredient_id: '', counted_quantity: 0, note: '' });

const openCount = (row = null) => {
  countForm.reset(); countForm.clearErrors();
  if (row) {
    countForm.ingredient_id = row.ingredient_id;
    countForm.counted_quantity = row.quantity;
  }
  showCount.value = true;
};

const saveCount = () => countForm.post('/inventory/stock/adjust', {
  preserveScroll: true,
  onSuccess: () => (showCount.value = false),
});

// Only rows on the current page have a known balance; anything else is unknown
// rather than zero, and saying so is better than implying a count of nothing.
const levelFor = id => levels.value.find(r => String(r.ingredient_id) === String(id));

const systemBalanceLabel = computed(() => {
  const row = levelFor(countForm.ingredient_id);
  if (!countForm.ingredient_id) return '';
  return row ? `${qty(row.quantity)} ${row.unit}` : 'Not on this page';
});

const countDelta = computed(() => {
  const row = levelFor(countForm.ingredient_id);
  if (!row) return null;
  return Number((Number(countForm.counted_quantity || 0) - Number(row.quantity || 0)).toFixed(4));
});

// ── Wastage ─────────────────────────────────────────────────────────────────
const showWriteOff = ref(false);
const wasteForm = useForm({ ingredient_id: '', quantity: null, note: '' });

const openWriteOff = () => {
  wasteForm.reset(); wasteForm.clearErrors();
  showWriteOff.value = true;
};

const saveWriteOff = async () => {
  if (!(await confirmDialog('Write this stock off? It will leave inventory at its carrying cost.'))) return;
  wasteForm.post('/inventory/stock/write-off', {
    preserveScroll: true,
    onSuccess: () => (showWriteOff.value = false),
  });
};

// ── Per-ingredient ledger ───────────────────────────────────────────────────
const showLedger = ref(false);
const ledger = ref([]);
const ledgerLoading = ref(false);
const ledgerError = ref('');
const ledgerName = ref('');
const ledgerTitle = computed(() => ledgerName.value ? `Ledger — ${ledgerName.value}` : 'Ledger');

const openLedger = async row => {
  ledgerName.value = row.name;
  ledger.value = [];
  ledgerError.value = '';
  ledgerLoading.value = true;
  showLedger.value = true;
  try {
    const res = await fetch(`/inventory/stock/${row.ingredient_id}/ledger`, {
      headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
    });
    if (!res.ok) throw new Error(`Request failed (${res.status})`);
    const body = await res.json();
    ledger.value = body.movements ?? [];
  } catch (e) {
    ledgerError.value = 'Could not load the ledger. ' + (e?.message ?? '');
  } finally {
    ledgerLoading.value = false;
  }
};

// ── Helpers ─────────────────────────────────────────────────────────────────
const unitOf = id => props.ingredients.find(i => String(i.id) === String(id))?.unit ?? '';
const qtyClass = row => row.quantity < 0 ? 'st__neg' : (row.needs_reorder ? 'st__low' : '');

const TYPE_LABELS = {
  purchase: 'Received',
  sale: 'Sold',
  sale_reversal: 'Reversed',
  wastage: 'Wastage',
  adjustment: 'Stock Take',
  opening_balance: 'Opening',
};
const TYPE_BADGES = {
  purchase: 'ui-badge--success',
  sale: 'ui-badge--info',
  sale_reversal: 'ui-badge--muted',
  wastage: 'ui-badge--danger',
  adjustment: 'ui-badge--warning',
  opening_balance: 'ui-badge--muted',
};
const typeLabel = t => TYPE_LABELS[t] ?? t;
const typeBadge = t => TYPE_BADGES[t] ?? 'ui-badge--muted';

const fmt = v => 'Rs ' + Number(v || 0).toLocaleString('en-PK', { minimumFractionDigits: 2 });
const qty = v => Number(v || 0).toLocaleString('en-PK', { maximumFractionDigits: 4 });
const fmtDateTime = v => v ? new Date(v.replace(' ', 'T')).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' }) : '—';
</script>

<style scoped>
.st__kpis    { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 18px; }
.st__kpi     { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px 16px; display: flex; flex-direction: column; gap: 2px; }
.st__kpi--warn   { border-left: 3px solid var(--warning, #d97706); }
.st__kpi--ok     { border-left: 3px solid var(--success, #16a34a); }
.st__kpi--info   { border-left: 3px solid var(--brand, #6366f1); }
.st__kpi--danger { border-left: 3px solid var(--danger, #dc2626); }
.st__kpi-label   { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-soft); font-weight: 600; }
.st__kpi-val     { font-size: 1.5rem; font-weight: 700; }
.st__kpi-sub     { font-size: 0.72rem; color: var(--text-soft); }
.st__filters { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; align-items: center; }
.st__search  { flex: 1; max-width: 320px; }
.st__tabs    { display: flex; gap: 4px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 3px; }
.st__tab     { border: 0; background: transparent; padding: 6px 14px; border-radius: calc(var(--radius) - 3px); font-size: 0.82rem; cursor: pointer; color: var(--text-soft); font-weight: 600; }
.st__tab--on { background: var(--brand, #6366f1); color: #fff; }
.st__muted   { color: var(--text-soft); }
.st__code    { font-size: 0.76rem; margin-left: 8px; }
.st__pill    { margin-left: 6px; }
.st__low     { color: var(--warning, #d97706); font-weight: 600; }
.st__neg     { color: var(--danger, #dc2626); font-weight: 700; }
.st__in      { color: var(--success, #16a34a); font-weight: 600; }
.st__out     { color: var(--danger, #dc2626); font-weight: 600; }
.st__right   { text-align: right; }
.st__nowrap  { white-space: nowrap; }
.st__hint    { font-size: 0.78rem; color: var(--text-soft); margin: 0 0 14px; line-height: 1.5; }
.st__delta   { font-size: 0.82rem; margin: 0 0 12px; }
.st__feed       { margin-top: 26px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px 18px; }
.st__feed-title { font-size: 0.95rem; font-weight: 700; margin: 0 0 12px; }
.st__feed-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
.st__feed-table th { text-align: left; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-soft); padding: 6px 10px; border-bottom: 1px solid var(--border); }
.st__feed-table td { padding: 8px 10px; border-bottom: 1px solid var(--border); }
.st__feed-table th.st__right { text-align: right; }
.st__note    { display: block; font-size: 0.72rem; opacity: 0.8; max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; }
@media (max-width: 900px) { .st__kpis { grid-template-columns: repeat(2, 1fr); } .form-grid-2 { grid-template-columns: 1fr; } }
</style>
