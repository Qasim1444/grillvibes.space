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
			_push(`<header${ssrRenderAttrs(mergeProps({ class: "public-header" }, _attrs))} data-v-a452fcfe><a class="public-header__brand" href="/" aria-label="GrillVibes home" data-v-a452fcfe><img${ssrRenderAttr("src", unref(grillvibes_logo_default))} alt="GrillVibes" data-v-a452fcfe><span data-v-a452fcfe>Grill<span data-v-a452fcfe>Vibes</span></span></a><nav class="${ssrRenderClass([{ "public-header__nav--open": menuOpen.value }, "public-header__nav"])}" aria-label="Primary navigation" data-v-a452fcfe><!--[-->`);
			ssrRenderList(__props.items, (item) => {
				_push(`<a${ssrRenderAttr("href", item.href)} class="${ssrRenderClass({ "is-active": item.label === __props.activeItem })}"${ssrRenderAttr("aria-current", item.label === __props.activeItem ? "page" : void 0)} data-v-a452fcfe>${ssrInterpolate(item.label)}</a>`);
			});
			_push(`<!--]--></nav><div class="public-header__actions" data-v-a452fcfe><button class="public-header__theme" type="button"${ssrRenderAttr("aria-label", __props.theme === "dark" ? "Switch to light mode" : "Switch to dark mode")}${ssrRenderAttr("title", __props.theme === "dark" ? "Switch to light mode" : "Switch to dark mode")} data-v-a452fcfe>${ssrInterpolate(__props.theme === "dark" ? "☀" : "☾")}</button><a class="public-header__sign-in" href="/login" data-v-a452fcfe>Sign In</a><a class="public-header__cta"${ssrRenderAttr("href", __props.actionHref)} data-v-a452fcfe>${ssrInterpolate(__props.actionLabel)}<span aria-hidden="true" data-v-a452fcfe>↗</span></a><button class="public-header__toggle" type="button"${ssrRenderAttr("aria-expanded", menuOpen.value)} aria-label="Toggle navigation" data-v-a452fcfe><span data-v-a452fcfe></span><span data-v-a452fcfe></span><span data-v-a452fcfe></span></button></div></header>`);
		};
	}
};
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/components/PublicSiteHeader.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var PublicSiteHeader_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-a452fcfe"]]);
//#endregion
export { grillvibes_logo_default as n, PublicSiteHeader_default as t };
