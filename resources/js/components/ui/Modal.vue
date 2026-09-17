<template>
  <Teleport to="body">
    <Transition name="ui-modal">
      <div v-if="modelValue" class="ui-modal" @mousedown.self="close">
        <div class="ui-modal__dialog" :style="{ maxWidth: width }">
          <div v-if="!hideHeader" class="ui-modal__header">
            <h5 class="ui-modal__title">{{ title }}</h5>
            <button class="ui-modal__close" type="button" aria-label="Close" @click="close">
              &times;
            </button>
          </div>

          <div class="ui-modal__body" :class="{ 'ui-modal__body--flush': flush }">
            <slot />
          </div>

          <div v-if="$slots.footer" class="ui-modal__footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { watch, onBeforeUnmount } from "vue";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: "" },
  width: { type: String, default: "520px" },
  hideHeader: { type: Boolean, default: false },
  flush: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue"]);

const close = () => emit("update:modelValue", false);

const onKey = (e) => {
  if (e.key === "Escape" && props.modelValue) close();
};

watch(
  () => props.modelValue,
  (open) => {
    document.body.style.overflow = open ? "hidden" : "";
    if (open) window.addEventListener("keydown", onKey);
    else window.removeEventListener("keydown", onKey);
  }
);

onBeforeUnmount(() => {
  document.body.style.overflow = "";
  window.removeEventListener("keydown", onKey);
});
</script>

<style scoped>
.ui-modal {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 6vh 16px 16px;
  z-index: 1050;
  overflow-y: auto;
}

.ui-modal__dialog {
  background: var(--surface);
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
  width: 100%;
  overflow: hidden;
}

.ui-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px;
  border-bottom: 1px solid var(--border);
}

.ui-modal__title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
}

.ui-modal__close {
  border: none;
  background: transparent;
  font-size: 1.6rem;
  line-height: 1;
  color: var(--text-soft);
  cursor: pointer;
  padding: 0 4px;
  transition: color 0.15s ease;
}
.ui-modal__close:hover {
  color: var(--text);
}

.ui-modal__body {
  padding: 22px;
  max-height: 70vh;
  overflow-y: auto;
}
.ui-modal__body--flush {
  padding: 0;
  max-height: none;
  overflow: visible;
}

.ui-modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 22px;
  border-top: 1px solid var(--border);
  background: var(--surface-2);
}

/* Transition */
.ui-modal-enter-active,
.ui-modal-leave-active {
  transition: opacity 0.2s ease;
}
.ui-modal-enter-active .ui-modal__dialog,
.ui-modal-leave-active .ui-modal__dialog {
  transition: transform 0.2s ease;
}
.ui-modal-enter-from,
.ui-modal-leave-to {
  opacity: 0;
}
.ui-modal-enter-from .ui-modal__dialog,
.ui-modal-leave-to .ui-modal__dialog {
  transform: translateY(-16px) scale(0.98);
}

@media (max-width: 640px) {
  .ui-modal { padding: 12px; }
  .ui-modal__dialog { display: flex; flex-direction: column; max-height: calc(100dvh - 24px); min-width: 0; }
  .ui-modal__header, .ui-modal__footer { padding: 12px 16px; flex-shrink: 0; gap: 8px; }
  .ui-modal__title { overflow-wrap: anywhere; }
  .ui-modal__body { padding: 16px; min-height: 0; max-height: none; overflow: auto; }
  .ui-modal__body--flush { padding: 0; }
  .ui-modal__footer { flex-wrap: wrap; }
  .ui-modal__footer :deep(.ui-btn) { flex: 1 1 auto; }
  .ui-modal__close { min-width: 44px; min-height: 44px; flex-shrink: 0; }
}

</style>
