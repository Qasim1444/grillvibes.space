<template>
  <div class="admin" :class="{ 'admin--collapsed': state.collapsed }">
    <Sidebar />
    <div class="admin__main">
      <Topbar />
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

const { state } = useSidebar();
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
