import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-BOaGB7Aw.js";
import { n as usePermissions, t as AdminLayout_default } from "./AdminLayout-Bp8G38ms.js";
import { t as _sfc_main$1 } from "./PageHeader-D0aRDn5C.js";
import { t as DataTable_default } from "./DataTable-BHCUCuvd.js";
import { t as Pagination_default } from "./Pagination-h4WEvndd.js";
import { t as Modal_default } from "./Modal-DhESI6xO.js";
import { t as _sfc_main$2 } from "./FormField-Doe8oR1s.js";
import { t as StatCard_default } from "./StatCard-C81bFHCl.js";
import { t as CustomerPicker_default } from "./CustomerPicker-Bya7Uknk.js";
import { Fragment, computed, createBlock, createCommentVNode, createTextVNode, createVNode, mergeProps, openBlock, ref, renderList, toDisplayString, unref, useSSRContext, vModelSelect, watch, withCtx, withDirectives } from "vue";
import { Link, router } from "@inertiajs/vue3";
import { ssrIncludeBooleanAttr, ssrInterpolate, ssrLooseContain, ssrLooseEqual, ssrRenderAttr, ssrRenderAttrs, ssrRenderClass, ssrRenderComponent, ssrRenderList, ssrRenderStyle } from "vue/server-renderer";
//#region resources/js/pages/Orders.vue
var _sfc_main = /*@__PURE__*/ Object.assign({ layout: AdminLayout_default }, {
	__name: "Orders",
	__ssrInlineRender: true,
	props: {
		orders: {
			type: Object,
			default: () => ({ data: [] })
		},
		stats: {
			type: Object,
			default: () => ({
				total: 0,
				paid: 0,
				revenue: 0
			})
		},
		foodItems: {
			type: Array,
			default: () => []
		},
		places: {
			type: Array,
			default: () => []
		},
		kdsStations: {
			type: Array,
			default: () => []
		},
		filters: {
			type: Object,
			default: () => ({ search: "" })
		}
	},
	setup(__props) {
		const { can } = usePermissions();
		const props = __props;
		const money = (v) => `$${Number(v || 0).toFixed(2)}`;
		const num = (v) => {
			const n = Number(v);
			return Number.isFinite(n) ? n : 0;
		};
		const dateTime = (v) => v ? new Date(v).toLocaleString() : "—";
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
		const columns = [
			{
				key: "id",
				label: "Order",
				width: "80px"
			},
			{
				key: "customer_name",
				label: "Customer"
			},
			{
				key: "type",
				label: "Type"
			},
			{
				key: "status",
				label: "Status"
			},
			{
				key: "paid",
				label: "Payment"
			},
			{
				key: "qty",
				label: "Qty",
				width: "70px"
			},
			{
				key: "order_datetime",
				label: "Placed"
			},
			{
				key: "grand_total",
				label: "Total"
			}
		];
		const orders = computed(() => props.orders?.data ?? []);
		const stats = computed(() => props.stats);
		const items = computed(() => props.foodItems);
		const places = computed(() => props.places);
		const flashError = ref("");
		const search = ref(props.filters?.search ?? "");
		let searchTimer = null;
		watch(search, (value) => {
			clearTimeout(searchTimer);
			searchTimer = setTimeout(() => {
				router.get("/orders", { search: value || void 0 }, {
					preserveState: true,
					preserveScroll: true,
					replace: true,
					only: [
						"orders",
						"stats",
						"filters"
					]
				});
			}, 300);
		});
		const itemName = (id) => items.value.find((i) => i.id === id)?.name || `Item #${id}`;
		const placeName = (id) => places.value.find((p) => p.id === id)?.name || "—";
		const refresh = () => router.reload({ only: ["orders", "stats"] });
		const showView = ref(false);
		const viewing = ref(null);
		const viewOrder = (row) => {
			viewing.value = row;
			showView.value = true;
		};
		const showEdit = ref(false);
		const saving = ref(false);
		const saveError = ref("");
		const addItemId = ref("");
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
			promo_code: "",
			redeem_points: 0
		});
		const customerRequired = computed(() => form.value.type === "delivery");
		const lineTotal = (line) => num(line.price) * num(line.quantity);
		const subtotal = computed(() => form.value.items.reduce((s, l) => s + lineTotal(l), 0));
		const discountValue = computed(() => {
			const d = num(form.value.discount_amount);
			if (form.value.discount_type === "percentage") return Math.min(subtotal.value, subtotal.value * d / 100);
			return Math.min(subtotal.value, d);
		});
		const serviceCharges = computed(() => (subtotal.value - discountValue.value) * num(form.value.service_charges_percentage) / 100);
		const grandTotal = computed(() => Math.max(0, subtotal.value - discountValue.value + serviceCharges.value));
		const editOrder = (row) => {
			if (!row) return;
			saveError.value = "";
			addItemId.value = "";
			showView.value = false;
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
						price: num(it.sub_total) ? num(it.sub_total) / qty : num(menuItem?.price),
						quantity: qty,
						add_note: it.add_note || "",
						kds_station_id: it.kds_station_id ?? null
					};
				})
			};
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
			if (existing) existing.quantity += 1;
			else {
				const menuItem = items.value.find((i) => i.id === id);
				if (!menuItem) return;
				form.value.items.push({
					fooditems_id: menuItem.id,
					category_id: menuItem.foodcategory_id,
					name: menuItem.name,
					price: num(menuItem.price),
					quantity: 1,
					add_note: "",
					kds_station_id: null
				});
			}
			addItemId.value = "";
		};
		const toApiDate = (v) => {
			const d = v ? new Date(v) : /* @__PURE__ */ new Date();
			const p = (n) => String(n).padStart(2, "0");
			return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
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
					kds_station_id: l.kds_station_id ?? null
				}))
			};
			if (form.value.customer_id) payload.customer_id = Number(form.value.customer_id);
			if (form.value.promo_code) payload.promo_code = form.value.promo_code;
			if (num(form.value.redeem_points) > 0) payload.redeem_points = num(form.value.redeem_points);
			saving.value = true;
			router.put(`/orders/${form.value.id}`, payload, {
				preserveScroll: true,
				onSuccess: () => {
					showEdit.value = false;
				},
				onError: (errors) => {
					saveError.value = Object.values(errors).flat().join(" ") || "Could not update the order. Please try again.";
				},
				onFinish: () => {
					saving.value = false;
				}
			});
		};
		const deleteOrder = (id) => {
			if (!confirm(`Delete order #${id}? It will show under "Deleted Orders" on the dashboard.`)) return;
			router.delete(`/orders/${id}`, {
				preserveScroll: true,
				onError: () => {
					flashError.value = "Failed to delete the order.";
				}
			});
		};
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "page" }, _attrs))} data-v-b903fe90>`);
			_push(ssrRenderComponent(_sfc_main$1, {
				title: "Orders",
				subtitle: "View, update and delete placed orders."
			}, {
				actions: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<button class="ui-btn ui-btn--ghost" data-v-b903fe90${_scopeId}>Refresh</button>`);
						if (unref(can)("pos.view")) _push(ssrRenderComponent(unref(Link), {
							href: "/pos",
							class: "ui-btn ui-btn--primary"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(`+ New Order`);
								else return [createTextVNode("+ New Order")];
							}),
							_: 1
						}, _parent, _scopeId));
						else _push(`<!---->`);
					} else return [createVNode("button", {
						class: "ui-btn ui-btn--ghost",
						onClick: refresh
					}, "Refresh"), unref(can)("pos.view") ? (openBlock(), createBlock(unref(Link), {
						key: 0,
						href: "/pos",
						class: "ui-btn ui-btn--primary"
					}, {
						default: withCtx(() => [createTextVNode("+ New Order")]),
						_: 1
					})) : createCommentVNode("", true)];
				}),
				_: 1
			}, _parent));
			if (flashError.value) _push(`<div class="ui-alert ui-alert--danger" data-v-b903fe90>${ssrInterpolate(flashError.value)}</div>`);
			else _push(`<!---->`);
			_push(`<div class="stat-grid" data-v-b903fe90>`);
			_push(ssrRenderComponent(StatCard_default, {
				label: "Total Orders",
				value: stats.value.total
			}, null, _parent));
			_push(ssrRenderComponent(StatCard_default, {
				label: "Paid",
				value: stats.value.paid
			}, null, _parent));
			_push(ssrRenderComponent(StatCard_default, {
				label: "Unpaid",
				value: stats.value.total - stats.value.paid
			}, null, _parent));
			_push(ssrRenderComponent(StatCard_default, {
				label: "Revenue",
				value: money(stats.value.revenue)
			}, null, _parent));
			_push(`</div>`);
			_push(ssrRenderComponent(DataTable_default, {
				columns,
				rows: orders.value,
				index: "",
				searchable: "",
				query: search.value,
				"onUpdate:query": ($event) => search.value = $event,
				"search-placeholder": "Search orders…",
				"empty-text": "No orders found."
			}, {
				"cell:customer_name": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) _push(`${ssrInterpolate(row.customer?.name || "Guest")}`);
					else return [createTextVNode(toDisplayString(row.customer?.name || "Guest"), 1)];
				}),
				"cell:type": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) _push(`${ssrInterpolate(typeLabel(value))}`);
					else return [createTextVNode(toDisplayString(typeLabel(value)), 1)];
				}),
				"cell:status": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) _push(`<span class="${ssrRenderClass([statusClass(value), "ui-badge"])}" data-v-b903fe90${_scopeId}>${ssrInterpolate(value || "—")}</span>`);
					else return [createVNode("span", { class: ["ui-badge", statusClass(value)] }, toDisplayString(value || "—"), 3)];
				}),
				"cell:paid": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) _push(`<span class="${ssrRenderClass([value ? "ui-badge--success" : "ui-badge--muted", "ui-badge"])}" data-v-b903fe90${_scopeId}>${ssrInterpolate(value ? "Paid" : "Unpaid")}</span>`);
					else return [createVNode("span", { class: ["ui-badge", value ? "ui-badge--success" : "ui-badge--muted"] }, toDisplayString(value ? "Paid" : "Unpaid"), 3)];
				}),
				"cell:order_datetime": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) _push(`${ssrInterpolate(dateTime(value))}`);
					else return [createTextVNode(toDisplayString(dateTime(value)), 1)];
				}),
				"cell:grand_total": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) _push(`${ssrInterpolate(money(value))}`);
					else return [createTextVNode(toDisplayString(money(value)), 1)];
				}),
				actions: withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<button class="ui-btn ui-btn--ghost ui-btn--sm" data-v-b903fe90${_scopeId}>View</button>`);
						if (unref(can)("orders.update")) _push(`<button class="ui-btn ui-btn--ghost ui-btn--sm" data-v-b903fe90${_scopeId}>Edit</button>`);
						else _push(`<!---->`);
						if (unref(can)("orders.delete")) _push(`<button class="ui-btn ui-btn--danger ui-btn--sm" data-v-b903fe90${_scopeId}>Delete</button>`);
						else _push(`<!---->`);
					} else return [
						createVNode("button", {
							class: "ui-btn ui-btn--ghost ui-btn--sm",
							onClick: ($event) => viewOrder(row)
						}, "View", 8, ["onClick"]),
						unref(can)("orders.update") ? (openBlock(), createBlock("button", {
							key: 0,
							class: "ui-btn ui-btn--ghost ui-btn--sm",
							onClick: ($event) => editOrder(row)
						}, "Edit", 8, ["onClick"])) : createCommentVNode("", true),
						unref(can)("orders.delete") ? (openBlock(), createBlock("button", {
							key: 1,
							class: "ui-btn ui-btn--danger ui-btn--sm",
							onClick: ($event) => deleteOrder(row.id)
						}, "Delete", 8, ["onClick"])) : createCommentVNode("", true)
					];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(Pagination_default, {
				paginator: props.orders,
				only: ["orders", "stats"]
			}, null, _parent));
			_push(ssrRenderComponent(Modal_default, {
				modelValue: showView.value,
				"onUpdate:modelValue": ($event) => showView.value = $event,
				title: `Order #${viewing.value?.id ?? ""}`,
				width: "620px"
			}, {
				footer: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<button class="ui-btn ui-btn--ghost" data-v-b903fe90${_scopeId}>Close</button>`);
						if (unref(can)("orders.update")) _push(`<button class="ui-btn ui-btn--primary" data-v-b903fe90${_scopeId}>Edit</button>`);
						else _push(`<!---->`);
					} else return [createVNode("button", {
						class: "ui-btn ui-btn--ghost",
						onClick: ($event) => showView.value = false
					}, "Close", 8, ["onClick"]), unref(can)("orders.update") ? (openBlock(), createBlock("button", {
						key: 0,
						class: "ui-btn ui-btn--primary",
						onClick: ($event) => editOrder(viewing.value)
					}, "Edit", 8, ["onClick"])) : createCommentVNode("", true)];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						if (viewing.value) {
							_push(`<div data-v-b903fe90${_scopeId}><div class="ord-meta" data-v-b903fe90${_scopeId}><div data-v-b903fe90${_scopeId}><span data-v-b903fe90${_scopeId}>Customer</span><strong data-v-b903fe90${_scopeId}>${ssrInterpolate(viewing.value.customer?.name || "Guest")}</strong></div><div data-v-b903fe90${_scopeId}><span data-v-b903fe90${_scopeId}>Type</span><strong data-v-b903fe90${_scopeId}>${ssrInterpolate(typeLabel(viewing.value.type))}</strong></div><div data-v-b903fe90${_scopeId}><span data-v-b903fe90${_scopeId}>Status</span><strong data-v-b903fe90${_scopeId}>${ssrInterpolate(viewing.value.status || "—")}</strong></div><div data-v-b903fe90${_scopeId}><span data-v-b903fe90${_scopeId}>Paid</span><strong data-v-b903fe90${_scopeId}>${ssrInterpolate(viewing.value.paid ? "Yes" : "No")}</strong></div><div data-v-b903fe90${_scopeId}><span data-v-b903fe90${_scopeId}>Place</span><strong data-v-b903fe90${_scopeId}>${ssrInterpolate(placeName(viewing.value.place_id))}</strong></div><div data-v-b903fe90${_scopeId}><span data-v-b903fe90${_scopeId}>Placed</span><strong data-v-b903fe90${_scopeId}>${ssrInterpolate(dateTime(viewing.value.order_datetime))}</strong></div></div><table class="data-table ord-items" data-v-b903fe90${_scopeId}><thead data-v-b903fe90${_scopeId}><tr data-v-b903fe90${_scopeId}><th data-v-b903fe90${_scopeId}>Item</th><th style="${ssrRenderStyle({ "text-align": "center" })}" data-v-b903fe90${_scopeId}>Qty</th><th style="${ssrRenderStyle({ "text-align": "right" })}" data-v-b903fe90${_scopeId}>Subtotal</th></tr></thead><tbody data-v-b903fe90${_scopeId}>`);
							if (!(viewing.value.order_items || []).length) _push(`<tr data-v-b903fe90${_scopeId}><td colspan="3" class="data-table__empty" data-v-b903fe90${_scopeId}>No items on this order.</td></tr>`);
							else _push(`<!---->`);
							_push(`<!--[-->`);
							ssrRenderList(viewing.value.order_items || [], (it) => {
								_push(`<tr data-v-b903fe90${_scopeId}><td data-v-b903fe90${_scopeId}>${ssrInterpolate(itemName(it.fooditems_id))} `);
								if (it.add_note) _push(`<small class="ord-note" data-v-b903fe90${_scopeId}>${ssrInterpolate(it.add_note)}</small>`);
								else _push(`<!---->`);
								_push(`</td><td style="${ssrRenderStyle({ "text-align": "center" })}" data-v-b903fe90${_scopeId}>${ssrInterpolate(it.quantity)}</td><td style="${ssrRenderStyle({ "text-align": "right" })}" data-v-b903fe90${_scopeId}>${ssrInterpolate(money(it.sub_total))}</td></tr>`);
							});
							_push(`<!--]--></tbody></table><div class="ord-totals" data-v-b903fe90${_scopeId}><div data-v-b903fe90${_scopeId}><span data-v-b903fe90${_scopeId}>Subtotal</span><span data-v-b903fe90${_scopeId}>${ssrInterpolate(money(viewing.value.subtotal))}</span></div><div data-v-b903fe90${_scopeId}><span data-v-b903fe90${_scopeId}>Discount (${ssrInterpolate(viewing.value.discount_type)})</span><span data-v-b903fe90${_scopeId}>− ${ssrInterpolate(money(viewing.value.discount_amount))}</span></div>`);
							if (num(viewing.value.promo_discount) > 0) _push(`<div data-v-b903fe90${_scopeId}><span data-v-b903fe90${_scopeId}>Promo · ${ssrInterpolate(viewing.value.promo_code?.code ?? "code")}</span><span data-v-b903fe90${_scopeId}>− ${ssrInterpolate(money(viewing.value.promo_discount))}</span></div>`);
							else _push(`<!---->`);
							if (num(viewing.value.loyalty_discount) > 0) _push(`<div data-v-b903fe90${_scopeId}><span data-v-b903fe90${_scopeId}>Points redeemed · ${ssrInterpolate(viewing.value.loyalty_points_redeemed)}</span><span data-v-b903fe90${_scopeId}>− ${ssrInterpolate(money(viewing.value.loyalty_discount))}</span></div>`);
							else _push(`<!---->`);
							_push(`<div data-v-b903fe90${_scopeId}><span data-v-b903fe90${_scopeId}>Service charge (${ssrInterpolate(viewing.value.service_charges_percentage)}%)</span><span data-v-b903fe90${_scopeId}>+ ${ssrInterpolate(money(viewing.value.service_charges))}</span></div><div class="ord-totals__grand" data-v-b903fe90${_scopeId}><span data-v-b903fe90${_scopeId}>Grand Total</span><span data-v-b903fe90${_scopeId}>${ssrInterpolate(money(viewing.value.grand_total))}</span></div>`);
							if (num(viewing.value.loyalty_points_earned) > 0) _push(`<p class="ord-totals__note ord-totals__note--ok" data-v-b903fe90${_scopeId}> Earned ${ssrInterpolate(viewing.value.loyalty_points_earned)} loyalty point(s). </p>`);
							else _push(`<!---->`);
							_push(`</div></div>`);
						} else _push(`<!---->`);
					} else return [viewing.value ? (openBlock(), createBlock("div", { key: 0 }, [
						createVNode("div", { class: "ord-meta" }, [
							createVNode("div", null, [createVNode("span", null, "Customer"), createVNode("strong", null, toDisplayString(viewing.value.customer?.name || "Guest"), 1)]),
							createVNode("div", null, [createVNode("span", null, "Type"), createVNode("strong", null, toDisplayString(typeLabel(viewing.value.type)), 1)]),
							createVNode("div", null, [createVNode("span", null, "Status"), createVNode("strong", null, toDisplayString(viewing.value.status || "—"), 1)]),
							createVNode("div", null, [createVNode("span", null, "Paid"), createVNode("strong", null, toDisplayString(viewing.value.paid ? "Yes" : "No"), 1)]),
							createVNode("div", null, [createVNode("span", null, "Place"), createVNode("strong", null, toDisplayString(placeName(viewing.value.place_id)), 1)]),
							createVNode("div", null, [createVNode("span", null, "Placed"), createVNode("strong", null, toDisplayString(dateTime(viewing.value.order_datetime)), 1)])
						]),
						createVNode("table", { class: "data-table ord-items" }, [createVNode("thead", null, [createVNode("tr", null, [
							createVNode("th", null, "Item"),
							createVNode("th", { style: { "text-align": "center" } }, "Qty"),
							createVNode("th", { style: { "text-align": "right" } }, "Subtotal")
						])]), createVNode("tbody", null, [!(viewing.value.order_items || []).length ? (openBlock(), createBlock("tr", { key: 0 }, [createVNode("td", {
							colspan: "3",
							class: "data-table__empty"
						}, "No items on this order.")])) : createCommentVNode("", true), (openBlock(true), createBlock(Fragment, null, renderList(viewing.value.order_items || [], (it) => {
							return openBlock(), createBlock("tr", { key: it.id }, [
								createVNode("td", null, [createTextVNode(toDisplayString(itemName(it.fooditems_id)) + " ", 1), it.add_note ? (openBlock(), createBlock("small", {
									key: 0,
									class: "ord-note"
								}, toDisplayString(it.add_note), 1)) : createCommentVNode("", true)]),
								createVNode("td", { style: { "text-align": "center" } }, toDisplayString(it.quantity), 1),
								createVNode("td", { style: { "text-align": "right" } }, toDisplayString(money(it.sub_total)), 1)
							]);
						}), 128))])]),
						createVNode("div", { class: "ord-totals" }, [
							createVNode("div", null, [createVNode("span", null, "Subtotal"), createVNode("span", null, toDisplayString(money(viewing.value.subtotal)), 1)]),
							createVNode("div", null, [createVNode("span", null, "Discount (" + toDisplayString(viewing.value.discount_type) + ")", 1), createVNode("span", null, "− " + toDisplayString(money(viewing.value.discount_amount)), 1)]),
							num(viewing.value.promo_discount) > 0 ? (openBlock(), createBlock("div", { key: 0 }, [createVNode("span", null, "Promo · " + toDisplayString(viewing.value.promo_code?.code ?? "code"), 1), createVNode("span", null, "− " + toDisplayString(money(viewing.value.promo_discount)), 1)])) : createCommentVNode("", true),
							num(viewing.value.loyalty_discount) > 0 ? (openBlock(), createBlock("div", { key: 1 }, [createVNode("span", null, "Points redeemed · " + toDisplayString(viewing.value.loyalty_points_redeemed), 1), createVNode("span", null, "− " + toDisplayString(money(viewing.value.loyalty_discount)), 1)])) : createCommentVNode("", true),
							createVNode("div", null, [createVNode("span", null, "Service charge (" + toDisplayString(viewing.value.service_charges_percentage) + "%)", 1), createVNode("span", null, "+ " + toDisplayString(money(viewing.value.service_charges)), 1)]),
							createVNode("div", { class: "ord-totals__grand" }, [createVNode("span", null, "Grand Total"), createVNode("span", null, toDisplayString(money(viewing.value.grand_total)), 1)]),
							num(viewing.value.loyalty_points_earned) > 0 ? (openBlock(), createBlock("p", {
								key: 2,
								class: "ord-totals__note ord-totals__note--ok"
							}, " Earned " + toDisplayString(viewing.value.loyalty_points_earned) + " loyalty point(s). ", 1)) : createCommentVNode("", true)
						])
					])) : createCommentVNode("", true)];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(Modal_default, {
				modelValue: showEdit.value,
				"onUpdate:modelValue": ($event) => showEdit.value = $event,
				title: `Edit Order #${form.value.id ?? ""}`,
				width: "620px"
			}, {
				footer: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<button class="ui-btn ui-btn--ghost" data-v-b903fe90${_scopeId}>Cancel</button><button class="ui-btn ui-btn--primary"${ssrIncludeBooleanAttr(saving.value) ? " disabled" : ""} data-v-b903fe90${_scopeId}>${ssrInterpolate(saving.value ? "Saving…" : "Save Changes")}</button>`);
					else return [createVNode("button", {
						class: "ui-btn ui-btn--ghost",
						onClick: ($event) => showEdit.value = false
					}, "Cancel", 8, ["onClick"]), createVNode("button", {
						class: "ui-btn ui-btn--primary",
						disabled: saving.value,
						onClick: saveOrder
					}, toDisplayString(saving.value ? "Saving…" : "Save Changes"), 9, ["disabled"])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						if (saveError.value) _push(`<div class="ui-alert ui-alert--danger" data-v-b903fe90${_scopeId}>${ssrInterpolate(saveError.value)}</div>`);
						else _push(`<!---->`);
						_push(`<div class="ord-fields" data-v-b903fe90${_scopeId}>`);
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: form.value.type,
							"onUpdate:modelValue": ($event) => form.value.type = $event,
							label: "Order Type",
							type: "select"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(`<option value="dining" data-v-b903fe90${_scopeId}>Dining</option><option value="delivery" data-v-b903fe90${_scopeId}>Delivery</option><option value="on-way" data-v-b903fe90${_scopeId}>On the way</option>`);
								else return [
									createVNode("option", { value: "dining" }, "Dining"),
									createVNode("option", { value: "delivery" }, "Delivery"),
									createVNode("option", { value: "on-way" }, "On the way")
								];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: form.value.status,
							"onUpdate:modelValue": ($event) => form.value.status = $event,
							label: "Status",
							type: "select"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(`<option value="pending" data-v-b903fe90${_scopeId}>Pending</option><option value="preparing" data-v-b903fe90${_scopeId}>Preparing</option><option value="on-way" data-v-b903fe90${_scopeId}>On the way</option><option value="completed" data-v-b903fe90${_scopeId}>Completed</option>`);
								else return [
									createVNode("option", { value: "pending" }, "Pending"),
									createVNode("option", { value: "preparing" }, "Preparing"),
									createVNode("option", { value: "on-way" }, "On the way"),
									createVNode("option", { value: "completed" }, "Completed")
								];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: form.value.place_id,
							"onUpdate:modelValue": ($event) => form.value.place_id = $event,
							label: "Place",
							type: "select"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) {
									_push(`<option value="" data-v-b903fe90${_scopeId}>— Select place —</option><!--[-->`);
									ssrRenderList(places.value, (p) => {
										_push(`<option${ssrRenderAttr("value", p.id)} data-v-b903fe90${_scopeId}>${ssrInterpolate(p.name)}</option>`);
									});
									_push(`<!--]-->`);
								} else return [createVNode("option", { value: "" }, "— Select place —"), (openBlock(true), createBlock(Fragment, null, renderList(places.value, (p) => {
									return openBlock(), createBlock("option", {
										key: p.id,
										value: p.id
									}, toDisplayString(p.name), 9, ["value"]);
								}), 128))];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(CustomerPicker_default, {
							modelValue: form.value.customer_id,
							"onUpdate:modelValue": ($event) => form.value.customer_id = $event,
							label: customerRequired.value ? "Customer (required)" : "Customer (optional)",
							"initial-name": editingCustomerName.value,
							placeholder: "Search customer by name or phone…"
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: form.value.discount_type,
							"onUpdate:modelValue": ($event) => form.value.discount_type = $event,
							label: "Discount Type",
							type: "select"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(`<option value="amount" data-v-b903fe90${_scopeId}>Amount</option><option value="percentage" data-v-b903fe90${_scopeId}>Percentage</option>`);
								else return [createVNode("option", { value: "amount" }, "Amount"), createVNode("option", { value: "percentage" }, "Percentage")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: form.value.discount_amount,
							"onUpdate:modelValue": ($event) => form.value.discount_amount = $event,
							label: form.value.discount_type === "percentage" ? "Discount (%)" : "Discount (amount)",
							type: "number",
							step: "0.01"
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: form.value.service_charges_percentage,
							"onUpdate:modelValue": ($event) => form.value.service_charges_percentage = $event,
							label: "Service Charge (%)",
							type: "number",
							step: "0.01"
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: form.value.paid,
							"onUpdate:modelValue": ($event) => form.value.paid = $event,
							label: "Paid",
							type: "select"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(`<option${ssrRenderAttr("value", true)} data-v-b903fe90${_scopeId}>Yes</option><option${ssrRenderAttr("value", false)} data-v-b903fe90${_scopeId}>No</option>`);
								else return [createVNode("option", { value: true }, "Yes"), createVNode("option", { value: false }, "No")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(`</div><div class="ord-lines" data-v-b903fe90${_scopeId}><div class="ord-lines__title" data-v-b903fe90${_scopeId}>Items</div>`);
						if (!form.value.items.length) _push(`<p class="ord-hint" data-v-b903fe90${_scopeId}> This order has no items. Add at least one before saving. </p>`);
						else _push(`<!---->`);
						_push(`<!--[-->`);
						ssrRenderList(form.value.items, (line) => {
							_push(`<div class="ord-line" data-v-b903fe90${_scopeId}><div class="ord-line__left" data-v-b903fe90${_scopeId}><span class="ord-line__name" data-v-b903fe90${_scopeId}>${ssrInterpolate(line.name)}</span><select class="ui-select ord-line__station" data-v-b903fe90${_scopeId}><option${ssrRenderAttr("value", null)} data-v-b903fe90${ssrIncludeBooleanAttr(Array.isArray(line.kds_station_id) ? ssrLooseContain(line.kds_station_id, null) : ssrLooseEqual(line.kds_station_id, null)) ? " selected" : ""}${_scopeId}>Auto KDS station</option><!--[-->`);
							ssrRenderList(__props.kdsStations, (s) => {
								_push(`<option${ssrRenderAttr("value", s.id)} data-v-b903fe90${ssrIncludeBooleanAttr(Array.isArray(line.kds_station_id) ? ssrLooseContain(line.kds_station_id, s.id) : ssrLooseEqual(line.kds_station_id, s.id)) ? " selected" : ""}${_scopeId}>${ssrInterpolate(s.name)}</option>`);
							});
							_push(`<!--]--></select></div><div class="ord-qty" data-v-b903fe90${_scopeId}><button type="button" aria-label="Decrease quantity" data-v-b903fe90${_scopeId}>−</button><span data-v-b903fe90${_scopeId}>${ssrInterpolate(line.quantity)}</span><button type="button" aria-label="Increase quantity" data-v-b903fe90${_scopeId}>+</button></div><span class="ord-line__sub" data-v-b903fe90${_scopeId}>${ssrInterpolate(money(lineTotal(line)))}</span><button class="ord-line__x" type="button"${ssrRenderAttr("aria-label", `Remove ${line.name}`)} data-v-b903fe90${_scopeId}> × </button></div>`);
						});
						_push(`<!--]--><div class="ord-add" data-v-b903fe90${_scopeId}><select class="ui-select" aria-label="Add item to order" data-v-b903fe90${_scopeId}><option value="" data-v-b903fe90${ssrIncludeBooleanAttr(Array.isArray(addItemId.value) ? ssrLooseContain(addItemId.value, "") : ssrLooseEqual(addItemId.value, "")) ? " selected" : ""}${_scopeId}>+ Add item…</option><!--[-->`);
						ssrRenderList(items.value, (i) => {
							_push(`<option${ssrRenderAttr("value", i.id)} data-v-b903fe90${ssrIncludeBooleanAttr(Array.isArray(addItemId.value) ? ssrLooseContain(addItemId.value, i.id) : ssrLooseEqual(addItemId.value, i.id)) ? " selected" : ""}${_scopeId}>${ssrInterpolate(i.name)} — ${ssrInterpolate(money(i.price))}</option>`);
						});
						_push(`<!--]--></select><button class="ui-btn ui-btn--ghost ui-btn--sm"${ssrIncludeBooleanAttr(!addItemId.value) ? " disabled" : ""} data-v-b903fe90${_scopeId}> Add </button></div></div>`);
						if (form.value.promo_code || num(form.value.redeem_points) > 0) {
							_push(`<div class="ord-crm" data-v-b903fe90${_scopeId}>`);
							if (form.value.promo_code) _push(`<div class="ord-crm__row" data-v-b903fe90${_scopeId}><span data-v-b903fe90${_scopeId}>Promo <strong data-v-b903fe90${_scopeId}>${ssrInterpolate(form.value.promo_code)}</strong> stays applied and is re-priced on save.</span><button class="ui-btn ui-btn--ghost ui-btn--sm" data-v-b903fe90${_scopeId}>Remove</button></div>`);
							else _push(`<!---->`);
							if (num(form.value.redeem_points) > 0) _push(`<div class="ord-crm__row" data-v-b903fe90${_scopeId}><span data-v-b903fe90${_scopeId}><strong data-v-b903fe90${_scopeId}>${ssrInterpolate(form.value.redeem_points)}</strong> point(s) stay redeemed against this order.</span><button class="ui-btn ui-btn--ghost ui-btn--sm" data-v-b903fe90${_scopeId}>Refund</button></div>`);
							else _push(`<!---->`);
							_push(`</div>`);
						} else _push(`<!---->`);
						_push(`<div class="ord-totals" data-v-b903fe90${_scopeId}><div data-v-b903fe90${_scopeId}><span data-v-b903fe90${_scopeId}>Subtotal</span><span data-v-b903fe90${_scopeId}>${ssrInterpolate(money(subtotal.value))}</span></div><div data-v-b903fe90${_scopeId}><span data-v-b903fe90${_scopeId}>Discount</span><span data-v-b903fe90${_scopeId}>− ${ssrInterpolate(money(discountValue.value))}</span></div><div data-v-b903fe90${_scopeId}><span data-v-b903fe90${_scopeId}>Service charge</span><span data-v-b903fe90${_scopeId}>+ ${ssrInterpolate(money(serviceCharges.value))}</span></div><div class="ord-totals__grand" data-v-b903fe90${_scopeId}><span data-v-b903fe90${_scopeId}>Grand Total</span><span data-v-b903fe90${_scopeId}>${ssrInterpolate(money(grandTotal.value))}</span></div>`);
						if (form.value.promo_code || num(form.value.redeem_points) > 0) _push(`<p class="ord-totals__note" data-v-b903fe90${_scopeId}> The promo and points discounts are added by the server, so the saved total lands below this figure. </p>`);
						else _push(`<!---->`);
						_push(`</div>`);
					} else return [
						saveError.value ? (openBlock(), createBlock("div", {
							key: 0,
							class: "ui-alert ui-alert--danger"
						}, toDisplayString(saveError.value), 1)) : createCommentVNode("", true),
						createVNode("div", { class: "ord-fields" }, [
							createVNode(_sfc_main$2, {
								modelValue: form.value.type,
								"onUpdate:modelValue": ($event) => form.value.type = $event,
								label: "Order Type",
								type: "select"
							}, {
								default: withCtx(() => [
									createVNode("option", { value: "dining" }, "Dining"),
									createVNode("option", { value: "delivery" }, "Delivery"),
									createVNode("option", { value: "on-way" }, "On the way")
								]),
								_: 1
							}, 8, ["modelValue", "onUpdate:modelValue"]),
							createVNode(_sfc_main$2, {
								modelValue: form.value.status,
								"onUpdate:modelValue": ($event) => form.value.status = $event,
								label: "Status",
								type: "select"
							}, {
								default: withCtx(() => [
									createVNode("option", { value: "pending" }, "Pending"),
									createVNode("option", { value: "preparing" }, "Preparing"),
									createVNode("option", { value: "on-way" }, "On the way"),
									createVNode("option", { value: "completed" }, "Completed")
								]),
								_: 1
							}, 8, ["modelValue", "onUpdate:modelValue"]),
							createVNode(_sfc_main$2, {
								modelValue: form.value.place_id,
								"onUpdate:modelValue": ($event) => form.value.place_id = $event,
								label: "Place",
								type: "select"
							}, {
								default: withCtx(() => [createVNode("option", { value: "" }, "— Select place —"), (openBlock(true), createBlock(Fragment, null, renderList(places.value, (p) => {
									return openBlock(), createBlock("option", {
										key: p.id,
										value: p.id
									}, toDisplayString(p.name), 9, ["value"]);
								}), 128))]),
								_: 1
							}, 8, ["modelValue", "onUpdate:modelValue"]),
							createVNode(CustomerPicker_default, {
								modelValue: form.value.customer_id,
								"onUpdate:modelValue": ($event) => form.value.customer_id = $event,
								label: customerRequired.value ? "Customer (required)" : "Customer (optional)",
								"initial-name": editingCustomerName.value,
								placeholder: "Search customer by name or phone…"
							}, null, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"label",
								"initial-name"
							]),
							createVNode(_sfc_main$2, {
								modelValue: form.value.discount_type,
								"onUpdate:modelValue": ($event) => form.value.discount_type = $event,
								label: "Discount Type",
								type: "select"
							}, {
								default: withCtx(() => [createVNode("option", { value: "amount" }, "Amount"), createVNode("option", { value: "percentage" }, "Percentage")]),
								_: 1
							}, 8, ["modelValue", "onUpdate:modelValue"]),
							createVNode(_sfc_main$2, {
								modelValue: form.value.discount_amount,
								"onUpdate:modelValue": ($event) => form.value.discount_amount = $event,
								label: form.value.discount_type === "percentage" ? "Discount (%)" : "Discount (amount)",
								type: "number",
								step: "0.01"
							}, null, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"label"
							]),
							createVNode(_sfc_main$2, {
								modelValue: form.value.service_charges_percentage,
								"onUpdate:modelValue": ($event) => form.value.service_charges_percentage = $event,
								label: "Service Charge (%)",
								type: "number",
								step: "0.01"
							}, null, 8, ["modelValue", "onUpdate:modelValue"]),
							createVNode(_sfc_main$2, {
								modelValue: form.value.paid,
								"onUpdate:modelValue": ($event) => form.value.paid = $event,
								label: "Paid",
								type: "select"
							}, {
								default: withCtx(() => [createVNode("option", { value: true }, "Yes"), createVNode("option", { value: false }, "No")]),
								_: 1
							}, 8, ["modelValue", "onUpdate:modelValue"])
						]),
						createVNode("div", { class: "ord-lines" }, [
							createVNode("div", { class: "ord-lines__title" }, "Items"),
							!form.value.items.length ? (openBlock(), createBlock("p", {
								key: 0,
								class: "ord-hint"
							}, " This order has no items. Add at least one before saving. ")) : createCommentVNode("", true),
							(openBlock(true), createBlock(Fragment, null, renderList(form.value.items, (line) => {
								return openBlock(), createBlock("div", {
									key: line.fooditems_id,
									class: "ord-line"
								}, [
									createVNode("div", { class: "ord-line__left" }, [createVNode("span", { class: "ord-line__name" }, toDisplayString(line.name), 1), withDirectives(createVNode("select", {
										"onUpdate:modelValue": ($event) => line.kds_station_id = $event,
										class: "ui-select ord-line__station"
									}, [createVNode("option", { value: null }, "Auto KDS station"), (openBlock(true), createBlock(Fragment, null, renderList(__props.kdsStations, (s) => {
										return openBlock(), createBlock("option", {
											key: s.id,
											value: s.id
										}, toDisplayString(s.name), 9, ["value"]);
									}), 128))], 8, ["onUpdate:modelValue"]), [[vModelSelect, line.kds_station_id]])]),
									createVNode("div", { class: "ord-qty" }, [
										createVNode("button", {
											type: "button",
											"aria-label": "Decrease quantity",
											onClick: ($event) => bump(line, -1)
										}, "−", 8, ["onClick"]),
										createVNode("span", null, toDisplayString(line.quantity), 1),
										createVNode("button", {
											type: "button",
											"aria-label": "Increase quantity",
											onClick: ($event) => bump(line, 1)
										}, "+", 8, ["onClick"])
									]),
									createVNode("span", { class: "ord-line__sub" }, toDisplayString(money(lineTotal(line))), 1),
									createVNode("button", {
										class: "ord-line__x",
										type: "button",
										"aria-label": `Remove ${line.name}`,
										onClick: ($event) => removeLine(line.fooditems_id)
									}, " × ", 8, ["aria-label", "onClick"])
								]);
							}), 128)),
							createVNode("div", { class: "ord-add" }, [withDirectives(createVNode("select", {
								"onUpdate:modelValue": ($event) => addItemId.value = $event,
								class: "ui-select",
								"aria-label": "Add item to order"
							}, [createVNode("option", { value: "" }, "+ Add item…"), (openBlock(true), createBlock(Fragment, null, renderList(items.value, (i) => {
								return openBlock(), createBlock("option", {
									key: i.id,
									value: i.id
								}, toDisplayString(i.name) + " — " + toDisplayString(money(i.price)), 9, ["value"]);
							}), 128))], 8, ["onUpdate:modelValue"]), [[vModelSelect, addItemId.value]]), createVNode("button", {
								class: "ui-btn ui-btn--ghost ui-btn--sm",
								disabled: !addItemId.value,
								onClick: addLine
							}, " Add ", 8, ["disabled"])])
						]),
						form.value.promo_code || num(form.value.redeem_points) > 0 ? (openBlock(), createBlock("div", {
							key: 1,
							class: "ord-crm"
						}, [form.value.promo_code ? (openBlock(), createBlock("div", {
							key: 0,
							class: "ord-crm__row"
						}, [createVNode("span", null, [
							createTextVNode("Promo "),
							createVNode("strong", null, toDisplayString(form.value.promo_code), 1),
							createTextVNode(" stays applied and is re-priced on save.")
						]), createVNode("button", {
							class: "ui-btn ui-btn--ghost ui-btn--sm",
							onClick: ($event) => form.value.promo_code = ""
						}, "Remove", 8, ["onClick"])])) : createCommentVNode("", true), num(form.value.redeem_points) > 0 ? (openBlock(), createBlock("div", {
							key: 1,
							class: "ord-crm__row"
						}, [createVNode("span", null, [createVNode("strong", null, toDisplayString(form.value.redeem_points), 1), createTextVNode(" point(s) stay redeemed against this order.")]), createVNode("button", {
							class: "ui-btn ui-btn--ghost ui-btn--sm",
							onClick: ($event) => form.value.redeem_points = 0
						}, "Refund", 8, ["onClick"])])) : createCommentVNode("", true)])) : createCommentVNode("", true),
						createVNode("div", { class: "ord-totals" }, [
							createVNode("div", null, [createVNode("span", null, "Subtotal"), createVNode("span", null, toDisplayString(money(subtotal.value)), 1)]),
							createVNode("div", null, [createVNode("span", null, "Discount"), createVNode("span", null, "− " + toDisplayString(money(discountValue.value)), 1)]),
							createVNode("div", null, [createVNode("span", null, "Service charge"), createVNode("span", null, "+ " + toDisplayString(money(serviceCharges.value)), 1)]),
							createVNode("div", { class: "ord-totals__grand" }, [createVNode("span", null, "Grand Total"), createVNode("span", null, toDisplayString(money(grandTotal.value)), 1)]),
							form.value.promo_code || num(form.value.redeem_points) > 0 ? (openBlock(), createBlock("p", {
								key: 0,
								class: "ord-totals__note"
							}, " The promo and points discounts are added by the server, so the saved total lands below this figure. ")) : createCommentVNode("", true)
						])
					];
				}),
				_: 1
			}, _parent));
			_push(`</div>`);
		};
	}
});
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/pages/Orders.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var Orders_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-b903fe90"]]);
//#endregion
export { Orders_default as default };
