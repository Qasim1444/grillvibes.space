
<template>
  <div class="page">
    <PageHeader
      title="Food Categories"
      subtitle="Organize menu items into categories."
    >
      <template #actions>
        <button
          v-if="can('food-categories.create')"
          class="ui-btn ui-btn--primary"
          @click="openModal"
        >
          + Add Category
        </button>
      </template>
    </PageHeader>

    <DataTable
      :columns="columns"
      :rows="rows"
      index
      searchable
      v-model:query="search"
      search-placeholder="Search categories…"
      empty-text="No categories found."
    >
      <template #cell:status="{ value }">
        <span
          class="ui-badge"
          :class="value ? 'ui-badge--success' : 'ui-badge--muted'"
        >
          {{ value ? "Active" : "Inactive" }}
        </span>
      </template>

      <template #actions="{ row }">
        <button
          v-if="can('food-categories.update')"
          class="ui-btn ui-btn--ghost ui-btn--sm"
          @click="editCategory(row)"
        >
          Edit
        </button>

        <button
          v-if="can('food-categories.delete')"
          class="ui-btn ui-btn--danger ui-btn--sm"
          @click="deleteCategory(row.id)"
        >
          Delete
        </button>
      </template>
    </DataTable>

    <Pagination
      :paginator="props.categories"
      :only="['categories']"
    />

    <Modal
      v-model="showModal"
      :title="form.id ? 'Edit Food Category' : 'Add Food Category'"
    >
      <FormField
        v-model="form.name"
        label="Name"
        placeholder="Name"
        :error="form.errors.name"
      />

      <FormField
        v-model="form.status"
        label="Status"
        type="select"
        :error="form.errors.status"
      >
        <option :value="true">Active</option>
        <option :value="false">Inactive</option>
      </FormField>

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
          @click="saveCategory"
        >
          {{ form.processing ? "Saving..." : "Save" }}
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { confirmDialog } from "../composables/useNotifications";
import { computed, ref, watch } from "vue";
import { router, useForm } from "@inertiajs/vue3";

import AdminLayout from "../layouts/AdminLayout.vue";
import PageHeader from "../components/ui/PageHeader.vue";
import DataTable from "../components/ui/DataTable.vue";
import Pagination from "../components/ui/Pagination.vue";
import Modal from "../components/ui/Modal.vue";
import FormField from "../components/ui/FormField.vue";
import { usePermissions } from "../composables/usePermissions";

defineOptions({
  layout: AdminLayout,
});

const { can } = usePermissions();

/*
|--------------------------------------------------------------------------
| Props
|--------------------------------------------------------------------------
*/

const props = defineProps({
  categories: {
    type: Object,
    default: () => ({
      data: [],
    }),
  },

  filters: {
    type: Object,
    default: () => ({
      search: "",
    }),
  },
});

/*
|--------------------------------------------------------------------------
| Table
|--------------------------------------------------------------------------
*/

const columns = [
  {
    key: "name",
    label: "Name",
  },
  {
    key: "status",
    label: "Status",
  },
];

const rows = computed(() => {
  return props.categories?.data ?? [];
});

/*
|--------------------------------------------------------------------------
| Search
|--------------------------------------------------------------------------
*/

const search = ref(props.filters?.search ?? "");

let searchTimer = null;

watch(search, (value) => {
  clearTimeout(searchTimer);

  searchTimer = setTimeout(() => {
    router.get(
      "/food-categories",
      {
        search: value || undefined,
      },
      {
        preserveState: true,
        preserveScroll: true,
        replace: true,
        only: ["categories", "filters"],
      }
    );
  }, 300);
});

/*
|--------------------------------------------------------------------------
| Modal
|--------------------------------------------------------------------------
*/

const showModal = ref(false);

/*
|--------------------------------------------------------------------------
| Form
|--------------------------------------------------------------------------
*/

const form = useForm({
  id: null,
  name: "",
  status: true,
});

/*
|--------------------------------------------------------------------------
| Reset Form
|--------------------------------------------------------------------------
|
| IMPORTANT:
| This completely resets the form to ADD mode.
| It prevents previous Edit values from appearing when
| the Add Category button is clicked again.
|
|--------------------------------------------------------------------------
*/

const resetForm = () => {
  form.id = null;
  form.name = "";
  form.status = true;

  form.clearErrors();

  // Reset processing/progress-related state
  form.processing = false;
  form.progress = null;
};

/*
|--------------------------------------------------------------------------
| Open Add Modal
|--------------------------------------------------------------------------
*/

const openModal = () => {
  // Always start with a fresh form
  resetForm();

  showModal.value = true;
};

/*
|--------------------------------------------------------------------------
| Close Modal
|--------------------------------------------------------------------------
*/

const closeModal = () => {
  showModal.value = false;

  // Clear old values so they don't remain
  resetForm();
};

/*
|--------------------------------------------------------------------------
| Edit Category
|--------------------------------------------------------------------------
*/

const editCategory = (category) => {
  // First clear everything
  resetForm();

  // Then load selected category
  form.id = category.id;
  form.name = category.name ?? "";
  form.status = Boolean(Number(category.status));

  form.clearErrors();

  showModal.value = true;
};

/*
|--------------------------------------------------------------------------
| Save Category
|--------------------------------------------------------------------------
*/

const saveCategory = () => {
  const options = {
    preserveScroll: true,

    onSuccess: () => {
      showModal.value = false;

      // Completely clear form after save
      resetForm();
    },
  };

  if (form.id) {
    form.put(`/food-categories/${form.id}`, options);
  } else {
    form.post("/food-categories", options);
  }
};

/*
|--------------------------------------------------------------------------
| Delete Category
|--------------------------------------------------------------------------
*/

const deleteCategory = async (id) => {
  if (!(await confirmDialog("Are you sure you want to delete this category?"))) {
    return;
  }

  router.delete(`/food-categories/${id}`, {
    preserveScroll: true,
  });
};
</script>
