
<template>
  <div class="page">
    <PageHeader title="Places" subtitle="Manage service places / tables.">
      <template #actions>
        <button
          v-if="can('places.create')"
          class="ui-btn ui-btn--primary"
          @click="openModal"
        >
          + Add Place
        </button>
      </template>
    </PageHeader>

    <DataTable
      :columns="columns"
      :rows="places"
      index
      searchable
      v-model:query="search"
      search-placeholder="Search places…"
      empty-text="No places found."
    >
      <template #cell:status="{ value }">
        <span
          class="ui-badge"
          :class="value ? 'ui-badge--success' : 'ui-badge--muted'"
        >
          {{ value ? "Active" : "Inactive" }}
        </span>
      </template>

      <template #cell:branch_name="{ value }">
        {{ value || "—" }}
      </template>

      <template #actions="{ row }">
        <button
          v-if="can('places.update')"
          class="ui-btn ui-btn--ghost ui-btn--sm"
          @click="editPlace(row)"
        >
          Edit
        </button>

        <button
          v-if="can('places.delete')"
          class="ui-btn ui-btn--danger ui-btn--sm"
          @click="deletePlace(row.id)"
        >
          Delete
        </button>
      </template>
    </DataTable>

    <Pagination
      :paginator="props.places"
      :only="['places']"
    />

    <Modal
      v-model="showModal"
      :title="form.id ? 'Edit Place' : 'Add Place'"
    >
      <FormField
        v-model="form.name"
        label="Name"
        placeholder="Name"
        :error="form.errors.name"
      />

      <FormField
        v-model="form.branch_id"
        label="Branch"
        type="select"
        :error="form.errors.branch_id"
      >
        <option value="">— select branch —</option>

        <option
          v-for="branch in props.branches"
          :key="branch.id"
          :value="branch.id"
        >
          {{ branch.name }}
        </option>
      </FormField>

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
          @click="savePlace"
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

const props = defineProps({
  places: {
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

  branches: {
    type: Array,
    default: () => [],
  },
});

const columns = [
  {
    key: "name",
    label: "Name",
  },
  {
    key: "branch_name",
    label: "Branch",
  },
  {
    key: "status",
    label: "Status",
  },
];

const places = computed(() => {
  return props.places?.data ?? [];
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
      "/places",
      {
        search: value || undefined,
      },
      {
        preserveState: true,
        preserveScroll: true,
        replace: true,
        only: ["places", "filters"],
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
  branch_id: "",
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
  form.branch_id = "";
  form.status = true;

  form.clearErrors();
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
| Edit Place
|--------------------------------------------------------------------------
*/

const editPlace = (place) => {
  resetForm();

  form.id = place.id;
  form.name = place.name ?? "";
  form.branch_id = place.branch_id ?? "";
  form.status = Boolean(Number(place.status));

  form.clearErrors();

  showModal.value = true;
};

/*
|--------------------------------------------------------------------------
| Save Place
|--------------------------------------------------------------------------
*/

const savePlace = () => {
  const options = {
    preserveScroll: true,

    onSuccess: () => {
      showModal.value = false;
      resetForm();
    },
  };

  if (form.id) {
    form.put(`/places/${form.id}`, options);
  } else {
    form.post("/places", options);
  }
};

/*
|--------------------------------------------------------------------------
| Delete Place
|--------------------------------------------------------------------------
*/

const deletePlace = async (id) => {
  if (!(await confirmDialog("Are you sure?"))) {
    return;
  }

  router.delete(`/places/${id}`, {
    preserveScroll: true,
  });
};
</script>

