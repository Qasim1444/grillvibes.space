<template>
  <div
    class="qrmenu"
    :style="{ '--accent': config.accent_color ?? '#6366f1' }"
  >
    <!-- =========================================================
         LOADING SCREEN
    ========================================================== -->
    <div
      v-if="state === 'loading'"
      class="qrmenu__screen qrmenu__screen--loading"
    >
      <div class="qrmenu__loader">
        <div class="qrmenu__loader-ring"></div>
      </div>

      <h2>Preparing your menu</h2>
      <p>Please wait a moment...</p>
    </div>

    <!-- =========================================================
         ERROR SCREEN
    ========================================================== -->
    <div
      v-else-if="state === 'error'"
      class="qrmenu__screen qrmenu__screen--error"
    >
      <div class="qrmenu__error-icon">!</div>

      <h2>Menu unavailable</h2>

      <p>{{ errorMsg }}</p>

      <button
        class="qrmenu__primary-btn"
        @click="reloadPage"
      >
        Try Again
      </button>
    </div>

    <!-- =========================================================
         ORDER CONFIRMATION
    ========================================================== -->
    <div
      v-else-if="state === 'confirmed'"
      class="qrmenu__confirmation"
    >
      <div class="qrmenu__success-circle">
        <span>✓</span>
      </div>

      <span class="qrmenu__confirmation-label">
        ORDER CONFIRMED
      </span>

      <h1>Thank you!</h1>

      <p class="qrmenu__confirmation-subtitle">
        Your order has been sent to the restaurant.
      </p>

      <!-- Order summary -->
      <div class="qrmenu__order-card">
        <div class="qrmenu__order-card-row">
          <span>Order number</span>
          <strong>
            {{ confirmOrder.order_number }}
          </strong>
        </div>

        <div class="qrmenu__order-card-divider"></div>

        <div class="qrmenu__order-card-row">
          <span>Total</span>

          <strong>
            {{ fmt(confirmOrder.grand_total) }}
          </strong>
        </div>
      </div>

      <!-- Order status -->
      <div
        v-if="orderStatus"
        class="qrmenu__status-card"
      >
        <span class="qrmenu__status-dot"></span>

        <div>
          <small>ORDER STATUS</small>

          <strong>
            {{ orderStatus }}
          </strong>
        </div>
      </div>

      <p class="qrmenu__confirmation-message">
        {{ confirmOrder.message }}
      </p>

      <button
        class="qrmenu__primary-btn qrmenu__primary-btn--large"
        @click="resetOrder"
      >
        Order More
      </button>
    </div>

    <!-- =========================================================
         MAIN MENU
    ========================================================== -->
    <template v-else>

      <!-- =======================================================
           HEADER
      ======================================================== -->
      <header class="qrmenu__header">

        <div class="qrmenu__brand">

          <div class="qrmenu__brand-icon">
            {{ place?.name?.charAt(0)?.toUpperCase() || 'M' }}
          </div>

          <div class="qrmenu__brand-text">

            <div class="qrmenu__eyebrow">
              WELCOME TO
            </div>

            <h1 class="qrmenu__title">
              {{ place?.name ?? 'Restaurant Menu' }}
            </h1>

            <p
              v-if="tableInfo"
              class="qrmenu__table"
            >
              <span class="qrmenu__table-dot"></span>
              Table {{ tableInfo.number }}
            </p>

          </div>
        </div>

        <!-- Header cart -->
        <button
          v-if="cartCount"
          class="qrmenu__header-cart"
          @click="showCart = !showCart"
          aria-label="Open cart"
        >
          <span class="qrmenu__cart-icon">
            🛒
          </span>

          <span class="qrmenu__header-cart-count">
            {{ cartCount }}
          </span>
        </button>

      </header>

      <!-- =======================================================
           WELCOME SECTION
      ======================================================== -->
      <section class="qrmenu__welcome">

        <p class="qrmenu__welcome-kicker">
          DISCOVER OUR MENU
        </p>

        <h2>
          Freshly made for you.
        </h2>

        <p>
          Browse our menu and add your favourites to your order.
        </p>

      </section>

      <!-- =======================================================
           CATEGORY NAVIGATION
      ======================================================== -->
      <div class="qrmenu__categories-wrap">

        <div
          class="qrmenu__categories"
          ref="catScroll"
        >

          <!-- All -->
          <button
            class="qrmenu__category"
            :class="{ active: activeCat === null }"
            @click="activeCat = null"
          >
            <span>✨</span>
            All
          </button>

          <!-- Categories -->
          <button
            v-for="cat in menu.categories"
            :key="cat.id"
            class="qrmenu__category"
            :class="{ active: activeCat === cat.id }"
            @click="activeCat = cat.id"
          >
            {{ cat.name }}
          </button>

        </div>

      </div>

      <!-- =======================================================
           MENU CONTENT
      ======================================================== -->
      <main class="qrmenu__content">

        <!-- Section heading -->
        <div class="qrmenu__section-head">

          <div>

            <span>
              MENU
            </span>

            <h2>
              {{
                activeCat === null
                  ? 'Popular choices'
                  : (
                      menu.categories.find(
                        c => c.id === activeCat
                      )?.name || 'Menu'
                    )
              }}
            </h2>

          </div>

          <span class="qrmenu__item-count">
            {{ filteredItems.length }} items
          </span>

        </div>

        <!-- =====================================================
             FOOD ITEMS
        ====================================================== -->
        <div
          v-if="filteredItems.length"
          class="qrmenu__grid"
        >

          <article
            v-for="item in filteredItems"
            :key="item.id"
            class="qrmenu__item"
            @click="addItem(item)"
          >

            <!-- Food image -->
            <div class="qrmenu__item-image">

              <img
                v-if="item.image"
                :src="item.image"
                :alt="item.name"
                loading="lazy"
              />

              <div
                v-else
                class="qrmenu__item-placeholder"
              >
                🍽️
              </div>

              <!-- Quantity badge -->
              <span
                v-if="cartQty(item.id)"
                class="qrmenu__item-quantity"
              >
                {{ cartQty(item.id) }}
              </span>

            </div>

            <!-- Item information -->
            <div class="qrmenu__item-content">

              <div class="qrmenu__item-top">

                <h3>
                  {{ item.name }}
                </h3>

                <button
                  class="qrmenu__add-btn"
                  @click.stop="addItem(item)"
                  aria-label="Add item"
                >
                  +
                </button>

              </div>

              <!-- Description -->
              <p
                v-if="item.description"
                class="qrmenu__item-description"
              >
                {{ item.description }}
              </p>

              <!-- Price -->
              <div class="qrmenu__item-footer">

                <span class="qrmenu__item-price">
                  {{ fmt(item.price) }}
                </span>

                <span class="qrmenu__item-action">
                  Add to order
                </span>

              </div>

            </div>

          </article>

        </div>

        <!-- =====================================================
             EMPTY CATEGORY
        ====================================================== -->
        <div
          v-else
          class="qrmenu__empty"
        >

          <div class="qrmenu__empty-icon">
            🍽️
          </div>

          <h3>
            No items found
          </h3>

          <p>
            There are no menu items in this category.
          </p>

        </div>

      </main>

      <!-- =======================================================
           CART BACKDROP
      ======================================================== -->
      <transition name="fade">

        <div
          v-if="showCart"
          class="qrmenu__backdrop"
          @click="showCart = false"
        ></div>

      </transition>

      <!-- =======================================================
           CART PANEL
      ======================================================== -->
      <transition name="cart">

        <aside
          v-if="showCart"
          class="qrmenu__cart"
        >

          <!-- Cart header -->
          <div class="qrmenu__cart-header">

            <div>

              <span class="qrmenu__cart-label">
                YOUR ORDER
              </span>

              <h2>
                Your Basket
              </h2>

            </div>

            <button
              class="qrmenu__close-btn"
              @click="showCart = false"
              aria-label="Close cart"
            >
              ✕
            </button>

          </div>

          <!-- Cart body -->
          <div class="qrmenu__cart-body">

            <!-- Cart items -->
            <div
              v-for="line in cart"
              :key="line.fooditems_id"
              class="qrmenu__cart-item"
            >

              <!-- Item -->
              <div class="qrmenu__cart-item-info">

                <h3>
                  {{ line.name }}
                </h3>

                <span>
                  {{ fmt(line.price) }} each
                </span>

              </div>

              <!-- Quantity and subtotal -->
              <div class="qrmenu__cart-item-right">

                <div class="qrmenu__qty">

                  <button
                    type="button"
                    @click="removeItem(line.fooditems_id)"
                  >
                    −
                  </button>

                  <strong>
                    {{ line.quantity }}
                  </strong>

                  <button
                    type="button"
                    @click="addItem(line)"
                  >
                    +
                  </button>

                </div>

                <strong class="qrmenu__cart-price">
                  {{ fmt(line.price * line.quantity) }}
                </strong>

              </div>

            </div>

            <!-- =================================================
                 GUEST INFORMATION
            ================================================== -->
            <div
              v-if="config.require_name || config.require_phone"
              class="qrmenu__guest"
            >

              <div class="qrmenu__guest-title">

                <span>
                  DETAILS
                </span>

                <h3>
                  Before you order
                </h3>

              </div>

              <!-- Name -->
              <input
                v-if="config.require_name"
                v-model="guestName"
                class="qrmenu__input"
                placeholder="Your name"
                type="text"
                autocomplete="name"
              />

              <!-- Phone -->
              <input
                v-if="config.require_phone"
                v-model="guestPhone"
                class="qrmenu__input"
                placeholder="Phone number"
                type="tel"
                autocomplete="tel"
              />

            </div>

            <!-- Order error -->
            <p
              v-if="orderError"
              class="qrmenu__order-error"
            >
              {{ orderError }}
            </p>

          </div>

          <!-- =================================================
               CART FOOTER
          ================================================== -->
          <div class="qrmenu__cart-footer">

            <div class="qrmenu__total">

              <span>
                Total
              </span>

              <strong>
                {{ fmt(cartTotal) }}
              </strong>

            </div>

            <button
              class="qrmenu__place-btn"
              :disabled="placing || !cart.length"
              @click="placeOrder"
            >

              <span>
                {{
                  placing
                    ? 'Placing order...'
                    : 'Place Order'
                }}
              </span>

              <span v-if="!placing">
                →
              </span>

            </button>

          </div>

        </aside>

      </transition>

      <!-- =======================================================
           STICKY CART BUTTON
      ======================================================== -->
      <transition name="fab">

        <button
          v-if="cartCount && !showCart"
          class="qrmenu__fab"
          @click="showCart = true"
        >

          <span class="qrmenu__fab-left">

            <span class="qrmenu__fab-badge">
              {{ cartCount }}
            </span>

            <span>
              View Order
            </span>

          </span>

          <span class="qrmenu__fab-total">
            {{ fmt(cartTotal) }}
          </span>

        </button>

      </transition>

    </template>
  </div>
