<template>
  <div class="page">
    <PageHeader title="Floor Plan" subtitle="Drag tables to set their positions. Click a table to change its status or add one.">
      <template #actions>
        <select v-model="selectedBranch" class="ui-input" style="width:180px" @change="reloadBranch">
          <option value="">All Branches</option>
          <option v-for="b in props.branches" :key="b.id" :value="b.id">{{ b.name }}</option>
        </select>
        <button class="ui-btn ui-btn--ghost" @click="saveLayout" :disabled="saving">
          {{ saving ? 'Saving…' : '💾 Save Layout' }}
        </button>
        <button v-if="can('reservations.update')" class="ui-btn ui-btn--primary" @click="openAddTable">+ Add Table</button>
      </template>
    </PageHeader>

    <!-- Legend -->
    <div class="fp__legend">
      <span v-for="(color, status) in statusColors" :key="status" class="fp__legend-item">
        <span class="fp__legend-dot" :style="{ background: color }" />{{ status }}
      </span>
    </div>

    <!-- Canvas -->
    <div
      class="fp__canvas"
      ref="canvas"
      @mouseup="stopDrag"
      @mousemove="onDrag"
      @touchend="stopDrag"
      @touchmove.prevent="onTouchMove"
    >
      <!-- Today's reservations overlay header -->
      <div v-if="props.todayReservations.length" class="fp__reservations-strip">
        <span class="fp__strip-label">Today's reservations:</span>
        <span v-for="r in props.todayReservations" :key="r.id" class="fp__res-chip">
          {{ fmtTime(r.reserved_at) }} — {{ r.guest_name }} ({{ r.party_size }})
          <span class="ui-badge ui-badge--info" style="margin-left:4px">{{ r.status }}</span>
        </span>
      </div>

      <!-- Tables -->
      <div
        v-for="table in tables"
        :key="table.id"
        class="fp__table"
        :class="['fp__table--' + table.shape, 'fp__table--' + table.status, { 'fp__table--dragging': dragging?.id === table.id }]"
        :style="tableStyle(table)"
        @mousedown.prevent="startDrag(table, $event)"
        @touchstart.prevent="startTouchDrag(table, $event)"
        @click.stop="selectTable(table)"
      >
        <span class="fp__table-num">{{ table.table_number }}</span>
        <span class="fp__table-cap">{{ table.capacity }}p</span>
        <span v-if="table.current_order_type" class="fp__table-order">{{ typeEmoji(table.current_order_type) }}</span>
      </div>
    </div>

    <!-- Table detail drawer -->
    <div v-if="selected" class="fp__drawer">
      <div class="fp__drawer-hdr">
        <span>Table {{ selected.table_number }}</span>
        <button class="fp__drawer-close" @click="selected = null">✕</button>
      </div>
      <div class="fp__drawer-body">
        <p><strong>Capacity:</strong> {{ selected.capacity }}</p>
        <p><strong>Status:</strong>
          <select v-model="selected.status" class="ui-input" style="width:140px;margin-left:8px"
            @change="updateStatus(selected)">
            <option v-for="s in props.tableStatuses" :key="s" :value="s">{{ s }}</option>
          </select>
        </p>
        <p v-if="selected.current_order_type"><strong>Order:</strong> {{ typeLabel(selected.current_order_type) }}</p>
        <div class="fp__drawer-actions">
          <button class="ui-btn ui-btn--ghost ui-btn--sm" @click="openEditTable(selected)">Edit Table</button>
          <button class="ui-btn ui-btn--danger ui-btn--sm" @click="deleteTable(selected.id)">Delete</button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Table Modal -->
    <Modal v-model="showTableModal" :title="tableForm.id ? 'Edit Table' : 'Add Table'" width="460px">
      <div class="form-grid-2">
        <FormField v-model="tableForm.table_number" label="Table Number *" placeholder="T-1" :error="tableForm.errors.table_number" />
        <FormField v-model.number="tableForm.capacity" label="Capacity *" type="number" min="1" :error="tableForm.errors.capacity" />
        <FormField v-model="tableForm.shape" label="Shape" type="select" :error="tableForm.errors.shape">
          <option v-for="s in props.tableShapes" :key="s" :value="s">{{ s }}</option>
        </FormField>
        <FormField v-model="tableForm.branch_id" label="Branch *" type="select" :error="tableForm.errors.branch_id">
          <option value="">Select branch</option>
          <option v-for="b in props.branches" :key="b.id" :value="b.id">{{ b.name }}</option>
        </FormField>
        <FormField v-if="tableForm.id" v-model="tableForm.status" label="Status" type="select" :error="tableForm.errors.status">
          <option v-for="s in props.tableStatuses" :key="s" :value="s">{{ s }}</option>
        </FormField>
      </div>
      <template #footer>
        <button class="ui-btn ui-btn--ghost" @click="showTableModal = false">Cancel</button>
        <button class="ui-btn ui-btn--primary" :disabled="tableForm.processing" @click="saveTable">Save</button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { confirmDialog } from "../../composables/useNotifications";
