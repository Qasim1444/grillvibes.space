import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-BOaGB7Aw.js";
import { n as usePermissions, t as AdminLayout_default } from "./AdminLayout-DSJnk4YL.js";
import { t as _sfc_main$1 } from "./PageHeader-D0aRDn5C.js";
import { t as DataTable_default } from "./DataTable-BHCUCuvd.js";
import { t as Pagination_default } from "./Pagination-h4WEvndd.js";
import { t as Modal_default } from "./Modal-DhESI6xO.js";
import { t as _sfc_main$2 } from "./FormField-Doe8oR1s.js";
import { t as StatCard_default } from "./StatCard-C81bFHCl.js";
import { Fragment, computed, createBlock, createCommentVNode, createTextVNode, createVNode, mergeProps, openBlock, ref, renderList, toDisplayString, unref, useSSRContext, watch, withCtx } from "vue";
import { router, useForm, usePage } from "@inertiajs/vue3";
import { ssrIncludeBooleanAttr, ssrInterpolate, ssrRenderAttr, ssrRenderAttrs, ssrRenderClass, ssrRenderComponent, ssrRenderList, ssrRenderStyle } from "vue/server-renderer";
//#region resources/js/pages/HR/Leaves.vue
var _sfc_main = /*@__PURE__*/ Object.assign({ layout: AdminLayout_default }, {
	__name: "Leaves",
	__ssrInlineRender: true,
	props: {
		leaves: {
			type: Object,
			default: () => ({ data: [] })
		},
		filters: {
			type: Object,
			default: () => ({
				search: "",
				status: ""
			})
		},
		employees: {
			type: Array,
			default: () => []
		},
		leaveTypes: {
			type: Array,
			default: () => []
		},
		stats: {
			type: Object,
			default: () => ({
				pending: 0,
				approved: 0,
				rejected: 0
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
				key: "leave_type_name",
				label: "Type"
			},
			{
				key: "period",
				label: "Period"
			},
			{
				key: "days",
				label: "Days",
				width: "80px"
			},
			{
				key: "reason",
				label: "Reason"
			},
			{
				key: "status",
				label: "Status"
			}
		];
		const rows = computed(() => props.leaves?.data ?? []);
		const search = ref(props.filters?.search ?? "");
		const status = ref(props.filters?.status ?? "");
		let searchTimer = null;
		const reload = (debounce) => {
			clearTimeout(searchTimer);
			searchTimer = setTimeout(() => router.get("/hr/leaves", {
				search: search.value || void 0,
				status: status.value || void 0
			}, {
				preserveState: true,
				preserveScroll: true,
				replace: true,
				only: [
					"leaves",
					"filters",
					"stats"
				]
			}), debounce);
		};
		watch(search, () => reload(300));
		watch(status, () => reload(0));
		const showModal = ref(false);
		const blank = {
			id: null,
			user_id: "",
			leave_type_id: "",
			from_date: "",
			to_date: "",
			reason: ""
		};
		const form = useForm({ ...blank });
		const dayCount = computed(() => {
			if (!form.from_date || !form.to_date) return 0;
			const diff = new Date(form.to_date) - new Date(form.from_date);
			return diff < 0 ? 0 : Math.round(diff / 864e5) + 1;
		});
		const openModal = () => {
			Object.assign(form, blank);
			form.clearErrors();
			showModal.value = true;
		};
		const editRow = (l) => {
			Object.assign(form, {
				id: l.id,
				user_id: l.user_id,
				leave_type_id: l.leave_type_id,
				from_date: l.from_date,
				to_date: l.to_date,
				reason: l.reason ?? ""
			});
			form.clearErrors();
			showModal.value = true;
		};
		const save = () => {
			const opts = {
				preserveScroll: true,
				onSuccess: () => showModal.value = false
			};
			if (form.id) form.put(`/hr/leaves/${form.id}`, opts);
			else form.post("/hr/leaves", opts);
		};
		const decide = (row, next) => {
			router.put(`/hr/leaves/${row.id}/decide`, { status: next }, { preserveScroll: true });
		};
		const deleteRow = (id) => {
			if (!confirm("Delete this leave request?")) return;
			router.delete(`/hr/leaves/${id}`, { preserveScroll: true });
		};
		const showTypeModal = ref(false);
		const typeBlank = {
			id: null,
			name: "",
			days_per_year: null,
			is_paid: true
		};
		const typeForm = useForm({ ...typeBlank });
		const resetTypeForm = () => {
			Object.assign(typeForm, typeBlank);
			typeForm.clearErrors();
		};
		const editType = (t) => {
			Object.assign(typeForm, {
				id: t.id,
				name: t.name,
				days_per_year: t.days_per_year,
				is_paid: !!t.is_paid
			});
			typeForm.clearErrors();
		};
		const saveType = () => {
			const opts = {
				preserveScroll: true,
				onSuccess: () => resetTypeForm()
			};
			if (typeForm.id) typeForm.put(`/hr/leaves/types/${typeForm.id}`, opts);
			else typeForm.post("/hr/leaves/types", opts);
		};
		const deleteType = (t) => {
			if (!confirm(`Delete leave type "${t.name}"?`)) return;
			router.delete(`/hr/leaves/types/${t.id}`, { preserveScroll: true });
		};
		const label = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : "—";
		const badgeClass = (s) => ({
			approved: "ui-badge--success",
			rejected: "ui-badge--muted",
			pending: "ui-badge--warning"
		})[s] ?? "ui-badge--muted";
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "page" }, _attrs))} data-v-0c3bea9c>`);
			_push(ssrRenderComponent(_sfc_main$1, {
				title: "Leaves",
				subtitle: "Leave requests and approvals. Approved unpaid leave is deducted by payroll."
			}, {
				actions: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						if (unref(can)("hr.leaves.create")) _push(`<button class="ui-btn ui-btn--ghost" data-v-0c3bea9c${_scopeId}> ⚙ Leave Types </button>`);
						else _push(`<!---->`);
						if (unref(can)("hr.leaves.create")) _push(`<button class="ui-btn ui-btn--primary" data-v-0c3bea9c${_scopeId}> + Add Leave </button>`);
						else _push(`<!---->`);
					} else return [unref(can)("hr.leaves.create") ? (openBlock(), createBlock("button", {
						key: 0,
						class: "ui-btn ui-btn--ghost",
						onClick: ($event) => showTypeModal.value = true
					}, " ⚙ Leave Types ", 8, ["onClick"])) : createCommentVNode("", true), unref(can)("hr.leaves.create") ? (openBlock(), createBlock("button", {
						key: 1,
						class: "ui-btn ui-btn--primary",
						onClick: openModal
					}, " + Add Leave ")) : createCommentVNode("", true)];
				}),
				_: 1
			}, _parent));
			if (flashError.value) _push(`<div class="ui-alert ui-alert--danger" data-v-0c3bea9c>${ssrInterpolate(flashError.value)}</div>`);
			else _push(`<!---->`);
			_push(`<div class="stat-grid" data-v-0c3bea9c>`);
			_push(ssrRenderComponent(StatCard_default, {
				label: "Pending",
				value: props.stats.pending
			}, null, _parent));
			_push(ssrRenderComponent(StatCard_default, {
				label: "Approved",
				value: props.stats.approved
			}, null, _parent));
			_push(ssrRenderComponent(StatCard_default, {
				label: "Rejected",
				value: props.stats.rejected
			}, null, _parent));
			_push(`</div><div class="lv__filters" data-v-0c3bea9c>`);
			_push(ssrRenderComponent(_sfc_main$2, {
				modelValue: status.value,
				"onUpdate:modelValue": ($event) => status.value = $event,
				label: "Status",
				type: "select"
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<option value="" data-v-0c3bea9c${_scopeId}>All statuses</option><option value="pending" data-v-0c3bea9c${_scopeId}>Pending</option><option value="approved" data-v-0c3bea9c${_scopeId}>Approved</option><option value="rejected" data-v-0c3bea9c${_scopeId}>Rejected</option>`);
					else return [
						createVNode("option", { value: "" }, "All statuses"),
						createVNode("option", { value: "pending" }, "Pending"),
						createVNode("option", { value: "approved" }, "Approved"),
						createVNode("option", { value: "rejected" }, "Rejected")
					];
				}),
				_: 1
			}, _parent));
			_push(`</div>`);
			_push(ssrRenderComponent(DataTable_default, {
				columns,
				rows: rows.value,
				index: "",
				searchable: "",
				query: search.value,
				"onUpdate:query": ($event) => search.value = $event,
				"search-placeholder": "Search employee…",
				"empty-text": "No leave requests found."
			}, {
				"cell:employee_name": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div class="lv__name" data-v-0c3bea9c${_scopeId}><strong data-v-0c3bea9c${_scopeId}>${ssrInterpolate(row.employee_name)}</strong>`);
						if (row.employee_code) _push(`<span class="lv__code" data-v-0c3bea9c${_scopeId}>${ssrInterpolate(row.employee_code)}</span>`);
						else _push(`<!---->`);
						_push(`</div>`);
					} else return [createVNode("div", { class: "lv__name" }, [createVNode("strong", null, toDisplayString(row.employee_name), 1), row.employee_code ? (openBlock(), createBlock("span", {
						key: 0,
						class: "lv__code"
					}, toDisplayString(row.employee_code), 1)) : createCommentVNode("", true)])];
				}),
				"cell:leave_type_name": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) _push(`${ssrInterpolate(row.leave_type_name)} <span class="${ssrRenderClass([row.is_paid ? "ui-badge--success" : "ui-badge--warning", "ui-badge"])}" data-v-0c3bea9c${_scopeId}>${ssrInterpolate(row.is_paid ? "Paid" : "Unpaid")}</span>`);
					else return [createTextVNode(toDisplayString(row.leave_type_name) + " ", 1), createVNode("span", { class: ["ui-badge", row.is_paid ? "ui-badge--success" : "ui-badge--warning"] }, toDisplayString(row.is_paid ? "Paid" : "Unpaid"), 3)];
				}),
				"cell:period": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) _push(`${ssrInterpolate(row.from_date)} → ${ssrInterpolate(row.to_date)}`);
					else return [createTextVNode(toDisplayString(row.from_date) + " → " + toDisplayString(row.to_date), 1)];
				}),
				"cell:status": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<span class="${ssrRenderClass([badgeClass(row.status), "ui-badge"])}" data-v-0c3bea9c${_scopeId}>${ssrInterpolate(label(row.status))}</span>`);
						if (row.approver_name) _push(`<span class="lv__by" data-v-0c3bea9c${_scopeId}>by ${ssrInterpolate(row.approver_name)}</span>`);
						else _push(`<!---->`);
					} else return [createVNode("span", { class: ["ui-badge", badgeClass(row.status)] }, toDisplayString(label(row.status)), 3), row.approver_name ? (openBlock(), createBlock("span", {
						key: 0,
						class: "lv__by"
					}, "by " + toDisplayString(row.approver_name), 1)) : createCommentVNode("", true)];
				}),
				actions: withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						if (unref(can)("hr.leaves.approve")) {
							_push(`<!--[-->`);
							if (row.status !== "approved") _push(`<button class="ui-btn ui-btn--success ui-btn--sm" data-v-0c3bea9c${_scopeId}> Approve </button>`);
							else _push(`<!---->`);
							if (row.status !== "rejected") _push(`<button class="ui-btn ui-btn--danger ui-btn--sm" data-v-0c3bea9c${_scopeId}> Reject </button>`);
							else _push(`<!---->`);
							if (row.status !== "pending") _push(`<button class="ui-btn ui-btn--ghost ui-btn--sm" data-v-0c3bea9c${_scopeId}> Reset </button>`);
							else _push(`<!---->`);
							_push(`<!--]-->`);
						} else _push(`<!---->`);
						if (unref(can)("hr.leaves.update") && row.status === "pending") _push(`<button class="ui-btn ui-btn--ghost ui-btn--sm" data-v-0c3bea9c${_scopeId}> Edit </button>`);
						else _push(`<!---->`);
						if (unref(can)("hr.leaves.delete")) _push(`<button class="ui-btn ui-btn--danger ui-btn--sm" data-v-0c3bea9c${_scopeId}> Delete </button>`);
						else _push(`<!---->`);
					} else return [
						unref(can)("hr.leaves.approve") ? (openBlock(), createBlock(Fragment, { key: 0 }, [
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
						unref(can)("hr.leaves.update") && row.status === "pending" ? (openBlock(), createBlock("button", {
							key: 1,
							class: "ui-btn ui-btn--ghost ui-btn--sm",
							onClick: ($event) => editRow(row)
						}, " Edit ", 8, ["onClick"])) : createCommentVNode("", true),
						unref(can)("hr.leaves.delete") ? (openBlock(), createBlock("button", {
							key: 2,
							class: "ui-btn ui-btn--danger ui-btn--sm",
							onClick: ($event) => deleteRow(row.id)
						}, " Delete ", 8, ["onClick"])) : createCommentVNode("", true)
					];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(Pagination_default, {
				paginator: props.leaves,
				only: ["leaves"]
			}, null, _parent));
			_push(ssrRenderComponent(Modal_default, {
				modelValue: showModal.value,
				"onUpdate:modelValue": ($event) => showModal.value = $event,
				title: unref(form).id ? "Edit Leave Request" : "Add Leave Request"
			}, {
				footer: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<button class="ui-btn ui-btn--ghost" data-v-0c3bea9c${_scopeId}>Cancel</button><button class="ui-btn ui-btn--primary"${ssrIncludeBooleanAttr(unref(form).processing) ? " disabled" : ""} data-v-0c3bea9c${_scopeId}>Save</button>`);
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
									_push(`<option value="" data-v-0c3bea9c${_scopeId}>— select —</option><!--[-->`);
									ssrRenderList(props.employees, (e) => {
										_push(`<option${ssrRenderAttr("value", e.id)} data-v-0c3bea9c${_scopeId}>${ssrInterpolate(e.name)}</option>`);
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
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).leave_type_id,
							"onUpdate:modelValue": ($event) => unref(form).leave_type_id = $event,
							label: "Leave type",
							type: "select",
							error: unref(form).errors.leave_type_id
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) {
									_push(`<option value="" data-v-0c3bea9c${_scopeId}>— select —</option><!--[-->`);
									ssrRenderList(props.leaveTypes, (t) => {
										_push(`<option${ssrRenderAttr("value", t.id)} data-v-0c3bea9c${_scopeId}>${ssrInterpolate(t.name)} (${ssrInterpolate(t.is_paid ? "paid" : "unpaid")}${ssrInterpolate(t.days_per_year ? `, ${t.days_per_year}/yr` : "")}) </option>`);
									});
									_push(`<!--]-->`);
								} else return [createVNode("option", { value: "" }, "— select —"), (openBlock(true), createBlock(Fragment, null, renderList(props.leaveTypes, (t) => {
									return openBlock(), createBlock("option", {
										key: t.id,
										value: t.id
									}, toDisplayString(t.name) + " (" + toDisplayString(t.is_paid ? "paid" : "unpaid") + toDisplayString(t.days_per_year ? `, ${t.days_per_year}/yr` : "") + ") ", 9, ["value"]);
								}), 128))];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(`<div class="lv__grid" data-v-0c3bea9c${_scopeId}>`);
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).from_date,
							"onUpdate:modelValue": ($event) => unref(form).from_date = $event,
							label: "From",
							type: "date",
							error: unref(form).errors.from_date
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).to_date,
							"onUpdate:modelValue": ($event) => unref(form).to_date = $event,
							label: "To",
							type: "date",
							error: unref(form).errors.to_date
						}, null, _parent, _scopeId));
						_push(`</div>`);
						if (dayCount.value) _push(`<p class="lv__days" data-v-0c3bea9c${_scopeId}>${ssrInterpolate(dayCount.value)} day${ssrInterpolate(dayCount.value === 1 ? "" : "s")}</p>`);
						else _push(`<!---->`);
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).reason,
							"onUpdate:modelValue": ($event) => unref(form).reason = $event,
							label: "Reason",
							type: "textarea",
							error: unref(form).errors.reason
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
						createVNode(_sfc_main$2, {
							modelValue: unref(form).leave_type_id,
							"onUpdate:modelValue": ($event) => unref(form).leave_type_id = $event,
							label: "Leave type",
							type: "select",
							error: unref(form).errors.leave_type_id
						}, {
							default: withCtx(() => [createVNode("option", { value: "" }, "— select —"), (openBlock(true), createBlock(Fragment, null, renderList(props.leaveTypes, (t) => {
								return openBlock(), createBlock("option", {
									key: t.id,
									value: t.id
								}, toDisplayString(t.name) + " (" + toDisplayString(t.is_paid ? "paid" : "unpaid") + toDisplayString(t.days_per_year ? `, ${t.days_per_year}/yr` : "") + ") ", 9, ["value"]);
							}), 128))]),
							_: 1
						}, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode("div", { class: "lv__grid" }, [createVNode(_sfc_main$2, {
							modelValue: unref(form).from_date,
							"onUpdate:modelValue": ($event) => unref(form).from_date = $event,
							label: "From",
							type: "date",
							error: unref(form).errors.from_date
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]), createVNode(_sfc_main$2, {
							modelValue: unref(form).to_date,
							"onUpdate:modelValue": ($event) => unref(form).to_date = $event,
							label: "To",
							type: "date",
							error: unref(form).errors.to_date
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						])]),
						dayCount.value ? (openBlock(), createBlock("p", {
							key: 0,
							class: "lv__days"
						}, toDisplayString(dayCount.value) + " day" + toDisplayString(dayCount.value === 1 ? "" : "s"), 1)) : createCommentVNode("", true),
						createVNode(_sfc_main$2, {
							modelValue: unref(form).reason,
							"onUpdate:modelValue": ($event) => unref(form).reason = $event,
							label: "Reason",
							type: "textarea",
							error: unref(form).errors.reason
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
				modelValue: showTypeModal.value,
				"onUpdate:modelValue": ($event) => showTypeModal.value = $event,
				title: "Manage Leave Types",
				width: "520px"
			}, {
				footer: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<button class="ui-btn ui-btn--primary" data-v-0c3bea9c${_scopeId}>Done</button>`);
					else return [createVNode("button", {
						class: "ui-btn ui-btn--primary",
						onClick: ($event) => showTypeModal.value = false
					}, "Done", 8, ["onClick"])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div class="lt__add" data-v-0c3bea9c${_scopeId}>`);
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(typeForm).name,
							"onUpdate:modelValue": ($event) => unref(typeForm).name = $event,
							label: "Name *",
							placeholder: "e.g. Annual Leave",
							error: unref(typeForm).errors.name
						}, null, _parent, _scopeId));
						_push(`<div class="lv__grid" data-v-0c3bea9c${_scopeId}>`);
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(typeForm).days_per_year,
							"onUpdate:modelValue": ($event) => unref(typeForm).days_per_year = $event,
							modelModifiers: { number: true },
							label: "Days / year",
							type: "number",
							min: "0",
							error: unref(typeForm).errors.days_per_year
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(typeForm).is_paid,
							"onUpdate:modelValue": ($event) => unref(typeForm).is_paid = $event,
							label: "Paid?",
							type: "select"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(`<option${ssrRenderAttr("value", true)} data-v-0c3bea9c${_scopeId}>Paid</option><option${ssrRenderAttr("value", false)} data-v-0c3bea9c${_scopeId}>Unpaid</option>`);
								else return [createVNode("option", { value: true }, "Paid"), createVNode("option", { value: false }, "Unpaid")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(`</div><div class="lt__add-actions" data-v-0c3bea9c${_scopeId}>`);
						if (unref(typeForm).id) _push(`<button class="ui-btn ui-btn--ghost ui-btn--sm" data-v-0c3bea9c${_scopeId}>Cancel edit</button>`);
						else _push(`<!---->`);
						_push(`<button class="ui-btn ui-btn--primary ui-btn--sm"${ssrIncludeBooleanAttr(unref(typeForm).processing) ? " disabled" : ""} data-v-0c3bea9c${_scopeId}>${ssrInterpolate(unref(typeForm).id ? "Update Type" : "+ Add Type")}</button></div></div><div class="lt__list" data-v-0c3bea9c${_scopeId}><!--[-->`);
						ssrRenderList(props.leaveTypes, (t) => {
							_push(`<div class="lt__row" data-v-0c3bea9c${_scopeId}><div class="lt__info" data-v-0c3bea9c${_scopeId}><strong data-v-0c3bea9c${_scopeId}>${ssrInterpolate(t.name)}</strong><span class="lt__meta" data-v-0c3bea9c${_scopeId}>${ssrInterpolate(t.is_paid ? "Paid" : "Unpaid")}${ssrInterpolate(t.days_per_year ? ` · ${t.days_per_year} days/yr` : "")}</span></div><div class="lt__actions" data-v-0c3bea9c${_scopeId}><button class="ui-btn ui-btn--ghost ui-btn--sm" data-v-0c3bea9c${_scopeId}>Edit</button>`);
							if (unref(can)("hr.leaves.delete")) _push(`<button class="ui-btn ui-btn--danger ui-btn--sm" data-v-0c3bea9c${_scopeId}>Delete</button>`);
							else _push(`<!---->`);
							_push(`</div></div>`);
						});
						_push(`<!--]-->`);
						if (!props.leaveTypes.length) _push(`<p class="data-table__empty" style="${ssrRenderStyle({ "padding": "16px 0" })}" data-v-0c3bea9c${_scopeId}>No leave types yet.</p>`);
						else _push(`<!---->`);
						_push(`</div>`);
					} else return [createVNode("div", { class: "lt__add" }, [
						createVNode(_sfc_main$2, {
							modelValue: unref(typeForm).name,
							"onUpdate:modelValue": ($event) => unref(typeForm).name = $event,
							label: "Name *",
							placeholder: "e.g. Annual Leave",
							error: unref(typeForm).errors.name
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode("div", { class: "lv__grid" }, [createVNode(_sfc_main$2, {
							modelValue: unref(typeForm).days_per_year,
							"onUpdate:modelValue": ($event) => unref(typeForm).days_per_year = $event,
							modelModifiers: { number: true },
							label: "Days / year",
							type: "number",
							min: "0",
							error: unref(typeForm).errors.days_per_year
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]), createVNode(_sfc_main$2, {
							modelValue: unref(typeForm).is_paid,
							"onUpdate:modelValue": ($event) => unref(typeForm).is_paid = $event,
							label: "Paid?",
							type: "select"
						}, {
							default: withCtx(() => [createVNode("option", { value: true }, "Paid"), createVNode("option", { value: false }, "Unpaid")]),
							_: 1
						}, 8, ["modelValue", "onUpdate:modelValue"])]),
						createVNode("div", { class: "lt__add-actions" }, [unref(typeForm).id ? (openBlock(), createBlock("button", {
							key: 0,
							class: "ui-btn ui-btn--ghost ui-btn--sm",
							onClick: resetTypeForm
						}, "Cancel edit")) : createCommentVNode("", true), createVNode("button", {
							class: "ui-btn ui-btn--primary ui-btn--sm",
							disabled: unref(typeForm).processing,
							onClick: saveType
						}, toDisplayString(unref(typeForm).id ? "Update Type" : "+ Add Type"), 9, ["disabled"])])
					]), createVNode("div", { class: "lt__list" }, [(openBlock(true), createBlock(Fragment, null, renderList(props.leaveTypes, (t) => {
						return openBlock(), createBlock("div", {
							key: t.id,
							class: "lt__row"
						}, [createVNode("div", { class: "lt__info" }, [createVNode("strong", null, toDisplayString(t.name), 1), createVNode("span", { class: "lt__meta" }, toDisplayString(t.is_paid ? "Paid" : "Unpaid") + toDisplayString(t.days_per_year ? ` · ${t.days_per_year} days/yr` : ""), 1)]), createVNode("div", { class: "lt__actions" }, [createVNode("button", {
							class: "ui-btn ui-btn--ghost ui-btn--sm",
							onClick: ($event) => editType(t)
						}, "Edit", 8, ["onClick"]), unref(can)("hr.leaves.delete") ? (openBlock(), createBlock("button", {
							key: 0,
							class: "ui-btn ui-btn--danger ui-btn--sm",
							onClick: ($event) => deleteType(t)
						}, "Delete", 8, ["onClick"])) : createCommentVNode("", true)])]);
					}), 128)), !props.leaveTypes.length ? (openBlock(), createBlock("p", {
						key: 0,
						class: "data-table__empty",
						style: { "padding": "16px 0" }
					}, "No leave types yet.")) : createCommentVNode("", true)])];
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
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/pages/HR/Leaves.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var Leaves_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-0c3bea9c"]]);
//#endregion
export { Leaves_default as default };
