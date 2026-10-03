<template>
  <div class="kds" :style="{ '--kds-accent': activeStation?.color ?? '#6366f1' }">
    <!-- Top bar -->
    <div class="kds__topbar">
      <div class="kds__topbar-left">
        <span class="kds__logo">🍳 KDS</span>
        <select v-model="selectedStation" class="kds__select">
          <option value="">All Stations</option>
          <option v-for="s in props.stations" :key="s.id" :value="s.id">{{ s.name }}</option>
        </select>
        <select v-model="selectedBranch" class="kds__select">
          <option value="">All Branches</option>
          <option v-for="b in props.branches" :key="b.id" :value="b.id">{{ b.name }}</option>
        </select>
      </div>
      <div class="kds__topbar-right">
        <span class="kds__clock">{{ clock }}</span>
        <span class="kds__poll" :class="{ 'kds__poll--live': polling }">● LIVE</span>
        <a href="/kds/stations" class="kds__cfg-btn">⚙ Stations</a>
      </div>
    </div>

    <!-- Ticket grid -->
    <div class="kds__board">
      <transition-group name="ticket-fade" tag="div" class="kds__grid">
        <div
          v-for="ticket in tickets"
          :key="ticket.order_id"
          class="kds__ticket"
          :class="ticketClass(ticket)"
        >
          <!-- Ticket header -->
          <div class="kds__ticket-hdr" :style="{ background: ticketHeaderBg(ticket) }">
            <div class="kds__ticket-id">{{ ticket.order_number }}</div>
            <div class="kds__ticket-meta">
              <span class="kds__ticket-type">{{ typeLabel(ticket.type) }}</span>
              <span v-if="stationLabel(ticket)" class="kds__ticket-station">🏷 {{ stationLabel(ticket) }}</span>
              <span class="kds__ticket-age" :class="ageClass(ticket.age_seconds)">
                {{ fmtAge(ticket.age_seconds) }}
              </span>
            </div>
            <button class="kds__bump-all" @click="bumpOrder(ticket)" title="Bump entire order">
              ✓ All Done
            </button>
          </div>

          <!-- Item lines -->
          <div class="kds__items">
            <div
              v-for="item in ticket.items"
              :key="item.id"
              class="kds__item"
              :class="'kds__item--' + item.kds_status"
            >
              <div class="kds__item-left">
                <span class="kds__item-qty" :style="{ color: stationColor(item) }">× {{ item.qty }}</span>
                <div class="kds__item-detail">
                  <span class="kds__item-name">{{ item.name }}</span>
                  <span v-if="item.note" class="kds__item-note">📝 {{ item.note }}</span>
                </div>
              </div>
              <div class="kds__item-actions">
                <button
                  v-if="item.kds_status === 'sent'"
                  class="kds__pill kds__pill--prep"
                  @click="setStatus(item, 'preparing')"
                >Prep</button>
                <button
                  v-if="item.kds_status === 'preparing'"
                  class="kds__pill kds__pill--ready"
                  @click="setStatus(item, 'ready')"
                >Ready</button>
                <button
                  v-if="['sent','preparing','ready'].includes(item.kds_status)"
                  class="kds__pill kds__pill--bump"
                  @click="bumpItem(item)"
                >✓</button>
              </div>
            </div>
          </div>

          <!-- Ticket footer -->
          <div class="kds__ticket-ftr">
            <span class="kds__status-badge kds__status-badge--{{ ticket.kds_status }}">
              {{ ticket.kds_status.toUpperCase() }}
            </span>
            <span class="kds__placed">{{ fmtTime(ticket.placed_at) }}</span>
          </div>
        </div>
      </transition-group>

      <div v-if="!loading && tickets.length === 0" class="kds__empty">
        <div class="kds__empty-icon">✅</div>
        <p>No active tickets — kitchen is clear!</p>
      </div>

      <div v-if="loading && tickets.length === 0" class="kds__empty">
        <div class="kds__spin"></div>
        <p>Loading tickets…</p>
      </div>
    </div>

    <!-- Recall drawer (bumped items) -->
    <div v-if="recalled.length" class="kds__recall-bar">
      <span class="kds__recall-label">Recalled:</span>
      <button
        v-for="item in recalled"
        :key="item.id"
        class="kds__recall-chip"
        @click="recallItem(item)"
      >
        ↩ {{ item.name }} (Order {{ item.order_number }})
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

