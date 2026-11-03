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

    <section class="ui-card reservations-widget">
      <div class="ui-card-header">
        <span>Upcoming Reservations <span class="report-chip">{{ upcomingReservations.length }}</span></span>
        <Link href="/reservations">View all</Link>
      </div>
      <p v-if="!upcomingReservations.length" class="reservation-empty">No upcoming reservations.</p>
      <div v-else class="reservation-list">
        <article v-for="reservation in upcomingReservations" :key="reservation.id" class="reservation-row">
          <div class="reservation-row__date"><strong>{{ reservationDate(reservation.reserved_at).day }}</strong><span>{{ reservationDate(reservation.reserved_at).month }}</span></div>
          <div class="reservation-row__details"><strong>{{ reservation.guest_name }}</strong><span>{{ reservationTime(reservation.reserved_at) }} · {{ reservation.party_size }} guests · Table {{ reservation.dining_table?.table_number || '—' }}</span></div>
          <span class="ui-badge" :class="reservation.status === 'confirmed' ? 'ui-badge--success' : 'ui-badge--warning'">{{ reservation.status }}</span>
        </article>
      </div>
    </section>

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

    <section class="analytics-grid" aria-label="Sales and order analytics">
      <article class="ui-card analytics-card analytics-card--trend">
        <div class="ui-card-header">
          <div><span class="analytics-eyebrow">PERFORMANCE</span><h3>Revenue trend</h3></div>
          <span class="analytics-total">{{ money(summary.totalGrandTotal) }}</span>
        </div>
        <div v-if="reportsLoading" class="analytics-empty">Updating report…</div>
        <div v-else-if="!revenueTrend.length" class="analytics-empty">No revenue in this date range.</div>
        <div v-else class="trend-chart">
          <svg class="trend-chart__svg" viewBox="0 0 760 250" role="img" aria-label="Daily revenue trend">
            <defs>
              <linearGradient id="revenueFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stop-color="#f04b2c" stop-opacity=".24" />
                <stop offset="100%" stop-color="#f04b2c" stop-opacity="0" />
              </linearGradient>
            </defs>
            <g v-for="tick in trendTicks" :key="tick.label">
              <line x1="50" :y1="tick.y" x2="748" :y2="tick.y" class="trend-chart__grid" />
              <text x="42" :y="tick.y + 4" text-anchor="end" class="trend-chart__tick">{{ tick.label }}</text>
            </g>
            <path :d="trendAreaPath" fill="url(#revenueFill)" />
            <polyline :points="trendLinePoints" class="trend-chart__line" />
            <circle v-for="point in trendPoints" :key="point.date" :cx="point.x" :cy="point.y" r="4" class="trend-chart__point">
              <title>{{ point.label }}: {{ money(point.value) }} · {{ point.orders }} orders</title>
            </circle>
            <text v-for="label in trendDateLabels" :key="label.text" :x="label.x" y="238" text-anchor="middle" class="trend-chart__tick">{{ label.text }}</text>
          </svg>
        </div>
        <div class="trend-legend"><span class="trend-legend__dot"></span>Revenue <span class="trend-legend__unit">Daily total · PKR</span></div>
      </article>

      <article class="ui-card analytics-card analytics-card--status">
        <div class="ui-card-header">
          <div><span class="analytics-eyebrow">OPERATIONS</span><h3>Order status</h3></div>
          <span class="analytics-period">{{ rangeLabel }}</span>
        </div>
        <div v-if="reportsLoading" class="analytics-empty">Updating report…</div>
        <div v-else-if="!orderStatusTotal" class="analytics-empty">No orders in this date range.</div>
        <div v-else class="status-breakdown">
          <div v-for="item in orderStatusLegend" :key="item.label" class="status-breakdown__row">
            <div class="status-breakdown__label"><span><i :style="{ background: item.color }"></i>{{ item.label }}</span><strong>{{ item.value }} <small>{{ item.percent }}%</small></strong></div>
            <div class="status-breakdown__track"><i :style="{ width: `${item.percent}%`, background: item.color }"></i></div>
          </div>
        </div>
      </article>
    </section>

    <div class="dash-grid">
      <!-- Sales by type breakdown -->
      <div class="ui-card">
        <div class="ui-card-header">Daily Summary by Type</div>
        <div v-if="summaryTypeGraph.length" class="report-inline-chart">
          <p class="chart-caption">Share of revenue by order type</p>
          <div class="type-mix__bar" role="img" :aria-label="`${money(summary.totalGrandTotal)} sales by order type`">
            <span v-for="item in summaryTypeGraph" :key="item.label" :style="{ width: `${item.percent}%`, background: item.color }"></span>
          </div>
          <ul class="type-mix__legend">
            <li v-for="item in summaryTypeGraph" :key="item.label"><span><i :style="{ background: item.color }"></i>{{ item.label }}</span><strong>{{ money(item.value) }} <small>{{ item.percent }}%</small></strong></li>
          </ul>
        </div>
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
        <div v-if="categoryShare.length" class="category-share">
          <div class="category-share__donut" :style="{ background: categoryDonut }" role="img" :aria-label="`${money(categorySalesTotal)} category sales`">
            <div><strong>{{ compactMoney(categorySalesTotal) }}</strong><span>Total sales</span></div>
          </div>
          <ul class="category-share__legend">
            <li v-for="item in categoryShare" :key="item.label"><span><i :style="{ background: item.color }"></i>{{ item.label }}</span><strong>{{ item.percent }}%</strong></li>
          </ul>
        </div>
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
      <div v-if="itemQtyGraph.length" class="report-inline-chart">
        <p class="chart-caption">Top items by quantity</p>
        <div class="chart-bars">
          <div v-for="(row, index) in itemQtyGraph" :key="row.label" class="chart-bar-row">
            <div class="chart-bar-label"><span class="chart-dot" :class="`chart-dot--${index % 4}`"></span><span>{{ row.label }}</span><strong>{{ row.value }}</strong></div>
            <div class="chart-track"><span class="chart-fill" :class="`chart-fill--${index % 4}`" :style="{ width: `${row.percent}%` }"></span></div>
          </div>
        </div>
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
      <div v-if="currentQtyGraph.length" class="report-inline-chart">
        <p class="chart-caption">Quantity by item · Order date</p>
        <div class="chart-columns current-qty-columns">
          <div v-for="(row, index) in currentQtyGraph" :key="row.label" class="chart-column">
            <strong>{{ row.value }}</strong>
            <div class="chart-column__track"><span class="chart-column__fill" :class="`chart-fill--${index % 4}`" :style="{ height: `${row.percent}%` }"></span></div>
            <span>{{ row.label }}</span>
          </div>
        </div>
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
          <div v-if="quickOrderLine.length" class="report-inline-chart">
            <p class="chart-caption">Order value sequence · Today</p>
            <svg class="quick-line-chart" viewBox="0 0 620 150" role="img" aria-label="Order values today">
              <line v-for="tick in quickLineTicks" :key="tick.y" x1="34" :y1="tick.y" x2="610" :y2="tick.y" class="trend-chart__grid" />
              <circle v-for="point in quickOrderLine" :key="point.id" :cx="point.x" :cy="point.y" :r="point.radius" class="quick-scatter__point"><title>Order #{{ point.id }}: {{ money(point.value) }}</title></circle>
              <text v-for="label in quickLineLabels" :key="label.id" :x="label.x" y="145" text-anchor="middle" class="trend-chart__tick">#{{ label.id }}</text>
              <text x="30" y="12" text-anchor="end" class="trend-chart__tick">{{ compactMoney(quickLineMax) }}</text>
            </svg>
          </div>
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
          <div v-if="topTenRankGraph.length" class="report-inline-chart">
            <p class="chart-caption">Order value ranking · shown orders</p>
            <div class="rank-chart">
              <div v-for="row in topTenRankGraph" :key="row.id" class="rank-chart__row">
                <span class="rank-chart__label">#{{ row.id }}</span>
                <span class="rank-chart__track"><i :style="{ left: `${row.percent}%` }"></i></span>
                <strong>{{ compactMoney(row.value) }}</strong>
              </div>
            </div>
          </div>
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
      <div v-if="deletedTimeline.length" class="report-inline-chart">
        <p class="chart-caption">Deletion activity across the day</p>
        <svg class="deleted-timeline" viewBox="0 0 760 104" role="img" aria-label="Deleted orders by time of day">
          <line v-for="tick in deletedTimelineTicks" :key="tick.label" :x1="tick.x" y1="10" :x2="tick.x" y2="78" class="trend-chart__grid" />
          <circle v-for="(item, index) in deletedTimeline" :key="item.id" :cx="item.x" :cy="28 + (index % 4) * 12" r="5" :fill="item.color" class="deleted-timeline__point"><title>Order #{{ item.id }} · {{ item.type }} · {{ item.time }}</title></circle>
          <text v-for="tick in deletedTimelineTicks" :key="`${tick.label}-label`" :x="tick.x" y="98" text-anchor="middle" class="trend-chart__tick">{{ tick.label }}</text>
        </svg>
        <div class="deleted-timeline__legend"><span v-for="item in deletedTypeLegend" :key="item.label"><i :style="{ background: item.color }"></i>{{ item.label }}</span></div>
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
  upcomingReservations: { type: Array, default: () => [] },
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

