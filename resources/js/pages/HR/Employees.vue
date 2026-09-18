<template>
  <div class="page">
    <PageHeader title="Employees" subtitle="Staff records — the master data payroll and attendance run on.">
      <template #actions>
        <button v-if="can('hr.employees.create')" class="ui-btn ui-btn--primary" @click="openModal">
          + Add Employee
        </button>
      </template>
    </PageHeader>

    <div class="stat-grid">
      <StatCard label="Employees" :value="props.stats.total" />
      <StatCard label="Active" :value="props.stats.active" />
      <StatCard label="Monthly Salary Bill" :value="money(props.stats.payroll)" />
    </div>

    <div class="emp__filters">
      <FormField v-model="status" label="Employment status" type="select">
        <option value="">All statuses</option>
        <option v-for="s in props.statuses" :key="s" :value="s">{{ label(s) }}</option>
      </FormField>
    </div>

    <DataTable
      :columns="columns"
      :rows="rows"
      index
      searchable
      v-model:query="search"
      search-placeholder="Search name, code, phone or CNIC…"
      empty-text="No employees found."
    >
      <template #cell:name="{ row }">
        <div class="emp__name">
          <strong>{{ row.name }}</strong>
          <span v-if="row.employee_code" class="emp__code">{{ row.employee_code }}</span>
        </div>
      </template>
      <template #cell:basic_salary="{ value }">{{ money(value) }}</template>
      <template #cell:employment_status="{ value }">
        <span class="ui-badge" :class="statusClass(value)">{{ label(value) }}</span>
      </template>
      <template #cell:has_login="{ value }">
        <span class="ui-badge" :class="value ? 'ui-badge--info' : 'ui-badge--muted'">
          {{ value ? "Yes" : "No" }}
        </span>
      </template>
      <template #actions="{ row }">
        <button v-if="can('hr.employees.update')" class="ui-btn ui-btn--ghost ui-btn--sm" @click="editRow(row)">
          Edit
        </button>
        <button v-if="can('hr.employees.delete')" class="ui-btn ui-btn--danger ui-btn--sm" @click="deleteRow(row.id)">
          Delete
        </button>
      </template>
    </DataTable>

    <Pagination :paginator="props.employees" :only="['employees']" />

    <Modal v-model="showModal" :title="form.id ? 'Edit Employee' : 'Add Employee'">
      <div class="emp__grid">
        <FormField v-model="form.name" label="Full name" placeholder="Full name" :error="form.errors.name" />
        <FormField
          v-model="form.employee_code"
          label="Employee code"
          placeholder="e.g. EMP-014"
          :error="form.errors.employee_code"
        />
        <FormField v-model="form.designation_id" label="Designation" type="select" :error="form.errors.designation_id">
          <option value="">— none —</option>
          <option v-for="d in props.designations" :key="d.id" :value="d.id">{{ d.name }}</option>
        </FormField>
        <FormField v-model="form.place_id" label="Place / branch" type="select" :error="form.errors.place_id">
          <option value="">— none —</option>
          <option v-for="p in props.places" :key="p.id" :value="p.id">{{ p.name }}</option>
        </FormField>
        <FormField v-model="form.phone" label="Phone" placeholder="Phone" :error="form.errors.phone" />
        <FormField v-model="form.cnic" label="CNIC / ID" placeholder="00000-0000000-0" :error="form.errors.cnic" />
        <FormField v-model="form.gender" label="Gender" type="select" :error="form.errors.gender">
          <option value="">— not set —</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </FormField>
        <FormField
          v-model="form.date_of_birth"
          label="Date of birth"
          type="date"
          :error="form.errors.date_of_birth"
        />
        <FormField v-model="form.joining_date" label="Joining date" type="date" :error="form.errors.joining_date" />
        <FormField v-model="form.leaving_date" label="Leaving date" type="date" :error="form.errors.leaving_date" />
        <FormField
          v-model="form.employment_status"
          label="Employment status"
          type="select"
          :error="form.errors.employment_status"
        >
          <option v-for="s in props.statuses" :key="s" :value="s">{{ label(s) }}</option>
        </FormField>
        <FormField
          v-model="form.basic_salary"
          label="Basic salary (monthly)"
          type="number"
          step="0.01"
          :error="form.errors.basic_salary"
        />
      </div>

      <FormField v-model="form.address" label="Address" type="textarea" :error="form.errors.address" />

      <div class="emp__login">
        <p class="emp__login-note">
          Login is optional. Leave both fields blank for staff who only need attendance and payroll —
          they cannot sign in without an email <em>and</em> a password.
        </p>
        <div class="emp__grid">
          <FormField v-model="form.email" label="Email (login)" type="email" :error="form.errors.email" />
          <FormField
            v-model="form.password"
            :label="form.id ? 'New password (blank keeps current)' : 'Password'"
            type="password"
            :error="form.errors.password"
          />
        </div>
      </div>

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
import StatCard from "../../components/ui/StatCard.vue";
import { usePermissions } from "../../composables/usePermissions";

