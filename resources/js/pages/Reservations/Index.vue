<template>
  <div class="page">
    <PageHeader title="Reservations" subtitle="Manage table bookings and walk-in queue.">
      <template #actions>
        <a href="/reservations/floor-plan" class="ui-btn ui-btn--ghost">🗺 Floor Plan</a>
        <button v-if="can('reservations.create')" class="ui-btn ui-btn--secondary" @click="openWaitlistModal">+ Waitlist</button>
        <button v-if="can('reservations.create')" class="ui-btn ui-btn--primary" @click="openModal()">+ Reservation</button>
      </template>
    </PageHeader>

    <!-- Filters -->
    <div class="res__filters">
      <div class="res__filter-group">
        <label class="ui-label">Date</label>
        <input v-model="dateFilter" type="date" class="ui-input" @change="reload" />
      </div>
      <div class="res__filter-group">
        <label class="ui-label">Branch</label>
        <select v-model="branchFilter" class="ui-input" style="width:180px" @change="reload">
          <option value="">All Branches</option>
          <option v-for="b in props.branches" :key="b.id" :value="b.id">{{ b.name }}</option>
        </select>
      </div>
      <div class="res__filter-group">
        <label class="ui-label">Status</label>
        <select v-model="statusFilter" class="ui-input" style="width:160px" @change="reload">
          <option value="">All</option>
          <option v-for="s in props.statuses" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>
    </div>

    <div class="res__grid">
      <!-- Reservations timeline -->
      <div class="res__section">
        <h3 class="res__section-title">
          Reservations
          <span class="ui-badge ui-badge--info">{{ props.reservations.length }}</span>
        </h3>
        <div class="res__timeline">
          <div v-if="!props.reservations.length" class="res__empty">No reservations for this date.</div>
          <div
            v-for="r in props.reservations" :key="r.id"
            class="res__card"
            :class="'res__card--' + r.status"
          >
            <div class="res__card-time">
              <span class="res__time">{{ fmtTime(r.reserved_at) }}</span>
              <span class="res__dur">{{ r.duration_minutes }}min</span>
            </div>
            <div class="res__card-body">
              <div class="res__card-name">{{ r.guest_name }}</div>
              <div class="res__card-meta">
                <span>👥 {{ r.party_size }}</span>
                <span v-if="r.table_number">🪑 {{ r.table_number }}</span>
                <span v-if="r.phone">📞 {{ r.guest_phone }}</span>
                <span v-if="r.occasion">🎉 {{ r.occasion }}</span>
              </div>
              <div class="res__card-notes" v-if="r.notes">{{ r.notes }}</div>
            </div>
            <div class="res__card-actions">
              <span class="ui-badge" :class="statusBadge(r.status)">{{ r.status }}</span>
              <button v-if="can('reservations.update')" class="ui-btn ui-btn--ghost ui-btn--sm" @click="openModal(r)">Edit</button>
              <button v-if="can('reservations.delete')" class="ui-btn ui-btn--danger ui-btn--sm" @click="del(r.id)">✕</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Waitlist -->
      <div class="res__section">
        <h3 class="res__section-title">
          Waitlist
          <span class="ui-badge ui-badge--warning">{{ props.waitlist.length }}</span>
        </h3>
        <div class="res__waitlist">
          <div v-if="!props.waitlist.length" class="res__empty">Waitlist is empty.</div>
          <div v-for="(entry, idx) in props.waitlist" :key="entry.id" class="res__wait-card">
            <div class="res__wait-pos">{{ idx + 1 }}</div>
            <div class="res__wait-body">
              <div class="res__wait-name">{{ entry.guest_name }}</div>
              <div class="res__wait-meta">
                <span>👥 {{ entry.party_size }}</span>
                <span v-if="entry.guest_phone">📞 {{ entry.guest_phone }}</span>
                <span class="res__wait-time">⏱ {{ entry.wait_minutes }}min waiting</span>
                <span v-if="entry.estimated_wait_minutes" class="res__wait-est">
                  Est: {{ entry.estimated_wait_minutes }}min
                </span>
                <span v-if="entry.notified_at" class="ui-badge ui-badge--success">🔔 Notified</span>
              </div>
            </div>
            <div class="res__wait-actions">
              <button class="ui-btn ui-btn--success ui-btn--sm" @click="seatWaitlist(entry.id)">Seat</button>
              <button class="ui-btn ui-btn--ghost ui-btn--sm" :disabled="!!entry.notified_at" @click="notifyWaitlist(entry)">
                {{ entry.notified_at ? 'Notified ✓' : 'Notify' }}
              </button>
              <a v-if="entry.guest_phone" class="ui-btn ui-btn--ghost ui-btn--sm" :href="waLink(entry)" target="_blank"
                 rel="noopener" title="Open WhatsApp chat">💬</a>
              <button class="ui-btn ui-btn--danger ui-btn--sm" @click="removeWaitlist(entry.id, 'left')">✕</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Reservation Modal -->
    <Modal v-model="showModal" :title="form.id ? 'Edit Reservation' : 'New Reservation'" width="640px">
      <div class="form-grid-2">
        <FormField v-model="form.guest_name" label="Guest Name *" placeholder="Full name" :error="form.errors.guest_name" />
        <FormField v-model="form.guest_phone" label="Phone" placeholder="+92 300 0000000" :error="form.errors.guest_phone" />
        <FormField v-model="form.guest_email" label="Email" type="email" placeholder="Optional" :error="form.errors.guest_email" />
        <FormField v-model.number="form.party_size" label="Party Size *" type="number" min="1" :error="form.errors.party_size" />
        <FormField v-model="form.reserved_at" label="Date & Time *" type="datetime-local" :error="form.errors.reserved_at" />
        <FormField v-model.number="form.duration_minutes" label="Duration (min)" type="number" min="15" :error="form.errors.duration_minutes" />
        <FormField v-model="form.dining_table_id" label="Table" type="select" :error="form.errors.dining_table_id">
          <option value="">— No specific table —</option>
          <option v-for="t in props.tables" :key="t.id" :value="t.id">
            {{ t.table_number }} (cap. {{ t.capacity }})
          </option>
        </FormField>
        <FormField v-model="form.branch_id" label="Branch" type="select" :error="form.errors.branch_id">
          <option value="">Select branch</option>
          <option v-for="b in props.branches" :key="b.id" :value="b.id">{{ b.name }}</option>
        </FormField>
        <FormField v-model="form.status" label="Status" type="select" :error="form.errors.status">
          <option v-for="s in props.statuses" :key="s" :value="s">{{ s }}</option>
        </FormField>
        <FormField v-model="form.occasion" label="Occasion" placeholder="Birthday, Anniversary…" :error="form.errors.occasion" />
      </div>
      <FormField v-model="form.notes" label="Notes" type="textarea" placeholder="Special requests…" :error="form.errors.notes" />
      <template #footer>
        <button class="ui-btn ui-btn--ghost" @click="showModal = false">Cancel</button>
        <button class="ui-btn ui-btn--primary" :disabled="form.processing" @click="save">Save</button>
      </template>
    </Modal>

    <!-- Waitlist Modal -->
    <Modal v-model="showWaitlistModal" title="Add to Waitlist" width="480px">
      <FormField v-model="wlForm.guest_name" label="Guest Name *" placeholder="Full name" :error="wlForm.errors.guest_name" />
      <FormField v-model="wlForm.guest_phone" label="Phone" placeholder="+92 300 0000000" :error="wlForm.errors.guest_phone" />
      <FormField v-model.number="wlForm.party_size" label="Party Size *" type="number" min="1" :error="wlForm.errors.party_size" />
      <FormField v-model="wlForm.branch_id" label="Branch" type="select" :error="wlForm.errors.branch_id">
        <option value="">Select branch</option>
        <option v-for="b in props.branches" :key="b.id" :value="b.id">{{ b.name }}</option>
      </FormField>
      <FormField v-model.number="wlForm.estimated_wait_minutes" label="Est. Wait (min)" type="number" min="1" placeholder="20" :error="wlForm.errors.estimated_wait_minutes" />
      <FormField v-model="wlForm.notes" label="Notes" type="textarea" :error="wlForm.errors.notes" />
      <template #footer>
        <button class="ui-btn ui-btn--ghost" @click="showWaitlistModal = false">Cancel</button>
        <button class="ui-btn ui-btn--primary" :disabled="wlForm.processing" @click="saveWaitlist">Add to Waitlist</button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { alertDialog, confirmDialog } from "../../composables/useNotifications";