const dateTime = (v) => (v ? new Date(v).toLocaleString('en-PK', { timeZone: 'Asia/Karachi' }) : "—");
const reservationDate = value => {
  if (!value) return { day: '—', month: '' };
  const date = new Date(value);
  return {
    day: new Intl.DateTimeFormat('en-PK', { day: '2-digit', timeZone: 'Asia/Karachi' }).format(date),
    month: new Intl.DateTimeFormat('en-PK', { month: 'short', timeZone: 'Asia/Karachi' }).format(date),
  };
};
const reservationTime = value => value ? new Date(value).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Karachi' }) : '—';

// ── Counts / lists (straight from props) ─────────────────────────────────────
const counts = computed(() => ({
  users: props.counts.users ?? "—",
  customers: props.counts.customers ?? "—",
  foodItems: props.counts.foodItems ?? "—",
  orders: props.counts.orders ?? "—",
}));
const recentOrders = computed(() => props.recentOrders ?? []);
const upcomingReservations = computed(() => props.upcomingReservations ?? []);
const topCategories = computed(() => props.topCategories ?? []);
const feedback = computed(() => props.feedback ?? []);
const feedbackStats = computed(() => props.feedbackStats ?? { avg_rating: null, total: 0 });
const stars = (r) => "★".repeat(Math.max(0, Math.min(5, Number(r) || 0))) + "☆".repeat(5 - Math.max(0, Math.min(5, Number(r) || 0)));

