<template>
  <div class="page">
    <PageHeader title="Orders" subtitle="View, update and delete placed orders.">
      <template #actions>
        <button class="ui-btn ui-btn--ghost" @click="refresh">Refresh</button>
        <Link v-if="can('pos.view')" href="/pos" class="ui-btn ui-btn--primary">+ New Order</Link>
      </template>
    </PageHeader>

    <div v-if="flashError" class="ui-alert ui-alert--danger">{{ flashError }}</div>

    <div class="stat-grid">
      <StatCard label="Total Orders" :value="stats.total" />
      <StatCard label="Paid" :value="stats.paid" />
      <StatCard label="Unpaid" :value="stats.total - stats.paid" />
      <StatCard label="Revenue" :value="money(stats.revenue)" />
    </div>

    <DataTable
      :columns="columns"
      :rows="orders"
      index
      searchable
      v-model:query="search"
      search-placeholder="Search orders…"
      empty-text="No orders found."
    >
      <template #cell:customer_name="{ row }">
        {{ row.customer?.name || "Guest" }}
      </template>
      <template #cell:type="{ value }">{{ typeLabel(value) }}</template>
      <template #cell:status="{ value }">
        <span class="ui-badge" :class="statusClass(value)">{{ value || "—" }}</span>
      </template>
      <template #cell:paid="{ value }">
        <span class="ui-badge" :class="value ? 'ui-badge--success' : 'ui-badge--muted'">
          {{ value ? "Paid" : "Unpaid" }}
        </span>
      </template>
      <template #cell:order_datetime="{ value }">{{ dateTime(value) }}</template>
      <template #cell:grand_total="{ value }">{{ money(value) }}</template>

      <template #actions="{ row }">
        <button class="ui-btn ui-btn--ghost ui-btn--sm" @click="viewOrder(row)">View</button>
        <button class="ui-btn ui-btn--ghost ui-btn--sm" @click="openReceipt(row.id)">Receipt</button>
        <button v-if="can('orders.update')" class="ui-btn ui-btn--ghost ui-btn--sm" @click="editOrder(row)">Edit</button>
        <button v-if="can('orders.delete')" class="ui-btn ui-btn--danger ui-btn--sm" @click="deleteOrder(row.id)">Delete</button>
      </template>
    </DataTable>

    <Pagination :paginator="props.orders" :only="['orders', 'stats']" />

    <!-- ── View ─────────────────────────────────────────────── -->
    <Modal v-model="showView" :title="`Order #${viewing?.id ?? ''}`" width="620px">
      <div v-if="viewing">
        <div class="ord-meta">
          <div><span>Customer</span><strong>{{ viewing.customer?.name || "Guest" }}</strong></div>
          <div><span>Type</span><strong>{{ typeLabel(viewing.type) }}</strong></div>
          <div><span>Status</span><strong>{{ viewing.status || "—" }}</strong></div>
          <div><span>Paid</span><strong>{{ viewing.paid ? "Yes" : "No" }}</strong></div>
          <div><span>Place</span><strong>{{ placeName(viewing.place_id) }}</strong></div>
          <div><span>Placed</span><strong>{{ dateTime(viewing.order_datetime) }}</strong></div>
        </div>

        <table class="data-table ord-items">
          <thead>
            <tr>
              <th>Item</th>
              <th style="text-align: center">Qty</th>
              <th style="text-align: right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!(viewing.order_items || []).length">
              <td colspan="3" class="data-table__empty">No items on this order.</td>
            </tr>
            <tr v-for="it in viewing.order_items || []" :key="it.id">
              <td>
                {{ itemName(it.fooditems_id) }}
                <small v-if="it.add_note" class="ord-note">{{ it.add_note }}</small>
              </td>
              <td style="text-align: center">{{ it.quantity }}</td>
              <td style="text-align: right">{{ money(it.sub_total) }}</td>
            </tr>
          </tbody>
        </table>

        <div class="ord-totals">
          <div><span>Subtotal</span><span>{{ money(viewing.subtotal) }}</span></div>
          <div><span>Discount ({{ viewing.discount_type }})</span><span>− {{ money(viewing.discount_amount) }}</span></div>
          <div v-if="num(viewing.promo_discount) > 0">
            <span>Promo · {{ viewing.promo_code?.code ?? "code" }}</span>
            <span>− {{ money(viewing.promo_discount) }}</span>
          </div>
          <div v-if="num(viewing.loyalty_discount) > 0">
            <span>Points redeemed · {{ viewing.loyalty_points_redeemed }}</span>
            <span>− {{ money(viewing.loyalty_discount) }}</span>
          </div>
          <div><span>Service charge ({{ viewing.service_charges_percentage }}%)</span><span>+ {{ money(viewing.service_charges) }}</span></div>
          <div class="ord-totals__grand"><span>Grand Total</span><span>{{ money(viewing.grand_total) }}</span></div>
          <p v-if="num(viewing.loyalty_points_earned) > 0" class="ord-totals__note ord-totals__note--ok">
            Earned {{ viewing.loyalty_points_earned }} loyalty point(s).
          </p>
        </div>
      </div>

      <template #footer>
        <button class="ui-btn ui-btn--ghost" @click="showView = false">Close</button>
        <button class="ui-btn ui-btn--ghost" @click="openReceipt(viewing.id)">Receipt</button>
        <button v-if="can('orders.update')" class="ui-btn ui-btn--primary" @click="editOrder(viewing)">Edit</button>
      </template>
    </Modal>

    <!-- ── Edit ─────────────────────────────────────────────── -->
    <Modal v-model="showEdit" :title="`Edit Order #${form.id ?? ''}`" width="620px">
      <div v-if="saveError" class="ui-alert ui-alert--danger">{{ saveError }}</div>

      <div class="ord-fields">
        <FormField v-model="form.type" label="Order Type" type="select">
          <option value="dining">Dining</option>
          <option value="delivery">Delivery</option>
          <option value="on-way">On the way</option>
        </FormField>

        <FormField v-model="form.status" label="Status" type="select">
          <option value="pending">Pending</option>
          <option value="preparing">Preparing</option>
          <option value="on-way">On the way</option>
          <option value="completed">Completed</option>
        </FormField>

        <FormField v-model="form.place_id" label="Place" type="select">
          <option value="">— Select place —</option>
          <option v-for="p in places" :key="p.id" :value="p.id">{{ p.name }}</option>
        </FormField>

        <CustomerPicker
          v-model="form.customer_id"
          :label="customerRequired ? 'Customer (required)' : 'Customer (optional)'"
          :initial-name="editingCustomerName"
          placeholder="Search customer by name or phone…"
        />

        <FormField v-model="form.discount_type" label="Discount Type" type="select">
          <option value="amount">Amount</option>
          <option value="percentage">Percentage</option>
        </FormField>

        <FormField
          v-model="form.discount_amount"
          :label="form.discount_type === 'percentage' ? 'Discount (%)' : 'Discount (amount)'"
          type="number"
          step="0.01"
        />

        <FormField
          v-model="form.service_charges_percentage"
          label="Service Charge (%)"
          type="number"
          step="0.01"
        />

        <FormField v-model="form.paid" label="Paid" type="select">
          <option :value="true">Yes</option>
          <option :value="false">No</option>
        </FormField>
      </div>

      <div class="ord-lines">
        <div class="ord-lines__title">Items</div>
        <p v-if="!form.items.length" class="ord-hint">
          This order has no items. Add at least one before saving.
        </p>

        <div v-for="line in form.items" :key="line.fooditems_id" class="ord-line">
          <div class="ord-line__left">
            <span class="ord-line__name">{{ line.name }}</span>
            <select v-model="line.kds_station_id" class="ui-select ord-line__station">
              <option :value="null">Auto KDS station</option>
              <option v-for="s in kdsStations" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
          </div>
          <div class="ord-qty">
            <button type="button" aria-label="Decrease quantity" @click="bump(line, -1)">−</button>
            <span>{{ line.quantity }}</span>
            <button type="button" aria-label="Increase quantity" @click="bump(line, 1)">+</button>
          </div>
          <span class="ord-line__sub">{{ money(lineTotal(line)) }}</span>
          <button
            class="ord-line__x"
            type="button"
            :aria-label="`Remove ${line.name}`"
            @click="removeLine(line.fooditems_id)"
          >
            ×
          </button>
        </div>

        <div class="ord-add">
          <select v-model="addItemId" class="ui-select" aria-label="Add item to order">
            <option value="">+ Add item…</option>
            <option v-for="i in items" :key="i.id" :value="i.id">
              {{ i.name }} — {{ money(i.price) }}
            </option>
          </select>
          <button class="ui-btn ui-btn--ghost ui-btn--sm" :disabled="!addItemId" @click="addLine">
            Add
          </button>
        </div>
      </div>

      <div v-if="form.promo_code || num(form.redeem_points) > 0" class="ord-crm">
        <div v-if="form.promo_code" class="ord-crm__row">
          <span>Promo <strong>{{ form.promo_code }}</strong> stays applied and is re-priced on save.</span>
          <button class="ui-btn ui-btn--ghost ui-btn--sm" @click="form.promo_code = ''">Remove</button>
        </div>
        <div v-if="num(form.redeem_points) > 0" class="ord-crm__row">
          <span><strong>{{ form.redeem_points }}</strong> point(s) stay redeemed against this order.</span>
          <button class="ui-btn ui-btn--ghost ui-btn--sm" @click="form.redeem_points = 0">Refund</button>
        </div>
      </div>

      <div class="ord-totals">
        <div><span>Subtotal</span><span>{{ money(subtotal) }}</span></div>
        <div><span>Discount</span><span>− {{ money(discountValue) }}</span></div>
        <div><span>Service charge</span><span>+ {{ money(serviceCharges) }}</span></div>
        <div class="ord-totals__grand"><span>Grand Total</span><span>{{ money(grandTotal) }}</span></div>
        <p v-if="form.promo_code || num(form.redeem_points) > 0" class="ord-totals__note">
          The promo and points discounts are added by the server, so the saved total lands below this figure.
        </p>
      </div>

      <template #footer>
        <button class="ui-btn ui-btn--ghost" @click="showEdit = false">Cancel</button>
        <button class="ui-btn ui-btn--primary" :disabled="saving" @click="saveOrder">
          {{ saving ? "Saving…" : "Save Changes" }}
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { confirmDialog } from "../composables/useNotifications";
import { ref, computed, watch } from "vue";
import { Link, router } from "@inertiajs/vue3";
import PageHeader from "../components/ui/PageHeader.vue";
import DataTable from "../components/ui/DataTable.vue";
import Pagination from "../components/ui/Pagination.vue";
import StatCard from "../components/ui/StatCard.vue";
import Modal from "../components/ui/Modal.vue";
import FormField from "../components/ui/FormField.vue";
import CustomerPicker from "../components/ui/CustomerPicker.vue";
import AdminLayout from "../layouts/AdminLayout.vue";
import { usePermissions } from "../composables/usePermissions";

