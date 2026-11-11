<template>
  <div class="restaurant-home" :data-theme="theme">
    <PublicSiteHeader :items="homeNavItems" active-item="Home" action-label="Book a Table" action-href="#reserve" :theme="theme" @toggle-theme="toggleTheme" />

    <main>
      <section class="hero section-shell">
        <div class="hero-copy">
          <div class="scribble">Good Food<br />Better Business <span>♡</span></div>
          <p class="eyebrow"><span class="eyebrow-dot"></span> Flame-grilled food, served fresh</p>
          <h1>Bold Flavors<br /><em>Fresh From the Grill</em></h1>
          <p class="hero-text">
            Welcome to GrillVibes, a warm neighborhood restaurant for smoky burgers, sizzling platters, fresh sides, and easy table reservations.
          </p>

          <div class="hero-actions">
            <a class="button button--coral" href="#reserve">Book a Table</a>
            <a class="button button--outline" href="#menu"><span class="play">▶</span> View Menu</a>
          </div>

          <div class="hero-stats" aria-label="GrillVibes highlights">
            <div><strong>35+</strong><span>Signature Dishes</span></div>
            <div><strong>4.8</strong><span>Guest Rating</span></div>
            <div><strong>7 Days</strong><span>Open Weekly</span></div>
            <div><strong>Fresh</strong><span>Daily Prep</span></div>
          </div>
        </div>

        <div class="hero-visual">
          <div class="leaf leaf--1">✦</div>
          <div class="leaf leaf--2">✦</div>
          <div class="hero-photo-wrap">
            <img src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=88" alt="Fresh plated restaurant food" />
          </div>
          <div class="fresh-badge">
            <small>FRESH FOOD</small>
            <strong>Everyday</strong>
            <span>✦</span>
          </div>
          <div class="hero-note">Great Food<br /><strong>Happier People</strong> <span>↗</span></div>
        </div>
      </section>

      <section class="feature-ribbon section-shell" aria-label="Restaurant highlights">
        <div v-for="(feature, index) in ribbonFeatures" :key="feature.label" class="ribbon-item">
          <div class="ribbon-icon" :class="feature.tone"><span>{{ feature.icon }}</span></div>
          <span>{{ feature.label }}</span>
          <i v-if="index < ribbonFeatures.length - 1"></i>
        </div>
      </section>

      <section id="story" class="experience section-shell">
        <div class="experience-copy">
          <p class="eyebrow">Our story</p>
          <h2>Good food.<br /><em>Good company.</em></h2>
          <p class="section-lede">
            GrillVibes is built around fire, freshness, and comfort. We serve generous plates, casual dining energy, and food that feels worth gathering for.
          </p>

          <div class="check-list">
            <div><span>✓</span>Fresh ingredients prepared every day</div>
            <div><span>✓</span>Flame-grilled mains, burgers, and platters</div>
            <div><span>✓</span>Comfortable seating for family and friends</div>
            <div><span>✓</span>Easy online reservations</div>
          </div>

          <div class="inline-actions">
            <a class="button button--coral button--small" href="#reserve">Reserve Now <span>↗</span></a>
            <a class="text-link" href="#menu">Explore Menu <span>→</span></a>
          </div>
        </div>

        <div class="experience-collage">
          <div class="collage-card collage-card--wide">
            <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=85" alt="Warm modern restaurant dining room" loading="lazy" />
            <span>Great ambience <b>↗</b></span>
          </div>
          <div class="collage-card collage-card--chef">
            <img src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=700&q=85" alt="Chef preparing a dish" loading="lazy" />
            <span>Happy chefs <b>↙</b></span>
          </div>
          <div class="collage-card collage-card--dish">
            <img src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=700&q=85" alt="Colorful plated dish" loading="lazy" />
            <span>Memorable<br />experiences ♥</span>
          </div>
        </div>
      </section>

      <section id="menu" class="menu-section">
        <div class="section-shell">
          <div class="section-heading">
            <div>
              <p class="eyebrow">From the kitchen</p>
              <h2>Made to be<br /><em>remembered.</em></h2>
            </div>
            <p>Browse guest favorites by category, from smoky mains to shareable plates and fresh sides.</p>
          </div>

          <div class="category-row" role="tablist" aria-label="Food categories">
            <button v-for="category in menuCategories" :key="category.id" :class="{ active: activeCategory === category.id }" role="tab" :aria-selected="activeCategory === category.id" @click="activeCategory = category.id">
              <span>{{ category.icon }}</span>{{ category.name }}
            </button>
          </div>

          <div class="food-grid">
            <article v-for="item in filteredItems" :key="item.id || item.name" class="food-card">
              <div class="food-image">
                <img :src="item.image" :alt="item.name" loading="lazy" />
                <span v-if="item.badge" class="food-badge">{{ item.badge }}</span>
              </div>
              <div class="food-info">
                <div>
                  <span class="food-category">{{ item.food_category?.name || categoriesById(item.foodcategory_id) || 'Menu item' }}</span>
                  <h3>{{ item.name }}</h3>
                  <p>{{ item.description }}</p>
                </div>
                <strong>£{{ item.price }}</strong>
              </div>
            </article>
          </div>

          <p v-if="!filteredItems.length" class="empty-state">No published dishes in this category yet.</p>
        </div>
      </section>

      <!-- Customer reviews -->
      <section v-if="feedback.length" id="reviews" class="reviews-section">
        <div class="section-shell">
          <div class="section-heading">
            <div>
              <p class="eyebrow">Guest love</p>
              <h2>What our<br /><em>guests say.</em></h2>
            </div>
            <p>Real reviews left by real customers after their GrillVibes experience.</p>
          </div>

          <div class="reviews-grid">
            <article v-for="f in feedback" :key="f.id" class="review-card">
              <span class="review-stars">{{ stars(f.rating) }}</span>
              <p v-if="f.comment" class="review-comment">“{{ f.comment }}”</p>
              <div class="review-meta">
                <span class="review-avatar">{{ (f.customer?.name || 'G').charAt(0).toUpperCase() }}</span>
                <div>
                  <strong>{{ f.customer?.name || 'Guest' }}</strong>
                  <small>{{ formatBlogDate(f.created_at) }}</small>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section v-if="blogPosts.length" id="blog" class="blog-section">
        <div class="section-shell">
          <div class="section-heading blog-heading">
            <div>
              <p class="eyebrow">From the GrillVibes journal</p>
              <h2>Stories from<br /><em>our table.</em></h2>
            </div>
            <p>Fresh updates, kitchen notes, specials, and stories from the GrillVibes team.</p>
          </div>

          <div class="blog-grid">
            <a v-for="post in blogPosts" :key="post.id" class="blog-card" :href="`/blog/${post.slug}`">
              <div class="blog-image">
                <img v-if="post.featured_image" :src="post.featured_image" :alt="post.title" loading="lazy" />
                <span v-else class="blog-image-placeholder">K</span>
              </div>
              <div class="blog-card-body">
                <div class="blog-meta">
                  <span>{{ post.categories?.[0]?.name || 'Restaurant stories' }}</span>
                  <time :datetime="post.published_at">{{ formatBlogDate(post.published_at) }}</time>
                </div>
                <h3>{{ post.title }}</h3>
                <p>{{ post.excerpt || post.body?.replace(/<[^>]*>/g, '').slice(0, 150) }}</p>
              </div>
            </a>
          </div>
        </div>
      </section>

      <section id="reserve" class="reserve-wrap">
        <div class="reserve-section section-shell">
          <div class="reserve-copy">
            <p class="eyebrow">Reservations</p>
            <h2>Reserve Your<br /><em>Table</em></h2>
            <p>Great food brings people together. Book your table and enjoy an amazing experience.</p>

            <div class="reservation-note">
              <strong>Dining made easy.</strong>
              <span>Tables stay held for 15 minutes.</span>
            </div>

            <div class="reservation-doodles" aria-hidden="true">❀ <span>see you at the table</span> ♥</div>
          </div>

          <form class="reserve-form" @submit.prevent="submitReservation">
            <div class="form-head">
              <div>
                <span>New reservation</span>
                <h3>Reservation details</h3>
              </div>
              <span class="pending-chip">Pending confirmation</span>
            </div>

            <div v-if="reservationSent" class="reservation-success" role="status">
              <div class="success-icon">✓</div>
              <div>
                <strong>Request received.</strong>
                <p>We will be in touch shortly to confirm your table.</p>
              </div>
            </div>

            <template v-else>
              <div class="field-block">
                <label class="form-label">Choose your table</label>
                <div class="table-grid">
                  <button v-for="table in tables" :key="table.id" type="button" class="table-option" :class="{ selected: reservation.dining_table_id === table.id, unavailable: !isTableSuitable(table) }" :disabled="!isTableSuitable(table)" @click="reservation.dining_table_id = table.id">
                    <strong>{{ table.table_number }}</strong>
                    <span>{{ table.capacity }} seats</span>
                    <small>{{ table.status === 'available' ? 'Available' : 'Unavailable' }}</small>
                  </button>
                </div>
                <p v-if="!tables.length" class="table-note">No tables are currently configured.</p>
              </div>

              <div class="form-row">
                <label>Date<input v-model="reservation.date" type="date" required /></label>
                <label>Time<input v-model="reservation.time" type="time" required /></label>
              </div>

              <div class="form-row">
                <label>Party size<select v-model="reservation.guests"><option v-for="number in 8" :key="number" :value="number">{{ number }} {{ number === 1 ? 'guest' : 'guests' }}</option></select></label>
                <label>Duration<select v-model="reservation.duration_minutes" required><option disabled value="">Select duration</option><option :value="60">60 min</option><option :value="90">90 min</option><option :value="120">120 min</option><option :value="180">180 min</option></select></label>
              </div>

              <div class="form-row">
                <label>Full name<input v-model="reservation.guest_name" type="text" placeholder="Alex Morgan" autocomplete="name" required /></label>
                <label>Email<input v-model="reservation.guest_email" type="email" placeholder="alex@example.com" required /></label>
              </div>

              <div class="form-row">
                <label>Phone<input v-model="reservation.guest_phone" type="tel" placeholder="+92 0000 0000000" required /></label>
                <label>Occasion<input v-model="reservation.occasion" type="text" placeholder="Birthday, anniversary..." required /></label>
              </div>

              <label class="notes-field">Notes<textarea v-model="reservation.notes" rows="3" placeholder="Allergies, accessibility, or other requests" required></textarea></label>

              <button class="button button--coral submit-button" type="submit" :disabled="reservation.processing || !reservation.dining_table_id">
                {{ reservation.processing ? 'Sending request…' : 'Request a table' }} <span>→</span>
              </button>

              <p v-if="Object.keys(reservation.errors).length" class="reservation-error">Please check the booking details and try again.</p>
              <small class="form-footnote">For tonight, please call <a href="tel:+441234567890">01234 567 890</a>.</small>
            </template>
          </form>
        </div>
      </section>
    </main>

    <footer id="footer" class="site-footer">
      <div class="section-shell footer-grid">
        <div>
          <a class="brand" href="/" aria-label="GrillVibes home"><img class="brand-logo" :src="logoUrl" alt="GrillVibes — Good Food, Better Vibes" /></a>
          <p>Fresh grill, warm tables, bold flavor.</p>
        </div>
        <nav aria-label="Footer navigation">
          <a href="#menu">Menu</a><a href="#reserve">Reservations</a><a href="/project">Project</a><a href="#story">About</a>
        </nav>
        <div class="footer-cta">
          <span>Hungry already?</span>
          <a href="#reserve">Reserve a table ↗</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useForm } from '@inertiajs/vue3';
