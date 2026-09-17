<template>
  <div class="kiosk" :style="{ '--accent': config.accent_color ?? '#6366f1' }" @click="resetIdle">
    <!-- Loading -->
    <div v-if="state === 'loading'" class="kiosk__splash kiosk__splash--loading">
      <div class="kiosk__spin"></div>
    </div>

    <!-- Error -->
    <div v-else-if="state === 'error'" class="kiosk__splash">
      <p class="kiosk__error">{{ errorMsg }}</p>
    </div>

    <!-- Attract / Idle screen -->
    <div v-else-if="state === 'attract'" class="kiosk__attract" @click="startSession">
      <div v-if="config.splash_image" class="kiosk__splash-bg" :style="{ backgroundImage: `url(${config.splash_image})` }" />
      <div class="kiosk__attract-content">
        <h1 class="kiosk__attract-title">{{ config.splash_title ?? 'Welcome' }}</h1>
        <p class="kiosk__attract-sub">{{ config.splash_subtitle ?? 'Tap anywhere to start' }}</p>
        <div class="kiosk__tap-ring"></div>
      </div>
    </div>

    <!-- Order Type selection -->
    <div v-else-if="state === 'type'" class="kiosk__type-select">
      <h2 class="kiosk__step-title">How would you like to order?</h2>
      <div class="kiosk__type-grid">
        <button v-for="t in availableTypes" :key="t.key" class="kiosk__type-btn" @click="selectType(t.key)">
          <span class="kiosk__type-icon">{{ t.icon }}</span>
          <span>{{ t.label }}</span>
        </button>
      </div>
      <button class="kiosk__back" @click="state = 'attract'">← Back</button>
    </div>

    <!-- Guest info (if required) -->
    <div v-else-if="state === 'guestInfo'" class="kiosk__guest-form">
      <h2 class="kiosk__step-title">Your details</h2>
      <input v-if="config.require_name"  v-model="guestName"  class="kiosk__big-input" placeholder="Your name" />
      <input v-if="config.require_phone" v-model="guestPhone" class="kiosk__big-input" placeholder="Phone number" />
      <div class="kiosk__guest-actions">
        <button class="kiosk__back" @click="state = 'type'">← Back</button>
        <button class="kiosk__next-btn" @click="state = 'menu'">Continue →</button>
      </div>
    </div>

    <!-- Menu -->
    <div v-else-if="state === 'menu' || state === 'cart'" class="kiosk__menu-layout">
      <!-- Left: categories + items -->
      <div class="kiosk__menu-left">
        <div class="kiosk__menu-header">
          <h2 class="kiosk__menu-title">Our Menu</h2>
          <button class="kiosk__cancel-btn" @click="cancelOrder">✕ Cancel</button>
        </div>
        <div class="kiosk__cats">
          <button class="kiosk__cat" :class="{ active: activeCat === null }" @click="activeCat = null">All</button>
          <button v-for="cat in menu.categories" :key="cat.id"
            class="kiosk__cat" :class="{ active: activeCat === cat.id }" @click="activeCat = cat.id">
            {{ cat.name }}
          </button>
        </div>
        <div class="kiosk__items-grid">
          <button v-for="item in filteredItems" :key="item.id" class="kiosk__item" @click="addItem(item)">
            <div class="kiosk__item-img">
              <img v-if="item.image" :src="item.image" :alt="item.name" />
              <span v-else>🍽</span>
            </div>
            <div class="kiosk__item-name">{{ item.name }}</div>
            <div class="kiosk__item-price">{{ fmt(item.price) }}</div>
            <span v-if="cartQty(item.id)" class="kiosk__item-badge">{{ cartQty(item.id) }}</span>
          </button>
        </div>
      </div>

      <!-- Right: cart -->
      <div class="kiosk__cart">
        <div class="kiosk__cart-hdr">
          <span>Your Order</span>
          <span class="kiosk__cart-count">{{ cartCount }} items</span>
        </div>
        <div class="kiosk__cart-lines">
          <div v-if="!cart.length" class="kiosk__cart-empty">Tap items to add them</div>
          <div v-for="line in cart" :key="line.fooditems_id" class="kiosk__cart-line">
            <div class="kiosk__cl-name">{{ line.name }}</div>
            <div class="kiosk__cl-qty">
              <button @click="removeItem(line.fooditems_id)">−</button>
              <span>{{ line.quantity }}</span>
              <button @click="addItem(line)">+</button>
            </div>
            <span class="kiosk__cl-sub">{{ fmt(line.price * line.quantity) }}</span>
          </div>
        </div>
        <div class="kiosk__cart-footer">
          <div class="kiosk__cart-total">Total <strong>{{ fmt(cartTotal) }}</strong></div>
          <button v-if="cart.length" class="kiosk__checkout-btn" :disabled="placing" @click="placeOrder">
            {{ placing ? 'Processing…' : 'Place Order →' }}
          </button>
          <p v-if="orderError" class="kiosk__order-error">{{ orderError }}</p>
        </div>
      </div>
    </div>

    <!-- Confirmation -->
    <div v-else-if="state === 'confirmed'" class="kiosk__confirmed">
      <div class="kiosk__confirmed-icon">✅</div>
      <h2>Order Confirmed!</h2>
      <p class="kiosk__confirmed-num">{{ confirmOrder.order_number }}</p>
      <p class="kiosk__confirmed-total">{{ fmt(confirmOrder.grand_total) }}</p>
      <p class="kiosk__confirmed-msg">{{ confirmOrder.message }}</p>
      <div class="kiosk__countdown">
        Returning to start in <strong>{{ countdown }}</strong>s
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

