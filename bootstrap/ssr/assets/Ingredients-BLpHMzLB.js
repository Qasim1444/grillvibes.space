import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-BOaGB7Aw.js";
import { n as usePermissions, t as AdminLayout_default } from "./AdminLayout-BhC2A239.js";
import { t as _sfc_main$1 } from "./PageHeader-D0aRDn5C.js";
import { t as DataTable_default } from "./DataTable-DQdMyI8_.js";
import { t as Pagination_default } from "./Pagination-CHJUzz_w.js";
import { t as Modal_default } from "./Modal-CpmFAnsY.js";
import { t as _sfc_main$2 } from "./FormField-Doe8oR1s.js";
import { Fragment, computed, createBlock, createCommentVNode, createTextVNode, createVNode, mergeProps, openBlock, ref, renderList, toDisplayString, unref, useSSRContext, watch, withCtx } from "vue";
import { router, useForm } from "@inertiajs/vue3";
import { ssrIncludeBooleanAttr, ssrInterpolate, ssrLooseContain, ssrLooseEqual, ssrRenderAttr, ssrRenderAttrs, ssrRenderClass, ssrRenderComponent, ssrRenderList, ssrRenderStyle } from "vue/server-renderer";
//#region resources/js/pages/Inventory/Ingredients.vue
var _sfc_main = /*@__PURE__*/ Object.assign({ layout: AdminLayout_default }, {
	__name: "Ingredients",
	__ssrInlineRender: true,
	props: {
		ingredients: {
			type: Object,
			default: () => ({ data: [] })
		},
		units: {
			type: Array,
			default: () => []
		},
		summary: {
			type: Object,
			default: () => ({
				total: 0,
				stock_value: 0,
				low_stock: 0,
				negative: 0
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
				key: "name",
				label: "Ingredient"
			},
			{
				key: "quantity",
				label: "On Hand"
			},
			{
				key: "reorder_level",
				label: "Reorder At"
			},
			{
				key: "average_cost",
				label: "Avg. Cost"
			},
			{
				key: "stock_value",
				label: "Value"
			},
			{
				key: "used_in_recipes",
				label: "Used In"
			}
		];
		const ingredients = computed(() => props.ingredients?.data ?? []);
		const search = ref(props.filters?.search ?? "");
		const statusFilter = ref(props.filters?.status ?? "");
		let timer = null;
		const reload = () => router.get("/inventory/ingredients", {
			search: search.value || void 0,
			status: statusFilter.value || void 0
		}, {
			preserveState: true,
			preserveScroll: true,
			replace: true,
			only: [
				"ingredients",
				"summary",
				"filters"
			]
		});
		watch([search, statusFilter], () => {
			clearTimeout(timer);
			timer = setTimeout(reload, 300);
		});
		const defaults = () => ({
			id: null,
			name: "",
			sku: "",
			unit: props.units[0] ?? "kg",
			reorder_level: 0,
			is_active: true,
			notes: ""
		});
		const showModal = ref(false);
		const form = useForm(defaults());
		const openCreate = () => {
			form.defaults(defaults());
			form.reset();
			form.clearErrors();
			showModal.value = true;
		};
		const openEdit = (row) => {
			form.id = row.id;
			form.name = row.name ?? "";
			form.sku = row.sku ?? "";
			form.unit = row.unit ?? "kg";
			form.reorder_level = row.reorder_level ?? 0;
			form.is_active = row.is_active ?? true;
			form.notes = row.notes ?? "";
			form.clearErrors();
			showModal.value = true;
		};
		const save = () => {
			const opts = {
				preserveScroll: true,
				onSuccess: () => showModal.value = false
			};
			if (form.id) form.put(`/inventory/ingredients/${form.id}`, opts);
			else form.post("/inventory/ingredients", opts);
		};
		const del = (row) => {
			const warning = row.used_in_recipes > 0 ? `${row.name} is used in ${row.used_in_recipes} recipe(s) and cannot be deleted until it is taken off them. Try anyway?` : `Delete ${row.name}? Its stock history is kept.`;
			if (!confirm(warning)) return;
			router.delete(`/inventory/ingredients/${row.id}`, { preserveScroll: true });
		};
		const qtyClass = (row) => row.quantity < 0 ? "ing__neg" : row.needs_reorder ? "ing__low" : "";
		const fmt = (v) => "Rs " + Number(v || 0).toLocaleString("en-PK", { minimumFractionDigits: 2 });
		const qty = (v) => Number(v || 0).toLocaleString("en-PK", { maximumFractionDigits: 4 });
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "page" }, _attrs))} data-v-040df54d>`);
			_push(ssrRenderComponent(_sfc_main$1, {
				title: "Ingredients",
				subtitle: "The raw materials recipes consume and procurement buys. Quantities and costs are shown here but owned by stock — they change only when a delivery is booked or a stock take is recorded."
			}, {
				actions: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						if (unref(can)("inventory.ingredients.create")) _push(`<button class="ui-btn ui-btn--primary" data-v-040df54d${_scopeId}> + New Ingredient </button>`);
						else _push(`<!---->`);
					} else return [unref(can)("inventory.ingredients.create") ? (openBlock(), createBlock("button", {
						key: 0,
						class: "ui-btn ui-btn--primary",
						onClick: openCreate
					}, " + New Ingredient ")) : createCommentVNode("", true)];
				}),
				_: 1
			}, _parent));
			_push(`<div class="ing__kpis" data-v-040df54d><div class="ing__kpi ing__kpi--info" data-v-040df54d><span class="ing__kpi-label" data-v-040df54d>Ingredients</span><span class="ing__kpi-val" data-v-040df54d>${ssrInterpolate(props.summary.total)}</span><span class="ing__kpi-sub" data-v-040df54d>on the master list</span></div><div class="ing__kpi ing__kpi--ok" data-v-040df54d><span class="ing__kpi-label" data-v-040df54d>Stock Value</span><span class="ing__kpi-val" data-v-040df54d>${ssrInterpolate(fmt(props.summary.stock_value))}</span><span class="ing__kpi-sub" data-v-040df54d>at this outlet</span></div><div class="ing__kpi ing__kpi--warn" data-v-040df54d><span class="ing__kpi-label" data-v-040df54d>Low Stock</span><span class="ing__kpi-val" data-v-040df54d>${ssrInterpolate(props.summary.low_stock)}</span><span class="ing__kpi-sub" data-v-040df54d>at or below reorder level</span></div><div class="${ssrRenderClass([props.summary.negative > 0 ? "ing__kpi--danger" : "", "ing__kpi"])}" data-v-040df54d><span class="ing__kpi-label" data-v-040df54d>Negative</span><span class="ing__kpi-val" data-v-040df54d>${ssrInterpolate(props.summary.negative)}</span><span class="ing__kpi-sub" data-v-040df54d>sold more than was received</span></div></div><div class="ing__filters" data-v-040df54d><input${ssrRenderAttr("value", search.value)} class="ui-input ing__search" placeholder="Search name / SKU…" data-v-040df54d><select class="ui-input" style="${ssrRenderStyle({ "width": "160px" })}" data-v-040df54d><option value="" data-v-040df54d${ssrIncludeBooleanAttr(Array.isArray(statusFilter.value) ? ssrLooseContain(statusFilter.value, "") : ssrLooseEqual(statusFilter.value, "")) ? " selected" : ""}>All Statuses</option><option value="active" data-v-040df54d${ssrIncludeBooleanAttr(Array.isArray(statusFilter.value) ? ssrLooseContain(statusFilter.value, "active") : ssrLooseEqual(statusFilter.value, "active")) ? " selected" : ""}>Active</option><option value="inactive" data-v-040df54d${ssrIncludeBooleanAttr(Array.isArray(statusFilter.value) ? ssrLooseContain(statusFilter.value, "inactive") : ssrLooseEqual(statusFilter.value, "inactive")) ? " selected" : ""}>Inactive</option></select></div>`);
			_push(ssrRenderComponent(DataTable_default, {
				columns,
				rows: ingredients.value,
				index: "",
				"empty-text": "No ingredients yet. Add the things your recipes are made of."
			}, {
				"cell:name": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<strong data-v-040df54d${_scopeId}>${ssrInterpolate(row.name)}</strong>`);
						if (row.sku) _push(`<span class="ing__code" data-v-040df54d${_scopeId}>${ssrInterpolate(row.sku)}</span>`);
						else _push(`<!---->`);
						if (!row.is_active) _push(`<span class="ui-badge ui-badge--muted ing__pill" data-v-040df54d${_scopeId}>Inactive</span>`);
						else _push(`<!---->`);
					} else return [
						createVNode("strong", null, toDisplayString(row.name), 1),
						row.sku ? (openBlock(), createBlock("span", {
							key: 0,
							class: "ing__code"
						}, toDisplayString(row.sku), 1)) : createCommentVNode("", true),
						!row.is_active ? (openBlock(), createBlock("span", {
							key: 1,
							class: "ui-badge ui-badge--muted ing__pill"
						}, "Inactive")) : createCommentVNode("", true)
					];
				}),
				"cell:quantity": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<span class="${ssrRenderClass(qtyClass(row))}" data-v-040df54d${_scopeId}>${ssrInterpolate(qty(row.quantity))} ${ssrInterpolate(row.unit)}</span>`);
						if (row.needs_reorder) _push(`<span class="ui-badge ui-badge--warning ing__pill" data-v-040df54d${_scopeId}>Reorder</span>`);
						else _push(`<!---->`);
					} else return [createVNode("span", { class: qtyClass(row) }, toDisplayString(qty(row.quantity)) + " " + toDisplayString(row.unit), 3), row.needs_reorder ? (openBlock(), createBlock("span", {
						key: 0,
						class: "ui-badge ui-badge--warning ing__pill"
					}, "Reorder")) : createCommentVNode("", true)];
				}),
				"cell:reorder_level": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) _push(`<span class="ing__muted" data-v-040df54d${_scopeId}>${ssrInterpolate(qty(row.reorder_level))} ${ssrInterpolate(row.unit)}</span>`);
					else return [createVNode("span", { class: "ing__muted" }, toDisplayString(qty(row.reorder_level)) + " " + toDisplayString(row.unit), 1)];
				}),
				"cell:average_cost": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						if (row.average_cost > 0) _push(`<span data-v-040df54d${_scopeId}>${ssrInterpolate(fmt(row.average_cost))} <span class="ing__muted" data-v-040df54d${_scopeId}>/ ${ssrInterpolate(row.unit)}</span></span>`);
						else _push(`<span class="ing__muted" title="No delivery has been booked yet, so there is no valuation." data-v-040df54d${_scopeId}>—</span>`);
					} else return [row.average_cost > 0 ? (openBlock(), createBlock("span", { key: 0 }, [createTextVNode(toDisplayString(fmt(row.average_cost)) + " ", 1), createVNode("span", { class: "ing__muted" }, "/ " + toDisplayString(row.unit), 1)])) : (openBlock(), createBlock("span", {
						key: 1,
						class: "ing__muted",
						title: "No delivery has been booked yet, so there is no valuation."
					}, "—"))];
				}),
				"cell:stock_value": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) _push(`<strong data-v-040df54d${_scopeId}>${ssrInterpolate(fmt(value))}</strong>`);
					else return [createVNode("strong", null, toDisplayString(fmt(value)), 1)];
				}),
				"cell:used_in_recipes": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) {
						if (value > 0) _push(`<span class="ui-badge ui-badge--info" data-v-040df54d${_scopeId}>${ssrInterpolate(value)} dish${ssrInterpolate(value === 1 ? "" : "es")}</span>`);
						else _push(`<span class="ing__muted" data-v-040df54d${_scopeId}>unused</span>`);
					} else return [value > 0 ? (openBlock(), createBlock("span", {
						key: 0,
						class: "ui-badge ui-badge--info"
					}, toDisplayString(value) + " dish" + toDisplayString(value === 1 ? "" : "es"), 1)) : (openBlock(), createBlock("span", {
						key: 1,
						class: "ing__muted"
					}, "unused"))];
				}),
				actions: withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						if (unref(can)("inventory.ingredients.update")) _push(`<button class="ui-btn ui-btn--ghost ui-btn--sm" data-v-040df54d${_scopeId}>Edit</button>`);
						else _push(`<!---->`);
						if (unref(can)("inventory.ingredients.delete")) _push(`<button class="ui-btn ui-btn--danger ui-btn--sm" data-v-040df54d${_scopeId}>Delete</button>`);
						else _push(`<!---->`);
					} else return [unref(can)("inventory.ingredients.update") ? (openBlock(), createBlock("button", {
						key: 0,
						class: "ui-btn ui-btn--ghost ui-btn--sm",
						onClick: ($event) => openEdit(row)
					}, "Edit", 8, ["onClick"])) : createCommentVNode("", true), unref(can)("inventory.ingredients.delete") ? (openBlock(), createBlock("button", {
						key: 1,
						class: "ui-btn ui-btn--danger ui-btn--sm",
						onClick: ($event) => del(row)
					}, "Delete", 8, ["onClick"])) : createCommentVNode("", true)];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(Pagination_default, {
				paginator: props.ingredients,
				only: ["ingredients", "summary"]
			}, null, _parent));
			_push(ssrRenderComponent(Modal_default, {
				modelValue: showModal.value,
				"onUpdate:modelValue": ($event) => showModal.value = $event,
				title: unref(form).id ? "Edit Ingredient" : "New Ingredient",
				width: "620px"
			}, {
				footer: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<button class="ui-btn ui-btn--ghost" data-v-040df54d${_scopeId}>Cancel</button><button class="ui-btn ui-btn--primary"${ssrIncludeBooleanAttr(unref(form).processing) ? " disabled" : ""} data-v-040df54d${_scopeId}>Save</button>`);
					else return [createVNode("button", {
						class: "ui-btn ui-btn--ghost",
						onClick: ($event) => showModal.value = false
					}, "Cancel", 8, ["onClick"]), createVNode("button", {
						class: "ui-btn ui-btn--primary",
						disabled: unref(form).processing,
						onClick: save
					}, "Save", 8, ["disabled"])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).name,
							"onUpdate:modelValue": ($event) => unref(form).name = $event,
							label: "Name *",
							placeholder: "e.g. Beef mince",
							error: unref(form).errors.name
						}, null, _parent, _scopeId));
						_push(`<div class="form-grid-2" data-v-040df54d${_scopeId}>`);
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).sku,
							"onUpdate:modelValue": ($event) => unref(form).sku = $event,
							label: "SKU / Code",
							placeholder: "Optional",
							error: unref(form).errors.sku
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).unit,
							"onUpdate:modelValue": ($event) => unref(form).unit = $event,
							label: "Unit of Measure *",
							type: "select",
							error: unref(form).errors.unit
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) {
									_push(`<!--[-->`);
									ssrRenderList(props.units, (u) => {
										_push(`<option${ssrRenderAttr("value", u)} data-v-040df54d${_scopeId}>${ssrInterpolate(u)}</option>`);
									});
									_push(`<!--]-->`);
								} else return [(openBlock(true), createBlock(Fragment, null, renderList(props.units, (u) => {
									return openBlock(), createBlock("option", {
										key: u,
										value: u
									}, toDisplayString(u), 9, ["value"]);
								}), 128))];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).reorder_level,
							"onUpdate:modelValue": ($event) => unref(form).reorder_level = $event,
							modelModifiers: { number: true },
							label: "Reorder Level *",
							type: "number",
							step: "0.0001",
							error: unref(form).errors.reorder_level
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).is_active,
							"onUpdate:modelValue": ($event) => unref(form).is_active = $event,
							label: "Status *",
							type: "select",
							error: unref(form).errors.is_active
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(`<option${ssrRenderAttr("value", true)} data-v-040df54d${_scopeId}>Active</option><option${ssrRenderAttr("value", false)} data-v-040df54d${_scopeId}>Inactive</option>`);
								else return [createVNode("option", { value: true }, "Active"), createVNode("option", { value: false }, "Inactive")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(`</div><p class="ing__hint" data-v-040df54d${_scopeId}> The unit is how this ingredient is counted, bought and used in recipes — pick it once and stick to it, because every quantity and cost in the system is expressed in it. Flag the ingredient when stock drops to the reorder level. </p>`);
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).notes,
							"onUpdate:modelValue": ($event) => unref(form).notes = $event,
							label: "Notes",
							type: "textarea",
							error: unref(form).errors.notes
						}, null, _parent, _scopeId));
					} else return [
						createVNode(_sfc_main$2, {
							modelValue: unref(form).name,
							"onUpdate:modelValue": ($event) => unref(form).name = $event,
							label: "Name *",
							placeholder: "e.g. Beef mince",
							error: unref(form).errors.name
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode("div", { class: "form-grid-2" }, [
							createVNode(_sfc_main$2, {
								modelValue: unref(form).sku,
								"onUpdate:modelValue": ($event) => unref(form).sku = $event,
								label: "SKU / Code",
								placeholder: "Optional",
								error: unref(form).errors.sku
							}, null, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"error"
							]),
							createVNode(_sfc_main$2, {
								modelValue: unref(form).unit,
								"onUpdate:modelValue": ($event) => unref(form).unit = $event,
								label: "Unit of Measure *",
								type: "select",
								error: unref(form).errors.unit
							}, {
								default: withCtx(() => [(openBlock(true), createBlock(Fragment, null, renderList(props.units, (u) => {
									return openBlock(), createBlock("option", {
										key: u,
										value: u
									}, toDisplayString(u), 9, ["value"]);
								}), 128))]),
								_: 1
							}, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"error"
							]),
							createVNode(_sfc_main$2, {
								modelValue: unref(form).reorder_level,
								"onUpdate:modelValue": ($event) => unref(form).reorder_level = $event,
								modelModifiers: { number: true },
								label: "Reorder Level *",
								type: "number",
								step: "0.0001",
								error: unref(form).errors.reorder_level
							}, null, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"error"
							]),
							createVNode(_sfc_main$2, {
								modelValue: unref(form).is_active,
								"onUpdate:modelValue": ($event) => unref(form).is_active = $event,
								label: "Status *",
								type: "select",
								error: unref(form).errors.is_active
							}, {
								default: withCtx(() => [createVNode("option", { value: true }, "Active"), createVNode("option", { value: false }, "Inactive")]),
								_: 1
							}, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"error"
							])
						]),
						createVNode("p", { class: "ing__hint" }, " The unit is how this ingredient is counted, bought and used in recipes — pick it once and stick to it, because every quantity and cost in the system is expressed in it. Flag the ingredient when stock drops to the reorder level. "),
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
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/pages/Inventory/Ingredients.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var Ingredients_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-040df54d"]]);
//#endregion
export { Ingredients_default as default };
