import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-BOaGB7Aw.js";
import { t as AdminLayout_default } from "./AdminLayout-Dn6OtQae.js";
import { t as _sfc_main$1 } from "./PageHeader-D0aRDn5C.js";
import { t as StatCard_default } from "./StatCard-C81bFHCl.js";
import { computed, createBlock, createTextVNode, createVNode, mergeProps, openBlock, ref, unref, useSSRContext, withCtx } from "vue";
import { Link } from "@inertiajs/vue3";
import { ssrIncludeBooleanAttr, ssrInterpolate, ssrRenderAttr, ssrRenderAttrs, ssrRenderClass, ssrRenderComponent, ssrRenderList, ssrRenderStyle } from "vue/server-renderer";
//#region resources/js/pages/Dashboard.vue
var _sfc_main = /*@__PURE__*/ Object.assign({ layout: AdminLayout_default }, {
	__name: "Dashboard",
	__ssrInlineRender: true,
	props: {
		counts: {
			type: Object,
			default: () => ({})
		},
		recentOrders: {
			type: Array,
			default: () => []
		},
		topCategories: {
			type: Array,
			default: () => []
		},
		feedback: {
			type: Array,
			default: () => []
		},
		feedbackStats: {
			type: Object,
			default: () => ({
				avg_rating: null,
				total: 0
			})
		},
		range: {
			type: Object,
			default: () => ({
				start_date: "",
				end_date: ""
			})
		},
		reports: {
			type: Object,
			default: () => ({})
		}
	},
	setup(__props) {
		const props = __props;
		const range = ref({ ...props.range });
		const reportsLoading = ref(false);
		const BAR_COLORS = [
			"var(--brand)",
			"var(--success)",
			"var(--info)",
			"var(--warning)",
			"var(--danger)"
		];
		const barColor = (i) => BAR_COLORS[i % BAR_COLORS.length];
		const money = (v) => v == null || v === "" ? "—" : `Rs ${Number(v).toFixed(2)}`;
		const TYPE_LABELS = {
			delivery: "Delivery",
			dining: "Dining",
			"on-way": "On the way"
		};
		const typeLabel = (t) => TYPE_LABELS[t] || t || "—";
		const statusClass = (s) => {
			const v = String(s || "").toLowerCase();
			if ([
				"completed",
				"paid",
				"done"
			].includes(v)) return "ui-badge--success";
			if ([
				"on-way",
				"on the way",
				"delivering",
				"shipped"
			].includes(v)) return "ui-badge--warning";
			if ([
				"preparing",
				"pending",
				"processing",
				"in progress"
			].includes(v)) return "ui-badge--info";
			return "ui-badge--muted";
		};
		const dateTime = (v) => v ? new Date(v).toLocaleString() : "—";
		const counts = computed(() => ({
			users: props.counts.users ?? "—",
			customers: props.counts.customers ?? "—",
			foodItems: props.counts.foodItems ?? "—",
			orders: props.counts.orders ?? "—"
		}));
		const recentOrders = computed(() => props.recentOrders ?? []);
		const topCategories = computed(() => props.topCategories ?? []);
		const feedback = computed(() => props.feedback ?? []);
		const feedbackStats = computed(() => props.feedbackStats ?? {
			avg_rating: null,
			total: 0
		});
		const stars = (r) => "★".repeat(Math.max(0, Math.min(5, Number(r) || 0))) + "☆".repeat(5 - Math.max(0, Math.min(5, Number(r) || 0)));
		const summary = computed(() => ({
			ordersByType: props.reports?.summary?.ordersByType ?? [],
			totalGrandTotal: Number(props.reports?.summary?.totalGrandTotal ?? 0)
		}));
		const dining = computed(() => ({
			totalGrandTotal: Number(props.reports?.dining?.totalGrandTotal ?? 0),
			rows: props.reports?.dining?.rows ?? []
		}));
		const delivery = computed(() => ({
			totalGrandTotal: Number(props.reports?.delivery?.totalGrandTotal ?? 0),
			rows: props.reports?.delivery?.rows ?? []
		}));
		const onway = computed(() => ({
			totalGrandTotal: Number(props.reports?.onway?.totalGrandTotal ?? 0),
			rows: props.reports?.onway?.rows ?? []
		}));
		const categorySales = computed(() => props.reports?.categorySales ?? []);
		const itemQty = computed(() => ({
			service_charge_total: Number(props.reports?.itemQty?.service_charge_total ?? 0),
			categories: props.reports?.itemQty?.categories ?? []
		}));
		const itemQtyCurrent = computed(() => ({
			service_charge_total: Number(props.reports?.itemQtyCurrent?.service_charge_total ?? 0),
			categories: props.reports?.itemQtyCurrent?.categories ?? [],
			totalGrandTotal: Number(props.reports?.itemQtyCurrent?.totalGrandTotal ?? 0)
		}));
		const quickReport = computed(() => props.reports?.quickReport ?? []);
		const topTen = computed(() => props.reports?.topTen ?? []);
		const deletedOrders = computed(() => props.reports?.deletedOrders ?? []);
		const rangeLabel = computed(() => range.value.start_date === range.value.end_date ? range.value.start_date : `${range.value.start_date} → ${range.value.end_date}`);
		const csvCell = (v) => {
			return `"${(v == null ? "" : String(v)).replace(/"/g, "\"\"")}"`;
		};
		const csvRow = (cells) => cells.map(csvCell).join(",");
		const exportData = () => {
			const lines = [];
			const section = (title, headers, rows) => {
				if (lines.length) lines.push("");
				lines.push(csvRow([title]));
				if (!rows.length) {
					lines.push(csvRow(["No data"]));
					return;
				}
				lines.push(csvRow(headers));
				rows.forEach((r) => lines.push(csvRow(r)));
			};
			section("Report Range", ["Start", "End"], [[range.value.start_date, range.value.end_date]]);
			section("Overview", ["Metric", "Value"], [
				["Users", counts.value.users],
				["Customers", counts.value.customers],
				["Food Items", counts.value.foodItems],
				["Orders", counts.value.orders]
			]);
			section("Recent Orders", [
				"Order",
				"Customer",
				"Type",
				"Status",
				"Total"
			], recentOrders.value.map((o) => [
				`#${o.id}`,
				o.customer?.name || o.customer_name || "Guest",
				typeLabel(o.type),
				o.status || "—",
				money(o.grand_total)
			]));
			section("Daily Summary by Type", ["Type", "Grand Total"], [
				...summary.value.ordersByType.map((r) => [typeLabel(r.type), money(r.grand_total)]),
				["Total", money(summary.value.totalGrandTotal)],
				["Dining", money(dining.value.totalGrandTotal)],
				["Delivery", money(delivery.value.totalGrandTotal)],
				["On the way", money(onway.value.totalGrandTotal)]
			]);
			section("Category Sales", [
				"Category",
				"Subtotal",
				"Discount",
				"Total"
			], categorySales.value.map((c) => [
				c.category_name,
				money(c.total_subtotal),
				money(c.discount_amount),
				money(c.grand_total)
			]));
			const flattenItemQty = (data) => {
				const out = [];
				data.categories.forEach((cat) => {
					out.push([
						cat.category_name,
						"",
						cat.total_quantity,
						money(cat.total_subtotal),
						money(cat.discount_amount)
					]);
					(cat.items || []).forEach((it) => out.push([
						"",
						it.item_name,
						it.total_quantity,
						money(it.total_subtotal),
						money(it.discount_amount)
					]));
				});
				return out;
			};
			section(`Category Sales by Item Quantity (Service charges: ${money(itemQty.value.service_charge_total)})`, [
				"Category",
				"Item",
				"Qty",
				"Subtotal",
				"Discount"
			], flattenItemQty(itemQty.value));
			section(`Item Quantity — Order Date (Service charges: ${money(itemQtyCurrent.value.service_charge_total)}; Total: ${money(itemQtyCurrent.value.totalGrandTotal)})`, [
				"Category",
				"Item",
				"Qty",
				"Subtotal",
				"Discount"
			], flattenItemQty(itemQtyCurrent.value));
			section("Quick Report — Today", [
				"Order",
				"Customer",
				"Type",
				"Total"
			], quickReport.value.map((o) => [
				`#${o.id}`,
				o.customer?.name || "Guest",
				typeLabel(o.type),
				money(o.grand_total)
			]));
			section("Top 10 Deals — Today", [
				"Order",
				"Customer",
				"Total"
			], topTen.value.map((o) => [
				`#${o.id}`,
				o.customer?.name || "Guest",
				money(o.grand_total)
			]));
			section("Deleted Orders — Today", [
				"Order",
				"Type",
				"Status",
				"Deleted At",
				"Total"
			], deletedOrders.value.map((o) => [
				`#${o.id}`,
				typeLabel(o.type),
				o.status || "—",
				dateTime(o.deleted_at),
				money(o.grand_total)
			]));
			const csv = lines.join("\n");
			const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `dashboard-report-${range.value.start_date}_to_${range.value.end_date}.csv`;
			a.click();
			URL.revokeObjectURL(url);
		};
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "page" }, _attrs))} data-v-b7818330>`);
			_push(ssrRenderComponent(_sfc_main$1, {
				title: "Dashboard",
				subtitle: "Quick overview of your system."
			}, {
				actions: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<button class="ui-btn ui-btn--ghost" data-v-b7818330${_scopeId}><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-b7818330${_scopeId}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" data-v-b7818330${_scopeId}></path><polyline points="7 10 12 15 17 10" data-v-b7818330${_scopeId}></polyline><line x1="12" y1="15" x2="12" y2="3" data-v-b7818330${_scopeId}></line></svg> Export </button>`);
						_push(ssrRenderComponent(unref(Link), {
							href: "/orders",
							class: "ui-btn ui-btn--primary"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(`+ New Order`);
								else return [createTextVNode("+ New Order")];
							}),
							_: 1
						}, _parent, _scopeId));
					} else return [createVNode("button", {
						class: "ui-btn ui-btn--ghost",
						onClick: exportData
					}, [(openBlock(), createBlock("svg", {
						viewBox: "0 0 24 24",
						width: "15",
						height: "15",
						fill: "none",
						stroke: "currentColor",
						"stroke-width": "2",
						"stroke-linecap": "round",
						"stroke-linejoin": "round"
					}, [
						createVNode("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
						createVNode("polyline", { points: "7 10 12 15 17 10" }),
						createVNode("line", {
							x1: "12",
							y1: "15",
							x2: "12",
							y2: "3"
						})
					])), createTextVNode(" Export ")]), createVNode(unref(Link), {
						href: "/orders",
						class: "ui-btn ui-btn--primary"
					}, {
						default: withCtx(() => [createTextVNode("+ New Order")]),
						_: 1
					})];
				}),
				_: 1
			}, _parent));
			_push(`<div class="ui-card ui-card-pad report-filter" data-v-b7818330><div class="report-filter__field" data-v-b7818330><label class="ui-label" for="rf-start" data-v-b7818330>Start date</label><input id="rf-start"${ssrRenderAttr("value", range.value.start_date)} type="date" class="ui-input" data-v-b7818330></div><div class="report-filter__field" data-v-b7818330><label class="ui-label" for="rf-end" data-v-b7818330>End date</label><input id="rf-end"${ssrRenderAttr("value", range.value.end_date)} type="date" class="ui-input" data-v-b7818330></div><div class="report-filter__actions" data-v-b7818330><button class="ui-btn ui-btn--primary"${ssrIncludeBooleanAttr(reportsLoading.value) ? " disabled" : ""} data-v-b7818330>${ssrInterpolate(reportsLoading.value ? "Loading…" : "Apply")}</button><button class="ui-btn ui-btn--ghost"${ssrIncludeBooleanAttr(reportsLoading.value) ? " disabled" : ""} data-v-b7818330> Today </button></div></div><div class="stat-grid" data-v-b7818330>`);
			_push(ssrRenderComponent(StatCard_default, {
				label: "Users",
				value: counts.value.users,
				hint: "Registered accounts",
				color: "var(--brand)",
				tint: "var(--brand-soft)",
				trend: "▲ 0%",
				"trend-dir": "up"
			}, {
				icon: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-b7818330${_scopeId}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" data-v-b7818330${_scopeId}></path><circle cx="9" cy="7" r="4" data-v-b7818330${_scopeId}></circle><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" data-v-b7818330${_scopeId}></path></svg>`);
					else return [(openBlock(), createBlock("svg", {
						viewBox: "0 0 24 24",
						width: "20",
						height: "20",
						fill: "none",
						stroke: "currentColor",
						"stroke-width": "2",
						"stroke-linecap": "round",
						"stroke-linejoin": "round"
					}, [
						createVNode("path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }),
						createVNode("circle", {
							cx: "9",
							cy: "7",
							r: "4"
						}),
						createVNode("path", { d: "M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" })
					]))];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(StatCard_default, {
				label: "Customers",
				value: counts.value.customers,
				hint: "Active customers",
				color: "var(--success)",
				tint: "var(--success-soft)",
				trend: "▲ 100%",
				"trend-dir": "up"
			}, {
				icon: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-b7818330${_scopeId}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" data-v-b7818330${_scopeId}></path><circle cx="12" cy="7" r="4" data-v-b7818330${_scopeId}></circle></svg>`);
					else return [(openBlock(), createBlock("svg", {
						viewBox: "0 0 24 24",
						width: "20",
						height: "20",
						fill: "none",
						stroke: "currentColor",
						"stroke-width": "2",
						"stroke-linecap": "round",
						"stroke-linejoin": "round"
					}, [createVNode("path", { d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" }), createVNode("circle", {
						cx: "12",
						cy: "7",
						r: "4"
					})]))];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(StatCard_default, {
				label: "Food Items",
				value: counts.value.foodItems,
				hint: "Menu entries",
				color: "var(--warning)",
				tint: "var(--warning-soft)",
				trend: "▼ —",
				"trend-dir": "down"
			}, {
				icon: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-b7818330${_scopeId}><path d="M3 2v7c0 1.1.9 2 2 2h0a2 2 0 0 0 2-2V2M5 2v20M17 2c-1.7 0-3 2-3 5s1.3 5 3 5v10" data-v-b7818330${_scopeId}></path></svg>`);
					else return [(openBlock(), createBlock("svg", {
						viewBox: "0 0 24 24",
						width: "20",
						height: "20",
						fill: "none",
						stroke: "currentColor",
						"stroke-width": "2",
						"stroke-linecap": "round",
						"stroke-linejoin": "round"
					}, [createVNode("path", { d: "M3 2v7c0 1.1.9 2 2 2h0a2 2 0 0 0 2-2V2M5 2v20M17 2c-1.7 0-3 2-3 5s1.3 5 3 5v10" })]))];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(StatCard_default, {
				label: "Orders",
				value: counts.value.orders,
				hint: "Total placed",
				color: "var(--info)",
				tint: "var(--info-soft)",
				trend: "▲ 0%",
				"trend-dir": "up"
			}, {
				icon: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-b7818330${_scopeId}><rect x="3" y="4" width="18" height="16" rx="2" data-v-b7818330${_scopeId}></rect><path d="M3 10h18" data-v-b7818330${_scopeId}></path></svg>`);
					else return [(openBlock(), createBlock("svg", {
						viewBox: "0 0 24 24",
						width: "20",
						height: "20",
						fill: "none",
						stroke: "currentColor",
						"stroke-width": "2",
						"stroke-linecap": "round",
						"stroke-linejoin": "round"
					}, [createVNode("rect", {
						x: "3",
						y: "4",
						width: "18",
						height: "16",
						rx: "2"
					}), createVNode("path", { d: "M3 10h18" })]))];
				}),
				_: 1
			}, _parent));
			_push(`</div><div class="dash-grid" data-v-b7818330><div class="ui-card" data-v-b7818330><div class="ui-card-header" data-v-b7818330> Recent Orders `);
			_push(ssrRenderComponent(unref(Link), { href: "/orders" }, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`View all`);
					else return [createTextVNode("View all")];
				}),
				_: 1
			}, _parent));
			_push(`</div><div class="data-table-wrap" data-v-b7818330><table class="data-table" data-v-b7818330><thead data-v-b7818330><tr data-v-b7818330><th data-v-b7818330>Order</th><th data-v-b7818330>Customer</th><th data-v-b7818330>Type</th><th data-v-b7818330>Status</th><th style="${ssrRenderStyle({ "text-align": "right" })}" data-v-b7818330>Total</th></tr></thead><tbody data-v-b7818330>`);
			if (!recentOrders.value.length) _push(`<tr data-v-b7818330><td colspan="5" class="data-table__empty" data-v-b7818330>No orders yet.</td></tr>`);
			else _push(`<!---->`);
			_push(`<!--[-->`);
			ssrRenderList(recentOrders.value, (o) => {
				_push(`<tr data-v-b7818330><td data-v-b7818330>#${ssrInterpolate(o.id)}</td><td data-v-b7818330>${ssrInterpolate(o.customer?.name || o.customer_name || "Guest")}</td><td data-v-b7818330>${ssrInterpolate(typeLabel(o.type))}</td><td data-v-b7818330><span class="${ssrRenderClass([statusClass(o.status), "ui-badge"])}" data-v-b7818330>${ssrInterpolate(o.status || "—")}</span></td><td class="money" style="${ssrRenderStyle({ "text-align": "right" })}" data-v-b7818330>${ssrInterpolate(money(o.grand_total))}</td></tr>`);
			});
			_push(`<!--]--></tbody></table></div></div><div class="ui-card" data-v-b7818330><div class="ui-card-header" data-v-b7818330> Customer Feedback `);
			_push(ssrRenderComponent(unref(Link), { href: "/feedback" }, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`View all`);
					else return [createTextVNode("View all")];
				}),
				_: 1
			}, _parent));
			_push(`</div><div class="fb__summary" data-v-b7818330><span class="fb__avg" data-v-b7818330>${ssrInterpolate(feedbackStats.value.avg_rating ?? "—")}</span><span class="fb__stars" data-v-b7818330>${ssrInterpolate(stars(feedbackStats.value.avg_rating))}</span><span class="fb__count" data-v-b7818330>${ssrInterpolate(feedbackStats.value.total)} review(s)</span></div><div class="fb__list" data-v-b7818330>`);
			if (!feedback.value.length) _push(`<p class="data-table__empty" style="${ssrRenderStyle({ "padding": "20px 0" })}" data-v-b7818330>No feedback yet.</p>`);
			else _push(`<!---->`);
			_push(`<!--[-->`);
			ssrRenderList(feedback.value, (f) => {
				_push(`<div class="fb__row" data-v-b7818330><div class="fb__top" data-v-b7818330><span class="fb__name" data-v-b7818330>${ssrInterpolate(f.customer?.name || "Guest")}</span><span class="fb__stars" data-v-b7818330>${ssrInterpolate(stars(f.rating))}</span></div>`);
				if (f.comment) _push(`<p class="fb__comment" data-v-b7818330>“${ssrInterpolate(f.comment)}”</p>`);
				else _push(`<!---->`);
				_push(`</div>`);
			});
			_push(`<!--]--></div></div><div class="ui-card" data-v-b7818330><div class="ui-card-header" data-v-b7818330>Top Categories</div><div class="cat" data-v-b7818330>`);
			if (!topCategories.value.length) _push(`<p class="data-table__empty" style="${ssrRenderStyle({ "padding": "20px 0" })}" data-v-b7818330>No categories yet.</p>`);
			else _push(`<!---->`);
			_push(`<!--[-->`);
			ssrRenderList(topCategories.value, (c, i) => {
				_push(`<div class="cat__row" data-v-b7818330><span class="cat__name" data-v-b7818330>${ssrInterpolate(c.name)}</span><span class="cat__bar" data-v-b7818330><span class="cat__fill" style="${ssrRenderStyle({
					width: c.pct + "%",
					background: barColor(i)
				})}" data-v-b7818330></span></span><span class="cat__val" data-v-b7818330>${ssrInterpolate(c.pct)}%</span></div>`);
			});
			_push(`<!--]--></div></div></div><h2 class="report-heading" data-v-b7818330>Reports</h2><p class="report-heading__sub" data-v-b7818330>${ssrInterpolate(rangeLabel.value)}</p><div class="stat-grid" data-v-b7818330>`);
			_push(ssrRenderComponent(StatCard_default, {
				label: "Total Sales",
				value: money(summary.value.totalGrandTotal),
				hint: "All order types",
				color: "var(--brand)",
				tint: "var(--brand-soft)"
			}, null, _parent));
			_push(ssrRenderComponent(StatCard_default, {
				label: "Dining",
				value: money(dining.value.totalGrandTotal),
				hint: `${dining.value.rows.length} order(s)`,
				color: "var(--success)",
				tint: "var(--success-soft)"
			}, null, _parent));
			_push(ssrRenderComponent(StatCard_default, {
				label: "Delivery",
				value: money(delivery.value.totalGrandTotal),
				hint: `${delivery.value.rows.length} order(s)`,
				color: "var(--info)",
				tint: "var(--info-soft)"
			}, null, _parent));
			_push(ssrRenderComponent(StatCard_default, {
				label: "On the way",
				value: money(onway.value.totalGrandTotal),
				hint: `${onway.value.rows.length} order(s)`,
				color: "var(--warning)",
				tint: "var(--warning-soft)"
			}, null, _parent));
			_push(`</div><div class="dash-grid" data-v-b7818330><div class="ui-card" data-v-b7818330><div class="ui-card-header" data-v-b7818330>Daily Summary by Type</div><div class="data-table-wrap" data-v-b7818330><table class="data-table" data-v-b7818330><thead data-v-b7818330><tr data-v-b7818330><th data-v-b7818330>Type</th><th style="${ssrRenderStyle({ "text-align": "right" })}" data-v-b7818330>Grand Total</th></tr></thead><tbody data-v-b7818330>`);
			if (reportsLoading.value) _push(`<tr data-v-b7818330><td colspan="2" class="data-table__empty" data-v-b7818330>Loading…</td></tr>`);
			else if (!summary.value.ordersByType.length) _push(`<tr data-v-b7818330><td colspan="2" class="data-table__empty" data-v-b7818330>No sales in this range.</td></tr>`);
			else _push(`<!---->`);
			_push(`<!--[-->`);
			ssrRenderList(summary.value.ordersByType, (r, i) => {
				_push(`<tr data-v-b7818330><td data-v-b7818330>${ssrInterpolate(typeLabel(r.type))}</td><td class="money" style="${ssrRenderStyle({ "text-align": "right" })}" data-v-b7818330>${ssrInterpolate(money(r.grand_total))}</td></tr>`);
			});
			_push(`<!--]--></tbody>`);
			if (summary.value.ordersByType.length) _push(`<tfoot data-v-b7818330><tr data-v-b7818330><th data-v-b7818330>Total</th><th class="money" style="${ssrRenderStyle({ "text-align": "right" })}" data-v-b7818330>${ssrInterpolate(money(summary.value.totalGrandTotal))}</th></tr></tfoot>`);
			else _push(`<!---->`);
			_push(`</table></div></div><div class="ui-card" data-v-b7818330><div class="ui-card-header" data-v-b7818330>Category Sales</div><div class="data-table-wrap" data-v-b7818330><table class="data-table" data-v-b7818330><thead data-v-b7818330><tr data-v-b7818330><th data-v-b7818330>Category</th><th style="${ssrRenderStyle({ "text-align": "right" })}" data-v-b7818330>Subtotal</th><th style="${ssrRenderStyle({ "text-align": "right" })}" data-v-b7818330>Discount</th><th style="${ssrRenderStyle({ "text-align": "right" })}" data-v-b7818330>Total</th></tr></thead><tbody data-v-b7818330>`);
			if (reportsLoading.value) _push(`<tr data-v-b7818330><td colspan="4" class="data-table__empty" data-v-b7818330>Loading…</td></tr>`);
			else if (!categorySales.value.length) _push(`<tr data-v-b7818330><td colspan="4" class="data-table__empty" data-v-b7818330>No category sales in this range.</td></tr>`);
			else _push(`<!---->`);
			_push(`<!--[-->`);
			ssrRenderList(categorySales.value, (c, i) => {
				_push(`<tr data-v-b7818330><td data-v-b7818330>${ssrInterpolate(c.category_name)}</td><td class="money" style="${ssrRenderStyle({ "text-align": "right" })}" data-v-b7818330>${ssrInterpolate(money(c.total_subtotal))}</td><td class="money" style="${ssrRenderStyle({ "text-align": "right" })}" data-v-b7818330>${ssrInterpolate(money(c.discount_amount))}</td><td class="money" style="${ssrRenderStyle({ "text-align": "right" })}" data-v-b7818330>${ssrInterpolate(money(c.grand_total))}</td></tr>`);
			});
			_push(`<!--]--></tbody></table></div></div></div><div class="ui-card report-block" data-v-b7818330><div class="ui-card-header" data-v-b7818330> Category Sales by Item Quantity <span class="report-chip" data-v-b7818330>Service charges: ${ssrInterpolate(money(itemQty.value.service_charge_total))}</span></div><div class="data-table-wrap" data-v-b7818330><table class="data-table" data-v-b7818330><thead data-v-b7818330><tr data-v-b7818330><th data-v-b7818330>Category / Item</th><th style="${ssrRenderStyle({ "text-align": "right" })}" data-v-b7818330>Qty</th><th style="${ssrRenderStyle({ "text-align": "right" })}" data-v-b7818330>Subtotal</th><th style="${ssrRenderStyle({ "text-align": "right" })}" data-v-b7818330>Discount</th></tr></thead><tbody data-v-b7818330>`);
			if (reportsLoading.value) _push(`<tr data-v-b7818330><td colspan="4" class="data-table__empty" data-v-b7818330>Loading…</td></tr>`);
			else if (!itemQty.value.categories.length) _push(`<tr data-v-b7818330><td colspan="4" class="data-table__empty" data-v-b7818330>No item sales in this range.</td></tr>`);
			else _push(`<!---->`);
			_push(`<!--[-->`);
			ssrRenderList(itemQty.value.categories, (cat, ci) => {
				_push(`<!--[--><tr class="report-row--group" data-v-b7818330><td data-v-b7818330>${ssrInterpolate(cat.category_name)}</td><td style="${ssrRenderStyle({ "text-align": "right" })}" data-v-b7818330>${ssrInterpolate(cat.total_quantity)}</td><td class="money" style="${ssrRenderStyle({ "text-align": "right" })}" data-v-b7818330>${ssrInterpolate(money(cat.total_subtotal))}</td><td class="money" style="${ssrRenderStyle({ "text-align": "right" })}" data-v-b7818330>${ssrInterpolate(money(cat.discount_amount))}</td></tr><!--[-->`);
				ssrRenderList(cat.items, (it, ii) => {
					_push(`<tr data-v-b7818330><td class="report-cell--indent" data-v-b7818330>${ssrInterpolate(it.item_name)}</td><td style="${ssrRenderStyle({ "text-align": "right" })}" data-v-b7818330>${ssrInterpolate(it.total_quantity)}</td><td class="money" style="${ssrRenderStyle({ "text-align": "right" })}" data-v-b7818330>${ssrInterpolate(money(it.total_subtotal))}</td><td class="money" style="${ssrRenderStyle({ "text-align": "right" })}" data-v-b7818330>${ssrInterpolate(money(it.discount_amount))}</td></tr>`);
				});
				_push(`<!--]--><!--]-->`);
			});
			_push(`<!--]--></tbody></table></div></div><div class="ui-card report-block" data-v-b7818330><div class="ui-card-header" data-v-b7818330> Item Quantity (Order Date) <span class="report-chip" data-v-b7818330> Service charges: ${ssrInterpolate(money(itemQtyCurrent.value.service_charge_total))} · Total: ${ssrInterpolate(money(itemQtyCurrent.value.totalGrandTotal))}</span></div><div class="data-table-wrap" data-v-b7818330><table class="data-table" data-v-b7818330><thead data-v-b7818330><tr data-v-b7818330><th data-v-b7818330>Category / Item</th><th style="${ssrRenderStyle({ "text-align": "right" })}" data-v-b7818330>Qty</th><th style="${ssrRenderStyle({ "text-align": "right" })}" data-v-b7818330>Subtotal</th><th style="${ssrRenderStyle({ "text-align": "right" })}" data-v-b7818330>Discount</th></tr></thead><tbody data-v-b7818330>`);
			if (reportsLoading.value) _push(`<tr data-v-b7818330><td colspan="4" class="data-table__empty" data-v-b7818330>Loading…</td></tr>`);
			else if (!itemQtyCurrent.value.categories.length) _push(`<tr data-v-b7818330><td colspan="4" class="data-table__empty" data-v-b7818330>No item sales in this range.</td></tr>`);
			else _push(`<!---->`);
			_push(`<!--[-->`);
			ssrRenderList(itemQtyCurrent.value.categories, (cat, ci) => {
				_push(`<!--[--><tr class="report-row--group" data-v-b7818330><td data-v-b7818330>${ssrInterpolate(cat.category_name)}</td><td style="${ssrRenderStyle({ "text-align": "right" })}" data-v-b7818330>${ssrInterpolate(cat.total_quantity)}</td><td class="money" style="${ssrRenderStyle({ "text-align": "right" })}" data-v-b7818330>${ssrInterpolate(money(cat.total_subtotal))}</td><td class="money" style="${ssrRenderStyle({ "text-align": "right" })}" data-v-b7818330>${ssrInterpolate(money(cat.discount_amount))}</td></tr><!--[-->`);
				ssrRenderList(cat.items, (it, ii) => {
					_push(`<tr data-v-b7818330><td class="report-cell--indent" data-v-b7818330>${ssrInterpolate(it.item_name)}</td><td style="${ssrRenderStyle({ "text-align": "right" })}" data-v-b7818330>${ssrInterpolate(it.total_quantity)}</td><td class="money" style="${ssrRenderStyle({ "text-align": "right" })}" data-v-b7818330>${ssrInterpolate(money(it.total_subtotal))}</td><td class="money" style="${ssrRenderStyle({ "text-align": "right" })}" data-v-b7818330>${ssrInterpolate(money(it.discount_amount))}</td></tr>`);
				});
				_push(`<!--]--><!--]-->`);
			});
			_push(`<!--]--></tbody></table></div></div><div class="dash-grid" data-v-b7818330><div class="ui-card" data-v-b7818330><div class="ui-card-header" data-v-b7818330> Quick Report — Today <span class="report-chip" data-v-b7818330>${ssrInterpolate(quickReport.value.length)} order(s)</span></div><div class="data-table-wrap" data-v-b7818330><table class="data-table" data-v-b7818330><thead data-v-b7818330><tr data-v-b7818330><th data-v-b7818330>Order</th><th data-v-b7818330>Customer</th><th data-v-b7818330>Type</th><th style="${ssrRenderStyle({ "text-align": "right" })}" data-v-b7818330>Total</th></tr></thead><tbody data-v-b7818330>`);
			if (reportsLoading.value) _push(`<tr data-v-b7818330><td colspan="4" class="data-table__empty" data-v-b7818330>Loading…</td></tr>`);
			else if (!quickReport.value.length) _push(`<tr data-v-b7818330><td colspan="4" class="data-table__empty" data-v-b7818330>No orders today.</td></tr>`);
			else _push(`<!---->`);
			_push(`<!--[-->`);
			ssrRenderList(quickReport.value, (o) => {
				_push(`<tr data-v-b7818330><td data-v-b7818330>#${ssrInterpolate(o.id)}</td><td data-v-b7818330>${ssrInterpolate(o.customer?.name || "Guest")}</td><td data-v-b7818330>${ssrInterpolate(typeLabel(o.type))}</td><td class="money" style="${ssrRenderStyle({ "text-align": "right" })}" data-v-b7818330>${ssrInterpolate(money(o.grand_total))}</td></tr>`);
			});
			_push(`<!--]--></tbody></table></div></div><div class="ui-card" data-v-b7818330><div class="ui-card-header" data-v-b7818330>Top 10 Deals — Today</div><div class="data-table-wrap" data-v-b7818330><table class="data-table" data-v-b7818330><thead data-v-b7818330><tr data-v-b7818330><th data-v-b7818330>Order</th><th data-v-b7818330>Customer</th><th style="${ssrRenderStyle({ "text-align": "right" })}" data-v-b7818330>Total</th></tr></thead><tbody data-v-b7818330>`);
			if (reportsLoading.value) _push(`<tr data-v-b7818330><td colspan="3" class="data-table__empty" data-v-b7818330>Loading…</td></tr>`);
			else if (!topTen.value.length) _push(`<tr data-v-b7818330><td colspan="3" class="data-table__empty" data-v-b7818330>No orders today.</td></tr>`);
			else _push(`<!---->`);
			_push(`<!--[-->`);
			ssrRenderList(topTen.value, (o) => {
				_push(`<tr data-v-b7818330><td data-v-b7818330>#${ssrInterpolate(o.id)}</td><td data-v-b7818330>${ssrInterpolate(o.customer?.name || "Guest")}</td><td class="money" style="${ssrRenderStyle({ "text-align": "right" })}" data-v-b7818330>${ssrInterpolate(money(o.grand_total))}</td></tr>`);
			});
			_push(`<!--]--></tbody></table></div></div></div><div class="ui-card report-block" data-v-b7818330><div class="ui-card-header" data-v-b7818330> Deleted Orders — Today <span class="report-chip" data-v-b7818330>${ssrInterpolate(deletedOrders.value.length)} deleted</span></div><div class="data-table-wrap" data-v-b7818330><table class="data-table" data-v-b7818330><thead data-v-b7818330><tr data-v-b7818330><th data-v-b7818330>Order</th><th data-v-b7818330>Type</th><th data-v-b7818330>Status</th><th data-v-b7818330>Deleted At</th><th style="${ssrRenderStyle({ "text-align": "right" })}" data-v-b7818330>Total</th></tr></thead><tbody data-v-b7818330>`);
			if (reportsLoading.value) _push(`<tr data-v-b7818330><td colspan="5" class="data-table__empty" data-v-b7818330>Loading…</td></tr>`);
			else if (!deletedOrders.value.length) _push(`<tr data-v-b7818330><td colspan="5" class="data-table__empty" data-v-b7818330>No orders deleted today.</td></tr>`);
			else _push(`<!---->`);
			_push(`<!--[-->`);
			ssrRenderList(deletedOrders.value, (o) => {
				_push(`<tr data-v-b7818330><td data-v-b7818330>#${ssrInterpolate(o.id)}</td><td data-v-b7818330>${ssrInterpolate(typeLabel(o.type))}</td><td data-v-b7818330><span class="${ssrRenderClass([statusClass(o.status), "ui-badge"])}" data-v-b7818330>${ssrInterpolate(o.status || "—")}</span></td><td data-v-b7818330>${ssrInterpolate(dateTime(o.deleted_at))}</td><td class="money" style="${ssrRenderStyle({ "text-align": "right" })}" data-v-b7818330>${ssrInterpolate(money(o.grand_total))}</td></tr>`);
			});
			_push(`<!--]--></tbody></table></div></div></div>`);
		};
	}
});
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/pages/Dashboard.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var Dashboard_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-b7818330"]]);
//#endregion
export { Dashboard_default as default };
