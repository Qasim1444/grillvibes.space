<template>
  <div class="page">
    <PageHeader title="Overtime" subtitle="Extra hours worked. Only approved overtime is paid by payroll.">
      <template #actions>
        <button v-if="can('hr.overtime.create')" class="ui-btn ui-btn--primary" @click="openModal">
          + Log Overtime
        </button>
      </template>
    </PageHeader>

    <div v-if="flashError" class="ui-alert ui-alert--danger">{{ flashError }}</div>

    <div class="stat-grid">
      <StatCard label="Pending" :value="props.stats.pending" />
      <StatCard label="Approved Hours" :value="props.stats.approved_hours" />
      <StatCard label="Approved Amount" :value="money(props.stats.approved_amount)" />
    </div>

    <div class="ot__filters">
      <FormField v-model="status" label="Status" type="select">
        <option value="">All statuses</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </FormField>
      <FormField v-model="month" label="Month" type="month" />
    </div>

    <DataTable
      :columns="columns"
      :rows="rows"
      index
      searchable
      v-model:query="search"
      search-placeholder="Search employee…"
      empty-text="No overtime entries found."
    >
      <template #cell:employee_name="{ row }">
        <div class="ot__name">
          <strong>{{ row.employee_name }}</strong>
          <span v-if="row.employee_code" class="ot__code">{{ row.employee_code }}</span>
        </div>
      </template>
      <template #cell:rate_per_hour="{ value }">{{ money(value) }}</template>
      <template #cell:amount="{ value }">
        <strong>{{ money(value) }}</strong>
      </template>
      <template #cell:status="{ row }">
        <span class="ui-badge" :class="badgeClass(row.status)">{{ label(row.status) }}</span>
        <span v-if="row.approver_name" class="ot__by">by {{ row.approver_name }}</span>
      </template>
      <template #actions="{ row }">
        <template v-if="can('hr.overtime.approve')">
          <button
            v-if="row.status !== 'approved'"
            class="ui-btn ui-btn--success ui-btn--sm"
            @click="decide(row, 'approved')"
          >
            Approve
          </button>
          <button
            v-if="row.status !== 'rejected'"
            class="ui-btn ui-btn--danger ui-btn--sm"
            @click="decide(row, 'rejected')"
          >
            Reject
          </button>
          <button
            v-if="row.status !== 'pending'"
            class="ui-btn ui-btn--ghost ui-btn--sm"
            @click="decide(row, 'pending')"
          >
            Reset
          </button>
        </template>
        <button
          v-if="can('hr.overtime.update') && row.status !== 'approved'"
          class="ui-btn ui-btn--ghost ui-btn--sm"
          @click="editRow(row)"
        >
          Edit
        </button>
        <button
          v-if="can('hr.overtime.delete') && row.status !== 'approved'"
          class="ui-btn ui-btn--danger ui-btn--sm"
          @click="deleteRow(row.id)"
        >
          Delete
        </button>
      </template>
    </DataTable>

    <Pagination :paginator="props.overtimes" :only="['overtimes']" />

    <Modal v-model="showModal" :title="form.id ? 'Edit Overtime' : 'Log Overtime'">
      <FormField v-model="form.user_id" label="Employee" type="select" :error="form.errors.user_id">
        <option value="">— select —</option>
        <option v-for="e in props.employees" :key="e.id" :value="e.id">{{ e.name }}</option>
      </FormField>
      <div class="ot__grid">
        <FormField v-model="form.date" label="Date" type="date" :error="form.errors.date" />
        <FormField v-model="form.hours" label="Hours" type="number" step="0.25" :error="form.errors.hours" />
        <FormField
          v-model="form.rate_per_hour"
          label="Rate per hour"
          type="number"
          step="0.01"
          :error="form.errors.rate_per_hour"
        />
        <FormField label="Amount" :model-value="computedAmount" readonly />
      </div>
      <p v-if="suggestedRate" class="ot__hint">
        Suggested rate from basic salary: {{ money(suggestedRate) }}/hr
        <button type="button" class="ot__link" @click="form.rate_per_hour = suggestedRate">use this</button>
      </p>
      <FormField v-model="form.note" label="Note" type="textarea" :error="form.errors.note" />
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
import { router, useForm, usePage } from "@inertiajs/vue3";
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
const page = usePage();

