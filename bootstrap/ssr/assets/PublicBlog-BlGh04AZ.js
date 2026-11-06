import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-BOaGB7Aw.js";
import { t as PublicSiteHeader_default } from "./PublicSiteHeader-D4-XNzjP.js";
import { mergeProps, useSSRContext } from "vue";
import { ssrInterpolate, ssrRenderAttr, ssrRenderAttrs, ssrRenderClass, ssrRenderComponent, ssrRenderList } from "vue/server-renderer";
//#region resources/js/pages/PublicBlog.vue
var _sfc_main = /*@__PURE__*/ Object.assign({ layout: null }, {
	__name: "PublicBlog",
	__ssrInlineRender: true,
	props: {
		posts: {
			type: Array,
			default: () => []
		},
		recentPosts: {
			type: Array,
			default: () => []
		},
		tags: {
			type: Array,
			default: () => []
		},
		filters: {
			type: Object,
			default: () => ({
				search: "",
				tag: ""
			})
		}
	},
	setup(__props) {
		const blogNavItems = [
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
				href: "/#menu"
			},
			{
				label: "Reservation",
				href: "/#reserve"
			},
			{
				label: "Blog",
				href: "/blog"
			},
			{
				label: "About",
				href: "/#story"
			},
			{
				label: "Contact",
				href: "/#footer"
			}
		];
		const formatDate = (value) => value ? new Intl.DateTimeFormat("en-GB", {
			day: "numeric",
			month: "short",
			year: "numeric",
			timeZone: "Asia/Karachi"
		}).format(new Date(value)) : "";
		const excerpt = (value) => (value || "").replace(/<[^>]*>/g, "").slice(0, 180);
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "public-blog" }, _attrs))} data-v-234fb864>`);
			_push(ssrRenderComponent(PublicSiteHeader_default, {
				items: blogNavItems,
				"active-item": "Blog",
				"action-label": "Book a Table",
				"action-href": "/#reserve"
			}, null, _parent));
			_push(`<main data-v-234fb864><section class="blog-hero" data-v-234fb864><p class="eyebrow" data-v-234fb864>The GrillVibes journal</p><h1 data-v-234fb864>Ideas for a<br data-v-234fb864><em data-v-234fb864>better service.</em></h1><p data-v-234fb864>Practical stories, restaurant insights, and fresh thinking from the people behind better operations.</p></section><section class="posts-section" aria-label="Published blog posts" data-v-234fb864><div class="blog-tools" data-v-234fb864><form class="search-form" method="get" action="/blog" data-v-234fb864><label class="sr-only" for="blog-search" data-v-234fb864>Search blog posts</label><input id="blog-search" name="search" type="search"${ssrRenderAttr("value", __props.filters.search)} placeholder="Search blog posts..." data-v-234fb864>`);
			if (__props.filters.tag) _push(`<input type="hidden" name="tag"${ssrRenderAttr("value", __props.filters.tag)} data-v-234fb864>`);
			else _push(`<!---->`);
			_push(`<button type="submit" data-v-234fb864>Search</button></form>`);
			if (__props.tags.length) {
				_push(`<div class="tag-filter" aria-label="Filter by tag" data-v-234fb864><a class="${ssrRenderClass({ active: !__props.filters.tag })}" href="/blog" data-v-234fb864>All</a><!--[-->`);
				ssrRenderList(__props.tags, (tag) => {
					_push(`<a class="${ssrRenderClass({ active: __props.filters.tag === tag.slug })}"${ssrRenderAttr("href", `/blog?tag=${tag.slug}`)} data-v-234fb864>${ssrInterpolate(tag.name)}</a>`);
				});
				_push(`<!--]--></div>`);
			} else _push(`<!---->`);
			_push(`</div><div class="posts-layout" data-v-234fb864><div data-v-234fb864>`);
			if (__props.posts.length) {
				_push(`<div class="posts-grid" data-v-234fb864><!--[-->`);
				ssrRenderList(__props.posts, (post) => {
					_push(`<a class="post-card"${ssrRenderAttr("href", `/blog/${post.slug}`)} data-v-234fb864><div class="post-image" data-v-234fb864>`);
					if (post.featured_image) _push(`<img${ssrRenderAttr("src", post.featured_image)}${ssrRenderAttr("alt", post.title)} data-v-234fb864>`);
					else _push(`<span data-v-234fb864>K</span>`);
					_push(`</div><div class="post-body" data-v-234fb864><div class="post-meta" data-v-234fb864><span data-v-234fb864>${ssrInterpolate(post.categories?.[0]?.name || "Restaurant operations")}</span><time${ssrRenderAttr("datetime", post.published_at)} data-v-234fb864>${ssrInterpolate(formatDate(post.published_at))}</time></div>`);
					if (post.tags?.length) {
						_push(`<div class="post-tags" data-v-234fb864><!--[-->`);
						ssrRenderList(post.tags, (tag) => {
							_push(`<span data-v-234fb864>#${ssrInterpolate(tag.name)}</span>`);
						});
						_push(`<!--]--></div>`);
					} else _push(`<!---->`);
					_push(`<h2 data-v-234fb864>${ssrInterpolate(post.title)}</h2><p data-v-234fb864>${ssrInterpolate(post.excerpt || excerpt(post.body))}</p><span class="read-more" data-v-234fb864>Read article <b data-v-234fb864>→</b></span></div></a>`);
				});
				_push(`<!--]--></div>`);
			} else _push(`<p class="empty-state" data-v-234fb864>No published blog posts yet.</p>`);
			_push(`</div>`);
			if (__props.recentPosts.length) {
				_push(`<aside class="recent-posts" data-v-234fb864><p class="eyebrow" data-v-234fb864>Recent articles</p><!--[-->`);
				ssrRenderList(__props.recentPosts, (post) => {
					_push(`<a${ssrRenderAttr("href", `/blog/${post.slug}`)} data-v-234fb864><strong data-v-234fb864>${ssrInterpolate(post.title)}</strong><time${ssrRenderAttr("datetime", post.published_at)} data-v-234fb864>${ssrInterpolate(formatDate(post.published_at))}</time></a>`);
				});
				_push(`<!--]--></aside>`);
			} else _push(`<!---->`);
			_push(`</div></section></main><footer data-v-234fb864><a href="/" data-v-234fb864>GrillVibes</a><span data-v-234fb864>Great food. Better operations.</span></footer></div>`);
		};
	}
});
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/pages/PublicBlog.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var PublicBlog_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-234fb864"]]);
//#endregion
export { PublicBlog_default as default };
