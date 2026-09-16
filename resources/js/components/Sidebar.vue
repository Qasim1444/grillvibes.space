<template>
  <aside class="sidebar" :class="{ 'sidebar--collapsed': state.collapsed, 'sidebar--mobile-open': state.mobileOpen }">
    <div class="sidebar__brand">
      <div class="sidebar__logo">J</div>
      <span class="sidebar__brand-name">GrillVibes Admin</span>
    </div>

    <nav class="sidebar__nav">
      <template v-for="group in visibleGroups" :key="group.title">
        <div class="sidebar__group-title">{{ group.title }}</div>
        <Link
          v-for="item in group.items"
          :key="item.to"
          :href="item.to"
          class="sidebar__link"
          :class="{ 'sidebar__link--active': isActive(item.to, item.exact) }"
          @click="closeMobile"
        >
          <span class="sidebar__icon" v-html="item.icon" />
          <span class="sidebar__label">{{ item.label }}</span>
        </Link>
      </template>
    </nav>
  </aside>

  <div v-if="state.mobileOpen" class="sidebar__backdrop" @click="closeMobile" />
</template>

<script setup>
import { computed } from "vue";
import { Link, usePage } from "@inertiajs/vue3";
import { useSidebar } from "../composables/useSidebar";
import { usePermissions } from "../composables/usePermissions";

const page = usePage();
const { state, closeMobile } = useSidebar();
const { can } = usePermissions();

// Active link detection from the current Inertia URL (Inertia's <Link>
// doesn't emit a router-link-active class the way vue-router did).
const currentPath = computed(() => page.url.split("?")[0]);
const isActive = (to, exact = false) =>
  exact
    ? currentPath.value === to
    : currentPath.value === to || currentPath.value.startsWith(to + "/");

// Inline SVG icons keep the bundle dependency-free.
const icon = {
  dashboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>`,
  category: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/></svg>`,
  food: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h0a2 2 0 0 0 2-2V2M5 2v20M17 2c-1.7 0-3 2-3 5s1.3 5 3 5v10"/></svg>`,
  place: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
  box: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8 12 3 3 8l9 5 9-5Z"/><path d="M3 8v8l9 5 9-5V8"/></svg>`,
  tag: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.6 13.4 12 22l-9-9V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z"/><circle cx="7.5" cy="7.5" r="1.5"/></svg>`,
  users: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></svg>`,
  customer: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>`,
  settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>`,
  key: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.5" cy="15.5" r="4.5"/><path d="m10.6 12.4 8.4-8.4M15 5l3 3M18 2l3 3"/></svg>`,
  cart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.4 11.2a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.6L21 7H6"/></svg>`,
  receipt: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 2v20l2.5-1.5L10 22l2-1.5L14 22l2.5-1.5L19 22V2H5Z"/><path d="M9 7h6M9 11h6M9 15h4"/></svg>`,
  shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></svg>`,
  badge: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18"/></svg>`,
  calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>`,
  plane: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5a2.1 2.1 0 0 0-3-3L13 8 4.8 6.2a.5.5 0 0 0-.5.8l3.2 3.9-2 2-1.9-.5a.5.5 0 0 0-.5.8L5 15.5 6.5 18l1.3-2.1a.5.5 0 0 0-.4-.8l-.5-.1 2-2 3.9 3.2a.5.5 0 0 0 .8-.5Z"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`,
  wallet: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v2"/><path d="M3 7v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8H6a3 3 0 0 1-3-3Z"/><circle cx="16" cy="14" r="1"/></svg>`,
  money: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/></svg>`,
  star: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3 2.7 5.5 6.3.9-4.5 4.4 1 6.2-5.5-2.9-5.5 2.9 1-6.2L3 9.4l6.3-.9Z"/></svg>`,
  ticket: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9V7a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v2a3 3 0 0 0 0 6v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2a3 3 0 0 0 0-6Z"/><path d="M14 6v12"/></svg>`,
  percent: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 5 5 19"/><circle cx="7.5" cy="7.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/></svg>`,
  chat: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-8 8H7l-4 3V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8Z"/></svg>`,
  monitor: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>`,
  layout: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>`,
  qrcode: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/><path d="M14 18h3v3"/></svg>`,
  kiosk: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 6h6M9 10h6M9 14h2M15 14h2M9 18h6"/></svg>`,
  flask: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v7.3L6 15a2 2 0 0 0 1.7 2.9h8.6a2 2 0 0 0 1.7-2.9l-4-5.7V2"/><path d="M8.5 2h7M7 2h10"/></svg>`,
  chart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>`,
  clipboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>`,
  truck: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17h2v-5H3v5zM7 17h10v-9H7v9zM5 12h4v5H5v-5zM19 12h2v5h-2v-5z"/><circle cx="17" cy="17" r="2"/><circle cx="7" cy="17" r="2"/></svg>`,
  warehouse: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M3 7v14M21 7v14M6 21V10M18 21V10M9 21v-4h6v4"/></svg>`,
  undo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M3 13a9 9 0 1 0 3-7.7L3 8"/></svg>`,
  wrench: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.1 2.1-2.8-.7-.7-2.8 2.1-2.1Z"/></svg>`,
};

