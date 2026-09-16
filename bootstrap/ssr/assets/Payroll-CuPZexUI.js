import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-BOaGB7Aw.js";
import { n as usePermissions, t as AdminLayout_default } from "./AdminLayout-Bp8G38ms.js";
import { t as _sfc_main$1 } from "./PageHeader-D0aRDn5C.js";
import { t as DataTable_default } from "./DataTable-BHCUCuvd.js";
import { t as Pagination_default } from "./Pagination-h4WEvndd.js";
import { t as Modal_default } from "./Modal-DhESI6xO.js";
import { t as _sfc_main$2 } from "./FormField-Doe8oR1s.js";
import { t as StatCard_default } from "./StatCard-C81bFHCl.js";
import { Fragment, computed, createBlock, createCommentVNode, createTextVNode, createVNode, mergeProps, openBlock, ref, renderList, toDisplayString, unref, useSSRContext, withCtx } from "vue";
import { router, useForm, usePage } from "@inertiajs/vue3";
import { ssrIncludeBooleanAttr, ssrInterpolate, ssrRenderAttr, ssrRenderAttrs, ssrRenderClass, ssrRenderComponent, ssrRenderList } from "vue/server-renderer";
//#region resources/js/pages/HR/Payroll.vue
var _sfc_main = /*@__PURE__*/ Object.assign({ layout: AdminLayout_default }, {
	__name: "Payroll",
	__ssrInlineRender: true,
	props: {
		month: {
			type: String,
			default: ""
		},
		monthLabel: {
			type: String,
			default: ""
		},
		run: {
			type: Object,
			default: null
		},
		preview: {
			type: Object,
			default: null
		},
		runs: {
			type: Object,
			default: () => ({ data: [] })
		},
		deductions: {
			type: Array,
			default: () => []
		},
		employees: {
			type: Array,
			default: () => []
		}
	},
	setup(__props) {
		const { can } = usePermissions();
		const page = usePage();
		const props = __props;
		const flashError = computed(() => page.props.flash?.error || "");
		const monthError = computed(() => page.props.errors?.month || "");
		const columns = [
			{
				key: "name",
				label: "Employee"
			},
			{
				key: "designation",
				label: "Designation"
			},
			{
				key: "days",
				label: "Attendance"
			},
			{
				key: "earned_basic",
				label: "Earned Basic"
			},
			{
				key: "overtime_amount",
				label: "Overtime"
			},
			{
				key: "deductions_amount",
				label: "Deductions"
			},
			{
				key: "loan_deduction",
				label: "Loan"
			},
			{
				key: "gross",
				label: "Gross"
			},
			{
				key: "net",
				label: "Net"
			}
		];
		const deductionColumns = [
			{
				key: "employee_name",
				label: "Employee"
			},
			{
				key: "title",
				label: "Title"
			},
			{
				key: "amount",
				label: "Amount"
			},
			{
				key: "is_recurring",
				label: "Frequency"
			},
			{
				key: "effective_month",
				label: "Month"
			}
		];
		const runColumns = [
			{
				key: "month_label",
				label: "Month"
			},
			{
				key: "status",
				label: "Status"
			},
			{
				key: "payslips_count",
				label: "Payslips"
			},
			{
				key: "total_gross",
				label: "Gross"
			},
			{
				key: "total_deductions",
				label: "Deductions"
			},
			{
				key: "total_net",
				label: "Net"
			},
			{
				key: "paid_at",
				label: "Paid"
			}
		];
		const previewRows = computed(() => props.preview?.rows ?? []);
		const sheetRows = computed(() => props.run ? props.run.payslips : previewRows.value);
		const totals = computed(() => {
			if (props.run) return {
				employees: props.run.payslips.length,
				gross: props.run.total_gross,
				deductions: props.run.total_deductions,
				net: props.run.total_net
			};
			return props.preview?.totals ?? {
				employees: 0,
				gross: 0,
				deductions: 0,
				net: 0
			};
		});
		const generating = ref(false);
		const changeMonth = (value) => {
			if (!value) return;
			router.get("/hr/payroll", { month: value }, {
				preserveState: false,
				preserveScroll: true
			});
		};
		const generate = () => {
			if (props.run && !confirm("Recompute this draft? Its payslips will be replaced with fresh numbers.")) return;
			generating.value = true;
			router.post("/hr/payroll", { month: props.month }, {
				preserveScroll: true,
				onFinish: () => generating.value = false
			});
		};
		const approve = () => {
			if (!confirm("Approve this payroll? The numbers lock and one-off deductions are consumed.")) return;
			router.put(`/hr/payroll/${props.run.id}/approve`, {}, { preserveScroll: true });
		};
		const markPaid = () => {
			if (!confirm("Mark this payroll paid? Loan balances will be reduced by the collected installments.")) return;
			router.put(`/hr/payroll/${props.run.id}/paid`, {}, { preserveScroll: true });
		};
		const destroyRun = () => {
			if (!confirm("Delete this draft run?")) return;
			router.delete(`/hr/payroll/${props.run.id}`, { preserveScroll: true });
		};
		const showSlip = ref(false);
		const slip = ref(null);
		const snap = computed(() => slip.value?.snapshot ?? {});
		const openSlip = (row) => {
			slip.value = row;
			showSlip.value = true;
		};
		const showDeduction = ref(false);
		const dBlank = {
			id: null,
			user_id: "",
			title: "",
			amount: "",
			is_recurring: false,
			effective_month: ""
		};
		const dForm = useForm({ ...dBlank });
		const openDeduction = (row = null) => {
			Object.assign(dForm, dBlank);
			if (row) Object.assign(dForm, {
				id: row.id,
				user_id: row.user_id,
				title: row.title,
				amount: row.amount,
				is_recurring: row.is_recurring,
				effective_month: row.effective_month ?? ""
			});
			dForm.clearErrors();
			showDeduction.value = true;
		};
		const saveDeduction = () => {
			const opts = {
				preserveScroll: true,
				onSuccess: () => showDeduction.value = false
			};
			if (dForm.id) dForm.put(`/hr/deductions/${dForm.id}`, opts);
			else dForm.post("/hr/deductions", opts);
		};
		const deleteDeduction = (id) => {
			if (!confirm("Delete this deduction?")) return;
			router.delete(`/hr/deductions/${id}`, { preserveScroll: true });
		};
		const money = (v) => `Rs ${Number(v || 0).toLocaleString(void 0, { minimumFractionDigits: 0 })}`;
		const label = (s) => s ? String(s).charAt(0).toUpperCase() + String(s).slice(1) : "—";
		const statusClass = (s) => ({
			draft: "ui-badge--warning",
			approved: "ui-badge--info",
			paid: "ui-badge--success"
		})[s] ?? "ui-badge--muted";
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "page" }, _attrs))} data-v-cd0f6d80>`);
			_push(ssrRenderComponent(_sfc_main$1, {
				title: "Payroll",
				subtitle: "Generate a draft, approve it to lock the numbers, then mark it paid."
			}, {
				actions: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						if (!props.run && unref(can)("hr.payroll.create")) _push(`<button class="ui-btn ui-btn--primary"${ssrIncludeBooleanAttr(generating.value || !previewRows.value.length) ? " disabled" : ""} data-v-cd0f6d80${_scopeId}>${ssrInterpolate(generating.value ? "Generating…" : "Generate Draft")}</button>`);
						else _push(`<!---->`);
						if (props.run) {
							_push(`<!--[-->`);
							if (props.run.status === "draft" && unref(can)("hr.payroll.create")) _push(`<button class="ui-btn ui-btn--ghost" data-v-cd0f6d80${_scopeId}> Recompute </button>`);
							else _push(`<!---->`);
							if (props.run.status === "draft" && unref(can)("hr.payroll.approve")) _push(`<button class="ui-btn ui-btn--primary" data-v-cd0f6d80${_scopeId}> Approve </button>`);
							else _push(`<!---->`);
							if (props.run.status === "approved" && unref(can)("hr.payroll.approve")) _push(`<button class="ui-btn ui-btn--success" data-v-cd0f6d80${_scopeId}> Mark Paid </button>`);
							else _push(`<!---->`);
							if (props.run.status === "draft" && unref(can)("hr.payroll.delete")) _push(`<button class="ui-btn ui-btn--danger" data-v-cd0f6d80${_scopeId}> Delete Draft </button>`);
							else _push(`<!---->`);
							_push(`<!--]-->`);
						} else _push(`<!---->`);
					} else return [!props.run && unref(can)("hr.payroll.create") ? (openBlock(), createBlock("button", {
						key: 0,
						class: "ui-btn ui-btn--primary",
						disabled: generating.value || !previewRows.value.length,
						onClick: generate
					}, toDisplayString(generating.value ? "Generating…" : "Generate Draft"), 9, ["disabled"])) : createCommentVNode("", true), props.run ? (openBlock(), createBlock(Fragment, { key: 1 }, [
						props.run.status === "draft" && unref(can)("hr.payroll.create") ? (openBlock(), createBlock("button", {
							key: 0,
							class: "ui-btn ui-btn--ghost",
							onClick: generate
						}, " Recompute ")) : createCommentVNode("", true),
						props.run.status === "draft" && unref(can)("hr.payroll.approve") ? (openBlock(), createBlock("button", {
							key: 1,
							class: "ui-btn ui-btn--primary",
							onClick: approve
						}, " Approve ")) : createCommentVNode("", true),
						props.run.status === "approved" && unref(can)("hr.payroll.approve") ? (openBlock(), createBlock("button", {
							key: 2,
							class: "ui-btn ui-btn--success",
							onClick: markPaid
						}, " Mark Paid ")) : createCommentVNode("", true),
						props.run.status === "draft" && unref(can)("hr.payroll.delete") ? (openBlock(), createBlock("button", {
							key: 3,
							class: "ui-btn ui-btn--danger",
							onClick: destroyRun
						}, " Delete Draft ")) : createCommentVNode("", true)
					], 64)) : createCommentVNode("", true)];
				}),
				_: 1
			}, _parent));
			if (flashError.value) _push(`<div class="ui-alert ui-alert--danger" data-v-cd0f6d80>${ssrInterpolate(flashError.value)}</div>`);
			else _push(`<!---->`);
			if (monthError.value) _push(`<div class="ui-alert ui-alert--danger" data-v-cd0f6d80>${ssrInterpolate(monthError.value)}</div>`);
			else _push(`<!---->`);
			_push(`<div class="pr__bar ui-card ui-card-pad" data-v-cd0f6d80><div class="pr__month" data-v-cd0f6d80><label class="ui-label" for="pr-month" data-v-cd0f6d80>Month</label><input id="pr-month" class="ui-input" type="month"${ssrRenderAttr("value", props.month)} data-v-cd0f6d80></div><div class="pr__state" data-v-cd0f6d80><span class="pr__label" data-v-cd0f6d80>${ssrInterpolate(props.monthLabel)}</span>`);
			if (props.run) _push(`<span class="${ssrRenderClass([statusClass(props.run.status), "ui-badge"])}" data-v-cd0f6d80>${ssrInterpolate(label(props.run.status))}</span>`);
			else _push(`<span class="ui-badge ui-badge--info" data-v-cd0f6d80>Not generated — live preview</span>`);
			_push(`</div>`);
			if (props.run) {
				_push(`<div class="pr__meta" data-v-cd0f6d80>`);
				if (props.run.processor_name) _push(`<span data-v-cd0f6d80>Processed by ${ssrInterpolate(props.run.processor_name)}</span>`);
				else _push(`<!---->`);
				if (props.run.approved_at) _push(`<span data-v-cd0f6d80>Approved ${ssrInterpolate(props.run.approved_at)}</span>`);
				else _push(`<!---->`);
				if (props.run.paid_at) _push(`<span data-v-cd0f6d80>Paid ${ssrInterpolate(props.run.paid_at)}</span>`);
				else _push(`<!---->`);
				_push(`</div>`);
			} else _push(`<!---->`);
			_push(`</div><div class="stat-grid" data-v-cd0f6d80>`);
			_push(ssrRenderComponent(StatCard_default, {
				label: "Employees",
				value: totals.value.employees
			}, null, _parent));
			_push(ssrRenderComponent(StatCard_default, {
				label: "Gross",
				value: money(totals.value.gross),
				color: "var(--info)",
				tint: "var(--info-soft)"
			}, null, _parent));
			_push(ssrRenderComponent(StatCard_default, {
				label: "Deductions",
				value: money(totals.value.deductions),
				color: "var(--warning)",
				tint: "var(--warning-soft)"
			}, null, _parent));
			_push(ssrRenderComponent(StatCard_default, {
				label: "Net Payable",
				value: money(totals.value.net),
				color: "var(--success)",
				tint: "var(--success-soft)"
			}, null, _parent));
			_push(`</div>`);
			_push(ssrRenderComponent(DataTable_default, {
				columns,
				rows: sheetRows.value,
				index: "",
				searchable: "",
				"search-placeholder": "Filter by name, code or designation…",
				"empty-text": props.run ? "This run has no payslips." : "No payable employees for this month. Add employees under HR → Employees."
			}, {
				"cell:name": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div class="pr__name" data-v-cd0f6d80${_scopeId}><strong data-v-cd0f6d80${_scopeId}>${ssrInterpolate(row.name)}</strong>`);
						if (row.employee_code) _push(`<span class="pr__code" data-v-cd0f6d80${_scopeId}>${ssrInterpolate(row.employee_code)}</span>`);
						else _push(`<!---->`);
						_push(`</div>`);
					} else return [createVNode("div", { class: "pr__name" }, [createVNode("strong", null, toDisplayString(row.name), 1), row.employee_code ? (openBlock(), createBlock("span", {
						key: 0,
						class: "pr__code"
					}, toDisplayString(row.employee_code), 1)) : createCommentVNode("", true)])];
				}),
				"cell:days": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) _push(`<span class="pr__days" data-v-cd0f6d80${_scopeId}>${ssrInterpolate(row.present_days)} present · ${ssrInterpolate(row.absent_days)} absent · ${ssrInterpolate(row.leave_days)} leave <em data-v-cd0f6d80${_scopeId}>of ${ssrInterpolate(row.payable_days)}</em></span>`);
					else return [createVNode("span", { class: "pr__days" }, [createTextVNode(toDisplayString(row.present_days) + " present · " + toDisplayString(row.absent_days) + " absent · " + toDisplayString(row.leave_days) + " leave ", 1), createVNode("em", null, "of " + toDisplayString(row.payable_days), 1)])];
				}),
				"cell:earned_basic": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) _push(`${ssrInterpolate(money(row.earned_basic ?? row.basic))}`);
					else return [createTextVNode(toDisplayString(money(row.earned_basic ?? row.basic)), 1)];
				}),
				"cell:overtime_amount": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) _push(`${ssrInterpolate(money(value))}`);
					else return [createTextVNode(toDisplayString(money(value)), 1)];
				}),
				"cell:deductions_amount": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) _push(`${ssrInterpolate(money(value))}`);
					else return [createTextVNode(toDisplayString(money(value)), 1)];
				}),
				"cell:loan_deduction": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) _push(`${ssrInterpolate(money(value))}`);
					else return [createTextVNode(toDisplayString(money(value)), 1)];
				}),
				"cell:gross": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) _push(`${ssrInterpolate(money(value))}`);
					else return [createTextVNode(toDisplayString(money(value)), 1)];
				}),
				"cell:net": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) _push(`<strong data-v-cd0f6d80${_scopeId}>${ssrInterpolate(money(value))}</strong>`);
					else return [createVNode("strong", null, toDisplayString(money(value)), 1)];
				}),
				actions: withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) _push(`<button class="ui-btn ui-btn--ghost ui-btn--sm" data-v-cd0f6d80${_scopeId}>Details</button>`);
					else return [createVNode("button", {
						class: "ui-btn ui-btn--ghost ui-btn--sm",
						onClick: ($event) => openSlip(row)
					}, "Details", 8, ["onClick"])];
				}),
				_: 1
			}, _parent));
			_push(`<div class="pr__section" data-v-cd0f6d80><div class="pr__section-head" data-v-cd0f6d80><div data-v-cd0f6d80><h3 class="pr__h3" data-v-cd0f6d80>Deductions</h3><p class="pr__sub" data-v-cd0f6d80> Unbilled deductions. Recurring ones are charged every month; one-off rows are consumed the moment a run is approved. </p></div>`);
			if (unref(can)("hr.payroll.create")) _push(`<button class="ui-btn ui-btn--primary ui-btn--sm" data-v-cd0f6d80> + Add Deduction </button>`);
			else _push(`<!---->`);
			_push(`</div>`);
			_push(ssrRenderComponent(DataTable_default, {
				columns: deductionColumns,
				rows: props.deductions,
				index: "",
				"empty-text": "No pending deductions."
			}, {
				"cell:amount": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) _push(`${ssrInterpolate(money(value))}`);
					else return [createTextVNode(toDisplayString(money(value)), 1)];
				}),
				"cell:is_recurring": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) _push(`<span class="${ssrRenderClass([value ? "ui-badge--info" : "ui-badge--muted", "ui-badge"])}" data-v-cd0f6d80${_scopeId}>${ssrInterpolate(value ? "Monthly" : "One-off")}</span>`);
					else return [createVNode("span", { class: ["ui-badge", value ? "ui-badge--info" : "ui-badge--muted"] }, toDisplayString(value ? "Monthly" : "One-off"), 3)];
				}),
				"cell:effective_month": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) _push(`${ssrInterpolate(value || "Any month")}`);
					else return [createTextVNode(toDisplayString(value || "Any month"), 1)];
				}),
				actions: withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						if (unref(can)("hr.payroll.create")) _push(`<button class="ui-btn ui-btn--ghost ui-btn--sm" data-v-cd0f6d80${_scopeId}> Edit </button>`);
						else _push(`<!---->`);
						if (unref(can)("hr.payroll.delete")) _push(`<button class="ui-btn ui-btn--danger ui-btn--sm" data-v-cd0f6d80${_scopeId}> Delete </button>`);
						else _push(`<!---->`);
					} else return [unref(can)("hr.payroll.create") ? (openBlock(), createBlock("button", {
						key: 0,
						class: "ui-btn ui-btn--ghost ui-btn--sm",
						onClick: ($event) => openDeduction(row)
					}, " Edit ", 8, ["onClick"])) : createCommentVNode("", true), unref(can)("hr.payroll.delete") ? (openBlock(), createBlock("button", {
						key: 1,
						class: "ui-btn ui-btn--danger ui-btn--sm",
						onClick: ($event) => deleteDeduction(row.id)
					}, " Delete ", 8, ["onClick"])) : createCommentVNode("", true)];
				}),
				_: 1
			}, _parent));
			_push(`</div><div class="pr__section" data-v-cd0f6d80><h3 class="pr__h3" data-v-cd0f6d80>Run History</h3>`);
			_push(ssrRenderComponent(DataTable_default, {
				columns: runColumns,
				rows: props.runs.data,
				"empty-text": "No payroll runs yet."
			}, {
				"cell:status": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) _push(`<span class="${ssrRenderClass([statusClass(value), "ui-badge"])}" data-v-cd0f6d80${_scopeId}>${ssrInterpolate(label(value))}</span>`);
					else return [createVNode("span", { class: ["ui-badge", statusClass(value)] }, toDisplayString(label(value)), 3)];
				}),
				"cell:total_gross": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) _push(`${ssrInterpolate(money(value))}`);
					else return [createTextVNode(toDisplayString(money(value)), 1)];
				}),
				"cell:total_deductions": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) _push(`${ssrInterpolate(money(value))}`);
					else return [createTextVNode(toDisplayString(money(value)), 1)];
				}),
				"cell:total_net": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) _push(`<strong data-v-cd0f6d80${_scopeId}>${ssrInterpolate(money(value))}</strong>`);
					else return [createVNode("strong", null, toDisplayString(money(value)), 1)];
				}),
				actions: withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) _push(`<button class="ui-btn ui-btn--ghost ui-btn--sm" data-v-cd0f6d80${_scopeId}>Open</button>`);
					else return [createVNode("button", {
						class: "ui-btn ui-btn--ghost ui-btn--sm",
						onClick: ($event) => changeMonth(row.month)
					}, "Open", 8, ["onClick"])];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(Pagination_default, {
				paginator: props.runs,
				only: ["runs"]
			}, null, _parent));
			_push(`</div>`);
			_push(ssrRenderComponent(Modal_default, {
				modelValue: showSlip.value,
				"onUpdate:modelValue": ($event) => showSlip.value = $event,
				title: `Payslip — ${slip.value?.name ?? ""}`,
				width: "620px"
			}, {
				footer: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<button class="ui-btn ui-btn--ghost" data-v-cd0f6d80${_scopeId}>Close</button>`);
					else return [createVNode("button", {
						class: "ui-btn ui-btn--ghost",
						onClick: ($event) => showSlip.value = false
					}, "Close", 8, ["onClick"])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						if (slip.value) {
							_push(`<!--[--><div class="pr__slip-head" data-v-cd0f6d80${_scopeId}><div data-v-cd0f6d80${_scopeId}><strong data-v-cd0f6d80${_scopeId}>${ssrInterpolate(slip.value.name)}</strong>`);
							if (slip.value.employee_code) _push(`<span class="pr__code" data-v-cd0f6d80${_scopeId}> · ${ssrInterpolate(slip.value.employee_code)}</span>`);
							else _push(`<!---->`);
							if (slip.value.designation) _push(`<div class="pr__sub" data-v-cd0f6d80${_scopeId}>${ssrInterpolate(slip.value.designation)}</div>`);
							else _push(`<!---->`);
							_push(`</div><div class="pr__slip-net" data-v-cd0f6d80${_scopeId}><span class="pr__sub" data-v-cd0f6d80${_scopeId}>Net pay</span><strong data-v-cd0f6d80${_scopeId}>${ssrInterpolate(money(slip.value.net))}</strong></div></div><table class="pr__table" data-v-cd0f6d80${_scopeId}><tbody data-v-cd0f6d80${_scopeId}><tr data-v-cd0f6d80${_scopeId}><td data-v-cd0f6d80${_scopeId}>Basic salary (monthly)</td><td data-v-cd0f6d80${_scopeId}>${ssrInterpolate(money(snap.value.basic_salary ?? slip.value.basic))}</td></tr><tr data-v-cd0f6d80${_scopeId}><td data-v-cd0f6d80${_scopeId}>Payable days</td><td data-v-cd0f6d80${_scopeId}>${ssrInterpolate(slip.value.payable_days)}</td></tr><tr data-v-cd0f6d80${_scopeId}><td data-v-cd0f6d80${_scopeId}>Absent / leave deducted</td><td data-v-cd0f6d80${_scopeId}>${ssrInterpolate(slip.value.absent_days)} day(s)</td></tr><tr data-v-cd0f6d80${_scopeId}><td data-v-cd0f6d80${_scopeId}>Earned basic</td><td data-v-cd0f6d80${_scopeId}>${ssrInterpolate(money(slip.value.earned_basic ?? slip.value.basic))}</td></tr><tr data-v-cd0f6d80${_scopeId}><td data-v-cd0f6d80${_scopeId}>Overtime</td><td data-v-cd0f6d80${_scopeId}>${ssrInterpolate(money(slip.value.overtime_amount))}</td></tr><tr class="pr__row-strong" data-v-cd0f6d80${_scopeId}><td data-v-cd0f6d80${_scopeId}>Gross</td><td data-v-cd0f6d80${_scopeId}>${ssrInterpolate(money(slip.value.gross))}</td></tr><tr data-v-cd0f6d80${_scopeId}><td data-v-cd0f6d80${_scopeId}>Deductions</td><td data-v-cd0f6d80${_scopeId}>− ${ssrInterpolate(money(slip.value.deductions_amount))}</td></tr><tr data-v-cd0f6d80${_scopeId}><td data-v-cd0f6d80${_scopeId}>Loan installment</td><td data-v-cd0f6d80${_scopeId}>− ${ssrInterpolate(money(slip.value.loan_deduction))}</td></tr><tr class="pr__row-strong" data-v-cd0f6d80${_scopeId}><td data-v-cd0f6d80${_scopeId}>Net</td><td data-v-cd0f6d80${_scopeId}>${ssrInterpolate(money(slip.value.net))}</td></tr></tbody></table>`);
							if (snap.value.overtime?.length) {
								_push(`<div class="pr__block" data-v-cd0f6d80${_scopeId}><h4 class="pr__h4" data-v-cd0f6d80${_scopeId}>Overtime entries</h4><!--[-->`);
								ssrRenderList(snap.value.overtime, (o, i) => {
									_push(`<p class="pr__line" data-v-cd0f6d80${_scopeId}>${ssrInterpolate(o.date)} — ${ssrInterpolate(o.hours)} h × ${ssrInterpolate(money(o.rate_per_hour))} = ${ssrInterpolate(money(o.amount))}</p>`);
								});
								_push(`<!--]--></div>`);
							} else _push(`<!---->`);
							if (snap.value.leaves?.length) {
								_push(`<div class="pr__block" data-v-cd0f6d80${_scopeId}><h4 class="pr__h4" data-v-cd0f6d80${_scopeId}>Leave</h4><!--[-->`);
								ssrRenderList(snap.value.leaves, (l, i) => {
									_push(`<p class="pr__line" data-v-cd0f6d80${_scopeId}>${ssrInterpolate(l.type)} — ${ssrInterpolate(l.from)} → ${ssrInterpolate(l.to)} (${ssrInterpolate(l.days)} day${ssrInterpolate(l.days === 1 ? "" : "s")}, ${ssrInterpolate(l.paid ? "paid" : "unpaid")}) </p>`);
								});
								_push(`<!--]--></div>`);
							} else _push(`<!---->`);
							if (snap.value.deductions?.length) {
								_push(`<div class="pr__block" data-v-cd0f6d80${_scopeId}><h4 class="pr__h4" data-v-cd0f6d80${_scopeId}>Deductions</h4><!--[-->`);
								ssrRenderList(snap.value.deductions, (d, i) => {
									_push(`<p class="pr__line" data-v-cd0f6d80${_scopeId}>${ssrInterpolate(d.title)} — ${ssrInterpolate(money(d.amount))}`);
									if (d.recurring) _push(`<span data-v-cd0f6d80${_scopeId}> (monthly)</span>`);
									else _push(`<!---->`);
									_push(`</p>`);
								});
								_push(`<!--]--></div>`);
							} else _push(`<!---->`);
							if (snap.value.loans?.length) {
								_push(`<div class="pr__block" data-v-cd0f6d80${_scopeId}><h4 class="pr__h4" data-v-cd0f6d80${_scopeId}>Loan installments</h4><!--[-->`);
								ssrRenderList(snap.value.loans, (l, i) => {
									_push(`<p class="pr__line" data-v-cd0f6d80${_scopeId}>${ssrInterpolate(label(l.type))} #${ssrInterpolate(l.loan_id)} — ${ssrInterpolate(money(l.amount))}</p>`);
								});
								_push(`<!--]--></div>`);
							} else _push(`<!---->`);
							if (snap.value.generated_at) _push(`<p class="pr__sub" data-v-cd0f6d80${_scopeId}>Computed ${ssrInterpolate(snap.value.generated_at)}</p>`);
							else _push(`<!---->`);
							_push(`<!--]-->`);
						} else _push(`<!---->`);
					} else return [slip.value ? (openBlock(), createBlock(Fragment, { key: 0 }, [
						createVNode("div", { class: "pr__slip-head" }, [createVNode("div", null, [
							createVNode("strong", null, toDisplayString(slip.value.name), 1),
							slip.value.employee_code ? (openBlock(), createBlock("span", {
								key: 0,
								class: "pr__code"
							}, " · " + toDisplayString(slip.value.employee_code), 1)) : createCommentVNode("", true),
							slip.value.designation ? (openBlock(), createBlock("div", {
								key: 1,
								class: "pr__sub"
							}, toDisplayString(slip.value.designation), 1)) : createCommentVNode("", true)
						]), createVNode("div", { class: "pr__slip-net" }, [createVNode("span", { class: "pr__sub" }, "Net pay"), createVNode("strong", null, toDisplayString(money(slip.value.net)), 1)])]),
						createVNode("table", { class: "pr__table" }, [createVNode("tbody", null, [
							createVNode("tr", null, [createVNode("td", null, "Basic salary (monthly)"), createVNode("td", null, toDisplayString(money(snap.value.basic_salary ?? slip.value.basic)), 1)]),
							createVNode("tr", null, [createVNode("td", null, "Payable days"), createVNode("td", null, toDisplayString(slip.value.payable_days), 1)]),
							createVNode("tr", null, [createVNode("td", null, "Absent / leave deducted"), createVNode("td", null, toDisplayString(slip.value.absent_days) + " day(s)", 1)]),
							createVNode("tr", null, [createVNode("td", null, "Earned basic"), createVNode("td", null, toDisplayString(money(slip.value.earned_basic ?? slip.value.basic)), 1)]),
							createVNode("tr", null, [createVNode("td", null, "Overtime"), createVNode("td", null, toDisplayString(money(slip.value.overtime_amount)), 1)]),
							createVNode("tr", { class: "pr__row-strong" }, [createVNode("td", null, "Gross"), createVNode("td", null, toDisplayString(money(slip.value.gross)), 1)]),
							createVNode("tr", null, [createVNode("td", null, "Deductions"), createVNode("td", null, "− " + toDisplayString(money(slip.value.deductions_amount)), 1)]),
							createVNode("tr", null, [createVNode("td", null, "Loan installment"), createVNode("td", null, "− " + toDisplayString(money(slip.value.loan_deduction)), 1)]),
							createVNode("tr", { class: "pr__row-strong" }, [createVNode("td", null, "Net"), createVNode("td", null, toDisplayString(money(slip.value.net)), 1)])
						])]),
						snap.value.overtime?.length ? (openBlock(), createBlock("div", {
							key: 0,
							class: "pr__block"
						}, [createVNode("h4", { class: "pr__h4" }, "Overtime entries"), (openBlock(true), createBlock(Fragment, null, renderList(snap.value.overtime, (o, i) => {
							return openBlock(), createBlock("p", {
								key: i,
								class: "pr__line"
							}, toDisplayString(o.date) + " — " + toDisplayString(o.hours) + " h × " + toDisplayString(money(o.rate_per_hour)) + " = " + toDisplayString(money(o.amount)), 1);
						}), 128))])) : createCommentVNode("", true),
						snap.value.leaves?.length ? (openBlock(), createBlock("div", {
							key: 1,
							class: "pr__block"
						}, [createVNode("h4", { class: "pr__h4" }, "Leave"), (openBlock(true), createBlock(Fragment, null, renderList(snap.value.leaves, (l, i) => {
							return openBlock(), createBlock("p", {
								key: i,
								class: "pr__line"
							}, toDisplayString(l.type) + " — " + toDisplayString(l.from) + " → " + toDisplayString(l.to) + " (" + toDisplayString(l.days) + " day" + toDisplayString(l.days === 1 ? "" : "s") + ", " + toDisplayString(l.paid ? "paid" : "unpaid") + ") ", 1);
						}), 128))])) : createCommentVNode("", true),
						snap.value.deductions?.length ? (openBlock(), createBlock("div", {
							key: 2,
							class: "pr__block"
						}, [createVNode("h4", { class: "pr__h4" }, "Deductions"), (openBlock(true), createBlock(Fragment, null, renderList(snap.value.deductions, (d, i) => {
							return openBlock(), createBlock("p", {
								key: i,
								class: "pr__line"
							}, [createTextVNode(toDisplayString(d.title) + " — " + toDisplayString(money(d.amount)), 1), d.recurring ? (openBlock(), createBlock("span", { key: 0 }, " (monthly)")) : createCommentVNode("", true)]);
						}), 128))])) : createCommentVNode("", true),
						snap.value.loans?.length ? (openBlock(), createBlock("div", {
							key: 3,
							class: "pr__block"
						}, [createVNode("h4", { class: "pr__h4" }, "Loan installments"), (openBlock(true), createBlock(Fragment, null, renderList(snap.value.loans, (l, i) => {
							return openBlock(), createBlock("p", {
								key: i,
								class: "pr__line"
							}, toDisplayString(label(l.type)) + " #" + toDisplayString(l.loan_id) + " — " + toDisplayString(money(l.amount)), 1);
						}), 128))])) : createCommentVNode("", true),
						snap.value.generated_at ? (openBlock(), createBlock("p", {
							key: 4,
							class: "pr__sub"
						}, "Computed " + toDisplayString(snap.value.generated_at), 1)) : createCommentVNode("", true)
					], 64)) : createCommentVNode("", true)];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(Modal_default, {
				modelValue: showDeduction.value,
				"onUpdate:modelValue": ($event) => showDeduction.value = $event,
				title: unref(dForm).id ? "Edit Deduction" : "Add Deduction"
			}, {
				footer: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<button class="ui-btn ui-btn--ghost" data-v-cd0f6d80${_scopeId}>Cancel</button><button class="ui-btn ui-btn--primary"${ssrIncludeBooleanAttr(unref(dForm).processing) ? " disabled" : ""} data-v-cd0f6d80${_scopeId}>Save</button>`);
					else return [createVNode("button", {
						class: "ui-btn ui-btn--ghost",
						onClick: ($event) => showDeduction.value = false
					}, "Cancel", 8, ["onClick"]), createVNode("button", {
						class: "ui-btn ui-btn--primary",
						disabled: unref(dForm).processing,
						onClick: saveDeduction
					}, "Save", 8, ["disabled"])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(dForm).user_id,
							"onUpdate:modelValue": ($event) => unref(dForm).user_id = $event,
							label: "Employee",
							type: "select",
							error: unref(dForm).errors.user_id
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) {
									_push(`<option value="" data-v-cd0f6d80${_scopeId}>— select —</option><!--[-->`);
									ssrRenderList(props.employees, (e) => {
										_push(`<option${ssrRenderAttr("value", e.id)} data-v-cd0f6d80${_scopeId}>${ssrInterpolate(e.name)}</option>`);
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
							modelValue: unref(dForm).title,
							"onUpdate:modelValue": ($event) => unref(dForm).title = $event,
							label: "Title",
							placeholder: "e.g. Uniform, Fine, Insurance",
							error: unref(dForm).errors.title
						}, null, _parent, _scopeId));
						_push(`<div class="pr__grid" data-v-cd0f6d80${_scopeId}>`);
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(dForm).amount,
							"onUpdate:modelValue": ($event) => unref(dForm).amount = $event,
							label: "Amount",
							type: "number",
							step: "0.01",
							error: unref(dForm).errors.amount
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(dForm).is_recurring,
							"onUpdate:modelValue": ($event) => unref(dForm).is_recurring = $event,
							label: "Frequency",
							type: "select",
							error: unref(dForm).errors.is_recurring
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(`<option${ssrRenderAttr("value", false)} data-v-cd0f6d80${_scopeId}>One-off</option><option${ssrRenderAttr("value", true)} data-v-cd0f6d80${_scopeId}>Every month</option>`);
								else return [createVNode("option", { value: false }, "One-off"), createVNode("option", { value: true }, "Every month")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(`</div>`);
						if (!unref(dForm).is_recurring) _push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(dForm).effective_month,
							"onUpdate:modelValue": ($event) => unref(dForm).effective_month = $event,
							label: "Charge in month (blank = next run)",
							type: "month",
							error: unref(dForm).errors.effective_month
						}, null, _parent, _scopeId));
						else _push(`<!---->`);
					} else return [
						createVNode(_sfc_main$2, {
							modelValue: unref(dForm).user_id,
							"onUpdate:modelValue": ($event) => unref(dForm).user_id = $event,
							label: "Employee",
							type: "select",
							error: unref(dForm).errors.user_id
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
							modelValue: unref(dForm).title,
							"onUpdate:modelValue": ($event) => unref(dForm).title = $event,
							label: "Title",
							placeholder: "e.g. Uniform, Fine, Insurance",
							error: unref(dForm).errors.title
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode("div", { class: "pr__grid" }, [createVNode(_sfc_main$2, {
							modelValue: unref(dForm).amount,
							"onUpdate:modelValue": ($event) => unref(dForm).amount = $event,
							label: "Amount",
							type: "number",
							step: "0.01",
							error: unref(dForm).errors.amount
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]), createVNode(_sfc_main$2, {
							modelValue: unref(dForm).is_recurring,
							"onUpdate:modelValue": ($event) => unref(dForm).is_recurring = $event,
							label: "Frequency",
							type: "select",
							error: unref(dForm).errors.is_recurring
						}, {
							default: withCtx(() => [createVNode("option", { value: false }, "One-off"), createVNode("option", { value: true }, "Every month")]),
							_: 1
						}, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						])]),
						!unref(dForm).is_recurring ? (openBlock(), createBlock(_sfc_main$2, {
							key: 0,
							modelValue: unref(dForm).effective_month,
							"onUpdate:modelValue": ($event) => unref(dForm).effective_month = $event,
							label: "Charge in month (blank = next run)",
							type: "month",
							error: unref(dForm).errors.effective_month
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						])) : createCommentVNode("", true)
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
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/pages/HR/Payroll.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var Payroll_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-cd0f6d80"]]);
//#endregion
export { Payroll_default as default };
