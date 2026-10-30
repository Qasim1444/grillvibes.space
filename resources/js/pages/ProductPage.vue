<template>
  <div class="gv-page">
    <!-- Header -->
    <header class="gv-header">
      <Link class="brand" href="/">
        <span class="brand-flame">🔥</span>
        <span>Grill<span class="accent">Vibes</span></span>
      </Link>

      <nav class="nav" :class="{ open: mobileOpen }">
        <a href="#modules" @click="mobileOpen = false">Modules</a>
        <a href="#gps" @click="mobileOpen = false">GPS Attendance</a>
        <a href="#inventory" @click="mobileOpen = false">Recipe Costing</a>
        <a href="#pos" @click="mobileOpen = false">POS + WhatsApp</a>
        <a href="#pricing" @click="mobileOpen = false">Pricing</a>
        <a href="#contact" @click="mobileOpen = false">Contact</a>
      </nav>

      <div class="header-right">
        <Link class="btn-ghost" href="/login">Sign In</Link>
        <a class="btn-orange" href="#contact">Request Demo</a>
        <button
          class="burger"
          type="button"
          :aria-expanded="mobileOpen"
          aria-label="Toggle menu"
          @click="mobileOpen = !mobileOpen"
        >
          <span></span><span></span><span></span>
        </button>
      </div>
    </header>

    <main>
      <!-- HERO -->
      <section class="hero">
        <div class="hero-bg"></div>
        <div class="hero-inner">
          <div class="hero-text">
            <p class="badge">Complete Restaurant Management System</p>
            <h1>Restaurant POS & ERP<br /><em>Built Only for Restaurants</em></h1>
            <p class="lede">
              GrillVibes is not a general business software. It is a full restaurant operations platform —
              POS, Kitchen Display, Inventory + Recipe Costing, GPS Attendance, WhatsApp Receipts, CRM, Finance & more.
            </p>
            <div class="hero-cta">
              <a class="btn-orange lg" href="#contact">Request Free Demo</a>
              <a class="btn-outline lg" href="#modules">View All Modules</a>
            </div>
            <div class="hero-tags">
              <span>Recipe Costing</span>
              <span>WhatsApp Receipt</span>
              <span>GPS Attendance</span>
              <span>Multi-Device</span>
            </div>
          </div>
          <div class="hero-visual">
            <img :src="asset('pos-whatsapp.png')" alt="GrillVibes POS with WhatsApp Receipt" class="hero-img" />
          </div>
        </div>
      </section>

      <!-- PROBLEM → SOLUTION -->
      <section class="problem-section">
        <div class="wrap">
          <div class="problem-card">
            <img :src="asset('problem-pricing.png')" alt="Restaurant chaos to GrillVibes control" />
          </div>
        </div>
      </section>

      <!-- KEY HIGHLIGHTS -->
      <section class="highlights wrap">
        <div v-for="h in highlights" :key="h.title" class="hl-card">
          <div class="hl-icon">{{ h.icon }}</div>
          <h3>{{ h.title }}</h3>
          <p>{{ h.desc }}</p>
        </div>
      </section>

      <!-- MODULES -->
      <section id="modules" class="modules-section">
        <div class="wrap">
          <div class="section-head">
            <h2>Everything Included<br /><em>in One Restaurant System</em></h2>
            <p>POS, Kitchen, Inventory, HR, Finance, CRM, Public Website & more — built specifically for restaurants.</p>
          </div>

          <div class="module-grid">
            <article
              v-for="(m, i) in modules"
              :key="m.title"
              class="module-card"
              :class="{ reverse: i % 2 === 1 }"
            >
              <div class="module-img">
                <img :src="asset(m.image)" :alt="m.title" loading="lazy" />
              </div>
              <div class="module-body">
                <span class="module-num">{{ String(i + 1).padStart(2, '0') }}</span>
                <h3>{{ m.title }}</h3>
                <p>{{ m.desc }}</p>
                <ul>
                  <li v-for="point in m.points" :key="point">{{ point }}</li>
                </ul>
                <a class="btn-orange module-cta" href="#contact">Request {{ m.title }} Demo</a>
              </div>
            </article>
          </div>
        </div>
      </section>

      <!-- Recipe Costing -->
      <section id="inventory" class="spotlight">
        <div class="wrap spotlight-inner">
          <div class="spotlight-copy">
            <p class="badge orange">Inventory & Food Cost</p>
            <h2>Recipe Costing<br /><em>Control Every Rupee</em></h2>
            <p>
              Track stock levels, calculate exact food cost per dish, reduce waste and increase profit.
              Real-time stock updates + recipe costing in one place.
            </p>
            <ul class="check">
              <li>Real-time stock levels</li>
              <li>Recipe cost calculation</li>
              <li>Food cost % & trends</li>
              <li>Low stock alerts</li>
            </ul>
            <a class="btn-orange" href="#contact">See Recipe Costing Demo</a>
          </div>
          <div class="spotlight-img">
            <img :src="asset('06_inventory.png')" alt="Inventory and Recipe Costing" />
          </div>
        </div>
      </section>

      <!-- WhatsApp Receipt -->
      <section id="pos" class="spotlight alt">
        <div class="wrap spotlight-inner">
          <div class="spotlight-img">
            <img :src="asset('pos-whatsapp.png')" alt="POS + WhatsApp Receipt" />
          </div>
          <div class="spotlight-copy">
            <p class="badge orange">POS + WhatsApp</p>
            <h2>WhatsApp Receipt<br /><em>Send Instantly</em></h2>
            <p>
              Complete POS with tables, items, billing and one-click WhatsApp receipt.
              Customers get the bill on WhatsApp in seconds.
            </p>
            <ul class="check">
              <li>Food categories & items</li>
              <li>Table management</li>
              <li>WhatsApp receipt button</li>
              <li>Kitchen Display integration</li>
            </ul>
            <a class="btn-orange" href="#contact">Request POS Demo</a>
          </div>
        </div>
      </section>

      <!-- GPS Attendance -->
      <section id="gps" class="spotlight">
        <div class="wrap spotlight-inner">
          <div class="spotlight-copy">
            <p class="badge orange">HR & Attendance</p>
            <h2>GPS Attendance<br /><em>for Every Shift</em></h2>
            <p>
              Staff punch in/out with GPS verification. Managers see present, absent, leave and payroll
              in one clean dashboard.
            </p>
            <ul class="check">
              <li>GPS verified punch</li>
              <li>Daily attendance overview</li>
              <li>Leave requests & approval</li>
              <li>Automated payroll</li>
            </ul>
            <a class="btn-orange" href="#contact">See GPS Attendance</a>
          </div>
          <div class="spotlight-img">
            <img :src="asset('08_gps.png')" alt="GPS Attendance" />
          </div>
        </div>
      </section>

      <!-- More features -->
      <section class="features-strip">
        <div class="wrap">
          <div v-for="f in moreFeatures" :key="f.title" class="feat">
            <div class="feat-copy">
              <span class="feat-label">{{ f.label }}</span>
              <h4>{{ f.title }}</h4>
              <p>{{ f.desc }}</p>
              <ul>
                <li v-for="point in f.points" :key="point">{{ point }}</li>
              </ul>
              <a class="btn-orange feat-cta" href="#contact">{{ f.cta }}</a>
            </div>
            <img :src="asset(f.image)" :alt="f.title" loading="lazy" />
          </div>
        </div>
      </section>

      <!-- Pricing -->
      <section id="pricing" class="pricing-section">
        <div class="wrap">
          <div class="section-head">
            <h2>Simple Pricing<br /><em>for Restaurants</em></h2>
          </div>
          <div class="price-grid">
            <div class="price-card">
              <span class="price-label">Website</span>
              <strong>Rs. 11,999</strong>
            </div>
            <div class="price-card popular">
              <span class="price-label">Monthly Fee</span>
              <strong>Rs. 2,500</strong>
            </div>
            <div class="price-card">
              <span class="price-label">Setup Fee</span>
              <strong>Rs. 5,000</strong>
            </div>
            <div class="price-card">
              <span class="price-label">One Time Fee</span>
              <strong>Rs. 20,000</strong>
            </div>
          </div>
          <p class="price-note">
            آج ہی اپنا سسٹم بک کروئیں! →
            <a href="https://www.grillvibes.space" target="_blank">www.grillvibes.space</a>
          </p>
        </div>
      </section>

      <!-- Final CTA -->
      <section id="contact" class="final-cta">
        <div class="wrap">
          <h2>اپنے ریسٹورنٹ کے لیے<br /><em>فری ڈیمو بک کریں</em></h2>
          <p>Recipe Costing • WhatsApp Receipt • GPS Attendance — سب کچھ ایک سسٹم میں۔</p>
          <div class="cta-buttons">
            <a
              class="btn-orange lg"
              :href="whatsappLink"
              target="_blank"
              rel="noopener"
            >
              WhatsApp پر ڈیمو بک کریں
            </a>
            <Link class="btn-outline lg" href="/login">Admin Demo کھولیں</Link>
          </div>
        </div>
      </section>
    </main>

    <footer class="gv-footer">
      <div class="wrap footer-inner">
        <div>
          <Link class="brand" href="/">
            <span class="brand-flame">🔥</span>
            Grill<span class="accent">Vibes</span>
          </Link>
          <p>Complete Restaurant Management System</p>
        </div>
        <nav>
          <a href="#modules">Modules</a>
          <a href="#pricing">Pricing</a>
          <Link href="/login">Login</Link>
        </nav>
        <a class="footer-link" href="https://www.grillvibes.space" target="_blank">
          www.grillvibes.space
        </a>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Link } from '@inertiajs/vue3';

