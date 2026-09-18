<template>
  <div class="page">
    <PageHeader
      title="Goods Receipts"
      subtitle="Booking a delivery is the only action that raises stock and re-values an ingredient — every dish's food cost moves off the back of this screen. That is why receipts are never edited or deleted; corrections go through a stock take or a write-off."
    >
      <template #actions>
        <Link href="/procurement/purchase-orders" class="ui-btn ui-btn--secondary">Purchase Orders</Link>
        <button v-if="can('procurement.goods-receipts.create')" class="ui-btn ui-btn--primary" @click="openBook()">
          + Book Delivery
        </button>
      </template>
    </PageHeader>

    <!-- Summary strip -->
    <div class="gr__kpis">
      <div class="gr__kpi gr__kpi--ok">
        <span class="gr__kpi-label">Received This Month</span>
        <span class="gr__kpi-val">{{ fmt(props.summary.spend_this_month) }}</span>
        <span class="gr__kpi-sub">{{ props.summary.this_month }} delivery(s)</span>
      </div>
      <div class="gr__kpi gr__kpi--info">
        <span class="gr__kpi-label">Awaiting Delivery</span>
        <span class="gr__kpi-val">{{ props.summary.awaiting_delivery }}</span>
        <span class="gr__kpi-sub">purchase orders still open</span>
      </div>
      <div class="gr__kpi" :class="props.summary.ad_hoc_this_month > 0 ? 'gr__kpi--warn' : 'gr__kpi--muted'">
        <span class="gr__kpi-label">Ad Hoc This Month</span>
        <span class="gr__kpi-val">{{ props.summary.ad_hoc_this_month }}</span>
        <span class="gr__kpi-sub">booked with no purchase order</span>
      </div>
    </div>

    <!-- Open purchase orders awaiting a delivery -->
    <section v-if="props.openOrders.length" class="gr__open">
      <h3 class="gr__open-title">Expected Deliveries</h3>
      <div class="gr__open-grid">
        <article v-for="order in props.openOrders" :key="order.id" class="gr__card" :class="{ 'gr__card--late': order.is_overdue }">
          <header class="gr__card-head">
            <strong>{{ order.po_number }}</strong>
            <span v-if="order.is_overdue" class="ui-badge ui-badge--danger">Overdue</span>
            <span v-else class="ui-badge ui-badge--info">Expected {{ fmtDate(order.expected_at) }}</span>
          </header>
          <p class="gr__card-vendor">{{ order.vendor_name }}</p>
          <p class="gr__card-lines">
            {{ order.lines.length }} line(s) outstanding · {{ fmt(outstandingValue(order)) }}
          </p>
          <footer v-if="can('procurement.goods-receipts.create')" class="gr__card-foot">
            <button class="ui-btn ui-btn--primary ui-btn--sm" @click="openBook(order)">Book Delivery</button>
            <button class="ui-btn ui-btn--ghost ui-btn--sm" @click="openFull(order)">Receive In Full</button>
          </footer>
        </article>
      </div>
    </section>

    <!-- Filters -->
    <div class="gr__filters">
      <input v-model="search" class="ui-input gr__search" placeholder="Search GRN / invoice / vendor…" />
      <select v-model="vendorFilter" class="ui-input" style="width:210px">
        <option value="">All Vendors</option>
        <option v-for="v in props.vendors" :key="v.id" :value="v.id">{{ v.name }}</option>
      </select>
    </div>

    <DataTable
      :columns="columns"
      :rows="receipts"
      empty-text="No deliveries booked at this outlet yet."
    >
      <template #cell:grn_number="{ row }">
        <strong>{{ row.grn_number }}</strong>
        <span class="gr__sub">{{ row.line_count }} line(s)</span>
      </template>

      <template #cell:vendor_name="{ row }">
        {{ row.vendor_name || '—' }}
        <span v-if="row.created_by_name" class="gr__sub">by {{ row.created_by_name }}</span>
      </template>

      <template #cell:po_number="{ value }">
        <span v-if="value">{{ value }}</span>
        <span v-else class="ui-badge ui-badge--muted">Ad hoc</span>
      </template>

      <template #cell:invoice_number="{ value }">
        <span v-if="value">{{ value }}</span>
        <span v-else class="gr__muted">—</span>
      </template>

      <template #cell:received_at="{ value }">{{ fmtDate(value) }}</template>

      <template #cell:total="{ value }"><strong>{{ fmt(value) }}</strong></template>

      <template #actions="{ row }">
        <button class="ui-btn ui-btn--ghost ui-btn--sm" @click="openView(row)">View</button>
      </template>
    </DataTable>

    <Pagination :paginator="props.receipts" :only="['receipts', 'summary', 'openOrders']" />

    <!-- Book a delivery -->
    <Modal v-model="showBook" title="Book Delivery" width="900px">
      <FormField v-model="form.purchase_order_id" label="Against Purchase Order" type="select" :error="form.errors.purchase_order_id">
        <option value="">No purchase order (ad hoc / cash purchase)</option>
        <option v-for="o in props.openOrders" :key="o.id" :value="o.id">
          {{ o.po_number }} — {{ o.vendor_name }}
        </option>
      </FormField>

      <div class="form-grid-2">
        <FormField v-model="form.vendor_id" label="Vendor *" type="select" :readonly="!!form.purchase_order_id" :error="form.errors.vendor_id">
          <option value="">Select a vendor…</option>
          <option v-for="v in props.vendors" :key="v.id" :value="v.id">{{ v.name }}</option>
        </FormField>
        <FormField v-model="form.received_at" label="Received On *" type="date" :error="form.errors.received_at" />
        <FormField v-model="form.invoice_number" label="Invoice / DC Number" :error="form.errors.invoice_number" />
      </div>

      <table class="gr__table">
        <thead>
          <tr>
            <th style="width:32%">Ingredient</th>
            <th style="width:12%" class="gr__right">Ordered</th>
            <th style="width:18%">Received Qty</th>
            <th style="width:18%">Unit Cost</th>
            <th class="gr__right">Line Total</th>
            <th style="width:40px"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!form.lines.length">
            <td colspan="6" class="gr__muted gr__empty">
              Pick a purchase order above to pre-fill its outstanding lines, or add lines by hand.
            </td>
          </tr>
          <tr v-for="(line, i) in form.lines" :key="i">
            <td>
              <select v-model="line.ingredient_id" class="ui-input" :disabled="!!line.purchase_order_item_id">
                <option value="">Select…</option>
                <option v-for="ing in props.ingredients" :key="ing.id" :value="ing.id">{{ ing.name }}</option>
              </select>
              <span v-if="isDuplicate(line, i)" class="gr__err">Already listed above</span>
            </td>
            <td class="gr__right gr__muted">
              <template v-if="line.ordered_qty !== undefined">{{ qty(line.ordered_qty) }}</template>
              <template v-else>—</template>
            </td>
            <td>
              <div class="gr__qty">
                <input v-model.number="line.quantity" type="number" step="0.0001" min="0" class="ui-input" />
                <span class="gr__unit">{{ unitOf(line.ingredient_id) }}</span>
              </div>
              <span v-if="isShort(line)" class="gr__short">short by {{ qty(shortfall(line)) }}</span>
              <span v-else-if="isOver(line)" class="gr__over">over by {{ qty(-shortfall(line)) }}</span>
            </td>
            <td><input v-model.number="line.unit_cost" type="number" step="0.01" min="0" class="ui-input" /></td>
            <td class="gr__right"><strong>{{ fmt(lineTotal(line)) }}</strong></td>
            <td><button class="ui-btn ui-btn--danger ui-btn--sm" title="Remove line" @click="removeLine(i)">×</button></td>
          </tr>
        </tbody>
        <tfoot v-if="form.lines.length">
          <tr>
            <td colspan="4" class="gr__right"><strong>Delivery Total</strong></td>
            <td class="gr__right"><strong>{{ fmt(deliveryTotal) }}</strong></td>
            <td></td>
          </tr>
        </tfoot>
      </table>

      <p v-if="form.errors.lines" class="gr__err">{{ form.errors.lines }}</p>

      <button class="ui-btn ui-btn--secondary ui-btn--sm gr__add" @click="addLine">+ Add Line</button>

      <FormField v-model="form.notes" label="Notes" type="textarea" :error="form.errors.notes" />

      <p class="gr__hint">
        Enter what actually arrived and what the invoice actually charged — a short or over delivery is fine, and the
        outstanding quantity on the order adjusts itself. These unit costs are what re-value your stock, so each affected
        ingredient's moving average, and every dish that uses it, will change the moment this is posted.
      </p>

      <template #footer>
        <button class="ui-btn ui-btn--ghost" @click="showBook = false">Cancel</button>
        <button class="ui-btn ui-btn--primary" :disabled="form.processing || hasDuplicates || !validLines.length" @click="save">
          Post Receipt
        </button>
      </template>
    </Modal>

    <!-- Receive in full -->
    <Modal v-model="showFull" title="Receive In Full" width="560px">
      <p class="gr__hint">
        Books every outstanding line on {{ fullOrder?.po_number }} at the prices agreed on the order. Use "Book Delivery"
        instead if the quantities or the invoice differ.
      </p>

      <div class="form-grid-2">
        <FormField v-model="fullForm.received_at" label="Received On *" type="date" :error="fullForm.errors.received_at" />
        <FormField v-model="fullForm.invoice_number" label="Invoice / DC Number" :error="fullForm.errors.invoice_number" />
      </div>

      <table v-if="fullOrder" class="gr__table">
        <thead>
          <tr>
            <th>Ingredient</th>
            <th class="gr__right">Quantity</th>
            <th class="gr__right">Unit Cost</th>
            <th class="gr__right">Line Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="line in fullOrder.lines" :key="line.purchase_order_item_id">
            <td>{{ line.name }}</td>
            <td class="gr__right">{{ qty(line.quantity) }} {{ line.unit }}</td>
            <td class="gr__right gr__muted">{{ fmt(line.unit_cost) }}</td>
            <td class="gr__right"><strong>{{ fmt(line.quantity * line.unit_cost) }}</strong></td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" class="gr__right"><strong>Total</strong></td>
            <td class="gr__right"><strong>{{ fmt(outstandingValue(fullOrder)) }}</strong></td>
          </tr>
        </tfoot>
      </table>

      <template #footer>
        <button class="ui-btn ui-btn--ghost" @click="showFull = false">Cancel</button>
        <button class="ui-btn ui-btn--primary" :disabled="fullForm.processing" @click="saveFull">Post Receipt</button>
      </template>
    </Modal>

    <!-- View a posted receipt -->
    <Modal v-model="showView" :title="viewing?.grn_number ?? 'Goods Receipt'" width="820px">
      <div v-if="viewing">
        <div class="gr__meta">
          <div><span class="gr__meta-label">Vendor</span><span>{{ viewing.vendor_name || '—' }}</span></div>
          <div><span class="gr__meta-label">Purchase Order</span><span>{{ viewing.po_number || 'Ad hoc' }}</span></div>
          <div><span class="gr__meta-label">Invoice</span><span>{{ viewing.invoice_number || '—' }}</span></div>
          <div><span class="gr__meta-label">Received</span><span>{{ fmtDate(viewing.received_at) }}</span></div>
          <div><span class="gr__meta-label">Booked By</span><span>{{ viewing.created_by_name || '—' }}</span></div>
          <div><span class="gr__meta-label">Total</span><span><strong>{{ fmt(viewing.total) }}</strong></span></div>
        </div>

        <table class="gr__table">
          <thead>
            <tr>
              <th>Ingredient</th>
              <th class="gr__right">Quantity</th>
              <th class="gr__right">Unit Cost</th>
              <th class="gr__right">Line Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(line, i) in viewing.lines" :key="i">
              <td>{{ line.name }}</td>
              <td class="gr__right">{{ qty(line.quantity) }} {{ line.unit }}</td>
              <td class="gr__right gr__muted">{{ fmt(line.unit_cost) }}</td>
              <td class="gr__right"><strong>{{ fmt(line.line_total) }}</strong></td>
            </tr>
          </tbody>
        </table>

        <p v-if="viewing.notes" class="gr__notes"><span class="gr__meta-label">Notes</span>{{ viewing.notes }}</p>

        <p class="gr__hint">
          Posted receipts are permanent — the costs above have already been used to value stock and to cost the orders sold
          since. Correct a mistake with a stock take or a write-off on the Stock screen.
        </p>
      </div>

      <template #footer>
        <button class="ui-btn ui-btn--ghost" @click="showView = false">Close</button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { confirmDialog } from "../../composables/useNotifications";