const props = defineProps({
  overtimes: { type: Object, default: () => ({ data: [] }) },
  filters: { type: Object, default: () => ({ search: "", status: "", month: "" }) },
  employees: { type: Array, default: () => [] },
  stats: { type: Object, default: () => ({ pending: 0, approved_hours: 0, approved_amount: 0 }) },
});

const flashError = computed(() => page.props.flash?.error || "");

const columns = [
  { key: "employee_name", label: "Employee" },
  { key: "date", label: "Date" },
  { key: "hours", label: "Hours", width: "90px" },
  { key: "rate_per_hour", label: "Rate/hr" },
  { key: "amount", label: "Amount" },
  { key: "note", label: "Note" },
  { key: "status", label: "Status" },
];

const rows = computed(() => props.overtimes?.data ?? []);

const search = ref(props.filters?.search ?? "");
const status = ref(props.filters?.status ?? "");
const month = ref(props.filters?.month ?? "");

let searchTimer = null;
const reload = (debounce) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(
    () =>
      router.get(
        "/hr/overtime",
        {
          search: search.value || undefined,
          status: status.value || undefined,
          month: month.value || undefined,
        },
        { preserveState: true, preserveScroll: true, replace: true, only: ["overtimes", "filters", "stats"] }
      ),
    debounce
  );
};
watch(search, () => reload(300));
watch([status, month], () => reload(0));

const showModal = ref(false);
const blank = { id: null, user_id: "", date: "", hours: "", rate_per_hour: "", note: "" };
const form = useForm({ ...blank });

// Mirrors the server calculation so the amount is visible before saving.
const computedAmount = computed(() =>
  money(Math.round((Number(form.hours) || 0) * (Number(form.rate_per_hour) || 0) * 100) / 100)
);

const suggestedRate = computed(
  () => props.employees.find((e) => String(e.id) === String(form.user_id))?.suggested_rate || 0
);

const openModal = () => {
  Object.assign(form, blank);
  form.date = new Date().toISOString().slice(0, 10);
  form.clearErrors();
  showModal.value = true;
};

const editRow = (o) => {
  Object.assign(form, {
    id: o.id,
    user_id: o.user_id,
    date: o.date,
    hours: o.hours,
    rate_per_hour: o.rate_per_hour,
    note: o.note ?? "",
  });
  form.clearErrors();
  showModal.value = true;
};

const save = () => {
  const opts = { preserveScroll: true, onSuccess: () => (showModal.value = false) };
  if (form.id) form.put(`/hr/overtime/${form.id}`, opts);
  else form.post("/hr/overtime", opts);
};

const decide = (row, next) => {
  router.put(`/hr/overtime/${row.id}/decide`, { status: next }, { preserveScroll: true });
};

const deleteRow = async (id) => {
  if (!(await confirmDialog("Delete this overtime entry?"))) return;
  router.delete(`/hr/overtime/${id}`, { preserveScroll: true });
};

const money = (v) => `Rs ${Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const label = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "—");
const badgeClass = (s) =>
  ({ approved: "ui-badge--success", rejected: "ui-badge--muted", pending: "ui-badge--warning" }[s] ??
  "ui-badge--muted");
</script>

<style scoped>
.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 18px;
}

.ot__filters {
  display: grid;
  grid-template-columns: 220px 200px;
  gap: 16px;
  margin-bottom: 14px;
}

.ot__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 16px;
}

.ot__name {
  display: flex;
  flex-direction: column;
}

.ot__code,
.ot__by {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.ot__by {
  display: block;
  margin-top: 2px;
}

.ot__hint {
  font-size: 0.8rem;
  color: var(--text-soft);
  margin: -6px 0 12px;
}

.ot__link {
  background: none;
  border: none;
  padding: 0 0 0 4px;
  color: var(--brand);
  font: inherit;
  cursor: pointer;
  text-decoration: underline;
}

@media (max-width: 860px) {
  .stat-grid,
  .ot__filters,
  .ot__grid {
    grid-template-columns: 1fr;
  }
}
</style>
