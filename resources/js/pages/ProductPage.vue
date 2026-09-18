<template>
  <div class="product-page">
    <header class="site-header">
      <a class="brand" href="/" aria-label="GrillVibes home">
        <span class="brand-mark">G</span>
        <span>Grill<span class="brand-accent">Vibes</span></span>
      </a>

      <nav class="site-nav" :class="{ 'site-nav--open': mobileOpen }" aria-label="Primary navigation">
        <a href="#features" @click="mobileOpen=false">Modules</a>
        <a href="#solutions" @click="mobileOpen=false">Overview</a>
        <a href="#workflow" @click="mobileOpen=false">Tech Stack</a>
        <a href="/blog" @click="mobileOpen=false">Blog</a>
        <a href="#footer" @click="mobileOpen=false">Contact</a>
      </nav>

      <div class="header-actions">
        <a class="header-login" href="/login">Sign In</a>
        <a class="button button--violet button--small" href="#footer">Contact Seller <span>↗</span></a>
        <button class="menu-toggle" type="button" :aria-expanded="mobileOpen" aria-label="Toggle navigation" @click="mobileOpen=!mobileOpen">
          <span></span><span></span><span></span>
        </button>
      </div>
    </header>

    <main>
      <section class="hero">
        <div class="hero-bg"></div>
        <div class="hero-overlay"></div>
        <div class="hero-content section-wrap">
          <div class="hero-copy">
            <p class="kicker"><span></span> Complete Laravel restaurant software project</p>
            <h1>Restaurant POS & ERP<br />Project <em>For Sale</em></h1>
            <p class="hero-lede">GrillVibes is a full restaurant operations platform built with Laravel 12, Vue 3, Inertia.js, Tailwind CSS, Bootstrap, and API-ready backend architecture.</p>

            <div class="hero-actions">
              <a class="button button--violet" href="#footer">Request Demo</a>
              <a class="button button--ghost" href="#features"><span class="play">▶</span> View Modules</a>
            </div>

            <div class="hero-mini-points">
              <span>Ready Laravel codebase</span><span>Restaurant SaaS potential</span><span>Developer-friendly stack</span>
            </div>
          </div>

          <div class="hero-product">
            <div class="scribble-note">More Than<br /><strong>Just a POS</strong> <span>↘</span></div>

            <div class="live-orders glass-card">
              <div class="live-heading"><span class="status-dot"></span><strong>Live Orders</strong><span class="mini-arrow">↗</span></div>
              <div class="order-row"><b>#1024</b><span>Chicken Burger</span><em class="preparing">Preparing</em></div>
              <div class="order-row"><b>#1023</b><span>BBQ Platter</span><em class="ready">Ready</em></div>
              <div class="order-row"><b>#1022</b><span>Zinger Meal</span><em class="served">Served</em></div>
              <a href="#features">View project modules →</a>
            </div>

            <div class="burger-stage">
              <img src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1100&q=88" alt="Premium restaurant burger" />
            </div>
          </div>
        </div>

        <div class="section-wrap module-bar glass-card">
          <div v-for="item in heroModules" :key="item.label" class="hero-module">
            <div class="module-icon">{{ item.icon }}</div>
            <span>{{ item.label }}</span>
          </div>
        </div>

        <div class="section-wrap stats-row">
          <div><strong>Laravel 12</strong><span>Modern Backend</span></div>
          <div><strong>Vue 3</strong><span>Inertia Frontend</span></div>
          <div><strong>40+</strong><span>Business Models</span></div>
          <div><strong>API</strong><span>Sanctum Ready</span></div>
        </div>
      </section>

      <section id="solutions" class="product-preview section-wrap">
        <div class="preview-layout">
          <div class="dashboard-shell">
            <div class="dash-topbar"><span class="window-dot"></span><span class="window-dot"></span><span class="window-dot"></span><b>GrillVibes / Main branch</b><span class="dash-live">● Service live</span></div>
            <div class="dashboard-body">
              <aside class="dash-sidebar">
                <div class="dash-logo">Grill<span>Vibes</span></div>
                <div class="dash-item active">⌂ <span>Dashboard</span></div>
                <div class="dash-item">◫ <span>Orders</span></div>
                <div class="dash-item">▣ <span>POS</span></div>
                <div class="dash-item">◉ <span>Kitchen</span></div>
                <div class="dash-item">▦ <span>Inventory</span></div>
                <div class="dash-item">♙ <span>Customers</span></div>
                <div class="dash-item">◌ <span>Staff</span></div>
                <div class="dash-item">◒ <span>Reports</span></div>
                <div class="dash-item">⚙ <span>Settings</span></div>
              </aside>

              <div class="dash-main">
                <div class="dash-heading">
                  <div><small>Tuesday, 08 September · Main branch</small><h3>Dashboard</h3></div>
                  <button>＋ New order</button>
                </div>

                <div class="dash-metrics">
                  <div><small>Today's Sales</small><strong>Rs. 24,580</strong><em>↗ 12%</em></div>
                  <div><small>Total Orders</small><strong>186</strong><em>↗ 8%</em></div>
                  <div><small>Active Tables</small><strong>12</strong><em>↗ 0%</em></div>
                  <div><small>Customers</small><strong>84</strong><em>↗ 16%</em></div>
                </div>

                <div class="dash-grid">
                  <div class="chart-panel">
                    <div class="panel-head"><b>Sales overview</b><span>Last 7 days</span></div>
                    <div class="fake-chart">
                      <i style="height:32%"></i><i style="height:46%"></i><i style="height:40%"></i><i style="height:63%"></i><i style="height:54%"></i><i style="height:74%"></i><i style="height:88%"></i>
                    </div>
                    <div class="chart-labels"><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span><span>Mon</span><span>Tue</span></div>
                  </div>

                  <div class="recent-panel">
                    <div class="panel-head"><b>Recent orders</b><span>View all</span></div>
                    <p><b>#1024</b><span>Chicken Burger</span><em class="preparing">Preparing</em></p>
                    <p><b>#1023</b><span>BBQ Platter</span><em class="ready">Ready</em></p>
                    <p><b>#1022</b><span>Zinger Meal</span><em class="served">Served</em></p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="preview-copy">
            <h2>Sell, Customize,<br />or Launch as SaaS</h2>
            <p>Buy a feature-rich restaurant management codebase that can be customized for restaurants, cafes, cloud kitchens, food courts, and multi-branch food businesses.</p>

            <div class="check-list">
              <div><span>✓</span>Complete Laravel + Vue restaurant platform</div>
              <div><span>✓</span>POS, QR menu, KDS, inventory, HR, CRM, and finance</div>
              <div><span>✓</span>Role-based admin workspace with web and API routes</div>
              <div><span>✓</span>Suitable for agencies, SaaS founders, and resellers</div>
              <div><span>✓</span>Ready for demo, branding, and client customization</div>
            </div>

            <div class="preview-actions">
              <a class="button button--violet" href="#footer">Contact for price <span>→</span></a>
              <a class="text-link text-link--light" href="#workflow">View stack <span>↗</span></a>
            </div>
          </div>
        </div>
      </section>

      <section id="features" class="modules-section section-wrap">
        <div class="section-heading section-heading--center">
          <div>
            <h2>Everything Included<br />in the Project</h2>
          </div>
          <p>A broad restaurant software package with customer-facing pages, admin modules, APIs, and operational workflows.</p>
        </div>

        <div class="module-grid">
          <article v-for="module in extendedModules" :key="module.title" class="module-card">
            <div class="module-icon" :class="module.tone">{{ module.icon }}</div>
            <div>
              <span class="module-index">{{ module.index }}</span>
              <h3>{{ module.title }}</h3>
              <p>{{ module.description }}</p>
              <a :href="module.href">Explore {{ module.link }} <span>↗</span></a>
            </div>
          </article>
        </div>
      </section>

      <section id="workflow" class="workflow-section">
        <div class="section-wrap workflow-inner">
          <div class="workflow-copy">
            <p class="kicker kicker--violet">Technology stack</p>
            <h2>Modern Laravel.<br /><em>Practical Architecture.</em></h2>
            <p>The project uses a current Laravel backend, Vue/Inertia frontend, Vite build process, Sanctum APIs, image/barcode utilities, and migration-backed business modules.</p>
            <a class="button button--violet" href="#footer">Ask for demo access <span>→</span></a>
          </div>

          <div class="flow-list">
            <div v-for="(step, index) in workflow" :key="step.title" class="flow-step">
              <span>0{{ index + 1 }}</span>
              <div><b>{{ step.title }}</b><p>{{ step.description }}</p></div>
            </div>
          </div>
        </div>
      </section>

      <section id="guest-ordering" class="guest-section section-wrap">
        <div class="guest-card">
          <div class="guest-copy">
            <p class="kicker kicker--violet">Buyer opportunity</p>
            <h2>Useful for Agencies,<br /><em>Founders, and Resellers.</em></h2>
            <p>Use GrillVibes as a starting point for client restaurant projects, a branded POS product, or a restaurant SaaS platform with modules already built across operations.</p>

            <div class="guest-links">
              <a href="#features">See modules ↗</a>
              <a href="#workflow">See stack ↗</a>
              <a href="#footer">Contact seller ↗</a>
            </div>
          </div>

          <div class="guest-visual">
            <div class="qr-card">
              <span>QR</span>
              <div class="qr-pattern"><i></i><i></i><i></i><i></i></div>
              <small>TABLE 18</small>
            </div>
            <div class="qr-order-card">
              <small>QR ORDER</small>
              <strong>2 × House ramen</strong>
              <span>1 × Yuzu soda</span>
              <em>Routed to kitchen →</em>
            </div>
            <div class="pos-chip">POS <span>● Live</span></div>
          </div>
        </div>
      </section>

      <section id="menu" class="menu-showcase section-wrap">
        <div class="section-heading section-heading--menu">
          <div>
            <p class="kicker kicker--violet">Restaurant website included</p>
            <h2>Public Menu.<br /><em>Admin Controlled.</em></h2>
          </div>
          <p>The same project includes a public restaurant homepage, menu display, blog, reviews, reservations, and guest ordering pages.</p>
        </div>

        <div v-if="foodItems.length" class="product-menu-grid">
          <article v-for="item in foodItems" :key="item.id" class="product-menu-card">
            <div class="product-image" :class="{ 'product-image--empty': !item.image }">
              <img v-if="item.image" :src="item.image" :alt="item.name" loading="lazy" />
              <span v-else>GrillVibes</span>
            </div>
            <div class="product-menu-card__body">
              <span>{{ item.food_category?.name || 'Menu item' }}</span>
              <h3>{{ item.name }}</h3>
              <p>{{ item.description }}</p>
              <strong>£{{ item.price }}</strong>
            </div>
          </article>
        </div>
        <p v-else class="menu-empty">No published menu products yet. Add food items from the GrillVibes workspace.</p>
      </section>

      <section class="final-cta section-wrap">
        <div class="final-cta-inner">
          <div>
            <p class="kicker kicker--violet">Project for sale</p>
            <h2>Own GrillVibes<br /><em>and Start Selling Faster.</em></h2>
            <p>A strong base for restaurants, cafes, cloud kitchens, food courts, and software houses that want a complete restaurant management platform without starting from zero.</p>
          </div>
          <div class="final-actions">
            <a class="button button--violet" href="#footer">Request demo and price <span>→</span></a>
            <a class="text-link text-link--light" href="#features">Review modules <span>↗</span></a>
          </div>
        </div>
      </section>
    </main>

    <footer id="footer" class="site-footer">
      <div class="section-wrap footer-grid">
        <div><a class="brand" href="/"><span class="brand-mark">G</span><span>Grill<span class="brand-accent">Vibes</span></span></a><p>Complete restaurant POS and management project for sale.</p></div>
        <nav aria-label="Footer navigation"><a href="#features">Modules</a><a href="#workflow">Tech Stack</a><a href="#guest-ordering">Buyer Fit</a><a href="#menu">Public Pages</a></nav>
        <a href="/login" class="footer-signin">Open admin demo ↗</a>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const mobileOpen = ref(false);

