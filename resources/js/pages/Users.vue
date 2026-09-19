<template>
  <div class="page">
    <PageHeader title="Users" subtitle="Manage admin user accounts.">
      <template #actions>
        <button v-if="can('users.create')" class="ui-btn ui-btn--primary" @click="openModal">+ Add User</button>
      </template>
    </PageHeader>

    <DataTable
      :columns="columns"
      :rows="users"
      index
      searchable
      v-model:query="search"
      search-placeholder="Search users…"
      empty-text="No users found."
    >
      <template #cell:created_at="{ value }">{{ formatDate(value) }}</template>
      <template #cell:role_names="{ value }">
        <span v-if="value" class="ui-badge ui-badge--success">{{ value }}</span>
        <span v-else class="ui-badge ui-badge--muted">No role</span>
      </template>
      <template #cell:branch_names="{ value }">
        <span v-if="value" class="ui-badge ui-badge--info">{{ value }}</span>
        <span v-else class="ui-badge ui-badge--muted">All branches</span>
      </template>
      <template #actions="{ row }">
        <button v-if="can('users.update')" class="ui-btn ui-btn--ghost ui-btn--sm" @click="editUser(row)">Edit</button>
        <button v-if="can('users.update')" class="ui-btn ui-btn--secondary ui-btn--sm" @click="openAssignRole(row)">Assign Role</button>
        <button v-if="can('users.delete')" class="ui-btn ui-btn--danger ui-btn--sm" @click="deleteUser(row.id)">Delete</button>
      </template>
    </DataTable>

    <Pagination :paginator="props.users" :only="['users']" />

    <Modal v-model="showModal" :title="form.id ? 'Edit User' : 'Add User'">
      <div v-if="errorMsg" class="ui-alert ui-alert--danger">{{ errorMsg }}</div>
      <FormField v-model="form.name" label="Name" placeholder="Name" :error="form.errors.name" />
      <FormField v-model="form.email" label="Email" type="email" placeholder="Email" :error="form.errors.email" />
      <FormField v-model="form.phone" label="Phone" placeholder="Phone" :error="form.errors.phone" />
      <FormField v-model="form.address" label="Address" type="textarea" placeholder="Address" :error="form.errors.address" />
      <FormField
        v-model="form.password"
        :label="form.id ? 'New Password (leave blank to keep current)' : 'Password'"
        type="password"
        placeholder="Password"
        :error="form.errors.password"
      />

      <div class="ui-field">
        <label class="ui-label">Roles</label>
        <div class="users__roles">
          <label v-for="r in props.roles" :key="r.id" class="users__role">
            <input type="checkbox" :value="r.id" v-model="form.role_ids" />
            <span>{{ r.name }}</span>
          </label>
          <p v-if="!props.roles.length" class="users__roles-empty">
            No roles defined yet — create one on the Roles &amp; Permissions page.
          </p>
        </div>
        <span v-if="form.errors.role_ids" class="ui-field__error">{{ form.errors.role_ids }}</span>
      </div>

      <div class="ui-field">
        <label class="ui-label">Branch Access</label>
        <div class="users__roles">
          <label v-for="branch in props.branches" :key="branch.id" class="users__role">
            <input type="checkbox" :value="branch.id" v-model="form.branch_ids" />
            <span>{{ branch.name }}</span>
          </label>
          <p v-if="!props.branches.length" class="users__roles-empty">No branches configured.</p>
        </div>
        <p class="users__roles-empty">Leave empty to allow all branches.</p>
        <span v-if="form.errors.branch_ids" class="ui-field__error">{{ form.errors.branch_ids }}</span>
      </div>

      <template #footer>
        <button class="ui-btn ui-btn--ghost" @click="showModal = false">Cancel</button>
        <button class="ui-btn ui-btn--primary" :disabled="form.processing" @click="saveUser">Save</button>
      </template>
    </Modal>

    <!-- Assign Role modal -->
    <Modal v-model="showAssignModal" title="Assign Roles">
      <p class="assign-role__name">User: <strong>{{ assignForm.userName }}</strong></p>
      <div class="ui-field">
        <label class="ui-label">Roles</label>
        <div class="users__roles">
          <label v-for="r in props.roles" :key="r.id" class="users__role">
            <input type="checkbox" :value="r.id" v-model="assignForm.role_ids" />
            <span>{{ r.name }}</span>
          </label>
          <p v-if="!props.roles.length" class="users__roles-empty">
            No roles defined yet — create one on the Roles &amp; Permissions page.
          </p>
        </div>
        <span v-if="assignForm.errors.role_ids" class="ui-field__error">{{ assignForm.errors.role_ids }}</span>
      </div>
      <template #footer>
        <button class="ui-btn ui-btn--ghost" @click="showAssignModal = false">Cancel</button>
        <button class="ui-btn ui-btn--primary" :disabled="assignForm.processing" @click="saveAssignRole">Save</button>
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
  users: { type: Object, default: () => ({ data: [] }) },
  roles: { type: Array, default: () => [] },
  branches: { type: Array, default: () => [] },
  filters: { type: Object, default: () => ({ search: "" }) },
});