defineOptions({ layout: AdminLayout });

const { can } = usePermissions();

// The current page of orders arrives as a Laravel paginator (with order_items +
// customer eager-loaded); the stat cards read `stats`, a server-side aggregate
// over the whole filtered set so they stay accurate across pages. The menu
// items and places arrive as plain arrays. The customer list is NOT shipped —
// the edit modal resolves customers on demand through CustomerPicker.
const props = defineProps({
  orders: { type: Object, default: () => ({ data: [] }) },
  stats: { type: Object, default: () => ({ total: 0, paid: 0, revenue: 0 }) },
  foodItems: { type: Array, default: () => [] },
  places: { type: Array, default: () => [] },
  kdsStations: { type: Array, default: () => [] },
  filters: { type: Object, default: () => ({ search: "" }) },
});

const money = (v) => `Rs ${Number(v || 0).toFixed(2)}`;
const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
const dateTime = (v) => (v ? new Date(v).toLocaleString() : "—");

const TYPE_LABELS = { delivery: "Delivery", dining: "Dining", "on-way": "On the way" };
const typeLabel = (t) => TYPE_LABELS[t] || t || "—";

const statusClass = (s) => {
  const v = String(s || "").toLowerCase();
  if (["completed", "paid", "done"].includes(v)) return "ui-badge--success";
  if (["on-way", "on the way", "delivering", "shipped"].includes(v)) return "ui-badge--warning";
  if (["preparing", "pending", "processing", "in progress"].includes(v)) return "ui-badge--info";
  return "ui-badge--muted";
};