</template>


<script setup>
import {
  ref,
  computed,
  onMounted,
  onUnmounted
} from 'vue';

/*
|--------------------------------------------------------------------------
| Guest-facing page
|--------------------------------------------------------------------------
| No AdminLayout
*/
defineOptions({
  layout: null,
});


/*
|--------------------------------------------------------------------------
| Props
|--------------------------------------------------------------------------
*/

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
});


/*
|--------------------------------------------------------------------------
| State
|--------------------------------------------------------------------------
|
| loading
| menu
| confirmed
| error
|
*/

const state = ref('loading');

const errorMsg = ref('');

const sessionToken = ref('');

const menu = ref({
  categories: [],
  items: [],
});

const place = ref(null);

const tableInfo = ref(null);

const config = ref({
  accent_color: '#6366f1',
  require_name: false,
  require_phone: false,
});

const activeCat = ref(null);


/*
|--------------------------------------------------------------------------
| Cart
|--------------------------------------------------------------------------
*/

const cart = ref([]);

const showCart = ref(false);


/*
|--------------------------------------------------------------------------
| Guest information
|--------------------------------------------------------------------------
*/

const guestName = ref('');

const guestPhone = ref('');


/*
|--------------------------------------------------------------------------
| Order
|--------------------------------------------------------------------------
*/