import { computed, onMounted, ref, watch } from 'vue';
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
  receipts:    { type: Object, default: () => ({ data: [] }) },
  openOrders:  { type: Array,  default: () => [] },
  vendors:     { type: Array,  default: () => [] },
  ingredients: { type: Array,  default: () => [] },
  summary:     { type: Object, default: () => ({ this_month: 0, spend_this_month: 0, awaiting_delivery: 0, ad_hoc_this_month: 0 }) },
  filters:     { type: Object, default: () => ({}) },
});

const columns = [
  { key: 'grn_number',     label: 'GRN' },
  { key: 'vendor_name',    label: 'Vendor' },
  { key: 'po_number',      label: 'Order' },
  { key: 'invoice_number', label: 'Invoice' },
  { key: 'received_at',    label: 'Received' },
  { key: 'total',          label: 'Total' },
];

const receipts = computed(() => props.receipts?.data ?? []);
const search = ref(props.filters?.search ?? '');
const vendorFilter = ref(props.filters?.vendor_id ?? '');

let timer = null;
const reload = () => router.get('/procurement/goods-receipts',
  { search: search.value || undefined, vendor_id: vendorFilter.value || undefined },
  { preserveState: true, preserveScroll: true, replace: true, only: ['receipts', 'summary', 'openOrders', 'filters'] });