const columns = [
  { key: "id", label: "Order", width: "80px" },
  { key: "customer_name", label: "Customer" },
  { key: "type", label: "Type" },
  { key: "status", label: "Status" },
  { key: "paid", label: "Payment" },
  { key: "qty", label: "Qty", width: "70px" },
  { key: "order_datetime", label: "Placed" },
  { key: "grand_total", label: "Total" },
];

// Reactive views over the props. The controller ships newest-first already.
const orders = computed(() => props.orders?.data ?? []);
const stats = computed(() => props.stats);
const items = computed(() => props.foodItems);
const places = computed(() => props.places);
const flashError = ref("");

// Server-driven search: a debounced partial reload re-runs the paginated query
// and its aggregates (only the `orders`/`stats` props) with the new term.
const search = ref(props.filters?.search ?? "");
let searchTimer = null;
watch(search, (value) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    router.get(
      "/orders",
      { search: value || undefined },
      { preserveState: true, preserveScroll: true, replace: true, only: ["orders", "stats", "filters"] }
    );
  }, 300);
});

const itemName = (id) => items.value.find((i) => i.id === id)?.name || `Item #${id}`;
const placeName = (id) => places.value.find((p) => p.id === id)?.name || "—";

// A partial reload refreshes the current page + aggregates without a full nav.
const refresh = () => router.reload({ only: ["orders", "stats"] });