const placing = ref(false);

const orderError = ref('');

const confirmOrder = ref(null);

const orderStatus = ref('');


/*
|--------------------------------------------------------------------------
| Status polling timer
|--------------------------------------------------------------------------
*/

let statusTimer = null;


/*
|--------------------------------------------------------------------------
| Boot / Load menu
|--------------------------------------------------------------------------
*/

onMounted(async () => {
  try {

    const res = await fetch(
      `/api/guest/qr/${props.slug}`,
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );

    if (!res.ok) {
      let data = {};

      try {
        data = await res.json();
      } catch (error) {
        // Ignore invalid JSON
      }

      throw new Error(
        data?.error ||
        'QR code not found.'
      );
    }

    const data = await res.json();

    sessionToken.value =
      data.session_token || '';

    place.value =
      data.place || null;

    tableInfo.value =
      data.table || null;

    menu.value =
      data.menu || {
        categories: [],
        items: [],
      };

    config.value = {
      ...config.value,
    };

    state.value = 'menu';

  } catch (error) {

    errorMsg.value =
      error?.message ||
      'Unable to load the menu.';

    state.value = 'error';
  }
});


/*
|--------------------------------------------------------------------------
| Cleanup
|--------------------------------------------------------------------------
*/

onUnmounted(() => {
  clearInterval(statusTimer);
});


/*
|--------------------------------------------------------------------------
| Reload page
|--------------------------------------------------------------------------
*/

const reloadPage = () => {
  window.location.reload();
};


/*
|--------------------------------------------------------------------------
| Filter menu items
|--------------------------------------------------------------------------
*/

const filteredItems = computed(() => {

  if (activeCat.value === null) {
    return menu.value.items;
  }

  return menu.value.items.filter(
    item => item.category_id === activeCat.value
  );
});


/*
|--------------------------------------------------------------------------
| Cart count
|--------------------------------------------------------------------------
*/

const cartCount = computed(() => {
  return cart.value.reduce(
    (total, item) =>
      total + Number(item.quantity || 0),
    0
  );
});


/*
|--------------------------------------------------------------------------
| Cart total
|--------------------------------------------------------------------------
*/

const cartTotal = computed(() => {
  return cart.value.reduce(
    (total, item) =>
      total +
      Number(item.price || 0) *
      Number(item.quantity || 0),
    0
  );
});


/*
|--------------------------------------------------------------------------
| Find item quantity in cart
|--------------------------------------------------------------------------
*/

const cartQty = (id) => {
  return (
    cart.value.find(
      line => line.fooditems_id === id
    )?.quantity ?? 0
  );
};


/*
|--------------------------------------------------------------------------
| Add item
|--------------------------------------------------------------------------
*/

const addItem = (item) => {

  const existing = cart.value.find(
    line =>
      line.fooditems_id === item.id
  );

  if (existing) {

    existing.quantity++;

  } else {

    cart.value.push({
      fooditems_id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      category_id: item.category_id,
    });

  }
};


/*
|--------------------------------------------------------------------------
| Remove item
|--------------------------------------------------------------------------
*/

const removeItem = (id) => {

  const line = cart.value.find(
    item =>
      item.fooditems_id === id
  );

  if (!line) {
    return;
  }

  if (line.quantity > 1) {

    line.quantity--;

  } else {

    cart.value =
      cart.value.filter(
        item =>
          item.fooditems_id !== id
      );

  }
};


/*
|--------------------------------------------------------------------------
| Place order
|--------------------------------------------------------------------------
*/

