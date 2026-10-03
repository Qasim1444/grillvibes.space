<template>
  <div class="public-blog">
    <header class="blog-header">
      <a class="brand" href="/" aria-label="GrillVibes home">
        <span class="brand-mark">G</span>
        <span>Grill<span class="brand-accent">Vibes</span></span>
      </a>
      <nav aria-label="Primary navigation">
        <a href="/">Home</a>
        <a href="/product">Product</a>
        <a class="active" href="/blog">Blog</a>
        <a href="/login">Sign In</a>
      </nav>
    </header>

    <main>
      <section class="blog-hero">
        <p class="eyebrow">The GrillVibes journal</p>
        <h1>Ideas for a<br /><em>better service.</em></h1>
        <p>Practical stories, restaurant insights, and fresh thinking from the people behind better operations.</p>
      </section>

      <section class="posts-section" aria-label="Published blog posts">
        <div class="blog-tools">
          <form class="search-form" method="get" action="/blog">
            <label class="sr-only" for="blog-search">Search blog posts</label>
            <input id="blog-search" name="search" type="search" :value="filters.search" placeholder="Search blog posts..." />
            <input v-if="filters.tag" type="hidden" name="tag" :value="filters.tag" />
            <button type="submit">Search</button>
          </form>
          <div v-if="tags.length" class="tag-filter" aria-label="Filter by tag">
            <a :class="{ active: !filters.tag }" href="/blog">All</a>
            <a v-for="tag in tags" :key="tag.id" :class="{ active: filters.tag === tag.slug }" :href="`/blog?tag=${tag.slug}`">{{ tag.name }}</a>
          </div>
        </div>

        <div class="posts-layout">
          <div>
        <div v-if="posts.length" class="posts-grid">
          <a v-for="post in posts" :key="post.id" class="post-card" :href="`/blog/${post.slug}`">
            <div class="post-image">
              <img v-if="post.featured_image" :src="post.featured_image" :alt="post.title" />
              <span v-else>K</span>
            </div>
            <div class="post-body">
              <div class="post-meta">
                <span>{{ post.categories?.[0]?.name || 'Restaurant operations' }}</span>
                <time :datetime="post.published_at">{{ formatDate(post.published_at) }}</time>
              </div>
              <div v-if="post.tags?.length" class="post-tags">
                <span v-for="tag in post.tags" :key="tag.id">#{{ tag.name }}</span>
              </div>
              <h2>{{ post.title }}</h2>
              <p>{{ post.excerpt || excerpt(post.body) }}</p>
              <span class="read-more">Read article <b>→</b></span>
            </div>
          </a>
        </div>
        <p v-else class="empty-state">No published blog posts yet.</p>
          </div>

          <aside v-if="recentPosts.length" class="recent-posts">
            <p class="eyebrow">Recent articles</p>
            <a v-for="post in recentPosts" :key="post.id" :href="`/blog/${post.slug}`">
              <strong>{{ post.title }}</strong>
              <time :datetime="post.published_at">{{ formatDate(post.published_at) }}</time>
            </a>
          </aside>
        </div>
      </section>
    </main>

    <footer>
      <a href="/">GrillVibes</a>
      <span>Great food. Better operations.</span>
    </footer>
  </div>
</template>

<script setup>
defineOptions({ layout: null });

defineProps({
  posts: { type: Array, default: () => [] },
  recentPosts: { type: Array, default: () => [] },
  tags: { type: Array, default: () => [] },
  filters: { type: Object, default: () => ({ search: '', tag: '' }) },
});

const formatDate = value => value
  ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value))
  : '';