watch([search, vendorFilter], () => { clearTimeout(timer); timer = setTimeout(reload, 300); });

// ── Book a delivery ─────────────────────────────────────────────────────────
const showBook = ref(false);
const form = useForm({
  purchase_order_id: '', vendor_id: '', invoice_number: '',
  received_at: todayLocal(), notes: '', lines: [],
});

const openBook = (order = null) => {
  form.reset(); form.clearErrors();
  form.received_at = todayLocal();
  if (order) {
    form.purchase_order_id = order.id;
    fillFromOrder(order);
  } else {
    form.lines = [blankLine()];
  }
  showBook.value = true;
};

const blankLine = () => ({ ingredient_id: '', purchase_order_item_id: null, quantity: null, unit_cost: null });

const fillFromOrder = order => {
  form.vendor_id = order.vendor_id;
  form.lines = order.lines.map(l => ({
    ingredient_id: l.ingredient_id,
    purchase_order_item_id: l.purchase_order_item_id,
    quantity: l.quantity,
    unit_cost: l.unit_cost,
    ordered_qty: l.quantity,   // display only — what the order still expects
  }));
};

// Switching the purchase order re-lines the form, because the PO's lines are the
// whole point of the pre-fill and the vendor must match the order.
watch(() => form.purchase_order_id, id => {
  if (!showBook.value) return;
  const order = props.openOrders.find(o => String(o.id) === String(id));
  if (order) fillFromOrder(order);
  else if (id === '' || id === null) form.lines = form.lines.filter(l => !l.purchase_order_item_id);
});

