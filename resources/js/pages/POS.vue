<template>
  <div class="page pos">
    <PageHeader title="Point of Sale" subtitle="Build an order and send it to the kitchen.">
      <template #actions>
        <button class="ui-btn ui-btn--ghost" @click="openQuickReport">
          <span class="btn-icon">📋</span> Quick Report — Today
        </button>
        <button class="ui-btn ui-btn--ghost" @click="openTopTen">
          <span class="btn-icon">🏆</span> Top 10 Deals — Today
        </button>
        <button class="ui-btn ui-btn--ghost" @click="goAdmin">
          <span class="btn-icon">⚙</span> Admin
        </button>
        <button class="ui-btn ui-btn--ghost" @click="refresh" :disabled="itemsLoading">
          <span class="btn-icon" :class="{ 'spin': itemsLoading }">↻</span>
          {{ itemsLoading ? 'Loading…' : 'Refresh' }}
        </button>
      </template>
    </PageHeader>

    <!-- ── Quick Report — Today ─────────────────────────────── -->
    <Modal v-model="showQuickReport" title="Quick Report — Today" width="720px">
      <div class="report-modal">
        <p v-if="reportLoading" class="report-modal__state">Loading…</p>
        <p v-else-if="reportError" class="report-modal__state report-modal__state--error">{{ reportError }}</p>
        <p v-else-if="!quickReport.length" class="report-modal__state">No orders today.</p>
        <table v-else class="report-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Type</th>
              <th style="text-align: right">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="o in quickReport" :key="o.id">
              <td>#{{ o.id }}</td>
              <td>{{ o.customer?.name || "Guest" }}</td>
              <td>{{ typeLabel(o.type) }}</td>
              <td class="report-table__money">{{ money(o.grand_total) }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <th colspan="3">Total · {{ quickReport.length }} order(s)</th>
              <th class="report-table__money">{{ money(reportTotal(quickReport)) }}</th>
            </tr>
          </tfoot>
        </table>
      </div>
    </Modal>

    <!-- ── Top 10 Deals — Today ─────────────────────────────── -->
    <Modal v-model="showTopTen" title="Top 10 Deals — Today" width="640px">
      <div class="report-modal">
        <p v-if="reportLoading" class="report-modal__state">Loading…</p>
        <p v-else-if="reportError" class="report-modal__state report-modal__state--error">{{ reportError }}</p>
        <p v-else-if="!topTen.length" class="report-modal__state">No orders today.</p>
        <table v-else class="report-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Type</th>
              <th style="text-align: right">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="o in topTen" :key="o.id">
              <td>#{{ o.id }}</td>
              <td>{{ o.customer?.name || "Guest" }}</td>
              <td>{{ typeLabel(o.type) }}</td>
              <td class="report-table__money">{{ money(o.grand_total) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Modal>

    <Transition name="slide-fade">
      <div v-if="loadError" class="ui-alert ui-alert--danger">
        <span class="alert-icon">⚠</span> {{ loadError }}
      </div>
    </Transition>

    <div class="pos-layout">
      <!-- ── Menu ─────────────────────────────────────────────── -->
      <div class="pos-menu">
        <div class="ui-card pos-menu-card">
          <div class="pos-toolbar">
            <div class="search-wrapper">
              <span class="search-icon">🔍</span>
              <input
                v-model="search"
                class="ui-input pos-search"
                type="search"
                placeholder="Search menu items…"
                aria-label="Search food items"
              />
              <button v-if="search" class="search-clear" @click="search = ''" aria-label="Clear search">×</button>
            </div>

            <div class="pos-cats" role="tablist" aria-label="Food categories">
              <button
                class="pos-cat"
                :class="{ 'pos-cat--active': activeCat === null }"
                role="tab"
                :aria-selected="activeCat === null"
                @click="activeCat = null"
              >
                All Items
              </button>
              <button
                v-for="c in categories"
                :key="c.id"
                class="pos-cat"
                :class="{ 'pos-cat--active': activeCat === c.id }"
                role="tab"
                :aria-selected="activeCat === c.id"
                @click="activeCat = c.id"
              >
                {{ c.name }}
              </button>
            </div>
          </div>

          <div v-if="itemsLoading" class="pos-loading">
            <div class="skeleton-grid">
              <div v-for="n in 8" :key="n" class="skeleton-tile">
                <div class="skeleton-img"></div>
                <div class="skeleton-text"></div>
                <div class="skeleton-text short"></div>
              </div>
            </div>
          </div>

          <div v-else-if="!filteredItems.length" class="pos-empty">
            <div class="empty-icon">🔍</div>
            <p>No items match your search.</p>
            <button v-if="search || activeCat" class="ui-btn ui-btn--sm" @click="search = ''; activeCat = null">
              Clear filters
            </button>
          </div>

          <div v-else class="pos-grid">
            <button
              v-for="item in filteredItems"
              :key="item.id"
              class="pos-tile"
              type="button"
              @click="addToCart(item)"
              :aria-label="`Add ${item.name} for ${money(item.price)}`"
            >
              <div class="pos-tile__img-wrap">
                <img v-if="item.image" :src="item.image" :alt="item.name" class="pos-tile__img" loading="lazy" />
                <span v-else class="pos-tile__img pos-tile__img--empty" aria-hidden="true">
                  <span class="food-emoji">{{ getFoodEmoji(item.name) }}</span>
                </span>
                <div class="pos-tile__overlay">
                  <span class="add-icon">+</span>
                </div>
              </div>
              <div class="pos-tile__info">
                <span class="pos-tile__name">{{ item.name }}</span>
                <span class="pos-tile__price">{{ money(item.price) }}</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- ── Cart ─────────────────────────────────────────────── -->
      <div class="pos-cart">
        <div class="ui-card pos-cart-card">
          <div class="pos-cart-header">
            <div class="pos-cart-title">
              <span class="cart-icon">🛒</span>
              <span>Current Order</span>
              <span class="pos-chip">{{ totalQty }}</span>
            </div>
            <button
              v-if="cart.length"
              class="clear-btn"
              @click="clearCart"
              type="button"
              aria-label="Clear cart"
            >
              Clear all
            </button>
          </div>

          <TransitionGroup name="list">
            <div v-if="saveError" key="error" class="ui-alert ui-alert--danger">
              <span class="alert-icon">⚠</span> {{ saveError }}
            </div>
            <div v-if="successMsg" key="success" class="ui-alert ui-alert--success">
              <span class="alert-icon">✓</span> {{ successMsg }}
            </div>
          </TransitionGroup>

          <div class="pos-lines" :class="{ 'pos-lines--empty': !cart.length }">
            <div v-if="!cart.length" class="pos-empty-state">
              <div class="empty-illustration">🛒</div>
              <p class="empty-title">Your cart is empty</p>
              <p class="empty-subtitle">Tap items from the menu to start building an order.</p>
            </div>

            <TransitionGroup name="cart-item" tag="div" class="cart-items">
              <div v-for="line in cart" :key="line.fooditems_id" class="pos-line">
                <div class="pos-line__content">
                  <div class="pos-line__main">
                    <span class="pos-line__name">{{ line.name }}</span>
                    <button
                      class="pos-line__x"
                      type="button"
                      :aria-label="`Remove ${line.name}`"
                      @click="removeLine(line.fooditems_id)"
                    >
                      <span>×</span>
                    </button>
                  </div>

                  <div class="pos-line__details">
                    <div class="pos-qty">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        @click="bump(line, -1)"
                        :disabled="line.quantity <= 1"
                      >−</button>
                      <span class="qty-value">{{ line.quantity }}</span>
                      <button type="button" aria-label="Increase quantity" @click="bump(line, 1)">+</button>
                    </div>
                    <span class="pos-line__unit">× {{ money(line.price) }}</span>
                    <span class="pos-line__sub">{{ money(lineTotal(line)) }}</span>
                  </div>

                  <input
                    v-model="line.add_note"
                    class="ui-input pos-line__note"
                    type="text"
                    placeholder="Add a note…"
                    :aria-label="`Note for ${line.name}`"
                  />

                  <select
                    v-model="line.kds_station_id"
                    class="ui-select pos-line__station"
                    :aria-label="`KDS station for ${line.name}`"
                  >
                    <option :value="null">Auto KDS station</option>
                    <option v-for="s in kdsStations" :key="s.id" :value="s.id">{{ s.name }}</option>
                  </select>
                </div>
              </div>
            </TransitionGroup>
          </div>

          <div v-if="cart.length" class="pos-fields">
            <div class="field-group">
              <FormField v-model="form.type" label="Order Type" type="select">
                <option value="dining">🍽 Dining In</option>
                <option value="delivery">🚚 Delivery</option>
                <option value="on-way">🥡 Takeaway</option>
              </FormField>
            </div>

            <div class="field-group">
              <FormField v-model="form.place_id" label="Table / Place" type="select">
                <option value="">— Select —</option>
                <option v-for="p in places" :key="p.id" :value="p.id">{{ p.name }}</option>
              </FormField>
            </div>

            <div class="field-group field-group--full">
              <CustomerPicker
                v-model="form.customer_id"
                :label="customerRequired ? 'Customer *' : 'Customer'"
                :placeholder="customerRequired ? 'Search customer (required)…' : 'Search customer or leave for walk-in…'"
                :class="{ 'field-required': customerRequired }"
                @picked="onCustomerPicked"
              />
            </div>

            <div class="field-group">
              <FormField v-model="form.status" label="Status" type="select">
                <option value="pending">⏳ Pending</option>
                <option value="preparing">👨‍🍳 Preparing</option>
                <option value="on-way">🚚 On the way</option>
                <option value="completed">✅ Completed</option>
              </FormField>
            </div>

            <div class="field-group">
              <FormField v-model="form.paid" label="Payment" type="select">
                <option :value="false">⏳ Unpaid</option>
                <option :value="true">✅ Paid</option>
              </FormField>
            </div>

            <div class="field-group">
              <FormField v-model="form.discount_type" label="Discount Type" type="select">
                <option value="amount">Fixed Amount</option>
                <option value="percentage">Percentage</option>
              </FormField>
            </div>

            <div class="field-group">
              <FormField
                v-model="form.discount_amount"
                :label="form.discount_type === 'percentage' ? 'Discount %' : 'Discount $'"
                type="number"
                step="0.01"
                min="0"
              />
            </div>

            <div class="field-group">
              <FormField
                v-model="form.service_charges_percentage"
                label="Service Charge %"
                type="number"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <div v-if="cart.length" class="pos-crm">
            <!-- Standing campaigns are suggestions, never automatic markdowns:
                 tapping one fills the discount field above, so the bill is still
                 something a person decided to reduce. -->
            <div v-if="suggestedCampaigns.length" class="pos-crm__suggest">
              <span class="ui-label">Running Offers</span>
              <div class="pos-crm__chips">
                <button
                  v-for="c in suggestedCampaigns"
                  :key="c.id"
                  type="button"
                  class="pos-chip"
                  @click="applyCampaign(c)"
                >
                  {{ c.name }} · − {{ money(c.discount) }}
                </button>
              </div>
            </div>

            <div class="pos-crm__row">
              <div class="pos-crm__cell">
                <label class="ui-label" for="pos-promo">Promo Code</label>
                <div class="pos-crm__inline">
                  <input
                    id="pos-promo"
                    v-model="promoInput"
                    class="ui-input"
                    type="text"
                    autocomplete="off"
                    placeholder="e.g. FLAT100"
                    :disabled="!!appliedPromo"
                    @keydown.enter.prevent="applyPromo"
                  />
                  <button v-if="appliedPromo" type="button" class="ui-btn ui-btn--ghost" @click="clearPromo">
                    Remove
                  </button>
                  <button
                    v-else
                    type="button"
                    class="ui-btn ui-btn--ghost"
                    :disabled="promoChecking || !promoInput.trim()"
                    @click="applyPromo"
                  >
                    {{ promoChecking ? "Checking…" : "Apply" }}
                  </button>
                </div>
                <p v-if="promoError" class="pos-crm__hint pos-crm__hint--bad">{{ promoError }}</p>
                <p v-else-if="appliedPromo" class="pos-crm__hint pos-crm__hint--ok">
                  {{ appliedPromo.code }} applied — {{ money(promoDiscount) }} off.
                </p>
                <p v-else class="pos-crm__hint">The discount is priced by the server, not here.</p>
              </div>

              <div class="pos-crm__cell">
                <label class="ui-label" for="pos-points">Redeem Points</label>
                <div class="pos-crm__inline">
                  <input
                    id="pos-points"
                    v-model="redeemPoints"
                    class="ui-input"
                    type="number"
                    min="0"
                    step="1"
                    :disabled="!pointsAvailable"
                  />
                  <button
                    type="button"
                    class="ui-btn ui-btn--ghost"
                    :disabled="!maxRedeemPoints"
                    @click="redeemPoints = maxRedeemPoints"
                  >
                    Max
                  </button>
                </div>
                <p v-if="pointsError" class="pos-crm__hint pos-crm__hint--bad">{{ pointsError }}</p>
                <p v-else class="pos-crm__hint">{{ pointsHint }}</p>
              </div>
            </div>
          </div>

          <div v-if="cart.length" class="pos-totals">
            <div class="pos-total-row">
              <span class="total-label">Subtotal</span>
              <span class="total-value">{{ money(subtotal) }}</span>
            </div>
            <div class="pos-total-row" v-if="discountValue > 0">
              <span class="total-label discount">Discount</span>
              <span class="total-value discount">− {{ money(discountValue) }}</span>
            </div>
            <div class="pos-total-row" v-if="promoDiscount > 0">
              <span class="total-label discount">Promo · {{ appliedPromo.code }}</span>
              <span class="total-value discount">− {{ money(promoDiscount) }}</span>
            </div>
            <div class="pos-total-row" v-if="loyaltyDiscount > 0">
              <span class="total-label discount">Points · {{ redeemPointsValue }}</span>
              <span class="total-value discount">− {{ money(loyaltyDiscount) }}</span>
            </div>
            <div class="pos-total-row" v-if="serviceCharges > 0">
              <span class="total-label">Service Charge</span>
              <span class="total-value">+ {{ money(serviceCharges) }}</span>
            </div>
            <div class="pos-total-row pos-total-row--grand">
              <span class="grand-label">Grand Total</span>
              <span class="grand-value">{{ money(grandTotal) }}</span>
            </div>
            <p v-if="discountsOverflow" class="pos-crm__hint pos-crm__hint--bad">
              The discounts together exceed the subtotal — reduce one of them.
            </p>
            <p v-else-if="pointsToEarn > 0" class="pos-crm__hint pos-crm__hint--ok">
              Earns {{ pointsToEarn }} point(s) once saved.
            </p>
          </div>

          <div v-if="cart.length" class="pos-actions">
            <button class="ui-btn ui-btn--ghost ui-btn--lg" type="button" @click="clearCart">
              Cancel
            </button>
            <button
              class="ui-btn ui-btn--primary ui-btn--lg"
              type="button"
              :disabled="saving"
              @click="placeOrder"
            >
              <span v-if="saving" class="btn-spinner"></span>
              <span v-else>Place Order · {{ money(grandTotal) }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { router, usePage } from "@inertiajs/vue3";
import PageHeader from "../components/ui/PageHeader.vue";
import FormField from "../components/ui/FormField.vue";
import Modal from "../components/ui/Modal.vue";
import CustomerPicker from "../components/ui/CustomerPicker.vue";

// The POS page has no admin chrome — it renders standalone (no AdminLayout).
// Menu items, categories and places arrive as page props. Customers are NOT
// shipped (the table can hold 100k+ rows); the customer field resolves matches
// on demand via the CustomerPicker (/customers/search). The two "today" reports
// are optional props, fetched only when their modal opens.
const props = defineProps({
  foodItems: { type: Array, default: () => [] },
  categories: { type: Array, default: () => [] },
  places: { type: Array, default: () => [] },
  quickReport: { type: Array, default: null },
  topTen: { type: Array, default: null },
  // Loyalty rates + live discount campaigns, used only to preview what a
  // redemption or an offer is worth. Both are re-priced server-side at checkout.
  loyalty: { type: Object, default: () => ({}) },
  campaigns: { type: Array, default: () => [] },
  kdsStations: { type: Array, default: () => [] },
});

const page = usePage();
const goAdmin = () => router.visit("/");

// ── Today's reports (shown in modals) ──────────────────────────────────────
const TYPE_LABELS = { delivery: "Delivery", dining: "Dining", "on-way": "On the way" };
const typeLabel = (t) => TYPE_LABELS[t] || t || "—";

const showQuickReport = ref(false);
const showTopTen = ref(false);
const reportLoading = ref(false);
const reportError = ref("");

// The reports are Inertia::optional props — resolved only on partial reloads.
const quickReport = computed(() => props.quickReport ?? []);
const topTen = computed(() => props.topTen ?? []);

const reportTotal = (rows) =>
  rows.reduce((sum, o) => sum + Number(o.grand_total || 0), 0);

const openQuickReport = () => {
  showQuickReport.value = true;
  reportLoading.value = true;
  reportError.value = "";
  router.reload({
    only: ["quickReport"],
    onError: () => {
      reportError.value = "Could not load the quick report. Please try again.";
    },
    onFinish: () => {
      reportLoading.value = false;
    },
  });
};

const openTopTen = () => {
  showTopTen.value = true;
  reportLoading.value = true;
  reportError.value = "";
  router.reload({
    only: ["topTen"],
    onError: () => {
      reportError.value = "Could not load the top deals report. Please try again.";
    },
    onFinish: () => {
      reportLoading.value = false;
    },
  });
};

const money = (v) => `Rs ${Number(v || 0).toFixed(2)}`;
const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

// Simple food emoji mapping for empty image states
const getFoodEmoji = (name) => {
  const map = {
    'burger': '🍔', 'pizza': '🍕', 'pasta': '🍝', 'salad': '🥗',
    'sushi': '🍣', 'coffee': '☕', 'tea': '🍵', 'cake': '🍰',
    'ice': '🍨', 'chicken': '🍗', 'beef': '🥩', 'fish': '🐟',
    'wine': '🍷', 'beer': '🍺', 'cocktail': '🍸', 'soup': '🍲',
    'bread': '🥖', 'fries': '🍟', 'taco': '🌮', 'burrito': '🌯',
    'noodles': '🍜', 'rice': '🍚', 'egg': '🍳', 'pancake': '🥞'
  };
  const lower = name.toLowerCase();
  for (const [key, emoji] of Object.entries(map)) {
    if (lower.includes(key)) return emoji;
  }
  return '🍽';
};

// Menu items already come filtered to status=1 from the controller.
const items = computed(() => props.foodItems);
const categories = computed(() => props.categories);
const places = computed(() => props.places);
// Props arrive with the page, so there's never a loading state after mount.
const itemsLoading = ref(false);
const loadError = ref("");
const saveError = ref("");
const successMsg = ref("");
const saving = ref(false);

const search = ref("");
const activeCat = ref(null);
const cart = ref([]);

const form = ref({
  type: "dining",
  place_id: props.places[0]?.id ?? "",
  customer_id: null,
  status: "pending",
  paid: false,
  discount_type: "amount",
  discount_amount: 0,
  service_charges_percentage: 0,
});

const customerRequired = computed(() => form.value.type === "delivery");

const filteredItems = computed(() => {
  const q = search.value.trim().toLowerCase();
  return items.value.filter((i) => {
    if (activeCat.value !== null && Number(i.foodcategory_id) !== Number(activeCat.value)) return false;
    if (q && !String(i.name || "").toLowerCase().includes(q)) return false;
    return true;
  });
});

const lineTotal = (line) => num(line.price) * num(line.quantity);

const addToCart = (item) => {
  successMsg.value = "";
  const existing = cart.value.find((l) => l.fooditems_id === item.id);
  if (existing) {
    existing.quantity += 1;
    return;
  }
  cart.value.push({
    fooditems_id: item.id,
    category_id: item.foodcategory_id,
    name: item.name,
    price: num(item.price),
    quantity: 1,
    add_note: "",
    kds_station_id: null,
  });
};

const bump = (line, delta) => {
  const next = line.quantity + delta;
  if (next < 1) {
    removeLine(line.fooditems_id);
    return;
  }
  line.quantity = next;
};

const removeLine = (id) => {
  cart.value = cart.value.filter((l) => l.fooditems_id !== id);
};

const clearCart = () => {
  cart.value = [];
  saveError.value = "";
  successMsg.value = "";
  redeemPoints.value = 0;
  clearPromo();
};

const totalQty = computed(() => cart.value.reduce((sum, l) => sum + num(l.quantity), 0));
const subtotal = computed(() => cart.value.reduce((sum, l) => sum + lineTotal(l), 0));

const discountValue = computed(() => {
  const d = num(form.value.discount_amount);
  if (form.value.discount_type === "percentage") {
    return Math.min(subtotal.value, (subtotal.value * d) / 100);
  }
  return Math.min(subtotal.value, d);
});

// ── Promo code ─────────────────────────────────────────────────────────────
// The cashier types a code; the amount always comes back from the server. The
// payload carries the code, never a figure, so a tampered request can't buy a
// discount for itself.
const promoInput = ref("");
const appliedPromo = ref(null);
const promoError = ref("");
const promoChecking = ref(false);

const quotePromo = async (code) => {
  const params = new URLSearchParams({ code, subtotal: subtotal.value.toFixed(2) });
  if (form.value.customer_id) params.set("customer_id", String(form.value.customer_id));

  const res = await fetch(`/orders/quote-promo?${params.toString()}`, {
    headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" },
    credentials: "same-origin",
  });
  const body = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(
      body?.errors?.promo_code?.[0] || body?.message || "That code could not be applied."
    );
  }
  return body;
};

const applyPromo = async () => {
  const code = promoInput.value.trim();
  if (!code || promoChecking.value) return;

  promoChecking.value = true;
  promoError.value = "";
  try {
    appliedPromo.value = await quotePromo(code);
    promoInput.value = appliedPromo.value.code;
  } catch (e) {
    appliedPromo.value = null;
    promoError.value = e.message;
  } finally {
    promoChecking.value = false;
  }
};

const clearPromo = () => {
  appliedPromo.value = null;
  promoInput.value = "";
  promoError.value = "";
};

const promoDiscount = computed(() =>
  appliedPromo.value ? Math.min(subtotal.value, num(appliedPromo.value.discount)) : 0
);

// A percentage code scales with the bill, and a per-customer limit depends on who
// is on the order — so an earlier quote goes stale the moment either moves.
// Re-price instead of quietly keeping the old number on screen.
let requoteTimer = null;
watch([subtotal, () => form.value.customer_id], () => {
  if (!appliedPromo.value) return;
  clearTimeout(requoteTimer);
  requoteTimer = setTimeout(async () => {
    const current = appliedPromo.value;
    if (!current) return;
    try {
      appliedPromo.value = await quotePromo(current.code);
    } catch (e) {
      appliedPromo.value = null;
      promoError.value = e.message;
    }
  }, 400);
});

// ── Loyalty points ─────────────────────────────────────────────────────────
// The picked customer's row (with its points balance) rides in on the picker's
// `picked` event, so the balance needs no extra request.
const pickedCustomer = ref(null);
const redeemPoints = ref(0);

const onCustomerPicked = (c) => {
  pickedCustomer.value = c;
  redeemPoints.value = 0;
};

const loyaltyActive = computed(() => !!props.loyalty?.is_active);
const pointsBalance = computed(() =>
  form.value.customer_id && pickedCustomer.value ? num(pickedCustomer.value.loyalty_points_balance) : 0
);
const pointsAvailable = computed(
  () => loyaltyActive.value && !!form.value.customer_id && pointsBalance.value > 0
);

const pointRate = computed(() => num(props.loyalty?.currency_per_point));

// Mirrors LoyaltyService::maxRedeemablePoints() — the smaller of the balance and
// the max_redeem_percent cap. Only a hint; the server re-checks it.
const maxRedeemPoints = computed(() => {
  if (!pointsAvailable.value || pointRate.value <= 0) return 0;
  const cap = (subtotal.value * num(props.loyalty?.max_redeem_percent)) / 100;
  return Math.max(0, Math.min(pointsBalance.value, Math.floor(cap / pointRate.value)));
});

const redeemPointsValue = computed(() => Math.max(0, Math.floor(num(redeemPoints.value))));

const pointsError = computed(() => {
  if (!redeemPointsValue.value) return "";
  if (!pointsAvailable.value) return "Pick a customer who holds points first.";
  if (redeemPointsValue.value > pointsBalance.value)
    return `Only ${pointsBalance.value} point(s) on this account.`;
  if (redeemPointsValue.value > maxRedeemPoints.value)
    return `Points may cover at most ${num(props.loyalty?.max_redeem_percent)}% of this order — ${maxRedeemPoints.value} here.`;
  const min = num(props.loyalty?.min_redeem_points);
  if (redeemPointsValue.value < min) return `At least ${min} points are needed to redeem.`;
  return "";
});

const pointsHint = computed(() => {
  if (!loyaltyActive.value) return "The loyalty programme is switched off.";
  if (!form.value.customer_id) return "Pick a customer to spend their points.";
  if (!pointsBalance.value) return "No points on this account yet.";
  return `Balance ${pointsBalance.value} · up to ${maxRedeemPoints.value} usable here (${money(
    maxRedeemPoints.value * pointRate.value
  )} off).`;
});

// Zero while the input is invalid, so the totals never show a discount the server
// would refuse.
const loyaltyDiscount = computed(() =>
  pointsError.value ? 0 : redeemPointsValue.value * pointRate.value
);

// ── Totals ─────────────────────────────────────────────────────────────────
const totalDiscount = computed(
  () => discountValue.value + promoDiscount.value + loyaltyDiscount.value
);
const discountsOverflow = computed(() => totalDiscount.value > subtotal.value + 0.001);
// Capped only so the on-screen total stays sane while `discountsOverflow` is
// showing; placeOrder() refuses to submit in that state.
const netDiscount = computed(() => Math.min(subtotal.value, totalDiscount.value));

const serviceCharges = computed(() => {
  const pct = num(form.value.service_charges_percentage);
  return ((subtotal.value - netDiscount.value) * pct) / 100;
});

const grandTotal = computed(() =>
  Math.max(0, subtotal.value - netDiscount.value + serviceCharges.value)
);

const pointsToEarn = computed(() => {
  if (!loyaltyActive.value || !form.value.paid || !form.value.customer_id) return 0;
  return Math.floor(grandTotal.value * num(props.loyalty?.points_per_currency));
});

// ── Running campaigns ──────────────────────────────────────────────────────
// Scoped campaigns are priced against the matching lines; whole-order ones
// against the bill. Tapping a chip only fills the manual discount field, which
// the cashier could type by hand anyway — so this adds no new trust in the client.
const campaignBase = (c) => {
  if (c.applies_to === "all") return subtotal.value;
  const ids = (c.target_ids ?? []).map(Number);
  return cart.value
    .filter((l) =>
      ids.includes(Number(c.applies_to === "category" ? l.category_id : l.fooditems_id))
    )
    .reduce((sum, l) => sum + lineTotal(l), 0);
};

const campaignDiscount = (c) => {
  const base = campaignBase(c);
  if (base <= 0 || subtotal.value < num(c.min_order_amount)) return 0;
  let raw = c.type === "percentage" ? (base * num(c.value)) / 100 : num(c.value);
  if (c.max_discount !== null && c.max_discount !== undefined) {
    raw = Math.min(raw, num(c.max_discount));
  }
  return Math.min(raw, subtotal.value);
};

const suggestedCampaigns = computed(() =>
  props.campaigns
    .filter((c) => {
      const types = c.order_types ?? [];
      return types.length === 0 || types.includes(form.value.type);
    })
    .map((c) => ({ ...c, discount: campaignDiscount(c) }))
    .filter((c) => c.discount > 0)
);

const applyCampaign = (c) => {
  form.value.discount_type = "amount";
  form.value.discount_amount = Number(c.discount.toFixed(2));
};

// A partial reload refreshes the menu without a full page navigation.
const refresh = () => {
  itemsLoading.value = true;
  router.reload({
    only: ["foodItems", "categories", "places"],
    onFinish: () => {
      itemsLoading.value = false;
    },
  });
};

const nowForApi = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(
    d.getMinutes()
  )}:${p(d.getSeconds())}`;
};

// Load the order's printable receipt in a hidden iframe; that page auto-opens
// the browser print dialog once it (and the logo) have rendered. Reused across
// orders — the previous frame is torn down first.
const printReceipt = (orderId) => {
  const prev = document.getElementById("pos-receipt-frame");
  if (prev) prev.remove();

  const frame = document.createElement("iframe");
  frame.id = "pos-receipt-frame";
  frame.setAttribute("aria-hidden", "true");
  Object.assign(frame.style, {
    position: "fixed",
    left: "-9999px",
    top: "0",
    width: "1px",
    height: "1px",
    border: "0",
  });
  frame.src = `/orders/${orderId}/receipt`;
  document.body.appendChild(frame);
};

const placeOrder = () => {
  saveError.value = "";
  successMsg.value = "";

  if (!cart.value.length) return;
  if (!form.value.place_id) {
    saveError.value = "Please select a place.";
    return;
  }
  if (customerRequired.value && !form.value.customer_id) {
    saveError.value = "Delivery orders require a customer.";
    return;
  }
  if (pointsError.value) {
    saveError.value = pointsError.value;
    return;
  }
  if (discountsOverflow.value) {
    saveError.value = "The discounts together exceed the subtotal — reduce one of them.";
    return;
  }

  const payload = {
    order_datetime: nowForApi(),
    status: form.value.status,
    paid: !!form.value.paid,
    type: form.value.type,
    qty: totalQty.value,
    subtotal: Number(subtotal.value.toFixed(2)),
    discount_type: form.value.discount_type,
    // The cashier's own markdown only. Promo and points are sent as a code and a
    // points count, and the server prices both into their own columns.
    discount_amount: Number(discountValue.value.toFixed(2)),
    service_charges: Number(serviceCharges.value.toFixed(2)),
    service_charges_percentage: Number(num(form.value.service_charges_percentage).toFixed(2)),
    grand_total: Number(grandTotal.value.toFixed(2)),
    place_id: Number(form.value.place_id),
    order_items: cart.value.map((l) => ({
      fooditems_id: l.fooditems_id,
      category_id: l.category_id,
      quantity: l.quantity,
      discount_amount: 0,
      sub_total: Number(lineTotal(l).toFixed(2)),
      add_note: l.add_note || "",
      kds_station_id: l.kds_station_id ?? null,
    })),
  };

  if (form.value.customer_id) payload.customer_id = Number(form.value.customer_id);
  if (appliedPromo.value) payload.promo_code = appliedPromo.value.code;
  if (redeemPointsValue.value > 0) payload.redeem_points = redeemPointsValue.value;

  saving.value = true;
  router.post("/orders", payload, {
    preserveScroll: true,
    onSuccess: () => {
      // The controller flashes a success message with the new order id.
      const msg = page.props.flash?.success || "Order placed successfully.";
      successMsg.value = msg;
      // Flash reads "Order #123 placed successfully." — pull the id and print.
      const idMatch = String(msg).match(/#(\d+)/);
      if (idMatch) printReceipt(idMatch[1]);
      cart.value = [];
      form.value.discount_amount = 0;
      form.value.customer_id = null;
      pickedCustomer.value = null;
      redeemPoints.value = 0;
      clearPromo();
    },
    onError: (errors) => {
      saveError.value =
        Object.values(errors).flat().join(" ") ||
        "Could not place the order. Please try again.";
    },
    onFinish: () => {
      saving.value = false;
    },
  });
};
</script>

<style scoped>
/* ── Layout ─────────────────────────────────────────────────────────────── */
.pos-layout {
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: 24px;
  align-items: start;
  max-width: 1600px;
}

/* ── Menu Card ──────────────────────────────────────────────────────────── */
.pos-menu-card {
  padding: 20px;
}

.pos-toolbar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

/* Search */
.search-wrapper {
  position: relative;
  max-width: 360px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.5;
  font-size: 14px;
  pointer-events: none;
}

.pos-search {
  width: 100%;
  padding-left: 36px;
  padding-right: 32px;
  height: 42px;
  border-radius: 10px;
  border: 1.5px solid var(--border, #e2e8f0);
  background: var(--surface, #fff);
  transition: all 0.2s ease;
}

.pos-search:focus {
  border-color: var(--brand, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  outline: none;
}

.search-clear {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: var(--muted-bg, #f1f5f9);
  border: none;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  color: var(--muted, #64748b);
  display: grid;
  place-items: center;
}

/* Categories */
.pos-cats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pos-cat {
  border: 1.5px solid var(--border, #e2e8f0);
  background: transparent;
  color: var(--text, #334155);
  border-radius: 999px;
  padding: 7px 16px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.pos-cat:hover {
  border-color: var(--brand, #3b82f6);
  color: var(--brand, #3b82f6);
  background: rgba(59, 130, 246, 0.04);
}

.pos-cat--active {
  background: var(--brand, #3b82f6);
  border-color: var(--brand, #3b82f6);
  color: #fff;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25);
}

/* ── Loading Skeleton ───────────────────────────────────────────────────── */
.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
}

.skeleton-tile {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.skeleton-img {
  width: 100%;
  height: 120px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 12px;
}

.skeleton-text {
  height: 14px;
  background: #f1f5f9;
  border-radius: 6px;
  width: 80%;
}

.skeleton-text.short {
  width: 40%;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ── Empty States ───────────────────────────────────────────────────────── */
.pos-empty {
  text-align: center;
  padding: 60px 20px;
  color: var(--muted, #64748b);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.pos-empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--muted, #64748b);
}

.empty-illustration {
  font-size: 56px;
  margin-bottom: 16px;
  opacity: 0.3;
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text, #334155);
  margin-bottom: 4px;
}

.empty-subtitle {
  font-size: 13px;
}

/* ── Menu Grid ──────────────────────────────────────────────────────────── */
.pos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

.pos-tile {
  display: flex;
  flex-direction: column;
  border: 1.5px solid var(--border, #e2e8f0);
  border-radius: 14px;
  background: var(--surface, #fff);
  cursor: pointer;
  text-align: left;
  overflow: hidden;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.pos-tile:hover {
  border-color: var(--brand, #3b82f6);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
}

.pos-tile:active {
  transform: translateY(0);
}

.pos-tile__img-wrap {
  position: relative;
  width: 100%;
  height: 120px;
  overflow: hidden;
  background: var(--surface-2, #f8fafc);
}

.pos-tile__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.pos-tile:hover .pos-tile__img {
  transform: scale(1.05);
}

.pos-tile__img--empty {
  display: grid;
  place-items: center;
  height: 100%;
}

.food-emoji {
  font-size: 40px;
  opacity: 0.6;
}

.pos-tile__overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: grid;
  place-items: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.pos-tile:hover .pos-tile__overlay {
  opacity: 1;
}

.add-icon {
  width: 40px;
  height: 40px;
  background: #fff;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 24px;
  color: var(--brand, #3b82f6);
  font-weight: 300;
}

.pos-tile__info {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pos-tile__name {
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--text, #1e293b);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.pos-tile__price {
  font-size: 14px;
  font-weight: 700;
  color: var(--brand, #3b82f6);
}

/* ── Cart ───────────────────────────────────────────────────────────────── */
.pos-cart-card {
  position: sticky;
  top: 20px;
  padding: 0;
  overflow: hidden;
}

.pos-cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border, #e2e8f0);
  background: var(--surface-2, #f8fafc);
}

.pos-cart-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 15px;
  color: var(--text, #1e293b);
}

.cart-icon {
  font-size: 18px;
}

.pos-chip {
  background: var(--brand, #3b82f6);
  color: #fff;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.clear-btn {
  background: transparent;
  border: none;
  color: var(--danger, #ef4444);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.2s;
}

.clear-btn:hover {
  background: rgba(239, 68, 68, 0.08);
}

/* ── Cart Lines ─────────────────────────────────────────────────────────── */
.pos-lines {
  max-height: 320px;
  overflow-y: auto;
  padding: 0 20px;
}

.pos-lines--empty {
  max-height: none;
}

.cart-items {
  display: flex;
  flex-direction: column;
}

.pos-line {
  padding: 14px 0;
  border-bottom: 1px solid var(--border, #f1f5f9);
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.pos-line__content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pos-line__main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.pos-line__name {
  font-weight: 600;
  font-size: 14px;
  color: var(--text, #1e293b);
  line-height: 1.3;
}

.pos-line__x {
  border: none;
  background: var(--surface-2, #f1f5f9);
  color: var(--muted, #94a3b8);
  width: 26px;
  height: 26px;
  border-radius: 6px;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.pos-line__x:hover {
  background: var(--danger, #ef4444);
  color: #fff;
}

.pos-line__details {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.pos-qty {
  display: inline-flex;
  align-items: center;
  border: 1.5px solid var(--border, #e2e8f0);
  border-radius: 8px;
  overflow: hidden;
  background: var(--surface, #fff);
}

.pos-qty button {
  border: none;
  background: transparent;
  color: var(--text, #334155);
  width: 32px;
  height: 32px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.15s;
  display: grid;
  place-items: center;
}

.pos-qty button:hover:not(:disabled) {
  background: var(--surface-2, #f1f5f9);
  color: var(--brand, #3b82f6);
}

.pos-qty button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.qty-value {
  min-width: 32px;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: var(--text, #1e293b);
}

.pos-line__unit {
  font-size: 12px;
  color: var(--muted, #94a3b8);
  font-weight: 500;
}

.pos-line__sub {
  margin-left: auto;
  font-weight: 700;
  font-size: 14px;
  color: var(--text, #1e293b);
}

.pos-line__note {
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid var(--border, #e2e8f0);
  background: var(--surface-2, #f8fafc);
  width: 100%;
  transition: all 0.2s;
}

.pos-line__note:focus {
  border-color: var(--brand, #3b82f6);
  background: var(--surface, #fff);
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.08);
}

.pos-line__station {
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid var(--border, #e2e8f0);
  background: var(--surface-2, #f8fafc);
  width: 100%;
  color: var(--text, #1e293b);
}

/* ── Form Fields ────────────────────────────────────────────────────────── */
.pos-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid var(--border, #f1f5f9);
  background: var(--surface, #fff);
}

.field-group {
  min-width: 0;
}

.field-group--full {
  grid-column: 1 / -1;
}

.field-required :deep(label)::after {
  content: " *";
  color: var(--danger, #ef4444);
}

/* ── Promo code / points / offers ───────────────────────────────────────── */
.pos-crm {
  padding: 0 20px 16px;
  background: var(--surface, #fff);
}

.pos-crm__suggest {
  margin-bottom: 12px;
}

.pos-crm__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 6px;
}

.pos-chip {
  padding: 5px 11px;
  border: 1px dashed var(--brand, #4f46e5);
  border-radius: 999px;
  background: transparent;
  color: var(--brand, #4f46e5);
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
}

.pos-chip:hover {
  background: var(--surface-2, #f8fafc);
}

.pos-crm__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.pos-crm__cell {
  min-width: 0;
}

.pos-crm__inline {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.pos-crm__inline .ui-input {
  min-width: 0;
  flex: 1;
}

.pos-crm__hint {
  margin: 5px 0 0;
  font-size: 11.5px;
  line-height: 1.4;
  color: var(--text-muted, #94a3b8);
}

.pos-crm__hint--ok {
  color: var(--success, #16a34a);
}

.pos-crm__hint--bad {
  color: var(--danger, #ef4444);
}

/* ── Totals ─────────────────────────────────────────────────────────────── */
.pos-totals {
  border-top: 2px solid var(--border, #f1f5f9);
  padding: 16px 20px;
  background: var(--surface-2, #f8fafc);
}

.pos-total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  padding: 5px 0;
  color: var(--text, #475569);
}

.total-label {
  font-weight: 500;
}

.total-label.discount,
.total-value.discount {
  color: var(--success, #10b981);
}

.total-value {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.pos-total-row--grand {
  border-top: 2px solid var(--border, #e2e8f0);
  margin-top: 10px;
  padding-top: 12px;
}

.grand-label {
  font-size: 16px;
  font-weight: 700;
  color: var(--text, #1e293b);
}

.grand-value {
  font-size: 20px;
  font-weight: 800;
  color: var(--brand, #3b82f6);
  font-variant-numeric: tabular-nums;
}

/* ── Actions ────────────────────────────────────────────────────────────── */
.pos-actions {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 12px;
  padding: 16px 20px 20px;
  background: var(--surface, #fff);
}

.ui-btn--lg {
  padding: 12px 20px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 10px;
}

.btn-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ── Alerts ─────────────────────────────────────────────────────────────── */
.ui-alert {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 10px;
  margin-bottom: 16px;
  font-size: 14px;
  font-weight: 500;
}

.ui-alert--danger {
  background: rgba(239, 68, 68, 0.08);
  color: var(--danger, #dc2626);
  border: 1px solid rgba(239, 68, 68, 0.15);
}

.ui-alert--success {
  background: rgba(16, 185, 129, 0.08);
  color: var(--success, #059669);
  border: 1px solid rgba(16, 185, 129, 0.15);
}

.alert-icon {
  font-size: 16px;
  flex-shrink: 0;
}

/* ── Report modals ──────────────────────────────────────────────────────── */
.report-modal__state {
  text-align: center;
  padding: 32px 12px;
  color: var(--muted, #64748b);
  font-size: 14px;
}

.report-modal__state--error {
  color: var(--danger, #dc2626);
}

.report-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.report-table th,
.report-table td {
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid var(--border, #f1f5f9);
}

.report-table thead th {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--muted, #64748b);
}

.report-table tfoot th {
  font-weight: 700;
  border-top: 2px solid var(--border, #e2e8f0);
  border-bottom: none;
}

.report-table__money {
  text-align: right;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

/* ── Transitions ────────────────────────────────────────────────────────── */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.cart-item-enter-active,
.cart-item-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.cart-item-enter-from,
.cart-item-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* ── Scrollbar ──────────────────────────────────────────────────────────── */
.pos-lines::-webkit-scrollbar {
  width: 6px;
}

.pos-lines::-webkit-scrollbar-track {
  background: transparent;
}

.pos-lines::-webkit-scrollbar-thumb {
  background: var(--border, #cbd5e1);
  border-radius: 3px;
}

/* ── Responsive ─────────────────────────────────────────────────────────── */
@media (max-width: 1100px) {
  .pos-layout {
    grid-template-columns: 1fr;
  }

  .pos-cart-card {
    position: static;
  }

  .pos-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
}

@media (max-width: 640px) {
  .pos-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .pos-tile__img-wrap {
    height: 100px;
  }

  .pos-fields {
    grid-template-columns: 1fr;
  }

  .pos-crm__row {
    grid-template-columns: 1fr;
  }

  .pos-actions {
    grid-template-columns: 1fr;
    position: sticky;
    bottom: 0;
    box-shadow: 0 -4px 20px rgba(0,0,0,0.08);
  }

  .pos-cats {
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: 4px;
    -webkit-overflow-scrolling: touch;
  }

  .pos-cat {
    flex-shrink: 0;
  }
}
</style>