const openReceipt = (id) => {
  if (!id) return;
  window.open(`/orders/${id}/receipt`, "_blank", "noopener,noreferrer");
};

// ── View ───────────────────────────────────────────────────────────────────
const showView = ref(false);
const viewing = ref(null);

const viewOrder = (row) => {
  // Rows already carry order_items + customer from the index eager-load.
  viewing.value = row;
  showView.value = true;
};

// ── Edit ───────────────────────────────────────────────────────────────────
const showEdit = ref(false);
const saving = ref(false);
const saveError = ref("");
const addItemId = ref("");
// Seeds the CustomerPicker label when editing an order that has a customer.
const editingCustomerName = ref("");

const form = ref({
  id: null,
  type: "dining",
  status: "pending",
  place_id: "",
  customer_id: "",
  paid: false,
  discount_type: "amount",
  discount_amount: 0,
  service_charges_percentage: 0,
  order_datetime: "",
  items: [],
  // Carried through the edit so saving an unrelated field doesn't silently strip
  // the order's promo code or refund its redeemed points. Clearing either is an
  // explicit act — the buttons in the modal.
  promo_code: "",
  redeem_points: 0,
});

const customerRequired = computed(() => form.value.type === "delivery");
const lineTotal = (line) => num(line.price) * num(line.quantity);

const subtotal = computed(() => form.value.items.reduce((s, l) => s + lineTotal(l), 0));

const discountValue = computed(() => {
  const d = num(form.value.discount_amount);
  if (form.value.discount_type === "percentage") {
    return Math.min(subtotal.value, (subtotal.value * d) / 100);
  }
  return Math.min(subtotal.value, d);
});

const serviceCharges = computed(
  () => ((subtotal.value - discountValue.value) * num(form.value.service_charges_percentage)) / 100
);

const grandTotal = computed(() =>
  Math.max(0, subtotal.value - discountValue.value + serviceCharges.value)
);