// KDS Board has no AdminLayout — it runs full-screen on a kitchen monitor.
defineOptions({ layout: null });

const props = defineProps({
  stations:        { type: Array,  default: () => [] },
  branches:        { type: Array,  default: () => [] },
  initialStationId:{ type: Number, default: null },
  initialBranchId: { type: Number, default: null },
});

const selectedStation = ref(props.initialStationId ?? '');
const selectedBranch  = ref(props.initialBranchId  ?? '');
const tickets         = ref([]);
const recalled        = ref([]);
const loading         = ref(true);
const polling         = ref(false);
const clock           = ref('');
const activeStation   = computed(() =>
  props.stations.find(s => s.id === selectedStation.value) ?? null
);

// ── Clock ─────────────────────────────────────────────────────────────────
let clockTimer = null;
const updateClock = () => {
  clock.value = new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

// ── Polling ───────────────────────────────────────────────────────────────
let pollTimer = null;
const POLL_MS = 5000; // 5-second refresh

const fetchTickets = async () => {
  polling.value = true;
  try {
    const params = new URLSearchParams();
    if (selectedStation.value) params.set('station_id', selectedStation.value);
    if (selectedBranch.value)  params.set('branch_id',  selectedBranch.value);

    const res  = await fetch(`/kds/board/tickets?${params}`, {
      headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      credentials: 'same-origin',
    });
    if (!res.ok) return;

    const data = await res.json();
    tickets.value = data.tickets ?? [];
  } catch (e) {
    // silent — kitchen screen stays showing last data
  } finally {
    loading.value  = false;
    polling.value  = false;
  }
};

const startPolling = () => {
  fetchTickets();
  pollTimer = setInterval(fetchTickets, POLL_MS);
};

watch([selectedStation, selectedBranch], () => {
  clearInterval(pollTimer);
  loading.value = true;
  startPolling();
});

onMounted(() => {
  updateClock();
  clockTimer = setInterval(updateClock, 1000);
  startPolling();
});

onUnmounted(() => {
  clearInterval(pollTimer);
  clearInterval(clockTimer);
});

// ── Actions ───────────────────────────────────────────────────────────────
const csrfToken = () =>
  document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';

const apiFetch = (url, method, body = null) =>
  fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'X-CSRF-TOKEN': csrfToken(),
    },
    credentials: 'same-origin',
    body: body ? JSON.stringify(body) : undefined,
  });

const bumpItem = async (item) => {
  await apiFetch(`/kds/items/${item.id}/bump`, 'POST');
  // Optimistically remove item; full refresh in 5s
  tickets.value = tickets.value.map(t => ({
    ...t,
    items: t.items.filter(i => i.id !== item.id),
  })).filter(t => t.items.length > 0);
  recalled.value.push({ ...item });
};

const bumpOrder = async (ticket) => {
  await apiFetch(`/kds/orders/${ticket.order_id}/bump`, 'POST');
  tickets.value = tickets.value.filter(t => t.order_id !== ticket.order_id);
  ticket.items.forEach(i => recalled.value.push({ ...i, order_number: ticket.order_number }));
};

const setStatus = async (item, status) => {
  await apiFetch(`/kds/items/${item.id}/status`, 'PUT', { kds_status: status });
  item.kds_status = status; // optimistic
};

const recallItem = async (item) => {
  await apiFetch(`/kds/items/${item.id}/recall`, 'POST');
  recalled.value = recalled.value.filter(r => r.id !== item.id);
  await fetchTickets();
};

