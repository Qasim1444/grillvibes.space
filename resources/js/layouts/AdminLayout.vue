<template>
  <div class="admin" :class="{ 'admin--collapsed': state.collapsed }" :data-theme="theme">
    <Sidebar />
    <div class="admin__main">
      <Topbar :theme="theme" @toggle-theme="toggleTheme" />
      <main class="admin__content">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import Sidebar from "../components/Sidebar.vue";
import Topbar from "../components/Topbar.vue";
import { useSidebar } from "../composables/useSidebar";
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { usePage } from "@inertiajs/vue3";

const { state } = useSidebar();
const page = usePage();
const theme = ref("light");
const themeReady = ref(false);
const themeKey = computed(() => `grillvibes_admin_theme_${page.props.auth?.user?.id ?? "guest"}`);

onMounted(() => {
  theme.value = localStorage.getItem(themeKey.value) === "dark" ? "dark" : "light";
  document.documentElement.dataset.adminTheme = theme.value;
  themeReady.value = true;
});

watch(theme, (value) => {
  if (themeReady.value) {
    localStorage.setItem(themeKey.value, value);
    document.documentElement.dataset.adminTheme = value;
  }
});

onBeforeUnmount(() => {
  delete document.documentElement.dataset.adminTheme;
});

const toggleTheme = () => {
  theme.value = theme.value === "dark" ? "light" : "dark";
};
</script>

<style scoped>
.admin {
  min-height: 100vh;
}

.admin__main {
  margin-left: var(--sidebar-w);
  min-height: 100vh;
  transition: margin-left 0.2s ease;
  display: flex;
  flex-direction: column;
}

.admin--collapsed .admin__main {
  margin-left: var(--sidebar-w-collapsed);
}

.admin__content {
  flex: 1;
}

@media (max-width: 900px) {
  .admin__main,
  .admin--collapsed .admin__main {
    margin-left: 0;
  }
}
</style>
