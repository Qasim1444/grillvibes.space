import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-BOaGB7Aw.js";
import { n as confirmDialog } from "./useNotifications-CvzCW6Mx.js";
import { n as usePermissions, t as AdminLayout_default } from "./AdminLayout-D618cxCi.js";
import { t as _sfc_main$1 } from "./PageHeader-D0aRDn5C.js";
import { t as DataTable_default } from "./DataTable-DQdMyI8_.js";
import { t as Pagination_default } from "./Pagination-CHJUzz_w.js";
import { t as Modal_default } from "./Modal-CpmFAnsY.js";
import { t as _sfc_main$2 } from "./FormField-Doe8oR1s.js";
import { Fragment, computed, createBlock, createCommentVNode, createTextVNode, createVNode, mergeProps, openBlock, ref, renderList, toDisplayString, unref, useSSRContext, watch, withCtx } from "vue";
import { router, useForm } from "@inertiajs/vue3";
import { ssrIncludeBooleanAttr, ssrInterpolate, ssrLooseContain, ssrLooseEqual, ssrRenderAttr, ssrRenderAttrs, ssrRenderClass, ssrRenderComponent, ssrRenderList, ssrRenderStyle } from "vue/server-renderer";
//#region resources/js/pages/Maintenance/MaintenanceLogs.vue
var _sfc_main = /*@__PURE__*/ Object.assign({ layout: AdminLayout_default }, {
	__name: "MaintenanceLogs",
	__ssrInlineRender: true,
	props: {
		records: {
			type: Object,
			default: () => ({ data: [] })
		},
		assets: {
			type: Array,
			default: () => []
		},
		branches: {
			type: Array,
			default: () => []
		},
		vendors: {
			type: Array,
			default: () => []
		},
		types: {
			type: Array,
			default: () => []
		},
		statuses: {
			type: Array,
			default: () => []
		},
		summary: {
			type: Object,
			default: () => ({
				scheduled: 0,
				in_progress: 0,
				completed_this_month: 0,
				cost_this_month: 0
			})
		},
		filters: {
			type: Object,
			default: () => ({})
		}
	},
	setup(__props) {
		const { can } = usePermissions();
		const props = __props;
		const columns = [
			{
				key: "maintenance_number",
				label: "Work Order #"
			},
			{
				key: "asset",
				label: "Asset"
			},
			{
				key: "type",
				label: "Type"
			},
			{
				key: "scheduled_date",
				label: "Scheduled"
			},
			{
				key: "completed_date",
				label: "Completed"
			},
			{
				key: "performed_by",
				label: "By"
			},
			{
				key: "cost",
				label: "Cost"
			},
			{
				key: "status",
				label: "Status"
			}
		];
		const records = computed(() => props.records?.data ?? []);
		const search = ref(props.filters?.search ?? "");
		const assetFilter = ref(props.filters?.asset_id ?? "");
		const typeFilter = ref(props.filters?.type ?? "");
		const statusFilter = ref(props.filters?.status ?? "");
		const branchFilter = ref(props.filters?.branch_id ?? "");
		let timer = null;
		const reload = () => router.get("/maintenance/logs", {
			search: search.value || void 0,
			asset_id: assetFilter.value || void 0,
			type: typeFilter.value || void 0,
			status: statusFilter.value || void 0,
			branch_id: branchFilter.value || void 0
		}, {
			preserveState: true,
			preserveScroll: true,
			replace: true,
			only: [
				"records",
				"summary",
				"filters"
			]
		});
		watch([
			search,
			assetFilter,
			typeFilter,
			statusFilter,
			branchFilter
		], () => {
			clearTimeout(timer);
			timer = setTimeout(reload, 300);
		});
		const statusLabel = (s) => ({
			scheduled: "Scheduled",
			in_progress: "In Progress",
			completed: "Completed",
			cancelled: "Cancelled"
		})[s] ?? s;
		const statusClass = (s) => ({
			scheduled: "ui-badge--muted",
			in_progress: "ui-badge--info",
			completed: "ui-badge--success",
			cancelled: "ui-badge--danger"
		})[s] ?? "ui-badge--muted";
		const defaults = () => ({
			id: null,
			asset_id: "",
			description: "",
			type: "corrective",
			status: "scheduled",
			scheduled_date: "",
			performed_by: "",
			vendor_id: "",
			cost: 0,
			downtime_hours: 0,
			notes: ""
		});
		const showModal = ref(false);
		const form = useForm(defaults());
		const openCreate = () => {
			form.defaults(defaults());
			form.reset();
			form.clearErrors();
			showModal.value = true;
		};
		const openEdit = (row) => {
			form.id = row.id;
			form.asset_id = row.asset_id ?? "";
			form.description = row.description ?? "";
			form.type = row.type ?? "corrective";
			form.status = row.status ?? "scheduled";
			form.scheduled_date = date(row.scheduled_date);
			form.performed_by = row.performed_by ?? "";
			form.vendor_id = row.vendor_id ?? "";
			form.cost = row.cost ?? 0;
			form.downtime_hours = row.downtime_hours ?? 0;
			form.notes = row.notes ?? "";
			form.clearErrors();
			showModal.value = true;
		};
		const save = () => {
			const opts = {
				preserveScroll: true,
				onSuccess: () => showModal.value = false
			};
			if (form.id) form.put(`/maintenance/logs/${form.id}`, opts);
			else form.post("/maintenance/logs", opts);
		};
		const del = async (row) => {
			if (!await confirmDialog(`Delete work order ${row.maintenance_number}?`)) return;
			router.delete(`/maintenance/logs/${row.id}`, { preserveScroll: true });
		};
		const showComplete = ref(false);
		const completeRow = ref(null);
		const completeForm = useForm({
			completed_date: "",
			cost: 0,
			downtime_hours: 0,
			notes: ""
		});
		const openComplete = (row) => {
			completeRow.value = row;
			completeForm.reset();
			completeForm.clearErrors();
			completeForm.completed_date = today();
			completeForm.cost = row.cost ?? 0;
			completeForm.downtime_hours = row.downtime_hours ?? 0;
			completeForm.notes = row.notes ?? "";
			showComplete.value = true;
		};
		const doComplete = () => completeForm.put(`/maintenance/logs/${completeRow.value.id}/complete`, {
			preserveScroll: true,
			onSuccess: () => showComplete.value = false
		});
		const titleize = (s) => String(s || "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
		const fmt = (v) => "Rs " + Number(v || 0).toLocaleString("en-PK", { minimumFractionDigits: 2 });
		const fmtDate = (v) => v ? new Date(v).toLocaleDateString() : "—";
		const date = (v) => v ? String(v).slice(0, 10) : "";
		const today = () => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "page" }, _attrs))} data-v-261ec578>`);
			_push(ssrRenderComponent(_sfc_main$1, {
				title: "Maintenance Logs",
				subtitle: "Schedule preventive services, log repairs and inspections, and complete work orders — the asset's status and next-service date update automatically."
			}, {
				actions: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						if (unref(can)("maintenance.logs.create")) _push(`<button class="ui-btn ui-btn--primary" data-v-261ec578${_scopeId}>+ Log Maintenance</button>`);
						else _push(`<!---->`);
					} else return [unref(can)("maintenance.logs.create") ? (openBlock(), createBlock("button", {
						key: 0,
						class: "ui-btn ui-btn--primary",
						onClick: openCreate
					}, "+ Log Maintenance")) : createCommentVNode("", true)];
				}),
				_: 1
			}, _parent));
			_push(`<div class="ml__kpis" data-v-261ec578><div class="ml__kpi" data-v-261ec578><span class="ml__kpi-label" data-v-261ec578>Scheduled</span><span class="ml__kpi-val" data-v-261ec578>${ssrInterpolate(props.summary.scheduled)}</span><span class="ml__kpi-sub" data-v-261ec578>awaiting work</span></div><div class="ml__kpi ml__kpi--info" data-v-261ec578><span class="ml__kpi-label" data-v-261ec578>In Progress</span><span class="ml__kpi-val" data-v-261ec578>${ssrInterpolate(props.summary.in_progress)}</span><span class="ml__kpi-sub" data-v-261ec578>being serviced now</span></div><div class="ml__kpi ml__kpi--ok" data-v-261ec578><span class="ml__kpi-label" data-v-261ec578>Completed (mo.)</span><span class="ml__kpi-val" data-v-261ec578>${ssrInterpolate(props.summary.completed_this_month)}</span><span class="ml__kpi-sub" data-v-261ec578>this month</span></div><div class="ml__kpi" data-v-261ec578><span class="ml__kpi-label" data-v-261ec578>Cost (mo.)</span><span class="ml__kpi-val" data-v-261ec578>${ssrInterpolate(fmt(props.summary.cost_this_month))}</span><span class="ml__kpi-sub" data-v-261ec578>completed this month</span></div></div><div class="ml__filters" data-v-261ec578><input${ssrRenderAttr("value", search.value)} class="ui-input ml__search" placeholder="Search # / asset / description…" data-v-261ec578><select class="ui-input" style="${ssrRenderStyle({ "width": "200px" })}" data-v-261ec578><option value="" data-v-261ec578${ssrIncludeBooleanAttr(Array.isArray(assetFilter.value) ? ssrLooseContain(assetFilter.value, "") : ssrLooseEqual(assetFilter.value, "")) ? " selected" : ""}>All Assets</option><!--[-->`);
			ssrRenderList(props.assets, (a) => {
				_push(`<option${ssrRenderAttr("value", a.id)} data-v-261ec578${ssrIncludeBooleanAttr(Array.isArray(assetFilter.value) ? ssrLooseContain(assetFilter.value, a.id) : ssrLooseEqual(assetFilter.value, a.id)) ? " selected" : ""}>${ssrInterpolate(a.name)}</option>`);
			});
			_push(`<!--]--></select><select class="ui-input" style="${ssrRenderStyle({ "width": "150px" })}" data-v-261ec578><option value="" data-v-261ec578${ssrIncludeBooleanAttr(Array.isArray(typeFilter.value) ? ssrLooseContain(typeFilter.value, "") : ssrLooseEqual(typeFilter.value, "")) ? " selected" : ""}>All Types</option><!--[-->`);
			ssrRenderList(props.types, (t) => {
				_push(`<option${ssrRenderAttr("value", t)} data-v-261ec578${ssrIncludeBooleanAttr(Array.isArray(typeFilter.value) ? ssrLooseContain(typeFilter.value, t) : ssrLooseEqual(typeFilter.value, t)) ? " selected" : ""}>${ssrInterpolate(titleize(t))}</option>`);
			});
			_push(`<!--]--></select><select class="ui-input" style="${ssrRenderStyle({ "width": "160px" })}" data-v-261ec578><option value="" data-v-261ec578${ssrIncludeBooleanAttr(Array.isArray(statusFilter.value) ? ssrLooseContain(statusFilter.value, "") : ssrLooseEqual(statusFilter.value, "")) ? " selected" : ""}>All Statuses</option><!--[-->`);
			ssrRenderList(props.statuses, (s) => {
				_push(`<option${ssrRenderAttr("value", s)} data-v-261ec578${ssrIncludeBooleanAttr(Array.isArray(statusFilter.value) ? ssrLooseContain(statusFilter.value, s) : ssrLooseEqual(statusFilter.value, s)) ? " selected" : ""}>${ssrInterpolate(statusLabel(s))}</option>`);
			});
			_push(`<!--]--></select><select class="ui-input" style="${ssrRenderStyle({ "width": "180px" })}" data-v-261ec578><option value="" data-v-261ec578${ssrIncludeBooleanAttr(Array.isArray(branchFilter.value) ? ssrLooseContain(branchFilter.value, "") : ssrLooseEqual(branchFilter.value, "")) ? " selected" : ""}>All Branches</option><!--[-->`);
			ssrRenderList(props.branches, (branch) => {
				_push(`<option${ssrRenderAttr("value", branch.id)} data-v-261ec578${ssrIncludeBooleanAttr(Array.isArray(branchFilter.value) ? ssrLooseContain(branchFilter.value, branch.id) : ssrLooseEqual(branchFilter.value, branch.id)) ? " selected" : ""}>${ssrInterpolate(branch.name)}</option>`);
			});
			_push(`<!--]--></select></div>`);
			_push(ssrRenderComponent(DataTable_default, {
				columns,
				rows: records.value,
				index: "",
				"empty-text": "No maintenance records yet."
			}, {
				"cell:asset": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) _push(`<strong data-v-261ec578${_scopeId}>${ssrInterpolate(row.asset_name)}</strong><span class="ml__code" data-v-261ec578${_scopeId}>${ssrInterpolate(row.asset_code)}</span>`);
					else return [createVNode("strong", null, toDisplayString(row.asset_name), 1), createVNode("span", { class: "ml__code" }, toDisplayString(row.asset_code), 1)];
				}),
				"cell:type": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) _push(`<span class="ui-badge ui-badge--muted" data-v-261ec578${_scopeId}>${ssrInterpolate(titleize(value))}</span>`);
					else return [createVNode("span", { class: "ui-badge ui-badge--muted" }, toDisplayString(titleize(value)), 1)];
				}),
				"cell:scheduled_date": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) _push(`${ssrInterpolate(fmtDate(value))}`);
					else return [createTextVNode(toDisplayString(fmtDate(value)), 1)];
				}),
				"cell:completed_date": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) _push(`${ssrInterpolate(fmtDate(value))}`);
					else return [createTextVNode(toDisplayString(fmtDate(value)), 1)];
				}),
				"cell:cost": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) _push(`${ssrInterpolate(fmt(value))}`);
					else return [createTextVNode(toDisplayString(fmt(value)), 1)];
				}),
				"cell:performed_by": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						if (row.performed_by || row.vendor_name) _push(`<span data-v-261ec578${_scopeId}>${ssrInterpolate(row.performed_by || row.vendor_name)}</span>`);
						else _push(`<span class="ml__muted" data-v-261ec578${_scopeId}>—</span>`);
					} else return [row.performed_by || row.vendor_name ? (openBlock(), createBlock("span", { key: 0 }, toDisplayString(row.performed_by || row.vendor_name), 1)) : (openBlock(), createBlock("span", {
						key: 1,
						class: "ml__muted"
					}, "—"))];
				}),
				"cell:status": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) _push(`<span class="${ssrRenderClass([statusClass(value), "ui-badge"])}" data-v-261ec578${_scopeId}>${ssrInterpolate(statusLabel(value))}</span>`);
					else return [createVNode("span", { class: ["ui-badge", statusClass(value)] }, toDisplayString(statusLabel(value)), 3)];
				}),
				actions: withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						if (unref(can)("maintenance.logs.update") && !["completed", "cancelled"].includes(row.status)) _push(`<button class="ui-btn ui-btn--secondary ui-btn--sm" data-v-261ec578${_scopeId}>Complete</button>`);
						else _push(`<!---->`);
						if (unref(can)("maintenance.logs.update")) _push(`<button class="ui-btn ui-btn--ghost ui-btn--sm" data-v-261ec578${_scopeId}>Edit</button>`);
						else _push(`<!---->`);
						if (unref(can)("maintenance.logs.delete")) _push(`<button class="ui-btn ui-btn--danger ui-btn--sm" data-v-261ec578${_scopeId}>Delete</button>`);
						else _push(`<!---->`);
					} else return [
						unref(can)("maintenance.logs.update") && !["completed", "cancelled"].includes(row.status) ? (openBlock(), createBlock("button", {
							key: 0,
							class: "ui-btn ui-btn--secondary ui-btn--sm",
							onClick: ($event) => openComplete(row)
						}, "Complete", 8, ["onClick"])) : createCommentVNode("", true),
						unref(can)("maintenance.logs.update") ? (openBlock(), createBlock("button", {
							key: 1,
							class: "ui-btn ui-btn--ghost ui-btn--sm",
							onClick: ($event) => openEdit(row)
						}, "Edit", 8, ["onClick"])) : createCommentVNode("", true),
						unref(can)("maintenance.logs.delete") ? (openBlock(), createBlock("button", {
							key: 2,
							class: "ui-btn ui-btn--danger ui-btn--sm",
							onClick: ($event) => del(row)
						}, "Delete", 8, ["onClick"])) : createCommentVNode("", true)
					];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(Pagination_default, {
				paginator: props.records,
				only: ["records"]
			}, null, _parent));
			_push(ssrRenderComponent(Modal_default, {
				modelValue: showModal.value,
				"onUpdate:modelValue": ($event) => showModal.value = $event,
				title: unref(form).id ? "Edit Maintenance Record" : "Log Maintenance",
				width: "680px"
			}, {
				footer: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<button class="ui-btn ui-btn--ghost" data-v-261ec578${_scopeId}>Cancel</button><button class="ui-btn ui-btn--primary"${ssrIncludeBooleanAttr(unref(form).processing) ? " disabled" : ""} data-v-261ec578${_scopeId}>Save</button>`);
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
							modelValue: unref(form).asset_id,
							"onUpdate:modelValue": ($event) => unref(form).asset_id = $event,
							label: "Asset *",
							type: "select",
							error: unref(form).errors.asset_id
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) {
									_push(`<option value="" disabled data-v-261ec578${_scopeId}>Select asset</option><!--[-->`);
									ssrRenderList(props.assets, (a) => {
										_push(`<option${ssrRenderAttr("value", a.id)} data-v-261ec578${_scopeId}>${ssrInterpolate(a.name)} (${ssrInterpolate(a.asset_code)})</option>`);
									});
									_push(`<!--]-->`);
								} else return [createVNode("option", {
									value: "",
									disabled: ""
								}, "Select asset"), (openBlock(true), createBlock(Fragment, null, renderList(props.assets, (a) => {
									return openBlock(), createBlock("option", {
										key: a.id,
										value: a.id
									}, toDisplayString(a.name) + " (" + toDisplayString(a.asset_code) + ")", 9, ["value"]);
								}), 128))];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).description,
							"onUpdate:modelValue": ($event) => unref(form).description = $event,
							label: "Description *",
							placeholder: "What needs doing / the fault",
							error: unref(form).errors.description
						}, null, _parent, _scopeId));
						_push(`<div class="form-grid-2" data-v-261ec578${_scopeId}>`);
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).type,
							"onUpdate:modelValue": ($event) => unref(form).type = $event,
							label: "Type *",
							type: "select",
							error: unref(form).errors.type
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) {
									_push(`<!--[-->`);
									ssrRenderList(props.types, (t) => {
										_push(`<option${ssrRenderAttr("value", t)} data-v-261ec578${_scopeId}>${ssrInterpolate(titleize(t))}</option>`);
									});
									_push(`<!--]-->`);
								} else return [(openBlock(true), createBlock(Fragment, null, renderList(props.types, (t) => {
									return openBlock(), createBlock("option", {
										key: t,
										value: t
									}, toDisplayString(titleize(t)), 9, ["value"]);
								}), 128))];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).status,
							"onUpdate:modelValue": ($event) => unref(form).status = $event,
							label: "Status",
							type: "select",
							error: unref(form).errors.status
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) {
									_push(`<!--[-->`);
									ssrRenderList(props.statuses, (s) => {
										_push(`<option${ssrRenderAttr("value", s)} data-v-261ec578${_scopeId}>${ssrInterpolate(statusLabel(s))}</option>`);
									});
									_push(`<!--]-->`);
								} else return [(openBlock(true), createBlock(Fragment, null, renderList(props.statuses, (s) => {
									return openBlock(), createBlock("option", {
										key: s,
										value: s
									}, toDisplayString(statusLabel(s)), 9, ["value"]);
								}), 128))];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).scheduled_date,
							"onUpdate:modelValue": ($event) => unref(form).scheduled_date = $event,
							label: "Scheduled Date",
							type: "date",
							error: unref(form).errors.scheduled_date
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).performed_by,
							"onUpdate:modelValue": ($event) => unref(form).performed_by = $event,
							label: "Performed By",
							placeholder: "Technician / staff name",
							error: unref(form).errors.performed_by
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).vendor_id,
							"onUpdate:modelValue": ($event) => unref(form).vendor_id = $event,
							label: "Service Vendor",
							type: "select",
							error: unref(form).errors.vendor_id
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) {
									_push(`<option value="" data-v-261ec578${_scopeId}>— None —</option><!--[-->`);
									ssrRenderList(props.vendors, (v) => {
										_push(`<option${ssrRenderAttr("value", v.id)} data-v-261ec578${_scopeId}>${ssrInterpolate(v.name)}</option>`);
									});
									_push(`<!--]-->`);
								} else return [createVNode("option", { value: "" }, "— None —"), (openBlock(true), createBlock(Fragment, null, renderList(props.vendors, (v) => {
									return openBlock(), createBlock("option", {
										key: v.id,
										value: v.id
									}, toDisplayString(v.name), 9, ["value"]);
								}), 128))];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).cost,
							"onUpdate:modelValue": ($event) => unref(form).cost = $event,
							modelModifiers: { number: true },
							label: "Cost",
							type: "number",
							step: "0.01",
							error: unref(form).errors.cost
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).downtime_hours,
							"onUpdate:modelValue": ($event) => unref(form).downtime_hours = $event,
							modelModifiers: { number: true },
							label: "Downtime (hours)",
							type: "number",
							step: "0.5",
							error: unref(form).errors.downtime_hours
						}, null, _parent, _scopeId));
						_push(`</div>`);
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).notes,
							"onUpdate:modelValue": ($event) => unref(form).notes = $event,
							label: "Notes",
							type: "textarea",
							error: unref(form).errors.notes
						}, null, _parent, _scopeId));
					} else return [
						createVNode(_sfc_main$2, {
							modelValue: unref(form).asset_id,
							"onUpdate:modelValue": ($event) => unref(form).asset_id = $event,
							label: "Asset *",
							type: "select",
							error: unref(form).errors.asset_id
						}, {
							default: withCtx(() => [createVNode("option", {
								value: "",
								disabled: ""
							}, "Select asset"), (openBlock(true), createBlock(Fragment, null, renderList(props.assets, (a) => {
								return openBlock(), createBlock("option", {
									key: a.id,
									value: a.id
								}, toDisplayString(a.name) + " (" + toDisplayString(a.asset_code) + ")", 9, ["value"]);
							}), 128))]),
							_: 1
						}, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode(_sfc_main$2, {
							modelValue: unref(form).description,
							"onUpdate:modelValue": ($event) => unref(form).description = $event,
							label: "Description *",
							placeholder: "What needs doing / the fault",
							error: unref(form).errors.description
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode("div", { class: "form-grid-2" }, [
							createVNode(_sfc_main$2, {
								modelValue: unref(form).type,
								"onUpdate:modelValue": ($event) => unref(form).type = $event,
								label: "Type *",
								type: "select",
								error: unref(form).errors.type
							}, {
								default: withCtx(() => [(openBlock(true), createBlock(Fragment, null, renderList(props.types, (t) => {
									return openBlock(), createBlock("option", {
										key: t,
										value: t
									}, toDisplayString(titleize(t)), 9, ["value"]);
								}), 128))]),
								_: 1
							}, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"error"
							]),
							createVNode(_sfc_main$2, {
								modelValue: unref(form).status,
								"onUpdate:modelValue": ($event) => unref(form).status = $event,
								label: "Status",
								type: "select",
								error: unref(form).errors.status
							}, {
								default: withCtx(() => [(openBlock(true), createBlock(Fragment, null, renderList(props.statuses, (s) => {
									return openBlock(), createBlock("option", {
										key: s,
										value: s
									}, toDisplayString(statusLabel(s)), 9, ["value"]);
								}), 128))]),
								_: 1
							}, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"error"
							]),
							createVNode(_sfc_main$2, {
								modelValue: unref(form).scheduled_date,
								"onUpdate:modelValue": ($event) => unref(form).scheduled_date = $event,
								label: "Scheduled Date",
								type: "date",
								error: unref(form).errors.scheduled_date
							}, null, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"error"
							]),
							createVNode(_sfc_main$2, {
								modelValue: unref(form).performed_by,
								"onUpdate:modelValue": ($event) => unref(form).performed_by = $event,
								label: "Performed By",
								placeholder: "Technician / staff name",
								error: unref(form).errors.performed_by
							}, null, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"error"
							]),
							createVNode(_sfc_main$2, {
								modelValue: unref(form).vendor_id,
								"onUpdate:modelValue": ($event) => unref(form).vendor_id = $event,
								label: "Service Vendor",
								type: "select",
								error: unref(form).errors.vendor_id
							}, {
								default: withCtx(() => [createVNode("option", { value: "" }, "— None —"), (openBlock(true), createBlock(Fragment, null, renderList(props.vendors, (v) => {
									return openBlock(), createBlock("option", {
										key: v.id,
										value: v.id
									}, toDisplayString(v.name), 9, ["value"]);
								}), 128))]),
								_: 1
							}, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"error"
							]),
							createVNode(_sfc_main$2, {
								modelValue: unref(form).cost,
								"onUpdate:modelValue": ($event) => unref(form).cost = $event,
								modelModifiers: { number: true },
								label: "Cost",
								type: "number",
								step: "0.01",
								error: unref(form).errors.cost
							}, null, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"error"
							]),
							createVNode(_sfc_main$2, {
								modelValue: unref(form).downtime_hours,
								"onUpdate:modelValue": ($event) => unref(form).downtime_hours = $event,
								modelModifiers: { number: true },
								label: "Downtime (hours)",
								type: "number",
								step: "0.5",
								error: unref(form).errors.downtime_hours
							}, null, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"error"
							])
						]),
						createVNode(_sfc_main$2, {
							modelValue: unref(form).notes,
							"onUpdate:modelValue": ($event) => unref(form).notes = $event,
							label: "Notes",
							type: "textarea",
							error: unref(form).errors.notes
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						])
					];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(Modal_default, {
				modelValue: showComplete.value,
				"onUpdate:modelValue": ($event) => showComplete.value = $event,
				title: "Complete Maintenance",
				width: "480px"
			}, {
				footer: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<button class="ui-btn ui-btn--ghost" data-v-261ec578${_scopeId}>Cancel</button><button class="ui-btn ui-btn--primary"${ssrIncludeBooleanAttr(unref(completeForm).processing) ? " disabled" : ""} data-v-261ec578${_scopeId}>Mark Completed</button>`);
					else return [createVNode("button", {
						class: "ui-btn ui-btn--ghost",
						onClick: ($event) => showComplete.value = false
					}, "Cancel", 8, ["onClick"]), createVNode("button", {
						class: "ui-btn ui-btn--primary",
						disabled: unref(completeForm).processing,
						onClick: doComplete
					}, "Mark Completed", 8, ["disabled"])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<p class="ml__hint" data-v-261ec578${_scopeId}>Marking <strong data-v-261ec578${_scopeId}>${ssrInterpolate(completeRow.value?.maintenance_number)}</strong> on <strong data-v-261ec578${_scopeId}>${ssrInterpolate(completeRow.value?.asset_name)}</strong> as completed. This rolls the asset&#39;s next-service date forward and returns it to active.</p>`);
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(completeForm).completed_date,
							"onUpdate:modelValue": ($event) => unref(completeForm).completed_date = $event,
							label: "Completed Date",
							type: "date",
							error: unref(completeForm).errors.completed_date
						}, null, _parent, _scopeId));
						_push(`<div class="form-grid-2" data-v-261ec578${_scopeId}>`);
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(completeForm).cost,
							"onUpdate:modelValue": ($event) => unref(completeForm).cost = $event,
							modelModifiers: { number: true },
							label: "Final Cost",
							type: "number",
							step: "0.01",
							error: unref(completeForm).errors.cost
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(completeForm).downtime_hours,
							"onUpdate:modelValue": ($event) => unref(completeForm).downtime_hours = $event,
							modelModifiers: { number: true },
							label: "Downtime (hours)",
							type: "number",
							step: "0.5",
							error: unref(completeForm).errors.downtime_hours
						}, null, _parent, _scopeId));
						_push(`</div>`);
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(completeForm).notes,
							"onUpdate:modelValue": ($event) => unref(completeForm).notes = $event,
							label: "Notes",
							type: "textarea",
							error: unref(completeForm).errors.notes
						}, null, _parent, _scopeId));
					} else return [
						createVNode("p", { class: "ml__hint" }, [
							createTextVNode("Marking "),
							createVNode("strong", null, toDisplayString(completeRow.value?.maintenance_number), 1),
							createTextVNode(" on "),
							createVNode("strong", null, toDisplayString(completeRow.value?.asset_name), 1),
							createTextVNode(" as completed. This rolls the asset's next-service date forward and returns it to active.")
						]),
						createVNode(_sfc_main$2, {
							modelValue: unref(completeForm).completed_date,
							"onUpdate:modelValue": ($event) => unref(completeForm).completed_date = $event,
							label: "Completed Date",
							type: "date",
							error: unref(completeForm).errors.completed_date
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode("div", { class: "form-grid-2" }, [createVNode(_sfc_main$2, {
							modelValue: unref(completeForm).cost,
							"onUpdate:modelValue": ($event) => unref(completeForm).cost = $event,
							modelModifiers: { number: true },
							label: "Final Cost",
							type: "number",
							step: "0.01",
							error: unref(completeForm).errors.cost
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]), createVNode(_sfc_main$2, {
							modelValue: unref(completeForm).downtime_hours,
							"onUpdate:modelValue": ($event) => unref(completeForm).downtime_hours = $event,
							modelModifiers: { number: true },
							label: "Downtime (hours)",
							type: "number",
							step: "0.5",
							error: unref(completeForm).errors.downtime_hours
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						])]),
						createVNode(_sfc_main$2, {
							modelValue: unref(completeForm).notes,
							"onUpdate:modelValue": ($event) => unref(completeForm).notes = $event,
							label: "Notes",
							type: "textarea",
							error: unref(completeForm).errors.notes
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
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/pages/Maintenance/MaintenanceLogs.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var MaintenanceLogs_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-261ec578"]]);
//#endregion
export { MaintenanceLogs_default as default };
