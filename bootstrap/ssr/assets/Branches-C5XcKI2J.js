import { n as confirmDialog } from "./useNotifications-CvzCW6Mx.js";
import { n as usePermissions, t as AdminLayout_default } from "./AdminLayout-DfQNjfKt.js";
import { t as _sfc_main$1 } from "./PageHeader-D0aRDn5C.js";
import { t as DataTable_default } from "./DataTable-DQdMyI8_.js";
import { t as Pagination_default } from "./Pagination-CHJUzz_w.js";
import { t as Modal_default } from "./Modal-CpmFAnsY.js";
import { t as _sfc_main$2 } from "./FormField-Doe8oR1s.js";
import { computed, createBlock, createCommentVNode, createVNode, mergeProps, openBlock, ref, toDisplayString, unref, useSSRContext, watch, withCtx } from "vue";
import { router, useForm } from "@inertiajs/vue3";
import { ssrIncludeBooleanAttr, ssrInterpolate, ssrRenderAttr, ssrRenderAttrs, ssrRenderClass, ssrRenderComponent } from "vue/server-renderer";
//#region resources/js/pages/Branches.vue
var _sfc_main = /*@__PURE__*/ Object.assign({ layout: AdminLayout_default }, {
	__name: "Branches",
	__ssrInlineRender: true,
	props: {
		branches: {
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
				key: "address",
				label: "Address"
			},
			{
				key: "phone",
				label: "Phone"
			},
			{
				key: "manager_name",
				label: "Manager"
			},
			{
				key: "status",
				label: "Status"
			}
		];
		const rows = computed(() => props.branches?.data ?? []);
		const search = ref(props.filters?.search ?? "");
		let searchTimer = null;
		watch(search, (value) => {
			clearTimeout(searchTimer);
			searchTimer = setTimeout(() => {
				router.get("/branches", { search: value || void 0 }, {
					preserveState: true,
					preserveScroll: true,
					replace: true,
					only: ["branches", "filters"]
				});
			}, 300);
		});
		const showModal = ref(false);
		const form = useForm({
			id: null,
			name: "",
			address: "",
			phone: "",
			manager_name: "",
			status: true,
			latitude: "",
			longitude: "",
			attendance_radius_meters: 100,
			attendance_start_time: ""
		});
		const resetForm = () => {
			form.id = null;
			form.name = "";
			form.address = "";
			form.phone = "";
			form.manager_name = "";
			form.status = true;
			form.latitude = "";
			form.longitude = "";
			form.attendance_radius_meters = 100;
			form.attendance_start_time = "";
			form.clearErrors();
		};
		const openModal = () => {
			resetForm();
			showModal.value = true;
		};
		const closeModal = () => {
			showModal.value = false;
			resetForm();
		};
		const editBranch = (branch) => {
			resetForm();
			form.id = branch.id;
			form.name = branch.name ?? "";
			form.address = branch.address ?? "";
			form.phone = branch.phone ?? "";
			form.manager_name = branch.manager_name ?? "";
			form.status = Boolean(Number(branch.status));
			form.latitude = branch.latitude ?? "";
			form.longitude = branch.longitude ?? "";
			form.attendance_radius_meters = branch.attendance_radius_meters ?? 100;
			form.attendance_start_time = branch.attendance_start_time?.slice(0, 5) ?? "";
			showModal.value = true;
		};
		const saveBranch = () => {
			const options = {
				preserveScroll: true,
				onSuccess: () => {
					showModal.value = false;
					resetForm();
				}
			};
			if (form.id) form.put(`/branches/${form.id}`, options);
			else form.post("/branches", options);
		};
		const deleteBranch = async (id) => {
			if (!await confirmDialog("Delete this branch? Branches with associated records cannot be deleted.")) return;
			router.delete(`/branches/${id}`, { preserveScroll: true });
		};
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "page" }, _attrs))}>`);
			_push(ssrRenderComponent(_sfc_main$1, {
				title: "Branches",
				subtitle: "Manage your restaurant locations and attendance settings."
			}, {
				actions: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						if (unref(can)("branches.create")) _push(`<button class="ui-btn ui-btn--primary"${_scopeId}> + Add Branch </button>`);
						else _push(`<!---->`);
					} else return [unref(can)("branches.create") ? (openBlock(), createBlock("button", {
						key: 0,
						class: "ui-btn ui-btn--primary",
						onClick: openModal
					}, " + Add Branch ")) : createCommentVNode("", true)];
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
				"search-placeholder": "Search branches...",
				"empty-text": "No branches found."
			}, {
				"cell:status": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) _push(`<span class="${ssrRenderClass([value ? "ui-badge--success" : "ui-badge--muted", "ui-badge"])}"${_scopeId}>${ssrInterpolate(value ? "Active" : "Inactive")}</span>`);
					else return [createVNode("span", { class: ["ui-badge", value ? "ui-badge--success" : "ui-badge--muted"] }, toDisplayString(value ? "Active" : "Inactive"), 3)];
				}),
				actions: withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						if (unref(can)("branches.update")) _push(`<button class="ui-btn ui-btn--ghost ui-btn--sm"${_scopeId}> Edit </button>`);
						else _push(`<!---->`);
						if (unref(can)("branches.delete")) _push(`<button class="ui-btn ui-btn--danger ui-btn--sm"${_scopeId}> Delete </button>`);
						else _push(`<!---->`);
					} else return [unref(can)("branches.update") ? (openBlock(), createBlock("button", {
						key: 0,
						class: "ui-btn ui-btn--ghost ui-btn--sm",
						onClick: ($event) => editBranch(row)
					}, " Edit ", 8, ["onClick"])) : createCommentVNode("", true), unref(can)("branches.delete") ? (openBlock(), createBlock("button", {
						key: 1,
						class: "ui-btn ui-btn--danger ui-btn--sm",
						onClick: ($event) => deleteBranch(row.id)
					}, " Delete ", 8, ["onClick"])) : createCommentVNode("", true)];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(Pagination_default, {
				paginator: props.branches,
				only: ["branches"]
			}, null, _parent));
			_push(ssrRenderComponent(Modal_default, {
				modelValue: showModal.value,
				"onUpdate:modelValue": ($event) => showModal.value = $event,
				title: unref(form).id ? "Edit Branch" : "Add Branch",
				width: "640px"
			}, {
				footer: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<button type="button" class="ui-btn ui-btn--ghost"${_scopeId}> Cancel </button><button type="button" class="ui-btn ui-btn--primary"${ssrIncludeBooleanAttr(unref(form).processing) ? " disabled" : ""}${_scopeId}>${ssrInterpolate(unref(form).processing ? "Saving..." : "Save")}</button>`);
					else return [createVNode("button", {
						type: "button",
						class: "ui-btn ui-btn--ghost",
						onClick: closeModal
					}, " Cancel "), createVNode("button", {
						type: "button",
						class: "ui-btn ui-btn--primary",
						disabled: unref(form).processing,
						onClick: saveBranch
					}, toDisplayString(unref(form).processing ? "Saving..." : "Save"), 9, ["disabled"])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).name,
							"onUpdate:modelValue": ($event) => unref(form).name = $event,
							label: "Name",
							placeholder: "Branch name",
							error: unref(form).errors.name
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).address,
							"onUpdate:modelValue": ($event) => unref(form).address = $event,
							label: "Address",
							placeholder: "Street address",
							error: unref(form).errors.address
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).phone,
							"onUpdate:modelValue": ($event) => unref(form).phone = $event,
							label: "Phone",
							type: "tel",
							placeholder: "Contact number",
							error: unref(form).errors.phone
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).manager_name,
							"onUpdate:modelValue": ($event) => unref(form).manager_name = $event,
							label: "Manager",
							placeholder: "Manager name",
							error: unref(form).errors.manager_name
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).status,
							"onUpdate:modelValue": ($event) => unref(form).status = $event,
							label: "Status",
							type: "select",
							error: unref(form).errors.status
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(`<option${ssrRenderAttr("value", true)}${_scopeId}>Active</option><option${ssrRenderAttr("value", false)}${_scopeId}>Inactive</option>`);
								else return [createVNode("option", { value: true }, "Active"), createVNode("option", { value: false }, "Inactive")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).latitude,
							"onUpdate:modelValue": ($event) => unref(form).latitude = $event,
							label: "Attendance latitude",
							type: "number",
							step: "any",
							placeholder: "Optional",
							error: unref(form).errors.latitude
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).longitude,
							"onUpdate:modelValue": ($event) => unref(form).longitude = $event,
							label: "Attendance longitude",
							type: "number",
							step: "any",
							placeholder: "Optional",
							error: unref(form).errors.longitude
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).attendance_radius_meters,
							"onUpdate:modelValue": ($event) => unref(form).attendance_radius_meters = $event,
							label: "Attendance radius (meters)",
							type: "number",
							error: unref(form).errors.attendance_radius_meters
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).attendance_start_time,
							"onUpdate:modelValue": ($event) => unref(form).attendance_start_time = $event,
							label: "Attendance start time",
							type: "time",
							error: unref(form).errors.attendance_start_time
						}, null, _parent, _scopeId));
					} else return [
						createVNode(_sfc_main$2, {
							modelValue: unref(form).name,
							"onUpdate:modelValue": ($event) => unref(form).name = $event,
							label: "Name",
							placeholder: "Branch name",
							error: unref(form).errors.name
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode(_sfc_main$2, {
							modelValue: unref(form).address,
							"onUpdate:modelValue": ($event) => unref(form).address = $event,
							label: "Address",
							placeholder: "Street address",
							error: unref(form).errors.address
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode(_sfc_main$2, {
							modelValue: unref(form).phone,
							"onUpdate:modelValue": ($event) => unref(form).phone = $event,
							label: "Phone",
							type: "tel",
							placeholder: "Contact number",
							error: unref(form).errors.phone
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode(_sfc_main$2, {
							modelValue: unref(form).manager_name,
							"onUpdate:modelValue": ($event) => unref(form).manager_name = $event,
							label: "Manager",
							placeholder: "Manager name",
							error: unref(form).errors.manager_name
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode(_sfc_main$2, {
							modelValue: unref(form).status,
							"onUpdate:modelValue": ($event) => unref(form).status = $event,
							label: "Status",
							type: "select",
							error: unref(form).errors.status
						}, {
							default: withCtx(() => [createVNode("option", { value: true }, "Active"), createVNode("option", { value: false }, "Inactive")]),
							_: 1
						}, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode(_sfc_main$2, {
							modelValue: unref(form).latitude,
							"onUpdate:modelValue": ($event) => unref(form).latitude = $event,
							label: "Attendance latitude",
							type: "number",
							step: "any",
							placeholder: "Optional",
							error: unref(form).errors.latitude
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode(_sfc_main$2, {
							modelValue: unref(form).longitude,
							"onUpdate:modelValue": ($event) => unref(form).longitude = $event,
							label: "Attendance longitude",
							type: "number",
							step: "any",
							placeholder: "Optional",
							error: unref(form).errors.longitude
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode(_sfc_main$2, {
							modelValue: unref(form).attendance_radius_meters,
							"onUpdate:modelValue": ($event) => unref(form).attendance_radius_meters = $event,
							label: "Attendance radius (meters)",
							type: "number",
							error: unref(form).errors.attendance_radius_meters
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode(_sfc_main$2, {
							modelValue: unref(form).attendance_start_time,
							"onUpdate:modelValue": ($event) => unref(form).attendance_start_time = $event,
							label: "Attendance start time",
							type: "time",
							error: unref(form).errors.attendance_start_time
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
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/pages/Branches.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
//#endregion
export { _sfc_main as default };