const props = defineProps({
  // Optional: pass WhatsApp number from Laravel controller
  whatsappNumber: {
    type: String,
    default: '923099553122',
  },
});

const mobileOpen = ref(false);

const whatsappLink = computed(
  () => `https://wa.me/${props.whatsappNumber}?text=${encodeURIComponent('السلام علیکم! مجھے GrillVibes کا فری ڈیمو چاہیے۔')}`
);

// Helper for public images (put images in public/images/product/)
const asset = (file) => `/images/product/${file}`;

const highlights = [
  { icon: '🍳', title: 'Recipe Costing', desc: 'Exact food cost per dish + stock control' },
  { icon: '📱', title: 'WhatsApp Receipt', desc: 'Send bill instantly on WhatsApp' },
  { icon: '📍', title: 'GPS Attendance', desc: 'Location-verified staff punch in/out' },
  { icon: '🔥', title: 'Built for Restaurants', desc: 'Not a general system — pure restaurant focus' },
];

const modules = [
  {
    title: 'POS + WhatsApp Receipt',
    image: 'pos-whatsapp.png',
    desc: 'Complete point of sale with tables, categories, billing and one-tap WhatsApp receipt.',
    points: ['Food items & categories', 'Table management', 'WhatsApp receipt', 'Kitchen Display link'],
  },
  {
    title: 'Inventory + Recipe Costing',
    image: '06_inventory.png',
    desc: 'Track stock, calculate recipe cost, control food cost percentage and reduce waste.',
    points: ['Real-time stock', 'Recipe costing', 'Food cost trends', 'Low stock alerts'],
  },
  {
    title: 'GPS Attendance & HR',
    image: '08_gps.png',
    desc: 'Staff punch with GPS verification. Manage leaves, overtime and payroll easily.',
    points: ['GPS verified punch', 'Attendance overview', 'Leave approval', 'Payroll summary'],
  },
  {
    title: 'Kitchen Display System',
    image: '04_kitchen.png',
    desc: 'Orders go straight to kitchen screens. Track Preparing → Ready → Served status.',
    points: ['Live order tickets', 'Station routing', 'Status updates', 'Faster service'],
  },
  {
    title: 'QR Menu Ordering',
    image: '05_qr.png',
    desc: 'Customers scan QR, view menu on phone and place orders without waiting for staff.',
    points: ['QR table codes', 'Mobile menu', 'Self ordering', 'Direct to kitchen'],
  },
  {
    title: 'CRM + Loyalty + Discounts',
    image: '13_crm.png',
    desc: 'Customer profiles, loyalty points, promo codes and discount coupons in one place.',
    points: ['Customer database', 'Loyalty points', 'Promo codes', 'Discount rules'],
  },
  {
    title: 'Multi-Device Sync',
    image: '11_multi.png',
    desc: 'Mobile app, POS tablet, kitchen screen and laptop dashboard — all connected live.',
    points: ['Mobile ordering', 'POS tablet', 'Kitchen screen', 'Laptop dashboard'],
  },
  {
    title: 'Reservations + Floor Plan',
    image: '10_reservations.png',
    desc: 'Visual floor plan, table status and reservation management for hostess and managers.',
    points: ['Visual floor plan', 'Live table status', 'Reservations list', 'Walk-in handling'],
  },
];

