import { n as usePermissions, t as AdminLayout_default } from "./AdminLayout-Dn6OtQae.js";
import { t as _sfc_main$1 } from "./PageHeader-D0aRDn5C.js";
import { t as DataTable_default } from "./DataTable-DQdMyI8_.js";
import { t as Pagination_default } from "./Pagination-CHJUzz_w.js";
import { t as Modal_default } from "./Modal-CpmFAnsY.js";
import { t as _sfc_main$2 } from "./FormField-Doe8oR1s.js";
import { Fragment, computed, createBlock, createCommentVNode, createTextVNode, createVNode, mergeProps, openBlock, ref, renderList, toDisplayString, unref, useSSRContext, watch, withCtx } from "vue";
import { router, useForm } from "@inertiajs/vue3";
import { ssrIncludeBooleanAttr, ssrInterpolate, ssrRenderAttr, ssrRenderAttrs, ssrRenderClass, ssrRenderComponent, ssrRenderList } from "vue/server-renderer";
//#region resources/js/pages/Places.vue
var _sfc_main = /*@__PURE__*/ Object.assign({ layout: AdminLayout_default }, {
	__name: "Places",
	__ssrInlineRender: true,
	props: {
		places: {
			type: Object,
			default: () => ({ data: [] })
		},
		filters: {
			type: Object,
			default: () => ({ search: "" })
		},
		branches: {
			type: Array,
			default: () => []
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
				key: "branch_name",
				label: "Branch"
			},
			{
				key: "status",
				label: "Status"
			}
		];
		const places = computed(() => {
			return props.places?.data ?? [];
		});
		const search = ref(props.filters?.search ?? "");
		let searchTimer = null;
		watch(search, (value) => {
			clearTimeout(searchTimer);
			searchTimer = setTimeout(() => {
				router.get("/places", { search: value || void 0 }, {
					preserveState: true,
					preserveScroll: true,
					replace: true,
					only: ["places", "filters"]
				});
			}, 300);
		});
		const showModal = ref(false);
		const form = useForm({
			id: null,
			name: "",
			branch_id: "",
			status: true
		});
		const resetForm = () => {
			form.id = null;
			form.name = "";
			form.branch_id = "";
			form.status = true;
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
		const editPlace = (place) => {
			resetForm();
			form.id = place.id;
			form.name = place.name ?? "";
			form.branch_id = place.branch_id ?? "";
			form.status = Boolean(Number(place.status));
			form.clearErrors();
			showModal.value = true;
		};
		const savePlace = () => {
			const options = {
				preserveScroll: true,
				onSuccess: () => {
					showModal.value = false;
					resetForm();
				}
			};
			if (form.id) form.put(`/places/${form.id}`, options);
			else form.post("/places", options);
		};
		const deletePlace = (id) => {
			if (!confirm("Are you sure?")) return;
			router.delete(`/places/${id}`, { preserveScroll: true });
		};
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "page" }, _attrs))}>`);
			_push(ssrRenderComponent(_sfc_main$1, {
				title: "Places",
				subtitle: "Manage service places / tables."
			}, {
				actions: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						if (unref(can)("places.create")) _push(`<button class="ui-btn ui-btn--primary"${_scopeId}> + Add Place </button>`);
						else _push(`<!---->`);
					} else return [unref(can)("places.create") ? (openBlock(), createBlock("button", {
						key: 0,
						class: "ui-btn ui-btn--primary",
						onClick: openModal
					}, " + Add Place ")) : createCommentVNode("", true)];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(DataTable_default, {
				columns,
				rows: places.value,
				index: "",
				searchable: "",
				query: search.value,
				"onUpdate:query": ($event) => search.value = $event,
				"search-placeholder": "Search places…",
				"empty-text": "No places found."
			}, {
				"cell:status": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) _push(`<span class="${ssrRenderClass([value ? "ui-badge--success" : "ui-badge--muted", "ui-badge"])}"${_scopeId}>${ssrInterpolate(value ? "Active" : "Inactive")}</span>`);
					else return [createVNode("span", { class: ["ui-badge", value ? "ui-badge--success" : "ui-badge--muted"] }, toDisplayString(value ? "Active" : "Inactive"), 3)];
				}),
				"cell:branch_name": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) _push(`${ssrInterpolate(value || "—")}`);
					else return [createTextVNode(toDisplayString(value || "—"), 1)];
				}),
				actions: withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						if (unref(can)("places.update")) _push(`<button class="ui-btn ui-btn--ghost ui-btn--sm"${_scopeId}> Edit </button>`);
						else _push(`<!---->`);
						if (unref(can)("places.delete")) _push(`<button class="ui-btn ui-btn--danger ui-btn--sm"${_scopeId}> Delete </button>`);
						else _push(`<!---->`);
					} else return [unref(can)("places.update") ? (openBlock(), createBlock("button", {
						key: 0,
						class: "ui-btn ui-btn--ghost ui-btn--sm",
						onClick: ($event) => editPlace(row)
					}, " Edit ", 8, ["onClick"])) : createCommentVNode("", true), unref(can)("places.delete") ? (openBlock(), createBlock("button", {
						key: 1,
						class: "ui-btn ui-btn--danger ui-btn--sm",
						onClick: ($event) => deletePlace(row.id)
					}, " Delete ", 8, ["onClick"])) : createCommentVNode("", true)];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(Pagination_default, {
				paginator: props.places,
				only: ["places"]
			}, null, _parent));
			_push(ssrRenderComponent(Modal_default, {
				modelValue: showModal.value,
				"onUpdate:modelValue": ($event) => showModal.value = $event,
				title: unref(form).id ? "Edit Place" : "Add Place"
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
						onClick: savePlace
					}, toDisplayString(unref(form).processing ? "Saving..." : "Save"), 9, ["disabled"])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).name,
							"onUpdate:modelValue": ($event) => unref(form).name = $event,
							label: "Name",
							placeholder: "Name",
							error: unref(form).errors.name
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).branch_id,
							"onUpdate:modelValue": ($event) => unref(form).branch_id = $event,
							label: "Branch",
							type: "select",
							error: unref(form).errors.branch_id
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) {
									_push(`<option value=""${_scopeId}>— select branch —</option><!--[-->`);
									ssrRenderList(props.branches, (branch) => {
										_push(`<option${ssrRenderAttr("value", branch.id)}${_scopeId}>${ssrInterpolate(branch.name)}</option>`);
									});
									_push(`<!--]-->`);
								} else return [createVNode("option", { value: "" }, "— select branch —"), (openBlock(true), createBlock(Fragment, null, renderList(props.branches, (branch) => {
									return openBlock(), createBlock("option", {
										key: branch.id,
										value: branch.id
									}, toDisplayString(branch.name), 9, ["value"]);
								}), 128))];
							}),
							_: 1
						}, _parent, _scopeId));
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
					} else return [
						createVNode(_sfc_main$2, {
							modelValue: unref(form).name,
							"onUpdate:modelValue": ($event) => unref(form).name = $event,
							label: "Name",
							placeholder: "Name",
							error: unref(form).errors.name
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode(_sfc_main$2, {
							modelValue: unref(form).branch_id,
							"onUpdate:modelValue": ($event) => unref(form).branch_id = $event,
							label: "Branch",
							type: "select",
							error: unref(form).errors.branch_id
						}, {
							default: withCtx(() => [createVNode("option", { value: "" }, "— select branch —"), (openBlock(true), createBlock(Fragment, null, renderList(props.branches, (branch) => {
								return openBlock(), createBlock("option", {
									key: branch.id,
									value: branch.id
								}, toDisplayString(branch.name), 9, ["value"]);
							}), 128))]),
							_: 1
						}, 8, [
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
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/pages/Places.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
//#endregion
export { _sfc_main as default };
