import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-BOaGB7Aw.js";
import { computed, mergeProps, ref, useSSRContext } from "vue";
import { ssrInterpolate, ssrRenderAttr, ssrRenderAttrs, ssrRenderList, ssrRenderSlot, ssrRenderStyle } from "vue/server-renderer";
//#region resources/js/components/ui/DataTable.vue
var _sfc_main = {
	__name: "DataTable",
	__ssrInlineRender: true,
	props: {
		columns: {
			type: Array,
			required: true
		},
		rows: {
			type: Array,
			default: () => []
		},
		index: {
			type: Boolean,
			default: false
		},
		searchable: {
			type: Boolean,
			default: false
		},
		searchPlaceholder: {
			type: String,
			default: "Search…"
		},
		emptyText: {
			type: String,
			default: "No records found."
		},
		query: {
			type: String,
			default: null
		}
	},
	emits: ["update:query"],
	setup(__props, { emit: __emit }) {
		const props = __props;
		const emit = __emit;
		const internalQuery = ref("");
		const serverMode = computed(() => props.query !== null);
		const queryValue = computed({
			get: () => serverMode.value ? props.query : internalQuery.value,
			set: (v) => {
				if (serverMode.value) emit("update:query", v);
				else internalQuery.value = v;
			}
		});
		const totalColumns = computed(() => props.columns.length + (props.index ? 1 : 0) + 1);
		const filteredRows = computed(() => {
			if (serverMode.value || !props.searchable || !internalQuery.value.trim()) return props.rows;
			const q = internalQuery.value.toLowerCase();
			return props.rows.filter((row) => props.columns.some((col) => String(row[col.key] ?? "").toLowerCase().includes(q)));
		});
		function formatCell(row, col) {
			const value = row[col.key];
			return col.format ? col.format(value, row) : value;
		}
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "ui-card" }, _attrs))} data-v-63b058e4>`);
			if (__props.searchable) _push(`<div class="data-table__toolbar" data-v-63b058e4><div class="data-table__search" data-v-63b058e4><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" data-v-63b058e4><circle cx="11" cy="11" r="7" data-v-63b058e4></circle><path d="m21 21-4.3-4.3" data-v-63b058e4></path></svg><input${ssrRenderAttr("value", queryValue.value)} class="data-table__search-input" type="text"${ssrRenderAttr("placeholder", __props.searchPlaceholder)} data-v-63b058e4></div></div>`);
			else _push(`<!---->`);
			_push(`<div class="data-table-wrap" data-v-63b058e4><table class="data-table" data-v-63b058e4><thead data-v-63b058e4><tr data-v-63b058e4>`);
			if (__props.index) _push(`<th style="${ssrRenderStyle({ "width": "56px" })}" data-v-63b058e4>#</th>`);
			else _push(`<!---->`);
			_push(`<!--[-->`);
			ssrRenderList(__props.columns, (col) => {
				_push(`<th style="${ssrRenderStyle(col.width ? { width: col.width } : null)}" data-v-63b058e4>${ssrInterpolate(col.label)}</th>`);
			});
			_push(`<!--]-->`);
			if (_ctx.$slots.actions) _push(`<th style="${ssrRenderStyle({ "text-align": "right" })}" data-v-63b058e4>Actions</th>`);
			else _push(`<!---->`);
			_push(`</tr></thead><tbody data-v-63b058e4>`);
			if (filteredRows.value.length === 0) _push(`<tr data-v-63b058e4><td class="data-table__empty"${ssrRenderAttr("colspan", totalColumns.value)} data-v-63b058e4>${ssrInterpolate(__props.emptyText)}</td></tr>`);
			else _push(`<!---->`);
			_push(`<!--[-->`);
			ssrRenderList(filteredRows.value, (row, i) => {
				_push(`<tr data-v-63b058e4>`);
				if (__props.index) _push(`<td data-v-63b058e4>${ssrInterpolate(i + 1)}</td>`);
				else _push(`<!---->`);
				_push(`<!--[-->`);
				ssrRenderList(__props.columns, (col) => {
					_push(`<td data-v-63b058e4>`);
					ssrRenderSlot(_ctx.$slots, `cell:${col.key}`, {
						row,
						value: row[col.key]
					}, () => {
						_push(`${ssrInterpolate(formatCell(row, col))}`);
					}, _push, _parent);
					_push(`</td>`);
				});
				_push(`<!--]-->`);
				if (_ctx.$slots.actions) {
					_push(`<td data-v-63b058e4><div class="data-table__actions" data-v-63b058e4>`);
					ssrRenderSlot(_ctx.$slots, "actions", { row }, null, _push, _parent);
					_push(`</div></td>`);
				} else _push(`<!---->`);
				_push(`</tr>`);
			});
			_push(`<!--]--></tbody></table></div></div>`);
		};
	}
};
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/components/ui/DataTable.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var DataTable_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-63b058e4"]]);
//#endregion
export { DataTable_default as t };
