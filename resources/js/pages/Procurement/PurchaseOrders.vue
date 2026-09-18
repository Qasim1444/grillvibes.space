<template>
  <div class="page">
    <PageHeader
      title="Purchase Orders"
      subtitle="What you have committed to buy, from whom, at what price. Nothing here moves stock or changes a cost — value enters inventory when the delivery is booked as a goods receipt."
    >
      <template #actions>
        <Link href="/procurement/goods-receipts" class="ui-btn ui-btn--secondary">Goods Receipts</Link>
        <button v-if="can('procurement.purchase-orders.create')" class="ui-btn ui-btn--primary" @click="openCreate">
          + New Purchase Order
        </button>
      </template>
    </PageHeader>

    <!-- Summary strip -->
    <div class="po__kpis">
      <div class="po__kpi po__kpi--muted">
        <span class="po__kpi-label">Drafts</span>
        <span class="po__kpi-val">{{ props.summary.draft }}</span>
        <span class="po__kpi-sub">not yet sent to a vendor</span>
      </div>
      <div class="po__kpi po__kpi--info">
        <span class="po__kpi-label">Awaiting Delivery</span>
        <span class="po__kpi-val">{{ props.summary.open }}</span>
        <span class="po__kpi-sub">{{ fmt(props.summary.open_value) }} committed</span>
      </div>
      <div class="po__kpi" :class="props.summary.overdue > 0 ? 'po__kpi--danger' : 'po__kpi--ok'">
        <span class="po__kpi-label">Overdue</span>
        <span class="po__kpi-val">{{ props.summary.overdue }}</span>
        <span class="po__kpi-sub">past their expected date</span>
      </div>
      <div class="po__kpi po__kpi--ok">
        <span class="po__kpi-label">Completed This Month</span>
        <span class="po__kpi-val">{{ props.summary.received_this_month }}</span>
        <span class="po__kpi-sub">fully received</span>
      </div>
    </div>

    <!-- Filters -->
    <div class="po__filters">
      <input v-model="search" class="ui-input po__search" placeholder="Search PO number / vendor…" />
      <select v-model="statusFilter" class="ui-input" style="width:190px">
        <option value="">All Statuses</option>
        <option v-for="(label, value) in props.statuses" :key="value" :value="value">{{ label }}</option>
      </select>
      <select v-model="vendorFilter" class="ui-input" style="width:210px">
        <option value="">All Vendors</option>
        <option v-for="v in props.vendors" :key="v.id" :value="v.id">{{ v.name }}</option>
      </select>
    </div>

    <DataTable
      :columns="columns"
      :rows="orders"
      empty-text="No purchase orders for this outlet yet."
    >
      <template #cell:po_number="{ row }">
        <strong>{{ row.po_number }}</strong>
        <span class="po__sub">{{ row.line_count }} line(s)</span>
      </template>

      <template #cell:vendor_name="{ row }">
        {{ row.vendor_name || '—' }}
        <span v-if="row.created_by_name" class="po__sub">by {{ row.created_by_name }}</span>
      </template>

      <template #cell:status="{ row }">
        <span class="ui-badge" :class="statusBadge(row.status)">{{ row.status_label }}</span>
        <span v-if="row.is_overdue" class="ui-badge ui-badge--danger po__pill">Overdue</span>
      </template>

      <template #cell:expected_at="{ row }">
        <span :class="row.is_overdue ? 'po__neg' : ''">{{ fmtDate(row.expected_at) }}</span>
        <span v-if="row.ordered_at" class="po__sub">sent {{ fmtDate(row.ordered_at) }}</span>
      </template>

      <template #cell:total="{ value }"><strong>{{ fmt(value) }}</strong></template>

      <template #cell:outstanding_value="{ row }">
        <span v-if="row.outstanding_value > 0" class="po__warn">{{ fmt(row.outstanding_value) }}</span>
        <span v-else class="po__muted">—</span>
      </template>

      <template #actions="{ row }">
        <button class="ui-btn ui-btn--ghost ui-btn--sm" @click="openView(row)">View</button>
        <button
          v-if="row.is_draft && can('procurement.purchase-orders.update')"
          class="ui-btn ui-btn--ghost ui-btn--sm"
          @click="openEdit(row)"
        >Edit</button>
        <button
          v-if="row.is_draft && can('procurement.purchase-orders.approve')"
          class="ui-btn ui-btn--primary ui-btn--sm"
          @click="send(row)"
        >Send</button>
        <Link
          v-if="row.is_receivable && can('procurement.goods-receipts.create')"
          :href="`/procurement/goods-receipts?po=${row.id}`"
          class="ui-btn ui-btn--secondary ui-btn--sm"
        >Receive</Link>
        <button
          v-if="!row.is_draft && row.is_receivable && can('procurement.purchase-orders.update')"
          class="ui-btn ui-btn--ghost ui-btn--sm"
          @click="openCancel(row)"
        >Cancel</button>
        <button
          v-if="row.is_draft && can('procurement.purchase-orders.delete')"
          class="ui-btn ui-btn--danger ui-btn--sm"
          @click="del(row)"
        >Delete</button>
      </template>
    </DataTable>

    <Pagination :paginator="props.orders" :only="['orders', 'summary']" />

    <!-- Create / Edit -->
    <Modal v-model="showForm" :title="form.id ? `Edit ${editingNumber}` : 'New Purchase Order'" width="900px">
      <div class="form-grid-2">
        <FormField v-model="form.vendor_id" label="Vendor *" type="select" :error="form.errors.vendor_id">
          <option value="">Select a vendor…</option>
          <option v-for="v in props.vendors" :key="v.id" :value="v.id">{{ v.name }}</option>
        </FormField>
        <FormField v-model="form.expected_at" label="Expected Delivery" type="date" :error="form.errors.expected_at" />
      </div>

      <p v-if="selectedVendorTerms" class="po__terms">Payment terms: {{ selectedVendorTerms }}</p>

      <table class="po__table">
        <thead>
          <tr>
            <th style="width:36%">Ingredient</th>
            <th style="width:18%">Quantity</th>
            <th style="width:18%">Unit Cost</th>
            <th class="po__right">Line Total</th>
            <th style="width:40px"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!form.lines.length">
            <td colspan="5" class="po__muted po__empty">Add the first line to start this order.</td>
          </tr>
          <tr v-for="(line, i) in form.lines" :key="i">
            <td>
              <select v-model="line.ingredient_id" class="ui-input">
                <option value="">Select…</option>
                <option v-for="ing in props.ingredients" :key="ing.id" :value="ing.id">{{ ing.name }}</option>
              </select>
              <span v-if="isDuplicate(line, i)" class="po__err">Already listed above</span>
            </td>
            <td>
              <div class="po__qty">
                <input v-model.number="line.quantity" type="number" step="0.0001" min="0" class="ui-input" />
                <span class="po__unit">{{ unitOf(line.ingredient_id) }}</span>
              </div>
            </td>
            <td><input v-model.number="line.unit_cost" type="number" step="0.01" min="0" class="ui-input" /></td>
            <td class="po__right"><strong>{{ fmt(lineTotal(line)) }}</strong></td>
            <td><button class="ui-btn ui-btn--danger ui-btn--sm" title="Remove line" @click="removeLine(i)">×</button></td>
          </tr>
        </tbody>
        <tfoot v-if="form.lines.length">
          <tr>
            <td colspan="3" class="po__right"><strong>Order Total</strong></td>
            <td class="po__right"><strong>{{ fmt(orderTotal) }}</strong></td>
            <td></td>
          </tr>
        </tfoot>
      </table>

      <p v-if="form.errors.lines" class="po__err">{{ form.errors.lines }}</p>

      <button class="ui-btn ui-btn--secondary ui-btn--sm po__add" @click="addLine">+ Add Line</button>

      <FormField v-model="form.notes" label="Notes" type="textarea" :error="form.errors.notes" />

      <p class="po__hint">
        Saved as a draft — it commits nothing until you send it. Unit costs here are what you expect to pay; the price that
        actually values your stock is the one on the delivery invoice.
      </p>

      <template #footer>
        <button class="ui-btn ui-btn--ghost" @click="showForm = false">Cancel</button>
        <button class="ui-btn ui-btn--primary" :disabled="form.processing || hasDuplicates || !validLines.length" @click="save">
          {{ form.id ? 'Save Changes' : 'Save Draft' }}
        </button>
      </template>
    </Modal>

    <!-- View -->
    <Modal v-model="showView" :title="viewing?.po_number ?? 'Purchase Order'" width="900px">
      <div v-if="viewing">
        <div class="po__meta">
          <div><span class="po__meta-label">Vendor</span><span>{{ viewing.vendor_name || '—' }}</span></div>
          <div><span class="po__meta-label">Status</span><span class="ui-badge" :class="statusBadge(viewing.status)">{{ viewing.status_label }}</span></div>
          <div><span class="po__meta-label">Sent</span><span>{{ fmtDate(viewing.ordered_at) }}</span></div>
          <div><span class="po__meta-label">Expected</span><span :class="viewing.is_overdue ? 'po__neg' : ''">{{ fmtDate(viewing.expected_at) }}</span></div>
          <div><span class="po__meta-label">Total</span><span><strong>{{ fmt(viewing.total) }}</strong></span></div>
          <div><span class="po__meta-label">Outstanding</span><span :class="viewing.outstanding_value > 0 ? 'po__warn' : ''">{{ fmt(viewing.outstanding_value) }}</span></div>
        </div>

        <table class="po__table">
          <thead>
            <tr>
              <th>Ingredient</th>
              <th class="po__right">Ordered</th>
              <th class="po__right">Received</th>
              <th class="po__right">Outstanding</th>
              <th class="po__right">Unit Cost</th>
              <th class="po__right">Line Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="line in viewing.lines" :key="line.id">
              <td>{{ line.name }}</td>
              <td class="po__right">{{ qty(line.quantity) }} {{ line.unit }}</td>
              <td class="po__right">{{ qty(line.received_qty) }}</td>
              <td class="po__right" :class="line.outstanding_qty > 0 ? 'po__warn' : 'po__muted'">{{ qty(line.outstanding_qty) }}</td>
              <td class="po__right po__muted">{{ fmt(line.unit_cost) }}</td>
              <td class="po__right"><strong>{{ fmt(line.line_total) }}</strong></td>
            </tr>
          </tbody>
        </table>

        <p v-if="viewing.notes" class="po__notes"><span class="po__meta-label">Notes</span>{{ viewing.notes }}</p>
      </div>

      <template #footer>
        <button class="ui-btn ui-btn--ghost" @click="showView = false">Close</button>
        <Link
          v-if="viewing?.is_receivable && can('procurement.goods-receipts.create')"
          :href="`/procurement/goods-receipts?po=${viewing.id}`"
          class="ui-btn ui-btn--primary"
        >Receive Delivery</Link>
      </template>
    </Modal>

    <!-- Cancel -->
    <Modal v-model="showCancel" title="Cancel Purchase Order" width="520px">
      <p class="po__hint">
        Cancelling abandons whatever is still outstanding on {{ cancelling?.po_number }}. Anything already delivered keeps
        its stock and its cost — this only closes the order.
      </p>
      <FormField v-model="cancelForm.reason" label="Reason" placeholder="e.g. Vendor out of stock" :error="cancelForm.errors.reason" />

      <template #footer>
        <button class="ui-btn ui-btn--ghost" @click="showCancel = false">Keep Open</button>
        <button class="ui-btn ui-btn--danger" :disabled="cancelForm.processing" @click="saveCancel">Cancel Order</button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { confirmDialog } from "../../composables/useNotifications";
