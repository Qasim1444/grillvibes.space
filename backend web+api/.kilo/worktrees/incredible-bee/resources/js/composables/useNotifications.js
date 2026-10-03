import { reactive } from "vue";

let nextToastId = 1;
let nextDialogId = 1;

const state = reactive({
  toasts: [],
  dialog: null,
});

const toneDefaults = {
  success: { title: "Success", confirmText: "OK" },
  error: { title: "Something went wrong", confirmText: "OK" },
  warning: { title: "Please confirm", confirmText: "Confirm" },
  info: { title: "Notice", confirmText: "OK" },
};

const notify = ({ type = "info", title = "", message = "", duration = 4200 } = {}) => {
  const id = nextToastId++;
  state.toasts.push({ id, type, title, message });

  if (duration > 0) {
    window.setTimeout(() => dismissToast(id), duration);
  }

  return id;
};

const dismissToast = (id) => {
  const index = state.toasts.findIndex((toast) => toast.id === id);
  if (index !== -1) state.toasts.splice(index, 1);
};

const openDialog = ({
  type = "info",
  title,
  message = "",
  confirmText,
  cancelText = "Cancel",
  showCancel = false,
  danger = false,
} = {}) =>
  new Promise((resolve) => {
    const defaults = toneDefaults[type] || toneDefaults.info;
    state.dialog = {
      id: nextDialogId++,
      type,
      title: title || defaults.title,
      message,
      confirmText: confirmText || defaults.confirmText,
      cancelText,
      showCancel,
      danger,
      resolve,
    };
  });

const closeDialog = (confirmed) => {
  if (!state.dialog) return;
  const resolver = state.dialog.resolve;
  state.dialog = null;
  resolver(confirmed);
};

const confirmDialog = (message, options = {}) =>
  openDialog({
    type: options.type || "warning",
    title: options.title || "Are you sure?",
    message,
    confirmText: options.confirmText || "Yes, continue",
    cancelText: options.cancelText || "Cancel",
    showCancel: true,
    danger: options.danger ?? true,
  });

const alertDialog = (message, options = {}) =>
  openDialog({
    type: options.type || "info",
    title: options.title,
    message,
    confirmText: options.confirmText || "OK",
  });

export const useNotifications = () => ({
  state,
  notify,
  dismissToast,
  openDialog,
  closeDialog,
  confirmDialog,
  alertDialog,
});

export { notify, dismissToast, openDialog, closeDialog, confirmDialog, alertDialog };
