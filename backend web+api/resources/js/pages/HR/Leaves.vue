<template>
  <div class="page">
    <PageHeader title="Leaves" subtitle="Leave requests and approvals. Approved unpaid leave is deducted by payroll.">
      <template #actions>
        <button v-if="can('hr.leaves.create')" class="ui-btn ui-btn--ghost" @click="showTypeModal = true">
          ⚙ Leave Types
        </button>
        <button v-if="can('hr.leaves.create')" class="ui-btn ui-btn--primary" @click="openModal">
          + Add Leave
        </button>
      </template>
    </PageHeader>

    <div v-if="flashError" class="ui-alert ui-alert--danger">{{ flashError }}</div>

    <div class="stat-grid">
      <StatCard label="Pending" :value="props.stats.pending" />
      <StatCard label="Approved" :value="props.stats.approved" />
      <StatCard label="Rejected" :value="props.stats.rejected" />
    </div>

    <div class="lv__filters">
      <FormField v-model="status" label="Status" type="select">
        <option value="">All statuses</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </FormField>
    </div>

    <DataTable
      :columns="columns"
      :rows="rows"
      index
      searchable
      v-model:query="search"
      search-placeholder="Search employee…"
      empty-text="No leave requests found."
    >
      <template #cell:employee_name="{ row }">
        <div class="lv__name">
          <strong>{{ row.employee_name }}</strong>
          <span v-if="row.employee_code" class="lv__code">{{ row.employee_code }}</span>
        </div>
      </template>
      <template #cell:leave_type_name="{ row }">
        {{ row.leave_type_name }}
        <span class="ui-badge" :class="row.is_paid ? 'ui-badge--success' : 'ui-badge--warning'">
          {{ row.is_paid ? "Paid" : "Unpaid" }}
        </span>
      </template>
      <template #cell:period="{ row }">{{ row.from_date }} → {{ row.to_date }}</template>
      <template #cell:status="{ row }">
        <span class="ui-badge" :class="badgeClass(row.status)">{{ label(row.status) }}</span>
        <span v-if="row.approver_name" class="lv__by">by {{ row.approver_name }}</span>
      </template>
      <template #actions="{ row }">
        <template v-if="can('hr.leaves.approve')">
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
          v-if="can('hr.leaves.update') && row.status === 'pending'"
          class="ui-btn ui-btn--ghost ui-btn--sm"
          @click="editRow(row)"
        >
          Edit
        </button>
        <button v-if="can('hr.leaves.delete')" class="ui-btn ui-btn--danger ui-btn--sm" @click="deleteRow(row.id)">
          Delete
        </button>
      </template>
    </DataTable>

    <Pagination :paginator="props.leaves" :only="['leaves']" />

    <Modal v-model="showModal" :title="form.id ? 'Edit Leave Request' : 'Add Leave Request'">
      <FormField v-model="form.user_id" label="Employee" type="select" :error="form.errors.user_id">
        <option value="">— select —</option>
        <option v-for="e in props.employees" :key="e.id" :value="e.id">{{ e.name }}</option>
      </FormField>
      <FormField v-model="form.leave_type_id" label="Leave type" type="select" :error="form.errors.leave_type_id">
        <option value="">— select —</option>
        <option v-for="t in props.leaveTypes" :key="t.id" :value="t.id">
          {{ t.name }} ({{ t.is_paid ? "paid" : "unpaid" }}{{ t.days_per_year ? `, ${t.days_per_year}/yr` : "" }})
        </option>
      </FormField>
      <div class="lv__grid">
        <FormField v-model="form.from_date" label="From" type="date" :error="form.errors.from_date" />
        <FormField v-model="form.to_date" label="To" type="date" :error="form.errors.to_date" />
      </div>
      <p v-if="dayCount" class="lv__days">{{ dayCount }} day{{ dayCount === 1 ? "" : "s" }}</p>
      <FormField v-model="form.reason" label="Reason" type="textarea" :error="form.errors.reason" />
      <template #footer>
        <button class="ui-btn ui-btn--ghost" @click="showModal = false">Cancel</button>
        <button class="ui-btn ui-btn--primary" :disabled="form.processing" @click="save">Save</button>
      </template>
    </Modal>

    <!-- Leave Types manager -->
    <Modal v-model="showTypeModal" title="Manage Leave Types" width="520px">
      <div class="lt__add">
        <FormField v-model="typeForm.name" label="Name *" placeholder="e.g. Annual Leave" :error="typeForm.errors.name" />
        <div class="lv__grid">
          <FormField v-model.number="typeForm.days_per_year" label="Days / year" type="number" min="0" :error="typeForm.errors.days_per_year" />
          <FormField v-model="typeForm.is_paid" label="Paid?" type="select">
            <option :value="true">Paid</option>
            <option :value="false">Unpaid</option>
          </FormField>
        </div>
        <div class="lt__add-actions">
          <button v-if="typeForm.id" class="ui-btn ui-btn--ghost ui-btn--sm" @click="resetTypeForm">Cancel edit</button>
          <button class="ui-btn ui-btn--primary ui-btn--sm" :disabled="typeForm.processing" @click="saveType">
            {{ typeForm.id ? 'Update Type' : '+ Add Type' }}
          </button>
        </div>
      </div>
      <div class="lt__list">
        <div v-for="t in props.leaveTypes" :key="t.id" class="lt__row">
          <div class="lt__info">
            <strong>{{ t.name }}</strong>
            <span class="lt__meta">
              {{ t.is_paid ? 'Paid' : 'Unpaid' }}{{ t.days_per_year ? ` · ${t.days_per_year} days/yr` : '' }}
            </span>
          </div>
          <div class="lt__actions">
            <button class="ui-btn ui-btn--ghost ui-btn--sm" @click="editType(t)">Edit</button>
            <button v-if="can('hr.leaves.delete')" class="ui-btn ui-btn--danger ui-btn--sm" @click="deleteType(t)">Delete</button>
          </div>
        </div>
        <p v-if="!props.leaveTypes.length" class="data-table__empty" style="padding: 16px 0">No leave types yet.</p>
      </div>
      <template #footer>
        <button class="ui-btn ui-btn--primary" @click="showTypeModal = false">Done</button>
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
  leaves: { type: Object, default: () => ({ data: [] }) },
  filters: { type: Object, default: () => ({ search: "", status: "" }) },
  employees: { type: Array, default: () => [] },
  leaveTypes: { type: Array, default: () => [] },
  stats: { type: Object, default: () => ({ pending: 0, approved: 0, rejected: 0 }) },
});