import { ref } from 'vue';
import { router, useForm } from '@inertiajs/vue3';
import AdminLayout from '../../layouts/AdminLayout.vue';
import PageHeader from '../../components/ui/PageHeader.vue';
import Modal from '../../components/ui/Modal.vue';
import FormField from '../../components/ui/FormField.vue';
import { usePermissions } from '../../composables/usePermissions';

defineOptions({ layout: AdminLayout });
const { can } = usePermissions();

const props = defineProps({
  reservations: { type: Array,  default: () => [] },
  waitlist:     { type: Array,  default: () => [] },
  branches:     { type: Array,  default: () => [] },
  tables:       { type: Array,  default: () => [] },
  statuses:     { type: Array,  default: () => [] },
  sources:      { type: Array,  default: () => [] },
  filters:      { type: Object, default: () => ({}) },
});

const dateFilter   = ref(props.filters?.date ?? new Date().toISOString().slice(0, 10));
const branchFilter = ref(props.filters?.branch_id ?? '');
const statusFilter = ref(props.filters?.status ?? '');

const reload = () => router.get('/reservations', {
  date: dateFilter.value, branch_id: branchFilter.value || undefined, status: statusFilter.value || undefined,
}, { preserveState: true, preserveScroll: true });

// Reservation form
const showModal = ref(false);
const form = useForm({
  id: null, dining_table_id: '', branch_id: '', guest_name: '', guest_phone: '',
  guest_email: '', party_size: 2, reserved_at: '', duration_minutes: 90,
  status: 'confirmed', occasion: '', notes: '', source: 'walk_in',
});

