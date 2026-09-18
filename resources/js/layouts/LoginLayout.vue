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
      <div class="auth__metric-row" aria-label="Project highlights">
        <div><strong>40+</strong><span>Models</span></div>
        <div><strong>POS</strong><span>Ready</span></div>
        <div><strong>API</strong><span>Sanctum</span></div>
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
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(520px, 1.08fr) minmax(420px, 0.92fr);
  background: #0b1020;
}

.auth__brand-panel {
  position: relative;
  background:
    linear-gradient(150deg, rgba(7, 12, 27, 0.92), rgba(31, 24, 64, 0.9) 58%, rgba(79, 70, 229, 0.82)),
    url("https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1600&q=82");
  background-size: cover;
  background-position: center;
  color: #fff;
  padding: 48px;
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
    linear-gradient(180deg, rgba(11, 16, 32, 0) 0%, rgba(11, 16, 32, 0.72) 100%),
    radial-gradient(circle at 20% 20%, rgba(239, 72, 88, 0.32), transparent 28%);
  pointer-events: none;
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
  color: rgba(255, 255, 255, 0.78);
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
  background: #22c55e;
  box-shadow: 0 0 0 6px rgba(34, 197, 94, 0.16);
}

.auth__pitch h2 {
  color: #fff;
  font-size: clamp(2.5rem, 5vw, 4.6rem);
  line-height: 0.96;
  letter-spacing: -0.07em;
  margin: 0 0 18px;
}

.auth__pitch p {
  color: rgba(255, 255, 255, 0.82);
  font-size: 1rem;
  line-height: 1.6;
  margin: 0;
}

.auth__module-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 32px;
  max-width: 520px;
}

.auth__module-grid div {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 42px;
  padding: 10px 12px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.76rem;
  font-weight: 700;
}

.auth__module-grid span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #ef4858;
  flex: 0 0 auto;
}

.auth__metric-row {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  max-width: 430px;
}

.auth__metric-row div {
  border-top: 1px solid rgba(255, 255, 255, 0.22);
  padding-top: 14px;
}

.auth__metric-row strong {
  display: block;
  color: #fff;
  font-size: 1.45rem;
  line-height: 1;
}

.auth__metric-row span {
  display: block;
  margin-top: 5px;
  color: rgba(255, 255, 255, 0.66);
  font-size: 0.7rem;
  font-weight: 700;
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
  background: #a78bfa;
  top: -80px;
  right: -80px;
}
.auth__glow--2 {
  width: 260px;
  height: 260px;
  background: #38bdf8;
  bottom: -60px;
  left: -60px;
}

.auth__form-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  background:
    radial-gradient(circle at 88% 12%, rgba(79, 70, 229, 0.08), transparent 34%),
    linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%);
}

@media (max-width: 980px) {
  .auth {
    grid-template-columns: 1fr;
  }
  .auth__brand-panel {
    min-height: 470px;
    padding: 34px 24px;
  }
  .auth__form-panel { padding: 28px 18px 38px; }
}

@media (max-width: 640px) {
  .auth__brand-panel { display: none; }
  .auth__module-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
</style>
