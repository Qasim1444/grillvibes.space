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
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "auth" }, _attrs))} data-v-33d165eb><div class="auth__brand-panel" data-v-33d165eb><div class="auth__brand" data-v-33d165eb><div class="${ssrRenderClass([{ "auth__logo--image": logoUrl.value && !logoFailed.value }, "auth__logo"])}" data-v-33d165eb>`);
			if (logoUrl.value && !logoFailed.value) _push(`<img${ssrRenderAttr("src", logoUrl.value)}${ssrRenderAttr("alt", `${brandName.value} logo`)} data-v-33d165eb>`);
			else _push(`<span data-v-33d165eb>${ssrInterpolate(brandInitial.value)}</span>`);
			_push(`</div><span class="auth__brand-name" data-v-33d165eb>${ssrInterpolate(brandName.value)} Admin</span></div><div class="auth__pitch" data-v-33d165eb><p class="auth__eyebrow" data-v-33d165eb>Restaurant POS &amp; operations platform</p><h2 data-v-33d165eb>Run service, stock, staff, and sales from one workspace.</h2><p data-v-33d165eb>Sign in to manage POS orders, QR menus, kitchen tickets, inventory, procurement, HR, finance, CRM, reports, and WhatsApp workflows.</p><div class="auth__module-grid" aria-label="Included GrillVibes modules" data-v-33d165eb><!--[-->`);
			ssrRenderList(modules, (module) => {
				_push(`<div data-v-33d165eb><span data-v-33d165eb></span> ${ssrInterpolate(module)}</div>`);
			});
			_push(`<!--]--></div></div><div class="auth__metric-row" aria-label="Project highlights" data-v-33d165eb><div data-v-33d165eb><strong data-v-33d165eb>40+</strong><span data-v-33d165eb>Models</span></div><div data-v-33d165eb><strong data-v-33d165eb>POS</strong><span data-v-33d165eb>Ready</span></div><div data-v-33d165eb><strong data-v-33d165eb>API</strong><span data-v-33d165eb>Sanctum</span></div></div><div class="auth__glow auth__glow--1" data-v-33d165eb></div><div class="auth__glow auth__glow--2" data-v-33d165eb></div></div><div class="auth__form-panel" data-v-33d165eb>`);
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
var _sfc_main = /*@__PURE__*/ Object.assign({ layout: /* @__PURE__ */ _plugin_vue_export_helper_default(_sfc_main$1, [["__scopeId", "data-v-33d165eb"]]) }, {
	__name: "Login",
	__ssrInlineRender: true,
	setup(__props) {
		const page = usePage();
		const logoFailed = ref(false);
		const logoUrl = computed(() => page.props.branding?.logo ?? null);
		const brandName = computed(() => page.props.branding?.company || page.props.branding?.name || "GrillVibes");
		const brandInitial = computed(() => brandName.value.trim().charAt(0).toUpperCase() || "G");
		const features = [
			"POS",
			"QR Menu",
			"KDS",
			"Inventory",
			"Payroll",
			"Finance",
			"CRM",
			"Reports"
		];
		const form = useForm({
			email: "",
			password: "",
			remember: false
		});
		watch(logoUrl, () => {
			logoFailed.value = false;
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "auth-card login-card" }, _attrs))} data-v-fbf42ba7><div class="login-card__brand" data-v-fbf42ba7><div class="${ssrRenderClass([{ "login-card__logo--image": logoUrl.value && !logoFailed.value }, "login-card__logo"])}" data-v-fbf42ba7>`);
			if (logoUrl.value && !logoFailed.value) _push(`<img${ssrRenderAttr("src", logoUrl.value)}${ssrRenderAttr("alt", `${brandName.value} logo`)} data-v-fbf42ba7>`);
			else _push(`<span data-v-fbf42ba7>${ssrInterpolate(brandInitial.value)}</span>`);
			_push(`</div><div data-v-fbf42ba7><span data-v-fbf42ba7>Secure workspace</span><strong data-v-fbf42ba7>${ssrInterpolate(brandName.value)}</strong></div></div><p class="login-card__eyebrow" data-v-fbf42ba7>Admin sign in</p><h1 class="auth-card__title" data-v-fbf42ba7>Welcome back</h1><p class="auth-card__subtitle" data-v-fbf42ba7>Access POS, kitchen display, inventory, procurement, HR, finance, CRM, reservations, and reports.</p><div class="login-card__features" aria-label="Available modules" data-v-fbf42ba7><!--[-->`);
			ssrRenderList(features, (feature) => {
				_push(`<span data-v-fbf42ba7>${ssrInterpolate(feature)}</span>`);
			});
			_push(`<!--]--></div><form data-v-fbf42ba7>`);
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
			_push(`<label class="login-card__remember" data-v-fbf42ba7><input${ssrIncludeBooleanAttr(Array.isArray(unref(form).remember) ? ssrLooseContain(unref(form).remember, null) : unref(form).remember) ? " checked" : ""} type="checkbox" data-v-fbf42ba7><span data-v-fbf42ba7>Keep me signed in</span></label><button type="submit" class="ui-btn ui-btn--primary ui-btn--block"${ssrIncludeBooleanAttr(unref(form).processing) ? " disabled" : ""} data-v-fbf42ba7>${ssrInterpolate(unref(form).processing ? "Signing in…" : "Enter GrillVibes")}</button></form></div>`);
		};
	}
});
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/pages/Login.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var Login_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-fbf42ba7"]]);
//#endregion
export { Login_default as default };
