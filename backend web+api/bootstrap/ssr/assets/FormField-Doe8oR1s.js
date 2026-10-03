import { computed, mergeProps, useSSRContext } from "vue";
import { ssrIncludeBooleanAttr, ssrInterpolate, ssrRenderAttr, ssrRenderAttrs, ssrRenderSlot } from "vue/server-renderer";
//#region resources/js/components/ui/FormField.vue
var _sfc_main = {
	__name: "FormField",
	__ssrInlineRender: true,
	props: {
		modelValue: {
			type: [
				String,
				Number,
				Boolean,
				null
			],
			default: ""
		},
		label: {
			type: String,
			default: ""
		},
		type: {
			type: String,
			default: "text"
		},
		placeholder: {
			type: String,
			default: ""
		},
		step: {
			type: String,
			default: null
		},
		readonly: {
			type: Boolean,
			default: false
		},
		multiple: {
			type: Boolean,
			default: false
		},
		error: {
			type: String,
			default: ""
		}
	},
	emits: ["update:modelValue"],
	setup(__props) {
		const props = __props;
		const fieldId = computed(() => `f-${(props.label || props.placeholder || "field").toLowerCase().replace(/\s+/g, "-")}`);
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: ["ui-field", { "ui-field--error": __props.error }] }, _attrs))}>`);
			if (__props.label) _push(`<label class="ui-label"${ssrRenderAttr("for", fieldId.value)}>${ssrInterpolate(__props.label)}</label>`);
			else _push(`<!---->`);
			if (__props.type === "select") {
				_push(`<select${ssrRenderAttr("id", fieldId.value)} class="ui-select"${ssrIncludeBooleanAttr(__props.multiple) ? " multiple" : ""}${ssrRenderAttr("value", __props.modelValue)}>`);
				ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
				_push(`</select>`);
			} else if (__props.type === "textarea") _push(`<textarea${ssrRenderAttr("id", fieldId.value)} class="ui-textarea"${ssrRenderAttr("placeholder", __props.placeholder)}>${ssrInterpolate(__props.modelValue)}</textarea>`);
			else _push(`<input${ssrRenderAttr("id", fieldId.value)} class="ui-input"${ssrRenderAttr("type", __props.type)}${ssrRenderAttr("placeholder", __props.placeholder)}${ssrRenderAttr("step", __props.step)}${ssrIncludeBooleanAttr(__props.readonly) ? " readonly" : ""}${ssrRenderAttr("value", __props.modelValue)}>`);
			if (__props.error) _push(`<p class="ui-field__error">${ssrInterpolate(__props.error)}</p>`);
			else _push(`<!---->`);
			ssrRenderSlot(_ctx.$slots, "hint", {}, null, _push, _parent);
			_push(`</div>`);
		};
	}
};
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/components/ui/FormField.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
//#endregion
export { _sfc_main as t };