// Default new records to the branch in the filter, or the only branch when there is one.
const defaultBranchId = () =>
  branchFilter.value || (props.branches.length === 1 ? props.branches[0].id : '');

const openModal = (row = null) => {
  form.clearErrors();
  // Explicit defaults so a previous edit can never leak into the Add form.
  Object.assign(form, {
    id: null, dining_table_id: '', guest_name: '', guest_phone: '', guest_email: '',
    party_size: 2, duration_minutes: 90, status: 'confirmed', occasion: '', notes: '', source: 'walk_in',
  });
  if (row) {
    Object.assign(form, {
      ...row,
      reserved_at: row.reserved_at ? row.reserved_at.slice(0, 16) : '',
      dining_table_id: row.dining_table_id ?? '',
      branch_id: row.branch_id ?? '',
    });
  } else {
    form.reserved_at = dateFilter.value + 'T19:00';
    form.branch_id   = defaultBranchId();
  }
  showModal.value = true;
};

const ACTIVE_STATUSES = ['pending', 'confirmed', 'seated'];

/**
 * Conflict check against existing reservations:
 * 1. No two reservations at the same date & time (regardless of table).
 * 2. No double-booking of the same table within overlapping time windows.
 * Returns an error message, or '' when the slot is free.
 */
const conflictMessage = (reservedAt, duration, ignoreId = null, branchId = '') => {
  const start = new Date(reservedAt);
  const end   = new Date(start.getTime() + (duration || 90) * 60000);
  for (const r of props.reservations) {
    if (r.id === ignoreId || !ACTIVE_STATUSES.includes(r.status)) continue;
    if (branchId && r.branch_id && String(r.branch_id) !== String(branchId)) continue;
    const rStart = new Date(r.reserved_at);
    const rEnd   = new Date(rStart.getTime() + (r.duration_minutes || 90) * 60000);
    if (!(start < rEnd && rStart < end)) continue; // windows don't overlap
    if (rStart.getTime() === start.getTime())
      return 'A reservation already exists at this exact date & time. Pick a different time.';
    if (r.dining_table_id && String(r.dining_table_id) === String(form.dining_table_id))
      return 'This table already has a reservation overlapping that date & time.';
  }
  return '';
};

const save = () => {
  // Block duplicate slots and same-table double bookings.
  const conflict = conflictMessage(form.reserved_at, form.duration_minutes, form.id, form.branch_id);
  if (conflict) {
    form.setError(form.dining_table_id && conflict.includes('table') ? 'dining_table_id' : 'reserved_at', conflict);
    return;
  }
  const opts = { preserveScroll: true, onSuccess: () => (showModal.value = false) };
  form.id ? form.put(`/reservations/${form.id}`, opts) : form.post('/reservations', opts);
};

const del = async id => {
  if (!(await confirmDialog('Delete this reservation?'))) return;
  router.delete(`/reservations/${id}`, { preserveScroll: true });
};

// Waitlist
const showWaitlistModal = ref(false);
const wlForm = useForm({ guest_name: '', guest_phone: '', party_size: 2,
  branch_id: '', estimated_wait_minutes: null, notes: '' });

