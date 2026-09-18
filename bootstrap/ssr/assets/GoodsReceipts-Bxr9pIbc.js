import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-BOaGB7Aw.js";
import { n as confirmDialog } from "./useNotifications-CvzCW6Mx.js";
import { n as usePermissions, t as AdminLayout_default } from "./AdminLayout-BhC2A239.js";
import { t as _sfc_main$1 } from "./PageHeader-D0aRDn5C.js";
import { t as DataTable_default } from "./DataTable-DQdMyI8_.js";
import { t as Pagination_default } from "./Pagination-CHJUzz_w.js";
import { t as Modal_default } from "./Modal-CpmFAnsY.js";
import { t as _sfc_main$2 } from "./FormField-Doe8oR1s.js";
import { Fragment, computed, createBlock, createCommentVNode, createTextVNode, createVNode, mergeProps, onMounted, openBlock, ref, renderList, toDisplayString, unref, useSSRContext, vModelSelect, vModelText, watch, withCtx, withDirectives } from "vue";
import { Link, router, useForm } from "@inertiajs/vue3";
import { ssrIncludeBooleanAttr, ssrInterpolate, ssrLooseContain, ssrLooseEqual, ssrRenderAttr, ssrRenderAttrs, ssrRenderClass, ssrRenderComponent, ssrRenderList, ssrRenderStyle } from "vue/server-renderer";
//#region resources/js/pages/Procurement/GoodsReceipts.vue
var _sfc_main = /*@__PURE__*/ Object.assign({ layout: AdminLayout_default }, {
	__name: "GoodsReceipts",
	__ssrInlineRender: true,
	props: {
		receipts: {
			type: Object,
			default: () => ({ data: [] })
		},
		openOrders: {
			type: Array,
			default: () => []
		},
		vendors: {
			type: Array,
			default: () => []
		},
		ingredients: {
			type: Array,
			default: () => []
		},
		summary: {
			type: Object,
			default: () => ({
				this_month: 0,
				spend_this_month: 0,
				awaiting_delivery: 0,
				ad_hoc_this_month: 0
			})
		},
		filters: {
			type: Object,
			default: () => ({})
		}
	},
	setup(__props) {
		const { can } = usePermissions();
		const props = __props;
		const columns = [
			{
				key: "grn_number",
				label: "GRN"
			},
			{
				key: "vendor_name",
				label: "Vendor"
			},
			{
				key: "po_number",
				label: "Order"
			},
			{
				key: "invoice_number",
				label: "Invoice"
			},
			{
				key: "received_at",
				label: "Received"
			},
			{
				key: "total",
				label: "Total"
			}
		];
		const receipts = computed(() => props.receipts?.data ?? []);
		const search = ref(props.filters?.search ?? "");
		const vendorFilter = ref(props.filters?.vendor_id ?? "");
		let timer = null;
		const reload = () => router.get("/procurement/goods-receipts", {
			search: search.value || void 0,
			vendor_id: vendorFilter.value || void 0
		}, {
			preserveState: true,
			preserveScroll: true,
			replace: true,
			only: [
				"receipts",
				"summary",
				"openOrders",
				"filters"
			]
		});
		watch([search, vendorFilter], () => {
			clearTimeout(timer);
			timer = setTimeout(reload, 300);
		});
		const showBook = ref(false);
		const form = useForm({
			purchase_order_id: "",
			vendor_id: "",
			invoice_number: "",
			received_at: todayLocal(),
			notes: "",
			lines: []
		});
		const openBook = (order = null) => {
			form.reset();
			form.clearErrors();
			form.received_at = todayLocal();
			if (order) {
				form.purchase_order_id = order.id;
				fillFromOrder(order);
			} else form.lines = [blankLine()];
			showBook.value = true;
		};
		const blankLine = () => ({
			ingredient_id: "",
			purchase_order_item_id: null,
			quantity: null,
			unit_cost: null
		});
		const fillFromOrder = (order) => {
			form.vendor_id = order.vendor_id;
			form.lines = order.lines.map((l) => ({
				ingredient_id: l.ingredient_id,
				purchase_order_item_id: l.purchase_order_item_id,
				quantity: l.quantity,
				unit_cost: l.unit_cost,
				ordered_qty: l.quantity
			}));
		};
		watch(() => form.purchase_order_id, (id) => {
			if (!showBook.value) return;
			const order = props.openOrders.find((o) => String(o.id) === String(id));
			if (order) fillFromOrder(order);
			else if (id === "" || id === null) form.lines = form.lines.filter((l) => !l.purchase_order_item_id);
		});
		const addLine = () => form.lines.push(blankLine());
		const removeLine = (i) => form.lines.splice(i, 1);
		const validLines = computed(() => form.lines.filter((l) => l.ingredient_id && Number(l.quantity) > 0));
		const save = async () => {
			const lines = validLines.value.map((l) => ({
				ingredient_id: l.ingredient_id,
				purchase_order_item_id: l.purchase_order_item_id ?? null,
				quantity: l.quantity,
				unit_cost: Number(l.unit_cost || 0)
			}));
			if (!await confirmDialog("Post this receipt? Stock will be raised and the affected ingredients re-valued. Receipts cannot be edited afterwards.")) return;
			form.transform(() => ({
				purchase_order_id: form.purchase_order_id || null,
				vendor_id: form.vendor_id,
				invoice_number: form.invoice_number || null,
				received_at: form.received_at,
				notes: form.notes || null,
				lines
			})).post("/procurement/goods-receipts", {
				preserveScroll: true,
				onSuccess: () => showBook.value = false
			});
		};
		const showFull = ref(false);
		const fullOrder = ref(null);
		const fullForm = useForm({
			received_at: todayLocal(),
			invoice_number: ""
		});
		const saveFull = async () => {
			if (!await confirmDialog(`Book every outstanding line on ${fullOrder.value.po_number} at the ordered prices?`)) return;
			fullForm.post(`/procurement/goods-receipts/receive-po/${fullOrder.value.id}`, {
				preserveScroll: true,
				onSuccess: () => showFull.value = false
			});
		};
		const showView = ref(false);
		const viewing = ref(null);
		const openView = (row) => {
			viewing.value = row;
			showView.value = true;
		};
		onMounted(() => {
			const id = new URLSearchParams(window.location.search).get("po");
			if (!id) return;
			const order = props.openOrders.find((o) => String(o.id) === String(id));
			if (order) openBook(order);
		});
		const ingredientMap = computed(() => {
			const map = {};
			props.ingredients.forEach((i) => {
				map[i.id] = i;
			});
			return map;
		});
		const unitOf = (id) => ingredientMap.value[id]?.unit ?? "";
		const lineTotal = (line) => Math.round(Number(line.quantity || 0) * Number(line.unit_cost || 0) * 100) / 100;
		const deliveryTotal = computed(() => Math.round(form.lines.reduce((sum, l) => sum + lineTotal(l), 0) * 100) / 100);
		const outstandingValue = (order) => Math.round(order.lines.reduce((sum, l) => sum + l.quantity * l.unit_cost, 0) * 100) / 100;
		const shortfall = (line) => line.ordered_qty === void 0 ? 0 : Math.round((Number(line.ordered_qty) - Number(line.quantity || 0)) * 1e4) / 1e4;
		const isShort = (line) => shortfall(line) > 0;
		const isOver = (line) => shortfall(line) < 0;
		const isDuplicate = (line, index) => !!line.ingredient_id && form.lines.some((other, i) => i < index && other.ingredient_id === line.ingredient_id);
		const hasDuplicates = computed(() => form.lines.some((l, i) => isDuplicate(l, i)));
		function todayLocal() {
			const d = /* @__PURE__ */ new Date();
			const pad = (n) => String(n).padStart(2, "0");
			return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
		}
		const fmt = (v) => "Rs " + Number(v || 0).toLocaleString("en-PK", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		});
		const qty = (v) => Number(v || 0).toLocaleString("en-PK", { maximumFractionDigits: 4 });
		const fmtDate = (v) => v ? (/* @__PURE__ */ new Date(v + "T00:00:00")).toLocaleDateString("en-PK", {
			day: "2-digit",
			month: "short",
			year: "numeric"
		}) : "—";
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "page" }, _attrs))} data-v-124657af>`);
			_push(ssrRenderComponent(_sfc_main$1, {
				title: "Goods Receipts",
				subtitle: "Booking a delivery is the only action that raises stock and re-values an ingredient — every dish's food cost moves off the back of this screen. That is why receipts are never edited or deleted; corrections go through a stock take or a write-off."
			}, {
				actions: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(ssrRenderComponent(unref(Link), {
							href: "/procurement/purchase-orders",
							class: "ui-btn ui-btn--secondary"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(`Purchase Orders`);
								else return [createTextVNode("Purchase Orders")];
							}),
							_: 1
						}, _parent, _scopeId));
						if (unref(can)("procurement.goods-receipts.create")) _push(`<button class="ui-btn ui-btn--primary" data-v-124657af${_scopeId}> + Book Delivery </button>`);
						else _push(`<!---->`);
					} else return [createVNode(unref(Link), {
						href: "/procurement/purchase-orders",
						class: "ui-btn ui-btn--secondary"
					}, {
						default: withCtx(() => [createTextVNode("Purchase Orders")]),
						_: 1
					}), unref(can)("procurement.goods-receipts.create") ? (openBlock(), createBlock("button", {
						key: 0,
						class: "ui-btn ui-btn--primary",
						onClick: ($event) => openBook()
					}, " + Book Delivery ", 8, ["onClick"])) : createCommentVNode("", true)];
				}),
				_: 1
			}, _parent));
			_push(`<div class="gr__kpis" data-v-124657af><div class="gr__kpi gr__kpi--ok" data-v-124657af><span class="gr__kpi-label" data-v-124657af>Received This Month</span><span class="gr__kpi-val" data-v-124657af>${ssrInterpolate(fmt(props.summary.spend_this_month))}</span><span class="gr__kpi-sub" data-v-124657af>${ssrInterpolate(props.summary.this_month)} delivery(s)</span></div><div class="gr__kpi gr__kpi--info" data-v-124657af><span class="gr__kpi-label" data-v-124657af>Awaiting Delivery</span><span class="gr__kpi-val" data-v-124657af>${ssrInterpolate(props.summary.awaiting_delivery)}</span><span class="gr__kpi-sub" data-v-124657af>purchase orders still open</span></div><div class="${ssrRenderClass([props.summary.ad_hoc_this_month > 0 ? "gr__kpi--warn" : "gr__kpi--muted", "gr__kpi"])}" data-v-124657af><span class="gr__kpi-label" data-v-124657af>Ad Hoc This Month</span><span class="gr__kpi-val" data-v-124657af>${ssrInterpolate(props.summary.ad_hoc_this_month)}</span><span class="gr__kpi-sub" data-v-124657af>booked with no purchase order</span></div></div>`);
			if (props.openOrders.length) {
				_push(`<section class="gr__open" data-v-124657af><h3 class="gr__open-title" data-v-124657af>Expected Deliveries</h3><div class="gr__open-grid" data-v-124657af><!--[-->`);
				ssrRenderList(props.openOrders, (order) => {
					_push(`<article class="${ssrRenderClass([{ "gr__card--late": order.is_overdue }, "gr__card"])}" data-v-124657af><header class="gr__card-head" data-v-124657af><strong data-v-124657af>${ssrInterpolate(order.po_number)}</strong>`);
					if (order.is_overdue) _push(`<span class="ui-badge ui-badge--danger" data-v-124657af>Overdue</span>`);
					else _push(`<span class="ui-badge ui-badge--info" data-v-124657af>Expected ${ssrInterpolate(fmtDate(order.expected_at))}</span>`);
					_push(`</header><p class="gr__card-vendor" data-v-124657af>${ssrInterpolate(order.vendor_name)}</p><p class="gr__card-lines" data-v-124657af>${ssrInterpolate(order.lines.length)} line(s) outstanding · ${ssrInterpolate(fmt(outstandingValue(order)))}</p>`);
					if (unref(can)("procurement.goods-receipts.create")) _push(`<footer class="gr__card-foot" data-v-124657af><button class="ui-btn ui-btn--primary ui-btn--sm" data-v-124657af>Book Delivery</button><button class="ui-btn ui-btn--ghost ui-btn--sm" data-v-124657af>Receive In Full</button></footer>`);
					else _push(`<!---->`);
					_push(`</article>`);
				});
				_push(`<!--]--></div></section>`);
			} else _push(`<!---->`);
			_push(`<div class="gr__filters" data-v-124657af><input${ssrRenderAttr("value", search.value)} class="ui-input gr__search" placeholder="Search GRN / invoice / vendor…" data-v-124657af><select class="ui-input" style="${ssrRenderStyle({ "width": "210px" })}" data-v-124657af><option value="" data-v-124657af${ssrIncludeBooleanAttr(Array.isArray(vendorFilter.value) ? ssrLooseContain(vendorFilter.value, "") : ssrLooseEqual(vendorFilter.value, "")) ? " selected" : ""}>All Vendors</option><!--[-->`);
			ssrRenderList(props.vendors, (v) => {
				_push(`<option${ssrRenderAttr("value", v.id)} data-v-124657af${ssrIncludeBooleanAttr(Array.isArray(vendorFilter.value) ? ssrLooseContain(vendorFilter.value, v.id) : ssrLooseEqual(vendorFilter.value, v.id)) ? " selected" : ""}>${ssrInterpolate(v.name)}</option>`);
			});
			_push(`<!--]--></select></div>`);
			_push(ssrRenderComponent(DataTable_default, {
				columns,
				rows: receipts.value,
				"empty-text": "No deliveries booked at this outlet yet."
			}, {
				"cell:grn_number": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) _push(`<strong data-v-124657af${_scopeId}>${ssrInterpolate(row.grn_number)}</strong><span class="gr__sub" data-v-124657af${_scopeId}>${ssrInterpolate(row.line_count)} line(s)</span>`);
					else return [createVNode("strong", null, toDisplayString(row.grn_number), 1), createVNode("span", { class: "gr__sub" }, toDisplayString(row.line_count) + " line(s)", 1)];
				}),
				"cell:vendor_name": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`${ssrInterpolate(row.vendor_name || "—")} `);
						if (row.created_by_name) _push(`<span class="gr__sub" data-v-124657af${_scopeId}>by ${ssrInterpolate(row.created_by_name)}</span>`);
						else _push(`<!---->`);
					} else return [createTextVNode(toDisplayString(row.vendor_name || "—") + " ", 1), row.created_by_name ? (openBlock(), createBlock("span", {
						key: 0,
						class: "gr__sub"
					}, "by " + toDisplayString(row.created_by_name), 1)) : createCommentVNode("", true)];
				}),
				"cell:po_number": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) {
						if (value) _push(`<span data-v-124657af${_scopeId}>${ssrInterpolate(value)}</span>`);
						else _push(`<span class="ui-badge ui-badge--muted" data-v-124657af${_scopeId}>Ad hoc</span>`);
					} else return [value ? (openBlock(), createBlock("span", { key: 0 }, toDisplayString(value), 1)) : (openBlock(), createBlock("span", {
						key: 1,
						class: "ui-badge ui-badge--muted"
					}, "Ad hoc"))];
				}),
				"cell:invoice_number": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) {
						if (value) _push(`<span data-v-124657af${_scopeId}>${ssrInterpolate(value)}</span>`);
						else _push(`<span class="gr__muted" data-v-124657af${_scopeId}>—</span>`);
					} else return [value ? (openBlock(), createBlock("span", { key: 0 }, toDisplayString(value), 1)) : (openBlock(), createBlock("span", {
						key: 1,
						class: "gr__muted"
					}, "—"))];
				}),
				"cell:received_at": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) _push(`${ssrInterpolate(fmtDate(value))}`);
					else return [createTextVNode(toDisplayString(fmtDate(value)), 1)];
				}),
				"cell:total": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) _push(`<strong data-v-124657af${_scopeId}>${ssrInterpolate(fmt(value))}</strong>`);
					else return [createVNode("strong", null, toDisplayString(fmt(value)), 1)];
				}),
				actions: withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) _push(`<button class="ui-btn ui-btn--ghost ui-btn--sm" data-v-124657af${_scopeId}>View</button>`);
					else return [createVNode("button", {
						class: "ui-btn ui-btn--ghost ui-btn--sm",
						onClick: ($event) => openView(row)
					}, "View", 8, ["onClick"])];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(Pagination_default, {
				paginator: props.receipts,
				only: [
					"receipts",
					"summary",
					"openOrders"
				]
			}, null, _parent));
			_push(ssrRenderComponent(Modal_default, {
				modelValue: showBook.value,
				"onUpdate:modelValue": ($event) => showBook.value = $event,
				title: "Book Delivery",
				width: "900px"
			}, {
				footer: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<button class="ui-btn ui-btn--ghost" data-v-124657af${_scopeId}>Cancel</button><button class="ui-btn ui-btn--primary"${ssrIncludeBooleanAttr(unref(form).processing || hasDuplicates.value || !validLines.value.length) ? " disabled" : ""} data-v-124657af${_scopeId}> Post Receipt </button>`);
					else return [createVNode("button", {
						class: "ui-btn ui-btn--ghost",
						onClick: ($event) => showBook.value = false
					}, "Cancel", 8, ["onClick"]), createVNode("button", {
						class: "ui-btn ui-btn--primary",
						disabled: unref(form).processing || hasDuplicates.value || !validLines.value.length,
						onClick: save
					}, " Post Receipt ", 8, ["disabled"])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).purchase_order_id,
							"onUpdate:modelValue": ($event) => unref(form).purchase_order_id = $event,
							label: "Against Purchase Order",
							type: "select",
							error: unref(form).errors.purchase_order_id
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) {
									_push(`<option value="" data-v-124657af${_scopeId}>No purchase order (ad hoc / cash purchase)</option><!--[-->`);
									ssrRenderList(props.openOrders, (o) => {
										_push(`<option${ssrRenderAttr("value", o.id)} data-v-124657af${_scopeId}>${ssrInterpolate(o.po_number)} — ${ssrInterpolate(o.vendor_name)}</option>`);
									});
									_push(`<!--]-->`);
								} else return [createVNode("option", { value: "" }, "No purchase order (ad hoc / cash purchase)"), (openBlock(true), createBlock(Fragment, null, renderList(props.openOrders, (o) => {
									return openBlock(), createBlock("option", {
										key: o.id,
										value: o.id
									}, toDisplayString(o.po_number) + " — " + toDisplayString(o.vendor_name), 9, ["value"]);
								}), 128))];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(`<div class="form-grid-2" data-v-124657af${_scopeId}>`);
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).vendor_id,
							"onUpdate:modelValue": ($event) => unref(form).vendor_id = $event,
							label: "Vendor *",
							type: "select",
							readonly: !!unref(form).purchase_order_id,
							error: unref(form).errors.vendor_id
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) {
									_push(`<option value="" data-v-124657af${_scopeId}>Select a vendor…</option><!--[-->`);
									ssrRenderList(props.vendors, (v) => {
										_push(`<option${ssrRenderAttr("value", v.id)} data-v-124657af${_scopeId}>${ssrInterpolate(v.name)}</option>`);
									});
									_push(`<!--]-->`);
								} else return [createVNode("option", { value: "" }, "Select a vendor…"), (openBlock(true), createBlock(Fragment, null, renderList(props.vendors, (v) => {
									return openBlock(), createBlock("option", {
										key: v.id,
										value: v.id
									}, toDisplayString(v.name), 9, ["value"]);
								}), 128))];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).received_at,
							"onUpdate:modelValue": ($event) => unref(form).received_at = $event,
							label: "Received On *",
							type: "date",
							error: unref(form).errors.received_at
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).invoice_number,
							"onUpdate:modelValue": ($event) => unref(form).invoice_number = $event,
							label: "Invoice / DC Number",
							error: unref(form).errors.invoice_number
						}, null, _parent, _scopeId));
						_push(`</div><table class="gr__table" data-v-124657af${_scopeId}><thead data-v-124657af${_scopeId}><tr data-v-124657af${_scopeId}><th style="${ssrRenderStyle({ "width": "32%" })}" data-v-124657af${_scopeId}>Ingredient</th><th style="${ssrRenderStyle({ "width": "12%" })}" class="gr__right" data-v-124657af${_scopeId}>Ordered</th><th style="${ssrRenderStyle({ "width": "18%" })}" data-v-124657af${_scopeId}>Received Qty</th><th style="${ssrRenderStyle({ "width": "18%" })}" data-v-124657af${_scopeId}>Unit Cost</th><th class="gr__right" data-v-124657af${_scopeId}>Line Total</th><th style="${ssrRenderStyle({ "width": "40px" })}" data-v-124657af${_scopeId}></th></tr></thead><tbody data-v-124657af${_scopeId}>`);
						if (!unref(form).lines.length) _push(`<tr data-v-124657af${_scopeId}><td colspan="6" class="gr__muted gr__empty" data-v-124657af${_scopeId}> Pick a purchase order above to pre-fill its outstanding lines, or add lines by hand. </td></tr>`);
						else _push(`<!---->`);
						_push(`<!--[-->`);
						ssrRenderList(unref(form).lines, (line, i) => {
							_push(`<tr data-v-124657af${_scopeId}><td data-v-124657af${_scopeId}><select class="ui-input"${ssrIncludeBooleanAttr(!!line.purchase_order_item_id) ? " disabled" : ""} data-v-124657af${_scopeId}><option value="" data-v-124657af${ssrIncludeBooleanAttr(Array.isArray(line.ingredient_id) ? ssrLooseContain(line.ingredient_id, "") : ssrLooseEqual(line.ingredient_id, "")) ? " selected" : ""}${_scopeId}>Select…</option><!--[-->`);
							ssrRenderList(props.ingredients, (ing) => {
								_push(`<option${ssrRenderAttr("value", ing.id)} data-v-124657af${ssrIncludeBooleanAttr(Array.isArray(line.ingredient_id) ? ssrLooseContain(line.ingredient_id, ing.id) : ssrLooseEqual(line.ingredient_id, ing.id)) ? " selected" : ""}${_scopeId}>${ssrInterpolate(ing.name)}</option>`);
							});
							_push(`<!--]--></select>`);
							if (isDuplicate(line, i)) _push(`<span class="gr__err" data-v-124657af${_scopeId}>Already listed above</span>`);
							else _push(`<!---->`);
							_push(`</td><td class="gr__right gr__muted" data-v-124657af${_scopeId}>`);
							if (line.ordered_qty !== void 0) _push(`<!--[-->${ssrInterpolate(qty(line.ordered_qty))}<!--]-->`);
							else _push(`<!--[-->—<!--]-->`);
							_push(`</td><td data-v-124657af${_scopeId}><div class="gr__qty" data-v-124657af${_scopeId}><input${ssrRenderAttr("value", line.quantity)} type="number" step="0.0001" min="0" class="ui-input" data-v-124657af${_scopeId}><span class="gr__unit" data-v-124657af${_scopeId}>${ssrInterpolate(unitOf(line.ingredient_id))}</span></div>`);
							if (isShort(line)) _push(`<span class="gr__short" data-v-124657af${_scopeId}>short by ${ssrInterpolate(qty(shortfall(line)))}</span>`);
							else if (isOver(line)) _push(`<span class="gr__over" data-v-124657af${_scopeId}>over by ${ssrInterpolate(qty(-shortfall(line)))}</span>`);
							else _push(`<!---->`);
							_push(`</td><td data-v-124657af${_scopeId}><input${ssrRenderAttr("value", line.unit_cost)} type="number" step="0.01" min="0" class="ui-input" data-v-124657af${_scopeId}></td><td class="gr__right" data-v-124657af${_scopeId}><strong data-v-124657af${_scopeId}>${ssrInterpolate(fmt(lineTotal(line)))}</strong></td><td data-v-124657af${_scopeId}><button class="ui-btn ui-btn--danger ui-btn--sm" title="Remove line" data-v-124657af${_scopeId}>×</button></td></tr>`);
						});
						_push(`<!--]--></tbody>`);
						if (unref(form).lines.length) _push(`<tfoot data-v-124657af${_scopeId}><tr data-v-124657af${_scopeId}><td colspan="4" class="gr__right" data-v-124657af${_scopeId}><strong data-v-124657af${_scopeId}>Delivery Total</strong></td><td class="gr__right" data-v-124657af${_scopeId}><strong data-v-124657af${_scopeId}>${ssrInterpolate(fmt(deliveryTotal.value))}</strong></td><td data-v-124657af${_scopeId}></td></tr></tfoot>`);
						else _push(`<!---->`);
						_push(`</table>`);
						if (unref(form).errors.lines) _push(`<p class="gr__err" data-v-124657af${_scopeId}>${ssrInterpolate(unref(form).errors.lines)}</p>`);
						else _push(`<!---->`);
						_push(`<button class="ui-btn ui-btn--secondary ui-btn--sm gr__add" data-v-124657af${_scopeId}>+ Add Line</button>`);
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).notes,
							"onUpdate:modelValue": ($event) => unref(form).notes = $event,
							label: "Notes",
							type: "textarea",
							error: unref(form).errors.notes
						}, null, _parent, _scopeId));
						_push(`<p class="gr__hint" data-v-124657af${_scopeId}> Enter what actually arrived and what the invoice actually charged — a short or over delivery is fine, and the outstanding quantity on the order adjusts itself. These unit costs are what re-value your stock, so each affected ingredient&#39;s moving average, and every dish that uses it, will change the moment this is posted. </p>`);
					} else return [
						createVNode(_sfc_main$2, {
							modelValue: unref(form).purchase_order_id,
							"onUpdate:modelValue": ($event) => unref(form).purchase_order_id = $event,
							label: "Against Purchase Order",
							type: "select",
							error: unref(form).errors.purchase_order_id
						}, {
							default: withCtx(() => [createVNode("option", { value: "" }, "No purchase order (ad hoc / cash purchase)"), (openBlock(true), createBlock(Fragment, null, renderList(props.openOrders, (o) => {
								return openBlock(), createBlock("option", {
									key: o.id,
									value: o.id
								}, toDisplayString(o.po_number) + " — " + toDisplayString(o.vendor_name), 9, ["value"]);
							}), 128))]),
							_: 1
						}, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode("div", { class: "form-grid-2" }, [
							createVNode(_sfc_main$2, {
								modelValue: unref(form).vendor_id,
								"onUpdate:modelValue": ($event) => unref(form).vendor_id = $event,
								label: "Vendor *",
								type: "select",
								readonly: !!unref(form).purchase_order_id,
								error: unref(form).errors.vendor_id
							}, {
								default: withCtx(() => [createVNode("option", { value: "" }, "Select a vendor…"), (openBlock(true), createBlock(Fragment, null, renderList(props.vendors, (v) => {
									return openBlock(), createBlock("option", {
										key: v.id,
										value: v.id
									}, toDisplayString(v.name), 9, ["value"]);
								}), 128))]),
								_: 1
							}, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"readonly",
								"error"
							]),
							createVNode(_sfc_main$2, {
								modelValue: unref(form).received_at,
								"onUpdate:modelValue": ($event) => unref(form).received_at = $event,
								label: "Received On *",
								type: "date",
								error: unref(form).errors.received_at
							}, null, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"error"
							]),
							createVNode(_sfc_main$2, {
								modelValue: unref(form).invoice_number,
								"onUpdate:modelValue": ($event) => unref(form).invoice_number = $event,
								label: "Invoice / DC Number",
								error: unref(form).errors.invoice_number
							}, null, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"error"
							])
						]),
						createVNode("table", { class: "gr__table" }, [
							createVNode("thead", null, [createVNode("tr", null, [
								createVNode("th", { style: { "width": "32%" } }, "Ingredient"),
								createVNode("th", {
									style: { "width": "12%" },
									class: "gr__right"
								}, "Ordered"),
								createVNode("th", { style: { "width": "18%" } }, "Received Qty"),
								createVNode("th", { style: { "width": "18%" } }, "Unit Cost"),
								createVNode("th", { class: "gr__right" }, "Line Total"),
								createVNode("th", { style: { "width": "40px" } })
							])]),
							createVNode("tbody", null, [!unref(form).lines.length ? (openBlock(), createBlock("tr", { key: 0 }, [createVNode("td", {
								colspan: "6",
								class: "gr__muted gr__empty"
							}, " Pick a purchase order above to pre-fill its outstanding lines, or add lines by hand. ")])) : createCommentVNode("", true), (openBlock(true), createBlock(Fragment, null, renderList(unref(form).lines, (line, i) => {
								return openBlock(), createBlock("tr", { key: i }, [
									createVNode("td", null, [withDirectives(createVNode("select", {
										"onUpdate:modelValue": ($event) => line.ingredient_id = $event,
										class: "ui-input",
										disabled: !!line.purchase_order_item_id
									}, [createVNode("option", { value: "" }, "Select…"), (openBlock(true), createBlock(Fragment, null, renderList(props.ingredients, (ing) => {
										return openBlock(), createBlock("option", {
											key: ing.id,
											value: ing.id
										}, toDisplayString(ing.name), 9, ["value"]);
									}), 128))], 8, ["onUpdate:modelValue", "disabled"]), [[vModelSelect, line.ingredient_id]]), isDuplicate(line, i) ? (openBlock(), createBlock("span", {
										key: 0,
										class: "gr__err"
									}, "Already listed above")) : createCommentVNode("", true)]),
									createVNode("td", { class: "gr__right gr__muted" }, [line.ordered_qty !== void 0 ? (openBlock(), createBlock(Fragment, { key: 0 }, [createTextVNode(toDisplayString(qty(line.ordered_qty)), 1)], 64)) : (openBlock(), createBlock(Fragment, { key: 1 }, [createTextVNode("—")], 64))]),
									createVNode("td", null, [createVNode("div", { class: "gr__qty" }, [withDirectives(createVNode("input", {
										"onUpdate:modelValue": ($event) => line.quantity = $event,
										type: "number",
										step: "0.0001",
										min: "0",
										class: "ui-input"
									}, null, 8, ["onUpdate:modelValue"]), [[
										vModelText,
										line.quantity,
										void 0,
										{ number: true }
									]]), createVNode("span", { class: "gr__unit" }, toDisplayString(unitOf(line.ingredient_id)), 1)]), isShort(line) ? (openBlock(), createBlock("span", {
										key: 0,
										class: "gr__short"
									}, "short by " + toDisplayString(qty(shortfall(line))), 1)) : isOver(line) ? (openBlock(), createBlock("span", {
										key: 1,
										class: "gr__over"
									}, "over by " + toDisplayString(qty(-shortfall(line))), 1)) : createCommentVNode("", true)]),
									createVNode("td", null, [withDirectives(createVNode("input", {
										"onUpdate:modelValue": ($event) => line.unit_cost = $event,
										type: "number",
										step: "0.01",
										min: "0",
										class: "ui-input"
									}, null, 8, ["onUpdate:modelValue"]), [[
										vModelText,
										line.unit_cost,
										void 0,
										{ number: true }
									]])]),
									createVNode("td", { class: "gr__right" }, [createVNode("strong", null, toDisplayString(fmt(lineTotal(line))), 1)]),
									createVNode("td", null, [createVNode("button", {
										class: "ui-btn ui-btn--danger ui-btn--sm",
										title: "Remove line",
										onClick: ($event) => removeLine(i)
									}, "×", 8, ["onClick"])])
								]);
							}), 128))]),
							unref(form).lines.length ? (openBlock(), createBlock("tfoot", { key: 0 }, [createVNode("tr", null, [
								createVNode("td", {
									colspan: "4",
									class: "gr__right"
								}, [createVNode("strong", null, "Delivery Total")]),
								createVNode("td", { class: "gr__right" }, [createVNode("strong", null, toDisplayString(fmt(deliveryTotal.value)), 1)]),
								createVNode("td")
							])])) : createCommentVNode("", true)
						]),
						unref(form).errors.lines ? (openBlock(), createBlock("p", {
							key: 0,
							class: "gr__err"
						}, toDisplayString(unref(form).errors.lines), 1)) : createCommentVNode("", true),
						createVNode("button", {
							class: "ui-btn ui-btn--secondary ui-btn--sm gr__add",
							onClick: addLine
						}, "+ Add Line"),
						createVNode(_sfc_main$2, {
							modelValue: unref(form).notes,
							"onUpdate:modelValue": ($event) => unref(form).notes = $event,
							label: "Notes",
							type: "textarea",
							error: unref(form).errors.notes
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode("p", { class: "gr__hint" }, " Enter what actually arrived and what the invoice actually charged — a short or over delivery is fine, and the outstanding quantity on the order adjusts itself. These unit costs are what re-value your stock, so each affected ingredient's moving average, and every dish that uses it, will change the moment this is posted. ")
					];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(Modal_default, {
				modelValue: showFull.value,
				"onUpdate:modelValue": ($event) => showFull.value = $event,
				title: "Receive In Full",
				width: "560px"
			}, {
				footer: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<button class="ui-btn ui-btn--ghost" data-v-124657af${_scopeId}>Cancel</button><button class="ui-btn ui-btn--primary"${ssrIncludeBooleanAttr(unref(fullForm).processing) ? " disabled" : ""} data-v-124657af${_scopeId}>Post Receipt</button>`);
					else return [createVNode("button", {
						class: "ui-btn ui-btn--ghost",
						onClick: ($event) => showFull.value = false
					}, "Cancel", 8, ["onClick"]), createVNode("button", {
						class: "ui-btn ui-btn--primary",
						disabled: unref(fullForm).processing,
						onClick: saveFull
					}, "Post Receipt", 8, ["disabled"])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<p class="gr__hint" data-v-124657af${_scopeId}> Books every outstanding line on ${ssrInterpolate(fullOrder.value?.po_number)} at the prices agreed on the order. Use &quot;Book Delivery&quot; instead if the quantities or the invoice differ. </p><div class="form-grid-2" data-v-124657af${_scopeId}>`);
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(fullForm).received_at,
							"onUpdate:modelValue": ($event) => unref(fullForm).received_at = $event,
							label: "Received On *",
							type: "date",
							error: unref(fullForm).errors.received_at
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(fullForm).invoice_number,
							"onUpdate:modelValue": ($event) => unref(fullForm).invoice_number = $event,
							label: "Invoice / DC Number",
							error: unref(fullForm).errors.invoice_number
						}, null, _parent, _scopeId));
						_push(`</div>`);
						if (fullOrder.value) {
							_push(`<table class="gr__table" data-v-124657af${_scopeId}><thead data-v-124657af${_scopeId}><tr data-v-124657af${_scopeId}><th data-v-124657af${_scopeId}>Ingredient</th><th class="gr__right" data-v-124657af${_scopeId}>Quantity</th><th class="gr__right" data-v-124657af${_scopeId}>Unit Cost</th><th class="gr__right" data-v-124657af${_scopeId}>Line Total</th></tr></thead><tbody data-v-124657af${_scopeId}><!--[-->`);
							ssrRenderList(fullOrder.value.lines, (line) => {
								_push(`<tr data-v-124657af${_scopeId}><td data-v-124657af${_scopeId}>${ssrInterpolate(line.name)}</td><td class="gr__right" data-v-124657af${_scopeId}>${ssrInterpolate(qty(line.quantity))} ${ssrInterpolate(line.unit)}</td><td class="gr__right gr__muted" data-v-124657af${_scopeId}>${ssrInterpolate(fmt(line.unit_cost))}</td><td class="gr__right" data-v-124657af${_scopeId}><strong data-v-124657af${_scopeId}>${ssrInterpolate(fmt(line.quantity * line.unit_cost))}</strong></td></tr>`);
							});
							_push(`<!--]--></tbody><tfoot data-v-124657af${_scopeId}><tr data-v-124657af${_scopeId}><td colspan="3" class="gr__right" data-v-124657af${_scopeId}><strong data-v-124657af${_scopeId}>Total</strong></td><td class="gr__right" data-v-124657af${_scopeId}><strong data-v-124657af${_scopeId}>${ssrInterpolate(fmt(outstandingValue(fullOrder.value)))}</strong></td></tr></tfoot></table>`);
						} else _push(`<!---->`);
					} else return [
						createVNode("p", { class: "gr__hint" }, " Books every outstanding line on " + toDisplayString(fullOrder.value?.po_number) + " at the prices agreed on the order. Use \"Book Delivery\" instead if the quantities or the invoice differ. ", 1),
						createVNode("div", { class: "form-grid-2" }, [createVNode(_sfc_main$2, {
							modelValue: unref(fullForm).received_at,
							"onUpdate:modelValue": ($event) => unref(fullForm).received_at = $event,
							label: "Received On *",
							type: "date",
							error: unref(fullForm).errors.received_at
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]), createVNode(_sfc_main$2, {
							modelValue: unref(fullForm).invoice_number,
							"onUpdate:modelValue": ($event) => unref(fullForm).invoice_number = $event,
							label: "Invoice / DC Number",
							error: unref(fullForm).errors.invoice_number
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						])]),
						fullOrder.value ? (openBlock(), createBlock("table", {
							key: 0,
							class: "gr__table"
						}, [
							createVNode("thead", null, [createVNode("tr", null, [
								createVNode("th", null, "Ingredient"),
								createVNode("th", { class: "gr__right" }, "Quantity"),
								createVNode("th", { class: "gr__right" }, "Unit Cost"),
								createVNode("th", { class: "gr__right" }, "Line Total")
							])]),
							createVNode("tbody", null, [(openBlock(true), createBlock(Fragment, null, renderList(fullOrder.value.lines, (line) => {
								return openBlock(), createBlock("tr", { key: line.purchase_order_item_id }, [
									createVNode("td", null, toDisplayString(line.name), 1),
									createVNode("td", { class: "gr__right" }, toDisplayString(qty(line.quantity)) + " " + toDisplayString(line.unit), 1),
									createVNode("td", { class: "gr__right gr__muted" }, toDisplayString(fmt(line.unit_cost)), 1),
									createVNode("td", { class: "gr__right" }, [createVNode("strong", null, toDisplayString(fmt(line.quantity * line.unit_cost)), 1)])
								]);
							}), 128))]),
							createVNode("tfoot", null, [createVNode("tr", null, [createVNode("td", {
								colspan: "3",
								class: "gr__right"
							}, [createVNode("strong", null, "Total")]), createVNode("td", { class: "gr__right" }, [createVNode("strong", null, toDisplayString(fmt(outstandingValue(fullOrder.value))), 1)])])])
						])) : createCommentVNode("", true)
					];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(Modal_default, {
				modelValue: showView.value,
				"onUpdate:modelValue": ($event) => showView.value = $event,
				title: viewing.value?.grn_number ?? "Goods Receipt",
				width: "820px"
			}, {
				footer: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<button class="ui-btn ui-btn--ghost" data-v-124657af${_scopeId}>Close</button>`);
					else return [createVNode("button", {
						class: "ui-btn ui-btn--ghost",
						onClick: ($event) => showView.value = false
					}, "Close", 8, ["onClick"])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						if (viewing.value) {
							_push(`<div data-v-124657af${_scopeId}><div class="gr__meta" data-v-124657af${_scopeId}><div data-v-124657af${_scopeId}><span class="gr__meta-label" data-v-124657af${_scopeId}>Vendor</span><span data-v-124657af${_scopeId}>${ssrInterpolate(viewing.value.vendor_name || "—")}</span></div><div data-v-124657af${_scopeId}><span class="gr__meta-label" data-v-124657af${_scopeId}>Purchase Order</span><span data-v-124657af${_scopeId}>${ssrInterpolate(viewing.value.po_number || "Ad hoc")}</span></div><div data-v-124657af${_scopeId}><span class="gr__meta-label" data-v-124657af${_scopeId}>Invoice</span><span data-v-124657af${_scopeId}>${ssrInterpolate(viewing.value.invoice_number || "—")}</span></div><div data-v-124657af${_scopeId}><span class="gr__meta-label" data-v-124657af${_scopeId}>Received</span><span data-v-124657af${_scopeId}>${ssrInterpolate(fmtDate(viewing.value.received_at))}</span></div><div data-v-124657af${_scopeId}><span class="gr__meta-label" data-v-124657af${_scopeId}>Booked By</span><span data-v-124657af${_scopeId}>${ssrInterpolate(viewing.value.created_by_name || "—")}</span></div><div data-v-124657af${_scopeId}><span class="gr__meta-label" data-v-124657af${_scopeId}>Total</span><span data-v-124657af${_scopeId}><strong data-v-124657af${_scopeId}>${ssrInterpolate(fmt(viewing.value.total))}</strong></span></div></div><table class="gr__table" data-v-124657af${_scopeId}><thead data-v-124657af${_scopeId}><tr data-v-124657af${_scopeId}><th data-v-124657af${_scopeId}>Ingredient</th><th class="gr__right" data-v-124657af${_scopeId}>Quantity</th><th class="gr__right" data-v-124657af${_scopeId}>Unit Cost</th><th class="gr__right" data-v-124657af${_scopeId}>Line Total</th></tr></thead><tbody data-v-124657af${_scopeId}><!--[-->`);
							ssrRenderList(viewing.value.lines, (line, i) => {
								_push(`<tr data-v-124657af${_scopeId}><td data-v-124657af${_scopeId}>${ssrInterpolate(line.name)}</td><td class="gr__right" data-v-124657af${_scopeId}>${ssrInterpolate(qty(line.quantity))} ${ssrInterpolate(line.unit)}</td><td class="gr__right gr__muted" data-v-124657af${_scopeId}>${ssrInterpolate(fmt(line.unit_cost))}</td><td class="gr__right" data-v-124657af${_scopeId}><strong data-v-124657af${_scopeId}>${ssrInterpolate(fmt(line.line_total))}</strong></td></tr>`);
							});
							_push(`<!--]--></tbody></table>`);
							if (viewing.value.notes) _push(`<p class="gr__notes" data-v-124657af${_scopeId}><span class="gr__meta-label" data-v-124657af${_scopeId}>Notes</span>${ssrInterpolate(viewing.value.notes)}</p>`);
							else _push(`<!---->`);
							_push(`<p class="gr__hint" data-v-124657af${_scopeId}> Posted receipts are permanent — the costs above have already been used to value stock and to cost the orders sold since. Correct a mistake with a stock take or a write-off on the Stock screen. </p></div>`);
						} else _push(`<!---->`);
					} else return [viewing.value ? (openBlock(), createBlock("div", { key: 0 }, [
						createVNode("div", { class: "gr__meta" }, [
							createVNode("div", null, [createVNode("span", { class: "gr__meta-label" }, "Vendor"), createVNode("span", null, toDisplayString(viewing.value.vendor_name || "—"), 1)]),
							createVNode("div", null, [createVNode("span", { class: "gr__meta-label" }, "Purchase Order"), createVNode("span", null, toDisplayString(viewing.value.po_number || "Ad hoc"), 1)]),
							createVNode("div", null, [createVNode("span", { class: "gr__meta-label" }, "Invoice"), createVNode("span", null, toDisplayString(viewing.value.invoice_number || "—"), 1)]),
							createVNode("div", null, [createVNode("span", { class: "gr__meta-label" }, "Received"), createVNode("span", null, toDisplayString(fmtDate(viewing.value.received_at)), 1)]),
							createVNode("div", null, [createVNode("span", { class: "gr__meta-label" }, "Booked By"), createVNode("span", null, toDisplayString(viewing.value.created_by_name || "—"), 1)]),
							createVNode("div", null, [createVNode("span", { class: "gr__meta-label" }, "Total"), createVNode("span", null, [createVNode("strong", null, toDisplayString(fmt(viewing.value.total)), 1)])])
						]),
						createVNode("table", { class: "gr__table" }, [createVNode("thead", null, [createVNode("tr", null, [
							createVNode("th", null, "Ingredient"),
							createVNode("th", { class: "gr__right" }, "Quantity"),
							createVNode("th", { class: "gr__right" }, "Unit Cost"),
							createVNode("th", { class: "gr__right" }, "Line Total")
						])]), createVNode("tbody", null, [(openBlock(true), createBlock(Fragment, null, renderList(viewing.value.lines, (line, i) => {
							return openBlock(), createBlock("tr", { key: i }, [
								createVNode("td", null, toDisplayString(line.name), 1),
								createVNode("td", { class: "gr__right" }, toDisplayString(qty(line.quantity)) + " " + toDisplayString(line.unit), 1),
								createVNode("td", { class: "gr__right gr__muted" }, toDisplayString(fmt(line.unit_cost)), 1),
								createVNode("td", { class: "gr__right" }, [createVNode("strong", null, toDisplayString(fmt(line.line_total)), 1)])
							]);
						}), 128))])]),
						viewing.value.notes ? (openBlock(), createBlock("p", {
							key: 0,
							class: "gr__notes"
						}, [createVNode("span", { class: "gr__meta-label" }, "Notes"), createTextVNode(toDisplayString(viewing.value.notes), 1)])) : createCommentVNode("", true),
						createVNode("p", { class: "gr__hint" }, " Posted receipts are permanent — the costs above have already been used to value stock and to cost the orders sold since. Correct a mistake with a stock take or a write-off on the Stock screen. ")
					])) : createCommentVNode("", true)];
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
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/pages/Procurement/GoodsReceipts.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var GoodsReceipts_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-124657af"]]);
//#endregion
export { GoodsReceipts_default as default };
