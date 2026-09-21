<template>
  <div class="page">
    <PageHeader title="Dashboard" subtitle="Quick overview of your system.">
      <template #actions>
        <button class="ui-btn ui-btn--ghost" @click="exportData">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export
        </button>
        <Link href="/orders" class="ui-btn ui-btn--primary">+ New Order</Link>
      </template>
    </PageHeader>

    <!-- Report date range -->
    <div class="ui-card ui-card-pad report-filter">
      <div class="report-filter__field">
        <label class="ui-label" for="rf-start">Start date</label>
        <input id="rf-start" v-model="range.start_date" type="date" class="ui-input" />
      </div>
      <div class="report-filter__field">
        <label class="ui-label" for="rf-end">End date</label>
        <input id="rf-end" v-model="range.end_date" type="date" class="ui-input" />
      </div>
      <div class="report-filter__actions">
        <button class="ui-btn ui-btn--primary" :disabled="reportsLoading" @click="loadReports">
          {{ reportsLoading ? "Loading…" : "Apply" }}
        </button>
        <button class="ui-btn ui-btn--ghost" :disabled="reportsLoading" @click="resetRange">
          Today
        </button>
      </div>
    </div>

    <div class="stat-grid">
      <StatCard label="Users" :value="counts.users" hint="Registered accounts" color="var(--brand)" tint="var(--brand-soft)" trend="▲ 0%" trend-dir="up">
        <template #icon>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></svg>
        </template>
      </StatCard>

      <StatCard label="Customers" :value="counts.customers" hint="Active customers" color="var(--success)" tint="var(--success-soft)" trend="▲ 100%" trend-dir="up">
        <template #icon>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </template>
      </StatCard>

      <StatCard label="Food Items" :value="counts.foodItems" hint="Menu entries" color="var(--warning)" tint="var(--warning-soft)" trend="▼ —" trend-dir="down">
        <template #icon>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h0a2 2 0 0 0 2-2V2M5 2v20M17 2c-1.7 0-3 2-3 5s1.3 5 3 5v10"/></svg>
        </template>
      </StatCard>

      <StatCard label="Orders" :value="counts.orders" hint="Total placed" color="var(--info)" tint="var(--info-soft)" trend="▲ 0%" trend-dir="up">
        <template #icon>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18"/></svg>
        </template>
      </StatCard>
    </div>

    <div class="dash-grid">
      <!-- Recent orders -->
      <div class="ui-card">
        <div class="ui-card-header">
          Recent Orders
          <Link href="/orders">View all</Link>
        </div>
        <div class="data-table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Type</th>
                <th>Status</th>
                <th style="text-align: right">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="ordersLoading">
                <td colspan="5" class="data-table__empty">Loading…</td>
              </tr>
              <tr v-else-if="!recentOrders.length">
                <td colspan="5" class="data-table__empty">No orders yet.</td>
              </tr>
              <tr v-for="o in recentOrders" :key="o.id">
                <td>#{{ o.id }}</td>
                <td>{{ o.customer?.name || o.customer_name || "Guest" }}</td>
                <td>{{ typeLabel(o.type) }}</td>
                <td><span class="ui-badge" :class="statusClass(o.status)">{{ o.status || "—" }}</span></td>
                <td class="money" style="text-align: right">{{ money(o.grand_total) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Customer feedback -->
      <div class="ui-card">
        <div class="ui-card-header">
          Customer Feedback
          <Link href="/feedback">View all</Link>
        </div>
        <div class="fb__summary">
          <span class="fb__avg">{{ feedbackStats.avg_rating ?? "—" }}</span>
          <span class="fb__stars">{{ stars(feedbackStats.avg_rating) }}</span>
          <span class="fb__count">{{ feedbackStats.total }} review(s)</span>
        </div>
        <div class="fb__list">
          <p v-if="!feedback.length" class="data-table__empty" style="padding: 20px 0">No feedback yet.</p>
          <div v-for="f in feedback" :key="f.id" class="fb__row">
            <div class="fb__top">
              <span class="fb__name">{{ f.customer?.name || "Guest" }}</span>
              <span class="fb__stars">{{ stars(f.rating) }}</span>
            </div>
            <p v-if="f.comment" class="fb__comment">“{{ f.comment }}”</p>
          </div>
        </div>
      </div>

      <!-- Top categories -->
      <div class="ui-card">
        <div class="ui-card-header">Top Categories</div>
        <div class="cat">
          <p v-if="catsLoading" class="data-table__empty" style="padding: 20px 0">Loading…</p>
          <p v-else-if="!topCategories.length" class="data-table__empty" style="padding: 20px 0">No categories yet.</p>
          <div v-for="(c, i) in topCategories" :key="c.id ?? i" class="cat__row">
            <span class="cat__name">{{ c.name }}</span>
            <span class="cat__bar"><span class="cat__fill" :style="{ width: c.pct + '%', background: barColor(i) }" /></span>
            <span class="cat__val">{{ c.pct }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Reports ──────────────────────────────────────────────────── -->
    <h2 class="report-heading">Reports</h2>
    <p class="report-heading__sub">{{ rangeLabel }}</p>

    <!-- Daily summary totals by type -->
    <div class="stat-grid">
      <StatCard
        label="Total Sales"
        :value="money(summary.totalGrandTotal)"
        hint="All order types"
        color="var(--brand)"
        tint="var(--brand-soft)"
      />
      <StatCard
        label="Dining"
        :value="money(dining.totalGrandTotal)"
        :hint="`${dining.rows.length} order(s)`"
        color="var(--success)"
        tint="var(--success-soft)"
      />
      <StatCard
        label="Delivery"
        :value="money(delivery.totalGrandTotal)"
        :hint="`${delivery.rows.length} order(s)`"
        color="var(--info)"
        tint="var(--info-soft)"
      />
      <StatCard
        label="On the way"
        :value="money(onway.totalGrandTotal)"
        :hint="`${onway.rows.length} order(s)`"
        color="var(--warning)"
        tint="var(--warning-soft)"
      />
    </div>

    <div class="dash-grid">
      <!-- Sales by type breakdown -->
      <div class="ui-card">
        <div class="ui-card-header">Daily Summary by Type</div>
        <div class="data-table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Type</th>
                <th style="text-align: right">Grand Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="reportsLoading"><td colspan="2" class="data-table__empty">Loading…</td></tr>
              <tr v-else-if="!summary.ordersByType.length">
                <td colspan="2" class="data-table__empty">No sales in this range.</td>
              </tr>
              <tr v-for="(r, i) in summary.ordersByType" :key="i">
                <td>{{ typeLabel(r.type) }}</td>
                <td class="money" style="text-align: right">{{ money(r.grand_total) }}</td>
              </tr>
            </tbody>
            <tfoot v-if="summary.ordersByType.length">
              <tr>
                <th>Total</th>
                <th class="money" style="text-align: right">{{ money(summary.totalGrandTotal) }}</th>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- Category sales -->
      <div class="ui-card">
        <div class="ui-card-header">Category Sales</div>
        <div class="data-table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th style="text-align: right">Subtotal</th>
                <th style="text-align: right">Discount</th>
                <th style="text-align: right">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="reportsLoading"><td colspan="4" class="data-table__empty">Loading…</td></tr>
              <tr v-else-if="!categorySales.length">
                <td colspan="4" class="data-table__empty">No category sales in this range.</td>
              </tr>
              <tr v-for="(c, i) in categorySales" :key="i">
                <td>{{ c.category_name }}</td>
                <td class="money" style="text-align: right">{{ money(c.total_subtotal) }}</td>
                <td class="money" style="text-align: right">{{ money(c.discount_amount) }}</td>
                <td class="money" style="text-align: right">{{ money(c.grand_total) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Category sales by item quantity -->
    <div class="ui-card report-block">
      <div class="ui-card-header">
        Category Sales by Item Quantity
        <span class="report-chip">Service charges: {{ money(itemQty.service_charge_total) }}</span>
      </div>
      <div class="data-table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Category / Item</th>
              <th style="text-align: right">Qty</th>
              <th style="text-align: right">Subtotal</th>
              <th style="text-align: right">Discount</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="reportsLoading"><td colspan="4" class="data-table__empty">Loading…</td></tr>
            <tr v-else-if="!itemQty.categories.length">
              <td colspan="4" class="data-table__empty">No item sales in this range.</td>
            </tr>
            <template v-for="(cat, ci) in itemQty.categories" :key="ci">
              <tr class="report-row--group">
                <td>{{ cat.category_name }}</td>
                <td style="text-align: right">{{ cat.total_quantity }}</td>
                <td class="money" style="text-align: right">{{ money(cat.total_subtotal) }}</td>
                <td class="money" style="text-align: right">{{ money(cat.discount_amount) }}</td>
              </tr>
              <tr v-for="(it, ii) in cat.items" :key="`${ci}-${ii}`">
                <td class="report-cell--indent">{{ it.item_name }}</td>
                <td style="text-align: right">{{ it.total_quantity }}</td>
                <td class="money" style="text-align: right">{{ money(it.total_subtotal) }}</td>
                <td class="money" style="text-align: right">{{ money(it.discount_amount) }}</td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Item quantity, current date variant -->
    <div class="ui-card report-block">
      <div class="ui-card-header">
        Item Quantity (Order Date)
        <span class="report-chip">
          Service charges: {{ money(itemQtyCurrent.service_charge_total) }} ·
          Total: {{ money(itemQtyCurrent.totalGrandTotal) }}
        </span>
      </div>
      <div class="data-table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Category / Item</th>
              <th style="text-align: right">Qty</th>
              <th style="text-align: right">Subtotal</th>
              <th style="text-align: right">Discount</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="reportsLoading"><td colspan="4" class="data-table__empty">Loading…</td></tr>
            <tr v-else-if="!itemQtyCurrent.categories.length">
              <td colspan="4" class="data-table__empty">No item sales in this range.</td>
            </tr>
            <template v-for="(cat, ci) in itemQtyCurrent.categories" :key="ci">
              <tr class="report-row--group">
                <td>{{ cat.category_name }}</td>
                <td style="text-align: right">{{ cat.total_quantity }}</td>
                <td class="money" style="text-align: right">{{ money(cat.total_subtotal) }}</td>
                <td class="money" style="text-align: right">{{ money(cat.discount_amount) }}</td>
              </tr>
              <tr v-for="(it, ii) in cat.items" :key="`${ci}-${ii}`">
                <td class="report-cell--indent">{{ it.item_name }}</td>
                <td style="text-align: right">{{ it.total_quantity }}</td>
                <td class="money" style="text-align: right">{{ money(it.total_subtotal) }}</td>
                <td class="money" style="text-align: right">{{ money(it.discount_amount) }}</td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <div class="dash-grid">
      <!-- Quick report: today's orders -->
      <div class="ui-card">
        <div class="ui-card-header">
          Quick Report — Today
          <span class="report-chip">{{ quickReport.length }} order(s)</span>
        </div>
        <div class="data-table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Type</th>
                <th style="text-align: right">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="reportsLoading"><td colspan="4" class="data-table__empty">Loading…</td></tr>
              <tr v-else-if="!quickReport.length">
                <td colspan="4" class="data-table__empty">No orders today.</td>
              </tr>
              <tr v-for="o in quickReport" :key="o.id">
                <td>#{{ o.id }}</td>
                <td>{{ o.customer?.name || "Guest" }}</td>
                <td>{{ typeLabel(o.type) }}</td>
                <td class="money" style="text-align: right">{{ money(o.grand_total) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Top ten -->
      <div class="ui-card">
        <div class="ui-card-header">Top 10 Deals — Today</div>
        <div class="data-table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th style="text-align: right">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="reportsLoading"><td colspan="3" class="data-table__empty">Loading…</td></tr>
              <tr v-else-if="!topTen.length">
                <td colspan="3" class="data-table__empty">No orders today.</td>
              </tr>
              <tr v-for="o in topTen" :key="o.id">
                <td>#{{ o.id }}</td>
                <td>{{ o.customer?.name || "Guest" }}</td>
                <td class="money" style="text-align: right">{{ money(o.grand_total) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Deleted orders today -->
    <div class="ui-card report-block">
      <div class="ui-card-header">
        Deleted Orders — Today
        <span class="report-chip">{{ deletedOrders.length }} deleted</span>
      </div>
      <div class="data-table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Type</th>
              <th>Status</th>
              <th>Deleted At</th>
              <th style="text-align: right">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="reportsLoading"><td colspan="5" class="data-table__empty">Loading…</td></tr>
            <tr v-else-if="!deletedOrders.length">
              <td colspan="5" class="data-table__empty">No orders deleted today.</td>
            </tr>
            <tr v-for="o in deletedOrders" :key="o.id">
              <td>#{{ o.id }}</td>
              <td>{{ typeLabel(o.type) }}</td>
              <td><span class="ui-badge" :class="statusClass(o.status)">{{ o.status || "—" }}</span></td>
              <td>{{ dateTime(o.deleted_at) }}</td>
              <td class="money" style="text-align: right">{{ money(o.grand_total) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { router, Link } from "@inertiajs/vue3";
import AdminLayout from "../layouts/AdminLayout.vue";
import PageHeader from "../components/ui/PageHeader.vue";
import StatCard from "../components/ui/StatCard.vue";

defineOptions({ layout: AdminLayout });

const props = defineProps({
  counts: { type: Object, default: () => ({}) },
  recentOrders: { type: Array, default: () => [] },
  topCategories: { type: Array, default: () => [] },
  feedback: { type: Array, default: () => [] },
  feedbackStats: { type: Object, default: () => ({ avg_rating: null, total: 0 }) },
  range: { type: Object, default: () => ({ start_date: "", end_date: "" }) },
  reports: { type: Object, default: () => ({}) },
});

// Local, editable copy of the server-provided date range for the filter inputs.
const range = ref({ ...props.range });
const reportsLoading = ref(false);

const BAR_COLORS = ["var(--brand)", "var(--success)", "var(--info)", "var(--warning)", "var(--danger)"];
const barColor = (i) => BAR_COLORS[i % BAR_COLORS.length];

const money = (v) => (v == null || v === "" ? "—" : `Rs ${Number(v).toFixed(2)}`);

const TYPE_LABELS = { delivery: "Delivery", dining: "Dining", "on-way": "On the way" };
const typeLabel = (t) => TYPE_LABELS[t] || t || "—";

const statusClass = (s) => {
  const v = String(s || "").toLowerCase();
  if (["completed", "paid", "done"].includes(v)) return "ui-badge--success";
  if (["on-way", "on the way", "delivering", "shipped"].includes(v)) return "ui-badge--warning";
  if (["preparing", "pending", "processing", "in progress"].includes(v)) return "ui-badge--info";
  return "ui-badge--muted";
};

const dateTime = (v) => (v ? new Date(v).toLocaleString() : "—");

// ── Counts / lists (straight from props) ─────────────────────────────────────
const counts = computed(() => ({
  users: props.counts.users ?? "—",
  customers: props.counts.customers ?? "—",
  foodItems: props.counts.foodItems ?? "—",
  orders: props.counts.orders ?? "—",
}));
const recentOrders = computed(() => props.recentOrders ?? []);
const topCategories = computed(() => props.topCategories ?? []);
const feedback = computed(() => props.feedback ?? []);
const feedbackStats = computed(() => props.feedbackStats ?? { avg_rating: null, total: 0 });
const stars = (r) => "★".repeat(Math.max(0, Math.min(5, Number(r) || 0))) + "☆".repeat(5 - Math.max(0, Math.min(5, Number(r) || 0)));

// ── Report blocks (all computed from the server-rendered props) ──────────────
const summary = computed(() => ({
  ordersByType: props.reports?.summary?.ordersByType ?? [],
  totalGrandTotal: Number(props.reports?.summary?.totalGrandTotal ?? 0),
}));
const dining = computed(() => ({
  totalGrandTotal: Number(props.reports?.dining?.totalGrandTotal ?? 0),
  rows: props.reports?.dining?.rows ?? [],
}));
const delivery = computed(() => ({
  totalGrandTotal: Number(props.reports?.delivery?.totalGrandTotal ?? 0),
  rows: props.reports?.delivery?.rows ?? [],
}));
const onway = computed(() => ({
  totalGrandTotal: Number(props.reports?.onway?.totalGrandTotal ?? 0),
  rows: props.reports?.onway?.rows ?? [],
}));
const categorySales = computed(() => props.reports?.categorySales ?? []);
const itemQty = computed(() => ({
  service_charge_total: Number(props.reports?.itemQty?.service_charge_total ?? 0),
  categories: props.reports?.itemQty?.categories ?? [],
}));
const itemQtyCurrent = computed(() => ({
  service_charge_total: Number(props.reports?.itemQtyCurrent?.service_charge_total ?? 0),
  categories: props.reports?.itemQtyCurrent?.categories ?? [],
  totalGrandTotal: Number(props.reports?.itemQtyCurrent?.totalGrandTotal ?? 0),
}));
const quickReport = computed(() => props.reports?.quickReport ?? []);
const topTen = computed(() => props.reports?.topTen ?? []);
const deletedOrders = computed(() => props.reports?.deletedOrders ?? []);

// Recent-orders / categories are server-rendered, so there is no client load state.
const ordersLoading = false;
const catsLoading = false;

const today = () => {
  const date = new Date();
  const pad = (value) => String(value).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const rangeLabel = computed(() =>
  range.value.start_date === range.value.end_date
    ? range.value.start_date
    : `${range.value.start_date} → ${range.value.end_date}`
);

// Re-fetch the whole dashboard for the chosen range via an Inertia visit — the
// controller recomputes every block server-side and hands back fresh props.
const loadReports = () => {
  reportsLoading.value = true;
  router.get(
    "/",
    { start_date: range.value.start_date, end_date: range.value.end_date },
    {
      preserveState: true,
      preserveScroll: true,
      onFinish: () => (reportsLoading.value = false),
    }
  );
};

const resetRange = () => {
  range.value = { start_date: today(), end_date: today() };
  loadReports();
};

// Escape a single CSV cell: wrap in quotes and double any embedded quotes.
const csvCell = (v) => {
  const s = v == null ? "" : String(v);
  return `"${s.replace(/"/g, '""')}"`;
};
const csvRow = (cells) => cells.map(csvCell).join(",");

// Export every report section currently on the dashboard as one CSV.
// Sections are separated by a blank line and a title row so the single file
// stays readable when opened in a spreadsheet.
const exportData = () => {
  const lines = [];
  const section = (title, headers, rows) => {
    if (lines.length) lines.push(""); // blank spacer between sections
    lines.push(csvRow([title]));
    if (!rows.length) {
      lines.push(csvRow(["No data"]));
      return;
    }
    lines.push(csvRow(headers));
    rows.forEach((r) => lines.push(csvRow(r)));
  };

  // Report range + top-line counts.
  section("Report Range", ["Start", "End"], [[range.value.start_date, range.value.end_date]]);
  section(
    "Overview",
    ["Metric", "Value"],
    [
      ["Users", counts.value.users],
      ["Customers", counts.value.customers],
      ["Food Items", counts.value.foodItems],
      ["Orders", counts.value.orders],
    ]
  );

  // Recent orders.
  section(
    "Recent Orders",
    ["Order", "Customer", "Type", "Status", "Total"],
    recentOrders.value.map((o) => [
      `#${o.id}`,
      o.customer?.name || o.customer_name || "Guest",
      typeLabel(o.type),
      o.status || "—",
      money(o.grand_total),
    ])
  );

  // Daily summary by type (with per-type totals).
  section(
    "Daily Summary by Type",
    ["Type", "Grand Total"],
    [
      ...summary.value.ordersByType.map((r) => [typeLabel(r.type), money(r.grand_total)]),
      ["Total", money(summary.value.totalGrandTotal)],
      ["Dining", money(dining.value.totalGrandTotal)],
      ["Delivery", money(delivery.value.totalGrandTotal)],
      ["On the way", money(onway.value.totalGrandTotal)],
    ]
  );

  // Category sales.
  section(
    "Category Sales",
    ["Category", "Subtotal", "Discount", "Total"],
    categorySales.value.map((c) => [
      c.category_name,
      money(c.total_subtotal),
      money(c.discount_amount),
      money(c.grand_total),
    ])
  );

  // Category sales by item quantity — flatten category groups + their items.
  const flattenItemQty = (data) => {
    const out = [];
    data.categories.forEach((cat) => {
      out.push([cat.category_name, "", cat.total_quantity, money(cat.total_subtotal), money(cat.discount_amount)]);
      (cat.items || []).forEach((it) =>
        out.push(["", it.item_name, it.total_quantity, money(it.total_subtotal), money(it.discount_amount)])
      );
    });
    return out;
  };
  section(
    `Category Sales by Item Quantity (Service charges: ${money(itemQty.value.service_charge_total)})`,
    ["Category", "Item", "Qty", "Subtotal", "Discount"],
    flattenItemQty(itemQty.value)
  );
  section(
    `Item Quantity — Order Date (Service charges: ${money(itemQtyCurrent.value.service_charge_total)}; Total: ${money(itemQtyCurrent.value.totalGrandTotal)})`,
    ["Category", "Item", "Qty", "Subtotal", "Discount"],
    flattenItemQty(itemQtyCurrent.value)
  );

  // Quick report — today.
  section(
    "Quick Report — Today",
    ["Order", "Customer", "Type", "Total"],
    quickReport.value.map((o) => [
      `#${o.id}`,
      o.customer?.name || "Guest",
      typeLabel(o.type),
      money(o.grand_total),
    ])
  );

  // Top 10 deals — today.
  section(
    "Top 10 Deals — Today",
    ["Order", "Customer", "Total"],
    topTen.value.map((o) => [`#${o.id}`, o.customer?.name || "Guest", money(o.grand_total)])
  );

  // Deleted orders — today.
  section(
    "Deleted Orders — Today",
    ["Order", "Type", "Status", "Deleted At", "Total"],
    deletedOrders.value.map((o) => [
      `#${o.id}`,
      typeLabel(o.type),
      o.status || "—",
      dateTime(o.deleted_at),
      money(o.grand_total),
    ])
  );

  const csv = lines.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `dashboard-report-${range.value.start_date}_to_${range.value.end_date}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
</script>

<style scoped>
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  margin-bottom: 24px;
}

.dash-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 18px;
}

.money {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.report-filter {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}
.report-filter__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.report-filter__actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.report-heading {
  margin: 32px 0 2px;
  font-size: 1.15rem;
}
.report-heading__sub {
  margin: 0 0 18px;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.report-block {
  margin-top: 18px;
}

.report-chip {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-muted);
}

.report-row--group td {
  font-weight: 700;
  background: var(--surface-2);
}

.report-cell--indent {
  padding-left: 28px;
  color: var(--text-muted);
}

.cat {
  padding: 18px 22px;
}
.cat__row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.cat__row:last-child {
  margin-bottom: 0;
}
.cat__name {
  font-weight: 600;
  font-size: 0.85rem;
  min-width: 90px;
}
.cat__bar {
  flex: 1;
  height: 8px;
  background: var(--surface-2);
  border-radius: 999px;
  overflow: hidden;
}
.cat__fill {
  display: block;
  height: 100%;
  border-radius: 999px;
  transition: width 0.4s ease;
}
.cat__val {
  font-size: 0.8rem;
  color: var(--text-muted);
  font-weight: 600;
  min-width: 42px;
  text-align: right;
}

/* ── Feedback card ─────────────────────────────────────────────── */
.fb__summary {
  display: flex; align-items: baseline; gap: 10px;
  padding: 12px 16px; border-bottom: 1px solid var(--border);
}
.fb__avg   { font-size: 1.6rem; font-weight: 800; }
.fb__stars { color: #f59e0b; letter-spacing: 1px; }
.fb__count { font-size: 0.78rem; color: var(--text-muted); }
.fb__list  { padding: 4px 0; }
.fb__row   { padding: 10px 16px; border-bottom: 1px solid var(--border); }
.fb__row:last-child { border-bottom: none; }
.fb__top     { display: flex; justify-content: space-between; gap: 10px; }
.fb__name    { font-weight: 600; font-size: 0.875rem; }
.fb__comment { font-size: 0.8rem; color: var(--text-muted); margin-top: 4px; }

@media (max-width: 1100px) {
  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .dash-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .stat-grid {
    grid-template-columns: 1fr;
  }
}
</style>
