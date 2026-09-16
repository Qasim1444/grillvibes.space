import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-BOaGB7Aw.js";
import { n as usePermissions, t as AdminLayout_default } from "./AdminLayout-DSJnk4YL.js";
import { t as _sfc_main$1 } from "./PageHeader-D0aRDn5C.js";
import { t as DataTable_default } from "./DataTable-BHCUCuvd.js";
import { t as Pagination_default } from "./Pagination-h4WEvndd.js";
import { t as Modal_default } from "./Modal-DhESI6xO.js";
import { t as _sfc_main$2 } from "./FormField-Doe8oR1s.js";
import { Fragment, computed, createBlock, createCommentVNode, createTextVNode, createVNode, mergeProps, onBeforeUnmount, openBlock, ref, renderList, toDisplayString, unref, useSSRContext, watch, withCtx } from "vue";
import { Link, router, useForm } from "@inertiajs/vue3";
import { ssrIncludeBooleanAttr, ssrInterpolate, ssrRenderAttr, ssrRenderAttrs, ssrRenderClass, ssrRenderComponent, ssrRenderList } from "vue/server-renderer";
//#region resources/js/pages/FoodItems.vue
var _sfc_main = /*@__PURE__*/ Object.assign({ layout: AdminLayout_default }, {
	__name: "FoodItems",
	__ssrInlineRender: true,
	props: {
		items: {
			type: Object,
			default: () => ({ data: [] })
		},
		categories: {
			type: Array,
			default: () => []
		},
		filters: {
			type: Object,
			default: () => ({ search: "" })
		}
	},
	setup(__props) {
		const { can } = usePermissions();
		const props = __props;
		const columns = [
			{
				key: "image",
				label: "Image",
				width: "80px"
			},
			{
				key: "name",
				label: "Name"
			},
			{
				key: "foodcategory_name",
				label: "Category"
			},
			{
				key: "code",
				label: "Code"
			},
			{
				key: "price",
				label: "Price"
			},
			{
				key: "status",
				label: "Status"
			}
		];
		const items = computed(() => {
			return props.items?.data ?? [];
		});
		const categories = computed(() => {
			return props.categories ?? [];
		});
		const search = ref(props.filters?.search ?? "");
		let searchTimer = null;
		watch(search, (value) => {
			clearTimeout(searchTimer);
			searchTimer = setTimeout(() => {
				router.get("/food-items", { search: value || void 0 }, {
					preserveState: true,
					preserveScroll: true,
					replace: true,
					only: ["items", "filters"]
				});
			}, 300);
		});
		const showModal = ref(false);
		const imagePreview = ref(null);
		let previewObjectUrl = null;
		const form = useForm({
			id: null,
			name: "",
			foodcategory_id: "",
			code: "",
			description: "",
			price: "",
			image: null,
			status: true
		});
		const resetForm = () => {
			form.id = null;
			form.name = "";
			form.foodcategory_id = categories.value.length ? categories.value[0].id : "";
			form.code = "";
			form.description = "";
			form.price = "";
			form.image = null;
			form.status = true;
			form.clearErrors();
			if (previewObjectUrl) {
				URL.revokeObjectURL(previewObjectUrl);
				previewObjectUrl = null;
			}
			imagePreview.value = null;
		};
		const openModal = () => {
			resetForm();
			showModal.value = true;
		};
		const closeModal = () => {
			showModal.value = false;
			resetForm();
		};
		const editItem = (item) => {
			resetForm();
			form.id = item.id;
			form.name = item.name ?? "";
			form.foodcategory_id = item.foodcategory_id ?? "";
			form.code = item.code ?? "";
			form.description = item.description ?? "";
			form.price = item.price ?? "";
			form.image = null;
			form.status = Boolean(Number(item.status));
			form.clearErrors();
			imagePreview.value = item.image || null;
			showModal.value = true;
		};
		const handleFileChange = (event) => {
			const file = event.target.files?.[0] ?? null;
			form.image = file;
			if (previewObjectUrl) {
				URL.revokeObjectURL(previewObjectUrl);
				previewObjectUrl = null;
			}
			if (file) {
				previewObjectUrl = URL.createObjectURL(file);
				imagePreview.value = previewObjectUrl;
			} else imagePreview.value = null;
		};
		const saveItem = () => {
			form.transform((data) => {
				return form.id ? {
					...data,
					_method: "put"
				} : data;
			}).post(form.id ? `/food-items/${form.id}` : "/food-items", {
				preserveScroll: true,
				forceFormData: true,
				onSuccess: () => {
					showModal.value = false;
					resetForm();
				}
			});
		};
		const deleteItem = (id) => {
			if (!confirm("Are you sure you want to delete this food item?")) return;
			router.delete(`/food-items/${id}`, { preserveScroll: true });
		};
		onBeforeUnmount(() => {
			clearTimeout(searchTimer);
			if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
		});
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "page" }, _attrs))} data-v-16491653>`);
			_push(ssrRenderComponent(_sfc_main$1, {
				title: "Food Items",
				subtitle: "Manage menu items and pricing."
			}, {
				actions: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						if (unref(can)("food-items.create")) _push(`<button class="ui-btn ui-btn--primary" data-v-16491653${_scopeId}> + Add Food Item </button>`);
						else _push(`<!---->`);
					} else return [unref(can)("food-items.create") ? (openBlock(), createBlock("button", {
						key: 0,
						class: "ui-btn ui-btn--primary",
						onClick: openModal
					}, " + Add Food Item ")) : createCommentVNode("", true)];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(DataTable_default, {
				columns,
				rows: items.value,
				index: "",
				searchable: "",
				query: search.value,
				"onUpdate:query": ($event) => search.value = $event,
				"search-placeholder": "Search items…",
				"empty-text": "No food items found."
			}, {
				"cell:image": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) {
						if (value) _push(`<img${ssrRenderAttr("src", value)} alt="" class="food-item__thumb" data-v-16491653${_scopeId}>`);
						else _push(`<span class="food-item__thumb food-item__thumb--empty" data-v-16491653${_scopeId}> — </span>`);
					} else return [value ? (openBlock(), createBlock("img", {
						key: 0,
						src: value,
						alt: "",
						class: "food-item__thumb"
					}, null, 8, ["src"])) : (openBlock(), createBlock("span", {
						key: 1,
						class: "food-item__thumb food-item__thumb--empty"
					}, " — "))];
				}),
				"cell:status": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) _push(`<span class="${ssrRenderClass([value ? "ui-badge--success" : "ui-badge--muted", "ui-badge"])}" data-v-16491653${_scopeId}>${ssrInterpolate(value ? "Active" : "Inactive")}</span>`);
					else return [createVNode("span", { class: ["ui-badge", value ? "ui-badge--success" : "ui-badge--muted"] }, toDisplayString(value ? "Active" : "Inactive"), 3)];
				}),
				actions: withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						if (unref(can)("inventory.recipes.view")) _push(ssrRenderComponent(unref(Link), {
							href: `/inventory/recipes?food_item=${row.id}&search=${encodeURIComponent(row.name)}`,
							class: "ui-btn ui-btn--secondary ui-btn--sm",
							title: "Build this dish's recipe and see what it costs to make"
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(` Recipe `);
								else return [createTextVNode(" Recipe ")];
							}),
							_: 2
						}, _parent, _scopeId));
						else _push(`<!---->`);
						if (unref(can)("food-items.update")) _push(`<button class="ui-btn ui-btn--ghost ui-btn--sm" data-v-16491653${_scopeId}> Edit </button>`);
						else _push(`<!---->`);
						if (unref(can)("food-items.delete")) _push(`<button class="ui-btn ui-btn--danger ui-btn--sm" data-v-16491653${_scopeId}> Delete </button>`);
						else _push(`<!---->`);
					} else return [
						unref(can)("inventory.recipes.view") ? (openBlock(), createBlock(unref(Link), {
							key: 0,
							href: `/inventory/recipes?food_item=${row.id}&search=${encodeURIComponent(row.name)}`,
							class: "ui-btn ui-btn--secondary ui-btn--sm",
							title: "Build this dish's recipe and see what it costs to make"
						}, {
							default: withCtx(() => [createTextVNode(" Recipe ")]),
							_: 1
						}, 8, ["href"])) : createCommentVNode("", true),
						unref(can)("food-items.update") ? (openBlock(), createBlock("button", {
							key: 1,
							class: "ui-btn ui-btn--ghost ui-btn--sm",
							onClick: ($event) => editItem(row)
						}, " Edit ", 8, ["onClick"])) : createCommentVNode("", true),
						unref(can)("food-items.delete") ? (openBlock(), createBlock("button", {
							key: 2,
							class: "ui-btn ui-btn--danger ui-btn--sm",
							onClick: ($event) => deleteItem(row.id)
						}, " Delete ", 8, ["onClick"])) : createCommentVNode("", true)
					];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(Pagination_default, {
				paginator: props.items,
				only: ["items"]
			}, null, _parent));
			_push(ssrRenderComponent(Modal_default, {
				modelValue: showModal.value,
				"onUpdate:modelValue": ($event) => showModal.value = $event,
				title: unref(form).id ? "Edit Food Item" : "Add Food Item",
				width: "560px"
			}, {
				footer: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<button type="button" class="ui-btn ui-btn--ghost" data-v-16491653${_scopeId}> Cancel </button><button type="button" class="ui-btn ui-btn--primary"${ssrIncludeBooleanAttr(unref(form).processing) ? " disabled" : ""} data-v-16491653${_scopeId}>${ssrInterpolate(unref(form).processing ? "Saving..." : "Save")}</button>`);
					else return [createVNode("button", {
						type: "button",
						class: "ui-btn ui-btn--ghost",
						onClick: closeModal
					}, " Cancel "), createVNode("button", {
						type: "button",
						class: "ui-btn ui-btn--primary",
						disabled: unref(form).processing,
						onClick: saveItem
					}, toDisplayString(unref(form).processing ? "Saving..." : "Save"), 9, ["disabled"])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).name,
							"onUpdate:modelValue": ($event) => unref(form).name = $event,
							label: "Name",
							placeholder: "Name",
							error: unref(form).errors.name
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).foodcategory_id,
							"onUpdate:modelValue": ($event) => unref(form).foodcategory_id = $event,
							label: "Category",
							type: "select",
							error: unref(form).errors.foodcategory_id
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) {
									_push(`<option value="" disabled data-v-16491653${_scopeId}> Select a category </option><!--[-->`);
									ssrRenderList(categories.value, (cat) => {
										_push(`<option${ssrRenderAttr("value", cat.id)} data-v-16491653${_scopeId}>${ssrInterpolate(cat.name)}</option>`);
									});
									_push(`<!--]-->`);
								} else return [createVNode("option", {
									value: "",
									disabled: ""
								}, " Select a category "), (openBlock(true), createBlock(Fragment, null, renderList(categories.value, (cat) => {
									return openBlock(), createBlock("option", {
										key: cat.id,
										value: cat.id
									}, toDisplayString(cat.name), 9, ["value"]);
								}), 128))];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).code,
							"onUpdate:modelValue": ($event) => unref(form).code = $event,
							label: "Code",
							placeholder: "Code",
							error: unref(form).errors.code
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).description,
							"onUpdate:modelValue": ($event) => unref(form).description = $event,
							label: "Description",
							type: "textarea",
							placeholder: "Description",
							error: unref(form).errors.description
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).price,
							"onUpdate:modelValue": ($event) => unref(form).price = $event,
							label: "Price",
							type: "number",
							step: "0.01",
							placeholder: "Price",
							error: unref(form).errors.price
						}, null, _parent, _scopeId));
						_push(`<div class="ui-field" data-v-16491653${_scopeId}><label class="ui-label" data-v-16491653${_scopeId}>Image</label>`);
						if (imagePreview.value) _push(`<img${ssrRenderAttr("src", imagePreview.value)} alt="" class="food-item__preview" data-v-16491653${_scopeId}>`);
						else _push(`<!---->`);
						_push(`<input type="file" class="ui-input" accept="image/*" data-v-16491653${_scopeId}>`);
						if (unref(form).errors.image) _push(`<span class="ui-field__error" data-v-16491653${_scopeId}>${ssrInterpolate(unref(form).errors.image)}</span>`);
						else _push(`<!---->`);
						_push(`</div>`);
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).status,
							"onUpdate:modelValue": ($event) => unref(form).status = $event,
							label: "Status",
							type: "select",
							error: unref(form).errors.status
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(`<option${ssrRenderAttr("value", true)} data-v-16491653${_scopeId}> Active </option><option${ssrRenderAttr("value", false)} data-v-16491653${_scopeId}> Inactive </option>`);
								else return [createVNode("option", { value: true }, " Active "), createVNode("option", { value: false }, " Inactive ")];
							}),
							_: 1
						}, _parent, _scopeId));
					} else return [
						createVNode(_sfc_main$2, {
							modelValue: unref(form).name,
							"onUpdate:modelValue": ($event) => unref(form).name = $event,
							label: "Name",
							placeholder: "Name",
							error: unref(form).errors.name
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode(_sfc_main$2, {
							modelValue: unref(form).foodcategory_id,
							"onUpdate:modelValue": ($event) => unref(form).foodcategory_id = $event,
							label: "Category",
							type: "select",
							error: unref(form).errors.foodcategory_id
						}, {
							default: withCtx(() => [createVNode("option", {
								value: "",
								disabled: ""
							}, " Select a category "), (openBlock(true), createBlock(Fragment, null, renderList(categories.value, (cat) => {
								return openBlock(), createBlock("option", {
									key: cat.id,
									value: cat.id
								}, toDisplayString(cat.name), 9, ["value"]);
							}), 128))]),
							_: 1
						}, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode(_sfc_main$2, {
							modelValue: unref(form).code,
							"onUpdate:modelValue": ($event) => unref(form).code = $event,
							label: "Code",
							placeholder: "Code",
							error: unref(form).errors.code
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode(_sfc_main$2, {
							modelValue: unref(form).description,
							"onUpdate:modelValue": ($event) => unref(form).description = $event,
							label: "Description",
							type: "textarea",
							placeholder: "Description",
							error: unref(form).errors.description
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode(_sfc_main$2, {
							modelValue: unref(form).price,
							"onUpdate:modelValue": ($event) => unref(form).price = $event,
							label: "Price",
							type: "number",
							step: "0.01",
							placeholder: "Price",
							error: unref(form).errors.price
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode("div", { class: "ui-field" }, [
							createVNode("label", { class: "ui-label" }, "Image"),
							imagePreview.value ? (openBlock(), createBlock("img", {
								key: 0,
								src: imagePreview.value,
								alt: "",
								class: "food-item__preview"
							}, null, 8, ["src"])) : createCommentVNode("", true),
							createVNode("input", {
								type: "file",
								class: "ui-input",
								accept: "image/*",
								onChange: handleFileChange
							}, null, 32),
							unref(form).errors.image ? (openBlock(), createBlock("span", {
								key: 1,
								class: "ui-field__error"
							}, toDisplayString(unref(form).errors.image), 1)) : createCommentVNode("", true)
						]),
						createVNode(_sfc_main$2, {
							modelValue: unref(form).status,
							"onUpdate:modelValue": ($event) => unref(form).status = $event,
							label: "Status",
							type: "select",
							error: unref(form).errors.status
						}, {
							default: withCtx(() => [createVNode("option", { value: true }, " Active "), createVNode("option", { value: false }, " Inactive ")]),
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
			_push(`</div>`);
		};
	}
});
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/pages/FoodItems.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var FoodItems_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-16491653"]]);
//#endregion
export { FoodItems_default as default };
