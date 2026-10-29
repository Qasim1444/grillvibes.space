<template>
  <div class="page">
    <PageHeader title="Branches" subtitle="Manage your restaurant locations and attendance settings.">
      <template #actions>
        <button
          v-if="can('branches.create')"
          class="ui-btn ui-btn--primary"
          @click="openModal"
        >
          + Add Branch
        </button>
      </template>
    </PageHeader>

    <DataTable
      :columns="columns"
      :rows="rows"
      index
      searchable
      v-model:query="search"
      search-placeholder="Search branches..."
      empty-text="No branches found."
    >
      <template #cell:status="{ value }">
        <span class="ui-badge" :class="value ? 'ui-badge--success' : 'ui-badge--muted'">
          {{ value ? "Active" : "Inactive" }}
        </span>
      </template>

      <template #actions="{ row }">
        <button
          v-if="can('branches.update')"
          class="ui-btn ui-btn--ghost ui-btn--sm"
          @click="editBranch(row)"
        >
          Edit
        </button>
        <button
          v-if="can('branches.delete')"
          class="ui-btn ui-btn--danger ui-btn--sm"
          @click="deleteBranch(row.id)"
        >
          Delete
        </button>
      </template>
    </DataTable>

    <Pagination :paginator="props.branches" :only="['branches']" />

    <Modal
      v-model="showModal"
      :title="form.id ? 'Edit Branch' : 'Add Branch'"
      width="640px"
    >
      <FormField v-model="form.name" label="Name" placeholder="Branch name" :error="form.errors.name" />
      <FormField v-model="form.address" label="Address" placeholder="Street address" :error="form.errors.address" />
      <FormField v-model="form.phone" label="Phone" type="tel" placeholder="Contact number" :error="form.errors.phone" />
      <FormField v-model="form.manager_name" label="Manager" placeholder="Manager name" :error="form.errors.manager_name" />

      <FormField v-model="form.status" label="Status" type="select" :error="form.errors.status">
        <option :value="true">Active</option>
        <option :value="false">Inactive</option>
      </FormField>

      <FormField
        v-model="form.latitude"
        label="Attendance latitude"
        type="number"
        step="any"
        placeholder="Optional"
        :error="form.errors.latitude"
      />
      <FormField
        v-model="form.longitude"
        label="Attendance longitude"
        type="number"
        step="any"
        placeholder="Optional"
        :error="form.errors.longitude"
      />
      <FormField
        v-model="form.attendance_radius_meters"
        label="Attendance radius (meters)"
        type="number"
        :error="form.errors.attendance_radius_meters"
      />
      <FormField
        v-model="form.attendance_start_time"
        label="Attendance start time"
        type="time"
        :error="form.errors.attendance_start_time"
      />

      <template #footer>
        <button type="button" class="ui-btn ui-btn--ghost" @click="closeModal">
          Cancel
        </button>
        <button
          type="button"
          class="ui-btn ui-btn--primary"
          :disabled="form.processing"
          @click="saveBranch"
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

defineOptions({ layout: AdminLayout });

const { can } = usePermissions();

const props = defineProps({
  branches: {
    type: Object,
    default: () => ({ data: [] }),
  },
  filters: {
    type: Object,
    default: () => ({ search: "" }),
  },
});

const columns = [
  { key: "name", label: "Name" },
  { key: "address", label: "Address" },
  { key: "phone", label: "Phone" },
  { key: "manager_name", label: "Manager" },
  { key: "status", label: "Status" },
];

const rows = computed(() => props.branches?.data ?? []);
const search = ref(props.filters?.search ?? "");

let searchTimer = null;
watch(search, (value) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    router.get(
      "/branches",
      { search: value || undefined },
      {
        preserveState: true,
        preserveScroll: true,
        replace: true,
        only: ["branches", "filters"],
      }
    );
  }, 300);
});

const showModal = ref(false);
const form = useForm({
  id: null,
  name: "",
  address: "",
  phone: "",
  manager_name: "",
  status: true,
  latitude: "",
  longitude: "",
  attendance_radius_meters: 100,
  attendance_start_time: "",
});

const resetForm = () => {
  form.id = null;
  form.name = "";
  form.address = "";
  form.phone = "";
  form.manager_name = "";
  form.status = true;
  form.latitude = "";
  form.longitude = "";
  form.attendance_radius_meters = 100;
  form.attendance_start_time = "";
  form.clearErrors();
};

const openModal = () => {
  resetForm();
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  resetForm();
};

const editBranch = (branch) => {
  resetForm();
  form.id = branch.id;
  form.name = branch.name ?? "";
  form.address = branch.address ?? "";
  form.phone = branch.phone ?? "";
  form.manager_name = branch.manager_name ?? "";
  form.status = Boolean(Number(branch.status));
  form.latitude = branch.latitude ?? "";
  form.longitude = branch.longitude ?? "";
  form.attendance_radius_meters = branch.attendance_radius_meters ?? 100;
  form.attendance_start_time = branch.attendance_start_time?.slice(0, 5) ?? "";
  showModal.value = true;
};

const saveBranch = () => {
  const options = {
    preserveScroll: true,
    onSuccess: () => {
      showModal.value = false;
      resetForm();
    },
  };

  if (form.id) {
    form.put(`/branches/${form.id}`, options);
  } else {
    form.post("/branches", options);
  }
};

const deleteBranch = async (id) => {
  if (!(await confirmDialog("Delete this branch? Branches with associated records cannot be deleted."))) {
    return;
  }

  router.delete(`/branches/${id}`, { preserveScroll: true });
};
</script>