defineOptions({ layout: AdminLayout });

const { can } = usePermissions();

const props = defineProps({
  employees: { type: Object, default: () => ({ data: [] }) },
  filters: { type: Object, default: () => ({ search: "", status: "" }) },
  designations: { type: Array, default: () => [] },
  places: { type: Array, default: () => [] },
  statuses: { type: Array, default: () => [] },
  stats: { type: Object, default: () => ({ total: 0, active: 0, payroll: 0 }) },
});

const columns = [
  { key: "name", label: "Employee" },
  { key: "designation_name", label: "Designation" },
  { key: "place_name", label: "Place" },
  { key: "phone", label: "Phone" },
  { key: "joining_date", label: "Joined" },
  { key: "basic_salary", label: "Basic" },
  { key: "employment_status", label: "Status" },
  { key: "has_login", label: "Login" },
];

const rows = computed(() => props.employees?.data ?? []);

const search = ref(props.filters?.search ?? "");
const status = ref(props.filters?.status ?? "");

// One reload path for both filters so changing either resets to page 1.
let searchTimer = null;
const reload = (debounce) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(
    () =>
      router.get(
        "/hr/employees",
        { search: search.value || undefined, status: status.value || undefined },
        { preserveState: true, preserveScroll: true, replace: true, only: ["employees", "filters", "stats"] }
      ),
    debounce
  );
};
watch(search, () => reload(300));
watch(status, () => reload(0));

const showModal = ref(false);
const blank = {
  id: null,
  name: "",
  employee_code: "",
  email: "",
  password: "",
  phone: "",
  address: "",
  cnic: "",
  gender: "",
  date_of_birth: "",
  designation_id: "",
  place_id: "",
  joining_date: "",
  leaving_date: "",
  employment_status: "active",
  basic_salary: 0,
};
const form = useForm({ ...blank });

const openModal = () => {
  Object.assign(form, blank);
  form.clearErrors();
  showModal.value = true;
};

const editRow = (e) => {
  Object.assign(form, {
    ...blank,
    id: e.id,
    name: e.name,
    employee_code: e.employee_code ?? "",
    email: e.email ?? "",
    password: "",
    phone: e.phone ?? "",
    address: e.address ?? "",
    cnic: e.cnic ?? "",
    gender: e.gender ?? "",
    date_of_birth: e.date_of_birth ?? "",
    designation_id: e.designation_id ?? "",
    place_id: e.place_id ?? "",
    joining_date: e.joining_date ?? "",
    leaving_date: e.leaving_date ?? "",
    employment_status: e.employment_status ?? "active",
    basic_salary: e.basic_salary ?? 0,
  });
  form.clearErrors();
  showModal.value = true;
};

const save = () => {
  const opts = { preserveScroll: true, onSuccess: () => (showModal.value = false) };
  if (form.id) form.put(`/hr/employees/${form.id}`, opts);
  else form.post("/hr/employees", opts);
};

const deleteRow = async (id) => {
  if (!(await confirmDialog("Delete this employee? Staff with payslips must be marked 'left' instead."))) return;
  router.delete(`/hr/employees/${id}`, { preserveScroll: true });
};

const money = (v) => `Rs ${Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 0 })}`;
const label = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "—");
const statusClass = (s) =>
  ({ active: "ui-badge--success", inactive: "ui-badge--warning", left: "ui-badge--muted" }[s] ?? "ui-badge--muted");
</script>

<style scoped>
.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 18px;
}

.emp__filters {
  max-width: 240px;
  margin-bottom: 14px;
}

.emp__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 16px;
}

.emp__name {
  display: flex;
  flex-direction: column;
}

.emp__code {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.emp__login {
  border-top: 1px solid var(--border);
  margin-top: 6px;
  padding-top: 12px;
}

.emp__login-note {
  font-size: 0.8rem;
  color: var(--text-soft);
  margin: 0 0 10px;
}

@media (max-width: 860px) {
  .stat-grid {
    grid-template-columns: 1fr;
  }
  .emp__grid {
    grid-template-columns: 1fr;
  }
}
</style>
