import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-BOaGB7Aw.js";
import { t as AdminLayout_default } from "./AdminLayout-DfQNjfKt.js";
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
		upcomingReservations: {
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
		const dateTime = (v) => v ? new Date(v).toLocaleString("en-PK", { timeZone: "Asia/Karachi" }) : "—";
		const reservationDate = (value) => {
			if (!value) return {
				day: "—",
				month: ""
			};
			const date = new Date(value);
			return {
				day: new Intl.DateTimeFormat("en-PK", {
					day: "2-digit",
					timeZone: "Asia/Karachi"
				}).format(date),
				month: new Intl.DateTimeFormat("en-PK", {
					month: "short",
					timeZone: "Asia/Karachi"
				}).format(date)
			};
		};
		const reservationTime = (value) => value ? new Date(value).toLocaleTimeString("en-PK", {
			hour: "2-digit",
			minute: "2-digit",
			timeZone: "Asia/Karachi"
		}) : "—";
		const counts = computed(() => ({
			users: props.counts.users ?? "—",
			customers: props.counts.customers ?? "—",
			foodItems: props.counts.foodItems ?? "—",
			orders: props.counts.orders ?? "—"
		}));
		const recentOrders = computed(() => props.recentOrders ?? []);
		const upcomingReservations = computed(() => props.upcomingReservations ?? []);
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
		const salesMix = computed(() => {
			const rows = summary.value.ordersByType.map((row) => ({
				label: typeLabel(row.type),
				value: Number(row.grand_total) || 0
			}));
			const max = Math.max(...rows.map((row) => row.value), 1);
			return rows.map((row) => ({
				...row,
				percent: Math.max(3, Math.round(row.value / max * 100))
			}));
		});
		const categoryGraph = computed(() => {
			const rows = categorySales.value.map((row) => ({
				label: row.category_name || "Uncategorized",
				value: Number(row.grand_total) || 0
			})).sort((a, b) => b.value - a.value).slice(0, 6);
			const max = Math.max(...rows.map((row) => row.value), 1);
			return rows.map((row) => ({
				...row,
				percent: Math.max(3, Math.round(row.value / max * 100))
			}));
		});
		const barsFor = (rows) => {
			const max = Math.max(...rows.map((row) => row.value), 1);
			return rows.map((row) => ({
				...row,
				percent: Math.max(3, Math.round(row.value / max * 100))
			}));
		};
		const topItemsGraph = computed(() => {
			const rows = itemQty.value.categories.flatMap((category) => (category.items || []).map((item) => ({
				label: item.item_name || "Menu item",
				value: Number(item.total_quantity) || 0
			}))).sort((a, b) => b.value - a.value).slice(0, 8);
			const max = Math.max(...rows.map((row) => row.value), 1);
			return rows.map((row) => ({
				...row,
				percent: Math.max(3, Math.round(row.value / max * 100))
			}));
		});
		const itemQty = computed(() => ({
			service_charge_total: Number(props.reports?.itemQty?.service_charge_total ?? 0),
			categories: props.reports?.itemQty?.categories ?? []
		}));
		const itemQtyCurrent = computed(() => ({
			service_charge_total: Number(props.reports?.itemQtyCurrent?.service_charge_total ?? 0),
			categories: props.reports?.itemQtyCurrent?.categories ?? [],
			totalGrandTotal: Number(props.reports?.itemQtyCurrent?.totalGrandTotal ?? 0)
		}));
		const itemQtyGraph = computed(() => barsFor(itemQty.value.categories.flatMap((category) => (category.items || []).map((item) => ({
			label: item.item_name || "Menu item",
			value: Number(item.total_quantity) || 0
		}))).sort((a, b) => b.value - a.value).slice(0, 8)));
		const currentQtyGraph = computed(() => barsFor(itemQtyCurrent.value.categories.flatMap((category) => (category.items || []).map((item) => ({
			label: item.item_name || "Menu item",
			value: Number(item.total_quantity) || 0
		}))).sort((a, b) => b.value - a.value).slice(0, 8)));
		const quickReport = computed(() => props.reports?.quickReport ?? []);
		const topTen = computed(() => props.reports?.topTen ?? []);
		const deletedOrders = computed(() => props.reports?.deletedOrders ?? []);
		const quickOrderGraph = computed(() => barsFor(quickReport.value.map((order) => ({
			label: `#${order.id}`,
			value: Number(order.grand_total) || 0
		})).sort((a, b) => b.value - a.value).slice(0, 8)));
		const topTenGraph = computed(() => barsFor(topTen.value.map((order) => ({
			label: `#${order.id}`,
			value: Number(order.grand_total) || 0
		})).sort((a, b) => b.value - a.value).slice(0, 10)));
		const deletedGraph = computed(() => {
			const counts = deletedOrders.value.reduce((result, order) => {
				const label = typeLabel(order.type || "Other");
				result[label] = (result[label] || 0) + 1;
				return result;
			}, {});
			return barsFor(Object.entries(counts).map(([label, value]) => ({
				label,
				value
			})));
		});
		const compactMoney = (value) => {
			const amount = Number(value) || 0;
			return amount >= 1e6 ? `Rs ${(amount / 1e6).toFixed(1)}m` : amount >= 1e3 ? `Rs ${(amount / 1e3).toFixed(1)}k` : `Rs ${Math.round(amount)}`;
		};
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
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "page" }, _attrs))} data-v-4ac948d6>`);
			_push(ssrRenderComponent(_sfc_main$1, {
				title: "Dashboard",
				subtitle: "Quick overview of your system."
			}, {
				actions: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<button class="ui-btn ui-btn--ghost" data-v-4ac948d6${_scopeId}><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-4ac948d6${_scopeId}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" data-v-4ac948d6${_scopeId}></path><polyline points="7 10 12 15 17 10" data-v-4ac948d6${_scopeId}></polyline><line x1="12" y1="15" x2="12" y2="3" data-v-4ac948d6${_scopeId}></line></svg> Export </button>`);
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
			_push(`<div class="ui-card ui-card-pad report-filter" data-v-4ac948d6><div class="report-filter__field" data-v-4ac948d6><label class="ui-label" for="rf-start" data-v-4ac948d6>Start date</label><input id="rf-start"${ssrRenderAttr("value", range.value.start_date)} type="date" class="ui-input" data-v-4ac948d6></div><div class="report-filter__field" data-v-4ac948d6><label class="ui-label" for="rf-end" data-v-4ac948d6>End date</label><input id="rf-end"${ssrRenderAttr("value", range.value.end_date)} type="date" class="ui-input" data-v-4ac948d6></div><div class="report-filter__actions" data-v-4ac948d6><button class="ui-btn ui-btn--primary"${ssrIncludeBooleanAttr(reportsLoading.value) ? " disabled" : ""} data-v-4ac948d6>${ssrInterpolate(reportsLoading.value ? "Loading…" : "Apply")}</button><button class="ui-btn ui-btn--ghost"${ssrIncludeBooleanAttr(reportsLoading.value) ? " disabled" : ""} data-v-4ac948d6> Today </button></div></div><div class="stat-grid" data-v-4ac948d6>`);
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
					if (_push) _push(`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-4ac948d6${_scopeId}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" data-v-4ac948d6${_scopeId}></path><circle cx="9" cy="7" r="4" data-v-4ac948d6${_scopeId}></circle><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" data-v-4ac948d6${_scopeId}></path></svg>`);
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
					if (_push) _push(`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-4ac948d6${_scopeId}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" data-v-4ac948d6${_scopeId}></path><circle cx="12" cy="7" r="4" data-v-4ac948d6${_scopeId}></circle></svg>`);
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
					if (_push) _push(`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-4ac948d6${_scopeId}><path d="M3 2v7c0 1.1.9 2 2 2h0a2 2 0 0 0 2-2V2M5 2v20M17 2c-1.7 0-3 2-3 5s1.3 5 3 5v10" data-v-4ac948d6${_scopeId}></path></svg>`);
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
					if (_push) _push(`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-4ac948d6${_scopeId}><rect x="3" y="4" width="18" height="16" rx="2" data-v-4ac948d6${_scopeId}></rect><path d="M3 10h18" data-v-4ac948d6${_scopeId}></path></svg>`);
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
			_push(`</div><div class="dash-grid" data-v-4ac948d6><div class="ui-card" data-v-4ac948d6><div class="ui-card-header" data-v-4ac948d6> Recent Orders `);
			_push(ssrRenderComponent(unref(Link), { href: "/orders" }, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`View all`);
					else return [createTextVNode("View all")];
				}),
				_: 1
			}, _parent));
			_push(`</div><div class="data-table-wrap" data-v-4ac948d6><table class="data-table" data-v-4ac948d6><thead data-v-4ac948d6><tr data-v-4ac948d6><th data-v-4ac948d6>Order</th><th data-v-4ac948d6>Customer</th><th data-v-4ac948d6>Type</th><th data-v-4ac948d6>Status</th><th style="${ssrRenderStyle({ "text-align": "right" })}" data-v-4ac948d6>Total</th></tr></thead><tbody data-v-4ac948d6>`);
			if (!recentOrders.value.length) _push(`<tr data-v-4ac948d6><td colspan="5" class="data-table__empty" data-v-4ac948d6>No orders yet.</td></tr>`);
			else _push(`<!---->`);
			_push(`<!--[-->`);
			ssrRenderList(recentOrders.value, (o) => {
				_push(`<tr data-v-4ac948d6><td data-v-4ac948d6>#${ssrInterpolate(o.id)}</td><td data-v-4ac948d6>${ssrInterpolate(o.customer?.name || o.customer_name || "Guest")}</td><td data-v-4ac948d6>${ssrInterpolate(typeLabel(o.type))}</td><td data-v-4ac948d6><span class="${ssrRenderClass([statusClass(o.status), "ui-badge"])}" data-v-4ac948d6>${ssrInterpolate(o.status || "—")}</span></td><td class="money" style="${ssrRenderStyle({ "text-align": "right" })}" data-v-4ac948d6>${ssrInterpolate(money(o.grand_total))}</td></tr>`);
			});
			_push(`<!--]--></tbody></table></div></div><div class="ui-card" data-v-4ac948d6><div class="ui-card-header" data-v-4ac948d6> Customer Feedback `);
			_push(ssrRenderComponent(unref(Link), { href: "/feedback" }, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`View all`);
					else return [createTextVNode("View all")];
				}),
				_: 1
			}, _parent));
			_push(`</div><div class="fb__summary" data-v-4ac948d6><span class="fb__avg" data-v-4ac948d6>${ssrInterpolate(feedbackStats.value.avg_rating ?? "—")}</span><span class="fb__stars" data-v-4ac948d6>${ssrInterpolate(stars(feedbackStats.value.avg_rating))}</span><span class="fb__count" data-v-4ac948d6>${ssrInterpolate(feedbackStats.value.total)} review(s)</span></div><div class="fb__list" data-v-4ac948d6>`);
			if (!feedback.value.length) _push(`<p class="data-table__empty" style="${ssrRenderStyle({ "padding": "20px 0" })}" data-v-4ac948d6>No feedback yet.</p>`);
			else _push(`<!---->`);
			_push(`<!--[-->`);
			ssrRenderList(feedback.value, (f) => {
				_push(`<div class="fb__row" data-v-4ac948d6><div class="fb__top" data-v-4ac948d6><span class="fb__name" data-v-4ac948d6>${ssrInterpolate(f.customer?.name || "Guest")}</span><span class="fb__stars" data-v-4ac948d6>${ssrInterpolate(stars(f.rating))}</span></div>`);
				if (f.comment) _push(`<p class="fb__comment" data-v-4ac948d6>“${ssrInterpolate(f.comment)}”</p>`);
				else _push(`<!---->`);
				_push(`</div>`);
			});
			_push(`<!--]--></div></div><div class="ui-card" data-v-4ac948d6><div class="ui-card-header" data-v-4ac948d6>Top Categories</div><div class="cat" data-v-4ac948d6>`);
			if (!topCategories.value.length) _push(`<p class="data-table__empty" style="${ssrRenderStyle({ "padding": "20px 0" })}" data-v-4ac948d6>No categories yet.</p>`);
			else _push(`<!---->`);
			_push(`<!--[-->`);
			ssrRenderList(topCategories.value, (c, i) => {
				_push(`<div class="cat__row" data-v-4ac948d6><span class="cat__name" data-v-4ac948d6>${ssrInterpolate(c.name)}</span><span class="cat__bar" data-v-4ac948d6><span class="cat__fill" style="${ssrRenderStyle({
					width: c.pct + "%",
					background: barColor(i)
				})}" data-v-4ac948d6></span></span><span class="cat__val" data-v-4ac948d6>${ssrInterpolate(c.pct)}%</span></div>`);
			});
			_push(`<!--]--></div></div></div><section class="ui-card reservations-widget" data-v-4ac948d6><div class="ui-card-header" data-v-4ac948d6><span data-v-4ac948d6>Upcoming Reservations <span class="report-chip" data-v-4ac948d6>${ssrInterpolate(upcomingReservations.value.length)}</span></span>`);
			_push(ssrRenderComponent(unref(Link), { href: "/reservations" }, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`View all`);
					else return [createTextVNode("View all")];
				}),
				_: 1
			}, _parent));
			_push(`</div>`);
			if (!upcomingReservations.value.length) _push(`<p class="reservation-empty" data-v-4ac948d6>No upcoming reservations.</p>`);
			else {
				_push(`<div class="reservation-list" data-v-4ac948d6><!--[-->`);
				ssrRenderList(upcomingReservations.value, (reservation) => {
					_push(`<article class="reservation-row" data-v-4ac948d6><div class="reservation-row__date" data-v-4ac948d6><strong data-v-4ac948d6>${ssrInterpolate(reservationDate(reservation.reserved_at).day)}</strong><span data-v-4ac948d6>${ssrInterpolate(reservationDate(reservation.reserved_at).month)}</span></div><div class="reservation-row__details" data-v-4ac948d6><strong data-v-4ac948d6>${ssrInterpolate(reservation.guest_name)}</strong><span data-v-4ac948d6>${ssrInterpolate(reservationTime(reservation.reserved_at))} · ${ssrInterpolate(reservation.party_size)} guests · Table ${ssrInterpolate(reservation.dining_table?.table_number || "—")}</span></div><span class="${ssrRenderClass([reservation.status === "confirmed" ? "ui-badge--success" : "ui-badge--warning", "ui-badge"])}" data-v-4ac948d6>${ssrInterpolate(reservation.status)}</span></article>`);
				});
				_push(`<!--]--></div>`);
			}
			_push(`</section><h2 class="report-heading" data-v-4ac948d6>Reports</h2><p class="report-heading__sub" data-v-4ac948d6>${ssrInterpolate(rangeLabel.value)}</p><div class="stat-grid" data-v-4ac948d6>`);
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
			_push(`</div><div class="report-charts" data-v-4ac948d6><section class="ui-card report-chart-card" data-v-4ac948d6><div class="ui-card-header" data-v-4ac948d6>Sales mix <span class="report-chip" data-v-4ac948d6>By order type</span></div>`);
			if (!salesMix.value.length) _push(`<div class="chart-empty" data-v-4ac948d6>No sales in this range.</div>`);
			else {
				_push(`<div class="chart-columns" data-v-4ac948d6><!--[-->`);
				ssrRenderList(salesMix.value, (row, index) => {
					_push(`<div class="chart-column" data-v-4ac948d6><strong data-v-4ac948d6>${ssrInterpolate(compactMoney(row.value))}</strong><div class="chart-column__track" data-v-4ac948d6><span class="${ssrRenderClass([`chart-fill--${index % 4}`, "chart-column__fill"])}" style="${ssrRenderStyle({ height: `${row.percent}%` })}" data-v-4ac948d6></span></div><span data-v-4ac948d6>${ssrInterpolate(row.label)}</span></div>`);
				});
				_push(`<!--]--></div>`);
			}
			_push(`</section><section class="ui-card report-chart-card" data-v-4ac948d6><div class="ui-card-header" data-v-4ac948d6>Sales by category <span class="report-chip" data-v-4ac948d6>${ssrInterpolate(categoryGraph.value.length)} categories</span></div>`);
			if (!categoryGraph.value.length) _push(`<div class="chart-empty" data-v-4ac948d6>No category sales in this range.</div>`);
			else {
				_push(`<div class="chart-columns" data-v-4ac948d6><!--[-->`);
				ssrRenderList(categoryGraph.value, (row, index) => {
					_push(`<div class="chart-column" data-v-4ac948d6><strong data-v-4ac948d6>${ssrInterpolate(compactMoney(row.value))}</strong><div class="chart-column__track" data-v-4ac948d6><span class="${ssrRenderClass([`chart-fill--${index % 4}`, "chart-column__fill"])}" style="${ssrRenderStyle({ height: `${row.percent}%` })}" data-v-4ac948d6></span></div><span data-v-4ac948d6>${ssrInterpolate(row.label)}</span></div>`);
				});
				_push(`<!--]--></div>`);
			}
			_push(`</section><section class="ui-card report-chart-card report-chart-card--wide" data-v-4ac948d6><div class="ui-card-header" data-v-4ac948d6>Top selling items <span class="report-chip" data-v-4ac948d6>Quantity sold</span></div>`);
			if (!topItemsGraph.value.length) _push(`<div class="chart-empty" data-v-4ac948d6>No item sales in this range.</div>`);
			else {
				_push(`<div class="chart-columns chart-columns--items" data-v-4ac948d6><!--[-->`);
				ssrRenderList(topItemsGraph.value, (row, index) => {
					_push(`<div class="chart-column" data-v-4ac948d6><strong data-v-4ac948d6>${ssrInterpolate(row.value)}</strong><div class="chart-column__track" data-v-4ac948d6><span class="${ssrRenderClass([`chart-fill--${index % 4}`, "chart-column__fill"])}" style="${ssrRenderStyle({ height: `${row.percent}%` })}" data-v-4ac948d6></span></div><span data-v-4ac948d6>${ssrInterpolate(row.label)}</span></div>`);
				});
				_push(`<!--]--></div>`);
			}
			_push(`</section></div><div class="dash-grid" data-v-4ac948d6><div class="ui-card" data-v-4ac948d6><div class="ui-card-header" data-v-4ac948d6>Daily Summary by Type</div><div class="data-table-wrap" data-v-4ac948d6><table class="data-table" data-v-4ac948d6><thead data-v-4ac948d6><tr data-v-4ac948d6><th data-v-4ac948d6>Type</th><th style="${ssrRenderStyle({ "text-align": "right" })}" data-v-4ac948d6>Grand Total</th></tr></thead><tbody data-v-4ac948d6>`);
			if (reportsLoading.value) _push(`<tr data-v-4ac948d6><td colspan="2" class="data-table__empty" data-v-4ac948d6>Loading…</td></tr>`);
			else if (!summary.value.ordersByType.length) _push(`<tr data-v-4ac948d6><td colspan="2" class="data-table__empty" data-v-4ac948d6>No sales in this range.</td></tr>`);
			else _push(`<!---->`);
			_push(`<!--[-->`);
			ssrRenderList(summary.value.ordersByType, (r, i) => {
				_push(`<tr data-v-4ac948d6><td data-v-4ac948d6>${ssrInterpolate(typeLabel(r.type))}</td><td class="money" style="${ssrRenderStyle({ "text-align": "right" })}" data-v-4ac948d6>${ssrInterpolate(money(r.grand_total))}</td></tr>`);
			});
			_push(`<!--]--></tbody>`);
			if (summary.value.ordersByType.length) _push(`<tfoot data-v-4ac948d6><tr data-v-4ac948d6><th data-v-4ac948d6>Total</th><th class="money" style="${ssrRenderStyle({ "text-align": "right" })}" data-v-4ac948d6>${ssrInterpolate(money(summary.value.totalGrandTotal))}</th></tr></tfoot>`);
			else _push(`<!---->`);
			_push(`</table></div></div><div class="ui-card" data-v-4ac948d6><div class="ui-card-header" data-v-4ac948d6>Category Sales</div><div class="data-table-wrap" data-v-4ac948d6><table class="data-table" data-v-4ac948d6><thead data-v-4ac948d6><tr data-v-4ac948d6><th data-v-4ac948d6>Category</th><th style="${ssrRenderStyle({ "text-align": "right" })}" data-v-4ac948d6>Subtotal</th><th style="${ssrRenderStyle({ "text-align": "right" })}" data-v-4ac948d6>Discount</th><th style="${ssrRenderStyle({ "text-align": "right" })}" data-v-4ac948d6>Total</th></tr></thead><tbody data-v-4ac948d6>`);
			if (reportsLoading.value) _push(`<tr data-v-4ac948d6><td colspan="4" class="data-table__empty" data-v-4ac948d6>Loading…</td></tr>`);
			else if (!categorySales.value.length) _push(`<tr data-v-4ac948d6><td colspan="4" class="data-table__empty" data-v-4ac948d6>No category sales in this range.</td></tr>`);
			else _push(`<!---->`);
			_push(`<!--[-->`);
			ssrRenderList(categorySales.value, (c, i) => {
				_push(`<tr data-v-4ac948d6><td data-v-4ac948d6>${ssrInterpolate(c.category_name)}</td><td class="money" style="${ssrRenderStyle({ "text-align": "right" })}" data-v-4ac948d6>${ssrInterpolate(money(c.total_subtotal))}</td><td class="money" style="${ssrRenderStyle({ "text-align": "right" })}" data-v-4ac948d6>${ssrInterpolate(money(c.discount_amount))}</td><td class="money" style="${ssrRenderStyle({ "text-align": "right" })}" data-v-4ac948d6>${ssrInterpolate(money(c.grand_total))}</td></tr>`);
			});
			_push(`<!--]--></tbody></table></div></div></div><div class="ui-card report-block" data-v-4ac948d6><div class="ui-card-header" data-v-4ac948d6> Category Sales by Item Quantity <span class="report-chip" data-v-4ac948d6>Service charges: ${ssrInterpolate(money(itemQty.value.service_charge_total))}</span></div>`);
			if (itemQtyGraph.value.length) {
				_push(`<div class="report-inline-chart" data-v-4ac948d6><p class="chart-caption" data-v-4ac948d6>Top items by quantity</p><div class="chart-bars" data-v-4ac948d6><!--[-->`);
				ssrRenderList(itemQtyGraph.value, (row, index) => {
					_push(`<div class="chart-bar-row" data-v-4ac948d6><div class="chart-bar-label" data-v-4ac948d6><span class="${ssrRenderClass([`chart-dot--${index % 4}`, "chart-dot"])}" data-v-4ac948d6></span><span data-v-4ac948d6>${ssrInterpolate(row.label)}</span><strong data-v-4ac948d6>${ssrInterpolate(row.value)}</strong></div><div class="chart-track" data-v-4ac948d6><span class="${ssrRenderClass([`chart-fill--${index % 4}`, "chart-fill"])}" style="${ssrRenderStyle({ width: `${row.percent}%` })}" data-v-4ac948d6></span></div></div>`);
				});
				_push(`<!--]--></div></div>`);
			} else _push(`<!---->`);
			_push(`<div class="data-table-wrap" data-v-4ac948d6><table class="data-table" data-v-4ac948d6><thead data-v-4ac948d6><tr data-v-4ac948d6><th data-v-4ac948d6>Category / Item</th><th style="${ssrRenderStyle({ "text-align": "right" })}" data-v-4ac948d6>Qty</th><th style="${ssrRenderStyle({ "text-align": "right" })}" data-v-4ac948d6>Subtotal</th><th style="${ssrRenderStyle({ "text-align": "right" })}" data-v-4ac948d6>Discount</th></tr></thead><tbody data-v-4ac948d6>`);
			if (reportsLoading.value) _push(`<tr data-v-4ac948d6><td colspan="4" class="data-table__empty" data-v-4ac948d6>Loading…</td></tr>`);
			else if (!itemQty.value.categories.length) _push(`<tr data-v-4ac948d6><td colspan="4" class="data-table__empty" data-v-4ac948d6>No item sales in this range.</td></tr>`);
			else _push(`<!---->`);
			_push(`<!--[-->`);
			ssrRenderList(itemQty.value.categories, (cat, ci) => {
				_push(`<!--[--><tr class="report-row--group" data-v-4ac948d6><td data-v-4ac948d6>${ssrInterpolate(cat.category_name)}</td><td style="${ssrRenderStyle({ "text-align": "right" })}" data-v-4ac948d6>${ssrInterpolate(cat.total_quantity)}</td><td class="money" style="${ssrRenderStyle({ "text-align": "right" })}" data-v-4ac948d6>${ssrInterpolate(money(cat.total_subtotal))}</td><td class="money" style="${ssrRenderStyle({ "text-align": "right" })}" data-v-4ac948d6>${ssrInterpolate(money(cat.discount_amount))}</td></tr><!--[-->`);
				ssrRenderList(cat.items, (it, ii) => {
					_push(`<tr data-v-4ac948d6><td class="report-cell--indent" data-v-4ac948d6>${ssrInterpolate(it.item_name)}</td><td style="${ssrRenderStyle({ "text-align": "right" })}" data-v-4ac948d6>${ssrInterpolate(it.total_quantity)}</td><td class="money" style="${ssrRenderStyle({ "text-align": "right" })}" data-v-4ac948d6>${ssrInterpolate(money(it.total_subtotal))}</td><td class="money" style="${ssrRenderStyle({ "text-align": "right" })}" data-v-4ac948d6>${ssrInterpolate(money(it.discount_amount))}</td></tr>`);
				});
				_push(`<!--]--><!--]-->`);
			});
			_push(`<!--]--></tbody></table></div></div><div class="ui-card report-block" data-v-4ac948d6><div class="ui-card-header" data-v-4ac948d6> Item Quantity (Order Date) <span class="report-chip" data-v-4ac948d6> Service charges: ${ssrInterpolate(money(itemQtyCurrent.value.service_charge_total))} · Total: ${ssrInterpolate(money(itemQtyCurrent.value.totalGrandTotal))}</span></div>`);
			if (currentQtyGraph.value.length) {
				_push(`<div class="report-inline-chart" data-v-4ac948d6><p class="chart-caption" data-v-4ac948d6>Top items by quantity</p><div class="chart-bars" data-v-4ac948d6><!--[-->`);
				ssrRenderList(currentQtyGraph.value, (row, index) => {
					_push(`<div class="chart-bar-row" data-v-4ac948d6><div class="chart-bar-label" data-v-4ac948d6><span class="${ssrRenderClass([`chart-dot--${index % 4}`, "chart-dot"])}" data-v-4ac948d6></span><span data-v-4ac948d6>${ssrInterpolate(row.label)}</span><strong data-v-4ac948d6>${ssrInterpolate(row.value)}</strong></div><div class="chart-track" data-v-4ac948d6><span class="${ssrRenderClass([`chart-fill--${index % 4}`, "chart-fill"])}" style="${ssrRenderStyle({ width: `${row.percent}%` })}" data-v-4ac948d6></span></div></div>`);
				});
				_push(`<!--]--></div></div>`);
			} else _push(`<!---->`);
			_push(`<div class="data-table-wrap" data-v-4ac948d6><table class="data-table" data-v-4ac948d6><thead data-v-4ac948d6><tr data-v-4ac948d6><th data-v-4ac948d6>Category / Item</th><th style="${ssrRenderStyle({ "text-align": "right" })}" data-v-4ac948d6>Qty</th><th style="${ssrRenderStyle({ "text-align": "right" })}" data-v-4ac948d6>Subtotal</th><th style="${ssrRenderStyle({ "text-align": "right" })}" data-v-4ac948d6>Discount</th></tr></thead><tbody data-v-4ac948d6>`);
			if (reportsLoading.value) _push(`<tr data-v-4ac948d6><td colspan="4" class="data-table__empty" data-v-4ac948d6>Loading…</td></tr>`);
			else if (!itemQtyCurrent.value.categories.length) _push(`<tr data-v-4ac948d6><td colspan="4" class="data-table__empty" data-v-4ac948d6>No item sales in this range.</td></tr>`);
			else _push(`<!---->`);
			_push(`<!--[-->`);
			ssrRenderList(itemQtyCurrent.value.categories, (cat, ci) => {
				_push(`<!--[--><tr class="report-row--group" data-v-4ac948d6><td data-v-4ac948d6>${ssrInterpolate(cat.category_name)}</td><td style="${ssrRenderStyle({ "text-align": "right" })}" data-v-4ac948d6>${ssrInterpolate(cat.total_quantity)}</td><td class="money" style="${ssrRenderStyle({ "text-align": "right" })}" data-v-4ac948d6>${ssrInterpolate(money(cat.total_subtotal))}</td><td class="money" style="${ssrRenderStyle({ "text-align": "right" })}" data-v-4ac948d6>${ssrInterpolate(money(cat.discount_amount))}</td></tr><!--[-->`);
				ssrRenderList(cat.items, (it, ii) => {
					_push(`<tr data-v-4ac948d6><td class="report-cell--indent" data-v-4ac948d6>${ssrInterpolate(it.item_name)}</td><td style="${ssrRenderStyle({ "text-align": "right" })}" data-v-4ac948d6>${ssrInterpolate(it.total_quantity)}</td><td class="money" style="${ssrRenderStyle({ "text-align": "right" })}" data-v-4ac948d6>${ssrInterpolate(money(it.total_subtotal))}</td><td class="money" style="${ssrRenderStyle({ "text-align": "right" })}" data-v-4ac948d6>${ssrInterpolate(money(it.discount_amount))}</td></tr>`);
				});
				_push(`<!--]--><!--]-->`);
			});
			_push(`<!--]--></tbody></table></div></div><div class="dash-grid" data-v-4ac948d6><div class="ui-card" data-v-4ac948d6><div class="ui-card-header" data-v-4ac948d6> Quick Report — Today <span class="report-chip" data-v-4ac948d6>${ssrInterpolate(quickReport.value.length)} order(s)</span></div><div class="data-table-wrap" data-v-4ac948d6>`);
			if (quickOrderGraph.value.length) {
				_push(`<div class="report-inline-chart" data-v-4ac948d6><div class="chart-columns" data-v-4ac948d6><!--[-->`);
				ssrRenderList(quickOrderGraph.value, (row, index) => {
					_push(`<div class="chart-column" data-v-4ac948d6><strong data-v-4ac948d6>${ssrInterpolate(compactMoney(row.value))}</strong><div class="chart-column__track" data-v-4ac948d6><span class="${ssrRenderClass([`chart-fill--${index % 4}`, "chart-column__fill"])}" style="${ssrRenderStyle({ height: `${row.percent}%` })}" data-v-4ac948d6></span></div><span data-v-4ac948d6>${ssrInterpolate(row.label)}</span></div>`);
				});
				_push(`<!--]--></div></div>`);
			} else _push(`<!---->`);
			_push(`<table class="data-table" data-v-4ac948d6><thead data-v-4ac948d6><tr data-v-4ac948d6><th data-v-4ac948d6>Order</th><th data-v-4ac948d6>Customer</th><th data-v-4ac948d6>Type</th><th style="${ssrRenderStyle({ "text-align": "right" })}" data-v-4ac948d6>Total</th></tr></thead><tbody data-v-4ac948d6>`);
			if (reportsLoading.value) _push(`<tr data-v-4ac948d6><td colspan="4" class="data-table__empty" data-v-4ac948d6>Loading…</td></tr>`);
			else if (!quickReport.value.length) _push(`<tr data-v-4ac948d6><td colspan="4" class="data-table__empty" data-v-4ac948d6>No orders today.</td></tr>`);
			else _push(`<!---->`);
			_push(`<!--[-->`);
			ssrRenderList(quickReport.value, (o) => {
				_push(`<tr data-v-4ac948d6><td data-v-4ac948d6>#${ssrInterpolate(o.id)}</td><td data-v-4ac948d6>${ssrInterpolate(o.customer?.name || "Guest")}</td><td data-v-4ac948d6>${ssrInterpolate(typeLabel(o.type))}</td><td class="money" style="${ssrRenderStyle({ "text-align": "right" })}" data-v-4ac948d6>${ssrInterpolate(money(o.grand_total))}</td></tr>`);
			});
			_push(`<!--]--></tbody></table></div></div><div class="ui-card" data-v-4ac948d6><div class="ui-card-header" data-v-4ac948d6>Top 10 Deals — Today</div><div class="data-table-wrap" data-v-4ac948d6>`);
			if (topTenGraph.value.length) {
				_push(`<div class="report-inline-chart" data-v-4ac948d6><div class="chart-columns chart-columns--items" data-v-4ac948d6><!--[-->`);
				ssrRenderList(topTenGraph.value, (row, index) => {
					_push(`<div class="chart-column" data-v-4ac948d6><strong data-v-4ac948d6>${ssrInterpolate(compactMoney(row.value))}</strong><div class="chart-column__track" data-v-4ac948d6><span class="${ssrRenderClass([`chart-fill--${index % 4}`, "chart-column__fill"])}" style="${ssrRenderStyle({ height: `${row.percent}%` })}" data-v-4ac948d6></span></div><span data-v-4ac948d6>${ssrInterpolate(row.label)}</span></div>`);
				});
				_push(`<!--]--></div></div>`);
			} else _push(`<!---->`);
			_push(`<table class="data-table" data-v-4ac948d6><thead data-v-4ac948d6><tr data-v-4ac948d6><th data-v-4ac948d6>Order</th><th data-v-4ac948d6>Customer</th><th style="${ssrRenderStyle({ "text-align": "right" })}" data-v-4ac948d6>Total</th></tr></thead><tbody data-v-4ac948d6>`);
			if (reportsLoading.value) _push(`<tr data-v-4ac948d6><td colspan="3" class="data-table__empty" data-v-4ac948d6>Loading…</td></tr>`);
			else if (!topTen.value.length) _push(`<tr data-v-4ac948d6><td colspan="3" class="data-table__empty" data-v-4ac948d6>No orders today.</td></tr>`);
			else _push(`<!---->`);
			_push(`<!--[-->`);
			ssrRenderList(topTen.value, (o) => {
				_push(`<tr data-v-4ac948d6><td data-v-4ac948d6>#${ssrInterpolate(o.id)}</td><td data-v-4ac948d6>${ssrInterpolate(o.customer?.name || "Guest")}</td><td class="money" style="${ssrRenderStyle({ "text-align": "right" })}" data-v-4ac948d6>${ssrInterpolate(money(o.grand_total))}</td></tr>`);
			});
			_push(`<!--]--></tbody></table></div></div></div><div class="ui-card report-block" data-v-4ac948d6><div class="ui-card-header" data-v-4ac948d6> Deleted Orders — Today <span class="report-chip" data-v-4ac948d6>${ssrInterpolate(deletedOrders.value.length)} deleted</span></div>`);
			if (deletedGraph.value.length) {
				_push(`<div class="report-inline-chart" data-v-4ac948d6><p class="chart-caption" data-v-4ac948d6>Deleted orders by type</p><div class="chart-columns" data-v-4ac948d6><!--[-->`);
				ssrRenderList(deletedGraph.value, (row, index) => {
					_push(`<div class="chart-column" data-v-4ac948d6><strong data-v-4ac948d6>${ssrInterpolate(row.value)}</strong><div class="chart-column__track" data-v-4ac948d6><span class="${ssrRenderClass([`chart-fill--${index % 4}`, "chart-column__fill"])}" style="${ssrRenderStyle({ height: `${row.percent}%` })}" data-v-4ac948d6></span></div><span data-v-4ac948d6>${ssrInterpolate(row.label)}</span></div>`);
				});
				_push(`<!--]--></div></div>`);
			} else _push(`<!---->`);
			_push(`<div class="data-table-wrap" data-v-4ac948d6><table class="data-table" data-v-4ac948d6><thead data-v-4ac948d6><tr data-v-4ac948d6><th data-v-4ac948d6>Order</th><th data-v-4ac948d6>Type</th><th data-v-4ac948d6>Status</th><th data-v-4ac948d6>Deleted At</th><th style="${ssrRenderStyle({ "text-align": "right" })}" data-v-4ac948d6>Total</th></tr></thead><tbody data-v-4ac948d6>`);
			if (reportsLoading.value) _push(`<tr data-v-4ac948d6><td colspan="5" class="data-table__empty" data-v-4ac948d6>Loading…</td></tr>`);
			else if (!deletedOrders.value.length) _push(`<tr data-v-4ac948d6><td colspan="5" class="data-table__empty" data-v-4ac948d6>No orders deleted today.</td></tr>`);
			else _push(`<!---->`);
			_push(`<!--[-->`);
			ssrRenderList(deletedOrders.value, (o) => {
				_push(`<tr data-v-4ac948d6><td data-v-4ac948d6>#${ssrInterpolate(o.id)}</td><td data-v-4ac948d6>${ssrInterpolate(typeLabel(o.type))}</td><td data-v-4ac948d6><span class="${ssrRenderClass([statusClass(o.status), "ui-badge"])}" data-v-4ac948d6>${ssrInterpolate(o.status || "—")}</span></td><td data-v-4ac948d6>${ssrInterpolate(dateTime(o.deleted_at))}</td><td class="money" style="${ssrRenderStyle({ "text-align": "right" })}" data-v-4ac948d6>${ssrInterpolate(money(o.grand_total))}</td></tr>`);
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
var Dashboard_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-4ac948d6"]]);
//#endregion
export { Dashboard_default as default };
