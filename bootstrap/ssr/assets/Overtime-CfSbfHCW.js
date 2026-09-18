import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-BOaGB7Aw.js";
import { n as confirmDialog } from "./useNotifications-CvzCW6Mx.js";
import { n as usePermissions, t as AdminLayout_default } from "./AdminLayout-BhC2A239.js";
import { t as _sfc_main$1 } from "./PageHeader-D0aRDn5C.js";
import { t as DataTable_default } from "./DataTable-DQdMyI8_.js";
import { t as Pagination_default } from "./Pagination-CHJUzz_w.js";
import { t as Modal_default } from "./Modal-CpmFAnsY.js";
import { t as _sfc_main$2 } from "./FormField-Doe8oR1s.js";
import { t as StatCard_default } from "./StatCard-C81bFHCl.js";
import { Fragment, computed, createBlock, createCommentVNode, createTextVNode, createVNode, mergeProps, openBlock, ref, renderList, toDisplayString, unref, useSSRContext, watch, withCtx } from "vue";
import { router, useForm, usePage } from "@inertiajs/vue3";
import { ssrIncludeBooleanAttr, ssrInterpolate, ssrRenderAttr, ssrRenderAttrs, ssrRenderClass, ssrRenderComponent, ssrRenderList } from "vue/server-renderer";
//#region resources/js/pages/HR/Overtime.vue
var _sfc_main = /*@__PURE__*/ Object.assign({ layout: AdminLayout_default }, {
	__name: "Overtime",
	__ssrInlineRender: true,
	props: {
		overtimes: {
			type: Object,
			default: () => ({ data: [] })
		},
		filters: {
			type: Object,
			default: () => ({
				search: "",
				status: "",
				month: ""
			})
		},
		employees: {
			type: Array,
			default: () => []
		},
		stats: {
			type: Object,
			default: () => ({
				pending: 0,
				approved_hours: 0,
				approved_amount: 0
			})
		}
	},
	setup(__props) {
		const { can } = usePermissions();
		const page = usePage();
		const props = __props;
		const flashError = computed(() => page.props.flash?.error || "");
		const columns = [
			{
				key: "employee_name",
				label: "Employee"
			},
			{
				key: "date",
				label: "Date"
			},
			{
				key: "hours",
				label: "Hours",
				width: "90px"
			},
			{
				key: "rate_per_hour",
				label: "Rate/hr"
			},
			{
				key: "amount",
				label: "Amount"
			},
			{
				key: "note",
				label: "Note"
			},
			{
				key: "status",
				label: "Status"
			}
		];
		const rows = computed(() => props.overtimes?.data ?? []);
		const search = ref(props.filters?.search ?? "");
		const status = ref(props.filters?.status ?? "");
		const month = ref(props.filters?.month ?? "");
		let searchTimer = null;
		const reload = (debounce) => {
			clearTimeout(searchTimer);
			searchTimer = setTimeout(() => router.get("/hr/overtime", {
				search: search.value || void 0,
				status: status.value || void 0,
				month: month.value || void 0
			}, {
				preserveState: true,
				preserveScroll: true,
				replace: true,
				only: [
					"overtimes",
					"filters",
					"stats"
				]
			}), debounce);
		};
		watch(search, () => reload(300));
		watch([status, month], () => reload(0));
		const showModal = ref(false);
		const blank = {
			id: null,
			user_id: "",
			date: "",
			hours: "",
			rate_per_hour: "",
			note: ""
		};
		const form = useForm({ ...blank });
		const computedAmount = computed(() => money(Math.round((Number(form.hours) || 0) * (Number(form.rate_per_hour) || 0) * 100) / 100));
		const suggestedRate = computed(() => props.employees.find((e) => String(e.id) === String(form.user_id))?.suggested_rate || 0);
		const openModal = () => {
			Object.assign(form, blank);
			form.date = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
			form.clearErrors();
			showModal.value = true;
		};
		const editRow = (o) => {
			Object.assign(form, {
				id: o.id,
				user_id: o.user_id,
				date: o.date,
				hours: o.hours,
				rate_per_hour: o.rate_per_hour,
				note: o.note ?? ""
			});
			form.clearErrors();
			showModal.value = true;
		};
		const save = () => {
			const opts = {
				preserveScroll: true,
				onSuccess: () => showModal.value = false
			};
			if (form.id) form.put(`/hr/overtime/${form.id}`, opts);
			else form.post("/hr/overtime", opts);
		};
		const decide = (row, next) => {
			router.put(`/hr/overtime/${row.id}/decide`, { status: next }, { preserveScroll: true });
		};
		const deleteRow = async (id) => {
			if (!await confirmDialog("Delete this overtime entry?")) return;
			router.delete(`/hr/overtime/${id}`, { preserveScroll: true });
		};
		const money = (v) => `Rs ${Number(v || 0).toLocaleString(void 0, {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		})}`;
		const label = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : "—";
		const badgeClass = (s) => ({
			approved: "ui-badge--success",
			rejected: "ui-badge--muted",
			pending: "ui-badge--warning"
		})[s] ?? "ui-badge--muted";
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "page" }, _attrs))} data-v-c605aa86>`);
			_push(ssrRenderComponent(_sfc_main$1, {
				title: "Overtime",
				subtitle: "Extra hours worked. Only approved overtime is paid by payroll."
			}, {
				actions: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						if (unref(can)("hr.overtime.create")) _push(`<button class="ui-btn ui-btn--primary" data-v-c605aa86${_scopeId}> + Log Overtime </button>`);
						else _push(`<!---->`);
					} else return [unref(can)("hr.overtime.create") ? (openBlock(), createBlock("button", {
						key: 0,
						class: "ui-btn ui-btn--primary",
						onClick: openModal
					}, " + Log Overtime ")) : createCommentVNode("", true)];
				}),
				_: 1
			}, _parent));
			if (flashError.value) _push(`<div class="ui-alert ui-alert--danger" data-v-c605aa86>${ssrInterpolate(flashError.value)}</div>`);
			else _push(`<!---->`);
			_push(`<div class="stat-grid" data-v-c605aa86>`);
			_push(ssrRenderComponent(StatCard_default, {
				label: "Pending",
				value: props.stats.pending
			}, null, _parent));
			_push(ssrRenderComponent(StatCard_default, {
				label: "Approved Hours",
				value: props.stats.approved_hours
			}, null, _parent));
			_push(ssrRenderComponent(StatCard_default, {
				label: "Approved Amount",
				value: money(props.stats.approved_amount)
			}, null, _parent));
			_push(`</div><div class="ot__filters" data-v-c605aa86>`);
			_push(ssrRenderComponent(_sfc_main$2, {
				modelValue: status.value,
				"onUpdate:modelValue": ($event) => status.value = $event,
				label: "Status",
				type: "select"
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<option value="" data-v-c605aa86${_scopeId}>All statuses</option><option value="pending" data-v-c605aa86${_scopeId}>Pending</option><option value="approved" data-v-c605aa86${_scopeId}>Approved</option><option value="rejected" data-v-c605aa86${_scopeId}>Rejected</option>`);
					else return [
						createVNode("option", { value: "" }, "All statuses"),
						createVNode("option", { value: "pending" }, "Pending"),
						createVNode("option", { value: "approved" }, "Approved"),
						createVNode("option", { value: "rejected" }, "Rejected")
					];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(_sfc_main$2, {
				modelValue: month.value,
				"onUpdate:modelValue": ($event) => month.value = $event,
				label: "Month",
				type: "month"
			}, null, _parent));
			_push(`</div>`);
			_push(ssrRenderComponent(DataTable_default, {
				columns,
				rows: rows.value,
				index: "",
				searchable: "",
				query: search.value,
				"onUpdate:query": ($event) => search.value = $event,
				"search-placeholder": "Search employee…",
				"empty-text": "No overtime entries found."
			}, {
				"cell:employee_name": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div class="ot__name" data-v-c605aa86${_scopeId}><strong data-v-c605aa86${_scopeId}>${ssrInterpolate(row.employee_name)}</strong>`);
						if (row.employee_code) _push(`<span class="ot__code" data-v-c605aa86${_scopeId}>${ssrInterpolate(row.employee_code)}</span>`);
						else _push(`<!---->`);
						_push(`</div>`);
					} else return [createVNode("div", { class: "ot__name" }, [createVNode("strong", null, toDisplayString(row.employee_name), 1), row.employee_code ? (openBlock(), createBlock("span", {
						key: 0,
						class: "ot__code"
					}, toDisplayString(row.employee_code), 1)) : createCommentVNode("", true)])];
				}),
				"cell:rate_per_hour": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) _push(`${ssrInterpolate(money(value))}`);
					else return [createTextVNode(toDisplayString(money(value)), 1)];
				}),
				"cell:amount": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) _push(`<strong data-v-c605aa86${_scopeId}>${ssrInterpolate(money(value))}</strong>`);
					else return [createVNode("strong", null, toDisplayString(money(value)), 1)];
				}),
				"cell:status": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<span class="${ssrRenderClass([badgeClass(row.status), "ui-badge"])}" data-v-c605aa86${_scopeId}>${ssrInterpolate(label(row.status))}</span>`);
						if (row.approver_name) _push(`<span class="ot__by" data-v-c605aa86${_scopeId}>by ${ssrInterpolate(row.approver_name)}</span>`);
						else _push(`<!---->`);
					} else return [createVNode("span", { class: ["ui-badge", badgeClass(row.status)] }, toDisplayString(label(row.status)), 3), row.approver_name ? (openBlock(), createBlock("span", {
						key: 0,
						class: "ot__by"
					}, "by " + toDisplayString(row.approver_name), 1)) : createCommentVNode("", true)];
				}),
				actions: withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						if (unref(can)("hr.overtime.approve")) {
							_push(`<!--[-->`);
							if (row.status !== "approved") _push(`<button class="ui-btn ui-btn--success ui-btn--sm" data-v-c605aa86${_scopeId}> Approve </button>`);
							else _push(`<!---->`);
							if (row.status !== "rejected") _push(`<button class="ui-btn ui-btn--danger ui-btn--sm" data-v-c605aa86${_scopeId}> Reject </button>`);
							else _push(`<!---->`);
							if (row.status !== "pending") _push(`<button class="ui-btn ui-btn--ghost ui-btn--sm" data-v-c605aa86${_scopeId}> Reset </button>`);
							else _push(`<!---->`);
							_push(`<!--]-->`);
						} else _push(`<!---->`);
						if (unref(can)("hr.overtime.update") && row.status !== "approved") _push(`<button class="ui-btn ui-btn--ghost ui-btn--sm" data-v-c605aa86${_scopeId}> Edit </button>`);
						else _push(`<!---->`);
						if (unref(can)("hr.overtime.delete") && row.status !== "approved") _push(`<button class="ui-btn ui-btn--danger ui-btn--sm" data-v-c605aa86${_scopeId}> Delete </button>`);
						else _push(`<!---->`);
					} else return [
						unref(can)("hr.overtime.approve") ? (openBlock(), createBlock(Fragment, { key: 0 }, [
							row.status !== "approved" ? (openBlock(), createBlock("button", {
								key: 0,
								class: "ui-btn ui-btn--success ui-btn--sm",
								onClick: ($event) => decide(row, "approved")
							}, " Approve ", 8, ["onClick"])) : createCommentVNode("", true),
							row.status !== "rejected" ? (openBlock(), createBlock("button", {
								key: 1,
								class: "ui-btn ui-btn--danger ui-btn--sm",
								onClick: ($event) => decide(row, "rejected")
							}, " Reject ", 8, ["onClick"])) : createCommentVNode("", true),
							row.status !== "pending" ? (openBlock(), createBlock("button", {
								key: 2,
								class: "ui-btn ui-btn--ghost ui-btn--sm",
								onClick: ($event) => decide(row, "pending")
							}, " Reset ", 8, ["onClick"])) : createCommentVNode("", true)
						], 64)) : createCommentVNode("", true),
						unref(can)("hr.overtime.update") && row.status !== "approved" ? (openBlock(), createBlock("button", {
							key: 1,
							class: "ui-btn ui-btn--ghost ui-btn--sm",
							onClick: ($event) => editRow(row)
						}, " Edit ", 8, ["onClick"])) : createCommentVNode("", true),
						unref(can)("hr.overtime.delete") && row.status !== "approved" ? (openBlock(), createBlock("button", {
							key: 2,
							class: "ui-btn ui-btn--danger ui-btn--sm",
							onClick: ($event) => deleteRow(row.id)
						}, " Delete ", 8, ["onClick"])) : createCommentVNode("", true)
					];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(Pagination_default, {
				paginator: props.overtimes,
				only: ["overtimes"]
			}, null, _parent));
			_push(ssrRenderComponent(Modal_default, {
				modelValue: showModal.value,
				"onUpdate:modelValue": ($event) => showModal.value = $event,
				title: unref(form).id ? "Edit Overtime" : "Log Overtime"
			}, {
				footer: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<button class="ui-btn ui-btn--ghost" data-v-c605aa86${_scopeId}>Cancel</button><button class="ui-btn ui-btn--primary"${ssrIncludeBooleanAttr(unref(form).processing) ? " disabled" : ""} data-v-c605aa86${_scopeId}>Save</button>`);
					else return [createVNode("button", {
						class: "ui-btn ui-btn--ghost",
						onClick: ($event) => showModal.value = false
					}, "Cancel", 8, ["onClick"]), createVNode("button", {
						class: "ui-btn ui-btn--primary",
						disabled: unref(form).processing,
						onClick: save
					}, "Save", 8, ["disabled"])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).user_id,
							"onUpdate:modelValue": ($event) => unref(form).user_id = $event,
							label: "Employee",
							type: "select",
							error: unref(form).errors.user_id
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) {
									_push(`<option value="" data-v-c605aa86${_scopeId}>— select —</option><!--[-->`);
									ssrRenderList(props.employees, (e) => {
										_push(`<option${ssrRenderAttr("value", e.id)} data-v-c605aa86${_scopeId}>${ssrInterpolate(e.name)}</option>`);
									});
									_push(`<!--]-->`);
								} else return [createVNode("option", { value: "" }, "— select —"), (openBlock(true), createBlock(Fragment, null, renderList(props.employees, (e) => {
									return openBlock(), createBlock("option", {
										key: e.id,
										value: e.id
									}, toDisplayString(e.name), 9, ["value"]);
								}), 128))];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(`<div class="ot__grid" data-v-c605aa86${_scopeId}>`);
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).date,
							"onUpdate:modelValue": ($event) => unref(form).date = $event,
							label: "Date",
							type: "date",
							error: unref(form).errors.date
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).hours,
							"onUpdate:modelValue": ($event) => unref(form).hours = $event,
							label: "Hours",
							type: "number",
							step: "0.25",
							error: unref(form).errors.hours
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).rate_per_hour,
							"onUpdate:modelValue": ($event) => unref(form).rate_per_hour = $event,
							label: "Rate per hour",
							type: "number",
							step: "0.01",
							error: unref(form).errors.rate_per_hour
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							label: "Amount",
							"model-value": computedAmount.value,
							readonly: ""
						}, null, _parent, _scopeId));
						_push(`</div>`);
						if (suggestedRate.value) _push(`<p class="ot__hint" data-v-c605aa86${_scopeId}> Suggested rate from basic salary: ${ssrInterpolate(money(suggestedRate.value))}/hr <button type="button" class="ot__link" data-v-c605aa86${_scopeId}>use this</button></p>`);
						else _push(`<!---->`);
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).note,
							"onUpdate:modelValue": ($event) => unref(form).note = $event,
							label: "Note",
							type: "textarea",
							error: unref(form).errors.note
						}, null, _parent, _scopeId));
					} else return [
						createVNode(_sfc_main$2, {
							modelValue: unref(form).user_id,
							"onUpdate:modelValue": ($event) => unref(form).user_id = $event,
							label: "Employee",
							type: "select",
							error: unref(form).errors.user_id
						}, {
							default: withCtx(() => [createVNode("option", { value: "" }, "— select —"), (openBlock(true), createBlock(Fragment, null, renderList(props.employees, (e) => {
								return openBlock(), createBlock("option", {
									key: e.id,
									value: e.id
								}, toDisplayString(e.name), 9, ["value"]);
							}), 128))]),
							_: 1
						}, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode("div", { class: "ot__grid" }, [
							createVNode(_sfc_main$2, {
								modelValue: unref(form).date,
								"onUpdate:modelValue": ($event) => unref(form).date = $event,
								label: "Date",
								type: "date",
								error: unref(form).errors.date
							}, null, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"error"
							]),
							createVNode(_sfc_main$2, {
								modelValue: unref(form).hours,
								"onUpdate:modelValue": ($event) => unref(form).hours = $event,
								label: "Hours",
								type: "number",
								step: "0.25",
								error: unref(form).errors.hours
							}, null, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"error"
							]),
							createVNode(_sfc_main$2, {
								modelValue: unref(form).rate_per_hour,
								"onUpdate:modelValue": ($event) => unref(form).rate_per_hour = $event,
								label: "Rate per hour",
								type: "number",
								step: "0.01",
								error: unref(form).errors.rate_per_hour
							}, null, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"error"
							]),
							createVNode(_sfc_main$2, {
								label: "Amount",
								"model-value": computedAmount.value,
								readonly: ""
							}, null, 8, ["model-value"])
						]),
						suggestedRate.value ? (openBlock(), createBlock("p", {
							key: 0,
							class: "ot__hint"
						}, [createTextVNode(" Suggested rate from basic salary: " + toDisplayString(money(suggestedRate.value)) + "/hr ", 1), createVNode("button", {
							type: "button",
							class: "ot__link",
							onClick: ($event) => unref(form).rate_per_hour = suggestedRate.value
						}, "use this", 8, ["onClick"])])) : createCommentVNode("", true),
						createVNode(_sfc_main$2, {
							modelValue: unref(form).note,
							"onUpdate:modelValue": ($event) => unref(form).note = $event,
							label: "Note",
							type: "textarea",
							error: unref(form).errors.note
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						])
					];
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
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/pages/HR/Overtime.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var Overtime_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-c605aa86"]]);
//#endregion
export { Overtime_default as default };
