<template>
  <div class="public-blog-post">
    <PublicSiteHeader :items="blogNavItems" active-item="Blog" action-label="Book a Table" action-href="/#reserve" />

    <main class="blog-layout">
      <div class="content-column">
        <a class="back-link" href="/blog">← Back to all articles</a>

        <article class="article">
          <div class="article-hero">
            <div class="article-meta">
              <span class="category-pill">{{ post.categories?.[0]?.name || 'Restaurant operations' }}</span>
              <time :datetime="post.published_at">{{ formatDate(post.published_at) }}</time>
              <span>{{ readingMinutes(post.body) }} min read</span>
            </div>

            <h1>{{ post.title }}</h1>
            <p v-if="post.excerpt" class="article-lede">{{ post.excerpt }}</p>
          </div>

          <div class="article-toolbar">
            <div v-if="post.author" class="author-chip">
              <span class="author-avatar">{{ post.author.name.charAt(0).toUpperCase() }}</span>
              <div>
                <small>Written by</small>
                <strong>{{ post.author.name }}</strong>
              </div>
            </div>

            <div class="meta-badges">
              <span>Fresh insights</span>
              <span>GrillVibes</span>
            </div>
          </div>

          <img v-if="post.featured_image" class="article-image" :src="post.featured_image" :alt="post.title" />
          <div class="article-body" v-html="post.body"></div>

          <div v-if="post.tags?.length" class="article-tags" aria-label="Article tags">
            <span v-for="tag in post.tags" :key="tag.id">#{{ tag.name }}</span>
          </div>

          <div class="article-footer">
            <p v-if="post.author" class="article-author">{{ post.author.name }} shares practical ideas for better restaurant operations.</p>
          </div>

          <section class="comments" aria-label="Comments">
            <h2>Comments <span>({{ post.comments?.length || 0 }})</span></h2>
            <form class="comment-form" @submit.prevent="submitComment()">
              <input v-model="form.author_name" placeholder="Your name" required maxlength="100" />
              <input v-model="form.author_email" type="email" placeholder="Email (optional)" maxlength="255" />
              <textarea v-model="form.body" placeholder="Share your thoughts…" required maxlength="2000" rows="4"></textarea>
              <button type="submit" :disabled="form.processing">{{ form.processing ? 'Posting…' : 'Post comment' }}</button>
            </form>
            <div v-if="post.comments?.length" class="comment-list">
              <article v-for="comment in post.comments" :key="comment.id" class="comment">
                <div class="comment-heading"><strong>{{ comment.author_name }}</strong><time>{{ formatDate(comment.created_at) }}</time></div>
                <p>{{ comment.body }}</p>
                <button class="reply-link" type="button" @click="replyTo = replyTo === comment.id ? null : comment.id">Reply</button>
                <form v-if="replyTo === comment.id" class="reply-form" @submit.prevent="submitComment(comment.id)">
                  <input v-model="replyForm.author_name" placeholder="Your name" required maxlength="100" />
                  <textarea v-model="replyForm.body" placeholder="Write a reply…" required maxlength="2000" rows="3"></textarea>
                  <button type="submit" :disabled="replyForm.processing">Post reply</button>
                </form>
                <div v-for="reply in (comment.replies || [])" :key="reply.id" class="comment comment--reply">
                  <div class="comment-heading"><strong>{{ reply.author_name }}</strong><time>{{ formatDate(reply.created_at) }}</time></div>
                  <p>{{ reply.body }}</p>
                </div>
              </article>
            </div>
            <p v-else class="comments-empty">Be the first to share a thought.</p>
          </section>
        </article>
      </div>

      <aside v-if="recentPosts.length || post.tags?.length" class="sidebar-column">
        <div class="sidebar-card">
          <p class="eyebrow">Recent articles</p>
          <div class="recent-posts">
            <a v-for="recentPost in recentPosts" :key="recentPost.id" :href="`/blog/${recentPost.slug}`">
              <span class="recent-date">{{ formatDate(recentPost.published_at) }}</span>
              <strong>{{ recentPost.title }}</strong>
            </a>
          </div>
        </div>

        <div v-if="post.tags?.length" class="sidebar-card">
          <p class="eyebrow">Explore topics</p>
          <div class="topic-list">
            <a v-for="tag in post.tags" :key="tag.id" :href="`/blog?tag=${tag.slug}`">{{ tag.name }}</a>
          </div>
        </div>
      </aside>
    </main>

    <footer>
      <a href="/">GrillVibes</a>
      <span>Great food. Better operations.</span>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useForm } from '@inertiajs/vue3';
