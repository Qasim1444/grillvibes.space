<template>
    <div class="page">

        <!-- =====================================================
             PAGE HEADER
        ====================================================== -->
        <PageHeader
            title="Blog Posts"
            subtitle="Create and manage restaurant articles."
        >
            <template #actions>

                <button
                    v-if="can('blog.update')"
                    type="button"
                    class="ui-btn ui-btn--ghost"
                    @click="showTaxonomyModal = true"
                >
                    Manage Categories & Tags
                </button>

                <button
                    v-if="can('blog.create')"
                    type="button"
                    class="ui-btn ui-btn--primary"
                    @click="openModal"
                >
                    + New Post
                </button>

            </template>
        </PageHeader>


        <!-- =====================================================
             POSTS TABLE
        ====================================================== -->
        <DataTable
            :columns="columns"
            :rows="props.posts?.data ?? []"
            index
            searchable
            v-model:query="search"
            search-placeholder="Search posts..."
            empty-text="No blog posts found."
        >

            <!-- STATUS -->
            <template #cell:status="{ value }">

                <span
                    class="ui-badge"
                    :class="statusClass(value)"
                >
                    {{ value }}
                </span>

            </template>


            <!-- CATEGORIES -->
            <template #cell:categories="{ row }">

                {{
                    row.categories
                        ?.map(category => category.name)
                        .join(', ') || '-'
                }}

            </template>


            <!-- PUBLISHED DATE -->
            <template #cell:published_at="{ value }">

                {{ formatDate(value) }}

            </template>


            <!-- ACTIONS -->
            <template #actions="{ row }">

                <button
                    v-if="can('blog.update')"
                    type="button"
                    class="ui-btn ui-btn--ghost ui-btn--sm"
                    @click="editPost(row)"
                >
                    Edit
                </button>

                <button
                    v-if="can('blog.delete')"
                    type="button"
                    class="ui-btn ui-btn--danger ui-btn--sm"
                    @click="deletePost(row.id)"
                >
                    Delete
                </button>

            </template>

        </DataTable>


        <!-- =====================================================
             PAGINATION
        ====================================================== -->
        <Pagination
            :paginator="props.posts"
            :only="['posts']"
        />


        <!-- =====================================================
             CREATE / EDIT POST MODAL
        ====================================================== -->
        <Modal
            v-model="showModal"
            :title="
                form.id
                    ? 'Edit Blog Post'
                    : 'New Blog Post'
            "
            width="760px"
        >

            <!-- TITLE -->
            <FormField
                v-model="form.title"
                label="Title"
                placeholder="Article title"
                :error="form.errors.title"
            />


            <!-- EXCERPT -->
            <FormField
                v-model="form.excerpt"
                label="Excerpt"
                type="textarea"
                placeholder="Short summary for cards and SEO"
                :error="form.errors.excerpt"
            />


            <!-- BODY -->
            <div class="editor-field">
                <label class="ui-label">Body</label>

                <textarea
                    v-model="form.body"
                    class="blog-body-textarea"
                    placeholder="Write the article..."
                    rows="12"
                ></textarea>

                <p v-if="form.errors.body" class="ui-field__error">{{ form.errors.body }}</p>
            </div>


            <!-- FEATURED IMAGE -->
            <FormField
                v-model="form.featured_image"
                label="Featured image URL"
                placeholder="https://..."
                :error="form.errors.featured_image"
            />


            <!-- STATUS / DATE -->
            <div class="blog-form-grid">

                <FormField
                    v-model="form.status"
                    label="Status"
                    type="select"
                    :error="form.errors.status"
                >
                    <option value="draft">
                        Draft
                    </option>

                    <option value="published">
                        Published
                    </option>

                    <option value="scheduled">
                        Scheduled
                    </option>
                </FormField>


                <FormField
                    v-model="form.published_at"
                    label="Published at"
                    type="datetime-local"
                    :error="form.errors.published_at"
                />

            </div>


            <!-- HINT -->
            <p class="blog-form-hint">
                Select one or more categories and tags.
                Add new options from Manage Categories & Tags.
            </p>


            <!-- META TITLE -->
            <FormField
                v-model="form.meta_title"
                label="Meta title"
                placeholder="Optional SEO title"
                :error="form.errors.meta_title"
            />


            <!-- META DESCRIPTION -->
            <FormField
                v-model="form.meta_description"
                label="Meta description"
                type="textarea"
                placeholder="Optional SEO description"
                :error="form.errors.meta_description"
            />


            <!-- =================================================
                 CATEGORY + TAG MULTI SELECT
            ================================================== -->
            <div class="blog-form-grid">


                <!-- =================================================
                     CATEGORIES
                ================================================== -->
                <div
                    ref="categoryWrapper"
                    class="multi-select-field"
                >

                    <label class="ui-label">
                        Categories
                    </label>


                    <!-- SELECT CONTROL -->
                    <div
                        class="multi-select-control"
                        :class="{
                            'is-open':
                                categoryDropdownOpen
                        }"
                        @click="toggleCategoryDropdown"
                    >

                        <div class="multi-select-values">

                            <!-- SELECTED CATEGORY CHIPS -->
                            <span
                                v-for="category in selectedCategories"
                                :key="category.id"
                                class="multi-select-chip"
                                @click.stop
                            >

                                {{ category.name }}

                                <button
                                    type="button"
                                    class="multi-select-chip-remove"
                                    @click.stop="
                                        removeCategory(category.id)
                                    "
                                >
                                    ×
                                </button>

                            </span>


                            <!-- PLACEHOLDER -->
                            <span
                                v-if="
                                    form.category_ids.length === 0
                                "
                                class="multi-select-placeholder"
                            >
                                Select categories
                            </span>

                        </div>


                        <!-- ARROW -->
                        <span class="multi-select-arrow">
                            {{
                                categoryDropdownOpen
                                    ? '▲'
                                    : '▼'
                            }}
                        </span>

                    </div>


                    <!-- CATEGORY DROPDOWN -->
                    <div
                        v-if="categoryDropdownOpen"
                        class="multi-select-dropdown"
                        @click.stop
                    >

                        <!-- SEARCH -->
                        <div class="multi-select-search-box">

                            <input
                                v-model="categorySearch"
                                type="text"
                                class="multi-select-search"
                                placeholder="Search categories..."
                                @click.stop
                            />

                        </div>


                        <!-- SELECT ALL -->
                        <div
                            v-if="filteredCategories.length"
                            class="multi-select-select-all"
                            @click="toggleAllCategories"
                        >

                            <input
                                type="checkbox"
                                :checked="allCategoriesSelected"
                                @click.stop="toggleAllCategories"
                            />

                            <span>
                                {{
                                    allCategoriesSelected
                                        ? 'Deselect all'
                                        : 'Select all'
                                }}
                            </span>

                        </div>


                        <!-- OPTIONS -->
                        <div class="multi-select-options">

                            <label
                                v-for="category in filteredCategories"
                                :key="category.id"
                                class="multi-select-option"
                                :class="{
                                    selected:
                                        isCategorySelected(
                                            category.id
                                        )
                                }"
                            >

                                <input
                                    type="checkbox"
                                    :checked="
                                        isCategorySelected(
                                            category.id
                                        )
                                    "
                                    @change="
                                        toggleCategory(
                                            category.id
                                        )
                                    "
                                />

                                <span>
                                    {{ category.name }}
                                </span>

                            </label>


                            <!-- NO RESULTS -->
                            <div
                                v-if="
                                    filteredCategories.length === 0
                                "
                                class="multi-select-empty"
                            >
                                No categories found.
                            </div>

                        </div>

                    </div>


                    <!-- ERROR -->
                    <p
                        v-if="form.errors.category_ids"
                        class="ui-field__error"
                    >
                        {{ form.errors.category_ids }}
                    </p>

                </div>


                <!-- =================================================
                     TAGS
                ================================================== -->
                <div
                    ref="tagWrapper"
                    class="multi-select-field"
                >

                    <label class="ui-label">
                        Tags
                    </label>


                    <!-- SELECT CONTROL -->
                    <div
                        class="multi-select-control"
                        :class="{
                            'is-open':
                                tagDropdownOpen
                        }"
                        @click="toggleTagDropdown"
                    >

                        <div class="multi-select-values">

                            <!-- SELECTED TAG CHIPS -->
                            <span
                                v-for="tag in selectedTags"
                                :key="tag.id"
                                class="multi-select-chip"
                                @click.stop
                            >

                                {{ tag.name }}

                                <button
                                    type="button"
                                    class="multi-select-chip-remove"
                                    @click.stop="
                                        removeTag(tag.id)
                                    "
                                >
                                    ×
                                </button>

                            </span>


                            <!-- PLACEHOLDER -->
                            <span
                                v-if="
                                    form.tag_ids.length === 0
                                "
                                class="multi-select-placeholder"
                            >
                                Select tags
                            </span>

                        </div>


                        <!-- ARROW -->
                        <span class="multi-select-arrow">
                            {{
                                tagDropdownOpen
                                    ? '▲'
                                    : '▼'
                            }}
                        </span>

                    </div>


                    <!-- TAG DROPDOWN -->
                    <div
                        v-if="tagDropdownOpen"
                        class="multi-select-dropdown"
                        @click.stop
                    >

                        <!-- SEARCH -->
                        <div class="multi-select-search-box">

                            <input
                                v-model="tagSearch"
                                type="text"
                                class="multi-select-search"
                                placeholder="Search tags..."
                                @click.stop
                            />

                        </div>


                        <!-- SELECT ALL -->
                        <div
                            v-if="filteredTags.length"
                            class="multi-select-select-all"
                            @click="toggleAllTags"
                        >

                            <input
                                type="checkbox"
                                :checked="allTagsSelected"
                                @click.stop="toggleAllTags"
                            />

                            <span>
                                {{
                                    allTagsSelected
                                        ? 'Deselect all'
                                        : 'Select all'
                                }}
                            </span>

                        </div>


                        <!-- OPTIONS -->
                        <div class="multi-select-options">

                            <label
                                v-for="tag in filteredTags"
                                :key="tag.id"
                                class="multi-select-option"
                                :class="{
                                    selected:
                                        isTagSelected(tag.id)
                                }"
                            >

                                <input
                                    type="checkbox"
                                    :checked="
                                        isTagSelected(tag.id)
                                    "
                                    @change="
                                        toggleTag(tag.id)
                                    "
                                />

                                <span>
                                    {{ tag.name }}
                                </span>

                            </label>


                            <!-- NO RESULTS -->
                            <div
                                v-if="filteredTags.length === 0"
                                class="multi-select-empty"
                            >
                                No tags found.
                            </div>

                        </div>

                    </div>


                    <!-- ERROR -->
                    <p
                        v-if="form.errors.tag_ids"
                        class="ui-field__error"
                    >
                        {{ form.errors.tag_ids }}
                    </p>

                </div>

            </div>


            <!-- =================================================
                 FOOTER
            ================================================== -->
            <template #footer>

                <button
                    type="button"
                    class="ui-btn ui-btn--ghost"
                    @click="closeModal"
                >
                    Cancel
                </button>

                <button
                    type="button"
                    class="ui-btn ui-btn--primary"
                    :disabled="form.processing"
                    @click="savePost"
                >
                    {{
                        form.processing
                            ? 'Saving...'
                            : 'Save'
                    }}
                </button>

            </template>

        </Modal>


        <!-- =====================================================
             MANAGE CATEGORIES & TAGS
        ====================================================== -->
        <Modal
            v-model="showTaxonomyModal"
            title="Manage Categories & Tags"
            width="760px"
        >

            <div class="taxonomy-grid">

                <!-- CATEGORIES -->
                <section>

                    <h3>
                        Categories
                    </h3>

                    <form
                        class="taxonomy-add"
                        @submit.prevent="saveCategory"
                    >

                        <input
                            v-model="categoryForm.name"
                            class="ui-input"
                            placeholder="New category name"
                        />

                        <button
                            type="submit"
                            class="ui-btn ui-btn--primary"
                            :disabled="
                                categoryForm.processing
                            "
                        >
                            {{
                                categoryForm.processing
                                    ? 'Adding...'
                                    : 'Add'
                            }}
                        </button>

                    </form>


                    <p
                        v-if="categoryForm.errors.name"
                        class="ui-field__error"
                    >
                        {{ categoryForm.errors.name }}
                    </p>


                    <div
                        v-for="category in props.categories"
                        :key="category.id"
                        class="taxonomy-row"
                    >

                        <input
                            v-model="
                                categoryEdits[category.id]
                            "
                            class="ui-input"
                        />


                        <button
                            type="button"
                            class="ui-btn ui-btn--ghost ui-btn--sm"
                            @click="
                                updateCategory(category.id)
                            "
                        >
                            Save
                        </button>


                        <button
                            type="button"
                            class="ui-btn ui-btn--danger ui-btn--sm"
                            @click="
                                deleteCategory(category.id)
                            "
                        >
                            Delete
                        </button>

                    </div>

                </section>


                <!-- TAGS -->
                <section>

                    <h3>
                        Tags
                    </h3>

                    <form
                        class="taxonomy-add"
                        @submit.prevent="saveTag"
                    >

                        <input
                            v-model="tagForm.name"
                            class="ui-input"
                            placeholder="New tag name"
                        />

                        <button
                            type="submit"
                            class="ui-btn ui-btn--primary"
                            :disabled="
                                tagForm.processing
                            "
                        >
                            {{
                                tagForm.processing
                                    ? 'Adding...'
                                    : 'Add'
                            }}
                        </button>

                    </form>


                    <p
                        v-if="tagForm.errors.name"
                        class="ui-field__error"
                    >
                        {{ tagForm.errors.name }}
                    </p>


                    <div
                        v-for="tag in props.tags"
                        :key="tag.id"
                        class="taxonomy-row"
                    >

                        <input
                            v-model="
                                tagEdits[tag.id]
                            "
                            class="ui-input"
                        />


                        <button
                            type="button"
                            class="ui-btn ui-btn--ghost ui-btn--sm"
                            @click="
                                updateTag(tag.id)
                            "
                        >
                            Save
                        </button>


                        <button
                            type="button"
                            class="ui-btn ui-btn--danger ui-btn--sm"
                            @click="
                                deleteTag(tag.id)
                            "
                        >
                            Delete
                        </button>

                    </div>

                </section>

            </div>

        </Modal>

    </div>
