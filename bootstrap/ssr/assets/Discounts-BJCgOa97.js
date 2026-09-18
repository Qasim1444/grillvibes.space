import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-BOaGB7Aw.js";
import { n as confirmDialog } from "./useNotifications-CvzCW6Mx.js";
import { n as usePermissions, t as AdminLayout_default } from "./AdminLayout-BhC2A239.js";
import { t as _sfc_main$1 } from "./PageHeader-D0aRDn5C.js";
import { t as DataTable_default } from "./DataTable-DQdMyI8_.js";
import { t as Pagination_default } from "./Pagination-CHJUzz_w.js";
import { t as Modal_default } from "./Modal-CpmFAnsY.js";
import { t as _sfc_main$2 } from "./FormField-Doe8oR1s.js";
import { t as StatCard_default } from "./StatCard-C81bFHCl.js";
import { Fragment, computed, createBlock, createCommentVNode, createTextVNode, createVNode, mergeProps, openBlock, ref, renderList, toDisplayString, unref, useSSRContext, watch, withCtx } from "vue";
import { router, useForm, usePage } from "@inertiajs/vue3";
import { ssrIncludeBooleanAttr, ssrInterpolate, ssrRenderAttr, ssrRenderAttrs, ssrRenderClass, ssrRenderComponent, ssrRenderList } from "vue/server-renderer";
//#region resources/js/pages/CRM/Discounts.vue
var _sfc_main = /*@__PURE__*/ Object.assign({ layout: AdminLayout_default }, {
	__name: "Discounts",
	__ssrInlineRender: true,
	props: {
		campaigns: {
			type: Object,
			default: () => ({ data: [] })
		},
		filters: {
			type: Object,
			default: () => ({
				search: "",
				status: ""
			})
		},
		orderTypes: {
			type: Array,
			default: () => []
		},
		categories: {
			type: Array,
			default: () => []
		},
		foodItems: {
			type: Array,
			default: () => []
		},
		stats: {
			type: Object,
			default: () => ({
				total: 0,
				live: 0,
				inactive: 0
			})
		}
	},
	setup(__props) {
		const { can } = usePermissions();
		const page = usePage();
		const props = __props;
		const flashError = computed(() => page.props.flash?.error || "");
		const columns = [
			{
				key: "name",
				label: "Campaign"
			},
			{
				key: "value",
				label: "Discount",
				width: "130px"
			},
			{
				key: "min_order_amount",
				label: "Min order"
			},
			{
				key: "scope",
				label: "Scope"
			},
			{
				key: "order_types",
				label: "Order types"
			},
			{
				key: "window",
				label: "Valid"
			},
			{
				key: "is_live",
				label: "State",
				width: "120px"
			}
		];
		const rows = computed(() => props.campaigns?.data ?? []);
		const search = ref(props.filters?.search ?? "");
		const status = ref(props.filters?.status ?? "");
		let searchTimer = null;
		const reload = (debounce) => {
			clearTimeout(searchTimer);
			searchTimer = setTimeout(() => router.get("/crm/discounts", {
				search: search.value || void 0,
				status: status.value || void 0
			}, {
				preserveState: true,
				preserveScroll: true,
				replace: true,
				only: [
					"campaigns",
					"filters",
					"stats"
				]
			}), debounce);
		};
		watch(search, () => reload(300));
		watch(status, () => reload(0));
		const showModal = ref(false);
		const blank = {
			id: null,
			name: "",
			type: "percentage",
			value: "",
			max_discount: "",
			min_order_amount: "",
			applies_to: "all",
			target_ids: [],
			order_types: [],
			starts_at: "",
			ends_at: "",
			priority: 0,
			is_active: true
		};
		const form = useForm({ ...blank });
		const targets = computed(() => form.applies_to === "category" ? props.categories : props.foodItems);
		const changeScope = (value) => {
			form.applies_to = value;
			form.target_ids = [];
		};
		const isTarget = (id) => form.target_ids.includes(id);
		const toggleTarget = (id) => {
			form.target_ids = isTarget(id) ? form.target_ids.filter((t) => t !== id) : [...form.target_ids, id];
		};
		const toggleOrderType = (type) => {
			form.order_types = form.order_types.includes(type) ? form.order_types.filter((t) => t !== type) : [...form.order_types, type];
		};
		const openModal = () => {
			Object.assign(form, {
				...blank,
				target_ids: [],
				order_types: []
			});
			form.clearErrors();
			showModal.value = true;
		};
		const editRow = (c) => {
			Object.assign(form, {
				id: c.id,
				name: c.name,
				type: c.type,
				value: c.value,
				max_discount: c.max_discount ?? "",
				min_order_amount: c.min_order_amount ?? "",
				applies_to: c.applies_to,
				target_ids: [...c.target_ids ?? []],
				order_types: [...c.order_types ?? []],
				starts_at: c.starts_at ?? "",
				ends_at: c.ends_at ?? "",
				priority: c.priority,
				is_active: c.is_active
			});
			form.clearErrors();
			showModal.value = true;
		};
		const save = () => {
			const opts = {
				preserveScroll: true,
				onSuccess: () => showModal.value = false
			};
			form.transform((data) => ({
				...data,
				max_discount: data.max_discount === "" ? null : data.max_discount,
				min_order_amount: data.min_order_amount === "" ? 0 : data.min_order_amount,
				starts_at: data.starts_at || null,
				ends_at: data.ends_at || null,
				priority: data.priority === "" ? 0 : data.priority
			}));
			if (form.id) form.put(`/crm/discounts/${form.id}`, opts);
			else form.post("/crm/discounts", opts);
		};
		const deleteRow = async (id) => {
			if (!await confirmDialog("Delete this campaign?")) return;
			router.delete(`/crm/discounts/${id}`, { preserveScroll: true });
		};
		const scopeLabel = (s) => ({
			all: "Whole order",
			category: "Categories",
			item: "Items"
		})[s] ?? s;
		const money = (v) => `Rs ${Number(v || 0).toLocaleString(void 0, { minimumFractionDigits: 0 })}`;
		const label = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : "—";
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "page" }, _attrs))} data-v-ce795034>`);
			_push(ssrRenderComponent(_sfc_main$1, {
				title: "Discount Campaigns",
				subtitle: "Standing offers that need no code. The POS shows the highest-priority live campaign as a suggestion."
			}, {
				actions: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						if (unref(can)("crm.discounts.create")) _push(`<button class="ui-btn ui-btn--primary" data-v-ce795034${_scopeId}> + Add Campaign </button>`);
						else _push(`<!---->`);
					} else return [unref(can)("crm.discounts.create") ? (openBlock(), createBlock("button", {
						key: 0,
						class: "ui-btn ui-btn--primary",
						onClick: openModal
					}, " + Add Campaign ")) : createCommentVNode("", true)];
				}),
				_: 1
			}, _parent));
			if (flashError.value) _push(`<div class="ui-alert ui-alert--danger" data-v-ce795034>${ssrInterpolate(flashError.value)}</div>`);
			else _push(`<!---->`);
			_push(`<div class="stat-grid" data-v-ce795034>`);
			_push(ssrRenderComponent(StatCard_default, {
				label: "Campaigns",
				value: props.stats.total
			}, null, _parent));
			_push(ssrRenderComponent(StatCard_default, {
				label: "Live Now",
				value: props.stats.live,
				color: "var(--success)",
				tint: "var(--success-soft)"
			}, null, _parent));
			_push(ssrRenderComponent(StatCard_default, {
				label: "Switched Off",
				value: props.stats.inactive
			}, null, _parent));
			_push(`</div><div class="dc__filters" data-v-ce795034>`);
			_push(ssrRenderComponent(_sfc_main$2, {
				modelValue: status.value,
				"onUpdate:modelValue": ($event) => status.value = $event,
				label: "Status",
				type: "select"
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<option value="" data-v-ce795034${_scopeId}>All statuses</option><option value="active" data-v-ce795034${_scopeId}>Active</option><option value="inactive" data-v-ce795034${_scopeId}>Inactive</option><option value="expired" data-v-ce795034${_scopeId}>Expired</option>`);
					else return [
						createVNode("option", { value: "" }, "All statuses"),
						createVNode("option", { value: "active" }, "Active"),
						createVNode("option", { value: "inactive" }, "Inactive"),
						createVNode("option", { value: "expired" }, "Expired")
					];
				}),
				_: 1
			}, _parent));
			_push(`</div>`);
			_push(ssrRenderComponent(DataTable_default, {
				columns,
				rows: rows.value,
				index: "",
				searchable: "",
				query: search.value,
				"onUpdate:query": ($event) => search.value = $event,
				"search-placeholder": "Search campaign name…",
				"empty-text": "No campaigns yet."
			}, {
				"cell:name": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) _push(`<div class="dc__name" data-v-ce795034${_scopeId}><strong data-v-ce795034${_scopeId}>${ssrInterpolate(row.name)}</strong><span class="dc__meta" data-v-ce795034${_scopeId}>priority ${ssrInterpolate(row.priority)}</span></div>`);
					else return [createVNode("div", { class: "dc__name" }, [createVNode("strong", null, toDisplayString(row.name), 1), createVNode("span", { class: "dc__meta" }, "priority " + toDisplayString(row.priority), 1)])];
				}),
				"cell:value": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<span data-v-ce795034${_scopeId}>${ssrInterpolate(row.type === "percentage" ? `${row.value}%` : money(row.value))}</span>`);
						if (row.max_discount) _push(`<span class="dc__meta" data-v-ce795034${_scopeId}>max ${ssrInterpolate(money(row.max_discount))}</span>`);
						else _push(`<!---->`);
					} else return [createVNode("span", null, toDisplayString(row.type === "percentage" ? `${row.value}%` : money(row.value)), 1), row.max_discount ? (openBlock(), createBlock("span", {
						key: 0,
						class: "dc__meta"
					}, "max " + toDisplayString(money(row.max_discount)), 1)) : createCommentVNode("", true)];
				}),
				"cell:min_order_amount": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) _push(`${ssrInterpolate(Number(value) > 0 ? money(value) : "—")}`);
					else return [createTextVNode(toDisplayString(Number(value) > 0 ? money(value) : "—"), 1)];
				}),
				"cell:scope": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div class="dc__scope" data-v-ce795034${_scopeId}><span class="ui-badge ui-badge--muted" data-v-ce795034${_scopeId}>${ssrInterpolate(scopeLabel(row.applies_to))}</span>`);
						if (row.target_labels.length) _push(`<span class="dc__meta" data-v-ce795034${_scopeId}>${ssrInterpolate(row.target_labels.join(", "))}</span>`);
						else _push(`<!---->`);
						_push(`</div>`);
					} else return [createVNode("div", { class: "dc__scope" }, [createVNode("span", { class: "ui-badge ui-badge--muted" }, toDisplayString(scopeLabel(row.applies_to)), 1), row.target_labels.length ? (openBlock(), createBlock("span", {
						key: 0,
						class: "dc__meta"
					}, toDisplayString(row.target_labels.join(", ")), 1)) : createCommentVNode("", true)])];
				}),
				"cell:order_types": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) _push(`${ssrInterpolate(value.length ? value.map(label).join(", ") : "All types")}`);
					else return [createTextVNode(toDisplayString(value.length ? value.map(label).join(", ") : "All types"), 1)];
				}),
				"cell:window": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) _push(`<span class="dc__meta" data-v-ce795034${_scopeId}>${ssrInterpolate(row.starts_at || "—")} → ${ssrInterpolate(row.ends_at || "no end")}</span>`);
					else return [createVNode("span", { class: "dc__meta" }, toDisplayString(row.starts_at || "—") + " → " + toDisplayString(row.ends_at || "no end"), 1)];
				}),
				"cell:is_live": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) _push(`<span class="${ssrRenderClass([row.is_live ? "ui-badge--success" : "ui-badge--muted", "ui-badge"])}" data-v-ce795034${_scopeId}>${ssrInterpolate(row.is_live ? "Live" : row.is_active ? "Out of window" : "Off")}</span>`);
					else return [createVNode("span", { class: ["ui-badge", row.is_live ? "ui-badge--success" : "ui-badge--muted"] }, toDisplayString(row.is_live ? "Live" : row.is_active ? "Out of window" : "Off"), 3)];
				}),
				actions: withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						if (unref(can)("crm.discounts.update")) _push(`<button class="ui-btn ui-btn--ghost ui-btn--sm" data-v-ce795034${_scopeId}> Edit </button>`);
						else _push(`<!---->`);
						if (unref(can)("crm.discounts.delete")) _push(`<button class="ui-btn ui-btn--danger ui-btn--sm" data-v-ce795034${_scopeId}> Delete </button>`);
						else _push(`<!---->`);
					} else return [unref(can)("crm.discounts.update") ? (openBlock(), createBlock("button", {
						key: 0,
						class: "ui-btn ui-btn--ghost ui-btn--sm",
						onClick: ($event) => editRow(row)
					}, " Edit ", 8, ["onClick"])) : createCommentVNode("", true), unref(can)("crm.discounts.delete") ? (openBlock(), createBlock("button", {
						key: 1,
						class: "ui-btn ui-btn--danger ui-btn--sm",
						onClick: ($event) => deleteRow(row.id)
					}, " Delete ", 8, ["onClick"])) : createCommentVNode("", true)];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(Pagination_default, {
				paginator: props.campaigns,
				only: ["campaigns"]
			}, null, _parent));
			_push(ssrRenderComponent(Modal_default, {
				modelValue: showModal.value,
				"onUpdate:modelValue": ($event) => showModal.value = $event,
				title: unref(form).id ? "Edit Campaign" : "Add Campaign",
				width: "640px"
			}, {
				footer: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<button class="ui-btn ui-btn--ghost" data-v-ce795034${_scopeId}>Cancel</button><button class="ui-btn ui-btn--primary"${ssrIncludeBooleanAttr(unref(form).processing) ? " disabled" : ""} data-v-ce795034${_scopeId}>Save</button>`);
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
						_push(`<div class="dc__grid" data-v-ce795034${_scopeId}>`);
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).name,
							"onUpdate:modelValue": ($event) => unref(form).name = $event,
							label: "Name",
							placeholder: "e.g. Weekend 10% off",
							error: unref(form).errors.name
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).is_active,
							"onUpdate:modelValue": ($event) => unref(form).is_active = $event,
							label: "Status",
							type: "select",
							error: unref(form).errors.is_active
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(`<option${ssrRenderAttr("value", true)} data-v-ce795034${_scopeId}>Active</option><option${ssrRenderAttr("value", false)} data-v-ce795034${_scopeId}>Inactive</option>`);
								else return [createVNode("option", { value: true }, "Active"), createVNode("option", { value: false }, "Inactive")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).type,
							"onUpdate:modelValue": ($event) => unref(form).type = $event,
							label: "Type",
							type: "select",
							error: unref(form).errors.type
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(`<option value="fixed" data-v-ce795034${_scopeId}>Fixed amount</option><option value="percentage" data-v-ce795034${_scopeId}>Percentage</option>`);
								else return [createVNode("option", { value: "fixed" }, "Fixed amount"), createVNode("option", { value: "percentage" }, "Percentage")];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).value,
							"onUpdate:modelValue": ($event) => unref(form).value = $event,
							label: unref(form).type === "percentage" ? "Percentage off" : "Amount off",
							type: "number",
							step: "0.01",
							error: unref(form).errors.value
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).max_discount,
							"onUpdate:modelValue": ($event) => unref(form).max_discount = $event,
							label: "Max discount (optional)",
							type: "number",
							step: "0.01",
							error: unref(form).errors.max_discount
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).min_order_amount,
							"onUpdate:modelValue": ($event) => unref(form).min_order_amount = $event,
							label: "Min order amount",
							type: "number",
							step: "0.01",
							error: unref(form).errors.min_order_amount
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).starts_at,
							"onUpdate:modelValue": ($event) => unref(form).starts_at = $event,
							label: "Starts on",
							type: "date",
							error: unref(form).errors.starts_at
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).ends_at,
							"onUpdate:modelValue": ($event) => unref(form).ends_at = $event,
							label: "Ends on",
							type: "date",
							error: unref(form).errors.ends_at
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).priority,
							"onUpdate:modelValue": ($event) => unref(form).priority = $event,
							label: "Priority (higher wins)",
							type: "number",
							error: unref(form).errors.priority
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							"model-value": unref(form).applies_to,
							label: "Applies to",
							type: "select",
							error: unref(form).errors.applies_to,
							"onUpdate:modelValue": changeScope
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(`<option value="all" data-v-ce795034${_scopeId}>Whole order</option><option value="category" data-v-ce795034${_scopeId}>Selected categories</option><option value="item" data-v-ce795034${_scopeId}>Selected items</option>`);
								else return [
									createVNode("option", { value: "all" }, "Whole order"),
									createVNode("option", { value: "category" }, "Selected categories"),
									createVNode("option", { value: "item" }, "Selected items")
								];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(`</div>`);
						if (unref(form).applies_to !== "all") {
							_push(`<div class="dc__picker" data-v-ce795034${_scopeId}><span class="ui-label" data-v-ce795034${_scopeId}>${ssrInterpolate(unref(form).applies_to === "category" ? "Categories" : "Food items")}</span><div class="dc__chips" data-v-ce795034${_scopeId}><!--[-->`);
							ssrRenderList(targets.value, (t) => {
								_push(`<label class="${ssrRenderClass([{ "dc__chip--on": isTarget(t.id) }, "dc__chip"])}" data-v-ce795034${_scopeId}><input type="checkbox"${ssrIncludeBooleanAttr(isTarget(t.id)) ? " checked" : ""} data-v-ce795034${_scopeId}> ${ssrInterpolate(t.name)}</label>`);
							});
							_push(`<!--]--></div>`);
							if (unref(form).errors.target_ids) _push(`<p class="ui-field__error" data-v-ce795034${_scopeId}>${ssrInterpolate(unref(form).errors.target_ids)}</p>`);
							else _push(`<!---->`);
							_push(`</div>`);
						} else _push(`<!---->`);
						_push(`<div class="dc__picker" data-v-ce795034${_scopeId}><span class="ui-label" data-v-ce795034${_scopeId}>Order types (none ticked = all)</span><div class="dc__chips" data-v-ce795034${_scopeId}><!--[-->`);
						ssrRenderList(props.orderTypes, (t) => {
							_push(`<label class="${ssrRenderClass([{ "dc__chip--on": unref(form).order_types.includes(t) }, "dc__chip"])}" data-v-ce795034${_scopeId}><input type="checkbox"${ssrIncludeBooleanAttr(unref(form).order_types.includes(t)) ? " checked" : ""} data-v-ce795034${_scopeId}> ${ssrInterpolate(label(t))}</label>`);
						});
						_push(`<!--]--></div>`);
						if (unref(form).errors.order_types) _push(`<p class="ui-field__error" data-v-ce795034${_scopeId}>${ssrInterpolate(unref(form).errors.order_types)}</p>`);
						else _push(`<!---->`);
						_push(`</div><p class="dc__note" data-v-ce795034${_scopeId}> A campaign never rewrites a bill on its own — the cashier confirms it in POS, so the order&#39;s discount stays an explicit decision. </p>`);
					} else return [
						createVNode("div", { class: "dc__grid" }, [
							createVNode(_sfc_main$2, {
								modelValue: unref(form).name,
								"onUpdate:modelValue": ($event) => unref(form).name = $event,
								label: "Name",
								placeholder: "e.g. Weekend 10% off",
								error: unref(form).errors.name
							}, null, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"error"
							]),
							createVNode(_sfc_main$2, {
								modelValue: unref(form).is_active,
								"onUpdate:modelValue": ($event) => unref(form).is_active = $event,
								label: "Status",
								type: "select",
								error: unref(form).errors.is_active
							}, {
								default: withCtx(() => [createVNode("option", { value: true }, "Active"), createVNode("option", { value: false }, "Inactive")]),
								_: 1
							}, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"error"
							]),
							createVNode(_sfc_main$2, {
								modelValue: unref(form).type,
								"onUpdate:modelValue": ($event) => unref(form).type = $event,
								label: "Type",
								type: "select",
								error: unref(form).errors.type
							}, {
								default: withCtx(() => [createVNode("option", { value: "fixed" }, "Fixed amount"), createVNode("option", { value: "percentage" }, "Percentage")]),
								_: 1
							}, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"error"
							]),
							createVNode(_sfc_main$2, {
								modelValue: unref(form).value,
								"onUpdate:modelValue": ($event) => unref(form).value = $event,
								label: unref(form).type === "percentage" ? "Percentage off" : "Amount off",
								type: "number",
								step: "0.01",
								error: unref(form).errors.value
							}, null, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"label",
								"error"
							]),
							createVNode(_sfc_main$2, {
								modelValue: unref(form).max_discount,
								"onUpdate:modelValue": ($event) => unref(form).max_discount = $event,
								label: "Max discount (optional)",
								type: "number",
								step: "0.01",
								error: unref(form).errors.max_discount
							}, null, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"error"
							]),
							createVNode(_sfc_main$2, {
								modelValue: unref(form).min_order_amount,
								"onUpdate:modelValue": ($event) => unref(form).min_order_amount = $event,
								label: "Min order amount",
								type: "number",
								step: "0.01",
								error: unref(form).errors.min_order_amount
							}, null, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"error"
							]),
							createVNode(_sfc_main$2, {
								modelValue: unref(form).starts_at,
								"onUpdate:modelValue": ($event) => unref(form).starts_at = $event,
								label: "Starts on",
								type: "date",
								error: unref(form).errors.starts_at
							}, null, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"error"
							]),
							createVNode(_sfc_main$2, {
								modelValue: unref(form).ends_at,
								"onUpdate:modelValue": ($event) => unref(form).ends_at = $event,
								label: "Ends on",
								type: "date",
								error: unref(form).errors.ends_at
							}, null, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"error"
							]),
							createVNode(_sfc_main$2, {
								modelValue: unref(form).priority,
								"onUpdate:modelValue": ($event) => unref(form).priority = $event,
								label: "Priority (higher wins)",
								type: "number",
								error: unref(form).errors.priority
							}, null, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"error"
							]),
							createVNode(_sfc_main$2, {
								"model-value": unref(form).applies_to,
								label: "Applies to",
								type: "select",
								error: unref(form).errors.applies_to,
								"onUpdate:modelValue": changeScope
							}, {
								default: withCtx(() => [
									createVNode("option", { value: "all" }, "Whole order"),
									createVNode("option", { value: "category" }, "Selected categories"),
									createVNode("option", { value: "item" }, "Selected items")
								]),
								_: 1
							}, 8, ["model-value", "error"])
						]),
						unref(form).applies_to !== "all" ? (openBlock(), createBlock("div", {
							key: 0,
							class: "dc__picker"
						}, [
							createVNode("span", { class: "ui-label" }, toDisplayString(unref(form).applies_to === "category" ? "Categories" : "Food items"), 1),
							createVNode("div", { class: "dc__chips" }, [(openBlock(true), createBlock(Fragment, null, renderList(targets.value, (t) => {
								return openBlock(), createBlock("label", {
									key: t.id,
									class: ["dc__chip", { "dc__chip--on": isTarget(t.id) }]
								}, [createVNode("input", {
									type: "checkbox",
									checked: isTarget(t.id),
									onChange: ($event) => toggleTarget(t.id)
								}, null, 40, ["checked", "onChange"]), createTextVNode(" " + toDisplayString(t.name), 1)], 2);
							}), 128))]),
							unref(form).errors.target_ids ? (openBlock(), createBlock("p", {
								key: 0,
								class: "ui-field__error"
							}, toDisplayString(unref(form).errors.target_ids), 1)) : createCommentVNode("", true)
						])) : createCommentVNode("", true),
						createVNode("div", { class: "dc__picker" }, [
							createVNode("span", { class: "ui-label" }, "Order types (none ticked = all)"),
							createVNode("div", { class: "dc__chips" }, [(openBlock(true), createBlock(Fragment, null, renderList(props.orderTypes, (t) => {
								return openBlock(), createBlock("label", {
									key: t,
									class: ["dc__chip", { "dc__chip--on": unref(form).order_types.includes(t) }]
								}, [createVNode("input", {
									type: "checkbox",
									checked: unref(form).order_types.includes(t),
									onChange: ($event) => toggleOrderType(t)
								}, null, 40, ["checked", "onChange"]), createTextVNode(" " + toDisplayString(label(t)), 1)], 2);
							}), 128))]),
							unref(form).errors.order_types ? (openBlock(), createBlock("p", {
								key: 0,
								class: "ui-field__error"
							}, toDisplayString(unref(form).errors.order_types), 1)) : createCommentVNode("", true)
						]),
						createVNode("p", { class: "dc__note" }, " A campaign never rewrites a bill on its own — the cashier confirms it in POS, so the order's discount stays an explicit decision. ")
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
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/pages/CRM/Discounts.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var Discounts_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-ce795034"]]);
//#endregion
export { Discounts_default as default };