import { computed, ref, watch } from 'vue';
import { Link, router, useForm } from '@inertiajs/vue3';
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
  orders:      { type: Object, default: () => ({ data: [] }) },
  vendors:     { type: Array,  default: () => [] },
  ingredients: { type: Array,  default: () => [] },
  statuses:    { type: Object, default: () => ({}) },
  summary:     { type: Object, default: () => ({ draft: 0, open: 0, open_value: 0, overdue: 0, received_this_month: 0 }) },
  filters:     { type: Object, default: () => ({}) },
});

const columns = [
  { key: 'po_number',         label: 'PO' },
  { key: 'vendor_name',       label: 'Vendor' },
  { key: 'status',            label: 'Status' },
  { key: 'expected_at',       label: 'Expected' },
  { key: 'total',             label: 'Total' },
  { key: 'outstanding_value', label: 'Outstanding' },
];

const orders = computed(() => props.orders?.data ?? []);
const search = ref(props.filters?.search ?? '');
const statusFilter = ref(props.filters?.status ?? '');
const vendorFilter = ref(props.filters?.vendor_id ?? '');

let timer = null;
const reload = () => router.get('/procurement/purchase-orders',
  {
    search: search.value || undefined,
    status: statusFilter.value || undefined,
    vendor_id: vendorFilter.value || undefined,
  },
  { preserveState: true, preserveScroll: true, replace: true, only: ['orders', 'summary', 'filters'] });
