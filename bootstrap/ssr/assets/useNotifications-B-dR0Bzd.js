import { reactive } from "vue";
//#region resources/js/composables/useNotifications.js
var nextToastId = 1;
var nextDialogId = 1;
var state = reactive({
	toasts: [],
	dialog: null
});
var toneDefaults = {
	success: {
		title: "Success",
		confirmText: "OK"
	},
	error: {
		title: "Something went wrong",
		confirmText: "OK"
	},
	warning: {
		title: "Please confirm",
		confirmText: "Confirm"
	},
	info: {
		title: "Notice",
		confirmText: "OK"
	}
};
var notify = ({ type = "info", title = "", message = "", duration = 4200 } = {}) => {
	const id = nextToastId++;
	state.toasts.push({
		id,
		type,
		title,
		message
	});
	if (duration > 0) window.setTimeout(() => dismissToast(id), duration);
	return id;
};
var dismissToast = (id) => {
	const index = state.toasts.findIndex((toast) => toast.id === id);
	if (index !== -1) state.toasts.splice(index, 1);
};
var openDialog = ({ type = "info", title, message = "", confirmText, cancelText = "Cancel", showCancel = false, danger = false } = {}) => new Promise((resolve) => {
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
		resolve
	};
});
var confirmDialog = (message, options = {}) => openDialog({
	type: options.type || "warning",
	title: options.title || "Are you sure?",
	message,
	confirmText: options.confirmText || "Yes, continue",
	cancelText: options.cancelText || "Cancel",
	showCancel: true,
	danger: options.danger ?? true
});
var alertDialog = (message, options = {}) => openDialog({
	type: options.type || "info",
	title: options.title,
	message,
	confirmText: options.confirmText || "OK"
});
//#endregion
export { confirmDialog as n, notify as r, alertDialog as t };
