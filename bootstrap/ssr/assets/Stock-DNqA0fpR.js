import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-BOaGB7Aw.js";
import { n as usePermissions, t as AdminLayout_default } from "./AdminLayout-Dn6OtQae.js";
import { t as _sfc_main$1 } from "./PageHeader-D0aRDn5C.js";
import { t as DataTable_default } from "./DataTable-DQdMyI8_.js";
import { t as Pagination_default } from "./Pagination-CHJUzz_w.js";
import { t as Modal_default } from "./Modal-CpmFAnsY.js";
import { t as _sfc_main$2 } from "./FormField-Doe8oR1s.js";
import { Fragment, computed, createBlock, createCommentVNode, createTextVNode, createVNode, mergeProps, openBlock, ref, renderList, toDisplayString, unref, useSSRContext, watch, withCtx } from "vue";
import { router, useForm } from "@inertiajs/vue3";
import { ssrIncludeBooleanAttr, ssrInterpolate, ssrRenderAttr, ssrRenderAttrs, ssrRenderClass, ssrRenderComponent, ssrRenderList } from "vue/server-renderer";
//#region resources/js/pages/Inventory/Stock.vue
var _sfc_main = /*@__PURE__*/ Object.assign({ layout: AdminLayout_default }, {
	__name: "Stock",
	__ssrInlineRender: true,
	props: {
		levels: {
			type: Object,
			default: () => ({ data: [] })
		},
		ingredients: {
			type: Array,
			default: () => []
		},
		movements: {
			type: Array,
			default: () => []
		},
		summary: {
			type: Object,
			default: () => ({
				stock_value: 0,
				low_stock: 0,
				negative: 0,
				tracked: 0,
				wastage_this_month: 0
			})
		},
		branchName: {
			type: String,
			default: ""
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
				key: "name",
				label: "Ingredient"
			},
			{
				key: "quantity",
				label: "On Hand"
			},
			{
				key: "reorder_level",
				label: "Reorder At"
			},
			{
				key: "average_cost",
				label: "Avg. Cost"
			},
			{
				key: "stock_value",
				label: "Value"
			}
		];
		const tabs = [
			{
				value: "",
				label: "All"
			},
			{
				value: "low",
				label: "Low Stock"
			},
			{
				value: "negative",
				label: "Negative"
			}
		];
		const levels = computed(() => props.levels?.data ?? []);
		const search = ref(props.filters?.search ?? "");
		const viewFilter = ref(props.filters?.view ?? "");
		let timer = null;
		const reload = () => router.get("/inventory/stock", {
			search: search.value || void 0,
			view: viewFilter.value || void 0
		}, {
			preserveState: true,
			preserveScroll: true,
			replace: true,
			only: [
				"levels",
				"summary",
				"movements",
				"filters"
			]
		});
		watch([search, viewFilter], () => {
			clearTimeout(timer);
			timer = setTimeout(reload, 300);
		});
		const showCount = ref(false);
		const countForm = useForm({
			ingredient_id: "",
			counted_quantity: 0,
			note: ""
		});
		const openCount = (row = null) => {
			countForm.reset();
			countForm.clearErrors();
			if (row) {
				countForm.ingredient_id = row.ingredient_id;
				countForm.counted_quantity = row.quantity;
			}
			showCount.value = true;
		};
		const saveCount = () => countForm.post("/inventory/stock/adjust", {
			preserveScroll: true,
			onSuccess: () => showCount.value = false
		});
		const levelFor = (id) => levels.value.find((r) => String(r.ingredient_id) === String(id));
		const systemBalanceLabel = computed(() => {
			const row = levelFor(countForm.ingredient_id);
			if (!countForm.ingredient_id) return "";
			return row ? `${qty(row.quantity)} ${row.unit}` : "Not on this page";
		});
		const countDelta = computed(() => {
			const row = levelFor(countForm.ingredient_id);
			if (!row) return null;
			return Number((Number(countForm.counted_quantity || 0) - Number(row.quantity || 0)).toFixed(4));
		});
		const showWriteOff = ref(false);
		const wasteForm = useForm({
			ingredient_id: "",
			quantity: null,
			note: ""
		});
		const openWriteOff = () => {
			wasteForm.reset();
			wasteForm.clearErrors();
			showWriteOff.value = true;
		};
		const saveWriteOff = () => {
			if (!confirm("Write this stock off? It will leave inventory at its carrying cost.")) return;
			wasteForm.post("/inventory/stock/write-off", {
				preserveScroll: true,
				onSuccess: () => showWriteOff.value = false
			});
		};
		const showLedger = ref(false);
		const ledger = ref([]);
		const ledgerLoading = ref(false);
		const ledgerError = ref("");
		const ledgerName = ref("");
		const ledgerTitle = computed(() => ledgerName.value ? `Ledger — ${ledgerName.value}` : "Ledger");
		const openLedger = async (row) => {
			ledgerName.value = row.name;
			ledger.value = [];
			ledgerError.value = "";
			ledgerLoading.value = true;
			showLedger.value = true;
			try {
				const res = await fetch(`/inventory/stock/${row.ingredient_id}/ledger`, { headers: {
					Accept: "application/json",
					"X-Requested-With": "XMLHttpRequest"
				} });
				if (!res.ok) throw new Error(`Request failed (${res.status})`);
				const body = await res.json();
				ledger.value = body.movements ?? [];
			} catch (e) {
				ledgerError.value = "Could not load the ledger. " + (e?.message ?? "");
			} finally {
				ledgerLoading.value = false;
			}
		};
		const unitOf = (id) => props.ingredients.find((i) => String(i.id) === String(id))?.unit ?? "";
		const qtyClass = (row) => row.quantity < 0 ? "st__neg" : row.needs_reorder ? "st__low" : "";
		const TYPE_LABELS = {
			purchase: "Received",
			sale: "Sold",
			sale_reversal: "Reversed",
			wastage: "Wastage",
			adjustment: "Stock Take",
			opening_balance: "Opening"
		};
		const TYPE_BADGES = {
			purchase: "ui-badge--success",
			sale: "ui-badge--info",
			sale_reversal: "ui-badge--muted",
			wastage: "ui-badge--danger",
			adjustment: "ui-badge--warning",
			opening_balance: "ui-badge--muted"
		};
		const typeLabel = (t) => TYPE_LABELS[t] ?? t;
		const typeBadge = (t) => TYPE_BADGES[t] ?? "ui-badge--muted";
		const fmt = (v) => "Rs " + Number(v || 0).toLocaleString("en-PK", { minimumFractionDigits: 2 });
		const qty = (v) => Number(v || 0).toLocaleString("en-PK", { maximumFractionDigits: 4 });
		const fmtDateTime = (v) => v ? new Date(v.replace(" ", "T")).toLocaleString("en-PK", {
			dateStyle: "medium",
			timeStyle: "short"
		}) : "—";
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "page" }, _attrs))} data-v-d48bcf9c>`);
			_push(ssrRenderComponent(_sfc_main$1, {
				title: "Stock on Hand",
				subtitle: `What is physically in ${props.branchName || "this outlet"} right now, and the ledger that explains every balance. Stock rises only when a delivery is booked and falls when dishes are sold — the two corrections below are for when reality disagrees.`
			}, {
				actions: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						if (unref(can)("inventory.stock.adjust")) _push(`<button class="ui-btn ui-btn--secondary" data-v-d48bcf9c${_scopeId}> Record Wastage </button>`);
						else _push(`<!---->`);
						if (unref(can)("inventory.stock.adjust")) _push(`<button class="ui-btn ui-btn--primary" data-v-d48bcf9c${_scopeId}> Stock Take </button>`);
						else _push(`<!---->`);
					} else return [unref(can)("inventory.stock.adjust") ? (openBlock(), createBlock("button", {
						key: 0,
						class: "ui-btn ui-btn--secondary",
						onClick: ($event) => openWriteOff()
					}, " Record Wastage ", 8, ["onClick"])) : createCommentVNode("", true), unref(can)("inventory.stock.adjust") ? (openBlock(), createBlock("button", {
						key: 1,
						class: "ui-btn ui-btn--primary",
						onClick: ($event) => openCount()
					}, " Stock Take ", 8, ["onClick"])) : createCommentVNode("", true)];
				}),
				_: 1
			}, _parent));
			_push(`<div class="st__kpis" data-v-d48bcf9c><div class="st__kpi st__kpi--ok" data-v-d48bcf9c><span class="st__kpi-label" data-v-d48bcf9c>Stock Value</span><span class="st__kpi-val" data-v-d48bcf9c>${ssrInterpolate(fmt(props.summary.stock_value))}</span><span class="st__kpi-sub" data-v-d48bcf9c>${ssrInterpolate(props.summary.tracked)} ingredient(s) tracked</span></div><div class="st__kpi st__kpi--warn" data-v-d48bcf9c><span class="st__kpi-label" data-v-d48bcf9c>Low Stock</span><span class="st__kpi-val" data-v-d48bcf9c>${ssrInterpolate(props.summary.low_stock)}</span><span class="st__kpi-sub" data-v-d48bcf9c>at or below reorder level</span></div><div class="${ssrRenderClass([props.summary.negative > 0 ? "st__kpi--danger" : "", "st__kpi"])}" data-v-d48bcf9c><span class="st__kpi-label" data-v-d48bcf9c>Negative</span><span class="st__kpi-val" data-v-d48bcf9c>${ssrInterpolate(props.summary.negative)}</span><span class="st__kpi-sub" data-v-d48bcf9c>count these first</span></div><div class="st__kpi st__kpi--info" data-v-d48bcf9c><span class="st__kpi-label" data-v-d48bcf9c>Wastage This Month</span><span class="st__kpi-val" data-v-d48bcf9c>${ssrInterpolate(fmt(props.summary.wastage_this_month))}</span><span class="st__kpi-sub" data-v-d48bcf9c>written off at carrying cost</span></div></div><div class="st__filters" data-v-d48bcf9c><input${ssrRenderAttr("value", search.value)} class="ui-input st__search" placeholder="Search ingredient / SKU…" data-v-d48bcf9c><div class="st__tabs" data-v-d48bcf9c><!--[-->`);
			ssrRenderList(tabs, (tab) => {
				_push(`<button class="${ssrRenderClass([{ "st__tab--on": viewFilter.value === tab.value }, "st__tab"])}" data-v-d48bcf9c>${ssrInterpolate(tab.label)}</button>`);
			});
			_push(`<!--]--></div></div>`);
			_push(ssrRenderComponent(DataTable_default, {
				columns,
				rows: levels.value,
				"empty-text": "Nothing in stock yet. Book a goods receipt and the ingredients will appear here."
			}, {
				"cell:name": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<strong data-v-d48bcf9c${_scopeId}>${ssrInterpolate(row.name)}</strong>`);
						if (row.sku) _push(`<span class="st__muted st__code" data-v-d48bcf9c${_scopeId}>${ssrInterpolate(row.sku)}</span>`);
						else _push(`<!---->`);
					} else return [createVNode("strong", null, toDisplayString(row.name), 1), row.sku ? (openBlock(), createBlock("span", {
						key: 0,
						class: "st__muted st__code"
					}, toDisplayString(row.sku), 1)) : createCommentVNode("", true)];
				}),
				"cell:quantity": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<span class="${ssrRenderClass(qtyClass(row))}" data-v-d48bcf9c${_scopeId}>${ssrInterpolate(qty(row.quantity))} ${ssrInterpolate(row.unit)}</span>`);
						if (row.quantity < 0) _push(`<span class="ui-badge ui-badge--danger st__pill" data-v-d48bcf9c${_scopeId}>Negative</span>`);
						else if (row.needs_reorder) _push(`<span class="ui-badge ui-badge--warning st__pill" data-v-d48bcf9c${_scopeId}>Reorder</span>`);
						else _push(`<!---->`);
					} else return [createVNode("span", { class: qtyClass(row) }, toDisplayString(qty(row.quantity)) + " " + toDisplayString(row.unit), 3), row.quantity < 0 ? (openBlock(), createBlock("span", {
						key: 0,
						class: "ui-badge ui-badge--danger st__pill"
					}, "Negative")) : row.needs_reorder ? (openBlock(), createBlock("span", {
						key: 1,
						class: "ui-badge ui-badge--warning st__pill"
					}, "Reorder")) : createCommentVNode("", true)];
				}),
				"cell:reorder_level": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) _push(`<span class="st__muted" data-v-d48bcf9c${_scopeId}>${ssrInterpolate(qty(row.reorder_level))} ${ssrInterpolate(row.unit)}</span>`);
					else return [createVNode("span", { class: "st__muted" }, toDisplayString(qty(row.reorder_level)) + " " + toDisplayString(row.unit), 1)];
				}),
				"cell:average_cost": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						if (row.average_cost > 0) _push(`<span data-v-d48bcf9c${_scopeId}>${ssrInterpolate(fmt(row.average_cost))}<span class="st__muted" data-v-d48bcf9c${_scopeId}> / ${ssrInterpolate(row.unit)}</span></span>`);
						else _push(`<span class="st__muted" data-v-d48bcf9c${_scopeId}>—</span>`);
					} else return [row.average_cost > 0 ? (openBlock(), createBlock("span", { key: 0 }, [createTextVNode(toDisplayString(fmt(row.average_cost)), 1), createVNode("span", { class: "st__muted" }, " / " + toDisplayString(row.unit), 1)])) : (openBlock(), createBlock("span", {
						key: 1,
						class: "st__muted"
					}, "—"))];
				}),
				"cell:stock_value": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) _push(`<strong data-v-d48bcf9c${_scopeId}>${ssrInterpolate(fmt(value))}</strong>`);
					else return [createVNode("strong", null, toDisplayString(fmt(value)), 1)];
				}),
				actions: withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<button class="ui-btn ui-btn--ghost ui-btn--sm" data-v-d48bcf9c${_scopeId}>Ledger</button>`);
						if (unref(can)("inventory.stock.adjust")) _push(`<button class="ui-btn ui-btn--secondary ui-btn--sm" data-v-d48bcf9c${_scopeId}>Count</button>`);
						else _push(`<!---->`);
					} else return [createVNode("button", {
						class: "ui-btn ui-btn--ghost ui-btn--sm",
						onClick: ($event) => openLedger(row)
					}, "Ledger", 8, ["onClick"]), unref(can)("inventory.stock.adjust") ? (openBlock(), createBlock("button", {
						key: 0,
						class: "ui-btn ui-btn--secondary ui-btn--sm",
						onClick: ($event) => openCount(row)
					}, "Count", 8, ["onClick"])) : createCommentVNode("", true)];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(Pagination_default, {
				paginator: props.levels,
				only: [
					"levels",
					"summary",
					"movements"
				]
			}, null, _parent));
			_push(`<section class="st__feed" data-v-d48bcf9c><h3 class="st__feed-title" data-v-d48bcf9c>Recent Movements</h3>`);
			if (!props.movements.length) _push(`<p class="st__muted" data-v-d48bcf9c>No stock has moved at this outlet yet.</p>`);
			else {
				_push(`<table class="st__feed-table" data-v-d48bcf9c><thead data-v-d48bcf9c><tr data-v-d48bcf9c><th data-v-d48bcf9c>When</th><th data-v-d48bcf9c>Ingredient</th><th data-v-d48bcf9c>Type</th><th class="st__right" data-v-d48bcf9c>Change</th><th class="st__right" data-v-d48bcf9c>Balance</th><th class="st__right" data-v-d48bcf9c>Value</th><th data-v-d48bcf9c>Reference</th></tr></thead><tbody data-v-d48bcf9c><!--[-->`);
				ssrRenderList(props.movements, (m) => {
					_push(`<tr data-v-d48bcf9c><td class="st__muted st__nowrap" data-v-d48bcf9c>${ssrInterpolate(fmtDateTime(m.created_at))}</td><td data-v-d48bcf9c>${ssrInterpolate(m.ingredient_name)}</td><td data-v-d48bcf9c><span class="${ssrRenderClass([typeBadge(m.type), "ui-badge"])}" data-v-d48bcf9c>${ssrInterpolate(typeLabel(m.type))}</span></td><td class="${ssrRenderClass([m.quantity < 0 ? "st__out" : "st__in", "st__right"])}" data-v-d48bcf9c>${ssrInterpolate(m.quantity > 0 ? "+" : "")}${ssrInterpolate(qty(m.quantity))} ${ssrInterpolate(m.unit)}</td><td class="st__right" data-v-d48bcf9c>${ssrInterpolate(qty(m.balance_after))}</td><td class="st__right st__muted" data-v-d48bcf9c>${ssrInterpolate(fmt(m.value))}</td><td class="st__muted" data-v-d48bcf9c>${ssrInterpolate(m.reference || "—")} `);
					if (m.note) _push(`<span class="st__note"${ssrRenderAttr("title", m.note)} data-v-d48bcf9c>${ssrInterpolate(m.note)}</span>`);
					else _push(`<!---->`);
					_push(`</td></tr>`);
				});
				_push(`<!--]--></tbody></table>`);
			}
			_push(`</section>`);
			_push(ssrRenderComponent(Modal_default, {
				modelValue: showCount.value,
				"onUpdate:modelValue": ($event) => showCount.value = $event,
				title: "Stock Take",
				width: "560px"
			}, {
				footer: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<button class="ui-btn ui-btn--ghost" data-v-d48bcf9c${_scopeId}>Cancel</button><button class="ui-btn ui-btn--primary"${ssrIncludeBooleanAttr(unref(countForm).processing) ? " disabled" : ""} data-v-d48bcf9c${_scopeId}>Record Count</button>`);
					else return [createVNode("button", {
						class: "ui-btn ui-btn--ghost",
						onClick: ($event) => showCount.value = false
					}, "Cancel", 8, ["onClick"]), createVNode("button", {
						class: "ui-btn ui-btn--primary",
						disabled: unref(countForm).processing,
						onClick: saveCount
					}, "Record Count", 8, ["disabled"])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<p class="st__hint" data-v-d48bcf9c${_scopeId}> Enter what you physically counted. The system writes the difference to the ledger as an adjustment — it does not create value, so the ingredient keeps its existing average cost. </p>`);
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(countForm).ingredient_id,
							"onUpdate:modelValue": ($event) => unref(countForm).ingredient_id = $event,
							label: "Ingredient *",
							type: "select",
							error: unref(countForm).errors.ingredient_id
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) {
									_push(`<option value="" data-v-d48bcf9c${_scopeId}>Select an ingredient…</option><!--[-->`);
									ssrRenderList(props.ingredients, (i) => {
										_push(`<option${ssrRenderAttr("value", i.id)} data-v-d48bcf9c${_scopeId}>${ssrInterpolate(i.name)} (${ssrInterpolate(i.unit)})</option>`);
									});
									_push(`<!--]-->`);
								} else return [createVNode("option", { value: "" }, "Select an ingredient…"), (openBlock(true), createBlock(Fragment, null, renderList(props.ingredients, (i) => {
									return openBlock(), createBlock("option", {
										key: i.id,
										value: i.id
									}, toDisplayString(i.name) + " (" + toDisplayString(i.unit) + ")", 9, ["value"]);
								}), 128))];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(`<div class="form-grid-2" data-v-d48bcf9c${_scopeId}>`);
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(countForm).counted_quantity,
							"onUpdate:modelValue": ($event) => unref(countForm).counted_quantity = $event,
							modelModifiers: { number: true },
							label: "Counted Quantity *",
							type: "number",
							step: "0.0001",
							error: unref(countForm).errors.counted_quantity
						}, {
							hint: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(`In ${ssrInterpolate(unitOf(unref(countForm).ingredient_id) || "the ingredient's unit")}.`);
								else return [createTextVNode("In " + toDisplayString(unitOf(unref(countForm).ingredient_id) || "the ingredient's unit") + ".", 1)];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: systemBalanceLabel.value,
							"onUpdate:modelValue": ($event) => systemBalanceLabel.value = $event,
							label: "System Says",
							readonly: ""
						}, null, _parent, _scopeId));
						_push(`</div>`);
						if (countDelta.value !== null) {
							_push(`<p class="${ssrRenderClass([countDelta.value === 0 ? "" : countDelta.value > 0 ? "st__in" : "st__out", "st__delta"])}" data-v-d48bcf9c${_scopeId}>`);
							if (countDelta.value === 0) _push(`<!--[-->Count matches the system balance — nothing will be written.<!--]-->`);
							else _push(`<!--[-->Will adjust by ${ssrInterpolate(countDelta.value > 0 ? "+" : "")}${ssrInterpolate(qty(countDelta.value))} ${ssrInterpolate(unitOf(unref(countForm).ingredient_id))}.<!--]-->`);
							_push(`</p>`);
						} else _push(`<!---->`);
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(countForm).note,
							"onUpdate:modelValue": ($event) => unref(countForm).note = $event,
							label: "Note",
							placeholder: "e.g. Monthly count, walk-in freezer",
							error: unref(countForm).errors.note
						}, null, _parent, _scopeId));
					} else return [
						createVNode("p", { class: "st__hint" }, " Enter what you physically counted. The system writes the difference to the ledger as an adjustment — it does not create value, so the ingredient keeps its existing average cost. "),
						createVNode(_sfc_main$2, {
							modelValue: unref(countForm).ingredient_id,
							"onUpdate:modelValue": ($event) => unref(countForm).ingredient_id = $event,
							label: "Ingredient *",
							type: "select",
							error: unref(countForm).errors.ingredient_id
						}, {
							default: withCtx(() => [createVNode("option", { value: "" }, "Select an ingredient…"), (openBlock(true), createBlock(Fragment, null, renderList(props.ingredients, (i) => {
								return openBlock(), createBlock("option", {
									key: i.id,
									value: i.id
								}, toDisplayString(i.name) + " (" + toDisplayString(i.unit) + ")", 9, ["value"]);
							}), 128))]),
							_: 1
						}, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode("div", { class: "form-grid-2" }, [createVNode(_sfc_main$2, {
							modelValue: unref(countForm).counted_quantity,
							"onUpdate:modelValue": ($event) => unref(countForm).counted_quantity = $event,
							modelModifiers: { number: true },
							label: "Counted Quantity *",
							type: "number",
							step: "0.0001",
							error: unref(countForm).errors.counted_quantity
						}, {
							hint: withCtx(() => [createTextVNode("In " + toDisplayString(unitOf(unref(countForm).ingredient_id) || "the ingredient's unit") + ".", 1)]),
							_: 1
						}, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]), createVNode(_sfc_main$2, {
							modelValue: systemBalanceLabel.value,
							"onUpdate:modelValue": ($event) => systemBalanceLabel.value = $event,
							label: "System Says",
							readonly: ""
						}, null, 8, ["modelValue", "onUpdate:modelValue"])]),
						countDelta.value !== null ? (openBlock(), createBlock("p", {
							key: 0,
							class: ["st__delta", countDelta.value === 0 ? "" : countDelta.value > 0 ? "st__in" : "st__out"]
						}, [countDelta.value === 0 ? (openBlock(), createBlock(Fragment, { key: 0 }, [createTextVNode("Count matches the system balance — nothing will be written.")], 64)) : (openBlock(), createBlock(Fragment, { key: 1 }, [createTextVNode("Will adjust by " + toDisplayString(countDelta.value > 0 ? "+" : "") + toDisplayString(qty(countDelta.value)) + " " + toDisplayString(unitOf(unref(countForm).ingredient_id)) + ".", 1)], 64))], 2)) : createCommentVNode("", true),
						createVNode(_sfc_main$2, {
							modelValue: unref(countForm).note,
							"onUpdate:modelValue": ($event) => unref(countForm).note = $event,
							label: "Note",
							placeholder: "e.g. Monthly count, walk-in freezer",
							error: unref(countForm).errors.note
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
				modelValue: showWriteOff.value,
				"onUpdate:modelValue": ($event) => showWriteOff.value = $event,
				title: "Record Wastage",
				width: "560px"
			}, {
				footer: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<button class="ui-btn ui-btn--ghost" data-v-d48bcf9c${_scopeId}>Cancel</button><button class="ui-btn ui-btn--danger"${ssrIncludeBooleanAttr(unref(wasteForm).processing) ? " disabled" : ""} data-v-d48bcf9c${_scopeId}>Write Off</button>`);
					else return [createVNode("button", {
						class: "ui-btn ui-btn--ghost",
						onClick: ($event) => showWriteOff.value = false
					}, "Cancel", 8, ["onClick"]), createVNode("button", {
						class: "ui-btn ui-btn--danger",
						disabled: unref(wasteForm).processing,
						onClick: saveWriteOff
					}, "Write Off", 8, ["disabled"])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<p class="st__hint" data-v-d48bcf9c${_scopeId}> Stock that was spoiled, spilled or binned. It leaves at its carrying cost and lands in this month&#39;s wastage figure — use a stock take instead if you are correcting a counting error. </p>`);
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(wasteForm).ingredient_id,
							"onUpdate:modelValue": ($event) => unref(wasteForm).ingredient_id = $event,
							label: "Ingredient *",
							type: "select",
							error: unref(wasteForm).errors.ingredient_id
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) {
									_push(`<option value="" data-v-d48bcf9c${_scopeId}>Select an ingredient…</option><!--[-->`);
									ssrRenderList(props.ingredients, (i) => {
										_push(`<option${ssrRenderAttr("value", i.id)} data-v-d48bcf9c${_scopeId}>${ssrInterpolate(i.name)} (${ssrInterpolate(i.unit)})</option>`);
									});
									_push(`<!--]-->`);
								} else return [createVNode("option", { value: "" }, "Select an ingredient…"), (openBlock(true), createBlock(Fragment, null, renderList(props.ingredients, (i) => {
									return openBlock(), createBlock("option", {
										key: i.id,
										value: i.id
									}, toDisplayString(i.name) + " (" + toDisplayString(i.unit) + ")", 9, ["value"]);
								}), 128))];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(wasteForm).quantity,
							"onUpdate:modelValue": ($event) => unref(wasteForm).quantity = $event,
							modelModifiers: { number: true },
							label: "Quantity Wasted *",
							type: "number",
							step: "0.0001",
							error: unref(wasteForm).errors.quantity
						}, {
							hint: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(`In ${ssrInterpolate(unitOf(unref(wasteForm).ingredient_id) || "the ingredient's unit")}.`);
								else return [createTextVNode("In " + toDisplayString(unitOf(unref(wasteForm).ingredient_id) || "the ingredient's unit") + ".", 1)];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(wasteForm).note,
							"onUpdate:modelValue": ($event) => unref(wasteForm).note = $event,
							label: "Reason *",
							placeholder: "e.g. Spoiled — fridge failure overnight",
							error: unref(wasteForm).errors.note
						}, null, _parent, _scopeId));
					} else return [
						createVNode("p", { class: "st__hint" }, " Stock that was spoiled, spilled or binned. It leaves at its carrying cost and lands in this month's wastage figure — use a stock take instead if you are correcting a counting error. "),
						createVNode(_sfc_main$2, {
							modelValue: unref(wasteForm).ingredient_id,
							"onUpdate:modelValue": ($event) => unref(wasteForm).ingredient_id = $event,
							label: "Ingredient *",
							type: "select",
							error: unref(wasteForm).errors.ingredient_id
						}, {
							default: withCtx(() => [createVNode("option", { value: "" }, "Select an ingredient…"), (openBlock(true), createBlock(Fragment, null, renderList(props.ingredients, (i) => {
								return openBlock(), createBlock("option", {
									key: i.id,
									value: i.id
								}, toDisplayString(i.name) + " (" + toDisplayString(i.unit) + ")", 9, ["value"]);
							}), 128))]),
							_: 1
						}, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode(_sfc_main$2, {
							modelValue: unref(wasteForm).quantity,
							"onUpdate:modelValue": ($event) => unref(wasteForm).quantity = $event,
							modelModifiers: { number: true },
							label: "Quantity Wasted *",
							type: "number",
							step: "0.0001",
							error: unref(wasteForm).errors.quantity
						}, {
							hint: withCtx(() => [createTextVNode("In " + toDisplayString(unitOf(unref(wasteForm).ingredient_id) || "the ingredient's unit") + ".", 1)]),
							_: 1
						}, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode(_sfc_main$2, {
							modelValue: unref(wasteForm).note,
							"onUpdate:modelValue": ($event) => unref(wasteForm).note = $event,
							label: "Reason *",
							placeholder: "e.g. Spoiled — fridge failure overnight",
							error: unref(wasteForm).errors.note
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
				modelValue: showLedger.value,
				"onUpdate:modelValue": ($event) => showLedger.value = $event,
				title: ledgerTitle.value,
				width: "820px"
			}, {
				footer: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<button class="ui-btn ui-btn--ghost" data-v-d48bcf9c${_scopeId}>Close</button>`);
					else return [createVNode("button", {
						class: "ui-btn ui-btn--ghost",
						onClick: ($event) => showLedger.value = false
					}, "Close", 8, ["onClick"])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						if (ledgerLoading.value) _push(`<p class="st__muted" data-v-d48bcf9c${_scopeId}>Loading…</p>`);
						else if (ledgerError.value) _push(`<p class="st__out" data-v-d48bcf9c${_scopeId}>${ssrInterpolate(ledgerError.value)}</p>`);
						else if (!ledger.value.length) _push(`<p class="st__muted" data-v-d48bcf9c${_scopeId}>No movements recorded for this ingredient.</p>`);
						else {
							_push(`<table class="st__feed-table" data-v-d48bcf9c${_scopeId}><thead data-v-d48bcf9c${_scopeId}><tr data-v-d48bcf9c${_scopeId}><th data-v-d48bcf9c${_scopeId}>When</th><th data-v-d48bcf9c${_scopeId}>Type</th><th class="st__right" data-v-d48bcf9c${_scopeId}>Change</th><th class="st__right" data-v-d48bcf9c${_scopeId}>Unit Cost</th><th class="st__right" data-v-d48bcf9c${_scopeId}>Balance</th><th class="st__right" data-v-d48bcf9c${_scopeId}>Value</th><th data-v-d48bcf9c${_scopeId}>Reference</th></tr></thead><tbody data-v-d48bcf9c${_scopeId}><!--[-->`);
							ssrRenderList(ledger.value, (m) => {
								_push(`<tr data-v-d48bcf9c${_scopeId}><td class="st__muted st__nowrap" data-v-d48bcf9c${_scopeId}>${ssrInterpolate(fmtDateTime(m.created_at))}</td><td data-v-d48bcf9c${_scopeId}><span class="${ssrRenderClass([typeBadge(m.type), "ui-badge"])}" data-v-d48bcf9c${_scopeId}>${ssrInterpolate(typeLabel(m.type))}</span></td><td class="${ssrRenderClass([m.quantity < 0 ? "st__out" : "st__in", "st__right"])}" data-v-d48bcf9c${_scopeId}>${ssrInterpolate(m.quantity > 0 ? "+" : "")}${ssrInterpolate(qty(m.quantity))}</td><td class="st__right st__muted" data-v-d48bcf9c${_scopeId}>${ssrInterpolate(fmt(m.unit_cost))}</td><td class="st__right" data-v-d48bcf9c${_scopeId}>${ssrInterpolate(qty(m.balance_after))}</td><td class="st__right st__muted" data-v-d48bcf9c${_scopeId}>${ssrInterpolate(fmt(m.value))}</td><td class="st__muted" data-v-d48bcf9c${_scopeId}>${ssrInterpolate(m.reference || m.note || "—")}</td></tr>`);
							});
							_push(`<!--]--></tbody></table>`);
						}
					} else return [ledgerLoading.value ? (openBlock(), createBlock("p", {
						key: 0,
						class: "st__muted"
					}, "Loading…")) : ledgerError.value ? (openBlock(), createBlock("p", {
						key: 1,
						class: "st__out"
					}, toDisplayString(ledgerError.value), 1)) : !ledger.value.length ? (openBlock(), createBlock("p", {
						key: 2,
						class: "st__muted"
					}, "No movements recorded for this ingredient.")) : (openBlock(), createBlock("table", {
						key: 3,
						class: "st__feed-table"
					}, [createVNode("thead", null, [createVNode("tr", null, [
						createVNode("th", null, "When"),
						createVNode("th", null, "Type"),
						createVNode("th", { class: "st__right" }, "Change"),
						createVNode("th", { class: "st__right" }, "Unit Cost"),
						createVNode("th", { class: "st__right" }, "Balance"),
						createVNode("th", { class: "st__right" }, "Value"),
						createVNode("th", null, "Reference")
					])]), createVNode("tbody", null, [(openBlock(true), createBlock(Fragment, null, renderList(ledger.value, (m) => {
						return openBlock(), createBlock("tr", { key: m.id }, [
							createVNode("td", { class: "st__muted st__nowrap" }, toDisplayString(fmtDateTime(m.created_at)), 1),
							createVNode("td", null, [createVNode("span", { class: ["ui-badge", typeBadge(m.type)] }, toDisplayString(typeLabel(m.type)), 3)]),
							createVNode("td", { class: ["st__right", m.quantity < 0 ? "st__out" : "st__in"] }, toDisplayString(m.quantity > 0 ? "+" : "") + toDisplayString(qty(m.quantity)), 3),
							createVNode("td", { class: "st__right st__muted" }, toDisplayString(fmt(m.unit_cost)), 1),
							createVNode("td", { class: "st__right" }, toDisplayString(qty(m.balance_after)), 1),
							createVNode("td", { class: "st__right st__muted" }, toDisplayString(fmt(m.value)), 1),
							createVNode("td", { class: "st__muted" }, toDisplayString(m.reference || m.note || "—"), 1)
						]);
					}), 128))])]))];
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
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/pages/Inventory/Stock.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var Stock_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-d48bcf9c"]]);
//#endregion
export { Stock_default as default };