watch([search, statusFilter, vendorFilter], () => { clearTimeout(timer); timer = setTimeout(reload, 300); });

// ── Create / edit ───────────────────────────────────────────────────────────
const showForm = ref(false);
const editingNumber = ref('');
const form = useForm({ id: null, vendor_id: '', expected_at: '', notes: '', lines: [] });

const openCreate = () => {
  form.reset(); form.clearErrors();
  form.lines = [{ ingredient_id: '', quantity: null, unit_cost: null }];
  editingNumber.value = '';
  showForm.value = true;
};

const openEdit = row => {
  form.clearErrors();
  form.id = row.id;
  form.vendor_id = row.vendor_id;
  form.expected_at = row.expected_at ?? '';
  form.notes = row.notes ?? '';
  form.lines = row.lines.map(l => ({
    ingredient_id: l.ingredient_id,
    quantity: l.quantity,
    unit_cost: l.unit_cost,
  }));
  editingNumber.value = row.po_number;
  showForm.value = true;
};

const addLine = () => form.lines.push({ ingredient_id: '', quantity: null, unit_cost: null });
const removeLine = i => form.lines.splice(i, 1);

const validLines = computed(() => form.lines.filter(l => l.ingredient_id && Number(l.quantity) > 0));

const save = () => {
  const lines = validLines.value.map(l => ({
    ingredient_id: l.ingredient_id,
    quantity: l.quantity,
    unit_cost: Number(l.unit_cost || 0),
  }));

  const opts = { preserveScroll: true, onSuccess: () => (showForm.value = false) };
  const payload = () => ({
    vendor_id: form.vendor_id,
    expected_at: form.expected_at || null,
    notes: form.notes || null,
    lines,
  });

  if (form.id) form.transform(payload).put(`/procurement/purchase-orders/${form.id}`, opts);
  else form.transform(payload).post('/procurement/purchase-orders', opts);
};

