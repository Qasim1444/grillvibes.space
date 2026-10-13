import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-BOaGB7Aw.js";
import "./useNotifications-CvzCW6Mx.js";
import { n as usePermissions, t as AdminLayout_default } from "./AdminLayout-D618cxCi.js";
import { t as _sfc_main$1 } from "./PageHeader-D0aRDn5C.js";
import { t as Modal_default } from "./Modal-CpmFAnsY.js";
import { t as _sfc_main$2 } from "./FormField-Doe8oR1s.js";
import { Fragment, createBlock, createCommentVNode, createVNode, mergeProps, openBlock, ref, renderList, toDisplayString, unref, useSSRContext, vModelSelect, watch, withCtx, withDirectives } from "vue";
import { router, useForm } from "@inertiajs/vue3";
import { ssrIncludeBooleanAttr, ssrInterpolate, ssrLooseContain, ssrLooseEqual, ssrRenderAttr, ssrRenderAttrs, ssrRenderClass, ssrRenderComponent, ssrRenderList, ssrRenderStyle } from "vue/server-renderer";
//#region resources/js/pages/Reservations/FloorPlan.vue
var _sfc_main = /*@__PURE__*/ Object.assign({ layout: AdminLayout_default }, {
	__name: "FloorPlan",
	__ssrInlineRender: true,
	props: {
		tables: {
			type: Array,
			default: () => []
		},
		todayReservations: {
			type: Array,
			default: () => []
		},
		branches: {
			type: Array,
			default: () => []
		},
		tableStatuses: {
			type: Array,
			default: () => []
		},
		tableShapes: {
			type: Array,
			default: () => []
		},
		selectedBranchId: {
			type: Number,
			default: null
		}
	},
	setup(__props) {
		const { can } = usePermissions();
		const props = __props;
		const tables = ref(props.tables.map((t) => ({ ...t })));
		const selected = ref(null);
		watch(() => props.tables, (next) => {
			const localById = new Map(tables.value.map((t) => [t.id, t]));
			tables.value = next.map((t) => {
				const local = localById.get(t.id);
				return local ? {
					...t,
					pos_x: local.pos_x,
					pos_y: local.pos_y
				} : { ...t };
			});
			if (selected.value) selected.value = tables.value.find((t) => t.id === selected.value.id) ?? null;
		});
		const saving = ref(false);
		const selectedBranch = ref(props.selectedBranchId ?? "");
		const statusColors = {
			available: "#10b981",
			occupied: "#ef4444",
			reserved: "#f59e0b",
			cleaning: "#6366f1"
		};
		const tableStyle = (t) => ({
			left: t.pos_x + "px",
			top: t.pos_y + "px",
			"--table-color": statusColors[t.status] ?? "#6366f1"
		});
		const dragging = ref(null);
		ref(null);
		const saveLayout = async () => {
			saving.value = true;
			try {
				await fetch("/reservations/floor-plan/save", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"X-CSRF-TOKEN": document.querySelector("meta[name=\"csrf-token\"]")?.content ?? "",
						"X-Requested-With": "XMLHttpRequest"
					},
					body: JSON.stringify({ tables: tables.value.map((t) => ({
						id: t.id,
						pos_x: Math.round(t.pos_x),
						pos_y: Math.round(t.pos_y)
					})) }),
					credentials: "same-origin"
				});
			} finally {
				saving.value = false;
			}
		};
		const showTableModal = ref(false);
		const tableForm = useForm({
			id: null,
			branch_id: "",
			table_number: "",
			capacity: 4,
			shape: "rectangle",
			status: "available"
		});
		const defaultBranchId = () => selectedBranch.value || (props.branches.length === 1 ? props.branches[0].id : "");
		const openAddTable = () => {
			tableForm.clearErrors();
			Object.assign(tableForm, {
				id: null,
				table_number: "",
				capacity: 4,
				shape: "rectangle",
				status: "available",
				branch_id: defaultBranchId()
			});
			showTableModal.value = true;
		};
		const saveTable = () => {
			const opts = {
				preserveScroll: true,
				onSuccess: () => {
					showTableModal.value = false;
					selected.value = null;
				}
			};
			tableForm.id ? tableForm.put(`/reservations/tables/${tableForm.id}`, opts) : tableForm.post("/reservations/tables", opts);
		};
		const reloadBranch = () => router.get("/reservations/floor-plan", { branch_id: selectedBranch.value || void 0 }, { preserveState: true });
		const fmtTime = (iso) => iso ? new Date(iso).toLocaleTimeString("en-PK", {
			hour: "2-digit",
			minute: "2-digit"
		}) : "";
		const typeEmoji = (t) => ({
			dining: "🍽",
			"on-way": "🥡",
			delivery: "🚚"
		})[t] ?? "";
		const typeLabel = (t) => ({
			dining: "Dine-in",
			"on-way": "Takeaway",
			delivery: "Delivery"
		})[t] ?? t;
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "page" }, _attrs))} data-v-07130a9a>`);
			_push(ssrRenderComponent(_sfc_main$1, {
				title: "Floor Plan",
				subtitle: "Drag tables to set their positions. Click a table to change its status or add one."
			}, {
				actions: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<select class="ui-input" style="${ssrRenderStyle({ "width": "180px" })}" data-v-07130a9a${_scopeId}><option value="" data-v-07130a9a${ssrIncludeBooleanAttr(Array.isArray(selectedBranch.value) ? ssrLooseContain(selectedBranch.value, "") : ssrLooseEqual(selectedBranch.value, "")) ? " selected" : ""}${_scopeId}>All Branches</option><!--[-->`);
						ssrRenderList(props.branches, (b) => {
							_push(`<option${ssrRenderAttr("value", b.id)} data-v-07130a9a${ssrIncludeBooleanAttr(Array.isArray(selectedBranch.value) ? ssrLooseContain(selectedBranch.value, b.id) : ssrLooseEqual(selectedBranch.value, b.id)) ? " selected" : ""}${_scopeId}>${ssrInterpolate(b.name)}</option>`);
						});
						_push(`<!--]--></select><button class="ui-btn ui-btn--ghost"${ssrIncludeBooleanAttr(saving.value) ? " disabled" : ""} data-v-07130a9a${_scopeId}>${ssrInterpolate(saving.value ? "Saving…" : "💾 Save Layout")}</button>`);
						if (unref(can)("reservations.update")) _push(`<button class="ui-btn ui-btn--primary" data-v-07130a9a${_scopeId}>+ Add Table</button>`);
						else _push(`<!---->`);
					} else return [
						withDirectives(createVNode("select", {
							"onUpdate:modelValue": ($event) => selectedBranch.value = $event,
							class: "ui-input",
							style: { "width": "180px" },
							onChange: reloadBranch
						}, [createVNode("option", { value: "" }, "All Branches"), (openBlock(true), createBlock(Fragment, null, renderList(props.branches, (b) => {
							return openBlock(), createBlock("option", {
								key: b.id,
								value: b.id
							}, toDisplayString(b.name), 9, ["value"]);
						}), 128))], 40, ["onUpdate:modelValue"]), [[vModelSelect, selectedBranch.value]]),
						createVNode("button", {
							class: "ui-btn ui-btn--ghost",
							onClick: saveLayout,
							disabled: saving.value
						}, toDisplayString(saving.value ? "Saving…" : "💾 Save Layout"), 9, ["disabled"]),
						unref(can)("reservations.update") ? (openBlock(), createBlock("button", {
							key: 0,
							class: "ui-btn ui-btn--primary",
							onClick: openAddTable
						}, "+ Add Table")) : createCommentVNode("", true)
					];
				}),
				_: 1
			}, _parent));
			_push(`<div class="fp__legend" data-v-07130a9a><!--[-->`);
			ssrRenderList(statusColors, (color, status) => {
				_push(`<span class="fp__legend-item" data-v-07130a9a><span class="fp__legend-dot" style="${ssrRenderStyle({ background: color })}" data-v-07130a9a></span>${ssrInterpolate(status)}</span>`);
			});
			_push(`<!--]--></div><div class="fp__canvas" data-v-07130a9a>`);
			if (props.todayReservations.length) {
				_push(`<div class="fp__reservations-strip" data-v-07130a9a><span class="fp__strip-label" data-v-07130a9a>Today&#39;s reservations:</span><!--[-->`);
				ssrRenderList(props.todayReservations, (r) => {
					_push(`<span class="fp__res-chip" data-v-07130a9a>${ssrInterpolate(fmtTime(r.reserved_at))} — ${ssrInterpolate(r.guest_name)} (${ssrInterpolate(r.party_size)}) <span class="ui-badge ui-badge--info" style="${ssrRenderStyle({ "margin-left": "4px" })}" data-v-07130a9a>${ssrInterpolate(r.status)}</span></span>`);
				});
				_push(`<!--]--></div>`);
			} else _push(`<!---->`);
			_push(`<!--[-->`);
			ssrRenderList(tables.value, (table) => {
				_push(`<div class="${ssrRenderClass([[
					"fp__table--" + table.shape,
					"fp__table--" + table.status,
					{ "fp__table--dragging": dragging.value?.id === table.id }
				], "fp__table"])}" style="${ssrRenderStyle(tableStyle(table))}" data-v-07130a9a><span class="fp__table-num" data-v-07130a9a>${ssrInterpolate(table.table_number)}</span><span class="fp__table-cap" data-v-07130a9a>${ssrInterpolate(table.capacity)}p</span>`);
				if (table.current_order_type) _push(`<span class="fp__table-order" data-v-07130a9a>${ssrInterpolate(typeEmoji(table.current_order_type))}</span>`);
				else _push(`<!---->`);
				_push(`</div>`);
			});
			_push(`<!--]--></div>`);
			if (selected.value) {
				_push(`<div class="fp__drawer" data-v-07130a9a><div class="fp__drawer-hdr" data-v-07130a9a><span data-v-07130a9a>Table ${ssrInterpolate(selected.value.table_number)}</span><button class="fp__drawer-close" data-v-07130a9a>✕</button></div><div class="fp__drawer-body" data-v-07130a9a><p data-v-07130a9a><strong data-v-07130a9a>Capacity:</strong> ${ssrInterpolate(selected.value.capacity)}</p><p data-v-07130a9a><strong data-v-07130a9a>Status:</strong><select class="ui-input" style="${ssrRenderStyle({
					"width": "140px",
					"margin-left": "8px"
				})}" data-v-07130a9a><!--[-->`);
				ssrRenderList(props.tableStatuses, (s) => {
					_push(`<option${ssrRenderAttr("value", s)} data-v-07130a9a${ssrIncludeBooleanAttr(Array.isArray(selected.value.status) ? ssrLooseContain(selected.value.status, s) : ssrLooseEqual(selected.value.status, s)) ? " selected" : ""}>${ssrInterpolate(s)}</option>`);
				});
				_push(`<!--]--></select></p>`);
				if (selected.value.current_order_type) _push(`<p data-v-07130a9a><strong data-v-07130a9a>Order:</strong> ${ssrInterpolate(typeLabel(selected.value.current_order_type))}</p>`);
				else _push(`<!---->`);
				_push(`<div class="fp__drawer-actions" data-v-07130a9a><button class="ui-btn ui-btn--ghost ui-btn--sm" data-v-07130a9a>Edit Table</button><button class="ui-btn ui-btn--danger ui-btn--sm" data-v-07130a9a>Delete</button></div></div></div>`);
			} else _push(`<!---->`);
			_push(ssrRenderComponent(Modal_default, {
				modelValue: showTableModal.value,
				"onUpdate:modelValue": ($event) => showTableModal.value = $event,
				title: unref(tableForm).id ? "Edit Table" : "Add Table",
				width: "460px"
			}, {
				footer: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<button class="ui-btn ui-btn--ghost" data-v-07130a9a${_scopeId}>Cancel</button><button class="ui-btn ui-btn--primary"${ssrIncludeBooleanAttr(unref(tableForm).processing) ? " disabled" : ""} data-v-07130a9a${_scopeId}>Save</button>`);
					else return [createVNode("button", {
						class: "ui-btn ui-btn--ghost",
						onClick: ($event) => showTableModal.value = false
					}, "Cancel", 8, ["onClick"]), createVNode("button", {
						class: "ui-btn ui-btn--primary",
						disabled: unref(tableForm).processing,
						onClick: saveTable
					}, "Save", 8, ["disabled"])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div class="form-grid-2" data-v-07130a9a${_scopeId}>`);
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(tableForm).table_number,
							"onUpdate:modelValue": ($event) => unref(tableForm).table_number = $event,
							label: "Table Number *",
							placeholder: "T-1",
							error: unref(tableForm).errors.table_number
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(tableForm).capacity,
							"onUpdate:modelValue": ($event) => unref(tableForm).capacity = $event,
							modelModifiers: { number: true },
							label: "Capacity *",
							type: "number",
							min: "1",
							error: unref(tableForm).errors.capacity
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(tableForm).shape,
							"onUpdate:modelValue": ($event) => unref(tableForm).shape = $event,
							label: "Shape",
							type: "select",
							error: unref(tableForm).errors.shape
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) {
									_push(`<!--[-->`);
									ssrRenderList(props.tableShapes, (s) => {
										_push(`<option${ssrRenderAttr("value", s)} data-v-07130a9a${_scopeId}>${ssrInterpolate(s)}</option>`);
									});
									_push(`<!--]-->`);
								} else return [(openBlock(true), createBlock(Fragment, null, renderList(props.tableShapes, (s) => {
									return openBlock(), createBlock("option", {
										key: s,
										value: s
									}, toDisplayString(s), 9, ["value"]);
								}), 128))];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(tableForm).branch_id,
							"onUpdate:modelValue": ($event) => unref(tableForm).branch_id = $event,
							label: "Branch *",
							type: "select",
							error: unref(tableForm).errors.branch_id
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) {
									_push(`<option value="" data-v-07130a9a${_scopeId}>Select branch</option><!--[-->`);
									ssrRenderList(props.branches, (b) => {
										_push(`<option${ssrRenderAttr("value", b.id)} data-v-07130a9a${_scopeId}>${ssrInterpolate(b.name)}</option>`);
									});
									_push(`<!--]-->`);
								} else return [createVNode("option", { value: "" }, "Select branch"), (openBlock(true), createBlock(Fragment, null, renderList(props.branches, (b) => {
									return openBlock(), createBlock("option", {
										key: b.id,
										value: b.id
									}, toDisplayString(b.name), 9, ["value"]);
								}), 128))];
							}),
							_: 1
						}, _parent, _scopeId));
						if (unref(tableForm).id) _push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(tableForm).status,
							"onUpdate:modelValue": ($event) => unref(tableForm).status = $event,
							label: "Status",
							type: "select",
							error: unref(tableForm).errors.status
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) {
									_push(`<!--[-->`);
									ssrRenderList(props.tableStatuses, (s) => {
										_push(`<option${ssrRenderAttr("value", s)} data-v-07130a9a${_scopeId}>${ssrInterpolate(s)}</option>`);
									});
									_push(`<!--]-->`);
								} else return [(openBlock(true), createBlock(Fragment, null, renderList(props.tableStatuses, (s) => {
									return openBlock(), createBlock("option", {
										key: s,
										value: s
									}, toDisplayString(s), 9, ["value"]);
								}), 128))];
							}),
							_: 1
						}, _parent, _scopeId));
						else _push(`<!---->`);
						_push(`</div>`);
					} else return [createVNode("div", { class: "form-grid-2" }, [
						createVNode(_sfc_main$2, {
							modelValue: unref(tableForm).table_number,
							"onUpdate:modelValue": ($event) => unref(tableForm).table_number = $event,
							label: "Table Number *",
							placeholder: "T-1",
							error: unref(tableForm).errors.table_number
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode(_sfc_main$2, {
							modelValue: unref(tableForm).capacity,
							"onUpdate:modelValue": ($event) => unref(tableForm).capacity = $event,
							modelModifiers: { number: true },
							label: "Capacity *",
							type: "number",
							min: "1",
							error: unref(tableForm).errors.capacity
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode(_sfc_main$2, {
							modelValue: unref(tableForm).shape,
							"onUpdate:modelValue": ($event) => unref(tableForm).shape = $event,
							label: "Shape",
							type: "select",
							error: unref(tableForm).errors.shape
						}, {
							default: withCtx(() => [(openBlock(true), createBlock(Fragment, null, renderList(props.tableShapes, (s) => {
								return openBlock(), createBlock("option", {
									key: s,
									value: s
								}, toDisplayString(s), 9, ["value"]);
							}), 128))]),
							_: 1
						}, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode(_sfc_main$2, {
							modelValue: unref(tableForm).branch_id,
							"onUpdate:modelValue": ($event) => unref(tableForm).branch_id = $event,
							label: "Branch *",
							type: "select",
							error: unref(tableForm).errors.branch_id
						}, {
							default: withCtx(() => [createVNode("option", { value: "" }, "Select branch"), (openBlock(true), createBlock(Fragment, null, renderList(props.branches, (b) => {
								return openBlock(), createBlock("option", {
									key: b.id,
									value: b.id
								}, toDisplayString(b.name), 9, ["value"]);
							}), 128))]),
							_: 1
						}, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						unref(tableForm).id ? (openBlock(), createBlock(_sfc_main$2, {
							key: 0,
							modelValue: unref(tableForm).status,
							"onUpdate:modelValue": ($event) => unref(tableForm).status = $event,
							label: "Status",
							type: "select",
							error: unref(tableForm).errors.status
						}, {
							default: withCtx(() => [(openBlock(true), createBlock(Fragment, null, renderList(props.tableStatuses, (s) => {
								return openBlock(), createBlock("option", {
									key: s,
									value: s
								}, toDisplayString(s), 9, ["value"]);
							}), 128))]),
							_: 1
						}, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						])) : createCommentVNode("", true)
					])];
				}),
				_: 1
			}, _parent));
			_push(`</div>`);
		};
	}
});
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/pages/Reservations/FloorPlan.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var FloorPlan_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-07130a9a"]]);
//#endregion
export { FloorPlan_default as default };
