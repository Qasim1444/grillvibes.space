<template>
  <div class="page">
    <PageHeader title="Payroll" subtitle="Generate a draft, approve it to lock the numbers, then mark it paid.">
      <template #actions>
        <button
          v-if="!props.run && can('hr.payroll.create')"
          class="ui-btn ui-btn--primary"
          :disabled="generating || !previewRows.length"
          @click="generate"
        >
          {{ generating ? "Generating…" : "Generate Draft" }}
        </button>
        <template v-if="props.run">
          <button
            v-if="props.run.status === 'draft' && can('hr.payroll.create')"
            class="ui-btn ui-btn--ghost"
            @click="generate"
          >
            Recompute
          </button>
          <button
            v-if="props.run.status === 'draft' && can('hr.payroll.approve')"
            class="ui-btn ui-btn--primary"
            @click="approve"
          >
            Approve
          </button>
          <button
            v-if="props.run.status === 'approved' && can('hr.payroll.approve')"
            class="ui-btn ui-btn--success"
            @click="markPaid"
          >
            Mark Paid
          </button>
          <button
            v-if="props.run.status === 'draft' && can('hr.payroll.delete')"
            class="ui-btn ui-btn--danger"
            @click="destroyRun"
          >
            Delete Draft
          </button>
        </template>
      </template>
    </PageHeader>

    <div v-if="flashError" class="ui-alert ui-alert--danger">{{ flashError }}</div>
    <div v-if="monthError" class="ui-alert ui-alert--danger">{{ monthError }}</div>

    <div class="pr__bar ui-card ui-card-pad">
      <div class="pr__month">
        <label class="ui-label" for="pr-month">Month</label>
        <input id="pr-month" class="ui-input" type="month" :value="props.month" @change="changeMonth($event.target.value)" />
      </div>
      <div class="pr__state">
        <span class="pr__label">{{ props.monthLabel }}</span>
        <span v-if="props.run" class="ui-badge" :class="statusClass(props.run.status)">
          {{ label(props.run.status) }}
        </span>
        <span v-else class="ui-badge ui-badge--info">Not generated — live preview</span>
      </div>
      <div v-if="props.run" class="pr__meta">
        <span v-if="props.run.processor_name">Processed by {{ props.run.processor_name }}</span>
        <span v-if="props.run.approved_at">Approved {{ props.run.approved_at }}</span>
        <span v-if="props.run.paid_at">Paid {{ props.run.paid_at }}</span>
      </div>
    </div>

    <div class="stat-grid">
      <StatCard label="Employees" :value="totals.employees" />
      <StatCard label="Gross" :value="money(totals.gross)" color="var(--info)" tint="var(--info-soft)" />
      <StatCard
        label="Deductions"
        :value="money(totals.deductions)"
        color="var(--warning)"
        tint="var(--warning-soft)"
      />
      <StatCard label="Net Payable" :value="money(totals.net)" color="var(--success)" tint="var(--success-soft)" />
    </div>

    <!-- One row per employee for one month — a small fixed set, so it is filtered
         client-side rather than paged: the totals above must match what is listed. -->
    <DataTable
      :columns="columns"
      :rows="sheetRows"
      index
      searchable
      search-placeholder="Filter by name, code or designation…"
      :empty-text="
        props.run
          ? 'This run has no payslips.'
          : 'No payable employees for this month. Add employees under HR → Employees.'
      "
    >
      <template #cell:name="{ row }">
        <div class="pr__name">
          <strong>{{ row.name }}</strong>
          <span v-if="row.employee_code" class="pr__code">{{ row.employee_code }}</span>
        </div>
      </template>
      <template #cell:days="{ row }">
        <span class="pr__days">
          {{ row.present_days }} present · {{ row.absent_days }} absent · {{ row.leave_days }} leave
          <em>of {{ row.payable_days }}</em>
        </span>
      </template>
      <template #cell:earned_basic="{ row }">{{ money(row.earned_basic ?? row.basic) }}</template>
      <template #cell:overtime_amount="{ value }">{{ money(value) }}</template>
      <template #cell:deductions_amount="{ value }">{{ money(value) }}</template>
      <template #cell:loan_deduction="{ value }">{{ money(value) }}</template>
      <template #cell:gross="{ value }">{{ money(value) }}</template>
      <template #cell:net="{ value }">
        <strong>{{ money(value) }}</strong>
      </template>
      <template #actions="{ row }">
        <button class="ui-btn ui-btn--ghost ui-btn--sm" @click="openSlip(row)">Details</button>
      </template>
    </DataTable>

    <!-- Deductions -->
    <div class="pr__section">
      <div class="pr__section-head">
        <div>
          <h3 class="pr__h3">Deductions</h3>
          <p class="pr__sub">
            Unbilled deductions. Recurring ones are charged every month; one-off rows are consumed the moment a
            run is approved.
          </p>
        </div>
        <button v-if="can('hr.payroll.create')" class="ui-btn ui-btn--primary ui-btn--sm" @click="openDeduction()">
          + Add Deduction
        </button>
      </div>

      <DataTable
        :columns="deductionColumns"
        :rows="props.deductions"
        index
        empty-text="No pending deductions."
      >
        <template #cell:amount="{ value }">{{ money(value) }}</template>
        <template #cell:is_recurring="{ value }">
          <span class="ui-badge" :class="value ? 'ui-badge--info' : 'ui-badge--muted'">
            {{ value ? "Monthly" : "One-off" }}
          </span>
        </template>
        <template #cell:effective_month="{ value }">{{ value || "Any month" }}</template>
        <template #actions="{ row }">
          <button
            v-if="can('hr.payroll.create')"
            class="ui-btn ui-btn--ghost ui-btn--sm"
            @click="openDeduction(row)"
          >
            Edit
          </button>
          <button
            v-if="can('hr.payroll.delete')"
            class="ui-btn ui-btn--danger ui-btn--sm"
            @click="deleteDeduction(row.id)"
          >
            Delete
          </button>
        </template>
      </DataTable>
    </div>

    <!-- Run history -->
    <div class="pr__section">
      <h3 class="pr__h3">Run History</h3>
      <DataTable :columns="runColumns" :rows="props.runs.data" empty-text="No payroll runs yet.">
        <template #cell:status="{ value }">
          <span class="ui-badge" :class="statusClass(value)">{{ label(value) }}</span>
        </template>
        <template #cell:total_gross="{ value }">{{ money(value) }}</template>
        <template #cell:total_deductions="{ value }">{{ money(value) }}</template>
        <template #cell:total_net="{ value }">
          <strong>{{ money(value) }}</strong>
        </template>
        <template #actions="{ row }">
          <button class="ui-btn ui-btn--ghost ui-btn--sm" @click="changeMonth(row.month)">Open</button>
        </template>
      </DataTable>
      <Pagination :paginator="props.runs" :only="['runs']" />
    </div>

    <!-- Payslip detail -->
    <Modal v-model="showSlip" :title="`Payslip — ${slip?.name ?? ''}`" width="620px">
      <template v-if="slip">
        <div class="pr__slip-head">
          <div>
            <strong>{{ slip.name }}</strong>
            <span v-if="slip.employee_code" class="pr__code"> · {{ slip.employee_code }}</span>
            <div v-if="slip.designation" class="pr__sub">{{ slip.designation }}</div>
          </div>
          <div class="pr__slip-net">
            <span class="pr__sub">Net pay</span>
            <strong>{{ money(slip.net) }}</strong>
          </div>
        </div>

        <table class="pr__table">
          <tbody>
            <tr>
              <td>Basic salary (monthly)</td>
              <td>{{ money(snap.basic_salary ?? slip.basic) }}</td>
            </tr>
            <tr>
              <td>Payable days</td>
              <td>{{ slip.payable_days }}</td>
            </tr>
            <tr>
              <td>Absent / leave deducted</td>
              <td>{{ slip.absent_days }} day(s)</td>
            </tr>
            <tr>
              <td>Earned basic</td>
              <td>{{ money(slip.earned_basic ?? slip.basic) }}</td>
            </tr>
            <tr>
              <td>Overtime</td>
              <td>{{ money(slip.overtime_amount) }}</td>
            </tr>
            <tr class="pr__row-strong">
              <td>Gross</td>
              <td>{{ money(slip.gross) }}</td>
            </tr>
            <tr>
              <td>Deductions</td>
              <td>− {{ money(slip.deductions_amount) }}</td>
            </tr>
            <tr>
              <td>Loan installment</td>
              <td>− {{ money(slip.loan_deduction) }}</td>
            </tr>
            <tr class="pr__row-strong">
              <td>Net</td>
              <td>{{ money(slip.net) }}</td>
            </tr>
          </tbody>
        </table>

        <div v-if="snap.overtime?.length" class="pr__block">
          <h4 class="pr__h4">Overtime entries</h4>
          <p v-for="(o, i) in snap.overtime" :key="i" class="pr__line">
            {{ o.date }} — {{ o.hours }} h × {{ money(o.rate_per_hour) }} = {{ money(o.amount) }}
          </p>
        </div>

        <div v-if="snap.leaves?.length" class="pr__block">
          <h4 class="pr__h4">Leave</h4>
          <p v-for="(l, i) in snap.leaves" :key="i" class="pr__line">
            {{ l.type }} — {{ l.from }} → {{ l.to }} ({{ l.days }} day{{ l.days === 1 ? "" : "s" }},
            {{ l.paid ? "paid" : "unpaid" }})
          </p>
        </div>

        <div v-if="snap.deductions?.length" class="pr__block">
          <h4 class="pr__h4">Deductions</h4>
          <p v-for="(d, i) in snap.deductions" :key="i" class="pr__line">
            {{ d.title }} — {{ money(d.amount) }}<span v-if="d.recurring"> (monthly)</span>
          </p>
        </div>

        <div v-if="snap.loans?.length" class="pr__block">
          <h4 class="pr__h4">Loan installments</h4>
          <p v-for="(l, i) in snap.loans" :key="i" class="pr__line">
            {{ label(l.type) }} #{{ l.loan_id }} — {{ money(l.amount) }}
          </p>
        </div>

        <p v-if="snap.generated_at" class="pr__sub">Computed {{ snap.generated_at }}</p>
      </template>
      <template #footer>
        <button class="ui-btn ui-btn--ghost" @click="showSlip = false">Close</button>
      </template>
    </Modal>

    <!-- Deduction form -->
    <Modal v-model="showDeduction" :title="dForm.id ? 'Edit Deduction' : 'Add Deduction'">
      <FormField v-model="dForm.user_id" label="Employee" type="select" :error="dForm.errors.user_id">
        <option value="">— select —</option>
        <option v-for="e in props.employees" :key="e.id" :value="e.id">{{ e.name }}</option>
      </FormField>
      <FormField
        v-model="dForm.title"
        label="Title"
        placeholder="e.g. Uniform, Fine, Insurance"
        :error="dForm.errors.title"
      />
      <div class="pr__grid">
        <FormField v-model="dForm.amount" label="Amount" type="number" step="0.01" :error="dForm.errors.amount" />
        <FormField v-model="dForm.is_recurring" label="Frequency" type="select" :error="dForm.errors.is_recurring">
          <option :value="false">One-off</option>
          <option :value="true">Every month</option>
        </FormField>
      </div>
      <FormField
        v-if="!dForm.is_recurring"
        v-model="dForm.effective_month"
        label="Charge in month (blank = next run)"
        type="month"
        :error="dForm.errors.effective_month"
      />
      <template #footer>
        <button class="ui-btn ui-btn--ghost" @click="showDeduction = false">Cancel</button>
        <button class="ui-btn ui-btn--primary" :disabled="dForm.processing" @click="saveDeduction">Save</button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { confirmDialog } from "../../composables/useNotifications";
