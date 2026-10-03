<template>
  <div class="page">
    <PageHeader title="Riders" subtitle="Manage delivery riders and assign delivery orders.">
      <template #actions>
        <button v-if="can('riders.create')" class="ui-btn ui-btn--primary" @click="openCreate">+ Add Rider</button>
      </template>
    </PageHeader>

    <div v-if="!hasRiderRole" class="ui-alert ui-alert--warning">
      Rider role will be created automatically when you add the first rider.
    </div>

    <DataTable
      :columns="riderColumns"
      :rows="riders"
      index
      searchable
      v-model:query="search"
      search-placeholder="Search riders..."
      empty-text="No riders found."
    >
      <template #cell:is_available="{ value }">
        <span class="ui-badge" :class="value ? 'ui-badge--success' : 'ui-badge--muted'">
          {{ value ? "Available" : "Unavailable" }}
        </span>
      </template>
      <template #cell:vehicle="{ row }">
        <span>{{ [row.vehicle_type, row.vehicle_number].filter(Boolean).join(" · ") || "—" }}</span>
      </template>
      <template #cell:last_location_at="{ value, row }">
        <span v-if="row.last_lat && row.last_lng">{{ formatDate(value) }}</span>
        <span v-else>—</span>
      </template>
      <template #cell:today_earning_total="{ value, row }">
        <div class="riders-money">
          <strong>{{ money(value) }}</strong>
          <small>{{ row.today_delivered_count || 0 }} today</small>
        </div>
      </template>
      <template #cell:earning_total="{ value, row }">
        <div class="riders-money">
          <strong>{{ money(value) }}</strong>
          <small>{{ money(row.delivered_sales_total) }} sales</small>
        </div>
      </template>
      <template #actions="{ row }">
        <button v-if="can('riders.update')" class="ui-btn ui-btn--ghost ui-btn--sm" @click="editRider(row)">Edit</button>
        <button v-if="can('riders.delete')" class="ui-btn ui-btn--danger ui-btn--sm" @click="deleteRider(row)">Delete</button>
      </template>
    </DataTable>

    <Pagination :paginator="props.riders" :only="['riders']" />

    <section class="riders-section">
      <div class="riders-section__head">
        <div>
          <h2>Delivery Orders</h2>
          <p>Assign these orders to riders so they appear in the rider app.</p>
        </div>
        <button class="ui-btn ui-btn--ghost" @click="refresh">Refresh</button>
      </div>

      <DataTable
        :columns="orderColumns"
        :rows="deliveryOrders"
        index
        empty-text="No active delivery orders found."
      >
        <template #cell:customer="{ row }">
          <div class="riders-customer">
            <strong>{{ row.customer?.name || "Guest" }}</strong>
            <span>{{ row.customer?.contact || "No phone" }}</span>
            <small>{{ row.customer?.address || "No address" }}</small>
          </div>
        </template>
        <template #cell:delivery_status="{ value }">
          <span class="ui-badge" :class="deliveryStatusClass(value)">{{ deliveryStatusLabel(value) }}</span>
        </template>
        <template #cell:rider="{ row }">
          <span v-if="row.rider">{{ row.rider.name }}</span>
          <span v-else class="muted">Unassigned</span>
        </template>
        <template #cell:grand_total="{ value }">{{ money(value) }}</template>
        <template #cell:order_datetime="{ value }">{{ formatDate(value) }}</template>
        <template #actions="{ row }">
          <button v-if="can('riders.update')" class="ui-btn ui-btn--secondary ui-btn--sm" @click="openAssign(row)">
            Assign
          </button>
          <button
            v-if="can('riders.update') && row.rider_id"
            class="ui-btn ui-btn--ghost ui-btn--sm"
            @click="unassign(row)"
          >
            Unassign
          </button>
        </template>
      </DataTable>
    </section>

    <Modal v-model="showRiderModal" :title="form.id ? 'Edit Rider' : 'Add Rider'">
      <FormField v-model="form.name" label="Name" placeholder="Rider name" :error="form.errors.name" />
      <FormField v-model="form.email" label="Email" type="email" placeholder="rider@example.com" :error="form.errors.email" />
      <FormField v-model="form.phone" label="Phone" placeholder="Phone" :error="form.errors.phone" />
      <FormField v-model="form.address" label="Address" type="textarea" placeholder="Address" :error="form.errors.address" />
      <FormField
        v-model="form.password"
        :label="form.id ? 'New Password (leave blank to keep current)' : 'Password'"
        type="password"
        placeholder="Password"
        :error="form.errors.password"
      />
      <div class="riders-grid">
        <FormField v-model="form.vehicle_type" label="Vehicle Type" placeholder="Bike, Car..." :error="form.errors.vehicle_type" />
        <FormField v-model="form.vehicle_number" label="Vehicle Number" placeholder="LEA-1234" :error="form.errors.vehicle_number" />
      </div>
      <FormField v-model="form.is_available" label="Availability" type="select" :error="form.errors.is_available">
        <option :value="true">Available</option>
        <option :value="false">Unavailable</option>
      </FormField>

      <template #footer>
        <button class="ui-btn ui-btn--ghost" @click="showRiderModal = false">Cancel</button>
        <button class="ui-btn ui-btn--primary" :disabled="form.processing" @click="saveRider">Save</button>
      </template>
    </Modal>

    <Modal v-model="showAssignModal" :title="`Assign Order #${assignForm.order_id || ''}`">
      <div v-if="assigningOrder" class="assign-card">
        <strong>{{ assigningOrder.customer?.name || "Guest" }}</strong>
        <span>{{ assigningOrder.customer?.address || "No address" }}</span>
        <small>{{ money(assigningOrder.grand_total) }} · {{ deliveryStatusLabel(assigningOrder.delivery_status) }}</small>
      </div>

      <FormField v-model="assignForm.rider_id" label="Rider" type="select" :error="assignForm.errors.rider_id">
        <option value="">Unassigned</option>
        <option v-for="r in availableRiders" :key="r.id" :value="r.id">
          {{ r.name }}{{ r.vehicle_number ? ` · ${r.vehicle_number}` : "" }}
        </option>
      </FormField>

      <template #footer>
        <button class="ui-btn ui-btn--ghost" @click="showAssignModal = false">Cancel</button>
        <button class="ui-btn ui-btn--primary" :disabled="assignForm.processing" @click="saveAssignment">Save Assignment</button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { router, useForm } from "@inertiajs/vue3";