const editOrder = (row) => {
  if (!row) return;
  saveError.value = "";
  addItemId.value = "";
  showView.value = false;

  // The row already carries order_items + customer from the index eager-load.
  const order = row;
  editingCustomerName.value = order.customer?.name || "";

  form.value = {
    id: order.id,
    type: order.type || "dining",
    status: order.status || "pending",
    place_id: order.place_id ?? "",
    customer_id: order.customer_id ?? "",
    paid: !!order.paid,
    discount_type: order.discount_type || "amount",
    // Stored as a resolved amount; percentage mode would re-apply it, so start from amount.
    discount_amount: num(order.discount_amount),
    service_charges_percentage: num(order.service_charges_percentage),
    order_datetime: order.order_datetime || "",
    promo_code: order.promo_code?.code ?? "",
    redeem_points: num(order.loyalty_points_redeemed),
    items: (order.order_items || []).map((it) => {
      const menuItem = items.value.find((i) => i.id === it.fooditems_id);
      const qty = num(it.quantity) || 1;
      return {
        fooditems_id: it.fooditems_id,
        category_id: it.category_id ?? menuItem?.foodcategory_id,
        name: menuItem?.name || `Item #${it.fooditems_id}`,
        // Prefer the price actually charged; fall back to the current menu price.
        price: num(it.sub_total) ? num(it.sub_total) / qty : num(menuItem?.price),
        quantity: qty,
        add_note: it.add_note || "",
        kds_station_id: it.kds_station_id ?? null,
      };
    }),
  };

  // Editing a stored amount under percentage mode would double-apply it.
  if (form.value.discount_type === "percentage") form.value.discount_type = "amount";

  showEdit.value = true;
};

const bump = (line, delta) => {
  const next = line.quantity + delta;
  if (next < 1) {
    removeLine(line.fooditems_id);
    return;
  }
  line.quantity = next;
};

const removeLine = (id) => {
  form.value.items = form.value.items.filter((l) => l.fooditems_id !== id);
};

const addLine = () => {
  const id = Number(addItemId.value);
  if (!id) return;
  const existing = form.value.items.find((l) => l.fooditems_id === id);
  if (existing) {
    existing.quantity += 1;
  } else {
    const menuItem = items.value.find((i) => i.id === id);
    if (!menuItem) return;
    form.value.items.push({
      fooditems_id: menuItem.id,
      category_id: menuItem.foodcategory_id,
      name: menuItem.name,
      price: num(menuItem.price),
      quantity: 1,
      add_note: "",
      kds_station_id: null,
    });
  }
  addItemId.value = "";
};

// MySQL DATETIME — toISOString() would send UTC and shift the stored date.
const toApiDate = (v) => {
  const d = v ? new Date(v) : new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(
    d.getMinutes()
  )}:${p(d.getSeconds())}`;
};

const saveOrder = () => {
  saveError.value = "";

  if (!form.value.items.length) {
    saveError.value = "An order needs at least one item.";
    return;
  }
  if (!form.value.place_id) {
    saveError.value = "Please select a place.";
    return;
  }
  if (customerRequired.value && !form.value.customer_id) {
    saveError.value = "Delivery orders require a customer.";
    return;
  }

  const payload = {
    order_datetime: toApiDate(form.value.order_datetime),
    status: form.value.status,
    paid: !!form.value.paid,
    type: form.value.type,
    qty: form.value.items.reduce((s, l) => s + num(l.quantity), 0),
    subtotal: Number(subtotal.value.toFixed(2)),
    discount_type: form.value.discount_type,
    discount_amount: Number(discountValue.value.toFixed(2)),
    service_charges: Number(serviceCharges.value.toFixed(2)),
    service_charges_percentage: Number(num(form.value.service_charges_percentage).toFixed(2)),
    grand_total: Number(grandTotal.value.toFixed(2)),
    place_id: Number(form.value.place_id),
    order_items: form.value.items.map((l) => ({
      fooditems_id: l.fooditems_id,
      category_id: l.category_id,
      quantity: l.quantity,
      discount_amount: 0,
      sub_total: Number(lineTotal(l).toFixed(2)),
      add_note: l.add_note || "",
      kds_station_id: l.kds_station_id ?? null,
    })),
  };

  // `customer_id` is validated with `exists:customers,id` and no `nullable`,
  // so sending null fails — omit the key entirely for guest orders.
  if (form.value.customer_id) payload.customer_id = Number(form.value.customer_id);
  // Re-priced server-side against the edited bill: a percentage code follows the
  // new subtotal, and a code that no longer qualifies comes back as an error.
  if (form.value.promo_code) payload.promo_code = form.value.promo_code;
  if (num(form.value.redeem_points) > 0) payload.redeem_points = num(form.value.redeem_points);

  saving.value = true;
  router.put(`/orders/${form.value.id}`, payload, {
    preserveScroll: true,
    onSuccess: () => {
      showEdit.value = false;
    },
    onError: (errors) => {
      saveError.value = Object.values(errors).flat().join(" ") ||
        "Could not update the order. Please try again.";
    },
    onFinish: () => {
      saving.value = false;
    },
  });
};

// ── Delete ─────────────────────────────────────────────────────────────────
const deleteOrder = async (id) => {
  if (!(await confirmDialog(`Delete order #${id}? It will show under "Deleted Orders" on the dashboard.`))) return;
  router.delete(`/orders/${id}`, {
    preserveScroll: true,
    onError: () => {
      flashError.value = "Failed to delete the order.";
    },
  });
};
</script>