// ── View ────────────────────────────────────────────────────────────────────
const showView = ref(false);
const viewing = ref(null);
const openView = row => { viewing.value = row; showView.value = true; };

// ── Send / cancel / delete ──────────────────────────────────────────────────
const send = async row => {
  if (!(await confirmDialog(`Send ${row.po_number} to ${row.vendor_name}? Once sent, the lines can no longer be changed.`))) return;
  router.put(`/procurement/purchase-orders/${row.id}/order`, {}, { preserveScroll: true });
};

const showCancel = ref(false);
const cancelling = ref(null);
const cancelForm = useForm({ reason: '' });

const openCancel = row => {
  cancelling.value = row;
  cancelForm.reset(); cancelForm.clearErrors();
  showCancel.value = true;
};

const saveCancel = () => cancelForm.put(`/procurement/purchase-orders/${cancelling.value.id}/cancel`, {
  preserveScroll: true,
  onSuccess: () => (showCancel.value = false),
});

const del = async row => {
  if (!(await confirmDialog(`Delete draft ${row.po_number}? Nothing has been committed, so this cannot be recovered.`))) return;
  router.delete(`/procurement/purchase-orders/${row.id}`, { preserveScroll: true });
};

// ── Helpers ─────────────────────────────────────────────────────────────────
const ingredientMap = computed(() => {
  const map = {};
  props.ingredients.forEach(i => { map[i.id] = i; });
  return map;
});
const unitOf = id => ingredientMap.value[id]?.unit ?? '';

