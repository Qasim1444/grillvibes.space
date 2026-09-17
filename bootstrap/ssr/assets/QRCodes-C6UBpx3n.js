import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-BOaGB7Aw.js";
import { n as usePermissions, t as AdminLayout_default } from "./AdminLayout-BhC2A239.js";
import { t as _sfc_main$1 } from "./PageHeader-D0aRDn5C.js";
import { t as DataTable_default } from "./DataTable-DQdMyI8_.js";
import { t as Pagination_default } from "./Pagination-CHJUzz_w.js";
import { t as Modal_default } from "./Modal-CpmFAnsY.js";
import { t as _sfc_main$2 } from "./FormField-Doe8oR1s.js";
import { Fragment, computed, createBlock, createCommentVNode, createTextVNode, createVNode, mergeProps, openBlock, ref, renderList, toDisplayString, unref, useSSRContext, withCtx } from "vue";
import { router, useForm } from "@inertiajs/vue3";
import { ssrIncludeBooleanAttr, ssrInterpolate, ssrRenderAttr, ssrRenderAttrs, ssrRenderClass, ssrRenderComponent, ssrRenderList } from "vue/server-renderer";
//#region resources/js/pages/QRCodes.vue
var _sfc_main = /*@__PURE__*/ Object.assign({ layout: AdminLayout_default }, {
	__name: "QRCodes",
	__ssrInlineRender: true,
	props: {
		qrCodes: {
			type: Object,
			default: () => ({ data: [] })
		},
		places: {
			type: Array,
			default: () => []
		},
		tables: {
			type: Array,
			default: () => []
		}
	},
	setup(__props) {
		const { can } = usePermissions();
		const props = __props;
		const columns = [
			{
				key: "label",
				label: "Label"
			},
			{
				key: "location",
				label: "Location"
			},
			{
				key: "menu_url",
				label: "Menu URL"
			},
			{
				key: "scan_count",
				label: "Scans"
			},
			{
				key: "last_scanned_at",
				label: "Last Scan"
			},
			{
				key: "is_active",
				label: "Status"
			}
		];
		const rows = computed(() => props.qrCodes?.data ?? []);
		const tablesForPlace = computed(() => form.place_id ? props.tables.filter((t) => String(t.place_id) === String(form.place_id)) : props.tables);
		const showModal = ref(false);
		const form = useForm({
			id: null,
			label: "",
			place_id: "",
			dining_table_id: "",
			is_active: true
		});
		const openCreate = () => {
			form.reset();
			form.clearErrors();
			showModal.value = true;
		};
		const openEdit = (row) => {
			form.id = row.id;
			form.label = row.label ?? "";
			form.place_id = row.place_id ?? "";
			form.dining_table_id = row.dining_table_id ?? "";
			form.is_active = !!row.is_active;
			form.clearErrors();
			showModal.value = true;
		};
		const save = () => {
			const opts = {
				preserveScroll: true,
				onSuccess: () => showModal.value = false
			};
			if (form.id) form.put(`/qr-codes/${form.id}`, opts);
			else form.post("/qr-codes", opts);
		};
		const del = (id) => {
			if (!confirm("Delete this QR code? Existing printed codes will stop working.")) return;
			router.delete(`/qr-codes/${id}`, { preserveScroll: true });
		};
		const showPreview = ref(false);
		const previewRow = ref(null);
		const openPreview = (row) => {
			previewRow.value = row;
			showPreview.value = true;
		};
		const qrSrc = (id) => `/qr-codes/${id}/image`;
		const qrPng = (id) => `/qr-codes/${id}/image?format=png`;
		const downloadPng = () => {
			if (!previewRow.value) return;
			const { id, label, slug } = previewRow.value;
			const a = document.createElement("a");
			a.href = qrPng(id);
			a.download = `qr-${label || slug || "code"}.png`;
			document.body.appendChild(a);
			a.click();
			a.remove();
		};
		const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			"\"": "&quot;",
			"'": "&#39;"
		})[c]);
		const printQr = () => {
			if (!previewRow.value) return;
			const { id, menu_url, label, table, place_name } = previewRow.value;
			const loc = table ? `Table ${table}` : place_name || "";
			const w = window.open("", "_blank", "width=460,height=640");
			if (!w) return;
			w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>QR — ${esc(label || "Menu")}</title>
    <style>
      *{box-sizing:border-box}
      body{margin:0;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;color:#111827}
      .card{width:340px;margin:32px auto;padding:28px 24px;border:1px solid #e5e7eb;border-radius:18px;text-align:center}
      .eyebrow{text-transform:uppercase;letter-spacing:.14em;font-size:12px;font-weight:700;color:#4f46e5;margin:0 0 2px}
      .loc{font-size:22px;font-weight:800;margin:0 0 18px}
      .tile{display:inline-block;padding:16px;border-radius:14px;background:#fff;border:1px solid #eef2ff}
      .tile img{width:220px;height:220px;display:block}
      .label{font-weight:700;margin:16px 0 2px}
      .hint{font-size:12px;color:#6b7280;margin:0 0 12px}
      .url{font-size:11px;color:#9ca3af;word-break:break-all}
      @media print{.card{border:none;margin:0 auto}@page{margin:12mm}}
    </style></head>
    <body>
      <div class="card">
        <p class="eyebrow">Scan to order</p>
        ${loc ? `<p class="loc">${esc(loc)}</p>` : ""}
        <div class="tile"><img src="${qrSrc(id)}" onload="window.focus();window.print()" alt="QR code" /></div>
        <p class="label">${esc(label || "Scan to view our menu")}</p>
        <p class="hint">Open your phone camera and point it at the code</p>
        <p class="url">${esc(menu_url)}</p>
      </div>
    </body></html>`);
			w.document.close();
		};
		const copied = ref(null);
		const copy = async (url) => {
			if (!url) return;
			try {
				await navigator.clipboard.writeText(url);
				copied.value = url;
				setTimeout(() => copied.value = null, 1500);
			} catch {}
		};
		const shortUrl = (u) => String(u || "").replace(/^https?:\/\/[^/]+/, "") || u;
		const fmtDate = (v) => v ? new Date(v).toLocaleString() : "—";
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "page" }, _attrs))} data-v-d28bbd45>`);
			_push(ssrRenderComponent(_sfc_main$1, {
				title: "QR Codes",
				subtitle: "Generate a QR code per table or place — guests scan it to open the menu and order."
			}, {
				actions: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						if (unref(can)("qr.create")) _push(`<button class="ui-btn ui-btn--primary" data-v-d28bbd45${_scopeId}>+ New QR Code</button>`);
						else _push(`<!---->`);
					} else return [unref(can)("qr.create") ? (openBlock(), createBlock("button", {
						key: 0,
						class: "ui-btn ui-btn--primary",
						onClick: openCreate
					}, "+ New QR Code")) : createCommentVNode("", true)];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(DataTable_default, {
				columns,
				rows: rows.value,
				index: "",
				"empty-text": "No QR codes yet. Create one for a table or place."
			}, {
				"cell:label": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) _push(`<strong data-v-d28bbd45${_scopeId}>${ssrInterpolate(row.label || "Untitled")}</strong>`);
					else return [createVNode("strong", null, toDisplayString(row.label || "Untitled"), 1)];
				}),
				"cell:location": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						if (row.table) _push(`<span data-v-d28bbd45${_scopeId}>Table ${ssrInterpolate(row.table)}</span>`);
						else if (row.place_name) _push(`<span data-v-d28bbd45${_scopeId}>${ssrInterpolate(row.place_name)}</span>`);
						else _push(`<span class="qr__muted" data-v-d28bbd45${_scopeId}>Whole menu</span>`);
					} else return [row.table ? (openBlock(), createBlock("span", { key: 0 }, "Table " + toDisplayString(row.table), 1)) : row.place_name ? (openBlock(), createBlock("span", { key: 1 }, toDisplayString(row.place_name), 1)) : (openBlock(), createBlock("span", {
						key: 2,
						class: "qr__muted"
					}, "Whole menu"))];
				}),
				"cell:menu_url": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) _push(`<div class="qr__link" data-v-d28bbd45${_scopeId}><a${ssrRenderAttr("href", row.menu_url)} target="_blank" rel="noopener" class="qr__url"${ssrRenderAttr("title", row.menu_url)} data-v-d28bbd45${_scopeId}>${ssrInterpolate(shortUrl(row.menu_url))}</a><button class="ui-btn ui-btn--ghost ui-btn--sm" data-v-d28bbd45${_scopeId}>${ssrInterpolate(copied.value === row.menu_url ? "✓ Copied" : "Copy")}</button></div>`);
					else return [createVNode("div", { class: "qr__link" }, [createVNode("a", {
						href: row.menu_url,
						target: "_blank",
						rel: "noopener",
						class: "qr__url",
						title: row.menu_url
					}, toDisplayString(shortUrl(row.menu_url)), 9, ["href", "title"]), createVNode("button", {
						class: "ui-btn ui-btn--ghost ui-btn--sm",
						onClick: ($event) => copy(row.menu_url)
					}, toDisplayString(copied.value === row.menu_url ? "✓ Copied" : "Copy"), 9, ["onClick"])])];
				}),
				"cell:scan_count": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) _push(`${ssrInterpolate(Number(value || 0).toLocaleString())}`);
					else return [createTextVNode(toDisplayString(Number(value || 0).toLocaleString()), 1)];
				}),
				"cell:last_scanned_at": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) _push(`${ssrInterpolate(fmtDate(value))}`);
					else return [createTextVNode(toDisplayString(fmtDate(value)), 1)];
				}),
				"cell:is_active": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) _push(`<span class="${ssrRenderClass([value ? "ui-badge--success" : "ui-badge--muted", "ui-badge"])}" data-v-d28bbd45${_scopeId}>${ssrInterpolate(value ? "Active" : "Inactive")}</span>`);
					else return [createVNode("span", { class: ["ui-badge", value ? "ui-badge--success" : "ui-badge--muted"] }, toDisplayString(value ? "Active" : "Inactive"), 3)];
				}),
				actions: withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<button class="ui-btn ui-btn--secondary ui-btn--sm" data-v-d28bbd45${_scopeId}>QR</button>`);
						if (unref(can)("qr.update")) _push(`<button class="ui-btn ui-btn--ghost ui-btn--sm" data-v-d28bbd45${_scopeId}>Edit</button>`);
						else _push(`<!---->`);
						if (unref(can)("qr.delete")) _push(`<button class="ui-btn ui-btn--danger ui-btn--sm" data-v-d28bbd45${_scopeId}>Delete</button>`);
						else _push(`<!---->`);
					} else return [
						createVNode("button", {
							class: "ui-btn ui-btn--secondary ui-btn--sm",
							onClick: ($event) => openPreview(row)
						}, "QR", 8, ["onClick"]),
						unref(can)("qr.update") ? (openBlock(), createBlock("button", {
							key: 0,
							class: "ui-btn ui-btn--ghost ui-btn--sm",
							onClick: ($event) => openEdit(row)
						}, "Edit", 8, ["onClick"])) : createCommentVNode("", true),
						unref(can)("qr.delete") ? (openBlock(), createBlock("button", {
							key: 1,
							class: "ui-btn ui-btn--danger ui-btn--sm",
							onClick: ($event) => del(row.id)
						}, "Delete", 8, ["onClick"])) : createCommentVNode("", true)
					];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(Pagination_default, {
				paginator: props.qrCodes,
				only: ["qrCodes"]
			}, null, _parent));
			_push(ssrRenderComponent(Modal_default, {
				modelValue: showModal.value,
				"onUpdate:modelValue": ($event) => showModal.value = $event,
				title: unref(form).id ? "Edit QR Code" : "New QR Code"
			}, {
				footer: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<button class="ui-btn ui-btn--ghost" data-v-d28bbd45${_scopeId}>Cancel</button><button class="ui-btn ui-btn--primary"${ssrIncludeBooleanAttr(unref(form).processing) ? " disabled" : ""} data-v-d28bbd45${_scopeId}>Save</button>`);
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
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).label,
							"onUpdate:modelValue": ($event) => unref(form).label = $event,
							label: "Label",
							placeholder: "e.g. Table 5 / Front Counter",
							error: unref(form).errors.label
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).place_id,
							"onUpdate:modelValue": ($event) => unref(form).place_id = $event,
							label: "Place",
							type: "select",
							error: unref(form).errors.place_id
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) {
									_push(`<option value="" data-v-d28bbd45${_scopeId}>— None (whole menu) —</option><!--[-->`);
									ssrRenderList(props.places, (p) => {
										_push(`<option${ssrRenderAttr("value", p.id)} data-v-d28bbd45${_scopeId}>${ssrInterpolate(p.name)}</option>`);
									});
									_push(`<!--]-->`);
								} else return [createVNode("option", { value: "" }, "— None (whole menu) —"), (openBlock(true), createBlock(Fragment, null, renderList(props.places, (p) => {
									return openBlock(), createBlock("option", {
										key: p.id,
										value: p.id
									}, toDisplayString(p.name), 9, ["value"]);
								}), 128))];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).dining_table_id,
							"onUpdate:modelValue": ($event) => unref(form).dining_table_id = $event,
							label: "Table",
							type: "select",
							error: unref(form).errors.dining_table_id
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) {
									_push(`<option value="" data-v-d28bbd45${_scopeId}>— None —</option><!--[-->`);
									ssrRenderList(tablesForPlace.value, (t) => {
										_push(`<option${ssrRenderAttr("value", t.id)} data-v-d28bbd45${_scopeId}>Table ${ssrInterpolate(t.table_number)}</option>`);
									});
									_push(`<!--]-->`);
								} else return [createVNode("option", { value: "" }, "— None —"), (openBlock(true), createBlock(Fragment, null, renderList(tablesForPlace.value, (t) => {
									return openBlock(), createBlock("option", {
										key: t.id,
										value: t.id
									}, "Table " + toDisplayString(t.table_number), 9, ["value"]);
								}), 128))];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).is_active,
							"onUpdate:modelValue": ($event) => unref(form).is_active = $event,
							label: "Status",
							type: "select",
							error: unref(form).errors.is_active
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(`<option${ssrRenderAttr("value", true)} data-v-d28bbd45${_scopeId}>Active</option><option${ssrRenderAttr("value", false)} data-v-d28bbd45${_scopeId}>Inactive</option>`);
								else return [createVNode("option", { value: true }, "Active"), createVNode("option", { value: false }, "Inactive")];
							}),
							_: 1
						}, _parent, _scopeId));
					} else return [
						createVNode(_sfc_main$2, {
							modelValue: unref(form).label,
							"onUpdate:modelValue": ($event) => unref(form).label = $event,
							label: "Label",
							placeholder: "e.g. Table 5 / Front Counter",
							error: unref(form).errors.label
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode(_sfc_main$2, {
							modelValue: unref(form).place_id,
							"onUpdate:modelValue": ($event) => unref(form).place_id = $event,
							label: "Place",
							type: "select",
							error: unref(form).errors.place_id
						}, {
							default: withCtx(() => [createVNode("option", { value: "" }, "— None (whole menu) —"), (openBlock(true), createBlock(Fragment, null, renderList(props.places, (p) => {
								return openBlock(), createBlock("option", {
									key: p.id,
									value: p.id
								}, toDisplayString(p.name), 9, ["value"]);
							}), 128))]),
							_: 1
						}, 8, [
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
							default: withCtx(() => [createVNode("option", { value: "" }, "— None —"), (openBlock(true), createBlock(Fragment, null, renderList(tablesForPlace.value, (t) => {
								return openBlock(), createBlock("option", {
									key: t.id,
									value: t.id
								}, "Table " + toDisplayString(t.table_number), 9, ["value"]);
							}), 128))]),
							_: 1
						}, 8, [
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
						])
					];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(Modal_default, {
				modelValue: showPreview.value,
				"onUpdate:modelValue": ($event) => showPreview.value = $event,
				title: "QR code",
				width: "400px"
			}, {
				footer: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<button class="ui-btn ui-btn--secondary" data-v-d28bbd45${_scopeId}>Download PNG</button><button class="ui-btn ui-btn--ghost" data-v-d28bbd45${_scopeId}>${ssrInterpolate(copied.value === previewRow.value?.menu_url ? "✓ Copied" : "Copy link")}</button><button class="ui-btn ui-btn--primary" data-v-d28bbd45${_scopeId}>Print</button>`);
					else return [
						createVNode("button", {
							class: "ui-btn ui-btn--secondary",
							onClick: downloadPng
						}, "Download PNG"),
						createVNode("button", {
							class: "ui-btn ui-btn--ghost",
							onClick: ($event) => copy(previewRow.value?.menu_url)
						}, toDisplayString(copied.value === previewRow.value?.menu_url ? "✓ Copied" : "Copy link"), 9, ["onClick"]),
						createVNode("button", {
							class: "ui-btn ui-btn--primary",
							onClick: printQr
						}, "Print")
					];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						if (previewRow.value) {
							_push(`<div class="qrcard" data-v-d28bbd45${_scopeId}><div class="qrcard__head" data-v-d28bbd45${_scopeId}><span class="qrcard__eyebrow" data-v-d28bbd45${_scopeId}>Scan to order</span>`);
							if (previewRow.value.table) _push(`<span class="qrcard__loc" data-v-d28bbd45${_scopeId}>Table ${ssrInterpolate(previewRow.value.table)}</span>`);
							else if (previewRow.value.place_name) _push(`<span class="qrcard__loc" data-v-d28bbd45${_scopeId}>${ssrInterpolate(previewRow.value.place_name)}</span>`);
							else _push(`<!---->`);
							_push(`</div><div class="qrcard__tile" data-v-d28bbd45${_scopeId}><img${ssrRenderAttr("src", qrSrc(previewRow.value.id))}${ssrRenderAttr("alt", previewRow.value.label || "QR code")} class="qrcard__img" data-v-d28bbd45${_scopeId}></div><p class="qrcard__label" data-v-d28bbd45${_scopeId}>${ssrInterpolate(previewRow.value.label || "Untitled code")}</p><p class="qrcard__hint" data-v-d28bbd45${_scopeId}>Point your phone camera at the code to open the menu.</p><a${ssrRenderAttr("href", previewRow.value.menu_url)} target="_blank" rel="noopener" class="qrcard__url" data-v-d28bbd45${_scopeId}>${ssrInterpolate(previewRow.value.menu_url)}</a></div>`);
						} else _push(`<!---->`);
					} else return [previewRow.value ? (openBlock(), createBlock("div", {
						key: 0,
						class: "qrcard"
					}, [
						createVNode("div", { class: "qrcard__head" }, [createVNode("span", { class: "qrcard__eyebrow" }, "Scan to order"), previewRow.value.table ? (openBlock(), createBlock("span", {
							key: 0,
							class: "qrcard__loc"
						}, "Table " + toDisplayString(previewRow.value.table), 1)) : previewRow.value.place_name ? (openBlock(), createBlock("span", {
							key: 1,
							class: "qrcard__loc"
						}, toDisplayString(previewRow.value.place_name), 1)) : createCommentVNode("", true)]),
						createVNode("div", { class: "qrcard__tile" }, [createVNode("img", {
							src: qrSrc(previewRow.value.id),
							alt: previewRow.value.label || "QR code",
							class: "qrcard__img"
						}, null, 8, ["src", "alt"])]),
						createVNode("p", { class: "qrcard__label" }, toDisplayString(previewRow.value.label || "Untitled code"), 1),
						createVNode("p", { class: "qrcard__hint" }, "Point your phone camera at the code to open the menu."),
						createVNode("a", {
							href: previewRow.value.menu_url,
							target: "_blank",
							rel: "noopener",
							class: "qrcard__url"
						}, toDisplayString(previewRow.value.menu_url), 9, ["href"])
					])) : createCommentVNode("", true)];
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
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/pages/QRCodes.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var QRCodes_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-d28bbd45"]]);
//#endregion
export { QRCodes_default as default };
