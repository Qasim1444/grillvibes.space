import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-BOaGB7Aw.js";
import { n as usePermissions, t as AdminLayout_default } from "./AdminLayout-DSJnk4YL.js";
import { t as _sfc_main$1 } from "./PageHeader-D0aRDn5C.js";
import { t as DataTable_default } from "./DataTable-BHCUCuvd.js";
import { t as Pagination_default } from "./Pagination-h4WEvndd.js";
import { t as Modal_default } from "./Modal-DhESI6xO.js";
import { Fragment, computed, createBlock, createCommentVNode, createTextVNode, createVNode, mergeProps, onMounted, openBlock, ref, renderList, toDisplayString, unref, useSSRContext, vModelSelect, vModelText, watch, withCtx, withDirectives } from "vue";
import { router, useForm } from "@inertiajs/vue3";
import { ssrIncludeBooleanAttr, ssrInterpolate, ssrLooseContain, ssrLooseEqual, ssrRenderAttr, ssrRenderAttrs, ssrRenderClass, ssrRenderComponent, ssrRenderList, ssrRenderStyle } from "vue/server-renderer";
//#region resources/js/pages/Inventory/Recipes.vue
var _sfc_main = /*@__PURE__*/ Object.assign({ layout: AdminLayout_default }, {
	__name: "Recipes",
	__ssrInlineRender: true,
	props: {
		items: {
			type: Object,
			default: () => ({ data: [] })
		},
		categories: {
			type: Array,
			default: () => []
		},
		ingredients: {
			type: Array,
			default: () => []
		},
		summary: {
			type: Object,
			default: () => ({
				total_dishes: 0,
				costed: 0,
				uncosted: 0,
				avg_food_cost: null,
				over_target: 0
			})
		},
		filters: {
			type: Object,
			default: () => ({})
		},
		openFoodItem: {
			type: Number,
			default: null
		}
	},
	setup(__props) {
		const { can } = usePermissions();
		const props = __props;
		const columns = [
			{
				key: "name",
				label: "Dish"
			},
			{
				key: "price",
				label: "Price"
			},
			{
				key: "dish_cost",
				label: "Cost"
			},
			{
				key: "food_cost_percent",
				label: "Food Cost"
			},
			{
				key: "margin",
				label: "Margin"
			},
			{
				key: "portions_available",
				label: "Portions"
			}
		];
		const tabs = [
			{
				value: "",
				label: "All"
			},
			{
				value: "costed",
				label: "With Recipe"
			},
			{
				value: "uncosted",
				label: "Missing Recipe"
			}
		];
		const items = computed(() => props.items?.data ?? []);
		const editable = computed(() => can("inventory.recipes.update"));
		const search = ref(props.filters?.search ?? "");
		const categoryFilter = ref(props.filters?.category ?? "");
		const viewFilter = ref(props.filters?.view ?? "");
		let timer = null;
		const reload = () => router.get("/inventory/recipes", {
			search: search.value || void 0,
			category: categoryFilter.value || void 0,
			view: viewFilter.value || void 0
		}, {
			preserveState: true,
			preserveScroll: true,
			replace: true,
			only: [
				"items",
				"summary",
				"filters"
			]
		});
		watch([
			search,
			categoryFilter,
			viewFilter
		], () => {
			clearTimeout(timer);
			timer = setTimeout(reload, 300);
		});
		const showBuilder = ref(false);
		const dish = ref(null);
		const form = useForm({ lines: [] });
		const builderTitle = computed(() => dish.value ? `Recipe — ${dish.value.name}` : "Recipe");
		const openBuilder = (row) => {
			dish.value = row;
			form.clearErrors();
			form.lines = (row.lines ?? []).map((l) => ({
				ingredient_id: l.ingredient_id,
				quantity: l.quantity,
				note: l.note ?? ""
			}));
			showBuilder.value = true;
		};
		const addLine = () => form.lines.push({
			ingredient_id: "",
			quantity: null,
			note: ""
		});
		const removeLine = (i) => form.lines.splice(i, 1);
		const save = () => {
			const lines = form.lines.filter((l) => l.ingredient_id && Number(l.quantity) > 0).map((l) => ({
				ingredient_id: l.ingredient_id,
				quantity: l.quantity,
				note: l.note || null
			}));
			if (!lines.length && !confirm("No ingredients listed. Save an empty recipe? The dish will stop being costed.")) return;
			form.transform(() => ({ lines })).put(`/inventory/recipes/${dish.value.id}`, {
				preserveScroll: true,
				onSuccess: () => showBuilder.value = false
			});
		};
		const ingredientMap = computed(() => {
			const map = {};
			props.ingredients.forEach((i) => {
				map[i.id] = i;
			});
			return map;
		});
		const unitOf = (id) => ingredientMap.value[id]?.unit ?? "";
		const costOf = (id) => Number(ingredientMap.value[id]?.average_cost ?? 0);
		const lineCost = (line) => round4(Number(line.quantity || 0) * costOf(line.ingredient_id));
		const liveCost = computed(() => round4(form.lines.reduce((sum, l) => sum + lineCost(l), 0)));
		const livePercent = computed(() => {
			const price = Number(dish.value?.price ?? 0);
			return price > 0 ? Math.round(liveCost.value / price * 1e4) / 100 : null;
		});
		const liveMargin = computed(() => round2(Number(dish.value?.price ?? 0) - liveCost.value));
		const livePctClass = computed(() => {
			const pct = livePercent.value;
			if (pct === null) return "";
			return pct > 40 ? "rc__neg" : pct > 35 ? "rc__low" : "rc__pos";
		});
		const isDuplicate = (line, index) => !!line.ingredient_id && form.lines.some((other, i) => i < index && other.ingredient_id === line.ingredient_id);
		const hasDuplicates = computed(() => form.lines.some((l, i) => isDuplicate(l, i)));
		const missingDeepLink = ref(false);
		onMounted(() => {
			if (!props.openFoodItem) return;
			const row = items.value.find((r) => r.id === props.openFoodItem);
			if (row) openBuilder(row);
			else missingDeepLink.value = true;
		});
		const round2 = (v) => Math.round(v * 100) / 100;
		const round4 = (v) => Math.round(v * 1e4) / 1e4;
		const fmt = (v) => "Rs " + Number(v || 0).toLocaleString("en-PK", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		});
		const pctBadge = (pct) => pct > 40 ? "ui-badge--danger" : pct > 35 ? "ui-badge--warning" : "ui-badge--success";
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "page" }, _attrs))} data-v-33641386>`);
			_push(ssrRenderComponent(_sfc_main$1, {
				title: "Recipes & Dish Cost",
				subtitle: "What each dish is made of, and what that costs at this outlet's current ingredient prices. Cost is never stored — it is worked out from the recipe every time this page loads, so it moves on its own as suppliers move."
			}, null, _parent));
			_push(`<div class="rc__kpis" data-v-33641386><div class="rc__kpi rc__kpi--info" data-v-33641386><span class="rc__kpi-label" data-v-33641386>Menu</span><span class="rc__kpi-val" data-v-33641386>${ssrInterpolate(props.summary.total_dishes)}</span><span class="rc__kpi-sub" data-v-33641386>${ssrInterpolate(props.summary.costed)} with a recipe</span></div><div class="${ssrRenderClass([props.summary.uncosted > 0 ? "rc__kpi--warn" : "rc__kpi--ok", "rc__kpi"])}" data-v-33641386><span class="rc__kpi-label" data-v-33641386>Uncosted</span><span class="rc__kpi-val" data-v-33641386>${ssrInterpolate(props.summary.uncosted)}</span><span class="rc__kpi-sub" data-v-33641386>no recipe, so no COGS</span></div><div class="rc__kpi rc__kpi--ok" data-v-33641386><span class="rc__kpi-label" data-v-33641386>Avg. Food Cost</span><span class="rc__kpi-val" data-v-33641386>${ssrInterpolate(props.summary.avg_food_cost === null ? "—" : props.summary.avg_food_cost + "%")}</span><span class="rc__kpi-sub" data-v-33641386>across costed dishes</span></div><div class="${ssrRenderClass([props.summary.over_target > 0 ? "rc__kpi--danger" : "rc__kpi--ok", "rc__kpi"])}" data-v-33641386><span class="rc__kpi-label" data-v-33641386>Over 40%</span><span class="rc__kpi-val" data-v-33641386>${ssrInterpolate(props.summary.over_target)}</span><span class="rc__kpi-sub" data-v-33641386>where margin leaks</span></div></div>`);
			if (missingDeepLink.value) _push(`<p class="rc__notice" data-v-33641386> That dish isn&#39;t on this page — search for it by name to open its recipe. </p>`);
			else _push(`<!---->`);
			_push(`<div class="rc__filters" data-v-33641386><input${ssrRenderAttr("value", search.value)} class="ui-input rc__search" placeholder="Search dish / code…" data-v-33641386><select class="ui-input" style="${ssrRenderStyle({ "width": "200px" })}" data-v-33641386><option value="" data-v-33641386${ssrIncludeBooleanAttr(Array.isArray(categoryFilter.value) ? ssrLooseContain(categoryFilter.value, "") : ssrLooseEqual(categoryFilter.value, "")) ? " selected" : ""}>All Categories</option><!--[-->`);
			ssrRenderList(props.categories, (c) => {
				_push(`<option${ssrRenderAttr("value", c.id)} data-v-33641386${ssrIncludeBooleanAttr(Array.isArray(categoryFilter.value) ? ssrLooseContain(categoryFilter.value, c.id) : ssrLooseEqual(categoryFilter.value, c.id)) ? " selected" : ""}>${ssrInterpolate(c.name)}</option>`);
			});
			_push(`<!--]--></select><div class="rc__tabs" data-v-33641386><!--[-->`);
			ssrRenderList(tabs, (tab) => {
				_push(`<button class="${ssrRenderClass([{ "rc__tab--on": viewFilter.value === tab.value }, "rc__tab"])}" data-v-33641386>${ssrInterpolate(tab.label)}</button>`);
			});
			_push(`<!--]--></div></div>`);
			_push(ssrRenderComponent(DataTable_default, {
				columns,
				rows: items.value,
				"empty-text": "No dishes match. Food items are created under the menu — recipes are attached to them here."
			}, {
				"cell:name": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<strong data-v-33641386${_scopeId}>${ssrInterpolate(row.name)}</strong>`);
						if (row.code) _push(`<span class="rc__muted rc__code" data-v-33641386${_scopeId}>${ssrInterpolate(row.code)}</span>`);
						else _push(`<!---->`);
						_push(`<span class="rc__cat" data-v-33641386${_scopeId}>${ssrInterpolate(row.category_name || "Uncategorised")}</span>`);
					} else return [
						createVNode("strong", null, toDisplayString(row.name), 1),
						row.code ? (openBlock(), createBlock("span", {
							key: 0,
							class: "rc__muted rc__code"
						}, toDisplayString(row.code), 1)) : createCommentVNode("", true),
						createVNode("span", { class: "rc__cat" }, toDisplayString(row.category_name || "Uncategorised"), 1)
					];
				}),
				"cell:price": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) _push(`${ssrInterpolate(fmt(value))}`);
					else return [createTextVNode(toDisplayString(fmt(value)), 1)];
				}),
				"cell:dish_cost": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						if (row.line_count === 0) _push(`<span class="ui-badge ui-badge--muted" data-v-33641386${_scopeId}>No recipe</span>`);
						else _push(`<!--[-->${ssrInterpolate(fmt(row.dish_cost))} <span class="rc__muted rc__lines" data-v-33641386${_scopeId}>${ssrInterpolate(row.line_count)} ingredient(s)</span><!--]-->`);
					} else return [row.line_count === 0 ? (openBlock(), createBlock("span", {
						key: 0,
						class: "ui-badge ui-badge--muted"
					}, "No recipe")) : (openBlock(), createBlock(Fragment, { key: 1 }, [createTextVNode(toDisplayString(fmt(row.dish_cost)) + " ", 1), createVNode("span", { class: "rc__muted rc__lines" }, toDisplayString(row.line_count) + " ingredient(s)", 1)], 64))];
				}),
				"cell:food_cost_percent": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						if (row.food_cost_percent === null) _push(`<span class="rc__muted" data-v-33641386${_scopeId}>—</span>`);
						else _push(`<span class="${ssrRenderClass([pctBadge(row.food_cost_percent), "ui-badge"])}" data-v-33641386${_scopeId}>${ssrInterpolate(row.food_cost_percent)}%</span>`);
					} else return [row.food_cost_percent === null ? (openBlock(), createBlock("span", {
						key: 0,
						class: "rc__muted"
					}, "—")) : (openBlock(), createBlock("span", {
						key: 1,
						class: ["ui-badge", pctBadge(row.food_cost_percent)]
					}, toDisplayString(row.food_cost_percent) + "%", 3))];
				}),
				"cell:margin": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						if (row.margin === null) _push(`<span class="rc__muted" data-v-33641386${_scopeId}>—</span>`);
						else _push(`<span class="${ssrRenderClass(row.margin < 0 ? "rc__neg" : "")}" data-v-33641386${_scopeId}>${ssrInterpolate(fmt(row.margin))}</span>`);
					} else return [row.margin === null ? (openBlock(), createBlock("span", {
						key: 0,
						class: "rc__muted"
					}, "—")) : (openBlock(), createBlock("span", {
						key: 1,
						class: row.margin < 0 ? "rc__neg" : ""
					}, toDisplayString(fmt(row.margin)), 3))];
				}),
				"cell:portions_available": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						if (row.portions_available === null) _push(`<span class="rc__muted" data-v-33641386${_scopeId}>—</span>`);
						else _push(`<span class="${ssrRenderClass(row.portions_available === 0 ? "rc__neg" : row.portions_available < 10 ? "rc__low" : "")}" data-v-33641386${_scopeId}>${ssrInterpolate(row.portions_available)}</span>`);
					} else return [row.portions_available === null ? (openBlock(), createBlock("span", {
						key: 0,
						class: "rc__muted"
					}, "—")) : (openBlock(), createBlock("span", {
						key: 1,
						class: row.portions_available === 0 ? "rc__neg" : row.portions_available < 10 ? "rc__low" : ""
					}, toDisplayString(row.portions_available), 3))];
				}),
				actions: withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) _push(`<button class="ui-btn ui-btn--ghost ui-btn--sm" data-v-33641386${_scopeId}>${ssrInterpolate(unref(can)("inventory.recipes.update") ? row.line_count ? "Edit Recipe" : "Add Recipe" : "View Recipe")}</button>`);
					else return [createVNode("button", {
						class: "ui-btn ui-btn--ghost ui-btn--sm",
						onClick: ($event) => openBuilder(row)
					}, toDisplayString(unref(can)("inventory.recipes.update") ? row.line_count ? "Edit Recipe" : "Add Recipe" : "View Recipe"), 9, ["onClick"])];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(Pagination_default, {
				paginator: props.items,
				only: ["items", "summary"]
			}, null, _parent));
			_push(ssrRenderComponent(Modal_default, {
				modelValue: showBuilder.value,
				"onUpdate:modelValue": ($event) => showBuilder.value = $event,
				title: builderTitle.value,
				width: "880px"
			}, {
				footer: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<button class="ui-btn ui-btn--ghost" data-v-33641386${_scopeId}>${ssrInterpolate(editable.value ? "Cancel" : "Close")}</button>`);
						if (editable.value) _push(`<button class="ui-btn ui-btn--primary"${ssrIncludeBooleanAttr(unref(form).processing || hasDuplicates.value) ? " disabled" : ""} data-v-33641386${_scopeId}> Save Recipe </button>`);
						else _push(`<!---->`);
					} else return [createVNode("button", {
						class: "ui-btn ui-btn--ghost",
						onClick: ($event) => showBuilder.value = false
					}, toDisplayString(editable.value ? "Cancel" : "Close"), 9, ["onClick"]), editable.value ? (openBlock(), createBlock("button", {
						key: 0,
						class: "ui-btn ui-btn--primary",
						disabled: unref(form).processing || hasDuplicates.value,
						onClick: save
					}, " Save Recipe ", 8, ["disabled"])) : createCommentVNode("", true)];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						if (dish.value) {
							_push(`<div class="rc__build" data-v-33641386${_scopeId}><div class="rc__live" data-v-33641386${_scopeId}><div class="rc__live-cell" data-v-33641386${_scopeId}><span class="rc__live-label" data-v-33641386${_scopeId}>Selling Price</span><span class="rc__live-val" data-v-33641386${_scopeId}>${ssrInterpolate(fmt(dish.value.price))}</span></div><div class="rc__live-cell" data-v-33641386${_scopeId}><span class="rc__live-label" data-v-33641386${_scopeId}>Dish Cost</span><span class="rc__live-val" data-v-33641386${_scopeId}>${ssrInterpolate(fmt(liveCost.value))}</span></div><div class="rc__live-cell" data-v-33641386${_scopeId}><span class="rc__live-label" data-v-33641386${_scopeId}>Food Cost</span><span class="${ssrRenderClass([livePctClass.value, "rc__live-val"])}" data-v-33641386${_scopeId}>${ssrInterpolate(livePercent.value === null ? "—" : livePercent.value + "%")}</span></div><div class="rc__live-cell" data-v-33641386${_scopeId}><span class="rc__live-label" data-v-33641386${_scopeId}>Margin</span><span class="${ssrRenderClass([liveMargin.value < 0 ? "rc__neg" : "rc__pos", "rc__live-val"])}" data-v-33641386${_scopeId}>${ssrInterpolate(fmt(liveMargin.value))}</span></div></div><p class="rc__hint" data-v-33641386${_scopeId}> Quantities are per portion, in each ingredient&#39;s own unit. Unit costs are this outlet&#39;s moving average — an ingredient with no delivery booked yet costs nothing, which will understate the dish until it is received. </p><table class="rc__table" data-v-33641386${_scopeId}><thead data-v-33641386${_scopeId}><tr data-v-33641386${_scopeId}><th style="${ssrRenderStyle({ "width": "34%" })}" data-v-33641386${_scopeId}>Ingredient</th><th style="${ssrRenderStyle({ "width": "16%" })}" data-v-33641386${_scopeId}>Qty / Portion</th><th style="${ssrRenderStyle({ "width": "14%" })}" class="rc__right" data-v-33641386${_scopeId}>Unit Cost</th><th style="${ssrRenderStyle({ "width": "14%" })}" class="rc__right" data-v-33641386${_scopeId}>Line Cost</th><th data-v-33641386${_scopeId}>Note</th><th style="${ssrRenderStyle({ "width": "40px" })}" data-v-33641386${_scopeId}></th></tr></thead><tbody data-v-33641386${_scopeId}>`);
							if (!unref(form).lines.length) _push(`<tr data-v-33641386${_scopeId}><td colspan="6" class="rc__muted rc__empty" data-v-33641386${_scopeId}> No ingredients yet. Add the first line to start costing this dish. </td></tr>`);
							else _push(`<!---->`);
							_push(`<!--[-->`);
							ssrRenderList(unref(form).lines, (line, i) => {
								_push(`<tr data-v-33641386${_scopeId}><td data-v-33641386${_scopeId}><select class="ui-input"${ssrIncludeBooleanAttr(!editable.value) ? " disabled" : ""} data-v-33641386${_scopeId}><option value="" data-v-33641386${ssrIncludeBooleanAttr(Array.isArray(line.ingredient_id) ? ssrLooseContain(line.ingredient_id, "") : ssrLooseEqual(line.ingredient_id, "")) ? " selected" : ""}${_scopeId}>Select…</option><!--[-->`);
								ssrRenderList(props.ingredients, (ing) => {
									_push(`<option${ssrRenderAttr("value", ing.id)} data-v-33641386${ssrIncludeBooleanAttr(Array.isArray(line.ingredient_id) ? ssrLooseContain(line.ingredient_id, ing.id) : ssrLooseEqual(line.ingredient_id, ing.id)) ? " selected" : ""}${_scopeId}>${ssrInterpolate(ing.name)}</option>`);
								});
								_push(`<!--]--></select>`);
								if (isDuplicate(line, i)) _push(`<span class="rc__err" data-v-33641386${_scopeId}>Already listed above</span>`);
								else _push(`<!---->`);
								_push(`</td><td data-v-33641386${_scopeId}><div class="rc__qty" data-v-33641386${_scopeId}><input${ssrRenderAttr("value", line.quantity)} type="number" step="0.0001" min="0" class="ui-input"${ssrIncludeBooleanAttr(!editable.value) ? " disabled" : ""} data-v-33641386${_scopeId}><span class="rc__unit" data-v-33641386${_scopeId}>${ssrInterpolate(unitOf(line.ingredient_id))}</span></div></td><td class="rc__right rc__muted" data-v-33641386${_scopeId}>${ssrInterpolate(fmt(costOf(line.ingredient_id)))}</td><td class="rc__right" data-v-33641386${_scopeId}><strong data-v-33641386${_scopeId}>${ssrInterpolate(fmt(lineCost(line)))}</strong></td><td data-v-33641386${_scopeId}><input${ssrRenderAttr("value", line.note)} class="ui-input" placeholder="e.g. diced"${ssrIncludeBooleanAttr(!editable.value) ? " disabled" : ""} data-v-33641386${_scopeId}></td><td data-v-33641386${_scopeId}>`);
								if (editable.value) _push(`<button class="ui-btn ui-btn--danger ui-btn--sm" title="Remove line" data-v-33641386${_scopeId}>×</button>`);
								else _push(`<!---->`);
								_push(`</td></tr>`);
							});
							_push(`<!--]--></tbody>`);
							if (unref(form).lines.length) _push(`<tfoot data-v-33641386${_scopeId}><tr data-v-33641386${_scopeId}><td colspan="3" class="rc__right" data-v-33641386${_scopeId}><strong data-v-33641386${_scopeId}>Total</strong></td><td class="rc__right" data-v-33641386${_scopeId}><strong data-v-33641386${_scopeId}>${ssrInterpolate(fmt(liveCost.value))}</strong></td><td colspan="2" data-v-33641386${_scopeId}></td></tr></tfoot>`);
							else _push(`<!---->`);
							_push(`</table>`);
							if (unref(form).errors.lines) _push(`<p class="rc__err" data-v-33641386${_scopeId}>${ssrInterpolate(unref(form).errors.lines)}</p>`);
							else _push(`<!---->`);
							if (editable.value) _push(`<button class="ui-btn ui-btn--secondary ui-btn--sm rc__add" data-v-33641386${_scopeId}>+ Add Ingredient</button>`);
							else _push(`<!---->`);
							if (dish.value.portions_available !== null) _push(`<p class="rc__stockline" data-v-33641386${_scopeId}> Current stock can make <strong data-v-33641386${_scopeId}>${ssrInterpolate(dish.value.portions_available)}</strong> portion(s) of this dish as saved. </p>`);
							else _push(`<!---->`);
							_push(`</div>`);
						} else _push(`<!---->`);
					} else return [dish.value ? (openBlock(), createBlock("div", {
						key: 0,
						class: "rc__build"
					}, [
						createVNode("div", { class: "rc__live" }, [
							createVNode("div", { class: "rc__live-cell" }, [createVNode("span", { class: "rc__live-label" }, "Selling Price"), createVNode("span", { class: "rc__live-val" }, toDisplayString(fmt(dish.value.price)), 1)]),
							createVNode("div", { class: "rc__live-cell" }, [createVNode("span", { class: "rc__live-label" }, "Dish Cost"), createVNode("span", { class: "rc__live-val" }, toDisplayString(fmt(liveCost.value)), 1)]),
							createVNode("div", { class: "rc__live-cell" }, [createVNode("span", { class: "rc__live-label" }, "Food Cost"), createVNode("span", { class: ["rc__live-val", livePctClass.value] }, toDisplayString(livePercent.value === null ? "—" : livePercent.value + "%"), 3)]),
							createVNode("div", { class: "rc__live-cell" }, [createVNode("span", { class: "rc__live-label" }, "Margin"), createVNode("span", { class: ["rc__live-val", liveMargin.value < 0 ? "rc__neg" : "rc__pos"] }, toDisplayString(fmt(liveMargin.value)), 3)])
						]),
						createVNode("p", { class: "rc__hint" }, " Quantities are per portion, in each ingredient's own unit. Unit costs are this outlet's moving average — an ingredient with no delivery booked yet costs nothing, which will understate the dish until it is received. "),
						createVNode("table", { class: "rc__table" }, [
							createVNode("thead", null, [createVNode("tr", null, [
								createVNode("th", { style: { "width": "34%" } }, "Ingredient"),
								createVNode("th", { style: { "width": "16%" } }, "Qty / Portion"),
								createVNode("th", {
									style: { "width": "14%" },
									class: "rc__right"
								}, "Unit Cost"),
								createVNode("th", {
									style: { "width": "14%" },
									class: "rc__right"
								}, "Line Cost"),
								createVNode("th", null, "Note"),
								createVNode("th", { style: { "width": "40px" } })
							])]),
							createVNode("tbody", null, [!unref(form).lines.length ? (openBlock(), createBlock("tr", { key: 0 }, [createVNode("td", {
								colspan: "6",
								class: "rc__muted rc__empty"
							}, " No ingredients yet. Add the first line to start costing this dish. ")])) : createCommentVNode("", true), (openBlock(true), createBlock(Fragment, null, renderList(unref(form).lines, (line, i) => {
								return openBlock(), createBlock("tr", { key: i }, [
									createVNode("td", null, [withDirectives(createVNode("select", {
										"onUpdate:modelValue": ($event) => line.ingredient_id = $event,
										class: "ui-input",
										disabled: !editable.value
									}, [createVNode("option", { value: "" }, "Select…"), (openBlock(true), createBlock(Fragment, null, renderList(props.ingredients, (ing) => {
										return openBlock(), createBlock("option", {
											key: ing.id,
											value: ing.id
										}, toDisplayString(ing.name), 9, ["value"]);
									}), 128))], 8, ["onUpdate:modelValue", "disabled"]), [[vModelSelect, line.ingredient_id]]), isDuplicate(line, i) ? (openBlock(), createBlock("span", {
										key: 0,
										class: "rc__err"
									}, "Already listed above")) : createCommentVNode("", true)]),
									createVNode("td", null, [createVNode("div", { class: "rc__qty" }, [withDirectives(createVNode("input", {
										"onUpdate:modelValue": ($event) => line.quantity = $event,
										type: "number",
										step: "0.0001",
										min: "0",
										class: "ui-input",
										disabled: !editable.value
									}, null, 8, ["onUpdate:modelValue", "disabled"]), [[
										vModelText,
										line.quantity,
										void 0,
										{ number: true }
									]]), createVNode("span", { class: "rc__unit" }, toDisplayString(unitOf(line.ingredient_id)), 1)])]),
									createVNode("td", { class: "rc__right rc__muted" }, toDisplayString(fmt(costOf(line.ingredient_id))), 1),
									createVNode("td", { class: "rc__right" }, [createVNode("strong", null, toDisplayString(fmt(lineCost(line))), 1)]),
									createVNode("td", null, [withDirectives(createVNode("input", {
										"onUpdate:modelValue": ($event) => line.note = $event,
										class: "ui-input",
										placeholder: "e.g. diced",
										disabled: !editable.value
									}, null, 8, ["onUpdate:modelValue", "disabled"]), [[vModelText, line.note]])]),
									createVNode("td", null, [editable.value ? (openBlock(), createBlock("button", {
										key: 0,
										class: "ui-btn ui-btn--danger ui-btn--sm",
										title: "Remove line",
										onClick: ($event) => removeLine(i)
									}, "×", 8, ["onClick"])) : createCommentVNode("", true)])
								]);
							}), 128))]),
							unref(form).lines.length ? (openBlock(), createBlock("tfoot", { key: 0 }, [createVNode("tr", null, [
								createVNode("td", {
									colspan: "3",
									class: "rc__right"
								}, [createVNode("strong", null, "Total")]),
								createVNode("td", { class: "rc__right" }, [createVNode("strong", null, toDisplayString(fmt(liveCost.value)), 1)]),
								createVNode("td", { colspan: "2" })
							])])) : createCommentVNode("", true)
						]),
						unref(form).errors.lines ? (openBlock(), createBlock("p", {
							key: 0,
							class: "rc__err"
						}, toDisplayString(unref(form).errors.lines), 1)) : createCommentVNode("", true),
						editable.value ? (openBlock(), createBlock("button", {
							key: 1,
							class: "ui-btn ui-btn--secondary ui-btn--sm rc__add",
							onClick: addLine
						}, "+ Add Ingredient")) : createCommentVNode("", true),
						dish.value.portions_available !== null ? (openBlock(), createBlock("p", {
							key: 2,
							class: "rc__stockline"
						}, [
							createTextVNode(" Current stock can make "),
							createVNode("strong", null, toDisplayString(dish.value.portions_available), 1),
							createTextVNode(" portion(s) of this dish as saved. ")
						])) : createCommentVNode("", true)
					])) : createCommentVNode("", true)];
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
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/pages/Inventory/Recipes.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var Recipes_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-33641386"]]);
//#endregion
export { Recipes_default as default };