import { confirmDialog } from "../composables/useNotifications";
import AdminLayout from "../layouts/AdminLayout.vue";
import PageHeader from "../components/ui/PageHeader.vue";
import DataTable from "../components/ui/DataTable.vue";
import Pagination from "../components/ui/Pagination.vue";
import Modal from "../components/ui/Modal.vue";
import FormField from "../components/ui/FormField.vue";
import { usePermissions } from "../composables/usePermissions";

defineOptions({ layout: AdminLayout });

const props = defineProps({
  riders: { type: Object, default: () => ({ data: [] }) },
  deliveryOrders: { type: Array, default: () => [] },
  deliveryStatuses: { type: Array, default: () => [] },
  filters: { type: Object, default: () => ({ search: "" }) },
  hasRiderRole: { type: Boolean, default: true },
});

const { can } = usePermissions();

const riderColumns = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "vehicle", label: "Vehicle" },
  { key: "is_available", label: "Availability" },
  { key: "active_deliveries_count", label: "Active" },
  { key: "delivered_count", label: "Delivered" },
  { key: "today_earning_total", label: "Today Earned" },
  { key: "earning_total", label: "Total Earned" },
  { key: "last_location_at", label: "Last Location" },
];

const orderColumns = [
  { key: "id", label: "Order", width: "80px" },
  { key: "customer", label: "Customer" },
  { key: "delivery_status", label: "Delivery" },
  { key: "rider", label: "Rider" },
  { key: "grand_total", label: "Total" },
  { key: "order_datetime", label: "Placed" },
];

