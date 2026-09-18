<template>
  <div class="page">
    <PageHeader title="Promo Codes" subtitle="Codes the cashier types at checkout — the discount is computed server-side.">
      <template #actions>
        <button v-if="can('crm.promo-codes.create')" class="ui-btn ui-btn--primary" @click="openModal">
          + Add Promo Code
        </button>
      </template>
    </PageHeader>

    <div v-if="flashError" class="ui-alert ui-alert--danger">{{ flashError }}</div>

    <div class="stat-grid">
      <StatCard label="Total Codes" :value="props.stats.total" />
      <StatCard label="Active" :value="props.stats.active" color="var(--success)" tint="var(--success-soft)" />
      <StatCard label="Redemptions" :value="props.stats.redemptions" />
      <StatCard
        label="Discount Given"
        :value="money(props.stats.discount_given)"
        color="var(--warning)"
        tint="var(--warning-soft)"
      />
    </div>

    <div class="pc__filters">
      <FormField v-model="status" label="Status" type="select">
        <option value="">All statuses</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        <option value="expired">Expired</option>
      </FormField>
    </div>

    <DataTable
      :columns="columns"
      :rows="rows"
      index
      searchable
      v-model:query="search"
      search-placeholder="Search code or description…"
      empty-text="No promo codes yet."
    >
      <template #cell:code="{ row }">
        <div class="pc__code">
          <strong>{{ row.code }}</strong>
          <span v-if="row.description" class="pc__desc">{{ row.description }}</span>
        </div>
      </template>
      <template #cell:value="{ row }">
        <span>{{ row.type === "percentage" ? `${row.value}%` : money(row.value) }}</span>
        <span v-if="row.max_discount" class="pc__cap">max {{ money(row.max_discount) }}</span>
      </template>
      <template #cell:min_order_amount="{ value }">
        {{ Number(value) > 0 ? money(value) : "—" }}
      </template>
      <template #cell:window="{ row }">
        <span class="pc__window">{{ row.starts_at || "—" }} → {{ row.ends_at || "no end" }}</span>
      </template>
      <template #cell:usage="{ row }">
        <div class="pc__usage">
          <span>{{ row.used_count }}{{ row.usage_limit ? ` / ${row.usage_limit}` : "" }}</span>
          <span v-if="row.usage_limit_per_customer" class="pc__cap">
            {{ row.usage_limit_per_customer }} per customer
          </span>
        </div>
      </template>
      <template #cell:redeemed_total="{ value }">{{ money(value) }}</template>
      <template #cell:state="{ value }">
        <span class="ui-badge" :class="stateClass(value)">{{ label(value) }}</span>
      </template>
      <template #actions="{ row }">
        <button v-if="can('crm.promo-codes.update')" class="ui-btn ui-btn--ghost ui-btn--sm" @click="editRow(row)">
          Edit
        </button>
        <button
          v-if="can('crm.promo-codes.delete')"
          class="ui-btn ui-btn--danger ui-btn--sm"
          @click="deleteRow(row.id)"
        >
          Delete
        </button>
      </template>
    </DataTable>

    <Pagination :paginator="props.promoCodes" :only="['promoCodes']" />

    <Modal v-model="showModal" :title="form.id ? 'Edit Promo Code' : 'Add Promo Code'">
      <div class="pc__grid">
        <FormField v-model="form.code" label="Code" placeholder="e.g. FLAT100" :error="form.errors.code" />
        <FormField v-model="form.is_active" label="Status" type="select" :error="form.errors.is_active">
          <option :value="true">Active</option>
          <option :value="false">Inactive</option>
        </FormField>
      </div>
      <FormField v-model="form.description" label="Description" :error="form.errors.description" />
      <div class="pc__grid">
        <FormField v-model="form.type" label="Type" type="select" :error="form.errors.type">
          <option value="fixed">Fixed amount</option>
          <option value="percentage">Percentage</option>
        </FormField>
        <FormField
          v-model="form.value"
          :label="form.type === 'percentage' ? 'Percentage off' : 'Amount off'"
          type="number"
          step="0.01"
          :error="form.errors.value"
        />
        <FormField
          v-model="form.max_discount"
          label="Max discount (optional)"
          type="number"
          step="0.01"
          :error="form.errors.max_discount"
        />
        <FormField
          v-model="form.min_order_amount"
          label="Min order amount"
          type="number"
          step="0.01"
          :error="form.errors.min_order_amount"
        />
        <FormField v-model="form.starts_at" label="Starts on" type="date" :error="form.errors.starts_at" />
        <FormField v-model="form.ends_at" label="Ends on" type="date" :error="form.errors.ends_at" />
        <FormField
          v-model="form.usage_limit"
          label="Total uses (blank = unlimited)"
          type="number"
          :error="form.errors.usage_limit"
        />
        <FormField
          v-model="form.usage_limit_per_customer"
          label="Uses per customer"
          type="number"
          :error="form.errors.usage_limit_per_customer"
        />
      </div>
      <p v-if="form.usage_limit_per_customer" class="pc__note">
        A per-customer limit needs a customer on the order, so the cashier must pick one before the code applies.
      </p>
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
  promoCodes: { type: Object, default: () => ({ data: [] }) },
  filters: { type: Object, default: () => ({ search: "", status: "" }) },
  stats: { type: Object, default: () => ({ total: 0, active: 0, redemptions: 0, discount_given: 0 }) },
});