// ── Helpers ───────────────────────────────────────────────────────────────
const TICKET_COLORS = {
  new:       '#64748b',
  sent:      '#6366f1',
  preparing: '#f59e0b',
  ready:     '#10b981',
};

const ticketHeaderBg = t => {
  if (t.age_seconds > 600) return '#dc2626';
  // Use the station color when all items on the ticket belong to one station
  const colors = [...new Set(t.items.map(i => i.station_color).filter(Boolean))];
  if (colors.length === 1) return colors[0];
  return TICKET_COLORS[t.kds_status] ?? '#6366f1';
};

const stationLabel = t => {
  const names = [...new Set(t.items.map(i => i.station_name).filter(Boolean))];
  return names.length === 1 ? names[0] : names.length > 1 ? 'Mixed' : '';
};

const stationColor = item => item.station_color ?? 'var(--kds-accent)';

const ticketClass = t => ({
  'kds__ticket--new':       t.kds_status === 'new',
  'kds__ticket--sent':      t.kds_status === 'sent',
  'kds__ticket--preparing': t.kds_status === 'preparing',
  'kds__ticket--ready':     t.kds_status === 'ready',
  'kds__ticket--urgent':    t.age_seconds > 600,
});

const ageClass    = s => s > 600 ? 'kds__age--danger' : s > 300 ? 'kds__age--warn' : 'kds__age--ok';
const fmtAge      = s => s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
const fmtTime     = iso => iso ? new Date(iso).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' }) : '';
const typeLabel   = t => ({ dining: '🍽 Dine-in', 'on-way': '🥡 Takeaway', delivery: '🚚 Delivery' }[t] ?? t);
</script>

<style scoped>
/* Full-screen KDS — dark theme designed for bright kitchen environments */
.kds {
  min-height: 100vh;
  background: #0f172a;
  color: #f1f5f9;
  display: flex;
  flex-direction: column;
  font-family: system-ui, sans-serif;
}

