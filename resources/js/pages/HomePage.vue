<template>
  <div class="restaurant-home">
    <header class="site-header">
      <a class="brand" href="/" aria-label="GrillVibes home">
        <span class="brand-mark">G</span>
        <span>Grill<span class="brand-accent">Vibes</span></span>
      </a>

      <nav class="site-nav" :class="{ 'site-nav--open': mobileOpen }" aria-label="Primary navigation">
        <a href="/" @click="mobileOpen = false">Home</a>
        <a href="/product" @click="mobileOpen = false">Products</a>
        <a href="#menu" @click="mobileOpen = false">Menu</a>
        <a href="#reserve" @click="mobileOpen = false">Reservation</a>
        <a href="#blog" @click="mobileOpen = false">Blog</a>
        <a href="#story" @click="mobileOpen = false">About</a>
        <a href="#footer" @click="mobileOpen = false">Contact</a>
      </nav>

      <div class="header-actions">
        <a class="header-login" href="/login">Sign In</a>
        <a class="button button--coral button--small" href="#reserve">Get Started <span>↗</span></a>
        <button class="menu-toggle" type="button" :aria-expanded="mobileOpen" aria-label="Toggle navigation" @click="mobileOpen = !mobileOpen">
          <span></span><span></span><span></span>
        </button>
      </div>
    </header>

    <main>
      <section class="hero section-shell">
        <div class="hero-copy">
          <div class="scribble">Good Food<br />Better Business <span>♡</span></div>
          <p class="eyebrow"><span class="eyebrow-dot"></span> Restaurant operations, beautifully connected</p>
          <h1>Delicious Food<br /><em>Smarter Operations</em></h1>
          <p class="hero-text">
            GrillVibes helps restaurants manage orders, kitchen, inventory, staff, finance, and guest experiences — so you can focus on serving great food.
          </p>

          <div class="hero-actions">
            <a class="button button--coral" href="#reserve">Book a Table</a>
            <a class="button button--outline" href="#story"><span class="play">▶</span> Watch Video</a>
          </div>

          <div class="hero-stats" aria-label="GrillVibes highlights">
            <div><strong>500+</strong><span>Restaurants</span></div>
            <div><strong>50K+</strong><span>Happy Customers</span></div>
            <div><strong>99.9%</strong><span>Uptime</span></div>
            <div><strong>24/7</strong><span>Support</span></div>
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

      <section class="feature-ribbon section-shell" aria-label="GrillVibes capabilities">
        <div v-for="(feature, index) in ribbonFeatures" :key="feature.label" class="ribbon-item">
          <div class="ribbon-icon" :class="feature.tone"><span>{{ feature.icon }}</span></div>
          <span>{{ feature.label }}</span>
          <i v-if="index < ribbonFeatures.length - 1"></i>
        </div>
      </section>

      <section id="story" class="experience section-shell">
        <div class="experience-copy">
          <p class="eyebrow">A complete restaurant management platform</p>
          <h2>Run the restaurant.<br /><em>Enjoy the craft.</em></h2>
          <p class="section-lede">
            From front of house to back of house, GrillVibes brings everything together in one connected platform.
          </p>

          <div class="check-list">
            <div><span>✓</span>Easy to use and quick to set up</div>
            <div><span>✓</span>Works for single or multi-branch restaurants</div>
            <div><span>✓</span>Built for restaurants of all sizes</div>
            <div><span>✓</span>Loved by restaurant owners</div>
          </div>

          <div class="inline-actions">
            <a class="button button--coral button--small" href="/login">Get Started <span>↗</span></a>
            <a class="text-link" href="/product">Learn More <span>→</span></a>
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
            <p>Browse your live menu by category. Every dish shown here comes from the GrillVibes food catalogue.</p>
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
              <h2>Ideas for a<br /><em>better service.</em></h2>
            </div>
            <p>Practical stories and fresh thinking from the people behind better restaurant operations.</p>
          </div>

          <div class="blog-grid">
            <a v-for="post in blogPosts" :key="post.id" class="blog-card" :href="`/blog/${post.slug}`">
              <div class="blog-image">
                <img v-if="post.featured_image" :src="post.featured_image" :alt="post.title" loading="lazy" />
                <span v-else class="blog-image-placeholder">K</span>
              </div>
              <div class="blog-card-body">
                <div class="blog-meta">
                  <span>{{ post.categories?.[0]?.name || 'Restaurant operations' }}</span>
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
                <label>Time<select v-model="reservation.time"><option v-for="time in times" :key="time">{{ time }}</option></select></label>
              </div>

              <div class="form-row">
                <label>Party size<select v-model="reservation.guests"><option v-for="number in 8" :key="number" :value="number">{{ number }} {{ number === 1 ? 'guest' : 'guests' }}</option></select></label>
                <label>Duration<select v-model="reservation.duration_minutes"><option :value="60">60 min</option><option :value="90">90 min</option><option :value="120">120 min</option><option :value="180">180 min</option></select></label>
              </div>

              <div class="form-row">
                <label>Your name<input v-model="reservation.guest_name" type="text" placeholder="Alex Morgan" required /></label>
                <label>Email<input v-model="reservation.guest_email" type="email" placeholder="alex@example.com" required /></label>
              </div>

              <div class="form-row">
                <label>Phone<input v-model="reservation.guest_phone" type="tel" placeholder="+44 7000 000000" /></label>
                <label>Occasion<input v-model="reservation.occasion" type="text" placeholder="Birthday, anniversary..." /></label>
              </div>

              <label class="notes-field">Notes<textarea v-model="reservation.notes" rows="3" placeholder="Allergies, accessibility, or other requests"></textarea></label>

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
          <a class="brand" href="/"><span class="brand-mark">G</span><span>Grill<span class="brand-accent">Vibes</span></span></a>
          <p>Great food. Better operations.</p>
        </div>
        <nav aria-label="Footer navigation">
          <a href="#menu">Menu</a><a href="#reserve">Reservations</a><a href="/product">Product</a><a href="#story">About</a>
        </nav>
        <div class="footer-cta">
          <span>Ready to run service better?</span>
          <a href="/login">Enter GrillVibes ↗</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useForm } from '@inertiajs/vue3';