const openWaitlistModal = () => {
  wlForm.reset(); wlForm.clearErrors();
  wlForm.branch_id = defaultBranchId();
  showWaitlistModal.value = true;
};
const saveWaitlist = () => wlForm.post('/reservations/waitlist',
  { preserveScroll: true, onSuccess: () => (showWaitlistModal.value = false) });

const seatWaitlist = id => router.put(`/reservations/waitlist/${id}`, { status: 'seated' }, { preserveScroll: true });

/** WhatsApp click-to-chat link with a prefilled "table ready" message. */
const waLink = entry => {
  const digits = (entry.guest_phone || '').replace(/\D/g, '');
  if (!digits) return '';
  // Local PK numbers: 03001234567 → 923001234567
  const intl = digits.startsWith('0') ? '92' + digits.slice(1) : digits;
  const msg = encodeURIComponent(
    `Assalam-o-Alaikum ${entry.guest_name}! 🍽 Your table at ${entry.branch_name || 'GrillVibes'} is ready. Please see the host desk. Thank you!`
  );
  return `https://wa.me/${intl}?text=${msg}`;
};

const notifyWaitlist = entry => {
  if (!entry.guest_phone) {
    alertDialog('This guest has no phone number — add one before notifying.');
    return;
  }
  // Server sends the WhatsApp message via the gateway and stamps notified_at.
  router.put(`/reservations/waitlist/${entry.id}`, { status: 'waiting', notify: true }, { preserveScroll: true });
};
const removeWaitlist = (id, status) => router.put(`/reservations/waitlist/${id}`, { status }, { preserveScroll: true });

const fmtTime = iso => iso ? new Date(iso).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' }) : '';
const statusBadge = s => ({
  pending: 'ui-badge--muted', confirmed: 'ui-badge--info', seated: 'ui-badge--success',
  completed: 'ui-badge--success', cancelled: 'ui-badge--danger', no_show: 'ui-badge--warning',
}[s] ?? 'ui-badge--muted');
</script>

<style scoped>
.res__filters     { display: flex; gap: 12px; align-items: flex-end; margin-bottom: 20px; flex-wrap: wrap; }
.res__filter-group{ display: flex; flex-direction: column; gap: 4px; }
.res__grid        { display: grid; grid-template-columns: 1fr 380px; gap: 20px; align-items: start; }
.res__section     { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
.res__section-title { display: flex; align-items: center; gap: 8px; padding: 14px 16px; font-weight: 700;
  font-size: 1rem; border-bottom: 1px solid var(--border); background: var(--surface-muted, #f8f9fa); }
.res__empty       { padding: 32px; text-align: center; color: var(--text-soft); font-size: 0.9rem; }
.res__timeline    { display: flex; flex-direction: column; }
.res__card        {
  display: grid; grid-template-columns: 80px 1fr auto;
  gap: 12px; padding: 14px 16px; border-bottom: 1px solid var(--border);
  transition: background 0.15s;
}
.res__card:hover  { background: var(--surface-muted, #f8f9fa); }
.res__card--cancelled { opacity: 0.5; }
.res__card--seated { background: rgba(16,185,129,0.05); }
.res__card-time   { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.res__time        { font-size: 1rem; font-weight: 700; }
.res__dur         { font-size: 0.7rem; color: var(--text-soft); }
.res__card-name   { font-weight: 600; margin-bottom: 4px; }
.res__card-meta   { display: flex; gap: 10px; font-size: 0.8rem; color: var(--text-soft); flex-wrap: wrap; }
.res__card-notes  { font-size: 0.78rem; color: var(--text-soft); margin-top: 4px; font-style: italic; }
.res__card-actions{ display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }

.res__waitlist    { display: flex; flex-direction: column; }
.res__wait-card   { display: grid; grid-template-columns: 36px 1fr auto; gap: 10px;
  padding: 12px 16px; border-bottom: 1px solid var(--border); align-items: center; }
.res__wait-pos    { width: 28px; height: 28px; background: var(--brand, #6366f1); color: #fff;
  border-radius: 50%; display: grid; place-items: center; font-weight: 800; font-size: 0.85rem; }
.res__wait-name   { font-weight: 600; margin-bottom: 4px; }
.res__wait-meta   { display: flex; gap: 8px; font-size: 0.78rem; color: var(--text-soft); flex-wrap: wrap; }
.res__wait-time   { color: #f59e0b; font-weight: 600; }
.res__wait-est    { color: var(--text-soft); }
.res__wait-actions{ display: flex; gap: 4px; }
.form-grid-2      { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; }

@media (max-width: 900px) {
  .res__grid { grid-template-columns: 1fr; }
}
</style>
