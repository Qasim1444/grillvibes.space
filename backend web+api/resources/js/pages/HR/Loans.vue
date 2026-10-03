<template>
  <div class="page">
    <PageHeader title="Loans & Advances" subtitle="Payroll collects one installment per active loan each month.">
      <template #actions>
        <button v-if="can('hr.loans.create')" class="ui-btn ui-btn--primary" @click="openModal">+ Add Loan</button>
      </template>
    </PageHeader>

    <div v-if="flashError" class="ui-alert ui-alert--danger">{{ flashError }}</div>

    <div class="stat-grid">
      <StatCard label="Active Loans" :value="props.stats.active" />
      <StatCard label="Total Disbursed" :value="money(props.stats.disbursed)" />
      <StatCard
        label="Outstanding"
        :value="money(props.stats.outstanding)"
        color="var(--warning)"
        tint="var(--warning-soft)"
      />
    </div>

    <div class="ln__filters">
      <FormField v-model="status" label="Status" type="select">
        <option value="">All statuses</option>
        <option value="active">Active</option>
        <option value="closed">Closed</option>
      </FormField>
    </div>

    <DataTable
      :columns="columns"
      :rows="rows"
      index
      searchable
      v-model:query="search"
      search-placeholder="Search employee…"
      empty-text="No loans recorded."
    >
      <template #cell:employee_name="{ row }">
        <div class="ln__name">
          <strong>{{ row.employee_name }}</strong>
          <span v-if="row.employee_code" class="ln__code">{{ row.employee_code }}</span>
        </div>
      </template>
      <template #cell:type="{ value }">
        <span class="ui-badge" :class="value === 'advance' ? 'ui-badge--info' : 'ui-badge--muted'">
          {{ label(value) }}
        </span>
      </template>
      <template #cell:amount="{ value }">{{ money(value) }}</template>
      <template #cell:installment_amount="{ value }">{{ money(value) }}</template>
      <template #cell:recovered="{ row }">
        <div class="ln__progress">
          <span>{{ money(row.recovered) }}</span>
          <div class="ln__bar"><span :style="{ width: percent(row) + '%' }" /></div>
        </div>
      </template>
      <template #cell:outstanding="{ value }">
        <strong>{{ money(value) }}</strong>
      </template>
      <template #cell:status="{ value }">
        <span class="ui-badge" :class="value === 'active' ? 'ui-badge--warning' : 'ui-badge--success'">
          {{ label(value) }}
        </span>
      </template>
      <template #actions="{ row }">
        <button class="ui-btn ui-btn--ghost ui-btn--sm" @click="openHistory(row)">
          History ({{ row.repayments.length }})
        </button>
        <button
          v-if="can('hr.loans.update') && row.status === 'active'"
          class="ui-btn ui-btn--success ui-btn--sm"
          @click="openRepay(row)"
        >
          Repay
        </button>
        <button v-if="can('hr.loans.update')" class="ui-btn ui-btn--ghost ui-btn--sm" @click="editRow(row)">
          Edit
        </button>
        <button
          v-if="can('hr.loans.delete') && !row.repayments.length"
          class="ui-btn ui-btn--danger ui-btn--sm"
          @click="deleteRow(row.id)"
        >
          Delete
        </button>
      </template>
    </DataTable>

    <Pagination :paginator="props.loans" :only="['loans']" />

    <Modal v-model="showModal" :title="form.id ? 'Edit Loan' : 'Add Loan'">
      <FormField v-model="form.user_id" label="Employee" type="select" :error="form.errors.user_id">
        <option value="">— select —</option>
        <option v-for="e in props.employees" :key="e.id" :value="e.id">{{ e.name }}</option>
      </FormField>
      <div class="ln__grid">
        <FormField v-model="form.type" label="Type" type="select" :error="form.errors.type">
          <option value="loan">Loan</option>
          <option value="advance">Salary advance</option>
        </FormField>
        <FormField v-model="form.disbursed_on" label="Disbursed on" type="date" :error="form.errors.disbursed_on" />
        <FormField v-model="form.amount" label="Amount" type="number" step="0.01" :error="form.errors.amount" />
        <FormField
          v-model="form.installment_amount"
          label="Monthly installment"
          type="number"
          step="0.01"
          :error="form.errors.installment_amount"
        />
      </div>
      <p v-if="months" class="ln__hint">Recovers in about {{ months }} month{{ months === 1 ? "" : "s" }}.</p>
      <FormField v-model="form.note" label="Note" type="textarea" :error="form.errors.note" />
      <template #footer>
        <button class="ui-btn ui-btn--ghost" @click="showModal = false">Cancel</button>
        <button class="ui-btn ui-btn--primary" :disabled="form.processing" @click="save">Save</button>
      </template>
    </Modal>

    <Modal v-model="showRepay" title="Record Repayment">
      <p class="ln__hint">
        {{ active?.employee_name }} — outstanding <strong>{{ money(active?.outstanding) }}</strong>
      </p>
      <div class="ln__grid">
        <FormField
          v-model="repayForm.amount"
          label="Amount"
          type="number"
          step="0.01"
          :error="repayForm.errors.amount"
        />
        <FormField v-model="repayForm.paid_on" label="Paid on" type="date" :error="repayForm.errors.paid_on" />
      </div>
      <p class="ln__note">
        Use this only for repayments taken outside payroll — payroll collects the installment itself when a run
        is marked paid.
      </p>
      <template #footer>
        <button class="ui-btn ui-btn--ghost" @click="showRepay = false">Cancel</button>
        <button class="ui-btn ui-btn--primary" :disabled="repayForm.processing" @click="submitRepay">Save</button>
      </template>
    </Modal>

    <Modal v-model="showHistory" title="Repayment History">
      <p class="ln__hint">
        {{ active?.employee_name }} — {{ money(active?.recovered) }} of {{ money(active?.amount) }} recovered
      </p>
      <table v-if="active?.repayments?.length" class="ln__table">
        <thead>
          <tr>
            <th>Paid on</th>
            <th>Amount</th>
            <th>Source</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in active.repayments" :key="r.id">
            <td>{{ r.paid_on }}</td>
            <td>{{ money(r.amount) }}</td>
            <td>{{ r.payroll_run_id ? `Payroll run #${r.payroll_run_id}` : "Manual" }}</td>
          </tr>
        </tbody>
      </table>
      <p v-else class="ln__note">No repayments yet.</p>
      <template #footer>
        <button class="ui-btn ui-btn--ghost" @click="showHistory = false">Close</button>
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
  loans: { type: Object, default: () => ({ data: [] }) },
  filters: { type: Object, default: () => ({ search: "", status: "" }) },
  employees: { type: Array, default: () => [] },
  stats: { type: Object, default: () => ({ active: 0, disbursed: 0, outstanding: 0 }) },
});