defineOptions({ layout: null });

const props = defineProps({
  placeId: { type: Number, required: true },
});

// ── State ─────────────────────────────────────────────────────────────────
const state        = ref('loading');
const errorMsg     = ref('');
const sessionToken = ref('');
const menu         = ref({ categories: [], items: [] });
const config       = ref({ accent_color: '#6366f1', order_types: ['dine_in', 'takeaway'],
  require_name: false, require_phone: false, idle_timeout_seconds: 120,
  splash_title: 'Welcome', splash_subtitle: 'Tap to start' });
const activeCat    = ref(null);
const cart         = ref([]);
const orderType    = ref('');
const guestName    = ref('');
const guestPhone   = ref('');
const placing      = ref(false);
const orderError   = ref('');
const confirmOrder = ref(null);
const countdown    = ref(10);

// ── Idle timer ────────────────────────────────────────────────────────────
let idleTimer = null;
const resetIdle = () => {
  if (state.value === 'attract' || state.value === 'loading') return;
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => { state.value = 'attract'; cart.value = []; }, (config.value.idle_timeout_seconds ?? 120) * 1000);
};

// ── Boot ──────────────────────────────────────────────────────────────────
onMounted(async () => {
  try {
    const res  = await fetch(`/api/guest/kiosk/${props.placeId}`, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error((await res.json())?.error ?? 'Kiosk unavailable.');
    const data = await res.json();
    sessionToken.value = data.session_token;
    menu.value         = data.menu ?? { categories: [], items: [] };
    config.value       = { ...config.value, ...data.kiosk_config };
    state.value        = 'attract';
  } catch (e) {
    errorMsg.value = e.message;
    state.value    = 'error';
  }
});

onUnmounted(() => { clearTimeout(idleTimer); clearInterval(countdownTimer); });

const TYPE_MAP = [
  { key: 'dine_in',  label: 'Dine In',  icon: '🍽' },
  { key: 'takeaway', label: 'Takeaway',  icon: '🥡' },
  { key: 'delivery', label: 'Delivery',  icon: '🚚' },
];
const availableTypes = computed(() => TYPE_MAP.filter(t => (config.value.order_types ?? []).includes(t.key)));

const startSession = () => { resetIdle(); state.value = 'type'; };
const selectType   = type => { orderType.value = type; state.value = (config.value.require_name || config.value.require_phone) ? 'guestInfo' : 'menu'; };
const cancelOrder  = () => { cart.value = []; orderType.value = ''; state.value = 'attract'; clearTimeout(idleTimer); };

// ── Cart ──────────────────────────────────────────────────────────────────
const cartCount = computed(() => cart.value.reduce((s, l) => s + l.quantity, 0));
const cartTotal = computed(() => cart.value.reduce((s, l) => s + l.price * l.quantity, 0));
const cartQty   = id => cart.value.find(l => l.fooditems_id === id)?.quantity ?? 0;
const filteredItems = computed(() => activeCat.value === null ? menu.value.items : menu.value.items.filter(i => i.category_id === activeCat.value));

const addItem = item => {
  const line = cart.value.find(l => l.fooditems_id === (item.id ?? item.fooditems_id));
  if (line) line.quantity++;
  else cart.value.push({ fooditems_id: item.id ?? item.fooditems_id, name: item.name, price: item.price, quantity: 1, category_id: item.category_id });
};
const removeItem = id => {
  const line = cart.value.find(l => l.fooditems_id === id);
  if (!line) return;
  if (line.quantity > 1) line.quantity--;
  else cart.value = cart.value.filter(l => l.fooditems_id !== id);
};

// ── Place Order ───────────────────────────────────────────────────────────
const placeOrder = async () => {
  placing.value    = true;
  orderError.value = '';

  // Save cart
  await fetch('/api/guest/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ session_token: sessionToken.value, cart: cart.value.map(l => ({ fooditems_id: l.fooditems_id, quantity: l.quantity })) }),
  });

  const typeMap = { dine_in: 'dining', takeaway: 'on-way', delivery: 'delivery' };
  const res = await fetch('/api/guest/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      session_token: sessionToken.value,
      order_type:    typeMap[orderType.value] ?? 'dining',
      guest_name:    guestName.value || undefined,
      guest_phone:   guestPhone.value || undefined,
    }),
  });

  placing.value = false;
  const data    = await res.json();
  if (!res.ok) { orderError.value = data.error ?? 'Order failed.'; return; }

  confirmOrder.value = data;
  state.value        = 'confirmed';
  cart.value         = [];
  startCountdown();
};

