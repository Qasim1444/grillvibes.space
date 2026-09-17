import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-BOaGB7Aw.js";
import { n as usePermissions, t as AdminLayout_default } from "./AdminLayout-BhC2A239.js";
import { t as _sfc_main$1 } from "./PageHeader-D0aRDn5C.js";
import { t as DataTable_default } from "./DataTable-DQdMyI8_.js";
import { t as Pagination_default } from "./Pagination-CHJUzz_w.js";
import { t as Modal_default } from "./Modal-CpmFAnsY.js";
import { t as _sfc_main$2 } from "./FormField-Doe8oR1s.js";
import { Fragment, computed, createBlock, createCommentVNode, createTextVNode, createVNode, mergeProps, openBlock, ref, renderList, toDisplayString, unref, useSSRContext, vModelCheckbox, watch, withCtx, withDirectives } from "vue";
import { router, useForm } from "@inertiajs/vue3";
import { ssrIncludeBooleanAttr, ssrInterpolate, ssrLooseContain, ssrLooseEqual, ssrRenderAttr, ssrRenderAttrs, ssrRenderClass, ssrRenderComponent, ssrRenderList, ssrRenderStyle } from "vue/server-renderer";
//#region resources/js/pages/Finance/PettyCash.vue
var _sfc_main = /*@__PURE__*/ Object.assign({ layout: AdminLayout_default }, {
	__name: "PettyCash",
	__ssrInlineRender: true,
	props: {
		accounts: {
			type: Array,
			default: () => []
		},
		transactions: {
			type: Object,
			default: () => ({ data: [] })
		},
		branches: {
			type: Array,
			default: () => []
		},
		types: {
			type: Array,
			default: () => []
		},
		summary: {
			type: Object,
			default: () => ({
				total_balance: 0,
				active_funds: 0,
				disbursed_this_month: 0,
				topped_up_this_month: 0
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
		const accountColumns = [
			{
				key: "name",
				label: "Fund"
			},
			{
				key: "branch_name",
				label: "Branch"
			},
			{
				key: "custodian_name",
				label: "Custodian"
			},
			{
				key: "current_balance",
				label: "Balance"
			}
		];
		const txnColumns = [
			{
				key: "occurred_on",
				label: "Date"
			},
			{
				key: "account_name",
				label: "Fund"
			},
			{
				key: "type",
				label: "Type"
			},
			{
				key: "description",
				label: "Details"
			},
			{
				key: "amount",
				label: "Amount"
			},
			{
				key: "balance_after",
				label: "Balance"
			}
		];
		const transactions = computed(() => props.transactions?.data ?? []);
		const activeAccounts = computed(() => props.accounts.filter((a) => a.is_active));
		const accountFilter = ref(props.filters?.account_id ?? "");
		const typeFilter = ref(props.filters?.type ?? "");
		let timer = null;
		const reload = () => router.get("/finance/petty-cash", {
			account_id: accountFilter.value || void 0,
			type: typeFilter.value || void 0
		}, {
			preserveState: true,
			preserveScroll: true,
			replace: true,
			only: ["transactions", "filters"]
		});
		watch([accountFilter, typeFilter], () => {
			clearTimeout(timer);
			timer = setTimeout(reload, 300);
		});
		const typeLabel = (t) => ({
			top_up: "Top-up",
			disbursement: "Disbursement",
			adjustment: "Adjustment"
		})[t] ?? t;
		const typeClass = (t) => ({
			top_up: "ui-badge--success",
			disbursement: "ui-badge--warning",
			adjustment: "ui-badge--info"
		})[t] ?? "ui-badge--muted";
		const accDefaults = () => ({
			id: null,
			name: "",
			branch_id: "",
			custodian_name: "",
			opening_balance: 0,
			is_active: true,
			notes: ""
		});
		const showAccount = ref(false);
		const accForm = useForm(accDefaults());
		const openAccountCreate = () => {
			accForm.defaults(accDefaults());
			accForm.reset();
			accForm.clearErrors();
			showAccount.value = true;
		};
		const openAccountEdit = (row) => {
			accForm.id = row.id;
			accForm.name = row.name ?? "";
			accForm.branch_id = row.branch_id ?? "";
			accForm.custodian_name = row.custodian_name ?? "";
			accForm.opening_balance = row.opening_balance ?? 0;
			accForm.is_active = !!row.is_active;
			accForm.notes = row.notes ?? "";
			accForm.clearErrors();
			showAccount.value = true;
		};
		const saveAccount = () => {
			const opts = {
				preserveScroll: true,
				onSuccess: () => showAccount.value = false
			};
			if (accForm.id) accForm.put(`/finance/petty-cash/accounts/${accForm.id}`, opts);
			else accForm.post("/finance/petty-cash/accounts", opts);
		};
		const delAccount = (row) => {
			if (!confirm(`Delete fund "${row.name}"?`)) return;
			router.delete(`/finance/petty-cash/accounts/${row.id}`, { preserveScroll: true });
		};
		const today = () => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
		const txnForm = useForm({
			petty_cash_account_id: "",
			type: "top_up",
			amount: 0,
			occurred_on: today(),
			reference: "",
			description: ""
		});
		const showTxn = ref(false);
		const openTxn = (row) => {
			txnForm.reset();
			txnForm.clearErrors();
			txnForm.occurred_on = today();
			txnForm.petty_cash_account_id = row?.id ?? activeAccounts.value[0]?.id ?? "";
			showTxn.value = true;
		};
		const saveTxn = () => txnForm.post("/finance/petty-cash/transactions", {
			preserveScroll: true,
			onSuccess: () => showTxn.value = false
		});
		const delTxn = (row) => {
			if (!confirm(`Delete this ${typeLabel(row.type)} transaction of ${signed(row.amount)}? The fund balance will be recalculated.`)) return;
			router.delete(`/finance/petty-cash/transactions/${row.id}`, { preserveScroll: true });
		};
		const txnHint = computed(() => {
			if (txnForm.type === "top_up") return "Adds the amount to the fund.";
			if (txnForm.type === "disbursement") return "Deducts the amount from the fund.";
			return "Correction — enter a negative amount to reduce the balance.";
		});
		const fmt = (v) => "Rs " + Number(v || 0).toLocaleString("en-PK", { minimumFractionDigits: 2 });
		const signed = (v) => (Number(v) < 0 ? "− " : "+ ") + "Rs " + Math.abs(Number(v || 0)).toLocaleString("en-PK", { minimumFractionDigits: 2 });
		const fmtDate = (v) => v ? new Date(v).toLocaleDateString() : "—";
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "page" }, _attrs))} data-v-da93b087>`);
			_push(ssrRenderComponent(_sfc_main$1, {
				title: "Petty Cash",
				subtitle: "Manage cash floats held at each outlet — top up, record disbursements and corrections. Balances stay in step with the ledger and with any petty-cash expenses automatically."
			}, {
				actions: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						if (unref(can)("petty-cash.create")) _push(`<button class="ui-btn ui-btn--secondary" data-v-da93b087${_scopeId}>+ Record Transaction</button>`);
						else _push(`<!---->`);
						if (unref(can)("petty-cash.create")) _push(`<button class="ui-btn ui-btn--primary" data-v-da93b087${_scopeId}>+ New Fund</button>`);
						else _push(`<!---->`);
					} else return [unref(can)("petty-cash.create") ? (openBlock(), createBlock("button", {
						key: 0,
						class: "ui-btn ui-btn--secondary",
						onClick: ($event) => openTxn(null)
					}, "+ Record Transaction", 8, ["onClick"])) : createCommentVNode("", true), unref(can)("petty-cash.create") ? (openBlock(), createBlock("button", {
						key: 1,
						class: "ui-btn ui-btn--primary",
						onClick: openAccountCreate
					}, "+ New Fund")) : createCommentVNode("", true)];
				}),
				_: 1
			}, _parent));
			_push(`<div class="pc__kpis" data-v-da93b087><div class="pc__kpi ex__kpi--ok" data-v-da93b087><span class="pc__kpi-label" data-v-da93b087>Total Balance</span><span class="pc__kpi-val" data-v-da93b087>${ssrInterpolate(fmt(props.summary.total_balance))}</span><span class="pc__kpi-sub" data-v-da93b087>across active funds</span></div><div class="pc__kpi" data-v-da93b087><span class="pc__kpi-label" data-v-da93b087>Active Funds</span><span class="pc__kpi-val" data-v-da93b087>${ssrInterpolate(props.summary.active_funds)}</span><span class="pc__kpi-sub" data-v-da93b087>cash floats</span></div><div class="pc__kpi pc__kpi--danger" data-v-da93b087><span class="pc__kpi-label" data-v-da93b087>Disbursed (mo.)</span><span class="pc__kpi-val" data-v-da93b087>${ssrInterpolate(fmt(props.summary.disbursed_this_month))}</span><span class="pc__kpi-sub" data-v-da93b087>paid out this month</span></div><div class="pc__kpi pc__kpi--info" data-v-da93b087><span class="pc__kpi-label" data-v-da93b087>Topped Up (mo.)</span><span class="pc__kpi-val" data-v-da93b087>${ssrInterpolate(fmt(props.summary.topped_up_this_month))}</span><span class="pc__kpi-sub" data-v-da93b087>added this month</span></div></div><h2 class="pc__section" data-v-da93b087>Cash Floats</h2>`);
			_push(ssrRenderComponent(DataTable_default, {
				columns: accountColumns,
				rows: props.accounts,
				"empty-text": "No petty-cash funds yet. Create your first float."
			}, {
				"cell:name": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<strong data-v-da93b087${_scopeId}>${ssrInterpolate(row.name)}</strong>`);
						if (!row.is_active) _push(`<span class="ui-badge ui-badge--muted pc__pill" data-v-da93b087${_scopeId}>Inactive</span>`);
						else _push(`<!---->`);
					} else return [createVNode("strong", null, toDisplayString(row.name), 1), !row.is_active ? (openBlock(), createBlock("span", {
						key: 0,
						class: "ui-badge ui-badge--muted pc__pill"
					}, "Inactive")) : createCommentVNode("", true)];
				}),
				"cell:current_balance": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) _push(`<strong data-v-da93b087${_scopeId}>${ssrInterpolate(fmt(value))}</strong>`);
					else return [createVNode("strong", null, toDisplayString(fmt(value)), 1)];
				}),
				"cell:custodian_name": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) {
						if (value) _push(`<span data-v-da93b087${_scopeId}>${ssrInterpolate(value)}</span>`);
						else _push(`<span class="pc__muted" data-v-da93b087${_scopeId}>—</span>`);
					} else return [value ? (openBlock(), createBlock("span", { key: 0 }, toDisplayString(value), 1)) : (openBlock(), createBlock("span", {
						key: 1,
						class: "pc__muted"
					}, "—"))];
				}),
				actions: withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						if (unref(can)("petty-cash.create")) _push(`<button class="ui-btn ui-btn--secondary ui-btn--sm" data-v-da93b087${_scopeId}>Add Txn</button>`);
						else _push(`<!---->`);
						if (unref(can)("petty-cash.update")) _push(`<button class="ui-btn ui-btn--ghost ui-btn--sm" data-v-da93b087${_scopeId}>Edit</button>`);
						else _push(`<!---->`);
						if (unref(can)("petty-cash.delete")) _push(`<button class="ui-btn ui-btn--danger ui-btn--sm" data-v-da93b087${_scopeId}>Delete</button>`);
						else _push(`<!---->`);
					} else return [
						unref(can)("petty-cash.create") ? (openBlock(), createBlock("button", {
							key: 0,
							class: "ui-btn ui-btn--secondary ui-btn--sm",
							onClick: ($event) => openTxn(row)
						}, "Add Txn", 8, ["onClick"])) : createCommentVNode("", true),
						unref(can)("petty-cash.update") ? (openBlock(), createBlock("button", {
							key: 1,
							class: "ui-btn ui-btn--ghost ui-btn--sm",
							onClick: ($event) => openAccountEdit(row)
						}, "Edit", 8, ["onClick"])) : createCommentVNode("", true),
						unref(can)("petty-cash.delete") ? (openBlock(), createBlock("button", {
							key: 2,
							class: "ui-btn ui-btn--danger ui-btn--sm",
							onClick: ($event) => delAccount(row)
						}, "Delete", 8, ["onClick"])) : createCommentVNode("", true)
					];
				}),
				_: 1
			}, _parent));
			_push(`<h2 class="pc__section" data-v-da93b087>Ledger</h2><div class="pc__filters" data-v-da93b087><select class="ui-input" style="${ssrRenderStyle({ "width": "220px" })}" data-v-da93b087><option value="" data-v-da93b087${ssrIncludeBooleanAttr(Array.isArray(accountFilter.value) ? ssrLooseContain(accountFilter.value, "") : ssrLooseEqual(accountFilter.value, "")) ? " selected" : ""}>All Funds</option><!--[-->`);
			ssrRenderList(props.accounts, (a) => {
				_push(`<option${ssrRenderAttr("value", a.id)} data-v-da93b087${ssrIncludeBooleanAttr(Array.isArray(accountFilter.value) ? ssrLooseContain(accountFilter.value, a.id) : ssrLooseEqual(accountFilter.value, a.id)) ? " selected" : ""}>${ssrInterpolate(a.name)}</option>`);
			});
			_push(`<!--]--></select><select class="ui-input" style="${ssrRenderStyle({ "width": "170px" })}" data-v-da93b087><option value="" data-v-da93b087${ssrIncludeBooleanAttr(Array.isArray(typeFilter.value) ? ssrLooseContain(typeFilter.value, "") : ssrLooseEqual(typeFilter.value, "")) ? " selected" : ""}>All Types</option><!--[-->`);
			ssrRenderList(props.types, (t) => {
				_push(`<option${ssrRenderAttr("value", t)} data-v-da93b087${ssrIncludeBooleanAttr(Array.isArray(typeFilter.value) ? ssrLooseContain(typeFilter.value, t) : ssrLooseEqual(typeFilter.value, t)) ? " selected" : ""}>${ssrInterpolate(typeLabel(t))}</option>`);
			});
			_push(`<!--]--></select></div>`);
			_push(ssrRenderComponent(DataTable_default, {
				columns: txnColumns,
				rows: transactions.value,
				"empty-text": "No transactions recorded yet."
			}, {
				"cell:occurred_on": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) _push(`${ssrInterpolate(fmtDate(value))}`);
					else return [createTextVNode(toDisplayString(fmtDate(value)), 1)];
				}),
				"cell:type": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) _push(`<span class="${ssrRenderClass([typeClass(value), "ui-badge"])}" data-v-da93b087${_scopeId}>${ssrInterpolate(typeLabel(value))}</span>`);
					else return [createVNode("span", { class: ["ui-badge", typeClass(value)] }, toDisplayString(typeLabel(value)), 3)];
				}),
				"cell:description": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						if (row.description) _push(`<span data-v-da93b087${_scopeId}>${ssrInterpolate(row.description)}</span>`);
						else _push(`<span class="pc__muted" data-v-da93b087${_scopeId}>—</span>`);
						if (row.expense_number) _push(`<span class="pc__code" data-v-da93b087${_scopeId}>${ssrInterpolate(row.expense_number)}</span>`);
						else if (row.voucher_number) _push(`<span class="pc__code" data-v-da93b087${_scopeId}>${ssrInterpolate(row.voucher_number)}</span>`);
						else if (row.reference) _push(`<span class="pc__code" data-v-da93b087${_scopeId}>${ssrInterpolate(row.reference)}</span>`);
						else _push(`<!---->`);
					} else return [row.description ? (openBlock(), createBlock("span", { key: 0 }, toDisplayString(row.description), 1)) : (openBlock(), createBlock("span", {
						key: 1,
						class: "pc__muted"
					}, "—")), row.expense_number ? (openBlock(), createBlock("span", {
						key: 2,
						class: "pc__code"
					}, toDisplayString(row.expense_number), 1)) : row.voucher_number ? (openBlock(), createBlock("span", {
						key: 3,
						class: "pc__code"
					}, toDisplayString(row.voucher_number), 1)) : row.reference ? (openBlock(), createBlock("span", {
						key: 4,
						class: "pc__code"
					}, toDisplayString(row.reference), 1)) : createCommentVNode("", true)];
				}),
				"cell:amount": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) _push(`<strong class="${ssrRenderClass(Number(value) < 0 ? "pc__out" : "pc__in")}" data-v-da93b087${_scopeId}>${ssrInterpolate(signed(value))}</strong>`);
					else return [createVNode("strong", { class: Number(value) < 0 ? "pc__out" : "pc__in" }, toDisplayString(signed(value)), 3)];
				}),
				"cell:balance_after": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) _push(`${ssrInterpolate(fmt(value))}`);
					else return [createTextVNode(toDisplayString(fmt(value)), 1)];
				}),
				actions: withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						if (unref(can)("petty-cash.delete") && !row.expense_id && !row.expense_voucher_id) _push(`<button class="ui-btn ui-btn--danger ui-btn--sm" data-v-da93b087${_scopeId}>Delete</button>`);
						else if (row.expense_id) _push(`<span class="pc__muted" style="${ssrRenderStyle({ "font-size": "0.78rem" })}" data-v-da93b087${_scopeId}>via expense</span>`);
						else if (row.expense_voucher_id) _push(`<span class="pc__muted" style="${ssrRenderStyle({ "font-size": "0.78rem" })}" data-v-da93b087${_scopeId}>via voucher</span>`);
						else _push(`<!---->`);
					} else return [unref(can)("petty-cash.delete") && !row.expense_id && !row.expense_voucher_id ? (openBlock(), createBlock("button", {
						key: 0,
						class: "ui-btn ui-btn--danger ui-btn--sm",
						onClick: ($event) => delTxn(row)
					}, "Delete", 8, ["onClick"])) : row.expense_id ? (openBlock(), createBlock("span", {
						key: 1,
						class: "pc__muted",
						style: { "font-size": "0.78rem" }
					}, "via expense")) : row.expense_voucher_id ? (openBlock(), createBlock("span", {
						key: 2,
						class: "pc__muted",
						style: { "font-size": "0.78rem" }
					}, "via voucher")) : createCommentVNode("", true)];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(Pagination_default, {
				paginator: props.transactions,
				only: ["transactions"]
			}, null, _parent));
			_push(ssrRenderComponent(Modal_default, {
				modelValue: showAccount.value,
				"onUpdate:modelValue": ($event) => showAccount.value = $event,
				title: unref(accForm).id ? "Edit Fund" : "New Petty-Cash Fund",
				width: "620px"
			}, {
				footer: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<button class="ui-btn ui-btn--ghost" data-v-da93b087${_scopeId}>Cancel</button><button class="ui-btn ui-btn--primary"${ssrIncludeBooleanAttr(unref(accForm).processing) ? " disabled" : ""} data-v-da93b087${_scopeId}>Save</button>`);
					else return [createVNode("button", {
						class: "ui-btn ui-btn--ghost",
						onClick: ($event) => showAccount.value = false
					}, "Cancel", 8, ["onClick"]), createVNode("button", {
						class: "ui-btn ui-btn--primary",
						disabled: unref(accForm).processing,
						onClick: saveAccount
					}, "Save", 8, ["disabled"])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div class="form-grid-2" data-v-da93b087${_scopeId}>`);
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(accForm).name,
							"onUpdate:modelValue": ($event) => unref(accForm).name = $event,
							label: "Fund Name *",
							placeholder: "e.g. Front-desk float",
							error: unref(accForm).errors.name
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(accForm).branch_id,
							"onUpdate:modelValue": ($event) => unref(accForm).branch_id = $event,
							label: "Branch",
							type: "select",
							error: unref(accForm).errors.branch_id
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) {
									_push(`<option value="" data-v-da93b087${_scopeId}>Current Outlet</option><!--[-->`);
									ssrRenderList(props.branches, (branch) => {
										_push(`<option${ssrRenderAttr("value", branch.id)} data-v-da93b087${_scopeId}>${ssrInterpolate(branch.name)}</option>`);
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
							modelValue: unref(accForm).custodian_name,
							"onUpdate:modelValue": ($event) => unref(accForm).custodian_name = $event,
							label: "Custodian",
							placeholder: "Who holds the cash",
							error: unref(accForm).errors.custodian_name
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(accForm).opening_balance,
							"onUpdate:modelValue": ($event) => unref(accForm).opening_balance = $event,
							modelModifiers: { number: true },
							label: "Opening Balance",
							type: "number",
							step: "0.01",
							error: unref(accForm).errors.opening_balance
						}, null, _parent, _scopeId));
						_push(`</div><label class="pc__check" data-v-da93b087${_scopeId}><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(unref(accForm).is_active) ? ssrLooseContain(unref(accForm).is_active, null) : unref(accForm).is_active) ? " checked" : ""} data-v-da93b087${_scopeId}><span data-v-da93b087${_scopeId}>Active fund</span></label>`);
						if (unref(accForm).id) _push(`<p class="pc__hint" data-v-da93b087${_scopeId}>Changing the opening balance re-rolls the running balance across the whole ledger.</p>`);
						else _push(`<!---->`);
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(accForm).notes,
							"onUpdate:modelValue": ($event) => unref(accForm).notes = $event,
							label: "Notes",
							type: "textarea",
							error: unref(accForm).errors.notes
						}, null, _parent, _scopeId));
					} else return [
						createVNode("div", { class: "form-grid-2" }, [
							createVNode(_sfc_main$2, {
								modelValue: unref(accForm).name,
								"onUpdate:modelValue": ($event) => unref(accForm).name = $event,
								label: "Fund Name *",
								placeholder: "e.g. Front-desk float",
								error: unref(accForm).errors.name
							}, null, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"error"
							]),
							createVNode(_sfc_main$2, {
								modelValue: unref(accForm).branch_id,
								"onUpdate:modelValue": ($event) => unref(accForm).branch_id = $event,
								label: "Branch",
								type: "select",
								error: unref(accForm).errors.branch_id
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
								modelValue: unref(accForm).custodian_name,
								"onUpdate:modelValue": ($event) => unref(accForm).custodian_name = $event,
								label: "Custodian",
								placeholder: "Who holds the cash",
								error: unref(accForm).errors.custodian_name
							}, null, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"error"
							]),
							createVNode(_sfc_main$2, {
								modelValue: unref(accForm).opening_balance,
								"onUpdate:modelValue": ($event) => unref(accForm).opening_balance = $event,
								modelModifiers: { number: true },
								label: "Opening Balance",
								type: "number",
								step: "0.01",
								error: unref(accForm).errors.opening_balance
							}, null, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"error"
							])
						]),
						createVNode("label", { class: "pc__check" }, [withDirectives(createVNode("input", {
							type: "checkbox",
							"onUpdate:modelValue": ($event) => unref(accForm).is_active = $event
						}, null, 8, ["onUpdate:modelValue"]), [[vModelCheckbox, unref(accForm).is_active]]), createVNode("span", null, "Active fund")]),
						unref(accForm).id ? (openBlock(), createBlock("p", {
							key: 0,
							class: "pc__hint"
						}, "Changing the opening balance re-rolls the running balance across the whole ledger.")) : createCommentVNode("", true),
						createVNode(_sfc_main$2, {
							modelValue: unref(accForm).notes,
							"onUpdate:modelValue": ($event) => unref(accForm).notes = $event,
							label: "Notes",
							type: "textarea",
							error: unref(accForm).errors.notes
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
				modelValue: showTxn.value,
				"onUpdate:modelValue": ($event) => showTxn.value = $event,
				title: "Record Transaction",
				width: "520px"
			}, {
				footer: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<button class="ui-btn ui-btn--ghost" data-v-da93b087${_scopeId}>Cancel</button><button class="ui-btn ui-btn--primary"${ssrIncludeBooleanAttr(unref(txnForm).processing) ? " disabled" : ""} data-v-da93b087${_scopeId}>Record</button>`);
					else return [createVNode("button", {
						class: "ui-btn ui-btn--ghost",
						onClick: ($event) => showTxn.value = false
					}, "Cancel", 8, ["onClick"]), createVNode("button", {
						class: "ui-btn ui-btn--primary",
						disabled: unref(txnForm).processing,
						onClick: saveTxn
					}, "Record", 8, ["disabled"])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(txnForm).petty_cash_account_id,
							"onUpdate:modelValue": ($event) => unref(txnForm).petty_cash_account_id = $event,
							label: "Fund *",
							type: "select",
							error: unref(txnForm).errors.petty_cash_account_id
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) {
									_push(`<option value="" disabled data-v-da93b087${_scopeId}>Select fund</option><!--[-->`);
									ssrRenderList(activeAccounts.value, (a) => {
										_push(`<option${ssrRenderAttr("value", a.id)} data-v-da93b087${_scopeId}>${ssrInterpolate(a.name)} (${ssrInterpolate(fmt(a.current_balance))})</option>`);
									});
									_push(`<!--]-->`);
								} else return [createVNode("option", {
									value: "",
									disabled: ""
								}, "Select fund"), (openBlock(true), createBlock(Fragment, null, renderList(activeAccounts.value, (a) => {
									return openBlock(), createBlock("option", {
										key: a.id,
										value: a.id
									}, toDisplayString(a.name) + " (" + toDisplayString(fmt(a.current_balance)) + ")", 9, ["value"]);
								}), 128))];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(`<div class="form-grid-2" data-v-da93b087${_scopeId}>`);
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(txnForm).type,
							"onUpdate:modelValue": ($event) => unref(txnForm).type = $event,
							label: "Type *",
							type: "select",
							error: unref(txnForm).errors.type
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) {
									_push(`<!--[-->`);
									ssrRenderList(props.types, (t) => {
										_push(`<option${ssrRenderAttr("value", t)} data-v-da93b087${_scopeId}>${ssrInterpolate(typeLabel(t))}</option>`);
									});
									_push(`<!--]-->`);
								} else return [(openBlock(true), createBlock(Fragment, null, renderList(props.types, (t) => {
									return openBlock(), createBlock("option", {
										key: t,
										value: t
									}, toDisplayString(typeLabel(t)), 9, ["value"]);
								}), 128))];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(txnForm).amount,
							"onUpdate:modelValue": ($event) => unref(txnForm).amount = $event,
							modelModifiers: { number: true },
							label: "Amount *",
							type: "number",
							step: "0.01",
							error: unref(txnForm).errors.amount
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(txnForm).occurred_on,
							"onUpdate:modelValue": ($event) => unref(txnForm).occurred_on = $event,
							label: "Date",
							type: "date",
							error: unref(txnForm).errors.occurred_on
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(txnForm).reference,
							"onUpdate:modelValue": ($event) => unref(txnForm).reference = $event,
							label: "Reference",
							error: unref(txnForm).errors.reference
						}, null, _parent, _scopeId));
						_push(`</div>`);
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(txnForm).description,
							"onUpdate:modelValue": ($event) => unref(txnForm).description = $event,
							label: "Details",
							placeholder: "What was this for?",
							error: unref(txnForm).errors.description
						}, null, _parent, _scopeId));
						_push(`<p class="pc__hint" data-v-da93b087${_scopeId}>${ssrInterpolate(txnHint.value)}</p>`);
					} else return [
						createVNode(_sfc_main$2, {
							modelValue: unref(txnForm).petty_cash_account_id,
							"onUpdate:modelValue": ($event) => unref(txnForm).petty_cash_account_id = $event,
							label: "Fund *",
							type: "select",
							error: unref(txnForm).errors.petty_cash_account_id
						}, {
							default: withCtx(() => [createVNode("option", {
								value: "",
								disabled: ""
							}, "Select fund"), (openBlock(true), createBlock(Fragment, null, renderList(activeAccounts.value, (a) => {
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
						createVNode("div", { class: "form-grid-2" }, [
							createVNode(_sfc_main$2, {
								modelValue: unref(txnForm).type,
								"onUpdate:modelValue": ($event) => unref(txnForm).type = $event,
								label: "Type *",
								type: "select",
								error: unref(txnForm).errors.type
							}, {
								default: withCtx(() => [(openBlock(true), createBlock(Fragment, null, renderList(props.types, (t) => {
									return openBlock(), createBlock("option", {
										key: t,
										value: t
									}, toDisplayString(typeLabel(t)), 9, ["value"]);
								}), 128))]),
								_: 1
							}, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"error"
							]),
							createVNode(_sfc_main$2, {
								modelValue: unref(txnForm).amount,
								"onUpdate:modelValue": ($event) => unref(txnForm).amount = $event,
								modelModifiers: { number: true },
								label: "Amount *",
								type: "number",
								step: "0.01",
								error: unref(txnForm).errors.amount
							}, null, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"error"
							]),
							createVNode(_sfc_main$2, {
								modelValue: unref(txnForm).occurred_on,
								"onUpdate:modelValue": ($event) => unref(txnForm).occurred_on = $event,
								label: "Date",
								type: "date",
								error: unref(txnForm).errors.occurred_on
							}, null, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"error"
							]),
							createVNode(_sfc_main$2, {
								modelValue: unref(txnForm).reference,
								"onUpdate:modelValue": ($event) => unref(txnForm).reference = $event,
								label: "Reference",
								error: unref(txnForm).errors.reference
							}, null, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"error"
							])
						]),
						createVNode(_sfc_main$2, {
							modelValue: unref(txnForm).description,
							"onUpdate:modelValue": ($event) => unref(txnForm).description = $event,
							label: "Details",
							placeholder: "What was this for?",
							error: unref(txnForm).errors.description
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode("p", { class: "pc__hint" }, toDisplayString(txnHint.value), 1)
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
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/pages/Finance/PettyCash.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var PettyCash_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-da93b087"]]);
//#endregion
export { PettyCash_default as default };