const flashError = computed(() => page.props.flash?.error || "");

const columns = [
  { key: "code", label: "Code" },
  { key: "value", label: "Discount", width: "130px" },
  { key: "min_order_amount", label: "Min order" },
  { key: "window", label: "Valid" },
  { key: "usage", label: "Used" },
  { key: "redeemed_total", label: "Given away" },
  { key: "state", label: "State", width: "110px" },
];

const rows = computed(() => props.promoCodes?.data ?? []);

const search = ref(props.filters?.search ?? "");
const status = ref(props.filters?.status ?? "");

let searchTimer = null;
const reload = (debounce) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(
    () =>
      router.get(
        "/crm/promo-codes",
        { search: search.value || undefined, status: status.value || undefined },
        { preserveState: true, preserveScroll: true, replace: true, only: ["promoCodes", "filters", "stats"] }
      ),
    debounce
  );
};
watch(search, () => reload(300));
watch(status, () => reload(0));

const showModal = ref(false);

const blank = {
  id: null,
  code: "",
  description: "",
  type: "fixed",
  value: "",
  max_discount: "",
  min_order_amount: "",
  starts_at: "",
  ends_at: "",
  usage_limit: "",
  usage_limit_per_customer: "",
  is_active: true,
};
const form = useForm({ ...blank });

const openModal = () => {
  Object.assign(form, blank);
  form.clearErrors();
  showModal.value = true;
};

const editRow = (p) => {
  Object.assign(form, {
    id: p.id,
    code: p.code,
    description: p.description ?? "",
    type: p.type,
    value: p.value,
    max_discount: p.max_discount ?? "",
    min_order_amount: p.min_order_amount ?? "",
    starts_at: p.starts_at ?? "",
    ends_at: p.ends_at ?? "",
    usage_limit: p.usage_limit ?? "",
    usage_limit_per_customer: p.usage_limit_per_customer ?? "",
    is_active: p.is_active,
  });
  form.clearErrors();
  showModal.value = true;
};

const save = () => {
  const opts = { preserveScroll: true, onSuccess: () => (showModal.value = false) };

  // Blank number/date inputs must reach the API as null, not "" — `nullable`
  // rules pass, but `numeric`/`date` would reject an empty string.
  form.transform((data) => ({
    ...data,
    max_discount: data.max_discount === "" ? null : data.max_discount,
    min_order_amount: data.min_order_amount === "" ? 0 : data.min_order_amount,
    starts_at: data.starts_at || null,
    ends_at: data.ends_at || null,
    usage_limit: data.usage_limit === "" ? null : data.usage_limit,
    usage_limit_per_customer: data.usage_limit_per_customer === "" ? null : data.usage_limit_per_customer,
  }));

  if (form.id) form.put(`/crm/promo-codes/${form.id}`, opts);
  else form.post("/crm/promo-codes", opts);
};

const deleteRow = async (id) => {
  if (!(await confirmDialog("Delete this promo code?"))) return;
  router.delete(`/crm/promo-codes/${id}`, { preserveScroll: true });
};

const stateClass = (state) =>
  ({
    usable: "ui-badge--success",
    inactive: "ui-badge--muted",
    scheduled: "ui-badge--info",
    expired: "ui-badge--danger",
    exhausted: "ui-badge--warning",
  })[state] ?? "ui-badge--muted";

const money = (v) => `Rs ${Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 0 })}`;
const label = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "—");
</script>

<style scoped>
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 18px;
}

.pc__filters {
  max-width: 220px;
  margin-bottom: 14px;
}

.pc__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 16px;
}

.pc__code {
  display: flex;
  flex-direction: column;
}

.pc__code strong {
  font-family: ui-monospace, "SFMono-Regular", monospace;
  letter-spacing: 0.03em;
}

.pc__desc {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.pc__cap,
.pc__window {
  display: block;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.pc__usage {
  display: flex;
  flex-direction: column;
}

.pc__note {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin: 4px 0 0;
}

@media (max-width: 860px) {
  .stat-grid,
  .pc__grid {
    grid-template-columns: 1fr;
  }
}
</style>
