import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-BOaGB7Aw.js";
import { n as usePermissions, t as AdminLayout_default } from "./AdminLayout-Dn6OtQae.js";
import { t as _sfc_main$1 } from "./PageHeader-D0aRDn5C.js";
import { t as DataTable_default } from "./DataTable-DQdMyI8_.js";
import { t as Pagination_default } from "./Pagination-CHJUzz_w.js";
import { t as Modal_default } from "./Modal-CpmFAnsY.js";
import { t as _sfc_main$2 } from "./FormField-Doe8oR1s.js";
import { Fragment, computed, createBlock, createCommentVNode, createTextVNode, createVNode, mergeProps, openBlock, ref, renderList, toDisplayString, unref, useSSRContext, watch, withCtx } from "vue";
import { router, useForm } from "@inertiajs/vue3";
import { ssrIncludeBooleanAttr, ssrInterpolate, ssrLooseContain, ssrLooseEqual, ssrRenderAttr, ssrRenderAttrs, ssrRenderClass, ssrRenderComponent, ssrRenderList, ssrRenderStyle } from "vue/server-renderer";
//#region resources/js/pages/Finance/Vouchers.vue
var _sfc_main = /*@__PURE__*/ Object.assign({ layout: AdminLayout_default }, {
	__name: "Vouchers",
	__ssrInlineRender: true,
	props: {
		vouchers: {
			type: Object,
			default: () => ({ data: [] })
		},
		claimableExpenses: {
			type: Array,
			default: () => []
		},
		accounts: {
			type: Array,
			default: () => []
		},
		claimants: {
			type: Array,
			default: () => []
		},
		branches: {
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
				pending: 0,
				pending_amount: 0,
				claimed_this_month: 0,
				approved_this_month: 0
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
				key: "voucher_number",
				label: "Voucher #"
			},
			{
				key: "voucher_date",
				label: "Date"
			},
			{
				key: "claimant_label",
				label: "Claimant"
			},
			{
				key: "purpose",
				label: "Purpose"
			},
			{
				key: "expenses",
				label: "Expenses"
			},
			{
				key: "amount",
				label: "Amount"
			},
			{
				key: "account_name",
				label: "Fund"
			},
			{
				key: "status",
				label: "Status"
			}
		];
		const vouchers = computed(() => props.vouchers?.data ?? []);
		const search = ref(props.filters?.search ?? "");
		const statusFilter = ref(props.filters?.status ?? "");
		const accountFilter = ref(props.filters?.account_id ?? "");
		const branchFilter = ref(props.filters?.branch_id ?? "");
		let timer = null;
		const reload = () => router.get("/finance/vouchers", {
			search: search.value || void 0,
			status: statusFilter.value || void 0,
			account_id: accountFilter.value || void 0,
			branch_id: branchFilter.value || void 0
		}, {
			preserveState: true,
			preserveScroll: true,
			replace: true,
			only: [
				"vouchers",
				"summary",
				"filters"
			]
		});
		watch([
			search,
			statusFilter,
			accountFilter,
			branchFilter
		], () => {
			clearTimeout(timer);
			timer = setTimeout(reload, 300);
		});
		const paidViaLabel = (p) => ({
			cash: "Cash",
			bank: "Bank",
			card: "Card",
			petty_cash: "Petty Cash"
		})[p] ?? p;
		const statusLabel = (s) => ({
			pending: "Pending",
			approved: "Approved",
			rejected: "Rejected"
		})[s] ?? s;
		const statusClass = (s) => ({
			pending: "ui-badge--warning",
			approved: "ui-badge--success",
			rejected: "ui-badge--danger"
		})[s] ?? "ui-badge--muted";
		const today = () => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
		const defaults = () => ({
			id: null,
			branch_id: "",
			petty_cash_account_id: "",
			claimant_id: "",
			claimant_name: "",
			voucher_date: today(),
			purpose: "",
			reference: "",
			notes: "",
			expense_ids: []
		});
		const showModal = ref(false);
		const form = useForm(defaults());
		const editingExpenses = ref([]);
		const pickable = computed(() => {
			const pool = [...props.claimableExpenses];
			const seen = new Set(pool.map((e) => e.id));
			editingExpenses.value.forEach((e) => {
				if (!seen.has(e.id)) pool.push(e);
			});
			return pool;
		});
		const isPicked = (id) => form.expense_ids.includes(id);
		const toggle = (id) => {
			form.expense_ids = isPicked(id) ? form.expense_ids.filter((x) => x !== id) : [...form.expense_ids, id];
		};
		const claimTotal = computed(() => pickable.value.filter((e) => isPicked(e.id)).reduce((sum, e) => sum + Number(e.amount || 0), 0));
		const selectedFund = computed(() => props.accounts.find((a) => String(a.id) === String(form.petty_cash_account_id)) ?? null);
		const originalAmount = ref(0);
		const originalFundId = ref("");
		const balanceAfter = computed(() => {
			if (!selectedFund.value) return 0;
			const alreadyOut = form.id && String(originalFundId.value) === String(form.petty_cash_account_id) ? Number(originalAmount.value || 0) : 0;
			return Number(selectedFund.value.current_balance || 0) + alreadyOut - claimTotal.value;
		});
		const pickerHint = computed(() => {
			const n = form.expense_ids.length;
			return n ? `${n} selected` : "pick the receipts this claim covers";
		});
		watch(() => form.claimant_id, (v) => {
			if (v) form.claimant_name = "";
		});
		const openCreate = () => {
			form.defaults(defaults());
			form.reset();
			form.clearErrors();
			editingExpenses.value = [];
			originalAmount.value = 0;
			originalFundId.value = "";
			form.petty_cash_account_id = props.accounts[0]?.id ?? "";
			showModal.value = true;
		};
		const openEdit = (row) => {
			form.id = row.id;
			form.branch_id = row.branch_id ?? "";
			form.petty_cash_account_id = row.petty_cash_account_id ?? "";
			form.claimant_id = row.claimant_id ?? "";
			form.claimant_name = row.claimant_name ?? "";
			form.voucher_date = date(row.voucher_date);
			form.purpose = row.purpose ?? "";
			form.reference = row.reference ?? "";
			form.notes = row.notes ?? "";
			form.expense_ids = [...row.expense_ids ?? []];
			form.clearErrors();
			editingExpenses.value = [...row.expenses ?? []];
			originalAmount.value = Number(row.amount || 0);
			originalFundId.value = row.petty_cash_account_id ?? "";
			showModal.value = true;
		};
		const save = () => {
			const opts = {
				preserveScroll: true,
				onSuccess: () => showModal.value = false
			};
			if (form.id) form.put(`/finance/vouchers/${form.id}`, opts);
			else form.post("/finance/vouchers", opts);
		};
		const approve = (row) => router.put(`/finance/vouchers/${row.id}/approve`, {}, { preserveScroll: true });
		const reject = (row) => {
			const reason = prompt(`Reject voucher ${row.voucher_number}? The fund will be credited back and the expenses released.\n\nReason (optional):`);
			if (reason === null) return;
			router.put(`/finance/vouchers/${row.id}/reject`, { rejection_reason: reason || null }, { preserveScroll: true });
		};
		const del = (row) => {
			if (!confirm(`Delete voucher ${row.voucher_number}? The fund will be credited back and its ${row.expenses.length} expense(s) released.`)) return;
			router.delete(`/finance/vouchers/${row.id}`, { preserveScroll: true });
		};
		const fmt = (v) => "Rs " + Number(v || 0).toLocaleString("en-PK", { minimumFractionDigits: 2 });
		const fmtDate = (v) => v ? new Date(v).toLocaleDateString() : "—";
		const date = (v) => v ? String(v).slice(0, 10) : "";
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "page" }, _attrs))} data-v-445fa6d2>`);
			_push(ssrRenderComponent(_sfc_main$1, {
				title: "Expense Vouchers",
				subtitle: "Bundle receipts into a single reimbursement claim and pay the batch out of a petty-cash float. The claim total is deducted from the fund the moment the voucher is raised."
			}, {
				actions: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						if (unref(can)("vouchers.create")) _push(`<button class="ui-btn ui-btn--primary" data-v-445fa6d2${_scopeId}>+ New Voucher</button>`);
						else _push(`<!---->`);
					} else return [unref(can)("vouchers.create") ? (openBlock(), createBlock("button", {
						key: 0,
						class: "ui-btn ui-btn--primary",
						onClick: openCreate
					}, "+ New Voucher")) : createCommentVNode("", true)];
				}),
				_: 1
			}, _parent));
			_push(`<div class="vc__kpis" data-v-445fa6d2><div class="vc__kpi vc__kpi--warn" data-v-445fa6d2><span class="vc__kpi-label" data-v-445fa6d2>Pending</span><span class="vc__kpi-val" data-v-445fa6d2>${ssrInterpolate(props.summary.pending)}</span><span class="vc__kpi-sub" data-v-445fa6d2>awaiting approval</span></div><div class="vc__kpi" data-v-445fa6d2><span class="vc__kpi-label" data-v-445fa6d2>Pending Amount</span><span class="vc__kpi-val" data-v-445fa6d2>${ssrInterpolate(fmt(props.summary.pending_amount))}</span><span class="vc__kpi-sub" data-v-445fa6d2>already out of the funds</span></div><div class="vc__kpi vc__kpi--info" data-v-445fa6d2><span class="vc__kpi-label" data-v-445fa6d2>Claimed (mo.)</span><span class="vc__kpi-val" data-v-445fa6d2>${ssrInterpolate(fmt(props.summary.claimed_this_month))}</span><span class="vc__kpi-sub" data-v-445fa6d2>this month, excl. rejected</span></div><div class="vc__kpi vc__kpi--ok" data-v-445fa6d2><span class="vc__kpi-label" data-v-445fa6d2>Approved (mo.)</span><span class="vc__kpi-val" data-v-445fa6d2>${ssrInterpolate(fmt(props.summary.approved_this_month))}</span><span class="vc__kpi-sub" data-v-445fa6d2>signed off this month</span></div></div><div class="vc__filters" data-v-445fa6d2><input${ssrRenderAttr("value", search.value)} class="ui-input vc__search" placeholder="Search # / purpose / claimant…" data-v-445fa6d2><select class="ui-input" style="${ssrRenderStyle({ "width": "150px" })}" data-v-445fa6d2><option value="" data-v-445fa6d2${ssrIncludeBooleanAttr(Array.isArray(statusFilter.value) ? ssrLooseContain(statusFilter.value, "") : ssrLooseEqual(statusFilter.value, "")) ? " selected" : ""}>All Statuses</option><!--[-->`);
			ssrRenderList(props.statuses, (s) => {
				_push(`<option${ssrRenderAttr("value", s)} data-v-445fa6d2${ssrIncludeBooleanAttr(Array.isArray(statusFilter.value) ? ssrLooseContain(statusFilter.value, s) : ssrLooseEqual(statusFilter.value, s)) ? " selected" : ""}>${ssrInterpolate(statusLabel(s))}</option>`);
			});
			_push(`<!--]--></select><select class="ui-input" style="${ssrRenderStyle({ "width": "220px" })}" data-v-445fa6d2><option value="" data-v-445fa6d2${ssrIncludeBooleanAttr(Array.isArray(accountFilter.value) ? ssrLooseContain(accountFilter.value, "") : ssrLooseEqual(accountFilter.value, "")) ? " selected" : ""}>All Funds</option><!--[-->`);
			ssrRenderList(props.accounts, (a) => {
				_push(`<option${ssrRenderAttr("value", a.id)} data-v-445fa6d2${ssrIncludeBooleanAttr(Array.isArray(accountFilter.value) ? ssrLooseContain(accountFilter.value, a.id) : ssrLooseEqual(accountFilter.value, a.id)) ? " selected" : ""}>${ssrInterpolate(a.name)}</option>`);
			});
			_push(`<!--]--></select><select class="ui-input" style="${ssrRenderStyle({ "width": "180px" })}" data-v-445fa6d2><option value="" data-v-445fa6d2${ssrIncludeBooleanAttr(Array.isArray(branchFilter.value) ? ssrLooseContain(branchFilter.value, "") : ssrLooseEqual(branchFilter.value, "")) ? " selected" : ""}>All Branches</option><!--[-->`);
			ssrRenderList(props.branches, (branch) => {
				_push(`<option${ssrRenderAttr("value", branch.id)} data-v-445fa6d2${ssrIncludeBooleanAttr(Array.isArray(branchFilter.value) ? ssrLooseContain(branchFilter.value, branch.id) : ssrLooseEqual(branchFilter.value, branch.id)) ? " selected" : ""}>${ssrInterpolate(branch.name)}</option>`);
			});
			_push(`<!--]--></select></div>`);
			_push(ssrRenderComponent(DataTable_default, {
				columns,
				rows: vouchers.value,
				index: "",
				"empty-text": "No vouchers yet. Raise your first claim."
			}, {
				"cell:voucher_date": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) _push(`${ssrInterpolate(fmtDate(value))}`);
					else return [createTextVNode(toDisplayString(fmtDate(value)), 1)];
				}),
				"cell:claimant_label": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) {
						if (value) _push(`<span data-v-445fa6d2${_scopeId}>${ssrInterpolate(value)}</span>`);
						else _push(`<span class="vc__muted" data-v-445fa6d2${_scopeId}>—</span>`);
					} else return [value ? (openBlock(), createBlock("span", { key: 0 }, toDisplayString(value), 1)) : (openBlock(), createBlock("span", {
						key: 1,
						class: "vc__muted"
					}, "—"))];
				}),
				"cell:purpose": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`${ssrInterpolate(row.purpose)} `);
						if (row.reference) _push(`<span class="vc__code" data-v-445fa6d2${_scopeId}>${ssrInterpolate(row.reference)}</span>`);
						else _push(`<!---->`);
					} else return [createTextVNode(toDisplayString(row.purpose) + " ", 1), row.reference ? (openBlock(), createBlock("span", {
						key: 0,
						class: "vc__code"
					}, toDisplayString(row.reference), 1)) : createCommentVNode("", true)];
				}),
				"cell:expenses": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						if (!row.expenses.length) _push(`<span class="vc__muted" data-v-445fa6d2${_scopeId}>—</span>`);
						else _push(`<!---->`);
						_push(`<!--[-->`);
						ssrRenderList(row.expenses, (e) => {
							_push(`<span class="vc__chip"${ssrRenderAttr("title", e.description)} data-v-445fa6d2${_scopeId}>${ssrInterpolate(e.expense_number)}</span>`);
						});
						_push(`<!--]-->`);
					} else return [!row.expenses.length ? (openBlock(), createBlock("span", {
						key: 0,
						class: "vc__muted"
					}, "—")) : createCommentVNode("", true), (openBlock(true), createBlock(Fragment, null, renderList(row.expenses, (e) => {
						return openBlock(), createBlock("span", {
							key: e.id,
							class: "vc__chip",
							title: e.description
						}, toDisplayString(e.expense_number), 9, ["title"]);
					}), 128))];
				}),
				"cell:amount": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) _push(`<strong data-v-445fa6d2${_scopeId}>${ssrInterpolate(fmt(value))}</strong>`);
					else return [createVNode("strong", null, toDisplayString(fmt(value)), 1)];
				}),
				"cell:status": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<span class="${ssrRenderClass([statusClass(row.status), "ui-badge"])}" data-v-445fa6d2${_scopeId}>${ssrInterpolate(statusLabel(row.status))}</span>`);
						if (row.rejection_reason) _push(`<span class="vc__code"${ssrRenderAttr("title", row.rejection_reason)} data-v-445fa6d2${_scopeId}>why?</span>`);
						else _push(`<!---->`);
					} else return [createVNode("span", { class: ["ui-badge", statusClass(row.status)] }, toDisplayString(statusLabel(row.status)), 3), row.rejection_reason ? (openBlock(), createBlock("span", {
						key: 0,
						class: "vc__code",
						title: row.rejection_reason
					}, "why?", 8, ["title"])) : createCommentVNode("", true)];
				}),
				actions: withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						if (unref(can)("vouchers.approve") && row.status === "pending") _push(`<button class="ui-btn ui-btn--secondary ui-btn--sm" data-v-445fa6d2${_scopeId}>Approve</button>`);
						else _push(`<!---->`);
						if (unref(can)("vouchers.approve") && row.status === "pending") _push(`<button class="ui-btn ui-btn--ghost ui-btn--sm" data-v-445fa6d2${_scopeId}>Reject</button>`);
						else _push(`<!---->`);
						if (unref(can)("vouchers.update") && row.status === "pending") _push(`<button class="ui-btn ui-btn--ghost ui-btn--sm" data-v-445fa6d2${_scopeId}>Edit</button>`);
						else _push(`<!---->`);
						if (unref(can)("vouchers.delete")) _push(`<button class="ui-btn ui-btn--danger ui-btn--sm" data-v-445fa6d2${_scopeId}>Delete</button>`);
						else _push(`<!---->`);
					} else return [
						unref(can)("vouchers.approve") && row.status === "pending" ? (openBlock(), createBlock("button", {
							key: 0,
							class: "ui-btn ui-btn--secondary ui-btn--sm",
							onClick: ($event) => approve(row)
						}, "Approve", 8, ["onClick"])) : createCommentVNode("", true),
						unref(can)("vouchers.approve") && row.status === "pending" ? (openBlock(), createBlock("button", {
							key: 1,
							class: "ui-btn ui-btn--ghost ui-btn--sm",
							onClick: ($event) => reject(row)
						}, "Reject", 8, ["onClick"])) : createCommentVNode("", true),
						unref(can)("vouchers.update") && row.status === "pending" ? (openBlock(), createBlock("button", {
							key: 2,
							class: "ui-btn ui-btn--ghost ui-btn--sm",
							onClick: ($event) => openEdit(row)
						}, "Edit", 8, ["onClick"])) : createCommentVNode("", true),
						unref(can)("vouchers.delete") ? (openBlock(), createBlock("button", {
							key: 3,
							class: "ui-btn ui-btn--danger ui-btn--sm",
							onClick: ($event) => del(row)
						}, "Delete", 8, ["onClick"])) : createCommentVNode("", true)
					];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(Pagination_default, {
				paginator: props.vouchers,
				only: ["vouchers"]
			}, null, _parent));
			_push(ssrRenderComponent(Modal_default, {
				modelValue: showModal.value,
				"onUpdate:modelValue": ($event) => showModal.value = $event,
				title: unref(form).id ? "Edit Voucher" : "New Expense Voucher",
				width: "820px"
			}, {
				footer: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<button class="ui-btn ui-btn--ghost" data-v-445fa6d2${_scopeId}>Cancel</button><button class="ui-btn ui-btn--primary"${ssrIncludeBooleanAttr(unref(form).processing) ? " disabled" : ""} data-v-445fa6d2${_scopeId}>Save</button>`);
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
							modelValue: unref(form).purpose,
							"onUpdate:modelValue": ($event) => unref(form).purpose = $event,
							label: "Purpose *",
							placeholder: "e.g. September site-visit reimbursement",
							error: unref(form).errors.purpose
						}, null, _parent, _scopeId));
						_push(`<div class="form-grid-2" data-v-445fa6d2${_scopeId}>`);
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).claimant_id,
							"onUpdate:modelValue": ($event) => unref(form).claimant_id = $event,
							label: "Claimant",
							type: "select",
							error: unref(form).errors.claimant_id
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) {
									_push(`<option value="" data-v-445fa6d2${_scopeId}>— Not a system user —</option><!--[-->`);
									ssrRenderList(props.claimants, (c) => {
										_push(`<option${ssrRenderAttr("value", c.id)} data-v-445fa6d2${_scopeId}>${ssrInterpolate(c.name)}</option>`);
									});
									_push(`<!--]-->`);
								} else return [createVNode("option", { value: "" }, "— Not a system user —"), (openBlock(true), createBlock(Fragment, null, renderList(props.claimants, (c) => {
									return openBlock(), createBlock("option", {
										key: c.id,
										value: c.id
									}, toDisplayString(c.name), 9, ["value"]);
								}), 128))];
							}),
							_: 1
						}, _parent, _scopeId));
						if (!unref(form).claimant_id) _push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).claimant_name,
							"onUpdate:modelValue": ($event) => unref(form).claimant_name = $event,
							label: "Claimant Name",
							placeholder: "Free-text name",
							error: unref(form).errors.claimant_name
						}, null, _parent, _scopeId));
						else _push(`<!---->`);
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).voucher_date,
							"onUpdate:modelValue": ($event) => unref(form).voucher_date = $event,
							label: "Voucher Date *",
							type: "date",
							error: unref(form).errors.voucher_date
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).petty_cash_account_id,
							"onUpdate:modelValue": ($event) => unref(form).petty_cash_account_id = $event,
							label: "Paying Fund *",
							type: "select",
							error: unref(form).errors.petty_cash_account_id
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) {
									_push(`<option value="" disabled data-v-445fa6d2${_scopeId}>Select fund</option><!--[-->`);
									ssrRenderList(props.accounts, (a) => {
										_push(`<option${ssrRenderAttr("value", a.id)} data-v-445fa6d2${_scopeId}>${ssrInterpolate(a.name)} (${ssrInterpolate(fmt(a.current_balance))})</option>`);
									});
									_push(`<!--]-->`);
								} else return [createVNode("option", {
									value: "",
									disabled: ""
								}, "Select fund"), (openBlock(true), createBlock(Fragment, null, renderList(props.accounts, (a) => {
									return openBlock(), createBlock("option", {
										key: a.id,
										value: a.id
									}, toDisplayString(a.name) + " (" + toDisplayString(fmt(a.current_balance)) + ")", 9, ["value"]);
								}), 128))];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).branch_id,
							"onUpdate:modelValue": ($event) => unref(form).branch_id = $event,
							label: "Branch",
							type: "select",
							error: unref(form).errors.branch_id
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) {
									_push(`<option value="" data-v-445fa6d2${_scopeId}>Current Outlet</option><!--[-->`);
									ssrRenderList(props.branches, (branch) => {
										_push(`<option${ssrRenderAttr("value", branch.id)} data-v-445fa6d2${_scopeId}>${ssrInterpolate(branch.name)}</option>`);
									});
									_push(`<!--]-->`);
								} else return [createVNode("option", { value: "" }, "Current Outlet"), (openBlock(true), createBlock(Fragment, null, renderList(props.branches, (branch) => {
									return openBlock(), createBlock("option", {
										key: branch.id,
										value: branch.id
									}, toDisplayString(branch.name), 9, ["value"]);
								}), 128))];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).reference,
							"onUpdate:modelValue": ($event) => unref(form).reference = $event,
							label: "Reference",
							error: unref(form).errors.reference
						}, null, _parent, _scopeId));
						_push(`</div><h3 class="vc__picker-title" data-v-445fa6d2${_scopeId}> Expenses Claimed * <span class="vc__muted vc__picker-hint" data-v-445fa6d2${_scopeId}>${ssrInterpolate(pickerHint.value)}</span></h3>`);
						if (unref(form).errors.expense_ids) _push(`<p class="vc__err" data-v-445fa6d2${_scopeId}>${ssrInterpolate(unref(form).errors.expense_ids)}</p>`);
						else _push(`<!---->`);
						_push(`<div class="vc__picker" data-v-445fa6d2${_scopeId}>`);
						if (!pickable.value.length) _push(`<p class="vc__muted vc__picker-empty" data-v-445fa6d2${_scopeId}>No unclaimed expenses available. Record an expense first.</p>`);
						else _push(`<!---->`);
						_push(`<!--[-->`);
						ssrRenderList(pickable.value, (e) => {
							_push(`<label class="${ssrRenderClass([{ "vc__row--on": isPicked(e.id) }, "vc__row"])}" data-v-445fa6d2${_scopeId}><input type="checkbox"${ssrIncludeBooleanAttr(isPicked(e.id)) ? " checked" : ""} data-v-445fa6d2${_scopeId}><span class="vc__row-num" data-v-445fa6d2${_scopeId}>${ssrInterpolate(e.expense_number)}</span><span class="vc__row-desc" data-v-445fa6d2${_scopeId}>${ssrInterpolate(e.description)} <span class="vc__code" data-v-445fa6d2${_scopeId}>${ssrInterpolate(fmtDate(e.expense_date))} · ${ssrInterpolate(paidViaLabel(e.paid_via))}</span></span><span class="vc__row-amt" data-v-445fa6d2${_scopeId}>${ssrInterpolate(fmt(e.amount))}</span></label>`);
						});
						_push(`<!--]--></div><div class="vc__totals" data-v-445fa6d2${_scopeId}><div class="vc__total-row" data-v-445fa6d2${_scopeId}><span data-v-445fa6d2${_scopeId}>Total claim</span><strong data-v-445fa6d2${_scopeId}>${ssrInterpolate(fmt(claimTotal.value))}</strong></div>`);
						if (selectedFund.value) _push(`<div class="${ssrRenderClass([{ "vc__over": balanceAfter.value < 0 }, "vc__total-row vc__total-row--sub"])}" data-v-445fa6d2${_scopeId}><span data-v-445fa6d2${_scopeId}>${ssrInterpolate(selectedFund.value.name)} balance after</span><strong data-v-445fa6d2${_scopeId}>${ssrInterpolate(fmt(balanceAfter.value))}</strong></div>`);
						else _push(`<!---->`);
						if (selectedFund.value && balanceAfter.value < 0) _push(`<p class="vc__err" data-v-445fa6d2${_scopeId}> This claim is larger than the fund holds — top the float up, or split the claim. </p>`);
						else _push(`<!---->`);
						_push(`</div>`);
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).notes,
							"onUpdate:modelValue": ($event) => unref(form).notes = $event,
							label: "Notes",
							type: "textarea",
							error: unref(form).errors.notes
						}, null, _parent, _scopeId));
						_push(`<p class="vc__hint" data-v-445fa6d2${_scopeId}>Raising the voucher posts one combined disbursement to the fund&#39;s ledger. A claimed expense stops posting its own petty-cash line, so a petty-cash expense is never deducted twice.</p>`);
					} else return [
						createVNode(_sfc_main$2, {
							modelValue: unref(form).purpose,
							"onUpdate:modelValue": ($event) => unref(form).purpose = $event,
							label: "Purpose *",
							placeholder: "e.g. September site-visit reimbursement",
							error: unref(form).errors.purpose
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode("div", { class: "form-grid-2" }, [
							createVNode(_sfc_main$2, {
								modelValue: unref(form).claimant_id,
								"onUpdate:modelValue": ($event) => unref(form).claimant_id = $event,
								label: "Claimant",
								type: "select",
								error: unref(form).errors.claimant_id
							}, {
								default: withCtx(() => [createVNode("option", { value: "" }, "— Not a system user —"), (openBlock(true), createBlock(Fragment, null, renderList(props.claimants, (c) => {
									return openBlock(), createBlock("option", {
										key: c.id,
										value: c.id
									}, toDisplayString(c.name), 9, ["value"]);
								}), 128))]),
								_: 1
							}, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"error"
							]),
							!unref(form).claimant_id ? (openBlock(), createBlock(_sfc_main$2, {
								key: 0,
								modelValue: unref(form).claimant_name,
								"onUpdate:modelValue": ($event) => unref(form).claimant_name = $event,
								label: "Claimant Name",
								placeholder: "Free-text name",
								error: unref(form).errors.claimant_name
							}, null, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"error"
							])) : createCommentVNode("", true),
							createVNode(_sfc_main$2, {
								modelValue: unref(form).voucher_date,
								"onUpdate:modelValue": ($event) => unref(form).voucher_date = $event,
								label: "Voucher Date *",
								type: "date",
								error: unref(form).errors.voucher_date
							}, null, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"error"
							]),
							createVNode(_sfc_main$2, {
								modelValue: unref(form).petty_cash_account_id,
								"onUpdate:modelValue": ($event) => unref(form).petty_cash_account_id = $event,
								label: "Paying Fund *",
								type: "select",
								error: unref(form).errors.petty_cash_account_id
							}, {
								default: withCtx(() => [createVNode("option", {
									value: "",
									disabled: ""
								}, "Select fund"), (openBlock(true), createBlock(Fragment, null, renderList(props.accounts, (a) => {
									return openBlock(), createBlock("option", {
										key: a.id,
										value: a.id
									}, toDisplayString(a.name) + " (" + toDisplayString(fmt(a.current_balance)) + ")", 9, ["value"]);
								}), 128))]),
								_: 1
							}, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"error"
							]),
							createVNode(_sfc_main$2, {
								modelValue: unref(form).branch_id,
								"onUpdate:modelValue": ($event) => unref(form).branch_id = $event,
								label: "Branch",
								type: "select",
								error: unref(form).errors.branch_id
							}, {
								default: withCtx(() => [createVNode("option", { value: "" }, "Current Outlet"), (openBlock(true), createBlock(Fragment, null, renderList(props.branches, (branch) => {
									return openBlock(), createBlock("option", {
										key: branch.id,
										value: branch.id
									}, toDisplayString(branch.name), 9, ["value"]);
								}), 128))]),
								_: 1
							}, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"error"
							]),
							createVNode(_sfc_main$2, {
								modelValue: unref(form).reference,
								"onUpdate:modelValue": ($event) => unref(form).reference = $event,
								label: "Reference",
								error: unref(form).errors.reference
							}, null, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"error"
							])
						]),
						createVNode("h3", { class: "vc__picker-title" }, [createTextVNode(" Expenses Claimed * "), createVNode("span", { class: "vc__muted vc__picker-hint" }, toDisplayString(pickerHint.value), 1)]),
						unref(form).errors.expense_ids ? (openBlock(), createBlock("p", {
							key: 0,
							class: "vc__err"
						}, toDisplayString(unref(form).errors.expense_ids), 1)) : createCommentVNode("", true),
						createVNode("div", { class: "vc__picker" }, [!pickable.value.length ? (openBlock(), createBlock("p", {
							key: 0,
							class: "vc__muted vc__picker-empty"
						}, "No unclaimed expenses available. Record an expense first.")) : createCommentVNode("", true), (openBlock(true), createBlock(Fragment, null, renderList(pickable.value, (e) => {
							return openBlock(), createBlock("label", {
								key: e.id,
								class: ["vc__row", { "vc__row--on": isPicked(e.id) }]
							}, [
								createVNode("input", {
									type: "checkbox",
									checked: isPicked(e.id),
									onChange: ($event) => toggle(e.id)
								}, null, 40, ["checked", "onChange"]),
								createVNode("span", { class: "vc__row-num" }, toDisplayString(e.expense_number), 1),
								createVNode("span", { class: "vc__row-desc" }, [createTextVNode(toDisplayString(e.description) + " ", 1), createVNode("span", { class: "vc__code" }, toDisplayString(fmtDate(e.expense_date)) + " · " + toDisplayString(paidViaLabel(e.paid_via)), 1)]),
								createVNode("span", { class: "vc__row-amt" }, toDisplayString(fmt(e.amount)), 1)
							], 2);
						}), 128))]),
						createVNode("div", { class: "vc__totals" }, [
							createVNode("div", { class: "vc__total-row" }, [createVNode("span", null, "Total claim"), createVNode("strong", null, toDisplayString(fmt(claimTotal.value)), 1)]),
							selectedFund.value ? (openBlock(), createBlock("div", {
								key: 0,
								class: ["vc__total-row vc__total-row--sub", { "vc__over": balanceAfter.value < 0 }]
							}, [createVNode("span", null, toDisplayString(selectedFund.value.name) + " balance after", 1), createVNode("strong", null, toDisplayString(fmt(balanceAfter.value)), 1)], 2)) : createCommentVNode("", true),
							selectedFund.value && balanceAfter.value < 0 ? (openBlock(), createBlock("p", {
								key: 1,
								class: "vc__err"
							}, " This claim is larger than the fund holds — top the float up, or split the claim. ")) : createCommentVNode("", true)
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
						]),
						createVNode("p", { class: "vc__hint" }, "Raising the voucher posts one combined disbursement to the fund's ledger. A claimed expense stops posting its own petty-cash line, so a petty-cash expense is never deducted twice.")
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
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/pages/Finance/Vouchers.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var Vouchers_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-445fa6d2"]]);
//#endregion
export { Vouchers_default as default };
