<template>
  <header class="topbar">
    <div class="topbar__left">
      <button class="topbar__toggle" type="button" aria-label="Toggle menu" @click="onToggle">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>
      <h1 class="topbar__title">{{ pageTitle }}</h1>
    </div>

    <div class="topbar__right">
      <!-- Outlet switcher — scopes the UI to a single branch (session-backed). -->
      <div v-if="branches.length" class="topbar__branch" ref="branchMenuRef">
        <button class="topbar__branch-btn" type="button" @click="branchMenuOpen = !branchMenuOpen">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 21h18M6 21V8l6-4 6 4v13M10 21v-5h4v5" />
          </svg>
          <span class="topbar__branch-name">{{ currentBranchName }}</span>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        <Transition name="menu-fade">
          <div v-if="branchMenuOpen" class="topbar__menu topbar__menu--branch">
            <button
              v-for="b in branches"
              :key="b.id"
              class="topbar__menu-item topbar__branch-item"
              :class="{ 'topbar__branch-item--active': b.id === currentBranchId }"
              type="button"
              @click="switchBranch(b.id)"
            >
              <span>{{ b.name }}</span>
              <svg v-if="b.id === currentBranchId" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
            </button>
          </div>
        </Transition>
      </div>

      <div class="topbar__user" ref="menuRef">
        <button class="topbar__user-btn" type="button" @click="menuOpen = !menuOpen">
          <span class="topbar__avatar">{{ initials }}</span>
          <span class="topbar__user-name">{{ user.name }}</span>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        <Transition name="menu-fade">
          <div v-if="menuOpen" class="topbar__menu">
            <Link href="/profile" class="topbar__menu-item" @click="menuOpen = false">Profile</Link>
            <Link href="/change-password" class="topbar__menu-item" @click="menuOpen = false">Change Password</Link>
            <div class="topbar__menu-divider" />
            <button class="topbar__menu-item topbar__menu-item--danger" @click="logout">Logout</button>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { Link, router, usePage } from "@inertiajs/vue3";
import { useSidebar } from "../composables/useSidebar";

const page = usePage();
const { toggleCollapse, toggleMobile } = useSidebar();

// User comes from Inertia shared props (HandleInertiaRequests::share).
const user = computed(() => page.props.auth?.user ?? { name: "User" });
const menuOpen = ref(false);
const menuRef = ref(null);

// Outlet switcher — `branches` + `auth.branch` are shared globally.
const branches = computed(() => page.props.branches ?? []);
const currentBranch = computed(() => page.props.auth?.branch ?? null);
const currentBranchId = computed(() => currentBranch.value?.id ?? null);
const currentBranchName = computed(() => currentBranch.value?.name ?? "Select Outlet");
const branchMenuOpen = ref(false);
const branchMenuRef = ref(null);

const switchBranch = (id) => {
  branchMenuOpen.value = false;
  if (id === currentBranchId.value) return;
  router.post("/branches/switch", { branch_id: id }, { preserveScroll: true });
};

const initials = computed(() => {
  const n = user.value.name || "";
  return n.trim().slice(0, 2).toUpperCase() || "?";
});

// Map the current route to a readable page title.
const titles = {
  "/dashboard": "Dashboard",
  "/pos": "POS / New Order",
  "/orders": "Orders",
  "/users": "Users",
  "/customers": "Customers",
  "/food-categories": "Food Categories",
  "/food-items": "Food Items",
  "/places": "Places",
  "/kds/stations": "KDS Stations",
  "/kds/board": "KDS Board",
  "/reservations": "Reservations",
  "/reservations/floor-plan": "Floor Plan",
  "/maintenance/assets": "Assets",
  "/maintenance/logs": "Maintenance Logs",
  "/finance/expenses": "Expenses",
  "/finance/petty-cash": "Petty Cash",
  "/qr-codes": "QR Codes",
  "/profile": "Profile",
  "/settings": "Settings",
  "/change-password": "Change Password",
};
const pageTitle = computed(() => titles[page.url.split("?")[0]] || "Admin");

const onToggle = () => {
  if (window.innerWidth <= 900) toggleMobile();
  else toggleCollapse();
};

const logout = () => {
  router.post("/logout");
};

const onClickOutside = (e) => {
  if (menuRef.value && !menuRef.value.contains(e.target)) menuOpen.value = false;
  if (branchMenuRef.value && !branchMenuRef.value.contains(e.target)) branchMenuOpen.value = false;
};

onMounted(() => {
  document.addEventListener("click", onClickOutside);
});
onBeforeUnmount(() => document.removeEventListener("click", onClickOutside));
</script>

<style scoped>
.topbar {
  height: var(--topbar-h);
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 30;
}

.topbar__left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.topbar__toggle {
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-muted);
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s ease;
}
.topbar__toggle:hover {
  background: var(--surface-2);
}

.topbar__title {
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0;
}

.topbar__user {
  position: relative;
}

.topbar__right {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Outlet switcher */
.topbar__branch {
  position: relative;
}

.topbar__branch-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--border);
  background: var(--surface);
  border-radius: 999px;
  padding: 6px 12px;
  cursor: pointer;
  color: var(--text);
  font-family: inherit;
  transition: background 0.15s ease;
}
.topbar__branch-btn:hover {
  background: var(--surface-2);
}
.topbar__branch-btn svg:first-child {
  color: var(--brand);
}

.topbar__branch-name {
  font-weight: 600;
  font-size: 0.85rem;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.topbar__menu--branch {
  left: 0;
  right: auto;
  max-height: 320px;
  overflow-y: auto;
}

.topbar__branch-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.topbar__branch-item--active {
  color: var(--brand);
  font-weight: 600;
}

.topbar__user-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid var(--border);
  background: var(--surface);
  border-radius: 999px;
  padding: 5px 12px 5px 5px;
  cursor: pointer;
  color: var(--text);
  transition: background 0.15s ease;
}
.topbar__user-btn:hover {
  background: var(--surface-2);
}

.topbar__avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--brand);
  color: #fff;
  font-weight: 700;
  font-size: 0.78rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.topbar__user-name {
  font-weight: 600;
  font-size: 0.88rem;
}

.topbar__menu {
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  min-width: 190px;
  padding: 6px;
  z-index: 50;
}

.topbar__menu-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 9px 12px;
  border-radius: 8px;
  font-size: 0.875rem;
  color: var(--text);
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: inherit;
}
.topbar__menu-item:hover {
  background: var(--surface-2);
}
.topbar__menu-item--danger {
  color: var(--danger);
}

.topbar__menu-divider {
  height: 1px;
  background: var(--border);
  margin: 6px 0;
}

.menu-fade-enter-active,
.menu-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (max-width: 640px) {
  .topbar__user-name {
    display: none;
  }
  .topbar__branch-name {
    max-width: 90px;
  }
}

@media (max-width: 640px) {
  .topbar { height: auto; min-height: var(--topbar-h); padding: 10px 12px; gap: 8px; flex-wrap: wrap; }
  .topbar__left { flex: 1 1 150px; min-width: 0; gap: 8px; }
  .topbar__title { font-size: 1rem; overflow-wrap: anywhere; }
  .topbar__toggle { flex-shrink: 0; width: 44px; height: 44px; }
  .topbar__right { gap: 6px; margin-left: auto; }
  .topbar__branch-btn, .topbar__user-btn { min-height: 44px; }
  .topbar__menu--branch { left: auto; right: 0; min-width: 160px; }
  .topbar__menu-item { min-height: 44px; overflow-wrap: anywhere; }
}

</style>