let countdownTimer = null;
const startCountdown = () => {
  countdown.value = 10;
  countdownTimer  = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(countdownTimer);
      state.value = 'attract';
    }
  }, 1000);
};

const fmt = v => 'Rs ' + Number(v ?? 0).toLocaleString('en-PK', { minimumFractionDigits: 0 });
</script>

<style scoped>
.kiosk {
  min-height: 100vh; background: #f8fafc; font-family: system-ui, sans-serif;
  font-size: 1.1rem; touch-action: manipulation; cursor: default;
}

/* Loading */
.kiosk__splash { min-height: 100vh; display: grid; place-items: center; }
.kiosk__spin { width: 56px; height: 56px; border: 6px solid #e2e8f0; border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.kiosk__error { color: #dc2626; font-size: 1.2rem; }

/* Attract screen */
.kiosk__attract {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  background: var(--accent); color: #fff; position: relative; overflow: hidden; cursor: pointer;
}
.kiosk__splash-bg { position: absolute; inset: 0; background-size: cover; background-position: center; opacity: 0.3; }
.kiosk__attract-content { position: relative; text-align: center; }
.kiosk__attract-title { font-size: 3.5rem; font-weight: 900; margin: 0 0 12px; }
.kiosk__attract-sub   { font-size: 1.4rem; opacity: 0.9; margin-bottom: 40px; }
.kiosk__tap-ring {
  width: 100px; height: 100px; border-radius: 50%; border: 4px solid rgba(255,255,255,0.5);
  margin: 0 auto; animation: tapPulse 2s ease-out infinite;
}
@keyframes tapPulse {
  0%   { transform: scale(1); opacity: 1; }
  100% { transform: scale(2); opacity: 0; }
}

/* Type selection */
.kiosk__type-select {
  min-height: 100vh; display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 32px; padding: 40px;
}
.kiosk__step-title { font-size: 2rem; font-weight: 800; color: #1e293b; text-align: center; }
.kiosk__type-grid  { display: flex; gap: 24px; flex-wrap: wrap; justify-content: center; }
.kiosk__type-btn   {
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  background: #fff; border: 3px solid var(--accent); border-radius: 16px;
  padding: 32px 48px; font-size: 1.2rem; font-weight: 700; cursor: pointer;
  transition: all 0.2s;
}
.kiosk__type-btn:hover { background: var(--accent); color: #fff; transform: scale(1.04); }
.kiosk__type-icon { font-size: 3rem; }

/* Guest info */
.kiosk__guest-form {
  min-height: 100vh; display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 20px; padding: 40px; max-width: 500px; margin: 0 auto;
}
.kiosk__big-input {
  width: 100%; border: 3px solid var(--accent); border-radius: 12px;
  padding: 18px 20px; font-size: 1.3rem; text-align: center;
}
.kiosk__guest-actions { display: flex; gap: 16px; width: 100%; }

/* Menu layout */
.kiosk__menu-layout {
  display: grid; grid-template-columns: 1fr 360px; min-height: 100vh;
}
.kiosk__menu-left { display: flex; flex-direction: column; overflow: hidden; }
.kiosk__menu-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 24px; background: var(--accent); color: #fff;
}
.kiosk__menu-title  { font-size: 1.4rem; font-weight: 800; margin: 0; }
.kiosk__cancel-btn  { background: rgba(255,255,255,0.2); border: none; color: #fff; border-radius: 8px; padding: 8px 16px; font-size: 1rem; cursor: pointer; }

.kiosk__cats {
  display: flex; gap: 8px; overflow-x: auto; padding: 12px 24px;
  border-bottom: 1px solid #f1f5f9; flex-shrink: 0;
}
.kiosk__cats::-webkit-scrollbar { height: 0; }
.kiosk__cat {
  flex-shrink: 0; border: 2px solid #e2e8f0; background: #fff; border-radius: 999px;
  padding: 8px 20px; font-size: 0.95rem; font-weight: 600; cursor: pointer;
}
.kiosk__cat.active { background: var(--accent); border-color: var(--accent); color: #fff; }

.kiosk__items-grid {
  flex: 1; overflow-y: auto; display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px; padding: 16px 24px; align-content: start;
}
.kiosk__item {
  display: flex; flex-direction: column; border: 2px solid #f1f5f9; border-radius: 14px;
  background: #fff; cursor: pointer; text-align: left; overflow: hidden; position: relative;
  transition: all 0.2s;
}
.kiosk__item:hover { border-color: var(--accent); transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.08); }
.kiosk__item-img   { width: 100%; height: 130px; background: #f8fafc; overflow: hidden; display: grid; place-items: center; font-size: 3rem; }
.kiosk__item-img img { width: 100%; height: 100%; object-fit: cover; }
.kiosk__item-name  { padding: 10px 12px 4px; font-weight: 700; font-size: 0.95rem; }
.kiosk__item-price { padding: 0 12px 12px; font-weight: 800; color: var(--accent); font-size: 1rem; }
.kiosk__item-badge {
  position: absolute; top: 8px; right: 8px; background: var(--accent); color: #fff;
  border-radius: 50%; width: 26px; height: 26px; display: grid; place-items: center;
  font-size: 0.8rem; font-weight: 800;
}

/* Cart panel */
.kiosk__cart {
  display: flex; flex-direction: column; background: #fff;
  border-left: 2px solid #f1f5f9;
}
.kiosk__cart-hdr {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 20px; font-size: 1.1rem; font-weight: 700;
  background: #f8fafc; border-bottom: 1px solid #f1f5f9; flex-shrink: 0;
}
.kiosk__cart-count { color: var(--accent); font-size: 0.9rem; }
.kiosk__cart-lines { flex: 1; overflow-y: auto; padding: 8px 0; }
.kiosk__cart-empty { padding: 32px 20px; text-align: center; color: #94a3b8; font-size: 0.95rem; }
.kiosk__cart-line  { display: grid; grid-template-columns: 1fr auto auto; gap: 8px; padding: 12px 20px; border-bottom: 1px solid #f8fafc; align-items: center; }
.kiosk__cl-name    { font-weight: 600; font-size: 0.9rem; }
.kiosk__cl-qty     { display: flex; align-items: center; gap: 8px; }
.kiosk__cl-qty button { width: 32px; height: 32px; border-radius: 50%; border: 2px solid #e2e8f0; background: #fff; font-size: 1.1rem; cursor: pointer; display: grid; place-items: center; }
.kiosk__cl-sub     { font-weight: 800; color: var(--accent); min-width: 80px; text-align: right; }

.kiosk__cart-footer { padding: 16px 20px; border-top: 2px solid #f1f5f9; flex-shrink: 0; }
.kiosk__cart-total  { font-size: 1.2rem; margin-bottom: 12px; }
.kiosk__checkout-btn {
  width: 100%; background: var(--accent); color: #fff; border: none; border-radius: 12px;
  padding: 16px; font-size: 1.1rem; font-weight: 800; cursor: pointer;
}
.kiosk__checkout-btn:disabled { opacity: 0.6; }
.kiosk__order-error { color: #dc2626; font-size: 0.85rem; margin-top: 8px; text-align: center; }

/* Confirmed */
.kiosk__confirmed {
  min-height: 100vh; display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 16px; padding: 40px; text-align: center; background: var(--accent); color: #fff;
}
.kiosk__confirmed-icon { font-size: 5rem; }
.kiosk__confirmed h2   { font-size: 2.4rem; font-weight: 900; margin: 0; }
.kiosk__confirmed-num  { font-size: 1.6rem; opacity: 0.9; }
.kiosk__confirmed-total{ font-size: 2rem; font-weight: 800; }
.kiosk__confirmed-msg  { opacity: 0.85; }
.kiosk__countdown      { background: rgba(255,255,255,0.15); padding: 12px 24px; border-radius: 10px; font-size: 1.1rem; }

/* Nav buttons */
.kiosk__back { background: #f1f5f9; border: none; border-radius: 10px; padding: 14px 28px; font-size: 1rem; cursor: pointer; }
.kiosk__next-btn { flex: 1; background: var(--accent); color: #fff; border: none; border-radius: 10px; padding: 14px; font-size: 1rem; font-weight: 700; cursor: pointer; }

@media (max-width: 900px) {
  .kiosk__menu-layout { grid-template-columns: minmax(0, 1fr); height: auto; min-height: 100dvh; }
  .kiosk__menu-left { overflow: visible; min-width: 0; }
  .kiosk__items-grid { overflow: visible; grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .kiosk__cart { border-left: 0; border-top: 2px solid #f1f5f9; }
}
@media (max-width: 480px) {
  .kiosk__menu-header { flex-wrap: wrap; gap: 12px; padding: 16px; }
  .kiosk__items-grid, .kiosk__cats { padding: 12px; gap: 10px; }
  .kiosk__cart-line { grid-template-columns: minmax(0, 1fr) auto; padding: 12px; }
  .kiosk__cl-name { grid-column: 1 / -1; overflow-wrap: anywhere; }
  .kiosk__cl-qty button { width: 44px; height: 44px; }
  .kiosk__attract-title { font-size: 2.5rem; }
  .kiosk__type-select, .kiosk__confirmed { padding: 24px 16px; }
}

</style>