const heroModules = [
  { label: 'POS & Orders', icon: '▣' },
  { label: 'QR Menu', icon: '◫' },
  { label: 'Inventory', icon: '▦' },
  { label: 'HR Payroll', icon: '♙' },
  { label: 'Finance', icon: '₨' },
  { label: 'CRM', icon: '◌' },
  { label: 'Reports', icon: '◒' },
];

const extendedModules = [
  { index: '01', icon: '⌁', tone: 'violet', title: 'POS & Order Management', description: 'Dine-in, takeaway, delivery-style orders, printable receipts, promo preview, and customer lookup.', link: 'POS module', href: '/pos' },
  { index: '02', icon: '▦', tone: 'teal', title: 'QR Menu & KDS', description: 'Guest QR menu ordering, kitchen stations, live tickets, bump actions, and order status flow.', link: 'guest and kitchen flow', href: '/kds/board' },
  { index: '03', icon: '◒', tone: 'gold', title: 'Inventory & Procurement', description: 'Ingredients, recipes, stock ledger, stock adjustment, vendors, purchase orders, and goods receipts.', link: 'inventory tools', href: '/inventory/stock' },
  { index: '04', icon: '↗', tone: 'blue', title: 'HR, Payroll & Attendance', description: 'Employees, designations, attendance punch, leave approvals, overtime, loans, deductions, and payroll runs.', link: 'HR modules', href: '/hr/attendance' },
  { index: '05', icon: '◇', tone: 'pink', title: 'CRM & Customer Growth', description: 'Customer records, loyalty settings, point adjustments, promo codes, discount campaigns, and feedback replies.', link: 'CRM modules', href: '/customers' },
  { index: '06', icon: '⌘', tone: 'green', title: 'Finance, Roles & Control', description: 'Expenses, vouchers, petty cash, roles, permissions, settings, branches, maintenance logs, and WhatsApp APIs.', link: 'admin controls', href: '/dashboard' },
];