import { computed, ref } from "vue";
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
  month: { type: String, default: "" },
  monthLabel: { type: String, default: "" },
  run: { type: Object, default: null },
  preview: { type: Object, default: null },
  runs: { type: Object, default: () => ({ data: [] }) },
  deductions: { type: Array, default: () => [] },
  employees: { type: Array, default: () => [] },
});

const flashError = computed(() => page.props.flash?.error || "");
// PayrollService refuses a locked month with a `month` validation error.
const monthError = computed(() => page.props.errors?.month || "");

const columns = [
  { key: "name", label: "Employee" },
  { key: "designation", label: "Designation" },
  { key: "days", label: "Attendance" },
  { key: "earned_basic", label: "Earned Basic" },
  { key: "overtime_amount", label: "Overtime" },
  { key: "deductions_amount", label: "Deductions" },
  { key: "loan_deduction", label: "Loan" },
  { key: "gross", label: "Gross" },
  { key: "net", label: "Net" },
];

const deductionColumns = [
  { key: "employee_name", label: "Employee" },
  { key: "title", label: "Title" },
  { key: "amount", label: "Amount" },
  { key: "is_recurring", label: "Frequency" },
  { key: "effective_month", label: "Month" },
];

const runColumns = [
  { key: "month_label", label: "Month" },
  { key: "status", label: "Status" },
  { key: "payslips_count", label: "Payslips" },
  { key: "total_gross", label: "Gross" },
  { key: "total_deductions", label: "Deductions" },
  { key: "total_net", label: "Net" },
  { key: "paid_at", label: "Paid" },
];

