<template>
  <div class="page">
    <PageHeader title="KDS Stations" subtitle="Configure kitchen display screens and their food category assignments.">
      <template #actions>
        <a href="/kds/board" target="_blank" class="ui-btn ui-btn--ghost">🖥 Open Board</a>
        <button v-if="can('kds.stations.create')" class="ui-btn ui-btn--primary" @click="openModal()">+ Add Station</button>
      </template>
    </PageHeader>

    <DataTable :columns="columns" :rows="props.stations" index empty-text="No stations configured.">
      <template #cell:color="{ value }">
        <span class="kds-stn__dot" :style="{ background: value }" />
      </template>
      <template #cell:is_active="{ value }">
        <span class="ui-badge" :class="value ? 'ui-badge--success' : 'ui-badge--muted'">
          {{ value ? 'Active' : 'Inactive' }}
        </span>
      </template>
      <template #cell:category_ids="{ value }">
        <span v-if="!value || value.length === 0" class="ui-badge ui-badge--muted">All categories</span>
        <span v-else class="kds-stn__cats">
          <span v-for="id in value" :key="id" class="ui-badge ui-badge--info">{{ catName(id) }}</span>
        </span>
      </template>
      <template #actions="{ row }">
        <button v-if="can('kds.stations.update')" class="ui-btn ui-btn--ghost ui-btn--sm" @click="openModal(row)">Edit</button>
        <button v-if="can('kds.stations.delete')" class="ui-btn ui-btn--danger ui-btn--sm" @click="del(row.id)">Delete</button>
      </template>
    </DataTable>

    <Modal v-model="showModal" :title="form.id ? 'Edit Station' : 'Add KDS Station'" width="560px">
      <div class="form-grid-2">
        <FormField v-model="form.name" label="Station Name *" placeholder="e.g. Grill, Cold Kitchen" :error="form.errors.name" />
        <FormField v-model="form.branch_id" label="Branch" type="select" :error="form.errors.branch_id">
          <option value="">All Branches</option>
          <option v-for="b in props.branches" :key="b.id" :value="b.id">{{ b.name }}</option>
        </FormField>
        <div class="ui-field">
          <label class="ui-label">Accent Color</label>
          <div class="kds-stn__color-row">
            <input v-model="form.color" type="color" class="kds-stn__color-input" />
            <span class="kds-stn__color-val">{{ form.color }}</span>
            <span class="kds-stn__preview" :style="{ background: form.color }">Preview</span>
          </div>
        </div>
        <FormField v-model.number="form.sort_order" label="Sort Order" type="number" placeholder="0" :error="form.errors.sort_order" />
      </div>
      <FormField v-model="form.description" label="Description" type="textarea" placeholder="Optional — shown on the board" :error="form.errors.description" />

      <div class="ui-field">
        <label class="ui-label">Handles Categories</label>
        <p class="kds-stn__hint">Leave all unchecked to handle every category.</p>
        <div class="kds-stn__cats-grid">
          <label v-for="cat in props.categories" :key="cat.id" class="kds-stn__cat-label">
            <input type="checkbox" :value="cat.id" v-model="form.category_ids" />
            <span>{{ cat.name }}</span>
          </label>
        </div>
      </div>

      <FormField v-model="form.is_active" label="Status" type="select">
        <option :value="true">Active</option>
        <option :value="false">Inactive</option>
      </FormField>

      <template #footer>
        <button class="ui-btn ui-btn--ghost" @click="showModal = false">Cancel</button>
        <button class="ui-btn ui-btn--primary" :disabled="form.processing" @click="save">Save</button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { confirmDialog } from "../../composables/useNotifications";
import { ref } from 'vue';
import { router, useForm } from '@inertiajs/vue3';
import AdminLayout from '../../layouts/AdminLayout.vue';
import PageHeader from '../../components/ui/PageHeader.vue';
import DataTable from '../../components/ui/DataTable.vue';
import Modal from '../../components/ui/Modal.vue';
import FormField from '../../components/ui/FormField.vue';
import { usePermissions } from '../../composables/usePermissions';

defineOptions({ layout: AdminLayout });
const { can } = usePermissions();

const props = defineProps({
  stations:   { type: Array, default: () => [] },
  branches:   { type: Array, default: () => [] },
  categories: { type: Array, default: () => [] },
});

const columns = [
  { key: 'color',       label: 'Color' },
  { key: 'name',        label: 'Station' },
  { key: 'branch_name', label: 'Branch' },
  { key: 'category_ids',label: 'Categories' },
  { key: 'sort_order',  label: 'Order' },
  { key: 'is_active',   label: 'Status' },
];

const catName = id => props.categories.find(c => c.id === id)?.name ?? id;

const showModal = ref(false);
const form = useForm({ id: null, name: '', branch_id: '', color: '#6366f1',
  description: '', category_ids: [], is_active: true, sort_order: 0 });

const openModal = (row = null) => {
  form.reset(); form.clearErrors();
  if (row) Object.assign(form, { ...row, branch_id: row.branch_id ?? '', category_ids: row.category_ids ?? [] });
  showModal.value = true;
};

const save = () => {
  const opts = { preserveScroll: true, onSuccess: () => (showModal.value = false) };
  form.id ? form.put(`/kds/stations/${form.id}`, opts) : form.post('/kds/stations', opts);
};

const del = async id => {
  if (!(await confirmDialog('Delete this station?'))) return;
  router.delete(`/kds/stations/${id}`, { preserveScroll: true });
};
</script>

<style scoped>
.form-grid-2       { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; }
.kds-stn__dot      { display: inline-block; width: 16px; height: 16px; border-radius: 50%; }
.kds-stn__color-row{ display: flex; align-items: center; gap: 10px; margin-top: 4px; }
.kds-stn__color-input { width: 44px; height: 36px; border: none; border-radius: 6px; cursor: pointer; padding: 2px; }
.kds-stn__color-val { font-size: 0.8rem; color: var(--text-soft); font-family: monospace; }
.kds-stn__preview  { color: #fff; font-size: 0.75rem; font-weight: 700; padding: 4px 10px; border-radius: 6px; }
.kds-stn__hint     { font-size: 0.78rem; color: var(--text-soft); margin: 0 0 8px; }
.kds-stn__cats-grid{ display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 6px 12px; }
.kds-stn__cat-label{ display: flex; align-items: center; gap: 8px; font-size: 0.875rem; cursor: pointer; }
.kds-stn__cats     { display: flex; flex-wrap: wrap; gap: 4px; }
</style>
