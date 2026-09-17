import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-BOaGB7Aw.js";
import { t as _sfc_main$1 } from "./PageHeader-D0aRDn5C.js";
import { t as Modal_default } from "./Modal-CpmFAnsY.js";
import { t as _sfc_main$2 } from "./FormField-Doe8oR1s.js";
import { t as CustomerPicker_default } from "./CustomerPicker-Bya7Uknk.js";
import { Fragment, computed, createBlock, createTextVNode, createVNode, mergeProps, openBlock, ref, renderList, toDisplayString, useSSRContext, watch, withCtx } from "vue";
import { router, usePage } from "@inertiajs/vue3";
import { ssrIncludeBooleanAttr, ssrInterpolate, ssrLooseContain, ssrLooseEqual, ssrRenderAttr, ssrRenderAttrs, ssrRenderClass, ssrRenderComponent, ssrRenderList, ssrRenderStyle } from "vue/server-renderer";
//#region resources/js/pages/POS.vue
var _sfc_main = {
	__name: "POS",
	__ssrInlineRender: true,
	props: {
		foodItems: {
			type: Array,
			default: () => []
		},
		categories: {
			type: Array,
			default: () => []
		},
		places: {
			type: Array,
			default: () => []
		},
		quickReport: {
			type: Array,
			default: null
		},
		topTen: {
			type: Array,
			default: null
		},
		loyalty: {
			type: Object,
			default: () => ({})
		},
		campaigns: {
			type: Array,
			default: () => []
		},
		kdsStations: {
			type: Array,
			default: () => []
		}
	},
	setup(__props) {
		const props = __props;
		usePage();
		const goAdmin = () => router.visit("/");
		const TYPE_LABELS = {
			delivery: "Delivery",
			dining: "Dining",
			"on-way": "On the way"
		};
		const typeLabel = (t) => TYPE_LABELS[t] || t || "—";
		const showQuickReport = ref(false);
		const showTopTen = ref(false);
		const reportLoading = ref(false);
		const reportError = ref("");
		const quickReport = computed(() => props.quickReport ?? []);
		const topTen = computed(() => props.topTen ?? []);
		const reportTotal = (rows) => rows.reduce((sum, o) => sum + Number(o.grand_total || 0), 0);
		const openQuickReport = () => {
			showQuickReport.value = true;
			reportLoading.value = true;
			reportError.value = "";
			router.reload({
				only: ["quickReport"],
				onError: () => {
					reportError.value = "Could not load the quick report. Please try again.";
				},
				onFinish: () => {
					reportLoading.value = false;
				}
			});
		};
		const openTopTen = () => {
			showTopTen.value = true;
			reportLoading.value = true;
			reportError.value = "";
			router.reload({
				only: ["topTen"],
				onError: () => {
					reportError.value = "Could not load the top deals report. Please try again.";
				},
				onFinish: () => {
					reportLoading.value = false;
				}
			});
		};
		const money = (v) => `Rs ${Number(v || 0).toFixed(2)}`;
		const num = (v) => {
			const n = Number(v);
			return Number.isFinite(n) ? n : 0;
		};
		const getFoodEmoji = (name) => {
			const map = {
				"burger": "🍔",
				"pizza": "🍕",
				"pasta": "🍝",
				"salad": "🥗",
				"sushi": "🍣",
				"coffee": "☕",
				"tea": "🍵",
				"cake": "🍰",
				"ice": "🍨",
				"chicken": "🍗",
				"beef": "🥩",
				"fish": "🐟",
				"wine": "🍷",
				"beer": "🍺",
				"cocktail": "🍸",
				"soup": "🍲",
				"bread": "🥖",
				"fries": "🍟",
				"taco": "🌮",
				"burrito": "🌯",
				"noodles": "🍜",
				"rice": "🍚",
				"egg": "🍳",
				"pancake": "🥞"
			};
			const lower = name.toLowerCase();
			for (const [key, emoji] of Object.entries(map)) if (lower.includes(key)) return emoji;
			return "🍽";
		};
		const items = computed(() => props.foodItems);
		const categories = computed(() => props.categories);
		const places = computed(() => props.places);
		const itemsLoading = ref(false);
		const loadError = ref("");
		const saveError = ref("");
		const successMsg = ref("");
		const saving = ref(false);
		const search = ref("");
		const activeCat = ref(null);
		const cart = ref([]);
		const form = ref({
			type: "dining",
			place_id: props.places[0]?.id ?? "",
			customer_id: null,
			status: "pending",
			paid: false,
			discount_type: "amount",
			discount_amount: 0,
			service_charges_percentage: 0
		});
		const customerRequired = computed(() => form.value.type === "delivery");
		const filteredItems = computed(() => {
			const q = search.value.trim().toLowerCase();
			return items.value.filter((i) => {
				if (activeCat.value !== null && Number(i.foodcategory_id) !== Number(activeCat.value)) return false;
				if (q && !String(i.name || "").toLowerCase().includes(q)) return false;
				return true;
			});
		});
		const lineTotal = (line) => num(line.price) * num(line.quantity);
		const totalQty = computed(() => cart.value.reduce((sum, l) => sum + num(l.quantity), 0));
		const subtotal = computed(() => cart.value.reduce((sum, l) => sum + lineTotal(l), 0));
		const discountValue = computed(() => {
			const d = num(form.value.discount_amount);
			if (form.value.discount_type === "percentage") return Math.min(subtotal.value, subtotal.value * d / 100);
			return Math.min(subtotal.value, d);
		});
		const promoInput = ref("");
		const appliedPromo = ref(null);
		const promoError = ref("");
		const promoChecking = ref(false);
		const quotePromo = async (code) => {
			const params = new URLSearchParams({
				code,
				subtotal: subtotal.value.toFixed(2)
			});
			if (form.value.customer_id) params.set("customer_id", String(form.value.customer_id));
			const res = await fetch(`/orders/quote-promo?${params.toString()}`, {
				headers: {
					Accept: "application/json",
					"X-Requested-With": "XMLHttpRequest"
				},
				credentials: "same-origin"
			});
			const body = await res.json().catch(() => null);
			if (!res.ok) throw new Error(body?.errors?.promo_code?.[0] || body?.message || "That code could not be applied.");
			return body;
		};
		const promoDiscount = computed(() => appliedPromo.value ? Math.min(subtotal.value, num(appliedPromo.value.discount)) : 0);
		let requoteTimer = null;
		watch([subtotal, () => form.value.customer_id], () => {
			if (!appliedPromo.value) return;
			clearTimeout(requoteTimer);
			requoteTimer = setTimeout(async () => {
				const current = appliedPromo.value;
				if (!current) return;
				try {
					appliedPromo.value = await quotePromo(current.code);
				} catch (e) {
					appliedPromo.value = null;
					promoError.value = e.message;
				}
			}, 400);
		});
		const pickedCustomer = ref(null);
		const redeemPoints = ref(0);
		const onCustomerPicked = (c) => {
			pickedCustomer.value = c;
			redeemPoints.value = 0;
		};
		const loyaltyActive = computed(() => !!props.loyalty?.is_active);
		const pointsBalance = computed(() => form.value.customer_id && pickedCustomer.value ? num(pickedCustomer.value.loyalty_points_balance) : 0);
		const pointsAvailable = computed(() => loyaltyActive.value && !!form.value.customer_id && pointsBalance.value > 0);
		const pointRate = computed(() => num(props.loyalty?.currency_per_point));
		const maxRedeemPoints = computed(() => {
			if (!pointsAvailable.value || pointRate.value <= 0) return 0;
			const cap = subtotal.value * num(props.loyalty?.max_redeem_percent) / 100;
			return Math.max(0, Math.min(pointsBalance.value, Math.floor(cap / pointRate.value)));
		});
		const redeemPointsValue = computed(() => Math.max(0, Math.floor(num(redeemPoints.value))));
		const pointsError = computed(() => {
			if (!redeemPointsValue.value) return "";
			if (!pointsAvailable.value) return "Pick a customer who holds points first.";
			if (redeemPointsValue.value > pointsBalance.value) return `Only ${pointsBalance.value} point(s) on this account.`;
			if (redeemPointsValue.value > maxRedeemPoints.value) return `Points may cover at most ${num(props.loyalty?.max_redeem_percent)}% of this order — ${maxRedeemPoints.value} here.`;
			const min = num(props.loyalty?.min_redeem_points);
			if (redeemPointsValue.value < min) return `At least ${min} points are needed to redeem.`;
			return "";
		});
		const pointsHint = computed(() => {
			if (!loyaltyActive.value) return "The loyalty programme is switched off.";
			if (!form.value.customer_id) return "Pick a customer to spend their points.";
			if (!pointsBalance.value) return "No points on this account yet.";
			return `Balance ${pointsBalance.value} · up to ${maxRedeemPoints.value} usable here (${money(maxRedeemPoints.value * pointRate.value)} off).`;
		});
		const loyaltyDiscount = computed(() => pointsError.value ? 0 : redeemPointsValue.value * pointRate.value);
		const totalDiscount = computed(() => discountValue.value + promoDiscount.value + loyaltyDiscount.value);
		const discountsOverflow = computed(() => totalDiscount.value > subtotal.value + .001);
		const netDiscount = computed(() => Math.min(subtotal.value, totalDiscount.value));
		const serviceCharges = computed(() => {
			const pct = num(form.value.service_charges_percentage);
			return (subtotal.value - netDiscount.value) * pct / 100;
		});
		const grandTotal = computed(() => Math.max(0, subtotal.value - netDiscount.value + serviceCharges.value));
		const pointsToEarn = computed(() => {
			if (!loyaltyActive.value || !form.value.paid || !form.value.customer_id) return 0;
			return Math.floor(grandTotal.value * num(props.loyalty?.points_per_currency));
		});
		const campaignBase = (c) => {
			if (c.applies_to === "all") return subtotal.value;
			const ids = (c.target_ids ?? []).map(Number);
			return cart.value.filter((l) => ids.includes(Number(c.applies_to === "category" ? l.category_id : l.fooditems_id))).reduce((sum, l) => sum + lineTotal(l), 0);
		};
		const campaignDiscount = (c) => {
			const base = campaignBase(c);
			if (base <= 0 || subtotal.value < num(c.min_order_amount)) return 0;
			let raw = c.type === "percentage" ? base * num(c.value) / 100 : num(c.value);
			if (c.max_discount !== null && c.max_discount !== void 0) raw = Math.min(raw, num(c.max_discount));
			return Math.min(raw, subtotal.value);
		};
		const suggestedCampaigns = computed(() => props.campaigns.filter((c) => {
			const types = c.order_types ?? [];
			return types.length === 0 || types.includes(form.value.type);
		}).map((c) => ({
			...c,
			discount: campaignDiscount(c)
		})).filter((c) => c.discount > 0));
		const refresh = () => {
			itemsLoading.value = true;
			router.reload({
				only: [
					"foodItems",
					"categories",
					"places"
				],
				onFinish: () => {
					itemsLoading.value = false;
				}
			});
		};
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "page pos" }, _attrs))} data-v-a25e256c>`);
			_push(ssrRenderComponent(_sfc_main$1, {
				title: "Point of Sale",
				subtitle: "Build an order and send it to the kitchen."
			}, {
				actions: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<button class="ui-btn ui-btn--ghost" data-v-a25e256c${_scopeId}><span class="btn-icon" data-v-a25e256c${_scopeId}>📋</span> Quick Report — Today </button><button class="ui-btn ui-btn--ghost" data-v-a25e256c${_scopeId}><span class="btn-icon" data-v-a25e256c${_scopeId}>🏆</span> Top 10 Deals — Today </button><button class="ui-btn ui-btn--ghost" data-v-a25e256c${_scopeId}><span class="btn-icon" data-v-a25e256c${_scopeId}>⚙</span> Admin </button><button class="ui-btn ui-btn--ghost"${ssrIncludeBooleanAttr(itemsLoading.value) ? " disabled" : ""} data-v-a25e256c${_scopeId}><span class="${ssrRenderClass([{ "spin": itemsLoading.value }, "btn-icon"])}" data-v-a25e256c${_scopeId}>↻</span> ${ssrInterpolate(itemsLoading.value ? "Loading…" : "Refresh")}</button>`);
					else return [
						createVNode("button", {
							class: "ui-btn ui-btn--ghost",
							onClick: openQuickReport
						}, [createVNode("span", { class: "btn-icon" }, "📋"), createTextVNode(" Quick Report — Today ")]),
						createVNode("button", {
							class: "ui-btn ui-btn--ghost",
							onClick: openTopTen
						}, [createVNode("span", { class: "btn-icon" }, "🏆"), createTextVNode(" Top 10 Deals — Today ")]),
						createVNode("button", {
							class: "ui-btn ui-btn--ghost",
							onClick: goAdmin
						}, [createVNode("span", { class: "btn-icon" }, "⚙"), createTextVNode(" Admin ")]),
						createVNode("button", {
							class: "ui-btn ui-btn--ghost",
							onClick: refresh,
							disabled: itemsLoading.value
						}, [createVNode("span", { class: ["btn-icon", { "spin": itemsLoading.value }] }, "↻", 2), createTextVNode(" " + toDisplayString(itemsLoading.value ? "Loading…" : "Refresh"), 1)], 8, ["disabled"])
					];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(Modal_default, {
				modelValue: showQuickReport.value,
				"onUpdate:modelValue": ($event) => showQuickReport.value = $event,
				title: "Quick Report — Today",
				width: "720px"
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div class="report-modal" data-v-a25e256c${_scopeId}>`);
						if (reportLoading.value) _push(`<p class="report-modal__state" data-v-a25e256c${_scopeId}>Loading…</p>`);
						else if (reportError.value) _push(`<p class="report-modal__state report-modal__state--error" data-v-a25e256c${_scopeId}>${ssrInterpolate(reportError.value)}</p>`);
						else if (!quickReport.value.length) _push(`<p class="report-modal__state" data-v-a25e256c${_scopeId}>No orders today.</p>`);
						else {
							_push(`<table class="report-table" data-v-a25e256c${_scopeId}><thead data-v-a25e256c${_scopeId}><tr data-v-a25e256c${_scopeId}><th data-v-a25e256c${_scopeId}>Order</th><th data-v-a25e256c${_scopeId}>Customer</th><th data-v-a25e256c${_scopeId}>Type</th><th style="${ssrRenderStyle({ "text-align": "right" })}" data-v-a25e256c${_scopeId}>Total</th></tr></thead><tbody data-v-a25e256c${_scopeId}><!--[-->`);
							ssrRenderList(quickReport.value, (o) => {
								_push(`<tr data-v-a25e256c${_scopeId}><td data-v-a25e256c${_scopeId}>#${ssrInterpolate(o.id)}</td><td data-v-a25e256c${_scopeId}>${ssrInterpolate(o.customer?.name || "Guest")}</td><td data-v-a25e256c${_scopeId}>${ssrInterpolate(typeLabel(o.type))}</td><td class="report-table__money" data-v-a25e256c${_scopeId}>${ssrInterpolate(money(o.grand_total))}</td></tr>`);
							});
							_push(`<!--]--></tbody><tfoot data-v-a25e256c${_scopeId}><tr data-v-a25e256c${_scopeId}><th colspan="3" data-v-a25e256c${_scopeId}>Total · ${ssrInterpolate(quickReport.value.length)} order(s)</th><th class="report-table__money" data-v-a25e256c${_scopeId}>${ssrInterpolate(money(reportTotal(quickReport.value)))}</th></tr></tfoot></table>`);
						}
						_push(`</div>`);
					} else return [createVNode("div", { class: "report-modal" }, [reportLoading.value ? (openBlock(), createBlock("p", {
						key: 0,
						class: "report-modal__state"
					}, "Loading…")) : reportError.value ? (openBlock(), createBlock("p", {
						key: 1,
						class: "report-modal__state report-modal__state--error"
					}, toDisplayString(reportError.value), 1)) : !quickReport.value.length ? (openBlock(), createBlock("p", {
						key: 2,
						class: "report-modal__state"
					}, "No orders today.")) : (openBlock(), createBlock("table", {
						key: 3,
						class: "report-table"
					}, [
						createVNode("thead", null, [createVNode("tr", null, [
							createVNode("th", null, "Order"),
							createVNode("th", null, "Customer"),
							createVNode("th", null, "Type"),
							createVNode("th", { style: { "text-align": "right" } }, "Total")
						])]),
						createVNode("tbody", null, [(openBlock(true), createBlock(Fragment, null, renderList(quickReport.value, (o) => {
							return openBlock(), createBlock("tr", { key: o.id }, [
								createVNode("td", null, "#" + toDisplayString(o.id), 1),
								createVNode("td", null, toDisplayString(o.customer?.name || "Guest"), 1),
								createVNode("td", null, toDisplayString(typeLabel(o.type)), 1),
								createVNode("td", { class: "report-table__money" }, toDisplayString(money(o.grand_total)), 1)
							]);
						}), 128))]),
						createVNode("tfoot", null, [createVNode("tr", null, [createVNode("th", { colspan: "3" }, "Total · " + toDisplayString(quickReport.value.length) + " order(s)", 1), createVNode("th", { class: "report-table__money" }, toDisplayString(money(reportTotal(quickReport.value))), 1)])])
					]))])];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(Modal_default, {
				modelValue: showTopTen.value,
				"onUpdate:modelValue": ($event) => showTopTen.value = $event,
				title: "Top 10 Deals — Today",
				width: "640px"
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div class="report-modal" data-v-a25e256c${_scopeId}>`);
						if (reportLoading.value) _push(`<p class="report-modal__state" data-v-a25e256c${_scopeId}>Loading…</p>`);
						else if (reportError.value) _push(`<p class="report-modal__state report-modal__state--error" data-v-a25e256c${_scopeId}>${ssrInterpolate(reportError.value)}</p>`);
						else if (!topTen.value.length) _push(`<p class="report-modal__state" data-v-a25e256c${_scopeId}>No orders today.</p>`);
						else {
							_push(`<table class="report-table" data-v-a25e256c${_scopeId}><thead data-v-a25e256c${_scopeId}><tr data-v-a25e256c${_scopeId}><th data-v-a25e256c${_scopeId}>Order</th><th data-v-a25e256c${_scopeId}>Customer</th><th data-v-a25e256c${_scopeId}>Type</th><th style="${ssrRenderStyle({ "text-align": "right" })}" data-v-a25e256c${_scopeId}>Total</th></tr></thead><tbody data-v-a25e256c${_scopeId}><!--[-->`);
							ssrRenderList(topTen.value, (o) => {
								_push(`<tr data-v-a25e256c${_scopeId}><td data-v-a25e256c${_scopeId}>#${ssrInterpolate(o.id)}</td><td data-v-a25e256c${_scopeId}>${ssrInterpolate(o.customer?.name || "Guest")}</td><td data-v-a25e256c${_scopeId}>${ssrInterpolate(typeLabel(o.type))}</td><td class="report-table__money" data-v-a25e256c${_scopeId}>${ssrInterpolate(money(o.grand_total))}</td></tr>`);
							});
							_push(`<!--]--></tbody></table>`);
						}
						_push(`</div>`);
					} else return [createVNode("div", { class: "report-modal" }, [reportLoading.value ? (openBlock(), createBlock("p", {
						key: 0,
						class: "report-modal__state"
					}, "Loading…")) : reportError.value ? (openBlock(), createBlock("p", {
						key: 1,
						class: "report-modal__state report-modal__state--error"
					}, toDisplayString(reportError.value), 1)) : !topTen.value.length ? (openBlock(), createBlock("p", {
						key: 2,
						class: "report-modal__state"
					}, "No orders today.")) : (openBlock(), createBlock("table", {
						key: 3,
						class: "report-table"
					}, [createVNode("thead", null, [createVNode("tr", null, [
						createVNode("th", null, "Order"),
						createVNode("th", null, "Customer"),
						createVNode("th", null, "Type"),
						createVNode("th", { style: { "text-align": "right" } }, "Total")
					])]), createVNode("tbody", null, [(openBlock(true), createBlock(Fragment, null, renderList(topTen.value, (o) => {
						return openBlock(), createBlock("tr", { key: o.id }, [
							createVNode("td", null, "#" + toDisplayString(o.id), 1),
							createVNode("td", null, toDisplayString(o.customer?.name || "Guest"), 1),
							createVNode("td", null, toDisplayString(typeLabel(o.type)), 1),
							createVNode("td", { class: "report-table__money" }, toDisplayString(money(o.grand_total)), 1)
						]);
					}), 128))])]))])];
				}),
				_: 1
			}, _parent));
			if (loadError.value) _push(`<div class="ui-alert ui-alert--danger" data-v-a25e256c><span class="alert-icon" data-v-a25e256c>⚠</span> ${ssrInterpolate(loadError.value)}</div>`);
			else _push(`<!---->`);
			_push(`<div class="pos-layout" data-v-a25e256c><div class="pos-menu" data-v-a25e256c><div class="ui-card pos-menu-card" data-v-a25e256c><div class="pos-toolbar" data-v-a25e256c><div class="search-wrapper" data-v-a25e256c><span class="search-icon" data-v-a25e256c>🔍</span><input${ssrRenderAttr("value", search.value)} class="ui-input pos-search" type="search" placeholder="Search menu items…" aria-label="Search food items" data-v-a25e256c>`);
			if (search.value) _push(`<button class="search-clear" aria-label="Clear search" data-v-a25e256c>×</button>`);
			else _push(`<!---->`);
			_push(`</div><div class="pos-cats" role="tablist" aria-label="Food categories" data-v-a25e256c><button class="${ssrRenderClass([{ "pos-cat--active": activeCat.value === null }, "pos-cat"])}" role="tab"${ssrRenderAttr("aria-selected", activeCat.value === null)} data-v-a25e256c> All Items </button><!--[-->`);
			ssrRenderList(categories.value, (c) => {
				_push(`<button class="${ssrRenderClass([{ "pos-cat--active": activeCat.value === c.id }, "pos-cat"])}" role="tab"${ssrRenderAttr("aria-selected", activeCat.value === c.id)} data-v-a25e256c>${ssrInterpolate(c.name)}</button>`);
			});
			_push(`<!--]--></div></div>`);
			if (itemsLoading.value) {
				_push(`<div class="pos-loading" data-v-a25e256c><div class="skeleton-grid" data-v-a25e256c><!--[-->`);
				ssrRenderList(8, (n) => {
					_push(`<div class="skeleton-tile" data-v-a25e256c><div class="skeleton-img" data-v-a25e256c></div><div class="skeleton-text" data-v-a25e256c></div><div class="skeleton-text short" data-v-a25e256c></div></div>`);
				});
				_push(`<!--]--></div></div>`);
			} else if (!filteredItems.value.length) {
				_push(`<div class="pos-empty" data-v-a25e256c><div class="empty-icon" data-v-a25e256c>🔍</div><p data-v-a25e256c>No items match your search.</p>`);
				if (search.value || activeCat.value) _push(`<button class="ui-btn ui-btn--sm" data-v-a25e256c> Clear filters </button>`);
				else _push(`<!---->`);
				_push(`</div>`);
			} else {
				_push(`<div class="pos-grid" data-v-a25e256c><!--[-->`);
				ssrRenderList(filteredItems.value, (item) => {
					_push(`<button class="pos-tile" type="button"${ssrRenderAttr("aria-label", `Add ${item.name} for ${money(item.price)}`)} data-v-a25e256c><div class="pos-tile__img-wrap" data-v-a25e256c>`);
					if (item.image) _push(`<img${ssrRenderAttr("src", item.image)}${ssrRenderAttr("alt", item.name)} class="pos-tile__img" loading="lazy" data-v-a25e256c>`);
					else _push(`<span class="pos-tile__img pos-tile__img--empty" aria-hidden="true" data-v-a25e256c><span class="food-emoji" data-v-a25e256c>${ssrInterpolate(getFoodEmoji(item.name))}</span></span>`);
					_push(`<div class="pos-tile__overlay" data-v-a25e256c><span class="add-icon" data-v-a25e256c>+</span></div></div><div class="pos-tile__info" data-v-a25e256c><span class="pos-tile__name" data-v-a25e256c>${ssrInterpolate(item.name)}</span><span class="pos-tile__price" data-v-a25e256c>${ssrInterpolate(money(item.price))}</span></div></button>`);
				});
				_push(`<!--]--></div>`);
			}
			_push(`</div></div><div class="pos-cart" data-v-a25e256c><div class="ui-card pos-cart-card" data-v-a25e256c><div class="pos-cart-header" data-v-a25e256c><div class="pos-cart-title" data-v-a25e256c><span class="cart-icon" data-v-a25e256c>🛒</span><span data-v-a25e256c>Current Order</span><span class="pos-chip" data-v-a25e256c>${ssrInterpolate(totalQty.value)}</span></div>`);
			if (cart.value.length) _push(`<button class="clear-btn" type="button" aria-label="Clear cart" data-v-a25e256c> Clear all </button>`);
			else _push(`<!---->`);
			_push(`</div><!--[-->`);
			if (saveError.value) _push(`<div class="ui-alert ui-alert--danger" data-v-a25e256c><span class="alert-icon" data-v-a25e256c>⚠</span> ${ssrInterpolate(saveError.value)}</div>`);
			if (successMsg.value) _push(`<div class="ui-alert ui-alert--success" data-v-a25e256c><span class="alert-icon" data-v-a25e256c>✓</span> ${ssrInterpolate(successMsg.value)}</div>`);
			_push(`<!--]--><div class="${ssrRenderClass([{ "pos-lines--empty": !cart.value.length }, "pos-lines"])}" data-v-a25e256c>`);
			if (!cart.value.length) _push(`<div class="pos-empty-state" data-v-a25e256c><div class="empty-illustration" data-v-a25e256c>🛒</div><p class="empty-title" data-v-a25e256c>Your cart is empty</p><p class="empty-subtitle" data-v-a25e256c>Tap items from the menu to start building an order.</p></div>`);
			else _push(`<!---->`);
			_push(`<div${ssrRenderAttrs({
				name: "cart-item",
				class: "cart-items"
			})} data-v-a25e256c>`);
			ssrRenderList(cart.value, (line) => {
				_push(`<div class="pos-line" data-v-a25e256c><div class="pos-line__content" data-v-a25e256c><div class="pos-line__main" data-v-a25e256c><span class="pos-line__name" data-v-a25e256c>${ssrInterpolate(line.name)}</span><button class="pos-line__x" type="button"${ssrRenderAttr("aria-label", `Remove ${line.name}`)} data-v-a25e256c><span data-v-a25e256c>×</span></button></div><div class="pos-line__details" data-v-a25e256c><div class="pos-qty" data-v-a25e256c><button type="button" aria-label="Decrease quantity"${ssrIncludeBooleanAttr(line.quantity <= 1) ? " disabled" : ""} data-v-a25e256c>−</button><span class="qty-value" data-v-a25e256c>${ssrInterpolate(line.quantity)}</span><button type="button" aria-label="Increase quantity" data-v-a25e256c>+</button></div><span class="pos-line__unit" data-v-a25e256c>× ${ssrInterpolate(money(line.price))}</span><span class="pos-line__sub" data-v-a25e256c>${ssrInterpolate(money(lineTotal(line)))}</span></div><input${ssrRenderAttr("value", line.add_note)} class="ui-input pos-line__note" type="text" placeholder="Add a note…"${ssrRenderAttr("aria-label", `Note for ${line.name}`)} data-v-a25e256c><select class="ui-select pos-line__station"${ssrRenderAttr("aria-label", `KDS station for ${line.name}`)} data-v-a25e256c><option${ssrRenderAttr("value", null)} data-v-a25e256c${ssrIncludeBooleanAttr(Array.isArray(line.kds_station_id) ? ssrLooseContain(line.kds_station_id, null) : ssrLooseEqual(line.kds_station_id, null)) ? " selected" : ""}>Auto KDS station</option><!--[-->`);
				ssrRenderList(__props.kdsStations, (s) => {
					_push(`<option${ssrRenderAttr("value", s.id)} data-v-a25e256c${ssrIncludeBooleanAttr(Array.isArray(line.kds_station_id) ? ssrLooseContain(line.kds_station_id, s.id) : ssrLooseEqual(line.kds_station_id, s.id)) ? " selected" : ""}>${ssrInterpolate(s.name)}</option>`);
				});
				_push(`<!--]--></select></div></div>`);
			});
			_push(`</div></div>`);
			if (cart.value.length) {
				_push(`<div class="pos-fields" data-v-a25e256c><div class="field-group" data-v-a25e256c>`);
				_push(ssrRenderComponent(_sfc_main$2, {
					modelValue: form.value.type,
					"onUpdate:modelValue": ($event) => form.value.type = $event,
					label: "Order Type",
					type: "select"
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) _push(`<option value="dining" data-v-a25e256c${_scopeId}>🍽 Dining In</option><option value="delivery" data-v-a25e256c${_scopeId}>🚚 Delivery</option><option value="on-way" data-v-a25e256c${_scopeId}>🥡 Takeaway</option>`);
						else return [
							createVNode("option", { value: "dining" }, "🍽 Dining In"),
							createVNode("option", { value: "delivery" }, "🚚 Delivery"),
							createVNode("option", { value: "on-way" }, "🥡 Takeaway")
						];
					}),
					_: 1
				}, _parent));
				_push(`</div><div class="field-group" data-v-a25e256c>`);
				_push(ssrRenderComponent(_sfc_main$2, {
					modelValue: form.value.place_id,
					"onUpdate:modelValue": ($event) => form.value.place_id = $event,
					label: "Table / Place",
					type: "select"
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) {
							_push(`<option value="" data-v-a25e256c${_scopeId}>— Select —</option><!--[-->`);
							ssrRenderList(places.value, (p) => {
								_push(`<option${ssrRenderAttr("value", p.id)} data-v-a25e256c${_scopeId}>${ssrInterpolate(p.name)}</option>`);
							});
							_push(`<!--]-->`);
						} else return [createVNode("option", { value: "" }, "— Select —"), (openBlock(true), createBlock(Fragment, null, renderList(places.value, (p) => {
							return openBlock(), createBlock("option", {
								key: p.id,
								value: p.id
							}, toDisplayString(p.name), 9, ["value"]);
						}), 128))];
					}),
					_: 1
				}, _parent));
				_push(`</div><div class="field-group field-group--full" data-v-a25e256c>`);
				_push(ssrRenderComponent(CustomerPicker_default, {
					modelValue: form.value.customer_id,
					"onUpdate:modelValue": ($event) => form.value.customer_id = $event,
					label: customerRequired.value ? "Customer *" : "Customer",
					placeholder: customerRequired.value ? "Search customer (required)…" : "Search customer or leave for walk-in…",
					class: { "field-required": customerRequired.value },
					onPicked: onCustomerPicked
				}, null, _parent));
				_push(`</div><div class="field-group" data-v-a25e256c>`);
				_push(ssrRenderComponent(_sfc_main$2, {
					modelValue: form.value.status,
					"onUpdate:modelValue": ($event) => form.value.status = $event,
					label: "Status",
					type: "select"
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) _push(`<option value="pending" data-v-a25e256c${_scopeId}>⏳ Pending</option><option value="preparing" data-v-a25e256c${_scopeId}>👨‍🍳 Preparing</option><option value="on-way" data-v-a25e256c${_scopeId}>🚚 On the way</option><option value="completed" data-v-a25e256c${_scopeId}>✅ Completed</option>`);
						else return [
							createVNode("option", { value: "pending" }, "⏳ Pending"),
							createVNode("option", { value: "preparing" }, "👨‍🍳 Preparing"),
							createVNode("option", { value: "on-way" }, "🚚 On the way"),
							createVNode("option", { value: "completed" }, "✅ Completed")
						];
					}),
					_: 1
				}, _parent));
				_push(`</div><div class="field-group" data-v-a25e256c>`);
				_push(ssrRenderComponent(_sfc_main$2, {
					modelValue: form.value.paid,
					"onUpdate:modelValue": ($event) => form.value.paid = $event,
					label: "Payment",
					type: "select"
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) _push(`<option${ssrRenderAttr("value", false)} data-v-a25e256c${_scopeId}>⏳ Unpaid</option><option${ssrRenderAttr("value", true)} data-v-a25e256c${_scopeId}>✅ Paid</option>`);
						else return [createVNode("option", { value: false }, "⏳ Unpaid"), createVNode("option", { value: true }, "✅ Paid")];
					}),
					_: 1
				}, _parent));
				_push(`</div><div class="field-group" data-v-a25e256c>`);
				_push(ssrRenderComponent(_sfc_main$2, {
					modelValue: form.value.discount_type,
					"onUpdate:modelValue": ($event) => form.value.discount_type = $event,
					label: "Discount Type",
					type: "select"
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) _push(`<option value="amount" data-v-a25e256c${_scopeId}>Fixed Amount</option><option value="percentage" data-v-a25e256c${_scopeId}>Percentage</option>`);
						else return [createVNode("option", { value: "amount" }, "Fixed Amount"), createVNode("option", { value: "percentage" }, "Percentage")];
					}),
					_: 1
				}, _parent));
				_push(`</div><div class="field-group" data-v-a25e256c>`);
				_push(ssrRenderComponent(_sfc_main$2, {
					modelValue: form.value.discount_amount,
					"onUpdate:modelValue": ($event) => form.value.discount_amount = $event,
					label: form.value.discount_type === "percentage" ? "Discount %" : "Discount $",
					type: "number",
					step: "0.01",
					min: "0"
				}, null, _parent));
				_push(`</div><div class="field-group" data-v-a25e256c>`);
				_push(ssrRenderComponent(_sfc_main$2, {
					modelValue: form.value.service_charges_percentage,
					"onUpdate:modelValue": ($event) => form.value.service_charges_percentage = $event,
					label: "Service Charge %",
					type: "number",
					step: "0.01",
					min: "0"
				}, null, _parent));
				_push(`</div></div>`);
			} else _push(`<!---->`);
			if (cart.value.length) {
				_push(`<div class="pos-crm" data-v-a25e256c>`);
				if (suggestedCampaigns.value.length) {
					_push(`<div class="pos-crm__suggest" data-v-a25e256c><span class="ui-label" data-v-a25e256c>Running Offers</span><div class="pos-crm__chips" data-v-a25e256c><!--[-->`);
					ssrRenderList(suggestedCampaigns.value, (c) => {
						_push(`<button type="button" class="pos-chip" data-v-a25e256c>${ssrInterpolate(c.name)} · − ${ssrInterpolate(money(c.discount))}</button>`);
					});
					_push(`<!--]--></div></div>`);
				} else _push(`<!---->`);
				_push(`<div class="pos-crm__row" data-v-a25e256c><div class="pos-crm__cell" data-v-a25e256c><label class="ui-label" for="pos-promo" data-v-a25e256c>Promo Code</label><div class="pos-crm__inline" data-v-a25e256c><input id="pos-promo"${ssrRenderAttr("value", promoInput.value)} class="ui-input" type="text" autocomplete="off" placeholder="e.g. FLAT100"${ssrIncludeBooleanAttr(!!appliedPromo.value) ? " disabled" : ""} data-v-a25e256c>`);
				if (appliedPromo.value) _push(`<button type="button" class="ui-btn ui-btn--ghost" data-v-a25e256c> Remove </button>`);
				else _push(`<button type="button" class="ui-btn ui-btn--ghost"${ssrIncludeBooleanAttr(promoChecking.value || !promoInput.value.trim()) ? " disabled" : ""} data-v-a25e256c>${ssrInterpolate(promoChecking.value ? "Checking…" : "Apply")}</button>`);
				_push(`</div>`);
				if (promoError.value) _push(`<p class="pos-crm__hint pos-crm__hint--bad" data-v-a25e256c>${ssrInterpolate(promoError.value)}</p>`);
				else if (appliedPromo.value) _push(`<p class="pos-crm__hint pos-crm__hint--ok" data-v-a25e256c>${ssrInterpolate(appliedPromo.value.code)} applied — ${ssrInterpolate(money(promoDiscount.value))} off. </p>`);
				else _push(`<p class="pos-crm__hint" data-v-a25e256c>The discount is priced by the server, not here.</p>`);
				_push(`</div><div class="pos-crm__cell" data-v-a25e256c><label class="ui-label" for="pos-points" data-v-a25e256c>Redeem Points</label><div class="pos-crm__inline" data-v-a25e256c><input id="pos-points"${ssrRenderAttr("value", redeemPoints.value)} class="ui-input" type="number" min="0" step="1"${ssrIncludeBooleanAttr(!pointsAvailable.value) ? " disabled" : ""} data-v-a25e256c><button type="button" class="ui-btn ui-btn--ghost"${ssrIncludeBooleanAttr(!maxRedeemPoints.value) ? " disabled" : ""} data-v-a25e256c> Max </button></div>`);
				if (pointsError.value) _push(`<p class="pos-crm__hint pos-crm__hint--bad" data-v-a25e256c>${ssrInterpolate(pointsError.value)}</p>`);
				else _push(`<p class="pos-crm__hint" data-v-a25e256c>${ssrInterpolate(pointsHint.value)}</p>`);
				_push(`</div></div></div>`);
			} else _push(`<!---->`);
			if (cart.value.length) {
				_push(`<div class="pos-totals" data-v-a25e256c><div class="pos-total-row" data-v-a25e256c><span class="total-label" data-v-a25e256c>Subtotal</span><span class="total-value" data-v-a25e256c>${ssrInterpolate(money(subtotal.value))}</span></div>`);
				if (discountValue.value > 0) _push(`<div class="pos-total-row" data-v-a25e256c><span class="total-label discount" data-v-a25e256c>Discount</span><span class="total-value discount" data-v-a25e256c>− ${ssrInterpolate(money(discountValue.value))}</span></div>`);
				else _push(`<!---->`);
				if (promoDiscount.value > 0) _push(`<div class="pos-total-row" data-v-a25e256c><span class="total-label discount" data-v-a25e256c>Promo · ${ssrInterpolate(appliedPromo.value.code)}</span><span class="total-value discount" data-v-a25e256c>− ${ssrInterpolate(money(promoDiscount.value))}</span></div>`);
				else _push(`<!---->`);
				if (loyaltyDiscount.value > 0) _push(`<div class="pos-total-row" data-v-a25e256c><span class="total-label discount" data-v-a25e256c>Points · ${ssrInterpolate(redeemPointsValue.value)}</span><span class="total-value discount" data-v-a25e256c>− ${ssrInterpolate(money(loyaltyDiscount.value))}</span></div>`);
				else _push(`<!---->`);
				if (serviceCharges.value > 0) _push(`<div class="pos-total-row" data-v-a25e256c><span class="total-label" data-v-a25e256c>Service Charge</span><span class="total-value" data-v-a25e256c>+ ${ssrInterpolate(money(serviceCharges.value))}</span></div>`);
				else _push(`<!---->`);
				_push(`<div class="pos-total-row pos-total-row--grand" data-v-a25e256c><span class="grand-label" data-v-a25e256c>Grand Total</span><span class="grand-value" data-v-a25e256c>${ssrInterpolate(money(grandTotal.value))}</span></div>`);
				if (discountsOverflow.value) _push(`<p class="pos-crm__hint pos-crm__hint--bad" data-v-a25e256c> The discounts together exceed the subtotal — reduce one of them. </p>`);
				else if (pointsToEarn.value > 0) _push(`<p class="pos-crm__hint pos-crm__hint--ok" data-v-a25e256c> Earns ${ssrInterpolate(pointsToEarn.value)} point(s) once saved. </p>`);
				else _push(`<!---->`);
				_push(`</div>`);
			} else _push(`<!---->`);
			if (cart.value.length) {
				_push(`<div class="pos-actions" data-v-a25e256c><button class="ui-btn ui-btn--ghost ui-btn--lg" type="button" data-v-a25e256c> Cancel </button><button class="ui-btn ui-btn--primary ui-btn--lg" type="button"${ssrIncludeBooleanAttr(saving.value) ? " disabled" : ""} data-v-a25e256c>`);
				if (saving.value) _push(`<span class="btn-spinner" data-v-a25e256c></span>`);
				else _push(`<span data-v-a25e256c>Place Order · ${ssrInterpolate(money(grandTotal.value))}</span>`);
				_push(`</button></div>`);
			} else _push(`<!---->`);
			_push(`</div></div></div></div>`);
		};
	}
};
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/pages/POS.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var POS_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-a25e256c"]]);
//#endregion
export { POS_default as default };