</template>


<script setup>
import { confirmDialog } from "../composables/useNotifications";

import {
    computed,
    nextTick,
    onBeforeUnmount,
    onMounted,
    ref,
    watch
} from 'vue';

import {
    router,
    useForm
} from '@inertiajs/vue3';

import AdminLayout from '../layouts/AdminLayout.vue';

import PageHeader from '../components/ui/PageHeader.vue';

import DataTable from '../components/ui/DataTable.vue';

import Pagination from '../components/ui/Pagination.vue';

import Modal from '../components/ui/Modal.vue';

import FormField from '../components/ui/FormField.vue';

import {
    usePermissions
} from '../composables/usePermissions';


// ============================================================
// LAYOUT
// ============================================================

defineOptions({
    layout: AdminLayout
});


// ============================================================
// PERMISSIONS
// ============================================================

const {
    can
} = usePermissions();


// ============================================================
// PROPS
// ============================================================

const props = defineProps({

    posts: {
        type: Object,
        default: () => ({
            data: []
        })
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
        default: () => ({
            search: ''
        })
    }

});


// ============================================================
// TABLE
// ============================================================

const columns = [

    {
        key: 'title',
        label: 'Title'
    },

    {
        key: 'status',
        label: 'Status'
    },

    {
        key: 'categories',
        label: 'Categories'
    },

    {
        key: 'published_at',
        label: 'Published'
    }

];