import PublicSiteHeader from '../components/PublicSiteHeader.vue';
import logoUrl from '../assets/grillvibes-logo.png';

defineOptions({ layout: null });


const props = defineProps({
	categories: { type: Array, default: () => [] },
	foodItems: { type: Array, default: () => [] },
	tables: { type: Array, default: () => [] },
  blogPosts: { type: Array, default: () => [] },
  feedback: { type: Array, default: () => [] },
});

const theme = ref('dark');
onMounted(() => {
  const savedTheme = window.localStorage.getItem('grillvibes-home-theme');
  if (savedTheme === 'light' || savedTheme === 'dark') theme.value = savedTheme;
});
const toggleTheme = () => {
  theme.value = theme.value === 'dark' ? 'light' : 'dark';
  window.localStorage.setItem('grillvibes-home-theme', theme.value);
};

const stars = r => '★'.repeat(Math.max(0, Math.min(5, Number(r) || 0))) + '☆'.repeat(5 - Math.max(0, Math.min(5, Number(r) || 0)));

const homeNavItems = [
  { label: 'Home', href: '/' },
  { label: 'Project', href: '/project' },
  { label: 'Menu', href: '#menu' },
  { label: 'Reservation', href: '#reserve' },
  { label: 'Blog', href: '#blog' },
  { label: 'About', href: '#story' },
  { label: 'Contact', href: '#footer' },
];

const ribbonFeatures = [
  { label: 'Flame Grill', icon: '▣', tone: 'pink' },
  { label: 'Fresh Prep', icon: '◫', tone: 'orange' },
  { label: 'Family Tables', icon: '▦', tone: 'green' },
  { label: 'Quick Service', icon: '♙', tone: 'blue' },
  { label: 'Reservations', icon: '⌑', tone: 'violet' },
  { label: 'QR Menu', icon: '⌁', tone: 'rose' },
  { label: 'Guest Reviews', icon: '◒', tone: 'gold' },
];

const categoriesById = id => props.categories.find(category => category.id === id)?.name;
const formatBlogDate = value => value
  ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value))
  : '';

const menuCategories = computed(() => [
	{ id: 'all', name: 'All dishes', icon: '✦' },
	...props.categories.map(category => ({ id: category.id, name: category.name, icon: '✦' })),
]);

const activeCategory = ref('all');
const filteredItems = computed(() => activeCategory.value === 'all'
	? props.foodItems
	: props.foodItems.filter(item => item.foodcategory_id === activeCategory.value));
const tables = computed(() => props.tables);
const reservation = useForm({
	date: '',
	time: '19:00',
	guests: 2,
	duration_minutes: '',
	dining_table_id: null,
	guest_name: '',
	guest_phone: '',
	guest_email: '',
	occasion: '',
	notes: '',
});
const isTableSuitable = table => table.status === 'available' && table.capacity >= Number(reservation.guests);
watch(() => reservation.guests, () => {
	const selectedTable = tables.value.find(table => table.id === reservation.dining_table_id);
	if (selectedTable && !isTableSuitable(selectedTable)) reservation.dining_table_id = null;
});
const reservationSent = ref(false);
const submitReservation = () => {
    reservation.transform(data => ({
		guest_name: data.guest_name,
        guest_phone: data.guest_phone,
		guest_email: data.guest_email,
		dining_table_id: data.dining_table_id,
		party_size: data.guests,
		reserved_at: `${data.date} ${data.time}`,
		duration_minutes: data.duration_minutes,
        occasion: data.occasion,
        notes: data.notes,
	})).post('/reservations/request', {
		preserveScroll: true,
		onSuccess: () => {
			reservationSent.value = true;
		},
	});
};
</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap');

