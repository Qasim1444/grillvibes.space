import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-BOaGB7Aw.js";
import { t as PublicSiteHeader_default } from "./PublicSiteHeader-wp1BTe9G.js";
import { mergeProps, ref, unref, useSSRContext } from "vue";
import { useForm } from "@inertiajs/vue3";
import { ssrIncludeBooleanAttr, ssrInterpolate, ssrRenderAttr, ssrRenderAttrs, ssrRenderComponent, ssrRenderList } from "vue/server-renderer";
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
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "public-blog-post" }, _attrs))} data-v-656189dc>`);
			_push(ssrRenderComponent(PublicSiteHeader_default, {
				items: blogNavItems,
				"active-item": "Blog",
				"action-label": "Book a Table",
				"action-href": "/#reserve"
			}, null, _parent));
			_push(`<main class="blog-layout" data-v-656189dc><div class="content-column" data-v-656189dc><a class="back-link" href="/blog" data-v-656189dc>← Back to all articles</a><article class="article" data-v-656189dc><div class="article-hero" data-v-656189dc><div class="article-meta" data-v-656189dc><span class="category-pill" data-v-656189dc>${ssrInterpolate(__props.post.categories?.[0]?.name || "Restaurant operations")}</span><time${ssrRenderAttr("datetime", __props.post.published_at)} data-v-656189dc>${ssrInterpolate(formatDate(__props.post.published_at))}</time><span data-v-656189dc>${ssrInterpolate(readingMinutes(__props.post.body))} min read</span></div><h1 data-v-656189dc>${ssrInterpolate(__props.post.title)}</h1>`);
			if (__props.post.excerpt) _push(`<p class="article-lede" data-v-656189dc>${ssrInterpolate(__props.post.excerpt)}</p>`);
			else _push(`<!---->`);
			_push(`</div><div class="article-toolbar" data-v-656189dc>`);
			if (__props.post.author) _push(`<div class="author-chip" data-v-656189dc><span class="author-avatar" data-v-656189dc>${ssrInterpolate(__props.post.author.name.charAt(0).toUpperCase())}</span><div data-v-656189dc><small data-v-656189dc>Written by</small><strong data-v-656189dc>${ssrInterpolate(__props.post.author.name)}</strong></div></div>`);
			else _push(`<!---->`);
			_push(`<div class="meta-badges" data-v-656189dc><span data-v-656189dc>Fresh insights</span><span data-v-656189dc>GrillVibes</span></div></div>`);
			if (__props.post.featured_image) _push(`<img class="article-image"${ssrRenderAttr("src", __props.post.featured_image)}${ssrRenderAttr("alt", __props.post.title)} data-v-656189dc>`);
			else _push(`<!---->`);
			_push(`<div class="article-body" data-v-656189dc>${__props.post.body ?? ""}</div>`);
			if (__props.post.tags?.length) {
				_push(`<div class="article-tags" aria-label="Article tags" data-v-656189dc><!--[-->`);
				ssrRenderList(__props.post.tags, (tag) => {
					_push(`<span data-v-656189dc>#${ssrInterpolate(tag.name)}</span>`);
				});
				_push(`<!--]--></div>`);
			} else _push(`<!---->`);
			_push(`<div class="article-footer" data-v-656189dc>`);
			if (__props.post.author) _push(`<p class="article-author" data-v-656189dc>${ssrInterpolate(__props.post.author.name)} shares practical ideas for better restaurant operations.</p>`);
			else _push(`<!---->`);
			_push(`</div><section class="comments" aria-label="Comments" data-v-656189dc><h2 data-v-656189dc>Comments <span data-v-656189dc>(${ssrInterpolate(__props.post.comments?.length || 0)})</span></h2><form class="comment-form" data-v-656189dc><input${ssrRenderAttr("value", unref(form).author_name)} placeholder="Your name" required maxlength="100" data-v-656189dc><input${ssrRenderAttr("value", unref(form).author_email)} type="email" placeholder="Email (optional)" maxlength="255" data-v-656189dc><textarea placeholder="Share your thoughts…" required maxlength="2000" rows="4" data-v-656189dc>${ssrInterpolate(unref(form).body)}</textarea><button type="submit"${ssrIncludeBooleanAttr(unref(form).processing) ? " disabled" : ""} data-v-656189dc>${ssrInterpolate(unref(form).processing ? "Posting…" : "Post comment")}</button></form>`);
			if (__props.post.comments?.length) {
				_push(`<div class="comment-list" data-v-656189dc><!--[-->`);
				ssrRenderList(__props.post.comments, (comment) => {
					_push(`<article class="comment" data-v-656189dc><div class="comment-heading" data-v-656189dc><strong data-v-656189dc>${ssrInterpolate(comment.author_name)}</strong><time data-v-656189dc>${ssrInterpolate(formatDate(comment.created_at))}</time></div><p data-v-656189dc>${ssrInterpolate(comment.body)}</p><button class="reply-link" type="button" data-v-656189dc>Reply</button>`);
					if (replyTo.value === comment.id) _push(`<form class="reply-form" data-v-656189dc><input${ssrRenderAttr("value", unref(replyForm).author_name)} placeholder="Your name" required maxlength="100" data-v-656189dc><textarea placeholder="Write a reply…" required maxlength="2000" rows="3" data-v-656189dc>${ssrInterpolate(unref(replyForm).body)}</textarea><button type="submit"${ssrIncludeBooleanAttr(unref(replyForm).processing) ? " disabled" : ""} data-v-656189dc>Post reply</button></form>`);
					else _push(`<!---->`);
					_push(`<!--[-->`);
					ssrRenderList(comment.replies || [], (reply) => {
						_push(`<div class="comment comment--reply" data-v-656189dc><div class="comment-heading" data-v-656189dc><strong data-v-656189dc>${ssrInterpolate(reply.author_name)}</strong><time data-v-656189dc>${ssrInterpolate(formatDate(reply.created_at))}</time></div><p data-v-656189dc>${ssrInterpolate(reply.body)}</p></div>`);
					});
					_push(`<!--]--></article>`);
				});
				_push(`<!--]--></div>`);
			} else _push(`<p class="comments-empty" data-v-656189dc>Be the first to share a thought.</p>`);
			_push(`</section></article></div>`);
			if (__props.recentPosts.length || __props.post.tags?.length) {
				_push(`<aside class="sidebar-column" data-v-656189dc><div class="sidebar-card" data-v-656189dc><p class="eyebrow" data-v-656189dc>Recent articles</p><div class="recent-posts" data-v-656189dc><!--[-->`);
				ssrRenderList(__props.recentPosts, (recentPost) => {
					_push(`<a${ssrRenderAttr("href", `/blog/${recentPost.slug}`)} data-v-656189dc><span class="recent-date" data-v-656189dc>${ssrInterpolate(formatDate(recentPost.published_at))}</span><strong data-v-656189dc>${ssrInterpolate(recentPost.title)}</strong></a>`);
				});
				_push(`<!--]--></div></div>`);
				if (__props.post.tags?.length) {
					_push(`<div class="sidebar-card" data-v-656189dc><p class="eyebrow" data-v-656189dc>Explore topics</p><div class="topic-list" data-v-656189dc><!--[-->`);
					ssrRenderList(__props.post.tags, (tag) => {
						_push(`<a${ssrRenderAttr("href", `/blog?tag=${tag.slug}`)} data-v-656189dc>${ssrInterpolate(tag.name)}</a>`);
					});
					_push(`<!--]--></div></div>`);
				} else _push(`<!---->`);
				_push(`</aside>`);
			} else _push(`<!---->`);
			_push(`</main><footer data-v-656189dc><a href="/" data-v-656189dc>GrillVibes</a><span data-v-656189dc>Great food. Better operations.</span></footer></div>`);
		};
	}
});
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/pages/PublicBlogPost.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var PublicBlogPost_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-656189dc"]]);
//#endregion
export { PublicBlogPost_default as default };