// ============================================================
// SEARCH
// ============================================================

const search = ref(
    props.filters?.search ?? ''
);

let searchTimer = null;


watch(
    search,
    (value) => {

        clearTimeout(searchTimer);

        searchTimer = setTimeout(() => {

            router.get(
                '/blog',
                {
                    search:
                        value || undefined
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                    only: [
                        'posts',
                        'filters'
                    ]
                }
            );

        }, 300);

    }
);


// ============================================================
// MODALS
// ============================================================

const showModal = ref(false);

const showTaxonomyModal = ref(false);


// ============================================================
// BLOG FORM
// ============================================================

const form = useForm({

    id: null,

    title: '',

    excerpt: '',

    body: '',

    featured_image: '',

    status: 'draft',

    published_at: '',

    meta_title: '',

    meta_description: '',

    category_ids: [],

    tag_ids: []

});

// ============================================================
// CATEGORY FORM
// ============================================================

const categoryForm = useForm({
    name: ''
});


// ============================================================
// TAG FORM
// ============================================================

const tagForm = useForm({
    name: ''
});


// ============================================================
// EDIT VALUES
// ============================================================

const categoryEdits = ref({});

const tagEdits = ref({});


watch(
    () => props.categories,
    (categories) => {

        categoryEdits.value =
            Object.fromEntries(

                categories.map(
                    category => [
                        category.id,
                        category.name
                    ]
                )

            );

    },
    {
        immediate: true
    }
);