// `permission` is the key each item requires; items and whole groups whose
// items are all hidden drop out of `visibleGroups`. Route middleware enforces
// the same keys server-side — this only trims the menu.
const groups = [
  {
    title: "Overview",
    items: [{ to: "/dashboard", label: "Dashboard", icon: icon.dashboard, permission: "dashboard.view" }],
  },
  {
    title: "Orders",
    items: [
      { to: "/pos", label: "POS / New Order", icon: icon.cart, permission: "pos.view" },
      { to: "/orders", label: "Orders", icon: icon.receipt, permission: "orders.view" },
    ],
  },
  {
    title: "Restaurant",
    items: [
      { to: "/food-categories", label: "Food Categories", icon: icon.category, permission: "food-categories.view" },
      { to: "/food-items", label: "Food Items", icon: icon.food, permission: "food-items.view" },
      { to: "/places", label: "Places", icon: icon.place, permission: "places.view" },
    ],
  },
  {
    title: "Content",
    items: [

        { to: "/admin/blog", label: "Blog Posts", icon: icon.clipboard, permission: "blog.view" },
    ],
  },
  {
    title: "Inventory",
    items: [
      { to: "/inventory/ingredients", label: "Ingredients",   icon: icon.box,       permission: "inventory.ingredients.view" },
      { to: "/inventory/stock",       label: "Stock on Hand", icon: icon.warehouse, permission: "inventory.stock.view" },
      { to: "/inventory/recipes",     label: "Recipes",       icon: icon.flask,     permission: "inventory.recipes.view" },
      // The report the whole module exists to produce, so it sits with it.
      { to: "/reports/food-cost",     label: "Food Cost",     icon: icon.chart,     permission: "reports.food-cost.view" },
    ],
  },
  {
    title: "Procurement",
    items: [
      { to: "/procurement/vendors",         label: "Vendors",         icon: icon.truck,     permission: "procurement.vendors.view" },
      { to: "/procurement/purchase-orders", label: "Purchase Orders", icon: icon.clipboard, permission: "procurement.purchase-orders.view" },
      { to: "/procurement/goods-receipts",  label: "Goods Receipts",  icon: icon.receipt,   permission: "procurement.goods-receipts.view" },
    ],
  },
  {
    title: "Finance",
    items: [
      { to: "/finance/expenses",   label: "Expenses",    icon: icon.money,  permission: "expenses.view" },
      { to: "/finance/vouchers",   label: "Vouchers",    icon: icon.receipt, permission: "vouchers.view" },
      { to: "/finance/petty-cash", label: "Petty Cash",  icon: icon.wallet, permission: "petty-cash.view" },
    ],
  },
  {
    title: "KDS",
    items: [
      { to: "/kds/stations", label: "KDS Stations", icon: icon.monitor, permission: "kds.stations.view" },
      { to: "/kds/board",    label: "KDS Board",    icon: icon.layout,  permission: "kds.board.view" },
    ],
  },
  {
    title: "Reservations",
    items: [
      { to: "/reservations",            label: "Reservations",     icon: icon.calendar, permission: "reservations.view", exact: true },
      { to: "/reservations/floor-plan", label: "Floor Plan",      icon: icon.layout,   permission: "reservations.view" },
    ],
  },
  {
    title: "Maintenance",
    items: [
      { to: "/maintenance/assets", label: "Assets",           icon: icon.box,    permission: "maintenance.assets.view" },
      { to: "/maintenance/logs",   label: "Maintenance Logs", icon: icon.wrench, permission: "maintenance.logs.view" },
    ],
  },
  {
    title: "QR",
    items: [
      { to: "/qr-codes",     label: "QR Codes",     icon: icon.qrcode, permission: "qr.view" },
    ],
  },
  {
    title: "HR",
    items: [
      { to: "/hr/employees", label: "Employees", icon: icon.badge, permission: "hr.employees.view" },
      { to: "/hr/designations", label: "Designations", icon: icon.tag, permission: "hr.designations.view" },
      { to: "/hr/attendance", label: "Attendance", icon: icon.calendar, permission: "hr.attendance.view" },
      { to: "/hr/leaves", label: "Leaves", icon: icon.plane, permission: "hr.leaves.view" },
      { to: "/hr/overtime", label: "Overtime", icon: icon.clock, permission: "hr.overtime.view" },
      { to: "/hr/loans", label: "Loans & Advances", icon: icon.wallet, permission: "hr.loans.view" },
      { to: "/hr/payroll", label: "Payroll", icon: icon.money, permission: "hr.payroll.view" },
    ],
  },
  {
    title: "CRM",
    items: [
      { to: "/crm/loyalty", label: "Loyalty Points", icon: icon.star, permission: "crm.loyalty.view" },
      { to: "/crm/promo-codes", label: "Promo Codes", icon: icon.ticket, permission: "crm.promo-codes.view" },
      { to: "/crm/discounts", label: "Discounts", icon: icon.percent, permission: "crm.discounts.view" },
      { to: "/crm/feedback", label: "Feedback", icon: icon.chat, permission: "crm.feedback.view" },
    ],
  },
  {
    title: "People",
    items: [
      { to: "/users", label: "Users", icon: icon.users, permission: "users.view" },
      { to: "/customers", label: "Customers", icon: icon.customer, permission: "customers.view" },
      { to: "/roles", label: "Roles & Permissions", icon: icon.shield, permission: "roles.view" },
    ],
  },
  {
    title: "Account",
    items: [
      // Always available — every signed-in user manages their own account.
      { to: "/profile", label: "Profile", icon: icon.user },
      { to: "/settings", label: "Settings", icon: icon.settings, permission: "settings.view" },
      { to: "/change-password", label: "Change Password", icon: icon.key },
    ],
  },
];

