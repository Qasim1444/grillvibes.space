import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-BOaGB7Aw.js";
import { onBeforeUnmount, useSSRContext, watch } from "vue";
import { ssrInterpolate, ssrRenderClass, ssrRenderSlot, ssrRenderStyle, ssrRenderTeleport } from "vue/server-renderer";
//#region resources/js/components/ui/Modal.vue
var _sfc_main = {
	__name: "Modal",
	__ssrInlineRender: true,
	props: {
		modelValue: {
			type: Boolean,
			default: false
		},
		title: {
			type: String,
			default: ""
		},
		width: {
			type: String,
			default: "520px"
		},
		hideHeader: {
			type: Boolean,
			default: false
		},
		flush: {
			type: Boolean,
			default: false
		}
	},
	emits: ["update:modelValue"],
	setup(__props, { emit: __emit }) {
		const props = __props;
		const emit = __emit;
		const close = () => emit("update:modelValue", false);
		const onKey = (e) => {
			if (e.key === "Escape" && props.modelValue) close();
		};
		watch(() => props.modelValue, (open) => {
			document.body.style.overflow = open ? "hidden" : "";
			if (open) window.addEventListener("keydown", onKey);
			else window.removeEventListener("keydown", onKey);
		});
		onBeforeUnmount(() => {
			document.body.style.overflow = "";
			window.removeEventListener("keydown", onKey);
		});
		return (_ctx, _push, _parent, _attrs) => {
			ssrRenderTeleport(_push, (_push) => {
				if (__props.modelValue) {
					_push(`<div class="ui-modal" data-v-6645298d><div class="ui-modal__dialog" style="${ssrRenderStyle({ maxWidth: __props.width })}" data-v-6645298d>`);
					if (!__props.hideHeader) _push(`<div class="ui-modal__header" data-v-6645298d><h5 class="ui-modal__title" data-v-6645298d>${ssrInterpolate(__props.title)}</h5><button class="ui-modal__close" type="button" aria-label="Close" data-v-6645298d> × </button></div>`);
					else _push(`<!---->`);
					_push(`<div class="${ssrRenderClass([{ "ui-modal__body--flush": __props.flush }, "ui-modal__body"])}" data-v-6645298d>`);
					ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
					_push(`</div>`);
					if (_ctx.$slots.footer) {
						_push(`<div class="ui-modal__footer" data-v-6645298d>`);
						ssrRenderSlot(_ctx.$slots, "footer", {}, null, _push, _parent);
						_push(`</div>`);
					} else _push(`<!---->`);
					_push(`</div></div>`);
				} else _push(`<!---->`);
			}, "body", false, _parent);
		};
	}
};
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/components/ui/Modal.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var Modal_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-6645298d"]]);
//#endregion
export { Modal_default as t };