watch(
    () => props.tags,
    (tags) => {

        tagEdits.value =
            Object.fromEntries(

                tags.map(
                    tag => [
                        tag.id,
                        tag.name
                    ]
                )

            );

    },
    {
        immediate: true
    }
);


// ============================================================
// CATEGORY MULTI SELECT
// ============================================================

const categoryDropdownOpen = ref(false);

const categorySearch = ref('');

const categoryWrapper = ref(null);


// ============================================================
// TAG MULTI SELECT
// ============================================================

const tagDropdownOpen = ref(false);

const tagSearch = ref('');

const tagWrapper = ref(null);


// ============================================================
// SELECTED CATEGORIES
// ============================================================

const selectedCategories = computed(() => {

    const ids =
        form.category_ids.map(
            id => Number(id)
        );

    return props.categories.filter(
        category =>
            ids.includes(
                Number(category.id)
            )
    );

});


// ============================================================
// SELECTED TAGS
// ============================================================

const selectedTags = computed(() => {

    const ids =
        form.tag_ids.map(
            id => Number(id)
        );

    return props.tags.filter(
        tag =>
            ids.includes(
                Number(tag.id)
            )
    );

});


// ============================================================
// FILTERED CATEGORIES
// ============================================================

const filteredCategories = computed(() => {

    const query =
        categorySearch.value
            .trim()
            .toLowerCase();


    if (!query) {
        return props.categories;
    }


    return props.categories.filter(
        category =>
            String(category.name)
                .toLowerCase()
                .includes(query)
    );

});


