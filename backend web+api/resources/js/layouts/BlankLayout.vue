<template>
  <div class="blank-layout">
    <slot />
  </div>
</template>

<script setup>
// Full-screen shell with no sidebar/topbar — used for the standalone POS screen.
</script>

<style scoped>
.blank-layout {
  min-height: 100vh;
  background: var(--bg);
}
</style>
