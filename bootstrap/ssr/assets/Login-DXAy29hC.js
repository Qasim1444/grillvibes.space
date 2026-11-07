import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-BOaGB7Aw.js";
import { t as _sfc_main$1 } from "./FormField-Doe8oR1s.js";
import { t as LoginLayout_default } from "./LoginLayout-BkzPHLqf.js";
import { computed, createTextVNode, mergeProps, ref, unref, useSSRContext, watch, withCtx } from "vue";
import { Link, useForm, usePage } from "@inertiajs/vue3";
import { ssrIncludeBooleanAttr, ssrInterpolate, ssrLooseContain, ssrRenderAttr, ssrRenderAttrs, ssrRenderClass, ssrRenderComponent } from "vue/server-renderer";
//#region resources/js/pages/Login.vue
var _sfc_main = /*@__PURE__*/ Object.assign({ layout: LoginLayout_default }, {
	__name: "Login",
	__ssrInlineRender: true,
	setup(__props) {
		const page = usePage();
		const logoFailed = ref(false);
		const logoUrl = computed(() => page.props.branding?.logo ?? null);
		const brandName = computed(() => page.props.branding?.company || page.props.branding?.name || "GrillVibes");
		const brandInitial = computed(() => brandName.value.trim().charAt(0).toUpperCase() || "G");
		const demoCredentials = page.props.demoCredentials ?? {};
		const form = useForm({
			email: demoCredentials.email ?? "",
			password: demoCredentials.password ?? "",
			remember: false
		});
		watch(logoUrl, () => {
			logoFailed.value = false;
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "auth-card login-card" }, _attrs))} data-v-b41c107e><div class="login-card__brand" data-v-b41c107e><div class="${ssrRenderClass([{ "login-card__logo--image": logoUrl.value && !logoFailed.value }, "login-card__logo"])}" data-v-b41c107e>`);
			if (logoUrl.value && !logoFailed.value) _push(`<img${ssrRenderAttr("src", logoUrl.value)}${ssrRenderAttr("alt", `${brandName.value} logo`)} data-v-b41c107e>`);
			else _push(`<span data-v-b41c107e>${ssrInterpolate(brandInitial.value)}</span>`);
			_push(`</div><div data-v-b41c107e><span data-v-b41c107e>Secure workspace</span><strong data-v-b41c107e>${ssrInterpolate(brandName.value)}</strong></div></div><p class="login-card__eyebrow" data-v-b41c107e>Admin sign in</p><h1 class="auth-card__title" data-v-b41c107e>Welcome back</h1><p class="auth-card__subtitle" data-v-b41c107e>Sign in to manage your GrillVibes restaurant workspace.</p><form data-v-b41c107e>`);
			_push(ssrRenderComponent(_sfc_main$1, {
				modelValue: unref(form).email,
				"onUpdate:modelValue": ($event) => unref(form).email = $event,
				label: "Email",
				type: "email",
				placeholder: "you@example.com",
				error: unref(form).errors.email
			}, null, _parent));
			_push(ssrRenderComponent(_sfc_main$1, {
				modelValue: unref(form).password,
				"onUpdate:modelValue": ($event) => unref(form).password = $event,
				label: "Password",
				type: "password",
				placeholder: "••••••••",
				error: unref(form).errors.password
			}, null, _parent));
			_push(`<label class="login-card__remember" data-v-b41c107e><input${ssrIncludeBooleanAttr(Array.isArray(unref(form).remember) ? ssrLooseContain(unref(form).remember, null) : unref(form).remember) ? " checked" : ""} type="checkbox" data-v-b41c107e><span data-v-b41c107e>Keep me signed in</span></label><div class="login-card__actions" data-v-b41c107e>`);
			_push(ssrRenderComponent(unref(Link), { href: "/forgot-password" }, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`Forgot password?`);
					else return [createTextVNode("Forgot password?")];
				}),
				_: 1
			}, _parent));
			_push(`</div><button type="submit" class="ui-btn ui-btn--primary ui-btn--block"${ssrIncludeBooleanAttr(unref(form).processing) ? " disabled" : ""} data-v-b41c107e>${ssrInterpolate(unref(form).processing ? "Signing in…" : "Enter GrillVibes")}</button></form></div>`);
		};
	}
});
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/pages/Login.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var Login_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-b41c107e"]]);
//#endregion
export { Login_default as default };