// ============================================================
// FILTERED TAGS
// ============================================================

const filteredTags = computed(() => {

    const query =
        tagSearch.value
            .trim()
            .toLowerCase();


    if (!query) {
        return props.tags;
    }


    return props.tags.filter(
        tag =>
            String(tag.name)
                .toLowerCase()
                .includes(query)
    );

});


// ============================================================
// CATEGORY SELECTED
// ============================================================

const isCategorySelected = (id) => {

    return form.category_ids
        .map(Number)
        .includes(Number(id));

};


// ============================================================
// TAG SELECTED
// ============================================================

const isTagSelected = (id) => {

    return form.tag_ids
        .map(Number)
        .includes(Number(id));

};


// ============================================================
// ALL CATEGORIES SELECTED
// ============================================================

const allCategoriesSelected = computed(() => {

    if (
        filteredCategories.value.length === 0
    ) {
        return false;
    }


    return filteredCategories.value.every(
        category =>
            isCategorySelected(category.id)
    );

});


// ============================================================
// ALL TAGS SELECTED
// ============================================================

const allTagsSelected = computed(() => {

    if (
        filteredTags.value.length === 0
    ) {
        return false;
    }


    return filteredTags.value.every(
        tag =>
            isTagSelected(tag.id)
    );

});


// ============================================================
// TOGGLE CATEGORY DROPDOWN
// ============================================================

const toggleCategoryDropdown = async () => {

    categoryDropdownOpen.value =
        !categoryDropdownOpen.value;


    if (
        categoryDropdownOpen.value
    ) {

        tagDropdownOpen.value = false;

        await nextTick();

    }

};


// ============================================================
// TOGGLE TAG DROPDOWN
// ============================================================

const toggleTagDropdown = async () => {

    tagDropdownOpen.value =
        !tagDropdownOpen.value;


    if (
        tagDropdownOpen.value
    ) {

        categoryDropdownOpen.value = false;

        await nextTick();

    }

};


// ============================================================
// TOGGLE CATEGORY
// ============================================================

const toggleCategory = (id) => {

    const numericId = Number(id);

    const current =
        form.category_ids.map(Number);

    const index =
        current.indexOf(numericId);


    if (index === -1) {

        form.category_ids = [
            ...current,
            numericId
        ];

    } else {

        form.category_ids =
            current.filter(
                value =>
                    value !== numericId
            );

    }

};


// ============================================================
// TOGGLE TAG
// ============================================================

const toggleTag = (id) => {

    const numericId = Number(id);

    const current =
        form.tag_ids.map(Number);

    const index =
        current.indexOf(numericId);


    if (index === -1) {

        form.tag_ids = [
            ...current,
            numericId
        ];

    } else {

        form.tag_ids =
            current.filter(
                value =>
                    value !== numericId
            );

    }

};


// ============================================================
// REMOVE CATEGORY
// ============================================================

const removeCategory = (id) => {

    const numericId = Number(id);

    form.category_ids =
        form.category_ids
            .map(Number)
            .filter(
                value =>
                    value !== numericId
            );

};


// ============================================================
// REMOVE TAG
// ============================================================

const removeTag = (id) => {

    const numericId = Number(id);

    form.tag_ids =
        form.tag_ids
            .map(Number)
            .filter(
                value =>
                    value !== numericId
            );

};


// ============================================================
// SELECT / DESELECT ALL CATEGORIES
// ============================================================

const toggleAllCategories = () => {

    const current =
        form.category_ids.map(Number);


    if (allCategoriesSelected.value) {

        const idsToRemove =
            filteredCategories.value.map(
                category =>
                    Number(category.id)
            );


        form.category_ids =
            current.filter(
                id =>
                    !idsToRemove.includes(id)
            );

    } else {

        const ids =
            new Set(current);


        filteredCategories.value.forEach(
            category => {

                ids.add(
                    Number(category.id)
                );

            }
        );


        form.category_ids =
            [...ids];

    }

};