const moreFeatures = [
  { label: 'Operations & analytics', title: 'Live Orders & Reports', image: '03_live.png', desc: 'Monitor the complete order flow while reviewing sales activity, order totals and operational performance from one workspace.', points: ['New, preparing, ready and served orders', 'Sales and order performance', 'Branch activity visibility', 'Faster service decisions'], cta: 'Explore Live Reports' },
  { label: 'Purchasing & cash control', title: 'Procurement & Finance', image: '07_procurement.png', desc: 'Connect purchasing and finance so vendor activity, stock receiving and daily cash movement stay organized.', points: ['Vendor and purchase orders', 'Goods receipts', 'Expenses and vouchers', 'Petty-cash management'], cta: 'Explore Finance' },
  { label: 'Access management', title: 'Roles & Permissions', image: '09_roles.png', desc: 'Give every team member the right access while keeping sensitive restaurant operations under control.', points: ['Custom user roles', 'Module-level permissions', 'Action-level permissions', 'Secure branch operations'], cta: 'Explore Permissions' },
  { label: 'Public restaurant presence', title: 'Blog + Website', image: '12_blog.png', desc: 'Keep the public restaurant experience updated with content that helps guests discover, trust and revisit your brand.', points: ['Restaurant homepage', 'Public menu pages', 'Blog publishing', 'Reviews and feedback'], cta: 'Explore Website' },
  { label: 'See the complete system', title: 'Free Demo', image: '14_demo.png', desc: 'Give restaurant owners a guided look at the complete platform before setup, branding or customer-specific customization.', points: ['Walk through every module', 'Review real workflows', 'Discuss branding options', 'Plan your launch'], cta: 'Request Free Demo' },
];
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@600;700&display=swap');

