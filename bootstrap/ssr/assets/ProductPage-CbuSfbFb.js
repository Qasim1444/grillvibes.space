import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-BOaGB7Aw.js";
import { t as grillvibes_logo_default } from "./grillvibes-logo-lmKkVPW5.js";
import { computed, createTextVNode, createVNode, mergeProps, ref, unref, useSSRContext, withCtx } from "vue";
import { Link } from "@inertiajs/vue3";
import { ssrInterpolate, ssrRenderAttr, ssrRenderAttrs, ssrRenderClass, ssrRenderComponent, ssrRenderList } from "vue/server-renderer";
//#region resources/js/pages/ProductPage.vue
var _sfc_main = {
	__name: "ProductPage",
	__ssrInlineRender: true,
	props: { whatsappNumber: {
		type: String,
		default: "923099553122"
	} },
	setup(__props) {
		const props = __props;
		const mobileOpen = ref(false);
		const whatsappLink = computed(() => `https://wa.me/${props.whatsappNumber}?text=${encodeURIComponent("السلام علیکم! مجھے GrillVibes کا فری ڈیمو چاہیے۔")}`);
		const asset = (file) => `/images/product/${file}`;
		const highlights = [
			{
				icon: "🍳",
				title: "Recipe Costing",
				desc: "Exact food cost per dish + stock control"
			},
			{
				icon: "📱",
				title: "WhatsApp Receipt",
				desc: "Send bill instantly on WhatsApp"
			},
			{
				icon: "📍",
				title: "GPS Attendance",
				desc: "Location-verified staff punch in/out"
			},
			{
				icon: "🔥",
				title: "Built for Restaurants",
				desc: "Not a general system — pure restaurant focus"
			}
		];
		const modules = [
			{
				title: "POS + WhatsApp Receipt",
				image: "pos-whatsapp.png",
				desc: "Complete point of sale with tables, categories, billing and one-tap WhatsApp receipt.",
				points: [
					"Food items & categories",
					"Table management",
					"WhatsApp receipt",
					"Kitchen Display link"
				]
			},
			{
				title: "Inventory + Recipe Costing",
				image: "06_inventory.png",
				desc: "Track stock, calculate recipe cost, control food cost percentage and reduce waste.",
				points: [
					"Real-time stock",
					"Recipe costing",
					"Food cost trends",
					"Low stock alerts"
				]
			},
			{
				title: "GPS Attendance & HR",
				image: "08_gps.png",
				desc: "Staff punch with GPS verification. Manage leaves, overtime and payroll easily.",
				points: [
					"GPS verified punch",
					"Attendance overview",
					"Leave approval",
					"Payroll summary"
				]
			},
			{
				title: "Kitchen Display System",
				image: "04_kitchen.png",
				desc: "Orders go straight to kitchen screens. Track Preparing → Ready → Served status.",
				points: [
					"Live order tickets",
					"Station routing",
					"Status updates",
					"Faster service"
				]
			},
			{
				title: "QR Menu Ordering",
				image: "05_qr.png",
				desc: "Customers scan QR, view menu on phone and place orders without waiting for staff.",
				points: [
					"QR table codes",
					"Mobile menu",
					"Self ordering",
					"Direct to kitchen"
				]
			},
			{
				title: "CRM + Loyalty + Discounts",
				image: "13_crm.png",
				desc: "Customer profiles, loyalty points, promo codes and discount coupons in one place.",
				points: [
					"Customer database",
					"Loyalty points",
					"Promo codes",
					"Discount rules"
				]
			},
			{
				title: "Multi-Device Sync",
				image: "11_multi.png",
				desc: "Mobile app, POS tablet, kitchen screen and laptop dashboard — all connected live.",
				points: [
					"Mobile ordering",
					"POS tablet",
					"Kitchen screen",
					"Laptop dashboard"
				]
			},
			{
				title: "Reservations + Floor Plan",
				image: "10_reservations.png",
				desc: "Visual floor plan, table status and reservation management for hostess and managers.",
				points: [
					"Visual floor plan",
					"Live table status",
					"Reservations list",
					"Walk-in handling"
				]
			}
		];
		const moreFeatures = [
			{
				label: "Operations & analytics",
				title: "Live Orders & Reports",
				image: "03_live.png",
				desc: "Monitor the complete order flow while reviewing sales activity, order totals and operational performance from one workspace.",
				points: [
					"New, preparing, ready and served orders",
					"Sales and order performance",
					"Branch activity visibility",
					"Faster service decisions"
				],
				cta: "Explore Live Reports"
			},
			{
				label: "Purchasing & cash control",
				title: "Procurement & Finance",
				image: "07_procurement.png",
				desc: "Connect purchasing and finance so vendor activity, stock receiving and daily cash movement stay organized.",
				points: [
					"Vendor and purchase orders",
					"Goods receipts",
					"Expenses and vouchers",
					"Petty-cash management"
				],
				cta: "Explore Finance"
			},
			{
				label: "Access management",
				title: "Roles & Permissions",
				image: "09_roles.png",
				desc: "Give every team member the right access while keeping sensitive restaurant operations under control.",
				points: [
					"Custom user roles",
					"Module-level permissions",
					"Action-level permissions",
					"Secure branch operations"
				],
				cta: "Explore Permissions"
			},
			{
				label: "Public restaurant presence",
				title: "Blog + Website",
				image: "12_blog.png",
				desc: "Keep the public restaurant experience updated with content that helps guests discover, trust and revisit your brand.",
				points: [
					"Restaurant homepage",
					"Public menu pages",
					"Blog publishing",
					"Reviews and feedback"
				],
				cta: "Explore Website"
			},
			{
				label: "See the complete system",
				title: "Free Demo",
				image: "14_demo.png",
				desc: "Give restaurant owners a guided look at the complete platform before setup, branding or customer-specific customization.",
				points: [
					"Walk through every module",
					"Review real workflows",
					"Discuss branding options",
					"Plan your launch"
				],
				cta: "Request Free Demo"
			}
		];
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "gv-page" }, _attrs))} data-v-a7fa68fd><header class="gv-header" data-v-a7fa68fd>`);
			_push(ssrRenderComponent(unref(Link), {
				class: "brand",
				href: "/"
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<img class="brand-logo"${ssrRenderAttr("src", unref(grillvibes_logo_default))} alt="GrillVibes — Good Food, Better Vibes" data-v-a7fa68fd${_scopeId}>`);
					else return [createVNode("img", {
						class: "brand-logo",
						src: unref(grillvibes_logo_default),
						alt: "GrillVibes — Good Food, Better Vibes"
					}, null, 8, ["src"])];
				}),
				_: 1
			}, _parent));
			_push(`<nav class="${ssrRenderClass([{ open: mobileOpen.value }, "nav"])}" data-v-a7fa68fd><a href="#modules" data-v-a7fa68fd>Modules</a><a href="#gps" data-v-a7fa68fd>GPS Attendance</a><a href="#inventory" data-v-a7fa68fd>Recipe Costing</a><a href="#pos" data-v-a7fa68fd>POS + WhatsApp</a><a href="#pricing" data-v-a7fa68fd>Pricing</a><a href="#contact" data-v-a7fa68fd>Contact</a></nav><div class="header-right" data-v-a7fa68fd>`);
			_push(ssrRenderComponent(unref(Link), {
				class: "btn-ghost",
				href: "/login"
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`Sign In`);
					else return [createTextVNode("Sign In")];
				}),
				_: 1
			}, _parent));
			_push(`<a class="btn-orange" href="#contact" data-v-a7fa68fd>Request Demo</a><button class="burger" type="button"${ssrRenderAttr("aria-expanded", mobileOpen.value)} aria-label="Toggle menu" data-v-a7fa68fd><span data-v-a7fa68fd></span><span data-v-a7fa68fd></span><span data-v-a7fa68fd></span></button></div></header><main data-v-a7fa68fd><section class="hero" data-v-a7fa68fd><div class="hero-bg" data-v-a7fa68fd></div><div class="hero-inner" data-v-a7fa68fd><div class="hero-text" data-v-a7fa68fd><p class="badge" data-v-a7fa68fd>Complete Restaurant Management System</p><h1 data-v-a7fa68fd>Restaurant POS &amp; ERP<br data-v-a7fa68fd><em data-v-a7fa68fd>Built Only for Restaurants</em></h1><p class="lede" data-v-a7fa68fd> GrillVibes is not a general business software. It is a full restaurant operations platform — POS, Kitchen Display, Inventory + Recipe Costing, GPS Attendance, WhatsApp Receipts, CRM, Finance &amp; more. </p><div class="hero-cta" data-v-a7fa68fd><a class="btn-orange lg" href="#contact" data-v-a7fa68fd>Request Free Demo</a><a class="btn-outline lg" href="#modules" data-v-a7fa68fd>View All Modules</a></div><div class="hero-tags" data-v-a7fa68fd><span data-v-a7fa68fd>Recipe Costing</span><span data-v-a7fa68fd>WhatsApp Receipt</span><span data-v-a7fa68fd>GPS Attendance</span><span data-v-a7fa68fd>Multi-Device</span></div></div><div class="hero-visual" data-v-a7fa68fd><img${ssrRenderAttr("src", asset("pos-whatsapp.png"))} alt="GrillVibes POS with WhatsApp Receipt" class="hero-img" data-v-a7fa68fd></div></div></section><section class="problem-section" data-v-a7fa68fd><div class="wrap" data-v-a7fa68fd><div class="problem-card" data-v-a7fa68fd><img${ssrRenderAttr("src", asset("problem-pricing.png"))} alt="Restaurant chaos to GrillVibes control" data-v-a7fa68fd></div></div></section><section class="highlights wrap" data-v-a7fa68fd><!--[-->`);
			ssrRenderList(highlights, (h) => {
				_push(`<div class="hl-card" data-v-a7fa68fd><div class="hl-icon" data-v-a7fa68fd>${ssrInterpolate(h.icon)}</div><h3 data-v-a7fa68fd>${ssrInterpolate(h.title)}</h3><p data-v-a7fa68fd>${ssrInterpolate(h.desc)}</p></div>`);
			});
			_push(`<!--]--></section><section id="modules" class="modules-section" data-v-a7fa68fd><div class="wrap" data-v-a7fa68fd><div class="section-head" data-v-a7fa68fd><h2 data-v-a7fa68fd>Everything Included<br data-v-a7fa68fd><em data-v-a7fa68fd>in One Restaurant System</em></h2><p data-v-a7fa68fd>POS, Kitchen, Inventory, HR, Finance, CRM, Public Website &amp; more — built specifically for restaurants.</p></div><div class="module-grid" data-v-a7fa68fd><!--[-->`);
			ssrRenderList(modules, (m, i) => {
				_push(`<article class="${ssrRenderClass([{ reverse: i % 2 === 1 }, "module-card"])}" data-v-a7fa68fd><div class="module-img" data-v-a7fa68fd><img${ssrRenderAttr("src", asset(m.image))}${ssrRenderAttr("alt", m.title)} loading="lazy" data-v-a7fa68fd></div><div class="module-body" data-v-a7fa68fd><span class="module-num" data-v-a7fa68fd>${ssrInterpolate(String(i + 1).padStart(2, "0"))}</span><h3 data-v-a7fa68fd>${ssrInterpolate(m.title)}</h3><p data-v-a7fa68fd>${ssrInterpolate(m.desc)}</p><ul data-v-a7fa68fd><!--[-->`);
				ssrRenderList(m.points, (point) => {
					_push(`<li data-v-a7fa68fd>${ssrInterpolate(point)}</li>`);
				});
				_push(`<!--]--></ul><a class="btn-orange module-cta" href="#contact" data-v-a7fa68fd>Request ${ssrInterpolate(m.title)} Demo</a></div></article>`);
			});
			_push(`<!--]--></div></div></section><section id="inventory" class="spotlight" data-v-a7fa68fd><div class="wrap spotlight-inner" data-v-a7fa68fd><div class="spotlight-copy" data-v-a7fa68fd><p class="badge orange" data-v-a7fa68fd>Inventory &amp; Food Cost</p><h2 data-v-a7fa68fd>Recipe Costing<br data-v-a7fa68fd><em data-v-a7fa68fd>Control Every Rupee</em></h2><p data-v-a7fa68fd> Track stock levels, calculate exact food cost per dish, reduce waste and increase profit. Real-time stock updates + recipe costing in one place. </p><ul class="check" data-v-a7fa68fd><li data-v-a7fa68fd>Real-time stock levels</li><li data-v-a7fa68fd>Recipe cost calculation</li><li data-v-a7fa68fd>Food cost % &amp; trends</li><li data-v-a7fa68fd>Low stock alerts</li></ul><a class="btn-orange" href="#contact" data-v-a7fa68fd>See Recipe Costing Demo</a></div><div class="spotlight-img" data-v-a7fa68fd><img${ssrRenderAttr("src", asset("06_inventory.png"))} alt="Inventory and Recipe Costing" data-v-a7fa68fd></div></div></section><section id="pos" class="spotlight alt" data-v-a7fa68fd><div class="wrap spotlight-inner" data-v-a7fa68fd><div class="spotlight-img" data-v-a7fa68fd><img${ssrRenderAttr("src", asset("pos-whatsapp.png"))} alt="POS + WhatsApp Receipt" data-v-a7fa68fd></div><div class="spotlight-copy" data-v-a7fa68fd><p class="badge orange" data-v-a7fa68fd>POS + WhatsApp</p><h2 data-v-a7fa68fd>WhatsApp Receipt<br data-v-a7fa68fd><em data-v-a7fa68fd>Send Instantly</em></h2><p data-v-a7fa68fd> Complete POS with tables, items, billing and one-click WhatsApp receipt. Customers get the bill on WhatsApp in seconds. </p><ul class="check" data-v-a7fa68fd><li data-v-a7fa68fd>Food categories &amp; items</li><li data-v-a7fa68fd>Table management</li><li data-v-a7fa68fd>WhatsApp receipt button</li><li data-v-a7fa68fd>Kitchen Display integration</li></ul><a class="btn-orange" href="#contact" data-v-a7fa68fd>Request POS Demo</a></div></div></section><section id="gps" class="spotlight" data-v-a7fa68fd><div class="wrap spotlight-inner" data-v-a7fa68fd><div class="spotlight-copy" data-v-a7fa68fd><p class="badge orange" data-v-a7fa68fd>HR &amp; Attendance</p><h2 data-v-a7fa68fd>GPS Attendance<br data-v-a7fa68fd><em data-v-a7fa68fd>for Every Shift</em></h2><p data-v-a7fa68fd> Staff punch in/out with GPS verification. Managers see present, absent, leave and payroll in one clean dashboard. </p><ul class="check" data-v-a7fa68fd><li data-v-a7fa68fd>GPS verified punch</li><li data-v-a7fa68fd>Daily attendance overview</li><li data-v-a7fa68fd>Leave requests &amp; approval</li><li data-v-a7fa68fd>Automated payroll</li></ul><a class="btn-orange" href="#contact" data-v-a7fa68fd>See GPS Attendance</a></div><div class="spotlight-img" data-v-a7fa68fd><img${ssrRenderAttr("src", asset("08_gps.png"))} alt="GPS Attendance" data-v-a7fa68fd></div></div></section><section class="features-strip" data-v-a7fa68fd><div class="wrap" data-v-a7fa68fd><!--[-->`);
			ssrRenderList(moreFeatures, (f) => {
				_push(`<div class="feat" data-v-a7fa68fd><div class="feat-copy" data-v-a7fa68fd><span class="feat-label" data-v-a7fa68fd>${ssrInterpolate(f.label)}</span><h4 data-v-a7fa68fd>${ssrInterpolate(f.title)}</h4><p data-v-a7fa68fd>${ssrInterpolate(f.desc)}</p><ul data-v-a7fa68fd><!--[-->`);
				ssrRenderList(f.points, (point) => {
					_push(`<li data-v-a7fa68fd>${ssrInterpolate(point)}</li>`);
				});
				_push(`<!--]--></ul><a class="btn-orange feat-cta" href="#contact" data-v-a7fa68fd>${ssrInterpolate(f.cta)}</a></div><img${ssrRenderAttr("src", asset(f.image))}${ssrRenderAttr("alt", f.title)} loading="lazy" data-v-a7fa68fd></div>`);
			});
			_push(`<!--]--></div></section><section id="pricing" class="pricing-section" data-v-a7fa68fd><div class="wrap" data-v-a7fa68fd><div class="section-head" data-v-a7fa68fd><h2 data-v-a7fa68fd>Simple Pricing<br data-v-a7fa68fd><em data-v-a7fa68fd>for Restaurants</em></h2></div><div class="price-grid" data-v-a7fa68fd><div class="price-card" data-v-a7fa68fd><span class="price-label" data-v-a7fa68fd>Website</span><strong data-v-a7fa68fd>Rs. 11,999</strong></div><div class="price-card popular" data-v-a7fa68fd><span class="price-label" data-v-a7fa68fd>Monthly Fee</span><strong data-v-a7fa68fd>Rs. 2,500</strong></div><div class="price-card" data-v-a7fa68fd><span class="price-label" data-v-a7fa68fd>Setup Fee</span><strong data-v-a7fa68fd>Rs. 5,000</strong></div><div class="price-card" data-v-a7fa68fd><span class="price-label" data-v-a7fa68fd>One Time Fee</span><strong data-v-a7fa68fd>Rs. 20,000</strong></div></div><p class="price-note" data-v-a7fa68fd> آج ہی اپنا سسٹم بک کروئیں! → <a href="https://www.grillvibes.space" target="_blank" data-v-a7fa68fd>www.grillvibes.space</a></p></div></section><section id="contact" class="final-cta" data-v-a7fa68fd><div class="wrap" data-v-a7fa68fd><h2 data-v-a7fa68fd>اپنے ریسٹورنٹ کے لیے<br data-v-a7fa68fd><em data-v-a7fa68fd>فری ڈیمو بک کریں</em></h2><p data-v-a7fa68fd>Recipe Costing • WhatsApp Receipt • GPS Attendance — سب کچھ ایک سسٹم میں۔</p><div class="cta-buttons" data-v-a7fa68fd><a class="btn-orange lg"${ssrRenderAttr("href", whatsappLink.value)} target="_blank" rel="noopener" data-v-a7fa68fd> WhatsApp پر ڈیمو بک کریں </a>`);
			_push(ssrRenderComponent(unref(Link), {
				class: "btn-outline lg",
				href: "/login"
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`Admin Demo کھولیں`);
					else return [createTextVNode("Admin Demo کھولیں")];
				}),
				_: 1
			}, _parent));
			_push(`</div></div></section></main><footer class="gv-footer" data-v-a7fa68fd><div class="wrap footer-inner" data-v-a7fa68fd><div data-v-a7fa68fd>`);
			_push(ssrRenderComponent(unref(Link), {
				class: "brand",
				href: "/"
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<img class="brand-logo"${ssrRenderAttr("src", unref(grillvibes_logo_default))} alt="GrillVibes — Good Food, Better Vibes" data-v-a7fa68fd${_scopeId}>`);
					else return [createVNode("img", {
						class: "brand-logo",
						src: unref(grillvibes_logo_default),
						alt: "GrillVibes — Good Food, Better Vibes"
					}, null, 8, ["src"])];
				}),
				_: 1
			}, _parent));
			_push(`<p data-v-a7fa68fd>Complete Restaurant Management System</p></div><nav data-v-a7fa68fd><a href="#modules" data-v-a7fa68fd>Modules</a><a href="#pricing" data-v-a7fa68fd>Pricing</a>`);
			_push(ssrRenderComponent(unref(Link), { href: "/login" }, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`Login`);
					else return [createTextVNode("Login")];
				}),
				_: 1
			}, _parent));
			_push(`</nav><a class="footer-link" href="https://www.grillvibes.space" target="_blank" data-v-a7fa68fd> www.grillvibes.space </a></div></footer></div>`);
		};
	}
};
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/pages/ProductPage.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var ProductPage_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-a7fa68fd"]]);
//#endregion
export { ProductPage_default as default };