const lineTotal = line => Math.round(Number(line.quantity || 0) * Number(line.unit_cost || 0) * 100) / 100;
const orderTotal = computed(() => Math.round(form.lines.reduce((sum, l) => sum + lineTotal(l), 0) * 100) / 100);

const selectedVendorTerms = computed(() =>
  props.vendors.find(v => String(v.id) === String(form.vendor_id))?.payment_terms ?? '');

// The received-vs-ordered tally would be ambiguous with the same ingredient twice.
const isDuplicate = (line, index) => !!line.ingredient_id
  && form.lines.some((other, i) => i < index && other.ingredient_id === line.ingredient_id);
const hasDuplicates = computed(() => form.lines.some((l, i) => isDuplicate(l, i)));

const STATUS_BADGES = {
  draft: 'ui-badge--muted',
  ordered: 'ui-badge--info',
  partially_received: 'ui-badge--warning',
  received: 'ui-badge--success',
  cancelled: 'ui-badge--danger',
};
const statusBadge = s => STATUS_BADGES[s] ?? 'ui-badge--muted';

const fmt = v => 'Rs ' + Number(v || 0).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const qty = v => Number(v || 0).toLocaleString('en-PK', { maximumFractionDigits: 4 });
const fmtDate = v => v ? new Date(v + 'T00:00:00').toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
</script>

<style scoped>
.po__kpis    { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 18px; }
.po__kpi     { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px 16px; display: flex; flex-direction: column; gap: 2px; }
.po__kpi--info   { border-left: 3px solid var(--brand, #6366f1); }
.po__kpi--ok     { border-left: 3px solid var(--success, #16a34a); }
.po__kpi--danger { border-left: 3px solid var(--danger, #dc2626); }
.po__kpi--muted  { border-left: 3px solid var(--border); }
.po__kpi-label   { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-soft); font-weight: 600; }
.po__kpi-val     { font-size: 1.5rem; font-weight: 700; }
.po__kpi-sub     { font-size: 0.72rem; color: var(--text-soft); }
.po__filters { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.po__search  { flex: 1; max-width: 300px; }
.po__muted   { color: var(--text-soft); }
.po__sub     { display: block; font-size: 0.72rem; color: var(--text-soft); }
.po__pill    { margin-left: 6px; }
.po__neg     { color: var(--danger, #dc2626); font-weight: 600; }
.po__warn    { color: var(--warning, #d97706); font-weight: 600; }
.po__right   { text-align: right; }
.po__hint    { font-size: 0.78rem; color: var(--text-soft); margin: 10px 0 0; line-height: 1.5; }
.po__terms   { font-size: 0.78rem; color: var(--text-soft); margin: 0 0 12px; }
.po__table   { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
.po__table th { text-align: left; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-soft); padding: 6px 8px; border-bottom: 1px solid var(--border); }
.po__table td { padding: 6px 8px; border-bottom: 1px solid var(--border); vertical-align: top; }
.po__table th.po__right, .po__table td.po__right { text-align: right; }
.po__table tfoot td { border-bottom: 0; padding-top: 10px; }
.po__empty   { text-align: center; padding: 18px 8px; }
.po__qty     { display: flex; align-items: center; gap: 6px; }
.po__unit    { font-size: 0.74rem; color: var(--text-soft); white-space: nowrap; }
.po__add     { margin: 12px 0 16px; }
.po__err     { color: var(--danger, #dc2626); font-size: 0.74rem; display: block; margin-top: 4px; }
.po__meta      { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 12px 14px; margin-bottom: 16px; font-size: 0.85rem; }
.po__meta > div { display: flex; flex-direction: column; gap: 2px; }
.po__meta-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-soft); font-weight: 600; }
.po__notes   { margin-top: 16px; font-size: 0.82rem; }
.form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; }
@media (max-width: 900px) { .po__kpis { grid-template-columns: repeat(2, 1fr); } .po__meta { grid-template-columns: 1fr 1fr; } .form-grid-2 { grid-template-columns: 1fr; } }
</style>
