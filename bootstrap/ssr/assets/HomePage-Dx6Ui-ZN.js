import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-BOaGB7Aw.js";
import { t as grillvibes_logo_default } from "./grillvibes-logo-lmKkVPW5.js";
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
				label: "Flame Grill",
				icon: "▣",
				tone: "pink"
			},
			{
				label: "Fresh Prep",
				icon: "◫",
				tone: "orange"
			},
			{
				label: "Family Tables",
				icon: "▦",
				tone: "green"
			},
			{
				label: "Quick Service",
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
				label: "Guest Reviews",
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
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "restaurant-home" }, _attrs))} data-v-cec1a786><header class="site-header" data-v-cec1a786><a class="brand" href="/" aria-label="GrillVibes home" data-v-cec1a786><img class="brand-logo"${ssrRenderAttr("src", unref(grillvibes_logo_default))} alt="GrillVibes — Good Food, Better Vibes" data-v-cec1a786></a><nav class="${ssrRenderClass([{ "site-nav--open": mobileOpen.value }, "site-nav"])}" aria-label="Primary navigation" data-v-cec1a786><a href="/" data-v-cec1a786>Home</a><a href="/project" data-v-cec1a786>Project</a><a href="#menu" data-v-cec1a786>Menu</a><a href="#reserve" data-v-cec1a786>Reservation</a><a href="#blog" data-v-cec1a786>Blog</a><a href="#story" data-v-cec1a786>About</a><a href="#footer" data-v-cec1a786>Contact</a></nav><div class="header-actions" data-v-cec1a786><a class="header-login" href="/login" data-v-cec1a786>Sign In</a><a class="button button--coral button--small" href="#reserve" data-v-cec1a786>Book a Table <span data-v-cec1a786>↗</span></a><button class="menu-toggle" type="button"${ssrRenderAttr("aria-expanded", mobileOpen.value)} aria-label="Toggle navigation" data-v-cec1a786><span data-v-cec1a786></span><span data-v-cec1a786></span><span data-v-cec1a786></span></button></div></header><main data-v-cec1a786><section class="hero section-shell" data-v-cec1a786><div class="hero-copy" data-v-cec1a786><div class="scribble" data-v-cec1a786>Good Food<br data-v-cec1a786>Better Business <span data-v-cec1a786>♡</span></div><p class="eyebrow" data-v-cec1a786><span class="eyebrow-dot" data-v-cec1a786></span> Flame-grilled food, served fresh</p><h1 data-v-cec1a786>Bold Flavors<br data-v-cec1a786><em data-v-cec1a786>Fresh From the Grill</em></h1><p class="hero-text" data-v-cec1a786> Welcome to GrillVibes, a warm neighborhood restaurant for smoky burgers, sizzling platters, fresh sides, and easy table reservations. </p><div class="hero-actions" data-v-cec1a786><a class="button button--coral" href="#reserve" data-v-cec1a786>Book a Table</a><a class="button button--outline" href="#menu" data-v-cec1a786><span class="play" data-v-cec1a786>▶</span> View Menu</a></div><div class="hero-stats" aria-label="GrillVibes highlights" data-v-cec1a786><div data-v-cec1a786><strong data-v-cec1a786>35+</strong><span data-v-cec1a786>Signature Dishes</span></div><div data-v-cec1a786><strong data-v-cec1a786>4.8</strong><span data-v-cec1a786>Guest Rating</span></div><div data-v-cec1a786><strong data-v-cec1a786>7 Days</strong><span data-v-cec1a786>Open Weekly</span></div><div data-v-cec1a786><strong data-v-cec1a786>Fresh</strong><span data-v-cec1a786>Daily Prep</span></div></div></div><div class="hero-visual" data-v-cec1a786><div class="leaf leaf--1" data-v-cec1a786>✦</div><div class="leaf leaf--2" data-v-cec1a786>✦</div><div class="hero-photo-wrap" data-v-cec1a786><img src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&amp;fit=crop&amp;w=1200&amp;q=88" alt="Fresh plated restaurant food" data-v-cec1a786></div><div class="fresh-badge" data-v-cec1a786><small data-v-cec1a786>FRESH FOOD</small><strong data-v-cec1a786>Everyday</strong><span data-v-cec1a786>✦</span></div><div class="hero-note" data-v-cec1a786>Great Food<br data-v-cec1a786><strong data-v-cec1a786>Happier People</strong> <span data-v-cec1a786>↗</span></div></div></section><section class="feature-ribbon section-shell" aria-label="Restaurant highlights" data-v-cec1a786><!--[-->`);
			ssrRenderList(ribbonFeatures, (feature, index) => {
				_push(`<div class="ribbon-item" data-v-cec1a786><div class="${ssrRenderClass([feature.tone, "ribbon-icon"])}" data-v-cec1a786><span data-v-cec1a786>${ssrInterpolate(feature.icon)}</span></div><span data-v-cec1a786>${ssrInterpolate(feature.label)}</span>`);
				if (index < ribbonFeatures.length - 1) _push(`<i data-v-cec1a786></i>`);
				else _push(`<!---->`);
				_push(`</div>`);
			});
			_push(`<!--]--></section><section id="story" class="experience section-shell" data-v-cec1a786><div class="experience-copy" data-v-cec1a786><p class="eyebrow" data-v-cec1a786>Our story</p><h2 data-v-cec1a786>Good food.<br data-v-cec1a786><em data-v-cec1a786>Good company.</em></h2><p class="section-lede" data-v-cec1a786> GrillVibes is built around fire, freshness, and comfort. We serve generous plates, casual dining energy, and food that feels worth gathering for. </p><div class="check-list" data-v-cec1a786><div data-v-cec1a786><span data-v-cec1a786>✓</span>Fresh ingredients prepared every day</div><div data-v-cec1a786><span data-v-cec1a786>✓</span>Flame-grilled mains, burgers, and platters</div><div data-v-cec1a786><span data-v-cec1a786>✓</span>Comfortable seating for family and friends</div><div data-v-cec1a786><span data-v-cec1a786>✓</span>Easy online reservations</div></div><div class="inline-actions" data-v-cec1a786><a class="button button--coral button--small" href="#reserve" data-v-cec1a786>Reserve Now <span data-v-cec1a786>↗</span></a><a class="text-link" href="#menu" data-v-cec1a786>Explore Menu <span data-v-cec1a786>→</span></a></div></div><div class="experience-collage" data-v-cec1a786><div class="collage-card collage-card--wide" data-v-cec1a786><img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&amp;fit=crop&amp;w=1000&amp;q=85" alt="Warm modern restaurant dining room" loading="lazy" data-v-cec1a786><span data-v-cec1a786>Great ambience <b data-v-cec1a786>↗</b></span></div><div class="collage-card collage-card--chef" data-v-cec1a786><img src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&amp;fit=crop&amp;w=700&amp;q=85" alt="Chef preparing a dish" loading="lazy" data-v-cec1a786><span data-v-cec1a786>Happy chefs <b data-v-cec1a786>↙</b></span></div><div class="collage-card collage-card--dish" data-v-cec1a786><img src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&amp;fit=crop&amp;w=700&amp;q=85" alt="Colorful plated dish" loading="lazy" data-v-cec1a786><span data-v-cec1a786>Memorable<br data-v-cec1a786>experiences ♥</span></div></div></section><section id="menu" class="menu-section" data-v-cec1a786><div class="section-shell" data-v-cec1a786><div class="section-heading" data-v-cec1a786><div data-v-cec1a786><p class="eyebrow" data-v-cec1a786>From the kitchen</p><h2 data-v-cec1a786>Made to be<br data-v-cec1a786><em data-v-cec1a786>remembered.</em></h2></div><p data-v-cec1a786>Browse guest favorites by category, from smoky mains to shareable plates and fresh sides.</p></div><div class="category-row" role="tablist" aria-label="Food categories" data-v-cec1a786><!--[-->`);
			ssrRenderList(menuCategories.value, (category) => {
				_push(`<button class="${ssrRenderClass({ active: activeCategory.value === category.id })}" role="tab"${ssrRenderAttr("aria-selected", activeCategory.value === category.id)} data-v-cec1a786><span data-v-cec1a786>${ssrInterpolate(category.icon)}</span>${ssrInterpolate(category.name)}</button>`);
			});
			_push(`<!--]--></div><div class="food-grid" data-v-cec1a786><!--[-->`);
			ssrRenderList(filteredItems.value, (item) => {
				_push(`<article class="food-card" data-v-cec1a786><div class="food-image" data-v-cec1a786><img${ssrRenderAttr("src", item.image)}${ssrRenderAttr("alt", item.name)} loading="lazy" data-v-cec1a786>`);
				if (item.badge) _push(`<span class="food-badge" data-v-cec1a786>${ssrInterpolate(item.badge)}</span>`);
				else _push(`<!---->`);
				_push(`</div><div class="food-info" data-v-cec1a786><div data-v-cec1a786><span class="food-category" data-v-cec1a786>${ssrInterpolate(item.food_category?.name || categoriesById(item.foodcategory_id) || "Menu item")}</span><h3 data-v-cec1a786>${ssrInterpolate(item.name)}</h3><p data-v-cec1a786>${ssrInterpolate(item.description)}</p></div><strong data-v-cec1a786>£${ssrInterpolate(item.price)}</strong></div></article>`);
			});
			_push(`<!--]--></div>`);
			if (!filteredItems.value.length) _push(`<p class="empty-state" data-v-cec1a786>No published dishes in this category yet.</p>`);
			else _push(`<!---->`);
			_push(`</div></section>`);
			if (__props.feedback.length) {
				_push(`<section id="reviews" class="reviews-section" data-v-cec1a786><div class="section-shell" data-v-cec1a786><div class="section-heading" data-v-cec1a786><div data-v-cec1a786><p class="eyebrow" data-v-cec1a786>Guest love</p><h2 data-v-cec1a786>What our<br data-v-cec1a786><em data-v-cec1a786>guests say.</em></h2></div><p data-v-cec1a786>Real reviews left by real customers after their GrillVibes experience.</p></div><div class="reviews-grid" data-v-cec1a786><!--[-->`);
				ssrRenderList(__props.feedback, (f) => {
					_push(`<article class="review-card" data-v-cec1a786><span class="review-stars" data-v-cec1a786>${ssrInterpolate(stars(f.rating))}</span>`);
					if (f.comment) _push(`<p class="review-comment" data-v-cec1a786>“${ssrInterpolate(f.comment)}”</p>`);
					else _push(`<!---->`);
					_push(`<div class="review-meta" data-v-cec1a786><span class="review-avatar" data-v-cec1a786>${ssrInterpolate((f.customer?.name || "G").charAt(0).toUpperCase())}</span><div data-v-cec1a786><strong data-v-cec1a786>${ssrInterpolate(f.customer?.name || "Guest")}</strong><small data-v-cec1a786>${ssrInterpolate(formatBlogDate(f.created_at))}</small></div></div></article>`);
				});
				_push(`<!--]--></div></div></section>`);
			} else _push(`<!---->`);
			if (__props.blogPosts.length) {
				_push(`<section id="blog" class="blog-section" data-v-cec1a786><div class="section-shell" data-v-cec1a786><div class="section-heading blog-heading" data-v-cec1a786><div data-v-cec1a786><p class="eyebrow" data-v-cec1a786>From the GrillVibes journal</p><h2 data-v-cec1a786>Stories from<br data-v-cec1a786><em data-v-cec1a786>our table.</em></h2></div><p data-v-cec1a786>Fresh updates, kitchen notes, specials, and stories from the GrillVibes team.</p></div><div class="blog-grid" data-v-cec1a786><!--[-->`);
				ssrRenderList(__props.blogPosts, (post) => {
					_push(`<a class="blog-card"${ssrRenderAttr("href", `/blog/${post.slug}`)} data-v-cec1a786><div class="blog-image" data-v-cec1a786>`);
					if (post.featured_image) _push(`<img${ssrRenderAttr("src", post.featured_image)}${ssrRenderAttr("alt", post.title)} loading="lazy" data-v-cec1a786>`);
					else _push(`<span class="blog-image-placeholder" data-v-cec1a786>K</span>`);
					_push(`</div><div class="blog-card-body" data-v-cec1a786><div class="blog-meta" data-v-cec1a786><span data-v-cec1a786>${ssrInterpolate(post.categories?.[0]?.name || "Restaurant stories")}</span><time${ssrRenderAttr("datetime", post.published_at)} data-v-cec1a786>${ssrInterpolate(formatBlogDate(post.published_at))}</time></div><h3 data-v-cec1a786>${ssrInterpolate(post.title)}</h3><p data-v-cec1a786>${ssrInterpolate(post.excerpt || post.body?.replace(/<[^>]*>/g, "").slice(0, 150))}</p></div></a>`);
				});
				_push(`<!--]--></div></div></section>`);
			} else _push(`<!---->`);
			_push(`<section id="reserve" class="reserve-wrap" data-v-cec1a786><div class="reserve-section section-shell" data-v-cec1a786><div class="reserve-copy" data-v-cec1a786><p class="eyebrow" data-v-cec1a786>Reservations</p><h2 data-v-cec1a786>Reserve Your<br data-v-cec1a786><em data-v-cec1a786>Table</em></h2><p data-v-cec1a786>Great food brings people together. Book your table and enjoy an amazing experience.</p><div class="reservation-note" data-v-cec1a786><strong data-v-cec1a786>Dining made easy.</strong><span data-v-cec1a786>Tables stay held for 15 minutes.</span></div><div class="reservation-doodles" aria-hidden="true" data-v-cec1a786>❀ <span data-v-cec1a786>see you at the table</span> ♥</div></div><form class="reserve-form" data-v-cec1a786><div class="form-head" data-v-cec1a786><div data-v-cec1a786><span data-v-cec1a786>New reservation</span><h3 data-v-cec1a786>Reservation details</h3></div><span class="pending-chip" data-v-cec1a786>Pending confirmation</span></div>`);
			if (reservationSent.value) _push(`<div class="reservation-success" role="status" data-v-cec1a786><div class="success-icon" data-v-cec1a786>✓</div><div data-v-cec1a786><strong data-v-cec1a786>Request received.</strong><p data-v-cec1a786>We will be in touch shortly to confirm your table.</p></div></div>`);
			else {
				_push(`<!--[--><div class="field-block" data-v-cec1a786><label class="form-label" data-v-cec1a786>Choose your table</label><div class="table-grid" data-v-cec1a786><!--[-->`);
				ssrRenderList(tables.value, (table) => {
					_push(`<button type="button" class="${ssrRenderClass([{
						selected: unref(reservation).dining_table_id === table.id,
						unavailable: !isTableSuitable(table)
					}, "table-option"])}"${ssrIncludeBooleanAttr(!isTableSuitable(table)) ? " disabled" : ""} data-v-cec1a786><strong data-v-cec1a786>${ssrInterpolate(table.table_number)}</strong><span data-v-cec1a786>${ssrInterpolate(table.capacity)} seats</span><small data-v-cec1a786>${ssrInterpolate(table.status === "available" ? "Available" : "Unavailable")}</small></button>`);
				});
				_push(`<!--]--></div>`);
				if (!tables.value.length) _push(`<p class="table-note" data-v-cec1a786>No tables are currently configured.</p>`);
				else _push(`<!---->`);
				_push(`</div><div class="form-row" data-v-cec1a786><label data-v-cec1a786>Date<input${ssrRenderAttr("value", unref(reservation).date)} type="date" required data-v-cec1a786></label><label data-v-cec1a786>Time<input${ssrRenderAttr("value", unref(reservation).time)} type="time" required data-v-cec1a786></label></div><div class="form-row" data-v-cec1a786><label data-v-cec1a786>Party size<select data-v-cec1a786><!--[-->`);
				ssrRenderList(8, (number) => {
					_push(`<option${ssrRenderAttr("value", number)} data-v-cec1a786${ssrIncludeBooleanAttr(Array.isArray(unref(reservation).guests) ? ssrLooseContain(unref(reservation).guests, number) : ssrLooseEqual(unref(reservation).guests, number)) ? " selected" : ""}>${ssrInterpolate(number)} ${ssrInterpolate(number === 1 ? "guest" : "guests")}</option>`);
				});
				_push(`<!--]--></select></label><label data-v-cec1a786>Duration<select data-v-cec1a786><option${ssrRenderAttr("value", 60)} data-v-cec1a786${ssrIncludeBooleanAttr(Array.isArray(unref(reservation).duration_minutes) ? ssrLooseContain(unref(reservation).duration_minutes, 60) : ssrLooseEqual(unref(reservation).duration_minutes, 60)) ? " selected" : ""}>60 min</option><option${ssrRenderAttr("value", 90)} data-v-cec1a786${ssrIncludeBooleanAttr(Array.isArray(unref(reservation).duration_minutes) ? ssrLooseContain(unref(reservation).duration_minutes, 90) : ssrLooseEqual(unref(reservation).duration_minutes, 90)) ? " selected" : ""}>90 min</option><option${ssrRenderAttr("value", 120)} data-v-cec1a786${ssrIncludeBooleanAttr(Array.isArray(unref(reservation).duration_minutes) ? ssrLooseContain(unref(reservation).duration_minutes, 120) : ssrLooseEqual(unref(reservation).duration_minutes, 120)) ? " selected" : ""}>120 min</option><option${ssrRenderAttr("value", 180)} data-v-cec1a786${ssrIncludeBooleanAttr(Array.isArray(unref(reservation).duration_minutes) ? ssrLooseContain(unref(reservation).duration_minutes, 180) : ssrLooseEqual(unref(reservation).duration_minutes, 180)) ? " selected" : ""}>180 min</option></select></label></div><div class="form-row" data-v-cec1a786><label data-v-cec1a786>Your name<input${ssrRenderAttr("value", unref(reservation).guest_name)} type="text" placeholder="Alex Morgan" required data-v-cec1a786></label><label data-v-cec1a786>Email<input${ssrRenderAttr("value", unref(reservation).guest_email)} type="email" placeholder="alex@example.com" required data-v-cec1a786></label></div><div class="form-row" data-v-cec1a786><label data-v-cec1a786>Phone<input${ssrRenderAttr("value", unref(reservation).guest_phone)} type="tel" placeholder="+44 7000 000000" required data-v-cec1a786></label><label data-v-cec1a786>Occasion<input${ssrRenderAttr("value", unref(reservation).occasion)} type="text" placeholder="Birthday, anniversary..." required data-v-cec1a786></label></div><label class="notes-field" data-v-cec1a786>Notes<textarea rows="3" placeholder="Allergies, accessibility, or other requests" required data-v-cec1a786>${ssrInterpolate(unref(reservation).notes)}</textarea></label><button class="button button--coral submit-button" type="submit"${ssrIncludeBooleanAttr(unref(reservation).processing || !unref(reservation).dining_table_id) ? " disabled" : ""} data-v-cec1a786>${ssrInterpolate(unref(reservation).processing ? "Sending request…" : "Request a table")} <span data-v-cec1a786>→</span></button>`);
				if (Object.keys(unref(reservation).errors).length) _push(`<p class="reservation-error" data-v-cec1a786>Please check the booking details and try again.</p>`);
				else _push(`<!---->`);
				_push(`<small class="form-footnote" data-v-cec1a786>For tonight, please call <a href="tel:+441234567890" data-v-cec1a786>01234 567 890</a>.</small><!--]-->`);
			}
			_push(`</form></div></section></main><footer id="footer" class="site-footer" data-v-cec1a786><div class="section-shell footer-grid" data-v-cec1a786><div data-v-cec1a786><a class="brand" href="/" aria-label="GrillVibes home" data-v-cec1a786><img class="brand-logo"${ssrRenderAttr("src", unref(grillvibes_logo_default))} alt="GrillVibes — Good Food, Better Vibes" data-v-cec1a786></a><p data-v-cec1a786>Fresh grill, warm tables, bold flavor.</p></div><nav aria-label="Footer navigation" data-v-cec1a786><a href="#menu" data-v-cec1a786>Menu</a><a href="#reserve" data-v-cec1a786>Reservations</a><a href="/project" data-v-cec1a786>Project</a><a href="#story" data-v-cec1a786>About</a></nav><div class="footer-cta" data-v-cec1a786><span data-v-cec1a786>Hungry already?</span><a href="#reserve" data-v-cec1a786>Reserve a table ↗</a></div></div></footer></div>`);
		};
	}
});
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/pages/HomePage.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var HomePage_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-cec1a786"]]);
//#endregion
export { HomePage_default as default };
