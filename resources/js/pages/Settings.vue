<template>
  <div class="page">
    <PageHeader title="Settings" subtitle="Manage application settings and branding.">
      <template #actions>
        <button v-if="can('settings.create')" class="ui-btn ui-btn--primary" @click="openModal">+ Add Settings</button>
      </template>
    </PageHeader>

    <DataTable :columns="columns" :rows="props.settings" index searchable search-placeholder="Search settings…">
      <template #cell:logo="{ row }">
        <div class="settings-logo-cell">
          <img
            v-if="logoSrc(row.logo)"
            :src="logoSrc(row.logo)"
            :alt="`${row.company || row.name || 'Company'} logo`"
            class="settings-logo-cell__image"
          />
          <span v-else class="settings-logo-cell__fallback">{{ logoInitial(row) }}</span>
        </div>
      </template>

      <template #actions="{ row }">
        <button v-if="can('settings.update')" class="ui-btn ui-btn--ghost ui-btn--sm" @click="editSetting(row)">Edit</button>
        <button v-if="can('settings.delete')" class="ui-btn ui-btn--danger ui-btn--sm" @click="deleteSetting(row.id)">Delete</button>
      </template>
    </DataTable>

    <Modal v-model="showModal" :title="form.id ? 'Edit Settings' : 'Add Settings'" width="560px">
      <FormField v-model="form.name" label="Name" placeholder="Name" :error="form.errors.name" />
      <FormField v-model="form.company" label="Company" placeholder="Company" :error="form.errors.company" />
      <FormField v-model="form.address" label="Address" type="textarea" placeholder="Address" :error="form.errors.address" />
      <FormField v-model="form.email" label="Email" type="email" placeholder="Email" :error="form.errors.email" />
      <FormField v-model="form.phone" label="Phone" placeholder="Phone" :error="form.errors.phone" />
      <FormField v-model="form.message" label="Message" type="textarea" placeholder="Footer Message" :error="form.errors.message" />

      <div class="ui-field">
        <label class="ui-label">Logo</label>
        <input type="file" class="ui-input" accept="image/*" @change="handleFileUpload" />
        <p v-if="form.errors.logo" class="ui-field__error">{{ form.errors.logo }}</p>
        <div style="margin-top: 10px" v-if="previewUrl">
          <img :src="previewUrl" alt="Preview" style="max-width: 120px; border-radius: 8px" />
        </div>
        <img
          v-else-if="existingLogo"
          :src="logoSrc(existingLogo)"
          alt="Logo"
          style="max-width: 120px; margin-top: 10px; border-radius: 8px"
        />
      </div>

      <template #footer>
        <button class="ui-btn ui-btn--ghost" @click="showModal = false">Cancel</button>
        <button class="ui-btn ui-btn--primary" :disabled="form.processing" @click="saveSetting">
          {{ form.processing ? "Saving…" : "Save" }}
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { confirmDialog } from "../composables/useNotifications";
import { ref } from "vue";
import { useForm, router } from "@inertiajs/vue3";
import AdminLayout from "../layouts/AdminLayout.vue";
import PageHeader from "../components/ui/PageHeader.vue";
import DataTable from "../components/ui/DataTable.vue";
import Modal from "../components/ui/Modal.vue";
import FormField from "../components/ui/FormField.vue";
import { usePermissions } from "../composables/usePermissions";

// Persistent layout — renders the sidebar + topbar around this page.
defineOptions({ layout: AdminLayout });

const { can } = usePermissions();

const props = defineProps({
  settings: { type: Array, default: () => [] },
});

const columns = [
  { key: "logo", label: "Logo", width: "110px" },
  { key: "company", label: "Company" },
  { key: "address", label: "Address" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
];

const showModal = ref(false);
const previewUrl = ref(null);
// The saved logo path (string) for the row being edited — shown as-is and never
// re-submitted (it would fail the `image` rule; the controller keeps it).
const existingLogo = ref(null);

const form = useForm({
  id: null,
  name: "",
  company: "",
  address: "",
  email: "",
  phone: "",
  message: "",
  logo: null,
});

const openModal = () => {
  form.reset();
  form.clearErrors();
  existingLogo.value = null;
  previewUrl.value = null;
  showModal.value = true;
};

const editSetting = (s) => {
  form.clearErrors();
  form.id = s.id;
  form.name = s.name ?? "";
  form.company = s.company ?? "";
  form.address = s.address ?? "";
  form.email = s.email ?? "";
  form.phone = s.phone ?? "";
  form.message = s.message ?? "";
  form.logo = null; // only send a logo when the user picks a new file
  existingLogo.value = typeof s.logo === "string" ? s.logo : null;
  previewUrl.value = null;
  showModal.value = true;
};

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    form.logo = file;
    previewUrl.value = URL.createObjectURL(file);
  }
};

const logoSrc = (path) => {
  if (!path || typeof path !== "string") return null;
  if (/^(https?:)?\/\//.test(path) || path.startsWith("/")) return path;
  return `/${path}`;
};

const logoInitial = (setting) =>
  (setting?.company || setting?.name || "G").trim().charAt(0).toUpperCase();

const saveSetting = () => {
  const isEdit = !!form.id;
  const url = isEdit ? `/settings/${form.id}` : "/settings";

  form
    .transform((data) => {
      const { id, ...rest } = data;
      // Drop the logo key unless a new File was chosen — a stale string path
      // would fail validation, and the controller retains the current logo.
      if (!(rest.logo instanceof File)) delete rest.logo;
      // PHP can't parse a multipart PUT body, so edits POST with a spoofed _method.
      return isEdit ? { ...rest, _method: "put" } : rest;
    })
    .post(url, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => {
        showModal.value = false;
        form.reset();
        previewUrl.value = null;
        existingLogo.value = null;
      },
    });
};

const deleteSetting = async (id) => {
  if (!(await confirmDialog("Are you sure?"))) return;
  router.delete(`/settings/${id}`, { preserveScroll: true });
};
</script>

<style scoped>
.settings-logo-cell {
  display: inline-grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: #fff;
  overflow: hidden;
}

.settings-logo-cell__image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 4px;
}

.settings-logo-cell__fallback {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  color: #fff;
  background: var(--brand);
  font-weight: 800;
}
</style>
