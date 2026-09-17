import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-BOaGB7Aw.js";
import { mergeProps, useSSRContext } from "vue";
import "@inertiajs/vue3";
import { ssrIncludeBooleanAttr, ssrInterpolate, ssrRenderAttr, ssrRenderAttrs, ssrRenderClass, ssrRenderList } from "vue/server-renderer";
//#region resources/js/components/ui/Pagination.vue
/**
* Renders the link set from a Laravel LengthAwarePaginator (as serialized into
* Inertia props: { data, links:[{url,label,active}], from, to, total, ... }).
* Navigating issues a partial Inertia visit so only the paginated prop(s) named
* in `only` are re-fetched — the rest of the page's props are reused.
* Labels come from Laravel (« Previous / Next »), so v-html is safe here.
*/
var _sfc_main = {
	__name: "Pagination",
	__ssrInlineRender: true,
	props: {
		paginator: {
			type: Object,
			default: null
		},
		only: {
			type: Array,
			default: () => []
		}
	},
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			if (__props.paginator && __props.paginator.last_page > 1) {
				_push(`<nav${ssrRenderAttrs(mergeProps({
					class: "pager",
					"aria-label": "Pagination"
				}, _attrs))} data-v-8d1ff1f3><span class="pager__info" data-v-8d1ff1f3> Showing <strong data-v-8d1ff1f3>${ssrInterpolate(__props.paginator.from ?? 0)}</strong>–<strong data-v-8d1ff1f3>${ssrInterpolate(__props.paginator.to ?? 0)}</strong> of <strong data-v-8d1ff1f3>${ssrInterpolate(__props.paginator.total)}</strong></span><ul class="pager__links" data-v-8d1ff1f3><!--[-->`);
				ssrRenderList(__props.paginator.links, (link, i) => {
					_push(`<li data-v-8d1ff1f3><button type="button" class="${ssrRenderClass([{
						"pager__btn--active": link.active,
						"pager__btn--disabled": !link.url
					}, "pager__btn"])}"${ssrIncludeBooleanAttr(!link.url) ? " disabled" : ""}${ssrRenderAttr("aria-current", link.active ? "page" : void 0)} data-v-8d1ff1f3>${link.label ?? ""}</button></li>`);
				});
				_push(`<!--]--></ul></nav>`);
			} else _push(`<!---->`);
		};
	}
};
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/components/ui/Pagination.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var Pagination_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-8d1ff1f3"]]);
//#endregion
export { Pagination_default as t };
