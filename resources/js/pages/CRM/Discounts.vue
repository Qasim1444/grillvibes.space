<template>
  <div class="page">
    <PageHeader
      title="Discount Campaigns"
      subtitle="Standing offers that need no code. The POS shows the highest-priority live campaign as a suggestion."
    >
      <template #actions>
        <button v-if="can('crm.discounts.create')" class="ui-btn ui-btn--primary" @click="openModal">
          + Add Campaign
        </button>
      </template>
    </PageHeader>

    <div v-if="flashError" class="ui-alert ui-alert--danger">{{ flashError }}</div>

    <div class="stat-grid">
      <StatCard label="Campaigns" :value="props.stats.total" />
      <StatCard label="Live Now" :value="props.stats.live" color="var(--success)" tint="var(--success-soft)" />
      <StatCard label="Switched Off" :value="props.stats.inactive" />
    </div>

    <div class="dc__filters">
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
      search-placeholder="Search campaign name…"
      empty-text="No campaigns yet."
    >
      <template #cell:name="{ row }">
        <div class="dc__name">
          <strong>{{ row.name }}</strong>
          <span class="dc__meta">priority {{ row.priority }}</span>
        </div>
      </template>
      <template #cell:value="{ row }">
        <span>{{ row.type === "percentage" ? `${row.value}%` : money(row.value) }}</span>
        <span v-if="row.max_discount" class="dc__meta">max {{ money(row.max_discount) }}</span>
      </template>
      <template #cell:min_order_amount="{ value }">
        {{ Number(value) > 0 ? money(value) : "—" }}
      </template>
      <template #cell:scope="{ row }">
        <div class="dc__scope">
          <span class="ui-badge ui-badge--muted">{{ scopeLabel(row.applies_to) }}</span>
          <span v-if="row.target_labels.length" class="dc__meta">{{ row.target_labels.join(", ") }}</span>
        </div>
      </template>
      <template #cell:order_types="{ value }">
        {{ value.length ? value.map(label).join(", ") : "All types" }}
      </template>
      <template #cell:window="{ row }">
        <span class="dc__meta">{{ row.starts_at || "—" }} → {{ row.ends_at || "no end" }}</span>
      </template>
      <template #cell:is_live="{ row }">
        <span class="ui-badge" :class="row.is_live ? 'ui-badge--success' : 'ui-badge--muted'">
          {{ row.is_live ? "Live" : row.is_active ? "Out of window" : "Off" }}
        </span>
      </template>
      <template #actions="{ row }">
        <button v-if="can('crm.discounts.update')" class="ui-btn ui-btn--ghost ui-btn--sm" @click="editRow(row)">
          Edit
        </button>
        <button v-if="can('crm.discounts.delete')" class="ui-btn ui-btn--danger ui-btn--sm" @click="deleteRow(row.id)">
          Delete
        </button>
      </template>
    </DataTable>

    <Pagination :paginator="props.campaigns" :only="['campaigns']" />

    <Modal v-model="showModal" :title="form.id ? 'Edit Campaign' : 'Add Campaign'" width="640px">
      <div class="dc__grid">
        <FormField v-model="form.name" label="Name" placeholder="e.g. Weekend 10% off" :error="form.errors.name" />
        <FormField v-model="form.is_active" label="Status" type="select" :error="form.errors.is_active">
          <option :value="true">Active</option>
          <option :value="false">Inactive</option>
        </FormField>
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
          v-model="form.priority"
          label="Priority (higher wins)"
          type="number"
          :error="form.errors.priority"
        />
        <FormField
          :model-value="form.applies_to"
          label="Applies to"
          type="select"
          :error="form.errors.applies_to"
          @update:model-value="changeScope"
        >
          <option value="all">Whole order</option>
          <option value="category">Selected categories</option>
          <option value="item">Selected items</option>
        </FormField>
      </div>

      <div v-if="form.applies_to !== 'all'" class="dc__picker">
        <span class="ui-label">{{ form.applies_to === "category" ? "Categories" : "Food items" }}</span>
        <div class="dc__chips">
          <label v-for="t in targets" :key="t.id" class="dc__chip" :class="{ 'dc__chip--on': isTarget(t.id) }">
            <input type="checkbox" :checked="isTarget(t.id)" @change="toggleTarget(t.id)" />
            {{ t.name }}
          </label>
        </div>
        <p v-if="form.errors.target_ids" class="ui-field__error">{{ form.errors.target_ids }}</p>
      </div>

      <div class="dc__picker">
        <span class="ui-label">Order types (none ticked = all)</span>
        <div class="dc__chips">
          <label
            v-for="t in props.orderTypes"
            :key="t"
            class="dc__chip"
            :class="{ 'dc__chip--on': form.order_types.includes(t) }"
          >
            <input type="checkbox" :checked="form.order_types.includes(t)" @change="toggleOrderType(t)" />
            {{ label(t) }}
          </label>
        </div>
        <p v-if="form.errors.order_types" class="ui-field__error">{{ form.errors.order_types }}</p>
      </div>

      <p class="dc__note">
        A campaign never rewrites a bill on its own — the cashier confirms it in POS, so the order's discount stays
        an explicit decision.
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
  campaigns: { type: Object, default: () => ({ data: [] }) },
  filters: { type: Object, default: () => ({ search: "", status: "" }) },
  orderTypes: { type: Array, default: () => [] },
  categories: { type: Array, default: () => [] },
  foodItems: { type: Array, default: () => [] },
  stats: { type: Object, default: () => ({ total: 0, live: 0, inactive: 0 }) },
});

