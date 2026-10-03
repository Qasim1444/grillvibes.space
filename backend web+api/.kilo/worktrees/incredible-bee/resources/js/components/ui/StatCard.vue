<template>
  <div class="ui-card stat-card">
    <div class="stat-card__top">
      <span class="stat-card__label">{{ label }}</span>
      <div class="stat-card__icon" :style="{ background: tint, color: color }">
        <slot name="icon">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 3v18h18" />
            <path d="m7 14 4-4 3 3 5-5" />
          </svg>
        </slot>
      </div>
    </div>
    <div class="stat-card__value">{{ value }}</div>
    <div v-if="hint" class="stat-card__caption">
      <span>{{ hint }}</span>
      <span v-if="trend" class="stat-card__trend" :class="trendClass">{{ trend }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], default: "—" },
  hint: { type: String, default: "" },
  color: { type: String, default: "var(--brand)" },
  tint: { type: String, default: "var(--brand-soft)" },
  trend: { type: String, default: "" },
  trendDir: { type: String, default: "up" }, // "up" | "down"
});

const trendClass = computed(() => `stat-card__trend--${props.trendDir}`);
</script>

<style scoped>
.stat-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 20px 22px;
}

.stat-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-card__label {
  font-size: 0.72rem;
  color: var(--text-muted);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.stat-card__icon {
  width: 40px;
  height: 40px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-card__value {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.02em;
}

.stat-card__caption {
  font-size: 0.8rem;
  color: var(--text-soft);
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-card__trend {
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.stat-card__trend--up {
  color: var(--success);
}
.stat-card__trend--down {
  color: var(--danger);
}
</style>
