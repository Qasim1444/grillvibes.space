<template>
  <header class="public-header">
    <a class="public-header__brand" href="/" aria-label="GrillVibes home">
      <img :src="logoUrl" alt="GrillVibes" />
      <span>Grill<span>Vibes</span></span>
    </a>

    <nav class="public-header__nav" :class="{ 'public-header__nav--open': menuOpen }" aria-label="Primary navigation">
      <a
        v-for="item in items"
        :key="item.label"
        :href="item.href"
        :class="{ 'is-active': item.label === activeItem }"
        :aria-current="item.label === activeItem ? 'page' : undefined"
        @click="menuOpen = false"
      >{{ item.label }}</a>
    </nav>

    <div class="public-header__actions">
      <button
        class="public-header__theme"
        type="button"
        :aria-label="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
        :title="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
        @click="$emit('toggle-theme')"
      >{{ theme === 'dark' ? '☀' : '☾' }}</button>
      <a class="public-header__sign-in" href="/login">Sign In</a>
      <a class="public-header__cta" :href="actionHref">{{ actionLabel }}<span aria-hidden="true">↗</span></a>
      <button
        class="public-header__toggle"
        type="button"
        :aria-expanded="menuOpen"
        aria-label="Toggle navigation"
        @click="menuOpen = !menuOpen"
      >
        <span></span><span></span><span></span>
      </button>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue';
import logoUrl from '../assets/grillvibes-logo.png';

defineProps({
  items: { type: Array, default: () => [] },
  activeItem: { type: String, default: '' },
  actionLabel: { type: String, default: 'Book a Table' },
  actionHref: { type: String, default: '/#reserve' },
  theme: { type: String, default: 'dark' },
});

defineEmits(['toggle-theme']);

const menuOpen = ref(false);
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.public-header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 24px;
  width: 100%;
  height: 72px;
  padding: 0 max(20px, calc((100% - 1200px) / 2));
  color: #f5f5f5;
  font-family: Inter, system-ui, sans-serif;
  background: rgba(17, 17, 17, .96);
  backdrop-filter: blur(16px);
}

.public-header__brand { display:flex; flex:0 0 auto; align-items:center; gap:8px; color:#f5f5f5; font-size:.96rem; font-weight:700; letter-spacing:-.04em; text-decoration:none; }
.public-header__brand>span>span { color:#f97316; }
.public-header__brand img { display:block; width:56px; height:56px; object-fit:contain; border-radius:8px; }
.public-header__nav { display:flex; align-items:center; justify-content:center; gap:clamp(12px,1.7vw,22px); margin-left:auto; }
.public-header__nav a,.public-header__sign-in { color:#b5b5b5; font-size:.78rem; font-weight:500; text-decoration:none; white-space:nowrap; transition:color .18s ease; }
.public-header__nav a:hover,.public-header__nav a.is-active,.public-header__sign-in:hover { color:#f97316; }
.public-header__actions { display:flex; flex:0 0 auto; align-items:center; gap:16px; }
.public-header__theme { display:grid; place-items:center; width:38px; height:38px; border:1px solid #383838; border-radius:50%; background:#1d1d1d; color:#f5f5f5; font:600 1rem Inter,sans-serif; cursor:pointer; transition:background .18s ease,border-color .18s ease,transform .18s ease; }
.public-header__theme:hover { transform:translateY(-1px); border-color:#f97316; }
.public-header__cta { display:inline-flex; align-items:center; gap:9px; min-height:40px; padding:0 15px; border-radius:7px; background:#f97316; color:#fff; font-size:.76rem; font-weight:700; text-decoration:none; white-space:nowrap; transition:background .18s ease,transform .18s ease; }
.public-header__cta:hover { transform:translateY(-1px); background:#ea580c; }
.public-header__toggle { display:none; width:40px; height:40px; padding:9px; border:1px solid #383838; border-radius:8px; background:#1d1d1d; cursor:pointer; }
.public-header__toggle span { display:block; width:20px; height:2px; margin:4px 0; border-radius:2px; background:#f5f5f5; }

@media (max-width: 980px) {
  .public-header { gap:16px; }
  .public-header__nav { gap:14px; }
}

@media (max-width: 860px) {
  .public-header { padding:0 16px; }
  .public-header__actions { margin-left:auto; }
  .public-header__toggle { display:block; }
  .public-header__nav { display:none; position:absolute; top:72px; left:0; right:0; align-items:stretch; gap:0; margin:0; padding:8px 14px 14px; border-top:1px solid rgba(255,255,255,.08); background:rgba(17,17,17,.98); box-shadow:0 18px 30px rgba(0,0,0,.28); }
  .public-header__nav--open { display:flex; flex-direction:column; }
  .public-header__nav a { padding:11px 6px; }
}

@media (max-width: 520px) {
  .public-header { height:66px; padding:0 12px; gap:8px; }
  .public-header__brand img { width:50px; height:50px; }
  .public-header__actions { gap:8px; }
  .public-header__theme { width:34px; height:34px; }
  .public-header__sign-in { display:none; }
  .public-header__cta { min-height:36px; padding:0 10px; font-size:.68rem; }
  .public-header__toggle { width:36px; height:36px; padding:7px; }
  .public-header__nav { top:66px; }
}
</style>
