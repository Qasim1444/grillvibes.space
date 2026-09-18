<template>
  <div class="page">
    <PageHeader title="QR Codes" subtitle="Generate a QR code per table or place — guests scan it to open the menu and order.">
      <template #actions>
        <button v-if="can('qr.create')" class="ui-btn ui-btn--primary" @click="openCreate">+ New QR Code</button>
      </template>
    </PageHeader>

    <DataTable :columns="columns" :rows="rows" index empty-text="No QR codes yet. Create one for a table or place.">
      <template #cell:label="{ row }">
        <strong>{{ row.label || 'Untitled' }}</strong>
      </template>
      <template #cell:location="{ row }">
        <span v-if="row.table">Table {{ row.table }}</span>
        <span v-else-if="row.place_name">{{ row.place_name }}</span>
        <span v-else class="qr__muted">Whole menu</span>
      </template>
      <template #cell:menu_url="{ row }">
        <div class="qr__link">
          <a :href="row.menu_url" target="_blank" rel="noopener" class="qr__url" :title="row.menu_url">{{ shortUrl(row.menu_url) }}</a>
          <button class="ui-btn ui-btn--ghost ui-btn--sm" @click="copy(row.menu_url)">
            {{ copied === row.menu_url ? '✓ Copied' : 'Copy' }}
          </button>
        </div>
      </template>
      <template #cell:scan_count="{ value }">{{ Number(value || 0).toLocaleString() }}</template>
      <template #cell:last_scanned_at="{ value }">{{ fmtDate(value) }}</template>
      <template #cell:is_active="{ value }">
        <span class="ui-badge" :class="value ? 'ui-badge--success' : 'ui-badge--muted'">
          {{ value ? 'Active' : 'Inactive' }}
        </span>
      </template>
      <template #actions="{ row }">
        <button class="ui-btn ui-btn--secondary ui-btn--sm" @click="openPreview(row)">QR</button>
        <button v-if="can('qr.update')" class="ui-btn ui-btn--ghost ui-btn--sm" @click="openEdit(row)">Edit</button>
        <button v-if="can('qr.delete')" class="ui-btn ui-btn--danger ui-btn--sm" @click="del(row.id)">Delete</button>
      </template>
    </DataTable>

    <Pagination :paginator="props.qrCodes" :only="['qrCodes']" />

    <!-- Create / Edit -->
    <Modal v-model="showModal" :title="form.id ? 'Edit QR Code' : 'New QR Code'">
      <FormField v-model="form.label" label="Label" placeholder="e.g. Table 5 / Front Counter" :error="form.errors.label" />
      <FormField v-model="form.place_id" label="Place" type="select" :error="form.errors.place_id">
        <option value="">— None (whole menu) —</option>
        <option v-for="p in props.places" :key="p.id" :value="p.id">{{ p.name }}</option>
      </FormField>
      <FormField v-model="form.dining_table_id" label="Table" type="select" :error="form.errors.dining_table_id">
        <option value="">— None —</option>
        <option v-for="t in tablesForPlace" :key="t.id" :value="t.id">Table {{ t.table_number }}</option>
      </FormField>
      <FormField v-model="form.is_active" label="Status" type="select" :error="form.errors.is_active">
        <option :value="true">Active</option>
        <option :value="false">Inactive</option>
      </FormField>
      <template #footer>
        <button class="ui-btn ui-btn--ghost" @click="showModal = false">Cancel</button>
        <button class="ui-btn ui-btn--primary" :disabled="form.processing" @click="save">Save</button>
      </template>
    </Modal>

    <!-- QR preview -->
    <Modal v-model="showPreview" title="QR code" width="400px">
      <div v-if="previewRow" class="qrcard">
        <div class="qrcard__head">
          <span class="qrcard__eyebrow">Scan to order</span>
          <span v-if="previewRow.table" class="qrcard__loc">Table {{ previewRow.table }}</span>
          <span v-else-if="previewRow.place_name" class="qrcard__loc">{{ previewRow.place_name }}</span>
        </div>
        <div class="qrcard__tile">
          <img :src="qrSrc(previewRow.id)" :alt="previewRow.label || 'QR code'" class="qrcard__img" />
        </div>
        <p class="qrcard__label">{{ previewRow.label || 'Untitled code' }}</p>
        <p class="qrcard__hint">Point your phone camera at the code to open the menu.</p>
        <a :href="previewRow.menu_url" target="_blank" rel="noopener" class="qrcard__url">{{ previewRow.menu_url }}</a>
      </div>
      <template #footer>
        <button class="ui-btn ui-btn--secondary" @click="downloadPng">Download PNG</button>
        <button class="ui-btn ui-btn--ghost" @click="copy(previewRow?.menu_url)">
          {{ copied === previewRow?.menu_url ? '✓ Copied' : 'Copy link' }}
        </button>
        <button class="ui-btn ui-btn--primary" @click="printQr">Print</button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { confirmDialog } from "../composables/useNotifications";