const riders = computed(() => props.riders?.data ?? []);
const deliveryOrders = computed(() => props.deliveryOrders ?? []);
const availableRiders = computed(() => riders.value.filter((r) => r.is_available));

const search = ref(props.filters?.search ?? "");
let searchTimer = null;
watch(search, (value) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    router.get(
      "/riders",
      { search: value || undefined },
      { preserveState: true, preserveScroll: true, replace: true, only: ["riders", "filters"] }
    );
  }, 300);
});

const showRiderModal = ref(false);
const form = useForm({
  id: null,
  name: "",
  email: "",
  phone: "",
  address: "",
  password: "",
  vehicle_type: "",
  vehicle_number: "",
  is_available: true,
});

const openCreate = () => {
  form.reset();
  form.clearErrors();
  form.id = null;
  form.is_available = true;
  showRiderModal.value = true;
};

const editRider = (rider) => {
  form.id = rider.id;
  form.name = rider.name || "";
  form.email = rider.email || "";
  form.phone = rider.phone || "";
  form.address = rider.address || "";
  form.password = "";
  form.vehicle_type = rider.vehicle_type || "";
  form.vehicle_number = rider.vehicle_number || "";
  form.is_available = !!rider.is_available;
  form.clearErrors();
  showRiderModal.value = true;
};

const saveRider = () => {
  const options = { preserveScroll: true, onSuccess: () => (showRiderModal.value = false) };
  if (form.id) form.put(`/riders/${form.id}`, options);
  else form.post("/riders", options);
};

const deleteRider = async (rider) => {
  if (!(await confirmDialog(`Delete rider ${rider.name}?`))) return;
  router.delete(`/riders/${rider.id}`, { preserveScroll: true });
};

const showAssignModal = ref(false);
const assigningOrder = ref(null);
const assignForm = useForm({ order_id: null, rider_id: "" });

const openAssign = (order) => {
  assigningOrder.value = order;
  assignForm.order_id = order.id;
  assignForm.rider_id = order.rider_id || "";
  assignForm.clearErrors();
  showAssignModal.value = true;
};

const saveAssignment = () => {
  assignForm.post(`/riders/orders/${assignForm.order_id}/assign`, {
    preserveScroll: true,
    onSuccess: () => (showAssignModal.value = false),
  });
};

const unassign = async (order) => {
  if (!(await confirmDialog(`Unassign order #${order.id}?`))) return;
  router.post(`/riders/orders/${order.id}/assign`, { rider_id: null }, { preserveScroll: true });
};

const refresh = () => router.reload({ only: ["riders", "deliveryOrders"] });

const money = (v) => `Rs ${Number(v || 0).toFixed(2)}`;
const formatDate = (v) => (v ? new Date(v).toLocaleString() : "—");

const deliveryStatusLabel = (value) =>
  String(value || "unassigned")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());

const deliveryStatusClass = (value) => {
  if (value === "delivered") return "ui-badge--success";
  if (["assigned", "accepted", "picked_up", "on_way"].includes(value)) return "ui-badge--info";
  if (["rejected", "failed", "cancelled"].includes(value)) return "ui-badge--danger";
  return "ui-badge--muted";
};
</script>

<style scoped>
.riders-section {
  margin-top: 24px;
}

.riders-section__head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}

.riders-section__head h2 {
  margin: 0;
  font-size: 1.1rem;
}

.riders-section__head p {
  margin: 4px 0 0;
  color: var(--text-soft);
  font-size: 0.875rem;
}

.riders-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 14px;
}

.riders-customer {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.riders-customer span,
.riders-customer small,
.muted {
  color: var(--text-soft);
}

.riders-money {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.riders-money small {
  color: var(--text-soft);
}

.assign-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  margin-bottom: 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface-2);
}

.assign-card span,
.assign-card small {
  color: var(--text-soft);
}

@media (max-width: 720px) {
  .riders-section__head,
  .riders-grid {
    grid-template-columns: 1fr;
    display: grid;
  }
}
</style>
