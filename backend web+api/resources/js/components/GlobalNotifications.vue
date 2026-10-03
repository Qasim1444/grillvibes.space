<template>
  <Teleport to="body">
    <div class="toast-stack" aria-live="polite" aria-atomic="true">
      <TransitionGroup name="toast-pop">
        <article
          v-for="toast in state.toasts"
          :key="toast.id"
          class="toast-card"
          :class="`toast-card--${toast.type}`"
        >
          <span class="toast-card__icon">{{ iconFor(toast.type) }}</span>
          <div class="toast-card__body">
            <strong v-if="toast.title">{{ toast.title }}</strong>
            <p>{{ toast.message || toast.title }}</p>
          </div>
          <button type="button" aria-label="Dismiss notification" @click="dismissToast(toast.id)">×</button>
        </article>
      </TransitionGroup>
    </div>

    <Transition name="swal-fade">
      <div v-if="state.dialog" class="swal-backdrop" role="presentation" @click.self="cancelDialog">
        <section
          class="swal-card"
          :class="[`swal-card--${state.dialog.type}`, { 'swal-card--danger': state.dialog.danger }]"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="`swal-title-${state.dialog.id}`"
        >
          <div class="swal-card__icon">{{ iconFor(state.dialog.type) }}</div>
          <h2 :id="`swal-title-${state.dialog.id}`">{{ state.dialog.title }}</h2>
          <p v-if="state.dialog.message">{{ state.dialog.message }}</p>
          <div class="swal-card__actions">
            <button
              v-if="state.dialog.showCancel"
              type="button"
              class="swal-card__button swal-card__button--ghost"
              @click="closeDialog(false)"
            >
              {{ state.dialog.cancelText }}
            </button>
            <button
              type="button"
              class="swal-card__button swal-card__button--primary"
              :class="{ 'swal-card__button--danger': state.dialog.danger }"
              @click="closeDialog(true)"
            >
              {{ state.dialog.confirmText }}
            </button>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { onBeforeUnmount, onMounted, watch } from "vue";
import { router, usePage } from "@inertiajs/vue3";
import {
  alertDialog,
  closeDialog,
  confirmDialog,
  dismissToast,
  notify,
  useNotifications,
} from "../composables/useNotifications";

const { state } = useNotifications();
const page = usePage();

const iconFor = (type) => ({
  success: "✓",
  error: "!",
  warning: "!",
  info: "i",
}[type] || "i");

const flashKey = (flash) => `${flash?.success || ""}|${flash?.error || ""}`;

watch(
  () => flashKey(page.props.flash),
  () => {
    const flash = page.props.flash || {};
    if (flash.success) {
      notify({ type: "success", title: "Success", message: flash.success });
    }
    if (flash.error) {
      alertDialog(flash.error, { type: "error", title: "Action blocked" });
    }
  },
  { immediate: true }
);

let removeErrorListener = null;

onMounted(() => {
  window.$toast = notify;
  window.$alert = alertDialog;
  window.$confirm = confirmDialog;

  removeErrorListener = router.on("error", (event) => {
    const errors = event.detail?.errors || {};
    const firstError = Object.values(errors).flat().find(Boolean);
    if (firstError) {
      notify({ type: "error", title: "Please check the form", message: firstError, duration: 5600 });
    }
  });
});

onBeforeUnmount(() => {
  if (window.$toast === notify) delete window.$toast;
  if (window.$alert === alertDialog) delete window.$alert;
  if (window.$confirm === confirmDialog) delete window.$confirm;
  if (removeErrorListener) removeErrorListener();
});

const cancelDialog = () => {
  if (state.dialog?.showCancel) closeDialog(false);
};
</script>

<style scoped>
.toast-stack {
  position: fixed;
  top: 18px;
  right: 18px;
  z-index: 10000;
  display: grid;
  gap: 10px;
  width: min(380px, calc(100vw - 32px));
  pointer-events: none;
}

.toast-card {
  display: grid;
  grid-template-columns: 34px 1fr auto;
  align-items: start;
  gap: 12px;
  padding: 14px;
  border: 1px solid #e5e7eb;
  border-left: 4px solid #4f46e5;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.16);
  pointer-events: auto;
}

.toast-card--success { border-left-color: #16a34a; }
.toast-card--error { border-left-color: #dc2626; }
.toast-card--warning { border-left-color: #d97706; }

.toast-card__icon {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #eef2ff;
  color: #4f46e5;
  font-weight: 900;
}

.toast-card--success .toast-card__icon { background: #dcfce7; color: #16a34a; }
.toast-card--error .toast-card__icon { background: #fee2e2; color: #dc2626; }
.toast-card--warning .toast-card__icon { background: #fef3c7; color: #d97706; }

.toast-card__body strong {
  display: block;
  color: #111827;
  font-size: 0.9rem;
  line-height: 1.2;
}

.toast-card__body p {
  margin: 3px 0 0;
  color: #64748b;
  font-size: 0.82rem;
  line-height: 1.45;
}

.toast-card button {
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  font-size: 1.15rem;
  line-height: 1;
}

.toast-card button:hover {
  background: #f1f5f9;
  color: #334155;
}

.swal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 10001;
  display: grid;
  place-items: center;
  padding: 22px;
  background: rgba(15, 23, 42, 0.54);
  backdrop-filter: blur(5px);
}

.swal-card {
  width: min(430px, 100%);
  padding: 30px;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 30px 90px rgba(15, 23, 42, 0.28);
  text-align: center;
}

.swal-card__icon {
  display: grid;
  place-items: center;
  width: 68px;
  height: 68px;
  margin: 0 auto 16px;
  border-radius: 50%;
  border: 3px solid #c7d2fe;
  color: #4f46e5;
  font-size: 1.9rem;
  font-weight: 900;
}

.swal-card--success .swal-card__icon { border-color: #bbf7d0; color: #16a34a; }
.swal-card--error .swal-card__icon { border-color: #fecaca; color: #dc2626; }
.swal-card--warning .swal-card__icon { border-color: #fde68a; color: #d97706; }

.swal-card h2 {
  margin: 0;
  color: #0f172a;
  font-size: 1.45rem;
  letter-spacing: -0.03em;
}

.swal-card p {
  margin: 10px auto 0;
  max-width: 340px;
  color: #64748b;
  font-size: 0.92rem;
  line-height: 1.62;
}

.swal-card__actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 24px;
  flex-wrap: wrap;
}

.swal-card__button {
  min-width: 112px;
  min-height: 42px;
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 10px 16px;
  cursor: pointer;
  font: 700 0.86rem var(--font-sans, system-ui, sans-serif);
}

.swal-card__button--ghost {
  background: #fff;
  border-color: #d1d5db;
  color: #334155;
}

.swal-card__button--primary {
  background: #4f46e5;
  color: #fff;
}

.swal-card__button--danger {
  background: #dc2626;
}

.toast-pop-enter-active,
.toast-pop-leave-active,
.swal-fade-enter-active,
.swal-fade-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.toast-pop-enter-from,
.toast-pop-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.swal-fade-enter-from,
.swal-fade-leave-to {
  opacity: 0;
}

.swal-fade-enter-from .swal-card,
.swal-fade-leave-to .swal-card {
  transform: translateY(8px) scale(0.98);
}

@media (max-width: 560px) {
  .toast-stack {
    top: 12px;
    right: 12px;
    width: calc(100vw - 24px);
  }

  .swal-card {
    padding: 24px 18px;
  }
}
</style>
