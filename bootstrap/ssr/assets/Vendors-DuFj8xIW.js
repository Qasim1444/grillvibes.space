import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-BOaGB7Aw.js";
import { n as usePermissions, t as AdminLayout_default } from "./AdminLayout-DSJnk4YL.js";
import { t as _sfc_main$1 } from "./PageHeader-D0aRDn5C.js";
import { t as DataTable_default } from "./DataTable-BHCUCuvd.js";
import { t as Pagination_default } from "./Pagination-h4WEvndd.js";
import { t as Modal_default } from "./Modal-DhESI6xO.js";
import { t as _sfc_main$2 } from "./FormField-Doe8oR1s.js";
import { computed, createBlock, createCommentVNode, createVNode, mergeProps, openBlock, ref, toDisplayString, unref, useSSRContext, watch, withCtx } from "vue";
import { router, useForm } from "@inertiajs/vue3";
import { ssrIncludeBooleanAttr, ssrInterpolate, ssrLooseContain, ssrLooseEqual, ssrRenderAttr, ssrRenderAttrs, ssrRenderComponent, ssrRenderStyle } from "vue/server-renderer";
//#region resources/js/pages/Procurement/Vendors.vue
var _sfc_main = /*@__PURE__*/ Object.assign({ layout: AdminLayout_default }, {
	__name: "Vendors",
	__ssrInlineRender: true,
	props: {
		vendors: {
			type: Object,
			default: () => ({ data: [] })
		},
		summary: {
			type: Object,
			default: () => ({
				total: 0,
				active: 0,
				with_open_orders: 0,
				spend_this_month: 0
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
				label: "Vendor"
			},
			{
				key: "contact",
				label: "Contact"
			},
			{
				key: "payment_terms",
				label: "Terms"
			},
			{
				key: "purchase_orders",
				label: "Orders"
			},
			{
				key: "received_total",
				label: "Received"
			}
		];
		const vendors = computed(() => props.vendors?.data ?? []);
		const search = ref(props.filters?.search ?? "");
		const statusFilter = ref(props.filters?.status ?? "");
		let timer = null;
		const reload = () => router.get("/procurement/vendors", {
			search: search.value || void 0,
			status: statusFilter.value || void 0
		}, {
			preserveState: true,
			preserveScroll: true,
			replace: true,
			only: [
				"vendors",
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
			contact_person: "",
			phone: "",
			email: "",
			address: "",
			tax_number: "",
			payment_terms: "",
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
			Object.assign(form, {
				id: row.id,
				name: row.name ?? "",
				contact_person: row.contact_person ?? "",
				phone: row.phone ?? "",
				email: row.email ?? "",
				address: row.address ?? "",
				tax_number: row.tax_number ?? "",
				payment_terms: row.payment_terms ?? "",
				is_active: row.is_active ?? true,
				notes: row.notes ?? ""
			});
			form.clearErrors();
			showModal.value = true;
		};
		const save = () => {
			const opts = {
				preserveScroll: true,
				onSuccess: () => showModal.value = false
			};
			if (form.id) form.put(`/procurement/vendors/${form.id}`, opts);
			else form.post("/procurement/vendors", opts);
		};
		const del = (row) => {
			const warning = row.open_purchase_orders > 0 ? `${row.name} has ${row.open_purchase_orders} purchase order(s) still open — receive or cancel them first.` : `Delete ${row.name}? Past orders and receipts keep the name.`;
			if (!confirm(warning)) return;
			router.delete(`/procurement/vendors/${row.id}`, { preserveScroll: true });
		};
		const fmt = (v) => "Rs " + Number(v || 0).toLocaleString("en-PK", { minimumFractionDigits: 2 });
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "page" }, _attrs))} data-v-ca10fd54>`);
			_push(ssrRenderComponent(_sfc_main$1, {
				title: "Vendors",
				subtitle: "Who you buy from. These suppliers are shared with Expenses, Assets and Maintenance, so retiring one keeps its name readable on everything already booked against it."
			}, {
				actions: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						if (unref(can)("procurement.vendors.create")) _push(`<button class="ui-btn ui-btn--primary" data-v-ca10fd54${_scopeId}> + New Vendor </button>`);
						else _push(`<!---->`);
					} else return [unref(can)("procurement.vendors.create") ? (openBlock(), createBlock("button", {
						key: 0,
						class: "ui-btn ui-btn--primary",
						onClick: openCreate
					}, " + New Vendor ")) : createCommentVNode("", true)];
				}),
				_: 1
			}, _parent));
			_push(`<div class="vd__kpis" data-v-ca10fd54><div class="vd__kpi vd__kpi--info" data-v-ca10fd54><span class="vd__kpi-label" data-v-ca10fd54>Vendors</span><span class="vd__kpi-val" data-v-ca10fd54>${ssrInterpolate(props.summary.total)}</span><span class="vd__kpi-sub" data-v-ca10fd54>${ssrInterpolate(props.summary.active)} active</span></div><div class="vd__kpi vd__kpi--warn" data-v-ca10fd54><span class="vd__kpi-label" data-v-ca10fd54>Awaiting Delivery</span><span class="vd__kpi-val" data-v-ca10fd54>${ssrInterpolate(props.summary.with_open_orders)}</span><span class="vd__kpi-sub" data-v-ca10fd54>vendors with open orders</span></div><div class="vd__kpi vd__kpi--ok" data-v-ca10fd54><span class="vd__kpi-label" data-v-ca10fd54>Received This Month</span><span class="vd__kpi-val" data-v-ca10fd54>${ssrInterpolate(fmt(props.summary.spend_this_month))}</span><span class="vd__kpi-sub" data-v-ca10fd54>goods actually delivered</span></div></div><div class="vd__filters" data-v-ca10fd54><input${ssrRenderAttr("value", search.value)} class="ui-input vd__search" placeholder="Search name / contact / phone / email…" data-v-ca10fd54><select class="ui-input" style="${ssrRenderStyle({ "width": "160px" })}" data-v-ca10fd54><option value="" data-v-ca10fd54${ssrIncludeBooleanAttr(Array.isArray(statusFilter.value) ? ssrLooseContain(statusFilter.value, "") : ssrLooseEqual(statusFilter.value, "")) ? " selected" : ""}>All Statuses</option><option value="active" data-v-ca10fd54${ssrIncludeBooleanAttr(Array.isArray(statusFilter.value) ? ssrLooseContain(statusFilter.value, "active") : ssrLooseEqual(statusFilter.value, "active")) ? " selected" : ""}>Active</option><option value="inactive" data-v-ca10fd54${ssrIncludeBooleanAttr(Array.isArray(statusFilter.value) ? ssrLooseContain(statusFilter.value, "inactive") : ssrLooseEqual(statusFilter.value, "inactive")) ? " selected" : ""}>Inactive</option></select></div>`);
			_push(ssrRenderComponent(DataTable_default, {
				columns,
				rows: vendors.value,
				index: "",
				"empty-text": "No vendors yet. Add a supplier before raising a purchase order."
			}, {
				"cell:name": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<strong data-v-ca10fd54${_scopeId}>${ssrInterpolate(row.name)}</strong>`);
						if (!row.is_active) _push(`<span class="ui-badge ui-badge--muted vd__pill" data-v-ca10fd54${_scopeId}>Inactive</span>`);
						else _push(`<!---->`);
						if (row.contact_person) _push(`<span class="vd__sub" data-v-ca10fd54${_scopeId}>${ssrInterpolate(row.contact_person)}</span>`);
						else _push(`<!---->`);
					} else return [
						createVNode("strong", null, toDisplayString(row.name), 1),
						!row.is_active ? (openBlock(), createBlock("span", {
							key: 0,
							class: "ui-badge ui-badge--muted vd__pill"
						}, "Inactive")) : createCommentVNode("", true),
						row.contact_person ? (openBlock(), createBlock("span", {
							key: 1,
							class: "vd__sub"
						}, toDisplayString(row.contact_person), 1)) : createCommentVNode("", true)
					];
				}),
				"cell:contact": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						if (row.phone) _push(`<span class="vd__block" data-v-ca10fd54${_scopeId}>${ssrInterpolate(row.phone)}</span>`);
						else _push(`<!---->`);
						if (row.email) _push(`<span class="vd__block vd__muted" data-v-ca10fd54${_scopeId}>${ssrInterpolate(row.email)}</span>`);
						else _push(`<!---->`);
						if (!row.phone && !row.email) _push(`<span class="vd__muted" data-v-ca10fd54${_scopeId}>—</span>`);
						else _push(`<!---->`);
					} else return [
						row.phone ? (openBlock(), createBlock("span", {
							key: 0,
							class: "vd__block"
						}, toDisplayString(row.phone), 1)) : createCommentVNode("", true),
						row.email ? (openBlock(), createBlock("span", {
							key: 1,
							class: "vd__block vd__muted"
						}, toDisplayString(row.email), 1)) : createCommentVNode("", true),
						!row.phone && !row.email ? (openBlock(), createBlock("span", {
							key: 2,
							class: "vd__muted"
						}, "—")) : createCommentVNode("", true)
					];
				}),
				"cell:payment_terms": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) {
						if (value) _push(`<span data-v-ca10fd54${_scopeId}>${ssrInterpolate(value)}</span>`);
						else _push(`<span class="vd__muted" data-v-ca10fd54${_scopeId}>—</span>`);
					} else return [value ? (openBlock(), createBlock("span", { key: 0 }, toDisplayString(value), 1)) : (openBlock(), createBlock("span", {
						key: 1,
						class: "vd__muted"
					}, "—"))];
				}),
				"cell:purchase_orders": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<span data-v-ca10fd54${_scopeId}>${ssrInterpolate(row.purchase_orders)}</span>`);
						if (row.open_purchase_orders > 0) _push(`<span class="ui-badge ui-badge--warning vd__pill" data-v-ca10fd54${_scopeId}>${ssrInterpolate(row.open_purchase_orders)} open </span>`);
						else _push(`<!---->`);
					} else return [createVNode("span", null, toDisplayString(row.purchase_orders), 1), row.open_purchase_orders > 0 ? (openBlock(), createBlock("span", {
						key: 0,
						class: "ui-badge ui-badge--warning vd__pill"
					}, toDisplayString(row.open_purchase_orders) + " open ", 1)) : createCommentVNode("", true)];
				}),
				"cell:received_total": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) _push(`<strong data-v-ca10fd54${_scopeId}>${ssrInterpolate(fmt(row.received_total))}</strong><span class="vd__sub" data-v-ca10fd54${_scopeId}>${ssrInterpolate(row.goods_receipts)} delivery(s)</span>`);
					else return [createVNode("strong", null, toDisplayString(fmt(row.received_total)), 1), createVNode("span", { class: "vd__sub" }, toDisplayString(row.goods_receipts) + " delivery(s)", 1)];
				}),
				actions: withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						if (unref(can)("procurement.vendors.update")) _push(`<button class="ui-btn ui-btn--ghost ui-btn--sm" data-v-ca10fd54${_scopeId}>Edit</button>`);
						else _push(`<!---->`);
						if (unref(can)("procurement.vendors.delete")) _push(`<button class="ui-btn ui-btn--danger ui-btn--sm" data-v-ca10fd54${_scopeId}>Delete</button>`);
						else _push(`<!---->`);
					} else return [unref(can)("procurement.vendors.update") ? (openBlock(), createBlock("button", {
						key: 0,
						class: "ui-btn ui-btn--ghost ui-btn--sm",
						onClick: ($event) => openEdit(row)
					}, "Edit", 8, ["onClick"])) : createCommentVNode("", true), unref(can)("procurement.vendors.delete") ? (openBlock(), createBlock("button", {
						key: 1,
						class: "ui-btn ui-btn--danger ui-btn--sm",
						onClick: ($event) => del(row)
					}, "Delete", 8, ["onClick"])) : createCommentVNode("", true)];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(Pagination_default, {
				paginator: props.vendors,
				only: ["vendors", "summary"]
			}, null, _parent));
			_push(ssrRenderComponent(Modal_default, {
				modelValue: showModal.value,
				"onUpdate:modelValue": ($event) => showModal.value = $event,
				title: unref(form).id ? "Edit Vendor" : "New Vendor",
				width: "680px"
			}, {
				footer: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<button class="ui-btn ui-btn--ghost" data-v-ca10fd54${_scopeId}>Cancel</button><button class="ui-btn ui-btn--primary"${ssrIncludeBooleanAttr(unref(form).processing) ? " disabled" : ""} data-v-ca10fd54${_scopeId}>Save</button>`);
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
							label: "Vendor Name *",
							placeholder: "e.g. Metro Cash & Carry",
							error: unref(form).errors.name
						}, null, _parent, _scopeId));
						_push(`<div class="form-grid-2" data-v-ca10fd54${_scopeId}>`);
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).contact_person,
							"onUpdate:modelValue": ($event) => unref(form).contact_person = $event,
							label: "Contact Person",
							error: unref(form).errors.contact_person
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).phone,
							"onUpdate:modelValue": ($event) => unref(form).phone = $event,
							label: "Phone",
							error: unref(form).errors.phone
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).email,
							"onUpdate:modelValue": ($event) => unref(form).email = $event,
							label: "Email",
							type: "email",
							error: unref(form).errors.email
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).tax_number,
							"onUpdate:modelValue": ($event) => unref(form).tax_number = $event,
							label: "NTN / Tax Number",
							error: unref(form).errors.tax_number
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).payment_terms,
							"onUpdate:modelValue": ($event) => unref(form).payment_terms = $event,
							label: "Payment Terms",
							placeholder: "e.g. Net 30",
							error: unref(form).errors.payment_terms
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).is_active,
							"onUpdate:modelValue": ($event) => unref(form).is_active = $event,
							label: "Status *",
							type: "select",
							error: unref(form).errors.is_active
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(`<option${ssrRenderAttr("value", true)} data-v-ca10fd54${_scopeId}>Active</option><option${ssrRenderAttr("value", false)} data-v-ca10fd54${_scopeId}>Inactive</option>`);
								else return [createVNode("option", { value: true }, "Active"), createVNode("option", { value: false }, "Inactive")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(`</div>`);
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).address,
							"onUpdate:modelValue": ($event) => unref(form).address = $event,
							label: "Address",
							type: "textarea",
							error: unref(form).errors.address
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).notes,
							"onUpdate:modelValue": ($event) => unref(form).notes = $event,
							label: "Notes",
							type: "textarea",
							error: unref(form).errors.notes
						}, null, _parent, _scopeId));
						_push(`<p class="vd__hint" data-v-ca10fd54${_scopeId}> Mark a vendor inactive to keep it off new purchase orders without touching its history. </p>`);
					} else return [
						createVNode(_sfc_main$2, {
							modelValue: unref(form).name,
							"onUpdate:modelValue": ($event) => unref(form).name = $event,
							label: "Vendor Name *",
							placeholder: "e.g. Metro Cash & Carry",
							error: unref(form).errors.name
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode("div", { class: "form-grid-2" }, [
							createVNode(_sfc_main$2, {
								modelValue: unref(form).contact_person,
								"onUpdate:modelValue": ($event) => unref(form).contact_person = $event,
								label: "Contact Person",
								error: unref(form).errors.contact_person
							}, null, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"error"
							]),
							createVNode(_sfc_main$2, {
								modelValue: unref(form).phone,
								"onUpdate:modelValue": ($event) => unref(form).phone = $event,
								label: "Phone",
								error: unref(form).errors.phone
							}, null, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"error"
							]),
							createVNode(_sfc_main$2, {
								modelValue: unref(form).email,
								"onUpdate:modelValue": ($event) => unref(form).email = $event,
								label: "Email",
								type: "email",
								error: unref(form).errors.email
							}, null, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"error"
							]),
							createVNode(_sfc_main$2, {
								modelValue: unref(form).tax_number,
								"onUpdate:modelValue": ($event) => unref(form).tax_number = $event,
								label: "NTN / Tax Number",
								error: unref(form).errors.tax_number
							}, null, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"error"
							]),
							createVNode(_sfc_main$2, {
								modelValue: unref(form).payment_terms,
								"onUpdate:modelValue": ($event) => unref(form).payment_terms = $event,
								label: "Payment Terms",
								placeholder: "e.g. Net 30",
								error: unref(form).errors.payment_terms
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
						createVNode(_sfc_main$2, {
							modelValue: unref(form).address,
							"onUpdate:modelValue": ($event) => unref(form).address = $event,
							label: "Address",
							type: "textarea",
							error: unref(form).errors.address
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
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
						createVNode("p", { class: "vd__hint" }, " Mark a vendor inactive to keep it off new purchase orders without touching its history. ")
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
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/pages/Procurement/Vendors.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var Vendors_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-ca10fd54"]]);
//#endregion
export { Vendors_default as default };