import { computed, ref } from 'vue';
import { router, useForm } from '@inertiajs/vue3';
import AdminLayout from '../layouts/AdminLayout.vue';
import PageHeader from '../components/ui/PageHeader.vue';
import DataTable from '../components/ui/DataTable.vue';
import Pagination from '../components/ui/Pagination.vue';
import Modal from '../components/ui/Modal.vue';
import FormField from '../components/ui/FormField.vue';
import { usePermissions } from '../composables/usePermissions';

defineOptions({ layout: AdminLayout });
const { can } = usePermissions();

const props = defineProps({
  qrCodes: { type: Object, default: () => ({ data: [] }) },
  places:  { type: Array,  default: () => [] },
  tables:  { type: Array,  default: () => [] },
});

const columns = [
  { key: 'label',           label: 'Label' },
  { key: 'location',        label: 'Location' },
  { key: 'menu_url',        label: 'Menu URL' },
  { key: 'scan_count',      label: 'Scans' },
  { key: 'last_scanned_at', label: 'Last Scan' },
  { key: 'is_active',       label: 'Status' },
];

const rows = computed(() => props.qrCodes?.data ?? []);

// Only offer tables that belong to the chosen place (all of them if none set).
const tablesForPlace = computed(() =>
  form.place_id ? props.tables.filter(t => String(t.place_id) === String(form.place_id)) : props.tables
);

const showModal = ref(false);
const form = useForm({ id: null, label: '', place_id: '', dining_table_id: '', is_active: true });

const openCreate = () => {
  form.reset(); form.clearErrors();
  showModal.value = true;
};

const openEdit = row => {
  form.id = row.id;
  form.label = row.label ?? '';
  form.place_id = row.place_id ?? '';
  form.dining_table_id = row.dining_table_id ?? '';
  form.is_active = !!row.is_active;
  form.clearErrors();
  showModal.value = true;
};

const save = () => {
  const opts = { preserveScroll: true, onSuccess: () => (showModal.value = false) };
  if (form.id) form.put(`/qr-codes/${form.id}`, opts);
  else form.post('/qr-codes', opts);
};

const del = async id => {
  if (!(await confirmDialog('Delete this QR code? Existing printed codes will stop working.'))) return;
  router.delete(`/qr-codes/${id}`, { preserveScroll: true });
};

// ── QR preview / print ─────────────────────────────────────────────────────
const showPreview = ref(false);
const previewRow = ref(null);
const openPreview = row => { previewRow.value = row; showPreview.value = true; };

// QR images are generated locally by the backend (milon/barcode) — the menu
// URL is never handed to a third-party service. SVG for display/print, PNG to save.
const qrSrc = id => `/qr-codes/${id}/image`;
const qrPng = id => `/qr-codes/${id}/image?format=png`;

