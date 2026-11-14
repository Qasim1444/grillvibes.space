import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-BOaGB7Aw.js";
import { n as grillvibes_logo_default, t as PublicSiteHeader_default } from "./PublicSiteHeader-C0JcPdDO.js";
import { computed, mergeProps, onMounted, ref, unref, useSSRContext, watch } from "vue";
import { useForm } from "@inertiajs/vue3";
import { ssrIncludeBooleanAttr, ssrInterpolate, ssrLooseContain, ssrLooseEqual, ssrRenderAttr, ssrRenderAttrs, ssrRenderClass, ssrRenderComponent, ssrRenderList } from "vue/server-renderer";
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
		bookedReservations: {
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
		const theme = ref("dark");
		onMounted(() => {
			const savedTheme = window.localStorage.getItem("grillvibes-home-theme");
			if (savedTheme === "light" || savedTheme === "dark") theme.value = savedTheme;
		});
		const toggleTheme = () => {
			theme.value = theme.value === "dark" ? "light" : "dark";
			window.localStorage.setItem("grillvibes-home-theme", theme.value);
		};
		const stars = (r) => "★".repeat(Math.max(0, Math.min(5, Number(r) || 0))) + "☆".repeat(5 - Math.max(0, Math.min(5, Number(r) || 0)));
		const homeNavItems = [
			{
				label: "Home",
				href: "/"
			},
			{
				label: "Project",
				href: "/project"
			},
			{
				label: "Menu",
				href: "#menu"
			},
			{
				label: "Reservation",
				href: "#reserve"
			},
			{
				label: "Blog",
				href: "#blog"
			},
			{
				label: "About",
				href: "#story"
			},
			{
				label: "Contact",
				href: "#footer"
			}
		];
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
			duration_minutes: "",
			dining_table_id: null,
			guest_name: "",
			guest_phone: "",
			guest_email: "",
			occasion: "",
			notes: ""
		});
		const isTableBooked = (tableId) => {
			if (!reservation.date || !reservation.time) return false;
			const start = /* @__PURE__ */ new Date(`${reservation.date}T${reservation.time}`);
			const end = new Date(start.getTime() + Number(reservation.duration_minutes || 90) * 6e4);
			return props.bookedReservations.some((item) => {
				if (Number(item.dining_table_id) !== Number(tableId)) return false;
				const bookedStart = new Date(item.reserved_at);
				const bookedEnd = new Date(bookedStart.getTime() + Number(item.duration_minutes || 90) * 6e4);
				return start < bookedEnd && bookedStart < end;
			});
		};
		const isTableSuitable = (table) => table.status === "available" && table.capacity >= Number(reservation.guests) && !isTableBooked(table.id);
		watch([
			() => reservation.guests,
			() => reservation.date,
			() => reservation.time,
			() => reservation.duration_minutes
		], () => {
			const selectedTable = tables.value.find((table) => table.id === reservation.dining_table_id);
			if (selectedTable && !isTableSuitable(selectedTable)) reservation.dining_table_id = null;
		});
		const reservationSent = ref(false);
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({
				class: "restaurant-home",
				"data-theme": theme.value
			}, _attrs))} data-v-7b92ea4c>`);
			_push(ssrRenderComponent(PublicSiteHeader_default, {
				items: homeNavItems,
				"active-item": "Home",
				"action-label": "Book a Table",
				"action-href": "#reserve",
				theme: theme.value,
				onToggleTheme: toggleTheme
			}, null, _parent));
			_push(`<main data-v-7b92ea4c><section class="hero section-shell" data-v-7b92ea4c><div class="hero-copy" data-v-7b92ea4c><div class="scribble" data-v-7b92ea4c>Good Food<br data-v-7b92ea4c>Better Business <span data-v-7b92ea4c>♡</span></div><p class="eyebrow" data-v-7b92ea4c><span class="eyebrow-dot" data-v-7b92ea4c></span> Flame-grilled food, served fresh</p><h1 data-v-7b92ea4c>Bold Flavors<br data-v-7b92ea4c><em data-v-7b92ea4c>Fresh From the Grill</em></h1><p class="hero-text" data-v-7b92ea4c> Welcome to GrillVibes, a warm neighborhood restaurant for smoky burgers, sizzling platters, fresh sides, and easy table reservations. </p><div class="hero-actions" data-v-7b92ea4c><a class="button button--coral" href="#reserve" data-v-7b92ea4c>Book a Table</a><a class="button button--outline" href="#menu" data-v-7b92ea4c><span class="play" data-v-7b92ea4c>▶</span> View Menu</a></div><div class="hero-stats" aria-label="GrillVibes highlights" data-v-7b92ea4c><div data-v-7b92ea4c><strong data-v-7b92ea4c>35+</strong><span data-v-7b92ea4c>Signature Dishes</span></div><div data-v-7b92ea4c><strong data-v-7b92ea4c>4.8</strong><span data-v-7b92ea4c>Guest Rating</span></div><div data-v-7b92ea4c><strong data-v-7b92ea4c>7 Days</strong><span data-v-7b92ea4c>Open Weekly</span></div><div data-v-7b92ea4c><strong data-v-7b92ea4c>Fresh</strong><span data-v-7b92ea4c>Daily Prep</span></div></div></div><div class="hero-visual" data-v-7b92ea4c><div class="leaf leaf--1" data-v-7b92ea4c>✦</div><div class="leaf leaf--2" data-v-7b92ea4c>✦</div><div class="hero-photo-wrap" data-v-7b92ea4c><img src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&amp;fit=crop&amp;w=1200&amp;q=88" alt="Fresh plated restaurant food" data-v-7b92ea4c></div><div class="fresh-badge" data-v-7b92ea4c><small data-v-7b92ea4c>FRESH FOOD</small><strong data-v-7b92ea4c>Everyday</strong><span data-v-7b92ea4c>✦</span></div><div class="hero-note" data-v-7b92ea4c>Great Food<br data-v-7b92ea4c><strong data-v-7b92ea4c>Happier People</strong> <span data-v-7b92ea4c>↗</span></div></div></section><section class="feature-ribbon section-shell" aria-label="Restaurant highlights" data-v-7b92ea4c><!--[-->`);
			ssrRenderList(ribbonFeatures, (feature, index) => {
				_push(`<div class="ribbon-item" data-v-7b92ea4c><div class="${ssrRenderClass([feature.tone, "ribbon-icon"])}" data-v-7b92ea4c><span data-v-7b92ea4c>${ssrInterpolate(feature.icon)}</span></div><span data-v-7b92ea4c>${ssrInterpolate(feature.label)}</span>`);
				if (index < ribbonFeatures.length - 1) _push(`<i data-v-7b92ea4c></i>`);
				else _push(`<!---->`);
				_push(`</div>`);
			});
			_push(`<!--]--></section><section id="story" class="experience section-shell" data-v-7b92ea4c><div class="experience-copy" data-v-7b92ea4c><p class="eyebrow" data-v-7b92ea4c>Our story</p><h2 data-v-7b92ea4c>Good food.<br data-v-7b92ea4c><em data-v-7b92ea4c>Good company.</em></h2><p class="section-lede" data-v-7b92ea4c> GrillVibes is built around fire, freshness, and comfort. We serve generous plates, casual dining energy, and food that feels worth gathering for. </p><div class="check-list" data-v-7b92ea4c><div data-v-7b92ea4c><span data-v-7b92ea4c>✓</span>Fresh ingredients prepared every day</div><div data-v-7b92ea4c><span data-v-7b92ea4c>✓</span>Flame-grilled mains, burgers, and platters</div><div data-v-7b92ea4c><span data-v-7b92ea4c>✓</span>Comfortable seating for family and friends</div><div data-v-7b92ea4c><span data-v-7b92ea4c>✓</span>Easy online reservations</div></div><div class="inline-actions" data-v-7b92ea4c><a class="button button--coral button--small" href="#reserve" data-v-7b92ea4c>Reserve Now <span data-v-7b92ea4c>↗</span></a><a class="text-link" href="#menu" data-v-7b92ea4c>Explore Menu <span data-v-7b92ea4c>→</span></a></div></div><div class="experience-collage" data-v-7b92ea4c><div class="collage-card collage-card--wide" data-v-7b92ea4c><img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&amp;fit=crop&amp;w=1000&amp;q=85" alt="Warm modern restaurant dining room" loading="lazy" data-v-7b92ea4c><span data-v-7b92ea4c>Great ambience <b data-v-7b92ea4c>↗</b></span></div><div class="collage-card collage-card--chef" data-v-7b92ea4c><img src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&amp;fit=crop&amp;w=700&amp;q=85" alt="Chef preparing a dish" loading="lazy" data-v-7b92ea4c><span data-v-7b92ea4c>Happy chefs <b data-v-7b92ea4c>↙</b></span></div><div class="collage-card collage-card--dish" data-v-7b92ea4c><img src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&amp;fit=crop&amp;w=700&amp;q=85" alt="Colorful plated dish" loading="lazy" data-v-7b92ea4c><span data-v-7b92ea4c>Memorable<br data-v-7b92ea4c>experiences ♥</span></div></div></section><section id="menu" class="menu-section" data-v-7b92ea4c><div class="section-shell" data-v-7b92ea4c><div class="section-heading" data-v-7b92ea4c><div data-v-7b92ea4c><p class="eyebrow" data-v-7b92ea4c>From the kitchen</p><h2 data-v-7b92ea4c>Made to be<br data-v-7b92ea4c><em data-v-7b92ea4c>remembered.</em></h2></div><p data-v-7b92ea4c>Browse guest favorites by category, from smoky mains to shareable plates and fresh sides.</p></div><div class="category-row" role="tablist" aria-label="Food categories" data-v-7b92ea4c><!--[-->`);
			ssrRenderList(menuCategories.value, (category) => {
				_push(`<button class="${ssrRenderClass({ active: activeCategory.value === category.id })}" role="tab"${ssrRenderAttr("aria-selected", activeCategory.value === category.id)} data-v-7b92ea4c><span data-v-7b92ea4c>${ssrInterpolate(category.icon)}</span>${ssrInterpolate(category.name)}</button>`);
			});
			_push(`<!--]--></div><div class="food-grid" data-v-7b92ea4c><!--[-->`);
			ssrRenderList(filteredItems.value, (item) => {
				_push(`<article class="food-card" data-v-7b92ea4c><div class="food-image" data-v-7b92ea4c><img${ssrRenderAttr("src", item.image)}${ssrRenderAttr("alt", item.name)} loading="lazy" data-v-7b92ea4c>`);
				if (item.badge) _push(`<span class="food-badge" data-v-7b92ea4c>${ssrInterpolate(item.badge)}</span>`);
				else _push(`<!---->`);
				_push(`</div><div class="food-info" data-v-7b92ea4c><div data-v-7b92ea4c><span class="food-category" data-v-7b92ea4c>${ssrInterpolate(item.food_category?.name || categoriesById(item.foodcategory_id) || "Menu item")}</span><h3 data-v-7b92ea4c>${ssrInterpolate(item.name)}</h3><p data-v-7b92ea4c>${ssrInterpolate(item.description)}</p></div><strong data-v-7b92ea4c>£${ssrInterpolate(item.price)}</strong></div></article>`);
			});
			_push(`<!--]--></div>`);
			if (!filteredItems.value.length) _push(`<p class="empty-state" data-v-7b92ea4c>No published dishes in this category yet.</p>`);
			else _push(`<!---->`);
			_push(`</div></section>`);
			if (__props.feedback.length) {
				_push(`<section id="reviews" class="reviews-section" data-v-7b92ea4c><div class="section-shell" data-v-7b92ea4c><div class="section-heading" data-v-7b92ea4c><div data-v-7b92ea4c><p class="eyebrow" data-v-7b92ea4c>Guest love</p><h2 data-v-7b92ea4c>What our<br data-v-7b92ea4c><em data-v-7b92ea4c>guests say.</em></h2></div><p data-v-7b92ea4c>Real reviews left by real customers after their GrillVibes experience.</p></div><div class="reviews-grid" data-v-7b92ea4c><!--[-->`);
				ssrRenderList(__props.feedback, (f) => {
					_push(`<article class="review-card" data-v-7b92ea4c><span class="review-stars" data-v-7b92ea4c>${ssrInterpolate(stars(f.rating))}</span>`);
					if (f.comment) _push(`<p class="review-comment" data-v-7b92ea4c>“${ssrInterpolate(f.comment)}”</p>`);
					else _push(`<!---->`);
					_push(`<div class="review-meta" data-v-7b92ea4c><span class="review-avatar" data-v-7b92ea4c>${ssrInterpolate((f.customer?.name || "G").charAt(0).toUpperCase())}</span><div data-v-7b92ea4c><strong data-v-7b92ea4c>${ssrInterpolate(f.customer?.name || "Guest")}</strong><small data-v-7b92ea4c>${ssrInterpolate(formatBlogDate(f.created_at))}</small></div></div></article>`);
				});
				_push(`<!--]--></div></div></section>`);
			} else _push(`<!---->`);
			if (__props.blogPosts.length) {
				_push(`<section id="blog" class="blog-section" data-v-7b92ea4c><div class="section-shell" data-v-7b92ea4c><div class="section-heading blog-heading" data-v-7b92ea4c><div data-v-7b92ea4c><p class="eyebrow" data-v-7b92ea4c>From the GrillVibes journal</p><h2 data-v-7b92ea4c>Stories from<br data-v-7b92ea4c><em data-v-7b92ea4c>our table.</em></h2></div><p data-v-7b92ea4c>Fresh updates, kitchen notes, specials, and stories from the GrillVibes team.</p></div><div class="blog-grid" data-v-7b92ea4c><!--[-->`);
				ssrRenderList(__props.blogPosts, (post) => {
					_push(`<a class="blog-card"${ssrRenderAttr("href", `/blog/${post.slug}`)} data-v-7b92ea4c><div class="blog-image" data-v-7b92ea4c>`);
					if (post.featured_image) _push(`<img${ssrRenderAttr("src", post.featured_image)}${ssrRenderAttr("alt", post.title)} loading="lazy" data-v-7b92ea4c>`);
					else _push(`<span class="blog-image-placeholder" data-v-7b92ea4c>K</span>`);
					_push(`</div><div class="blog-card-body" data-v-7b92ea4c><div class="blog-meta" data-v-7b92ea4c><span data-v-7b92ea4c>${ssrInterpolate(post.categories?.[0]?.name || "Restaurant stories")}</span><time${ssrRenderAttr("datetime", post.published_at)} data-v-7b92ea4c>${ssrInterpolate(formatBlogDate(post.published_at))}</time></div><h3 data-v-7b92ea4c>${ssrInterpolate(post.title)}</h3><p data-v-7b92ea4c>${ssrInterpolate(post.excerpt || post.body?.replace(/<[^>]*>/g, "").slice(0, 150))}</p></div></a>`);
				});
				_push(`<!--]--></div></div></section>`);
			} else _push(`<!---->`);
			_push(`<section id="reserve" class="reserve-wrap" data-v-7b92ea4c><div class="reserve-section section-shell" data-v-7b92ea4c><div class="reserve-copy" data-v-7b92ea4c><p class="eyebrow" data-v-7b92ea4c>Reservations</p><h2 data-v-7b92ea4c>Reserve Your<br data-v-7b92ea4c><em data-v-7b92ea4c>Table</em></h2><p data-v-7b92ea4c>Great food brings people together. Book your table and enjoy an amazing experience.</p><div class="reservation-note" data-v-7b92ea4c><strong data-v-7b92ea4c>Dining made easy.</strong><span data-v-7b92ea4c>Tables stay held for 15 minutes.</span></div><div class="reservation-doodles" aria-hidden="true" data-v-7b92ea4c>❀ <span data-v-7b92ea4c>see you at the table</span> ♥</div></div><form class="reserve-form" data-v-7b92ea4c><div class="form-head" data-v-7b92ea4c><div data-v-7b92ea4c><span data-v-7b92ea4c>New reservation</span><h3 data-v-7b92ea4c>Reservation details</h3></div><span class="pending-chip" data-v-7b92ea4c>Pending confirmation</span></div>`);
			if (reservationSent.value) _push(`<div class="reservation-success" role="status" data-v-7b92ea4c><div class="success-icon" data-v-7b92ea4c>✓</div><div data-v-7b92ea4c><strong data-v-7b92ea4c>Request received.</strong><p data-v-7b92ea4c>We will be in touch shortly to confirm your table.</p></div></div>`);
			else {
				_push(`<!--[--><div class="field-block" data-v-7b92ea4c><label class="form-label" for="reservation-table" data-v-7b92ea4c>Choose your table <span aria-hidden="true" data-v-7b92ea4c>*</span></label><input id="reservation-table" type="hidden"${ssrRenderAttr("value", unref(reservation).dining_table_id || "")} required data-v-7b92ea4c><div class="table-grid" data-v-7b92ea4c><!--[-->`);
				ssrRenderList(tables.value, (table) => {
					_push(`<button type="button" class="${ssrRenderClass([{
						selected: unref(reservation).dining_table_id === table.id,
						unavailable: !isTableSuitable(table)
					}, "table-option"])}"${ssrIncludeBooleanAttr(!isTableSuitable(table)) ? " disabled" : ""} data-v-7b92ea4c><strong data-v-7b92ea4c>${ssrInterpolate(table.table_number)}</strong><span data-v-7b92ea4c>${ssrInterpolate(table.capacity)} seats</span><small data-v-7b92ea4c>${ssrInterpolate(isTableBooked(table.id) ? "Already booked" : table.status === "available" ? "Available" : "Unavailable")}</small></button>`);
				});
				_push(`<!--]--></div>`);
				if (unref(reservation).errors.dining_table_id) _push(`<p class="field-error" role="alert" data-v-7b92ea4c>${ssrInterpolate(unref(reservation).errors.dining_table_id)}</p>`);
				else _push(`<!---->`);
				if (!tables.value.length) _push(`<p class="table-note" data-v-7b92ea4c>No tables are currently configured.</p>`);
				else _push(`<!---->`);
				_push(`</div><div class="form-row" data-v-7b92ea4c><label data-v-7b92ea4c>Date<input${ssrRenderAttr("value", unref(reservation).date)} type="date" required data-v-7b92ea4c></label><label data-v-7b92ea4c>Time<input${ssrRenderAttr("value", unref(reservation).time)} type="time" required data-v-7b92ea4c></label></div><div class="form-row" data-v-7b92ea4c><label data-v-7b92ea4c>Party size<select data-v-7b92ea4c><!--[-->`);
				ssrRenderList(8, (number) => {
					_push(`<option${ssrRenderAttr("value", number)} data-v-7b92ea4c${ssrIncludeBooleanAttr(Array.isArray(unref(reservation).guests) ? ssrLooseContain(unref(reservation).guests, number) : ssrLooseEqual(unref(reservation).guests, number)) ? " selected" : ""}>${ssrInterpolate(number)} ${ssrInterpolate(number === 1 ? "guest" : "guests")}</option>`);
				});
				_push(`<!--]--></select></label><label data-v-7b92ea4c>Duration<select required data-v-7b92ea4c><option disabled value="" data-v-7b92ea4c${ssrIncludeBooleanAttr(Array.isArray(unref(reservation).duration_minutes) ? ssrLooseContain(unref(reservation).duration_minutes, "") : ssrLooseEqual(unref(reservation).duration_minutes, "")) ? " selected" : ""}>Select duration</option><option${ssrRenderAttr("value", 60)} data-v-7b92ea4c${ssrIncludeBooleanAttr(Array.isArray(unref(reservation).duration_minutes) ? ssrLooseContain(unref(reservation).duration_minutes, 60) : ssrLooseEqual(unref(reservation).duration_minutes, 60)) ? " selected" : ""}>60 min</option><option${ssrRenderAttr("value", 90)} data-v-7b92ea4c${ssrIncludeBooleanAttr(Array.isArray(unref(reservation).duration_minutes) ? ssrLooseContain(unref(reservation).duration_minutes, 90) : ssrLooseEqual(unref(reservation).duration_minutes, 90)) ? " selected" : ""}>90 min</option><option${ssrRenderAttr("value", 120)} data-v-7b92ea4c${ssrIncludeBooleanAttr(Array.isArray(unref(reservation).duration_minutes) ? ssrLooseContain(unref(reservation).duration_minutes, 120) : ssrLooseEqual(unref(reservation).duration_minutes, 120)) ? " selected" : ""}>120 min</option><option${ssrRenderAttr("value", 180)} data-v-7b92ea4c${ssrIncludeBooleanAttr(Array.isArray(unref(reservation).duration_minutes) ? ssrLooseContain(unref(reservation).duration_minutes, 180) : ssrLooseEqual(unref(reservation).duration_minutes, 180)) ? " selected" : ""}>180 min</option></select></label></div><div class="form-row" data-v-7b92ea4c><label data-v-7b92ea4c>Full name<input${ssrRenderAttr("value", unref(reservation).guest_name)} type="text" placeholder="Alex Morgan" autocomplete="name" required data-v-7b92ea4c></label><label data-v-7b92ea4c>Email<input${ssrRenderAttr("value", unref(reservation).guest_email)} type="email" placeholder="alex@example.com" required data-v-7b92ea4c></label></div><div class="form-row" data-v-7b92ea4c><label data-v-7b92ea4c>Phone<input${ssrRenderAttr("value", unref(reservation).guest_phone)} type="tel" placeholder="+92 0000 0000000" required data-v-7b92ea4c></label><label data-v-7b92ea4c>Occasion<input${ssrRenderAttr("value", unref(reservation).occasion)} type="text" placeholder="Birthday, anniversary..." required data-v-7b92ea4c></label></div><label class="notes-field" data-v-7b92ea4c>Notes<textarea rows="3" placeholder="Allergies, accessibility, or other requests" required data-v-7b92ea4c>${ssrInterpolate(unref(reservation).notes)}</textarea></label><button class="button button--coral submit-button" type="submit"${ssrIncludeBooleanAttr(unref(reservation).processing) ? " disabled" : ""} data-v-7b92ea4c>${ssrInterpolate(unref(reservation).processing ? "Sending request…" : "Request a table")} <span data-v-7b92ea4c>→</span></button>`);
				if (Object.keys(unref(reservation).errors).length) _push(`<p class="reservation-error" data-v-7b92ea4c>Please check the booking details and try again.</p>`);
				else _push(`<!---->`);
				_push(`<small class="form-footnote" data-v-7b92ea4c>For tonight, please call <a href="tel:+441234567890" data-v-7b92ea4c>01234 567 890</a>.</small><!--]-->`);
			}
			_push(`</form></div></section></main><footer id="footer" class="site-footer" data-v-7b92ea4c><div class="section-shell footer-grid" data-v-7b92ea4c><div data-v-7b92ea4c><a class="brand" href="/" aria-label="GrillVibes home" data-v-7b92ea4c><img class="brand-logo"${ssrRenderAttr("src", unref(grillvibes_logo_default))} alt="GrillVibes — Good Food, Better Vibes" data-v-7b92ea4c></a><p data-v-7b92ea4c>Fresh grill, warm tables, bold flavor.</p></div><nav aria-label="Footer navigation" data-v-7b92ea4c><a href="#menu" data-v-7b92ea4c>Menu</a><a href="#reserve" data-v-7b92ea4c>Reservations</a><a href="/project" data-v-7b92ea4c>Project</a><a href="#story" data-v-7b92ea4c>About</a></nav><div class="footer-cta" data-v-7b92ea4c><span data-v-7b92ea4c>Hungry already?</span><a href="#reserve" data-v-7b92ea4c>Reserve a table ↗</a></div></div></footer></div>`);
		};
	}
});
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/pages/HomePage.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var HomePage_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-7b92ea4c"]]);
//#endregion
export { HomePage_default as default };