:global(*){box-sizing:border-box}
:global(html){scroll-behavior:smooth}
.restaurant-home{--ink:#17201c;--muted:#6f766f;--line:#dfd8cc;--cream:#faf5ec;--paper:#fffdf8;--coral:#ef4858;--coral-dark:#d93648;--peach:#fde5df;font-family:'DM Sans',sans-serif;overflow-x:clip;background:#faf5ec;color:#1b211e}
.section-shell{width:min(1180px,calc(100% - 48px));margin:0 auto}
.site-header{position:sticky;top:0;z-index:50;width:min(1180px,calc(100% - 48px));min-height:78px;margin:0 auto;display:flex;align-items:center;gap:26px;background:rgba(250,245,236,.88);backdrop-filter:blur(16px)}
.brand{display:inline-flex;align-items:center;gap:10px;color:var(--ink);font:700 1.12rem 'DM Sans',sans-serif;letter-spacing:-.04em;text-decoration:none;white-space:nowrap}
.brand-logo{display:block;width:68px;height:68px;object-fit:contain;border-radius:8px}
.brand-accent{color:var(--coral)}
.site-nav{display:flex;gap:25px;margin-left:auto}
.site-nav a,.header-login{color:#656d65;font-size:.78rem;text-decoration:none;transition:.2s}
.site-nav a:hover,.header-login:hover{color:var(--coral)}
.header-actions{display:flex;align-items:center;gap:15px}
.header-login{color:var(--ink);font-weight:700}
.button{display:inline-flex;align-items:center;justify-content:center;gap:22px;text-decoration:none;border:1px solid transparent;cursor:pointer;font:700 .78rem 'DM Sans',sans-serif;padding:14px 18px;transition:transform .2s,background .2s,border-color .2s}
.button:hover{transform:translateY(-2px)}
.button--small{padding:11px 15px}
.button--coral{background:var(--coral);color:#fff;border-color:var(--coral)}
.button--coral:hover{background:var(--coral-dark);border-color:var(--coral-dark)}
.button--outline{background:rgba(255,255,255,.56);border-color:#d7d0c5;color:var(--ink)}
.button--outline:hover{border-color:var(--coral);color:var(--coral)}
.play{display:grid;place-items:center;width:21px;height:21px;border-radius:50%;background:var(--coral);color:#fff;font-size:.5rem}
.menu-toggle{display:none;width:42px;height:42px;border:1px solid #ddd4c7;border-radius:50%;background:#fff;cursor:pointer}
.menu-toggle span{display:block;width:16px;height:1.5px;background:var(--ink);margin:4px auto}
.hero{min-height:680px;display:grid;grid-template-columns:.88fr 1.12fr;gap:72px;align-items:center;padding:55px 0 80px}
.hero-copy{position:relative;padding:22px 0 0}
.scribble{position:absolute;right:5%;top:-25px;color:#374139;transform:rotate(-7deg);font:600 1.1rem/1.05 'Fraunces',serif;font-style:italic}
.scribble span{display:block;text-align:right;color:var(--coral);font-size:1.6rem;margin-top:4px}
.eyebrow{margin:0 0 18px;color:var(--coral);font:600 .67rem 'DM Mono',monospace;letter-spacing:.12em;text-transform:uppercase}
.eyebrow-dot{display:inline-block;width:7px;height:7px;border-radius:50%;background:#55a66c;box-shadow:0 0 0 5px #ddf0e2;margin-right:8px}
.hero h1,.experience h2,.section-heading h2,.reserve-copy h2{margin:0;font:600 clamp(3.3rem,5.7vw,5.8rem)/.9 'Fraunces',serif;letter-spacing:-.065em}
.hero h1 em,.experience h2 em,.section-heading h2 em,.reserve-copy h2 em{color:var(--coral);font-style:italic}
.hero-text{max-width:480px;margin:28px 0;color:#68716b;font-size:1rem;line-height:1.78}
.hero-actions{display:flex;flex-wrap:wrap;gap:12px}
.hero-stats{display:grid;grid-template-columns:repeat(4,1fr);max-width:520px;margin-top:48px;border-top:1px solid var(--line);padding-top:22px}
.hero-stats div{padding-right:15px;border-right:1px solid var(--line)}
.hero-stats div:last-child{border-right:0}
.hero-stats strong{display:block;color:var(--ink);font:700 1.25rem 'Fraunces',serif}
.hero-stats span{display:block;margin-top:4px;color:#7f877f;font-size:.61rem}
.hero-visual{position:relative;min-height:560px}
.hero-photo-wrap{position:absolute;right:0;top:10px;width:87%;height:520px;overflow:hidden;border-radius:48% 14px 48% 14px;box-shadow:0 24px 70px rgba(92,63,36,.15);transform:rotate(2deg)}
.hero-photo-wrap::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,240,214,.04),rgba(55,26,13,.05))}
.hero-photo-wrap img{width:100%;height:100%;object-fit:cover}
.fresh-badge{position:absolute;left:4%;top:20%;z-index:3;width:132px;height:132px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:var(--coral);color:#fff;transform:rotate(-8deg);text-align:center;box-shadow:0 14px 30px rgba(180,45,62,.18)}
.fresh-badge small{font:600 .5rem 'DM Mono',monospace;letter-spacing:.12em}
.fresh-badge strong{margin:2px 0 3px;font:600 1.28rem 'Fraunces',serif}
.fresh-badge span{font-size:.8rem}
.hero-note{position:absolute;right:1%;bottom:4%;z-index:4;padding:14px 18px;background:#fffdf8;border:1px solid #e5ded3;font:600 .8rem/1.1 'Fraunces',serif;transform:rotate(-4deg);box-shadow:0 16px 36px rgba(61,46,30,.1)}
.hero-note strong{color:var(--coral);font-style:italic}
.hero-note span{color:var(--coral);font-size:1rem;margin-left:7px}
.leaf{position:absolute;color:#73a96e;font-size:1.2rem;z-index:5}
.leaf--1{right:-8px;top:9%}.leaf--2{left:1%;bottom:17%}
.feature-ribbon{display:grid;grid-template-columns:repeat(7,1fr);align-items:center;background:#fff;border:1px solid #ebe4da;box-shadow:0 18px 35px rgba(70,50,30,.08);border-radius:18px;padding:15px 10px;margin-top:-18px;position:relative;z-index:8}
.ribbon-item{position:relative;min-height:72px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:#505a54;font-size:.63rem;text-align:center}
.ribbon-item i{position:absolute;right:0;top:13px;width:1px;height:44px;background:#ece6de}
.ribbon-icon{width:38px;height:38px;border-radius:11px;display:grid;place-items:center;font-size:1rem}
.ribbon-icon.pink{background:#ffe8ee;color:#e63e5b}.ribbon-icon.orange{background:#fff0de;color:#da8540}.ribbon-icon.green{background:#e3f4e8;color:#43a36a}.ribbon-icon.blue{background:#e5efff;color:#4b82e9}.ribbon-icon.violet{background:#eee8ff;color:#7656d7}.ribbon-icon.rose{background:#ffe5ec;color:#d95a83}.ribbon-icon.gold{background:#fff3d2;color:#b98a25}
.experience{display:grid;grid-template-columns:.92fr 1.08fr;gap:70px;padding:125px 0}
.experience-copy{align-self:center}
.experience h2{font-size:clamp(2.8rem,4.8vw,4.8rem)}
.section-lede{max-width:440px;color:var(--muted);line-height:1.75;margin:26px 0}
.check-list{display:grid;gap:13px;margin:28px 0 30px}
.check-list div{display:flex;align-items:center;gap:10px;color:#53605a;font-size:.8rem}
.check-list span{display:grid;place-items:center;width:22px;height:22px;border-radius:50%;background:#ffdfe5;color:var(--coral);font-weight:800}
.inline-actions{display:flex;align-items:center;gap:20px}
.text-link{color:var(--ink);font-size:.8rem;font-weight:700;text-decoration:none}
.text-link span{color:var(--coral);margin-left:7px}
.experience-collage{position:relative;min-height:500px}
.collage-card{position:absolute;overflow:hidden;border-radius:20px;box-shadow:0 20px 50px rgba(65,47,30,.12);border:7px solid #fff}
.collage-card img{display:block;width:100%;height:100%;object-fit:cover}
.collage-card span{position:absolute;left:14px;bottom:14px;padding:8px 11px;background:rgba(255,252,246,.92);color:#243027;font:600 .72rem 'Fraunces',serif}
.collage-card span b{color:var(--coral);margin-left:4px}
.collage-card--wide{left:0;top:14%;width:62%;height:300px;transform:rotate(-3deg)}
.collage-card--chef{right:0;top:0;width:42%;height:220px;transform:rotate(4deg)}
.collage-card--dish{right:8%;bottom:0;width:48%;height:215px;transform:rotate(-3deg)}
.collage-card--dish span{color:var(--coral)}
.menu-section{background:#fffaf4;padding:110px 0 125px;border-top:1px solid #efe5d8;border-bottom:1px solid #efe5d8}
.section-heading{display:grid;grid-template-columns:1fr 1fr;align-items:end;margin-bottom:54px}
.section-heading h2{font-size:clamp(2.7rem,4.6vw,4.5rem)}
.section-heading>p{max-width:300px;color:var(--muted);font-size:.9rem;line-height:1.7;margin:0 0 4px}
.category-row{display:flex;gap:26px;overflow-x:auto;border-bottom:1px solid #e2d8ca;margin-bottom:28px}
.category-row button{background:none;border:0;border-bottom:2px solid transparent;padding:0 0 15px;white-space:nowrap;color:#8a918a;font:600 .76rem 'DM Sans',sans-serif;cursor:pointer}
.category-row button.active{color:var(--ink);border-color:var(--coral)}
.category-row button span{color:var(--coral);margin-right:7px}
.food-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
.food-card{min-width:0}
.food-image{height:250px;position:relative;overflow:hidden;border-radius:14px;background:#ece7df}
.food-image img{width:100%;height:100%;object-fit:cover;transition:transform .45s ease}
.food-card:hover .food-image img{transform:scale(1.05)}
.food-badge{position:absolute;left:12px;top:12px;background:var(--coral);color:#fff;padding:7px 9px;font:600 .55rem 'DM Mono',monospace;text-transform:uppercase}
.food-info{display:flex;justify-content:space-between;gap:12px;padding-top:15px}
.food-category{color:var(--coral);font-size:.58rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em}
.food-info h3{margin:6px 0 6px;font:600 1.08rem 'Fraunces',serif}
.food-info p{max-width:175px;margin:0;color:#7d847d;font-size:.7rem;line-height:1.5}
.food-info strong{white-space:nowrap;color:var(--coral);font:600 .88rem 'DM Mono',monospace;padding-top:4px}
.empty-state{padding:22px 0;color:var(--muted);border-top:1px solid var(--line)}
/* Customer reviews */
.reviews-section{padding:110px 0 125px;background:#fffdf8;border-bottom:1px solid #e7ddd0}
.reviews-section .section-heading{margin-bottom:42px}
.reviews-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
.review-card{background:#fff;border:1px solid #e7ded2;box-shadow:0 16px 35px rgba(70,50,30,.07);padding:22px;display:flex;flex-direction:column;gap:12px;transition:transform .3s ease,box-shadow .3s ease}
.review-card:hover{transform:translateY(-4px);box-shadow:0 22px 45px rgba(70,50,30,.11)}
.review-stars{color:var(--coral);font-size:.95rem;letter-spacing:2px}
.review-comment{margin:0;font:400 1rem/1.6 'Fraunces',serif;color:#3f453f}
.review-meta{display:flex;align-items:center;gap:10px;margin-top:auto;padding-top:12px;border-top:1px solid #eee8df}
.review-avatar{width:36px;height:36px;border-radius:50%;background:var(--coral);color:#fff;display:grid;place-items:center;font-weight:700;font-size:.9rem}
.review-meta strong{display:block;font-size:.85rem}
.review-meta small{color:#848b84;font-size:.72rem}
.blog-section{padding:110px 0 125px;background:#f4eee5;border-bottom:1px solid #e7ddd0}
.blog-heading{margin-bottom:42px}.blog-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}.blog-card{background:#fffdf8;border:1px solid #e7ded2;box-shadow:0 16px 35px rgba(70,50,30,.07)}.blog-image{height:210px;display:grid;place-items:center;overflow:hidden;background:#d9e7d7}.blog-image img{width:100%;height:100%;object-fit:cover;transition:transform .45s ease}.blog-card:hover .blog-image img{transform:scale(1.05)}.blog-image-placeholder{color:#fff;font:700 4rem 'Fraunces',serif}.blog-card-body{padding:20px}.blog-meta{display:flex;justify-content:space-between;gap:12px;color:var(--coral);font:600 .58rem 'DM Mono',monospace;text-transform:uppercase;letter-spacing:.06em}.blog-meta time{color:#899087;white-space:nowrap}.blog-card h3{margin:13px 0 9px;font:600 1.35rem/1.1 'Fraunces',serif}.blog-card p{margin:0;color:var(--muted);font-size:.76rem;line-height:1.65}
.reserve-wrap{padding:115px 0;background:linear-gradient(180deg,#faf5ec 0%,#fff8f4 100%)}
.reserve-section{display:grid;grid-template-columns:.82fr 1.18fr;gap:70px;align-items:start}
.reserve-copy{padding-top:22px}
.reserve-copy h2{font-size:clamp(3rem,4.8vw,4.9rem)}
.reserve-copy>p:not(.eyebrow){max-width:330px;color:var(--muted);font-size:.9rem;line-height:1.75;margin:24px 0 0}
.reservation-note{margin-top:36px;border-top:1px solid var(--line);padding-top:15px;display:grid;gap:4px}
.reservation-note strong{font:600 1rem 'Fraunces',serif}.reservation-note span{font-size:.72rem;color:#848b84}
.reservation-doodles{margin-top:42px;color:var(--coral);font:600 1.5rem 'Fraunces',serif}.reservation-doodles span{display:inline-block;color:#5b655e;font-size:.8rem;transform:rotate(-5deg);margin:0 8px}
.reserve-form{background:#fff;border:1px solid #e6ded3;box-shadow:0 22px 55px rgba(71,50,32,.1);padding:28px;border-radius:18px}
.form-head{display:flex;justify-content:space-between;align-items:flex-start;gap:15px;border-bottom:1px solid #eee8df;margin:-28px -28px 24px;padding:20px 28px 18px}
.form-head>div>span{font-size:.68rem;color:#8a918a}.form-head h3{margin:4px 0 0;font:700 1.08rem 'DM Sans',sans-serif}
.pending-chip{background:#fff0d8;color:#a76a1d;border-radius:999px;padding:6px 9px;font-size:.62rem;font-weight:700;white-space:nowrap}
.field-block{margin-bottom:22px}.form-label{display:block;font-size:.76rem;font-weight:700;margin-bottom:9px}
.table-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.table-option{padding:12px 9px;text-align:left;border:1px solid #d9d1c7;border-radius:11px;background:#fff;cursor:pointer;display:flex;flex-direction:column;gap:3px}
.table-option strong{font-size:.84rem}.table-option span,.table-option small{font-size:.64rem;color:#7a837b}.table-option small{color:#35a066}.table-option.selected{border-color:var(--coral);box-shadow:0 0 0 2px #ffd6dd}.table-option.unavailable{opacity:.5;cursor:not-allowed;background:#faf9f7}.table-option.unavailable small{color:#c25454}
.table-note{font-size:.7rem;color:var(--muted);margin:10px 0 0}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:15px}
.reserve-form label{display:flex;flex-direction:column;gap:6px;margin-bottom:15px;color:#2b332e;font-size:.73rem;font-weight:700}
.reserve-form input,.reserve-form select,.reserve-form textarea{width:100%;border:1px solid #d7d0c7;border-radius:10px;background:#fff;color:#1d241f;padding:11px 12px;font:400 .83rem 'DM Sans',sans-serif;outline:none}
.reserve-form textarea{resize:vertical}.reserve-form input:focus,.reserve-form select:focus,.reserve-form textarea:focus{border-color:var(--coral);box-shadow:0 0 0 3px rgba(239,72,88,.12)}
.submit-button{width:100%;margin-top:3px}.reservation-success{display:flex;gap:13px;align-items:flex-start;background:#e8f7ec;color:#217247;padding:18px;border-radius:12px}.success-icon{width:30px;height:30px;border-radius:50%;background:#35a066;color:#fff;display:grid;place-items:center}.reservation-success strong{font-size:.9rem}.reservation-success p{margin:5px 0 0;font-size:.73rem}
.reservation-error{color:#b94150;font-size:.7rem;text-align:center;margin:10px 0}.form-footnote{display:block;color:#81877f;font-size:.68rem;line-height:1.5;text-align:center;margin-top:15px}.form-footnote a{color:var(--coral)}
.site-footer{border-top:1px solid var(--line);background:#1c2822;color:#e9ede8;padding:34px 0}
.footer-grid{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:30px}.site-footer .brand{color:#fff}.site-footer .brand-mark{background:var(--coral)}.site-footer p{color:#aeb8b0;margin:9px 0 0;font-size:.72rem}.site-footer nav{display:flex;gap:22px}.site-footer nav a{color:#cbd4cd;text-decoration:none;font-size:.7rem}.footer-cta{justify-self:end;text-align:right}.footer-cta span{display:block;color:#9aa89f;font-size:.67rem;margin-bottom:5px}.footer-cta a{color:#fff;text-decoration:none;font-size:.76rem;font-weight:700}
@media(max-width:980px){
  .site-header{width:min(100% - 32px,1180px)}
  .hero{grid-template-columns:1fr;gap:35px;padding-top:45px}
  .hero-visual{min-height:520px}
  .experience,.reserve-section{grid-template-columns:1fr;gap:45px}
  .experience-collage{min-height:480px}
  .food-grid{grid-template-columns:repeat(2,1fr)}
  .feature-ribbon{grid-template-columns:repeat(4,1fr);row-gap:8px}
  .ribbon-item i{display:none}
  .footer-grid{grid-template-columns:1fr auto}
  .footer-cta{grid-column:1/-1;justify-self:start;text-align:left}
}
@media(max-width:700px){
  .site-header{min-height:68px}
  .site-nav{position:absolute;left:0;right:0;top:68px;display:none;flex-direction:column;gap:0;padding:10px 18px 15px;background:rgba(250,245,236,.98);border-bottom:1px solid var(--line)}
  .site-nav--open{display:flex}
  .site-nav a{padding:10px 2px}
  .header-login{display:none}.menu-toggle{display:block}
  .section-shell{width:min(100% - 32px,1180px)}
  .hero{padding:42px 0 58px}
  .hero h1{font-size:3.45rem}.hero-copy{padding-top:35px}.scribble{right:2%;top:0;font-size:.85rem}
  .hero-visual{min-height:430px}.hero-photo-wrap{height:410px;width:91%;border-radius:42% 13px 42% 13px}.fresh-badge{width:108px;height:108px}.hero-note{bottom:0}
  .hero-stats{grid-template-columns:repeat(2,1fr);gap:14px 0}.hero-stats div:nth-child(2){border-right:0}.hero-stats div:nth-child(3){padding-top:10px}
  .feature-ribbon{grid-template-columns:repeat(2,1fr);padding:12px}.ribbon-item{min-height:68px}
  .experience,.menu-section,.reserve-wrap{padding:80px 0}
  .experience-collage{min-height:420px}.collage-card--wide{width:64%;height:250px}.collage-card--chef{width:42%;height:180px}.collage-card--dish{width:47%;height:185px}
  .section-heading{display:block}.section-heading>p{margin-top:20px}.food-grid{grid-template-columns:1fr}.food-image{height:230px}
  .blog-section{padding:80px 0}.blog-grid{grid-template-columns:1fr}.blog-image{height:230px}
  .reviews-section{padding:80px 0}.reviews-grid{grid-template-columns:1fr}
  .form-row{display:block}.table-grid{grid-template-columns:repeat(2,1fr)}
  .reserve-form{padding:20px}.form-head{margin:-20px -20px 20px;padding:18px 20px}
  .site-footer{padding:28px 0}.footer-grid{display:block}.site-footer nav{margin:24px 0}.footer-cta{text-align:left}
}

@media (max-width: 700px) {
  .hero > *, .reserve-section > * { min-width: 0; }
  .hero h1 { font-size: clamp(2.35rem, 8vw, 3.45rem); overflow-wrap: break-word; }
  .hero-actions, .site-footer nav, .form-head { flex-wrap: wrap; }
  .reserve-form input, .reserve-form select, .reserve-form textarea { min-width: 0; font-size: 16px; }
  .menu-toggle { min-width: 44px; min-height: 44px; }
  .site-nav a { min-height: 44px; }
}
@media (max-width: 380px) {
  .header-actions > .button { padding: 10px; font-size: .65rem; }
  .header-actions { gap: 6px; }
  .brand { font-size: 1.1rem; }
}

/* Modern GrillVibes visual system: charcoal, ember orange, and warm white. */
.restaurant-home{--ink:#171717;--muted:#68645f;--line:#e6e1d9;--cream:#f7f5f1;--paper:#fff;--coral:#f04424;--coral-dark:#d93216;--peach:#fff0e7;background:#fff;color:var(--ink);font-family:'DM Sans',sans-serif}
.site-header{position:sticky;top:0;min-height:76px;padding:0 20px;background:rgba(17,17,17,.97);border-bottom:1px solid rgba(255,255,255,.08);backdrop-filter:blur(18px)}
.brand-logo{width:62px;height:62px;object-fit:contain}
.site-nav{gap:clamp(14px,2vw,30px)}
.site-nav a,.header-login{font-size:.78rem;font-weight:600;color:#e7e4df}
.site-nav a{position:relative;transition:color .18s ease}
.site-nav a::after{position:absolute;right:0;bottom:-8px;left:0;height:2px;background:#f04424;content:'';transform:scaleX(0);transform-origin:left;transition:transform .18s ease}
.site-nav a:hover,.site-nav a:focus-visible,.header-login:hover{color:#fff}
.site-nav a:hover::after,.site-nav a:focus-visible::after{transform:scaleX(1)}
.button{border-radius:8px;letter-spacing:.01em}
.button--coral{background:#f04424;border-color:#f04424;box-shadow:0 8px 18px rgba(240,68,36,.16)}
.button--coral:hover{background:#d93216;border-color:#d93216}
.button--outline{background:#fff;border-color:#d9d4ce;border-radius:8px}
.hero{width:100%;max-width:none;min-height:650px;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:0;padding:0 0 0 max(24px,calc((100vw - 1180px)/2));background:#171717;color:#fff}
.hero-copy{z-index:2;padding:82px 40px 72px 0}
.scribble{display:none}
.eyebrow{color:#f36a35;font-family:'DM Sans',sans-serif;font-size:.7rem;font-weight:700;letter-spacing:.15em}
.eyebrow-dot{background:#f36a35;box-shadow:0 0 0 5px rgba(243,106,53,.16)}
.hero h1{max-width:690px;font-family:'DM Sans',sans-serif;font-size:clamp(3rem,5.5vw,5.8rem);font-weight:800;line-height:.98;letter-spacing:-.065em}
.hero h1 em,.experience h2 em,.section-heading h2 em,.reserve-copy h2 em{color:#f36a35;font-style:normal}
.hero-text{max-width:470px;color:#c5c2bd;font-size:.98rem;line-height:1.8}
.hero-actions{gap:12px}
.hero-stats{max-width:560px;border-color:#393939}
.hero-stats div{border-color:#393939}
.hero-stats strong{color:#fff;font-family:'DM Sans',sans-serif;font-size:1.2rem}
.hero-stats span{color:#aaa6a0;font-size:.65rem}
.hero-visual{min-height:650px;overflow:hidden;background:#28221e}
.hero-photo-wrap{inset:0;width:100%;height:100%;border-radius:0;transform:none;box-shadow:none}
.hero-photo-wrap::after{background:linear-gradient(90deg,rgba(23,23,23,.18),transparent 35%),linear-gradient(0deg,rgba(23,23,23,.2),transparent 45%)}
.fresh-badge{left:auto;right:7%;top:8%;width:116px;height:116px;background:#f04424;transform:none}
.hero-note{right:auto;left:6%;bottom:7%;border:0;border-radius:8px;transform:none;box-shadow:0 12px 30px rgba(0,0,0,.2)}
.leaf{display:none}
.feature-ribbon{width:min(1180px,calc(100% - 48px));margin:26px auto 0;border:1px solid #eee9e2;border-radius:12px;box-shadow:0 12px 28px rgba(24,22,20,.05);padding:12px}
.ribbon-item{font-size:.68rem;font-weight:600;color:#45413d}
.ribbon-icon{border-radius:10px;background:#fff0e7!important;color:#e74625!important}
.experience{padding:110px 0;gap:80px}
.experience h2,.section-heading h2,.reserve-copy h2{font-family:'DM Sans',sans-serif;font-weight:800;letter-spacing:-.055em;line-height:1.02}
.section-lede{color:#6c6964}
.check-list{gap:14px}
.check-list div{font-size:.82rem;color:#484641}
.check-list span{background:#fff0e7;color:#e74625}
.collage-card{border:5px solid #fff;border-radius:14px;box-shadow:0 16px 40px rgba(30,25,20,.12)}
.collage-card--wide,.collage-card--chef,.collage-card--dish{transform:none}
.collage-card span{border-radius:6px;font-family:'DM Sans',sans-serif}
.menu-section{padding:100px 0 110px;background:#f7f5f1;border:0}
.section-heading{gap:30px;margin-bottom:42px}
.section-heading>p{color:#716d67}
.category-row{gap:24px;border-color:#ded9d2}
.category-row button{font-family:'DM Sans',sans-serif;font-weight:700}
.category-row button.active{border-color:#f04424}
.category-row button span,.food-category{color:#e74625}
.food-grid{gap:24px}
.food-card{background:#fff;border:1px solid #ebe7e1;border-radius:12px;overflow:hidden;transition:transform .2s,box-shadow .2s}
.food-card:hover{transform:translateY(-4px);box-shadow:0 16px 35px rgba(30,25,20,.09)}
.food-card:focus-visible,.blog-card:focus-visible,.button:focus-visible,.text-link:focus-visible{outline:3px solid #f36a35;outline-offset:3px}
.food-image{height:220px;border-radius:0}
.food-info{padding:16px}
.food-info h3{font-family:'DM Sans',sans-serif;font-size:1rem;font-weight:700}
.food-info p{max-width:220px;color:#77716b}
.food-info strong{color:#e74625}
.reviews-section{padding:100px 0;background:#fff;border-color:#eee9e2}
.review-card{border-radius:12px;box-shadow:none}
.review-card:hover{box-shadow:0 14px 30px rgba(30,25,20,.08)}
.review-stars,.review-avatar{color:#f04424}
.review-avatar{background:#fff0e7}
.blog-section{padding:100px 0;background:#f7f5f1;border-color:#eee9e2}
.blog-card{border-radius:12px;overflow:hidden;box-shadow:none;transition:transform .2s,box-shadow .2s}
.blog-card:hover{transform:translateY(-4px);box-shadow:0 16px 32px rgba(30,25,20,.09)}
.blog-image{background:#211c19}
.blog-card-body{padding:20px}
.blog-meta{font-family:'DM Sans',sans-serif;color:#e74625}
.blog-card h3{font-family:'DM Sans',sans-serif;font-weight:700}
.reserve-wrap{padding:100px 0;background:#171717;color:#fff}
.reserve-copy h2{color:#fff}
.reserve-copy>p:not(.eyebrow){color:#c5c2bd}
.reservation-note{border-color:#393939}
.reservation-note strong{font-family:'DM Sans',sans-serif;color:#fff}
.reservation-note span{color:#aaa6a0}
.reservation-doodles{display:none}
.reserve-form{border:0;border-radius:12px;box-shadow:0 20px 55px rgba(0,0,0,.2)}
.form-head{border-color:#eee9e2}
.pending-chip{border-radius:6px;background:#fff0e7;color:#c33b1d}
.table-option{border-radius:8px}
.table-option.selected{border-color:#f04424;box-shadow:0 0 0 2px rgba(240,68,36,.17)}
.reserve-form input,.reserve-form select,.reserve-form textarea{border-radius:8px}
.site-footer{background:#101010;border:0}
.footer-grid{padding-top:10px;padding-bottom:10px}
@media(prefers-reduced-motion:reduce){.restaurant-home *, .restaurant-home *::before, .restaurant-home *::after{scroll-behavior:auto!important;transition-duration:.01ms!important;animation-duration:.01ms!important;animation-iteration-count:1!important}}
@media(max-width:980px){.hero{padding-left:24px;grid-template-columns:1fr 1fr}.hero-copy{padding:60px 24px 56px 0}.hero-visual{min-height:560px}}
@media(max-width:700px){.site-header{padding:0 4px}.site-nav{background:rgba(17,17,17,.99);border-color:#393939}.site-nav a{color:#e7e4df}.menu-toggle{background:#242424;border-color:#444}.menu-toggle span{background:#fff}.hero{width:100%;display:flex;flex-direction:column;padding:0}.hero-copy{padding:60px 20px 42px}.hero-visual{width:100%;min-height:390px}.hero-photo-wrap{height:100%;width:100%}.hero-stats{margin-top:32px}.feature-ribbon{width:calc(100% - 32px)}.experience,.menu-section,.reserve-wrap,.reviews-section,.blog-section{padding:72px 0}.food-grid{gap:15px}.food-card{display:grid;grid-template-columns:112px 1fr;align-items:stretch}.food-image{height:100%;min-height:140px}.food-info{padding:13px;display:flex;flex-direction:column;justify-content:space-between}.food-info p{max-width:none}.food-info strong{align-self:flex-start}.reserve-form{padding:18px}.form-head{margin:-18px -18px 18px;padding:18px}.experience-collage{min-height:390px}}
@media(max-width:380px){.hero h1{font-size:2.45rem}}

/* Depth-focused visual treatment for the public landing page. */
.restaurant-home{
  --coral:#ff6238;
  --coral-dark:#e84720;
  background:#fff;
}
.site-header{
  box-shadow:0 12px 32px rgba(0,0,0,.12);
}
.hero{
  position:relative;
  isolation:isolate;
  background:
    radial-gradient(ellipse at 68% 46%,rgba(255,98,56,.16),transparent 38%),
    linear-gradient(120deg,#141414 0%,#1b1b1b 54%,#121212 100%);
}
.hero::before{
  position:absolute;
 inset:0;
 z-index:-1;
 background-image:linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px);
 background-size:46px 46px;
 content:'';
 mask-image:linear-gradient(90deg,transparent 4%,#000 100%);
 pointer-events:none;
}
.hero-copy{position:relative;z-index:2}
.hero h1{max-width:680px;text-wrap:balance}
.hero-visual{
  perspective:1400px;
  perspective-origin:48% 48%;
  isolation:isolate;
  overflow:visible;
}
.hero-visual::before{
  position:absolute;
 inset:12% 2% 5% 10%;
 z-index:-1;
 border:1px solid rgba(255,255,255,.12);
 border-radius:34px;
 background:linear-gradient(145deg,rgba(255,255,255,.12),rgba(255,255,255,.015) 46%,rgba(255,98,56,.09));
 box-shadow:0 40px 100px rgba(0,0,0,.32),inset 0 1px rgba(255,255,255,.16);
 content:'';
 transform:rotate(5deg) translateZ(-70px);
}
.hero-photo-wrap{
 top:5%;
 right:7%;
 width:86%;
 height:88%;
 overflow:hidden;
 border:1px solid rgba(255,255,255,.25);
 border-radius:28px;
 box-shadow:0 42px 90px rgba(0,0,0,.42),0 0 0 10px rgba(255,255,255,.035);
 transform:rotateY(-10deg) rotateX(3deg) rotateZ(-2deg) translateZ(28px);
 transform-style:preserve-3d;
 transition:transform .65s cubic-bezier(.2,.8,.2,1),box-shadow .65s ease;
}
.hero-visual:hover .hero-photo-wrap{
 box-shadow:0 55px 110px rgba(0,0,0,.48),0 0 0 10px rgba(255,255,255,.05);
 transform:rotateY(-5deg) rotateX(1deg) rotateZ(-1deg) translateZ(42px);
}
.hero-photo-wrap::after{
 background:linear-gradient(140deg,rgba(255,190,115,.1),transparent 42%),linear-gradient(0deg,rgba(14,11,9,.38),transparent 54%);
}
.hero-photo-wrap img{transform:scale(1.04);transition:transform .8s ease}
.hero-visual:hover .hero-photo-wrap img{transform:scale(1.09)}
.fresh-badge{
  top:15%;
 right:3%;
 border:1px solid rgba(255,255,255,.45);
 box-shadow:0 22px 40px rgba(0,0,0,.28),inset 0 1px rgba(255,255,255,.35);
 transform:rotate(9deg) translateZ(70px);
}
.hero-note{
  left:1%;
 bottom:8%;
 border:1px solid rgba(255,255,255,.7);
 box-shadow:0 25px 55px rgba(0,0,0,.3);
 transform:rotate(-5deg) translateZ(80px);
}
.hero-stats{
  gap:10px;
 border:0;
}
.hero-stats div{
 min-height:75px;
 padding:13px 12px;
 border:1px solid rgba(255,255,255,.1);
 border-radius:12px;
 background:linear-gradient(145deg,rgba(255,255,255,.09),rgba(255,255,255,.025));
 box-shadow:0 12px 24px rgba(0,0,0,.12),inset 0 1px rgba(255,255,255,.08);
}
.hero-stats div:last-child{border-right:1px solid rgba(255,255,255,.1)}
.feature-ribbon{
 position:relative;
 z-index:4;
 border-color:#f0ede8;
 border-radius:18px;
 box-shadow:0 24px 55px rgba(25,20,16,.12),0 3px 8px rgba(25,20,16,.04);
 transform:translateY(-8px);
}
.ribbon-icon{
 box-shadow:inset 0 1px rgba(255,255,255,.85),0 6px 12px rgba(45,34,25,.07);
}
.experience-collage{perspective:1100px}
.collage-card{
 transform-style:preserve-3d;
 box-shadow:0 28px 55px rgba(30,25,20,.18),0 4px 10px rgba(30,25,20,.08);
 transition:transform .45s ease,box-shadow .45s ease;
}
.collage-card--wide{transform:rotateY(7deg) rotateZ(-3deg) translateZ(12px)}
.collage-card--chef{transform:rotateY(-9deg) rotateZ(3deg) translateZ(46px)}
.collage-card--dish{transform:rotateY(-6deg) rotateZ(-2deg) translateZ(70px)}
.experience-collage:hover .collage-card--wide{transform:rotateY(3deg) rotateZ(-2deg) translateZ(20px)}
.experience-collage:hover .collage-card--chef{transform:rotateY(-4deg) rotateZ(2deg) translateZ(56px)}
.experience-collage:hover .collage-card--dish{transform:rotateY(-2deg) rotateZ(-1deg) translateZ(82px)}
.menu-section{
  background:
    radial-gradient(ellipse at 84% 8%,rgba(255,98,56,.1),transparent 28%),
    #151515;
}
.menu-section .eyebrow{color:#ff805d}
.menu-section .section-heading h2{color:#fff}
.menu-section .section-heading>p{color:#b4b0ab}
.menu-section .category-row{border-color:#393939}
.menu-section .category-row button{color:#aaa6a0}
.menu-section .category-row button.active{color:#fff;border-color:#ff6238}
.menu-section .category-row button span,.menu-section .food-category{color:#ff805d}
.menu-section .food-card{
  border-color:rgba(255,255,255,.09);
  border-radius:16px;
 background:linear-gradient(145deg,#282828,#1c1c1c);
 box-shadow:0 15px 32px rgba(0,0,0,.18),inset 0 1px rgba(255,255,255,.06);
 transform:perspective(900px) rotateX(0deg) translateY(0);
}
.menu-section .food-card:hover{
 box-shadow:0 28px 48px rgba(0,0,0,.3),0 0 0 1px rgba(255,98,56,.16);
 transform:perspective(900px) rotateX(2deg) translateY(-7px);
}
.menu-section .food-image{background:#24211f}
.menu-section .food-info h3{color:#fff}
.menu-section .food-info p{color:#aaa6a0}
.menu-section .food-info strong{color:#ff805d}
.menu-section .empty-state{border-color:#393939;color:#c1bdb7}
.reviews-section{background:#f8f7f4}
.review-card{
 min-height:230px;
 border:1px solid #ece8e2;
 border-radius:16px;
 box-shadow:0 14px 35px rgba(34,28,21,.06),inset 0 1px #fff;
 transition:transform .35s ease,box-shadow .35s ease;
}
.review-card:hover{
 box-shadow:0 25px 48px rgba(34,28,21,.12);
 transform:perspective(900px) rotateX(2deg) translateY(-6px);
}
.blog-card{
 border:1px solid #ece8e2;
 border-radius:16px;
 box-shadow:0 14px 35px rgba(34,28,21,.07);
}
.blog-card:hover{box-shadow:0 26px 48px rgba(34,28,21,.14)}
.reserve-form{
 border:1px solid rgba(255,255,255,.7);
 box-shadow:0 35px 75px rgba(0,0,0,.34),0 4px 12px rgba(0,0,0,.12);
 transform:perspective(1200px) rotateY(-2deg);
}
.button--coral{
 box-shadow:0 12px 26px rgba(240,68,36,.25),inset 0 1px rgba(255,255,255,.2);
}
.button--coral:hover{box-shadow:0 17px 32px rgba(240,68,36,.32)}
@media(max-width:980px){
  .hero-visual{perspective:none}
  .hero-photo-wrap{transform:rotateY(-5deg) rotateZ(-1deg)}
  .hero-visual:hover .hero-photo-wrap{transform:rotateY(-2deg) translateZ(18px)}
}
@media(max-width:700px){
  .hero::before{background-size:34px 34px}
  .hero-visual{overflow:hidden}
  .hero-visual::before{inset:10% 4% 5%;transform:rotate(3deg)}
  .hero-photo-wrap{
    top:3%;
   right:4%;
   width:90%;
   height:90%;
   transform:rotateY(-4deg) rotateZ(-1deg);
  }
  .hero-visual:hover .hero-photo-wrap{transform:rotateY(-2deg) rotateZ(-1deg) translateZ(12px)}
  .fresh-badge{right:4%;transform:rotate(8deg)}
  .hero-note{left:4%;transform:rotate(-4deg)}
  .hero-stats div{padding:10px}
  .feature-ribbon{transform:translateY(0)}
  .collage-card--wide{transform:rotateY(3deg) rotateZ(-2deg)}
  .collage-card--chef{transform:rotateY(-4deg) rotateZ(2deg) translateZ(22px)}
  .collage-card--dish{transform:rotateY(-2deg) rotateZ(-1deg) translateZ(36px)}
  .reserve-form{transform:none}
}
@media(prefers-reduced-motion:reduce){
  .hero-photo-wrap,.hero-photo-wrap img,.collage-card,.review-card,.food-card{transition:none!important}
}

/* Screenshot fixes: full-bleed header and readable hero headline. */
.site-header{
  width:100%;
  max-width:none;
  margin:0;
  background:#171717;
  box-shadow:0 12px 32px rgba(0,0,0,.12);
  padding-right:max(24px,calc((100vw - 1180px)/2));
  padding-left:max(24px,calc((100vw - 1180px)/2));
}
.hero{background:#171717!important}
.hero h1{color:#fff!important}
@media(max-width:700px){
  .site-header{padding-right:16px;padding-left:16px}
}

/* Focused navbar + hero redesign */
.site-header{
  min-height:78px;
  gap:30px;
  background:#171717;
  border-bottom:0;
  box-shadow:none;
}
.brand-logo{width:58px;height:58px;border-radius:8px}
.site-nav{gap:clamp(16px,2.1vw,30px)}
.site-nav a{color:#d7d5d2;font-size:.8rem;font-weight:500}
.site-nav a::after{bottom:-10px;height:2px}
.header-actions{gap:20px}
.header-login{color:#d7d5d2;font-size:.8rem;font-weight:500}
.site-header .button--small{padding:12px 16px;border-radius:7px;font-size:.76rem}
.hero{
  width:100%;
  min-height:610px;
  grid-template-columns:minmax(0,1fr) minmax(0,1fr);
  align-items:stretch;
  gap:0;
  padding:0;
  background:#171717!important;
}
.hero::before{display:none}
.hero-copy{
  width:min(590px,100%);
  align-self:center;
  justify-self:end;
  padding:72px 60px 72px 24px;
}
.hero-copy .eyebrow{margin-bottom:22px;color:#ff7652;font-size:.69rem;letter-spacing:.16em}
.hero h1{
  max-width:560px;
  margin:0;
  color:#fff!important;
  font-size:clamp(3.4rem,5.4vw,5.25rem);
  font-weight:750;
  line-height:.99;
  letter-spacing:-.065em;
  text-wrap:balance;
}
.hero h1 em{display:block;margin-top:7px;color:#ff6843;font-style:normal}
.hero-text{max-width:440px;margin:24px 0 28px;color:#b7b4b0;font-size:.96rem;line-height:1.75}
.hero-actions{gap:12px}
.hero-actions .button{min-height:48px;padding:0 19px;border-radius:7px}
.hero-actions .button--outline{border-color:#55514d;background:transparent;color:#f4f2ef}
.hero-actions .button--outline:hover{border-color:#ff6843;color:#ff8a68}
.play{background:#ff6843}
.hero-stats{max-width:490px;margin-top:42px;padding:0;border:0;gap:0}
.hero-stats div{min-height:58px;padding:4px 15px;border:0;border-left:1px solid #393735;border-radius:0;background:transparent;box-shadow:none}
.hero-stats div:first-child{padding-left:0;border-left:0}
.hero-stats div:last-child{border-right:0}
.hero-stats strong{font-family:'DM Sans',sans-serif;font-size:1.05rem}
.hero-stats span{margin-top:5px;color:#999590;font-size:.63rem}
.hero-visual{
  min-height:610px;
  overflow:hidden;
  perspective:none;
  background:#171717;
}
.hero-visual::before{inset:0;border:0;border-radius:0;background:none;box-shadow:none;transform:none}
.hero-photo-wrap{
  top:0;right:0;width:100%;height:100%;
  border:0;border-radius:0;box-shadow:none;
  transform:none;transition:none;
}
.hero-photo-wrap::after{background:linear-gradient(90deg,#171717 0%,rgba(23,23,23,.24) 20%,transparent 55%),linear-gradient(0deg,rgba(23,23,23,.35),transparent 38%)}
.hero-photo-wrap img{transform:none;transition:transform .65s ease}
.hero-visual:hover .hero-photo-wrap,.hero-visual:hover .hero-photo-wrap img{transform:none;box-shadow:none}
.hero-visual:hover .hero-photo-wrap img{transform:scale(1.035)}
.fresh-badge,.hero-note{display:none}
@media(max-width:980px){
  .site-header{gap:18px}
  .hero{min-height:560px}
  .hero-copy{padding-right:34px}
  .hero-visual{min-height:560px}
}
@media(max-width:700px){
  .site-header{min-height:70px;gap:10px}
  .brand-logo{width:52px;height:52px}
  .site-header .button--small{padding:10px 12px}
  .hero{display:flex;flex-direction:column;min-height:0}
  .hero-copy{width:100%;max-width:620px;align-self:auto;padding:58px 22px 38px;margin:0 auto}
  .hero h1{font-size:clamp(2.8rem,10vw,4.2rem)}
  .hero-text{max-width:500px;margin:20px 0 24px;font-size:.92rem}
  .hero-stats{max-width:520px;margin-top:32px}
  .hero-stats div{padding:4px 10px}
  .hero-visual{width:100%;min-height:340px;height:58vw;max-height:460px}
  .hero-photo-wrap{top:0;right:0;width:100%;height:100%}
  .hero-photo-wrap::after{background:linear-gradient(0deg,rgba(23,23,23,.36),transparent 55%)}
  .site-nav{top:70px}
}
@media(max-width:420px){
  .header-actions{gap:8px}
  .header-actions>.button{font-size:.68rem}
  .hero-stats div{padding:4px 7px}
  .hero-stats span{font-size:.58rem}
}

/* Premium 3D hero treatment */
.hero-visual{
  overflow:visible;
  perspective:1300px;
  perspective-origin:45% 50%;
  isolation:isolate;
}
.hero-visual::before{
  display:block;
  position:absolute;
  z-index:-1;
  inset:11% 5% 7% 12%;
  border:1px solid rgba(255,255,255,.14);
  border-radius:26px;
  background:linear-gradient(145deg,rgba(255,255,255,.13),rgba(255,255,255,.025) 58%,rgba(255,104,67,.13));
  box-shadow:0 35px 75px rgba(0,0,0,.36),inset 0 1px rgba(255,255,255,.2);
  content:'';
  transform:rotateY(-13deg) rotateZ(4deg) translateZ(-55px);
}
.hero-photo-wrap{
  top:5%;right:7%;width:86%;height:88%;
  overflow:hidden;
  border:1px solid rgba(255,255,255,.22);
  border-radius:22px;
  box-shadow:0 36px 72px rgba(0,0,0,.42),0 0 0 8px rgba(255,255,255,.035);
  transform:rotateY(-9deg) rotateX(3deg) rotateZ(-2deg) translateZ(28px);
  transform-style:preserve-3d;
  transition:transform .55s cubic-bezier(.2,.8,.2,1),box-shadow .55s ease;
}
.hero-visual:hover .hero-photo-wrap{
  box-shadow:0 46px 86px rgba(0,0,0,.48),0 0 0 8px rgba(255,255,255,.05);
  transform:rotateY(-5deg) rotateX(1deg) rotateZ(-1deg) translateZ(46px);
}
.hero-photo-wrap img{transform:scale(1.04);transition:transform .7s ease}
.hero-visual:hover .hero-photo-wrap img{transform:scale(1.09)}
.fresh-badge{
  display:flex;
  top:14%;right:2%;left:auto;
  width:112px;height:112px;
  border:1px solid rgba(255,255,255,.42);
  background:linear-gradient(145deg,#ff754d,#e94321);
  box-shadow:0 18px 38px rgba(0,0,0,.32),inset 0 1px rgba(255,255,255,.4);
  transform:rotate(8deg) translateZ(78px);
}
.hero-note{display:none}
.food-card,.review-card,.blog-card{
  transform:perspective(1100px) translateZ(0);
  transition:transform .28s ease,box-shadow .28s ease;
}
.food-card:hover,.review-card:hover,.blog-card:hover{
  transform:perspective(1100px) translateY(-5px) rotateX(1deg) translateZ(10px);
}
@media(max-width:980px){
  .hero-visual{perspective:1000px}
  .hero-photo-wrap{transform:rotateY(-5deg) rotateZ(-1deg)}
}
@media(max-width:700px){
  .hero-visual{overflow:hidden;perspective:900px}
  .hero-visual::before{inset:10% 4% 5%;transform:rotateY(-5deg) rotateZ(2deg) translateZ(-35px)}
  .hero-photo-wrap{top:4%;right:5%;width:90%;height:91%;transform:rotateY(-4deg) rotateZ(-1deg) translateZ(10px)}
  .hero-visual:hover .hero-photo-wrap{transform:rotateY(-2deg) rotateZ(-1deg) translateZ(18px)}
  .fresh-badge{top:8%;right:5%;width:92px;height:92px}
  .fresh-badge strong{font-size:1rem}
}
@media(prefers-reduced-motion:reduce){
  .hero-photo-wrap,.hero-photo-wrap img,.food-card,.review-card,.blog-card{transition:none!important}
}

/* Reference inspired: centered dark glass hero with a framed food visual. */
.restaurant-home{background:#080808;color:#f5f4f2}
.site-header{
  position:relative;
  z-index:20;
  width:min(1180px,calc(100% - 48px));
  min-height:68px;
  margin:18px auto 0;
  padding:0 18px;
  gap:24px;
  border:1px solid rgba(255,255,255,.14);
  border-radius:13px;
  background:rgba(22,22,22,.78);
  box-shadow:0 16px 48px rgba(0,0,0,.34),inset 0 1px rgba(255,255,255,.08);
  backdrop-filter:blur(22px);
}
.brand-logo{width:52px;height:52px}
.site-nav a{color:#cfccca}
.header-login{color:#cfccca}
.hero{
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:0;
  min-height:0;
  padding:82px 24px 0;
  overflow:hidden;
  background:
    radial-gradient(ellipse at 50% 25%,rgba(255,84,48,.11),transparent 38%),
    #080808!important;
  text-align:center;
}
.hero::before{
  display:block;
  position:absolute;
  inset:0 0 auto;
  height:560px;
  z-index:0;
  background:radial-gradient(ellipse at 50% 46%,rgba(255,255,255,.07),transparent 60%);
  content:'';
  mask-image:linear-gradient(#000,transparent);
}
.hero-copy{
  position:relative;
  z-index:2;
  width:min(780px,100%);
  max-width:780px;
  align-self:center;
  justify-self:auto;
  padding:0 0 34px;
}
.hero-copy .eyebrow{margin-bottom:20px;color:#ff805d}
.hero h1{
  max-width:780px;
  margin:0 auto;
  color:#f7f6f5!important;
  font-size:clamp(3.1rem,6.5vw,5.4rem);
  line-height:1.02;
  letter-spacing:-.065em;
}
.hero h1 em{display:inline;color:#ff6843}
.hero-text{max-width:570px;margin:20px auto 25px;color:#aaa7a4;font-size:.94rem;line-height:1.7}
.hero-actions{justify-content:center}
.hero-actions .button{min-height:43px;padding:0 17px;font-size:.74rem}
.hero-actions .button--coral{box-shadow:0 0 30px rgba(255,82,48,.24),inset 0 1px rgba(255,255,255,.2)}
.hero-actions .button--outline{background:rgba(255,255,255,.035);border-color:rgba(255,255,255,.22);color:#efeeec}
.hero-stats{display:none}
.hero-visual{
  position:relative;
  z-index:1;
  width:min(900px,calc(100vw - 100px));
  min-height:0;
  height:clamp(300px,40vw,450px);
  margin:12px auto -1px;
  overflow:visible;
  perspective:1500px;
}
.hero-visual::before{
  inset:5% 6% -5%;
  border:1px solid rgba(255,255,255,.19);
  border-radius:22px;
  background:linear-gradient(145deg,rgba(255,255,255,.11),rgba(255,255,255,.015) 55%,rgba(255,88,49,.12));
  box-shadow:0 40px 100px rgba(0,0,0,.65),0 0 70px rgba(238,70,36,.11),inset 0 1px rgba(255,255,255,.2);
  transform:rotateX(2deg) rotateY(-3deg) translateZ(-28px);
}
.hero-photo-wrap{
  top:0;right:0;width:100%;height:100%;
  border:1px solid rgba(255,255,255,.24);
  border-radius:19px 19px 10px 10px;
  background:#171717;
  box-shadow:0 26px 70px rgba(0,0,0,.52),inset 0 1px rgba(255,255,255,.18);
  transform:rotateX(2deg) rotateY(-3deg) translateZ(22px);
}
.hero-photo-wrap::after{
  background:linear-gradient(180deg,rgba(8,8,8,.03),rgba(8,8,8,.05) 55%,rgba(8,8,8,.35)),linear-gradient(135deg,rgba(255,255,255,.09),transparent 32%);
}
.hero-photo-wrap img{transform:scale(1.02)}
.hero-visual:hover .hero-photo-wrap{transform:rotateX(0) rotateY(-1deg) translateZ(36px)}
.fresh-badge{
  top:10%;right:-2%;
  width:92px;height:92px;
  border:1px solid rgba(255,255,255,.25);
  background:rgba(242,72,38,.88);
  box-shadow:0 18px 45px rgba(0,0,0,.45),0 0 30px rgba(242,72,38,.18),inset 0 1px rgba(255,255,255,.25);
  transform:rotate(7deg) translateZ(80px);
}
.feature-ribbon{
  margin-top:0;
  border-radius:0 0 16px 16px;
  box-shadow:0 18px 50px rgba(0,0,0,.16);
}
@media(max-width:980px){
  .site-header{width:calc(100% - 40px)}
  .hero{padding-top:72px}
  .hero-visual{width:calc(100vw - 70px)}
}
@media(max-width:700px){
  .site-header{width:calc(100% - 24px);min-height:62px;margin-top:12px;padding:0 10px;border-radius:11px}
  .brand-logo{width:48px;height:48px}
  .site-nav{top:62px;left:0;right:0;border:1px solid rgba(255,255,255,.12);border-radius:0 0 12px 12px;box-shadow:0 18px 30px rgba(0,0,0,.3)}
  .hero{padding:62px 18px 0}
  .hero-copy{padding:0 0 27px}
  .hero h1{font-size:clamp(2.55rem,10vw,4rem)}
  .hero-text{font-size:.88rem}
  .hero-visual{width:calc(100vw - 40px);height:58vw;min-height:245px;max-height:360px;margin-top:7px;overflow:visible}
  .hero-photo-wrap{width:100%;height:100%;top:0;right:0;border-radius:14px;transform:rotateX(1deg) rotateY(-2deg) translateZ(12px)}
  .hero-visual::before{inset:6% 4% -4%;border-radius:16px}
  .fresh-badge{width:76px;height:76px;top:7%;right:-2%}
  .fresh-badge small{font-size:.42rem}
  .fresh-badge strong{font-size:.88rem}
  .feature-ribbon{margin-top:0}
}
@media(prefers-reduced-motion:reduce){.hero-visual:hover .hero-photo-wrap{transform:none}}

/* Shared dark and ember design tokens used across public pages. */
.restaurant-home {
  --ink:#f5f5f5;
  --muted:#a3a3a3;
  --line:#292929;
  --cream:#0a0a0a;
  --paper:#141414;
  --coral:#f97316;
  --coral-dark:#ea580c;
  --peach:#2a1a10;
  background:#0a0a0a;
  color:#f5f5f5;
  font-family:Inter,system-ui,sans-serif;
}
.restaurant-home h1,.restaurant-home h2,.restaurant-home h3,.restaurant-home h4 {
  font-family:'Space Grotesk',Inter,sans-serif!important;
  color:#f5f5f5;
}
.restaurant-home .hero-text,
.restaurant-home .scribble,
.restaurant-home .hero-stats span,
.restaurant-home .ribbon-item,
.restaurant-home .check-list div,
.restaurant-home .category-row button,
.restaurant-home .blog-meta time,
.restaurant-home .review-meta small,
.restaurant-home .form-footnote { color:#b8b8b8; }
.restaurant-home .experience,
.restaurant-home .menu-section,
.restaurant-home .reviews-section,
.restaurant-home .blog-section,
.restaurant-home .reserve-wrap { background:#0a0a0a!important; border-color:#262626!important; color:#f5f5f5; }
.restaurant-home .food-card,
.restaurant-home .review-card,
.restaurant-home .blog-card,
.restaurant-home .reserve-form,
.restaurant-home .hero-note,
.restaurant-home .feature-ribbon { background:#141414!important; border-color:#292929!important; color:#f5f5f5; box-shadow:0 16px 40px rgba(0,0,0,.24); }
.restaurant-home .food-info p,
.restaurant-home .review-comment,
.restaurant-home .blog-card p,
.restaurant-home .reservation-note span,
.restaurant-home .reserve-copy>p:not(.eyebrow) { color:#a3a3a3; }
.restaurant-home .category-row { border-color:#292929; }
.restaurant-home .category-row button.active { color:#f5f5f5; }
.restaurant-home .form-head { border-color:#292929; }
.restaurant-home .form-head>div>span,
.restaurant-home .reserve-form label { color:#d4d4d4; }
.restaurant-home .reserve-form input,
.restaurant-home .reserve-form select,
.restaurant-home .reserve-form textarea,
.restaurant-home .table-option { border-color:#383838; background:#101010; color:#f5f5f5; }
.restaurant-home .table-option span,.restaurant-home .table-option small { color:#a3a3a3; }
.restaurant-home .table-option.selected { border-color:#f97316; box-shadow:0 0 0 2px rgba(249,115,22,.2); }
.restaurant-home .site-footer { border-color:#292929; background:#111; }
.restaurant-home .site-footer nav a { color:#c5c5c5; }
.restaurant-home .hero h1 em,
.restaurant-home .hero-copy .eyebrow,
.restaurant-home .menu-section .eyebrow,
.restaurant-home .menu-section .category-row button span,
.restaurant-home .menu-section .food-category,
.restaurant-home .menu-section .food-info strong { color:#f97316; }

/* Light theme overrides the dark public-page palette while keeping the same ember accents. */
.restaurant-home[data-theme="light"] {
  --ink:#20231f; --muted:#696e68; --line:#e5dfd6; --cream:#faf7f1; --paper:#fff; --coral:#e94e2f; --coral-dark:#d94124; --peach:#fff0e7;
  background:#faf7f1; color:#20231f; color-scheme:light;
}
.restaurant-home[data-theme="light"] h1,
.restaurant-home[data-theme="light"] h2,
.restaurant-home[data-theme="light"] h3,
.restaurant-home[data-theme="light"] h4 { color:#20231f; }
.restaurant-home[data-theme="light"] :deep(.public-header) { color:#20231f; background:rgba(255,253,249,.94); border-color:#e8e2d9; box-shadow:0 8px 24px rgba(60,45,30,.06); }
.restaurant-home[data-theme="light"] :deep(.public-header__brand) { color:#20231f; }
.restaurant-home[data-theme="light"] :deep(.public-header__nav a),
.restaurant-home[data-theme="light"] :deep(.public-header__sign-in) { color:#646b64; }
.restaurant-home[data-theme="light"] :deep(.public-header__nav a:hover),
.restaurant-home[data-theme="light"] :deep(.public-header__nav a.is-active),
.restaurant-home[data-theme="light"] :deep(.public-header__sign-in:hover) { color:#e94e2f; }
.restaurant-home[data-theme="light"] :deep(.public-header__theme) { border-color:#ded8ce; background:#fff; color:#292d29; }
.restaurant-home[data-theme="light"] :deep(.public-header__toggle) { border-color:#ded8ce; background:#fff; }
.restaurant-home[data-theme="light"] :deep(.public-header__toggle span) { background:#292d29; }
.restaurant-home[data-theme="light"] .hero-text,
.restaurant-home[data-theme="light"] .scribble,
.restaurant-home[data-theme="light"] .hero-stats span,
.restaurant-home[data-theme="light"] .ribbon-item,
.restaurant-home[data-theme="light"] .check-list div,
.restaurant-home[data-theme="light"] .category-row button,
.restaurant-home[data-theme="light"] .blog-meta time,
.restaurant-home[data-theme="light"] .review-meta small,
.restaurant-home[data-theme="light"] .form-footnote { color:#696e68; }
.restaurant-home[data-theme="light"] .experience,
.restaurant-home[data-theme="light"] .menu-section,
.restaurant-home[data-theme="light"] .reviews-section,
.restaurant-home[data-theme="light"] .blog-section,
.restaurant-home[data-theme="light"] .reserve-wrap { background:#faf7f1!important; border-color:#e5dfd6!important; color:#20231f; }
.restaurant-home[data-theme="light"] .food-card,
.restaurant-home[data-theme="light"] .review-card,
.restaurant-home[data-theme="light"] .blog-card,
.restaurant-home[data-theme="light"] .reserve-form,
.restaurant-home[data-theme="light"] .hero-note,
.restaurant-home[data-theme="light"] .feature-ribbon { background:#fff!important; border-color:#e8e2d9!important; color:#20231f; box-shadow:0 14px 38px rgba(60,45,30,.08); }
.restaurant-home[data-theme="light"] .food-info p,
.restaurant-home[data-theme="light"] .review-comment,
.restaurant-home[data-theme="light"] .blog-card p,
.restaurant-home[data-theme="light"] .reservation-note span,
.restaurant-home[data-theme="light"] .reserve-copy>p:not(.eyebrow) { color:#696e68; }
.restaurant-home[data-theme="light"] .category-row,
.restaurant-home[data-theme="light"] .form-head { border-color:#e5dfd6; }
.restaurant-home[data-theme="light"] .category-row button.active { color:#20231f; }
.restaurant-home[data-theme="light"] .form-head>div>span,
.restaurant-home[data-theme="light"] .reserve-form label { color:#4f554f; }
.restaurant-home[data-theme="light"] .reserve-form input,
.restaurant-home[data-theme="light"] .reserve-form select,
.restaurant-home[data-theme="light"] .reserve-form textarea,
.restaurant-home[data-theme="light"] .table-option { border-color:#ddd7ce; background:#fff; color:#20231f; }
.restaurant-home[data-theme="light"] .table-option span,
.restaurant-home[data-theme="light"] .table-option small { color:#696e68; }
.restaurant-home[data-theme="light"] .table-option.selected { border-color:#e94e2f; box-shadow:0 0 0 2px rgba(233,78,47,.16); }
.restaurant-home[data-theme="light"] .site-footer { border-color:#e5dfd6; background:#f1ece4; color:#20231f; }
.restaurant-home[data-theme="light"] .site-footer nav a { color:#555c55; }
.restaurant-home[data-theme="light"] .hero h1 em,
.restaurant-home[data-theme="light"] .hero-copy .eyebrow,
.restaurant-home[data-theme="light"] .menu-section .eyebrow,
.restaurant-home[data-theme="light"] .menu-section .category-row button span,
.restaurant-home[data-theme="light"] .menu-section .food-category,
.restaurant-home[data-theme="light"] .menu-section .food-info strong { color:#e94e2f; }
@media (max-width:860px) {
  .restaurant-home[data-theme="light"] :deep(.public-header__nav) { border-color:#e8e2d9; background:rgba(255,253,249,.98); box-shadow:0 18px 30px rgba(60,45,30,.12); }
  .restaurant-home[data-theme="light"] :deep(.public-header__nav a) { color:#454b45; }
}

</style>
