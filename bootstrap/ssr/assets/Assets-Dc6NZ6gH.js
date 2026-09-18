import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-BOaGB7Aw.js";
import { n as confirmDialog } from "./useNotifications-CvzCW6Mx.js";
import { n as usePermissions, t as AdminLayout_default } from "./AdminLayout-BhC2A239.js";
import { t as _sfc_main$1 } from "./PageHeader-D0aRDn5C.js";
import { t as DataTable_default } from "./DataTable-DQdMyI8_.js";
import { t as Pagination_default } from "./Pagination-CHJUzz_w.js";
import { t as Modal_default } from "./Modal-CpmFAnsY.js";
import { t as _sfc_main$2 } from "./FormField-Doe8oR1s.js";
import { Fragment, computed, createBlock, createCommentVNode, createTextVNode, createVNode, mergeProps, openBlock, ref, renderList, toDisplayString, unref, useSSRContext, watch, withCtx } from "vue";
import { router, useForm } from "@inertiajs/vue3";
import { ssrIncludeBooleanAttr, ssrInterpolate, ssrLooseContain, ssrLooseEqual, ssrRenderAttr, ssrRenderAttrs, ssrRenderClass, ssrRenderComponent, ssrRenderList, ssrRenderStyle } from "vue/server-renderer";
//#region resources/js/pages/Maintenance/Assets.vue
var _sfc_main = /*@__PURE__*/ Object.assign({ layout: AdminLayout_default }, {
	__name: "Assets",
	__ssrInlineRender: true,
	props: {
		assets: {
			type: Object,
			default: () => ({ data: [] })
		},
		branches: {
			type: Array,
			default: () => []
		},
		vendors: {
			type: Array,
			default: () => []
		},
		categories: {
			type: Array,
			default: () => []
		},
		statuses: {
			type: Array,
			default: () => []
		},
		summary: {
			type: Object,
			default: () => ({
				total: 0,
				active: 0,
				under_maintenance: 0,
				maintenance_due: 0,
				warranty_expiring: 0
			})
		},
		filters: {
			type: Object,
			default: () => ({})
		}
	},
	setup(__props) {
		const { can } = usePermissions();
		const props = __props;
		const columns = [
			{
				key: "name",
				label: "Asset"
			},
			{
				key: "category",
				label: "Category"
			},
			{
				key: "branch_name",
				label: "Branch"
			},
			{
				key: "vendor_name",
				label: "Vendor"
			},
			{
				key: "warranty_expiry",
				label: "Warranty"
			},
			{
				key: "next_maintenance_date",
				label: "Next Service"
			},
			{
				key: "purchase_cost",
				label: "Cost"
			},
			{
				key: "status",
				label: "Status"
			}
		];
		const assets = computed(() => props.assets?.data ?? []);
		const search = ref(props.filters?.search ?? "");
		const categoryFilter = ref(props.filters?.category ?? "");
		const statusFilter = ref(props.filters?.status ?? "");
		const branchFilter = ref(props.filters?.branch_id ?? "");
		const flag = ref(props.filters?.flag ?? "");
		let timer = null;
		const reload = () => router.get("/maintenance/assets", {
			search: search.value || void 0,
			category: categoryFilter.value || void 0,
			status: statusFilter.value || void 0,
			branch_id: branchFilter.value || void 0,
			flag: flag.value || void 0
		}, {
			preserveState: true,
			preserveScroll: true,
			replace: true,
			only: [
				"assets",
				"summary",
				"filters"
			]
		});
		watch([
			search,
			categoryFilter,
			statusFilter,
			branchFilter,
			flag
		], () => {
			clearTimeout(timer);
			timer = setTimeout(reload, 300);
		});
		const CATEGORY_LABELS = {
			kitchen_equipment: "Kitchen Equipment",
			refrigeration: "Refrigeration",
			hvac: "HVAC",
			pos_hardware: "POS Hardware",
			furniture: "Furniture",
			vehicle: "Vehicle",
			utility: "Utility",
			other: "Other"
		};
		const catLabel = (c) => CATEGORY_LABELS[c] ?? c;
		const statusLabel = (s) => ({
			active: "Active",
			service_due: "Service Due",
			under_maintenance: "Under Maintenance",
			retired: "Retired",
			disposed: "Disposed"
		})[s] ?? s;
		const statusClass = (s) => ({
			active: "ui-badge--success",
			service_due: "ui-badge--warning",
			under_maintenance: "ui-badge--info",
			retired: "ui-badge--muted",
			disposed: "ui-badge--danger"
		})[s] ?? "ui-badge--muted";
		const defaults = () => ({
			id: null,
			name: "",
			category: "kitchen_equipment",
			branch_id: "",
			location: "",
			serial_number: "",
			vendor_id: "",
			purchase_date: "",
			purchase_cost: 0,
			warranty_expiry: "",
			status: "active",
			maintenance_interval_days: "",
			last_maintenance_date: "",
			notes: ""
		});
		const showModal = ref(false);
		const form = useForm(defaults());
		const openCreate = () => {
			form.defaults(defaults());
			form.reset();
			form.clearErrors();
			showModal.value = true;
		};
		const openEdit = (row) => {
			form.id = row.id;
			form.name = row.name ?? "";
			form.category = row.category ?? "other";
			form.branch_id = row.branch_id ?? "";
			form.location = row.location ?? "";
			form.serial_number = row.serial_number ?? "";
			form.vendor_id = row.vendor_id ?? "";
			form.purchase_date = date(row.purchase_date);
			form.purchase_cost = row.purchase_cost ?? 0;
			form.warranty_expiry = date(row.warranty_expiry);
			form.status = row.status ?? "active";
			form.maintenance_interval_days = row.maintenance_interval_days ?? "";
			form.last_maintenance_date = date(row.last_maintenance_date);
			form.notes = row.notes ?? "";
			form.clearErrors();
			showModal.value = true;
		};
		const save = () => {
			const opts = {
				preserveScroll: true,
				onSuccess: () => showModal.value = false
			};
			if (form.id) form.put(`/maintenance/assets/${form.id}`, opts);
			else form.post("/maintenance/assets", opts);
		};
		const del = async (row) => {
			if (!await confirmDialog(`Delete asset "${row.name}"? Its maintenance history will be removed too.`)) return;
			router.delete(`/maintenance/assets/${row.id}`, { preserveScroll: true });
		};
		const fmt = (v) => "Rs " + Number(v || 0).toLocaleString("en-PK", { minimumFractionDigits: 2 });
		const fmtDate = (v) => v ? new Date(v).toLocaleDateString() : "—";
		const date = (v) => v ? String(v).slice(0, 10) : "";
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "page" }, _attrs))} data-v-377b8cb5>`);
			_push(ssrRenderComponent(_sfc_main$1, {
				title: "Assets",
				subtitle: "Your equipment register — ovens, refrigeration, POS hardware and more, with warranty and preventive-service tracking per outlet."
			}, {
				actions: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						if (unref(can)("maintenance.assets.create")) _push(`<button class="ui-btn ui-btn--primary" data-v-377b8cb5${_scopeId}>+ New Asset</button>`);
						else _push(`<!---->`);
					} else return [unref(can)("maintenance.assets.create") ? (openBlock(), createBlock("button", {
						key: 0,
						class: "ui-btn ui-btn--primary",
						onClick: openCreate
					}, "+ New Asset")) : createCommentVNode("", true)];
				}),
				_: 1
			}, _parent));
			_push(`<div class="am__kpis" data-v-377b8cb5><div class="am__kpi" data-v-377b8cb5><span class="am__kpi-label" data-v-377b8cb5>Total Assets</span><span class="am__kpi-val" data-v-377b8cb5>${ssrInterpolate(props.summary.total)}</span><span class="am__kpi-sub" data-v-377b8cb5>in the register</span></div><div class="am__kpi" data-v-377b8cb5><span class="am__kpi-label" data-v-377b8cb5>Active</span><span class="am__kpi-val" data-v-377b8cb5>${ssrInterpolate(props.summary.active)}</span><span class="am__kpi-sub" data-v-377b8cb5>in service</span></div><div class="am__kpi am__kpi--info" data-v-377b8cb5><span class="am__kpi-label" data-v-377b8cb5>Under Maintenance</span><span class="am__kpi-val" data-v-377b8cb5>${ssrInterpolate(props.summary.under_maintenance)}</span><span class="am__kpi-sub" data-v-377b8cb5>currently down</span></div><button type="button" class="${ssrRenderClass([{ "am__kpi--on": flag.value === "due" }, "am__kpi am__kpi--warn am__kpi--btn"])}" data-v-377b8cb5><span class="am__kpi-label" data-v-377b8cb5>Service Due</span><span class="am__kpi-val" data-v-377b8cb5>${ssrInterpolate(props.summary.maintenance_due)}</span><span class="am__kpi-sub" data-v-377b8cb5>overdue or flagged</span></button><button type="button" class="${ssrRenderClass([{ "am__kpi--on": flag.value === "warranty" }, "am__kpi am__kpi--danger am__kpi--btn"])}" data-v-377b8cb5><span class="am__kpi-label" data-v-377b8cb5>Warranty ≤ 30d</span><span class="am__kpi-val" data-v-377b8cb5>${ssrInterpolate(props.summary.warranty_expiring)}</span><span class="am__kpi-sub" data-v-377b8cb5>expiring soon</span></button></div><div class="am__filters" data-v-377b8cb5><input${ssrRenderAttr("value", search.value)} class="ui-input am__search" placeholder="Search name / code / serial…" data-v-377b8cb5><select class="ui-input" style="${ssrRenderStyle({ "width": "180px" })}" data-v-377b8cb5><option value="" data-v-377b8cb5${ssrIncludeBooleanAttr(Array.isArray(categoryFilter.value) ? ssrLooseContain(categoryFilter.value, "") : ssrLooseEqual(categoryFilter.value, "")) ? " selected" : ""}>All Categories</option><!--[-->`);
			ssrRenderList(props.categories, (c) => {
				_push(`<option${ssrRenderAttr("value", c)} data-v-377b8cb5${ssrIncludeBooleanAttr(Array.isArray(categoryFilter.value) ? ssrLooseContain(categoryFilter.value, c) : ssrLooseEqual(categoryFilter.value, c)) ? " selected" : ""}>${ssrInterpolate(catLabel(c))}</option>`);
			});
			_push(`<!--]--></select><select class="ui-input" style="${ssrRenderStyle({ "width": "170px" })}" data-v-377b8cb5><option value="" data-v-377b8cb5${ssrIncludeBooleanAttr(Array.isArray(statusFilter.value) ? ssrLooseContain(statusFilter.value, "") : ssrLooseEqual(statusFilter.value, "")) ? " selected" : ""}>All Statuses</option><!--[-->`);
			ssrRenderList(props.statuses, (s) => {
				_push(`<option${ssrRenderAttr("value", s)} data-v-377b8cb5${ssrIncludeBooleanAttr(Array.isArray(statusFilter.value) ? ssrLooseContain(statusFilter.value, s) : ssrLooseEqual(statusFilter.value, s)) ? " selected" : ""}>${ssrInterpolate(statusLabel(s))}</option>`);
			});
			_push(`<!--]--></select><select class="ui-input" style="${ssrRenderStyle({ "width": "190px" })}" data-v-377b8cb5><option value="" data-v-377b8cb5${ssrIncludeBooleanAttr(Array.isArray(branchFilter.value) ? ssrLooseContain(branchFilter.value, "") : ssrLooseEqual(branchFilter.value, "")) ? " selected" : ""}>All Branches</option><!--[-->`);
			ssrRenderList(props.branches, (branch) => {
				_push(`<option${ssrRenderAttr("value", branch.id)} data-v-377b8cb5${ssrIncludeBooleanAttr(Array.isArray(branchFilter.value) ? ssrLooseContain(branchFilter.value, branch.id) : ssrLooseEqual(branchFilter.value, branch.id)) ? " selected" : ""}>${ssrInterpolate(branch.name)}</option>`);
			});
			_push(`<!--]--></select><select class="ui-input" style="${ssrRenderStyle({ "width": "180px" })}" data-v-377b8cb5><option value="" data-v-377b8cb5${ssrIncludeBooleanAttr(Array.isArray(flag.value) ? ssrLooseContain(flag.value, "") : ssrLooseEqual(flag.value, "")) ? " selected" : ""}>All Service Status</option><option value="due" data-v-377b8cb5${ssrIncludeBooleanAttr(Array.isArray(flag.value) ? ssrLooseContain(flag.value, "due") : ssrLooseEqual(flag.value, "due")) ? " selected" : ""}>Service Due</option><option value="warranty" data-v-377b8cb5${ssrIncludeBooleanAttr(Array.isArray(flag.value) ? ssrLooseContain(flag.value, "warranty") : ssrLooseEqual(flag.value, "warranty")) ? " selected" : ""}>Warranty ≤ 30d</option></select></div>`);
			_push(ssrRenderComponent(DataTable_default, {
				columns,
				rows: assets.value,
				index: "",
				"empty-text": "No assets found. Add your first piece of equipment."
			}, {
				"cell:name": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<strong data-v-377b8cb5${_scopeId}>${ssrInterpolate(row.name)}</strong><span class="am__code" data-v-377b8cb5${_scopeId}>${ssrInterpolate(row.asset_code)}</span>`);
						if (row.location) _push(`<span class="am__muted" data-v-377b8cb5${_scopeId}> · ${ssrInterpolate(row.location)}</span>`);
						else _push(`<!---->`);
					} else return [
						createVNode("strong", null, toDisplayString(row.name), 1),
						createVNode("span", { class: "am__code" }, toDisplayString(row.asset_code), 1),
						row.location ? (openBlock(), createBlock("span", {
							key: 0,
							class: "am__muted"
						}, " · " + toDisplayString(row.location), 1)) : createCommentVNode("", true)
					];
				}),
				"cell:category": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) _push(`${ssrInterpolate(catLabel(value))}`);
					else return [createTextVNode(toDisplayString(catLabel(value)), 1)];
				}),
				"cell:warranty_expiry": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						if (row.warranty_expiry) {
							_push(`<span data-v-377b8cb5${_scopeId}>${ssrInterpolate(fmtDate(row.warranty_expiry))} `);
							if (row.is_warranty_expiring) _push(`<span class="ui-badge ui-badge--danger am__pill" data-v-377b8cb5${_scopeId}>Expiring</span>`);
							else _push(`<!---->`);
							_push(`</span>`);
						} else _push(`<span class="am__muted" data-v-377b8cb5${_scopeId}>—</span>`);
					} else return [row.warranty_expiry ? (openBlock(), createBlock("span", { key: 0 }, [createTextVNode(toDisplayString(fmtDate(row.warranty_expiry)) + " ", 1), row.is_warranty_expiring ? (openBlock(), createBlock("span", {
						key: 0,
						class: "ui-badge ui-badge--danger am__pill"
					}, "Expiring")) : createCommentVNode("", true)])) : (openBlock(), createBlock("span", {
						key: 1,
						class: "am__muted"
					}, "—"))];
				}),
				"cell:next_maintenance_date": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						if (row.next_maintenance_date) {
							_push(`<span data-v-377b8cb5${_scopeId}>${ssrInterpolate(fmtDate(row.next_maintenance_date))} `);
							if (row.is_maintenance_due) _push(`<span class="ui-badge ui-badge--warning am__pill" data-v-377b8cb5${_scopeId}>Due</span>`);
							else _push(`<!---->`);
							_push(`</span>`);
						} else _push(`<span class="am__muted" data-v-377b8cb5${_scopeId}>—</span>`);
					} else return [row.next_maintenance_date ? (openBlock(), createBlock("span", { key: 0 }, [createTextVNode(toDisplayString(fmtDate(row.next_maintenance_date)) + " ", 1), row.is_maintenance_due ? (openBlock(), createBlock("span", {
						key: 0,
						class: "ui-badge ui-badge--warning am__pill"
					}, "Due")) : createCommentVNode("", true)])) : (openBlock(), createBlock("span", {
						key: 1,
						class: "am__muted"
					}, "—"))];
				}),
				"cell:purchase_cost": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) _push(`${ssrInterpolate(fmt(value))}`);
					else return [createTextVNode(toDisplayString(fmt(value)), 1)];
				}),
				"cell:status": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) _push(`<span class="${ssrRenderClass([statusClass(value), "ui-badge"])}" data-v-377b8cb5${_scopeId}>${ssrInterpolate(statusLabel(value))}</span>`);
					else return [createVNode("span", { class: ["ui-badge", statusClass(value)] }, toDisplayString(statusLabel(value)), 3)];
				}),
				actions: withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						if (unref(can)("maintenance.assets.update")) _push(`<button class="ui-btn ui-btn--ghost ui-btn--sm" data-v-377b8cb5${_scopeId}>Edit</button>`);
						else _push(`<!---->`);
						if (unref(can)("maintenance.assets.delete")) _push(`<button class="ui-btn ui-btn--danger ui-btn--sm" data-v-377b8cb5${_scopeId}>Delete</button>`);
						else _push(`<!---->`);
					} else return [unref(can)("maintenance.assets.update") ? (openBlock(), createBlock("button", {
						key: 0,
						class: "ui-btn ui-btn--ghost ui-btn--sm",
						onClick: ($event) => openEdit(row)
					}, "Edit", 8, ["onClick"])) : createCommentVNode("", true), unref(can)("maintenance.assets.delete") ? (openBlock(), createBlock("button", {
						key: 1,
						class: "ui-btn ui-btn--danger ui-btn--sm",
						onClick: ($event) => del(row)
					}, "Delete", 8, ["onClick"])) : createCommentVNode("", true)];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(Pagination_default, {
				paginator: props.assets,
				only: ["assets"]
			}, null, _parent));
			_push(ssrRenderComponent(Modal_default, {
				modelValue: showModal.value,
				"onUpdate:modelValue": ($event) => showModal.value = $event,
				title: unref(form).id ? "Edit Asset" : "New Asset",
				width: "720px"
			}, {
				footer: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<button class="ui-btn ui-btn--ghost" data-v-377b8cb5${_scopeId}>Cancel</button><button class="ui-btn ui-btn--primary"${ssrIncludeBooleanAttr(unref(form).processing) ? " disabled" : ""} data-v-377b8cb5${_scopeId}>Save</button>`);
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
						_push(`<div class="form-grid-2" data-v-377b8cb5${_scopeId}>`);
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).name,
							"onUpdate:modelValue": ($event) => unref(form).name = $event,
							label: "Name *",
							placeholder: "e.g. Rational Combi Oven",
							error: unref(form).errors.name
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).category,
							"onUpdate:modelValue": ($event) => unref(form).category = $event,
							label: "Category *",
							type: "select",
							error: unref(form).errors.category
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) {
									_push(`<!--[-->`);
									ssrRenderList(props.categories, (c) => {
										_push(`<option${ssrRenderAttr("value", c)} data-v-377b8cb5${_scopeId}>${ssrInterpolate(catLabel(c))}</option>`);
									});
									_push(`<!--]-->`);
								} else return [(openBlock(true), createBlock(Fragment, null, renderList(props.categories, (c) => {
									return openBlock(), createBlock("option", {
										key: c,
										value: c
									}, toDisplayString(catLabel(c)), 9, ["value"]);
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
									_push(`<option value="" data-v-377b8cb5${_scopeId}>Current Outlet</option><!--[-->`);
									ssrRenderList(props.branches, (branch) => {
										_push(`<option${ssrRenderAttr("value", branch.id)} data-v-377b8cb5${_scopeId}>${ssrInterpolate(branch.name)}</option>`);
									});
									_push(`<!--]-->`);
								} else return [createVNode("option", { value: "" }, "Current Outlet"), (openBlock(true), createBlock(Fragment, null, renderList(props.branches, (branch) => {
									return openBlock(), createBlock("option", {
										key: branch.id,
										value: branch.id
									}, toDisplayString(branch.name), 9, ["value"]);
								}), 128))];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).location,
							"onUpdate:modelValue": ($event) => unref(form).location = $event,
							label: "Location",
							placeholder: "e.g. Main Kitchen",
							error: unref(form).errors.location
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).serial_number,
							"onUpdate:modelValue": ($event) => unref(form).serial_number = $event,
							label: "Serial Number",
							error: unref(form).errors.serial_number
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).vendor_id,
							"onUpdate:modelValue": ($event) => unref(form).vendor_id = $event,
							label: "Vendor / Supplier",
							type: "select",
							error: unref(form).errors.vendor_id
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) {
									_push(`<option value="" data-v-377b8cb5${_scopeId}>— None —</option><!--[-->`);
									ssrRenderList(props.vendors, (v) => {
										_push(`<option${ssrRenderAttr("value", v.id)} data-v-377b8cb5${_scopeId}>${ssrInterpolate(v.name)}</option>`);
									});
									_push(`<!--]-->`);
								} else return [createVNode("option", { value: "" }, "— None —"), (openBlock(true), createBlock(Fragment, null, renderList(props.vendors, (v) => {
									return openBlock(), createBlock("option", {
										key: v.id,
										value: v.id
									}, toDisplayString(v.name), 9, ["value"]);
								}), 128))];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).purchase_date,
							"onUpdate:modelValue": ($event) => unref(form).purchase_date = $event,
							label: "Purchase Date",
							type: "date",
							error: unref(form).errors.purchase_date
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).purchase_cost,
							"onUpdate:modelValue": ($event) => unref(form).purchase_cost = $event,
							modelModifiers: { number: true },
							label: "Purchase Cost",
							type: "number",
							step: "0.01",
							error: unref(form).errors.purchase_cost
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).warranty_expiry,
							"onUpdate:modelValue": ($event) => unref(form).warranty_expiry = $event,
							label: "Warranty Expiry",
							type: "date",
							error: unref(form).errors.warranty_expiry
						}, null, _parent, _scopeId));
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
										_push(`<option${ssrRenderAttr("value", s)} data-v-377b8cb5${_scopeId}>${ssrInterpolate(statusLabel(s))}</option>`);
									});
									_push(`<!--]-->`);
								} else return [(openBlock(true), createBlock(Fragment, null, renderList(props.statuses, (s) => {
									return openBlock(), createBlock("option", {
										key: s,
										value: s
									}, toDisplayString(statusLabel(s)), 9, ["value"]);
								}), 128))];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).maintenance_interval_days,
							"onUpdate:modelValue": ($event) => unref(form).maintenance_interval_days = $event,
							modelModifiers: { number: true },
							label: "Service Interval (days)",
							type: "number",
							step: "1",
							placeholder: "e.g. 90",
							error: unref(form).errors.maintenance_interval_days
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).last_maintenance_date,
							"onUpdate:modelValue": ($event) => unref(form).last_maintenance_date = $event,
							label: "Last Serviced",
							type: "date",
							error: unref(form).errors.last_maintenance_date
						}, null, _parent, _scopeId));
						_push(`</div><p class="am__hint" data-v-377b8cb5${_scopeId}>Next service is calculated from the last-serviced date (or purchase date) plus the interval.</p>`);
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).notes,
							"onUpdate:modelValue": ($event) => unref(form).notes = $event,
							label: "Notes",
							type: "textarea",
							error: unref(form).errors.notes
						}, null, _parent, _scopeId));
					} else return [
						createVNode("div", { class: "form-grid-2" }, [
							createVNode(_sfc_main$2, {
								modelValue: unref(form).name,
								"onUpdate:modelValue": ($event) => unref(form).name = $event,
								label: "Name *",
								placeholder: "e.g. Rational Combi Oven",
								error: unref(form).errors.name
							}, null, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"error"
							]),
							createVNode(_sfc_main$2, {
								modelValue: unref(form).category,
								"onUpdate:modelValue": ($event) => unref(form).category = $event,
								label: "Category *",
								type: "select",
								error: unref(form).errors.category
							}, {
								default: withCtx(() => [(openBlock(true), createBlock(Fragment, null, renderList(props.categories, (c) => {
									return openBlock(), createBlock("option", {
										key: c,
										value: c
									}, toDisplayString(catLabel(c)), 9, ["value"]);
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
								default: withCtx(() => [createVNode("option", { value: "" }, "Current Outlet"), (openBlock(true), createBlock(Fragment, null, renderList(props.branches, (branch) => {
									return openBlock(), createBlock("option", {
										key: branch.id,
										value: branch.id
									}, toDisplayString(branch.name), 9, ["value"]);
								}), 128))]),
								_: 1
							}, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"error"
							]),
							createVNode(_sfc_main$2, {
								modelValue: unref(form).location,
								"onUpdate:modelValue": ($event) => unref(form).location = $event,
								label: "Location",
								placeholder: "e.g. Main Kitchen",
								error: unref(form).errors.location
							}, null, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"error"
							]),
							createVNode(_sfc_main$2, {
								modelValue: unref(form).serial_number,
								"onUpdate:modelValue": ($event) => unref(form).serial_number = $event,
								label: "Serial Number",
								error: unref(form).errors.serial_number
							}, null, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"error"
							]),
							createVNode(_sfc_main$2, {
								modelValue: unref(form).vendor_id,
								"onUpdate:modelValue": ($event) => unref(form).vendor_id = $event,
								label: "Vendor / Supplier",
								type: "select",
								error: unref(form).errors.vendor_id
							}, {
								default: withCtx(() => [createVNode("option", { value: "" }, "— None —"), (openBlock(true), createBlock(Fragment, null, renderList(props.vendors, (v) => {
									return openBlock(), createBlock("option", {
										key: v.id,
										value: v.id
									}, toDisplayString(v.name), 9, ["value"]);
								}), 128))]),
								_: 1
							}, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"error"
							]),
							createVNode(_sfc_main$2, {
								modelValue: unref(form).purchase_date,
								"onUpdate:modelValue": ($event) => unref(form).purchase_date = $event,
								label: "Purchase Date",
								type: "date",
								error: unref(form).errors.purchase_date
							}, null, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"error"
							]),
							createVNode(_sfc_main$2, {
								modelValue: unref(form).purchase_cost,
								"onUpdate:modelValue": ($event) => unref(form).purchase_cost = $event,
								modelModifiers: { number: true },
								label: "Purchase Cost",
								type: "number",
								step: "0.01",
								error: unref(form).errors.purchase_cost
							}, null, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"error"
							]),
							createVNode(_sfc_main$2, {
								modelValue: unref(form).warranty_expiry,
								"onUpdate:modelValue": ($event) => unref(form).warranty_expiry = $event,
								label: "Warranty Expiry",
								type: "date",
								error: unref(form).errors.warranty_expiry
							}, null, 8, [
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
									}, toDisplayString(statusLabel(s)), 9, ["value"]);
								}), 128))]),
								_: 1
							}, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"error"
							]),
							createVNode(_sfc_main$2, {
								modelValue: unref(form).maintenance_interval_days,
								"onUpdate:modelValue": ($event) => unref(form).maintenance_interval_days = $event,
								modelModifiers: { number: true },
								label: "Service Interval (days)",
								type: "number",
								step: "1",
								placeholder: "e.g. 90",
								error: unref(form).errors.maintenance_interval_days
							}, null, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"error"
							]),
							createVNode(_sfc_main$2, {
								modelValue: unref(form).last_maintenance_date,
								"onUpdate:modelValue": ($event) => unref(form).last_maintenance_date = $event,
								label: "Last Serviced",
								type: "date",
								error: unref(form).errors.last_maintenance_date
							}, null, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"error"
							])
						]),
						createVNode("p", { class: "am__hint" }, "Next service is calculated from the last-serviced date (or purchase date) plus the interval."),
						createVNode(_sfc_main$2, {
							modelValue: unref(form).notes,
							"onUpdate:modelValue": ($event) => unref(form).notes = $event,
							label: "Notes",
							type: "textarea",
							error: unref(form).errors.notes
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
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/pages/Maintenance/Assets.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var Assets_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-377b8cb5"]]);
//#endregion
export { Assets_default as default };