const props = defineProps({
  categories: { type: Array, default: () => [] },
  foodItems: { type: Array, default: () => [] },
});

const foodItems = computed(() => props.foodItems.map(item => ({
  ...item,
  food_category: item.food_category || props.categories.find(category => category.id === item.foodcategory_id),
})));

const modules = [
  { icon: '⌁', tone: 'coral', title: 'Orders & POS', description: 'Capture dine-in, takeaway, delivery, and counter sales in one order stream.', link: 'orders workspace', href: '/orders' },
  { icon: '▦', tone: 'teal', title: 'Kitchen production', description: 'Route tickets to stations, track preparation, and keep the pass moving.', link: 'KDS board', href: '/kds/board' },
  { icon: '◒', tone: 'gold', title: 'Stock & procurement', description: 'Connect recipes and goods receipts to stock levels, vendors, and reorder decisions.', link: 'stock controls', href: '/inventory/stock' },
  { icon: '↗', tone: 'blue', title: 'People & payroll', description: 'Keep attendance, leave, overtime, loans, and payroll in the same back office.', link: 'people tools', href: '/hr/attendance' },
  { icon: '◇', tone: 'violet', title: 'Guests & loyalty', description: 'Build repeat visits with customer profiles, promos, feedback, and loyalty activity.', link: 'customer records', href: '/customers' },
  { icon: '▤', tone: 'green', title: 'Reports & control', description: 'Turn sales, food cost, expenses, and branch activity into decisions.', link: 'food-cost reports', href: '/reports/food-cost' },
];

