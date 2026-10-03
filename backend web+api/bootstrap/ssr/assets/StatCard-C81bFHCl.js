import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-BOaGB7Aw.js";
import { computed, mergeProps, useSSRContext } from "vue";
import { ssrInterpolate, ssrRenderAttrs, ssrRenderClass, ssrRenderSlot, ssrRenderStyle } from "vue/server-renderer";
//#region resources/js/components/ui/StatCard.vue
var _sfc_main = {
	__name: "StatCard",
	__ssrInlineRender: true,
	props: {
		label: {
			type: String,
			required: true
		},
		value: {
			type: [String, Number],
			default: "—"
		},
		hint: {
			type: String,
			default: ""
		},
		color: {
			type: String,
			default: "var(--brand)"
		},
		tint: {
			type: String,
			default: "var(--brand-soft)"
		},
		trend: {
			type: String,
			default: ""
		},
		trendDir: {
			type: String,
			default: "up"
		}
	},
	setup(__props) {
		const props = __props;
		const trendClass = computed(() => `stat-card__trend--${props.trendDir}`);
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "ui-card stat-card" }, _attrs))} data-v-1947894d><div class="stat-card__top" data-v-1947894d><span class="stat-card__label" data-v-1947894d>${ssrInterpolate(__props.label)}</span><div class="stat-card__icon" style="${ssrRenderStyle({
				background: __props.tint,
				color: __props.color
			})}" data-v-1947894d>`);
			ssrRenderSlot(_ctx.$slots, "icon", {}, () => {
				_push(`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" data-v-1947894d><path d="M3 3v18h18" data-v-1947894d></path><path d="m7 14 4-4 3 3 5-5" data-v-1947894d></path></svg>`);
			}, _push, _parent);
			_push(`</div></div><div class="stat-card__value" data-v-1947894d>${ssrInterpolate(__props.value)}</div>`);
			if (__props.hint) {
				_push(`<div class="stat-card__caption" data-v-1947894d><span data-v-1947894d>${ssrInterpolate(__props.hint)}</span>`);
				if (__props.trend) _push(`<span class="${ssrRenderClass([trendClass.value, "stat-card__trend"])}" data-v-1947894d>${ssrInterpolate(__props.trend)}</span>`);
				else _push(`<!---->`);
				_push(`</div>`);
			} else _push(`<!---->`);
			_push(`</div>`);
		};
	}
};
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/components/ui/StatCard.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var StatCard_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-1947894d"]]);
//#endregion
export { StatCard_default as t };
