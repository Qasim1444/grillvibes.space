import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-BOaGB7Aw.js";
import { mergeProps, reactive, ref, useSSRContext } from "vue";
import { ssrIncludeBooleanAttr, ssrInterpolate, ssrLooseContain, ssrRenderAttr, ssrRenderAttrs, ssrRenderClass } from "vue/server-renderer";
import { useRouter } from "vue-router";
//#region resources/js/pages/AdminLoginPage.vue
var _sfc_main = {
	__name: "AdminLoginPage",
	__ssrInlineRender: true,
	setup(__props) {
		useRouter();
		const selectedRole = ref("SUPER_ADMIN");
		const isSubmitting = ref(false);
		const authError = ref("");
		const form = reactive({
			email: "",
			password: "",
			remember: true
		});
		const errors = reactive({
			email: "",
			password: ""
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "login-shell" }, _attrs))} data-v-d74e8ffb><div class="login-card" data-v-d74e8ffb><div class="login-card__header" data-v-d74e8ffb><div class="brand-mark" data-v-d74e8ffb>J</div><div data-v-d74e8ffb><h1 data-v-d74e8ffb>Admin login</h1><p data-v-d74e8ffb>Access your workspace</p></div></div><div class="account-tabs" aria-label="Account type selector" data-v-d74e8ffb><button type="button" class="${ssrRenderClass({ active: selectedRole.value === "SUPER_ADMIN" })}" data-v-d74e8ffb> Super Admin </button><button type="button" class="${ssrRenderClass({ active: selectedRole.value === "SUB_ADMIN" })}" data-v-d74e8ffb> Sub-Admin </button></div>`);
			if (authError.value) _push(`<div class="error-banner" role="alert" data-v-d74e8ffb>${ssrInterpolate(authError.value)}</div>`);
			else _push(`<!---->`);
			_push(`<form class="login-form" data-v-d74e8ffb><div class="field" data-v-d74e8ffb><label for="email" data-v-d74e8ffb>Email</label><input id="email"${ssrRenderAttr("value", form.email)} type="email" placeholder="admin@grillvibes.io" data-v-d74e8ffb>`);
			if (errors.email) _push(`<small class="field-error" data-v-d74e8ffb>${ssrInterpolate(errors.email)}</small>`);
			else _push(`<!---->`);
			_push(`</div><div class="field" data-v-d74e8ffb><label for="password" data-v-d74e8ffb>Password</label><input id="password"${ssrRenderAttr("value", form.password)} type="password" placeholder="Enter your password" data-v-d74e8ffb>`);
			if (errors.password) _push(`<small class="field-error" data-v-d74e8ffb>${ssrInterpolate(errors.password)}</small>`);
			else _push(`<!---->`);
			_push(`</div><div class="login-form__meta" data-v-d74e8ffb><label class="checkbox" data-v-d74e8ffb><input${ssrIncludeBooleanAttr(Array.isArray(form.remember) ? ssrLooseContain(form.remember, null) : form.remember) ? " checked" : ""} type="checkbox" data-v-d74e8ffb><span data-v-d74e8ffb>Remember me</span></label><button type="button" class="link-button" data-v-d74e8ffb>Forgot password?</button></div><button type="submit" class="primary-button"${ssrIncludeBooleanAttr(isSubmitting.value) ? " disabled" : ""} data-v-d74e8ffb>${ssrInterpolate(isSubmitting.value ? "Signing in…" : "Sign in")}</button></form><div class="demo-box" data-v-d74e8ffb><p data-v-d74e8ffb>Demo accounts</p><span data-v-d74e8ffb>Super Admin: super@grillvibes.io / password123</span><span data-v-d74e8ffb>Sub-Admin: subadmin@grillvibes.io / password123</span></div></div></div>`);
		};
	}
};
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/pages/AdminLoginPage.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var AdminLoginPage_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-d74e8ffb"]]);
//#endregion
export { AdminLoginPage_default as default };