const addLine = () => form.lines.push(blankLine());
const removeLine = i => form.lines.splice(i, 1);

const validLines = computed(() => form.lines.filter(l => l.ingredient_id && Number(l.quantity) > 0));

const save = async () => {
  const lines = validLines.value.map(l => ({
    ingredient_id: l.ingredient_id,
    purchase_order_item_id: l.purchase_order_item_id ?? null,
    quantity: l.quantity,
    unit_cost: Number(l.unit_cost || 0),
  }));

  if (!(await confirmDialog('Post this receipt? Stock will be raised and the affected ingredients re-valued. Receipts cannot be edited afterwards.'))) return;

  form.transform(() => ({
    purchase_order_id: form.purchase_order_id || null,
    vendor_id: form.vendor_id,
    invoice_number: form.invoice_number || null,
    received_at: form.received_at,
    notes: form.notes || null,
    lines,
  })).post('/procurement/goods-receipts', {
    preserveScroll: true,
    onSuccess: () => (showBook.value = false),
  });
};

// ── Receive in full ─────────────────────────────────────────────────────────
const showFull = ref(false);
const fullOrder = ref(null);
const fullForm = useForm({ received_at: todayLocal(), invoice_number: '' });

const openFull = order => {
  fullOrder.value = order;
  fullForm.reset(); fullForm.clearErrors();
  fullForm.received_at = todayLocal();
  showFull.value = true;
};

const saveFull = async () => {
  if (!(await confirmDialog(`Book every outstanding line on ${fullOrder.value.po_number} at the ordered prices?`))) return;
  fullForm.post(`/procurement/goods-receipts/receive-po/${fullOrder.value.id}`, {
    preserveScroll: true,
    onSuccess: () => (showFull.value = false),
  });
};

// ── View ────────────────────────────────────────────────────────────────────
const showView = ref(false);
const viewing = ref(null);
const openView = row => { viewing.value = row; showView.value = true; };

// ── Deep link from the Purchase Orders page (?po=12) ────────────────────────
onMounted(() => {
  const id = new URLSearchParams(window.location.search).get('po');
  if (!id) return;
  const order = props.openOrders.find(o => String(o.id) === String(id));
  if (order) openBook(order);
});

// ── Helpers ─────────────────────────────────────────────────────────────────
const ingredientMap = computed(() => {
  const map = {};
  props.ingredients.forEach(i => { map[i.id] = i; });
  return map;
});
const unitOf = id => ingredientMap.value[id]?.unit ?? '';

