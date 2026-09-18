<template>
  <div class="page">
    <PageHeader title="Customer Feedback" subtitle="Ratings against orders. Nothing is published until you say so.">
      <template #actions>
        <button v-if="can('crm.feedback.create')" class="ui-btn ui-btn--primary" @click="openModal">
          + Record Feedback
        </button>
      </template>
    </PageHeader>

    <div v-if="flashError" class="ui-alert ui-alert--danger">{{ flashError }}</div>

    <div class="stat-grid">
      <StatCard label="Total Responses" :value="props.stats.total" />
      <StatCard
        label="Average Rating"
        :value="props.stats.average ? `${props.stats.average} / 5` : '—'"
        color="var(--success)"
        tint="var(--success-soft)"
      />
      <StatCard
        label="Awaiting Reply"
        :value="props.stats.unanswered"
        color="var(--warning)"
        tint="var(--warning-soft)"
      />
      <StatCard
        label="Unhappy (1–2★)"
        :value="props.stats.negative"
        color="var(--danger)"
        tint="var(--danger-soft)"
      />
    </div>

    <div class="fb__filters">
      <FormField v-model="rating" label="Rating" type="select">
        <option value="">Any rating</option>
        <option v-for="r in [5, 4, 3, 2, 1]" :key="r" :value="r">{{ r }} star{{ r === 1 ? "" : "s" }}</option>
      </FormField>
      <FormField v-model="state" label="State" type="select">
        <option value="">All</option>
        <option value="unanswered">Awaiting reply</option>
        <option value="answered">Answered</option>
        <option value="published">Published</option>
      </FormField>
    </div>

    <DataTable
      :columns="columns"
      :rows="rows"
      index
      searchable
      v-model:query="search"
      search-placeholder="Search comment, customer or order…"
      empty-text="No feedback yet."
    >
      <template #cell:customer_name="{ row }">
        <div class="fb__who">
          <strong>{{ row.customer_name ?? "Walk-in" }}</strong>
          <span v-if="row.customer_contact" class="fb__meta">{{ row.customer_contact }}</span>
        </div>
      </template>
      <template #cell:rating="{ value }">
        <span class="fb__stars" :title="`${value} of 5`">{{ stars(value) }}</span>
      </template>
      <template #cell:order_id="{ value }">{{ value ? `#${value}` : "—" }}</template>
      <template #cell:comment="{ value }">
        <span class="fb__wrap">{{ value || "—" }}</span>
      </template>
      <template #cell:reply="{ row }">
        <div v-if="row.reply" class="fb__who">
          <span class="fb__wrap">{{ row.reply }}</span>
          <span class="fb__meta">{{ row.responder_name }} · {{ row.replied_at }}</span>
        </div>
        <span v-else class="ui-badge ui-badge--warning">Awaiting reply</span>
      </template>
      <template #cell:is_published="{ value }">
        <span class="ui-badge" :class="value ? 'ui-badge--success' : 'ui-badge--muted'">
          {{ value ? "Published" : "Hidden" }}
        </span>
      </template>
      <template #actions="{ row }">
        <button v-if="can('crm.feedback.update')" class="ui-btn ui-btn--ghost ui-btn--sm" @click="openReply(row)">
          {{ row.reply ? "Edit Reply" : "Reply" }}
        </button>
        <button
          v-if="can('crm.feedback.update')"
          class="ui-btn ui-btn--sm"
          :class="row.is_published ? 'ui-btn--ghost' : 'ui-btn--success'"
          @click="togglePublish(row)"
        >
          {{ row.is_published ? "Unpublish" : "Publish" }}
        </button>
        <button v-if="can('crm.feedback.update')" class="ui-btn ui-btn--ghost ui-btn--sm" @click="editRow(row)">
          Edit
        </button>
        <button v-if="can('crm.feedback.delete')" class="ui-btn ui-btn--danger ui-btn--sm" @click="deleteRow(row.id)">
          Delete
        </button>
      </template>
    </DataTable>

    <Pagination :paginator="props.feedbacks" :only="['feedbacks']" />

    <Modal v-model="showModal" :title="form.id ? 'Edit Feedback' : 'Record Feedback'">
      <CustomerPicker
        v-if="!form.id"
        v-model="form.customer_id"
        label="Customer (optional)"
        :error="form.errors.customer_id"
      />
      <div class="fb__grid">
        <FormField
          v-if="!form.id"
          v-model="form.order_id"
          label="Order # (optional)"
          type="number"
          :error="form.errors.order_id"
        />
        <FormField v-model="form.rating" label="Rating" type="select" :error="form.errors.rating">
          <option v-for="r in [5, 4, 3, 2, 1]" :key="r" :value="r">{{ stars(r) }} — {{ r }}</option>
        </FormField>
      </div>
      <FormField v-model="form.comment" label="Comment" type="textarea" :error="form.errors.comment" />
      <FormField v-model="form.is_published" label="Visibility" type="select" :error="form.errors.is_published">
        <option :value="false">Hidden</option>
        <option :value="true">Published</option>
      </FormField>
      <template #footer>
        <button class="ui-btn ui-btn--ghost" @click="showModal = false">Cancel</button>
        <button class="ui-btn ui-btn--primary" :disabled="form.processing" @click="save">Save</button>
      </template>
    </Modal>

    <Modal v-model="showReply" title="Reply to Feedback">
      <div v-if="active" class="fb__quote">
        <span class="fb__stars">{{ stars(active.rating) }}</span>
        <p>{{ active.comment || "No comment left." }}</p>
        <span class="fb__meta">{{ active.customer_name ?? "Walk-in" }} · {{ active.created_at }}</span>
      </div>
      <FormField v-model="rForm.reply" label="Your reply" type="textarea" :error="rForm.errors.reply" />
      <template #footer>
        <button class="ui-btn ui-btn--ghost" @click="showReply = false">Cancel</button>
        <button class="ui-btn ui-btn--primary" :disabled="rForm.processing" @click="submitReply">Save Reply</button>
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
  feedbacks: { type: Object, default: () => ({ data: [] }) },
  filters: { type: Object, default: () => ({ search: "", rating: "", state: "" }) },
  stats: { type: Object, default: () => ({ total: 0, average: 0, unanswered: 0, negative: 0 }) },
});

