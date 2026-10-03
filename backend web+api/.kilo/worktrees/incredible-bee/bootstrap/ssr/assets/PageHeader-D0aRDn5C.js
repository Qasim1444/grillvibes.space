import { mergeProps, useSSRContext } from "vue";
import { ssrInterpolate, ssrRenderAttrs, ssrRenderSlot } from "vue/server-renderer";
//#region resources/js/components/ui/PageHeader.vue
var _sfc_main = {
	__name: "PageHeader",
	__ssrInlineRender: true,
	props: {
		title: {
			type: String,
			required: true
		},
		subtitle: {
			type: String,
			default: ""
		}
	},
	setup(__props) {
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<header${ssrRenderAttrs(mergeProps({ class: "page-header" }, _attrs))}><div><h1 class="page-header__title">${ssrInterpolate(__props.title)}</h1>`);
			if (__props.subtitle) _push(`<p class="page-header__subtitle">${ssrInterpolate(__props.subtitle)}</p>`);
			else _push(`<!---->`);
			_push(`</div>`);
			if (_ctx.$slots.actions) {
				_push(`<div class="page-header__actions">`);
				ssrRenderSlot(_ctx.$slots, "actions", {}, null, _push, _parent);
				_push(`</div>`);
			} else _push(`<!---->`);
			_push(`</header>`);
		};
	}
};
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/components/ui/PageHeader.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
//#endregion
export { _sfc_main as t };
