<template>
  <div class="page">
    <PageHeader title="Roles & Permissions" subtitle="Control which menus and actions each role can reach.">
      <template #actions>
        <button v-if="can('roles.create')" class="ui-btn ui-btn--primary" @click="openModal">+ Add Role</button>
      </template>
    </PageHeader>

    <DataTable
      :columns="columns"
      :rows="roles"
      index
      searchable
      v-model:query="search"
      search-placeholder="Search roles…"
      empty-text="No roles found."
    >
      <template #cell:permissions_count="{ row }">
        <span class="ui-badge" :class="row.is_locked ? 'ui-badge--success' : 'ui-badge--muted'">
          {{ row.is_locked ? "All permissions" : `${row.permissions_count} permissions` }}
        </span>
      </template>
      <template #actions="{ row }">
        <button
          v-if="can('roles.update')"
          class="ui-btn ui-btn--ghost ui-btn--sm"
          :disabled="row.is_locked"
          :title="row.is_locked ? 'The Super Admin role is locked.' : ''"
          @click="editRole(row)"
        >
          Edit
        </button>
        <button
          v-if="can('roles.delete')"
          class="ui-btn ui-btn--danger ui-btn--sm"
          :disabled="row.is_locked"
          @click="deleteRole(row)"
        >
          Delete
        </button>
      </template>
    </DataTable>

    <Pagination :paginator="props.roles" :only="['roles']" />

    <Modal v-model="showModal" :title="form.id ? 'Edit Role' : 'Add Role'" width="720px">
      <FormField v-model="form.name" label="Name" placeholder="e.g. Shift Supervisor" :error="form.errors.name" />
      <FormField
        v-model="form.description"
        label="Description"
        type="textarea"
        placeholder="What this role is for"
        :error="form.errors.description"
      />

      <div class="ui-field">
        <div class="roles__matrix-head">
          <label class="ui-label">Permissions</label>
          <span class="roles__count">{{ form.permission_ids.length }} of {{ props.permissions.length }} selected</span>
        </div>
        <p v-if="form.errors.permission_ids" class="ui-field__error">{{ form.errors.permission_ids }}</p>

        <div v-for="(items, group) in grouped" :key="group" class="roles__group">
          <label class="roles__group-head">
            <input
              type="checkbox"
              :checked="isGroupFull(items)"
              :indeterminate.prop="isGroupPartial(items)"
              @change="toggleGroup(items, $event.target.checked)"
            />
            <span>{{ group }}</span>
          </label>
          <div class="roles__perms">
            <label v-for="p in items" :key="p.id" class="roles__perm">
              <input type="checkbox" :value="p.id" v-model="form.permission_ids" />
              <span>{{ p.name }}</span>
              <code>{{ p.key }}</code>
            </label>
          </div>
        </div>
      </div>

      <template #footer>
        <button class="ui-btn ui-btn--ghost" @click="showModal = false">Cancel</button>
        <button class="ui-btn ui-btn--primary" :disabled="form.processing" @click="saveRole">Save</button>
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

const props = defineProps({
  // Laravel paginator: { data, links, from, to, total, current_page, ... }.
  roles: { type: Object, default: () => ({ data: [] }) },
  permissions: { type: Array, default: () => [] },
  filters: { type: Object, default: () => ({ search: "" }) },
});

const { can } = usePermissions();

const columns = [
  { key: "name", label: "Name" },
  { key: "slug", label: "Slug" },
  { key: "description", label: "Description" },
  { key: "users_count", label: "Users", width: "90px" },
  { key: "permissions_count", label: "Access" },
];

const roles = computed(() => props.roles?.data ?? []);

// Section the flat catalogue by its `group` column for the matrix layout.
const grouped = computed(() =>
  props.permissions.reduce((acc, p) => {
    (acc[p.group] ??= []).push(p);
    return acc;
  }, {})
);

const search = ref(props.filters?.search ?? "");
let searchTimer = null;
watch(search, (value) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    router.get(
      "/roles",
      { search: value || undefined },
      { preserveState: true, preserveScroll: true, replace: true, only: ["roles", "filters"] }
    );
  }, 300);
});

const showModal = ref(false);
const form = useForm({ id: null, name: "", description: "", permission_ids: [] });

const isGroupFull = (items) => items.every((p) => form.permission_ids.includes(p.id));
const isGroupPartial = (items) => !isGroupFull(items) && items.some((p) => form.permission_ids.includes(p.id));

const toggleGroup = (items, checked) => {
  const ids = items.map((p) => p.id);
  form.permission_ids = checked
    ? [...new Set([...form.permission_ids, ...ids])]
    : form.permission_ids.filter((id) => !ids.includes(id));
};

const openModal = () => {
  form.reset();
  form.clearErrors();
  showModal.value = true;
};

const editRole = (role) => {
  form.id = role.id;
  form.name = role.name;
  form.description = role.description || "";
  form.permission_ids = [...(role.permission_ids ?? [])];
  form.clearErrors();
  showModal.value = true;
};

const saveRole = () => {
  const opts = { preserveScroll: true, onSuccess: () => (showModal.value = false) };
  if (form.id) {
    form.put(`/roles/${form.id}`, opts);
  } else {
    form.post("/roles", opts);
  }
};

const deleteRole = async (role) => {
  if (!(await confirmDialog(`Delete the "${role.name}" role?`))) return;
  router.delete(`/roles/${role.id}`, { preserveScroll: true });
};
</script>

<style scoped>
.roles__matrix-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.roles__count {
  font-size: 0.8rem;
  color: var(--text-soft);
}

.roles__group {
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  margin-bottom: 8px;
}

.roles__group-head {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  margin-bottom: 8px;
}

.roles__perms {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 6px 16px;
}

.roles__perm {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: var(--text-soft);
}

.roles__perm code {
  font-size: 0.7rem;
  color: var(--text-soft);
  opacity: 0.7;
}
</style>
