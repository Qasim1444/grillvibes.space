import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-BOaGB7Aw.js";
import { t as AdminLayout_default } from "./AdminLayout-BhC2A239.js";
import { t as _sfc_main$1 } from "./PageHeader-D0aRDn5C.js";
import { computed, mergeProps, unref, useSSRContext } from "vue";
import { useForm } from "@inertiajs/vue3";
import { ssrIncludeBooleanAttr, ssrInterpolate, ssrRenderAttrs, ssrRenderClass, ssrRenderComponent } from "vue/server-renderer";
//#region resources/js/pages/HR/AttendancePunch.vue
var _sfc_main = /*@__PURE__*/ Object.assign({ layout: AdminLayout_default }, {
	__name: "AttendancePunch",
	__ssrInlineRender: true,
	props: {
		employee: {
			type: Object,
			default: () => ({ name: "Employee" })
		},
		branch: {
			type: Object,
			default: null
		},
		state: {
			type: String,
			default: "check_in"
		},
		locationIssue: {
			type: String,
			default: null
		}
	},
	setup(__props) {
		const props = __props;
		const form = useForm({
			latitude: null,
			longitude: null,
			accuracy: null
		});
		const stateTitle = computed(() => ({
			check_in: "Ready to check in",
			check_out: "Ready to check out",
			complete: "Attendance complete"
		})[props.state]);
		const stateMessage = computed(() => ({
			check_in: "Allow location access, then record your arrival.",
			check_out: "Allow location access, then record your departure.",
			complete: "Both check-in and check-out are already recorded for today."
		})[props.state]);
		const buttonLabel = computed(() => props.state === "check_out" ? "Check out" : "Check in");
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "page punch-page" }, _attrs))} data-v-11546beb>`);
			_push(ssrRenderComponent(_sfc_main$1, {
				title: "Attendance punch",
				subtitle: `Hello ${props.employee.name}. Your location is checked before each punch.`
			}, null, _parent));
			_push(`<div class="punch-panel ui-card ui-card-pad" data-v-11546beb><div class="${ssrRenderClass([`punch-panel__status--${props.state}`, "punch-panel__status"])}" data-v-11546beb><span class="punch-panel__dot" aria-hidden="true" data-v-11546beb></span><div data-v-11546beb><strong data-v-11546beb>${ssrInterpolate(stateTitle.value)}</strong><p data-v-11546beb>${ssrInterpolate(stateMessage.value)}</p></div></div>`);
			if (props.branch) _push(`<p class="punch-panel__branch" data-v-11546beb>${ssrInterpolate(props.branch.name)} · allowed within ${ssrInterpolate(props.branch.attendance_radius_meters)}m </p>`);
			else if (props.locationIssue === "no_place") _push(`<p class="ui-alert ui-alert--danger" data-v-11546beb> Your employee profile has no place assigned. Ask HR to assign your place and branch. </p>`);
			else if (props.locationIssue === "no_branch") _push(`<p class="ui-alert ui-alert--danger" data-v-11546beb> Your assigned place has no branch. Ask HR to assign this place to a branch. </p>`);
			else if (props.locationIssue === "not_configured") _push(`<p class="ui-alert ui-alert--danger" data-v-11546beb> Your branch has not configured an attendance location. </p>`);
			else _push(`<!---->`);
			if (unref(form).errors.location) _push(`<p class="ui-alert ui-alert--danger" data-v-11546beb>${ssrInterpolate(unref(form).errors.location)}</p>`);
			else _push(`<!---->`);
			if (unref(form).recentlySuccessful) _push(`<p class="ui-alert ui-alert--success" data-v-11546beb>Attendance updated.</p>`);
			else _push(`<!---->`);
			_push(`<button class="ui-btn ui-btn--primary punch-panel__button"${ssrIncludeBooleanAttr(unref(form).processing || props.state === "complete" || !props.branch) ? " disabled" : ""} data-v-11546beb>${ssrInterpolate(unref(form).processing ? "Checking location…" : buttonLabel.value)}</button><p class="punch-panel__privacy" data-v-11546beb>Only the coordinates, accuracy, distance, and time needed to verify attendance are recorded.</p></div></div>`);
		};
	}
});
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/pages/HR/AttendancePunch.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var AttendancePunch_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-11546beb"]]);
//#endregion
export { AttendancePunch_default as default };
