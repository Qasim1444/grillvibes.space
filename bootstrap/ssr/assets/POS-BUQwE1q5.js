import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-BOaGB7Aw.js";
import { t as _sfc_main$1 } from "./PageHeader-D0aRDn5C.js";
import { t as Modal_default } from "./Modal-CpmFAnsY.js";
import { t as _sfc_main$2 } from "./FormField-Doe8oR1s.js";
import { t as CustomerPicker_default } from "./CustomerPicker-Bya7Uknk.js";
import { Fragment, computed, createBlock, createCommentVNode, createTextVNode, createVNode, mergeProps, onBeforeUnmount, onMounted, openBlock, ref, renderList, toDisplayString, useSSRContext, watch, withCtx } from "vue";
import { router, usePage } from "@inertiajs/vue3";
import { ssrIncludeBooleanAttr, ssrInterpolate, ssrLooseContain, ssrLooseEqual, ssrRenderAttr, ssrRenderAttrs, ssrRenderClass, ssrRenderComponent, ssrRenderList } from "vue/server-renderer";
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
		ingredients: {
			type: Array,
			default: () => []
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
		},
		quickReport: {
			type: Array,
			default: () => []
		},
		topTen: {
			type: Array,
			default: () => []
		}
	},
	setup(__props) {
		const props = __props;
		const page = usePage();
		const theme = ref("light");
		const themeReady = ref(false);
		const themeKey = computed(() => `grillvibes_admin_theme_${page.props.auth?.user?.id ?? "guest"}`);
		onMounted(() => {
			theme.value = localStorage.getItem(themeKey.value) === "dark" ? "dark" : "light";
			document.documentElement.dataset.adminTheme = theme.value;
			themeReady.value = true;
		});
		watch(theme, (value) => {
			if (!themeReady.value) return;
			localStorage.setItem(themeKey.value, value);
			document.documentElement.dataset.adminTheme = value;
		});
		onBeforeUnmount(() => {
			if (document.documentElement.dataset.adminTheme === theme.value) delete document.documentElement.dataset.adminTheme;
		});
		const toggleTheme = () => {
			theme.value = theme.value === "dark" ? "light" : "dark";
		};
		const goAdmin = () => router.visit("/");
		const money = (v) => `Rs ${Number(v || 0).toFixed(2)}`;
		const orderType = (value) => ({
			dining: "Dining",
			delivery: "Delivery",
			"on-way": "Takeaway"
		})[value] || value || "—";
		const statusLabel = (value) => String(value || "—").replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
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
		const quickReport = computed(() => props.quickReport);
		const topTen = computed(() => props.topTen);
		const itemsLoading = ref(false);
		const loadError = ref("");
		const saveError = ref("");
		const successMsg = ref("");
		const receiptUrl = ref("");
		const saving = ref(false);
		const showQuickReport = ref(false);
		const showTopTen = ref(false);
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
		const extraPrice = (extra) => {
			const ingredient = props.ingredients.find((item) => Number(item.id) === Number(extra.ingredient_id));
			return Number((num(extra.quantity) * num(ingredient?.average_cost)).toFixed(2));
		};
		const lineExtraPrice = (line) => (line.extras ?? []).reduce((sum, extra) => sum + extraPrice(extra), 0);
		const lineTotal = (line) => (num(line.price) + lineExtraPrice(line)) * num(line.quantity);
		const selectedIngredientUnit = (extra) => props.ingredients.find((ingredient) => Number(ingredient.id) === Number(extra.ingredient_id))?.unit ?? "";
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
			_push(`<div${ssrRenderAttrs(mergeProps({
				class: "page pos",
				"data-theme": theme.value
			}, _attrs))} data-v-bec3ca87>`);
			_push(ssrRenderComponent(_sfc_main$1, {
				title: "Point of Sale",
				subtitle: "Build an order and send it to the kitchen."
			}, {
				actions: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<button class="ui-btn ui-btn--ghost pos-theme-toggle" type="button"${ssrRenderAttr("aria-pressed", theme.value === "dark")}${ssrRenderAttr("aria-label", `Switch to ${theme.value === "dark" ? "light" : "dark"} mode`)} data-v-bec3ca87${_scopeId}>`);
						if (theme.value === "dark") _push(`<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" data-v-bec3ca87${_scopeId}><circle cx="12" cy="12" r="4" data-v-bec3ca87${_scopeId}></circle><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" data-v-bec3ca87${_scopeId}></path></svg>`);
						else _push(`<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" data-v-bec3ca87${_scopeId}><path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z" data-v-bec3ca87${_scopeId}></path></svg>`);
						_push(` ${ssrInterpolate(theme.value === "dark" ? "Light mode" : "Dark mode")}</button><button class="ui-btn ui-btn--ghost" data-v-bec3ca87${_scopeId}><span class="btn-icon" data-v-bec3ca87${_scopeId}>⚙</span> Admin </button><button class="ui-btn ui-btn--ghost"${ssrIncludeBooleanAttr(itemsLoading.value) ? " disabled" : ""} data-v-bec3ca87${_scopeId}><span class="${ssrRenderClass([{ "spin": itemsLoading.value }, "btn-icon"])}" data-v-bec3ca87${_scopeId}>↻</span> ${ssrInterpolate(itemsLoading.value ? "Loading…" : "Refresh")}</button>`);
					} else return [
						createVNode("button", {
							class: "ui-btn ui-btn--ghost pos-theme-toggle",
							type: "button",
							"aria-pressed": theme.value === "dark",
							"aria-label": `Switch to ${theme.value === "dark" ? "light" : "dark"} mode`,
							onClick: toggleTheme
						}, [theme.value === "dark" ? (openBlock(), createBlock("svg", {
							key: 0,
							viewBox: "0 0 24 24",
							width: "16",
							height: "16",
							fill: "none",
							stroke: "currentColor",
							"stroke-width": "1.8",
							"stroke-linecap": "round",
							"stroke-linejoin": "round",
							"aria-hidden": "true"
						}, [createVNode("circle", {
							cx: "12",
							cy: "12",
							r: "4"
						}), createVNode("path", { d: "M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" })])) : (openBlock(), createBlock("svg", {
							key: 1,
							viewBox: "0 0 24 24",
							width: "16",
							height: "16",
							fill: "none",
							stroke: "currentColor",
							"stroke-width": "1.8",
							"stroke-linecap": "round",
							"stroke-linejoin": "round",
							"aria-hidden": "true"
						}, [createVNode("path", { d: "M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z" })])), createTextVNode(" " + toDisplayString(theme.value === "dark" ? "Light mode" : "Dark mode"), 1)], 8, ["aria-pressed", "aria-label"]),
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
			if (loadError.value) _push(`<div class="ui-alert ui-alert--danger" data-v-bec3ca87><span class="alert-icon" data-v-bec3ca87>⚠</span> ${ssrInterpolate(loadError.value)}</div>`);
			else _push(`<!---->`);
			_push(`<div class="pos-layout" data-v-bec3ca87><div class="pos-menu" data-v-bec3ca87><div class="ui-card pos-menu-card" data-v-bec3ca87><div class="pos-toolbar" data-v-bec3ca87><div class="search-wrapper" data-v-bec3ca87><span class="search-icon" data-v-bec3ca87>🔍</span><input${ssrRenderAttr("value", search.value)} class="ui-input pos-search" type="search" placeholder="Search menu items…" aria-label="Search food items" data-v-bec3ca87>`);
			if (search.value) _push(`<button class="search-clear" aria-label="Clear search" data-v-bec3ca87>×</button>`);
			else _push(`<!---->`);
			_push(`</div><div class="pos-cats" role="tablist" aria-label="Food categories" data-v-bec3ca87><button class="${ssrRenderClass([{ "pos-cat--active": activeCat.value === null }, "pos-cat"])}" role="tab"${ssrRenderAttr("aria-selected", activeCat.value === null)} data-v-bec3ca87> All Items </button><!--[-->`);
			ssrRenderList(categories.value, (c) => {
				_push(`<button class="${ssrRenderClass([{ "pos-cat--active": activeCat.value === c.id }, "pos-cat"])}" role="tab"${ssrRenderAttr("aria-selected", activeCat.value === c.id)} data-v-bec3ca87>${ssrInterpolate(c.name)}</button>`);
			});
			_push(`<!--]--></div></div>`);
			if (itemsLoading.value) {
				_push(`<div class="pos-loading" data-v-bec3ca87><div class="skeleton-grid" data-v-bec3ca87><!--[-->`);
				ssrRenderList(8, (n) => {
					_push(`<div class="skeleton-tile" data-v-bec3ca87><div class="skeleton-img" data-v-bec3ca87></div><div class="skeleton-text" data-v-bec3ca87></div><div class="skeleton-text short" data-v-bec3ca87></div></div>`);
				});
				_push(`<!--]--></div></div>`);
			} else if (!filteredItems.value.length) {
				_push(`<div class="pos-empty" data-v-bec3ca87><div class="empty-icon" data-v-bec3ca87>🔍</div><p data-v-bec3ca87>No items match your search.</p>`);
				if (search.value || activeCat.value) _push(`<button class="ui-btn ui-btn--sm" data-v-bec3ca87> Clear filters </button>`);
				else _push(`<!---->`);
				_push(`</div>`);
			} else {
				_push(`<div class="pos-grid" data-v-bec3ca87><!--[-->`);
				ssrRenderList(filteredItems.value, (item) => {
					_push(`<button class="pos-tile" type="button"${ssrRenderAttr("aria-label", `Add ${item.name} for ${money(item.price)}`)} data-v-bec3ca87><div class="pos-tile__img-wrap" data-v-bec3ca87>`);
					if (item.image) _push(`<img${ssrRenderAttr("src", item.image)}${ssrRenderAttr("alt", item.name)} class="pos-tile__img" loading="lazy" data-v-bec3ca87>`);
					else _push(`<span class="pos-tile__img pos-tile__img--empty" aria-hidden="true" data-v-bec3ca87><span class="food-emoji" data-v-bec3ca87>${ssrInterpolate(getFoodEmoji(item.name))}</span></span>`);
					_push(`<div class="pos-tile__overlay" data-v-bec3ca87><span class="add-icon" data-v-bec3ca87>+</span></div></div><div class="pos-tile__info" data-v-bec3ca87><span class="pos-tile__name" data-v-bec3ca87>${ssrInterpolate(item.name)}</span><span class="pos-tile__price" data-v-bec3ca87>${ssrInterpolate(money(item.price))}</span></div></button>`);
				});
				_push(`<!--]--></div>`);
			}
			_push(`</div></div><div class="pos-cart" data-v-bec3ca87><div class="ui-card pos-cart-card" data-v-bec3ca87><div class="pos-cart-header" data-v-bec3ca87><div class="pos-cart-title" data-v-bec3ca87><span class="cart-icon" data-v-bec3ca87>🛒</span><span data-v-bec3ca87>Current Order</span><span class="pos-chip" data-v-bec3ca87>${ssrInterpolate(totalQty.value)}</span></div>`);
			if (cart.value.length) _push(`<button class="clear-btn" type="button" aria-label="Clear cart" data-v-bec3ca87> Clear all </button>`);
			else _push(`<!---->`);
			_push(`</div><!--[-->`);
			if (saveError.value) _push(`<div class="ui-alert ui-alert--danger" data-v-bec3ca87><span class="alert-icon" data-v-bec3ca87>⚠</span> ${ssrInterpolate(saveError.value)}</div>`);
			if (successMsg.value) {
				_push(`<div class="ui-alert ui-alert--success" data-v-bec3ca87><span class="alert-icon" data-v-bec3ca87>✓</span> ${ssrInterpolate(successMsg.value)} `);
				if (receiptUrl.value) _push(`<a class="pos-print-link"${ssrRenderAttr("href", receiptUrl.value)} target="_blank" rel="noopener" data-v-bec3ca87>Print receipt</a>`);
				else _push(`<!---->`);
				_push(`</div>`);
			}
			_push(`<!--]--><div class="${ssrRenderClass([{ "pos-lines--empty": !cart.value.length }, "pos-lines"])}" data-v-bec3ca87>`);
			if (!cart.value.length) _push(`<div class="pos-empty-state" data-v-bec3ca87><div class="empty-illustration" data-v-bec3ca87>🛒</div><p class="empty-title" data-v-bec3ca87>Your cart is empty</p><p class="empty-subtitle" data-v-bec3ca87>Tap items from the menu to start building an order.</p></div>`);
			else _push(`<!---->`);
			_push(`<div${ssrRenderAttrs({
				name: "cart-item",
				class: "cart-items"
			})} data-v-bec3ca87>`);
			ssrRenderList(cart.value, (line) => {
				_push(`<div class="pos-line" data-v-bec3ca87><div class="pos-line__content" data-v-bec3ca87><div class="pos-line__main" data-v-bec3ca87><span class="pos-line__name" data-v-bec3ca87>${ssrInterpolate(line.name)}</span><button class="pos-line__x" type="button"${ssrRenderAttr("aria-label", `Remove ${line.name}`)} data-v-bec3ca87><span data-v-bec3ca87>×</span></button></div><div class="pos-line__details" data-v-bec3ca87><div class="pos-qty" data-v-bec3ca87><button type="button" aria-label="Decrease quantity"${ssrIncludeBooleanAttr(line.quantity <= 1) ? " disabled" : ""} data-v-bec3ca87>−</button><span class="qty-value" data-v-bec3ca87>${ssrInterpolate(line.quantity)}</span><button type="button" aria-label="Increase quantity" data-v-bec3ca87>+</button></div><span class="pos-line__unit" data-v-bec3ca87>${ssrInterpolate(money(line.price + lineExtraPrice(line)))} each</span><span class="pos-line__sub" data-v-bec3ca87>${ssrInterpolate(money(lineTotal(line)))}</span></div><input${ssrRenderAttr("value", line.add_note)} class="ui-input pos-line__note" type="text" placeholder="Add a note…"${ssrRenderAttr("aria-label", `Note for ${line.name}`)} data-v-bec3ca87><div class="pos-extras" data-v-bec3ca87><div class="pos-extras__header" data-v-bec3ca87><strong data-v-bec3ca87>Extra toppings</strong><button type="button" class="pos-extras__add" data-v-bec3ca87>+ Add ingredient</button></div><small class="pos-extras__hint" data-v-bec3ca87>Extra price is calculated from the current ingredient cost and quantity used.</small><!--[-->`);
				ssrRenderList(line.extras, (extra, extraIndex) => {
					_push(`<div class="pos-extra" data-v-bec3ca87><select class="ui-select"${ssrRenderAttr("aria-label", `Extra topping for ${line.name}`)} data-v-bec3ca87><option value="" data-v-bec3ca87${ssrIncludeBooleanAttr(Array.isArray(extra.ingredient_id) ? ssrLooseContain(extra.ingredient_id, "") : ssrLooseEqual(extra.ingredient_id, "")) ? " selected" : ""}>Choose ingredient</option><!--[-->`);
					ssrRenderList(props.ingredients, (ingredient) => {
						_push(`<option${ssrRenderAttr("value", ingredient.id)} data-v-bec3ca87${ssrIncludeBooleanAttr(Array.isArray(extra.ingredient_id) ? ssrLooseContain(extra.ingredient_id, ingredient.id) : ssrLooseEqual(extra.ingredient_id, ingredient.id)) ? " selected" : ""}>${ssrInterpolate(ingredient.name)} (${ssrInterpolate(ingredient.unit)}, stock ${ssrInterpolate(Number(ingredient.available_quantity).toFixed(2))}) </option>`);
					});
					_push(`<!--]--></select><input${ssrRenderAttr("value", extra.quantity)} type="number" min="0.0001" step="0.0001" class="ui-input pos-extra__qty" aria-label="Extra ingredient quantity per item"${ssrRenderAttr("placeholder", `Qty (${selectedIngredientUnit(extra) || "unit"})`)} data-v-bec3ca87><input${ssrRenderAttr("value", money(extraPrice(extra)))} type="text" class="ui-input pos-extra__price" aria-label="Calculated extra topping price per serving" readonly data-v-bec3ca87><button type="button" class="pos-extras__remove" aria-label="Remove extra topping" data-v-bec3ca87>×</button></div>`);
				});
				_push(`<!--]--></div><select class="ui-select pos-line__station"${ssrRenderAttr("aria-label", `KDS station for ${line.name}`)} data-v-bec3ca87><option${ssrRenderAttr("value", null)} data-v-bec3ca87${ssrIncludeBooleanAttr(Array.isArray(line.kds_station_id) ? ssrLooseContain(line.kds_station_id, null) : ssrLooseEqual(line.kds_station_id, null)) ? " selected" : ""}>Auto KDS station</option><!--[-->`);
				ssrRenderList(__props.kdsStations, (s) => {
					_push(`<option${ssrRenderAttr("value", s.id)} data-v-bec3ca87${ssrIncludeBooleanAttr(Array.isArray(line.kds_station_id) ? ssrLooseContain(line.kds_station_id, s.id) : ssrLooseEqual(line.kds_station_id, s.id)) ? " selected" : ""}>${ssrInterpolate(s.name)}</option>`);
				});
				_push(`<!--]--></select></div></div>`);
			});
			_push(`</div></div>`);
			if (cart.value.length) {
				_push(`<div class="pos-fields" data-v-bec3ca87><div class="field-group" data-v-bec3ca87>`);
				_push(ssrRenderComponent(_sfc_main$2, {
					modelValue: form.value.type,
					"onUpdate:modelValue": ($event) => form.value.type = $event,
					label: "Order Type",
					type: "select"
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) _push(`<option value="dining" data-v-bec3ca87${_scopeId}>🍽 Dining In</option><option value="delivery" data-v-bec3ca87${_scopeId}>🚚 Delivery</option><option value="on-way" data-v-bec3ca87${_scopeId}>🥡 Takeaway</option>`);
						else return [
							createVNode("option", { value: "dining" }, "🍽 Dining In"),
							createVNode("option", { value: "delivery" }, "🚚 Delivery"),
							createVNode("option", { value: "on-way" }, "🥡 Takeaway")
						];
					}),
					_: 1
				}, _parent));
				_push(`</div><div class="field-group" data-v-bec3ca87>`);
				_push(ssrRenderComponent(_sfc_main$2, {
					modelValue: form.value.place_id,
					"onUpdate:modelValue": ($event) => form.value.place_id = $event,
					label: "Table / Place",
					type: "select"
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) {
							_push(`<option value="" data-v-bec3ca87${_scopeId}>— Select —</option><!--[-->`);
							ssrRenderList(places.value, (p) => {
								_push(`<option${ssrRenderAttr("value", p.id)} data-v-bec3ca87${_scopeId}>${ssrInterpolate(p.name)}</option>`);
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
				_push(`</div><div class="field-group field-group--full" data-v-bec3ca87>`);
				_push(ssrRenderComponent(CustomerPicker_default, {
					modelValue: form.value.customer_id,
					"onUpdate:modelValue": ($event) => form.value.customer_id = $event,
					label: customerRequired.value ? "Customer *" : "Customer",
					placeholder: customerRequired.value ? "Search customer (required)…" : "Search customer or leave for walk-in…",
					class: { "field-required": customerRequired.value },
					onPicked: onCustomerPicked
				}, null, _parent));
				_push(`</div><div class="field-group" data-v-bec3ca87>`);
				_push(ssrRenderComponent(_sfc_main$2, {
					modelValue: form.value.status,
					"onUpdate:modelValue": ($event) => form.value.status = $event,
					label: "Status",
					type: "select"
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) _push(`<option value="pending" data-v-bec3ca87${_scopeId}>⏳ Pending</option><option value="preparing" data-v-bec3ca87${_scopeId}>👨‍🍳 Preparing</option><option value="on-way" data-v-bec3ca87${_scopeId}>🚚 On the way</option><option value="completed" data-v-bec3ca87${_scopeId}>✅ Completed</option>`);
						else return [
							createVNode("option", { value: "pending" }, "⏳ Pending"),
							createVNode("option", { value: "preparing" }, "👨‍🍳 Preparing"),
							createVNode("option", { value: "on-way" }, "🚚 On the way"),
							createVNode("option", { value: "completed" }, "✅ Completed")
						];
					}),
					_: 1
				}, _parent));
				_push(`</div><div class="field-group" data-v-bec3ca87>`);
				_push(ssrRenderComponent(_sfc_main$2, {
					modelValue: form.value.paid,
					"onUpdate:modelValue": ($event) => form.value.paid = $event,
					label: "Payment",
					type: "select"
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) _push(`<option${ssrRenderAttr("value", false)} data-v-bec3ca87${_scopeId}>⏳ Unpaid</option><option${ssrRenderAttr("value", true)} data-v-bec3ca87${_scopeId}>✅ Paid</option>`);
						else return [createVNode("option", { value: false }, "⏳ Unpaid"), createVNode("option", { value: true }, "✅ Paid")];
					}),
					_: 1
				}, _parent));
				_push(`</div><div class="field-group" data-v-bec3ca87>`);
				_push(ssrRenderComponent(_sfc_main$2, {
					modelValue: form.value.discount_type,
					"onUpdate:modelValue": ($event) => form.value.discount_type = $event,
					label: "Discount Type",
					type: "select"
				}, {
					default: withCtx((_, _push, _parent, _scopeId) => {
						if (_push) _push(`<option value="amount" data-v-bec3ca87${_scopeId}>Fixed Amount</option><option value="percentage" data-v-bec3ca87${_scopeId}>Percentage</option>`);
						else return [createVNode("option", { value: "amount" }, "Fixed Amount"), createVNode("option", { value: "percentage" }, "Percentage")];
					}),
					_: 1
				}, _parent));
				_push(`</div><div class="field-group" data-v-bec3ca87>`);
				_push(ssrRenderComponent(_sfc_main$2, {
					modelValue: form.value.discount_amount,
					"onUpdate:modelValue": ($event) => form.value.discount_amount = $event,
					label: form.value.discount_type === "percentage" ? "Discount %" : "Discount $",
					type: "number",
					step: "0.01",
					min: "0"
				}, null, _parent));
				_push(`</div><div class="field-group" data-v-bec3ca87>`);
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
				_push(`<div class="pos-crm" data-v-bec3ca87>`);
				if (suggestedCampaigns.value.length) {
					_push(`<div class="pos-crm__suggest" data-v-bec3ca87><span class="ui-label" data-v-bec3ca87>Running Offers</span><div class="pos-crm__chips" data-v-bec3ca87><!--[-->`);
					ssrRenderList(suggestedCampaigns.value, (c) => {
						_push(`<button type="button" class="pos-chip" data-v-bec3ca87>${ssrInterpolate(c.name)} · − ${ssrInterpolate(money(c.discount))}</button>`);
					});
					_push(`<!--]--></div></div>`);
				} else _push(`<!---->`);
				_push(`<div class="pos-crm__row" data-v-bec3ca87><div class="pos-crm__cell" data-v-bec3ca87><label class="ui-label" for="pos-promo" data-v-bec3ca87>Promo Code</label><div class="pos-crm__inline" data-v-bec3ca87><input id="pos-promo"${ssrRenderAttr("value", promoInput.value)} class="ui-input" type="text" autocomplete="off" placeholder="e.g. FLAT100"${ssrIncludeBooleanAttr(!!appliedPromo.value) ? " disabled" : ""} data-v-bec3ca87>`);
				if (appliedPromo.value) _push(`<button type="button" class="ui-btn ui-btn--ghost" data-v-bec3ca87> Remove </button>`);
				else _push(`<button type="button" class="ui-btn ui-btn--ghost"${ssrIncludeBooleanAttr(promoChecking.value || !promoInput.value.trim()) ? " disabled" : ""} data-v-bec3ca87>${ssrInterpolate(promoChecking.value ? "Checking…" : "Apply")}</button>`);
				_push(`</div>`);
				if (promoError.value) _push(`<p class="pos-crm__hint pos-crm__hint--bad" data-v-bec3ca87>${ssrInterpolate(promoError.value)}</p>`);
				else if (appliedPromo.value) _push(`<p class="pos-crm__hint pos-crm__hint--ok" data-v-bec3ca87>${ssrInterpolate(appliedPromo.value.code)} applied — ${ssrInterpolate(money(promoDiscount.value))} off. </p>`);
				else _push(`<p class="pos-crm__hint" data-v-bec3ca87>The discount is priced by the server, not here.</p>`);
				_push(`</div><div class="pos-crm__cell" data-v-bec3ca87><label class="ui-label" for="pos-points" data-v-bec3ca87>Redeem Points</label><div class="pos-crm__inline" data-v-bec3ca87><input id="pos-points"${ssrRenderAttr("value", redeemPoints.value)} class="ui-input" type="number" min="0" step="1"${ssrIncludeBooleanAttr(!pointsAvailable.value) ? " disabled" : ""} data-v-bec3ca87><button type="button" class="ui-btn ui-btn--ghost"${ssrIncludeBooleanAttr(!maxRedeemPoints.value) ? " disabled" : ""} data-v-bec3ca87> Max </button></div>`);
				if (pointsError.value) _push(`<p class="pos-crm__hint pos-crm__hint--bad" data-v-bec3ca87>${ssrInterpolate(pointsError.value)}</p>`);
				else _push(`<p class="pos-crm__hint" data-v-bec3ca87>${ssrInterpolate(pointsHint.value)}</p>`);
				_push(`</div></div></div>`);
			} else _push(`<!---->`);
			if (cart.value.length) {
				_push(`<div class="pos-totals" data-v-bec3ca87><div class="pos-total-row" data-v-bec3ca87><span class="total-label" data-v-bec3ca87>Subtotal</span><span class="total-value" data-v-bec3ca87>${ssrInterpolate(money(subtotal.value))}</span></div>`);
				if (discountValue.value > 0) _push(`<div class="pos-total-row" data-v-bec3ca87><span class="total-label discount" data-v-bec3ca87>Discount</span><span class="total-value discount" data-v-bec3ca87>− ${ssrInterpolate(money(discountValue.value))}</span></div>`);
				else _push(`<!---->`);
				if (promoDiscount.value > 0) _push(`<div class="pos-total-row" data-v-bec3ca87><span class="total-label discount" data-v-bec3ca87>Promo · ${ssrInterpolate(appliedPromo.value.code)}</span><span class="total-value discount" data-v-bec3ca87>− ${ssrInterpolate(money(promoDiscount.value))}</span></div>`);
				else _push(`<!---->`);
				if (loyaltyDiscount.value > 0) _push(`<div class="pos-total-row" data-v-bec3ca87><span class="total-label discount" data-v-bec3ca87>Points · ${ssrInterpolate(redeemPointsValue.value)}</span><span class="total-value discount" data-v-bec3ca87>− ${ssrInterpolate(money(loyaltyDiscount.value))}</span></div>`);
				else _push(`<!---->`);
				if (serviceCharges.value > 0) _push(`<div class="pos-total-row" data-v-bec3ca87><span class="total-label" data-v-bec3ca87>Service Charge</span><span class="total-value" data-v-bec3ca87>+ ${ssrInterpolate(money(serviceCharges.value))}</span></div>`);
				else _push(`<!---->`);
				_push(`<div class="pos-total-row pos-total-row--grand" data-v-bec3ca87><span class="grand-label" data-v-bec3ca87>Grand Total</span><span class="grand-value" data-v-bec3ca87>${ssrInterpolate(money(grandTotal.value))}</span></div>`);
				if (discountsOverflow.value) _push(`<p class="pos-crm__hint pos-crm__hint--bad" data-v-bec3ca87> The discounts together exceed the subtotal — reduce one of them. </p>`);
				else if (pointsToEarn.value > 0) _push(`<p class="pos-crm__hint pos-crm__hint--ok" data-v-bec3ca87> Earns ${ssrInterpolate(pointsToEarn.value)} point(s) once saved. </p>`);
				else _push(`<!---->`);
				_push(`</div>`);
			} else _push(`<!---->`);
			if (cart.value.length) {
				_push(`<div class="pos-actions" data-v-bec3ca87><button class="ui-btn ui-btn--ghost ui-btn--lg" type="button" data-v-bec3ca87> Cancel </button><button class="ui-btn ui-btn--primary ui-btn--lg" type="button"${ssrIncludeBooleanAttr(saving.value) ? " disabled" : ""} data-v-bec3ca87>`);
				if (saving.value) _push(`<span class="btn-spinner" data-v-bec3ca87></span>`);
				else _push(`<span data-v-bec3ca87>Place Order · ${ssrInterpolate(money(grandTotal.value))}</span>`);
				_push(`</button></div>`);
			} else _push(`<!---->`);
			_push(`</div></div></div><section class="pos-report-actions ui-card" data-v-bec3ca87><div data-v-bec3ca87><h2 data-v-bec3ca87>POS Reports</h2><p data-v-bec3ca87>Open today’s quick report or top deals without leaving POS.</p></div><div class="pos-report-actions__buttons" data-v-bec3ca87><button class="ui-btn ui-btn--ghost" type="button" data-v-bec3ca87> Quick Report — Today <span class="pos-report-count" data-v-bec3ca87>${ssrInterpolate(quickReport.value.length)}</span></button><button class="ui-btn ui-btn--ghost" type="button" data-v-bec3ca87> Top 10 Deals — Today <span class="pos-report-count" data-v-bec3ca87>${ssrInterpolate(topTen.value.length)}</span></button></div></section>`);
			_push(ssrRenderComponent(Modal_default, {
				modelValue: showQuickReport.value,
				"onUpdate:modelValue": ($event) => showQuickReport.value = $event,
				title: "Quick Report — Today",
				width: "820px"
			}, {
				footer: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<button class="ui-btn ui-btn--ghost" type="button" data-v-bec3ca87${_scopeId}>Close</button>`);
					else return [createVNode("button", {
						class: "ui-btn ui-btn--ghost",
						type: "button",
						onClick: ($event) => showQuickReport.value = false
					}, "Close", 8, ["onClick"])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div class="pos-report-card" data-v-bec3ca87${_scopeId}><div class="pos-report-table-wrap" data-v-bec3ca87${_scopeId}><table class="pos-report-table" data-v-bec3ca87${_scopeId}><thead data-v-bec3ca87${_scopeId}><tr data-v-bec3ca87${_scopeId}><th data-v-bec3ca87${_scopeId}>Order</th><th data-v-bec3ca87${_scopeId}>Customer</th><th data-v-bec3ca87${_scopeId}>Type</th><th data-v-bec3ca87${_scopeId}>Status</th><th data-v-bec3ca87${_scopeId}>Total</th></tr></thead><tbody data-v-bec3ca87${_scopeId}>`);
						if (!quickReport.value.length) _push(`<tr data-v-bec3ca87${_scopeId}><td colspan="5" class="pos-report-empty" data-v-bec3ca87${_scopeId}>No orders today.</td></tr>`);
						else _push(`<!---->`);
						_push(`<!--[-->`);
						ssrRenderList(quickReport.value, (order) => {
							_push(`<tr data-v-bec3ca87${_scopeId}><td data-v-bec3ca87${_scopeId}>#${ssrInterpolate(order.id)}</td><td data-v-bec3ca87${_scopeId}>${ssrInterpolate(order.customer?.name || "Guest")}</td><td data-v-bec3ca87${_scopeId}>${ssrInterpolate(orderType(order.type))}</td><td data-v-bec3ca87${_scopeId}><span class="pos-status" data-v-bec3ca87${_scopeId}>${ssrInterpolate(statusLabel(order.status))}</span></td><td class="pos-report-money" data-v-bec3ca87${_scopeId}>${ssrInterpolate(money(order.grand_total))}</td></tr>`);
						});
						_push(`<!--]--></tbody></table></div></div>`);
					} else return [createVNode("div", { class: "pos-report-card" }, [createVNode("div", { class: "pos-report-table-wrap" }, [createVNode("table", { class: "pos-report-table" }, [createVNode("thead", null, [createVNode("tr", null, [
						createVNode("th", null, "Order"),
						createVNode("th", null, "Customer"),
						createVNode("th", null, "Type"),
						createVNode("th", null, "Status"),
						createVNode("th", null, "Total")
					])]), createVNode("tbody", null, [!quickReport.value.length ? (openBlock(), createBlock("tr", { key: 0 }, [createVNode("td", {
						colspan: "5",
						class: "pos-report-empty"
					}, "No orders today.")])) : createCommentVNode("", true), (openBlock(true), createBlock(Fragment, null, renderList(quickReport.value, (order) => {
						return openBlock(), createBlock("tr", { key: `quick-${order.id}` }, [
							createVNode("td", null, "#" + toDisplayString(order.id), 1),
							createVNode("td", null, toDisplayString(order.customer?.name || "Guest"), 1),
							createVNode("td", null, toDisplayString(orderType(order.type)), 1),
							createVNode("td", null, [createVNode("span", { class: "pos-status" }, toDisplayString(statusLabel(order.status)), 1)]),
							createVNode("td", { class: "pos-report-money" }, toDisplayString(money(order.grand_total)), 1)
						]);
					}), 128))])])])])];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(Modal_default, {
				modelValue: showTopTen.value,
				"onUpdate:modelValue": ($event) => showTopTen.value = $event,
				title: "Top 10 Deals — Today",
				width: "760px"
			}, {
				footer: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<button class="ui-btn ui-btn--ghost" type="button" data-v-bec3ca87${_scopeId}>Close</button>`);
					else return [createVNode("button", {
						class: "ui-btn ui-btn--ghost",
						type: "button",
						onClick: ($event) => showTopTen.value = false
					}, "Close", 8, ["onClick"])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div class="pos-report-card" data-v-bec3ca87${_scopeId}><div class="pos-report-table-wrap" data-v-bec3ca87${_scopeId}><table class="pos-report-table" data-v-bec3ca87${_scopeId}><thead data-v-bec3ca87${_scopeId}><tr data-v-bec3ca87${_scopeId}><th data-v-bec3ca87${_scopeId}>Order</th><th data-v-bec3ca87${_scopeId}>Customer</th><th data-v-bec3ca87${_scopeId}>Type</th><th data-v-bec3ca87${_scopeId}>Total</th></tr></thead><tbody data-v-bec3ca87${_scopeId}>`);
						if (!topTen.value.length) _push(`<tr data-v-bec3ca87${_scopeId}><td colspan="4" class="pos-report-empty" data-v-bec3ca87${_scopeId}>No top deals today.</td></tr>`);
						else _push(`<!---->`);
						_push(`<!--[-->`);
						ssrRenderList(topTen.value, (order) => {
							_push(`<tr data-v-bec3ca87${_scopeId}><td data-v-bec3ca87${_scopeId}>#${ssrInterpolate(order.id)}</td><td data-v-bec3ca87${_scopeId}>${ssrInterpolate(order.customer?.name || "Guest")}</td><td data-v-bec3ca87${_scopeId}>${ssrInterpolate(orderType(order.type))}</td><td class="pos-report-money" data-v-bec3ca87${_scopeId}>${ssrInterpolate(money(order.grand_total))}</td></tr>`);
						});
						_push(`<!--]--></tbody></table></div></div>`);
					} else return [createVNode("div", { class: "pos-report-card" }, [createVNode("div", { class: "pos-report-table-wrap" }, [createVNode("table", { class: "pos-report-table" }, [createVNode("thead", null, [createVNode("tr", null, [
						createVNode("th", null, "Order"),
						createVNode("th", null, "Customer"),
						createVNode("th", null, "Type"),
						createVNode("th", null, "Total")
					])]), createVNode("tbody", null, [!topTen.value.length ? (openBlock(), createBlock("tr", { key: 0 }, [createVNode("td", {
						colspan: "4",
						class: "pos-report-empty"
					}, "No top deals today.")])) : createCommentVNode("", true), (openBlock(true), createBlock(Fragment, null, renderList(topTen.value, (order) => {
						return openBlock(), createBlock("tr", { key: `top-${order.id}` }, [
							createVNode("td", null, "#" + toDisplayString(order.id), 1),
							createVNode("td", null, toDisplayString(order.customer?.name || "Guest"), 1),
							createVNode("td", null, toDisplayString(orderType(order.type)), 1),
							createVNode("td", { class: "pos-report-money" }, toDisplayString(money(order.grand_total)), 1)
						]);
					}), 128))])])])])];
				}),
				_: 1
			}, _parent));
			_push(`</div>`);
		};
	}
};
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/pages/POS.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var POS_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-bec3ca87"]]);
//#endregion
export { POS_default as default };
