import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-BOaGB7Aw.js";
import { t as AdminLayout_default } from "./AdminLayout-Dn6OtQae.js";
import { t as _sfc_main$1 } from "./PageHeader-D0aRDn5C.js";
import { t as _sfc_main$2 } from "./FormField-Doe8oR1s.js";
import { mergeProps, unref, useSSRContext } from "vue";
import { useForm, usePage } from "@inertiajs/vue3";
import { ssrIncludeBooleanAttr, ssrInterpolate, ssrRenderAttrs, ssrRenderComponent } from "vue/server-renderer";
//#region resources/js/pages/Profile.vue
var _sfc_main = /*@__PURE__*/ Object.assign({ layout: AdminLayout_default }, {
	__name: "Profile",
	__ssrInlineRender: true,
	setup(__props) {
		const user = usePage().props.auth?.user ?? {};
		const profileForm = useForm({
			name: user.name ?? "",
			email: user.email ?? "",
			phone: user.phone ?? "",
			address: user.address ?? ""
		});
		const passwordForm = useForm({
			current_password: "",
			password: "",
			password_confirmation: ""
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "page" }, _attrs))} data-v-f476cff2>`);
			_push(ssrRenderComponent(_sfc_main$1, {
				title: "Profile",
				subtitle: "Your account information."
			}, null, _parent));
			_push(`<div class="profile-grid" data-v-f476cff2><div class="ui-card ui-card-pad" data-v-f476cff2><h3 class="profile__section-title" data-v-f476cff2>Personal Info</h3>`);
			if (unref(profileForm).recentlySuccessful) _push(`<div class="ui-alert ui-alert--success" data-v-f476cff2> Profile updated successfully. </div>`);
			else _push(`<!---->`);
			_push(ssrRenderComponent(_sfc_main$2, {
				modelValue: unref(profileForm).name,
				"onUpdate:modelValue": ($event) => unref(profileForm).name = $event,
				label: "Name",
				placeholder: "Name",
				error: unref(profileForm).errors.name
			}, null, _parent));
			_push(ssrRenderComponent(_sfc_main$2, {
				modelValue: unref(profileForm).email,
				"onUpdate:modelValue": ($event) => unref(profileForm).email = $event,
				label: "Email",
				type: "email",
				placeholder: "Email",
				error: unref(profileForm).errors.email
			}, null, _parent));
			_push(ssrRenderComponent(_sfc_main$2, {
				modelValue: unref(profileForm).phone,
				"onUpdate:modelValue": ($event) => unref(profileForm).phone = $event,
				label: "Phone",
				placeholder: "Phone",
				error: unref(profileForm).errors.phone
			}, null, _parent));
			_push(ssrRenderComponent(_sfc_main$2, {
				modelValue: unref(profileForm).address,
				"onUpdate:modelValue": ($event) => unref(profileForm).address = $event,
				label: "Address",
				type: "textarea",
				placeholder: "Address",
				error: unref(profileForm).errors.address
			}, null, _parent));
			_push(`<button class="ui-btn ui-btn--primary"${ssrIncludeBooleanAttr(unref(profileForm).processing) ? " disabled" : ""} data-v-f476cff2>${ssrInterpolate(unref(profileForm).processing ? "Saving…" : "Update Profile")}</button></div><div class="ui-card" data-v-f476cff2><div class="ui-card-header" data-v-f476cff2><span data-v-f476cff2>Change Password</span></div><div class="ui-card-pad" data-v-f476cff2>`);
			if (unref(passwordForm).recentlySuccessful) _push(`<div class="ui-alert ui-alert--success" data-v-f476cff2> Password changed successfully. </div>`);
			else _push(`<!---->`);
			_push(ssrRenderComponent(_sfc_main$2, {
				modelValue: unref(passwordForm).current_password,
				"onUpdate:modelValue": ($event) => unref(passwordForm).current_password = $event,
				label: "Current Password",
				type: "password",
				placeholder: "••••••••",
				error: unref(passwordForm).errors.current_password
			}, null, _parent));
			_push(ssrRenderComponent(_sfc_main$2, {
				modelValue: unref(passwordForm).password,
				"onUpdate:modelValue": ($event) => unref(passwordForm).password = $event,
				label: "New Password",
				type: "password",
				placeholder: "••••••••",
				error: unref(passwordForm).errors.password
			}, null, _parent));
			_push(ssrRenderComponent(_sfc_main$2, {
				modelValue: unref(passwordForm).password_confirmation,
				"onUpdate:modelValue": ($event) => unref(passwordForm).password_confirmation = $event,
				label: "Confirm Password",
				type: "password",
				placeholder: "••••••••"
			}, null, _parent));
			_push(`<button class="ui-btn ui-btn--primary"${ssrIncludeBooleanAttr(unref(passwordForm).processing) ? " disabled" : ""} data-v-f476cff2>${ssrInterpolate(unref(passwordForm).processing ? "Updating…" : "Change Password")}</button></div></div></div></div>`);
		};
	}
});
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/pages/Profile.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var Profile_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-f476cff2"]]);
//#endregion
export { Profile_default as default };
