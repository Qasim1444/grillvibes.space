<template>
  <div class="auth">
    <div class="auth__brand-panel">
      <div class="auth__brand">
        <div class="auth__logo" :class="{ 'auth__logo--image': logoUrl && !logoFailed }">
          <img v-if="logoUrl && !logoFailed" :src="logoUrl" :alt="`${brandName} logo`" @error="logoFailed = true" />
          <span v-else>{{ brandInitial }}</span>
        </div>
        <span class="auth__brand-name">{{ brandName }} Admin</span>
      </div>
      <div class="auth__pitch">
        <p class="auth__eyebrow">Restaurant POS & operations platform</p>
        <h2>Run service, stock, staff, and sales from one workspace.</h2>
        <p>Sign in to manage POS orders, QR menus, kitchen tickets, inventory, procurement, HR, finance, CRM, reports, and WhatsApp workflows.</p>

        <div class="auth__module-grid" aria-label="Included GrillVibes modules">
          <div v-for="module in modules" :key="module">
            <span></span>
            {{ module }}
          </div>
        </div>
      </div>
      <div class="auth__glow auth__glow--1" />
      <div class="auth__glow auth__glow--2" />
    </div>

    <div class="auth__form-panel">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { usePage } from "@inertiajs/vue3";

const page = usePage();
const logoFailed = ref(false);
const logoUrl = computed(() => page.props.branding?.logo ?? null);
const brandName = computed(() => page.props.branding?.company || page.props.branding?.name || "GrillVibes");
const brandInitial = computed(() => brandName.value.trim().charAt(0).toUpperCase() || "G");

const modules = [
  "POS & Orders",
  "QR Menu",
  "Kitchen Display",
  "Inventory",
  "Procurement",
  "HR & Payroll",
  "Finance",
  "CRM",
  "Reports",
];

watch(logoUrl, () => { logoFailed.value = false; });
</script>

<style scoped>
.auth {
  --brand: #f97316;
  --brand-600: #ea580c;
  --brand-soft: #35221b;
  --surface: #171917;
  --surface-2: #222522;
  --border: #303430;
  --border-strong: #414641;
  --text: #f3f4f1;
  --text-muted: #aeb4ad;
  --text-soft: #858c85;
  min-height: 100vh;
  min-height: 100svh;
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(440px, .92fr);
  background: #101210;
  color: var(--text);
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  color-scheme: dark;
}

.auth__brand-panel {
  position: relative;
  isolation: isolate;
  background-image:
    linear-gradient(90deg, rgba(7, 8, 7, .9) 0%, rgba(7, 8, 7, .72) 52%, rgba(7, 8, 7, .32) 100%),
    linear-gradient(0deg, rgba(7, 8, 7, .88) 0%, transparent 72%),
    url("/images/product/grillvibes-dashboard-collage.png");
  background-size: cover;
  background-position: center;
  border-right: 1px solid rgba(255, 255, 255, .08);
  color: #fff;
  padding: clamp(28px, 4vw, 64px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
}

.auth__brand-panel::after {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 20%, rgba(249, 115, 22, .17), transparent 34%);
  pointer-events: none;
  z-index: 0;
}

.auth__brand {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  z-index: 2;
}

.auth__logo {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.22);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.2rem;
  overflow: hidden;
}

.auth__logo--image {
  background: transparent;
  border-color: rgba(255, 255, 255, 0.24);
  padding: 0;
}

.auth__logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.auth__brand-name {
  font-weight: 700;
  font-size: 1.15rem;
}

.auth__pitch {
  position: relative;
  z-index: 2;
  max-width: 560px;
}

.auth__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px;
  color: #ffad8d;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.auth__eyebrow::before {
  content: "";
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f97316;
  box-shadow: 0 0 0 6px rgba(249, 115, 22, .16);
}

.auth__pitch h2 {
  color: #fff;
  max-width: 660px;
  font-size: clamp(2.45rem, 4.2vw, 4.15rem);
  line-height: 1.02;
  letter-spacing: -0.055em;
  margin: 0 0 18px;
}

.auth__pitch p {
  max-width: 520px;
  color: rgba(245, 245, 242, .78);
  font-size: .96rem;
  line-height: 1.7;
  margin: 0;
}

.auth__module-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 9px;
  margin-top: 26px;
  max-width: 560px;
}

.auth__module-grid div {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 9px 11px;
  border: 1px solid rgba(255, 255, 255, .14);
  border-radius: 9px;
  background: rgba(20, 22, 20, .56);
  backdrop-filter: blur(12px);
  color: rgba(245, 245, 242, .9);
  font-size: 0.76rem;
  font-weight: 700;
}

.auth__module-grid span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #f97316;
  flex: 0 0 auto;
}

.auth__glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.5;
}
.auth__glow--1 {
  width: 320px;
  height: 320px;
  background: #f97316;
  top: -80px;
  right: -80px;
}
.auth__glow--2 {
  width: 260px;
  height: 260px;
  background: #ff9b56;
  bottom: -60px;
  left: -60px;
}

.auth__form-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  background: #101210;
}

@media (max-width: 980px) {
  .auth {
    grid-template-columns: 1fr;
  }
  .auth__brand-panel {
    min-height: 390px;
    padding: 30px clamp(22px, 6vw, 56px);
  }
  .auth__form-panel { padding: 36px 18px 48px; }
}

@media (max-width: 640px) {
  .auth__brand-panel { display: none; }
  .auth__form-panel { min-height: 100svh; padding: 20px 14px; }
  .auth__module-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (prefers-reduced-motion: reduce) {
  .auth *, .auth *::before, .auth *::after { scroll-behavior: auto !important; transition-duration: .01ms !important; animation-duration: .01ms !important; }
}
</style>