const placeOrder = async () => {

  orderError.value = '';

  placing.value = true;

  try {

    /*
    |--------------------------------------------------------------------------
    | 1. Save cart to guest session
    |--------------------------------------------------------------------------
    */

    const cartResponse = await fetch(
      '/api/guest/cart',
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json',

          Accept:
            'application/json',
        },

        body: JSON.stringify({

          session_token:
            sessionToken.value,

          cart:
            cart.value.map(line => ({
              fooditems_id:
                line.fooditems_id,

              quantity:
                line.quantity,
            })),

        }),
      }
    );

    /*
    |--------------------------------------------------------------------------
    | Check cart request
    |--------------------------------------------------------------------------
    */

    if (!cartResponse.ok) {

      let cartError = {};

      try {
        cartError =
          await cartResponse.json();
      } catch (error) {
        // Ignore invalid response
      }

      throw new Error(
        cartError?.error ||
        'Unable to save your cart.'
      );
    }


    /*
    |--------------------------------------------------------------------------
    | 2. Submit order
    |--------------------------------------------------------------------------
    */

    const res = await fetch(
      '/api/guest/order',
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json',

          Accept:
            'application/json',
        },

        body: JSON.stringify({

          session_token:
            sessionToken.value,

          order_type:
            'dining',

          guest_name:
            guestName.value ||
            undefined,

          guest_phone:
            guestPhone.value ||
            undefined,

        }),
      }
    );


    /*
    |--------------------------------------------------------------------------
    | Parse response
    |--------------------------------------------------------------------------
    */

    let data = {};

    try {
      data = await res.json();
    } catch (error) {
      data = {};
    }


    /*
    |--------------------------------------------------------------------------
    | Handle order error
    |--------------------------------------------------------------------------
    */

    if (!res.ok) {

      orderError.value =
        data.error ||
        'Could not place order. Please try again.';

      return;
    }


    /*
    |--------------------------------------------------------------------------
    | Success
    |--------------------------------------------------------------------------
    */

    confirmOrder.value = data;

    state.value = 'confirmed';

    cart.value = [];

    showCart.value = false;

    orderStatus.value = 'pending';


    /*
    |--------------------------------------------------------------------------
    | Poll order status
    |--------------------------------------------------------------------------
    */

    clearInterval(statusTimer);

    statusTimer = setInterval(
      async () => {

        try {

          const r = await fetch(
            `/api/guest/order/${data.order_id}/status`,
            {
              headers: {
                Accept:
                  'application/json',
              },
            }
          );

          if (!r.ok) {
            return;
          }

          const d =
            await r.json();

          orderStatus.value =
            d.status || orderStatus.value;


          /*
          |--------------------------------------------------------------------------
          | Stop polling when order is completed
          |--------------------------------------------------------------------------
          */

          if (
            [
              'completed',
              'ready',
              'cancelled',
            ].includes(
              orderStatus.value
            )
          ) {

            clearInterval(statusTimer);

          }

        } catch (error) {

          console.error(
            'Order status polling failed:',
            error
          );

        }

      },
      8000
    );

  } catch (error) {

    orderError.value =
      error?.message ||
      'Unable to place your order. Please try again.';

  } finally {

    placing.value = false;

  }
};


/*
|--------------------------------------------------------------------------
| Reset order
|--------------------------------------------------------------------------
*/

const resetOrder = () => {

  clearInterval(statusTimer);

  state.value = 'menu';

  confirmOrder.value = null;

  orderStatus.value = '';

  orderError.value = '';

  guestName.value = '';

  guestPhone.value = '';

};


/*
|--------------------------------------------------------------------------
| Currency formatter
|--------------------------------------------------------------------------
*/

const fmt = (value) => {

  return (
    'Rs ' +
    Number(value ?? 0).toLocaleString(
      'en-PK',
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }
    )
  );

};
</script>


<style scoped>
/* ============================================================
   ROOT
============================================================ */

.qrmenu {
  --surface: #ffffff;
  --surface-soft: #f8fafc;
  --border: #e5e7eb;

  --text: #111827;
  --text-soft: #6b7280;
  --text-muted: #94a3b8;

  min-height: 100vh;

  max-width: 640px;

  margin: 0 auto;

  background:
    radial-gradient(
      circle at top right,
      color-mix(
        in srgb,
        var(--accent) 10%,
        transparent
      ),
      transparent 32%
    ),
    #f8fafc;

  color: var(--text);

  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;

  position: relative;

  overflow-x: hidden;
}


/* ============================================================
   LOADING / ERROR
============================================================ */

.qrmenu__screen {
  min-height: 100vh;

  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;

  text-align: center;

  padding: 32px;
}

.qrmenu__screen h2 {
  margin: 22px 0 6px;

  font-size: 1.4rem;

  font-weight: 800;
}

.qrmenu__screen p {
  margin: 0;

  color: var(--text-soft);

  line-height: 1.5;
}

.qrmenu__loader {
  width: 72px;
  height: 72px;

  display: grid;

  place-items: center;

  border-radius: 24px;

  background: #fff;

  box-shadow:
    0 18px 50px
    rgba(15, 23, 42, 0.1);
}

.qrmenu__loader-ring {
  width: 34px;
  height: 34px;

  border: 4px solid #e5e7eb;

  border-top-color:
    var(--accent);

  border-radius: 50%;

  animation:
    qrmenu-spin 0.8s
    linear infinite;
}

.qrmenu__error-icon {
  width: 72px;
  height: 72px;

  display: grid;

  place-items: center;

  border-radius: 50%;

  background: #fee2e2;

  color: #dc2626;

  font-size: 2rem;

  font-weight: 900;
}

