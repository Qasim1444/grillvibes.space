import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-BOaGB7Aw.js";
import { mergeProps, ref, unref, useSSRContext } from "vue";
import { useForm } from "@inertiajs/vue3";
import { ssrIncludeBooleanAttr, ssrInterpolate, ssrRenderAttr, ssrRenderAttrs, ssrRenderList } from "vue/server-renderer";
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
			year: "numeric",
			timeZone: "Asia/Karachi"
		}).format(new Date(value)) : "";
		const readingMinutes = (value) => Math.max(1, Math.ceil((value || "").replace(/<[^>]*>/g, "").trim().split(/\s+/).filter(Boolean).length / 200));
		const replyTo = ref(null);
		const form = useForm({
			author_name: "",
			author_email: "",
			body: "",
			parent_id: null
		});
		const replyForm = useForm({
			author_name: "",
			author_email: "",
			body: "",
			parent_id: null
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "public-blog-post" }, _attrs))} data-v-435fb4c2><header class="blog-header" data-v-435fb4c2><a class="brand" href="/" aria-label="GrillVibes home" data-v-435fb4c2><span class="brand-mark" data-v-435fb4c2>G</span><span data-v-435fb4c2>Grill<span class="brand-accent" data-v-435fb4c2>Vibes</span></span></a><nav aria-label="Primary navigation" data-v-435fb4c2><a href="/" data-v-435fb4c2>Home</a><a href="/project" data-v-435fb4c2>Project</a><a class="active" href="/blog" data-v-435fb4c2>Blog</a><a href="/login" data-v-435fb4c2>Sign In</a></nav></header><main class="blog-layout" data-v-435fb4c2><div class="content-column" data-v-435fb4c2><a class="back-link" href="/blog" data-v-435fb4c2>← Back to all articles</a><article class="article" data-v-435fb4c2><div class="article-hero" data-v-435fb4c2><div class="article-meta" data-v-435fb4c2><span class="category-pill" data-v-435fb4c2>${ssrInterpolate(__props.post.categories?.[0]?.name || "Restaurant operations")}</span><time${ssrRenderAttr("datetime", __props.post.published_at)} data-v-435fb4c2>${ssrInterpolate(formatDate(__props.post.published_at))}</time><span data-v-435fb4c2>${ssrInterpolate(readingMinutes(__props.post.body))} min read</span></div><h1 data-v-435fb4c2>${ssrInterpolate(__props.post.title)}</h1>`);
			if (__props.post.excerpt) _push(`<p class="article-lede" data-v-435fb4c2>${ssrInterpolate(__props.post.excerpt)}</p>`);
			else _push(`<!---->`);
			_push(`</div><div class="article-toolbar" data-v-435fb4c2>`);
			if (__props.post.author) _push(`<div class="author-chip" data-v-435fb4c2><span class="author-avatar" data-v-435fb4c2>${ssrInterpolate(__props.post.author.name.charAt(0).toUpperCase())}</span><div data-v-435fb4c2><small data-v-435fb4c2>Written by</small><strong data-v-435fb4c2>${ssrInterpolate(__props.post.author.name)}</strong></div></div>`);
			else _push(`<!---->`);
			_push(`<div class="meta-badges" data-v-435fb4c2><span data-v-435fb4c2>Fresh insights</span><span data-v-435fb4c2>GrillVibes</span></div></div>`);
			if (__props.post.featured_image) _push(`<img class="article-image"${ssrRenderAttr("src", __props.post.featured_image)}${ssrRenderAttr("alt", __props.post.title)} data-v-435fb4c2>`);
			else _push(`<!---->`);
			_push(`<div class="article-body" data-v-435fb4c2>${__props.post.body ?? ""}</div>`);
			if (__props.post.tags?.length) {
				_push(`<div class="article-tags" aria-label="Article tags" data-v-435fb4c2><!--[-->`);
				ssrRenderList(__props.post.tags, (tag) => {
					_push(`<span data-v-435fb4c2>#${ssrInterpolate(tag.name)}</span>`);
				});
				_push(`<!--]--></div>`);
			} else _push(`<!---->`);
			_push(`<div class="article-footer" data-v-435fb4c2>`);
			if (__props.post.author) _push(`<p class="article-author" data-v-435fb4c2>${ssrInterpolate(__props.post.author.name)} shares practical ideas for better restaurant operations.</p>`);
			else _push(`<!---->`);
			_push(`</div><section class="comments" aria-label="Comments" data-v-435fb4c2><h2 data-v-435fb4c2>Comments <span data-v-435fb4c2>(${ssrInterpolate(__props.post.comments?.length || 0)})</span></h2><form class="comment-form" data-v-435fb4c2><input${ssrRenderAttr("value", unref(form).author_name)} placeholder="Your name" required maxlength="100" data-v-435fb4c2><input${ssrRenderAttr("value", unref(form).author_email)} type="email" placeholder="Email (optional)" maxlength="255" data-v-435fb4c2><textarea placeholder="Share your thoughts…" required maxlength="2000" rows="4" data-v-435fb4c2>${ssrInterpolate(unref(form).body)}</textarea><button type="submit"${ssrIncludeBooleanAttr(unref(form).processing) ? " disabled" : ""} data-v-435fb4c2>${ssrInterpolate(unref(form).processing ? "Posting…" : "Post comment")}</button></form>`);
			if (__props.post.comments?.length) {
				_push(`<div class="comment-list" data-v-435fb4c2><!--[-->`);
				ssrRenderList(__props.post.comments, (comment) => {
					_push(`<article class="comment" data-v-435fb4c2><div class="comment-heading" data-v-435fb4c2><strong data-v-435fb4c2>${ssrInterpolate(comment.author_name)}</strong><time data-v-435fb4c2>${ssrInterpolate(formatDate(comment.created_at))}</time></div><p data-v-435fb4c2>${ssrInterpolate(comment.body)}</p><button class="reply-link" type="button" data-v-435fb4c2>Reply</button>`);
					if (replyTo.value === comment.id) _push(`<form class="reply-form" data-v-435fb4c2><input${ssrRenderAttr("value", unref(replyForm).author_name)} placeholder="Your name" required maxlength="100" data-v-435fb4c2><textarea placeholder="Write a reply…" required maxlength="2000" rows="3" data-v-435fb4c2>${ssrInterpolate(unref(replyForm).body)}</textarea><button type="submit"${ssrIncludeBooleanAttr(unref(replyForm).processing) ? " disabled" : ""} data-v-435fb4c2>Post reply</button></form>`);
					else _push(`<!---->`);
					_push(`<!--[-->`);
					ssrRenderList(comment.replies || [], (reply) => {
						_push(`<div class="comment comment--reply" data-v-435fb4c2><div class="comment-heading" data-v-435fb4c2><strong data-v-435fb4c2>${ssrInterpolate(reply.author_name)}</strong><time data-v-435fb4c2>${ssrInterpolate(formatDate(reply.created_at))}</time></div><p data-v-435fb4c2>${ssrInterpolate(reply.body)}</p></div>`);
					});
					_push(`<!--]--></article>`);
				});
				_push(`<!--]--></div>`);
			} else _push(`<p class="comments-empty" data-v-435fb4c2>Be the first to share a thought.</p>`);
			_push(`</section></article></div>`);
			if (__props.recentPosts.length || __props.post.tags?.length) {
				_push(`<aside class="sidebar-column" data-v-435fb4c2><div class="sidebar-card" data-v-435fb4c2><p class="eyebrow" data-v-435fb4c2>Recent articles</p><div class="recent-posts" data-v-435fb4c2><!--[-->`);
				ssrRenderList(__props.recentPosts, (recentPost) => {
					_push(`<a${ssrRenderAttr("href", `/blog/${recentPost.slug}`)} data-v-435fb4c2><span class="recent-date" data-v-435fb4c2>${ssrInterpolate(formatDate(recentPost.published_at))}</span><strong data-v-435fb4c2>${ssrInterpolate(recentPost.title)}</strong></a>`);
				});
				_push(`<!--]--></div></div>`);
				if (__props.post.tags?.length) {
					_push(`<div class="sidebar-card" data-v-435fb4c2><p class="eyebrow" data-v-435fb4c2>Explore topics</p><div class="topic-list" data-v-435fb4c2><!--[-->`);
					ssrRenderList(__props.post.tags, (tag) => {
						_push(`<a${ssrRenderAttr("href", `/blog?tag=${tag.slug}`)} data-v-435fb4c2>${ssrInterpolate(tag.name)}</a>`);
					});
					_push(`<!--]--></div></div>`);
				} else _push(`<!---->`);
				_push(`</aside>`);
			} else _push(`<!---->`);
			_push(`</main><footer data-v-435fb4c2><a href="/" data-v-435fb4c2>GrillVibes</a><span data-v-435fb4c2>Great food. Better operations.</span></footer></div>`);
		};
	}
});
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/pages/PublicBlogPost.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var PublicBlogPost_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-435fb4c2"]]);
//#endregion
export { PublicBlogPost_default as default };