// ── Report blocks (all computed from the server-rendered props) ──────────────
const summary = computed(() => ({
  ordersByType: props.reports?.summary?.ordersByType ?? [],
  totalGrandTotal: Number(props.reports?.summary?.totalGrandTotal ?? 0),
}));
const revenueTrend = computed(() => props.reports?.revenueTrend ?? []);
const trendPoints = computed(() => {
  const rows = revenueTrend.value;
  const max = Math.max(...rows.map(row => Number(row.total_sales) || 0), 1);
  const left = 54;
  const right = 746;
  const top = 20;
  const bottom = 198;
  return rows.map((row, index) => {
    const value = Number(row.total_sales) || 0;
    const x = rows.length === 1 ? (left + right) / 2 : left + ((right - left) * index) / (rows.length - 1);
    const y = bottom - (value / max) * (bottom - top);
    const date = String(row.report_date || '').slice(0, 10);
    const parsed = new Date(`${date}T12:00:00`);
    return {
      date,
      value,
      orders: Number(row.order_count) || 0,
      x,
      y,
      label: Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleDateString('en-PK', { day: 'numeric', month: 'short', timeZone: 'Asia/Karachi' }),
    };
  });
});
const trendLinePoints = computed(() => trendPoints.value.map(point => `${point.x},${point.y}`).join(' '));
const trendAreaPath = computed(() => {
  const points = trendPoints.value;
  if (!points.length) return '';
  return `M ${points[0].x} 198 L ${points.map(point => `${point.x} ${point.y}`).join(' L ')} L ${points[points.length - 1].x} 198 Z`;
});
const trendTicks = computed(() => {
  const max = Math.max(...revenueTrend.value.map(row => Number(row.total_sales) || 0), 1);
  return [0, 1, 2, 3].map(index => ({
    y: 198 - index * (178 / 3),
    label: compactMoney(max * index / 3),
  }));
});
const trendDateLabels = computed(() => {
  const points = trendPoints.value;
  if (points.length <= 4) return points.map(point => ({ x: point.x, text: point.label }));
  const indices = [...new Set([0, Math.round((points.length - 1) / 3), Math.round((points.length - 1) * 2 / 3), points.length - 1])];
  return indices.map(index => ({ x: points[index].x, text: points[index].label }));
});
const orderStatusRows = computed(() => props.reports?.orderStatus ?? []);
const orderStatusTotal = computed(() => orderStatusRows.value.reduce((total, row) => total + (Number(row.order_count) || 0), 0));
const STATUS_COLORS = ['#f04b2c', '#84cc16', '#818cf8', '#f59e0b', '#22c5a7', '#a1a1aa'];
const orderStatusLegend = computed(() => orderStatusRows.value.map((row, index) => {
  const value = Number(row.order_count) || 0;
  return {
    label: row.status_label || 'Unknown',
    value,
    percent: orderStatusTotal.value ? Math.round(value / orderStatusTotal.value * 100) : 0,
    color: STATUS_COLORS[index % STATUS_COLORS.length],
  };
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
const barsFor = rows => {
  const max = Math.max(...rows.map(row => row.value), 1);
  return rows.map(row => ({ ...row, percent: Math.max(3, Math.round(row.value / max * 100)) }));
};
const summaryTypeGraph = computed(() => {
  const colors = ['#f04b2c', '#84cc16', '#818cf8', '#f59e0b'];
  const rows = summary.value.ordersByType.map(row => ({ label: typeLabel(row.type), value: Number(row.grand_total) || 0 }));
  const total = rows.reduce((sum, row) => sum + row.value, 0) || 1;
  return rows.map((row, index) => ({ ...row, percent: row.value / total * 100, color: colors[index % colors.length] }));
});
const categorySalesTotal = computed(() => categorySales.value.reduce((sum, row) => sum + (Number(row.grand_total) || 0), 0));
const CATEGORY_COLORS = ['#f04b2c', '#84cc16', '#818cf8', '#f59e0b', '#22c5a7', '#d946ef', '#38bdf8'];
const categoryShare = computed(() => categorySales.value.map((row, index) => {
  const value = Number(row.grand_total) || 0;
  return {
    label: row.category_name || 'Uncategorized',
    value,
    percent: categorySalesTotal.value ? Math.round(value / categorySalesTotal.value * 100) : 0,
    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
  };
}));
const categoryDonut = computed(() => {
  let offset = 0;
  return `conic-gradient(${categoryShare.value.map(item => {
    const start = offset;
    offset += categorySalesTotal.value ? item.value / categorySalesTotal.value * 100 : 0;
    return `${item.color} ${start}% ${offset}%`;
  }).join(', ')})`;
});
const itemQty = computed(() => ({
  service_charge_total: Number(props.reports?.itemQty?.service_charge_total ?? 0),
  categories: props.reports?.itemQty?.categories ?? [],
}));
const itemQtyCurrent = computed(() => ({
  service_charge_total: Number(props.reports?.itemQtyCurrent?.service_charge_total ?? 0),
  categories: props.reports?.itemQtyCurrent?.categories ?? [],
  totalGrandTotal: Number(props.reports?.itemQtyCurrent?.totalGrandTotal ?? 0),
}));
const itemQtyGraph = computed(() => barsFor(itemQty.value.categories.flatMap(category => (category.items || []).map(item => ({
  label: item.item_name || 'Menu item', value: Number(item.total_quantity) || 0,
}))).sort((a, b) => b.value - a.value).slice(0, 8)));
const currentQtyGraph = computed(() => barsFor(itemQtyCurrent.value.categories.flatMap(category => (category.items || []).map(item => ({
  label: item.item_name || 'Menu item', value: Number(item.total_quantity) || 0,
}))).sort((a, b) => b.value - a.value).slice(0, 8)));
const quickReport = computed(() => props.reports?.quickReport ?? []);
const topTen = computed(() => props.reports?.topTen ?? []);
const deletedOrders = computed(() => props.reports?.deletedOrders ?? []);
const quickLineMax = computed(() => Math.max(...quickReport.value.map(order => Number(order.grand_total) || 0), 1));
const quickOrderLine = computed(() => {
  const orders = [...quickReport.value].sort((left, right) => {
    const leftTime = new Date(left.order_datetime || left.created_at || 0).getTime();
    const rightTime = new Date(right.order_datetime || right.created_at || 0).getTime();
    return leftTime - rightTime;
  }).slice(-12);
  return orders.map((order, index) => ({
    id: order.id,
    value: Number(order.grand_total) || 0,
    x: orders.length === 1 ? 322 : 34 + index * (576 / (orders.length - 1)),
    y: 124 - (Number(order.grand_total) || 0) / quickLineMax.value * 100,
    radius: 4 + Math.sqrt((Number(order.grand_total) || 0) / quickLineMax.value) * 5,
  }));
});
const quickLineTicks = computed(() => [24, 74, 124].map(y => ({ y })));
const quickLineLabels = computed(() => {
  const points = quickOrderLine.value;
  if (points.length <= 4) return points;
  return [...new Set([0, Math.round((points.length - 1) / 2), points.length - 1])].map(index => points[index]);
});
const topTenRankGraph = computed(() => {
  const rows = topTen.value.map(order => ({ id: order.id, value: Number(order.grand_total) || 0 }))
    .sort((a, b) => b.value - a.value).slice(0, 10);
  const max = Math.max(...rows.map(row => row.value), 1);
  return rows.map(row => ({ ...row, percent: Math.max(3, Math.round(row.value / max * 100)) }));
});
const ORDER_TYPE_COLORS = { Dining: '#f04b2c', Delivery: '#84cc16', 'On the way': '#818cf8' };
const deletedTimeline = computed(() => deletedOrders.value.map(order => {
  const date = new Date(order.deleted_at);
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Karachi', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(date);
  const hour = Number(parts.find(part => part.type === 'hour')?.value) || 0;
  const minute = Number(parts.find(part => part.type === 'minute')?.value) || 0;
  const type = typeLabel(order.type || 'Other');
  return {
    id: order.id,
    type,
    time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
    x: 40 + ((hour * 60 + minute) / 1440) * 680,
    color: ORDER_TYPE_COLORS[type] || '#a1a1aa',
    timestamp: date.getTime(),
  };
}).sort((a, b) => a.timestamp - b.timestamp));
const deletedTimelineTicks = [
  { x: 40, label: '12 AM' }, { x: 210, label: '6 AM' }, { x: 380, label: '12 PM' },
  { x: 550, label: '6 PM' }, { x: 720, label: '12 AM' },
];
const deletedTypeLegend = computed(() => [...new Map(deletedTimeline.value.map(item => [item.type, { label: item.type, color: item.color }])).values()]);
const compactMoney = value => {
  const amount = Number(value) || 0;
  return amount >= 1000000 ? `Rs ${(amount / 1000000).toFixed(1)}m`
    : amount >= 1000 ? `Rs ${(amount / 1000).toFixed(1)}k`
      : `Rs ${Math.round(amount)}`;
};
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
    "/dashboard",
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

.cell-sub {
  display: block;
  margin-top: 2px;
  font-size: 0.78rem;
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
.reservations-widget { margin:18px 0 26px; }
.reservation-list { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:0 22px; padding:0 16px 8px; }
.reservation-row { display:flex; align-items:center; gap:12px; min-width:0; padding:13px 0; border-bottom:1px solid var(--border); }
.reservation-row__date { display:grid; place-content:center; flex:0 0 42px; height:46px; border-radius:10px; background:var(--brand-soft); color:var(--brand); text-align:center; }
.reservation-row__date strong { font-size:.9rem; line-height:1.1; }.reservation-row__date span { font-size:.62rem; text-transform:uppercase; }
.reservation-row__details { display:grid; min-width:0; gap:4px; flex:1; }
.reservation-row__details strong { overflow:hidden; color:var(--text); font-size:.8rem; text-overflow:ellipsis; white-space:nowrap; }
.reservation-row__details span { overflow:hidden; color:var(--text-muted); font-size:.69rem; text-overflow:ellipsis; white-space:nowrap; }
.reservation-empty { padding:18px 16px; color:var(--text-muted); font-size:.82rem; }
.report-charts { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:16px; margin:18px 0 22px; }
.report-chart-card { min-width:0; padding:18px; }
.report-chart-card--wide { grid-column:1 / -1; }
.analytics-grid { display:grid; grid-template-columns:minmax(0,1.65fr) minmax(300px,.85fr); gap:18px; margin:0 0 26px; }
.analytics-card { min-width:0; padding:20px 22px 18px; overflow:hidden; border:1px solid #e8e9ed; border-radius:14px; box-shadow:0 8px 24px rgba(20,24,35,.035); }
.analytics-card .ui-card-header { align-items:center; min-height:42px; margin-bottom:10px; }
.analytics-card .ui-card-header h3 { margin:4px 0 0; color:var(--text); font-size:1rem; font-weight:700; letter-spacing:-.02em; }
.analytics-eyebrow { color:var(--text-muted); font-size:.62rem; font-weight:700; letter-spacing:.12em; }
.analytics-total { color:var(--text); font-size:1rem; font-weight:750; font-variant-numeric:tabular-nums; }
.analytics-period { max-width:45%; overflow:hidden; color:var(--text-muted); font-size:.7rem; text-overflow:ellipsis; white-space:nowrap; }
.analytics-empty { display:grid; min-height:210px; place-items:center; color:var(--text-muted); font-size:.82rem; }
.trend-chart { width:100%; min-height:220px; }
.trend-chart__svg { display:block; width:100%; height:auto; overflow:visible; }
.trend-chart__grid { stroke:#eceef2; stroke-width:1; }
.trend-chart__tick { fill:#858b98; font-size:10px; }
.trend-chart__line { fill:none; stroke:#f04b2c; stroke-width:3; stroke-linecap:round; stroke-linejoin:round; }
.trend-chart__point { fill:#fff; stroke:#f04b2c; stroke-width:2.5; }
.trend-legend { display:flex; align-items:center; gap:8px; margin:2px 8px 0 50px; color:var(--text); font-size:.72rem; font-weight:650; }
.trend-legend__dot { width:8px; height:8px; border-radius:50%; background:#f04b2c; }
.trend-legend__unit { margin-left:auto; color:var(--text-muted); font-size:.68rem; font-weight:450; }
.status-breakdown { display:grid; gap:17px; min-height:232px; align-content:center; padding:12px 2px 4px; }
.status-breakdown__label { display:flex; justify-content:space-between; gap:10px; margin-bottom:7px; color:var(--text); font-size:.74rem; }
.status-breakdown__label>span { display:flex; min-width:0; align-items:center; gap:8px; color:var(--text-muted); text-transform:capitalize; }
.status-breakdown__label i { flex:0 0 8px; width:8px; height:8px; border-radius:50%; }
.status-breakdown__label strong { white-space:nowrap; font-variant-numeric:tabular-nums; }
.status-breakdown__label small { margin-left:4px; color:var(--text-muted); font-size:.65rem; font-weight:500; }
.status-breakdown__track { height:8px; overflow:hidden; border-radius:99px; background:var(--surface-2); }
.status-breakdown__track i { display:block; height:100%; min-width:3px; border-radius:inherit; }
.chart-bars { display:grid; gap:17px; padding:8px 2px 2px; }
.chart-bars--items { grid-template-columns:repeat(2,minmax(0,1fr)); column-gap:28px; }
.chart-bar-row { min-width:0; }
.chart-bar-label { display:flex; align-items:center; gap:8px; margin-bottom:8px; color:var(--text-muted); font-size:.76rem; }
.chart-bar-label>span:nth-child(2) { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.chart-bar-label strong { margin-left:auto; color:var(--text); font-size:.74rem; white-space:nowrap; }
.chart-dot { flex:0 0 8px; width:8px; height:8px; border-radius:50%; background:#6366f1; }
.chart-dot--1 { background:#10b981; }.chart-dot--2 { background:#f59e0b; }.chart-dot--3 { background:#ec4899; }
.chart-track { height:8px; overflow:hidden; border-radius:99px; background:var(--surface-muted,#f1f2f5); }
.chart-fill { display:block; height:100%; min-width:3px; border-radius:inherit; background:#6366f1; transition:width .35s ease; }
.chart-fill--1 { background:#10b981; }.chart-fill--2 { background:#f59e0b; }.chart-fill--3 { background:#ec4899; }
.chart-empty { display:grid; min-height:120px; place-items:center; color:var(--text-muted); font-size:.82rem; }
.chart-columns { display:grid; grid-template-columns:repeat(auto-fit,minmax(72px,1fr)); align-items:end; gap:12px; min-height:190px; padding:14px 4px 0; }
.chart-column { display:grid; grid-template-rows:18px 1fr 34px; justify-items:center; align-items:end; gap:8px; min-width:0; height:176px; }
.chart-column>strong { align-self:end; color:var(--text-muted); font-size:.65rem; font-weight:600; white-space:nowrap; }
.chart-column>span { display:-webkit-box; width:100%; overflow:hidden; color:var(--text-muted); font-size:.65rem; line-height:1.25; text-align:center; -webkit-line-clamp:2; -webkit-box-orient:vertical; }
.chart-column__track { display:flex; align-items:flex-end; width:min(34px,70%); height:100%; overflow:hidden; border-radius:7px 7px 3px 3px; background:var(--surface-muted,#f1f2f5); }
.chart-column__fill { display:block; width:100%; min-height:4px; border-radius:6px 6px 2px 2px; background:#6366f1; transition:height .35s ease; }
.chart-columns--items { grid-template-columns:repeat(auto-fit,minmax(68px,1fr)); gap:8px; }
.report-inline-chart { padding:8px 18px 18px; }
.chart-caption { margin:0 0 4px; color:var(--text-muted); font-size:.76rem; font-weight:600; }
.type-mix__bar { display:flex; width:100%; height:13px; margin:14px 0 16px; overflow:hidden; border-radius:99px; background:var(--surface-2); }
.type-mix__bar span { min-width:3px; border-right:2px solid var(--surface); transition:width .3s ease; }
.type-mix__legend,.category-share__legend { display:grid; gap:12px; margin:0; padding:0; list-style:none; }
.type-mix__legend li,.category-share__legend li { display:flex; align-items:center; justify-content:space-between; gap:10px; color:var(--text); font-size:.74rem; }
.type-mix__legend li>span,.category-share__legend li>span { display:flex; align-items:center; min-width:0; gap:8px; color:var(--text-muted); }
.type-mix__legend i,.category-share__legend i,.deleted-timeline__legend i { flex:0 0 9px; width:9px; height:9px; border-radius:50%; }
.type-mix__legend small { margin-left:4px; color:var(--text-muted); font-size:.66rem; font-weight:500; }
.category-share { display:grid; grid-template-columns:minmax(118px,.9fr) minmax(0,1.1fr); align-items:center; gap:16px; padding:18px 20px; }
.category-share__donut { position:relative; display:grid; width:min(100%,150px); aspect-ratio:1; place-items:center; justify-self:center; border-radius:50%; }
.category-share__donut::before { position:absolute; inset:13px; border-radius:50%; background:var(--surface,#fff); content:""; }
.category-share__donut>div { z-index:1; display:grid; justify-items:center; gap:2px; text-align:center; }
.category-share__donut strong { color:var(--text); font-size:.93rem; }
.category-share__donut span { color:var(--text-muted); font-size:.62rem; }
.category-share__legend li>strong { flex:0 0 auto; color:var(--text); font-variant-numeric:tabular-nums; }
.quick-line-chart { display:block; width:100%; height:auto; margin-top:12px; overflow:visible; }
.quick-scatter__point { fill:#f04b2c; fill-opacity:.78; stroke:#fff; stroke-width:2; transition:r .2s ease,fill-opacity .2s ease; }
.quick-scatter__point:hover { fill-opacity:1; }
.rank-chart { display:grid; gap:13px; padding:10px 0 2px; }
.rank-chart__row { display:grid; grid-template-columns:38px minmax(35px,1fr) auto; align-items:center; gap:10px; }
.rank-chart__label { color:var(--text-muted); font-size:.7rem; font-variant-numeric:tabular-nums; }
.rank-chart__track { position:relative; height:1px; background:var(--border); }
.rank-chart__track i { position:absolute; top:50%; width:10px; height:10px; border:2px solid #fff; border-radius:50%; background:#f04b2c; box-shadow:0 0 0 1px #f04b2c; transform:translate(-50%,-50%); }
.rank-chart__row strong { color:var(--text); font-size:.69rem; font-variant-numeric:tabular-nums; }
.deleted-timeline { display:block; width:100%; height:auto; margin:12px 0 4px; overflow:visible; }
.deleted-timeline__point { stroke:#fff; stroke-width:1.5; }
.deleted-timeline__legend { display:flex; flex-wrap:wrap; gap:12px 18px; margin-top:13px; }
.deleted-timeline__legend>span { display:inline-flex; align-items:center; gap:6px; color:var(--text-muted); font-size:.7rem; }
.report-inline-chart .chart-columns { padding-top:8px; }
.report-inline-chart .chart-bars { grid-template-columns:repeat(2,minmax(0,1fr)); gap:14px 24px; }
.report-inline-chart .chart-bar-label>span:nth-child(2) { max-width:220px; }
@media(max-width:900px){.analytics-grid{grid-template-columns:1fr}}
@media(max-width:600px){.category-share{grid-template-columns:1fr}.category-share__legend{width:100%}}
@media(max-width:760px){.report-charts{grid-template-columns:1fr}.report-chart-card--wide{grid-column:auto}.chart-bars--items{grid-template-columns:1fr}}
@media(max-width:600px){.report-inline-chart{padding:6px 12px 14px}.report-inline-chart .chart-bars{grid-template-columns:1fr}.chart-columns{gap:6px;grid-template-columns:repeat(auto-fit,minmax(58px,1fr))}.chart-column__track{width:26px}}

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
  .reservation-list { grid-template-columns:1fr; }
  .analytics-card { padding:16px; }
}
</style>
