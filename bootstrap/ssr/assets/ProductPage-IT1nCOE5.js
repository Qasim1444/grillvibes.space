import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-BOaGB7Aw.js";
import { computed, mergeProps, ref, useSSRContext } from "vue";
import { ssrInterpolate, ssrRenderAttr, ssrRenderAttrs, ssrRenderClass, ssrRenderList, ssrRenderStyle } from "vue/server-renderer";
//#region resources/js/pages/ProductPage.vue
var _sfc_main = {
	__name: "ProductPage",
	__ssrInlineRender: true,
	props: {
		categories: {
			type: Array,
			default: () => []
		},
		foodItems: {
			type: Array,
			default: () => []
		}
	},
	setup(__props) {
		const mobileOpen = ref(false);
		const heroModules = [
			{
				label: "POS & Orders",
				icon: "▣"
			},
			{
				label: "QR & Kiosk",
				icon: "◫"
			},
			{
				label: "Inventory",
				icon: "▦"
			},
			{
				label: "HR Payroll",
				icon: "♙"
			},
			{
				label: "Finance",
				icon: "₨"
			},
			{
				label: "CRM",
				icon: "◌"
			},
			{
				label: "Reports",
				icon: "◒"
			}
		];
		const extendedModules = [
			{
				index: "01",
				icon: "⌁",
				tone: "violet",
				title: "POS & Order Management",
				description: "Dine-in, takeaway, delivery-style orders, printable receipts, promo preview, and customer lookup.",
				link: "POS module",
				href: "/pos"
			},
			{
				index: "02",
				icon: "▦",
				tone: "teal",
				title: "QR Menu, Kiosk & KDS",
				description: "Guest QR menu, kiosk ordering, kitchen stations, live tickets, bump actions, and order status flow.",
				link: "guest and kitchen flow",
				href: "/kds/board"
			},
			{
				index: "03",
				icon: "◒",
				tone: "gold",
				title: "Inventory & Procurement",
				description: "Ingredients, recipes, stock ledger, stock adjustment, vendors, purchase orders, and goods receipts.",
				link: "inventory tools",
				href: "/inventory/stock"
			},
			{
				index: "04",
				icon: "↗",
				tone: "blue",
				title: "HR, Payroll & Attendance",
				description: "Employees, designations, attendance punch, leave approvals, overtime, loans, deductions, and payroll runs.",
				link: "HR modules",
				href: "/hr/attendance"
			},
			{
				index: "05",
				icon: "◇",
				tone: "pink",
				title: "CRM & Customer Growth",
				description: "Customer records, loyalty settings, point adjustments, promo codes, discount campaigns, and feedback replies.",
				link: "CRM modules",
				href: "/customers"
			},
			{
				index: "06",
				icon: "⌘",
				tone: "green",
				title: "Finance, Roles & Control",
				description: "Expenses, vouchers, petty cash, roles, permissions, settings, branches, maintenance logs, and WhatsApp APIs.",
				link: "admin controls",
				href: "/dashboard"
			}
		];
		const props = __props;
		const foodItems = computed(() => props.foodItems.map((item) => ({
			...item,
			food_category: item.food_category || props.categories.find((category) => category.id === item.foodcategory_id)
		})));
		const workflow = [
			{
				title: "Backend",
				description: "Laravel 12, PHP 8.2+, session authentication, Sanctum API auth, controllers grouped by business domain."
			},
			{
				title: "Frontend",
				description: "Vue 3, Inertia.js, Vite, Tailwind CSS v4, Bootstrap 5, reusable admin UI components, and public pages."
			},
			{
				title: "Business data",
				description: "Migrations and models for orders, menu, branches, stock, recipes, HR, payroll, finance, CRM, blog, and WhatsApp records."
			},
			{
				title: "Selling angle",
				description: "A practical base for custom restaurant software, white-label POS services, agency delivery, or SaaS product development."
			}
		];
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "product-page" }, _attrs))} data-v-35373aa6><header class="site-header" data-v-35373aa6><a class="brand" href="/" aria-label="GrillVibes home" data-v-35373aa6><span class="brand-mark" data-v-35373aa6>G</span><span data-v-35373aa6>Grill<span class="brand-accent" data-v-35373aa6>Vibes</span></span></a><nav class="${ssrRenderClass([{ "site-nav--open": mobileOpen.value }, "site-nav"])}" aria-label="Primary navigation" data-v-35373aa6><a href="#features" data-v-35373aa6>Modules</a><a href="#solutions" data-v-35373aa6>Overview</a><a href="#workflow" data-v-35373aa6>Tech Stack</a><a href="/blog" data-v-35373aa6>Blog</a><a href="#footer" data-v-35373aa6>Contact</a></nav><div class="header-actions" data-v-35373aa6><a class="header-login" href="/login" data-v-35373aa6>Sign In</a><a class="button button--violet button--small" href="#footer" data-v-35373aa6>Contact Seller <span data-v-35373aa6>↗</span></a><button class="menu-toggle" type="button"${ssrRenderAttr("aria-expanded", mobileOpen.value)} aria-label="Toggle navigation" data-v-35373aa6><span data-v-35373aa6></span><span data-v-35373aa6></span><span data-v-35373aa6></span></button></div></header><main data-v-35373aa6><section class="hero" data-v-35373aa6><div class="hero-bg" data-v-35373aa6></div><div class="hero-overlay" data-v-35373aa6></div><div class="hero-content section-wrap" data-v-35373aa6><div class="hero-copy" data-v-35373aa6><p class="kicker" data-v-35373aa6><span data-v-35373aa6></span> Complete Laravel restaurant software project</p><h1 data-v-35373aa6>Restaurant POS &amp; ERP<br data-v-35373aa6>Project <em data-v-35373aa6>For Sale</em></h1><p class="hero-lede" data-v-35373aa6>GrillVibes is a full restaurant operations platform built with Laravel 12, Vue 3, Inertia.js, Tailwind CSS, Bootstrap, and API-ready backend architecture.</p><div class="hero-actions" data-v-35373aa6><a class="button button--violet" href="#footer" data-v-35373aa6>Request Demo</a><a class="button button--ghost" href="#features" data-v-35373aa6><span class="play" data-v-35373aa6>▶</span> View Modules</a></div><div class="hero-mini-points" data-v-35373aa6><span data-v-35373aa6>Ready Laravel codebase</span><span data-v-35373aa6>Restaurant SaaS potential</span><span data-v-35373aa6>Developer-friendly stack</span></div></div><div class="hero-product" data-v-35373aa6><div class="scribble-note" data-v-35373aa6>More Than<br data-v-35373aa6><strong data-v-35373aa6>Just a POS</strong> <span data-v-35373aa6>↘</span></div><div class="live-orders glass-card" data-v-35373aa6><div class="live-heading" data-v-35373aa6><span class="status-dot" data-v-35373aa6></span><strong data-v-35373aa6>Live Orders</strong><span class="mini-arrow" data-v-35373aa6>↗</span></div><div class="order-row" data-v-35373aa6><b data-v-35373aa6>#1024</b><span data-v-35373aa6>Chicken Burger</span><em class="preparing" data-v-35373aa6>Preparing</em></div><div class="order-row" data-v-35373aa6><b data-v-35373aa6>#1023</b><span data-v-35373aa6>BBQ Platter</span><em class="ready" data-v-35373aa6>Ready</em></div><div class="order-row" data-v-35373aa6><b data-v-35373aa6>#1022</b><span data-v-35373aa6>Zinger Meal</span><em class="served" data-v-35373aa6>Served</em></div><a href="#features" data-v-35373aa6>View project modules →</a></div><div class="burger-stage" data-v-35373aa6><img src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&amp;fit=crop&amp;w=1100&amp;q=88" alt="Premium restaurant burger" data-v-35373aa6></div></div></div><div class="section-wrap module-bar glass-card" data-v-35373aa6><!--[-->`);
			ssrRenderList(heroModules, (item) => {
				_push(`<div class="hero-module" data-v-35373aa6><div class="module-icon" data-v-35373aa6>${ssrInterpolate(item.icon)}</div><span data-v-35373aa6>${ssrInterpolate(item.label)}</span></div>`);
			});
			_push(`<!--]--></div><div class="section-wrap stats-row" data-v-35373aa6><div data-v-35373aa6><strong data-v-35373aa6>Laravel 12</strong><span data-v-35373aa6>Modern Backend</span></div><div data-v-35373aa6><strong data-v-35373aa6>Vue 3</strong><span data-v-35373aa6>Inertia Frontend</span></div><div data-v-35373aa6><strong data-v-35373aa6>40+</strong><span data-v-35373aa6>Business Models</span></div><div data-v-35373aa6><strong data-v-35373aa6>API</strong><span data-v-35373aa6>Sanctum Ready</span></div></div></section><section id="solutions" class="product-preview section-wrap" data-v-35373aa6><div class="preview-layout" data-v-35373aa6><div class="dashboard-shell" data-v-35373aa6><div class="dash-topbar" data-v-35373aa6><span class="window-dot" data-v-35373aa6></span><span class="window-dot" data-v-35373aa6></span><span class="window-dot" data-v-35373aa6></span><b data-v-35373aa6>GrillVibes / Main branch</b><span class="dash-live" data-v-35373aa6>● Service live</span></div><div class="dashboard-body" data-v-35373aa6><aside class="dash-sidebar" data-v-35373aa6><div class="dash-logo" data-v-35373aa6>Grill<span data-v-35373aa6>Vibes</span></div><div class="dash-item active" data-v-35373aa6>⌂ <span data-v-35373aa6>Dashboard</span></div><div class="dash-item" data-v-35373aa6>◫ <span data-v-35373aa6>Orders</span></div><div class="dash-item" data-v-35373aa6>▣ <span data-v-35373aa6>POS</span></div><div class="dash-item" data-v-35373aa6>◉ <span data-v-35373aa6>Kitchen</span></div><div class="dash-item" data-v-35373aa6>▦ <span data-v-35373aa6>Inventory</span></div><div class="dash-item" data-v-35373aa6>♙ <span data-v-35373aa6>Customers</span></div><div class="dash-item" data-v-35373aa6>◌ <span data-v-35373aa6>Staff</span></div><div class="dash-item" data-v-35373aa6>◒ <span data-v-35373aa6>Reports</span></div><div class="dash-item" data-v-35373aa6>⚙ <span data-v-35373aa6>Settings</span></div></aside><div class="dash-main" data-v-35373aa6><div class="dash-heading" data-v-35373aa6><div data-v-35373aa6><small data-v-35373aa6>Tuesday, 08 September · Main branch</small><h3 data-v-35373aa6>Dashboard</h3></div><button data-v-35373aa6>＋ New order</button></div><div class="dash-metrics" data-v-35373aa6><div data-v-35373aa6><small data-v-35373aa6>Today&#39;s Sales</small><strong data-v-35373aa6>Rs. 24,580</strong><em data-v-35373aa6>↗ 12%</em></div><div data-v-35373aa6><small data-v-35373aa6>Total Orders</small><strong data-v-35373aa6>186</strong><em data-v-35373aa6>↗ 8%</em></div><div data-v-35373aa6><small data-v-35373aa6>Active Tables</small><strong data-v-35373aa6>12</strong><em data-v-35373aa6>↗ 0%</em></div><div data-v-35373aa6><small data-v-35373aa6>Customers</small><strong data-v-35373aa6>84</strong><em data-v-35373aa6>↗ 16%</em></div></div><div class="dash-grid" data-v-35373aa6><div class="chart-panel" data-v-35373aa6><div class="panel-head" data-v-35373aa6><b data-v-35373aa6>Sales overview</b><span data-v-35373aa6>Last 7 days</span></div><div class="fake-chart" data-v-35373aa6><i style="${ssrRenderStyle({ "height": "32%" })}" data-v-35373aa6></i><i style="${ssrRenderStyle({ "height": "46%" })}" data-v-35373aa6></i><i style="${ssrRenderStyle({ "height": "40%" })}" data-v-35373aa6></i><i style="${ssrRenderStyle({ "height": "63%" })}" data-v-35373aa6></i><i style="${ssrRenderStyle({ "height": "54%" })}" data-v-35373aa6></i><i style="${ssrRenderStyle({ "height": "74%" })}" data-v-35373aa6></i><i style="${ssrRenderStyle({ "height": "88%" })}" data-v-35373aa6></i></div><div class="chart-labels" data-v-35373aa6><span data-v-35373aa6>Wed</span><span data-v-35373aa6>Thu</span><span data-v-35373aa6>Fri</span><span data-v-35373aa6>Sat</span><span data-v-35373aa6>Sun</span><span data-v-35373aa6>Mon</span><span data-v-35373aa6>Tue</span></div></div><div class="recent-panel" data-v-35373aa6><div class="panel-head" data-v-35373aa6><b data-v-35373aa6>Recent orders</b><span data-v-35373aa6>View all</span></div><p data-v-35373aa6><b data-v-35373aa6>#1024</b><span data-v-35373aa6>Chicken Burger</span><em class="preparing" data-v-35373aa6>Preparing</em></p><p data-v-35373aa6><b data-v-35373aa6>#1023</b><span data-v-35373aa6>BBQ Platter</span><em class="ready" data-v-35373aa6>Ready</em></p><p data-v-35373aa6><b data-v-35373aa6>#1022</b><span data-v-35373aa6>Zinger Meal</span><em class="served" data-v-35373aa6>Served</em></p></div></div></div></div></div><div class="preview-copy" data-v-35373aa6><h2 data-v-35373aa6>Sell, Customize,<br data-v-35373aa6>or Launch as SaaS</h2><p data-v-35373aa6>Buy a feature-rich restaurant management codebase that can be customized for restaurants, cafes, cloud kitchens, food courts, and multi-branch food businesses.</p><div class="check-list" data-v-35373aa6><div data-v-35373aa6><span data-v-35373aa6>✓</span>Complete Laravel + Vue restaurant platform</div><div data-v-35373aa6><span data-v-35373aa6>✓</span>POS, QR menu, kiosk, KDS, inventory, HR, CRM, and finance</div><div data-v-35373aa6><span data-v-35373aa6>✓</span>Role-based admin workspace with web and API routes</div><div data-v-35373aa6><span data-v-35373aa6>✓</span>Suitable for agencies, SaaS founders, and resellers</div><div data-v-35373aa6><span data-v-35373aa6>✓</span>Ready for demo, branding, and client customization</div></div><div class="preview-actions" data-v-35373aa6><a class="button button--violet" href="#footer" data-v-35373aa6>Contact for price <span data-v-35373aa6>→</span></a><a class="text-link text-link--light" href="#workflow" data-v-35373aa6>View stack <span data-v-35373aa6>↗</span></a></div></div></div></section><section id="features" class="modules-section section-wrap" data-v-35373aa6><div class="section-heading section-heading--center" data-v-35373aa6><div data-v-35373aa6><h2 data-v-35373aa6>Everything Included<br data-v-35373aa6>in the Project</h2></div><p data-v-35373aa6>A broad restaurant software package with customer-facing pages, admin modules, APIs, and operational workflows.</p></div><div class="module-grid" data-v-35373aa6><!--[-->`);
			ssrRenderList(extendedModules, (module) => {
				_push(`<article class="module-card" data-v-35373aa6><div class="${ssrRenderClass([module.tone, "module-icon"])}" data-v-35373aa6>${ssrInterpolate(module.icon)}</div><div data-v-35373aa6><span class="module-index" data-v-35373aa6>${ssrInterpolate(module.index)}</span><h3 data-v-35373aa6>${ssrInterpolate(module.title)}</h3><p data-v-35373aa6>${ssrInterpolate(module.description)}</p><a${ssrRenderAttr("href", module.href)} data-v-35373aa6>Explore ${ssrInterpolate(module.link)} <span data-v-35373aa6>↗</span></a></div></article>`);
			});
			_push(`<!--]--></div></section><section id="workflow" class="workflow-section" data-v-35373aa6><div class="section-wrap workflow-inner" data-v-35373aa6><div class="workflow-copy" data-v-35373aa6><p class="kicker kicker--violet" data-v-35373aa6>Technology stack</p><h2 data-v-35373aa6>Modern Laravel.<br data-v-35373aa6><em data-v-35373aa6>Practical Architecture.</em></h2><p data-v-35373aa6>The project uses a current Laravel backend, Vue/Inertia frontend, Vite build process, Sanctum APIs, image/barcode utilities, and migration-backed business modules.</p><a class="button button--violet" href="#footer" data-v-35373aa6>Ask for demo access <span data-v-35373aa6>→</span></a></div><div class="flow-list" data-v-35373aa6><!--[-->`);
			ssrRenderList(workflow, (step, index) => {
				_push(`<div class="flow-step" data-v-35373aa6><span data-v-35373aa6>0${ssrInterpolate(index + 1)}</span><div data-v-35373aa6><b data-v-35373aa6>${ssrInterpolate(step.title)}</b><p data-v-35373aa6>${ssrInterpolate(step.description)}</p></div></div>`);
			});
			_push(`<!--]--></div></div></section><section id="guest-ordering" class="guest-section section-wrap" data-v-35373aa6><div class="guest-card" data-v-35373aa6><div class="guest-copy" data-v-35373aa6><p class="kicker kicker--violet" data-v-35373aa6>Buyer opportunity</p><h2 data-v-35373aa6>Useful for Agencies,<br data-v-35373aa6><em data-v-35373aa6>Founders, and Resellers.</em></h2><p data-v-35373aa6>Use GrillVibes as a starting point for client restaurant projects, a branded POS product, or a restaurant SaaS platform with modules already built across operations.</p><div class="guest-links" data-v-35373aa6><a href="#features" data-v-35373aa6>See modules ↗</a><a href="#workflow" data-v-35373aa6>See stack ↗</a><a href="#footer" data-v-35373aa6>Contact seller ↗</a></div></div><div class="guest-visual" data-v-35373aa6><div class="qr-card" data-v-35373aa6><span data-v-35373aa6>QR</span><div class="qr-pattern" data-v-35373aa6><i data-v-35373aa6></i><i data-v-35373aa6></i><i data-v-35373aa6></i><i data-v-35373aa6></i></div><small data-v-35373aa6>TABLE 18</small></div><div class="kiosk-card" data-v-35373aa6><small data-v-35373aa6>KIOSK ORDER</small><strong data-v-35373aa6>2 × House ramen</strong><span data-v-35373aa6>1 × Yuzu soda</span><em data-v-35373aa6>Routed to kitchen →</em></div><div class="pos-chip" data-v-35373aa6>POS <span data-v-35373aa6>● Live</span></div></div></div></section><section id="menu" class="menu-showcase section-wrap" data-v-35373aa6><div class="section-heading section-heading--menu" data-v-35373aa6><div data-v-35373aa6><p class="kicker kicker--violet" data-v-35373aa6>Restaurant website included</p><h2 data-v-35373aa6>Public Menu.<br data-v-35373aa6><em data-v-35373aa6>Admin Controlled.</em></h2></div><p data-v-35373aa6>The same project includes a public restaurant homepage, menu display, blog, reviews, reservations, and guest ordering pages.</p></div>`);
			if (foodItems.value.length) {
				_push(`<div class="product-menu-grid" data-v-35373aa6><!--[-->`);
				ssrRenderList(foodItems.value, (item) => {
					_push(`<article class="product-menu-card" data-v-35373aa6><div class="${ssrRenderClass([{ "product-image--empty": !item.image }, "product-image"])}" data-v-35373aa6>`);
					if (item.image) _push(`<img${ssrRenderAttr("src", item.image)}${ssrRenderAttr("alt", item.name)} loading="lazy" data-v-35373aa6>`);
					else _push(`<span data-v-35373aa6>GrillVibes</span>`);
					_push(`</div><div class="product-menu-card__body" data-v-35373aa6><span data-v-35373aa6>${ssrInterpolate(item.food_category?.name || "Menu item")}</span><h3 data-v-35373aa6>${ssrInterpolate(item.name)}</h3><p data-v-35373aa6>${ssrInterpolate(item.description)}</p><strong data-v-35373aa6>£${ssrInterpolate(item.price)}</strong></div></article>`);
				});
				_push(`<!--]--></div>`);
			} else _push(`<p class="menu-empty" data-v-35373aa6>No published menu products yet. Add food items from the GrillVibes workspace.</p>`);
			_push(`</section><section class="final-cta section-wrap" data-v-35373aa6><div class="final-cta-inner" data-v-35373aa6><div data-v-35373aa6><p class="kicker kicker--violet" data-v-35373aa6>Project for sale</p><h2 data-v-35373aa6>Own GrillVibes<br data-v-35373aa6><em data-v-35373aa6>and Start Selling Faster.</em></h2><p data-v-35373aa6>A strong base for restaurants, cafes, cloud kitchens, food courts, and software houses that want a complete restaurant management platform without starting from zero.</p></div><div class="final-actions" data-v-35373aa6><a class="button button--violet" href="#footer" data-v-35373aa6>Request demo and price <span data-v-35373aa6>→</span></a><a class="text-link text-link--light" href="#features" data-v-35373aa6>Review modules <span data-v-35373aa6>↗</span></a></div></div></section></main><footer id="footer" class="site-footer" data-v-35373aa6><div class="section-wrap footer-grid" data-v-35373aa6><div data-v-35373aa6><a class="brand" href="/" data-v-35373aa6><span class="brand-mark" data-v-35373aa6>G</span><span data-v-35373aa6>Grill<span class="brand-accent" data-v-35373aa6>Vibes</span></span></a><p data-v-35373aa6>Complete restaurant POS and management project for sale.</p></div><nav aria-label="Footer navigation" data-v-35373aa6><a href="#features" data-v-35373aa6>Modules</a><a href="#workflow" data-v-35373aa6>Tech Stack</a><a href="#guest-ordering" data-v-35373aa6>Buyer Fit</a><a href="#menu" data-v-35373aa6>Public Pages</a></nav><a href="/login" class="footer-signin" data-v-35373aa6>Open admin demo ↗</a></div></footer></div>`);
		};
	}
};
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/pages/ProductPage.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var ProductPage_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-35373aa6"]]);
//#endregion
export { ProductPage_default as default };