// ============================================================
// SELECT / DESELECT ALL TAGS
// ============================================================

const toggleAllTags = () => {

    const current =
        form.tag_ids.map(Number);


    if (allTagsSelected.value) {

        const idsToRemove =
            filteredTags.value.map(
                tag =>
                    Number(tag.id)
            );


        form.tag_ids =
            current.filter(
                id =>
                    !idsToRemove.includes(id)
            );

    } else {

        const ids =
            new Set(current);


        filteredTags.value.forEach(
            tag => {

                ids.add(
                    Number(tag.id)
                );

            }
        );


        form.tag_ids =
            [...ids];

    }

};


// ============================================================
// CLICK OUTSIDE
// ============================================================

const handleClickOutside = (event) => {

    if (
        categoryWrapper.value &&
        !categoryWrapper.value.contains(
            event.target
        )
    ) {

        categoryDropdownOpen.value = false;

    }


    if (
        tagWrapper.value &&
        !tagWrapper.value.contains(
            event.target
        )
    ) {

        tagDropdownOpen.value = false;

    }

};


onMounted(() => {

    document.addEventListener(
        'click',
        handleClickOutside
    );

});


onBeforeUnmount(() => {

    document.removeEventListener(
        'click',
        handleClickOutside
    );


    clearTimeout(searchTimer);

});


// ============================================================
// RESET FORM
// ============================================================

const resetForm = () => {

    form.reset();

    form.clearErrors();

    form.id = null;

    form.title = '';

    form.excerpt = '';

    form.body = '';

    form.featured_image = '';

    form.status = 'draft';

    form.published_at = '';

    form.meta_title = '';

    form.meta_description = '';

    form.category_ids = [];

    form.tag_ids = [];


    categorySearch.value = '';

    tagSearch.value = '';

    categoryDropdownOpen.value = false;

    tagDropdownOpen.value = false;

};


// ============================================================
// OPEN NEW POST
// ============================================================

const openModal = () => {

    resetForm();

    showModal.value = true;

};


// ============================================================
// CLOSE MODAL
// ============================================================

const closeModal = () => {

    categoryDropdownOpen.value = false;

    tagDropdownOpen.value = false;

    categorySearch.value = '';

    tagSearch.value = '';

    showModal.value = false;

};


// ============================================================
// EDIT POST
// ============================================================

const editPost = (post) => {

    form.id = post.id;


    form.title =
        post.title ?? '';


    form.excerpt =
        post.excerpt ?? '';


    form.body =
        post.body ?? '';


    form.featured_image =
        post.featured_image ?? '';


    form.status =
        post.status ?? 'draft';


    form.published_at =
        post.published_at
            ? post.published_at.slice(0, 16)
            : '';


    form.meta_title =
        post.meta_title ?? '';


    form.meta_description =
        post.meta_description ?? '';


    // Existing categories
    form.category_ids =
        post.categories
            ?.map(
                category =>
                    Number(category.id)
            ) ?? [];


    // Existing tags
    form.tag_ids =
        post.tags
            ?.map(
                tag =>
                    Number(tag.id)
            ) ?? [];


    form.clearErrors();


    categorySearch.value = '';

    tagSearch.value = '';

    categoryDropdownOpen.value = false;

    tagDropdownOpen.value = false;


    showModal.value = true;

};


// ============================================================
// SAVE POST
// ============================================================

const savePost = () => {

    const options = {

        preserveScroll: true,

        onSuccess: () => {

            closeModal();

        }

    };


    if (form.id) {

        form.put(
            `/blog/${form.id}`,
            options
        );

    } else {

        form.post(
            '/blog',
            options
        );

    }

};


// ============================================================
// DELETE POST
// ============================================================

const deletePost = async (id) => {

    if (
        await confirmDialog(
            'Are you sure?'
        )
    ) {

        router.delete(
            `/blog/${id}`,
            {
                preserveScroll: true
            }
        );

    }

};


// ============================================================
// SAVE CATEGORY
// ============================================================

const saveCategory = () => {

    categoryForm.post(
        '/blog/categories',
        {

            preserveScroll: true,

            onSuccess: () => {

                categoryForm.reset();

            }

        }
    );

};


// ============================================================
// UPDATE CATEGORY
// ============================================================

const updateCategory = (id) => {

    router.put(

        `/blog/categories/${id}`,

        {
            name:
                categoryEdits.value[id]
        },

        {
            preserveScroll: true
        }

    );

};