const { can } = usePermissions();

const columns = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "address", label: "Address" },
  { key: "role_names", label: "Roles" },
  { key: "branch_names", label: "Branches" },
  { key: "created_at", label: "Created At" },
];

const users = computed(() => props.users?.data ?? []);

// Server-driven search: typing issues a debounced partial reload that re-runs
// the paginated query (only the `users` prop) with the new term, resetting to
// page 1.
const search = ref(props.filters?.search ?? "");
let searchTimer = null;
watch(search, (value) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    router.get(
      "/users",
      { search: value || undefined },
      { preserveState: true, preserveScroll: true, replace: true, only: ["users", "filters"] }
    );
  }, 300);
});

const showModal = ref(false);
const form = useForm({ id: null, name: "", email: "", phone: "", address: "", password: "", role_ids: [], branch_ids: [] });

// Non-field-specific summary (e.g. a validation message not tied to one input).
const errorMsg = computed(() => form.errors.message || "");

const openModal = () => {
  form.reset();
  form.clearErrors();
  showModal.value = true;
};

const editUser = (u) => {
  form.id = u.id;
  form.name = u.name;
  form.email = u.email;
  form.phone = u.phone || "";
  form.address = u.address || "";
  form.password = "";
  form.role_ids = [...(u.role_ids ?? [])];
  form.branch_ids = [...(u.branch_ids ?? [])];
  form.clearErrors();
  showModal.value = true;
};

const saveUser = () => {
  const opts = { preserveScroll: true, onSuccess: () => (showModal.value = false) };
  if (form.id) {
    form.put(`/users/${form.id}`, opts);
  } else {
    form.post("/users", opts);
  }
};

// ── Assign Role ──────────────────────────────────────────────────────────────
const showAssignModal = ref(false);
const assignForm = useForm({ userId: null, userName: "", role_ids: [] });

const openAssignRole = (u) => {
  assignForm.userId = u.id;
  assignForm.userName = u.name;
  assignForm.role_ids = [...(u.role_ids ?? [])];
  assignForm.clearErrors();
  showAssignModal.value = true;
};

const saveAssignRole = () => {
  assignForm.post(`/users/${assignForm.userId}/assign-roles`, {
    preserveScroll: true,
    onSuccess: () => (showAssignModal.value = false),
  });
};

const deleteUser = async (id) => {
  if (!(await confirmDialog("Are you sure you want to delete this user?"))) return;
  router.delete(`/users/${id}`, { preserveScroll: true });
};

const formatDate = (dateStr) => (dateStr ? new Date(dateStr).toLocaleDateString() : "—");
</script>

<style scoped>
.users__roles {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 6px 16px;
}

.users__role {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: var(--text-soft);
}

.users__roles-empty {
  font-size: 0.8rem;
  color: var(--text-soft);
  margin: 0;
}

.assign-role__name {
  font-size: 0.9rem;
  color: var(--text-soft);
  margin: 0 0 12px;
}
</style>
