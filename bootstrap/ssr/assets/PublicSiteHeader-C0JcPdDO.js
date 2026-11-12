import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-BOaGB7Aw.js";
import { mergeProps, ref, unref, useSSRContext } from "vue";
import { ssrInterpolate, ssrRenderAttr, ssrRenderAttrs, ssrRenderClass, ssrRenderList } from "vue/server-renderer";
//#region resources/js/assets/grillvibes-logo.png
var grillvibes_logo_default = "/build/assets/grillvibes-logo-DW_m9BSw.png";
//#endregion
//#region resources/js/components/PublicSiteHeader.vue
var _sfc_main = {
	__name: "PublicSiteHeader",
	__ssrInlineRender: true,
	props: {
		items: {
			type: Array,
			default: () => []
		},
		activeItem: {
			type: String,
			default: ""
		},
		actionLabel: {
			type: String,
			default: "Book a Table"
		},
		actionHref: {
			type: String,
			default: "/#reserve"
		},
		theme: {
			type: String,
			default: "dark"
		}
	},
	emits: ["toggle-theme"],
	setup(__props) {
		const menuOpen = ref(false);
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<header${ssrRenderAttrs(mergeProps({ class: "public-header" }, _attrs))} data-v-8f996518><a class="public-header__brand" href="/" aria-label="GrillVibes home" data-v-8f996518><img${ssrRenderAttr("src", unref(grillvibes_logo_default))} alt="GrillVibes" data-v-8f996518><span data-v-8f996518>Grill<span data-v-8f996518>Vibes</span></span></a><nav class="${ssrRenderClass([{ "public-header__nav--open": menuOpen.value }, "public-header__nav"])}" aria-label="Primary navigation" data-v-8f996518><!--[-->`);
			ssrRenderList(__props.items, (item) => {
				_push(`<a${ssrRenderAttr("href", item.href)} class="${ssrRenderClass({ "is-active": item.label === __props.activeItem })}"${ssrRenderAttr("aria-current", item.label === __props.activeItem ? "page" : void 0)} data-v-8f996518>${ssrInterpolate(item.label)}</a>`);
			});
			_push(`<!--]--></nav><div class="public-header__actions" data-v-8f996518><button class="public-header__theme" type="button"${ssrRenderAttr("aria-label", __props.theme === "dark" ? "Switch to light mode" : "Switch to dark mode")}${ssrRenderAttr("title", __props.theme === "dark" ? "Switch to light mode" : "Switch to dark mode")} data-v-8f996518>`);
			if (__props.theme === "dark") _push(`<svg class="public-header__theme-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" data-v-8f996518><circle cx="12" cy="12" r="4" data-v-8f996518></circle><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" data-v-8f996518></path></svg>`);
			else _push(`<svg class="public-header__theme-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" data-v-8f996518><path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z" data-v-8f996518></path><path d="M18 3v2m2-1h-2" data-v-8f996518></path></svg>`);
			_push(`</button><a class="public-header__sign-in" href="/login" data-v-8f996518>Sign In</a><a class="public-header__cta"${ssrRenderAttr("href", __props.actionHref)} data-v-8f996518>${ssrInterpolate(__props.actionLabel)}<span aria-hidden="true" data-v-8f996518>↗</span></a><button class="public-header__toggle" type="button"${ssrRenderAttr("aria-expanded", menuOpen.value)} aria-label="Toggle navigation" data-v-8f996518><span data-v-8f996518></span><span data-v-8f996518></span><span data-v-8f996518></span></button></div></header>`);
		};
	}
};
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/components/PublicSiteHeader.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var PublicSiteHeader_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-8f996518"]]);
//#endregion
export { grillvibes_logo_default as n, PublicSiteHeader_default as t };
