import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-BOaGB7Aw.js";
import { n as usePermissions, t as AdminLayout_default } from "./AdminLayout-Dn6OtQae.js";
import { t as _sfc_main$1 } from "./PageHeader-D0aRDn5C.js";
import { t as DataTable_default } from "./DataTable-DQdMyI8_.js";
import { t as Pagination_default } from "./Pagination-CHJUzz_w.js";
import { t as Modal_default } from "./Modal-CpmFAnsY.js";
import { t as _sfc_main$2 } from "./FormField-Doe8oR1s.js";
import { Fragment, computed, createBlock, createCommentVNode, createTextVNode, createVNode, mergeProps, nextTick, onBeforeUnmount, onMounted, openBlock, ref, renderList, toDisplayString, unref, useSSRContext, vModelText, watch, withCtx, withDirectives, withModifiers } from "vue";
import { router, useForm } from "@inertiajs/vue3";
import { ssrIncludeBooleanAttr, ssrInterpolate, ssrRenderAttr, ssrRenderAttrs, ssrRenderClass, ssrRenderComponent, ssrRenderList } from "vue/server-renderer";
//#region resources/js/pages/Blog.vue
var _sfc_main = /*@__PURE__*/ Object.assign({ layout: AdminLayout_default }, {
	__name: "Blog",
	__ssrInlineRender: true,
	props: {
		posts: {
			type: Object,
			default: () => ({ data: [] })
		},
		categories: {
			type: Array,
			default: () => []
		},
		tags: {
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
				key: "title",
				label: "Title"
			},
			{
				key: "status",
				label: "Status"
			},
			{
				key: "categories",
				label: "Categories"
			},
			{
				key: "published_at",
				label: "Published"
			}
		];
		const search = ref(props.filters?.search ?? "");
		let searchTimer = null;
		watch(search, (value) => {
			clearTimeout(searchTimer);
			searchTimer = setTimeout(() => {
				router.get("/blog", { search: value || void 0 }, {
					preserveState: true,
					preserveScroll: true,
					replace: true,
					only: ["posts", "filters"]
				});
			}, 300);
		});
		const showModal = ref(false);
		const showTaxonomyModal = ref(false);
		const form = useForm({
			id: null,
			title: "",
			excerpt: "",
			body: "",
			featured_image: "",
			status: "draft",
			published_at: "",
			meta_title: "",
			meta_description: "",
			category_ids: [],
			tag_ids: []
		});
		const categoryForm = useForm({ name: "" });
		const tagForm = useForm({ name: "" });
		const categoryEdits = ref({});
		const tagEdits = ref({});
		watch(() => props.categories, (categories) => {
			categoryEdits.value = Object.fromEntries(categories.map((category) => [category.id, category.name]));
		}, { immediate: true });
		watch(() => props.tags, (tags) => {
			tagEdits.value = Object.fromEntries(tags.map((tag) => [tag.id, tag.name]));
		}, { immediate: true });
		const categoryDropdownOpen = ref(false);
		const categorySearch = ref("");
		const categoryWrapper = ref(null);
		const tagDropdownOpen = ref(false);
		const tagSearch = ref("");
		const tagWrapper = ref(null);
		const selectedCategories = computed(() => {
			const ids = form.category_ids.map((id) => Number(id));
			return props.categories.filter((category) => ids.includes(Number(category.id)));
		});
		const selectedTags = computed(() => {
			const ids = form.tag_ids.map((id) => Number(id));
			return props.tags.filter((tag) => ids.includes(Number(tag.id)));
		});
		const filteredCategories = computed(() => {
			const query = categorySearch.value.trim().toLowerCase();
			if (!query) return props.categories;
			return props.categories.filter((category) => String(category.name).toLowerCase().includes(query));
		});
		const filteredTags = computed(() => {
			const query = tagSearch.value.trim().toLowerCase();
			if (!query) return props.tags;
			return props.tags.filter((tag) => String(tag.name).toLowerCase().includes(query));
		});
		const isCategorySelected = (id) => {
			return form.category_ids.map(Number).includes(Number(id));
		};
		const isTagSelected = (id) => {
			return form.tag_ids.map(Number).includes(Number(id));
		};
		const allCategoriesSelected = computed(() => {
			if (filteredCategories.value.length === 0) return false;
			return filteredCategories.value.every((category) => isCategorySelected(category.id));
		});
		const allTagsSelected = computed(() => {
			if (filteredTags.value.length === 0) return false;
			return filteredTags.value.every((tag) => isTagSelected(tag.id));
		});
		const toggleCategoryDropdown = async () => {
			categoryDropdownOpen.value = !categoryDropdownOpen.value;
			if (categoryDropdownOpen.value) {
				tagDropdownOpen.value = false;
				await nextTick();
			}
		};
		const toggleTagDropdown = async () => {
			tagDropdownOpen.value = !tagDropdownOpen.value;
			if (tagDropdownOpen.value) {
				categoryDropdownOpen.value = false;
				await nextTick();
			}
		};
		const toggleCategory = (id) => {
			const numericId = Number(id);
			const current = form.category_ids.map(Number);
			if (current.indexOf(numericId) === -1) form.category_ids = [...current, numericId];
			else form.category_ids = current.filter((value) => value !== numericId);
		};
		const toggleTag = (id) => {
			const numericId = Number(id);
			const current = form.tag_ids.map(Number);
			if (current.indexOf(numericId) === -1) form.tag_ids = [...current, numericId];
			else form.tag_ids = current.filter((value) => value !== numericId);
		};
		const removeCategory = (id) => {
			const numericId = Number(id);
			form.category_ids = form.category_ids.map(Number).filter((value) => value !== numericId);
		};
		const removeTag = (id) => {
			const numericId = Number(id);
			form.tag_ids = form.tag_ids.map(Number).filter((value) => value !== numericId);
		};
		const toggleAllCategories = () => {
			const current = form.category_ids.map(Number);
			if (allCategoriesSelected.value) {
				const idsToRemove = filteredCategories.value.map((category) => Number(category.id));
				form.category_ids = current.filter((id) => !idsToRemove.includes(id));
			} else {
				const ids = new Set(current);
				filteredCategories.value.forEach((category) => {
					ids.add(Number(category.id));
				});
				form.category_ids = [...ids];
			}
		};
		const toggleAllTags = () => {
			const current = form.tag_ids.map(Number);
			if (allTagsSelected.value) {
				const idsToRemove = filteredTags.value.map((tag) => Number(tag.id));
				form.tag_ids = current.filter((id) => !idsToRemove.includes(id));
			} else {
				const ids = new Set(current);
				filteredTags.value.forEach((tag) => {
					ids.add(Number(tag.id));
				});
				form.tag_ids = [...ids];
			}
		};
		const handleClickOutside = (event) => {
			if (categoryWrapper.value && !categoryWrapper.value.contains(event.target)) categoryDropdownOpen.value = false;
			if (tagWrapper.value && !tagWrapper.value.contains(event.target)) tagDropdownOpen.value = false;
		};
		onMounted(() => {
			document.addEventListener("click", handleClickOutside);
		});
		onBeforeUnmount(() => {
			document.removeEventListener("click", handleClickOutside);
			clearTimeout(searchTimer);
		});
		const resetForm = () => {
			form.reset();
			form.clearErrors();
			form.id = null;
			form.title = "";
			form.excerpt = "";
			form.body = "";
			form.featured_image = "";
			form.status = "draft";
			form.published_at = "";
			form.meta_title = "";
			form.meta_description = "";
			form.category_ids = [];
			form.tag_ids = [];
			categorySearch.value = "";
			tagSearch.value = "";
			categoryDropdownOpen.value = false;
			tagDropdownOpen.value = false;
		};
		const openModal = () => {
			resetForm();
			showModal.value = true;
		};
		const closeModal = () => {
			categoryDropdownOpen.value = false;
			tagDropdownOpen.value = false;
			categorySearch.value = "";
			tagSearch.value = "";
			showModal.value = false;
		};
		const editPost = (post) => {
			form.id = post.id;
			form.title = post.title ?? "";
			form.excerpt = post.excerpt ?? "";
			form.body = post.body ?? "";
			form.featured_image = post.featured_image ?? "";
			form.status = post.status ?? "draft";
			form.published_at = post.published_at ? post.published_at.slice(0, 16) : "";
			form.meta_title = post.meta_title ?? "";
			form.meta_description = post.meta_description ?? "";
			form.category_ids = post.categories?.map((category) => Number(category.id)) ?? [];
			form.tag_ids = post.tags?.map((tag) => Number(tag.id)) ?? [];
			form.clearErrors();
			categorySearch.value = "";
			tagSearch.value = "";
			categoryDropdownOpen.value = false;
			tagDropdownOpen.value = false;
			showModal.value = true;
		};
		const savePost = () => {
			const options = {
				preserveScroll: true,
				onSuccess: () => {
					closeModal();
				}
			};
			if (form.id) form.put(`/blog/${form.id}`, options);
			else form.post("/blog", options);
		};
		const deletePost = (id) => {
			if (confirm("Are you sure?")) router.delete(`/blog/${id}`, { preserveScroll: true });
		};
		const saveCategory = () => {
			categoryForm.post("/blog/categories", {
				preserveScroll: true,
				onSuccess: () => {
					categoryForm.reset();
				}
			});
		};
		const updateCategory = (id) => {
			router.put(`/blog/categories/${id}`, { name: categoryEdits.value[id] }, { preserveScroll: true });
		};
		const deleteCategory = (id) => {
			if (confirm("Delete this category? Existing posts will be detached.")) router.delete(`/blog/categories/${id}`, { preserveScroll: true });
		};
		const saveTag = () => {
			tagForm.post("/blog/tags", {
				preserveScroll: true,
				onSuccess: () => {
					tagForm.reset();
				}
			});
		};
		const updateTag = (id) => {
			router.put(`/blog/tags/${id}`, { name: tagEdits.value[id] }, { preserveScroll: true });
		};
		const deleteTag = (id) => {
			if (confirm("Delete this tag? Existing posts will be detached.")) router.delete(`/blog/tags/${id}`, { preserveScroll: true });
		};
		const statusClass = (status) => {
			return {
				published: "ui-badge--success",
				scheduled: "ui-badge--warning"
			}[status] ?? "ui-badge--muted";
		};
		const formatDate = (value) => {
			return value ? new Date(value).toLocaleDateString() : "-";
		};
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({ class: "page" }, _attrs))} data-v-7ad40919>`);
			_push(ssrRenderComponent(_sfc_main$1, {
				title: "Blog Posts",
				subtitle: "Create and manage restaurant articles."
			}, {
				actions: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						if (unref(can)("blog.update")) _push(`<button type="button" class="ui-btn ui-btn--ghost" data-v-7ad40919${_scopeId}> Manage Categories &amp; Tags </button>`);
						else _push(`<!---->`);
						if (unref(can)("blog.create")) _push(`<button type="button" class="ui-btn ui-btn--primary" data-v-7ad40919${_scopeId}> + New Post </button>`);
						else _push(`<!---->`);
					} else return [unref(can)("blog.update") ? (openBlock(), createBlock("button", {
						key: 0,
						type: "button",
						class: "ui-btn ui-btn--ghost",
						onClick: ($event) => showTaxonomyModal.value = true
					}, " Manage Categories & Tags ", 8, ["onClick"])) : createCommentVNode("", true), unref(can)("blog.create") ? (openBlock(), createBlock("button", {
						key: 1,
						type: "button",
						class: "ui-btn ui-btn--primary",
						onClick: openModal
					}, " + New Post ")) : createCommentVNode("", true)];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(DataTable_default, {
				columns,
				rows: props.posts?.data ?? [],
				index: "",
				searchable: "",
				query: search.value,
				"onUpdate:query": ($event) => search.value = $event,
				"search-placeholder": "Search posts...",
				"empty-text": "No blog posts found."
			}, {
				"cell:status": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) _push(`<span class="${ssrRenderClass([statusClass(value), "ui-badge"])}" data-v-7ad40919${_scopeId}>${ssrInterpolate(value)}</span>`);
					else return [createVNode("span", { class: ["ui-badge", statusClass(value)] }, toDisplayString(value), 3)];
				}),
				"cell:categories": withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) _push(`${ssrInterpolate(row.categories?.map((category) => category.name).join(", ") || "-")}`);
					else return [createTextVNode(toDisplayString(row.categories?.map((category) => category.name).join(", ") || "-"), 1)];
				}),
				"cell:published_at": withCtx(({ value }, _push, _parent, _scopeId) => {
					if (_push) _push(`${ssrInterpolate(formatDate(value))}`);
					else return [createTextVNode(toDisplayString(formatDate(value)), 1)];
				}),
				actions: withCtx(({ row }, _push, _parent, _scopeId) => {
					if (_push) {
						if (unref(can)("blog.update")) _push(`<button type="button" class="ui-btn ui-btn--ghost ui-btn--sm" data-v-7ad40919${_scopeId}> Edit </button>`);
						else _push(`<!---->`);
						if (unref(can)("blog.delete")) _push(`<button type="button" class="ui-btn ui-btn--danger ui-btn--sm" data-v-7ad40919${_scopeId}> Delete </button>`);
						else _push(`<!---->`);
					} else return [unref(can)("blog.update") ? (openBlock(), createBlock("button", {
						key: 0,
						type: "button",
						class: "ui-btn ui-btn--ghost ui-btn--sm",
						onClick: ($event) => editPost(row)
					}, " Edit ", 8, ["onClick"])) : createCommentVNode("", true), unref(can)("blog.delete") ? (openBlock(), createBlock("button", {
						key: 1,
						type: "button",
						class: "ui-btn ui-btn--danger ui-btn--sm",
						onClick: ($event) => deletePost(row.id)
					}, " Delete ", 8, ["onClick"])) : createCommentVNode("", true)];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(Pagination_default, {
				paginator: props.posts,
				only: ["posts"]
			}, null, _parent));
			_push(ssrRenderComponent(Modal_default, {
				modelValue: showModal.value,
				"onUpdate:modelValue": ($event) => showModal.value = $event,
				title: unref(form).id ? "Edit Blog Post" : "New Blog Post",
				width: "760px"
			}, {
				footer: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) _push(`<button type="button" class="ui-btn ui-btn--ghost" data-v-7ad40919${_scopeId}> Cancel </button><button type="button" class="ui-btn ui-btn--primary"${ssrIncludeBooleanAttr(unref(form).processing) ? " disabled" : ""} data-v-7ad40919${_scopeId}>${ssrInterpolate(unref(form).processing ? "Saving..." : "Save")}</button>`);
					else return [createVNode("button", {
						type: "button",
						class: "ui-btn ui-btn--ghost",
						onClick: closeModal
					}, " Cancel "), createVNode("button", {
						type: "button",
						class: "ui-btn ui-btn--primary",
						disabled: unref(form).processing,
						onClick: savePost
					}, toDisplayString(unref(form).processing ? "Saving..." : "Save"), 9, ["disabled"])];
				}),
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).title,
							"onUpdate:modelValue": ($event) => unref(form).title = $event,
							label: "Title",
							placeholder: "Article title",
							error: unref(form).errors.title
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).excerpt,
							"onUpdate:modelValue": ($event) => unref(form).excerpt = $event,
							label: "Excerpt",
							type: "textarea",
							placeholder: "Short summary for cards and SEO",
							error: unref(form).errors.excerpt
						}, null, _parent, _scopeId));
						_push(`<div class="editor-field" data-v-7ad40919${_scopeId}><label class="ui-label" data-v-7ad40919${_scopeId}>Body</label><textarea class="blog-body-textarea" placeholder="Write the article..." rows="12" data-v-7ad40919${_scopeId}>${ssrInterpolate(unref(form).body)}</textarea>`);
						if (unref(form).errors.body) _push(`<p class="ui-field__error" data-v-7ad40919${_scopeId}>${ssrInterpolate(unref(form).errors.body)}</p>`);
						else _push(`<!---->`);
						_push(`</div>`);
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).featured_image,
							"onUpdate:modelValue": ($event) => unref(form).featured_image = $event,
							label: "Featured image URL",
							placeholder: "https://...",
							error: unref(form).errors.featured_image
						}, null, _parent, _scopeId));
						_push(`<div class="blog-form-grid" data-v-7ad40919${_scopeId}>`);
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).status,
							"onUpdate:modelValue": ($event) => unref(form).status = $event,
							label: "Status",
							type: "select",
							error: unref(form).errors.status
						}, {
							default: withCtx((_, _push, _parent, _scopeId) => {
								if (_push) _push(`<option value="draft" data-v-7ad40919${_scopeId}> Draft </option><option value="published" data-v-7ad40919${_scopeId}> Published </option><option value="scheduled" data-v-7ad40919${_scopeId}> Scheduled </option>`);
								else return [
									createVNode("option", { value: "draft" }, " Draft "),
									createVNode("option", { value: "published" }, " Published "),
									createVNode("option", { value: "scheduled" }, " Scheduled ")
								];
							}),
							_: 1
						}, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).published_at,
							"onUpdate:modelValue": ($event) => unref(form).published_at = $event,
							label: "Published at",
							type: "datetime-local",
							error: unref(form).errors.published_at
						}, null, _parent, _scopeId));
						_push(`</div><p class="blog-form-hint" data-v-7ad40919${_scopeId}> Select one or more categories and tags. Add new options from Manage Categories &amp; Tags. </p>`);
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).meta_title,
							"onUpdate:modelValue": ($event) => unref(form).meta_title = $event,
							label: "Meta title",
							placeholder: "Optional SEO title",
							error: unref(form).errors.meta_title
						}, null, _parent, _scopeId));
						_push(ssrRenderComponent(_sfc_main$2, {
							modelValue: unref(form).meta_description,
							"onUpdate:modelValue": ($event) => unref(form).meta_description = $event,
							label: "Meta description",
							type: "textarea",
							placeholder: "Optional SEO description",
							error: unref(form).errors.meta_description
						}, null, _parent, _scopeId));
						_push(`<div class="blog-form-grid" data-v-7ad40919${_scopeId}><div class="multi-select-field" data-v-7ad40919${_scopeId}><label class="ui-label" data-v-7ad40919${_scopeId}> Categories </label><div class="${ssrRenderClass([{ "is-open": categoryDropdownOpen.value }, "multi-select-control"])}" data-v-7ad40919${_scopeId}><div class="multi-select-values" data-v-7ad40919${_scopeId}><!--[-->`);
						ssrRenderList(selectedCategories.value, (category) => {
							_push(`<span class="multi-select-chip" data-v-7ad40919${_scopeId}>${ssrInterpolate(category.name)} <button type="button" class="multi-select-chip-remove" data-v-7ad40919${_scopeId}> × </button></span>`);
						});
						_push(`<!--]-->`);
						if (unref(form).category_ids.length === 0) _push(`<span class="multi-select-placeholder" data-v-7ad40919${_scopeId}> Select categories </span>`);
						else _push(`<!---->`);
						_push(`</div><span class="multi-select-arrow" data-v-7ad40919${_scopeId}>${ssrInterpolate(categoryDropdownOpen.value ? "▲" : "▼")}</span></div>`);
						if (categoryDropdownOpen.value) {
							_push(`<div class="multi-select-dropdown" data-v-7ad40919${_scopeId}><div class="multi-select-search-box" data-v-7ad40919${_scopeId}><input${ssrRenderAttr("value", categorySearch.value)} type="text" class="multi-select-search" placeholder="Search categories..." data-v-7ad40919${_scopeId}></div>`);
							if (filteredCategories.value.length) _push(`<div class="multi-select-select-all" data-v-7ad40919${_scopeId}><input type="checkbox"${ssrIncludeBooleanAttr(allCategoriesSelected.value) ? " checked" : ""} data-v-7ad40919${_scopeId}><span data-v-7ad40919${_scopeId}>${ssrInterpolate(allCategoriesSelected.value ? "Deselect all" : "Select all")}</span></div>`);
							else _push(`<!---->`);
							_push(`<div class="multi-select-options" data-v-7ad40919${_scopeId}><!--[-->`);
							ssrRenderList(filteredCategories.value, (category) => {
								_push(`<label class="${ssrRenderClass([{ selected: isCategorySelected(category.id) }, "multi-select-option"])}" data-v-7ad40919${_scopeId}><input type="checkbox"${ssrIncludeBooleanAttr(isCategorySelected(category.id)) ? " checked" : ""} data-v-7ad40919${_scopeId}><span data-v-7ad40919${_scopeId}>${ssrInterpolate(category.name)}</span></label>`);
							});
							_push(`<!--]-->`);
							if (filteredCategories.value.length === 0) _push(`<div class="multi-select-empty" data-v-7ad40919${_scopeId}> No categories found. </div>`);
							else _push(`<!---->`);
							_push(`</div></div>`);
						} else _push(`<!---->`);
						if (unref(form).errors.category_ids) _push(`<p class="ui-field__error" data-v-7ad40919${_scopeId}>${ssrInterpolate(unref(form).errors.category_ids)}</p>`);
						else _push(`<!---->`);
						_push(`</div><div class="multi-select-field" data-v-7ad40919${_scopeId}><label class="ui-label" data-v-7ad40919${_scopeId}> Tags </label><div class="${ssrRenderClass([{ "is-open": tagDropdownOpen.value }, "multi-select-control"])}" data-v-7ad40919${_scopeId}><div class="multi-select-values" data-v-7ad40919${_scopeId}><!--[-->`);
						ssrRenderList(selectedTags.value, (tag) => {
							_push(`<span class="multi-select-chip" data-v-7ad40919${_scopeId}>${ssrInterpolate(tag.name)} <button type="button" class="multi-select-chip-remove" data-v-7ad40919${_scopeId}> × </button></span>`);
						});
						_push(`<!--]-->`);
						if (unref(form).tag_ids.length === 0) _push(`<span class="multi-select-placeholder" data-v-7ad40919${_scopeId}> Select tags </span>`);
						else _push(`<!---->`);
						_push(`</div><span class="multi-select-arrow" data-v-7ad40919${_scopeId}>${ssrInterpolate(tagDropdownOpen.value ? "▲" : "▼")}</span></div>`);
						if (tagDropdownOpen.value) {
							_push(`<div class="multi-select-dropdown" data-v-7ad40919${_scopeId}><div class="multi-select-search-box" data-v-7ad40919${_scopeId}><input${ssrRenderAttr("value", tagSearch.value)} type="text" class="multi-select-search" placeholder="Search tags..." data-v-7ad40919${_scopeId}></div>`);
							if (filteredTags.value.length) _push(`<div class="multi-select-select-all" data-v-7ad40919${_scopeId}><input type="checkbox"${ssrIncludeBooleanAttr(allTagsSelected.value) ? " checked" : ""} data-v-7ad40919${_scopeId}><span data-v-7ad40919${_scopeId}>${ssrInterpolate(allTagsSelected.value ? "Deselect all" : "Select all")}</span></div>`);
							else _push(`<!---->`);
							_push(`<div class="multi-select-options" data-v-7ad40919${_scopeId}><!--[-->`);
							ssrRenderList(filteredTags.value, (tag) => {
								_push(`<label class="${ssrRenderClass([{ selected: isTagSelected(tag.id) }, "multi-select-option"])}" data-v-7ad40919${_scopeId}><input type="checkbox"${ssrIncludeBooleanAttr(isTagSelected(tag.id)) ? " checked" : ""} data-v-7ad40919${_scopeId}><span data-v-7ad40919${_scopeId}>${ssrInterpolate(tag.name)}</span></label>`);
							});
							_push(`<!--]-->`);
							if (filteredTags.value.length === 0) _push(`<div class="multi-select-empty" data-v-7ad40919${_scopeId}> No tags found. </div>`);
							else _push(`<!---->`);
							_push(`</div></div>`);
						} else _push(`<!---->`);
						if (unref(form).errors.tag_ids) _push(`<p class="ui-field__error" data-v-7ad40919${_scopeId}>${ssrInterpolate(unref(form).errors.tag_ids)}</p>`);
						else _push(`<!---->`);
						_push(`</div></div>`);
					} else return [
						createVNode(_sfc_main$2, {
							modelValue: unref(form).title,
							"onUpdate:modelValue": ($event) => unref(form).title = $event,
							label: "Title",
							placeholder: "Article title",
							error: unref(form).errors.title
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode(_sfc_main$2, {
							modelValue: unref(form).excerpt,
							"onUpdate:modelValue": ($event) => unref(form).excerpt = $event,
							label: "Excerpt",
							type: "textarea",
							placeholder: "Short summary for cards and SEO",
							error: unref(form).errors.excerpt
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode("div", { class: "editor-field" }, [
							createVNode("label", { class: "ui-label" }, "Body"),
							withDirectives(createVNode("textarea", {
								"onUpdate:modelValue": ($event) => unref(form).body = $event,
								class: "blog-body-textarea",
								placeholder: "Write the article...",
								rows: "12"
							}, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(form).body]]),
							unref(form).errors.body ? (openBlock(), createBlock("p", {
								key: 0,
								class: "ui-field__error"
							}, toDisplayString(unref(form).errors.body), 1)) : createCommentVNode("", true)
						]),
						createVNode(_sfc_main$2, {
							modelValue: unref(form).featured_image,
							"onUpdate:modelValue": ($event) => unref(form).featured_image = $event,
							label: "Featured image URL",
							placeholder: "https://...",
							error: unref(form).errors.featured_image
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode("div", { class: "blog-form-grid" }, [createVNode(_sfc_main$2, {
							modelValue: unref(form).status,
							"onUpdate:modelValue": ($event) => unref(form).status = $event,
							label: "Status",
							type: "select",
							error: unref(form).errors.status
						}, {
							default: withCtx(() => [
								createVNode("option", { value: "draft" }, " Draft "),
								createVNode("option", { value: "published" }, " Published "),
								createVNode("option", { value: "scheduled" }, " Scheduled ")
							]),
							_: 1
						}, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]), createVNode(_sfc_main$2, {
							modelValue: unref(form).published_at,
							"onUpdate:modelValue": ($event) => unref(form).published_at = $event,
							label: "Published at",
							type: "datetime-local",
							error: unref(form).errors.published_at
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						])]),
						createVNode("p", { class: "blog-form-hint" }, " Select one or more categories and tags. Add new options from Manage Categories & Tags. "),
						createVNode(_sfc_main$2, {
							modelValue: unref(form).meta_title,
							"onUpdate:modelValue": ($event) => unref(form).meta_title = $event,
							label: "Meta title",
							placeholder: "Optional SEO title",
							error: unref(form).errors.meta_title
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode(_sfc_main$2, {
							modelValue: unref(form).meta_description,
							"onUpdate:modelValue": ($event) => unref(form).meta_description = $event,
							label: "Meta description",
							type: "textarea",
							placeholder: "Optional SEO description",
							error: unref(form).errors.meta_description
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"error"
						]),
						createVNode("div", { class: "blog-form-grid" }, [createVNode("div", {
							ref_key: "categoryWrapper",
							ref: categoryWrapper,
							class: "multi-select-field"
						}, [
							createVNode("label", { class: "ui-label" }, " Categories "),
							createVNode("div", {
								class: ["multi-select-control", { "is-open": categoryDropdownOpen.value }],
								onClick: toggleCategoryDropdown
							}, [createVNode("div", { class: "multi-select-values" }, [(openBlock(true), createBlock(Fragment, null, renderList(selectedCategories.value, (category) => {
								return openBlock(), createBlock("span", {
									key: category.id,
									class: "multi-select-chip",
									onClick: withModifiers(() => {}, ["stop"])
								}, [createTextVNode(toDisplayString(category.name) + " ", 1), createVNode("button", {
									type: "button",
									class: "multi-select-chip-remove",
									onClick: withModifiers(($event) => removeCategory(category.id), ["stop"])
								}, " × ", 8, ["onClick"])], 8, ["onClick"]);
							}), 128)), unref(form).category_ids.length === 0 ? (openBlock(), createBlock("span", {
								key: 0,
								class: "multi-select-placeholder"
							}, " Select categories ")) : createCommentVNode("", true)]), createVNode("span", { class: "multi-select-arrow" }, toDisplayString(categoryDropdownOpen.value ? "▲" : "▼"), 1)], 2),
							categoryDropdownOpen.value ? (openBlock(), createBlock("div", {
								key: 0,
								class: "multi-select-dropdown",
								onClick: withModifiers(() => {}, ["stop"])
							}, [
								createVNode("div", { class: "multi-select-search-box" }, [withDirectives(createVNode("input", {
									"onUpdate:modelValue": ($event) => categorySearch.value = $event,
									type: "text",
									class: "multi-select-search",
									placeholder: "Search categories...",
									onClick: withModifiers(() => {}, ["stop"])
								}, null, 8, ["onUpdate:modelValue", "onClick"]), [[vModelText, categorySearch.value]])]),
								filteredCategories.value.length ? (openBlock(), createBlock("div", {
									key: 0,
									class: "multi-select-select-all",
									onClick: toggleAllCategories
								}, [createVNode("input", {
									type: "checkbox",
									checked: allCategoriesSelected.value,
									onClick: withModifiers(toggleAllCategories, ["stop"])
								}, null, 8, ["checked"]), createVNode("span", null, toDisplayString(allCategoriesSelected.value ? "Deselect all" : "Select all"), 1)])) : createCommentVNode("", true),
								createVNode("div", { class: "multi-select-options" }, [(openBlock(true), createBlock(Fragment, null, renderList(filteredCategories.value, (category) => {
									return openBlock(), createBlock("label", {
										key: category.id,
										class: ["multi-select-option", { selected: isCategorySelected(category.id) }]
									}, [createVNode("input", {
										type: "checkbox",
										checked: isCategorySelected(category.id),
										onChange: ($event) => toggleCategory(category.id)
									}, null, 40, ["checked", "onChange"]), createVNode("span", null, toDisplayString(category.name), 1)], 2);
								}), 128)), filteredCategories.value.length === 0 ? (openBlock(), createBlock("div", {
									key: 0,
									class: "multi-select-empty"
								}, " No categories found. ")) : createCommentVNode("", true)])
							], 8, ["onClick"])) : createCommentVNode("", true),
							unref(form).errors.category_ids ? (openBlock(), createBlock("p", {
								key: 1,
								class: "ui-field__error"
							}, toDisplayString(unref(form).errors.category_ids), 1)) : createCommentVNode("", true)
						], 512), createVNode("div", {
							ref_key: "tagWrapper",
							ref: tagWrapper,
							class: "multi-select-field"
						}, [
							createVNode("label", { class: "ui-label" }, " Tags "),
							createVNode("div", {
								class: ["multi-select-control", { "is-open": tagDropdownOpen.value }],
								onClick: toggleTagDropdown
							}, [createVNode("div", { class: "multi-select-values" }, [(openBlock(true), createBlock(Fragment, null, renderList(selectedTags.value, (tag) => {
								return openBlock(), createBlock("span", {
									key: tag.id,
									class: "multi-select-chip",
									onClick: withModifiers(() => {}, ["stop"])
								}, [createTextVNode(toDisplayString(tag.name) + " ", 1), createVNode("button", {
									type: "button",
									class: "multi-select-chip-remove",
									onClick: withModifiers(($event) => removeTag(tag.id), ["stop"])
								}, " × ", 8, ["onClick"])], 8, ["onClick"]);
							}), 128)), unref(form).tag_ids.length === 0 ? (openBlock(), createBlock("span", {
								key: 0,
								class: "multi-select-placeholder"
							}, " Select tags ")) : createCommentVNode("", true)]), createVNode("span", { class: "multi-select-arrow" }, toDisplayString(tagDropdownOpen.value ? "▲" : "▼"), 1)], 2),
							tagDropdownOpen.value ? (openBlock(), createBlock("div", {
								key: 0,
								class: "multi-select-dropdown",
								onClick: withModifiers(() => {}, ["stop"])
							}, [
								createVNode("div", { class: "multi-select-search-box" }, [withDirectives(createVNode("input", {
									"onUpdate:modelValue": ($event) => tagSearch.value = $event,
									type: "text",
									class: "multi-select-search",
									placeholder: "Search tags...",
									onClick: withModifiers(() => {}, ["stop"])
								}, null, 8, ["onUpdate:modelValue", "onClick"]), [[vModelText, tagSearch.value]])]),
								filteredTags.value.length ? (openBlock(), createBlock("div", {
									key: 0,
									class: "multi-select-select-all",
									onClick: toggleAllTags
								}, [createVNode("input", {
									type: "checkbox",
									checked: allTagsSelected.value,
									onClick: withModifiers(toggleAllTags, ["stop"])
								}, null, 8, ["checked"]), createVNode("span", null, toDisplayString(allTagsSelected.value ? "Deselect all" : "Select all"), 1)])) : createCommentVNode("", true),
								createVNode("div", { class: "multi-select-options" }, [(openBlock(true), createBlock(Fragment, null, renderList(filteredTags.value, (tag) => {
									return openBlock(), createBlock("label", {
										key: tag.id,
										class: ["multi-select-option", { selected: isTagSelected(tag.id) }]
									}, [createVNode("input", {
										type: "checkbox",
										checked: isTagSelected(tag.id),
										onChange: ($event) => toggleTag(tag.id)
									}, null, 40, ["checked", "onChange"]), createVNode("span", null, toDisplayString(tag.name), 1)], 2);
								}), 128)), filteredTags.value.length === 0 ? (openBlock(), createBlock("div", {
									key: 0,
									class: "multi-select-empty"
								}, " No tags found. ")) : createCommentVNode("", true)])
							], 8, ["onClick"])) : createCommentVNode("", true),
							unref(form).errors.tag_ids ? (openBlock(), createBlock("p", {
								key: 1,
								class: "ui-field__error"
							}, toDisplayString(unref(form).errors.tag_ids), 1)) : createCommentVNode("", true)
						], 512)])
					];
				}),
				_: 1
			}, _parent));
			_push(ssrRenderComponent(Modal_default, {
				modelValue: showTaxonomyModal.value,
				"onUpdate:modelValue": ($event) => showTaxonomyModal.value = $event,
				title: "Manage Categories & Tags",
				width: "760px"
			}, {
				default: withCtx((_, _push, _parent, _scopeId) => {
					if (_push) {
						_push(`<div class="taxonomy-grid" data-v-7ad40919${_scopeId}><section data-v-7ad40919${_scopeId}><h3 data-v-7ad40919${_scopeId}> Categories </h3><form class="taxonomy-add" data-v-7ad40919${_scopeId}><input${ssrRenderAttr("value", unref(categoryForm).name)} class="ui-input" placeholder="New category name" data-v-7ad40919${_scopeId}><button type="submit" class="ui-btn ui-btn--primary"${ssrIncludeBooleanAttr(unref(categoryForm).processing) ? " disabled" : ""} data-v-7ad40919${_scopeId}>${ssrInterpolate(unref(categoryForm).processing ? "Adding..." : "Add")}</button></form>`);
						if (unref(categoryForm).errors.name) _push(`<p class="ui-field__error" data-v-7ad40919${_scopeId}>${ssrInterpolate(unref(categoryForm).errors.name)}</p>`);
						else _push(`<!---->`);
						_push(`<!--[-->`);
						ssrRenderList(props.categories, (category) => {
							_push(`<div class="taxonomy-row" data-v-7ad40919${_scopeId}><input${ssrRenderAttr("value", categoryEdits.value[category.id])} class="ui-input" data-v-7ad40919${_scopeId}><button type="button" class="ui-btn ui-btn--ghost ui-btn--sm" data-v-7ad40919${_scopeId}> Save </button><button type="button" class="ui-btn ui-btn--danger ui-btn--sm" data-v-7ad40919${_scopeId}> Delete </button></div>`);
						});
						_push(`<!--]--></section><section data-v-7ad40919${_scopeId}><h3 data-v-7ad40919${_scopeId}> Tags </h3><form class="taxonomy-add" data-v-7ad40919${_scopeId}><input${ssrRenderAttr("value", unref(tagForm).name)} class="ui-input" placeholder="New tag name" data-v-7ad40919${_scopeId}><button type="submit" class="ui-btn ui-btn--primary"${ssrIncludeBooleanAttr(unref(tagForm).processing) ? " disabled" : ""} data-v-7ad40919${_scopeId}>${ssrInterpolate(unref(tagForm).processing ? "Adding..." : "Add")}</button></form>`);
						if (unref(tagForm).errors.name) _push(`<p class="ui-field__error" data-v-7ad40919${_scopeId}>${ssrInterpolate(unref(tagForm).errors.name)}</p>`);
						else _push(`<!---->`);
						_push(`<!--[-->`);
						ssrRenderList(props.tags, (tag) => {
							_push(`<div class="taxonomy-row" data-v-7ad40919${_scopeId}><input${ssrRenderAttr("value", tagEdits.value[tag.id])} class="ui-input" data-v-7ad40919${_scopeId}><button type="button" class="ui-btn ui-btn--ghost ui-btn--sm" data-v-7ad40919${_scopeId}> Save </button><button type="button" class="ui-btn ui-btn--danger ui-btn--sm" data-v-7ad40919${_scopeId}> Delete </button></div>`);
						});
						_push(`<!--]--></section></div>`);
					} else return [createVNode("div", { class: "taxonomy-grid" }, [createVNode("section", null, [
						createVNode("h3", null, " Categories "),
						createVNode("form", {
							class: "taxonomy-add",
							onSubmit: withModifiers(saveCategory, ["prevent"])
						}, [withDirectives(createVNode("input", {
							"onUpdate:modelValue": ($event) => unref(categoryForm).name = $event,
							class: "ui-input",
							placeholder: "New category name"
						}, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(categoryForm).name]]), createVNode("button", {
							type: "submit",
							class: "ui-btn ui-btn--primary",
							disabled: unref(categoryForm).processing
						}, toDisplayString(unref(categoryForm).processing ? "Adding..." : "Add"), 9, ["disabled"])], 32),
						unref(categoryForm).errors.name ? (openBlock(), createBlock("p", {
							key: 0,
							class: "ui-field__error"
						}, toDisplayString(unref(categoryForm).errors.name), 1)) : createCommentVNode("", true),
						(openBlock(true), createBlock(Fragment, null, renderList(props.categories, (category) => {
							return openBlock(), createBlock("div", {
								key: category.id,
								class: "taxonomy-row"
							}, [
								withDirectives(createVNode("input", {
									"onUpdate:modelValue": ($event) => categoryEdits.value[category.id] = $event,
									class: "ui-input"
								}, null, 8, ["onUpdate:modelValue"]), [[vModelText, categoryEdits.value[category.id]]]),
								createVNode("button", {
									type: "button",
									class: "ui-btn ui-btn--ghost ui-btn--sm",
									onClick: ($event) => updateCategory(category.id)
								}, " Save ", 8, ["onClick"]),
								createVNode("button", {
									type: "button",
									class: "ui-btn ui-btn--danger ui-btn--sm",
									onClick: ($event) => deleteCategory(category.id)
								}, " Delete ", 8, ["onClick"])
							]);
						}), 128))
					]), createVNode("section", null, [
						createVNode("h3", null, " Tags "),
						createVNode("form", {
							class: "taxonomy-add",
							onSubmit: withModifiers(saveTag, ["prevent"])
						}, [withDirectives(createVNode("input", {
							"onUpdate:modelValue": ($event) => unref(tagForm).name = $event,
							class: "ui-input",
							placeholder: "New tag name"
						}, null, 8, ["onUpdate:modelValue"]), [[vModelText, unref(tagForm).name]]), createVNode("button", {
							type: "submit",
							class: "ui-btn ui-btn--primary",
							disabled: unref(tagForm).processing
						}, toDisplayString(unref(tagForm).processing ? "Adding..." : "Add"), 9, ["disabled"])], 32),
						unref(tagForm).errors.name ? (openBlock(), createBlock("p", {
							key: 0,
							class: "ui-field__error"
						}, toDisplayString(unref(tagForm).errors.name), 1)) : createCommentVNode("", true),
						(openBlock(true), createBlock(Fragment, null, renderList(props.tags, (tag) => {
							return openBlock(), createBlock("div", {
								key: tag.id,
								class: "taxonomy-row"
							}, [
								withDirectives(createVNode("input", {
									"onUpdate:modelValue": ($event) => tagEdits.value[tag.id] = $event,
									class: "ui-input"
								}, null, 8, ["onUpdate:modelValue"]), [[vModelText, tagEdits.value[tag.id]]]),
								createVNode("button", {
									type: "button",
									class: "ui-btn ui-btn--ghost ui-btn--sm",
									onClick: ($event) => updateTag(tag.id)
								}, " Save ", 8, ["onClick"]),
								createVNode("button", {
									type: "button",
									class: "ui-btn ui-btn--danger ui-btn--sm",
									onClick: ($event) => deleteTag(tag.id)
								}, " Delete ", 8, ["onClick"])
							]);
						}), 128))
					])])];
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
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/pages/Blog.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var Blog_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-7ad40919"]]);
//#endregion
export { Blog_default as default };