/* ── Top bar ─────────────────────────────────────────────────────────────── */
.kds__topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  background: #1e293b;
  border-bottom: 2px solid var(--kds-accent);
  flex-shrink: 0;
}
.kds__topbar-left, .kds__topbar-right { display: flex; align-items: center; gap: 12px; }
.kds__logo  { font-size: 1.2rem; font-weight: 800; letter-spacing: -0.5px; }
.kds__select {
  background: #334155; color: #f1f5f9; border: 1px solid #475569;
  border-radius: 8px; padding: 6px 10px; font-size: 0.85rem;
}
.kds__clock  { font-size: 1.4rem; font-weight: 700; font-variant-numeric: tabular-nums; }
.kds__poll   { font-size: 0.75rem; color: #475569; letter-spacing: 0.05em; }
.kds__poll--live { color: #10b981; animation: pulse 2s infinite; }
@keyframes pulse { 0%,100% { opacity:1; } 50% { opacity: 0.4; } }
.kds__cfg-btn {
  color: #94a3b8; font-size: 0.8rem; text-decoration: none;
  padding: 4px 10px; border: 1px solid #334155; border-radius: 6px;
}
.kds__cfg-btn:hover { background: #334155; }

/* ── Board ───────────────────────────────────────────────────────────────── */
.kds__board { flex: 1; overflow-y: auto; padding: 16px; }
.kds__grid  {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  align-items: start;
}

/* ── Ticket ──────────────────────────────────────────────────────────────── */
.kds__ticket {
  background: #1e293b;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #334155;
  transition: border-color 0.3s;
}
.kds__ticket--preparing { border-color: #f59e0b; }
.kds__ticket--ready     { border-color: #10b981; }
.kds__ticket--urgent    { border-color: #ef4444; animation: urgentPulse 1.5s infinite; }
@keyframes urgentPulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
  50%     { box-shadow: 0 0 0 6px rgba(239,68,68,0.4); }
}

.kds__ticket-hdr {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px; color: #fff;
}
.kds__ticket-id   { font-size: 1.1rem; font-weight: 800; letter-spacing: -0.5px; }
.kds__ticket-meta { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.kds__ticket-type { font-size: 0.75rem; opacity: 0.85; }
.kds__ticket-station {
  font-size: 0.7rem; font-weight: 700; opacity: 0.95;
  background: rgba(255,255,255,0.18); border-radius: 4px; padding: 1px 6px;
  width: fit-content;
}
.kds__ticket-age  { font-size: 0.85rem; font-weight: 700; font-variant-numeric: tabular-nums; }
.kds__age--ok     { color: #86efac; }
.kds__age--warn   { color: #fde68a; }
.kds__age--danger { color: #fca5a5; }

.kds__bump-all {
  background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25);
  color: #fff; border-radius: 8px; padding: 5px 10px; font-size: 0.78rem;
  font-weight: 700; cursor: pointer; white-space: nowrap;
}
.kds__bump-all:hover { background: rgba(255,255,255,0.25); }

/* ── Items ───────────────────────────────────────────────────────────────── */
.kds__items { padding: 8px 0; }
.kds__item  {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 14px; border-bottom: 1px solid #334155;
  transition: background 0.2s;
}
.kds__item:last-child  { border-bottom: none; }
.kds__item--ready      { background: rgba(16,185,129,0.08); }
.kds__item--preparing  { background: rgba(245,158,11,0.08); }

.kds__item-left   { display: flex; align-items: flex-start; gap: 10px; }
.kds__item-qty    { font-size: 1.1rem; font-weight: 800; color: var(--kds-accent); min-width: 28px; }
.kds__item-detail { display: flex; flex-direction: column; }
.kds__item-name   { font-size: 0.95rem; font-weight: 600; }
.kds__item-note   { font-size: 0.78rem; color: #fde68a; margin-top: 2px; }

.kds__item-actions { display: flex; gap: 6px; }
.kds__pill {
  border: none; border-radius: 6px; padding: 4px 10px;
  font-size: 0.75rem; font-weight: 700; cursor: pointer;
}
.kds__pill--prep  { background: #f59e0b; color: #1e293b; }
.kds__pill--ready { background: #10b981; color: #fff; }
.kds__pill--bump  { background: #475569; color: #f1f5f9; }
.kds__pill:hover  { filter: brightness(1.15); }

/* ── Ticket footer ───────────────────────────────────────────────────────── */
.kds__ticket-ftr {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 14px; background: #0f172a; font-size: 0.75rem;
}
.kds__status-badge {
  background: #334155; color: #94a3b8; padding: 2px 8px;
  border-radius: 4px; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.05em;
}
.kds__placed { color: #64748b; }

/* ── Empty / loading ─────────────────────────────────────────────────────── */
.kds__empty {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 16px; padding: 80px 20px;
  color: #475569; grid-column: 1/-1;
}
.kds__empty-icon { font-size: 3rem; }
.kds__empty p    { font-size: 1.1rem; }
.kds__spin {
  width: 40px; height: 40px; border: 4px solid #334155;
  border-top-color: var(--kds-accent); border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Recall bar ──────────────────────────────────────────────────────────── */
.kds__recall-bar {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  padding: 8px 16px; background: #1e293b;
  border-top: 1px solid #334155; flex-shrink: 0;
}
.kds__recall-label { font-size: 0.75rem; color: #94a3b8; font-weight: 700; }
.kds__recall-chip  {
  background: #334155; color: #f1f5f9; border: 1px solid #475569;
  border-radius: 6px; padding: 4px 10px; font-size: 0.75rem; cursor: pointer;
}
.kds__recall-chip:hover { background: #475569; }

/* ── Transition ──────────────────────────────────────────────────────────── */
.ticket-fade-enter-active, .ticket-fade-leave-active { transition: all 0.4s; }
.ticket-fade-enter-from, .ticket-fade-leave-to { opacity: 0; transform: scale(0.92); }
</style>