.qrmenu__primary-btn {
  border: 0;

  margin-top: 24px;

  min-height: 48px;

  padding:
    0 22px;

  border-radius: 14px;

  background:
    var(--accent);

  color: #fff;

  font-weight: 800;

  font-size: 0.95rem;

  cursor: pointer;

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.qrmenu__primary-btn:hover {
  transform: translateY(-1px);

  box-shadow:
    0 10px 25px
    color-mix(
      in srgb,
      var(--accent) 25%,
      transparent
    );
}


/* ============================================================
   HEADER
============================================================ */

.qrmenu__header {
  position: sticky;

  top: 0;

  z-index: 30;

  display: flex;

  align-items: center;

  justify-content: space-between;

  padding:
    18px
    18px
    16px;

  background:
    rgba(255, 255, 255, 0.9);

  backdrop-filter:
    blur(18px);

  -webkit-backdrop-filter:
    blur(18px);

  border-bottom:
    1px solid
    rgba(226, 232, 240, 0.8);
}

.qrmenu__brand {
  min-width: 0;

  display: flex;

  align-items: center;

  gap: 12px;
}

.qrmenu__brand-icon {
  width: 44px;
  height: 44px;

  flex-shrink: 0;

  display: grid;

  place-items: center;

  border-radius: 14px;

  background:
    var(--accent);

  color: #fff;

  font-size: 1rem;

  font-weight: 900;

  box-shadow:
    0 8px 22px
    color-mix(
      in srgb,
      var(--accent) 35%,
      transparent
    );
}

.qrmenu__brand-text {
  min-width: 0;
}

.qrmenu__eyebrow {
  font-size: 0.62rem;

  letter-spacing: 0.14em;

  font-weight: 900;

  color:
    var(--text-muted);
}

.qrmenu__title {
  max-width: 250px;

  margin:
    2px 0 0;

  font-size: 1rem;

  font-weight: 900;

  white-space: nowrap;

  overflow: hidden;

  text-overflow: ellipsis;
}

.qrmenu__table {
  display: flex;

  align-items: center;

  gap: 6px;

  margin: 4px 0 0;

  font-size: 0.72rem;

  color:
    var(--text-soft);

  font-weight: 600;
}

.qrmenu__table-dot {
  width: 6px;
  height: 6px;

  border-radius: 50%;

  background: #22c55e;
}

.qrmenu__header-cart {
  position: relative;

  width: 46px;
  height: 46px;

  flex-shrink: 0;

  border:
    1px solid
    var(--border);

  border-radius: 14px;

  background: #fff;

  cursor: pointer;

  box-shadow:
    0 6px 20px
    rgba(15, 23, 42, 0.06);
}

.qrmenu__cart-icon {
  font-size: 1.1rem;
}

.qrmenu__header-cart-count {
  position: absolute;

  top: -5px;

  right: -5px;

  min-width: 20px;

  height: 20px;

  padding:
    0 5px;

  display: grid;

  place-items: center;

  border-radius:
    999px;

  background:
    var(--accent);

  color: #fff;

  font-size:
    0.65rem;

  font-weight: 900;

  box-shadow:
    0 5px 12px
    rgba(0, 0, 0, 0.16);
}


/* ============================================================
   WELCOME
============================================================ */

.qrmenu__welcome {
  padding:
    28px
    18px
    18px;
}

.qrmenu__welcome-kicker,
.qrmenu__section-head > div > span,
.qrmenu__cart-label,
.qrmenu__guest-title span,
.qrmenu__confirmation-label {
  display: block;

  margin:
    0 0 6px;

  color:
    var(--accent);

  font-size:
    0.65rem;

  letter-spacing:
    0.15em;

  font-weight:
    900;
}

.qrmenu__welcome h2 {
  margin: 0;

  font-size: 1.7rem;

  line-height: 1.15;

  letter-spacing:
    -0.03em;

  font-weight: 900;
}

.qrmenu__welcome p:last-child {
  max-width: 420px;

  margin:
    9px 0 0;

  color:
    var(--text-soft);

  line-height:
    1.55;

  font-size:
    0.88rem;
}


/* ============================================================
   CATEGORIES
============================================================ */

.qrmenu__categories-wrap {
  position: sticky;

  top: 78px;

  z-index: 20;

  padding:
    10px 0;

  background:
    rgba(248, 250, 252, 0.92);

  backdrop-filter:
    blur(16px);

  -webkit-backdrop-filter:
    blur(16px);
}

.qrmenu__categories {
  display: flex;

  gap: 8px;

  overflow-x: auto;

  padding:
    0 18px;

  scrollbar-width: none;
}

.qrmenu__categories::-webkit-scrollbar {
  display: none;
}

.qrmenu__category {
  flex-shrink: 0;

  display: flex;

  align-items: center;

  gap: 6px;

  padding:
    10px 15px;

  border:
    1px solid
    var(--border);

  border-radius:
    999px;

  background: #fff;

  color:
    #475569;

  font-size:
    0.78rem;

  font-weight:
    800;

  cursor:
    pointer;

  transition:
    background 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.qrmenu__category:hover {
  transform:
    translateY(-1px);
}

.qrmenu__category.active {
  background:
    var(--accent);

  color: #fff;

  border-color:
    var(--accent);

  box-shadow:
    0 7px 18px
    color-mix(
      in srgb,
      var(--accent) 28%,
      transparent
    );
}


/* ============================================================
   CONTENT
============================================================ */

.qrmenu__content {
  padding:
    10px
    18px
    120px;
}

.qrmenu__section-head {
  display: flex;

  align-items: flex-end;

  justify-content: space-between;

  gap: 16px;

  margin:
    18px 0
    14px;
}

.qrmenu__section-head h2 {
  margin: 0;

  font-size:
    1.25rem;

  letter-spacing:
    -0.02em;

  font-weight:
    900;
}

.qrmenu__item-count {
  color:
    var(--text-muted);

  font-size:
    0.75rem;

  font-weight:
    700;
}


/* ============================================================
   FOOD GRID
============================================================ */

.qrmenu__grid {
  display: grid;

  gap: 12px;
}

.qrmenu__item {
  display: grid;

  grid-template-columns:
    104px
    1fr;

  gap: 13px;

  padding:
    10px;

  border:
    1px solid
    rgba(226, 232, 240, 0.9);

  border-radius:
    20px;

  background:
    rgba(255, 255, 255, 0.95);

  box-shadow:
    0 4px 16px
    rgba(15, 23, 42, 0.04);

  cursor:
    pointer;

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.qrmenu__item:hover {
  transform:
    translateY(-2px);

  border-color:
    color-mix(
      in srgb,
      var(--accent) 25%,
      #e2e8f0
    );

  box-shadow:
    0 12px 28px
    rgba(15, 23, 42, 0.08);
}

.qrmenu__item-image {
  position: relative;

  width: 104px;

  height: 104px;

  overflow: hidden;

  border-radius: 15px;

  background:
    linear-gradient(
      135deg,
      #f1f5f9,
      #e2e8f0
    );
}

.qrmenu__item-image img {
  width: 100%;

  height: 100%;

  display: block;

  object-fit: cover;

  transition:
    transform 0.35s ease;
}

.qrmenu__item:hover
.qrmenu__item-image img {
  transform:
    scale(1.05);
}

.qrmenu__item-placeholder {
  width: 100%;

  height: 100%;

  display: grid;

  place-items: center;

  font-size:
    2rem;
}

.qrmenu__item-quantity {
  position: absolute;

  top: 7px;

  right: 7px;

  min-width: 24px;

  height: 24px;

  display: grid;

  place-items: center;

  padding:
    0 6px;

  border-radius:
    999px;

  background:
    var(--accent);

  color: #fff;

  font-size:
    0.65rem;

  font-weight:
    900;

  box-shadow:
    0 5px 12px
    rgba(0, 0, 0, 0.18);
}

.qrmenu__item-content {
  min-width: 0;

  display: flex;

  flex-direction: column;

  padding:
    3px 3px 2px;
}

.qrmenu__item-top {
  display: flex;

  align-items:
    flex-start;

  justify-content:
    space-between;

  gap:
    8px;
}

.qrmenu__item-top h3 {
  margin: 0;

  font-size:
    0.95rem;

  line-height:
    1.25;

  font-weight:
    900;
}

.qrmenu__add-btn {
  width: 30px;

  height: 30px;

  flex-shrink: 0;

  display: grid;

  place-items: center;

  border: 0;

  border-radius:
    10px;

  background:
    color-mix(
      in srgb,
      var(--accent) 10%,
      #fff
    );

  color:
    var(--accent);

  font-size:
    1.25rem;

  line-height:
    1;

  cursor:
    pointer;
}

.qrmenu__item-description {
  display:
    -webkit-box;

  margin:
    7px 0 0;

  color:
    var(--text-soft);

  font-size:
    0.75rem;

  line-height:
    1.45;

  -webkit-line-clamp:
    2;

  -webkit-box-orient:
    vertical;

  overflow:
    hidden;
}

.qrmenu__item-footer {
  display:
    flex;

  align-items:
    center;

  justify-content:
    space-between;

  gap:
    10px;

  margin-top:
    auto;

  padding-top:
    10px;
}

.qrmenu__item-price {
  color:
    var(--accent);

  font-size:
    0.9rem;

  font-weight:
    900;
}

.qrmenu__item-action {
  color:
    var(--text-muted);

  font-size:
    0.65rem;

  font-weight:
    800;
}


/* ============================================================
   EMPTY
============================================================ */

.qrmenu__empty {
  padding:
    70px 20px;

  text-align:
    center;
}

.qrmenu__empty-icon {
  width: 64px;

  height: 64px;

  margin:
    0 auto
    15px;

  display:
    grid;

  place-items:
    center;

  border-radius:
    18px;

  background:
    #fff;

  box-shadow:
    0 10px 25px
    rgba(15, 23, 42, 0.07);

  font-size:
    1.7rem;
}

.qrmenu__empty h3 {
  margin:
    0;

  font-size:
    1rem;
}

.qrmenu__empty p {
  margin:
    6px 0 0;

  color:
    var(--text-soft);

  font-size:
    0.82rem;
}


/* ============================================================
   CART BACKDROP
============================================================ */

.qrmenu__backdrop {
  position: fixed;

  inset: 0;

  z-index:
    45;

  background:
    rgba(15, 23, 42, 0.42);

  backdrop-filter:
    blur(4px);

  -webkit-backdrop-filter:
    blur(4px);
}


/* ============================================================
   CART
============================================================ */

.qrmenu__cart {
  position: fixed;

  left: 50%;

  bottom: 0;

  z-index:
    50;

  width:
    min(640px, 100vw);

  max-height:
    min(760px, 90vh);

  display:
    flex;

  flex-direction:
    column;

  transform:
    translateX(-50%);

  background:
    #fff;

  border-radius:
    28px 28px 0 0;

  box-shadow:
    0 -20px
    50px
    rgba(15, 23, 42, 0.18);

  overflow:
    hidden;
}

.qrmenu__cart-header {
  display:
    flex;

  align-items:
    center;

  justify-content:
    space-between;

  padding:
    20px;

  border-bottom:
    1px solid
    #eef2f7;
}

.qrmenu__cart-header h2 {
  margin:
    0;

  font-size:
    1.15rem;

  font-weight:
    900;
}

.qrmenu__close-btn {
  width:
    40px;

  height:
    40px;

  border:
    0;

  border-radius:
    12px;

  background:
    #f8fafc;

  color:
    #475569;

  cursor:
    pointer;
}

.qrmenu__cart-body {
  overflow-y:
    auto;

  padding:
    8px
    20px
    130px;
}

.qrmenu__cart-item {
  display:
    flex;

  justify-content:
    space-between;

  gap:
    16px;

  padding:
    15px 0;

  border-bottom:
    1px solid
    #f1f5f9;
}

.qrmenu__cart-item-info {
  min-width:
    0;
}

.qrmenu__cart-item-info h3 {
  margin:
    0;

  font-size:
    0.9rem;

  font-weight:
    800;
}

.qrmenu__cart-item-info span {
  display:
    block;

  margin-top:
    5px;

  color:
    var(--text-muted);

  font-size:
    0.7rem;
}

.qrmenu__cart-item-right {
  display:
    flex;

  flex-direction:
    column;

  align-items:
    flex-end;

  gap:
    8px;
}

.qrmenu__qty {
  display:
    flex;

  align-items:
    center;

  gap:
    8px;
}

.qrmenu__qty button {
  width:
    30px;

  height:
    30px;

  border:
    1px solid
    var(--border);

  border-radius:
    9px;

  background:
    #fff;

  font-size:
    1rem;

  cursor:
    pointer;
}

.qrmenu__qty strong {
  width:
    20px;

  text-align:
    center;

  font-size:
    0.82rem;
}

.qrmenu__cart-price {
  color:
    var(--accent);

  font-size:
    0.85rem;
}

.qrmenu__guest {
  margin-top:
    20px;

  padding:
    16px;

  border-radius:
    18px;

  background:
    #f8fafc;
}

.qrmenu__guest-title h3 {
  margin:
    0 0 12px;

  font-size:
    0.92rem;

  font-weight:
    900;
}

.qrmenu__input {
  width:
    100%;

  margin-top:
    8px;

  padding:
    12px 13px;

  border:
    1px solid
    #e2e8f0;

  border-radius:
    12px;

  background:
    #fff;

  color:
    var(--text);

  outline:
    none;

  font-size:
    0.85rem;

  box-sizing:
    border-box;
}

.qrmenu__input:focus {
  border-color:
    var(--accent);

  box-shadow:
    0 0 0 3px
    color-mix(
      in srgb,
      var(--accent) 12%,
      transparent
    );
}

.qrmenu__order-error {
  margin:
    15px 0 0;

  padding:
    12px 14px;

  border-radius:
    12px;

  background:
    #fef2f2;

  color:
    #b91c1c;

  font-size:
    0.78rem;
}

.qrmenu__cart-footer {
  position:
    absolute;

  left:
    0;

  right:
    0;

  bottom:
    0;

  padding:
    15px 20px;

  display:
    grid;

  grid-template-columns:
    1fr
    1.4fr;

  align-items:
    center;

  gap:
    12px;

  background:
    rgba(255, 255, 255, 0.96);

  backdrop-filter:
    blur(15px);

  border-top:
    1px solid
    #eef2f7;
}

.qrmenu__total span {
  display:
    block;

  margin-bottom:
    3px;

  color:
    var(--text-soft);

  font-size:
    0.68rem;

  font-weight:
    700;
}

.qrmenu__total strong {
  font-size:
    1.05rem;

  font-weight:
    900;
}

.qrmenu__place-btn {
  min-height:
    52px;

  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  gap:
    10px;

  border:
    0;

  border-radius:
    15px;

  background:
    var(--accent);

  color:
    #fff;

  font-size:
    0.9rem;

  font-weight:
    900;

  cursor:
    pointer;

  box-shadow:
    0 10px
    22px
    color-mix(
      in srgb,
      var(--accent) 25%,
      transparent
    );
}

.qrmenu__place-btn:disabled {
  cursor:
    not-allowed;

  opacity:
    0.55;
}


/* ============================================================
   STICKY CART FAB
============================================================ */

.qrmenu__fab {
  position:
    fixed;

  left:
    50%;

  bottom:
    16px;

  z-index:
    40;

  width:
    min(
      590px,
      calc(100vw - 24px)
    );

  min-height:
    58px;

  transform:
    translateX(-50%);

  display:
    flex;

  align-items:
    center;

  justify-content:
    space-between;

  padding:
    7px
    8px
    7px
    10px;

  border:
    0;

  border-radius:
    18px;

  background:
    #111827;

  color:
    #fff;

  box-shadow:
    0 16px
    40px
    rgba(15, 23, 42, 0.28);

  cursor:
    pointer;
}

.qrmenu__fab-left {
  display:
    flex;

  align-items:
    center;

  gap:
    9px;

  font-size:
    0.84rem;

  font-weight:
    800;
}

.qrmenu__fab-badge {
  width:
    35px;

  height:
    35px;

  display:
    grid;

  place-items:
    center;

  border-radius:
    11px;

  background:
    var(--accent);

  font-size:
    0.75rem;

  font-weight:
    900;
}

.qrmenu__fab-total {
  padding:
    9px 12px;

  border-radius:
    12px;

  background:
    rgba(255, 255, 255, 0.08);

  font-size:
    0.82rem;

  font-weight:
    900;
}


/* ============================================================
   CONFIRMATION
============================================================ */

.qrmenu__confirmation {
  min-height:
    100vh;

  display:
    flex;

  flex-direction:
    column;

  align-items:
    center;

  padding:
    70px
    24px
    40px;

  background:
    radial-gradient(
      circle at 50% 0%,
      color-mix(
        in srgb,
        var(--accent) 14%,
        transparent
      ),
      transparent 32%
    ),
    #f8fafc;

  text-align:
    center;
}

.qrmenu__success-circle {
  width:
    84px;

  height:
    84px;

  display:
    grid;

  place-items:
    center;

  border-radius:
    50%;

  background:
    var(--accent);

  color:
    #fff;

  box-shadow:
    0 15px
    35px
    color-mix(
      in srgb,
      var(--accent) 28%,
      transparent
    );
}

.qrmenu__success-circle span {
  font-size:
    2.3rem;

  font-weight:
    900;
}

.qrmenu__confirmation h1 {
  margin:
    8px 0 0;

  font-size:
    2rem;

  letter-spacing:
    -0.04em;

  font-weight:
    900;
}

.qrmenu__confirmation-subtitle {
  max-width:
    360px;

  margin:
    8px auto 0;

  color:
    var(--text-soft);

  font-size:
    0.9rem;

  line-height:
    1.5;
}

.qrmenu__order-card {
  width:
    100%;

  max-width:
    420px;

  margin-top:
    28px;

  padding:
    18px;

  border:
    1px solid
    #e2e8f0;

  border-radius:
    20px;

  background:
    #fff;

  box-shadow:
    0 12px
    30px
    rgba(15, 23, 42, 0.06);

  box-sizing:
    border-box;
}

.qrmenu__order-card-row {
  display:
    flex;

  align-items:
    center;

  justify-content:
    space-between;

  gap:
    16px;
}

.qrmenu__order-card-row span {
  color:
    var(--text-soft);

  font-size:
    0.78rem;
}

.qrmenu__order-card-row strong {
  color:
    var(--accent);

  font-size:
    0.95rem;

  font-weight:
    900;
}

.qrmenu__order-card-divider {
  height:
    1px;

  margin:
    14px 0;

  background:
    #eef2f7;
}

.qrmenu__status-card {
  width:
    100%;

  max-width:
    420px;

  display:
    flex;

  align-items:
    center;

  gap:
    10px;

  margin-top:
    12px;

  padding:
    13px 15px;

  border-radius:
    16px;

  background:
    #fff;

  border:
    1px solid
    #e2e8f0;

  text-align:
    left;

  box-sizing:
    border-box;
}

.qrmenu__status-dot {
  width:
    9px;

  height:
    9px;

  flex-shrink:
    0;

  border-radius:
    50%;

  background:
    #f59e0b;

  box-shadow:
    0 0 0 5px
    #fef3c7;
}

.qrmenu__status-card small {
  display:
    block;

  color:
    var(--text-muted);

  font-size:
    0.6rem;

  font-weight:
    900;

  letter-spacing:
    0.12em;
}

.qrmenu__status-card strong {
  display:
    block;

  margin-top:
    3px;

  color:
    var(--accent);

  font-size:
    0.82rem;

  text-transform:
    capitalize;
}

.qrmenu__confirmation-message {
  max-width:
    390px;

  margin:
    20px 0 0;

  color:
    var(--text-soft);

  font-size:
    0.82rem;

  line-height:
    1.55;
}

.qrmenu__primary-btn--large {
  width:
    min(
      420px,
      100%
    );

  min-height:
    52px;

  margin-top:
    26px;
}


/* ============================================================
   ANIMATIONS
============================================================ */

@keyframes qrmenu-spin {
  to {
    transform:
      rotate(360deg);
  }
}


/* ============================================================
   BACKDROP TRANSITION
============================================================ */

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity:
    0;
}


/* ============================================================
   CART TRANSITION
============================================================ */

.cart-enter-active,
.cart-leave-active {
  transition:
    transform 0.3s ease,
    opacity 0.25s ease;
}

.cart-enter-from,
.cart-leave-to {
  transform:
    translate(-50%, 100%);

  opacity:
    0;
}


/* ============================================================
   FAB TRANSITION
============================================================ */

.fab-enter-active,
.fab-leave-active {
  transition:
    transform 0.25s ease,
    opacity 0.2s ease;
}

.fab-enter-from,
.fab-leave-to {
  transform:
    translate(-50%, 30px);

  opacity:
    0;
}


/* ============================================================
   MOBILE
============================================================ */

@media (max-width: 480px) {

  .qrmenu__header {
    padding:
      15px;
  }

  .qrmenu__welcome {
    padding:
      24px
      15px
      15px;
  }

  .qrmenu__welcome h2 {
    font-size:
      1.5rem;
  }

  .qrmenu__categories {
    padding:
      0 15px;
  }

  .qrmenu__content {
    padding-left:
      15px;

    padding-right:
      15px;
  }

  .qrmenu__item {
    grid-template-columns:
      92px
      1fr;
  }

  .qrmenu__item-image {
    width:
      92px;

    height:
      96px;
  }

  .qrmenu__item-action {
    display:
      none;
  }

  .qrmenu__cart {
    max-height:
      94vh;

    border-radius:
      24px 24px 0 0;
  }

  .qrmenu__cart-footer {
    grid-template-columns:
      1fr
      1.3fr;
  }

  .qrmenu__confirmation {
    padding-top:
      55px;
  }
}


/* ============================================================
   VERY SMALL DEVICES
============================================================ */

@media (max-width: 360px) {

  .qrmenu__item {
    grid-template-columns:
      82px
      1fr;
  }

  .qrmenu__item-image {
    width:
      82px;

    height:
      90px;
  }

  .qrmenu__item-top h3 {
    font-size:
      0.86rem;
  }

  .qrmenu__item-description {
    font-size:
      0.7rem;
  }

  .qrmenu__item-price {
    font-size:
      0.82rem;
  }

  .qrmenu__fab {
    width:
      calc(100vw - 16px);
  }
}
</style>
