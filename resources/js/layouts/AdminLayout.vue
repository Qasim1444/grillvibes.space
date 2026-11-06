<template>
  <div class="admin" :data-theme="theme">
    <Topbar :theme="theme" @toggle-theme="toggleTheme" />
    <Sidebar />
    <main class="admin__content">
      <slot />
    </main>
  </div>
</template>

<script setup>
import Sidebar from "../components/Sidebar.vue";
import Topbar from "../components/Topbar.vue";
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { usePage } from "@inertiajs/vue3";

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

.admin__content {
  flex: 1;
}
</style>
