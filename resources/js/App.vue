<template>
  <component :is="layout">
    <router-view />
  </component>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import AdminLayout from "./layouts/AdminLayout.vue";
import LoginLayout from "./layouts/LoginLayout.vue";
import BlankLayout from "./layouts/BlankLayout.vue";

const route = useRoute();

const layout = computed(() => {
  if (route.path === "/login") {
    return LoginLayout;
  }
  // POS is a full-screen standalone screen — no sidebar/topbar.
  if (route.path === "/pos") {
    return BlankLayout;
  }
  return AdminLayout;
});
</script>

<style>
body {
  margin: 0;
}
</style>