const visibleGroups = computed(() =>
  groups
    .map((group) => ({ ...group, items: group.items.filter((item) => can(item.permission)) }))
    .filter((group) => group.items.length > 0)
);
</script>

<style scoped>
.sidebar {
  width: var(--sidebar-w);
  background: var(--sidebar-bg);
  color: var(--sidebar-text);
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  z-index: 40;
  transition: width 0.2s ease, transform 0.25s ease;
  overflow: hidden;
}

.sidebar--collapsed {
  width: var(--sidebar-w-collapsed);
}

.sidebar__brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
  height: var(--topbar-h);
  flex-shrink: 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.sidebar__logo {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  background: var(--brand);
  color: #fff;
  font-weight: 800;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sidebar__brand-name {
  font-weight: 700;
  font-size: 1.05rem;
  color: #fff;
  white-space: nowrap;
}

.sidebar__nav {
  flex: 1;
  overflow-y: auto;
  padding: 14px 12px 24px;
}

.sidebar__nav::-webkit-scrollbar {
  width: 6px;
}
.sidebar__nav::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.sidebar__group-title {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--sidebar-text-muted);
  font-weight: 700;
  padding: 16px 12px 6px;
  white-space: nowrap;
}

.sidebar__link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  color: var(--sidebar-text);
  font-weight: 500;
  font-size: 0.9rem;
  margin-bottom: 2px;
  transition: background 0.15s ease, color 0.15s ease;
  white-space: nowrap;
}

.sidebar__link:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
}

.sidebar__link--active {
  background: var(--sidebar-active);
  color: #fff;
  box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4);
}

.sidebar__icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  display: inline-flex;
}
.sidebar__icon :deep(svg) {
  width: 20px;
  height: 20px;
}

/* Collapsed (desktop, icons only) */
.sidebar--collapsed .sidebar__brand-name,
.sidebar--collapsed .sidebar__label,
.sidebar--collapsed .sidebar__group-title {
  display: none;
}
.sidebar--collapsed .sidebar__link {
  justify-content: center;
}
.sidebar--collapsed .sidebar__brand {
  justify-content: center;
  padding: 0;
}

.sidebar__backdrop {
  display: none;
}

/* Mobile: off-canvas drawer */
@media (max-width: 900px) {
  .sidebar {
    transform: translateX(-100%);
    width: var(--sidebar-w);
  }
  .sidebar--mobile-open {
    transform: translateX(0);
  }
  .sidebar--collapsed {
    width: var(--sidebar-w);
  }
  .sidebar--collapsed .sidebar__brand-name,
  .sidebar--collapsed .sidebar__label,
  .sidebar--collapsed .sidebar__group-title {
    display: block;
  }
  .sidebar--collapsed .sidebar__link {
    justify-content: flex-start;
  }
  .sidebar__backdrop {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.45);
    z-index: 39;
  }
}
</style>