const workflow = [
  { title: 'Backend', description: 'Laravel 12, PHP 8.2+, session authentication, Sanctum API auth, controllers grouped by business domain.' },
  { title: 'Frontend', description: 'Vue 3, Inertia.js, Vite, Tailwind CSS v4, Bootstrap 5, reusable admin UI components, and public pages.' },
  { title: 'Business data', description: 'Migrations and models for orders, menu, branches, stock, recipes, HR, payroll, finance, CRM, blog, and WhatsApp records.' },
  { title: 'Selling angle', description: 'A practical base for custom restaurant software, white-label POS services, agency delivery, or SaaS product development.' },
];
</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');
:global(*){box-sizing:border-box}
:global(html){scroll-behavior:smooth}
:global(body){margin:0;background:#080b12;color:#f3f5fb}
.product-page{--bg:#080b12;--panel:#101521;--panel-2:#121928;--ink:#f4f6fb;--muted:#9ba5b7;--line:#283142;--violet:#6653f4;--violet-2:#8d7cff;--violet-glow:rgba(102,83,244,.35);font-family:'DM Sans',sans-serif;overflow:hidden;background:var(--bg)}
.section-wrap{width:min(1180px,calc(100% - 48px));margin:0 auto}
.site-header{position:sticky;top:0;z-index:60;width:min(1180px,calc(100% - 48px));min-height:80px;margin:0 auto;display:flex;align-items:center;gap:28px;background:rgba(8,11,18,.78);backdrop-filter:blur(14px)}
.brand{display:inline-flex;align-items:center;gap:10px;color:#fff;font:700 1.1rem 'Space Grotesk',sans-serif;text-decoration:none;letter-spacing:-.04em;white-space:nowrap}
.brand-mark{display:grid;place-items:center;width:33px;height:33px;border-radius:9px;background:var(--violet);box-shadow:0 0 24px rgba(102,83,244,.4);color:#fff;font-size:.88rem}
.brand-accent{color:#9488ff}
.site-nav{display:flex;gap:24px;margin-left:auto}
.site-nav a,.header-login{color:#9ca6b7;font-size:.76rem;text-decoration:none;transition:.2s}
.site-nav a:hover,.header-login:hover{color:#fff}
.header-actions{display:flex;align-items:center;gap:14px}.header-login{color:#fff;font-weight:600}.button{display:inline-flex;align-items:center;justify-content:center;gap:20px;border:1px solid transparent;text-decoration:none;cursor:pointer;font:700 .78rem 'DM Sans',sans-serif;padding:14px 18px;transition:.2s}
.button:hover{transform:translateY(-2px)}
.button--small{padding:10px 14px}
.button--violet{background:var(--violet);color:#fff;box-shadow:0 12px 30px rgba(102,83,244,.25)}.button--violet:hover{background:#5845ec;box-shadow:0 16px 34px rgba(102,83,244,.32)}
.button--ghost{border-color:#606979;color:#fff;background:rgba(255,255,255,.03)}.button--ghost:hover{border-color:#8b86ff;background:rgba(102,83,244,.08)}
.play{display:grid;place-items:center;width:21px;height:21px;border-radius:50%;background:#fff;color:#161a24;font-size:.5rem}
.menu-toggle{display:none;width:40px;height:40px;border:1px solid #2b3446;border-radius:10px;background:#0e131d;cursor:pointer}.menu-toggle span{display:block;width:16px;height:1.5px;background:#fff;margin:4px auto}
.hero{position:relative;isolation:isolate;min-height:760px;padding:38px 0 0;background:#080b12}
.hero-bg{position:absolute;inset:0;z-index:-3;background-image:url('https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1800&q=86');background-size:cover;background-position:center right;filter:saturate(.85)}
.hero-overlay{position:absolute;inset:0;z-index:-2;background:linear-gradient(90deg,#080b12 0%,#080b12ed 32%,rgba(8,11,18,.86) 55%,rgba(8,11,18,.35) 100%),linear-gradient(180deg,#080b12 0%,rgba(8,11,18,.2) 35%,#080b12 100%)}
.hero-content{display:grid;grid-template-columns:1fr .95fr;gap:50px;min-height:505px;align-items:center}
.hero-copy{padding-top:8px}
.kicker{margin:0 0 18px;color:#c6c9d3;font-size:.67rem;font-weight:700;letter-spacing:.15em;text-transform:uppercase}.kicker span{display:inline-block;width:6px;height:6px;border-radius:50%;background:#6f63ff;box-shadow:0 0 0 5px rgba(111,99,255,.13);margin-right:9px}
.kicker--violet{color:#a9a1ff}
.hero h1,.preview-copy h2,.modules-section h2,.workflow-copy h2,.guest-card h2,.final-cta h2{margin:0;font:700 clamp(3.1rem,5.3vw,5.2rem)/.96 'Space Grotesk',sans-serif;letter-spacing:-.075em}
.hero h1 em,.preview-copy h2 em,.modules-section h2 em,.workflow-copy h2 em,.guest-card h2 em,.final-cta h2 em{font-style:normal;color:#887cff}
.hero-lede{max-width:560px;color:#c3cad4;font-size:1rem;line-height:1.72;margin:26px 0 29px}
.hero-actions{display:flex;flex-wrap:wrap;gap:12px}
.hero-mini-points{display:flex;flex-wrap:wrap;gap:15px;margin-top:30px;color:#8f99a9;font-size:.65rem}.hero-mini-points span::before{content:'•';color:#8a7fff;margin-right:6px}
.hero-product{position:relative;min-height:460px}
.burger-stage{position:absolute;right:-8%;bottom:-15px;width:100%;height:390px;display:flex;align-items:flex-end;justify-content:flex-end}
.burger-stage img{width:100%;height:100%;object-fit:cover;object-position:center;border-radius:35% 0 0 0;mix-blend-mode:screen;opacity:.95;filter:contrast(1.03) saturate(1.05)}
.scribble-note{position:absolute;right:-1%;top:0;z-index:5;color:#fff;transform:rotate(6deg);font:500 1rem/1.05 'Space Grotesk',sans-serif;font-style:italic;text-align:center}
.scribble-note strong{color:#a397ff}.scribble-note span{display:block;color:#b0a8ff;text-align:right;font-size:1.4rem}
.glass-card{border:1px solid rgba(116,128,151,.38);background:rgba(16,22,34,.72);box-shadow:0 25px 70px rgba(0,0,0,.35);backdrop-filter:blur(16px)}
.live-orders{position:absolute;right:4%;top:8%;z-index:5;width:300px;padding:18px;border-radius:15px;background:rgba(248,250,255,.95);color:#121722;box-shadow:0 24px 60px rgba(0,0,0,.34)}
.live-heading{display:flex;align-items:center;gap:8px;padding-bottom:12px;border-bottom:1px solid #e6e9ef;font-size:.78rem}.live-heading .status-dot{width:7px;height:7px;border-radius:50%;background:#32b36b}.mini-arrow{margin-left:auto;color:#6c7590}
.order-row{display:grid;grid-template-columns:42px 1fr auto;align-items:center;gap:7px;padding:12px 0;border-bottom:1px solid #eceff4;font-size:.62rem}.order-row b{font-size:.61rem}.order-row span{color:#657087;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}.order-row em{font-style:normal;font-size:.52rem;padding:5px 7px;border-radius:999px;font-weight:700}.preparing{color:#4960a8;background:#e5eaff}.ready{color:#27895a;background:#dff5e9}.served{color:#9b6c27;background:#fff0d4}
.live-orders>a{display:block;text-align:right;color:#564be6;font-size:.62rem;font-weight:700;text-decoration:none;padding-top:12px}
.module-bar{position:relative;z-index:7;display:grid;grid-template-columns:repeat(7,1fr);gap:0;border-radius:15px;padding:13px 16px;background:rgba(14,20,31,.83)}
.hero-module{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;min-height:66px;color:#dfe4ee;font-size:.59rem;text-align:center;border-right:1px solid #283244}.hero-module:last-child{border-right:0}
.module-icon{display:grid;place-items:center;width:34px;height:34px;border-radius:10px;color:#aa9fff;background:rgba(100,83,244,.16);border:1px solid rgba(136,126,255,.18);box-shadow:0 0 18px rgba(102,83,244,.1)}
.stats-row{position:relative;z-index:5;display:grid;grid-template-columns:repeat(4,1fr);padding:30px 0 55px;border-bottom:1px solid #1c2432}
.stats-row>div{text-align:center;border-right:1px solid #1e2634}.stats-row>div:last-child{border-right:0}.stats-row strong{display:block;font:700 1.7rem 'Space Grotesk',sans-serif;color:#fff}.stats-row span{display:block;color:#858fa0;font-size:.65rem;margin-top:4px}
.product-preview{padding:125px 0}.preview-layout{display:grid;grid-template-columns:1.18fr .82fr;gap:70px;align-items:center}
.dashboard-shell{background:#111722;border:1px solid #313b4d;border-radius:17px;overflow:hidden;box-shadow:0 35px 90px rgba(0,0,0,.42);transform:perspective(1000px) rotateY(2deg)}
.dash-topbar{height:38px;display:flex;align-items:center;gap:6px;padding:0 12px;background:#0d121a;border-bottom:1px solid #263143;color:#7f899b;font-size:.58rem}.window-dot{width:6px;height:6px;border-radius:50%;background:#30394b}.dash-topbar b{margin-left:8px;font-weight:500}.dash-live{margin-left:auto;color:#65c995}
.dashboard-body{display:flex;min-height:430px}.dash-sidebar{width:112px;background:#0c1119;border-right:1px solid #252f40;padding:18px 10px;display:flex;flex-direction:column;gap:9px}.dash-logo{color:#fff;font:700 .68rem 'Space Grotesk',sans-serif;margin:0 4px 12px}.dash-logo span{color:#8e82ff}.dash-item{display:flex;align-items:center;gap:8px;color:#7f899b;font-size:.55rem;padding:7px 7px;border-radius:6px}.dash-item.active{color:#fff;background:#4e43d9}.dash-main{flex:1;padding:21px}
.dash-heading{display:flex;justify-content:space-between;align-items:flex-start}.dash-heading small{color:#798396;font-size:.52rem}.dash-heading h3{margin:4px 0 18px;font:600 1rem 'Space Grotesk',sans-serif}.dash-heading button{border:0;background:#5a4df0;color:#fff;border-radius:5px;padding:7px 9px;font-size:.55rem}
.dash-metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:7px}.dash-metrics>div{padding:11px;background:#171e2a;border:1px solid #242e3f;border-radius:7px}.dash-metrics small{display:block;color:#7f899c;font-size:.48rem}.dash-metrics strong{display:block;color:#fff;font:600 .88rem 'Space Grotesk',sans-serif;margin:6px 0}.dash-metrics em{font-style:normal;color:#61c993;font-size:.47rem}
.dash-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:8px;margin-top:8px}.chart-panel,.recent-panel{border:1px solid #263041;border-radius:8px;background:#131a24;padding:12px}.panel-head{display:flex;justify-content:space-between;align-items:center;color:#fff;font-size:.55rem}.panel-head span{color:#758094}.fake-chart{height:155px;display:flex;align-items:flex-end;gap:8px;padding:20px 8px 8px}.fake-chart i{flex:1;background:linear-gradient(180deg,#7e71ff,#4c40d2);border-radius:5px 5px 2px 2px;box-shadow:0 0 18px rgba(102,83,244,.12)}.chart-labels{display:flex;justify-content:space-between;color:#6d7788;font-size:.43rem}.recent-panel p{display:grid;grid-template-columns:35px 1fr auto;gap:6px;align-items:center;border-top:1px solid #232d3d;margin:11px 0 0;padding-top:11px;font-size:.49rem}.recent-panel p span{color:#858e9f}.recent-panel p em{font-style:normal;font-size:.43rem;padding:4px 6px;border-radius:999px}.preview-copy{padding-left:10px}.preview-copy h2{font-size:clamp(2.7rem,4vw,4.2rem)}.preview-copy>p:not(.kicker){color:#929cad;font-size:.9rem;line-height:1.7;max-width:390px;margin:25px 0}
.check-list{display:grid;gap:11px;margin:25px 0 30px}.check-list div{display:flex;align-items:center;gap:10px;color:#b6becb;font-size:.75rem}.check-list span{display:grid;place-items:center;width:18px;height:18px;border-radius:50%;background:rgba(82,191,131,.14);color:#54ca91;font-size:.62rem}
.preview-actions{display:flex;align-items:center;gap:22px}.text-link{color:#fff;text-decoration:none;font-weight:700;font-size:.75rem}.text-link span{color:#9a91ff;margin-left:7px}
.modules-section{padding:40px 0 125px}.section-heading{display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:end;margin-bottom:55px}.modules-section h2,.workflow-copy h2{font-size:clamp(2.6rem,4vw,4.1rem)}.section-heading>p{color:#929cad;font-size:.9rem;line-height:1.7;max-width:320px;margin:0 0 2px}
.section-heading--center{display:block;text-align:center;max-width:640px;margin-left:auto;margin-right:auto}.section-heading--center>p{max-width:100%;margin:18px auto 0}
.module-grid{display:grid;grid-template-columns:repeat(3,1fr);border-top:1px solid #2a3446;border-left:1px solid #2a3446}.module-card{min-height:235px;padding:28px;border-right:1px solid #2a3446;border-bottom:1px solid #2a3446;background:#0c1119;display:flex;gap:17px;transition:.2s}.module-card:hover{background:#101724;transform:translateY(-2px)}.module-card .module-icon{flex:0 0 40px;width:40px;height:40px}.module-index{display:block;color:#667185;font:500 .55rem 'Space Grotesk',sans-serif;margin-bottom:8px}.module-card h3{margin:0 0 9px;color:#fff;font:600 1.03rem 'Space Grotesk',sans-serif}.module-card p{margin:0 0 20px;color:#8f99aa;font-size:.76rem;line-height:1.65}.module-card a{color:#8f84ff;text-decoration:none;font-size:.67rem;font-weight:700}
.module-icon.violet{color:#a69cff;background:rgba(102,83,244,.15)}.module-icon.teal{color:#55ceb2;background:rgba(50,188,159,.12)}.module-icon.gold{color:#e4b961;background:rgba(215,167,57,.12)}.module-icon.blue{color:#77b6ff;background:rgba(80,145,230,.12)}.module-icon.pink{color:#f68eb3;background:rgba(232,82,130,.12)}.module-icon.green{color:#78d698;background:rgba(74,189,113,.12)}
.workflow-section{background:#0d121b;border-top:1px solid #1c2533;border-bottom:1px solid #1c2533}.workflow-inner{display:grid;grid-template-columns:.8fr 1.2fr;gap:90px;padding:120px 0}.workflow-copy>p:not(.kicker){max-width:350px;color:#929cad;line-height:1.7;font-size:.9rem;margin:25px 0 30px}.flow-list{border-top:1px solid #303a4c}.flow-step{display:grid;grid-template-columns:45px 1fr;gap:20px;padding:23px 0;border-bottom:1px solid #303a4c}.flow-step>span{color:#7c70ff;font:600 .72rem 'Space Grotesk',sans-serif}.flow-step b{color:#fff;font:600 1rem 'Space Grotesk',sans-serif}.flow-step p{color:#8791a1;font-size:.72rem;line-height:1.6;margin:7px 0 0}
.guest-section{padding:120px 0}.guest-card{position:relative;overflow:hidden;display:grid;grid-template-columns:1fr .75fr;gap:60px;align-items:center;border:1px solid #3a324e;background:radial-gradient(circle at 85% 30%,rgba(102,83,244,.27),transparent 30%),linear-gradient(135deg,#1b1930,#0e121c 64%);border-radius:18px;padding:65px 70px;box-shadow:0 30px 70px rgba(0,0,0,.3)}
.guest-card h2{font-size:clamp(2.3rem,3.5vw,3.4rem)}.guest-copy>p:not(.kicker){max-width:500px;color:#a6afbd;font-size:.85rem;line-height:1.7;margin:25px 0}.guest-links{display:flex;flex-wrap:wrap;gap:22px}.guest-links a{color:#b7aeff;text-decoration:none;font-size:.7rem;font-weight:700}.guest-visual{position:relative;min-height:230px}.qr-card,.qr-order-card,.pos-chip{position:absolute;background:#fff;color:#161a23;border-radius:12px;box-shadow:0 20px 40px rgba(0,0,0,.3)}.qr-card{left:8%;top:0;width:135px;height:155px;padding:16px;transform:rotate(-7deg)}.qr-card>span{font:700 1.8rem 'Space Grotesk',sans-serif}.qr-card small{display:block;margin-top:55px;font-size:.55rem;color:#677084}.qr-pattern{position:absolute;right:12px;top:14px;display:grid;grid-template-columns:repeat(2,14px);gap:7px}.qr-pattern i{width:14px;height:14px;border:4px solid #161a23}.qr-order-card{right:0;top:42px;width:195px;padding:17px;display:flex;flex-direction:column;gap:7px;transform:rotate(5deg)}.qr-order-card small{color:#5b50df;font-size:.52rem;font-weight:800}.qr-order-card strong{font:600 .82rem 'Space Grotesk',sans-serif}.qr-order-card span{color:#6e7889;font-size:.62rem}.qr-order-card em{border-top:1px solid #e8ebf0;padding-top:9px;margin-top:5px;color:#33a06b;font-style:normal;font-size:.59rem;font-weight:700}.pos-chip{left:32%;bottom:2px;padding:9px 12px;font-size:.55rem;font-weight:800;background:#27233c;color:#fff;border:1px solid #6656c9}.pos-chip span{color:#67d39a;margin-left:8px}
.menu-showcase{padding:0 0 120px}.section-heading--menu{margin-bottom:45px}.product-menu-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}.product-menu-card{overflow:hidden;border:1px solid #273142;background:#101621}.product-image{height:190px;background:#0b1018}.product-image img{width:100%;height:100%;object-fit:cover;display:block}.product-image--empty{display:grid;place-items:center;color:#6f67e8;font-weight:700}.product-menu-card__body{padding:17px}.product-menu-card__body>span{color:#8d82ff;font-size:.58rem;text-transform:uppercase;font-weight:700;letter-spacing:.08em}.product-menu-card h3{margin:9px 0 6px;color:#fff;font:600 1rem 'Space Grotesk',sans-serif}.product-menu-card p{margin:0 0 17px;color:#8993a3;font-size:.68rem;line-height:1.6}.product-menu-card strong{color:#fff;font:600 .8rem 'Space Grotesk',sans-serif}.menu-empty{border-top:1px solid #263041;padding-top:20px;color:#8f99aa}
.final-cta{padding:0 0 120px}.final-cta-inner{display:flex;justify-content:space-between;align-items:center;gap:50px;padding:62px 68px;border-radius:18px;border:1px solid #4b405e;background:linear-gradient(135deg,#16112d,#0e131d);box-shadow:0 28px 70px rgba(0,0,0,.3)}.final-cta h2{font-size:clamp(2.4rem,4vw,4rem)}.final-cta p:not(.kicker){max-width:550px;color:#8f99aa;line-height:1.7;font-size:.85rem;margin:22px 0 0}.final-actions{display:flex;align-items:center;gap:20px;flex-wrap:wrap}
.site-footer{padding:35px 0;border-top:1px solid #1f2836;background:#070a10}.footer-grid{display:grid;grid-template-columns:1fr auto auto;align-items:center;gap:25px}.site-footer .brand{color:#fff}.site-footer p{color:#778293;font-size:.66rem;margin:8px 0 0}.site-footer nav{display:flex;gap:22px}.site-footer nav a,.footer-signin{color:#8d97a7;text-decoration:none;font-size:.67rem}.footer-signin{color:#fff;font-weight:700}
@media(max-width:1050px){
  .site-header{width:min(100% - 32px,1180px)}.hero-content{grid-template-columns:1fr}.hero-product{min-height:390px}.burger-stage{height:360px;right:0}.live-orders{right:5%;top:1%}.module-bar{grid-template-columns:repeat(4,1fr);row-gap:7px}.hero-module{border-bottom:1px solid #283244}.hero-module:nth-child(4),.hero-module:last-child{border-right:0}.stats-row{padding-bottom:40px}
  .preview-layout,.workflow-inner{grid-template-columns:1fr;gap:55px}.preview-copy{padding-left:0}.module-grid{grid-template-columns:repeat(2,1fr)}.product-menu-grid{grid-template-columns:repeat(2,1fr)}.final-cta-inner{align-items:flex-start;flex-direction:column}.footer-grid{grid-template-columns:1fr auto}
}
@media(max-width:700px){
  .site-header{min-height:68px}.site-nav{position:absolute;left:0;right:0;top:68px;display:none;flex-direction:column;gap:0;padding:10px 18px 15px;background:rgba(8,11,18,.98);border-bottom:1px solid var(--line)}.site-nav--open{display:flex}.site-nav a{padding:10px 2px}.header-login{display:none}.menu-toggle{display:block}
  .section-wrap{width:min(100% - 32px,1180px)}
  .hero{padding-top:28px}.hero h1{font-size:3rem}.hero-lede{font-size:.92rem}.hero-product{min-height:370px}.burger-stage{height:300px}.live-orders{width:245px;right:0}.scribble-note{right:0;font-size:.82rem}
  .module-bar{grid-template-columns:repeat(2,1fr);padding:10px}.hero-module{border-right:0}.stats-row{grid-template-columns:repeat(2,1fr);gap:20px 0}.stats-row>div:nth-child(2){border-right:0}
  .product-preview,.guest-section{padding:85px 0}.dashboard-shell{transform:none}.dashboard-body{min-height:365px}.dash-sidebar{display:none}.dash-main{padding:14px}.dash-heading h3{font-size:.9rem}.dash-metrics{grid-template-columns:repeat(2,1fr)}.dash-grid{grid-template-columns:1fr}.chart-panel{display:none}
  .modules-section{padding-bottom:85px}.section-heading{display:block}.section-heading>p{margin-top:22px}.module-grid{grid-template-columns:1fr}.workflow-inner{padding:85px 0}.guest-card{grid-template-columns:1fr;padding:38px 25px}.guest-visual{min-height:260px}.menu-showcase{padding-bottom:85px}.product-menu-grid{grid-template-columns:1fr}.final-cta{padding-bottom:85px}.final-cta-inner{padding:38px 25px}.footer-grid{display:block}.site-footer nav{margin:22px 0}.footer-signin{display:inline-block}
}
</style>