<style scoped>
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  margin-bottom: 24px;
}

.ord-hint {
  color: var(--text-soft);
  font-size: 0.875rem;
  padding: 8px 0;
}

.ord-meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 18px;
  margin-bottom: 18px;
}

.ord-meta > div {
  display: flex;
  flex-direction: column;
}

.ord-meta span {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-soft);
}

.ord-items {
  width: 100%;
  margin-bottom: 16px;
}

.ord-note {
  display: block;
  color: var(--text-soft);
  font-size: 0.75rem;
}

.ord-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 14px;
}

.ord-lines {
  border-top: 1px solid var(--border);
  padding-top: 14px;
  margin-top: 6px;
}

.ord-lines__title {
  font-weight: 700;
  font-size: 0.85rem;
  margin-bottom: 10px;
}

.ord-line {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 0;
  border-bottom: 1px solid var(--border);
}

.ord-line__name {
  flex: 1;
  font-size: 0.875rem;
}

.ord-line__left {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ord-line__station {
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid var(--border, #e2e8f0);
  background: var(--surface-2, #f8fafc);
  color: var(--text, #1e293b);
  max-width: 180px;
}

.ord-line__sub {
  font-weight: 600;
  font-size: 0.875rem;
  min-width: 70px;
  text-align: right;
}

.ord-line__x {
  border: 0;
  background: transparent;
  color: var(--danger, #dc2626);
  font-size: 1.1rem;
  line-height: 1;
  cursor: pointer;
}

.ord-qty {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.ord-qty button {
  border: 0;
  background: transparent;
  color: var(--text);
  width: 26px;
  height: 26px;
  cursor: pointer;
}

.ord-qty span {
  min-width: 26px;
  text-align: center;
  font-size: 0.8rem;
}

.ord-add {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.ord-add .ui-select {
  flex: 1;
}

.ord-totals {
  border-top: 1px solid var(--border);
  margin-top: 14px;
  padding-top: 12px;
}

.ord-totals > div {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  padding: 3px 0;
}

.ord-totals__grand {
  border-top: 1px solid var(--border);
  margin-top: 6px;
  padding-top: 9px;
  font-size: 1.05rem;
  font-weight: 700;
}

.ord-totals__note {
  margin: 8px 0 0;
  font-size: 0.78rem;
  color: var(--text-muted);
}

.ord-totals__note--ok {
  color: var(--success);
}

.ord-crm {
  margin-top: 14px;
  padding: 10px 12px;
  border: 1px dashed var(--border-strong);
  border-radius: var(--radius-sm);
  background: var(--surface-2);
}

.ord-crm__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-size: 0.82rem;
  color: var(--text-soft);
  padding: 3px 0;
}

@media (max-width: 900px) {
  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .ord-fields,
  .ord-meta {
    grid-template-columns: 1fr;
  }
}
</style>
