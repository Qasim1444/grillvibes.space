import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-BOaGB7Aw.js";
import { n as usePermissions, t as AdminLayout_default } from "./AdminLayout-Bp8G38ms.js";
import { t as _sfc_main$1 } from "./PageHeader-D0aRDn5C.js";
import { t as DataTable_default } from "./DataTable-BHCUCuvd.js";
import { t as Pagination_default } from "./Pagination-h4WEvndd.js";
import { t as Modal_default } from "./Modal-DhESI6xO.js";
import { t as _sfc_main$2 } from "./FormField-Doe8oR1s.js";
import { Fragment, computed, createBlock, createCommentVNode, createTextVNode, createVNode, mergeProps, openBlock, ref, renderList, toDisplayString, unref, useSSRContext, vModelCheckbox, watch, withCtx, withDirectives } from "vue";
import { router, useForm } from "@inertiajs/vue3";
import { ssrIncludeBooleanAttr, ssrInterpolate, ssrLooseContain, ssrRenderAttr, ssrRenderAttrs, ssrRenderComponent, ssrRenderList } from "vue/server-renderer";
//#region resources/js/pages/Users.vue
var _sfc_main = /*@__PURE__*/ Object.assign({ layout: AdminLayout_default }, {
	__name: "Users",
	__ssrInlineRender: true,
	props: {
		users: {
			type: Object,
			default: () => ({ data: [] })
		},
		roles: {
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
				key: "email",
				label: "Email"
			},
			{
				key: "phone",
				label: "Phone"
			},
			{
				key: "address",
				label: "Address"
			},
			{
				key: "role_names",
				label: "Roles"
			},
			{
				key: "created_at",
				label: "Created At"
			}
		];
		const users = computed(() => props.users?.data ?? []);
		const search = ref(props.filters?.search ?? "");
		let searchTimer = null;
		watch(search, (value) => {
			clearTimeout(searchTimer);
			searchTimer = setTimeout(() => {
				router.get("/users", { search: value || void 0 }, {
					preserveState: true,
					preserveScroll: true,
					replace: true,
					only: ["users", "filters"]
				});
			}, 300);
		});
		const showModal = ref(false);
		const form = useForm({
			id: null,
			name: "",
			email: "",
			phone: "",
			address: "",
			password: "",
			role_ids: []
		});
		const errorMsg = computed(() => form.errors.message || "");
		const openModal = () => {
			form.reset();
			form.clearErrors();
			showModal.value = true;
		};
		const editUser = (u) => {
			form.id = u.id;
			form.name = u.name;
			form.email = u.email;
			form.phone = u.phone || "";
			form.address = u.address || "";
			form.password = "";
			form.role_ids = [...u.role_ids ?? []];
			form.clearErrors();
			showModal.value = true;
		};
		const saveUser = () => {
			const opts = {
				preserveScroll: true,
				onSuccess: () => showModal.value = false
			};
			if (form.id) form.put(`/users/${form.id}`, opts);
			else form.post("/users", opts);
		};
		const showAssignModal = ref(false);
		const assignForm = useForm({
			userId: null,
			userName: "",
			role_ids: []
		});
		const openAssignRole = (u) => {
			assignForm.userId = u.id;
			assignForm.userName = u.name;
			assignForm.role_ids = [...u.role_ids ?? []];
			assignForm.clearErrors();
			showAssignModal.value = true;
		};
		const saveAssignRole = () => {
			assignForm.post(`/users/${assignForm.userId}/assign-roles`, {
				preserveScroll: true,
				onSuccess: () => showAssignModal.value = false
			});
		};
		const deleteUser = (id) => {
			if (!confirm("Are you sure you want to delete this user?")) return;
			router.delete(`/users/${id}`, { preserveScroll: true });
		};
		const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString() : "—";
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "page" }, _attrs))} data-v-ca9d86e9>`);
			_push(ssrRenderComponent(_sfc_main$1, {
				title: "Users",
				subtitle: "Manage admin user accounts."
			}, {
				actions: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						if (unref(can)("users.create")) _push(`<button class="ui-btn ui-btn--primary" data-v-ca9d86e9${_scopeId}>+ Add User</button>`);
						else _push(`<!---->`);
					} else return [unref(can)("users.create") ? (openBlock(), createBlock("button", {
						key: 0,
						class: "ui-btn ui-btn--primary",
						onClick: openModal
					}, "+ Add User")) : createCommentVNode("", true)];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(DataTable_default, {
				columns,
				rows: users.value,
				index: "",
				searchable: "",
				query: search.value,
				"onUpdate:query": ($event) => search.value = $event,
				"search-placeholder": "Search users…",
				"empty-text": "No users found."
			}, {
				"cell:created_at": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) _push(`${ssrInterpolate(formatDate(value))}`);
					else return [createTextVNode(toDisplayString(formatDate(value)), 1)];
				}),
				"cell:role_names": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) {
						if (value) _push(`<span class="ui-badge ui-badge--success" data-v-ca9d86e9${_scopeId}>${ssrInterpolate(value)}</span>`);
						else _push(`<span class="ui-badge ui-badge--muted" data-v-ca9d86e9${_scopeId}>No role</span>`);
					} else return [value ? (openBlock(), createBlock("span", {
						key: 0,
						class: "ui-badge ui-badge--success"
					}, toDisplayString(value), 1)) : (openBlock(), createBlock("span", {
						key: 1,
						class: "ui-badge ui-badge--muted"
					}, "No role"))];
				}),
				actions: withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						if (unref(can)("users.update")) _push(`<button class="ui-btn ui-btn--ghost ui-btn--sm" data-v-ca9d86e9${_scopeId}>Edit</button>`);
						else _push(`<!---->`);
						if (unref(can)("users.update")) _push(`<button class="ui-btn ui-btn--secondary ui-btn--sm" data-v-ca9d86e9${_scopeId}>Assign Role</button>`);
						else _push(`<!---->`);
						if (unref(can)("users.delete")) _push(`<button class="ui-btn ui-btn--danger ui-btn--sm" data-v-ca9d86e9${_scopeId}>Delete</button>`);
						else _push(`<!---->`);
					} else return [
						unref(can)("users.update") ? (openBlock(), createBlock("button", {
							key: 0,
							class: "ui-btn ui-btn--ghost ui-btn--sm",
							onClick: ($event) => editUser(row)
						}, "Edit", 8, ["onClick"])) : createCommentVNode("", true),
						unref(can)("users.update") ? (openBlock(), createBlock("button", {
							key: 1,
							class: "ui-btn ui-btn--secondary ui-btn--sm",
							onClick: ($event) => openAssignRole(row)
						}, "Assign Role", 8, ["onClick"])) : createCommentVNode("", true),
						unref(can)("users.delete") ? (openBlock(), createBlock("button", {
							key: 2,
							class: "ui-btn ui-btn--danger ui-btn--sm",
							onClick: ($event) => deleteUser(row.id)
						}, "Delete", 8, ["onClick"])) : createCommentVNode("", true)
					];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(Pagination_default, {
				paginator: props.users,
				only: ["users"]
			}, null, _parent));
			_push(ssrRenderComponent(Modal_default, {
				modelValue: showModal.value,
				"onUpdate:modelValue": ($event) => showModal.value = $event,
				title: unref(form).id ? "Edit User" : "Add User"
			}, {
				footer: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<button class="ui-btn ui-btn--ghost" data-v-ca9d86e9${_scopeId}>Cancel</button><button class="ui-btn ui-btn--primary"${ssrIncludeBooleanAttr(unref(form).processing) ? " disabled" : ""} data-v-ca9d86e9${_scopeId}>Save</button>`);
					else return [createVNode("button", {
						class: "ui-btn ui-btn--ghost",
						onClick: ($event) => showModal.value = false
					}, "Cancel", 8, ["onClick"]), createVNode("button", {
						class: "ui-btn ui-btn--primary",
						disabled: unref(form).processing,
						onClick: saveUser
					}, "Save", 8, ["disabled"])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						if (errorMsg.value) _push(`<div class="ui-alert ui-alert--danger" data-v-ca9d86e9${_scopeId}>${ssrInterpolate(errorMsg.value)}</div>`);
						else _push(`<!---->`);
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).name,
							"onUpdate:modelValue": ($event) => unref(form).name = $event,
							label: "Name",
							placeholder: "Name",
							error: unref(form).errors.name
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).email,
							"onUpdate:modelValue": ($event) => unref(form).email = $event,
							label: "Email",
							type: "email",
							placeholder: "Email",
							error: unref(form).errors.email
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).phone,
							"onUpdate:modelValue": ($event) => unref(form).phone = $event,
							label: "Phone",
							placeholder: "Phone",
							error: unref(form).errors.phone
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).address,
							"onUpdate:modelValue": ($event) => unref(form).address = $event,
							label: "Address",
							type: "textarea",
							placeholder: "Address",
							error: unref(form).errors.address
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).password,
							"onUpdate:modelValue": ($event) => unref(form).password = $event,
							label: unref(form).id ? "New Password (leave blank to keep current)" : "Password",
							type: "password",
							placeholder: "Password",
							error: unref(form).errors.password
						}, null, _parent, _scopeId));
						_push(`<div class="ui-field" data-v-ca9d86e9${_scopeId}><label class="ui-label" data-v-ca9d86e9${_scopeId}>Roles</label><div class="users__roles" data-v-ca9d86e9${_scopeId}><!--[-->`);
						ssrRenderList(props.roles, (r) => {
							_push(`<label class="users__role" data-v-ca9d86e9${_scopeId}><input type="checkbox"${ssrRenderAttr("value", r.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).role_ids) ? ssrLooseContain(unref(form).role_ids, r.id) : unref(form).role_ids) ? " checked" : ""} data-v-ca9d86e9${_scopeId}><span data-v-ca9d86e9${_scopeId}>${ssrInterpolate(r.name)}</span></label>`);
						});
						_push(`<!--]-->`);
						if (!props.roles.length) _push(`<p class="users__roles-empty" data-v-ca9d86e9${_scopeId}> No roles defined yet — create one on the Roles &amp; Permissions page. </p>`);
						else _push(`<!---->`);
						_push(`</div>`);
						if (unref(form).errors.role_ids) _push(`<span class="ui-field__error" data-v-ca9d86e9${_scopeId}>${ssrInterpolate(unref(form).errors.role_ids)}</span>`);
						else _push(`<!---->`);
						_push(`</div>`);
					} else return [
						errorMsg.value ? (openBlock(), createBlock("div", {
							key: 0,
							class: "ui-alert ui-alert--danger"
						}, toDisplayString(errorMsg.value), 1)) : createCommentVNode("", true),
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
							modelValue: unref(form).email,
							"onUpdate:modelValue": ($event) => unref(form).email = $event,
							label: "Email",
							type: "email",
							placeholder: "Email",
							error: unref(form).errors.email
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode(_sfc_main$2, {
							modelValue: unref(form).phone,
							"onUpdate:modelValue": ($event) => unref(form).phone = $event,
							label: "Phone",
							placeholder: "Phone",
							error: unref(form).errors.phone
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode(_sfc_main$2, {
							modelValue: unref(form).address,
							"onUpdate:modelValue": ($event) => unref(form).address = $event,
							label: "Address",
							type: "textarea",
							placeholder: "Address",
							error: unref(form).errors.address
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode(_sfc_main$2, {
							modelValue: unref(form).password,
							"onUpdate:modelValue": ($event) => unref(form).password = $event,
							label: unref(form).id ? "New Password (leave blank to keep current)" : "Password",
							type: "password",
							placeholder: "Password",
							error: unref(form).errors.password
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"label",
							"error"
						]),
						createVNode("div", { class: "ui-field" }, [
							createVNode("label", { class: "ui-label" }, "Roles"),
							createVNode("div", { class: "users__roles" }, [(openBlock(true), createBlock(Fragment, null, renderList(props.roles, (r) => {
								return openBlock(), createBlock("label", {
									key: r.id,
									class: "users__role"
								}, [withDirectives(createVNode("input", {
									type: "checkbox",
									value: r.id,
									"onUpdate:modelValue": ($event) => unref(form).role_ids = $event
								}, null, 8, ["value", "onUpdate:modelValue"]), [[vModelCheckbox, unref(form).role_ids]]), createVNode("span", null, toDisplayString(r.name), 1)]);
							}), 128)), !props.roles.length ? (openBlock(), createBlock("p", {
								key: 0,
								class: "users__roles-empty"
							}, " No roles defined yet — create one on the Roles & Permissions page. ")) : createCommentVNode("", true)]),
							unref(form).errors.role_ids ? (openBlock(), createBlock("span", {
								key: 0,
								class: "ui-field__error"
							}, toDisplayString(unref(form).errors.role_ids), 1)) : createCommentVNode("", true)
						])
					];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(Modal_default, {
				modelValue: showAssignModal.value,
				"onUpdate:modelValue": ($event) => showAssignModal.value = $event,
				title: "Assign Roles"
			}, {
				footer: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<button class="ui-btn ui-btn--ghost" data-v-ca9d86e9${_scopeId}>Cancel</button><button class="ui-btn ui-btn--primary"${ssrIncludeBooleanAttr(unref(assignForm).processing) ? " disabled" : ""} data-v-ca9d86e9${_scopeId}>Save</button>`);
					else return [createVNode("button", {
						class: "ui-btn ui-btn--ghost",
						onClick: ($event) => showAssignModal.value = false
					}, "Cancel", 8, ["onClick"]), createVNode("button", {
						class: "ui-btn ui-btn--primary",
						disabled: unref(assignForm).processing,
						onClick: saveAssignRole
					}, "Save", 8, ["disabled"])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<p class="assign-role__name" data-v-ca9d86e9${_scopeId}>User: <strong data-v-ca9d86e9${_scopeId}>${ssrInterpolate(unref(assignForm).userName)}</strong></p><div class="ui-field" data-v-ca9d86e9${_scopeId}><label class="ui-label" data-v-ca9d86e9${_scopeId}>Roles</label><div class="users__roles" data-v-ca9d86e9${_scopeId}><!--[-->`);
						ssrRenderList(props.roles, (r) => {
							_push(`<label class="users__role" data-v-ca9d86e9${_scopeId}><input type="checkbox"${ssrRenderAttr("value", r.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(assignForm).role_ids) ? ssrLooseContain(unref(assignForm).role_ids, r.id) : unref(assignForm).role_ids) ? " checked" : ""} data-v-ca9d86e9${_scopeId}><span data-v-ca9d86e9${_scopeId}>${ssrInterpolate(r.name)}</span></label>`);
						});
						_push(`<!--]-->`);
						if (!props.roles.length) _push(`<p class="users__roles-empty" data-v-ca9d86e9${_scopeId}> No roles defined yet — create one on the Roles &amp; Permissions page. </p>`);
						else _push(`<!---->`);
						_push(`</div>`);
						if (unref(assignForm).errors.role_ids) _push(`<span class="ui-field__error" data-v-ca9d86e9${_scopeId}>${ssrInterpolate(unref(assignForm).errors.role_ids)}</span>`);
						else _push(`<!---->`);
						_push(`</div>`);
					} else return [createVNode("p", { class: "assign-role__name" }, [createTextVNode("User: "), createVNode("strong", null, toDisplayString(unref(assignForm).userName), 1)]), createVNode("div", { class: "ui-field" }, [
						createVNode("label", { class: "ui-label" }, "Roles"),
						createVNode("div", { class: "users__roles" }, [(openBlock(true), createBlock(Fragment, null, renderList(props.roles, (r) => {
							return openBlock(), createBlock("label", {
								key: r.id,
								class: "users__role"
							}, [withDirectives(createVNode("input", {
								type: "checkbox",
								value: r.id,
								"onUpdate:modelValue": ($event) => unref(assignForm).role_ids = $event
							}, null, 8, ["value", "onUpdate:modelValue"]), [[vModelCheckbox, unref(assignForm).role_ids]]), createVNode("span", null, toDisplayString(r.name), 1)]);
						}), 128)), !props.roles.length ? (openBlock(), createBlock("p", {
							key: 0,
							class: "users__roles-empty"
						}, " No roles defined yet — create one on the Roles & Permissions page. ")) : createCommentVNode("", true)]),
						unref(assignForm).errors.role_ids ? (openBlock(), createBlock("span", {
							key: 0,
							class: "ui-field__error"
						}, toDisplayString(unref(assignForm).errors.role_ids), 1)) : createCommentVNode("", true)
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
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/pages/Users.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var Users_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-ca9d86e9"]]);
//#endregion
export { Users_default as default };
