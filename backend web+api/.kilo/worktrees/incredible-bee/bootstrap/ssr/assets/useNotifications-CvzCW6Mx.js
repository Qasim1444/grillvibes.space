import { reactive } from "vue";
//#region resources/js/composables/useNotifications.js
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
export { confirmDialog as n, alertDialog as t };