const flashError = computed(() => page.props.flash?.error || "");

const columns = [
  { key: "employee_name", label: "Employee" },
  { key: "leave_type_name", label: "Type" },
  { key: "period", label: "Period" },
  { key: "days", label: "Days", width: "80px" },
  { key: "reason", label: "Reason" },
  { key: "status", label: "Status" },
];

const rows = computed(() => props.leaves?.data ?? []);

const search = ref(props.filters?.search ?? "");
const status = ref(props.filters?.status ?? "");

let searchTimer = null;
const reload = (debounce) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(
    () =>
      router.get(
        "/hr/leaves",
        { search: search.value || undefined, status: status.value || undefined },
        { preserveState: true, preserveScroll: true, replace: true, only: ["leaves", "filters", "stats"] }
      ),
    debounce
  );
};
watch(search, () => reload(300));
watch(status, () => reload(0));

const showModal = ref(false);
const blank = { id: null, user_id: "", leave_type_id: "", from_date: "", to_date: "", reason: "" };
const form = useForm({ ...blank });

// Inclusive, mirrors the server-side day count.
const dayCount = computed(() => {
  if (!form.from_date || !form.to_date) return 0;
  const diff = new Date(form.to_date) - new Date(form.from_date);
  return diff < 0 ? 0 : Math.round(diff / 86400000) + 1;
});

const openModal = () => {
  Object.assign(form, blank);
  form.clearErrors();
  showModal.value = true;
};

const editRow = (l) => {
  Object.assign(form, {
    id: l.id,
    user_id: l.user_id,
    leave_type_id: l.leave_type_id,
    from_date: l.from_date,
    to_date: l.to_date,
    reason: l.reason ?? "",
  });
  form.clearErrors();
  showModal.value = true;
};

const save = () => {
  const opts = { preserveScroll: true, onSuccess: () => (showModal.value = false) };
  if (form.id) form.put(`/hr/leaves/${form.id}`, opts);
  else form.post("/hr/leaves", opts);
};

const decide = (row, next) => {
  router.put(`/hr/leaves/${row.id}/decide`, { status: next }, { preserveScroll: true });
};

const deleteRow = async (id) => {
  if (!(await confirmDialog("Delete this leave request?"))) return;
  router.delete(`/hr/leaves/${id}`, { preserveScroll: true });
};

// ── Leave type management ─────────────────────────────────────────────────
const showTypeModal = ref(false);
const typeBlank = { id: null, name: "", days_per_year: null, is_paid: true };
const typeForm = useForm({ ...typeBlank });

const resetTypeForm = () => {
  Object.assign(typeForm, typeBlank);
  typeForm.clearErrors();
};

const editType = (t) => {
  Object.assign(typeForm, { id: t.id, name: t.name, days_per_year: t.days_per_year, is_paid: !!t.is_paid });
  typeForm.clearErrors();
};

const saveType = () => {
  const opts = { preserveScroll: true, onSuccess: () => resetTypeForm() };
  if (typeForm.id) typeForm.put(`/hr/leaves/types/${typeForm.id}`, opts);
  else typeForm.post("/hr/leaves/types", opts);
};

const deleteType = async (t) => {
  if (!(await confirmDialog(`Delete leave type "${t.name}"?`))) return;
  router.delete(`/hr/leaves/types/${t.id}`, { preserveScroll: true });
};

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

.lv__filters {
  max-width: 220px;
  margin-bottom: 14px;
}

.lv__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 16px;
}

.lv__name {
  display: flex;
  flex-direction: column;
}

.lv__code,
.lv__by {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.lv__by {
  display: block;
  margin-top: 2px;
}

.lv__days {
  font-size: 0.8rem;
  color: var(--text-soft);
  margin: -6px 0 12px;
}

/* Leave type manager */
.lt__add        { padding-bottom: 14px; border-bottom: 1px solid var(--border); margin-bottom: 10px; }
.lt__add-actions{ display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }
.lt__list       { max-height: 300px; overflow-y: auto; }
.lt__row        { display: flex; align-items: center; justify-content: space-between; gap: 10px;
                  padding: 9px 2px; border-bottom: 1px solid var(--border); }
.lt__row:last-child { border-bottom: none; }
.lt__info   { display: flex; flex-direction: column; }
.lt__meta   { font-size: 0.75rem; color: var(--text-muted); }
.lt__actions{ display: flex; gap: 6px; }

@media (max-width: 860px) {
  .stat-grid {
    grid-template-columns: 1fr;
  }
  .lv__grid {
    grid-template-columns: 1fr;
  }
}
</style>
