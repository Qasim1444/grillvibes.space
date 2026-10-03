import { t as _sfc_main$1 } from "./FormField-Doe8oR1s.js";
import "./api-DWk_W29k.js";
import { createTextVNode, mergeProps, ref, resolveComponent, useSSRContext, withCtx } from "vue";
import { ssrIncludeBooleanAttr, ssrInterpolate, ssrRenderAttrs, ssrRenderComponent } from "vue/server-renderer";
import { useRouter } from "vue-router";
//#region resources/js/pages/Register.vue
var _sfc_main = {
	__name: "Register",
	__ssrInlineRender: true,
	setup(__props) {
		useRouter();
		const form = ref({
			name: "",
			email: "",
			password: "",
			password_confirmation: ""
		});
		const loading = ref(false);
		const error = ref("");
		return (_ctx, _push, _parent, _attrs) => {
			const _component_router_link = resolveComponent("router-link");
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "auth-card" }, _attrs))}><h1 class="auth-card__title">Create account</h1><p class="auth-card__subtitle">Register a new admin account.</p>`);
			if (error.value) _push(`<div class="ui-alert ui-alert--danger">${ssrInterpolate(error.value)}</div>`);
			else _push(`<!---->`);
			_push(`<form>`);
			_push(ssrRenderComponent(_sfc_main$1, {
				modelValue: form.value.name,
				"onUpdate:modelValue": ($event) => form.value.name = $event,
				label: "Name",
				placeholder: "Full name"
			}, null, _parent));
			_push(ssrRenderComponent(_sfc_main$1, {
				modelValue: form.value.email,
				"onUpdate:modelValue": ($event) => form.value.email = $event,
				label: "Email",
				type: "email",
				placeholder: "you@example.com"
			}, null, _parent));
			_push(ssrRenderComponent(_sfc_main$1, {
				modelValue: form.value.password,
				"onUpdate:modelValue": ($event) => form.value.password = $event,
				label: "Password",
				type: "password",
				placeholder: "••••••••"
			}, null, _parent));
			_push(ssrRenderComponent(_sfc_main$1, {
				modelValue: form.value.password_confirmation,
				"onUpdate:modelValue": ($event) => form.value.password_confirmation = $event,
				label: "Confirm Password",
				type: "password",
				placeholder: "••••••••"
			}, null, _parent));
			_push(`<button type="submit" class="ui-btn ui-btn--primary ui-btn--block"${ssrIncludeBooleanAttr(loading.value) ? " disabled" : ""}>${ssrInterpolate(loading.value ? "Creating…" : "Register")}</button></form><div class="auth-card__footer"> Already have an account? `);
			_push(ssrRenderComponent(_component_router_link, { to: "/login" }, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`Sign in`);
					else return [createTextVNode("Sign in")];
				}),
				_: 1
			}, _parent));
			_push(`</div></div>`);
		};
	}
};
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/pages/Register.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
//#endregion
export { _sfc_main as default };
