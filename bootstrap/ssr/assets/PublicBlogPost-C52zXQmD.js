import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-BOaGB7Aw.js";
import { mergeProps, useSSRContext } from "vue";
import { ssrInterpolate, ssrRenderAttr, ssrRenderAttrs, ssrRenderList } from "vue/server-renderer";
//#region resources/js/pages/PublicBlogPost.vue
var _sfc_main = /*@__PURE__*/ Object.assign({ layout: null }, {
	__name: "PublicBlogPost",
	__ssrInlineRender: true,
	props: {
		post: {
			type: Object,
			required: true
		},
		recentPosts: {
			type: Array,
			default: () => []
		}
	},
	setup(__props) {
		const formatDate = (value) => value ? new Intl.DateTimeFormat("en-GB", {
			day: "numeric",
			month: "short",
			year: "numeric"
		}).format(new Date(value)) : "";
		const readingMinutes = (value) => Math.max(1, Math.ceil((value || "").replace(/<[^>]*>/g, "").trim().split(/\s+/).filter(Boolean).length / 200));
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "public-blog-post" }, _attrs))} data-v-5552690b><header class="blog-header" data-v-5552690b><a class="brand" href="/" aria-label="GrillVibes home" data-v-5552690b><span class="brand-mark" data-v-5552690b>G</span><span data-v-5552690b>Grill<span class="brand-accent" data-v-5552690b>Vibes</span></span></a><nav aria-label="Primary navigation" data-v-5552690b><a href="/" data-v-5552690b>Home</a><a href="/project" data-v-5552690b>Project</a><a class="active" href="/blog" data-v-5552690b>Blog</a><a href="/login" data-v-5552690b>Sign In</a></nav></header><main class="blog-layout" data-v-5552690b><div class="content-column" data-v-5552690b><a class="back-link" href="/blog" data-v-5552690b>← Back to all articles</a><article class="article" data-v-5552690b><div class="article-hero" data-v-5552690b><div class="article-meta" data-v-5552690b><span class="category-pill" data-v-5552690b>${ssrInterpolate(__props.post.categories?.[0]?.name || "Restaurant operations")}</span><time${ssrRenderAttr("datetime", __props.post.published_at)} data-v-5552690b>${ssrInterpolate(formatDate(__props.post.published_at))}</time><span data-v-5552690b>${ssrInterpolate(readingMinutes(__props.post.body))} min read</span></div><h1 data-v-5552690b>${ssrInterpolate(__props.post.title)}</h1>`);
			if (__props.post.excerpt) _push(`<p class="article-lede" data-v-5552690b>${ssrInterpolate(__props.post.excerpt)}</p>`);
			else _push(`<!---->`);
			_push(`</div><div class="article-toolbar" data-v-5552690b>`);
			if (__props.post.author) _push(`<div class="author-chip" data-v-5552690b><span class="author-avatar" data-v-5552690b>${ssrInterpolate(__props.post.author.name.charAt(0).toUpperCase())}</span><div data-v-5552690b><small data-v-5552690b>Written by</small><strong data-v-5552690b>${ssrInterpolate(__props.post.author.name)}</strong></div></div>`);
			else _push(`<!---->`);
			_push(`<div class="meta-badges" data-v-5552690b><span data-v-5552690b>Fresh insights</span><span data-v-5552690b>GrillVibes</span></div></div>`);
			if (__props.post.featured_image) _push(`<img class="article-image"${ssrRenderAttr("src", __props.post.featured_image)}${ssrRenderAttr("alt", __props.post.title)} data-v-5552690b>`);
			else _push(`<!---->`);
			_push(`<div class="article-body" data-v-5552690b>${__props.post.body ?? ""}</div>`);
			if (__props.post.tags?.length) {
				_push(`<div class="article-tags" aria-label="Article tags" data-v-5552690b><!--[-->`);
				ssrRenderList(__props.post.tags, (tag) => {
					_push(`<span data-v-5552690b>#${ssrInterpolate(tag.name)}</span>`);
				});
				_push(`<!--]--></div>`);
			} else _push(`<!---->`);
			_push(`<div class="article-footer" data-v-5552690b>`);
			if (__props.post.author) _push(`<p class="article-author" data-v-5552690b>${ssrInterpolate(__props.post.author.name)} shares practical ideas for better restaurant operations.</p>`);
			else _push(`<!---->`);
			_push(`</div></article></div>`);
			if (__props.recentPosts.length || __props.post.tags?.length) {
				_push(`<aside class="sidebar-column" data-v-5552690b><div class="sidebar-card" data-v-5552690b><p class="eyebrow" data-v-5552690b>Recent articles</p><div class="recent-posts" data-v-5552690b><!--[-->`);
				ssrRenderList(__props.recentPosts, (recentPost) => {
					_push(`<a${ssrRenderAttr("href", `/blog/${recentPost.slug}`)} data-v-5552690b><span class="recent-date" data-v-5552690b>${ssrInterpolate(formatDate(recentPost.published_at))}</span><strong data-v-5552690b>${ssrInterpolate(recentPost.title)}</strong></a>`);
				});
				_push(`<!--]--></div></div>`);
				if (__props.post.tags?.length) {
					_push(`<div class="sidebar-card" data-v-5552690b><p class="eyebrow" data-v-5552690b>Explore topics</p><div class="topic-list" data-v-5552690b><!--[-->`);
					ssrRenderList(__props.post.tags, (tag) => {
						_push(`<a${ssrRenderAttr("href", `/blog?tag=${tag.slug}`)} data-v-5552690b>${ssrInterpolate(tag.name)}</a>`);
					});
					_push(`<!--]--></div></div>`);
				} else _push(`<!---->`);
				_push(`</aside>`);
			} else _push(`<!---->`);
			_push(`</main><footer data-v-5552690b><a href="/" data-v-5552690b>GrillVibes</a><span data-v-5552690b>Great food. Better operations.</span></footer></div>`);
		};
	}
});
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/pages/PublicBlogPost.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var PublicBlogPost_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-5552690b"]]);
//#endregion
export { PublicBlogPost_default as default };