const downloadPng = () => {
  if (!previewRow.value) return;
  const { id, label, slug } = previewRow.value;
  const a = document.createElement('a');
  a.href = qrPng(id);
  a.download = `qr-${label || slug || 'code'}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
};

const esc = s => String(s ?? '').replace(/[&<>"']/g,
  c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const printQr = () => {
  if (!previewRow.value) return;
  const { id, menu_url, label, table, place_name } = previewRow.value;
  const loc = table ? `Table ${table}` : (place_name || '');
  const w = window.open('', '_blank', 'width=460,height=640');
  if (!w) return;
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>QR — ${esc(label || 'Menu')}</title>
    <style>
      *{box-sizing:border-box}
      body{margin:0;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;color:#111827}
      .card{width:340px;margin:32px auto;padding:28px 24px;border:1px solid #e5e7eb;border-radius:18px;text-align:center}
      .eyebrow{text-transform:uppercase;letter-spacing:.14em;font-size:12px;font-weight:700;color:#4f46e5;margin:0 0 2px}
      .loc{font-size:22px;font-weight:800;margin:0 0 18px}
      .tile{display:inline-block;padding:16px;border-radius:14px;background:#fff;border:1px solid #eef2ff}
      .tile img{width:220px;height:220px;display:block}
      .label{font-weight:700;margin:16px 0 2px}
      .hint{font-size:12px;color:#6b7280;margin:0 0 12px}
      .url{font-size:11px;color:#9ca3af;word-break:break-all}
      @media print{.card{border:none;margin:0 auto}@page{margin:12mm}}
    </style></head>
    <body>
      <div class="card">
        <p class="eyebrow">Scan to order</p>
        ${loc ? `<p class="loc">${esc(loc)}</p>` : ''}
        <div class="tile"><img src="${qrSrc(id)}" onload="window.focus();window.print()" alt="QR code" /></div>
        <p class="label">${esc(label || 'Scan to view our menu')}</p>
        <p class="hint">Open your phone camera and point it at the code</p>
        <p class="url">${esc(menu_url)}</p>
      </div>
    </body></html>`);
  w.document.close();
};

const copied = ref(null);
const copy = async url => {
  if (!url) return;
  try {
    await navigator.clipboard.writeText(url);
    copied.value = url;
    setTimeout(() => (copied.value = null), 1500);
  } catch { /* clipboard blocked — the URL is visible to copy manually */ }
};

const shortUrl = u => String(u || '').replace(/^https?:\/\/[^/]+/, '') || u;
const fmtDate = v => (v ? new Date(v).toLocaleString() : '—');
</script>

<style scoped>
.qr__muted { color: var(--text-soft); }

/* Menu URL cell — compact monospace pill + copy */
.qr__link  { display: flex; align-items: center; gap: 8px; }
.qr__url   {
  display: inline-block; max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  padding: 3px 10px; border-radius: 999px;
  background: var(--brand-soft); color: var(--brand-700);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.78rem; font-weight: 600;
  text-decoration: none; vertical-align: middle;
}
.qr__url:hover { background: #e0e7ff; }

/* QR preview card */
.qrcard          { text-align: center; padding: 4px 4px 0; }
.qrcard__head    { margin-bottom: 16px; }
.qrcard__eyebrow { display: block; text-transform: uppercase; letter-spacing: 0.14em; font-size: 0.72rem; font-weight: 700; color: var(--brand); }
.qrcard__loc     { display: block; font-size: 1.5rem; font-weight: 800; color: var(--text); margin-top: 2px; }
.qrcard__tile    {
  display: inline-block; padding: 16px; border-radius: var(--radius);
  background: #fff; border: 1px solid var(--brand-soft);
  box-shadow: 0 10px 30px -14px rgba(79, 70, 229, 0.45);
}
.qrcard__img     { width: 232px; height: 232px; display: block; }
.qrcard__label   { font-weight: 700; color: var(--text); margin: 16px 0 2px; }
.qrcard__hint    { font-size: 0.8rem; color: var(--text-muted); margin: 0 0 10px; }
.qrcard__url     { font-size: 0.76rem; color: var(--text-soft); word-break: break-all; text-decoration: none; }
.qrcard__url:hover { color: var(--brand); }
</style>