const flashError = computed(() => page.props.flash?.error || "");

const columns = [
  { key: "employee_name", label: "Employee" },
  { key: "type", label: "Type", width: "110px" },
  { key: "disbursed_on", label: "Disbursed" },
  { key: "amount", label: "Amount" },
  { key: "installment_amount", label: "Installment" },
  { key: "recovered", label: "Recovered" },
  { key: "outstanding", label: "Outstanding" },
  { key: "status", label: "Status", width: "100px" },
];

const rows = computed(() => props.loans?.data ?? []);

const search = ref(props.filters?.search ?? "");
const status = ref(props.filters?.status ?? "");

let searchTimer = null;
const reload = (debounce) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(
    () =>
      router.get(
        "/hr/loans",
        { search: search.value || undefined, status: status.value || undefined },
        { preserveState: true, preserveScroll: true, replace: true, only: ["loans", "filters", "stats"] }
      ),
    debounce
  );
};
watch(search, () => reload(300));
watch(status, () => reload(0));

const showModal = ref(false);
const showRepay = ref(false);
const showHistory = ref(false);
const active = ref(null);

const blank = {
  id: null,
  user_id: "",
  type: "loan",
  amount: "",
  installment_amount: "",
  disbursed_on: "",
  note: "",
};
const form = useForm({ ...blank });
const repayForm = useForm({ amount: "", paid_on: "" });

const months = computed(() => {
  const amount = Number(form.amount) || 0;
  const installment = Number(form.installment_amount) || 0;
  return amount > 0 && installment > 0 ? Math.ceil(amount / installment) : 0;
});

const percent = (row) => {
  const amount = Number(row.amount) || 0;
  return amount <= 0 ? 0 : Math.min(100, Math.round(((Number(row.recovered) || 0) / amount) * 100));
};

const openModal = () => {
  Object.assign(form, blank);
  form.disbursed_on = new Date().toISOString().slice(0, 10);
  form.clearErrors();
  showModal.value = true;
};

const editRow = (l) => {
  Object.assign(form, {
    id: l.id,
    user_id: l.user_id,
    type: l.type,
    amount: l.amount,
    installment_amount: l.installment_amount,
    disbursed_on: l.disbursed_on,
    note: l.note ?? "",
  });
  form.clearErrors();
  showModal.value = true;
};

const save = () => {
  const opts = { preserveScroll: true, onSuccess: () => (showModal.value = false) };
  if (form.id) form.put(`/hr/loans/${form.id}`, opts);
  else form.post("/hr/loans", opts);
};

const openRepay = (row) => {
  active.value = row;
  repayForm.reset();
  repayForm.amount = Math.min(Number(row.installment_amount) || 0, Number(row.outstanding) || 0) || "";
  repayForm.paid_on = new Date().toISOString().slice(0, 10);
  repayForm.clearErrors();
  showRepay.value = true;
};

const submitRepay = () => {
  repayForm.post(`/hr/loans/${active.value.id}/repay`, {
    preserveScroll: true,
    onSuccess: () => (showRepay.value = false),
  });
};

const openHistory = (row) => {
  active.value = row;
  showHistory.value = true;
};

const deleteRow = async (id) => {
  if (!(await confirmDialog("Delete this loan?"))) return;
  router.delete(`/hr/loans/${id}`, { preserveScroll: true });
};

const money = (v) => `Rs ${Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 0 })}`;
const label = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "—");
</script>

<style scoped>
.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 18px;
}

.ln__filters {
  max-width: 220px;
  margin-bottom: 14px;
}

.ln__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 16px;
}

.ln__name {
  display: flex;
  flex-direction: column;
}

.ln__code {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.ln__progress {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 90px;
}

.ln__bar {
  height: 4px;
  border-radius: 3px;
  background: var(--border);
  overflow: hidden;
}

.ln__bar span {
  display: block;
  height: 100%;
  background: var(--brand);
}

.ln__hint {
  font-size: 0.85rem;
  color: var(--text-soft);
  margin: 0 0 12px;
}

.ln__note {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin: 4px 0 0;
}

.ln__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.ln__table th,
.ln__table td {
  text-align: left;
  padding: 8px 6px;
  border-bottom: 1px solid var(--border);
}

@media (max-width: 860px) {
  .stat-grid,
  .ln__grid {
    grid-template-columns: 1fr;
  }
}
</style>