// ============================================================
// DELETE CATEGORY
// ============================================================

const deleteCategory = async (id) => {

    if (
        await confirmDialog(
            'Delete this category? Existing posts will be detached.'
        )
    ) {

        router.delete(

            `/blog/categories/${id}`,

            {
                preserveScroll: true
            }

        );

    }

};


// ============================================================
// SAVE TAG
// ============================================================

const saveTag = () => {

    tagForm.post(

        '/blog/tags',

        {

            preserveScroll: true,

            onSuccess: () => {

                tagForm.reset();

            }

        }

    );

};


// ============================================================
// UPDATE TAG
// ============================================================

const updateTag = (id) => {

    router.put(

        `/blog/tags/${id}`,

        {
            name:
                tagEdits.value[id]
        },

        {
            preserveScroll: true
        }

    );

};


// ============================================================
// DELETE TAG
// ============================================================

const deleteTag = async (id) => {

    if (
        await confirmDialog(
            'Delete this tag? Existing posts will be detached.'
        )
    ) {

        router.delete(

            `/blog/tags/${id}`,

            {
                preserveScroll: true
            }

        );

    }

};


// ============================================================
// STATUS
// ============================================================

const statusClass = (status) => {

    return {

        published:
            'ui-badge--success',

        scheduled:
            'ui-badge--warning'

    }[status] ??
        'ui-badge--muted';

};


// ============================================================
// DATE
// ============================================================

const formatDate = (value) => {

    return value
        ? new Date(value).toLocaleDateString()
        : '-';

};

</script>


<style scoped>

.editor-field {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.rich-editor {
    border: 1px solid #d1d5db;
    border-radius: 10px;
    background: #ffffff;
    overflow: hidden;
}

.rich-editor-toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 8px 10px;
    border-bottom: 1px solid #e5e7eb;
    background: #f8fafc;
}

.rich-editor-btn {
    border: 1px solid #dfe3ea;
    background: #ffffff;
    color: #1f2937;
    border-radius: 7px;
    padding: 6px 10px;
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.15s ease;
}

.rich-editor-btn:hover {
    border-color: #c7d2fe;
    background: #eef2ff;
}

.rich-editor-content {
    min-height: 220px;
    max-height: 420px;
    overflow-y: auto;
    padding: 14px 16px;
    outline: none;
    line-height: 1.8;
    color: #111827;
    font-size: 0.95rem;
}

.rich-editor-content:empty::before {
    content: attr(data-placeholder);
    color: #9ca3af;
}

.rich-editor-content h2 {
    margin: 0.6em 0 0.4em;
    font-size: 1.6rem;
    line-height: 1.2;
}

.rich-editor-content blockquote {
    margin: 1em 0;
    padding-left: 1rem;
    border-left: 4px solid #6366f1;
    color: #4b5563;
}

.rich-editor-content ul,
.rich-editor-content ol {
    padding-left: 1.2rem;
    margin: 0.8rem 0;
}

.rich-editor-content a {
    color: #2563eb;
    text-decoration: underline;
}

/* ============================================================
   FORM GRID
============================================================ */

.blog-form-grid {

    display: grid;

    grid-template-columns:
        minmax(0, 1fr)
        minmax(0, 1fr);

    gap: 14px;

}


.blog-form-hint {

    color: var(--text-soft);

    font-size: 0.85rem;

    margin: -4px 0 12px;

}


/* ============================================================
   MULTI SELECT FIELD
============================================================ */

.multi-select-field {

    position: relative;

    width: 100%;

    min-width: 0;

}


/* ============================================================
   CONTROL
============================================================ */

.multi-select-control {

    width: 100%;

    min-height: 44px;

    display: flex;

    align-items: center;

    justify-content: space-between;

    gap: 8px;

    padding: 5px 10px;

    border: 1px solid #d1d5db;

    border-radius: 8px;

    background: #ffffff;

    cursor: pointer;

    transition:
        border-color .15s ease,
        box-shadow .15s ease;

}


.multi-select-control:hover {

    border-color: #9ca3af;

}


.multi-select-control.is-open {

    border-color: #6366f1;

    box-shadow:
        0 0 0 3px
        rgba(99, 102, 241, .10);

}


/* ============================================================
   VALUES
============================================================ */

.multi-select-values {

    flex: 1;

    min-width: 0;

    display: flex;

    flex-wrap: wrap;

    align-items: center;

    gap: 5px;

}


/* ============================================================
   PLACEHOLDER
============================================================ */

.multi-select-placeholder {

    color: #9ca3af;

    font-size: 14px;

    padding: 4px 0;

}


