import { n as confirmDialog } from "./useNotifications-CvzCW6Mx.js";
import { n as usePermissions, t as AdminLayout_default } from "./AdminLayout-BhC2A239.js";
import { t as _sfc_main$1 } from "./PageHeader-D0aRDn5C.js";
import { t as DataTable_default } from "./DataTable-DQdMyI8_.js";
import { t as Pagination_default } from "./Pagination-CHJUzz_w.js";
import { t as Modal_default } from "./Modal-CpmFAnsY.js";
import { t as _sfc_main$2 } from "./FormField-Doe8oR1s.js";
import { computed, createBlock, createCommentVNode, createVNode, mergeProps, openBlock, ref, toDisplayString, unref, useSSRContext, watch, withCtx } from "vue";
import { router, useForm } from "@inertiajs/vue3";
import { ssrIncludeBooleanAttr, ssrInterpolate, ssrRenderAttrs, ssrRenderClass, ssrRenderComponent } from "vue/server-renderer";
//#region resources/js/pages/HR/Designations.vue
var _sfc_main = /*@__PURE__*/ Object.assign({ layout: AdminLayout_default }, {
	__name: "Designations",
	__ssrInlineRender: true,
	props: {
		designations: {
			type: Object,
			default: () => ({ data: [] })
		},
		filters: {
			type: Object,
			default: () => ({ search: "" })
		}
	},
	setup(__props) {
		const { can } = usePermissions();
		const props = __props;
		const columns = [
			{
				key: "name",
				label: "Name"
			},
			{
				key: "description",
				label: "Description"
			},
			{
				key: "employees_count",
				label: "Employees",
				width: "120px"
			}
		];
		const rows = computed(() => props.designations?.data ?? []);
		const search = ref(props.filters?.search ?? "");
		let searchTimer = null;
		watch(search, (value) => {
			clearTimeout(searchTimer);
			searchTimer = setTimeout(() => {
				router.get("/hr/designations", { search: value || void 0 }, {
					preserveState: true,
					preserveScroll: true,
					replace: true,
					only: ["designations", "filters"]
				});
			}, 300);
		});
		const showModal = ref(false);
		const form = useForm({
			id: null,
			name: "",
			description: ""
		});
		const openModal = () => {
			form.reset();
			form.clearErrors();
			showModal.value = true;
		};
		const editRow = (d) => {
			form.id = d.id;
			form.name = d.name;
			form.description = d.description ?? "";
			form.clearErrors();
			showModal.value = true;
		};
		const save = () => {
			const opts = {
				preserveScroll: true,
				onSuccess: () => showModal.value = false
			};
			if (form.id) form.put(`/hr/designations/${form.id}`, opts);
			else form.post("/hr/designations", opts);
		};
		const deleteRow = async (id) => {
			if (!await confirmDialog("Delete this designation?")) return;
			router.delete(`/hr/designations/${id}`, { preserveScroll: true });
		};
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "page" }, _attrs))}>`);
			_push(ssrRenderComponent(_sfc_main$1, {
				title: "Designations",
				subtitle: "Job titles employees are assigned to."
			}, {
				actions: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						if (unref(can)("hr.designations.create")) _push(`<button class="ui-btn ui-btn--primary"${_scopeId}> + Add Designation </button>`);
						else _push(`<!---->`);
					} else return [unref(can)("hr.designations.create") ? (openBlock(), createBlock("button", {
						key: 0,
						class: "ui-btn ui-btn--primary",
						onClick: openModal
					}, " + Add Designation ")) : createCommentVNode("", true)];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(DataTable_default, {
				columns,
				rows: rows.value,
				index: "",
				searchable: "",
				query: search.value,
				"onUpdate:query": ($event) => search.value = $event,
				"search-placeholder": "Search designations…",
				"empty-text": "No designations found."
			}, {
				"cell:employees_count": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) _push(`<span class="${ssrRenderClass([value > 0 ? "ui-badge--success" : "ui-badge--muted", "ui-badge"])}"${_scopeId}>${ssrInterpolate(value)}</span>`);
					else return [createVNode("span", { class: ["ui-badge", value > 0 ? "ui-badge--success" : "ui-badge--muted"] }, toDisplayString(value), 3)];
				}),
				actions: withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						if (unref(can)("hr.designations.update")) _push(`<button class="ui-btn ui-btn--ghost ui-btn--sm"${_scopeId}> Edit </button>`);
						else _push(`<!---->`);
						if (unref(can)("hr.designations.delete")) _push(`<button class="ui-btn ui-btn--danger ui-btn--sm"${_scopeId}> Delete </button>`);
						else _push(`<!---->`);
					} else return [unref(can)("hr.designations.update") ? (openBlock(), createBlock("button", {
						key: 0,
						class: "ui-btn ui-btn--ghost ui-btn--sm",
						onClick: ($event) => editRow(row)
					}, " Edit ", 8, ["onClick"])) : createCommentVNode("", true), unref(can)("hr.designations.delete") ? (openBlock(), createBlock("button", {
						key: 1,
						class: "ui-btn ui-btn--danger ui-btn--sm",
						onClick: ($event) => deleteRow(row.id)
					}, " Delete ", 8, ["onClick"])) : createCommentVNode("", true)];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(Pagination_default, {
				paginator: props.designations,
				only: ["designations"]
			}, null, _parent));
			_push(ssrRenderComponent(Modal_default, {
				modelValue: showModal.value,
				"onUpdate:modelValue": ($event) => showModal.value = $event,
				title: unref(form).id ? "Edit Designation" : "Add Designation"
			}, {
				footer: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<button class="ui-btn ui-btn--ghost"${_scopeId}>Cancel</button><button class="ui-btn ui-btn--primary"${ssrIncludeBooleanAttr(unref(form).processing) ? " disabled" : ""}${_scopeId}>Save</button>`);
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
							label: "Name",
							placeholder: "e.g. Cashier",
							error: unref(form).errors.name
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).description,
							"onUpdate:modelValue": ($event) => unref(form).description = $event,
							label: "Description",
							type: "textarea",
							placeholder: "What this role does",
							error: unref(form).errors.description
						}, null, _parent, _scopeId));
					} else return [createVNode(_sfc_main$2, {
						modelValue: unref(form).name,
						"onUpdate:modelValue": ($event) => unref(form).name = $event,
						label: "Name",
						placeholder: "e.g. Cashier",
						error: unref(form).errors.name
					}, null, 8, [
						"modelValue",
						"onUpdate:modelValue",
						"error"
					]), createVNode(_sfc_main$2, {
						modelValue: unref(form).description,
						"onUpdate:modelValue": ($event) => unref(form).description = $event,
						label: "Description",
						type: "textarea",
						placeholder: "What this role does",
						error: unref(form).errors.description
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
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/pages/HR/Designations.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
//#endregion
export { _sfc_main as default };
