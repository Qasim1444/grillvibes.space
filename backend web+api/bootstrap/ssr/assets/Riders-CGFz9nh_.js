import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-BOaGB7Aw.js";
import { n as confirmDialog } from "./useNotifications-CvzCW6Mx.js";
import { n as usePermissions, t as AdminLayout_default } from "./AdminLayout-3d-mN_My.js";
import { t as _sfc_main$1 } from "./PageHeader-D0aRDn5C.js";
import { t as DataTable_default } from "./DataTable-DQdMyI8_.js";
import { t as Pagination_default } from "./Pagination-CHJUzz_w.js";
import { t as Modal_default } from "./Modal-CpmFAnsY.js";
import { t as _sfc_main$2 } from "./FormField-Doe8oR1s.js";
import { Fragment, computed, createBlock, createCommentVNode, createTextVNode, createVNode, mergeProps, openBlock, ref, renderList, toDisplayString, unref, useSSRContext, watch, withCtx } from "vue";
import { router, useForm } from "@inertiajs/vue3";
import { ssrIncludeBooleanAttr, ssrInterpolate, ssrRenderAttr, ssrRenderAttrs, ssrRenderClass, ssrRenderComponent, ssrRenderList } from "vue/server-renderer";
//#region resources/js/pages/Riders.vue
var _sfc_main = /*@__PURE__*/ Object.assign({ layout: AdminLayout_default }, {
	__name: "Riders",
	__ssrInlineRender: true,
	props: {
		riders: {
			type: Object,
			default: () => ({ data: [] })
		},
		deliveryOrders: {
			type: Array,
			default: () => []
		},
		deliveryStatuses: {
			type: Array,
			default: () => []
		},
		filters: {
			type: Object,
			default: () => ({ search: "" })
		},
		hasRiderRole: {
			type: Boolean,
			default: true
		}
	},
	setup(__props) {
		const props = __props;
		const { can } = usePermissions();
		const riderColumns = [
			{
				key: "name",
				label: "Name"
			},
			{
				key: "email",
				label: "Email"
			},
			{
				key: "phone",
				label: "Phone"
			},
			{
				key: "vehicle",
				label: "Vehicle"
			},
			{
				key: "is_available",
				label: "Availability"
			},
			{
				key: "active_deliveries_count",
				label: "Active"
			},
			{
				key: "delivered_count",
				label: "Delivered"
			},
			{
				key: "today_earning_total",
				label: "Today Earned"
			},
			{
				key: "earning_total",
				label: "Total Earned"
			},
			{
				key: "last_location_at",
				label: "Last Location"
			}
		];
		const orderColumns = [
			{
				key: "id",
				label: "Order",
				width: "80px"
			},
			{
				key: "customer",
				label: "Customer"
			},
			{
				key: "delivery_status",
				label: "Delivery"
			},
			{
				key: "rider",
				label: "Rider"
			},
			{
				key: "grand_total",
				label: "Total"
			},
			{
				key: "order_datetime",
				label: "Placed"
			}
		];
		const riders = computed(() => props.riders?.data ?? []);
		const deliveryOrders = computed(() => props.deliveryOrders ?? []);
		const availableRiders = computed(() => riders.value.filter((r) => r.is_available));
		const search = ref(props.filters?.search ?? "");
		let searchTimer = null;
		watch(search, (value) => {
			clearTimeout(searchTimer);
			searchTimer = setTimeout(() => {
				router.get("/riders", { search: value || void 0 }, {
					preserveState: true,
					preserveScroll: true,
					replace: true,
					only: ["riders", "filters"]
				});
			}, 300);
		});
		const showRiderModal = ref(false);
		const form = useForm({
			id: null,
			name: "",
			email: "",
			phone: "",
			address: "",
			password: "",
			vehicle_type: "",
			vehicle_number: "",
			is_available: true
		});
		const openCreate = () => {
			form.reset();
			form.clearErrors();
			form.id = null;
			form.is_available = true;
			showRiderModal.value = true;
		};
		const editRider = (rider) => {
			form.id = rider.id;
			form.name = rider.name || "";
			form.email = rider.email || "";
			form.phone = rider.phone || "";
			form.address = rider.address || "";
			form.password = "";
			form.vehicle_type = rider.vehicle_type || "";
			form.vehicle_number = rider.vehicle_number || "";
			form.is_available = !!rider.is_available;
			form.clearErrors();
			showRiderModal.value = true;
		};
		const saveRider = () => {
			const options = {
				preserveScroll: true,
				onSuccess: () => showRiderModal.value = false
			};
			if (form.id) form.put(`/riders/${form.id}`, options);
			else form.post("/riders", options);
		};
		const deleteRider = async (rider) => {
			if (!await confirmDialog(`Delete rider ${rider.name}?`)) return;
			router.delete(`/riders/${rider.id}`, { preserveScroll: true });
		};
		const showAssignModal = ref(false);
		const assigningOrder = ref(null);
		const assignForm = useForm({
			order_id: null,
			rider_id: ""
		});
		const openAssign = (order) => {
			assigningOrder.value = order;
			assignForm.order_id = order.id;
			assignForm.rider_id = order.rider_id || "";
			assignForm.clearErrors();
			showAssignModal.value = true;
		};
		const saveAssignment = () => {
			assignForm.post(`/riders/orders/${assignForm.order_id}/assign`, {
				preserveScroll: true,
				onSuccess: () => showAssignModal.value = false
			});
		};
		const unassign = async (order) => {
			if (!await confirmDialog(`Unassign order #${order.id}?`)) return;
			router.post(`/riders/orders/${order.id}/assign`, { rider_id: null }, { preserveScroll: true });
		};
		const money = (v) => `Rs ${Number(v || 0).toFixed(2)}`;
		const formatDate = (v) => v ? new Date(v).toLocaleString() : "—";
		const deliveryStatusLabel = (value) => String(value || "unassigned").replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
		const deliveryStatusClass = (value) => {
			if (value === "delivered") return "ui-badge--success";
			if ([
				"assigned",
				"accepted",
				"picked_up",
				"on_way"
			].includes(value)) return "ui-badge--info";
			if ([
				"rejected",
				"failed",
				"cancelled"
			].includes(value)) return "ui-badge--danger";
			return "ui-badge--muted";
		};
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "page" }, _attrs))} data-v-ba26c99e>`);
			_push(ssrRenderComponent(_sfc_main$1, {
				title: "Riders",
				subtitle: "Manage delivery riders and assign delivery orders."
			}, {
				actions: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						if (unref(can)("riders.create")) _push(`<button class="ui-btn ui-btn--primary" data-v-ba26c99e${_scopeId}>+ Add Rider</button>`);
						else _push(`<!---->`);
					} else return [unref(can)("riders.create") ? (openBlock(), createBlock("button", {
						key: 0,
						class: "ui-btn ui-btn--primary",
						onClick: openCreate
					}, "+ Add Rider")) : createCommentVNode("", true)];
				}),
				_: 1
			}, _parent));
			if (!__props.hasRiderRole) _push(`<div class="ui-alert ui-alert--warning" data-v-ba26c99e> Rider role will be created automatically when you add the first rider. </div>`);
			else _push(`<!---->`);
			_push(ssrRenderComponent(DataTable_default, {
				columns: riderColumns,
				rows: riders.value,
				index: "",
				searchable: "",
				query: search.value,
				"onUpdate:query": ($event) => search.value = $event,
				"search-placeholder": "Search riders...",
				"empty-text": "No riders found."
			}, {
				"cell:is_available": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) _push(`<span class="${ssrRenderClass([value ? "ui-badge--success" : "ui-badge--muted", "ui-badge"])}" data-v-ba26c99e${_scopeId}>${ssrInterpolate(value ? "Available" : "Unavailable")}</span>`);
					else return [createVNode("span", { class: ["ui-badge", value ? "ui-badge--success" : "ui-badge--muted"] }, toDisplayString(value ? "Available" : "Unavailable"), 3)];
				}),
				"cell:vehicle": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) _push(`<span data-v-ba26c99e${_scopeId}>${ssrInterpolate([row.vehicle_type, row.vehicle_number].filter(Boolean).join(" · ") || "—")}</span>`);
					else return [createVNode("span", null, toDisplayString([row.vehicle_type, row.vehicle_number].filter(Boolean).join(" · ") || "—"), 1)];
				}),
				"cell:last_location_at": withCtx(({ value, row }, _push, _parent, _scopeId) => {
					if (_push) {
						if (row.last_lat && row.last_lng) _push(`<span data-v-ba26c99e${_scopeId}>${ssrInterpolate(formatDate(value))}</span>`);
						else _push(`<span data-v-ba26c99e${_scopeId}>—</span>`);
					} else return [row.last_lat && row.last_lng ? (openBlock(), createBlock("span", { key: 0 }, toDisplayString(formatDate(value)), 1)) : (openBlock(), createBlock("span", { key: 1 }, "—"))];
				}),
				"cell:today_earning_total": withCtx(({ value, row }, _push, _parent, _scopeId) => {
					if (_push) _push(`<div class="riders-money" data-v-ba26c99e${_scopeId}><strong data-v-ba26c99e${_scopeId}>${ssrInterpolate(money(value))}</strong><small data-v-ba26c99e${_scopeId}>${ssrInterpolate(row.today_delivered_count || 0)} today</small></div>`);
					else return [createVNode("div", { class: "riders-money" }, [createVNode("strong", null, toDisplayString(money(value)), 1), createVNode("small", null, toDisplayString(row.today_delivered_count || 0) + " today", 1)])];
				}),
				"cell:earning_total": withCtx(({ value, row }, _push, _parent, _scopeId) => {
					if (_push) _push(`<div class="riders-money" data-v-ba26c99e${_scopeId}><strong data-v-ba26c99e${_scopeId}>${ssrInterpolate(money(value))}</strong><small data-v-ba26c99e${_scopeId}>${ssrInterpolate(money(row.delivered_sales_total))} sales</small></div>`);
					else return [createVNode("div", { class: "riders-money" }, [createVNode("strong", null, toDisplayString(money(value)), 1), createVNode("small", null, toDisplayString(money(row.delivered_sales_total)) + " sales", 1)])];
				}),
				actions: withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						if (unref(can)("riders.update")) _push(`<button class="ui-btn ui-btn--ghost ui-btn--sm" data-v-ba26c99e${_scopeId}>Edit</button>`);
						else _push(`<!---->`);
						if (unref(can)("riders.delete")) _push(`<button class="ui-btn ui-btn--danger ui-btn--sm" data-v-ba26c99e${_scopeId}>Delete</button>`);
						else _push(`<!---->`);
					} else return [unref(can)("riders.update") ? (openBlock(), createBlock("button", {
						key: 0,
						class: "ui-btn ui-btn--ghost ui-btn--sm",
						onClick: ($event) => editRider(row)
					}, "Edit", 8, ["onClick"])) : createCommentVNode("", true), unref(can)("riders.delete") ? (openBlock(), createBlock("button", {
						key: 1,
						class: "ui-btn ui-btn--danger ui-btn--sm",
						onClick: ($event) => deleteRider(row)
					}, "Delete", 8, ["onClick"])) : createCommentVNode("", true)];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(Pagination_default, {
				paginator: props.riders,
				only: ["riders"]
			}, null, _parent));
			_push(`<section class="riders-section" data-v-ba26c99e><div class="riders-section__head" data-v-ba26c99e><div data-v-ba26c99e><h2 data-v-ba26c99e>Delivery Orders</h2><p data-v-ba26c99e>Assign these orders to riders so they appear in the rider app.</p></div><button class="ui-btn ui-btn--ghost" data-v-ba26c99e>Refresh</button></div>`);
			_push(ssrRenderComponent(DataTable_default, {
				columns: orderColumns,
				rows: deliveryOrders.value,
				index: "",
				"empty-text": "No active delivery orders found."
			}, {
				"cell:customer": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) _push(`<div class="riders-customer" data-v-ba26c99e${_scopeId}><strong data-v-ba26c99e${_scopeId}>${ssrInterpolate(row.customer?.name || "Guest")}</strong><span data-v-ba26c99e${_scopeId}>${ssrInterpolate(row.customer?.contact || "No phone")}</span><small data-v-ba26c99e${_scopeId}>${ssrInterpolate(row.customer?.address || "No address")}</small></div>`);
					else return [createVNode("div", { class: "riders-customer" }, [
						createVNode("strong", null, toDisplayString(row.customer?.name || "Guest"), 1),
						createVNode("span", null, toDisplayString(row.customer?.contact || "No phone"), 1),
						createVNode("small", null, toDisplayString(row.customer?.address || "No address"), 1)
					])];
				}),
				"cell:delivery_status": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) _push(`<span class="${ssrRenderClass([deliveryStatusClass(value), "ui-badge"])}" data-v-ba26c99e${_scopeId}>${ssrInterpolate(deliveryStatusLabel(value))}</span>`);
					else return [createVNode("span", { class: ["ui-badge", deliveryStatusClass(value)] }, toDisplayString(deliveryStatusLabel(value)), 3)];
				}),
				"cell:rider": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						if (row.rider) _push(`<span data-v-ba26c99e${_scopeId}>${ssrInterpolate(row.rider.name)}</span>`);
						else _push(`<span class="muted" data-v-ba26c99e${_scopeId}>Unassigned</span>`);
					} else return [row.rider ? (openBlock(), createBlock("span", { key: 0 }, toDisplayString(row.rider.name), 1)) : (openBlock(), createBlock("span", {
						key: 1,
						class: "muted"
					}, "Unassigned"))];
				}),
				"cell:grand_total": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) _push(`${ssrInterpolate(money(value))}`);
					else return [createTextVNode(toDisplayString(money(value)), 1)];
				}),
				"cell:order_datetime": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) _push(`${ssrInterpolate(formatDate(value))}`);
					else return [createTextVNode(toDisplayString(formatDate(value)), 1)];
				}),
				actions: withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						if (unref(can)("riders.update")) _push(`<button class="ui-btn ui-btn--secondary ui-btn--sm" data-v-ba26c99e${_scopeId}> Assign </button>`);
						else _push(`<!---->`);
						if (unref(can)("riders.update") && row.rider_id) _push(`<button class="ui-btn ui-btn--ghost ui-btn--sm" data-v-ba26c99e${_scopeId}> Unassign </button>`);
						else _push(`<!---->`);
					} else return [unref(can)("riders.update") ? (openBlock(), createBlock("button", {
						key: 0,
						class: "ui-btn ui-btn--secondary ui-btn--sm",
						onClick: ($event) => openAssign(row)
					}, " Assign ", 8, ["onClick"])) : createCommentVNode("", true), unref(can)("riders.update") && row.rider_id ? (openBlock(), createBlock("button", {
						key: 1,
						class: "ui-btn ui-btn--ghost ui-btn--sm",
						onClick: ($event) => unassign(row)
					}, " Unassign ", 8, ["onClick"])) : createCommentVNode("", true)];
				}),
				_: 1
			}, _parent));
			_push(`</section>`);
			_push(ssrRenderComponent(Modal_default, {
				modelValue: showRiderModal.value,
				"onUpdate:modelValue": ($event) => showRiderModal.value = $event,
				title: unref(form).id ? "Edit Rider" : "Add Rider"
			}, {
				footer: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<button class="ui-btn ui-btn--ghost" data-v-ba26c99e${_scopeId}>Cancel</button><button class="ui-btn ui-btn--primary"${ssrIncludeBooleanAttr(unref(form).processing) ? " disabled" : ""} data-v-ba26c99e${_scopeId}>Save</button>`);
					else return [createVNode("button", {
						class: "ui-btn ui-btn--ghost",
						onClick: ($event) => showRiderModal.value = false
					}, "Cancel", 8, ["onClick"]), createVNode("button", {
						class: "ui-btn ui-btn--primary",
						disabled: unref(form).processing,
						onClick: saveRider
					}, "Save", 8, ["disabled"])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).name,
							"onUpdate:modelValue": ($event) => unref(form).name = $event,
							label: "Name",
							placeholder: "Rider name",
							error: unref(form).errors.name
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).email,
							"onUpdate:modelValue": ($event) => unref(form).email = $event,
							label: "Email",
							type: "email",
							placeholder: "rider@example.com",
							error: unref(form).errors.email
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).phone,
							"onUpdate:modelValue": ($event) => unref(form).phone = $event,
							label: "Phone",
							placeholder: "Phone",
							error: unref(form).errors.phone
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).address,
							"onUpdate:modelValue": ($event) => unref(form).address = $event,
							label: "Address",
							type: "textarea",
							placeholder: "Address",
							error: unref(form).errors.address
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).password,
							"onUpdate:modelValue": ($event) => unref(form).password = $event,
							label: unref(form).id ? "New Password (leave blank to keep current)" : "Password",
							type: "password",
							placeholder: "Password",
							error: unref(form).errors.password
						}, null, _parent, _scopeId));
						_push(`<div class="riders-grid" data-v-ba26c99e${_scopeId}>`);
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).vehicle_type,
							"onUpdate:modelValue": ($event) => unref(form).vehicle_type = $event,
							label: "Vehicle Type",
							placeholder: "Bike, Car...",
							error: unref(form).errors.vehicle_type
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).vehicle_number,
							"onUpdate:modelValue": ($event) => unref(form).vehicle_number = $event,
							label: "Vehicle Number",
							placeholder: "LEA-1234",
							error: unref(form).errors.vehicle_number
						}, null, _parent, _scopeId));
						_push(`</div>`);
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).is_available,
							"onUpdate:modelValue": ($event) => unref(form).is_available = $event,
							label: "Availability",
							type: "select",
							error: unref(form).errors.is_available
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(`<option${ssrRenderAttr("value", true)} data-v-ba26c99e${_scopeId}>Available</option><option${ssrRenderAttr("value", false)} data-v-ba26c99e${_scopeId}>Unavailable</option>`);
								else return [createVNode("option", { value: true }, "Available"), createVNode("option", { value: false }, "Unavailable")];
							}),
							_: 1
						}, _parent, _scopeId));
					} else return [
						createVNode(_sfc_main$2, {
							modelValue: unref(form).name,
							"onUpdate:modelValue": ($event) => unref(form).name = $event,
							label: "Name",
							placeholder: "Rider name",
							error: unref(form).errors.name
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode(_sfc_main$2, {
							modelValue: unref(form).email,
							"onUpdate:modelValue": ($event) => unref(form).email = $event,
							label: "Email",
							type: "email",
							placeholder: "rider@example.com",
							error: unref(form).errors.email
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode(_sfc_main$2, {
							modelValue: unref(form).phone,
							"onUpdate:modelValue": ($event) => unref(form).phone = $event,
							label: "Phone",
							placeholder: "Phone",
							error: unref(form).errors.phone
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode(_sfc_main$2, {
							modelValue: unref(form).address,
							"onUpdate:modelValue": ($event) => unref(form).address = $event,
							label: "Address",
							type: "textarea",
							placeholder: "Address",
							error: unref(form).errors.address
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode(_sfc_main$2, {
							modelValue: unref(form).password,
							"onUpdate:modelValue": ($event) => unref(form).password = $event,
							label: unref(form).id ? "New Password (leave blank to keep current)" : "Password",
							type: "password",
							placeholder: "Password",
							error: unref(form).errors.password
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"label",
							"error"
						]),
						createVNode("div", { class: "riders-grid" }, [createVNode(_sfc_main$2, {
							modelValue: unref(form).vehicle_type,
							"onUpdate:modelValue": ($event) => unref(form).vehicle_type = $event,
							label: "Vehicle Type",
							placeholder: "Bike, Car...",
							error: unref(form).errors.vehicle_type
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]), createVNode(_sfc_main$2, {
							modelValue: unref(form).vehicle_number,
							"onUpdate:modelValue": ($event) => unref(form).vehicle_number = $event,
							label: "Vehicle Number",
							placeholder: "LEA-1234",
							error: unref(form).errors.vehicle_number
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						])]),
						createVNode(_sfc_main$2, {
							modelValue: unref(form).is_available,
							"onUpdate:modelValue": ($event) => unref(form).is_available = $event,
							label: "Availability",
							type: "select",
							error: unref(form).errors.is_available
						}, {
							default: withCtx(() => [createVNode("option", { value: true }, "Available"), createVNode("option", { value: false }, "Unavailable")]),
							_: 1
						}, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						])
					];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(Modal_default, {
				modelValue: showAssignModal.value,
				"onUpdate:modelValue": ($event) => showAssignModal.value = $event,
				title: `Assign Order #${unref(assignForm).order_id || ""}`
			}, {
				footer: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<button class="ui-btn ui-btn--ghost" data-v-ba26c99e${_scopeId}>Cancel</button><button class="ui-btn ui-btn--primary"${ssrIncludeBooleanAttr(unref(assignForm).processing) ? " disabled" : ""} data-v-ba26c99e${_scopeId}>Save Assignment</button>`);
					else return [createVNode("button", {
						class: "ui-btn ui-btn--ghost",
						onClick: ($event) => showAssignModal.value = false
					}, "Cancel", 8, ["onClick"]), createVNode("button", {
						class: "ui-btn ui-btn--primary",
						disabled: unref(assignForm).processing,
						onClick: saveAssignment
					}, "Save Assignment", 8, ["disabled"])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						if (assigningOrder.value) _push(`<div class="assign-card" data-v-ba26c99e${_scopeId}><strong data-v-ba26c99e${_scopeId}>${ssrInterpolate(assigningOrder.value.customer?.name || "Guest")}</strong><span data-v-ba26c99e${_scopeId}>${ssrInterpolate(assigningOrder.value.customer?.address || "No address")}</span><small data-v-ba26c99e${_scopeId}>${ssrInterpolate(money(assigningOrder.value.grand_total))} · ${ssrInterpolate(deliveryStatusLabel(assigningOrder.value.delivery_status))}</small></div>`);
						else _push(`<!---->`);
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(assignForm).rider_id,
							"onUpdate:modelValue": ($event) => unref(assignForm).rider_id = $event,
							label: "Rider",
							type: "select",
							error: unref(assignForm).errors.rider_id
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) {
									_push(`<option value="" data-v-ba26c99e${_scopeId}>Unassigned</option><!--[-->`);
									ssrRenderList(availableRiders.value, (r) => {
										_push(`<option${ssrRenderAttr("value", r.id)} data-v-ba26c99e${_scopeId}>${ssrInterpolate(r.name)}${ssrInterpolate(r.vehicle_number ? ` · ${r.vehicle_number}` : "")}</option>`);
									});
									_push(`<!--]-->`);
								} else return [createVNode("option", { value: "" }, "Unassigned"), (openBlock(true), createBlock(Fragment, null, renderList(availableRiders.value, (r) => {
									return openBlock(), createBlock("option", {
										key: r.id,
										value: r.id
									}, toDisplayString(r.name) + toDisplayString(r.vehicle_number ? ` · ${r.vehicle_number}` : ""), 9, ["value"]);
								}), 128))];
							}),
							_: 1
						}, _parent, _scopeId));
					} else return [assigningOrder.value ? (openBlock(), createBlock("div", {
						key: 0,
						class: "assign-card"
					}, [
						createVNode("strong", null, toDisplayString(assigningOrder.value.customer?.name || "Guest"), 1),
						createVNode("span", null, toDisplayString(assigningOrder.value.customer?.address || "No address"), 1),
						createVNode("small", null, toDisplayString(money(assigningOrder.value.grand_total)) + " · " + toDisplayString(deliveryStatusLabel(assigningOrder.value.delivery_status)), 1)
					])) : createCommentVNode("", true), createVNode(_sfc_main$2, {
						modelValue: unref(assignForm).rider_id,
						"onUpdate:modelValue": ($event) => unref(assignForm).rider_id = $event,
						label: "Rider",
						type: "select",
						error: unref(assignForm).errors.rider_id
					}, {
						default: withCtx(() => [createVNode("option", { value: "" }, "Unassigned"), (openBlock(true), createBlock(Fragment, null, renderList(availableRiders.value, (r) => {
							return openBlock(), createBlock("option", {
								key: r.id,
								value: r.id
							}, toDisplayString(r.name) + toDisplayString(r.vehicle_number ? ` · ${r.vehicle_number}` : ""), 9, ["value"]);
						}), 128))]),
						_: 1
					}, 8, [
						"modelValue",
						"onUpdate:modelValue",
						"error"
					])];
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
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/pages/Riders.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var Riders_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-ba26c99e"]]);
//#endregion
export { Riders_default as default };