const excerpt = value => (value || '').replace(/<[^>]*>/g, '').slice(0, 180);
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&display=swap');
:global(*){box-sizing:border-box}:global(body){margin:0;background:#faf5ec;color:#17201c}
.public-blog{min-height:100vh;font-family:'DM Sans',sans-serif}.blog-header{width:min(1180px,calc(100% - 48px));min-height:78px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:25px}.brand{display:inline-flex;align-items:center;gap:10px;color:#17201c;font-weight:700;letter-spacing:-.04em;text-decoration:none}.brand-mark{display:grid;place-items:center;width:34px;height:34px;border-radius:9px;background:#ef4858;color:#fff;font:700 .9rem 'Fraunces',serif}.brand-accent{color:#ef4858}.blog-header nav{display:flex;align-items:center;gap:25px}.blog-header nav a{color:#68716b;font-size:.78rem;text-decoration:none}.blog-header nav a:hover,.blog-header nav a.active{color:#ef4858}.blog-hero{width:min(1180px,calc(100% - 48px));margin:0 auto;padding:105px 0 90px;border-bottom:1px solid #dfd8cc}.eyebrow{margin:0 0 18px;color:#ef4858;font:600 .67rem 'DM Sans',sans-serif;letter-spacing:.12em;text-transform:uppercase}.blog-hero h1{margin:0;font:600 clamp(3.3rem,6vw,6rem)/.9 'Fraunces',serif;letter-spacing:-.06em}.blog-hero h1 em{color:#ef4858;font-style:italic}.blog-hero>p:last-child{max-width:430px;margin:28px 0 0;color:#6f766f;line-height:1.75}.posts-section{width:min(1180px,calc(100% - 48px));margin:0 auto;padding:75px 0 120px}.posts-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}.post-card{background:#fffdf8;border:1px solid #e7ded2;box-shadow:0 16px 35px rgba(70,50,30,.07)}.post-image{height:230px;display:grid;place-items:center;overflow:hidden;background:#d9e7d7}.post-image img{width:100%;height:100%;object-fit:cover}.post-image span{color:#fff;font:700 4rem 'Fraunces',serif}.post-body{padding:20px}.post-meta{display:flex;justify-content:space-between;gap:12px;color:#ef4858;font-size:.6rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase}.post-meta time{color:#899087;white-space:nowrap}.post-body h2{margin:13px 0 9px;font:600 1.4rem/1.1 'Fraunces',serif}.post-body p{margin:0;color:#6f766f;font-size:.77rem;line-height:1.65}.empty-state{color:#6f766f}.public-blog footer{display:flex;justify-content:space-between;gap:20px;padding:30px max(24px,calc((100% - 1180px) / 2));background:#1c2822;color:#cbd4cd;font-size:.72rem}.public-blog footer a{color:#fff;font-weight:700;text-decoration:none}
@media(max-width:700px){.blog-header{width:calc(100% - 32px);min-height:68px}.blog-header nav{gap:14px}.blog-header nav a:nth-child(2){display:none}.blog-hero,.posts-section{width:calc(100% - 32px)}.blog-hero{padding:70px 0 65px}.posts-section{padding:55px 0 80px}.posts-grid{grid-template-columns:1fr}.public-blog footer{display:block;padding:26px 16px}.public-blog footer span{display:block;margin-top:8px}}
 .blog-tools{display:grid;gap:18px;margin-bottom:38px}.search-form{display:flex;max-width:520px}.search-form input{flex:1;min-width:0;border:1px solid #d7d0c7;border-right:0;padding:12px 14px;background:#fffdf8;color:#17201c;font:400 .82rem 'DM Sans',sans-serif}.search-form button{border:0;background:#ef4858;color:#fff;padding:0 20px;font:700 .75rem 'DM Sans',sans-serif;cursor:pointer}.tag-filter{display:flex;flex-wrap:wrap;gap:8px}.tag-filter a,.post-tags span{display:inline-block;color:#ef4858;background:#ffe8e5;padding:6px 9px;font-size:.62rem;font-weight:700;text-decoration:none}.tag-filter a.active{background:#ef4858;color:#fff}.posts-layout{display:grid;grid-template-columns:minmax(0,1fr) 230px;gap:34px}.posts-grid{grid-template-columns:repeat(2,1fr)}.post-card{display:block;color:inherit;text-decoration:none}.post-tags{display:flex;flex-wrap:wrap;gap:5px;margin-top:12px}.read-more{display:block;margin-top:15px;color:#ef4858;font-size:.72rem;font-weight:700}.read-more b{margin-left:5px}.recent-posts{align-self:start;padding:20px;background:#fffdf8;border-top:3px solid #ef4858}.recent-posts a{display:block;padding:13px 0;border-bottom:1px solid #e7ded2;color:#17201c;text-decoration:none}.recent-posts a:last-child{border-bottom:0}.recent-posts strong{display:block;font:600 1rem/1.2 'Fraunces',serif}.recent-posts time{display:block;margin-top:6px;color:#899087;font-size:.62rem}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}@media(max-width:700px){.posts-layout{grid-template-columns:1fr}.posts-grid{grid-template-columns:1fr}.recent-posts{order:-1}}
</style>