defineOptions({ layout: null });

const props = defineProps({
	categories: { type: Array, default: () => [] },
	foodItems: { type: Array, default: () => [] },
	tables: { type: Array, default: () => [] },
  blogPosts: { type: Array, default: () => [] },
  feedback: { type: Array, default: () => [] },
});

const stars = r => '★'.repeat(Math.max(0, Math.min(5, Number(r) || 0))) + '☆'.repeat(5 - Math.max(0, Math.min(5, Number(r) || 0)));

const mobileOpen = ref(false);

const ribbonFeatures = [
  { label: 'POS & Orders', icon: '▣', tone: 'pink' },
  { label: 'Kitchen Display', icon: '◫', tone: 'orange' },
  { label: 'Inventory', icon: '▦', tone: 'green' },
  { label: 'Staff Management', icon: '♙', tone: 'blue' },
  { label: 'Reservations', icon: '⌑', tone: 'violet' },
  { label: 'QR Menu', icon: '⌁', tone: 'rose' },
  { label: 'Reports', icon: '◒', tone: 'gold' },
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
const times = ['12:30', '13:00', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30'];
const tables = computed(() => props.tables);
const reservation = useForm({
	date: '',
	time: '19:00',
	guests: 2,
	duration_minutes: 90,
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
		guest_phone: data.guest_phone || null,
		guest_email: data.guest_email,
		dining_table_id: data.dining_table_id,
		party_size: data.guests,
		reserved_at: `${data.date} ${data.time}`,
		duration_minutes: data.duration_minutes,
		occasion: data.occasion || null,
		notes: data.notes || null,
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

:global(*){box-sizing:border-box}
:global(html){scroll-behavior:smooth}
:global(body){margin:0;background:#faf5ec;color:#1b211e}
.restaurant-home{--ink:#17201c;--muted:#6f766f;--line:#dfd8cc;--cream:#faf5ec;--paper:#fffdf8;--coral:#ef4858;--coral-dark:#d93648;--peach:#fde5df;font-family:'DM Sans',sans-serif;overflow:hidden}
.section-shell{width:min(1180px,calc(100% - 48px));margin:0 auto}
.site-header{position:sticky;top:0;z-index:50;width:min(1180px,calc(100% - 48px));min-height:78px;margin:0 auto;display:flex;align-items:center;gap:26px;background:rgba(250,245,236,.88);backdrop-filter:blur(16px)}
.brand{display:inline-flex;align-items:center;gap:10px;color:var(--ink);font:700 1.12rem 'DM Sans',sans-serif;letter-spacing:-.04em;text-decoration:none;white-space:nowrap}
.brand-mark{display:grid;place-items:center;width:34px;height:34px;border-radius:9px;background:var(--coral);color:#fff;font:700 .9rem 'Fraunces',serif}
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

</style>