:global(*) { box-sizing: border-box; margin: 0; padding: 0; }
:global(html) { scroll-behavior: smooth; }
:global(body) { background: #0a0a0a; color: #f5f5f5; font-family: 'Inter', system-ui, sans-serif; }

.gv-page {
  --orange: #f97316;
  --orange-dark: #ea580c;
  --bg: #0a0a0a;
  --card: #141414;
  --line: #262626;
  --muted: #a3a3a3;
  background: var(--bg);
  overflow-x: hidden;
  color: #f5f5f5;
}

.gv-page h1,
.gv-page h2,
.gv-page h3,
.gv-page h4,
.gv-page strong { color: #ffffff; }
.gv-page p { color: #a3a3a3; }
.gv-page a { color: inherit; }
.gv-page .accent,
.gv-page .hero h1 em,
.gv-page .section-head h2 em,
.gv-page .spotlight-copy h2 em,
.gv-page .final-cta h2 em { color: #fb923c; }
.gv-page .module-body > p,
.gv-page .spotlight-copy > p,
.gv-page .section-head p,
.gv-page .lede,
.gv-page .hl-card p,
.gv-page .gv-footer p { color: #b8b8b8; }

.wrap { width: min(1200px, calc(100% - 40px)); margin: 0 auto; }

/* Header */
.gv-header {
  position: sticky; top: 0; z-index: 100;
  display: flex; align-items: center; gap: 24px;
  width: min(1200px, calc(100% - 40px)); margin: 0 auto;
  height: 72px;
  background: rgba(10,10,10,.85); backdrop-filter: blur(16px);
}
.brand {
  display: flex; align-items: center; gap: 8px;
  font: 700 1.25rem 'Space Grotesk', sans-serif;
  color: #fff; text-decoration: none;
}
.brand-flame { font-size: 1.3rem; }
.accent { color: var(--orange); }
.nav { display: flex; gap: 22px; margin-left: auto; }
.nav a { color: var(--muted); text-decoration: none; font-size: .85rem; font-weight: 500; transition: .2s; }
.nav a:hover { color: #fff; }
.header-right { display: flex; align-items: center; gap: 12px; }
.btn-ghost {
  color: #fff; text-decoration: none; font-weight: 600; font-size: .85rem;
  padding: 8px 14px; border-radius: 8px;
}
.btn-orange {
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--orange); color: #fff; font-weight: 700; font-size: .85rem;
  padding: 11px 18px; border-radius: 10px; text-decoration: none;
  box-shadow: 0 8px 24px rgba(249,115,22,.3); transition: .2s;
}
.btn-orange:hover { background: var(--orange-dark); transform: translateY(-2px); }
.btn-orange.lg { padding: 15px 26px; font-size: .95rem; }
.btn-outline {
  display: inline-flex; align-items: center; justify-content: center;
  border: 1px solid #404040; color: #fff; font-weight: 600; font-size: .85rem;
  padding: 11px 18px; border-radius: 10px; text-decoration: none; transition: .2s;
}
.btn-outline:hover { border-color: var(--orange); color: var(--orange); }
.btn-outline.lg { padding: 15px 26px; font-size: .95rem; }
.burger { display: none; width: 42px; height: 42px; border: 1px solid #333; border-radius: 10px; background: #111; cursor: pointer; }
.burger span { display: block; width: 18px; height: 2px; background: #fff; margin: 4px auto; }

/* Hero */
.hero { position: relative; padding: 60px 0 80px; }
.hero-bg {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse 80% 60% at 70% 40%, rgba(249,115,22,.12), transparent 60%);
  pointer-events: none;
}
.hero-inner {
  width: min(1200px, calc(100% - 40px)); margin: 0 auto;
  display: grid; grid-template-columns: 1fr 1fr; gap: 50px; align-items: center;
}
.badge {
  display: inline-block; font-size: .7rem; font-weight: 700; letter-spacing: .08em;
  text-transform: uppercase; color: var(--orange); margin-bottom: 16px;
}
.hero h1 {
  font: 800 clamp(2.4rem, 5vw, 3.8rem)/1.05 'Space Grotesk', sans-serif;
  letter-spacing: -.04em; margin-bottom: 20px;
}
.hero h1 em { font-style: normal; color: var(--orange); }
.lede { color: var(--muted); font-size: 1.05rem; line-height: 1.7; max-width: 520px; margin-bottom: 28px; }
.hero-cta { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 28px; }
.hero-tags { display: flex; flex-wrap: wrap; gap: 10px; }
.hero-tags span {
  font-size: .72rem; font-weight: 600; color: #d4d4d4;
  background: #1a1a1a; border: 1px solid #333; padding: 6px 12px; border-radius: 999px;
}
.hero-visual { position: relative; }
.hero-img {
  width: 100%; border-radius: 20px;
  box-shadow: 0 30px 80px rgba(0,0,0,.5), 0 0 0 1px rgba(249,115,22,.2);
}

/* Problem */
.problem-section { padding: 0 0 80px; }
.problem-card img {
  width: 100%; border-radius: 20px;
  box-shadow: 0 25px 60px rgba(0,0,0,.4);
}

/* Highlights */
.highlights {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px;
  padding-bottom: 90px;
}
.hl-card {
  background: var(--card); border: 1px solid var(--line);
  border-radius: 16px; padding: 28px 22px; text-align: center;
  transition: .25s;
}
.hl-card:hover { border-color: var(--orange); transform: translateY(-4px); }
.hl-icon { font-size: 2rem; margin-bottom: 12px; }
.hl-card h3 { font: 700 1.05rem 'Space Grotesk', sans-serif; margin-bottom: 8px; }
.hl-card p { color: var(--muted); font-size: .85rem; line-height: 1.5; }

/* Modules */
.modules-section { padding: 40px 0 100px; }
.section-head { text-align: center; max-width: 640px; margin: 0 auto 50px; }
.section-head h2 {
  font: 800 clamp(2rem, 4vw, 3.2rem)/1.1 'Space Grotesk', sans-serif;
  letter-spacing: -.03em; margin-bottom: 14px;
}
.section-head h2 em { font-style: normal; color: var(--orange); }
.section-head p { color: var(--muted); font-size: 1rem; line-height: 1.6; }

.module-grid { display: grid; gap: 40px; }
.module-card {
  display: grid; grid-template-columns: 1fr 1fr; gap: 40px;
  align-items: center; background: var(--card);
  border: 1px solid var(--line); border-radius: 20px; overflow: hidden;
}
.module-card.reverse { direction: rtl; }
.module-card.reverse > * { direction: ltr; }
.module-img { min-height: 320px; }
.module-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
.module-body { padding: 36px 40px; text-align: left; display: flex; flex-direction: column; align-items: flex-start; justify-content: center; }
.module-num {
  display: block; font: 600 .75rem 'Space Grotesk', sans-serif;
  color: var(--orange); margin-bottom: 10px; letter-spacing: .05em;
}
.module-body h3 {
  color: #ffffff; font: 800 1.5rem 'Space Grotesk', sans-serif; margin-bottom: 12px;
}
.module-body > p { color: var(--muted); font-size: .95rem; line-height: 1.65; margin-bottom: 18px; }
.module-body ul { list-style: none; display: grid; gap: 8px; }
.module-body li {
  color: #d4d4d4; font-size: .88rem;
  padding-left: 22px; position: relative;
}
.module-body li::before {
  content: '✓'; position: absolute; left: 0; color: var(--orange); font-weight: 700;
}
.module-cta { margin-top: 24px; align-self: flex-start; font-size: .78rem; padding: 10px 15px; }

/* Spotlight */
.spotlight { padding: 80px 0; }
.spotlight.alt { background: #0f0f0f; }
.spotlight-inner {
  display: grid; grid-template-columns: 1fr 1fr; gap: 50px; align-items: center;
}
.spotlight-copy h2 {
  color: #ffffff;
  font: 800 clamp(2rem, 3.5vw, 2.8rem)/1.1 'Space Grotesk', sans-serif;
  margin: 12px 0 16px;
}
.spotlight-copy h2 em { font-style: normal; color: var(--orange); }
.spotlight-copy .badge {
  color: var(--orange);
  font-size: .72rem;
  font-weight: 800;
  letter-spacing: .1em;
  text-transform: uppercase;
}
.spotlight-copy > p { color: var(--muted); line-height: 1.7; margin-bottom: 20px; }
.check { list-style: none; display: grid; gap: 10px; margin-bottom: 28px; }
.check li {
  color: #e5e5e5; font-size: .92rem; line-height: 1.5; padding-left: 26px; position: relative;
}
.check li::before {
  content: '✓'; position: absolute; left: 0;
  color: var(--orange); font-weight: 700;
}
.spotlight-img img {
  width: 100%; border-radius: 18px;
  box-shadow: 0 25px 60px rgba(0,0,0,.45);
}

/* Features strip */
.features-strip { padding: 40px 0 90px; }
.features-strip .wrap {
  display: grid; grid-template-columns: 1fr; gap: 28px;
}
.feat {
  display: grid; grid-template-columns: 1fr 1fr; align-items: stretch;
  min-height: 300px;
  background: var(--card); border: 1px solid var(--line);
  border-radius: 14px; overflow: hidden; transition: .25s;
}
.feat:hover { border-color: var(--orange); transform: translateY(-3px); }
.feat img { width: 100%; height: 100%; min-height: 300px; object-fit: cover; object-position: center; display: block; }
.feat h4 {
  display: flex; align-items: center; justify-content: center;
  padding: 24px; font: 600 1.15rem 'Space Grotesk', sans-serif;
  text-align: center; color: #fff;
}
.feat-copy { display: flex; flex-direction: column; justify-content: center; padding: 24px 30px; order: 1; }
.feat-copy h4 { order: 0; padding: 0 0 12px; }
.feat-copy p { color: #b8b8b8; font-size: .9rem; line-height: 1.65; text-align: center; }
.feat-label { display: block; color: var(--orange); font-size: .68rem; font-weight: 800; letter-spacing: .1em; text-align: center; text-transform: uppercase; margin-bottom: 8px; }
.feat-copy ul { display: grid; gap: 7px; list-style: none; margin: 18px 0 22px; }
.feat-copy li { color: #d4d4d4; font-size: .8rem; padding-left: 18px; position: relative; }
.feat-copy li::before { content: '✓'; position: absolute; left: 0; color: var(--orange); font-weight: 800; }
.feat-cta { align-self: center; font-size: .75rem; padding: 10px 14px; }
.feat:nth-child(odd) img { order: 2; }
.feat:nth-child(even) img { order: 1; }
.feat:nth-child(even) .feat-copy { order: 2; }

/* Pricing */
.pricing-section { padding: 60px 0 90px; background: #0f0f0f; }
.price-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px;
  margin-bottom: 28px;
}
.price-card {
  background: var(--card); border: 1px solid var(--line);
  border-radius: 16px; padding: 28px 20px; text-align: center;
}
.price-card.popular {
  border-color: var(--orange);
  box-shadow: 0 0 0 1px var(--orange), 0 20px 40px rgba(249,115,22,.15);
}
.price-label { display: block; color: var(--muted); font-size: .8rem; margin-bottom: 10px; }
.price-card strong {
  font: 800 1.6rem 'Space Grotesk', sans-serif; color: #fff;
}
.price-note {
  text-align: center; color: var(--muted); font-size: .95rem;
}
.price-note a { color: var(--orange); font-weight: 600; }

/* Final CTA */
.final-cta {
  padding: 90px 0;
  background: radial-gradient(ellipse 70% 80% at 50% 50%, rgba(249,115,22,.12), transparent 70%);
  text-align: center;
}
.final-cta h2 {
  font: 800 clamp(2rem, 4vw, 3.2rem)/1.1 'Space Grotesk', sans-serif;
  margin-bottom: 14px;
}
.final-cta h2 em { font-style: normal; color: var(--orange); }
.final-cta > .wrap > p { color: var(--muted); margin-bottom: 32px; font-size: 1.05rem; }
.cta-buttons { display: flex; flex-wrap: wrap; gap: 14px; justify-content: center; }

/* Footer */
.gv-footer {
  border-top: 1px solid var(--line); padding: 32px 0; background: #070707;
}
.footer-inner {
  display: flex; align-items: center; justify-content: space-between; gap: 24px;
}
.gv-footer p { color: var(--muted); font-size: .8rem; margin-top: 6px; }
.gv-footer nav { display: flex; gap: 20px; }
.gv-footer nav a { color: var(--muted); text-decoration: none; font-size: .85rem; }
.footer-link { color: var(--orange); font-weight: 600; text-decoration: none; font-size: .9rem; }

/* Responsive */
@media (max-width: 980px) {
  .hero-inner, .spotlight-inner, .module-card { grid-template-columns: 1fr; }
  .module-card.reverse { direction: ltr; }
  .highlights { grid-template-columns: repeat(2, 1fr); }
  .features-strip .wrap { grid-template-columns: 1fr; }
  .feat img { min-height: 260px; }
  .price-grid { grid-template-columns: repeat(2, 1fr); }
  .module-img { min-height: 260px; }
}
@media (max-width: 700px) {
  .nav {
    position: absolute; left: 0; right: 0; top: 72px;
    display: none; flex-direction: column; gap: 0;
    background: #0a0a0a; border-bottom: 1px solid var(--line);
    padding: 12px 20px 18px;
  }
  .nav.open { display: flex; }
  .nav a { padding: 12px 0; border-bottom: 1px solid #1a1a1a; }
  .burger { display: block; }
  .btn-ghost { display: none; }
  .highlights { grid-template-columns: 1fr; }
  .features-strip .wrap { grid-template-columns: 1fr; }
  .feat { grid-template-columns: 1fr; }
  .feat h4, .feat img, .feat-copy { order: initial !important; }
  .feat img { height: 200px; min-height: 200px; }
  .price-grid { grid-template-columns: 1fr; }
  .footer-inner { flex-direction: column; text-align: center; }
  .gv-footer nav { justify-content: center; }
}
</style>
