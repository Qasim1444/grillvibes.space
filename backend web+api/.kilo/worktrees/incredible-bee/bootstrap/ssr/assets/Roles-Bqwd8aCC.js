import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-BOaGB7Aw.js";
import { n as confirmDialog } from "./useNotifications-CvzCW6Mx.js";
import { n as usePermissions, t as AdminLayout_default } from "./AdminLayout-D618cxCi.js";
import { t as _sfc_main$1 } from "./PageHeader-D0aRDn5C.js";
import { t as DataTable_default } from "./DataTable-DQdMyI8_.js";
import { t as Pagination_default } from "./Pagination-CHJUzz_w.js";
import { t as Modal_default } from "./Modal-CpmFAnsY.js";
import { t as _sfc_main$2 } from "./FormField-Doe8oR1s.js";
import { Fragment, computed, createBlock, createCommentVNode, createVNode, mergeProps, openBlock, ref, renderList, toDisplayString, unref, useSSRContext, vModelCheckbox, watch, withCtx, withDirectives } from "vue";
import { router, useForm } from "@inertiajs/vue3";
import { ssrIncludeBooleanAttr, ssrInterpolate, ssrLooseContain, ssrRenderAttr, ssrRenderAttrs, ssrRenderClass, ssrRenderComponent, ssrRenderList } from "vue/server-renderer";
//#region resources/js/pages/Roles.vue
var _sfc_main = /*@__PURE__*/ Object.assign({ layout: AdminLayout_default }, {
	__name: "Roles",
	__ssrInlineRender: true,
	props: {
		roles: {
			type: Object,
			default: () => ({ data: [] })
		},
		permissions: {
			type: Array,
			default: () => []
		},
		filters: {
			type: Object,
			default: () => ({ search: "" })
		}
	},
	setup(__props) {
		const props = __props;
		const { can } = usePermissions();
		const columns = [
			{
				key: "name",
				label: "Name"
			},
			{
				key: "slug",
				label: "Slug"
			},
			{
				key: "description",
				label: "Description"
			},
			{
				key: "users_count",
				label: "Users",
				width: "90px"
			},
			{
				key: "permissions_count",
				label: "Access"
			}
		];
		const roles = computed(() => props.roles?.data ?? []);
		const visiblePermissions = computed(() => props.permissions);
		const visiblePermissionIds = computed(() => visiblePermissions.value.map((p) => p.id));
		const selectedVisibleCount = computed(() => form.permission_ids.filter((id) => visiblePermissionIds.value.includes(id)).length);
		const grouped = computed(() => visiblePermissions.value.reduce((acc, p) => {
			(acc[p.group] ??= []).push(p);
			return acc;
		}, {}));
		const search = ref(props.filters?.search ?? "");
		let searchTimer = null;
		watch(search, (value) => {
			clearTimeout(searchTimer);
			searchTimer = setTimeout(() => {
				router.get("/roles", { search: value || void 0 }, {
					preserveState: true,
					preserveScroll: true,
					replace: true,
					only: ["roles", "filters"]
				});
			}, 300);
		});
		const showModal = ref(false);
		const form = useForm({
			id: null,
			name: "",
			description: "",
			permission_ids: []
		});
		const isGroupFull = (items) => items.every((p) => form.permission_ids.includes(p.id));
		const isGroupPartial = (items) => !isGroupFull(items) && items.some((p) => form.permission_ids.includes(p.id));
		const toggleGroup = (items, checked) => {
			const ids = items.map((p) => p.id);
			form.permission_ids = checked ? [.../* @__PURE__ */ new Set([...form.permission_ids, ...ids])] : form.permission_ids.filter((id) => !ids.includes(id));
		};
		const openModal = () => {
			form.reset();
			form.clearErrors();
			showModal.value = true;
		};
		const editRole = (role) => {
			form.id = role.id;
			form.name = role.name;
			form.description = role.description || "";
			form.permission_ids = (role.permission_ids ?? []).filter((id) => visiblePermissionIds.value.includes(id));
			form.clearErrors();
			showModal.value = true;
		};
		const saveRole = () => {
			const opts = {
				preserveScroll: true,
				onSuccess: () => showModal.value = false
			};
			if (form.id) form.put(`/roles/${form.id}`, opts);
			else form.post("/roles", opts);
		};
		const deleteRole = async (role) => {
			if (!await confirmDialog(`Delete the "${role.name}" role?`)) return;
			router.delete(`/roles/${role.id}`, { preserveScroll: true });
		};
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "page" }, _attrs))} data-v-39331f85>`);
			_push(ssrRenderComponent(_sfc_main$1, {
				title: "Roles & Permissions",
				subtitle: "Control which menus and actions each role can reach."
			}, {
				actions: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						if (unref(can)("roles.create")) _push(`<button class="ui-btn ui-btn--primary" data-v-39331f85${_scopeId}>+ Add Role</button>`);
						else _push(`<!---->`);
					} else return [unref(can)("roles.create") ? (openBlock(), createBlock("button", {
						key: 0,
						class: "ui-btn ui-btn--primary",
						onClick: openModal
					}, "+ Add Role")) : createCommentVNode("", true)];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(DataTable_default, {
				columns,
				rows: roles.value,
				index: "",
				searchable: "",
				query: search.value,
				"onUpdate:query": ($event) => search.value = $event,
				"search-placeholder": "Search roles…",
				"empty-text": "No roles found."
			}, {
				"cell:permissions_count": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) _push(`<span class="${ssrRenderClass([row.is_locked ? "ui-badge--success" : "ui-badge--muted", "ui-badge"])}" data-v-39331f85${_scopeId}>${ssrInterpolate(row.is_locked ? "All permissions" : `${row.permissions_count} permissions`)}</span>`);
					else return [createVNode("span", { class: ["ui-badge", row.is_locked ? "ui-badge--success" : "ui-badge--muted"] }, toDisplayString(row.is_locked ? "All permissions" : `${row.permissions_count} permissions`), 3)];
				}),
				actions: withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						if (unref(can)("roles.update")) _push(`<button class="ui-btn ui-btn--ghost ui-btn--sm"${ssrIncludeBooleanAttr(row.is_locked) ? " disabled" : ""}${ssrRenderAttr("title", row.is_locked ? "The Super Admin role is locked." : "")} data-v-39331f85${_scopeId}> Edit </button>`);
						else _push(`<!---->`);
						if (unref(can)("roles.delete")) _push(`<button class="ui-btn ui-btn--danger ui-btn--sm"${ssrIncludeBooleanAttr(row.is_locked) ? " disabled" : ""} data-v-39331f85${_scopeId}> Delete </button>`);
						else _push(`<!---->`);
					} else return [unref(can)("roles.update") ? (openBlock(), createBlock("button", {
						key: 0,
						class: "ui-btn ui-btn--ghost ui-btn--sm",
						disabled: row.is_locked,
						title: row.is_locked ? "The Super Admin role is locked." : "",
						onClick: ($event) => editRole(row)
					}, " Edit ", 8, [
						"disabled",
						"title",
						"onClick"
					])) : createCommentVNode("", true), unref(can)("roles.delete") ? (openBlock(), createBlock("button", {
						key: 1,
						class: "ui-btn ui-btn--danger ui-btn--sm",
						disabled: row.is_locked,
						onClick: ($event) => deleteRole(row)
					}, " Delete ", 8, ["disabled", "onClick"])) : createCommentVNode("", true)];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(Pagination_default, {
				paginator: props.roles,
				only: ["roles"]
			}, null, _parent));
			_push(ssrRenderComponent(Modal_default, {
				modelValue: showModal.value,
				"onUpdate:modelValue": ($event) => showModal.value = $event,
				title: unref(form).id ? "Edit Role" : "Add Role",
				width: "720px"
			}, {
				footer: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<button class="ui-btn ui-btn--ghost" data-v-39331f85${_scopeId}>Cancel</button><button class="ui-btn ui-btn--primary"${ssrIncludeBooleanAttr(unref(form).processing) ? " disabled" : ""} data-v-39331f85${_scopeId}>Save</button>`);
					else return [createVNode("button", {
						class: "ui-btn ui-btn--ghost",
						onClick: ($event) => showModal.value = false
					}, "Cancel", 8, ["onClick"]), createVNode("button", {
						class: "ui-btn ui-btn--primary",
						disabled: unref(form).processing,
						onClick: saveRole
					}, "Save", 8, ["disabled"])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).name,
							"onUpdate:modelValue": ($event) => unref(form).name = $event,
							label: "Name",
							placeholder: "e.g. Shift Supervisor",
							error: unref(form).errors.name
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).description,
							"onUpdate:modelValue": ($event) => unref(form).description = $event,
							label: "Description",
							type: "textarea",
							placeholder: "What this role is for",
							error: unref(form).errors.description
						}, null, _parent, _scopeId));
						_push(`<div class="ui-field" data-v-39331f85${_scopeId}><div class="roles__matrix-head" data-v-39331f85${_scopeId}><label class="ui-label" data-v-39331f85${_scopeId}>Permissions</label><span class="roles__count" data-v-39331f85${_scopeId}>${ssrInterpolate(selectedVisibleCount.value)} of ${ssrInterpolate(visiblePermissions.value.length)} selected</span></div>`);
						if (unref(form).errors.permission_ids) _push(`<p class="ui-field__error" data-v-39331f85${_scopeId}>${ssrInterpolate(unref(form).errors.permission_ids)}</p>`);
						else _push(`<!---->`);
						_push(`<!--[-->`);
						ssrRenderList(grouped.value, (items, group) => {
							_push(`<div class="roles__group" data-v-39331f85${_scopeId}><label class="roles__group-head" data-v-39331f85${_scopeId}><input type="checkbox"${ssrIncludeBooleanAttr(isGroupFull(items)) ? " checked" : ""}${ssrRenderAttr("indeterminate", isGroupPartial(items))} data-v-39331f85${_scopeId}><span data-v-39331f85${_scopeId}>${ssrInterpolate(group)}</span></label><div class="roles__perms" data-v-39331f85${_scopeId}><!--[-->`);
							ssrRenderList(items, (p) => {
								_push(`<label class="roles__perm" data-v-39331f85${_scopeId}><input type="checkbox"${ssrRenderAttr("value", p.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).permission_ids) ? ssrLooseContain(unref(form).permission_ids, p.id) : unref(form).permission_ids) ? " checked" : ""} data-v-39331f85${_scopeId}><span data-v-39331f85${_scopeId}>${ssrInterpolate(p.name)}</span><code data-v-39331f85${_scopeId}>${ssrInterpolate(p.key)}</code></label>`);
							});
							_push(`<!--]--></div></div>`);
						});
						_push(`<!--]--></div>`);
					} else return [
						createVNode(_sfc_main$2, {
							modelValue: unref(form).name,
							"onUpdate:modelValue": ($event) => unref(form).name = $event,
							label: "Name",
							placeholder: "e.g. Shift Supervisor",
							error: unref(form).errors.name
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode(_sfc_main$2, {
							modelValue: unref(form).description,
							"onUpdate:modelValue": ($event) => unref(form).description = $event,
							label: "Description",
							type: "textarea",
							placeholder: "What this role is for",
							error: unref(form).errors.description
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode("div", { class: "ui-field" }, [
							createVNode("div", { class: "roles__matrix-head" }, [createVNode("label", { class: "ui-label" }, "Permissions"), createVNode("span", { class: "roles__count" }, toDisplayString(selectedVisibleCount.value) + " of " + toDisplayString(visiblePermissions.value.length) + " selected", 1)]),
							unref(form).errors.permission_ids ? (openBlock(), createBlock("p", {
								key: 0,
								class: "ui-field__error"
							}, toDisplayString(unref(form).errors.permission_ids), 1)) : createCommentVNode("", true),
							(openBlock(true), createBlock(Fragment, null, renderList(grouped.value, (items, group) => {
								return openBlock(), createBlock("div", {
									key: group,
									class: "roles__group"
								}, [createVNode("label", { class: "roles__group-head" }, [createVNode("input", {
									type: "checkbox",
									checked: isGroupFull(items),
									indeterminate: isGroupPartial(items),
									onChange: ($event) => toggleGroup(items, $event.target.checked)
								}, null, 40, [
									"checked",
									"indeterminate",
									"onChange"
								]), createVNode("span", null, toDisplayString(group), 1)]), createVNode("div", { class: "roles__perms" }, [(openBlock(true), createBlock(Fragment, null, renderList(items, (p) => {
									return openBlock(), createBlock("label", {
										key: p.id,
										class: "roles__perm"
									}, [
										withDirectives(createVNode("input", {
											type: "checkbox",
											value: p.id,
											"onUpdate:modelValue": ($event) => unref(form).permission_ids = $event
										}, null, 8, ["value", "onUpdate:modelValue"]), [[vModelCheckbox, unref(form).permission_ids]]),
										createVNode("span", null, toDisplayString(p.name), 1),
										createVNode("code", null, toDisplayString(p.key), 1)
									]);
								}), 128))])]);
							}), 128))
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
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/pages/Roles.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var Roles_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-39331f85"]]);
//#endregion
export { Roles_default as default };
