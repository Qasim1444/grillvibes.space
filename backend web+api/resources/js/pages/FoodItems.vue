
<template>
  <div class="page">
    <PageHeader title="Food Items" subtitle="Manage menu items and pricing.">
      <template #actions>
        <button
          v-if="can('food-items.create')"
          class="ui-btn ui-btn--primary"
          @click="openModal"
        >
          + Add Food Item
        </button>
      </template>
    </PageHeader>

    <DataTable
      :columns="columns"
      :rows="items"
      index
      searchable
      v-model:query="search"
      search-placeholder="Search items…"
      empty-text="No food items found."
    >
      <template #cell:image="{ value }">
        <img
          v-if="value"
          :src="value"
          alt=""
          class="food-item__thumb"
        />

        <span
          v-else
          class="food-item__thumb food-item__thumb--empty"
        >
          —
        </span>
      </template>

      <template #cell:status="{ value }">
        <span
          class="ui-badge"
          :class="value ? 'ui-badge--success' : 'ui-badge--muted'"
        >
          {{ value ? "Active" : "Inactive" }}
        </span>
      </template>

      <template #actions="{ row }">
        <Link
          v-if="can('inventory.recipes.view')"
          :href="`/inventory/recipes?food_item=${row.id}&search=${encodeURIComponent(row.name)}`"
          class="ui-btn ui-btn--secondary ui-btn--sm"
          title="Build this dish's recipe and see what it costs to make"
        >
          Recipe
        </Link>

        <button
          v-if="can('food-items.update')"
          class="ui-btn ui-btn--ghost ui-btn--sm"
          @click="editItem(row)"
        >
          Edit
        </button>

        <button
          v-if="can('food-items.delete')"
          class="ui-btn ui-btn--danger ui-btn--sm"
          @click="deleteItem(row.id)"
        >
          Delete
        </button>
      </template>
    </DataTable>

    <Pagination
      :paginator="props.items"
      :only="['items']"
    />

    <Modal
      v-model="showModal"
      :title="form.id ? 'Edit Food Item' : 'Add Food Item'"
      width="560px"
    >
      <FormField
        v-model="form.name"
        label="Name"
        placeholder="Name"
        :error="form.errors.name"
      />

      <FormField
        v-model="form.foodcategory_id"
        label="Category"
        type="select"
        :error="form.errors.foodcategory_id"
      >
        <option value="" disabled>
          Select a category
        </option>

        <option
          v-for="cat in categories"
          :key="cat.id"
          :value="cat.id"
        >
          {{ cat.name }}
        </option>
      </FormField>

      <FormField
        v-model="form.code"
        label="Code"
        placeholder="Code"
        :error="form.errors.code"
      />

      <FormField
        v-model="form.description"
        label="Description"
        type="textarea"
        placeholder="Description"
        :error="form.errors.description"
      />

      <FormField
        v-model="form.price"
        label="Price"
        type="number"
        step="0.01"
        placeholder="Price"
        :error="form.errors.price"
      />

      <div class="ui-field">
        <label class="ui-label">Image</label>

        <img
          v-if="imagePreview"
          :src="imagePreview"
          alt=""
          class="food-item__preview"
        />

        <input
          type="file"
          class="ui-input"
          accept="image/*"
          @change="handleFileChange"
        />

        <span
          v-if="form.errors.image"
          class="ui-field__error"
        >
          {{ form.errors.image }}
        </span>
      </div>

      <FormField
        v-model="form.status"
        label="Status"
        type="select"
        :error="form.errors.status"
      >
        <option :value="true">
          Active
        </option>

        <option :value="false">
          Inactive
        </option>
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
          @click="saveItem"
        >
          {{ form.processing ? "Saving..." : "Save" }}
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { confirmDialog } from "../composables/useNotifications";
import { computed, ref, watch, onBeforeUnmount } from "vue";
import { Link, router, useForm } from "@inertiajs/vue3";

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

const props = defineProps({
  items: {
    type: Object,
    default: () => ({
      data: [],
    }),
  },

  categories: {
    type: Array,
    default: () => [],
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
    key: "image",
    label: "Image",
    width: "80px",
  },
  {
    key: "name",
    label: "Name",
  },
  {
    key: "foodcategory_name",
    label: "Category",
  },
  {
    key: "code",
    label: "Code",
  },
  {
    key: "price",
    label: "Price",
  },
  {
    key: "status",
    label: "Status",
  },
];

const items = computed(() => {
  return props.items?.data ?? [];
});

const categories = computed(() => {
  return props.categories ?? [];
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
      "/food-items",
      {
        search: value || undefined,
      },
      {
        preserveState: true,
        preserveScroll: true,
        replace: true,
        only: ["items", "filters"],
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
| Image Preview
|--------------------------------------------------------------------------
*/

const imagePreview = ref(null);
let previewObjectUrl = null;

/*
|--------------------------------------------------------------------------
| Form
|--------------------------------------------------------------------------
*/

const form = useForm({
  id: null,
  name: "",
  foodcategory_id: "",
  code: "",
  description: "",
  price: "",
  image: null,
  status: true,
});

/*
|--------------------------------------------------------------------------
| Reset Form
|--------------------------------------------------------------------------
*/

const resetForm = () => {
  form.id = null;
  form.name = "";
  form.foodcategory_id = categories.value.length
    ? categories.value[0].id
    : "";
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

/*
|--------------------------------------------------------------------------
| Open Add Modal
|--------------------------------------------------------------------------
*/

const openModal = () => {
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
  resetForm();
};

/*
|--------------------------------------------------------------------------
| Edit Item
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Image Change
|--------------------------------------------------------------------------
*/

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
  } else {
    imagePreview.value = null;
  }
};

/*
|--------------------------------------------------------------------------
| Save
|--------------------------------------------------------------------------
*/

const saveItem = () => {
  const options = {
    preserveScroll: true,
    forceFormData: true,

    onSuccess: () => {
      showModal.value = false;
      resetForm();
    },
  };

  form
    .transform((data) => {
      const payload = { ...data };

      if (form.id && !payload.image) {
        delete payload.image;
      }

      return form.id
        ? {
            ...payload,
            _method: "put",
          }
        : payload;
    })
    .post(
      form.id
        ? `/food-items/${form.id}`
        : "/food-items",
      options
    );
};

/*
|--------------------------------------------------------------------------
| Delete
|--------------------------------------------------------------------------
*/

const deleteItem = async (id) => {
  if (!(await confirmDialog("Are you sure you want to delete this food item?"))) {
    return;
  }

  router.delete(`/food-items/${id}`, {
    preserveScroll: true,
  });
};

/*
|--------------------------------------------------------------------------
| Cleanup
|--------------------------------------------------------------------------
*/

onBeforeUnmount(() => {
  clearTimeout(searchTimer);

  if (previewObjectUrl) {
    URL.revokeObjectURL(previewObjectUrl);
  }
});
</script>

<style scoped>
.food-item__thumb {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
}

.food-item__thumb--empty {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--text-soft);
  background: var(--surface-muted, #f3f4f6);
}

.food-item__preview {
  display: block;
  width: 96px;
  height: 96px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  margin-bottom: 8px;
}
</style>