/* ============================================================
   CHIP
============================================================ */

.multi-select-chip {

    display: inline-flex;

    align-items: center;

    gap: 5px;

    max-width: 100%;

    padding: 4px 8px;

    border-radius: 5px;

    background: #eef2ff;

    border: 1px solid #c7d2fe;

    color: #3730a3;

    font-size: 13px;

    line-height: 1.2;

}


/* ============================================================
   CHIP REMOVE
============================================================ */

.multi-select-chip-remove {

    width: 18px;

    height: 18px;

    display: inline-flex;

    align-items: center;

    justify-content: center;

    border: 0;

    padding: 0;

    background: transparent;

    color: #3730a3;

    font-size: 16px;

    line-height: 1;

    cursor: pointer;

}


.multi-select-chip-remove:hover {

    color: #dc2626;

}


/* ============================================================
   ARROW
============================================================ */

.multi-select-arrow {

    flex-shrink: 0;

    color: #6b7280;

    font-size: 9px;

}


/* ============================================================
   DROPDOWN
============================================================ */

.multi-select-dropdown {

    position: absolute;

    z-index: 999999;

    top: calc(100% + 5px);

    left: 0;

    width: 100%;

    min-width: 260px;

    background: #ffffff;

    border: 1px solid #d1d5db;

    border-radius: 8px;

    box-shadow:
        0 12px 30px
        rgba(0, 0, 0, .14);

    overflow: hidden;

}


/* ============================================================
   SEARCH
============================================================ */

.multi-select-search-box {

    padding: 8px;

    border-bottom: 1px solid #e5e7eb;

}


.multi-select-search {

    width: 100%;

    height: 38px;

    padding: 0 10px;

    border: 1px solid #d1d5db;

    border-radius: 6px;

    background: #ffffff;

    color: #111827;

    outline: none;

    font-size: 14px;

}


.multi-select-search:focus {

    border-color: #6366f1;

    box-shadow:
        0 0 0 2px
        rgba(99, 102, 241, .10);

}


/* ============================================================
   SELECT ALL
============================================================ */

.multi-select-select-all {

    display: flex;

    align-items: center;

    gap: 9px;

    padding: 9px 12px;

    border-bottom: 1px solid #e5e7eb;

    font-size: 13px;

    font-weight: 600;

    cursor: pointer;

}


.multi-select-select-all:hover {

    background: #f9fafb;

}


/* ============================================================
   OPTIONS
============================================================ */

.multi-select-options {

    max-height: 220px;

    overflow-y: auto;

}


.multi-select-option {

    display: flex;

    align-items: center;

    gap: 9px;

    width: 100%;

    padding: 10px 12px;

    cursor: pointer;

    font-size: 14px;

    transition:
        background .1s ease;

}


.multi-select-option:hover {

    background: #f3f4f6;

}


.multi-select-option.selected {

    background: #eef2ff;

    color: #3730a3;

}


/* ============================================================
   CHECKBOX
============================================================ */

.multi-select-option input,
.multi-select-select-all input {

    width: 16px;

    height: 16px;

    flex-shrink: 0;

    cursor: pointer;

}


/* ============================================================
   EMPTY
============================================================ */

.multi-select-empty {

    padding: 16px;

    text-align: center;

    color: #9ca3af;

    font-size: 14px;

}


/* ============================================================
   TAXONOMY
============================================================ */

.taxonomy-grid {

    display: grid;

    grid-template-columns:
        minmax(0, 1fr)
        minmax(0, 1fr);

    gap: 28px;

}


.taxonomy-grid h3 {

    margin: 0 0 12px;

    font-size: 1rem;

}


.taxonomy-add,
.taxonomy-row {

    display: flex;

    align-items: center;

    gap: 8px;

    margin-bottom: 10px;

}


.taxonomy-add .ui-input,
.taxonomy-row .ui-input {

    min-width: 0;

    flex: 1;

}


/* ============================================================
   MOBILE
============================================================ */

@media (max-width: 640px) {

    .blog-form-grid {

        grid-template-columns: 1fr;

    }


    .taxonomy-grid {

        grid-template-columns: 1fr;

    }


    .multi-select-dropdown {

        min-width: 100%;

    }

}

.blog-body-textarea {
    display: block;
    width: 100%;
    min-height: 320px;
    padding: 14px 16px;
    border: 1px solid #d1d5db;
    border-radius: 10px;
    background: #ffffff;
    color: #111827;
    font: inherit;
    line-height: 1.7;
    resize: vertical;
}

</style>
