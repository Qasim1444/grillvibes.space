import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-BOaGB7Aw.js";
import { t as AdminLayout_default } from "./AdminLayout-B21JQZcd.js";
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
		const revenueTrend = computed(() => props.reports?.revenueTrend ?? []);
		const trendPoints = computed(() => {
			const rows = revenueTrend.value;
			const max = Math.max(...rows.map((row) => Number(row.total_sales) || 0), 1);
			const left = 54;
			const bottom = 198;
			return rows.map((row, index) => {
				const value = Number(row.total_sales) || 0;
				const x = rows.length === 1 ? 400 : left + 692 * index / (rows.length - 1);
				const y = bottom - value / max * 178;
				const date = String(row.report_date || "").slice(0, 10);
				const parsed = /* @__PURE__ */ new Date(`${date}T12:00:00`);
				return {
					date,
					value,
					orders: Number(row.order_count) || 0,
					x,
					y,
					label: Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleDateString("en-PK", {
						day: "numeric",
						month: "short",
						timeZone: "Asia/Karachi"
					})
				};
			});
		});
		const trendLinePoints = computed(() => trendPoints.value.map((point) => `${point.x},${point.y}`).join(" "));
		const trendAreaPath = computed(() => {
			const points = trendPoints.value;
			if (!points.length) return "";
			return `M ${points[0].x} 198 L ${points.map((point) => `${point.x} ${point.y}`).join(" L ")} L ${points[points.length - 1].x} 198 Z`;
		});
		const trendTicks = computed(() => {
			const max = Math.max(...revenueTrend.value.map((row) => Number(row.total_sales) || 0), 1);
			return [
				0,
				1,
				2,
				3
			].map((index) => ({
				y: 198 - index * (178 / 3),
				label: compactMoney(max * index / 3)
			}));
		});
		const trendDateLabels = computed(() => {
			const points = trendPoints.value;
			if (points.length <= 4) return points.map((point) => ({
				x: point.x,
				text: point.label
			}));
			return [.../* @__PURE__ */ new Set([
				0,
				Math.round((points.length - 1) / 3),
				Math.round((points.length - 1) * 2 / 3),
				points.length - 1
			])].map((index) => ({
				x: points[index].x,
				text: points[index].label
			}));
		});
		const orderStatusRows = computed(() => props.reports?.orderStatus ?? []);
		const orderStatusTotal = computed(() => orderStatusRows.value.reduce((total, row) => total + (Number(row.order_count) || 0), 0));
		const STATUS_COLORS = [
			"#f04b2c",
			"#84cc16",
			"#818cf8",
			"#f59e0b",
			"#22c5a7",
			"#a1a1aa"
		];
		const orderStatusLegend = computed(() => orderStatusRows.value.map((row, index) => {
			const value = Number(row.order_count) || 0;
			return {
				label: row.status_label || "Unknown",
				value,
				percent: orderStatusTotal.value ? Math.round(value / orderStatusTotal.value * 100) : 0,
				color: STATUS_COLORS[index % STATUS_COLORS.length]
			};
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
		const barsFor = (rows) => {
			const max = Math.max(...rows.map((row) => row.value), 1);
			return rows.map((row) => ({
				...row,
				percent: Math.max(3, Math.round(row.value / max * 100))
			}));
		};
		const summaryTypeGraph = computed(() => {
			const colors = [
				"#f04b2c",
				"#84cc16",
				"#818cf8",
				"#f59e0b"
			];
			const rows = summary.value.ordersByType.map((row) => ({
				label: typeLabel(row.type),
				value: Number(row.grand_total) || 0
			}));
			const total = rows.reduce((sum, row) => sum + row.value, 0) || 1;
			return rows.map((row, index) => ({
				...row,
				percent: row.value / total * 100,
				color: colors[index % colors.length]
			}));
		});
		const categorySalesTotal = computed(() => categorySales.value.reduce((sum, row) => sum + (Number(row.grand_total) || 0), 0));
		const CATEGORY_COLORS = [
			"#f04b2c",
			"#84cc16",
			"#818cf8",
			"#f59e0b",
			"#22c5a7",
			"#d946ef",
			"#38bdf8"
		];
		const categoryShare = computed(() => categorySales.value.map((row, index) => {
			const value = Number(row.grand_total) || 0;
			return {
				label: row.category_name || "Uncategorized",
				value,
				percent: categorySalesTotal.value ? Math.round(value / categorySalesTotal.value * 100) : 0,
				color: CATEGORY_COLORS[index % CATEGORY_COLORS.length]
			};
		}));
		const categoryDonut = computed(() => {
			let offset = 0;
			return `conic-gradient(${categoryShare.value.map((item) => {
				const start = offset;
				offset += categorySalesTotal.value ? item.value / categorySalesTotal.value * 100 : 0;
				return `${item.color} ${start}% ${offset}%`;
			}).join(", ")})`;
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
		const quickLineMax = computed(() => Math.max(...quickReport.value.map((order) => Number(order.grand_total) || 0), 1));
		const quickOrderLine = computed(() => {
			const orders = [...quickReport.value].sort((left, right) => {
				return new Date(left.order_datetime || left.created_at || 0).getTime() - new Date(right.order_datetime || right.created_at || 0).getTime();
			}).slice(-12);
			return orders.map((order, index) => ({
				id: order.id,
				value: Number(order.grand_total) || 0,
				x: orders.length === 1 ? 322 : 34 + index * (576 / (orders.length - 1)),
				y: 124 - (Number(order.grand_total) || 0) / quickLineMax.value * 100,
				radius: 4 + Math.sqrt((Number(order.grand_total) || 0) / quickLineMax.value) * 5
			}));
		});
		const quickLineTicks = computed(() => [
			24,
			74,
			124
		].map((y) => ({ y })));
		const quickLineLabels = computed(() => {
			const points = quickOrderLine.value;
			if (points.length <= 4) return points;
			return [.../* @__PURE__ */ new Set([
				0,
				Math.round((points.length - 1) / 2),
				points.length - 1
			])].map((index) => points[index]);
		});
		const topTenRankGraph = computed(() => {
			const rows = topTen.value.map((order) => ({
				id: order.id,
				value: Number(order.grand_total) || 0
			})).sort((a, b) => b.value - a.value).slice(0, 10);
			const max = Math.max(...rows.map((row) => row.value), 1);
			return rows.map((row) => ({
				...row,
				percent: Math.max(3, Math.round(row.value / max * 100))
			}));
		});
		const ORDER_TYPE_COLORS = {
			Dining: "#f04b2c",
			Delivery: "#84cc16",
			"On the way": "#818cf8"
		};
		const deletedTimeline = computed(() => deletedOrders.value.map((order) => {
			const date = new Date(order.deleted_at);
			const parts = new Intl.DateTimeFormat("en-GB", {
				timeZone: "Asia/Karachi",
				hour: "2-digit",
				minute: "2-digit",
				hourCycle: "h23"
			}).formatToParts(date);
			const hour = Number(parts.find((part) => part.type === "hour")?.value) || 0;
			const minute = Number(parts.find((part) => part.type === "minute")?.value) || 0;
			const type = typeLabel(order.type || "Other");
			return {
				id: order.id,
				type,
				time: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
				x: 40 + (hour * 60 + minute) / 1440 * 680,
				color: ORDER_TYPE_COLORS[type] || "#a1a1aa",
				timestamp: date.getTime()
			};
		}).sort((a, b) => a.timestamp - b.timestamp));
		const deletedTimelineTicks = [
			{
				x: 40,
				label: "12 AM"
			},
			{
				x: 210,
				label: "6 AM"
			},
			{
				x: 380,
				label: "12 PM"
			},
			{
				x: 550,
				label: "6 PM"
			},
			{
				x: 720,
				label: "12 AM"
			}
		];
		const deletedTypeLegend = computed(() => [...new Map(deletedTimeline.value.map((item) => [item.type, {
			label: item.type,
			color: item.color
		}])).values()]);
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
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "page" }, _attrs))} data-v-ae81a4bb>`);
			_push(ssrRenderComponent(_sfc_main$1, {
				title: "Dashboard",
				subtitle: "Quick overview of your system."
			}, {
				actions: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<button class="ui-btn ui-btn--ghost" data-v-ae81a4bb${_scopeId}><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-ae81a4bb${_scopeId}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" data-v-ae81a4bb${_scopeId}></path><polyline points="7 10 12 15 17 10" data-v-ae81a4bb${_scopeId}></polyline><line x1="12" y1="15" x2="12" y2="3" data-v-ae81a4bb${_scopeId}></line></svg> Export </button>`);
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
			_push(`<div class="ui-card ui-card-pad report-filter" data-v-ae81a4bb><div class="report-filter__field" data-v-ae81a4bb><label class="ui-label" for="rf-start" data-v-ae81a4bb>Start date</label><input id="rf-start"${ssrRenderAttr("value", range.value.start_date)} type="date" class="ui-input" data-v-ae81a4bb></div><div class="report-filter__field" data-v-ae81a4bb><label class="ui-label" for="rf-end" data-v-ae81a4bb>End date</label><input id="rf-end"${ssrRenderAttr("value", range.value.end_date)} type="date" class="ui-input" data-v-ae81a4bb></div><div class="report-filter__actions" data-v-ae81a4bb><button class="ui-btn ui-btn--primary"${ssrIncludeBooleanAttr(reportsLoading.value) ? " disabled" : ""} data-v-ae81a4bb>${ssrInterpolate(reportsLoading.value ? "Loading…" : "Apply")}</button><button class="ui-btn ui-btn--ghost"${ssrIncludeBooleanAttr(reportsLoading.value) ? " disabled" : ""} data-v-ae81a4bb> Today </button></div></div><div class="stat-grid" data-v-ae81a4bb>`);
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
					if (_push) _push(`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-ae81a4bb${_scopeId}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" data-v-ae81a4bb${_scopeId}></path><circle cx="9" cy="7" r="4" data-v-ae81a4bb${_scopeId}></circle><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" data-v-ae81a4bb${_scopeId}></path></svg>`);
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
					if (_push) _push(`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-ae81a4bb${_scopeId}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" data-v-ae81a4bb${_scopeId}></path><circle cx="12" cy="7" r="4" data-v-ae81a4bb${_scopeId}></circle></svg>`);
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
					if (_push) _push(`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-ae81a4bb${_scopeId}><path d="M3 2v7c0 1.1.9 2 2 2h0a2 2 0 0 0 2-2V2M5 2v20M17 2c-1.7 0-3 2-3 5s1.3 5 3 5v10" data-v-ae81a4bb${_scopeId}></path></svg>`);
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
					if (_push) _push(`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-ae81a4bb${_scopeId}><rect x="3" y="4" width="18" height="16" rx="2" data-v-ae81a4bb${_scopeId}></rect><path d="M3 10h18" data-v-ae81a4bb${_scopeId}></path></svg>`);
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
			_push(`</div><div class="dash-grid" data-v-ae81a4bb><div class="ui-card" data-v-ae81a4bb><div class="ui-card-header" data-v-ae81a4bb> Recent Orders `);
			_push(ssrRenderComponent(unref(Link), { href: "/orders" }, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`View all`);
					else return [createTextVNode("View all")];
				}),
				_: 1
			}, _parent));
			_push(`</div><div class="data-table-wrap" data-v-ae81a4bb><table class="data-table" data-v-ae81a4bb><thead data-v-ae81a4bb><tr data-v-ae81a4bb><th data-v-ae81a4bb>Order</th><th data-v-ae81a4bb>Customer</th><th data-v-ae81a4bb>Type</th><th data-v-ae81a4bb>Status</th><th style="${ssrRenderStyle({ "text-align": "right" })}" data-v-ae81a4bb>Total</th></tr></thead><tbody data-v-ae81a4bb>`);
			if (!recentOrders.value.length) _push(`<tr data-v-ae81a4bb><td colspan="5" class="data-table__empty" data-v-ae81a4bb>No orders yet.</td></tr>`);
			else _push(`<!---->`);
			_push(`<!--[-->`);
			ssrRenderList(recentOrders.value, (o) => {
				_push(`<tr data-v-ae81a4bb><td data-v-ae81a4bb>#${ssrInterpolate(o.id)}</td><td data-v-ae81a4bb>${ssrInterpolate(o.customer?.name || o.customer_name || "Guest")}</td><td data-v-ae81a4bb>${ssrInterpolate(typeLabel(o.type))}</td><td data-v-ae81a4bb><span class="${ssrRenderClass([statusClass(o.status), "ui-badge"])}" data-v-ae81a4bb>${ssrInterpolate(o.status || "—")}</span></td><td class="money" style="${ssrRenderStyle({ "text-align": "right" })}" data-v-ae81a4bb>${ssrInterpolate(money(o.grand_total))}</td></tr>`);
			});
			_push(`<!--]--></tbody></table></div></div><div class="ui-card" data-v-ae81a4bb><div class="ui-card-header" data-v-ae81a4bb> Customer Feedback `);
			_push(ssrRenderComponent(unref(Link), { href: "/feedback" }, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`View all`);
					else return [createTextVNode("View all")];
				}),
				_: 1
			}, _parent));
			_push(`</div><div class="fb__summary" data-v-ae81a4bb><span class="fb__avg" data-v-ae81a4bb>${ssrInterpolate(feedbackStats.value.avg_rating ?? "—")}</span><span class="fb__stars" data-v-ae81a4bb>${ssrInterpolate(stars(feedbackStats.value.avg_rating))}</span><span class="fb__count" data-v-ae81a4bb>${ssrInterpolate(feedbackStats.value.total)} review(s)</span></div><div class="fb__list" data-v-ae81a4bb>`);
			if (!feedback.value.length) _push(`<p class="data-table__empty" style="${ssrRenderStyle({ "padding": "20px 0" })}" data-v-ae81a4bb>No feedback yet.</p>`);
			else _push(`<!---->`);
			_push(`<!--[-->`);
			ssrRenderList(feedback.value, (f) => {
				_push(`<div class="fb__row" data-v-ae81a4bb><div class="fb__top" data-v-ae81a4bb><span class="fb__name" data-v-ae81a4bb>${ssrInterpolate(f.customer?.name || "Guest")}</span><span class="fb__stars" data-v-ae81a4bb>${ssrInterpolate(stars(f.rating))}</span></div>`);
				if (f.comment) _push(`<p class="fb__comment" data-v-ae81a4bb>“${ssrInterpolate(f.comment)}”</p>`);
				else _push(`<!---->`);
				_push(`</div>`);
			});
			_push(`<!--]--></div></div><div class="ui-card" data-v-ae81a4bb><div class="ui-card-header" data-v-ae81a4bb>Top Categories</div><div class="cat" data-v-ae81a4bb>`);
			if (!topCategories.value.length) _push(`<p class="data-table__empty" style="${ssrRenderStyle({ "padding": "20px 0" })}" data-v-ae81a4bb>No categories yet.</p>`);
			else _push(`<!---->`);
			_push(`<!--[-->`);
			ssrRenderList(topCategories.value, (c, i) => {
				_push(`<div class="cat__row" data-v-ae81a4bb><span class="cat__name" data-v-ae81a4bb>${ssrInterpolate(c.name)}</span><span class="cat__bar" data-v-ae81a4bb><span class="cat__fill" style="${ssrRenderStyle({
					width: c.pct + "%",
					background: barColor(i)
				})}" data-v-ae81a4bb></span></span><span class="cat__val" data-v-ae81a4bb>${ssrInterpolate(c.pct)}%</span></div>`);
			});
			_push(`<!--]--></div></div></div><section class="ui-card reservations-widget" data-v-ae81a4bb><div class="ui-card-header" data-v-ae81a4bb><span data-v-ae81a4bb>Upcoming Reservations <span class="report-chip" data-v-ae81a4bb>${ssrInterpolate(upcomingReservations.value.length)}</span></span>`);
			_push(ssrRenderComponent(unref(Link), { href: "/reservations" }, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`View all`);
					else return [createTextVNode("View all")];
				}),
				_: 1
			}, _parent));
			_push(`</div>`);
			if (!upcomingReservations.value.length) _push(`<p class="reservation-empty" data-v-ae81a4bb>No upcoming reservations.</p>`);
			else {
				_push(`<div class="reservation-list" data-v-ae81a4bb><!--[-->`);
				ssrRenderList(upcomingReservations.value, (reservation) => {
					_push(`<article class="reservation-row" data-v-ae81a4bb><div class="reservation-row__date" data-v-ae81a4bb><strong data-v-ae81a4bb>${ssrInterpolate(reservationDate(reservation.reserved_at).day)}</strong><span data-v-ae81a4bb>${ssrInterpolate(reservationDate(reservation.reserved_at).month)}</span></div><div class="reservation-row__details" data-v-ae81a4bb><strong data-v-ae81a4bb>${ssrInterpolate(reservation.guest_name)}</strong><span data-v-ae81a4bb>${ssrInterpolate(reservationTime(reservation.reserved_at))} · ${ssrInterpolate(reservation.party_size)} guests · Table ${ssrInterpolate(reservation.dining_table?.table_number || "—")}</span></div><span class="${ssrRenderClass([reservation.status === "confirmed" ? "ui-badge--success" : "ui-badge--warning", "ui-badge"])}" data-v-ae81a4bb>${ssrInterpolate(reservation.status)}</span></article>`);
				});
				_push(`<!--]--></div>`);
			}
			_push(`</section><h2 class="report-heading" data-v-ae81a4bb>Reports</h2><p class="report-heading__sub" data-v-ae81a4bb>${ssrInterpolate(rangeLabel.value)}</p><div class="stat-grid" data-v-ae81a4bb>`);
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
			_push(`</div><section class="analytics-grid" aria-label="Sales and order analytics" data-v-ae81a4bb><article class="ui-card analytics-card analytics-card--trend" data-v-ae81a4bb><div class="ui-card-header" data-v-ae81a4bb><div data-v-ae81a4bb><span class="analytics-eyebrow" data-v-ae81a4bb>PERFORMANCE</span><h3 data-v-ae81a4bb>Revenue trend</h3></div><span class="analytics-total" data-v-ae81a4bb>${ssrInterpolate(money(summary.value.totalGrandTotal))}</span></div>`);
			if (reportsLoading.value) _push(`<div class="analytics-empty" data-v-ae81a4bb>Updating report…</div>`);
			else if (!revenueTrend.value.length) _push(`<div class="analytics-empty" data-v-ae81a4bb>No revenue in this date range.</div>`);
			else {
				_push(`<div class="trend-chart" data-v-ae81a4bb><svg class="trend-chart__svg" viewBox="0 0 760 250" role="img" aria-label="Daily revenue trend" data-v-ae81a4bb><defs data-v-ae81a4bb><linearGradient id="revenueFill" x1="0" x2="0" y1="0" y2="1" data-v-ae81a4bb><stop offset="0%" stop-color="#f04b2c" stop-opacity=".24" data-v-ae81a4bb></stop><stop offset="100%" stop-color="#f04b2c" stop-opacity="0" data-v-ae81a4bb></stop></linearGradient></defs><!--[-->`);
				ssrRenderList(trendTicks.value, (tick) => {
					_push(`<g data-v-ae81a4bb><line x1="50"${ssrRenderAttr("y1", tick.y)} x2="748"${ssrRenderAttr("y2", tick.y)} class="trend-chart__grid" data-v-ae81a4bb></line><text x="42"${ssrRenderAttr("y", tick.y + 4)} text-anchor="end" class="trend-chart__tick" data-v-ae81a4bb>${ssrInterpolate(tick.label)}</text></g>`);
				});
				_push(`<!--]--><path${ssrRenderAttr("d", trendAreaPath.value)} fill="url(#revenueFill)" data-v-ae81a4bb></path><polyline${ssrRenderAttr("points", trendLinePoints.value)} class="trend-chart__line" data-v-ae81a4bb></polyline><!--[-->`);
				ssrRenderList(trendPoints.value, (point) => {
					_push(`<circle${ssrRenderAttr("cx", point.x)}${ssrRenderAttr("cy", point.y)} r="4" class="trend-chart__point" data-v-ae81a4bb><title data-v-ae81a4bb>${ssrInterpolate(point.label)}: ${ssrInterpolate(money(point.value))} · ${ssrInterpolate(point.orders)} orders</title></circle>`);
				});
				_push(`<!--]--><!--[-->`);
				ssrRenderList(trendDateLabels.value, (label) => {
					_push(`<text${ssrRenderAttr("x", label.x)} y="238" text-anchor="middle" class="trend-chart__tick" data-v-ae81a4bb>${ssrInterpolate(label.text)}</text>`);
				});
				_push(`<!--]--></svg></div>`);
			}
			_push(`<div class="trend-legend" data-v-ae81a4bb><span class="trend-legend__dot" data-v-ae81a4bb></span>Revenue <span class="trend-legend__unit" data-v-ae81a4bb>Daily total · PKR</span></div></article><article class="ui-card analytics-card analytics-card--status" data-v-ae81a4bb><div class="ui-card-header" data-v-ae81a4bb><div data-v-ae81a4bb><span class="analytics-eyebrow" data-v-ae81a4bb>OPERATIONS</span><h3 data-v-ae81a4bb>Order status</h3></div><span class="analytics-period" data-v-ae81a4bb>${ssrInterpolate(rangeLabel.value)}</span></div>`);
			if (reportsLoading.value) _push(`<div class="analytics-empty" data-v-ae81a4bb>Updating report…</div>`);
			else if (!orderStatusTotal.value) _push(`<div class="analytics-empty" data-v-ae81a4bb>No orders in this date range.</div>`);
			else {
				_push(`<div class="status-breakdown" data-v-ae81a4bb><!--[-->`);
				ssrRenderList(orderStatusLegend.value, (item) => {
					_push(`<div class="status-breakdown__row" data-v-ae81a4bb><div class="status-breakdown__label" data-v-ae81a4bb><span data-v-ae81a4bb><i style="${ssrRenderStyle({ background: item.color })}" data-v-ae81a4bb></i>${ssrInterpolate(item.label)}</span><strong data-v-ae81a4bb>${ssrInterpolate(item.value)} <small data-v-ae81a4bb>${ssrInterpolate(item.percent)}%</small></strong></div><div class="status-breakdown__track" data-v-ae81a4bb><i style="${ssrRenderStyle({
						width: `${item.percent}%`,
						background: item.color
					})}" data-v-ae81a4bb></i></div></div>`);
				});
				_push(`<!--]--></div>`);
			}
			_push(`</article></section><div class="dash-grid" data-v-ae81a4bb><div class="ui-card" data-v-ae81a4bb><div class="ui-card-header" data-v-ae81a4bb>Daily Summary by Type</div>`);
			if (summaryTypeGraph.value.length) {
				_push(`<div class="report-inline-chart" data-v-ae81a4bb><p class="chart-caption" data-v-ae81a4bb>Share of revenue by order type</p><div class="type-mix__bar" role="img"${ssrRenderAttr("aria-label", `${money(summary.value.totalGrandTotal)} sales by order type`)} data-v-ae81a4bb><!--[-->`);
				ssrRenderList(summaryTypeGraph.value, (item) => {
					_push(`<span style="${ssrRenderStyle({
						width: `${item.percent}%`,
						background: item.color
					})}" data-v-ae81a4bb></span>`);
				});
				_push(`<!--]--></div><ul class="type-mix__legend" data-v-ae81a4bb><!--[-->`);
				ssrRenderList(summaryTypeGraph.value, (item) => {
					_push(`<li data-v-ae81a4bb><span data-v-ae81a4bb><i style="${ssrRenderStyle({ background: item.color })}" data-v-ae81a4bb></i>${ssrInterpolate(item.label)}</span><strong data-v-ae81a4bb>${ssrInterpolate(money(item.value))} <small data-v-ae81a4bb>${ssrInterpolate(item.percent)}%</small></strong></li>`);
				});
				_push(`<!--]--></ul></div>`);
			} else _push(`<!---->`);
			_push(`<div class="data-table-wrap" data-v-ae81a4bb><table class="data-table" data-v-ae81a4bb><thead data-v-ae81a4bb><tr data-v-ae81a4bb><th data-v-ae81a4bb>Type</th><th style="${ssrRenderStyle({ "text-align": "right" })}" data-v-ae81a4bb>Grand Total</th></tr></thead><tbody data-v-ae81a4bb>`);
			if (reportsLoading.value) _push(`<tr data-v-ae81a4bb><td colspan="2" class="data-table__empty" data-v-ae81a4bb>Loading…</td></tr>`);
			else if (!summary.value.ordersByType.length) _push(`<tr data-v-ae81a4bb><td colspan="2" class="data-table__empty" data-v-ae81a4bb>No sales in this range.</td></tr>`);
			else _push(`<!---->`);
			_push(`<!--[-->`);
			ssrRenderList(summary.value.ordersByType, (r, i) => {
				_push(`<tr data-v-ae81a4bb><td data-v-ae81a4bb>${ssrInterpolate(typeLabel(r.type))}</td><td class="money" style="${ssrRenderStyle({ "text-align": "right" })}" data-v-ae81a4bb>${ssrInterpolate(money(r.grand_total))}</td></tr>`);
			});
			_push(`<!--]--></tbody>`);
			if (summary.value.ordersByType.length) _push(`<tfoot data-v-ae81a4bb><tr data-v-ae81a4bb><th data-v-ae81a4bb>Total</th><th class="money" style="${ssrRenderStyle({ "text-align": "right" })}" data-v-ae81a4bb>${ssrInterpolate(money(summary.value.totalGrandTotal))}</th></tr></tfoot>`);
			else _push(`<!---->`);
			_push(`</table></div></div><div class="ui-card" data-v-ae81a4bb><div class="ui-card-header" data-v-ae81a4bb>Category Sales</div>`);
			if (categoryShare.value.length) {
				_push(`<div class="category-share" data-v-ae81a4bb><div class="category-share__donut" style="${ssrRenderStyle({ background: categoryDonut.value })}" role="img"${ssrRenderAttr("aria-label", `${money(categorySalesTotal.value)} category sales`)} data-v-ae81a4bb><div data-v-ae81a4bb><strong data-v-ae81a4bb>${ssrInterpolate(compactMoney(categorySalesTotal.value))}</strong><span data-v-ae81a4bb>Total sales</span></div></div><ul class="category-share__legend" data-v-ae81a4bb><!--[-->`);
				ssrRenderList(categoryShare.value, (item) => {
					_push(`<li data-v-ae81a4bb><span data-v-ae81a4bb><i style="${ssrRenderStyle({ background: item.color })}" data-v-ae81a4bb></i>${ssrInterpolate(item.label)}</span><strong data-v-ae81a4bb>${ssrInterpolate(item.percent)}%</strong></li>`);
				});
				_push(`<!--]--></ul></div>`);
			} else _push(`<!---->`);
			_push(`<div class="data-table-wrap" data-v-ae81a4bb><table class="data-table" data-v-ae81a4bb><thead data-v-ae81a4bb><tr data-v-ae81a4bb><th data-v-ae81a4bb>Category</th><th style="${ssrRenderStyle({ "text-align": "right" })}" data-v-ae81a4bb>Subtotal</th><th style="${ssrRenderStyle({ "text-align": "right" })}" data-v-ae81a4bb>Discount</th><th style="${ssrRenderStyle({ "text-align": "right" })}" data-v-ae81a4bb>Total</th></tr></thead><tbody data-v-ae81a4bb>`);
			if (reportsLoading.value) _push(`<tr data-v-ae81a4bb><td colspan="4" class="data-table__empty" data-v-ae81a4bb>Loading…</td></tr>`);
			else if (!categorySales.value.length) _push(`<tr data-v-ae81a4bb><td colspan="4" class="data-table__empty" data-v-ae81a4bb>No category sales in this range.</td></tr>`);
			else _push(`<!---->`);
			_push(`<!--[-->`);
			ssrRenderList(categorySales.value, (c, i) => {
				_push(`<tr data-v-ae81a4bb><td data-v-ae81a4bb>${ssrInterpolate(c.category_name)}</td><td class="money" style="${ssrRenderStyle({ "text-align": "right" })}" data-v-ae81a4bb>${ssrInterpolate(money(c.total_subtotal))}</td><td class="money" style="${ssrRenderStyle({ "text-align": "right" })}" data-v-ae81a4bb>${ssrInterpolate(money(c.discount_amount))}</td><td class="money" style="${ssrRenderStyle({ "text-align": "right" })}" data-v-ae81a4bb>${ssrInterpolate(money(c.grand_total))}</td></tr>`);
			});
			_push(`<!--]--></tbody></table></div></div></div><div class="ui-card report-block" data-v-ae81a4bb><div class="ui-card-header" data-v-ae81a4bb> Category Sales by Item Quantity <span class="report-chip" data-v-ae81a4bb>Service charges: ${ssrInterpolate(money(itemQty.value.service_charge_total))}</span></div>`);
			if (itemQtyGraph.value.length) {
				_push(`<div class="report-inline-chart" data-v-ae81a4bb><p class="chart-caption" data-v-ae81a4bb>Top items by quantity</p><div class="chart-bars" data-v-ae81a4bb><!--[-->`);
				ssrRenderList(itemQtyGraph.value, (row, index) => {
					_push(`<div class="chart-bar-row" data-v-ae81a4bb><div class="chart-bar-label" data-v-ae81a4bb><span class="${ssrRenderClass([`chart-dot--${index % 4}`, "chart-dot"])}" data-v-ae81a4bb></span><span data-v-ae81a4bb>${ssrInterpolate(row.label)}</span><strong data-v-ae81a4bb>${ssrInterpolate(row.value)}</strong></div><div class="chart-track" data-v-ae81a4bb><span class="${ssrRenderClass([`chart-fill--${index % 4}`, "chart-fill"])}" style="${ssrRenderStyle({ width: `${row.percent}%` })}" data-v-ae81a4bb></span></div></div>`);
				});
				_push(`<!--]--></div></div>`);
			} else _push(`<!---->`);
			_push(`<div class="data-table-wrap" data-v-ae81a4bb><table class="data-table" data-v-ae81a4bb><thead data-v-ae81a4bb><tr data-v-ae81a4bb><th data-v-ae81a4bb>Category / Item</th><th style="${ssrRenderStyle({ "text-align": "right" })}" data-v-ae81a4bb>Qty</th><th style="${ssrRenderStyle({ "text-align": "right" })}" data-v-ae81a4bb>Subtotal</th><th style="${ssrRenderStyle({ "text-align": "right" })}" data-v-ae81a4bb>Discount</th></tr></thead><tbody data-v-ae81a4bb>`);
			if (reportsLoading.value) _push(`<tr data-v-ae81a4bb><td colspan="4" class="data-table__empty" data-v-ae81a4bb>Loading…</td></tr>`);
			else if (!itemQty.value.categories.length) _push(`<tr data-v-ae81a4bb><td colspan="4" class="data-table__empty" data-v-ae81a4bb>No item sales in this range.</td></tr>`);
			else _push(`<!---->`);
			_push(`<!--[-->`);
			ssrRenderList(itemQty.value.categories, (cat, ci) => {
				_push(`<!--[--><tr class="report-row--group" data-v-ae81a4bb><td data-v-ae81a4bb>${ssrInterpolate(cat.category_name)}</td><td style="${ssrRenderStyle({ "text-align": "right" })}" data-v-ae81a4bb>${ssrInterpolate(cat.total_quantity)}</td><td class="money" style="${ssrRenderStyle({ "text-align": "right" })}" data-v-ae81a4bb>${ssrInterpolate(money(cat.total_subtotal))}</td><td class="money" style="${ssrRenderStyle({ "text-align": "right" })}" data-v-ae81a4bb>${ssrInterpolate(money(cat.discount_amount))}</td></tr><!--[-->`);
				ssrRenderList(cat.items, (it, ii) => {
					_push(`<tr data-v-ae81a4bb><td class="report-cell--indent" data-v-ae81a4bb>${ssrInterpolate(it.item_name)}</td><td style="${ssrRenderStyle({ "text-align": "right" })}" data-v-ae81a4bb>${ssrInterpolate(it.total_quantity)}</td><td class="money" style="${ssrRenderStyle({ "text-align": "right" })}" data-v-ae81a4bb>${ssrInterpolate(money(it.total_subtotal))}</td><td class="money" style="${ssrRenderStyle({ "text-align": "right" })}" data-v-ae81a4bb>${ssrInterpolate(money(it.discount_amount))}</td></tr>`);
				});
				_push(`<!--]--><!--]-->`);
			});
			_push(`<!--]--></tbody></table></div></div><div class="ui-card report-block" data-v-ae81a4bb><div class="ui-card-header" data-v-ae81a4bb> Item Quantity (Order Date) <span class="report-chip" data-v-ae81a4bb> Service charges: ${ssrInterpolate(money(itemQtyCurrent.value.service_charge_total))} · Total: ${ssrInterpolate(money(itemQtyCurrent.value.totalGrandTotal))}</span></div>`);
			if (currentQtyGraph.value.length) {
				_push(`<div class="report-inline-chart" data-v-ae81a4bb><p class="chart-caption" data-v-ae81a4bb>Quantity by item · Order date</p><div class="chart-columns current-qty-columns" data-v-ae81a4bb><!--[-->`);
				ssrRenderList(currentQtyGraph.value, (row, index) => {
					_push(`<div class="chart-column" data-v-ae81a4bb><strong data-v-ae81a4bb>${ssrInterpolate(row.value)}</strong><div class="chart-column__track" data-v-ae81a4bb><span class="${ssrRenderClass([`chart-fill--${index % 4}`, "chart-column__fill"])}" style="${ssrRenderStyle({ height: `${row.percent}%` })}" data-v-ae81a4bb></span></div><span data-v-ae81a4bb>${ssrInterpolate(row.label)}</span></div>`);
				});
				_push(`<!--]--></div></div>`);
			} else _push(`<!---->`);
			_push(`<div class="data-table-wrap" data-v-ae81a4bb><table class="data-table" data-v-ae81a4bb><thead data-v-ae81a4bb><tr data-v-ae81a4bb><th data-v-ae81a4bb>Category / Item</th><th style="${ssrRenderStyle({ "text-align": "right" })}" data-v-ae81a4bb>Qty</th><th style="${ssrRenderStyle({ "text-align": "right" })}" data-v-ae81a4bb>Subtotal</th><th style="${ssrRenderStyle({ "text-align": "right" })}" data-v-ae81a4bb>Discount</th></tr></thead><tbody data-v-ae81a4bb>`);
			if (reportsLoading.value) _push(`<tr data-v-ae81a4bb><td colspan="4" class="data-table__empty" data-v-ae81a4bb>Loading…</td></tr>`);
			else if (!itemQtyCurrent.value.categories.length) _push(`<tr data-v-ae81a4bb><td colspan="4" class="data-table__empty" data-v-ae81a4bb>No item sales in this range.</td></tr>`);
			else _push(`<!---->`);
			_push(`<!--[-->`);
			ssrRenderList(itemQtyCurrent.value.categories, (cat, ci) => {
				_push(`<!--[--><tr class="report-row--group" data-v-ae81a4bb><td data-v-ae81a4bb>${ssrInterpolate(cat.category_name)}</td><td style="${ssrRenderStyle({ "text-align": "right" })}" data-v-ae81a4bb>${ssrInterpolate(cat.total_quantity)}</td><td class="money" style="${ssrRenderStyle({ "text-align": "right" })}" data-v-ae81a4bb>${ssrInterpolate(money(cat.total_subtotal))}</td><td class="money" style="${ssrRenderStyle({ "text-align": "right" })}" data-v-ae81a4bb>${ssrInterpolate(money(cat.discount_amount))}</td></tr><!--[-->`);
				ssrRenderList(cat.items, (it, ii) => {
					_push(`<tr data-v-ae81a4bb><td class="report-cell--indent" data-v-ae81a4bb>${ssrInterpolate(it.item_name)}</td><td style="${ssrRenderStyle({ "text-align": "right" })}" data-v-ae81a4bb>${ssrInterpolate(it.total_quantity)}</td><td class="money" style="${ssrRenderStyle({ "text-align": "right" })}" data-v-ae81a4bb>${ssrInterpolate(money(it.total_subtotal))}</td><td class="money" style="${ssrRenderStyle({ "text-align": "right" })}" data-v-ae81a4bb>${ssrInterpolate(money(it.discount_amount))}</td></tr>`);
				});
				_push(`<!--]--><!--]-->`);
			});
			_push(`<!--]--></tbody></table></div></div><div class="dash-grid" data-v-ae81a4bb><div class="ui-card" data-v-ae81a4bb><div class="ui-card-header" data-v-ae81a4bb> Quick Report — Today <span class="report-chip" data-v-ae81a4bb>${ssrInterpolate(quickReport.value.length)} order(s)</span></div><div class="data-table-wrap" data-v-ae81a4bb>`);
			if (quickOrderLine.value.length) {
				_push(`<div class="report-inline-chart" data-v-ae81a4bb><p class="chart-caption" data-v-ae81a4bb>Order value sequence · Today</p><svg class="quick-line-chart" viewBox="0 0 620 150" role="img" aria-label="Order values today" data-v-ae81a4bb><!--[-->`);
				ssrRenderList(quickLineTicks.value, (tick) => {
					_push(`<line x1="34"${ssrRenderAttr("y1", tick.y)} x2="610"${ssrRenderAttr("y2", tick.y)} class="trend-chart__grid" data-v-ae81a4bb></line>`);
				});
				_push(`<!--]--><!--[-->`);
				ssrRenderList(quickOrderLine.value, (point) => {
					_push(`<circle${ssrRenderAttr("cx", point.x)}${ssrRenderAttr("cy", point.y)}${ssrRenderAttr("r", point.radius)} class="quick-scatter__point" data-v-ae81a4bb><title data-v-ae81a4bb>Order #${ssrInterpolate(point.id)}: ${ssrInterpolate(money(point.value))}</title></circle>`);
				});
				_push(`<!--]--><!--[-->`);
				ssrRenderList(quickLineLabels.value, (label) => {
					_push(`<text${ssrRenderAttr("x", label.x)} y="145" text-anchor="middle" class="trend-chart__tick" data-v-ae81a4bb>#${ssrInterpolate(label.id)}</text>`);
				});
				_push(`<!--]--><text x="30" y="12" text-anchor="end" class="trend-chart__tick" data-v-ae81a4bb>${ssrInterpolate(compactMoney(quickLineMax.value))}</text></svg></div>`);
			} else _push(`<!---->`);
			_push(`<table class="data-table" data-v-ae81a4bb><thead data-v-ae81a4bb><tr data-v-ae81a4bb><th data-v-ae81a4bb>Order</th><th data-v-ae81a4bb>Customer</th><th data-v-ae81a4bb>Type</th><th style="${ssrRenderStyle({ "text-align": "right" })}" data-v-ae81a4bb>Total</th></tr></thead><tbody data-v-ae81a4bb>`);
			if (reportsLoading.value) _push(`<tr data-v-ae81a4bb><td colspan="4" class="data-table__empty" data-v-ae81a4bb>Loading…</td></tr>`);
			else if (!quickReport.value.length) _push(`<tr data-v-ae81a4bb><td colspan="4" class="data-table__empty" data-v-ae81a4bb>No orders today.</td></tr>`);
			else _push(`<!---->`);
			_push(`<!--[-->`);
			ssrRenderList(quickReport.value, (o) => {
				_push(`<tr data-v-ae81a4bb><td data-v-ae81a4bb>#${ssrInterpolate(o.id)}</td><td data-v-ae81a4bb>${ssrInterpolate(o.customer?.name || "Guest")}</td><td data-v-ae81a4bb>${ssrInterpolate(typeLabel(o.type))}</td><td class="money" style="${ssrRenderStyle({ "text-align": "right" })}" data-v-ae81a4bb>${ssrInterpolate(money(o.grand_total))}</td></tr>`);
			});
			_push(`<!--]--></tbody></table></div></div><div class="ui-card" data-v-ae81a4bb><div class="ui-card-header" data-v-ae81a4bb>Top 10 Deals — Today</div><div class="data-table-wrap" data-v-ae81a4bb>`);
			if (topTenRankGraph.value.length) {
				_push(`<div class="report-inline-chart" data-v-ae81a4bb><p class="chart-caption" data-v-ae81a4bb>Order value ranking · shown orders</p><div class="rank-chart" data-v-ae81a4bb><!--[-->`);
				ssrRenderList(topTenRankGraph.value, (row) => {
					_push(`<div class="rank-chart__row" data-v-ae81a4bb><span class="rank-chart__label" data-v-ae81a4bb>#${ssrInterpolate(row.id)}</span><span class="rank-chart__track" data-v-ae81a4bb><i style="${ssrRenderStyle({ left: `${row.percent}%` })}" data-v-ae81a4bb></i></span><strong data-v-ae81a4bb>${ssrInterpolate(compactMoney(row.value))}</strong></div>`);
				});
				_push(`<!--]--></div></div>`);
			} else _push(`<!---->`);
			_push(`<table class="data-table" data-v-ae81a4bb><thead data-v-ae81a4bb><tr data-v-ae81a4bb><th data-v-ae81a4bb>Order</th><th data-v-ae81a4bb>Customer</th><th style="${ssrRenderStyle({ "text-align": "right" })}" data-v-ae81a4bb>Total</th></tr></thead><tbody data-v-ae81a4bb>`);
			if (reportsLoading.value) _push(`<tr data-v-ae81a4bb><td colspan="3" class="data-table__empty" data-v-ae81a4bb>Loading…</td></tr>`);
			else if (!topTen.value.length) _push(`<tr data-v-ae81a4bb><td colspan="3" class="data-table__empty" data-v-ae81a4bb>No orders today.</td></tr>`);
			else _push(`<!---->`);
			_push(`<!--[-->`);
			ssrRenderList(topTen.value, (o) => {
				_push(`<tr data-v-ae81a4bb><td data-v-ae81a4bb>#${ssrInterpolate(o.id)}</td><td data-v-ae81a4bb>${ssrInterpolate(o.customer?.name || "Guest")}</td><td class="money" style="${ssrRenderStyle({ "text-align": "right" })}" data-v-ae81a4bb>${ssrInterpolate(money(o.grand_total))}</td></tr>`);
			});
			_push(`<!--]--></tbody></table></div></div></div><div class="ui-card report-block" data-v-ae81a4bb><div class="ui-card-header" data-v-ae81a4bb> Deleted Orders — Today <span class="report-chip" data-v-ae81a4bb>${ssrInterpolate(deletedOrders.value.length)} deleted</span></div>`);
			if (deletedTimeline.value.length) {
				_push(`<div class="report-inline-chart" data-v-ae81a4bb><p class="chart-caption" data-v-ae81a4bb>Deletion activity across the day</p><svg class="deleted-timeline" viewBox="0 0 760 104" role="img" aria-label="Deleted orders by time of day" data-v-ae81a4bb><!--[-->`);
				ssrRenderList(deletedTimelineTicks, (tick) => {
					_push(`<line${ssrRenderAttr("x1", tick.x)} y1="10"${ssrRenderAttr("x2", tick.x)} y2="78" class="trend-chart__grid" data-v-ae81a4bb></line>`);
				});
				_push(`<!--]--><!--[-->`);
				ssrRenderList(deletedTimeline.value, (item, index) => {
					_push(`<circle${ssrRenderAttr("cx", item.x)}${ssrRenderAttr("cy", 28 + index % 4 * 12)} r="5"${ssrRenderAttr("fill", item.color)} class="deleted-timeline__point" data-v-ae81a4bb><title data-v-ae81a4bb>Order #${ssrInterpolate(item.id)} · ${ssrInterpolate(item.type)} · ${ssrInterpolate(item.time)}</title></circle>`);
				});
				_push(`<!--]--><!--[-->`);
				ssrRenderList(deletedTimelineTicks, (tick) => {
					_push(`<text${ssrRenderAttr("x", tick.x)} y="98" text-anchor="middle" class="trend-chart__tick" data-v-ae81a4bb>${ssrInterpolate(tick.label)}</text>`);
				});
				_push(`<!--]--></svg><div class="deleted-timeline__legend" data-v-ae81a4bb><!--[-->`);
				ssrRenderList(deletedTypeLegend.value, (item) => {
					_push(`<span data-v-ae81a4bb><i style="${ssrRenderStyle({ background: item.color })}" data-v-ae81a4bb></i>${ssrInterpolate(item.label)}</span>`);
				});
				_push(`<!--]--></div></div>`);
			} else _push(`<!---->`);
			_push(`<div class="data-table-wrap" data-v-ae81a4bb><table class="data-table" data-v-ae81a4bb><thead data-v-ae81a4bb><tr data-v-ae81a4bb><th data-v-ae81a4bb>Order</th><th data-v-ae81a4bb>Type</th><th data-v-ae81a4bb>Status</th><th data-v-ae81a4bb>Deleted At</th><th style="${ssrRenderStyle({ "text-align": "right" })}" data-v-ae81a4bb>Total</th></tr></thead><tbody data-v-ae81a4bb>`);
			if (reportsLoading.value) _push(`<tr data-v-ae81a4bb><td colspan="5" class="data-table__empty" data-v-ae81a4bb>Loading…</td></tr>`);
			else if (!deletedOrders.value.length) _push(`<tr data-v-ae81a4bb><td colspan="5" class="data-table__empty" data-v-ae81a4bb>No orders deleted today.</td></tr>`);
			else _push(`<!---->`);
			_push(`<!--[-->`);
			ssrRenderList(deletedOrders.value, (o) => {
				_push(`<tr data-v-ae81a4bb><td data-v-ae81a4bb>#${ssrInterpolate(o.id)}</td><td data-v-ae81a4bb>${ssrInterpolate(typeLabel(o.type))}</td><td data-v-ae81a4bb><span class="${ssrRenderClass([statusClass(o.status), "ui-badge"])}" data-v-ae81a4bb>${ssrInterpolate(o.status || "—")}</span></td><td data-v-ae81a4bb>${ssrInterpolate(dateTime(o.deleted_at))}</td><td class="money" style="${ssrRenderStyle({ "text-align": "right" })}" data-v-ae81a4bb>${ssrInterpolate(money(o.grand_total))}</td></tr>`);
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
var Dashboard_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-ae81a4bb"]]);
//#endregion
export { Dashboard_default as default };
