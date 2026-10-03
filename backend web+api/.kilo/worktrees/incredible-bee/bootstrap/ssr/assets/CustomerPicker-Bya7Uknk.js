import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-BOaGB7Aw.js";
import { computed, mergeProps, ref, useSSRContext, watch } from "vue";
import { ssrInterpolate, ssrRenderAttr, ssrRenderAttrs, ssrRenderClass, ssrRenderList } from "vue/server-renderer";
//#region resources/js/components/ui/CustomerPicker.vue
/**
* Debounced customer typeahead. The full customer table can hold 100k+ rows and
* is never shipped to the client, so the Orders / POS customer fields resolve
* matches on demand via GET /customers/search (capped, JSON). v-model is the
* selected customer id (or null); `initialName` seeds the visible label when
* editing an order that already has a customer.
*
* `@picked` additionally hands over the whole matched row (or null when cleared)
* for callers that need more than the id — POS reads `loyalty_points_balance`
* off it to offer points redemption without a second request.
*/
var _sfc_main = {
	__name: "CustomerPicker",
	__ssrInlineRender: true,
	props: {
		modelValue: {
			type: [
				String,
				Number,
				null
			],
			default: null
		},
		label: {
			type: String,
			default: ""
		},
		placeholder: {
			type: String,
			default: "Search customer…"
		},
		error: {
			type: String,
			default: ""
		},
		initialName: {
			type: String,
			default: ""
		},
		endpoint: {
			type: String,
			default: "/customers/search"
		}
	},
	emits: ["update:modelValue", "picked"],
	setup(__props, { emit: __emit }) {
		const props = __props;
		const fieldId = computed(() => `cp-${(props.label || "customer").toLowerCase().replace(/\s+/g, "-")}`);
		const text = ref("");
		const selectedName = ref("");
		const results = ref([]);
		const open = ref(false);
		const loading = ref(false);
		const noResults = ref(false);
		const activeIndex = ref(0);
		watch(() => props.modelValue, (id) => {
			if (id === null || id === void 0 || id === "") {
				text.value = "";
				selectedName.value = "";
			} else if (!selectedName.value && props.initialName) {
				selectedName.value = props.initialName;
				text.value = props.initialName;
			}
		}, { immediate: true });
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: ["cpick ui-field", { "ui-field--error": __props.error }] }, _attrs))} data-v-f90435a4>`);
			if (__props.label) _push(`<label class="ui-label"${ssrRenderAttr("for", fieldId.value)} data-v-f90435a4>${ssrInterpolate(__props.label)}</label>`);
			else _push(`<!---->`);
			_push(`<div class="cpick__control" data-v-f90435a4><input${ssrRenderAttr("id", fieldId.value)} class="ui-input cpick__input" type="text" autocomplete="off"${ssrRenderAttr("placeholder", __props.placeholder)}${ssrRenderAttr("value", text.value)} data-v-f90435a4>`);
			if (loading.value) _push(`<span class="cpick__spinner" aria-hidden="true" data-v-f90435a4></span>`);
			else if (text.value) _push(`<button type="button" class="cpick__clear" aria-label="Clear selection" data-v-f90435a4> × </button>`);
			else _push(`<!---->`);
			_push(`</div>`);
			if (open.value) {
				_push(`<ul class="cpick__menu" role="listbox" data-v-f90435a4>`);
				if (loading.value) _push(`<li class="cpick__state" data-v-f90435a4>Searching…</li>`);
				else if (noResults.value) _push(`<li class="cpick__state" data-v-f90435a4>No customers found.</li>`);
				else {
					_push(`<!--[-->`);
					ssrRenderList(results.value, (c, i) => {
						_push(`<li class="${ssrRenderClass([{ "cpick__option--active": i === activeIndex.value }, "cpick__option"])}" role="option"${ssrRenderAttr("aria-selected", i === activeIndex.value)} data-v-f90435a4><span class="cpick__name" data-v-f90435a4>${ssrInterpolate(c.name)}</span>`);
						if (c.contact) _push(`<span class="cpick__contact" data-v-f90435a4>${ssrInterpolate(c.contact)}</span>`);
						else _push(`<!---->`);
						_push(`</li>`);
					});
					_push(`<!--]-->`);
				}
				_push(`</ul>`);
			} else _push(`<!---->`);
			if (__props.error) _push(`<p class="ui-field__error" data-v-f90435a4>${ssrInterpolate(__props.error)}</p>`);
			else _push(`<!---->`);
			_push(`</div>`);
		};
	}
};
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/components/ui/CustomerPicker.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var CustomerPicker_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-f90435a4"]]);
//#endregion
export { CustomerPicker_default as t };
