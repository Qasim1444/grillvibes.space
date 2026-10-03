<template>
  <div class="page">
    <PageHeader title="Designations" subtitle="Job titles employees are assigned to.">
      <template #actions>
        <button v-if="can('hr.designations.create')" class="ui-btn ui-btn--primary" @click="openModal">
          + Add Designation
        </button>
      </template>
    </PageHeader>

    <DataTable
      :columns="columns"
      :rows="rows"
      index
      searchable
      v-model:query="search"
      search-placeholder="Search designations…"
      empty-text="No designations found."
    >
      <template #cell:employees_count="{ value }">
        <span class="ui-badge" :class="value > 0 ? 'ui-badge--success' : 'ui-badge--muted'">
          {{ value }}
        </span>
      </template>
      <template #actions="{ row }">
        <button v-if="can('hr.designations.update')" class="ui-btn ui-btn--ghost ui-btn--sm" @click="editRow(row)">
          Edit
        </button>
        <button v-if="can('hr.designations.delete')" class="ui-btn ui-btn--danger ui-btn--sm" @click="deleteRow(row.id)">
          Delete
        </button>
      </template>
    </DataTable>

    <Pagination :paginator="props.designations" :only="['designations']" />

    <Modal v-model="showModal" :title="form.id ? 'Edit Designation' : 'Add Designation'">
      <FormField v-model="form.name" label="Name" placeholder="e.g. Cashier" :error="form.errors.name" />
      <FormField
        v-model="form.description"
        label="Description"
        type="textarea"
        placeholder="What this role does"
        :error="form.errors.description"
      />
      <template #footer>
        <button class="ui-btn ui-btn--ghost" @click="showModal = false">Cancel</button>
        <button class="ui-btn ui-btn--primary" :disabled="form.processing" @click="save">Save</button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { confirmDialog } from "../../composables/useNotifications";
import { computed, ref, watch } from "vue";
import { router, useForm } from "@inertiajs/vue3";
import AdminLayout from "../../layouts/AdminLayout.vue";
import PageHeader from "../../components/ui/PageHeader.vue";
import DataTable from "../../components/ui/DataTable.vue";
import Pagination from "../../components/ui/Pagination.vue";
import Modal from "../../components/ui/Modal.vue";
import FormField from "../../components/ui/FormField.vue";
import { usePermissions } from "../../composables/usePermissions";

defineOptions({ layout: AdminLayout });

const { can } = usePermissions();

const props = defineProps({
  designations: { type: Object, default: () => ({ data: [] }) },
  filters: { type: Object, default: () => ({ search: "" }) },
});

const columns = [
  { key: "name", label: "Name" },
  { key: "description", label: "Description" },
  { key: "employees_count", label: "Employees", width: "120px" },
];

const rows = computed(() => props.designations?.data ?? []);

const search = ref(props.filters?.search ?? "");
let searchTimer = null;
watch(search, (value) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    router.get(
      "/hr/designations",
      { search: value || undefined },
      { preserveState: true, preserveScroll: true, replace: true, only: ["designations", "filters"] }
    );
  }, 300);
});

const showModal = ref(false);
const form = useForm({ id: null, name: "", description: "" });

const openModal = () => {
  form.reset();
  form.clearErrors();
  showModal.value = true;
};

const editRow = (d) => {
  form.id = d.id;
  form.name = d.name;
  form.description = d.description ?? "";
  form.clearErrors();
  showModal.value = true;
};

const save = () => {
  const opts = { preserveScroll: true, onSuccess: () => (showModal.value = false) };
  if (form.id) form.put(`/hr/designations/${form.id}`, opts);
  else form.post("/hr/designations", opts);
};

const deleteRow = async (id) => {
  if (!(await confirmDialog("Delete this designation?"))) return;
  router.delete(`/hr/designations/${id}`, { preserveScroll: true });
};
</script>
