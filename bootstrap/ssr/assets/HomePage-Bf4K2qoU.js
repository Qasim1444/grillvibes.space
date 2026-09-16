import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-BOaGB7Aw.js";
import { computed, mergeProps, ref, unref, useSSRContext, watch } from "vue";
import { useForm } from "@inertiajs/vue3";
import { ssrIncludeBooleanAttr, ssrInterpolate, ssrLooseContain, ssrLooseEqual, ssrRenderAttr, ssrRenderAttrs, ssrRenderClass, ssrRenderList } from "vue/server-renderer";
//#region resources/js/pages/HomePage.vue
var _sfc_main = /*@__PURE__*/ Object.assign({ layout: null }, {
	__name: "HomePage",
	__ssrInlineRender: true,
	props: {
		categories: {
			type: Array,
			default: () => []
		},
		foodItems: {
			type: Array,
			default: () => []
		},
		tables: {
			type: Array,
			default: () => []
		},
		blogPosts: {
			type: Array,
			default: () => []
		},
		feedback: {
			type: Array,
			default: () => []
		}
	},
	setup(__props) {
		const props = __props;
		const stars = (r) => "★".repeat(Math.max(0, Math.min(5, Number(r) || 0))) + "☆".repeat(5 - Math.max(0, Math.min(5, Number(r) || 0)));
		const mobileOpen = ref(false);
		const ribbonFeatures = [
			{
				label: "POS & Orders",
				icon: "▣",
				tone: "pink"
			},
			{
				label: "Kitchen Display",
				icon: "◫",
				tone: "orange"
			},
			{
				label: "Inventory",
				icon: "▦",
				tone: "green"
			},
			{
				label: "Staff Management",
				icon: "♙",
				tone: "blue"
			},
			{
				label: "Reservations",
				icon: "⌑",
				tone: "violet"
			},
			{
				label: "QR Menu",
				icon: "⌁",
				tone: "rose"
			},
			{
				label: "Reports",
				icon: "◒",
				tone: "gold"
			}
		];
		const categoriesById = (id) => props.categories.find((category) => category.id === id)?.name;
		const formatBlogDate = (value) => value ? new Intl.DateTimeFormat("en-GB", {
			day: "numeric",
			month: "short",
			year: "numeric"
		}).format(new Date(value)) : "";
		const menuCategories = computed(() => [{
			id: "all",
			name: "All dishes",
			icon: "✦"
		}, ...props.categories.map((category) => ({
			id: category.id,
			name: category.name,
			icon: "✦"
		}))]);
		const activeCategory = ref("all");
		const filteredItems = computed(() => activeCategory.value === "all" ? props.foodItems : props.foodItems.filter((item) => item.foodcategory_id === activeCategory.value));
		const times = [
			"12:30",
			"13:00",
			"18:00",
			"18:30",
			"19:00",
			"19:30",
			"20:00",
			"20:30"
		];
		const tables = computed(() => props.tables);
		const reservation = useForm({
			date: "",
			time: "19:00",
			guests: 2,
			duration_minutes: 90,
			dining_table_id: null,
			guest_name: "",
			guest_phone: "",
			guest_email: "",
			occasion: "",
			notes: ""
		});
		const isTableSuitable = (table) => table.status === "available" && table.capacity >= Number(reservation.guests);
		watch(() => reservation.guests, () => {
			const selectedTable = tables.value.find((table) => table.id === reservation.dining_table_id);
			if (selectedTable && !isTableSuitable(selectedTable)) reservation.dining_table_id = null;
		});
		const reservationSent = ref(false);
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "restaurant-home" }, _attrs))} data-v-53b5dbec><header class="site-header" data-v-53b5dbec><a class="brand" href="/" aria-label="GrillVibes home" data-v-53b5dbec><span class="brand-mark" data-v-53b5dbec>G</span><span data-v-53b5dbec>Grill<span class="brand-accent" data-v-53b5dbec>Vibes</span></span></a><nav class="${ssrRenderClass([{ "site-nav--open": mobileOpen.value }, "site-nav"])}" aria-label="Primary navigation" data-v-53b5dbec><a href="/" data-v-53b5dbec>Home</a><a href="/product" data-v-53b5dbec>Products</a><a href="#menu" data-v-53b5dbec>Menu</a><a href="#reserve" data-v-53b5dbec>Reservation</a><a href="#blog" data-v-53b5dbec>Blog</a><a href="#story" data-v-53b5dbec>About</a><a href="#footer" data-v-53b5dbec>Contact</a></nav><div class="header-actions" data-v-53b5dbec><a class="header-login" href="/login" data-v-53b5dbec>Sign In</a><a class="button button--coral button--small" href="#reserve" data-v-53b5dbec>Get Started <span data-v-53b5dbec>↗</span></a><button class="menu-toggle" type="button"${ssrRenderAttr("aria-expanded", mobileOpen.value)} aria-label="Toggle navigation" data-v-53b5dbec><span data-v-53b5dbec></span><span data-v-53b5dbec></span><span data-v-53b5dbec></span></button></div></header><main data-v-53b5dbec><section class="hero section-shell" data-v-53b5dbec><div class="hero-copy" data-v-53b5dbec><div class="scribble" data-v-53b5dbec>Good Food<br data-v-53b5dbec>Better Business <span data-v-53b5dbec>♡</span></div><p class="eyebrow" data-v-53b5dbec><span class="eyebrow-dot" data-v-53b5dbec></span> Restaurant operations, beautifully connected</p><h1 data-v-53b5dbec>Delicious Food<br data-v-53b5dbec><em data-v-53b5dbec>Smarter Operations</em></h1><p class="hero-text" data-v-53b5dbec> GrillVibes helps restaurants manage orders, kitchen, inventory, staff, finance, and guest experiences — so you can focus on serving great food. </p><div class="hero-actions" data-v-53b5dbec><a class="button button--coral" href="#reserve" data-v-53b5dbec>Book a Table</a><a class="button button--outline" href="#story" data-v-53b5dbec><span class="play" data-v-53b5dbec>▶</span> Watch Video</a></div><div class="hero-stats" aria-label="GrillVibes highlights" data-v-53b5dbec><div data-v-53b5dbec><strong data-v-53b5dbec>500+</strong><span data-v-53b5dbec>Restaurants</span></div><div data-v-53b5dbec><strong data-v-53b5dbec>50K+</strong><span data-v-53b5dbec>Happy Customers</span></div><div data-v-53b5dbec><strong data-v-53b5dbec>99.9%</strong><span data-v-53b5dbec>Uptime</span></div><div data-v-53b5dbec><strong data-v-53b5dbec>24/7</strong><span data-v-53b5dbec>Support</span></div></div></div><div class="hero-visual" data-v-53b5dbec><div class="leaf leaf--1" data-v-53b5dbec>✦</div><div class="leaf leaf--2" data-v-53b5dbec>✦</div><div class="hero-photo-wrap" data-v-53b5dbec><img src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&amp;fit=crop&amp;w=1200&amp;q=88" alt="Fresh plated restaurant food" data-v-53b5dbec></div><div class="fresh-badge" data-v-53b5dbec><small data-v-53b5dbec>FRESH FOOD</small><strong data-v-53b5dbec>Everyday</strong><span data-v-53b5dbec>✦</span></div><div class="hero-note" data-v-53b5dbec>Great Food<br data-v-53b5dbec><strong data-v-53b5dbec>Happier People</strong> <span data-v-53b5dbec>↗</span></div></div></section><section class="feature-ribbon section-shell" aria-label="GrillVibes capabilities" data-v-53b5dbec><!--[-->`);
			ssrRenderList(ribbonFeatures, (feature, index) => {
				_push(`<div class="ribbon-item" data-v-53b5dbec><div class="${ssrRenderClass([feature.tone, "ribbon-icon"])}" data-v-53b5dbec><span data-v-53b5dbec>${ssrInterpolate(feature.icon)}</span></div><span data-v-53b5dbec>${ssrInterpolate(feature.label)}</span>`);
				if (index < ribbonFeatures.length - 1) _push(`<i data-v-53b5dbec></i>`);
				else _push(`<!---->`);
				_push(`</div>`);
			});
			_push(`<!--]--></section><section id="story" class="experience section-shell" data-v-53b5dbec><div class="experience-copy" data-v-53b5dbec><p class="eyebrow" data-v-53b5dbec>A complete restaurant management platform</p><h2 data-v-53b5dbec>Run the restaurant.<br data-v-53b5dbec><em data-v-53b5dbec>Enjoy the craft.</em></h2><p class="section-lede" data-v-53b5dbec> From front of house to back of house, GrillVibes brings everything together in one connected platform. </p><div class="check-list" data-v-53b5dbec><div data-v-53b5dbec><span data-v-53b5dbec>✓</span>Easy to use and quick to set up</div><div data-v-53b5dbec><span data-v-53b5dbec>✓</span>Works for single or multi-branch restaurants</div><div data-v-53b5dbec><span data-v-53b5dbec>✓</span>Built for restaurants of all sizes</div><div data-v-53b5dbec><span data-v-53b5dbec>✓</span>Loved by restaurant owners</div></div><div class="inline-actions" data-v-53b5dbec><a class="button button--coral button--small" href="/login" data-v-53b5dbec>Get Started <span data-v-53b5dbec>↗</span></a><a class="text-link" href="/product" data-v-53b5dbec>Learn More <span data-v-53b5dbec>→</span></a></div></div><div class="experience-collage" data-v-53b5dbec><div class="collage-card collage-card--wide" data-v-53b5dbec><img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&amp;fit=crop&amp;w=1000&amp;q=85" alt="Warm modern restaurant dining room" loading="lazy" data-v-53b5dbec><span data-v-53b5dbec>Great ambience <b data-v-53b5dbec>↗</b></span></div><div class="collage-card collage-card--chef" data-v-53b5dbec><img src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&amp;fit=crop&amp;w=700&amp;q=85" alt="Chef preparing a dish" loading="lazy" data-v-53b5dbec><span data-v-53b5dbec>Happy chefs <b data-v-53b5dbec>↙</b></span></div><div class="collage-card collage-card--dish" data-v-53b5dbec><img src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&amp;fit=crop&amp;w=700&amp;q=85" alt="Colorful plated dish" loading="lazy" data-v-53b5dbec><span data-v-53b5dbec>Memorable<br data-v-53b5dbec>experiences ♥</span></div></div></section><section id="menu" class="menu-section" data-v-53b5dbec><div class="section-shell" data-v-53b5dbec><div class="section-heading" data-v-53b5dbec><div data-v-53b5dbec><p class="eyebrow" data-v-53b5dbec>From the kitchen</p><h2 data-v-53b5dbec>Made to be<br data-v-53b5dbec><em data-v-53b5dbec>remembered.</em></h2></div><p data-v-53b5dbec>Browse your live menu by category. Every dish shown here comes from the GrillVibes food catalogue.</p></div><div class="category-row" role="tablist" aria-label="Food categories" data-v-53b5dbec><!--[-->`);
			ssrRenderList(menuCategories.value, (category) => {
				_push(`<button class="${ssrRenderClass({ active: activeCategory.value === category.id })}" role="tab"${ssrRenderAttr("aria-selected", activeCategory.value === category.id)} data-v-53b5dbec><span data-v-53b5dbec>${ssrInterpolate(category.icon)}</span>${ssrInterpolate(category.name)}</button>`);
			});
			_push(`<!--]--></div><div class="food-grid" data-v-53b5dbec><!--[-->`);
			ssrRenderList(filteredItems.value, (item) => {
				_push(`<article class="food-card" data-v-53b5dbec><div class="food-image" data-v-53b5dbec><img${ssrRenderAttr("src", item.image)}${ssrRenderAttr("alt", item.name)} loading="lazy" data-v-53b5dbec>`);
				if (item.badge) _push(`<span class="food-badge" data-v-53b5dbec>${ssrInterpolate(item.badge)}</span>`);
				else _push(`<!---->`);
				_push(`</div><div class="food-info" data-v-53b5dbec><div data-v-53b5dbec><span class="food-category" data-v-53b5dbec>${ssrInterpolate(item.food_category?.name || categoriesById(item.foodcategory_id) || "Menu item")}</span><h3 data-v-53b5dbec>${ssrInterpolate(item.name)}</h3><p data-v-53b5dbec>${ssrInterpolate(item.description)}</p></div><strong data-v-53b5dbec>£${ssrInterpolate(item.price)}</strong></div></article>`);
			});
			_push(`<!--]--></div>`);
			if (!filteredItems.value.length) _push(`<p class="empty-state" data-v-53b5dbec>No published dishes in this category yet.</p>`);
			else _push(`<!---->`);
			_push(`</div></section>`);
			if (__props.feedback.length) {
				_push(`<section id="reviews" class="reviews-section" data-v-53b5dbec><div class="section-shell" data-v-53b5dbec><div class="section-heading" data-v-53b5dbec><div data-v-53b5dbec><p class="eyebrow" data-v-53b5dbec>Guest love</p><h2 data-v-53b5dbec>What our<br data-v-53b5dbec><em data-v-53b5dbec>guests say.</em></h2></div><p data-v-53b5dbec>Real reviews left by real customers after their GrillVibes experience.</p></div><div class="reviews-grid" data-v-53b5dbec><!--[-->`);
				ssrRenderList(__props.feedback, (f) => {
					_push(`<article class="review-card" data-v-53b5dbec><span class="review-stars" data-v-53b5dbec>${ssrInterpolate(stars(f.rating))}</span>`);
					if (f.comment) _push(`<p class="review-comment" data-v-53b5dbec>“${ssrInterpolate(f.comment)}”</p>`);
					else _push(`<!---->`);
					_push(`<div class="review-meta" data-v-53b5dbec><span class="review-avatar" data-v-53b5dbec>${ssrInterpolate((f.customer?.name || "G").charAt(0).toUpperCase())}</span><div data-v-53b5dbec><strong data-v-53b5dbec>${ssrInterpolate(f.customer?.name || "Guest")}</strong><small data-v-53b5dbec>${ssrInterpolate(formatBlogDate(f.created_at))}</small></div></div></article>`);
				});
				_push(`<!--]--></div></div></section>`);
			} else _push(`<!---->`);
			if (__props.blogPosts.length) {
				_push(`<section id="blog" class="blog-section" data-v-53b5dbec><div class="section-shell" data-v-53b5dbec><div class="section-heading blog-heading" data-v-53b5dbec><div data-v-53b5dbec><p class="eyebrow" data-v-53b5dbec>From the GrillVibes journal</p><h2 data-v-53b5dbec>Ideas for a<br data-v-53b5dbec><em data-v-53b5dbec>better service.</em></h2></div><p data-v-53b5dbec>Practical stories and fresh thinking from the people behind better restaurant operations.</p></div><div class="blog-grid" data-v-53b5dbec><!--[-->`);
				ssrRenderList(__props.blogPosts, (post) => {
					_push(`<a class="blog-card"${ssrRenderAttr("href", `/blog/${post.slug}`)} data-v-53b5dbec><div class="blog-image" data-v-53b5dbec>`);
					if (post.featured_image) _push(`<img${ssrRenderAttr("src", post.featured_image)}${ssrRenderAttr("alt", post.title)} loading="lazy" data-v-53b5dbec>`);
					else _push(`<span class="blog-image-placeholder" data-v-53b5dbec>K</span>`);
					_push(`</div><div class="blog-card-body" data-v-53b5dbec><div class="blog-meta" data-v-53b5dbec><span data-v-53b5dbec>${ssrInterpolate(post.categories?.[0]?.name || "Restaurant operations")}</span><time${ssrRenderAttr("datetime", post.published_at)} data-v-53b5dbec>${ssrInterpolate(formatBlogDate(post.published_at))}</time></div><h3 data-v-53b5dbec>${ssrInterpolate(post.title)}</h3><p data-v-53b5dbec>${ssrInterpolate(post.excerpt || post.body?.replace(/<[^>]*>/g, "").slice(0, 150))}</p></div></a>`);
				});
				_push(`<!--]--></div></div></section>`);
			} else _push(`<!---->`);
			_push(`<section id="reserve" class="reserve-wrap" data-v-53b5dbec><div class="reserve-section section-shell" data-v-53b5dbec><div class="reserve-copy" data-v-53b5dbec><p class="eyebrow" data-v-53b5dbec>Reservations</p><h2 data-v-53b5dbec>Reserve Your<br data-v-53b5dbec><em data-v-53b5dbec>Table</em></h2><p data-v-53b5dbec>Great food brings people together. Book your table and enjoy an amazing experience.</p><div class="reservation-note" data-v-53b5dbec><strong data-v-53b5dbec>Dining made easy.</strong><span data-v-53b5dbec>Tables stay held for 15 minutes.</span></div><div class="reservation-doodles" aria-hidden="true" data-v-53b5dbec>❀ <span data-v-53b5dbec>see you at the table</span> ♥</div></div><form class="reserve-form" data-v-53b5dbec><div class="form-head" data-v-53b5dbec><div data-v-53b5dbec><span data-v-53b5dbec>New reservation</span><h3 data-v-53b5dbec>Reservation details</h3></div><span class="pending-chip" data-v-53b5dbec>Pending confirmation</span></div>`);
			if (reservationSent.value) _push(`<div class="reservation-success" role="status" data-v-53b5dbec><div class="success-icon" data-v-53b5dbec>✓</div><div data-v-53b5dbec><strong data-v-53b5dbec>Request received.</strong><p data-v-53b5dbec>We will be in touch shortly to confirm your table.</p></div></div>`);
			else {
				_push(`<!--[--><div class="field-block" data-v-53b5dbec><label class="form-label" data-v-53b5dbec>Choose your table</label><div class="table-grid" data-v-53b5dbec><!--[-->`);
				ssrRenderList(tables.value, (table) => {
					_push(`<button type="button" class="${ssrRenderClass([{
						selected: unref(reservation).dining_table_id === table.id,
						unavailable: !isTableSuitable(table)
					}, "table-option"])}"${ssrIncludeBooleanAttr(!isTableSuitable(table)) ? " disabled" : ""} data-v-53b5dbec><strong data-v-53b5dbec>${ssrInterpolate(table.table_number)}</strong><span data-v-53b5dbec>${ssrInterpolate(table.capacity)} seats</span><small data-v-53b5dbec>${ssrInterpolate(table.status === "available" ? "Available" : "Unavailable")}</small></button>`);
				});
				_push(`<!--]--></div>`);
				if (!tables.value.length) _push(`<p class="table-note" data-v-53b5dbec>No tables are currently configured.</p>`);
				else _push(`<!---->`);
				_push(`</div><div class="form-row" data-v-53b5dbec><label data-v-53b5dbec>Date<input${ssrRenderAttr("value", unref(reservation).date)} type="date" required data-v-53b5dbec></label><label data-v-53b5dbec>Time<select data-v-53b5dbec><!--[-->`);
				ssrRenderList(times, (time) => {
					_push(`<option data-v-53b5dbec${ssrIncludeBooleanAttr(Array.isArray(unref(reservation).time) ? ssrLooseContain(unref(reservation).time, null) : ssrLooseEqual(unref(reservation).time, null)) ? " selected" : ""}>${ssrInterpolate(time)}</option>`);
				});
				_push(`<!--]--></select></label></div><div class="form-row" data-v-53b5dbec><label data-v-53b5dbec>Party size<select data-v-53b5dbec><!--[-->`);
				ssrRenderList(8, (number) => {
					_push(`<option${ssrRenderAttr("value", number)} data-v-53b5dbec${ssrIncludeBooleanAttr(Array.isArray(unref(reservation).guests) ? ssrLooseContain(unref(reservation).guests, number) : ssrLooseEqual(unref(reservation).guests, number)) ? " selected" : ""}>${ssrInterpolate(number)} ${ssrInterpolate(number === 1 ? "guest" : "guests")}</option>`);
				});
				_push(`<!--]--></select></label><label data-v-53b5dbec>Duration<select data-v-53b5dbec><option${ssrRenderAttr("value", 60)} data-v-53b5dbec${ssrIncludeBooleanAttr(Array.isArray(unref(reservation).duration_minutes) ? ssrLooseContain(unref(reservation).duration_minutes, 60) : ssrLooseEqual(unref(reservation).duration_minutes, 60)) ? " selected" : ""}>60 min</option><option${ssrRenderAttr("value", 90)} data-v-53b5dbec${ssrIncludeBooleanAttr(Array.isArray(unref(reservation).duration_minutes) ? ssrLooseContain(unref(reservation).duration_minutes, 90) : ssrLooseEqual(unref(reservation).duration_minutes, 90)) ? " selected" : ""}>90 min</option><option${ssrRenderAttr("value", 120)} data-v-53b5dbec${ssrIncludeBooleanAttr(Array.isArray(unref(reservation).duration_minutes) ? ssrLooseContain(unref(reservation).duration_minutes, 120) : ssrLooseEqual(unref(reservation).duration_minutes, 120)) ? " selected" : ""}>120 min</option><option${ssrRenderAttr("value", 180)} data-v-53b5dbec${ssrIncludeBooleanAttr(Array.isArray(unref(reservation).duration_minutes) ? ssrLooseContain(unref(reservation).duration_minutes, 180) : ssrLooseEqual(unref(reservation).duration_minutes, 180)) ? " selected" : ""}>180 min</option></select></label></div><div class="form-row" data-v-53b5dbec><label data-v-53b5dbec>Your name<input${ssrRenderAttr("value", unref(reservation).guest_name)} type="text" placeholder="Alex Morgan" required data-v-53b5dbec></label><label data-v-53b5dbec>Email<input${ssrRenderAttr("value", unref(reservation).guest_email)} type="email" placeholder="alex@example.com" required data-v-53b5dbec></label></div><div class="form-row" data-v-53b5dbec><label data-v-53b5dbec>Phone<input${ssrRenderAttr("value", unref(reservation).guest_phone)} type="tel" placeholder="+44 7000 000000" data-v-53b5dbec></label><label data-v-53b5dbec>Occasion<input${ssrRenderAttr("value", unref(reservation).occasion)} type="text" placeholder="Birthday, anniversary..." data-v-53b5dbec></label></div><label class="notes-field" data-v-53b5dbec>Notes<textarea rows="3" placeholder="Allergies, accessibility, or other requests" data-v-53b5dbec>${ssrInterpolate(unref(reservation).notes)}</textarea></label><button class="button button--coral submit-button" type="submit"${ssrIncludeBooleanAttr(unref(reservation).processing || !unref(reservation).dining_table_id) ? " disabled" : ""} data-v-53b5dbec>${ssrInterpolate(unref(reservation).processing ? "Sending request…" : "Request a table")} <span data-v-53b5dbec>→</span></button>`);
				if (Object.keys(unref(reservation).errors).length) _push(`<p class="reservation-error" data-v-53b5dbec>Please check the booking details and try again.</p>`);
				else _push(`<!---->`);
				_push(`<small class="form-footnote" data-v-53b5dbec>For tonight, please call <a href="tel:+441234567890" data-v-53b5dbec>01234 567 890</a>.</small><!--]-->`);
			}
			_push(`</form></div></section></main><footer id="footer" class="site-footer" data-v-53b5dbec><div class="section-shell footer-grid" data-v-53b5dbec><div data-v-53b5dbec><a class="brand" href="/" data-v-53b5dbec><span class="brand-mark" data-v-53b5dbec>G</span><span data-v-53b5dbec>Grill<span class="brand-accent" data-v-53b5dbec>Vibes</span></span></a><p data-v-53b5dbec>Great food. Better operations.</p></div><nav aria-label="Footer navigation" data-v-53b5dbec><a href="#menu" data-v-53b5dbec>Menu</a><a href="#reserve" data-v-53b5dbec>Reservations</a><a href="/product" data-v-53b5dbec>Product</a><a href="#story" data-v-53b5dbec>About</a></nav><div class="footer-cta" data-v-53b5dbec><span data-v-53b5dbec>Ready to run service better?</span><a href="/login" data-v-53b5dbec>Enter GrillVibes ↗</a></div></div></footer></div>`);
		};
	}
});
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/pages/HomePage.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var HomePage_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-53b5dbec"]]);
//#endregion
export { HomePage_default as default };