const previewRows = computed(() => props.preview?.rows ?? []);

// A saved run is the source of truth once it exists; before that the live
// preview stands in, and both carry the same per-employee keys.
const sheetRows = computed(() => (props.run ? props.run.payslips : previewRows.value));

const totals = computed(() => {
  if (props.run) {
    return {
      employees: props.run.payslips.length,
      gross: props.run.total_gross,
      deductions: props.run.total_deductions,
      net: props.run.total_net,
    };
  }

  return props.preview?.totals ?? { employees: 0, gross: 0, deductions: 0, net: 0 };
});

const generating = ref(false);

const changeMonth = (value) => {
  if (!value) return;
  router.get("/hr/payroll", { month: value }, { preserveState: false, preserveScroll: true });
};

const generate = async () => {
  if (props.run && !(await confirmDialog("Recompute this draft? Its payslips will be replaced with fresh numbers."))) return;
  generating.value = true;
  router.post(
    "/hr/payroll",
    { month: props.month },
    { preserveScroll: true, onFinish: () => (generating.value = false) }
  );
};

const approve = async () => {
  if (!(await confirmDialog("Approve this payroll? The numbers lock and one-off deductions are consumed."))) return;
  router.put(`/hr/payroll/${props.run.id}/approve`, {}, { preserveScroll: true });
};

