import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-BOaGB7Aw.js";
import { t as _sfc_main$2 } from "./FormField-Doe8oR1s.js";
import { computed, mergeProps, ref, unref, useSSRContext, watch } from "vue";
import { useForm, usePage } from "@inertiajs/vue3";
import { ssrIncludeBooleanAttr, ssrInterpolate, ssrLooseContain, ssrRenderAttr, ssrRenderAttrs, ssrRenderClass, ssrRenderComponent, ssrRenderList, ssrRenderSlot } from "vue/server-renderer";
//#region resources/js/layouts/LoginLayout.vue
var _sfc_main$1 = {
	__name: "LoginLayout",
	__ssrInlineRender: true,
	setup(__props) {
		const page = usePage();
		const logoFailed = ref(false);
		const logoUrl = computed(() => page.props.branding?.logo ?? null);
		const brandName = computed(() => page.props.branding?.company || page.props.branding?.name || "GrillVibes");
		const brandInitial = computed(() => brandName.value.trim().charAt(0).toUpperCase() || "G");
		const modules = [
			"POS & Orders",
			"QR Menu",
			"Kitchen Display",
			"Inventory",
			"Procurement",
			"HR & Payroll",
			"Finance",
			"CRM",
			"Reports"
		];
		watch(logoUrl, () => {
			logoFailed.value = false;
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "auth" }, _attrs))} data-v-ae5da6a0><div class="auth__brand-panel" data-v-ae5da6a0><div class="auth__brand" data-v-ae5da6a0><div class="${ssrRenderClass([{ "auth__logo--image": logoUrl.value && !logoFailed.value }, "auth__logo"])}" data-v-ae5da6a0>`);
			if (logoUrl.value && !logoFailed.value) _push(`<img${ssrRenderAttr("src", logoUrl.value)}${ssrRenderAttr("alt", `${brandName.value} logo`)} data-v-ae5da6a0>`);
			else _push(`<span data-v-ae5da6a0>${ssrInterpolate(brandInitial.value)}</span>`);
			_push(`</div><span class="auth__brand-name" data-v-ae5da6a0>${ssrInterpolate(brandName.value)} Admin</span></div><div class="auth__pitch" data-v-ae5da6a0><p class="auth__eyebrow" data-v-ae5da6a0>Restaurant POS &amp; operations platform</p><h2 data-v-ae5da6a0>Run service, stock, staff, and sales from one workspace.</h2><p data-v-ae5da6a0>Sign in to manage POS orders, QR menus, kitchen tickets, inventory, procurement, HR, finance, CRM, reports, and WhatsApp workflows.</p><div class="auth__module-grid" aria-label="Included GrillVibes modules" data-v-ae5da6a0><!--[-->`);
			ssrRenderList(modules, (module) => {
				_push(`<div data-v-ae5da6a0><span data-v-ae5da6a0></span> ${ssrInterpolate(module)}</div>`);
			});
			_push(`<!--]--></div></div><div class="auth__glow auth__glow--1" data-v-ae5da6a0></div><div class="auth__glow auth__glow--2" data-v-ae5da6a0></div></div><div class="auth__form-panel" data-v-ae5da6a0>`);
			ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
			_push(`</div></div>`);
		};
	}
};
var _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/layouts/LoginLayout.vue");
	return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
//#endregion
//#region resources/js/pages/Login.vue
var _sfc_main = /*@__PURE__*/ Object.assign({ layout: /* @__PURE__ */ _plugin_vue_export_helper_default(_sfc_main$1, [["__scopeId", "data-v-ae5da6a0"]]) }, {
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
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "auth-card login-card" }, _attrs))} data-v-a7d1d4b4><div class="login-card__brand" data-v-a7d1d4b4><div class="${ssrRenderClass([{ "login-card__logo--image": logoUrl.value && !logoFailed.value }, "login-card__logo"])}" data-v-a7d1d4b4>`);
			if (logoUrl.value && !logoFailed.value) _push(`<img${ssrRenderAttr("src", logoUrl.value)}${ssrRenderAttr("alt", `${brandName.value} logo`)} data-v-a7d1d4b4>`);
			else _push(`<span data-v-a7d1d4b4>${ssrInterpolate(brandInitial.value)}</span>`);
			_push(`</div><div data-v-a7d1d4b4><span data-v-a7d1d4b4>Secure workspace</span><strong data-v-a7d1d4b4>${ssrInterpolate(brandName.value)}</strong></div></div><p class="login-card__eyebrow" data-v-a7d1d4b4>Admin sign in</p><h1 class="auth-card__title" data-v-a7d1d4b4>Welcome back</h1><p class="auth-card__subtitle" data-v-a7d1d4b4>Sign in to manage your GrillVibes restaurant workspace.</p><form data-v-a7d1d4b4>`);
			_push(ssrRenderComponent(_sfc_main$2, {
				modelValue: unref(form).email,
				"onUpdate:modelValue": ($event) => unref(form).email = $event,
				label: "Email",
				type: "email",
				placeholder: "you@example.com",
				error: unref(form).errors.email
			}, null, _parent));
			_push(ssrRenderComponent(_sfc_main$2, {
				modelValue: unref(form).password,
				"onUpdate:modelValue": ($event) => unref(form).password = $event,
				label: "Password",
				type: "password",
				placeholder: "••••••••",
				error: unref(form).errors.password
			}, null, _parent));
			_push(`<label class="login-card__remember" data-v-a7d1d4b4><input${ssrIncludeBooleanAttr(Array.isArray(unref(form).remember) ? ssrLooseContain(unref(form).remember, null) : unref(form).remember) ? " checked" : ""} type="checkbox" data-v-a7d1d4b4><span data-v-a7d1d4b4>Keep me signed in</span></label><button type="submit" class="ui-btn ui-btn--primary ui-btn--block"${ssrIncludeBooleanAttr(unref(form).processing) ? " disabled" : ""} data-v-a7d1d4b4>${ssrInterpolate(unref(form).processing ? "Signing in…" : "Enter GrillVibes")}</button></form></div>`);
		};
	}
});
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/pages/Login.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var Login_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-a7d1d4b4"]]);
//#endregion
export { Login_default as default };