import { ref, computed, watch } from 'vue';
import { router, useForm } from '@inertiajs/vue3';
import AdminLayout from '../../layouts/AdminLayout.vue';
import PageHeader from '../../components/ui/PageHeader.vue';
import Modal from '../../components/ui/Modal.vue';
import FormField from '../../components/ui/FormField.vue';
import { usePermissions } from '../../composables/usePermissions';

defineOptions({ layout: AdminLayout });
const { can } = usePermissions();

const props = defineProps({
  tables:            { type: Array,  default: () => [] },
  todayReservations: { type: Array,  default: () => [] },
  branches:          { type: Array,  default: () => [] },
  tableStatuses:     { type: Array,  default: () => [] },
  tableShapes:       { type: Array,  default: () => [] },
  selectedBranchId:  { type: Number, default: null },
});

const tables      = ref(props.tables.map(t => ({ ...t })));
const selected    = ref(null);

// After an add/edit/delete the controller redirects back and Inertia swaps in
// fresh `tables` props, but this local copy would keep showing the old list
// until a full page reload. Re-sync on every prop change, keeping any
// un-saved drag position for tables that are still on the canvas.
watch(() => props.tables, (next) => {
  const localById = new Map(tables.value.map(t => [t.id, t]));
  tables.value = next.map(t => {
    const local = localById.get(t.id);
    return local ? { ...t, pos_x: local.pos_x, pos_y: local.pos_y } : { ...t };
  });
  if (selected.value) {
    selected.value = tables.value.find(t => t.id === selected.value.id) ?? null;
  }
});
const saving      = ref(false);
const selectedBranch = ref(props.selectedBranchId ?? '');

const statusColors = {
  available: '#10b981', occupied: '#ef4444',
  reserved: '#f59e0b', cleaning: '#6366f1',
};

const tableStyle = t => ({
  left: t.pos_x + 'px',
  top:  t.pos_y + 'px',
  '--table-color': statusColors[t.status] ?? '#6366f1',
});

// ── Drag ─────────────────────────────────────────────────────────────────
const dragging = ref(null);
const canvas   = ref(null);
let   dragOffset = { x: 0, y: 0 };

const startDrag = (table, e) => {
  dragging.value = table;
  const rect = e.currentTarget.getBoundingClientRect();
  dragOffset = { x: e.clientX - rect.left, y: e.clientY - rect.top };
};

