import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-BOaGB7Aw.js";
import "./useNotifications-B-dR0Bzd.js";
import { n as usePermissions, t as AdminLayout_default } from "./AdminLayout-B21JQZcd.js";
import { t as _sfc_main$1 } from "./PageHeader-D0aRDn5C.js";
import { t as Modal_default } from "./Modal-CpmFAnsY.js";
import { t as _sfc_main$2 } from "./FormField-Doe8oR1s.js";
import { t as CustomerPicker_default } from "./CustomerPicker-CgVEq0Uw.js";
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
		const dateFilter = ref(props.filters?.date ?? new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Karachi" }).format(/* @__PURE__ */ new Date()));
		const branchFilter = ref(props.filters?.branch_id ?? "");
		const statusFilter = ref(props.filters?.status ?? "");
		const showModal = ref(false);
		const form = useForm({
			id: null,
			dining_table_id: "",
			branch_id: "",
			customer_id: null,
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
		const onCustomerPicked = (customer) => {
			if (!customer) {
				form.guest_name = "";
				return;
			}
			form.guest_name = customer.name || form.guest_name;
			form.guest_phone = customer.contact || form.guest_phone;
			form.guest_email = customer.email || form.guest_email;
		};
		const defaultBranchId = () => branchFilter.value || (props.branches.length === 1 ? props.branches[0].id : "");
		const openModal = (row = null) => {
			form.clearErrors();
			Object.assign(form, {
				id: null,
				dining_table_id: "",
				guest_name: "",
				guest_phone: "",
				guest_email: "",
				customer_id: null,
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
			id: null,
			guest_name: "",
			guest_phone: "",
			customer_id: null,
			party_size: 2,
			branch_id: "",
			estimated_wait_minutes: null,
			notes: ""
		});
		const onWaitlistCustomerPicked = (customer) => {
			if (!customer) {
				wlForm.guest_name = "";
				return;
			}
			wlForm.guest_name = customer.name || wlForm.guest_name;
			wlForm.guest_phone = customer.contact || wlForm.guest_phone;
		};
		const openWaitlistModal = (entry = null) => {
			wlForm.reset();
			wlForm.clearErrors();
			if (entry) Object.assign(wlForm, {
				id: entry.id,
				guest_name: entry.guest_name,
				guest_phone: entry.guest_phone ?? "",
				customer_id: entry.customer_id ?? null,
				party_size: entry.party_size,
				branch_id: entry.branch_id ?? "",
				estimated_wait_minutes: entry.estimated_wait_minutes ?? null,
				notes: entry.notes ?? ""
			});
			else wlForm.branch_id = defaultBranchId();
			showWaitlistModal.value = true;
		};
		const saveWaitlist = () => {
			const opts = {
				preserveScroll: true,
				onSuccess: () => showWaitlistModal.value = false
			};
			if (wlForm.id) wlForm.put(`/reservations/waitlist/${wlForm.id}`, opts);
			else wlForm.post("/reservations/waitlist", opts);
		};
		const reservationNotifyUrl = (reservation) => {
			const phone = String(reservation.guest_phone).replace(/\D/g, "");
			const normalizedPhone = phone.startsWith("0") ? `92${phone.slice(1)}` : phone.length === 10 ? `92${phone}` : phone;
			const message = `Assalam-o-Alaikum ${reservation.guest_name}! This is a reminder for your reservation at ${reservation.reserved_at ? fmtTime(reservation.reserved_at) : "our restaurant"}. We look forward to seeing you!`;
			return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
		};
		const fmtTime = (iso) => iso ? new Date(iso).toLocaleTimeString("en-PK", {
			hour: "2-digit",
			minute: "2-digit",
			timeZone: "Asia/Karachi"
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
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "page" }, _attrs))} data-v-de0bb8ef>`);
			_push(ssrRenderComponent(_sfc_main$1, {
				title: "Reservations",
				subtitle: "Manage table bookings and walk-in queue."
			}, {
				actions: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<a href="/reservations/floor-plan" class="ui-btn ui-btn--ghost" data-v-de0bb8ef${_scopeId}>🗺 Floor Plan</a>`);
						if (unref(can)("reservations.create")) _push(`<button class="ui-btn ui-btn--secondary" data-v-de0bb8ef${_scopeId}>+ Waitlist</button>`);
						else _push(`<!---->`);
						if (unref(can)("reservations.create")) _push(`<button class="ui-btn ui-btn--primary" data-v-de0bb8ef${_scopeId}>+ Reservation</button>`);
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
			_push(`<div class="res__filters" data-v-de0bb8ef><div class="res__filter-group" data-v-de0bb8ef><label class="ui-label" data-v-de0bb8ef>Date</label><input${ssrRenderAttr("value", dateFilter.value)} type="date" class="ui-input" data-v-de0bb8ef></div><div class="res__filter-group" data-v-de0bb8ef><label class="ui-label" data-v-de0bb8ef>Branch</label><select class="ui-input" style="${ssrRenderStyle({ "width": "180px" })}" data-v-de0bb8ef><option value="" data-v-de0bb8ef${ssrIncludeBooleanAttr(Array.isArray(branchFilter.value) ? ssrLooseContain(branchFilter.value, "") : ssrLooseEqual(branchFilter.value, "")) ? " selected" : ""}>All Branches</option><!--[-->`);
			ssrRenderList(props.branches, (b) => {
				_push(`<option${ssrRenderAttr("value", b.id)} data-v-de0bb8ef${ssrIncludeBooleanAttr(Array.isArray(branchFilter.value) ? ssrLooseContain(branchFilter.value, b.id) : ssrLooseEqual(branchFilter.value, b.id)) ? " selected" : ""}>${ssrInterpolate(b.name)}</option>`);
			});
			_push(`<!--]--></select></div><div class="res__filter-group" data-v-de0bb8ef><label class="ui-label" data-v-de0bb8ef>Status</label><select class="ui-input" style="${ssrRenderStyle({ "width": "160px" })}" data-v-de0bb8ef><option value="" data-v-de0bb8ef${ssrIncludeBooleanAttr(Array.isArray(statusFilter.value) ? ssrLooseContain(statusFilter.value, "") : ssrLooseEqual(statusFilter.value, "")) ? " selected" : ""}>All</option><!--[-->`);
			ssrRenderList(props.statuses, (s) => {
				_push(`<option${ssrRenderAttr("value", s)} data-v-de0bb8ef${ssrIncludeBooleanAttr(Array.isArray(statusFilter.value) ? ssrLooseContain(statusFilter.value, s) : ssrLooseEqual(statusFilter.value, s)) ? " selected" : ""}>${ssrInterpolate(s)}</option>`);
			});
			_push(`<!--]--></select></div></div><div class="res__grid" data-v-de0bb8ef><div class="res__section" data-v-de0bb8ef><h3 class="res__section-title" data-v-de0bb8ef> Reservations <span class="ui-badge ui-badge--info" data-v-de0bb8ef>${ssrInterpolate(props.reservations.length)}</span></h3><div class="res__timeline" data-v-de0bb8ef>`);
			if (!props.reservations.length) _push(`<div class="res__empty" data-v-de0bb8ef>No reservations for this date.</div>`);
			else _push(`<!---->`);
			_push(`<!--[-->`);
			ssrRenderList(props.reservations, (r) => {
				_push(`<div class="${ssrRenderClass(["res__card--" + r.status, "res__card"])}" data-v-de0bb8ef><div class="res__card-time" data-v-de0bb8ef><span class="res__time" data-v-de0bb8ef>${ssrInterpolate(fmtTime(r.reserved_at))}</span><span class="res__dur" data-v-de0bb8ef>${ssrInterpolate(r.duration_minutes)}min</span></div><div class="res__card-body" data-v-de0bb8ef><div class="res__card-name" data-v-de0bb8ef>${ssrInterpolate(r.guest_name)}</div><div class="res__card-meta" data-v-de0bb8ef><span data-v-de0bb8ef>👥 ${ssrInterpolate(r.party_size)}</span>`);
				if (r.table_number) _push(`<span data-v-de0bb8ef>🪑 ${ssrInterpolate(r.table_number)}</span>`);
				else _push(`<!---->`);
				if (r.phone) _push(`<span data-v-de0bb8ef>📞 ${ssrInterpolate(r.guest_phone)}</span>`);
				else _push(`<!---->`);
				if (r.occasion) _push(`<span data-v-de0bb8ef>🎉 ${ssrInterpolate(r.occasion)}</span>`);
				else _push(`<!---->`);
				_push(`</div>`);
				if (r.notes) _push(`<div class="res__card-notes" data-v-de0bb8ef>${ssrInterpolate(r.notes)}</div>`);
				else _push(`<!---->`);
				_push(`</div><div class="res__card-actions" data-v-de0bb8ef><span class="${ssrRenderClass([statusBadge(r.status), "ui-badge"])}" data-v-de0bb8ef>${ssrInterpolate(r.status)}</span>`);
				if (unref(can)("reservations.update")) _push(`<button class="ui-btn ui-btn--ghost ui-btn--sm" data-v-de0bb8ef>Edit</button>`);
				else _push(`<!---->`);
				if (r.guest_phone) _push(`<a class="ui-btn ui-btn--ghost ui-btn--sm"${ssrRenderAttr("href", reservationNotifyUrl(r))} target="_blank" rel="noopener" data-v-de0bb8ef>Notify</a>`);
				else _push(`<!---->`);
				if (unref(can)("reservations.delete")) _push(`<button class="ui-btn ui-btn--danger ui-btn--sm" data-v-de0bb8ef>✕</button>`);
				else _push(`<!---->`);
				_push(`</div></div>`);
			});
			_push(`<!--]--></div></div><div class="res__section" data-v-de0bb8ef><h3 class="res__section-title" data-v-de0bb8ef> Waitlist <span class="ui-badge ui-badge--warning" data-v-de0bb8ef>${ssrInterpolate(props.waitlist.length)}</span></h3><div class="res__waitlist" data-v-de0bb8ef>`);
			if (!props.waitlist.length) _push(`<div class="res__empty" data-v-de0bb8ef>Waitlist is empty.</div>`);
			else _push(`<!---->`);
			_push(`<!--[-->`);
			ssrRenderList(props.waitlist, (entry, idx) => {
				_push(`<div class="res__wait-card" data-v-de0bb8ef><div class="res__wait-pos" data-v-de0bb8ef>${ssrInterpolate(idx + 1)}</div><div class="res__wait-body" data-v-de0bb8ef><div class="res__wait-name" data-v-de0bb8ef>${ssrInterpolate(entry.guest_name)}</div><div class="res__wait-meta" data-v-de0bb8ef><span data-v-de0bb8ef>👥 ${ssrInterpolate(entry.party_size)}</span>`);
				if (entry.guest_phone) _push(`<span data-v-de0bb8ef>📞 ${ssrInterpolate(entry.guest_phone)}</span>`);
				else _push(`<!---->`);
				_push(`<span class="res__wait-time" data-v-de0bb8ef>⏱ ${ssrInterpolate(entry.wait_minutes)}min waiting</span>`);
				if (entry.estimated_wait_minutes) _push(`<span class="res__wait-est" data-v-de0bb8ef> Est: ${ssrInterpolate(entry.estimated_wait_minutes)}min </span>`);
				else _push(`<!---->`);
				if (entry.status === "seated") _push(`<span class="ui-badge ui-badge--success" data-v-de0bb8ef>Seated</span>`);
				else if (entry.notified_at) _push(`<span class="ui-badge ui-badge--success" data-v-de0bb8ef>🔔 Notified</span>`);
				else _push(`<!---->`);
				_push(`</div></div><div class="res__wait-actions" data-v-de0bb8ef>`);
				if (entry.status === "waiting") _push(`<button class="ui-btn ui-btn--success ui-btn--sm" data-v-de0bb8ef>Seat</button>`);
				else _push(`<!---->`);
				if (entry.status === "waiting") _push(`<!--[--><button class="ui-btn ui-btn--ghost ui-btn--sm" data-v-de0bb8ef>Edit</button><button class="ui-btn ui-btn--ghost ui-btn--sm"${ssrIncludeBooleanAttr(!!entry.notified_at) ? " disabled" : ""} data-v-de0bb8ef>${ssrInterpolate(entry.notified_at ? "Notified ✓" : "Notify")}</button><button class="ui-btn ui-btn--danger ui-btn--sm" data-v-de0bb8ef>✕</button><!--]-->`);
				else _push(`<!---->`);
				_push(`</div></div>`);
			});
			_push(`<!--]--></div></div></div>`);
			_push(ssrRenderComponent(Modal_default, {
				modelValue: showModal.value,
				"onUpdate:modelValue": ($event) => showModal.value = $event,
				title: unref(form).id ? "Edit Reservation" : "New Reservation",
				width: "640px"
			}, {
				footer: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<button class="ui-btn ui-btn--ghost" data-v-de0bb8ef${_scopeId}>Cancel</button><button class="ui-btn ui-btn--primary"${ssrIncludeBooleanAttr(unref(form).processing) ? " disabled" : ""} data-v-de0bb8ef${_scopeId}>Save</button>`);
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
						_push(`<div class="form-grid-2" data-v-de0bb8ef${_scopeId}>`);
						_push(ssrRenderComponent(CustomerPicker_default, {
							modelValue: unref(form).customer_id,
							"onUpdate:modelValue": ($event) => unref(form).customer_id = $event,
							label: "Guest Name *",
							placeholder: "Type a name or select a customer",
							"initial-name": unref(form).guest_name,
							error: unref(form).errors.guest_name,
							onTyped: ($event) => unref(form).guest_name = $event,
							onPicked: onCustomerPicked
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
									_push(`<option value="" data-v-de0bb8ef${_scopeId}>— No specific table —</option><!--[-->`);
									ssrRenderList(props.tables, (t) => {
										_push(`<option${ssrRenderAttr("value", t.id)} data-v-de0bb8ef${_scopeId}>${ssrInterpolate(t.table_number)} (cap. ${ssrInterpolate(t.capacity)}) </option>`);
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
									_push(`<option value="" data-v-de0bb8ef${_scopeId}>Select branch</option><!--[-->`);
									ssrRenderList(props.branches, (b) => {
										_push(`<option${ssrRenderAttr("value", b.id)} data-v-de0bb8ef${_scopeId}>${ssrInterpolate(b.name)}</option>`);
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
										_push(`<option${ssrRenderAttr("value", s)} data-v-de0bb8ef${_scopeId}>${ssrInterpolate(s)}</option>`);
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
						createVNode(CustomerPicker_default, {
							modelValue: unref(form).customer_id,
							"onUpdate:modelValue": ($event) => unref(form).customer_id = $event,
							label: "Guest Name *",
							placeholder: "Type a name or select a customer",
							"initial-name": unref(form).guest_name,
							error: unref(form).errors.guest_name,
							onTyped: ($event) => unref(form).guest_name = $event,
							onPicked: onCustomerPicked
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"initial-name",
							"error",
							"onTyped"
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
				title: unref(wlForm).id ? "Edit Waitlist Entry" : "Add to Waitlist",
				width: "480px"
			}, {
				footer: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<button class="ui-btn ui-btn--ghost" data-v-de0bb8ef${_scopeId}>Cancel</button><button class="ui-btn ui-btn--primary"${ssrIncludeBooleanAttr(unref(wlForm).processing) ? " disabled" : ""} data-v-de0bb8ef${_scopeId}>${ssrInterpolate(unref(wlForm).id ? "Save Changes" : "Add to Waitlist")}</button>`);
					else return [createVNode("button", {
						class: "ui-btn ui-btn--ghost",
						onClick: ($event) => showWaitlistModal.value = false
					}, "Cancel", 8, ["onClick"]), createVNode("button", {
						class: "ui-btn ui-btn--primary",
						disabled: unref(wlForm).processing,
						onClick: saveWaitlist
					}, toDisplayString(unref(wlForm).id ? "Save Changes" : "Add to Waitlist"), 9, ["disabled"])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(ssrRenderComponent(CustomerPicker_default, {
							modelValue: unref(wlForm).customer_id,
							"onUpdate:modelValue": ($event) => unref(wlForm).customer_id = $event,
							label: "Guest Name *",
							placeholder: "Type a name or select a customer",
							"initial-name": unref(wlForm).guest_name,
							error: unref(wlForm).errors.guest_name,
							onTyped: ($event) => unref(wlForm).guest_name = $event,
							onPicked: onWaitlistCustomerPicked
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
									_push(`<option value="" data-v-de0bb8ef${_scopeId}>Select branch</option><!--[-->`);
									ssrRenderList(props.branches, (b) => {
										_push(`<option${ssrRenderAttr("value", b.id)} data-v-de0bb8ef${_scopeId}>${ssrInterpolate(b.name)}</option>`);
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
						createVNode(CustomerPicker_default, {
							modelValue: unref(wlForm).customer_id,
							"onUpdate:modelValue": ($event) => unref(wlForm).customer_id = $event,
							label: "Guest Name *",
							placeholder: "Type a name or select a customer",
							"initial-name": unref(wlForm).guest_name,
							error: unref(wlForm).errors.guest_name,
							onTyped: ($event) => unref(wlForm).guest_name = $event,
							onPicked: onWaitlistCustomerPicked
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"initial-name",
							"error",
							"onTyped"
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
var Index_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-de0bb8ef"]]);
//#endregion
export { Index_default as default };