const flashError = computed(() => page.props.flash?.error || "");

const columns = [
  { key: "customer_name", label: "Customer" },
  { key: "rating", label: "Rating", width: "110px" },
  { key: "order_id", label: "Order", width: "80px" },
  { key: "comment", label: "Comment" },
  { key: "reply", label: "Reply" },
  { key: "is_published", label: "Visibility", width: "110px" },
  { key: "created_at", label: "Received" },
];

const rows = computed(() => props.feedbacks?.data ?? []);

const search = ref(props.filters?.search ?? "");
const rating = ref(props.filters?.rating ?? "");
const state = ref(props.filters?.state ?? "");

let searchTimer = null;
const reload = (debounce) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(
    () =>
      router.get(
        "/crm/feedback",
        {
          search: search.value || undefined,
          rating: rating.value || undefined,
          state: state.value || undefined,
        },
        { preserveState: true, preserveScroll: true, replace: true, only: ["feedbacks", "filters", "stats"] }
      ),
    debounce
  );
};
watch(search, () => reload(300));
watch([rating, state], () => reload(0));

const showModal = ref(false);
const showReply = ref(false);
const active = ref(null);

const blank = { id: null, customer_id: null, order_id: "", rating: 5, comment: "", is_published: false };
const form = useForm({ ...blank });
const rForm = useForm({ reply: "" });

const openModal = () => {
  Object.assign(form, blank);
  form.clearErrors();
  showModal.value = true;
};

const editRow = (f) => {
  Object.assign(form, {
    id: f.id,
    customer_id: f.customer_id,
    order_id: f.order_id ?? "",
    rating: f.rating,
    comment: f.comment ?? "",
    is_published: f.is_published,
  });
  form.clearErrors();
  showModal.value = true;
};

const save = () => {
  const opts = { preserveScroll: true, onSuccess: () => (showModal.value = false) };

  form.transform((data) => ({ ...data, order_id: data.order_id === "" ? null : data.order_id }));

  if (form.id) form.put(`/crm/feedback/${form.id}`, opts);
  else form.post("/crm/feedback", opts);
};

const openReply = (row) => {
  active.value = row;
  rForm.reset();
  rForm.reply = row.reply ?? "";
  rForm.clearErrors();
  showReply.value = true;
};

const submitReply = () => {
  rForm.put(`/crm/feedback/${active.value.id}/reply`, {
    preserveScroll: true,
    onSuccess: () => (showReply.value = false),
  });
};

const togglePublish = (row) => {
  router.put(`/crm/feedback/${row.id}/publish`, {}, { preserveScroll: true });
};

const deleteRow = async (id) => {
  if (!(await confirmDialog("Delete this feedback?"))) return;
  router.delete(`/crm/feedback/${id}`, { preserveScroll: true });
};

const stars = (n) => "★".repeat(Number(n) || 0) + "☆".repeat(Math.max(0, 5 - (Number(n) || 0)));
</script>

<style scoped>
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 18px;
}

.fb__filters {
  display: grid;
  grid-template-columns: 180px 200px;
  gap: 0 16px;
  margin-bottom: 14px;
}

.fb__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 16px;
}

.fb__who {
  display: flex;
  flex-direction: column;
}

.fb__meta {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.fb__wrap {
  display: block;
  max-width: 260px;
}

.fb__stars {
  color: var(--warning);
  letter-spacing: 1px;
  white-space: nowrap;
}

.fb__quote {
  padding: 12px 14px;
  margin-bottom: 14px;
  border-left: 3px solid var(--brand);
  background: var(--surface-2);
  border-radius: var(--radius-sm);
}

.fb__quote p {
  margin: 6px 0;
  font-size: 0.88rem;
  color: var(--text);
}

@media (max-width: 1100px) {
  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 860px) {
  .stat-grid,
  .fb__filters,
  .fb__grid {
    grid-template-columns: 1fr;
  }
}
</style>