import PublicSiteHeader from '../components/PublicSiteHeader.vue';
defineOptions({ layout: null });

const formatDate = value => value
  ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Karachi' }).format(new Date(value))
  : '';

const readingMinutes = value => Math.max(1, Math.ceil((value || '').replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean).length / 200));

const props = defineProps({
  post: { type: Object, required: true },
  recentPosts: { type: Array, default: () => [] },
});
const blogNavItems = [
  { label: 'Home', href: '/' },
  { label: 'Project', href: '/project' },
  { label: 'Menu', href: '/#menu' },
  { label: 'Reservation', href: '/#reserve' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/#story' },
  { label: 'Contact', href: '/#footer' },
];
const replyTo = ref(null);
const form = useForm({ author_name: '', author_email: '', body: '', parent_id: null });
const replyForm = useForm({ author_name: '', author_email: '', body: '', parent_id: null });
const submitComment = (parentId = null) => {
  const active = parentId ? replyForm : form;
  active.transform(data => ({ ...data, parent_id: parentId })).post(`/blog/${props.post.slug}/comments`, {
    preserveScroll: true,
    onSuccess: () => { active.reset(); replyTo.value = null; },
  });
};
</script>

<style scoped>
.comments { margin-top: 42px; padding-top: 30px; border-top: 1px solid #e7ded2; }
.comments h2 { margin: 0 0 18px; font: 600 1.8rem/1.1 'Fraunces', serif; }
.comments h2 span { color: #899087; font-size: 1rem; }
.comment-form, .reply-form { display: grid; gap: 10px; }
.comment-form { grid-template-columns: 1fr 1fr; margin-bottom: 30px; }
.comment-form textarea, .comment-form button { grid-column: 1 / -1; }
.comment-form input, .comment-form textarea, .reply-form input, .reply-form textarea { width: 100%; border: 1px solid #d7d0c7; background: #fffdf8; padding: 11px 12px; font: inherit; }
.comment-form button, .reply-form button { justify-self: start; border: 0; padding: 11px 16px; background: #ef4858; color: #fff; font-weight: 700; cursor: pointer; }
.comment-list { display: grid; gap: 18px; }
.comment { padding: 17px; background: #fffdf8; border: 1px solid #e7ded2; }
.comment--reply { margin: 14px 0 0 24px; background: #faf5ec; }
.comment-heading { display: flex; justify-content: space-between; gap: 14px; font-size: .8rem; }
.comment-heading time { color: #899087; font-size: .7rem; }
.comment p { margin: 10px 0; color: #59635b; line-height: 1.65; white-space: pre-wrap; }
.reply-link { padding: 0; border: 0; background: transparent; color: #ef4858; font-size: .75rem; font-weight: 700; cursor: pointer; }
.reply-form { max-width: 520px; margin-top: 14px; }
.comments-empty { color: #899087; }
@media (max-width: 600px) { .comment-form { grid-template-columns: 1fr; } .comment-form textarea, .comment-form button { grid-column: auto; } .comment--reply { margin-left: 10px; } }
</style>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap');

:global(*) { box-sizing: border-box; }
.public-blog-post {
  min-height: 100vh;
  font-family: 'DM Sans', sans-serif;
  background: radial-gradient(circle at top left, rgba(239, 72, 88, 0.08), transparent 28%), linear-gradient(180deg, #fffdf9 0%, #faf5ec 100%);
  color: #17201c;
}

.blog-header {
  width: min(1180px, calc(100% - 48px));
  min-height: 78px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 25px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #17201c;
  font-weight: 700;
  letter-spacing: -0.04em;
  text-decoration: none;
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: #ef4858;
  color: #fff;
  font: 700 0.9rem 'Fraunces', serif;
}

.brand-accent { color: #ef4858; }

.blog-header nav {
  display: flex;
  align-items: center;
  gap: 25px;
}

.blog-header nav a {
  color: #68716b;
  font-size: 0.78rem;
  text-decoration: none;
  transition: color 0.2s ease;
}

.blog-header nav a:hover,
.blog-header nav a.active {
  color: #ef4858;
}

.blog-layout {
  width: min(1180px, calc(100% - 48px));
  margin: 0 auto;
  padding: 54px 0 110px;
  display: grid;
  grid-template-columns: minmax(0, 1.8fr) minmax(280px, 0.8fr);
  gap: 42px;
  align-items: start;
}

.content-column { min-width: 0; }

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #ef4858;
  font-size: 0.78rem;
  font-weight: 700;
  text-decoration: none;
}

.article { padding-top: 34px; }

.article-hero { padding-bottom: 12px; }

.article-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  color: #899087;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.category-pill {
  display: inline-flex;
  align-items: center;
  padding: 7px 10px;
  background: rgba(239, 72, 88, 0.1);
  border-radius: 999px;
  color: #ef4858;
}

.article h1 {
  margin: 18px 0 0;
  font: 600 clamp(2.9rem, 5vw, 5.5rem)/0.96 'Fraunces', serif;
  letter-spacing: -0.065em;
  color: #171d1b;
}

.article-lede {
  margin: 18px 0 0;
  max-width: 62ch;
  color: #5c675f;
  font-size: 1.08rem;
  line-height: 1.75;
}

.article-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin: 28px 0 18px;
  padding: 18px 20px;
  background: rgba(255, 255, 255, 0.76);
  border: 1px solid #eee2d3;
  border-radius: 18px;
}

.author-chip {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-avatar {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ef4858, #ff9988);
  color: #fff;
  font-weight: 700;
}

.author-chip small {
  display: block;
  color: #899087;
  font-size: 0.62rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.author-chip strong {
  display: block;
  color: #17201c;
  font-size: 0.9rem;
}

.meta-badges {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.meta-badges span {
  display: inline-flex;
  padding: 7px 10px;
  border-radius: 999px;
  background: #fff5f4;
  color: #ef4858;
  font-size: 0.66rem;
  font-weight: 700;
}

.article-image {
  display: block;
  width: 100%;
  max-height: 550px;
  margin: 18px 0 34px;
  object-fit: cover;
  border-radius: 24px;
  box-shadow: 0 24px 42px rgba(43, 36, 30, 0.09);
}

.article-body {
  color: #2f3d35;
  font-size: 1.04rem;
  line-height: 1.9;
}

.article-body :deep(h2) {
  margin: 38px 0 12px;
  font: 600 2rem/1.15 'Fraunces', serif;
  letter-spacing: -0.04em;
}

.article-body :deep(h3) {
  margin: 30px 0 10px;
  font: 600 1.35rem/1.2 'Fraunces', serif;
  letter-spacing: -0.03em;
}

.article-body :deep(p) { margin: 0 0 22px; }

.article-body :deep(ul),
.article-body :deep(ol) {
  margin: 0 0 22px;
  padding-left: 22px;
}

.article-body :deep(li) { margin-bottom: 10px; }
.article-body :deep(a) { color: #ef4858; }

.article-body :deep(blockquote) {
  margin: 26px 0;
  padding: 18px 20px;
  border-left: 4px solid #ef4858;
  background: rgba(239, 72, 88, 0.05);
  color: #213028;
  border-radius: 0 14px 14px 0;
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
  margin-top: 34px;
}

.article-tags span {
  display: inline-flex;
  align-items: center;
  padding: 7px 12px;
  border-radius: 999px;
  background: #fff4f5;
  color: #ef4858;
  font-size: 0.7rem;
  font-weight: 700;
}

.article-footer {
  margin-top: 26px;
  padding-top: 20px;
  border-top: 1px solid #ebdfd0;
}

.article-author {
  margin: 0;
  color: #5d685f;
  font-size: 0.9rem;
}

.sidebar-column {
  position: sticky;
  top: 22px;
}

.sidebar-card {
  padding: 24px 22px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid #f0e4d6;
  border-radius: 22px;
  box-shadow: 0 18px 36px rgba(23, 32, 28, 0.04);
}

.sidebar-card + .sidebar-card { margin-top: 24px; }

.eyebrow {
  margin: 0 0 16px;
  color: #ef4858;
  font-size: 0.67rem;
  letter-spacing: 0.12em;
  font-weight: 700;
  text-transform: uppercase;
}

.recent-posts { display: grid; gap: 14px; }

.recent-posts a {
  display: block;
  padding: 14px 0;
  border-top: 1px solid #f2e7da;
  color: #17201c;
  text-decoration: none;
}

.recent-posts a:first-child {
  border-top: 0;
  padding-top: 0;
}

.recent-date {
  display: block;
  margin-bottom: 6px;
  color: #7d8a83;
  font-size: 0.62rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.recent-posts strong {
  display: block;
  font: 600 1.02rem/1.45 'Fraunces', serif;
  letter-spacing: -0.02em;
}

.topic-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.topic-list a {
  display: inline-flex;
  align-items: center;
  padding: 8px 11px;
  border-radius: 999px;
  background: #fff4f5;
  color: #ef4858;
  text-decoration: none;
  font-size: 0.7rem;
  font-weight: 700;
}

.public-blog-post footer {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 26px max(24px, calc((100% - 1180px) / 2));
  background: #1a211d;
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.76rem;
}

.public-blog-post footer a {
  color: #fff;
  text-decoration: none;
  font-weight: 700;
}

@media (max-width: 980px) {
  .blog-layout {
    grid-template-columns: 1fr;
    gap: 28px;
  }

  .sidebar-column { position: static; }
}

@media (max-width: 700px) {
  .blog-header {
    width: calc(100% - 32px);
    min-height: 68px;
  }

  .blog-header nav { gap: 14px; }
  .blog-header nav a:nth-child(2) { display: none; }

  .blog-layout {
    width: calc(100% - 32px);
    padding: 38px 0 80px;
  }

  .article-toolbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .meta-badges { justify-content: flex-start; }
  .article h1 { font-size: 3.1rem; }

  .article-image {
    margin: 18px 0 28px;
    border-radius: 18px;
  }

  .public-blog-post footer {
    display: block;
    padding: 24px 16px;
  }

  .public-blog-post footer span {
    display: block;
    margin-top: 8px;
  }
}

.blog-header {
  position: sticky;
  top: 0;
  z-index: 100;
  width: min(1200px, calc(100% - 40px));
  height: 72px;
  min-height: 72px;
  margin: 0 auto;
  padding: 0;
  background: rgba(10, 10, 10, .85);
  backdrop-filter: blur(16px);
}
.brand { color: #fff; }
.brand-logo { display: block; width: 68px; height: 68px; object-fit: contain; border-radius: 8px; }
.brand-accent { color: #f97316; }
.blog-header nav { gap: 22px; }
.blog-header nav a { color: #a3a3a3; font-size: .85rem; font-weight: 500; }
.blog-header nav a:hover,
.blog-header nav a.active { color: #f97316; }

@media (max-width: 700px) {
  .blog-header { width: calc(100% - 32px); height: 68px; min-height: 68px; }
  .brand-logo { width: 60px; height: 60px; }
  .blog-header nav { gap: 14px; }
}

.public-blog-post { background:radial-gradient(circle at top left,rgba(249,115,22,.08),transparent 28%),#0a0a0a; color:#f5f5f5; font-family:Inter,system-ui,sans-serif; }
.article h1,.article-body :deep(h2),.article-body :deep(h3) { color:#f5f5f5; font-family:'Space Grotesk',Inter,sans-serif; }
.article-lede,.article-body,.article-author,.comment p { color:#c4c4c4; }
.article-meta,.comment-heading time,.author-chip small,.comments-empty { color:#8d8d8d; }
.comments,.article-footer { border-color:#292929; }
.article-toolbar,.comment,.sidebar-card { background:#141414; border-color:#292929; box-shadow:none; }
.comment--reply { background:#1a1a1a; }
.author-chip strong,.comment-heading strong,.sidebar-card strong { color:#f5f5f5; }
.meta-badges span,.category-pill,.article-tags span,.topic-list a { background:#2a1a10; color:#fb923c; }
.author-avatar { background:linear-gradient(135deg,#f97316,#ea580c); }
.back-link,.reply-link,.article-body :deep(a),.comments h2 span { color:#f97316; }
.article-body :deep(blockquote) { border-color:#f97316; background:rgba(249,115,22,.08); color:#dedede; }
.article-body :deep(p),.article-body :deep(li) { color:#c4c4c4; }
.article-image { box-shadow:0 24px 42px rgba(0,0,0,.35); }
.comment-form input,.comment-form textarea,.reply-form input,.reply-form textarea { border-color:#383838; background:#101010; color:#f5f5f5; }
.comment-form input::placeholder,.comment-form textarea::placeholder,.reply-form input::placeholder,.reply-form textarea::placeholder { color:#858585; }
.comment-form button,.reply-form button { background:#f97316; }
.public-blog-post footer { background:#111; color:#bdbdbd; }
</style>
