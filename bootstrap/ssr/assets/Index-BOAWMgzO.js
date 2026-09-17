import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-BOaGB7Aw.js";
import { n as usePermissions, t as AdminLayout_default } from "./AdminLayout-Dn6OtQae.js";
import { t as _sfc_main$1 } from "./PageHeader-D0aRDn5C.js";
import { t as Modal_default } from "./Modal-CpmFAnsY.js";
import { t as _sfc_main$2 } from "./FormField-Doe8oR1s.js";
import { Fragment, createBlock, createCommentVNode, createVNode, mergeProps, openBlock, ref, renderList, toDisplayString, unref, useSSRContext, withCtx } from "vue";
import { useForm } from "@inertiajs/vue3";
import { ssrIncludeBooleanAttr, ssrInterpolate, ssrLooseContain, ssrLooseEqual, ssrRenderAttr, ssrRenderAttrs, ssrRenderClass, ssrRenderComponent, ssrRenderList, ssrRenderStyle } from "vue/server-renderer";
//#region resources/js/pages/Reservations/Index.vue
var _sfc_main = /*@__PURE__*/ Object.assign({ layout: AdminLayout_default }, {
	__name: "Index",
	__ssrInlineRender: true,
	props: {
		reservations: {
			type: Array,
			default: () => []
		},
		waitlist: {
			type: Array,
			default: () => []
		},
		branches: {
			type: Array,
			default: () => []
		},
		tables: {
			type: Array,
			default: () => []
		},
		statuses: {
			type: Array,
			default: () => []
		},
		sources: {
			type: Array,
			default: () => []
		},
		filters: {
			type: Object,
			default: () => ({})
		}
	},
	setup(__props) {
		const { can } = usePermissions();
		const props = __props;
		const dateFilter = ref(props.filters?.date ?? (/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
		const branchFilter = ref(props.filters?.branch_id ?? "");
		const statusFilter = ref(props.filters?.status ?? "");
		const showModal = ref(false);
		const form = useForm({
			id: null,
			dining_table_id: "",
			branch_id: "",
			guest_name: "",
			guest_phone: "",
			guest_email: "",
			party_size: 2,
			reserved_at: "",
			duration_minutes: 90,
			status: "confirmed",
			occasion: "",
			notes: "",
			source: "walk_in"
		});
		const defaultBranchId = () => branchFilter.value || (props.branches.length === 1 ? props.branches[0].id : "");
		const openModal = (row = null) => {
			form.clearErrors();
			Object.assign(form, {
				id: null,
				dining_table_id: "",
				guest_name: "",
				guest_phone: "",
				guest_email: "",
				party_size: 2,
				duration_minutes: 90,
				status: "confirmed",
				occasion: "",
				notes: "",
				source: "walk_in"
			});
			if (row) Object.assign(form, {
				...row,
				reserved_at: row.reserved_at ? row.reserved_at.slice(0, 16) : "",
				dining_table_id: row.dining_table_id ?? "",
				branch_id: row.branch_id ?? ""
			});
			else {
				form.reserved_at = dateFilter.value + "T19:00";
				form.branch_id = defaultBranchId();
			}
			showModal.value = true;
		};
		const ACTIVE_STATUSES = [
			"pending",
			"confirmed",
			"seated"
		];
		/**
		* Conflict check against existing reservations:
		* 1. No two reservations at the same date & time (regardless of table).
		* 2. No double-booking of the same table within overlapping time windows.
		* Returns an error message, or '' when the slot is free.
		*/
		const conflictMessage = (reservedAt, duration, ignoreId = null, branchId = "") => {
			const start = new Date(reservedAt);
			const end = new Date(start.getTime() + (duration || 90) * 6e4);
			for (const r of props.reservations) {
				if (r.id === ignoreId || !ACTIVE_STATUSES.includes(r.status)) continue;
				if (branchId && r.branch_id && String(r.branch_id) !== String(branchId)) continue;
				const rStart = new Date(r.reserved_at);
				if (!(start < new Date(rStart.getTime() + (r.duration_minutes || 90) * 6e4) && rStart < end)) continue;
				if (rStart.getTime() === start.getTime()) return "A reservation already exists at this exact date & time. Pick a different time.";
				if (r.dining_table_id && String(r.dining_table_id) === String(form.dining_table_id)) return "This table already has a reservation overlapping that date & time.";
			}
			return "";
		};
		const save = () => {
			const conflict = conflictMessage(form.reserved_at, form.duration_minutes, form.id, form.branch_id);
			if (conflict) {
				form.setError(form.dining_table_id && conflict.includes("table") ? "dining_table_id" : "reserved_at", conflict);
				return;
			}
			const opts = {
				preserveScroll: true,
				onSuccess: () => showModal.value = false
			};
			form.id ? form.put(`/reservations/${form.id}`, opts) : form.post("/reservations", opts);
		};
		const showWaitlistModal = ref(false);
		const wlForm = useForm({
			guest_name: "",
			guest_phone: "",
			party_size: 2,
			branch_id: "",
			estimated_wait_minutes: null,
			notes: ""
		});
		const openWaitlistModal = () => {
			wlForm.reset();
			wlForm.clearErrors();
			wlForm.branch_id = defaultBranchId();
			showWaitlistModal.value = true;
		};
		const saveWaitlist = () => wlForm.post("/reservations/waitlist", {
			preserveScroll: true,
			onSuccess: () => showWaitlistModal.value = false
		});
		/** WhatsApp click-to-chat link with a prefilled "table ready" message. */
		const waLink = (entry) => {
			const digits = (entry.guest_phone || "").replace(/\D/g, "");
			if (!digits) return "";
			return `https://wa.me/${digits.startsWith("0") ? "92" + digits.slice(1) : digits}?text=${encodeURIComponent(`Assalam-o-Alaikum ${entry.guest_name}! 🍽 Your table at ${entry.branch_name || "GrillVibes"} is ready. Please see the host desk. Thank you!`)}`;
		};
		const fmtTime = (iso) => iso ? new Date(iso).toLocaleTimeString("en-PK", {
			hour: "2-digit",
			minute: "2-digit"
		}) : "";
		const statusBadge = (s) => ({
			pending: "ui-badge--muted",
			confirmed: "ui-badge--info",
			seated: "ui-badge--success",
			completed: "ui-badge--success",
			cancelled: "ui-badge--danger",
			no_show: "ui-badge--warning"
		})[s] ?? "ui-badge--muted";
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "page" }, _attrs))} data-v-e2805558>`);
			_push(ssrRenderComponent(_sfc_main$1, {
				title: "Reservations",
				subtitle: "Manage table bookings and walk-in queue."
			}, {
				actions: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<a href="/reservations/floor-plan" class="ui-btn ui-btn--ghost" data-v-e2805558${_scopeId}>🗺 Floor Plan</a>`);
						if (unref(can)("reservations.create")) _push(`<button class="ui-btn ui-btn--secondary" data-v-e2805558${_scopeId}>+ Waitlist</button>`);
						else _push(`<!---->`);
						if (unref(can)("reservations.create")) _push(`<button class="ui-btn ui-btn--primary" data-v-e2805558${_scopeId}>+ Reservation</button>`);
						else _push(`<!---->`);
					} else return [
						createVNode("a", {
							href: "/reservations/floor-plan",
							class: "ui-btn ui-btn--ghost"
						}, "🗺 Floor Plan"),
						unref(can)("reservations.create") ? (openBlock(), createBlock("button", {
							key: 0,
							class: "ui-btn ui-btn--secondary",
							onClick: openWaitlistModal
						}, "+ Waitlist")) : createCommentVNode("", true),
						unref(can)("reservations.create") ? (openBlock(), createBlock("button", {
							key: 1,
							class: "ui-btn ui-btn--primary",
							onClick: ($event) => openModal()
						}, "+ Reservation", 8, ["onClick"])) : createCommentVNode("", true)
					];
				}),
				_: 1
			}, _parent));
			_push(`<div class="res__filters" data-v-e2805558><div class="res__filter-group" data-v-e2805558><label class="ui-label" data-v-e2805558>Date</label><input${ssrRenderAttr("value", dateFilter.value)} type="date" class="ui-input" data-v-e2805558></div><div class="res__filter-group" data-v-e2805558><label class="ui-label" data-v-e2805558>Branch</label><select class="ui-input" style="${ssrRenderStyle({ "width": "180px" })}" data-v-e2805558><option value="" data-v-e2805558${ssrIncludeBooleanAttr(Array.isArray(branchFilter.value) ? ssrLooseContain(branchFilter.value, "") : ssrLooseEqual(branchFilter.value, "")) ? " selected" : ""}>All Branches</option><!--[-->`);
			ssrRenderList(props.branches, (b) => {
				_push(`<option${ssrRenderAttr("value", b.id)} data-v-e2805558${ssrIncludeBooleanAttr(Array.isArray(branchFilter.value) ? ssrLooseContain(branchFilter.value, b.id) : ssrLooseEqual(branchFilter.value, b.id)) ? " selected" : ""}>${ssrInterpolate(b.name)}</option>`);
			});
			_push(`<!--]--></select></div><div class="res__filter-group" data-v-e2805558><label class="ui-label" data-v-e2805558>Status</label><select class="ui-input" style="${ssrRenderStyle({ "width": "160px" })}" data-v-e2805558><option value="" data-v-e2805558${ssrIncludeBooleanAttr(Array.isArray(statusFilter.value) ? ssrLooseContain(statusFilter.value, "") : ssrLooseEqual(statusFilter.value, "")) ? " selected" : ""}>All</option><!--[-->`);
			ssrRenderList(props.statuses, (s) => {
				_push(`<option${ssrRenderAttr("value", s)} data-v-e2805558${ssrIncludeBooleanAttr(Array.isArray(statusFilter.value) ? ssrLooseContain(statusFilter.value, s) : ssrLooseEqual(statusFilter.value, s)) ? " selected" : ""}>${ssrInterpolate(s)}</option>`);
			});
			_push(`<!--]--></select></div></div><div class="res__grid" data-v-e2805558><div class="res__section" data-v-e2805558><h3 class="res__section-title" data-v-e2805558> Reservations <span class="ui-badge ui-badge--info" data-v-e2805558>${ssrInterpolate(props.reservations.length)}</span></h3><div class="res__timeline" data-v-e2805558>`);
			if (!props.reservations.length) _push(`<div class="res__empty" data-v-e2805558>No reservations for this date.</div>`);
			else _push(`<!---->`);
			_push(`<!--[-->`);
			ssrRenderList(props.reservations, (r) => {
				_push(`<div class="${ssrRenderClass(["res__card--" + r.status, "res__card"])}" data-v-e2805558><div class="res__card-time" data-v-e2805558><span class="res__time" data-v-e2805558>${ssrInterpolate(fmtTime(r.reserved_at))}</span><span class="res__dur" data-v-e2805558>${ssrInterpolate(r.duration_minutes)}min</span></div><div class="res__card-body" data-v-e2805558><div class="res__card-name" data-v-e2805558>${ssrInterpolate(r.guest_name)}</div><div class="res__card-meta" data-v-e2805558><span data-v-e2805558>👥 ${ssrInterpolate(r.party_size)}</span>`);
				if (r.table_number) _push(`<span data-v-e2805558>🪑 ${ssrInterpolate(r.table_number)}</span>`);
				else _push(`<!---->`);
				if (r.phone) _push(`<span data-v-e2805558>📞 ${ssrInterpolate(r.guest_phone)}</span>`);
				else _push(`<!---->`);
				if (r.occasion) _push(`<span data-v-e2805558>🎉 ${ssrInterpolate(r.occasion)}</span>`);
				else _push(`<!---->`);
				_push(`</div>`);
				if (r.notes) _push(`<div class="res__card-notes" data-v-e2805558>${ssrInterpolate(r.notes)}</div>`);
				else _push(`<!---->`);
				_push(`</div><div class="res__card-actions" data-v-e2805558><span class="${ssrRenderClass([statusBadge(r.status), "ui-badge"])}" data-v-e2805558>${ssrInterpolate(r.status)}</span>`);
				if (unref(can)("reservations.update")) _push(`<button class="ui-btn ui-btn--ghost ui-btn--sm" data-v-e2805558>Edit</button>`);
				else _push(`<!---->`);
				if (unref(can)("reservations.delete")) _push(`<button class="ui-btn ui-btn--danger ui-btn--sm" data-v-e2805558>✕</button>`);
				else _push(`<!---->`);
				_push(`</div></div>`);
			});
			_push(`<!--]--></div></div><div class="res__section" data-v-e2805558><h3 class="res__section-title" data-v-e2805558> Waitlist <span class="ui-badge ui-badge--warning" data-v-e2805558>${ssrInterpolate(props.waitlist.length)}</span></h3><div class="res__waitlist" data-v-e2805558>`);
			if (!props.waitlist.length) _push(`<div class="res__empty" data-v-e2805558>Waitlist is empty.</div>`);
			else _push(`<!---->`);
			_push(`<!--[-->`);
			ssrRenderList(props.waitlist, (entry, idx) => {
				_push(`<div class="res__wait-card" data-v-e2805558><div class="res__wait-pos" data-v-e2805558>${ssrInterpolate(idx + 1)}</div><div class="res__wait-body" data-v-e2805558><div class="res__wait-name" data-v-e2805558>${ssrInterpolate(entry.guest_name)}</div><div class="res__wait-meta" data-v-e2805558><span data-v-e2805558>👥 ${ssrInterpolate(entry.party_size)}</span>`);
				if (entry.guest_phone) _push(`<span data-v-e2805558>📞 ${ssrInterpolate(entry.guest_phone)}</span>`);
				else _push(`<!---->`);
				_push(`<span class="res__wait-time" data-v-e2805558>⏱ ${ssrInterpolate(entry.wait_minutes)}min waiting</span>`);
				if (entry.estimated_wait_minutes) _push(`<span class="res__wait-est" data-v-e2805558> Est: ${ssrInterpolate(entry.estimated_wait_minutes)}min </span>`);
				else _push(`<!---->`);
				if (entry.notified_at) _push(`<span class="ui-badge ui-badge--success" data-v-e2805558>🔔 Notified</span>`);
				else _push(`<!---->`);
				_push(`</div></div><div class="res__wait-actions" data-v-e2805558><button class="ui-btn ui-btn--success ui-btn--sm" data-v-e2805558>Seat</button><button class="ui-btn ui-btn--ghost ui-btn--sm"${ssrIncludeBooleanAttr(!!entry.notified_at) ? " disabled" : ""} data-v-e2805558>${ssrInterpolate(entry.notified_at ? "Notified ✓" : "Notify")}</button>`);
				if (entry.guest_phone) _push(`<a class="ui-btn ui-btn--ghost ui-btn--sm"${ssrRenderAttr("href", waLink(entry))} target="_blank" rel="noopener" title="Open WhatsApp chat" data-v-e2805558>💬</a>`);
				else _push(`<!---->`);
				_push(`<button class="ui-btn ui-btn--danger ui-btn--sm" data-v-e2805558>✕</button></div></div>`);
			});
			_push(`<!--]--></div></div></div>`);
			_push(ssrRenderComponent(Modal_default, {
				modelValue: showModal.value,
				"onUpdate:modelValue": ($event) => showModal.value = $event,
				title: unref(form).id ? "Edit Reservation" : "New Reservation",
				width: "640px"
			}, {
				footer: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<button class="ui-btn ui-btn--ghost" data-v-e2805558${_scopeId}>Cancel</button><button class="ui-btn ui-btn--primary"${ssrIncludeBooleanAttr(unref(form).processing) ? " disabled" : ""} data-v-e2805558${_scopeId}>Save</button>`);
					else return [createVNode("button", {
						class: "ui-btn ui-btn--ghost",
						onClick: ($event) => showModal.value = false
					}, "Cancel", 8, ["onClick"]), createVNode("button", {
						class: "ui-btn ui-btn--primary",
						disabled: unref(form).processing,
						onClick: save
					}, "Save", 8, ["disabled"])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div class="form-grid-2" data-v-e2805558${_scopeId}>`);
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).guest_name,
							"onUpdate:modelValue": ($event) => unref(form).guest_name = $event,
							label: "Guest Name *",
							placeholder: "Full name",
							error: unref(form).errors.guest_name
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).guest_phone,
							"onUpdate:modelValue": ($event) => unref(form).guest_phone = $event,
							label: "Phone",
							placeholder: "+92 300 0000000",
							error: unref(form).errors.guest_phone
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).guest_email,
							"onUpdate:modelValue": ($event) => unref(form).guest_email = $event,
							label: "Email",
							type: "email",
							placeholder: "Optional",
							error: unref(form).errors.guest_email
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).party_size,
							"onUpdate:modelValue": ($event) => unref(form).party_size = $event,
							modelModifiers: { number: true },
							label: "Party Size *",
							type: "number",
							min: "1",
							error: unref(form).errors.party_size
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).reserved_at,
							"onUpdate:modelValue": ($event) => unref(form).reserved_at = $event,
							label: "Date & Time *",
							type: "datetime-local",
							error: unref(form).errors.reserved_at
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).duration_minutes,
							"onUpdate:modelValue": ($event) => unref(form).duration_minutes = $event,
							modelModifiers: { number: true },
							label: "Duration (min)",
							type: "number",
							min: "15",
							error: unref(form).errors.duration_minutes
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).dining_table_id,
							"onUpdate:modelValue": ($event) => unref(form).dining_table_id = $event,
							label: "Table",
							type: "select",
							error: unref(form).errors.dining_table_id
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) {
									_push(`<option value="" data-v-e2805558${_scopeId}>— No specific table —</option><!--[-->`);
									ssrRenderList(props.tables, (t) => {
										_push(`<option${ssrRenderAttr("value", t.id)} data-v-e2805558${_scopeId}>${ssrInterpolate(t.table_number)} (cap. ${ssrInterpolate(t.capacity)}) </option>`);
									});
									_push(`<!--]-->`);
								} else return [createVNode("option", { value: "" }, "— No specific table —"), (openBlock(true), createBlock(Fragment, null, renderList(props.tables, (t) => {
									return openBlock(), createBlock("option", {
										key: t.id,
										value: t.id
									}, toDisplayString(t.table_number) + " (cap. " + toDisplayString(t.capacity) + ") ", 9, ["value"]);
								}), 128))];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).branch_id,
							"onUpdate:modelValue": ($event) => unref(form).branch_id = $event,
							label: "Branch",
							type: "select",
							error: unref(form).errors.branch_id
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) {
									_push(`<option value="" data-v-e2805558${_scopeId}>Select branch</option><!--[-->`);
									ssrRenderList(props.branches, (b) => {
										_push(`<option${ssrRenderAttr("value", b.id)} data-v-e2805558${_scopeId}>${ssrInterpolate(b.name)}</option>`);
									});
									_push(`<!--]-->`);
								} else return [createVNode("option", { value: "" }, "Select branch"), (openBlock(true), createBlock(Fragment, null, renderList(props.branches, (b) => {
									return openBlock(), createBlock("option", {
										key: b.id,
										value: b.id
									}, toDisplayString(b.name), 9, ["value"]);
								}), 128))];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).status,
							"onUpdate:modelValue": ($event) => unref(form).status = $event,
							label: "Status",
							type: "select",
							error: unref(form).errors.status
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) {
									_push(`<!--[-->`);
									ssrRenderList(props.statuses, (s) => {
										_push(`<option${ssrRenderAttr("value", s)} data-v-e2805558${_scopeId}>${ssrInterpolate(s)}</option>`);
									});
									_push(`<!--]-->`);
								} else return [(openBlock(true), createBlock(Fragment, null, renderList(props.statuses, (s) => {
									return openBlock(), createBlock("option", {
										key: s,
										value: s
									}, toDisplayString(s), 9, ["value"]);
								}), 128))];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).occasion,
							"onUpdate:modelValue": ($event) => unref(form).occasion = $event,
							label: "Occasion",
							placeholder: "Birthday, Anniversary…",
							error: unref(form).errors.occasion
						}, null, _parent, _scopeId));
						_push(`</div>`);
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).notes,
							"onUpdate:modelValue": ($event) => unref(form).notes = $event,
							label: "Notes",
							type: "textarea",
							placeholder: "Special requests…",
							error: unref(form).errors.notes
						}, null, _parent, _scopeId));
					} else return [createVNode("div", { class: "form-grid-2" }, [
						createVNode(_sfc_main$2, {
							modelValue: unref(form).guest_name,
							"onUpdate:modelValue": ($event) => unref(form).guest_name = $event,
							label: "Guest Name *",
							placeholder: "Full name",
							error: unref(form).errors.guest_name
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode(_sfc_main$2, {
							modelValue: unref(form).guest_phone,
							"onUpdate:modelValue": ($event) => unref(form).guest_phone = $event,
							label: "Phone",
							placeholder: "+92 300 0000000",
							error: unref(form).errors.guest_phone
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode(_sfc_main$2, {
							modelValue: unref(form).guest_email,
							"onUpdate:modelValue": ($event) => unref(form).guest_email = $event,
							label: "Email",
							type: "email",
							placeholder: "Optional",
							error: unref(form).errors.guest_email
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode(_sfc_main$2, {
							modelValue: unref(form).party_size,
							"onUpdate:modelValue": ($event) => unref(form).party_size = $event,
							modelModifiers: { number: true },
							label: "Party Size *",
							type: "number",
							min: "1",
							error: unref(form).errors.party_size
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode(_sfc_main$2, {
							modelValue: unref(form).reserved_at,
							"onUpdate:modelValue": ($event) => unref(form).reserved_at = $event,
							label: "Date & Time *",
							type: "datetime-local",
							error: unref(form).errors.reserved_at
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode(_sfc_main$2, {
							modelValue: unref(form).duration_minutes,
							"onUpdate:modelValue": ($event) => unref(form).duration_minutes = $event,
							modelModifiers: { number: true },
							label: "Duration (min)",
							type: "number",
							min: "15",
							error: unref(form).errors.duration_minutes
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode(_sfc_main$2, {
							modelValue: unref(form).dining_table_id,
							"onUpdate:modelValue": ($event) => unref(form).dining_table_id = $event,
							label: "Table",
							type: "select",
							error: unref(form).errors.dining_table_id
						}, {
							default: withCtx(() => [createVNode("option", { value: "" }, "— No specific table —"), (openBlock(true), createBlock(Fragment, null, renderList(props.tables, (t) => {
								return openBlock(), createBlock("option", {
									key: t.id,
									value: t.id
								}, toDisplayString(t.table_number) + " (cap. " + toDisplayString(t.capacity) + ") ", 9, ["value"]);
							}), 128))]),
							_: 1
						}, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode(_sfc_main$2, {
							modelValue: unref(form).branch_id,
							"onUpdate:modelValue": ($event) => unref(form).branch_id = $event,
							label: "Branch",
							type: "select",
							error: unref(form).errors.branch_id
						}, {
							default: withCtx(() => [createVNode("option", { value: "" }, "Select branch"), (openBlock(true), createBlock(Fragment, null, renderList(props.branches, (b) => {
								return openBlock(), createBlock("option", {
									key: b.id,
									value: b.id
								}, toDisplayString(b.name), 9, ["value"]);
							}), 128))]),
							_: 1
						}, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode(_sfc_main$2, {
							modelValue: unref(form).status,
							"onUpdate:modelValue": ($event) => unref(form).status = $event,
							label: "Status",
							type: "select",
							error: unref(form).errors.status
						}, {
							default: withCtx(() => [(openBlock(true), createBlock(Fragment, null, renderList(props.statuses, (s) => {
								return openBlock(), createBlock("option", {
									key: s,
									value: s
								}, toDisplayString(s), 9, ["value"]);
							}), 128))]),
							_: 1
						}, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode(_sfc_main$2, {
							modelValue: unref(form).occasion,
							"onUpdate:modelValue": ($event) => unref(form).occasion = $event,
							label: "Occasion",
							placeholder: "Birthday, Anniversary…",
							error: unref(form).errors.occasion
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						])
					]), createVNode(_sfc_main$2, {
						modelValue: unref(form).notes,
						"onUpdate:modelValue": ($event) => unref(form).notes = $event,
						label: "Notes",
						type: "textarea",
						placeholder: "Special requests…",
						error: unref(form).errors.notes
					}, null, 8, [
						"modelValue",
						"onUpdate:modelValue",
						"error"
					])];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(Modal_default, {
				modelValue: showWaitlistModal.value,
				"onUpdate:modelValue": ($event) => showWaitlistModal.value = $event,
				title: "Add to Waitlist",
				width: "480px"
			}, {
				footer: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<button class="ui-btn ui-btn--ghost" data-v-e2805558${_scopeId}>Cancel</button><button class="ui-btn ui-btn--primary"${ssrIncludeBooleanAttr(unref(wlForm).processing) ? " disabled" : ""} data-v-e2805558${_scopeId}>Add to Waitlist</button>`);
					else return [createVNode("button", {
						class: "ui-btn ui-btn--ghost",
						onClick: ($event) => showWaitlistModal.value = false
					}, "Cancel", 8, ["onClick"]), createVNode("button", {
						class: "ui-btn ui-btn--primary",
						disabled: unref(wlForm).processing,
						onClick: saveWaitlist
					}, "Add to Waitlist", 8, ["disabled"])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(wlForm).guest_name,
							"onUpdate:modelValue": ($event) => unref(wlForm).guest_name = $event,
							label: "Guest Name *",
							placeholder: "Full name",
							error: unref(wlForm).errors.guest_name
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(wlForm).guest_phone,
							"onUpdate:modelValue": ($event) => unref(wlForm).guest_phone = $event,
							label: "Phone",
							placeholder: "+92 300 0000000",
							error: unref(wlForm).errors.guest_phone
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(wlForm).party_size,
							"onUpdate:modelValue": ($event) => unref(wlForm).party_size = $event,
							modelModifiers: { number: true },
							label: "Party Size *",
							type: "number",
							min: "1",
							error: unref(wlForm).errors.party_size
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(wlForm).branch_id,
							"onUpdate:modelValue": ($event) => unref(wlForm).branch_id = $event,
							label: "Branch",
							type: "select",
							error: unref(wlForm).errors.branch_id
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) {
									_push(`<option value="" data-v-e2805558${_scopeId}>Select branch</option><!--[-->`);
									ssrRenderList(props.branches, (b) => {
										_push(`<option${ssrRenderAttr("value", b.id)} data-v-e2805558${_scopeId}>${ssrInterpolate(b.name)}</option>`);
									});
									_push(`<!--]-->`);
								} else return [createVNode("option", { value: "" }, "Select branch"), (openBlock(true), createBlock(Fragment, null, renderList(props.branches, (b) => {
									return openBlock(), createBlock("option", {
										key: b.id,
										value: b.id
									}, toDisplayString(b.name), 9, ["value"]);
								}), 128))];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(wlForm).estimated_wait_minutes,
							"onUpdate:modelValue": ($event) => unref(wlForm).estimated_wait_minutes = $event,
							modelModifiers: { number: true },
							label: "Est. Wait (min)",
							type: "number",
							min: "1",
							placeholder: "20",
							error: unref(wlForm).errors.estimated_wait_minutes
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(wlForm).notes,
							"onUpdate:modelValue": ($event) => unref(wlForm).notes = $event,
							label: "Notes",
							type: "textarea",
							error: unref(wlForm).errors.notes
						}, null, _parent, _scopeId));
					} else return [
						createVNode(_sfc_main$2, {
							modelValue: unref(wlForm).guest_name,
							"onUpdate:modelValue": ($event) => unref(wlForm).guest_name = $event,
							label: "Guest Name *",
							placeholder: "Full name",
							error: unref(wlForm).errors.guest_name
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode(_sfc_main$2, {
							modelValue: unref(wlForm).guest_phone,
							"onUpdate:modelValue": ($event) => unref(wlForm).guest_phone = $event,
							label: "Phone",
							placeholder: "+92 300 0000000",
							error: unref(wlForm).errors.guest_phone
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode(_sfc_main$2, {
							modelValue: unref(wlForm).party_size,
							"onUpdate:modelValue": ($event) => unref(wlForm).party_size = $event,
							modelModifiers: { number: true },
							label: "Party Size *",
							type: "number",
							min: "1",
							error: unref(wlForm).errors.party_size
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode(_sfc_main$2, {
							modelValue: unref(wlForm).branch_id,
							"onUpdate:modelValue": ($event) => unref(wlForm).branch_id = $event,
							label: "Branch",
							type: "select",
							error: unref(wlForm).errors.branch_id
						}, {
							default: withCtx(() => [createVNode("option", { value: "" }, "Select branch"), (openBlock(true), createBlock(Fragment, null, renderList(props.branches, (b) => {
								return openBlock(), createBlock("option", {
									key: b.id,
									value: b.id
								}, toDisplayString(b.name), 9, ["value"]);
							}), 128))]),
							_: 1
						}, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode(_sfc_main$2, {
							modelValue: unref(wlForm).estimated_wait_minutes,
							"onUpdate:modelValue": ($event) => unref(wlForm).estimated_wait_minutes = $event,
							modelModifiers: { number: true },
							label: "Est. Wait (min)",
							type: "number",
							min: "1",
							placeholder: "20",
							error: unref(wlForm).errors.estimated_wait_minutes
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode(_sfc_main$2, {
							modelValue: unref(wlForm).notes,
							"onUpdate:modelValue": ($event) => unref(wlForm).notes = $event,
							label: "Notes",
							type: "textarea",
							error: unref(wlForm).errors.notes
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						])
					];
				}),
				_: 1
			}, _parent));
			_push(`</div>`);
		};
	}
});
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/pages/Reservations/Index.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var Index_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-e2805558"]]);
//#endregion
export { Index_default as default };
