import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-BOaGB7Aw.js";
import { n as usePermissions, t as AdminLayout_default } from "./AdminLayout-Bp8G38ms.js";
import { t as _sfc_main$1 } from "./PageHeader-D0aRDn5C.js";
import { t as DataTable_default } from "./DataTable-BHCUCuvd.js";
import { Fragment, createBlock, createCommentVNode, createTextVNode, createVNode, mergeProps, openBlock, ref, toDisplayString, unref, useSSRContext, watch, withCtx } from "vue";
import { Link, router } from "@inertiajs/vue3";
import { ssrIncludeBooleanAttr, ssrInterpolate, ssrLooseContain, ssrLooseEqual, ssrRenderAttr, ssrRenderAttrs, ssrRenderClass, ssrRenderComponent, ssrRenderList } from "vue/server-renderer";
//#region resources/js/pages/Reports/FoodCost.vue
var _sfc_main = /*@__PURE__*/ Object.assign({ layout: AdminLayout_default }, {
	__name: "FoodCost",
	__ssrInlineRender: true,
	props: {
		dishes: {
			type: Array,
			default: () => []
		},
		totals: {
			type: Object,
			default: () => ({
				dishes: 0,
				costed: 0,
				over_target: 0,
				sold: 0,
				units_sold: 0,
				revenue: 0,
				cogs: 0,
				gross_profit: 0,
				gross_margin_percent: null,
				understating: 0
			})
		},
		orders: {
			type: Object,
			default: () => ({
				orders: 0,
				revenue: 0,
				cogs: 0,
				gross_profit: 0,
				gross_margin_percent: null,
				food_cost_percent: null,
				uncosted_orders: 0,
				costed_orders: 0
			})
		},
		categories: {
			type: Array,
			default: () => []
		},
		branchName: {
			type: String,
			default: ""
		},
		target: {
			type: Number,
			default: 35
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
				label: "Dish"
			},
			{
				key: "price",
				label: "Price"
			},
			{
				key: "dish_cost",
				label: "Cost Today"
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
				key: "units_sold",
				label: "Sold"
			},
			{
				key: "revenue",
				label: "Revenue"
			},
			{
				key: "cogs",
				label: "COGS"
			},
			{
				key: "gross_profit",
				label: "Gross Profit"
			}
		];
		const from = ref(props.filters?.from ?? "");
		const to = ref(props.filters?.to ?? "");
		const categoryFilter = ref(props.filters?.category ?? "");
		const sort = ref(props.filters?.sort ?? "revenue");
		let timer = null;
		const reload = () => router.get("/reports/food-cost", {
			from: from.value || void 0,
			to: to.value || void 0,
			category: categoryFilter.value || void 0,
			sort: sort.value || void 0
		}, {
			preserveState: true,
			preserveScroll: true,
			replace: true,
			only: [
				"dishes",
				"totals",
				"orders",
				"filters"
			]
		});
		watch([
			from,
			to,
			categoryFilter,
			sort
		], () => {
			clearTimeout(timer);
			timer = setTimeout(reload, 300);
		});
		const fmt = (v) => "Rs " + Number(v || 0).toLocaleString("en-PK", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		});
		const qty = (v) => Number(v || 0).toLocaleString("en-PK", { maximumFractionDigits: 2 });
		const pct = (v) => v === null || v === void 0 ? "—" : v + "%";
		const fmtDate = (v) => v ? (/* @__PURE__ */ new Date(v + "T00:00:00")).toLocaleDateString("en-PK", {
			day: "2-digit",
			month: "short",
			year: "numeric"
		}) : "—";
		const pctBadge = (p) => p > props.target + 5 ? "ui-badge--danger" : p > props.target ? "ui-badge--warning" : "ui-badge--success";
		const foodCostClass = (p) => {
			if (p === null || p === void 0) return "fc__kpi--muted";
			return p > props.target + 5 ? "fc__kpi--danger" : p > props.target ? "fc__kpi--warn" : "fc__kpi--ok";
		};
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "page" }, _attrs))} data-v-7abfb395>`);
			_push(ssrRenderComponent(_sfc_main$1, {
				title: "Food Cost & Margin",
				subtitle: `Two clocks, side by side. Each dish is priced at ${props.branchName || "this outlet"}'s ingredient costs today; the COGS below it is what the food actually cost when it was sold, snapshotted onto each order at the time. They differ when supplier prices have moved — that is the point, not an error.`
			}, null, _parent));
			_push(`<div class="fc__filters" data-v-7abfb395><label class="fc__field" data-v-7abfb395><span class="fc__field-label" data-v-7abfb395>From</span><input${ssrRenderAttr("value", from.value)} type="date" class="ui-input" data-v-7abfb395></label><label class="fc__field" data-v-7abfb395><span class="fc__field-label" data-v-7abfb395>To</span><input${ssrRenderAttr("value", to.value)} type="date" class="ui-input" data-v-7abfb395></label><label class="fc__field" data-v-7abfb395><span class="fc__field-label" data-v-7abfb395>Category</span><select class="ui-input" data-v-7abfb395><option value="" data-v-7abfb395${ssrIncludeBooleanAttr(Array.isArray(categoryFilter.value) ? ssrLooseContain(categoryFilter.value, "") : ssrLooseEqual(categoryFilter.value, "")) ? " selected" : ""}>All Categories</option><!--[-->`);
			ssrRenderList(props.categories, (c) => {
				_push(`<option${ssrRenderAttr("value", c.id)} data-v-7abfb395${ssrIncludeBooleanAttr(Array.isArray(categoryFilter.value) ? ssrLooseContain(categoryFilter.value, c.id) : ssrLooseEqual(categoryFilter.value, c.id)) ? " selected" : ""}>${ssrInterpolate(c.name)}</option>`);
			});
			_push(`<!--]--></select></label><label class="fc__field" data-v-7abfb395><span class="fc__field-label" data-v-7abfb395>Sort</span><select class="ui-input" data-v-7abfb395><option value="revenue" data-v-7abfb395${ssrIncludeBooleanAttr(Array.isArray(sort.value) ? ssrLooseContain(sort.value, "revenue") : ssrLooseEqual(sort.value, "revenue")) ? " selected" : ""}>Highest Revenue</option><option value="food_cost" data-v-7abfb395${ssrIncludeBooleanAttr(Array.isArray(sort.value) ? ssrLooseContain(sort.value, "food_cost") : ssrLooseEqual(sort.value, "food_cost")) ? " selected" : ""}>Worst Food Cost</option><option value="margin" data-v-7abfb395${ssrIncludeBooleanAttr(Array.isArray(sort.value) ? ssrLooseContain(sort.value, "margin") : ssrLooseEqual(sort.value, "margin")) ? " selected" : ""}>Thinnest Margin</option><option value="units" data-v-7abfb395${ssrIncludeBooleanAttr(Array.isArray(sort.value) ? ssrLooseContain(sort.value, "units") : ssrLooseEqual(sort.value, "units")) ? " selected" : ""}>Most Sold</option><option value="name" data-v-7abfb395${ssrIncludeBooleanAttr(Array.isArray(sort.value) ? ssrLooseContain(sort.value, "name") : ssrLooseEqual(sort.value, "name")) ? " selected" : ""}>Name</option></select></label><div class="fc__presets" data-v-7abfb395><button class="ui-btn ui-btn--ghost ui-btn--sm" data-v-7abfb395>This Month</button><button class="ui-btn ui-btn--ghost ui-btn--sm" data-v-7abfb395>Last Month</button><button class="ui-btn ui-btn--ghost ui-btn--sm" data-v-7abfb395>Last 7 Days</button></div></div><div class="fc__kpis" data-v-7abfb395><div class="fc__kpi fc__kpi--info" data-v-7abfb395><span class="fc__kpi-label" data-v-7abfb395>Revenue</span><span class="fc__kpi-val" data-v-7abfb395>${ssrInterpolate(fmt(props.orders.revenue))}</span><span class="fc__kpi-sub" data-v-7abfb395>${ssrInterpolate(props.orders.orders)} order(s)</span></div><div class="fc__kpi fc__kpi--warn" data-v-7abfb395><span class="fc__kpi-label" data-v-7abfb395>Food Cost (COGS)</span><span class="fc__kpi-val" data-v-7abfb395>${ssrInterpolate(fmt(props.orders.cogs))}</span><span class="fc__kpi-sub" data-v-7abfb395>at the prices paid then</span></div><div class="${ssrRenderClass([foodCostClass(props.orders.food_cost_percent), "fc__kpi"])}" data-v-7abfb395><span class="fc__kpi-label" data-v-7abfb395>Food Cost %</span><span class="fc__kpi-val" data-v-7abfb395>${ssrInterpolate(pct(props.orders.food_cost_percent))}</span><span class="fc__kpi-sub" data-v-7abfb395>target under ${ssrInterpolate(props.target)}%</span></div><div class="fc__kpi fc__kpi--ok" data-v-7abfb395><span class="fc__kpi-label" data-v-7abfb395>Gross Profit</span><span class="fc__kpi-val" data-v-7abfb395>${ssrInterpolate(fmt(props.orders.gross_profit))}</span><span class="fc__kpi-sub" data-v-7abfb395>${ssrInterpolate(pct(props.orders.gross_margin_percent))} margin</span></div></div>`);
			if (props.orders.uncosted_orders > 0 || props.totals.understating > 0) {
				_push(`<div class="fc__warnings" data-v-7abfb395>`);
				if (props.orders.uncosted_orders > 0) _push(`<p class="fc__warning" data-v-7abfb395><strong data-v-7abfb395>${ssrInterpolate(props.orders.uncosted_orders)}</strong> of ${ssrInterpolate(props.orders.orders)} order(s) in this period were never costed — placed before their dishes had recipes, or reversed since. COGS above is a floor, not the full figure. </p>`);
				else _push(`<!---->`);
				if (props.totals.understating > 0) {
					_push(`<p class="fc__warning" data-v-7abfb395><strong data-v-7abfb395>${ssrInterpolate(props.totals.understating)}</strong> dish(es) sold without a recipe, contributing revenue but no cost. `);
					_push(ssrRenderComponent(unref(Link), {
						href: "/inventory/recipes?view=uncosted",
						class: "fc__link"
					}, {
						default: withCtx((_, _push, _parent, _scopeId) => {
							if (_push) _push(`Add their recipes`);
							else return [createTextVNode("Add their recipes")];
						}),
						_: 1
					}, _parent));
					_push(` to close the gap. </p>`);
				} else _push(`<!---->`);
				_push(`</div>`);
			} else _push(`<!---->`);
			_push(`<div class="fc__strip" data-v-7abfb395><span data-v-7abfb395><strong data-v-7abfb395>${ssrInterpolate(props.totals.costed)}</strong> of ${ssrInterpolate(props.totals.dishes)} dishes costed</span><span data-v-7abfb395><strong data-v-7abfb395>${ssrInterpolate(props.totals.over_target)}</strong> over the ${ssrInterpolate(props.target)}% target</span><span data-v-7abfb395><strong data-v-7abfb395>${ssrInterpolate(props.totals.sold)}</strong> sold in this period</span><span data-v-7abfb395><strong data-v-7abfb395>${ssrInterpolate(qty(props.totals.units_sold))}</strong> units</span></div>`);
			_push(ssrRenderComponent(DataTable_default, {
				columns,
				rows: props.dishes,
				searchable: "",
				"search-placeholder": "Search dish…",
				"empty-text": "No dishes match this period and category."
			}, {
				"cell:name": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) _push(`<strong data-v-7abfb395${_scopeId}>${ssrInterpolate(row.name)}</strong><span class="fc__cat" data-v-7abfb395${_scopeId}>${ssrInterpolate(row.category_name || "Uncategorised")}</span>`);
					else return [createVNode("strong", null, toDisplayString(row.name), 1), createVNode("span", { class: "fc__cat" }, toDisplayString(row.category_name || "Uncategorised"), 1)];
				}),
				"cell:price": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) _push(`${ssrInterpolate(fmt(value))}`);
					else return [createTextVNode(toDisplayString(fmt(value)), 1)];
				}),
				"cell:dish_cost": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						if (!row.has_recipe) _push(`<span class="ui-badge ui-badge--muted" data-v-7abfb395${_scopeId}>No recipe</span>`);
						else _push(`<span data-v-7abfb395${_scopeId}>${ssrInterpolate(fmt(row.dish_cost))}</span>`);
					} else return [!row.has_recipe ? (openBlock(), createBlock("span", {
						key: 0,
						class: "ui-badge ui-badge--muted"
					}, "No recipe")) : (openBlock(), createBlock("span", { key: 1 }, toDisplayString(fmt(row.dish_cost)), 1))];
				}),
				"cell:food_cost_percent": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						if (row.food_cost_percent === null) _push(`<span class="fc__muted" data-v-7abfb395${_scopeId}>—</span>`);
						else _push(`<span class="${ssrRenderClass([pctBadge(row.food_cost_percent), "ui-badge"])}" data-v-7abfb395${_scopeId}>${ssrInterpolate(row.food_cost_percent)}%</span>`);
					} else return [row.food_cost_percent === null ? (openBlock(), createBlock("span", {
						key: 0,
						class: "fc__muted"
					}, "—")) : (openBlock(), createBlock("span", {
						key: 1,
						class: ["ui-badge", pctBadge(row.food_cost_percent)]
					}, toDisplayString(row.food_cost_percent) + "%", 3))];
				}),
				"cell:margin": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						if (row.margin === null) _push(`<span class="fc__muted" data-v-7abfb395${_scopeId}>—</span>`);
						else _push(`<span class="${ssrRenderClass(row.margin < 0 ? "fc__neg" : "")}" data-v-7abfb395${_scopeId}>${ssrInterpolate(fmt(row.margin))}</span>`);
					} else return [row.margin === null ? (openBlock(), createBlock("span", {
						key: 0,
						class: "fc__muted"
					}, "—")) : (openBlock(), createBlock("span", {
						key: 1,
						class: row.margin < 0 ? "fc__neg" : ""
					}, toDisplayString(fmt(row.margin)), 3))];
				}),
				"cell:units_sold": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						if (row.units_sold > 0) _push(`<span data-v-7abfb395${_scopeId}>${ssrInterpolate(qty(row.units_sold))}</span>`);
						else _push(`<span class="fc__muted" data-v-7abfb395${_scopeId}>—</span>`);
					} else return [row.units_sold > 0 ? (openBlock(), createBlock("span", { key: 0 }, toDisplayString(qty(row.units_sold)), 1)) : (openBlock(), createBlock("span", {
						key: 1,
						class: "fc__muted"
					}, "—"))];
				}),
				"cell:revenue": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						if (row.units_sold > 0) _push(`<span data-v-7abfb395${_scopeId}>${ssrInterpolate(fmt(row.revenue))}</span>`);
						else _push(`<span class="fc__muted" data-v-7abfb395${_scopeId}>—</span>`);
					} else return [row.units_sold > 0 ? (openBlock(), createBlock("span", { key: 0 }, toDisplayString(fmt(row.revenue)), 1)) : (openBlock(), createBlock("span", {
						key: 1,
						class: "fc__muted"
					}, "—"))];
				}),
				"cell:cogs": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						if (row.understates_cogs) _push(`<span class="fc__muted" title="Sold with no recipe, so no cost was recorded." data-v-7abfb395${_scopeId}> not costed </span>`);
						else if (row.units_sold > 0) _push(`<span data-v-7abfb395${_scopeId}>${ssrInterpolate(fmt(row.cogs))}</span>`);
						else _push(`<span class="fc__muted" data-v-7abfb395${_scopeId}>—</span>`);
					} else return [row.understates_cogs ? (openBlock(), createBlock("span", {
						key: 0,
						class: "fc__muted",
						title: "Sold with no recipe, so no cost was recorded."
					}, " not costed ")) : row.units_sold > 0 ? (openBlock(), createBlock("span", { key: 1 }, toDisplayString(fmt(row.cogs)), 1)) : (openBlock(), createBlock("span", {
						key: 2,
						class: "fc__muted"
					}, "—"))];
				}),
				"cell:gross_profit": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						if (row.units_sold > 0) {
							_push(`<!--[--><strong class="${ssrRenderClass(row.gross_profit < 0 ? "fc__neg" : "")}" data-v-7abfb395${_scopeId}>${ssrInterpolate(fmt(row.gross_profit))}</strong>`);
							if (row.gross_margin_percent !== null) _push(`<span class="fc__cat" data-v-7abfb395${_scopeId}>${ssrInterpolate(row.gross_margin_percent)}% margin</span>`);
							else _push(`<!---->`);
							_push(`<!--]-->`);
						} else _push(`<span class="fc__muted" data-v-7abfb395${_scopeId}>—</span>`);
					} else return [row.units_sold > 0 ? (openBlock(), createBlock(Fragment, { key: 0 }, [createVNode("strong", { class: row.gross_profit < 0 ? "fc__neg" : "" }, toDisplayString(fmt(row.gross_profit)), 3), row.gross_margin_percent !== null ? (openBlock(), createBlock("span", {
						key: 0,
						class: "fc__cat"
					}, toDisplayString(row.gross_margin_percent) + "% margin", 1)) : createCommentVNode("", true)], 64)) : (openBlock(), createBlock("span", {
						key: 1,
						class: "fc__muted"
					}, "—"))];
				}),
				actions: withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						if (unref(can)("inventory.recipes.view")) _push(ssrRenderComponent(unref(Link), {
							href: `/inventory/recipes?food_item=${row.id}&search=${encodeURIComponent(row.name)}`,
							class: "ui-btn ui-btn--ghost ui-btn--sm"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(`${ssrInterpolate(row.has_recipe ? "Recipe" : "Add Recipe")}`);
								else return [createTextVNode(toDisplayString(row.has_recipe ? "Recipe" : "Add Recipe"), 1)];
							}),
							_: 2
						}, _parent, _scopeId));
						else _push(`<!---->`);
					} else return [unref(can)("inventory.recipes.view") ? (openBlock(), createBlock(unref(Link), {
						key: 0,
						href: `/inventory/recipes?food_item=${row.id}&search=${encodeURIComponent(row.name)}`,
						class: "ui-btn ui-btn--ghost ui-btn--sm"
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(row.has_recipe ? "Recipe" : "Add Recipe"), 1)]),
						_: 2
					}, 1032, ["href"])) : createCommentVNode("", true)];
				}),
				_: 1
			}, _parent));
			_push(`<p class="fc__foot" data-v-7abfb395> Showing the whole menu, not just what sold — a dish with a bad food cost is worth seeing before it sells, not after. Dish cost and margin are today&#39;s figures; revenue, COGS and gross profit are for ${ssrInterpolate(fmtDate(props.filters.from))} – ${ssrInterpolate(fmtDate(props.filters.to))}. </p></div>`);
		};
	}
});
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/pages/Reports/FoodCost.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var FoodCost_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-7abfb395"]]);
//#endregion
export { FoodCost_default as default };
