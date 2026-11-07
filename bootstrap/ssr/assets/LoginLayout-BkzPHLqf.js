import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-BOaGB7Aw.js";
import { computed, mergeProps, ref, useSSRContext, watch } from "vue";
import { usePage } from "@inertiajs/vue3";
import { ssrInterpolate, ssrRenderAttr, ssrRenderAttrs, ssrRenderClass, ssrRenderList, ssrRenderSlot } from "vue/server-renderer";
//#region resources/js/layouts/LoginLayout.vue
var _sfc_main = {
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
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/layouts/LoginLayout.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var LoginLayout_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-ae5da6a0"]]);
//#endregion
export { LoginLayout_default as t };