const flashError = computed(() => page.props.flash?.error || "");

const columns = [
  { key: "name", label: "Campaign" },
  { key: "value", label: "Discount", width: "130px" },
  { key: "min_order_amount", label: "Min order" },
  { key: "scope", label: "Scope" },
  { key: "order_types", label: "Order types" },
  { key: "window", label: "Valid" },
  { key: "is_live", label: "State", width: "120px" },
];

const rows = computed(() => props.campaigns?.data ?? []);

const search = ref(props.filters?.search ?? "");
const status = ref(props.filters?.status ?? "");

let searchTimer = null;
const reload = (debounce) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(
    () =>
      router.get(
        "/crm/discounts",
        { search: search.value || undefined, status: status.value || undefined },
        { preserveState: true, preserveScroll: true, replace: true, only: ["campaigns", "filters", "stats"] }
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
  type: "percentage",
  value: "",
  max_discount: "",
  min_order_amount: "",
  applies_to: "all",
  target_ids: [],
  order_types: [],
  starts_at: "",
  ends_at: "",
  priority: 0,
  is_active: true,
};
const form = useForm({ ...blank });

const targets = computed(() => (form.applies_to === "category" ? props.categories : props.foodItems));

// Handled here rather than in a watcher: a watcher would flush *after*
// `editRow` seeds `target_ids` and wipe the row it just loaded.
const changeScope = (value) => {
  form.applies_to = value;
  form.target_ids = [];
};

const isTarget = (id) => form.target_ids.includes(id);

const toggleTarget = (id) => {
  form.target_ids = isTarget(id) ? form.target_ids.filter((t) => t !== id) : [...form.target_ids, id];
};

const toggleOrderType = (type) => {
  form.order_types = form.order_types.includes(type)
    ? form.order_types.filter((t) => t !== type)
    : [...form.order_types, type];
};

const openModal = () => {
  Object.assign(form, { ...blank, target_ids: [], order_types: [] });
  form.clearErrors();
  showModal.value = true;
};

const editRow = (c) => {
  Object.assign(form, {
    id: c.id,
    name: c.name,
    type: c.type,
    value: c.value,
    max_discount: c.max_discount ?? "",
    min_order_amount: c.min_order_amount ?? "",
    applies_to: c.applies_to,
    target_ids: [...(c.target_ids ?? [])],
    order_types: [...(c.order_types ?? [])],
    starts_at: c.starts_at ?? "",
    ends_at: c.ends_at ?? "",
    priority: c.priority,
    is_active: c.is_active,
  });
  form.clearErrors();
  showModal.value = true;
};

const save = () => {
  const opts = { preserveScroll: true, onSuccess: () => (showModal.value = false) };

  form.transform((data) => ({
    ...data,
    max_discount: data.max_discount === "" ? null : data.max_discount,
    min_order_amount: data.min_order_amount === "" ? 0 : data.min_order_amount,
    starts_at: data.starts_at || null,
    ends_at: data.ends_at || null,
    priority: data.priority === "" ? 0 : data.priority,
  }));

  if (form.id) form.put(`/crm/discounts/${form.id}`, opts);
  else form.post("/crm/discounts", opts);
};

const deleteRow = async (id) => {
  if (!(await confirmDialog("Delete this campaign?"))) return;
  router.delete(`/crm/discounts/${id}`, { preserveScroll: true });
};

const scopeLabel = (s) => ({ all: "Whole order", category: "Categories", item: "Items" })[s] ?? s;
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

.dc__filters {
  max-width: 220px;
  margin-bottom: 14px;
}

.dc__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 16px;
}

.dc__name,
.dc__scope,
.dc__usage {
  display: flex;
  flex-direction: column;
}

.dc__meta {
  display: block;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.dc__picker {
  margin-bottom: 14px;
}

.dc__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 6px;
}

.dc__chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border: 1px solid var(--border-strong);
  border-radius: 999px;
  font-size: 0.8rem;
  color: var(--text-soft);
  cursor: pointer;
}

.dc__chip--on {
  border-color: var(--brand);
  color: var(--brand);
  background: var(--surface-2);
}

.dc__note {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin: 4px 0 0;
}

@media (max-width: 860px) {
  .stat-grid,
  .dc__grid {
    grid-template-columns: 1fr;
  }
}
</style>
