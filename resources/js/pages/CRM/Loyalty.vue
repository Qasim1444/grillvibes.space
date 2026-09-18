<template>
  <div class="page">
    <PageHeader title="Loyalty Points" subtitle="Points settings and the append-only ledger behind every balance.">
      <template #actions>
        <button v-if="can('crm.loyalty.update')" class="ui-btn ui-btn--ghost" @click="openAdjust">
          Adjust Points
        </button>
        <button v-if="can('crm.loyalty.update')" class="ui-btn ui-btn--primary" @click="runExpiry">
          Run Expiry Sweep
        </button>
      </template>
    </PageHeader>

    <div v-if="flashError" class="ui-alert ui-alert--danger">{{ flashError }}</div>

    <div class="stat-grid">
      <StatCard
        label="Outstanding Points"
        :value="num(props.stats.outstanding)"
        hint="Owed to customers"
        color="var(--warning)"
        tint="var(--warning-soft)"
      />
      <StatCard label="Members with Points" :value="num(props.stats.members)" />
      <StatCard label="Points Earned" :value="num(props.stats.earned)" />
      <StatCard label="Points Redeemed" :value="num(props.stats.redeemed)" />
    </div>

    <div class="ly__split">
      <div class="ui-card ly__settings">
        <h3 class="ly__title">Programme Settings</h3>
        <FormField v-model="sForm.is_active" label="Programme" type="select" :error="sForm.errors.is_active">
          <option :value="true">Running</option>
          <option :value="false">Paused</option>
        </FormField>
        <div class="ly__grid">
          <FormField
            v-model="sForm.points_per_currency"
            label="Points earned per Rs 1"
            type="number"
            step="0.0001"
            :error="sForm.errors.points_per_currency"
          />
          <FormField
            v-model="sForm.currency_per_point"
            label="Rs value of 1 point"
            type="number"
            step="0.0001"
            :error="sForm.errors.currency_per_point"
          />
          <FormField
            v-model="sForm.min_redeem_points"
            label="Minimum points to redeem"
            type="number"
            :error="sForm.errors.min_redeem_points"
          />
          <FormField
            v-model="sForm.max_redeem_percent"
            label="Max % of a bill payable with points"
            type="number"
            :error="sForm.errors.max_redeem_percent"
          />
          <FormField
            v-model="sForm.points_expiry_days"
            label="Points expire after (days, 0 = never)"
            type="number"
            :error="sForm.errors.points_expiry_days"
          />
        </div>
        <p class="ly__note">
          At these rates Rs 1,000 spent earns <strong>{{ num(earnExample) }}</strong> point(s), worth
          <strong>{{ money(worthExample) }}</strong> back.
        </p>
        <button
          v-if="can('crm.loyalty.update')"
          class="ui-btn ui-btn--primary"
          :disabled="sForm.processing"
          @click="saveSettings"
        >
          Save Settings
        </button>
      </div>

      <div class="ui-card ly__top">
        <h3 class="ly__title">Top Balances</h3>
        <table v-if="props.topCustomers.length" class="ly__table">
          <thead>
            <tr>
              <th>Customer</th>
              <th class="ly__right">Points</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in props.topCustomers" :key="c.id">
              <td>
                <strong>{{ c.name }}</strong>
                <span v-if="c.contact" class="ly__meta">{{ c.contact }}</span>
              </td>
              <td class="ly__right">{{ num(c.balance) }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else class="ly__note">No customer holds points yet.</p>
      </div>
    </div>

    <div class="ly__filters">
      <FormField v-model="type" label="Entry type" type="select">
        <option value="">All entries</option>
        <option v-for="t in props.types" :key="t" :value="t">{{ label(t) }}</option>
      </FormField>
    </div>

    <DataTable
      :columns="columns"
      :rows="rows"
      index
      searchable
      v-model:query="search"
      search-placeholder="Search customer, order or note…"
      empty-text="The ledger is empty."
    >
      <template #cell:customer_name="{ row }">
        <strong>{{ row.customer_name ?? "—" }}</strong>
      </template>
      <template #cell:type="{ value }">
        <span class="ui-badge" :class="typeClass(value)">{{ label(value) }}</span>
      </template>
      <template #cell:points="{ value }">
        <strong :class="Number(value) < 0 ? 'ly__neg' : 'ly__pos'">
          {{ Number(value) > 0 ? "+" : "" }}{{ num(value) }}
        </strong>
      </template>
      <template #cell:balance_after="{ value }">{{ num(value) }}</template>
      <template #cell:order_id="{ value }">
        {{ value ? `#${value}` : "—" }}
      </template>
      <template #cell:note="{ row }">
        <span class="ly__wrap">{{ row.note || "—" }}</span>
        <span v-if="row.created_by_name" class="ly__meta">by {{ row.created_by_name }}</span>
      </template>
      <template #cell:expires_at="{ value }">{{ value || "—" }}</template>
    </DataTable>

    <Pagination :paginator="props.ledger" :only="['ledger']" />

    <Modal v-model="showAdjust" title="Adjust Points">
      <CustomerPicker v-model="aForm.customer_id" label="Customer" :error="aForm.errors.customer_id" />
      <FormField
        v-model="aForm.points"
        label="Points (negative to deduct)"
        type="number"
        :error="aForm.errors.points"
      />
      <FormField v-model="aForm.note" label="Reason" :error="aForm.errors.note" />
      <p class="ly__note">
        The ledger is never edited — a correction is its own entry, so the history of what was awarded stays intact.
      </p>
      <template #footer>
        <button class="ui-btn ui-btn--ghost" @click="showAdjust = false">Cancel</button>
        <button class="ui-btn ui-btn--primary" :disabled="aForm.processing" @click="submitAdjust">Save</button>
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
import CustomerPicker from "../../components/ui/CustomerPicker.vue";
import { usePermissions } from "../../composables/usePermissions";

defineOptions({ layout: AdminLayout });

const { can } = usePermissions();
const page = usePage();

const props = defineProps({
  settings: { type: Object, default: () => ({}) },
  ledger: { type: Object, default: () => ({ data: [] }) },
  filters: { type: Object, default: () => ({ search: "", type: "" }) },
  types: { type: Array, default: () => [] },
  stats: { type: Object, default: () => ({ outstanding: 0, members: 0, earned: 0, redeemed: 0 }) },
  topCustomers: { type: Array, default: () => [] },
});

const flashError = computed(() => page.props.flash?.error || "");

const columns = [
  { key: "customer_name", label: "Customer" },
  { key: "type", label: "Entry", width: "100px" },
  { key: "points", label: "Points", width: "100px" },
  { key: "balance_after", label: "Balance", width: "100px" },
  { key: "order_id", label: "Order", width: "80px" },
  { key: "note", label: "Note" },
  { key: "expires_at", label: "Expires" },
  { key: "created_at", label: "When" },
];

const rows = computed(() => props.ledger?.data ?? []);

const search = ref(props.filters?.search ?? "");
const type = ref(props.filters?.type ?? "");

let searchTimer = null;
const reload = (debounce) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(
    () =>
      router.get(
        "/crm/loyalty",
        { search: search.value || undefined, type: type.value || undefined },
        { preserveState: true, preserveScroll: true, replace: true, only: ["ledger", "filters", "stats"] }
      ),
    debounce
  );
};
watch(search, () => reload(300));
watch(type, () => reload(0));