const startTouchDrag = (table, e) => {
  const touch = e.touches[0];
  dragging.value = table;
  const rect = e.currentTarget.getBoundingClientRect();
  dragOffset = { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
};

const onDrag = e => {
  if (!dragging.value || !canvas.value) return;
  const canvasRect = canvas.value.getBoundingClientRect();
  dragging.value.pos_x = Math.max(0, e.clientX - canvasRect.left - dragOffset.x);
  dragging.value.pos_y = Math.max(0, e.clientY - canvasRect.top  - dragOffset.y);
};

const onTouchMove = e => {
  const touch = e.touches[0];
  onDrag({ clientX: touch.clientX, clientY: touch.clientY });
};

const stopDrag = () => { dragging.value = null; };

// ── Select / status ───────────────────────────────────────────────────────
const selectTable = t => {
  if (dragging.value) return;
  selected.value = t;
};

const updateStatus = async t => {
  await fetch(`/reservations/tables/${t.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content ?? '', 'X-Requested-With': 'XMLHttpRequest' },
    body: JSON.stringify({ status: t.status, table_number: t.table_number, capacity: t.capacity, shape: t.shape }),
    credentials: 'same-origin',
  });
};

// ── Save layout ───────────────────────────────────────────────────────────
const saveLayout = async () => {
  saving.value = true;
  try {
    await fetch('/reservations/floor-plan/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content ?? '', 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify({ tables: tables.value.map(t => ({ id: t.id, pos_x: Math.round(t.pos_x), pos_y: Math.round(t.pos_y) })) }),
      credentials: 'same-origin',
    });
  } finally { saving.value = false; }
};

// ── Table CRUD ────────────────────────────────────────────────────────────
const showTableModal = ref(false);
const tableForm = useForm({ id: null, branch_id: '', table_number: '', capacity: 4, shape: 'rectangle', status: 'available' });

// A table with no branch drops out of every branch-filtered view, so fall back to
// the branch being filtered on — or the only branch, when there is just one.
const defaultBranchId = () =>
  selectedBranch.value || (props.branches.length === 1 ? props.branches[0].id : '');

const openAddTable  = () => {
  // Explicitly clear every field — a previous edit could otherwise leak values
  // into the "Add" form (reset() alone doesn't drop keys added via edit).
  tableForm.clearErrors();
  Object.assign(tableForm, { id: null, table_number: '', capacity: 4, shape: 'rectangle', status: 'available', branch_id: defaultBranchId() });
  showTableModal.value = true;
};
const openEditTable = t  => {
  Object.assign(tableForm, { ...t, branch_id: t.branch_id ?? defaultBranchId() });
  showTableModal.value = true;
};

const saveTable = () => {
  const opts = { preserveScroll: true, onSuccess: () => { showTableModal.value = false; selected.value = null; } };
  tableForm.id
    ? tableForm.put(`/reservations/tables/${tableForm.id}`, opts)
    : tableForm.post('/reservations/tables', opts);
};

const deleteTable = async id => {
  if (!(await confirmDialog('Remove this table from the floor plan?'))) return;
  router.delete(`/reservations/tables/${id}`, {
    preserveScroll: true, onSuccess: () => { selected.value = null; tables.value = tables.value.filter(t => t.id !== id); },
  });
};

const reloadBranch = () => router.get('/reservations/floor-plan',
  { branch_id: selectedBranch.value || undefined }, { preserveState: true });

const fmtTime   = iso => iso ? new Date(iso).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' }) : '';
const typeEmoji = t => ({ dining: '🍽', 'on-way': '🥡', delivery: '🚚' }[t] ?? '');
const typeLabel = t => ({ dining: 'Dine-in', 'on-way': 'Takeaway', delivery: 'Delivery' }[t] ?? t);
</script>

<style scoped>
.fp__legend       { display: flex; gap: 16px; margin-bottom: 16px; flex-wrap: wrap; }
.fp__legend-item  { display: flex; align-items: center; gap: 6px; font-size: 0.8rem; color: var(--text-soft); text-transform: capitalize; }
.fp__legend-dot   { width: 12px; height: 12px; border-radius: 50%; }

.fp__canvas {
  position: relative; min-height: 600px; background: #f8fafc;
  border: 2px dashed var(--border); border-radius: var(--radius);
  overflow: hidden; cursor: default; user-select: none;
}

.fp__reservations-strip {
  position: absolute; top: 0; left: 0; right: 0; z-index: 10;
  background: rgba(255,255,255,0.92); padding: 8px 12px;
  border-bottom: 1px solid var(--border); display: flex; gap: 8px; flex-wrap: wrap;
  font-size: 0.78rem; align-items: center; backdrop-filter: blur(4px);
}
.fp__strip-label  { font-weight: 700; color: var(--text-soft); }
.fp__res-chip     { background: #f1f5f9; padding: 2px 8px; border-radius: 4px; }

/* ── Table node ──────────────────────────────────────────────────────────── */
.fp__table {
  position: absolute; cursor: grab; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 2px;
  background: var(--table-color, #6366f1); color: #fff;
  font-weight: 700; user-select: none;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  transition: transform 0.1s, box-shadow 0.1s;
  border: 3px solid rgba(255,255,255,0.3);
}
.fp__table--rectangle { width: 80px; height: 50px; border-radius: 8px; }
.fp__table--square    { width: 60px; height: 60px; border-radius: 8px; }
.fp__table--circle    { width: 64px; height: 64px; border-radius: 50%; }
.fp__table--dragging  { cursor: grabbing; transform: scale(1.08);
  box-shadow: 0 8px 24px rgba(0,0,0,0.3); z-index: 50; }
.fp__table:hover:not(.fp__table--dragging) { transform: scale(1.04); }

.fp__table-num    { font-size: 0.85rem; line-height: 1; }
.fp__table-cap    { font-size: 0.65rem; opacity: 0.8; }
.fp__table-order  { font-size: 0.8rem; }

/* ── Drawer ──────────────────────────────────────────────────────────────── */
.fp__drawer {
  position: fixed; right: 20px; top: 50%; transform: translateY(-50%);
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius); width: 240px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.12); z-index: 100;
}
.fp__drawer-hdr { display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; font-weight: 700; border-bottom: 1px solid var(--border); }
.fp__drawer-close { background: none; border: none; font-size: 1.1rem; cursor: pointer; color: var(--text-soft); }
.fp__drawer-body  { padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; font-size: 0.875rem; }
.fp__drawer-actions { display: flex; gap: 8px; margin-top: 4px; }
.form-grid-2      { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; }
</style>
