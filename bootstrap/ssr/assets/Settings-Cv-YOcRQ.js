import { n as usePermissions, t as AdminLayout_default } from "./AdminLayout-Dn6OtQae.js";
import { t as _sfc_main$1 } from "./PageHeader-D0aRDn5C.js";
import { t as DataTable_default } from "./DataTable-DQdMyI8_.js";
import { t as Modal_default } from "./Modal-CpmFAnsY.js";
import { t as _sfc_main$2 } from "./FormField-Doe8oR1s.js";
import { createBlock, createCommentVNode, createVNode, mergeProps, openBlock, ref, toDisplayString, unref, useSSRContext, withCtx } from "vue";
import { router, useForm } from "@inertiajs/vue3";
import { ssrIncludeBooleanAttr, ssrInterpolate, ssrRenderAttr, ssrRenderAttrs, ssrRenderComponent, ssrRenderStyle } from "vue/server-renderer";
//#region resources/js/pages/Settings.vue
var _sfc_main = /*@__PURE__*/ Object.assign({ layout: AdminLayout_default }, {
	__name: "Settings",
	__ssrInlineRender: true,
	props: { settings: {
		type: Array,
		default: () => []
	} },
	setup(__props) {
		const { can } = usePermissions();
		const props = __props;
		const columns = [
			{
				key: "name",
				label: "Name"
			},
			{
				key: "company",
				label: "Company"
			},
			{
				key: "address",
				label: "Address"
			},
			{
				key: "email",
				label: "Email"
			},
			{
				key: "phone",
				label: "Phone"
			}
		];
		const showModal = ref(false);
		const previewUrl = ref(null);
		const existingLogo = ref(null);
		const form = useForm({
			id: null,
			name: "",
			company: "",
			address: "",
			email: "",
			phone: "",
			message: "",
			logo: null
		});
		const openModal = () => {
			form.reset();
			form.clearErrors();
			existingLogo.value = null;
			previewUrl.value = null;
			showModal.value = true;
		};
		const editSetting = (s) => {
			form.clearErrors();
			form.id = s.id;
			form.name = s.name ?? "";
			form.company = s.company ?? "";
			form.address = s.address ?? "";
			form.email = s.email ?? "";
			form.phone = s.phone ?? "";
			form.message = s.message ?? "";
			form.logo = null;
			existingLogo.value = typeof s.logo === "string" ? s.logo : null;
			previewUrl.value = null;
			showModal.value = true;
		};
		const handleFileUpload = (event) => {
			const file = event.target.files[0];
			if (file) {
				form.logo = file;
				previewUrl.value = URL.createObjectURL(file);
			}
		};
		const saveSetting = () => {
			const isEdit = !!form.id;
			const url = isEdit ? `/settings/${form.id}` : "/settings";
			form.transform((data) => {
				const { id, ...rest } = data;
				if (!(rest.logo instanceof File)) delete rest.logo;
				return isEdit ? {
					...rest,
					_method: "put"
				} : rest;
			}).post(url, {
				forceFormData: true,
				preserveScroll: true,
				onSuccess: () => {
					showModal.value = false;
					form.reset();
					previewUrl.value = null;
					existingLogo.value = null;
				}
			});
		};
		const deleteSetting = (id) => {
			if (!confirm("Are you sure?")) return;
			router.delete(`/settings/${id}`, { preserveScroll: true });
		};
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "page" }, _attrs))}>`);
			_push(ssrRenderComponent(_sfc_main$1, {
				title: "Settings",
				subtitle: "Manage application settings and branding."
			}, {
				actions: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						if (unref(can)("settings.create")) _push(`<button class="ui-btn ui-btn--primary"${_scopeId}>+ Add Settings</button>`);
						else _push(`<!---->`);
					} else return [unref(can)("settings.create") ? (openBlock(), createBlock("button", {
						key: 0,
						class: "ui-btn ui-btn--primary",
						onClick: openModal
					}, "+ Add Settings")) : createCommentVNode("", true)];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(DataTable_default, {
				columns,
				rows: props.settings,
				index: "",
				searchable: "",
				"search-placeholder": "Search settings…"
			}, {
				actions: withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						if (unref(can)("settings.update")) _push(`<button class="ui-btn ui-btn--ghost ui-btn--sm"${_scopeId}>Edit</button>`);
						else _push(`<!---->`);
						if (unref(can)("settings.delete")) _push(`<button class="ui-btn ui-btn--danger ui-btn--sm"${_scopeId}>Delete</button>`);
						else _push(`<!---->`);
					} else return [unref(can)("settings.update") ? (openBlock(), createBlock("button", {
						key: 0,
						class: "ui-btn ui-btn--ghost ui-btn--sm",
						onClick: ($event) => editSetting(row)
					}, "Edit", 8, ["onClick"])) : createCommentVNode("", true), unref(can)("settings.delete") ? (openBlock(), createBlock("button", {
						key: 1,
						class: "ui-btn ui-btn--danger ui-btn--sm",
						onClick: ($event) => deleteSetting(row.id)
					}, "Delete", 8, ["onClick"])) : createCommentVNode("", true)];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(Modal_default, {
				modelValue: showModal.value,
				"onUpdate:modelValue": ($event) => showModal.value = $event,
				title: unref(form).id ? "Edit Settings" : "Add Settings",
				width: "560px"
			}, {
				footer: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<button class="ui-btn ui-btn--ghost"${_scopeId}>Cancel</button><button class="ui-btn ui-btn--primary"${ssrIncludeBooleanAttr(unref(form).processing) ? " disabled" : ""}${_scopeId}>${ssrInterpolate(unref(form).processing ? "Saving…" : "Save")}</button>`);
					else return [createVNode("button", {
						class: "ui-btn ui-btn--ghost",
						onClick: ($event) => showModal.value = false
					}, "Cancel", 8, ["onClick"]), createVNode("button", {
						class: "ui-btn ui-btn--primary",
						disabled: unref(form).processing,
						onClick: saveSetting
					}, toDisplayString(unref(form).processing ? "Saving…" : "Save"), 9, ["disabled"])];
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
							modelValue: unref(form).company,
							"onUpdate:modelValue": ($event) => unref(form).company = $event,
							label: "Company",
							placeholder: "Company",
							error: unref(form).errors.company
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
							modelValue: unref(form).message,
							"onUpdate:modelValue": ($event) => unref(form).message = $event,
							label: "Message",
							type: "textarea",
							placeholder: "Footer Message",
							error: unref(form).errors.message
						}, null, _parent, _scopeId));
						_push(`<div class="ui-field"${_scopeId}><label class="ui-label"${_scopeId}>Logo</label><input type="file" class="ui-input" accept="image/*"${_scopeId}>`);
						if (unref(form).errors.logo) _push(`<p class="ui-field__error"${_scopeId}>${ssrInterpolate(unref(form).errors.logo)}</p>`);
						else _push(`<!---->`);
						if (previewUrl.value) _push(`<div style="${ssrRenderStyle({ "margin-top": "10px" })}"${_scopeId}><img${ssrRenderAttr("src", previewUrl.value)} alt="Preview" style="${ssrRenderStyle({
							"max-width": "120px",
							"border-radius": "8px"
						})}"${_scopeId}></div>`);
						else if (existingLogo.value) _push(`<img${ssrRenderAttr("src", existingLogo.value)} alt="Logo" style="${ssrRenderStyle({
							"max-width": "120px",
							"margin-top": "10px",
							"border-radius": "8px"
						})}"${_scopeId}>`);
						else _push(`<!---->`);
						_push(`</div>`);
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
							modelValue: unref(form).company,
							"onUpdate:modelValue": ($event) => unref(form).company = $event,
							label: "Company",
							placeholder: "Company",
							error: unref(form).errors.company
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
							modelValue: unref(form).message,
							"onUpdate:modelValue": ($event) => unref(form).message = $event,
							label: "Message",
							type: "textarea",
							placeholder: "Footer Message",
							error: unref(form).errors.message
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode("div", { class: "ui-field" }, [
							createVNode("label", { class: "ui-label" }, "Logo"),
							createVNode("input", {
								type: "file",
								class: "ui-input",
								accept: "image/*",
								onChange: handleFileUpload
							}, null, 32),
							unref(form).errors.logo ? (openBlock(), createBlock("p", {
								key: 0,
								class: "ui-field__error"
							}, toDisplayString(unref(form).errors.logo), 1)) : createCommentVNode("", true),
							previewUrl.value ? (openBlock(), createBlock("div", {
								key: 1,
								style: { "margin-top": "10px" }
							}, [createVNode("img", {
								src: previewUrl.value,
								alt: "Preview",
								style: {
									"max-width": "120px",
									"border-radius": "8px"
								}
							}, null, 8, ["src"])])) : existingLogo.value ? (openBlock(), createBlock("img", {
								key: 2,
								src: existingLogo.value,
								alt: "Logo",
								style: {
									"max-width": "120px",
									"margin-top": "10px",
									"border-radius": "8px"
								}
							}, null, 8, ["src"])) : createCommentVNode("", true)
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
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/pages/Settings.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
//#endregion
export { _sfc_main as default };