const sForm = useForm({
  is_active: props.settings.is_active ?? true,
  points_per_currency: props.settings.points_per_currency ?? 1,
  currency_per_point: props.settings.currency_per_point ?? 1,
  min_redeem_points: props.settings.min_redeem_points ?? 100,
  max_redeem_percent: props.settings.max_redeem_percent ?? 50,
  points_expiry_days: props.settings.points_expiry_days ?? 0,
});

const earnExample = computed(() => Math.floor(1000 * (Number(sForm.points_per_currency) || 0)));
const worthExample = computed(() => earnExample.value * (Number(sForm.currency_per_point) || 0));

const saveSettings = () => {
  sForm.put("/crm/loyalty/settings", { preserveScroll: true });
};

const showAdjust = ref(false);
const aForm = useForm({ customer_id: null, points: "", note: "" });

const openAdjust = () => {
  aForm.reset();
  aForm.clearErrors();
  showAdjust.value = true;
};

const submitAdjust = () => {
  aForm.post("/crm/loyalty/adjust", {
    preserveScroll: true,
    onSuccess: () => (showAdjust.value = false),
  });
};

const runExpiry = async () => {
  if (!(await confirmDialog("Write off every point past its expiry date?"))) return;
  router.post("/crm/loyalty/expire", {}, { preserveScroll: true });
};

const typeClass = (t) =>
  ({
    earn: "ui-badge--success",
    redeem: "ui-badge--info",
    adjust: "ui-badge--warning",
    expire: "ui-badge--danger",
  })[t] ?? "ui-badge--muted";

const num = (v) => Number(v || 0).toLocaleString();
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

.ly__split {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 16px;
  margin-bottom: 18px;
}

.ly__settings,
.ly__top {
  padding: 18px;
}

.ly__title {
  margin: 0 0 14px;
  font-size: 0.95rem;
  color: var(--text);
}

.ly__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 16px;
}

.ly__filters {
  max-width: 220px;
  margin-bottom: 14px;
}

.ly__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.ly__table th,
.ly__table td {
  text-align: left;
  padding: 8px 6px;
  border-bottom: 1px solid var(--border);
}

.ly__right {
  text-align: right;
}

.ly__meta {
  display: block;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.ly__wrap {
  display: block;
  max-width: 260px;
}

.ly__pos {
  color: var(--success);
}

.ly__neg {
  color: var(--danger);
}

.ly__note {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin: 4px 0 12px;
}

@media (max-width: 1100px) {
  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .ly__split {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 860px) {
  .stat-grid,
  .ly__grid {
    grid-template-columns: 1fr;
  }
}
</style>
