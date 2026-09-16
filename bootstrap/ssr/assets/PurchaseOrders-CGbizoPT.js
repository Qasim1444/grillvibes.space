import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-BOaGB7Aw.js";
import { n as usePermissions, t as AdminLayout_default } from "./AdminLayout-Bp8G38ms.js";
import { t as _sfc_main$1 } from "./PageHeader-D0aRDn5C.js";
import { t as DataTable_default } from "./DataTable-BHCUCuvd.js";
import { t as Pagination_default } from "./Pagination-h4WEvndd.js";
import { t as Modal_default } from "./Modal-DhESI6xO.js";
import { t as _sfc_main$2 } from "./FormField-Doe8oR1s.js";
import { Fragment, computed, createBlock, createCommentVNode, createTextVNode, createVNode, mergeProps, openBlock, ref, renderList, toDisplayString, unref, useSSRContext, vModelSelect, vModelText, watch, withCtx, withDirectives } from "vue";
import { Link, router, useForm } from "@inertiajs/vue3";
import { ssrIncludeBooleanAttr, ssrInterpolate, ssrLooseContain, ssrLooseEqual, ssrRenderAttr, ssrRenderAttrs, ssrRenderClass, ssrRenderComponent, ssrRenderList, ssrRenderStyle } from "vue/server-renderer";
//#region resources/js/pages/Procurement/PurchaseOrders.vue
var _sfc_main = /*@__PURE__*/ Object.assign({ layout: AdminLayout_default }, {
	__name: "PurchaseOrders",
	__ssrInlineRender: true,
	props: {
		orders: {
			type: Object,
			default: () => ({ data: [] })
		},
		vendors: {
			type: Array,
			default: () => []
		},
		ingredients: {
			type: Array,
			default: () => []
		},
		statuses: {
			type: Object,
			default: () => ({})
		},
		summary: {
			type: Object,
			default: () => ({
				draft: 0,
				open: 0,
				open_value: 0,
				overdue: 0,
				received_this_month: 0
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
				key: "po_number",
				label: "PO"
			},
			{
				key: "vendor_name",
				label: "Vendor"
			},
			{
				key: "status",
				label: "Status"
			},
			{
				key: "expected_at",
				label: "Expected"
			},
			{
				key: "total",
				label: "Total"
			},
			{
				key: "outstanding_value",
				label: "Outstanding"
			}
		];
		const orders = computed(() => props.orders?.data ?? []);
		const search = ref(props.filters?.search ?? "");
		const statusFilter = ref(props.filters?.status ?? "");
		const vendorFilter = ref(props.filters?.vendor_id ?? "");
		let timer = null;
		const reload = () => router.get("/procurement/purchase-orders", {
			search: search.value || void 0,
			status: statusFilter.value || void 0,
			vendor_id: vendorFilter.value || void 0
		}, {
			preserveState: true,
			preserveScroll: true,
			replace: true,
			only: [
				"orders",
				"summary",
				"filters"
			]
		});
		watch([
			search,
			statusFilter,
			vendorFilter
		], () => {
			clearTimeout(timer);
			timer = setTimeout(reload, 300);
		});
		const showForm = ref(false);
		const editingNumber = ref("");
		const form = useForm({
			id: null,
			vendor_id: "",
			expected_at: "",
			notes: "",
			lines: []
		});
		const openCreate = () => {
			form.reset();
			form.clearErrors();
			form.lines = [{
				ingredient_id: "",
				quantity: null,
				unit_cost: null
			}];
			editingNumber.value = "";
			showForm.value = true;
		};
		const openEdit = (row) => {
			form.clearErrors();
			form.id = row.id;
			form.vendor_id = row.vendor_id;
			form.expected_at = row.expected_at ?? "";
			form.notes = row.notes ?? "";
			form.lines = row.lines.map((l) => ({
				ingredient_id: l.ingredient_id,
				quantity: l.quantity,
				unit_cost: l.unit_cost
			}));
			editingNumber.value = row.po_number;
			showForm.value = true;
		};
		const addLine = () => form.lines.push({
			ingredient_id: "",
			quantity: null,
			unit_cost: null
		});
		const removeLine = (i) => form.lines.splice(i, 1);
		const validLines = computed(() => form.lines.filter((l) => l.ingredient_id && Number(l.quantity) > 0));
		const save = () => {
			const lines = validLines.value.map((l) => ({
				ingredient_id: l.ingredient_id,
				quantity: l.quantity,
				unit_cost: Number(l.unit_cost || 0)
			}));
			const opts = {
				preserveScroll: true,
				onSuccess: () => showForm.value = false
			};
			const payload = () => ({
				vendor_id: form.vendor_id,
				expected_at: form.expected_at || null,
				notes: form.notes || null,
				lines
			});
			if (form.id) form.transform(payload).put(`/procurement/purchase-orders/${form.id}`, opts);
			else form.transform(payload).post("/procurement/purchase-orders", opts);
		};
		const showView = ref(false);
		const viewing = ref(null);
		const openView = (row) => {
			viewing.value = row;
			showView.value = true;
		};
		const send = (row) => {
			if (!confirm(`Send ${row.po_number} to ${row.vendor_name}? Once sent, the lines can no longer be changed.`)) return;
			router.put(`/procurement/purchase-orders/${row.id}/order`, {}, { preserveScroll: true });
		};
		const showCancel = ref(false);
		const cancelling = ref(null);
		const cancelForm = useForm({ reason: "" });
		const openCancel = (row) => {
			cancelling.value = row;
			cancelForm.reset();
			cancelForm.clearErrors();
			showCancel.value = true;
		};
		const saveCancel = () => cancelForm.put(`/procurement/purchase-orders/${cancelling.value.id}/cancel`, {
			preserveScroll: true,
			onSuccess: () => showCancel.value = false
		});
		const del = (row) => {
			if (!confirm(`Delete draft ${row.po_number}? Nothing has been committed, so this cannot be recovered.`)) return;
			router.delete(`/procurement/purchase-orders/${row.id}`, { preserveScroll: true });
		};
		const ingredientMap = computed(() => {
			const map = {};
			props.ingredients.forEach((i) => {
				map[i.id] = i;
			});
			return map;
		});
		const unitOf = (id) => ingredientMap.value[id]?.unit ?? "";
		const lineTotal = (line) => Math.round(Number(line.quantity || 0) * Number(line.unit_cost || 0) * 100) / 100;
		const orderTotal = computed(() => Math.round(form.lines.reduce((sum, l) => sum + lineTotal(l), 0) * 100) / 100);
		const selectedVendorTerms = computed(() => props.vendors.find((v) => String(v.id) === String(form.vendor_id))?.payment_terms ?? "");
		const isDuplicate = (line, index) => !!line.ingredient_id && form.lines.some((other, i) => i < index && other.ingredient_id === line.ingredient_id);
		const hasDuplicates = computed(() => form.lines.some((l, i) => isDuplicate(l, i)));
		const STATUS_BADGES = {
			draft: "ui-badge--muted",
			ordered: "ui-badge--info",
			partially_received: "ui-badge--warning",
			received: "ui-badge--success",
			cancelled: "ui-badge--danger"
		};
		const statusBadge = (s) => STATUS_BADGES[s] ?? "ui-badge--muted";
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
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "page" }, _attrs))} data-v-25221502>`);
			_push(ssrRenderComponent(_sfc_main$1, {
				title: "Purchase Orders",
				subtitle: "What you have committed to buy, from whom, at what price. Nothing here moves stock or changes a cost — value enters inventory when the delivery is booked as a goods receipt."
			}, {
				actions: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(ssrRenderComponent(unref(Link), {
							href: "/procurement/goods-receipts",
							class: "ui-btn ui-btn--secondary"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(`Goods Receipts`);
								else return [createTextVNode("Goods Receipts")];
							}),
							_: 1
						}, _parent, _scopeId));
						if (unref(can)("procurement.purchase-orders.create")) _push(`<button class="ui-btn ui-btn--primary" data-v-25221502${_scopeId}> + New Purchase Order </button>`);
						else _push(`<!---->`);
					} else return [createVNode(unref(Link), {
						href: "/procurement/goods-receipts",
						class: "ui-btn ui-btn--secondary"
					}, {
						default: withCtx(() => [createTextVNode("Goods Receipts")]),
						_: 1
					}), unref(can)("procurement.purchase-orders.create") ? (openBlock(), createBlock("button", {
						key: 0,
						class: "ui-btn ui-btn--primary",
						onClick: openCreate
					}, " + New Purchase Order ")) : createCommentVNode("", true)];
				}),
				_: 1
			}, _parent));
			_push(`<div class="po__kpis" data-v-25221502><div class="po__kpi po__kpi--muted" data-v-25221502><span class="po__kpi-label" data-v-25221502>Drafts</span><span class="po__kpi-val" data-v-25221502>${ssrInterpolate(props.summary.draft)}</span><span class="po__kpi-sub" data-v-25221502>not yet sent to a vendor</span></div><div class="po__kpi po__kpi--info" data-v-25221502><span class="po__kpi-label" data-v-25221502>Awaiting Delivery</span><span class="po__kpi-val" data-v-25221502>${ssrInterpolate(props.summary.open)}</span><span class="po__kpi-sub" data-v-25221502>${ssrInterpolate(fmt(props.summary.open_value))} committed</span></div><div class="${ssrRenderClass([props.summary.overdue > 0 ? "po__kpi--danger" : "po__kpi--ok", "po__kpi"])}" data-v-25221502><span class="po__kpi-label" data-v-25221502>Overdue</span><span class="po__kpi-val" data-v-25221502>${ssrInterpolate(props.summary.overdue)}</span><span class="po__kpi-sub" data-v-25221502>past their expected date</span></div><div class="po__kpi po__kpi--ok" data-v-25221502><span class="po__kpi-label" data-v-25221502>Completed This Month</span><span class="po__kpi-val" data-v-25221502>${ssrInterpolate(props.summary.received_this_month)}</span><span class="po__kpi-sub" data-v-25221502>fully received</span></div></div><div class="po__filters" data-v-25221502><input${ssrRenderAttr("value", search.value)} class="ui-input po__search" placeholder="Search PO number / vendor…" data-v-25221502><select class="ui-input" style="${ssrRenderStyle({ "width": "190px" })}" data-v-25221502><option value="" data-v-25221502${ssrIncludeBooleanAttr(Array.isArray(statusFilter.value) ? ssrLooseContain(statusFilter.value, "") : ssrLooseEqual(statusFilter.value, "")) ? " selected" : ""}>All Statuses</option><!--[-->`);
			ssrRenderList(props.statuses, (label, value) => {
				_push(`<option${ssrRenderAttr("value", value)} data-v-25221502${ssrIncludeBooleanAttr(Array.isArray(statusFilter.value) ? ssrLooseContain(statusFilter.value, value) : ssrLooseEqual(statusFilter.value, value)) ? " selected" : ""}>${ssrInterpolate(label)}</option>`);
			});
			_push(`<!--]--></select><select class="ui-input" style="${ssrRenderStyle({ "width": "210px" })}" data-v-25221502><option value="" data-v-25221502${ssrIncludeBooleanAttr(Array.isArray(vendorFilter.value) ? ssrLooseContain(vendorFilter.value, "") : ssrLooseEqual(vendorFilter.value, "")) ? " selected" : ""}>All Vendors</option><!--[-->`);
			ssrRenderList(props.vendors, (v) => {
				_push(`<option${ssrRenderAttr("value", v.id)} data-v-25221502${ssrIncludeBooleanAttr(Array.isArray(vendorFilter.value) ? ssrLooseContain(vendorFilter.value, v.id) : ssrLooseEqual(vendorFilter.value, v.id)) ? " selected" : ""}>${ssrInterpolate(v.name)}</option>`);
			});
			_push(`<!--]--></select></div>`);
			_push(ssrRenderComponent(DataTable_default, {
				columns,
				rows: orders.value,
				"empty-text": "No purchase orders for this outlet yet."
			}, {
				"cell:po_number": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) _push(`<strong data-v-25221502${_scopeId}>${ssrInterpolate(row.po_number)}</strong><span class="po__sub" data-v-25221502${_scopeId}>${ssrInterpolate(row.line_count)} line(s)</span>`);
					else return [createVNode("strong", null, toDisplayString(row.po_number), 1), createVNode("span", { class: "po__sub" }, toDisplayString(row.line_count) + " line(s)", 1)];
				}),
				"cell:vendor_name": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`${ssrInterpolate(row.vendor_name || "—")} `);
						if (row.created_by_name) _push(`<span class="po__sub" data-v-25221502${_scopeId}>by ${ssrInterpolate(row.created_by_name)}</span>`);
						else _push(`<!---->`);
					} else return [createTextVNode(toDisplayString(row.vendor_name || "—") + " ", 1), row.created_by_name ? (openBlock(), createBlock("span", {
						key: 0,
						class: "po__sub"
					}, "by " + toDisplayString(row.created_by_name), 1)) : createCommentVNode("", true)];
				}),
				"cell:status": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<span class="${ssrRenderClass([statusBadge(row.status), "ui-badge"])}" data-v-25221502${_scopeId}>${ssrInterpolate(row.status_label)}</span>`);
						if (row.is_overdue) _push(`<span class="ui-badge ui-badge--danger po__pill" data-v-25221502${_scopeId}>Overdue</span>`);
						else _push(`<!---->`);
					} else return [createVNode("span", { class: ["ui-badge", statusBadge(row.status)] }, toDisplayString(row.status_label), 3), row.is_overdue ? (openBlock(), createBlock("span", {
						key: 0,
						class: "ui-badge ui-badge--danger po__pill"
					}, "Overdue")) : createCommentVNode("", true)];
				}),
				"cell:expected_at": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<span class="${ssrRenderClass(row.is_overdue ? "po__neg" : "")}" data-v-25221502${_scopeId}>${ssrInterpolate(fmtDate(row.expected_at))}</span>`);
						if (row.ordered_at) _push(`<span class="po__sub" data-v-25221502${_scopeId}>sent ${ssrInterpolate(fmtDate(row.ordered_at))}</span>`);
						else _push(`<!---->`);
					} else return [createVNode("span", { class: row.is_overdue ? "po__neg" : "" }, toDisplayString(fmtDate(row.expected_at)), 3), row.ordered_at ? (openBlock(), createBlock("span", {
						key: 0,
						class: "po__sub"
					}, "sent " + toDisplayString(fmtDate(row.ordered_at)), 1)) : createCommentVNode("", true)];
				}),
				"cell:total": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) _push(`<strong data-v-25221502${_scopeId}>${ssrInterpolate(fmt(value))}</strong>`);
					else return [createVNode("strong", null, toDisplayString(fmt(value)), 1)];
				}),
				"cell:outstanding_value": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						if (row.outstanding_value > 0) _push(`<span class="po__warn" data-v-25221502${_scopeId}>${ssrInterpolate(fmt(row.outstanding_value))}</span>`);
						else _push(`<span class="po__muted" data-v-25221502${_scopeId}>—</span>`);
					} else return [row.outstanding_value > 0 ? (openBlock(), createBlock("span", {
						key: 0,
						class: "po__warn"
					}, toDisplayString(fmt(row.outstanding_value)), 1)) : (openBlock(), createBlock("span", {
						key: 1,
						class: "po__muted"
					}, "—"))];
				}),
				actions: withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<button class="ui-btn ui-btn--ghost ui-btn--sm" data-v-25221502${_scopeId}>View</button>`);
						if (row.is_draft && unref(can)("procurement.purchase-orders.update")) _push(`<button class="ui-btn ui-btn--ghost ui-btn--sm" data-v-25221502${_scopeId}>Edit</button>`);
						else _push(`<!---->`);
						if (row.is_draft && unref(can)("procurement.purchase-orders.approve")) _push(`<button class="ui-btn ui-btn--primary ui-btn--sm" data-v-25221502${_scopeId}>Send</button>`);
						else _push(`<!---->`);
						if (row.is_receivable && unref(can)("procurement.goods-receipts.create")) _push(ssrRenderComponent(unref(Link), {
							href: `/procurement/goods-receipts?po=${row.id}`,
							class: "ui-btn ui-btn--secondary ui-btn--sm"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(`Receive`);
								else return [createTextVNode("Receive")];
							}),
							_: 2
						}, _parent, _scopeId));
						else _push(`<!---->`);
						if (!row.is_draft && row.is_receivable && unref(can)("procurement.purchase-orders.update")) _push(`<button class="ui-btn ui-btn--ghost ui-btn--sm" data-v-25221502${_scopeId}>Cancel</button>`);
						else _push(`<!---->`);
						if (row.is_draft && unref(can)("procurement.purchase-orders.delete")) _push(`<button class="ui-btn ui-btn--danger ui-btn--sm" data-v-25221502${_scopeId}>Delete</button>`);
						else _push(`<!---->`);
					} else return [
						createVNode("button", {
							class: "ui-btn ui-btn--ghost ui-btn--sm",
							onClick: ($event) => openView(row)
						}, "View", 8, ["onClick"]),
						row.is_draft && unref(can)("procurement.purchase-orders.update") ? (openBlock(), createBlock("button", {
							key: 0,
							class: "ui-btn ui-btn--ghost ui-btn--sm",
							onClick: ($event) => openEdit(row)
						}, "Edit", 8, ["onClick"])) : createCommentVNode("", true),
						row.is_draft && unref(can)("procurement.purchase-orders.approve") ? (openBlock(), createBlock("button", {
							key: 1,
							class: "ui-btn ui-btn--primary ui-btn--sm",
							onClick: ($event) => send(row)
						}, "Send", 8, ["onClick"])) : createCommentVNode("", true),
						row.is_receivable && unref(can)("procurement.goods-receipts.create") ? (openBlock(), createBlock(unref(Link), {
							key: 2,
							href: `/procurement/goods-receipts?po=${row.id}`,
							class: "ui-btn ui-btn--secondary ui-btn--sm"
						}, {
							default: withCtx(() => [createTextVNode("Receive")]),
							_: 1
						}, 8, ["href"])) : createCommentVNode("", true),
						!row.is_draft && row.is_receivable && unref(can)("procurement.purchase-orders.update") ? (openBlock(), createBlock("button", {
							key: 3,
							class: "ui-btn ui-btn--ghost ui-btn--sm",
							onClick: ($event) => openCancel(row)
						}, "Cancel", 8, ["onClick"])) : createCommentVNode("", true),
						row.is_draft && unref(can)("procurement.purchase-orders.delete") ? (openBlock(), createBlock("button", {
							key: 4,
							class: "ui-btn ui-btn--danger ui-btn--sm",
							onClick: ($event) => del(row)
						}, "Delete", 8, ["onClick"])) : createCommentVNode("", true)
					];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(Pagination_default, {
				paginator: props.orders,
				only: ["orders", "summary"]
			}, null, _parent));
			_push(ssrRenderComponent(Modal_default, {
				modelValue: showForm.value,
				"onUpdate:modelValue": ($event) => showForm.value = $event,
				title: unref(form).id ? `Edit ${editingNumber.value}` : "New Purchase Order",
				width: "900px"
			}, {
				footer: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<button class="ui-btn ui-btn--ghost" data-v-25221502${_scopeId}>Cancel</button><button class="ui-btn ui-btn--primary"${ssrIncludeBooleanAttr(unref(form).processing || hasDuplicates.value || !validLines.value.length) ? " disabled" : ""} data-v-25221502${_scopeId}>${ssrInterpolate(unref(form).id ? "Save Changes" : "Save Draft")}</button>`);
					else return [createVNode("button", {
						class: "ui-btn ui-btn--ghost",
						onClick: ($event) => showForm.value = false
					}, "Cancel", 8, ["onClick"]), createVNode("button", {
						class: "ui-btn ui-btn--primary",
						disabled: unref(form).processing || hasDuplicates.value || !validLines.value.length,
						onClick: save
					}, toDisplayString(unref(form).id ? "Save Changes" : "Save Draft"), 9, ["disabled"])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div class="form-grid-2" data-v-25221502${_scopeId}>`);
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).vendor_id,
							"onUpdate:modelValue": ($event) => unref(form).vendor_id = $event,
							label: "Vendor *",
							type: "select",
							error: unref(form).errors.vendor_id
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) {
									_push(`<option value="" data-v-25221502${_scopeId}>Select a vendor…</option><!--[-->`);
									ssrRenderList(props.vendors, (v) => {
										_push(`<option${ssrRenderAttr("value", v.id)} data-v-25221502${_scopeId}>${ssrInterpolate(v.name)}</option>`);
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
							modelValue: unref(form).expected_at,
							"onUpdate:modelValue": ($event) => unref(form).expected_at = $event,
							label: "Expected Delivery",
							type: "date",
							error: unref(form).errors.expected_at
						}, null, _parent, _scopeId));
						_push(`</div>`);
						if (selectedVendorTerms.value) _push(`<p class="po__terms" data-v-25221502${_scopeId}>Payment terms: ${ssrInterpolate(selectedVendorTerms.value)}</p>`);
						else _push(`<!---->`);
						_push(`<table class="po__table" data-v-25221502${_scopeId}><thead data-v-25221502${_scopeId}><tr data-v-25221502${_scopeId}><th style="${ssrRenderStyle({ "width": "36%" })}" data-v-25221502${_scopeId}>Ingredient</th><th style="${ssrRenderStyle({ "width": "18%" })}" data-v-25221502${_scopeId}>Quantity</th><th style="${ssrRenderStyle({ "width": "18%" })}" data-v-25221502${_scopeId}>Unit Cost</th><th class="po__right" data-v-25221502${_scopeId}>Line Total</th><th style="${ssrRenderStyle({ "width": "40px" })}" data-v-25221502${_scopeId}></th></tr></thead><tbody data-v-25221502${_scopeId}>`);
						if (!unref(form).lines.length) _push(`<tr data-v-25221502${_scopeId}><td colspan="5" class="po__muted po__empty" data-v-25221502${_scopeId}>Add the first line to start this order.</td></tr>`);
						else _push(`<!---->`);
						_push(`<!--[-->`);
						ssrRenderList(unref(form).lines, (line, i) => {
							_push(`<tr data-v-25221502${_scopeId}><td data-v-25221502${_scopeId}><select class="ui-input" data-v-25221502${_scopeId}><option value="" data-v-25221502${ssrIncludeBooleanAttr(Array.isArray(line.ingredient_id) ? ssrLooseContain(line.ingredient_id, "") : ssrLooseEqual(line.ingredient_id, "")) ? " selected" : ""}${_scopeId}>Select…</option><!--[-->`);
							ssrRenderList(props.ingredients, (ing) => {
								_push(`<option${ssrRenderAttr("value", ing.id)} data-v-25221502${ssrIncludeBooleanAttr(Array.isArray(line.ingredient_id) ? ssrLooseContain(line.ingredient_id, ing.id) : ssrLooseEqual(line.ingredient_id, ing.id)) ? " selected" : ""}${_scopeId}>${ssrInterpolate(ing.name)}</option>`);
							});
							_push(`<!--]--></select>`);
							if (isDuplicate(line, i)) _push(`<span class="po__err" data-v-25221502${_scopeId}>Already listed above</span>`);
							else _push(`<!---->`);
							_push(`</td><td data-v-25221502${_scopeId}><div class="po__qty" data-v-25221502${_scopeId}><input${ssrRenderAttr("value", line.quantity)} type="number" step="0.0001" min="0" class="ui-input" data-v-25221502${_scopeId}><span class="po__unit" data-v-25221502${_scopeId}>${ssrInterpolate(unitOf(line.ingredient_id))}</span></div></td><td data-v-25221502${_scopeId}><input${ssrRenderAttr("value", line.unit_cost)} type="number" step="0.01" min="0" class="ui-input" data-v-25221502${_scopeId}></td><td class="po__right" data-v-25221502${_scopeId}><strong data-v-25221502${_scopeId}>${ssrInterpolate(fmt(lineTotal(line)))}</strong></td><td data-v-25221502${_scopeId}><button class="ui-btn ui-btn--danger ui-btn--sm" title="Remove line" data-v-25221502${_scopeId}>×</button></td></tr>`);
						});
						_push(`<!--]--></tbody>`);
						if (unref(form).lines.length) _push(`<tfoot data-v-25221502${_scopeId}><tr data-v-25221502${_scopeId}><td colspan="3" class="po__right" data-v-25221502${_scopeId}><strong data-v-25221502${_scopeId}>Order Total</strong></td><td class="po__right" data-v-25221502${_scopeId}><strong data-v-25221502${_scopeId}>${ssrInterpolate(fmt(orderTotal.value))}</strong></td><td data-v-25221502${_scopeId}></td></tr></tfoot>`);
						else _push(`<!---->`);
						_push(`</table>`);
						if (unref(form).errors.lines) _push(`<p class="po__err" data-v-25221502${_scopeId}>${ssrInterpolate(unref(form).errors.lines)}</p>`);
						else _push(`<!---->`);
						_push(`<button class="ui-btn ui-btn--secondary ui-btn--sm po__add" data-v-25221502${_scopeId}>+ Add Line</button>`);
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).notes,
							"onUpdate:modelValue": ($event) => unref(form).notes = $event,
							label: "Notes",
							type: "textarea",
							error: unref(form).errors.notes
						}, null, _parent, _scopeId));
						_push(`<p class="po__hint" data-v-25221502${_scopeId}> Saved as a draft — it commits nothing until you send it. Unit costs here are what you expect to pay; the price that actually values your stock is the one on the delivery invoice. </p>`);
					} else return [
						createVNode("div", { class: "form-grid-2" }, [createVNode(_sfc_main$2, {
							modelValue: unref(form).vendor_id,
							"onUpdate:modelValue": ($event) => unref(form).vendor_id = $event,
							label: "Vendor *",
							type: "select",
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
							"error"
						]), createVNode(_sfc_main$2, {
							modelValue: unref(form).expected_at,
							"onUpdate:modelValue": ($event) => unref(form).expected_at = $event,
							label: "Expected Delivery",
							type: "date",
							error: unref(form).errors.expected_at
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						])]),
						selectedVendorTerms.value ? (openBlock(), createBlock("p", {
							key: 0,
							class: "po__terms"
						}, "Payment terms: " + toDisplayString(selectedVendorTerms.value), 1)) : createCommentVNode("", true),
						createVNode("table", { class: "po__table" }, [
							createVNode("thead", null, [createVNode("tr", null, [
								createVNode("th", { style: { "width": "36%" } }, "Ingredient"),
								createVNode("th", { style: { "width": "18%" } }, "Quantity"),
								createVNode("th", { style: { "width": "18%" } }, "Unit Cost"),
								createVNode("th", { class: "po__right" }, "Line Total"),
								createVNode("th", { style: { "width": "40px" } })
							])]),
							createVNode("tbody", null, [!unref(form).lines.length ? (openBlock(), createBlock("tr", { key: 0 }, [createVNode("td", {
								colspan: "5",
								class: "po__muted po__empty"
							}, "Add the first line to start this order.")])) : createCommentVNode("", true), (openBlock(true), createBlock(Fragment, null, renderList(unref(form).lines, (line, i) => {
								return openBlock(), createBlock("tr", { key: i }, [
									createVNode("td", null, [withDirectives(createVNode("select", {
										"onUpdate:modelValue": ($event) => line.ingredient_id = $event,
										class: "ui-input"
									}, [createVNode("option", { value: "" }, "Select…"), (openBlock(true), createBlock(Fragment, null, renderList(props.ingredients, (ing) => {
										return openBlock(), createBlock("option", {
											key: ing.id,
											value: ing.id
										}, toDisplayString(ing.name), 9, ["value"]);
									}), 128))], 8, ["onUpdate:modelValue"]), [[vModelSelect, line.ingredient_id]]), isDuplicate(line, i) ? (openBlock(), createBlock("span", {
										key: 0,
										class: "po__err"
									}, "Already listed above")) : createCommentVNode("", true)]),
									createVNode("td", null, [createVNode("div", { class: "po__qty" }, [withDirectives(createVNode("input", {
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
									]]), createVNode("span", { class: "po__unit" }, toDisplayString(unitOf(line.ingredient_id)), 1)])]),
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
									createVNode("td", { class: "po__right" }, [createVNode("strong", null, toDisplayString(fmt(lineTotal(line))), 1)]),
									createVNode("td", null, [createVNode("button", {
										class: "ui-btn ui-btn--danger ui-btn--sm",
										title: "Remove line",
										onClick: ($event) => removeLine(i)
									}, "×", 8, ["onClick"])])
								]);
							}), 128))]),
							unref(form).lines.length ? (openBlock(), createBlock("tfoot", { key: 0 }, [createVNode("tr", null, [
								createVNode("td", {
									colspan: "3",
									class: "po__right"
								}, [createVNode("strong", null, "Order Total")]),
								createVNode("td", { class: "po__right" }, [createVNode("strong", null, toDisplayString(fmt(orderTotal.value)), 1)]),
								createVNode("td")
							])])) : createCommentVNode("", true)
						]),
						unref(form).errors.lines ? (openBlock(), createBlock("p", {
							key: 1,
							class: "po__err"
						}, toDisplayString(unref(form).errors.lines), 1)) : createCommentVNode("", true),
						createVNode("button", {
							class: "ui-btn ui-btn--secondary ui-btn--sm po__add",
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
						createVNode("p", { class: "po__hint" }, " Saved as a draft — it commits nothing until you send it. Unit costs here are what you expect to pay; the price that actually values your stock is the one on the delivery invoice. ")
					];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(Modal_default, {
				modelValue: showView.value,
				"onUpdate:modelValue": ($event) => showView.value = $event,
				title: viewing.value?.po_number ?? "Purchase Order",
				width: "900px"
			}, {
				footer: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<button class="ui-btn ui-btn--ghost" data-v-25221502${_scopeId}>Close</button>`);
						if (viewing.value?.is_receivable && unref(can)("procurement.goods-receipts.create")) _push(ssrRenderComponent(unref(Link), {
							href: `/procurement/goods-receipts?po=${viewing.value.id}`,
							class: "ui-btn ui-btn--primary"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(`Receive Delivery`);
								else return [createTextVNode("Receive Delivery")];
							}),
							_: 1
						}, _parent, _scopeId));
						else _push(`<!---->`);
					} else return [createVNode("button", {
						class: "ui-btn ui-btn--ghost",
						onClick: ($event) => showView.value = false
					}, "Close", 8, ["onClick"]), viewing.value?.is_receivable && unref(can)("procurement.goods-receipts.create") ? (openBlock(), createBlock(unref(Link), {
						key: 0,
						href: `/procurement/goods-receipts?po=${viewing.value.id}`,
						class: "ui-btn ui-btn--primary"
					}, {
						default: withCtx(() => [createTextVNode("Receive Delivery")]),
						_: 1
					}, 8, ["href"])) : createCommentVNode("", true)];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						if (viewing.value) {
							_push(`<div data-v-25221502${_scopeId}><div class="po__meta" data-v-25221502${_scopeId}><div data-v-25221502${_scopeId}><span class="po__meta-label" data-v-25221502${_scopeId}>Vendor</span><span data-v-25221502${_scopeId}>${ssrInterpolate(viewing.value.vendor_name || "—")}</span></div><div data-v-25221502${_scopeId}><span class="po__meta-label" data-v-25221502${_scopeId}>Status</span><span class="${ssrRenderClass([statusBadge(viewing.value.status), "ui-badge"])}" data-v-25221502${_scopeId}>${ssrInterpolate(viewing.value.status_label)}</span></div><div data-v-25221502${_scopeId}><span class="po__meta-label" data-v-25221502${_scopeId}>Sent</span><span data-v-25221502${_scopeId}>${ssrInterpolate(fmtDate(viewing.value.ordered_at))}</span></div><div data-v-25221502${_scopeId}><span class="po__meta-label" data-v-25221502${_scopeId}>Expected</span><span class="${ssrRenderClass(viewing.value.is_overdue ? "po__neg" : "")}" data-v-25221502${_scopeId}>${ssrInterpolate(fmtDate(viewing.value.expected_at))}</span></div><div data-v-25221502${_scopeId}><span class="po__meta-label" data-v-25221502${_scopeId}>Total</span><span data-v-25221502${_scopeId}><strong data-v-25221502${_scopeId}>${ssrInterpolate(fmt(viewing.value.total))}</strong></span></div><div data-v-25221502${_scopeId}><span class="po__meta-label" data-v-25221502${_scopeId}>Outstanding</span><span class="${ssrRenderClass(viewing.value.outstanding_value > 0 ? "po__warn" : "")}" data-v-25221502${_scopeId}>${ssrInterpolate(fmt(viewing.value.outstanding_value))}</span></div></div><table class="po__table" data-v-25221502${_scopeId}><thead data-v-25221502${_scopeId}><tr data-v-25221502${_scopeId}><th data-v-25221502${_scopeId}>Ingredient</th><th class="po__right" data-v-25221502${_scopeId}>Ordered</th><th class="po__right" data-v-25221502${_scopeId}>Received</th><th class="po__right" data-v-25221502${_scopeId}>Outstanding</th><th class="po__right" data-v-25221502${_scopeId}>Unit Cost</th><th class="po__right" data-v-25221502${_scopeId}>Line Total</th></tr></thead><tbody data-v-25221502${_scopeId}><!--[-->`);
							ssrRenderList(viewing.value.lines, (line) => {
								_push(`<tr data-v-25221502${_scopeId}><td data-v-25221502${_scopeId}>${ssrInterpolate(line.name)}</td><td class="po__right" data-v-25221502${_scopeId}>${ssrInterpolate(qty(line.quantity))} ${ssrInterpolate(line.unit)}</td><td class="po__right" data-v-25221502${_scopeId}>${ssrInterpolate(qty(line.received_qty))}</td><td class="${ssrRenderClass([line.outstanding_qty > 0 ? "po__warn" : "po__muted", "po__right"])}" data-v-25221502${_scopeId}>${ssrInterpolate(qty(line.outstanding_qty))}</td><td class="po__right po__muted" data-v-25221502${_scopeId}>${ssrInterpolate(fmt(line.unit_cost))}</td><td class="po__right" data-v-25221502${_scopeId}><strong data-v-25221502${_scopeId}>${ssrInterpolate(fmt(line.line_total))}</strong></td></tr>`);
							});
							_push(`<!--]--></tbody></table>`);
							if (viewing.value.notes) _push(`<p class="po__notes" data-v-25221502${_scopeId}><span class="po__meta-label" data-v-25221502${_scopeId}>Notes</span>${ssrInterpolate(viewing.value.notes)}</p>`);
							else _push(`<!---->`);
							_push(`</div>`);
						} else _push(`<!---->`);
					} else return [viewing.value ? (openBlock(), createBlock("div", { key: 0 }, [
						createVNode("div", { class: "po__meta" }, [
							createVNode("div", null, [createVNode("span", { class: "po__meta-label" }, "Vendor"), createVNode("span", null, toDisplayString(viewing.value.vendor_name || "—"), 1)]),
							createVNode("div", null, [createVNode("span", { class: "po__meta-label" }, "Status"), createVNode("span", { class: ["ui-badge", statusBadge(viewing.value.status)] }, toDisplayString(viewing.value.status_label), 3)]),
							createVNode("div", null, [createVNode("span", { class: "po__meta-label" }, "Sent"), createVNode("span", null, toDisplayString(fmtDate(viewing.value.ordered_at)), 1)]),
							createVNode("div", null, [createVNode("span", { class: "po__meta-label" }, "Expected"), createVNode("span", { class: viewing.value.is_overdue ? "po__neg" : "" }, toDisplayString(fmtDate(viewing.value.expected_at)), 3)]),
							createVNode("div", null, [createVNode("span", { class: "po__meta-label" }, "Total"), createVNode("span", null, [createVNode("strong", null, toDisplayString(fmt(viewing.value.total)), 1)])]),
							createVNode("div", null, [createVNode("span", { class: "po__meta-label" }, "Outstanding"), createVNode("span", { class: viewing.value.outstanding_value > 0 ? "po__warn" : "" }, toDisplayString(fmt(viewing.value.outstanding_value)), 3)])
						]),
						createVNode("table", { class: "po__table" }, [createVNode("thead", null, [createVNode("tr", null, [
							createVNode("th", null, "Ingredient"),
							createVNode("th", { class: "po__right" }, "Ordered"),
							createVNode("th", { class: "po__right" }, "Received"),
							createVNode("th", { class: "po__right" }, "Outstanding"),
							createVNode("th", { class: "po__right" }, "Unit Cost"),
							createVNode("th", { class: "po__right" }, "Line Total")
						])]), createVNode("tbody", null, [(openBlock(true), createBlock(Fragment, null, renderList(viewing.value.lines, (line) => {
							return openBlock(), createBlock("tr", { key: line.id }, [
								createVNode("td", null, toDisplayString(line.name), 1),
								createVNode("td", { class: "po__right" }, toDisplayString(qty(line.quantity)) + " " + toDisplayString(line.unit), 1),
								createVNode("td", { class: "po__right" }, toDisplayString(qty(line.received_qty)), 1),
								createVNode("td", { class: ["po__right", line.outstanding_qty > 0 ? "po__warn" : "po__muted"] }, toDisplayString(qty(line.outstanding_qty)), 3),
								createVNode("td", { class: "po__right po__muted" }, toDisplayString(fmt(line.unit_cost)), 1),
								createVNode("td", { class: "po__right" }, [createVNode("strong", null, toDisplayString(fmt(line.line_total)), 1)])
							]);
						}), 128))])]),
						viewing.value.notes ? (openBlock(), createBlock("p", {
							key: 0,
							class: "po__notes"
						}, [createVNode("span", { class: "po__meta-label" }, "Notes"), createTextVNode(toDisplayString(viewing.value.notes), 1)])) : createCommentVNode("", true)
					])) : createCommentVNode("", true)];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(Modal_default, {
				modelValue: showCancel.value,
				"onUpdate:modelValue": ($event) => showCancel.value = $event,
				title: "Cancel Purchase Order",
				width: "520px"
			}, {
				footer: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<button class="ui-btn ui-btn--ghost" data-v-25221502${_scopeId}>Keep Open</button><button class="ui-btn ui-btn--danger"${ssrIncludeBooleanAttr(unref(cancelForm).processing) ? " disabled" : ""} data-v-25221502${_scopeId}>Cancel Order</button>`);
					else return [createVNode("button", {
						class: "ui-btn ui-btn--ghost",
						onClick: ($event) => showCancel.value = false
					}, "Keep Open", 8, ["onClick"]), createVNode("button", {
						class: "ui-btn ui-btn--danger",
						disabled: unref(cancelForm).processing,
						onClick: saveCancel
					}, "Cancel Order", 8, ["disabled"])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<p class="po__hint" data-v-25221502${_scopeId}> Cancelling abandons whatever is still outstanding on ${ssrInterpolate(cancelling.value?.po_number)}. Anything already delivered keeps its stock and its cost — this only closes the order. </p>`);
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(cancelForm).reason,
							"onUpdate:modelValue": ($event) => unref(cancelForm).reason = $event,
							label: "Reason",
							placeholder: "e.g. Vendor out of stock",
							error: unref(cancelForm).errors.reason
						}, null, _parent, _scopeId));
					} else return [createVNode("p", { class: "po__hint" }, " Cancelling abandons whatever is still outstanding on " + toDisplayString(cancelling.value?.po_number) + ". Anything already delivered keeps its stock and its cost — this only closes the order. ", 1), createVNode(_sfc_main$2, {
						modelValue: unref(cancelForm).reason,
						"onUpdate:modelValue": ($event) => unref(cancelForm).reason = $event,
						label: "Reason",
						placeholder: "e.g. Vendor out of stock",
						error: unref(cancelForm).errors.reason
					}, null, 8, [
						"modelValue",
						"onUpdate:modelValue",
						"error"
					])];
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
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/pages/Procurement/PurchaseOrders.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var PurchaseOrders_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-25221502"]]);
//#endregion
export { PurchaseOrders_default as default };
