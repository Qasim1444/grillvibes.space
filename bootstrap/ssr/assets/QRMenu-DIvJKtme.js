import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-BOaGB7Aw.js";
import { computed, mergeProps, onMounted, onUnmounted, ref, useSSRContext } from "vue";
import { ssrIncludeBooleanAttr, ssrInterpolate, ssrRenderAttr, ssrRenderAttrs, ssrRenderClass, ssrRenderList } from "vue/server-renderer";
//#region resources/js/pages/Guest/QRMenu.vue
var _sfc_main = /*@__PURE__*/ Object.assign({ layout: null }, {
	__name: "QRMenu",
	__ssrInlineRender: true,
	props: { slug: {
		type: String,
		required: true
	} },
	setup(__props) {
		const props = __props;
		const state = ref("loading");
		const errorMsg = ref("");
		const sessionToken = ref("");
		const menu = ref({
			categories: [],
			items: []
		});
		const place = ref(null);
		const tableInfo = ref(null);
		const config = ref({
			accent_color: "#6366f1",
			require_name: false,
			require_phone: false
		});
		const activeCat = ref(null);
		const cart = ref([]);
		const showCart = ref(false);
		const guestName = ref("");
		const guestPhone = ref("");
		const placing = ref(false);
		const orderError = ref("");
		const confirmOrder = ref(null);
		const orderStatus = ref("");
		let statusTimer = null;
		onMounted(async () => {
			try {
				const res = await fetch(`/api/guest/qr/${props.slug}`, { headers: { Accept: "application/json" } });
				if (!res.ok) {
					let data = {};
					try {
						data = await res.json();
					} catch (error) {}
					throw new Error(data?.error || "QR code not found.");
				}
				const data = await res.json();
				sessionToken.value = data.session_token || "";
				place.value = data.place || null;
				tableInfo.value = data.table || null;
				menu.value = data.menu || {
					categories: [],
					items: []
				};
				config.value = { ...config.value };
				state.value = "menu";
			} catch (error) {
				errorMsg.value = error?.message || "Unable to load the menu.";
				state.value = "error";
			}
		});
		onUnmounted(() => {
			clearInterval(statusTimer);
		});
		const filteredItems = computed(() => {
			if (activeCat.value === null) return menu.value.items;
			return menu.value.items.filter((item) => item.category_id === activeCat.value);
		});
		const cartCount = computed(() => {
			return cart.value.reduce((total, item) => total + Number(item.quantity || 0), 0);
		});
		const cartTotal = computed(() => {
			return cart.value.reduce((total, item) => total + Number(item.price || 0) * Number(item.quantity || 0), 0);
		});
		const cartQty = (id) => {
			return cart.value.find((line) => line.fooditems_id === id)?.quantity ?? 0;
		};
		const fmt = (value) => {
			return "Rs " + Number(value ?? 0).toLocaleString("en-PK", {
				minimumFractionDigits: 0,
				maximumFractionDigits: 0
			});
		};
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({
				class: "qrmenu",
				style: { "--accent": config.value.accent_color ?? "#6366f1" }
			}, _attrs))} data-v-453532df>`);
			if (state.value === "loading") _push(`<div class="qrmenu__screen qrmenu__screen--loading" data-v-453532df><div class="qrmenu__loader" data-v-453532df><div class="qrmenu__loader-ring" data-v-453532df></div></div><h2 data-v-453532df>Preparing your menu</h2><p data-v-453532df>Please wait a moment...</p></div>`);
			else if (state.value === "error") _push(`<div class="qrmenu__screen qrmenu__screen--error" data-v-453532df><div class="qrmenu__error-icon" data-v-453532df>!</div><h2 data-v-453532df>Menu unavailable</h2><p data-v-453532df>${ssrInterpolate(errorMsg.value)}</p><button class="qrmenu__primary-btn" data-v-453532df> Try Again </button></div>`);
			else if (state.value === "confirmed") {
				_push(`<div class="qrmenu__confirmation" data-v-453532df><div class="qrmenu__success-circle" data-v-453532df><span data-v-453532df>✓</span></div><span class="qrmenu__confirmation-label" data-v-453532df> ORDER CONFIRMED </span><h1 data-v-453532df>Thank you!</h1><p class="qrmenu__confirmation-subtitle" data-v-453532df> Your order has been sent to the restaurant. </p><div class="qrmenu__order-card" data-v-453532df><div class="qrmenu__order-card-row" data-v-453532df><span data-v-453532df>Order number</span><strong data-v-453532df>${ssrInterpolate(confirmOrder.value.order_number)}</strong></div><div class="qrmenu__order-card-divider" data-v-453532df></div><div class="qrmenu__order-card-row" data-v-453532df><span data-v-453532df>Total</span><strong data-v-453532df>${ssrInterpolate(fmt(confirmOrder.value.grand_total))}</strong></div></div>`);
				if (orderStatus.value) _push(`<div class="qrmenu__status-card" data-v-453532df><span class="qrmenu__status-dot" data-v-453532df></span><div data-v-453532df><small data-v-453532df>ORDER STATUS</small><strong data-v-453532df>${ssrInterpolate(orderStatus.value)}</strong></div></div>`);
				else _push(`<!---->`);
				_push(`<p class="qrmenu__confirmation-message" data-v-453532df>${ssrInterpolate(confirmOrder.value.message)}</p><button class="qrmenu__primary-btn qrmenu__primary-btn--large" data-v-453532df> Order More </button></div>`);
			} else {
				_push(`<!--[--><header class="qrmenu__header" data-v-453532df><div class="qrmenu__brand" data-v-453532df><div class="qrmenu__brand-icon" data-v-453532df>${ssrInterpolate(place.value?.name?.charAt(0)?.toUpperCase() || "M")}</div><div class="qrmenu__brand-text" data-v-453532df><div class="qrmenu__eyebrow" data-v-453532df> WELCOME TO </div><h1 class="qrmenu__title" data-v-453532df>${ssrInterpolate(place.value?.name ?? "Restaurant Menu")}</h1>`);
				if (tableInfo.value) _push(`<p class="qrmenu__table" data-v-453532df><span class="qrmenu__table-dot" data-v-453532df></span> Table ${ssrInterpolate(tableInfo.value.number)}</p>`);
				else _push(`<!---->`);
				_push(`</div></div>`);
				if (cartCount.value) _push(`<button class="qrmenu__header-cart" aria-label="Open cart" data-v-453532df><span class="qrmenu__cart-icon" data-v-453532df> 🛒 </span><span class="qrmenu__header-cart-count" data-v-453532df>${ssrInterpolate(cartCount.value)}</span></button>`);
				else _push(`<!---->`);
				_push(`</header><section class="qrmenu__welcome" data-v-453532df><p class="qrmenu__welcome-kicker" data-v-453532df> DISCOVER OUR MENU </p><h2 data-v-453532df> Freshly made for you. </h2><p data-v-453532df> Browse our menu and add your favourites to your order. </p></section><div class="qrmenu__categories-wrap" data-v-453532df><div class="qrmenu__categories" data-v-453532df><button class="${ssrRenderClass([{ active: activeCat.value === null }, "qrmenu__category"])}" data-v-453532df><span data-v-453532df>✨</span> All </button><!--[-->`);
				ssrRenderList(menu.value.categories, (cat) => {
					_push(`<button class="${ssrRenderClass([{ active: activeCat.value === cat.id }, "qrmenu__category"])}" data-v-453532df>${ssrInterpolate(cat.name)}</button>`);
				});
				_push(`<!--]--></div></div><main class="qrmenu__content" data-v-453532df><div class="qrmenu__section-head" data-v-453532df><div data-v-453532df><span data-v-453532df> MENU </span><h2 data-v-453532df>${ssrInterpolate(activeCat.value === null ? "Popular choices" : menu.value.categories.find((c) => c.id === activeCat.value)?.name || "Menu")}</h2></div><span class="qrmenu__item-count" data-v-453532df>${ssrInterpolate(filteredItems.value.length)} items </span></div>`);
				if (filteredItems.value.length) {
					_push(`<div class="qrmenu__grid" data-v-453532df><!--[-->`);
					ssrRenderList(filteredItems.value, (item) => {
						_push(`<article class="qrmenu__item" data-v-453532df><div class="qrmenu__item-image" data-v-453532df>`);
						if (item.image) _push(`<img${ssrRenderAttr("src", item.image)}${ssrRenderAttr("alt", item.name)} loading="lazy" data-v-453532df>`);
						else _push(`<div class="qrmenu__item-placeholder" data-v-453532df> 🍽️ </div>`);
						if (cartQty(item.id)) _push(`<span class="qrmenu__item-quantity" data-v-453532df>${ssrInterpolate(cartQty(item.id))}</span>`);
						else _push(`<!---->`);
						_push(`</div><div class="qrmenu__item-content" data-v-453532df><div class="qrmenu__item-top" data-v-453532df><h3 data-v-453532df>${ssrInterpolate(item.name)}</h3><button class="qrmenu__add-btn" aria-label="Add item" data-v-453532df> + </button></div>`);
						if (item.description) _push(`<p class="qrmenu__item-description" data-v-453532df>${ssrInterpolate(item.description)}</p>`);
						else _push(`<!---->`);
						_push(`<div class="qrmenu__item-footer" data-v-453532df><span class="qrmenu__item-price" data-v-453532df>${ssrInterpolate(fmt(item.price))}</span><span class="qrmenu__item-action" data-v-453532df> Add to order </span></div></div></article>`);
					});
					_push(`<!--]--></div>`);
				} else _push(`<div class="qrmenu__empty" data-v-453532df><div class="qrmenu__empty-icon" data-v-453532df> 🍽️ </div><h3 data-v-453532df> No items found </h3><p data-v-453532df> There are no menu items in this category. </p></div>`);
				_push(`</main>`);
				if (showCart.value) _push(`<div class="qrmenu__backdrop" data-v-453532df></div>`);
				else _push(`<!---->`);
				if (showCart.value) {
					_push(`<aside class="qrmenu__cart" data-v-453532df><div class="qrmenu__cart-header" data-v-453532df><div data-v-453532df><span class="qrmenu__cart-label" data-v-453532df> YOUR ORDER </span><h2 data-v-453532df> Your Basket </h2></div><button class="qrmenu__close-btn" aria-label="Close cart" data-v-453532df> ✕ </button></div><div class="qrmenu__cart-body" data-v-453532df><!--[-->`);
					ssrRenderList(cart.value, (line) => {
						_push(`<div class="qrmenu__cart-item" data-v-453532df><div class="qrmenu__cart-item-info" data-v-453532df><h3 data-v-453532df>${ssrInterpolate(line.name)}</h3><span data-v-453532df>${ssrInterpolate(fmt(line.price))} each </span></div><div class="qrmenu__cart-item-right" data-v-453532df><div class="qrmenu__qty" data-v-453532df><button type="button" data-v-453532df> − </button><strong data-v-453532df>${ssrInterpolate(line.quantity)}</strong><button type="button" data-v-453532df> + </button></div><strong class="qrmenu__cart-price" data-v-453532df>${ssrInterpolate(fmt(line.price * line.quantity))}</strong></div></div>`);
					});
					_push(`<!--]-->`);
					if (config.value.require_name || config.value.require_phone) {
						_push(`<div class="qrmenu__guest" data-v-453532df><div class="qrmenu__guest-title" data-v-453532df><span data-v-453532df> DETAILS </span><h3 data-v-453532df> Before you order </h3></div>`);
						if (config.value.require_name) _push(`<input${ssrRenderAttr("value", guestName.value)} class="qrmenu__input" placeholder="Your name" type="text" autocomplete="name" data-v-453532df>`);
						else _push(`<!---->`);
						if (config.value.require_phone) _push(`<input${ssrRenderAttr("value", guestPhone.value)} class="qrmenu__input" placeholder="Phone number" type="tel" autocomplete="tel" data-v-453532df>`);
						else _push(`<!---->`);
						_push(`</div>`);
					} else _push(`<!---->`);
					if (orderError.value) _push(`<p class="qrmenu__order-error" data-v-453532df>${ssrInterpolate(orderError.value)}</p>`);
					else _push(`<!---->`);
					_push(`</div><div class="qrmenu__cart-footer" data-v-453532df><div class="qrmenu__total" data-v-453532df><span data-v-453532df> Total </span><strong data-v-453532df>${ssrInterpolate(fmt(cartTotal.value))}</strong></div><button class="qrmenu__place-btn"${ssrIncludeBooleanAttr(placing.value || !cart.value.length) ? " disabled" : ""} data-v-453532df><span data-v-453532df>${ssrInterpolate(placing.value ? "Placing order..." : "Place Order")}</span>`);
					if (!placing.value) _push(`<span data-v-453532df> → </span>`);
					else _push(`<!---->`);
					_push(`</button></div></aside>`);
				} else _push(`<!---->`);
				if (cartCount.value && !showCart.value) _push(`<button class="qrmenu__fab" data-v-453532df><span class="qrmenu__fab-left" data-v-453532df><span class="qrmenu__fab-badge" data-v-453532df>${ssrInterpolate(cartCount.value)}</span><span data-v-453532df> View Order </span></span><span class="qrmenu__fab-total" data-v-453532df>${ssrInterpolate(fmt(cartTotal.value))}</span></button>`);
				else _push(`<!---->`);
				_push(`<!--]-->`);
			}
			_push(`</div>`);
		};
	}
});
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/pages/Guest/QRMenu.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var QRMenu_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-453532df"]]);
//#endregion
export { QRMenu_default as default };