const lineTotal = line => Math.round(Number(line.quantity || 0) * Number(line.unit_cost || 0) * 100) / 100;
const deliveryTotal = computed(() => Math.round(form.lines.reduce((sum, l) => sum + lineTotal(l), 0) * 100) / 100);
const outstandingValue = order => Math.round(order.lines.reduce((sum, l) => sum + l.quantity * l.unit_cost, 0) * 100) / 100;

// A short delivery is normal and leaves the balance outstanding; flagging it just
// saves the receiver wondering whether they mistyped.
const shortfall = line => line.ordered_qty === undefined
  ? 0
  : Math.round((Number(line.ordered_qty) - Number(line.quantity || 0)) * 10000) / 10000;
const isShort = line => shortfall(line) > 0;
const isOver = line => shortfall(line) < 0;

const isDuplicate = (line, index) => !!line.ingredient_id
  && form.lines.some((other, i) => i < index && other.ingredient_id === line.ingredient_id);
const hasDuplicates = computed(() => form.lines.some((l, i) => isDuplicate(l, i)));

function todayLocal() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const fmt = v => 'Rs ' + Number(v || 0).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const qty = v => Number(v || 0).toLocaleString('en-PK', { maximumFractionDigits: 4 });
const fmtDate = v => v ? new Date(v + 'T00:00:00').toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
</script>

<style scoped>
.gr__kpis    { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 18px; }
.gr__kpi     { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px 16px; display: flex; flex-direction: column; gap: 2px; }
.gr__kpi--ok    { border-left: 3px solid var(--success, #16a34a); }
.gr__kpi--info  { border-left: 3px solid var(--brand, #6366f1); }
.gr__kpi--warn  { border-left: 3px solid var(--warning, #d97706); }
.gr__kpi--muted { border-left: 3px solid var(--border); }
.gr__kpi-label  { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-soft); font-weight: 600; }
.gr__kpi-val    { font-size: 1.5rem; font-weight: 700; }
.gr__kpi-sub    { font-size: 0.72rem; color: var(--text-soft); }
.gr__open       { margin-bottom: 22px; }
.gr__open-title { font-size: 0.95rem; font-weight: 700; margin: 0 0 10px; }
.gr__open-grid  { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; }
.gr__card       { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 12px 14px; }
.gr__card--late { border-left: 3px solid var(--danger, #dc2626); }
.gr__card-head  { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px; }
.gr__card-vendor{ margin: 0; font-size: 0.85rem; }
.gr__card-lines { margin: 2px 0 10px; font-size: 0.76rem; color: var(--text-soft); }
.gr__card-foot  { display: flex; gap: 8px; }
.gr__filters { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.gr__search  { flex: 1; max-width: 320px; }
.gr__muted   { color: var(--text-soft); }
.gr__sub     { display: block; font-size: 0.72rem; color: var(--text-soft); }
.gr__right   { text-align: right; }
.gr__hint    { font-size: 0.78rem; color: var(--text-soft); margin: 10px 0 0; line-height: 1.5; }
.gr__table   { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
.gr__table th { text-align: left; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-soft); padding: 6px 8px; border-bottom: 1px solid var(--border); }
.gr__table td { padding: 6px 8px; border-bottom: 1px solid var(--border); vertical-align: top; }
.gr__table th.gr__right, .gr__table td.gr__right { text-align: right; }
.gr__table tfoot td { border-bottom: 0; padding-top: 10px; }
.gr__empty   { text-align: center; padding: 18px 8px; }
.gr__qty     { display: flex; align-items: center; gap: 6px; }
.gr__unit    { font-size: 0.74rem; color: var(--text-soft); white-space: nowrap; }
.gr__short   { display: block; font-size: 0.7rem; color: var(--warning, #d97706); margin-top: 3px; }
.gr__over    { display: block; font-size: 0.7rem; color: var(--brand, #6366f1); margin-top: 3px; }
.gr__add     { margin: 12px 0 16px; }
.gr__err     { color: var(--danger, #dc2626); font-size: 0.74rem; display: block; margin-top: 4px; }
.gr__meta      { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 12px 14px; margin-bottom: 16px; font-size: 0.85rem; }
.gr__meta > div { display: flex; flex-direction: column; gap: 2px; }
.gr__meta-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-soft); font-weight: 600; }
.gr__notes   { margin-top: 16px; font-size: 0.82rem; }
.form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; }
@media (max-width: 900px) { .gr__kpis { grid-template-columns: 1fr; } .gr__meta { grid-template-columns: 1fr 1fr; } .form-grid-2 { grid-template-columns: 1fr; } }
</style>