const markPaid = async () => {
  if (!(await confirmDialog("Mark this payroll paid? Loan balances will be reduced by the collected installments."))) return;
  router.put(`/hr/payroll/${props.run.id}/paid`, {}, { preserveScroll: true });
};

const destroyRun = async () => {
  if (!(await confirmDialog("Delete this draft run?"))) return;
  router.delete(`/hr/payroll/${props.run.id}`, { preserveScroll: true });
};

const showSlip = ref(false);
const slip = ref(null);
const snap = computed(() => slip.value?.snapshot ?? {});

const openSlip = (row) => {
  slip.value = row;
  showSlip.value = true;
};

const showDeduction = ref(false);
const dBlank = { id: null, user_id: "", title: "", amount: "", is_recurring: false, effective_month: "" };
const dForm = useForm({ ...dBlank });

const openDeduction = (row = null) => {
  Object.assign(dForm, dBlank);

  if (row) {
    Object.assign(dForm, {
      id: row.id,
      user_id: row.user_id,
      title: row.title,
      amount: row.amount,
      is_recurring: row.is_recurring,
      effective_month: row.effective_month ?? "",
    });
  }

  dForm.clearErrors();
  showDeduction.value = true;
};

const saveDeduction = () => {
  const opts = { preserveScroll: true, onSuccess: () => (showDeduction.value = false) };
  if (dForm.id) dForm.put(`/hr/deductions/${dForm.id}`, opts);
  else dForm.post("/hr/deductions", opts);
};

const deleteDeduction = async (id) => {
  if (!(await confirmDialog("Delete this deduction?"))) return;
  router.delete(`/hr/deductions/${id}`, { preserveScroll: true });
};

const money = (v) => `Rs ${Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 0 })}`;
const label = (s) => (s ? String(s).charAt(0).toUpperCase() + String(s).slice(1) : "—");
const statusClass = (s) =>
  ({ draft: "ui-badge--warning", approved: "ui-badge--info", paid: "ui-badge--success" }[s] ?? "ui-badge--muted");
</script>

<style scoped>
.pr__bar {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 20px;
  margin-bottom: 16px;
}

.pr__month {
  max-width: 190px;
}

.pr__state {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pr__label {
  font-weight: 700;
}

.pr__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-left: auto;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 18px;
}

.pr__section {
  margin-top: 28px;
}

.pr__section-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}

.pr__h3 {
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 4px;
}

.pr__h4 {
  font-size: 0.85rem;
  font-weight: 700;
  margin: 0 0 4px;
}

.pr__sub {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin: 0;
}

.pr__name {
  display: flex;
  flex-direction: column;
}

.pr__code {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.pr__days {
  font-size: 0.75rem;
  color: var(--text-soft);
  white-space: nowrap;
}

.pr__days em {
  color: var(--text-muted);
  font-style: normal;
}

.pr__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 16px;
}

.pr__slip-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

.pr__slip-net {
  text-align: right;
}

.pr__slip-net strong {
  display: block;
  font-size: 1.4rem;
}

.pr__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
  margin: 12px 0;
}

.pr__table td {
  padding: 7px 4px;
  border-bottom: 1px solid var(--border);
}

.pr__table td:last-child {
  text-align: right;
}

.pr__row-strong td {
  font-weight: 700;
}

.pr__block {
  margin-top: 14px;
}

.pr__line {
  font-size: 0.82rem;
  color: var(--text-soft);
  margin: 2px 0;
}

@media (max-width: 980px) {
  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .pr__meta {
    margin-left: 0;
  }
  .pr__grid {
    grid-template-columns: 1fr;
  }
}
</style>
