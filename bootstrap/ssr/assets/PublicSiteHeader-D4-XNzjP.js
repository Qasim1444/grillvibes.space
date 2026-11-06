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
		}
	},
	setup(__props) {
		const menuOpen = ref(false);
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<header${ssrRenderAttrs(mergeProps({ class: "public-header" }, _attrs))} data-v-3c9f2457><a class="public-header__brand" href="/" aria-label="GrillVibes home" data-v-3c9f2457><img${ssrRenderAttr("src", unref(grillvibes_logo_default))} alt="GrillVibes" data-v-3c9f2457><span data-v-3c9f2457>Grill<span data-v-3c9f2457>Vibes</span></span></a><nav class="${ssrRenderClass([{ "public-header__nav--open": menuOpen.value }, "public-header__nav"])}" aria-label="Primary navigation" data-v-3c9f2457><!--[-->`);
			ssrRenderList(__props.items, (item) => {
				_push(`<a${ssrRenderAttr("href", item.href)} class="${ssrRenderClass({ "is-active": item.label === __props.activeItem })}"${ssrRenderAttr("aria-current", item.label === __props.activeItem ? "page" : void 0)} data-v-3c9f2457>${ssrInterpolate(item.label)}</a>`);
			});
			_push(`<!--]--></nav><div class="public-header__actions" data-v-3c9f2457><a class="public-header__sign-in" href="/login" data-v-3c9f2457>Sign In</a><a class="public-header__cta"${ssrRenderAttr("href", __props.actionHref)} data-v-3c9f2457>${ssrInterpolate(__props.actionLabel)}<span aria-hidden="true" data-v-3c9f2457>↗</span></a><button class="public-header__toggle" type="button"${ssrRenderAttr("aria-expanded", menuOpen.value)} aria-label="Toggle navigation" data-v-3c9f2457><span data-v-3c9f2457></span><span data-v-3c9f2457></span><span data-v-3c9f2457></span></button></div></header>`);
		};
	}
};
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/components/PublicSiteHeader.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var PublicSiteHeader_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-3c9f2457"]]);
//#endregion
export { grillvibes_logo_default as n, PublicSiteHeader_default as t };
