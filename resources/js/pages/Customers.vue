<template>
  <div class="page">
    <PageHeader title="Customers" subtitle="Manage customer records.">
      <template #actions>
        <button class="ui-btn ui-btn--ghost" @click="openCompose">Message a Number</button>
        <button v-if="can('customers.create')" class="ui-btn ui-btn--primary" @click="openModal">+ Add Customer</button>
      </template>
    </PageHeader>

    <DataTable
      :columns="columns"
      :rows="rows"
      index
      searchable
      v-model:query="search"
      search-placeholder="Search customers…"
      empty-text="No customers found."
    >
      <template #cell:name="{ row }">
        <button class="cust-name-btn" @click="openOrders(row)" :title="`View ${row.name}'s details`">
          {{ row.name }}
        </button>
      </template>
      <template #actions="{ row }">
        <button
          class="ui-btn ui-btn--ghost ui-btn--sm ui-btn-icon"
          :class="{ 'has-unread': getUnreadCount(row.contact) > 0 }"
          @click="openChat(row)"
          title="Chat on WhatsApp"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          <span v-if="getUnreadCount(row.contact) > 0" class="unread-badge">{{ getUnreadCount(row.contact) }}</span>
        </button>
        <button
          class="ui-btn ui-btn--ghost ui-btn--sm ui-btn-icon ui-btn-icon--call"
          :class="{ 'has-calls': getCallCount(row.contact) > 0 }"
          @click="openCalls(row)"
          title="Call history"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
          </svg>
          <span v-if="getCallCount(row.contact) > 0" class="call-badge">{{ getCallCount(row.contact) }}</span>
        </button>
        <button v-if="can('customers.update')" class="ui-btn ui-btn--ghost ui-btn--sm" @click="editCustomer(row)">Edit</button>
        <button v-if="can('customers.delete')" class="ui-btn ui-btn--danger ui-btn--sm" @click="deleteCustomer(row.id)">Delete</button>
      </template>
    </DataTable>

    <Pagination :paginator="props.customers" :only="['customers']" />

    <Modal v-model="showModal" :title="form.id ? 'Edit Customer' : 'Add Customer'" width="560px">
      <FormField v-model="form.name" label="Name" placeholder="Name" :error="form.errors.name" />
      <FormField v-model="form.email" label="Email" type="email" placeholder="Email" :error="form.errors.email" />
      <FormField v-model="form.contact" label="Contact" placeholder="Contact" :error="form.errors.contact" />
      <FormField v-model="form.address" label="Address" type="textarea" placeholder="Address" :error="form.errors.address" />
      <FormField v-model="form.date_of_birth" label="Date of Birth" type="date" :error="form.errors.date_of_birth" />
      <template #footer>
        <button class="ui-btn ui-btn--ghost" @click="showModal = false">Cancel</button>
        <button class="ui-btn ui-btn--primary" @click="saveCustomer" :disabled="form.processing">Save</button>
      </template>
    </Modal>

    <!-- WhatsApp Chat Modal -->
    <Modal v-model="showChat" width="440px" hide-header flush>
      <!-- Custom WhatsApp header -->
      <div class="chat-header">
        <div class="chat-header__avatar">{{ (chatCustomer?.name || '?').charAt(0).toUpperCase() }}</div>
        <div class="chat-header__info">
          <div class="chat-header__name">{{ chatCustomer?.name || 'Unknown' }}</div>
          <div class="chat-header__number">{{ chatCustomer?.contact }}</div>
        </div>
        <button class="chat-header__close" @click="showChat = false">&times;</button>
      </div>

      <div class="chat-container">
        <div class="chat-messages" ref="messagesContainer">
          <div v-if="!whatsappConnected" class="chat-banner">
            WhatsApp not connected — showing saved messages
          </div>
          <div v-if="loadingMessages" class="chat-notice">Loading messages…</div>
          <div v-else-if="displayMessages.length === 0" class="chat-empty">No messages yet</div>
          <template v-else>
            <div
              v-for="msg in displayMessages"
              :key="msg.key"
              class="chat-message"
              :class="{ 'chat-message--outgoing': msg.direction === 'outgoing' }"
            >
              <div class="chat-message__bubble">
                <template v-if="msg.media">
                  <img
                    v-if="msg.media.kind === 'image' || msg.media.kind === 'sticker'"
                    :src="msg.media.url"
                    class="chat-message__image"
                    :class="{ 'chat-message__image--sticker': msg.media.kind === 'sticker' }"
                    @click="openImage(msg.media.url)"
                    alt="attachment"
                  />
                  <video
                    v-else-if="msg.media.kind === 'video'"
                    :src="msg.media.url"
                    class="chat-message__video"
                    controls
                    preload="metadata"
                  ></video>
                  <audio
                    v-else-if="msg.media.kind === 'audio'"
                    :src="msg.media.url"
                    class="chat-message__audio"
                    controls
                    preload="metadata"
                  ></audio>
                  <a
                    v-else
                    :href="msg.media.url"
                    :download="msg.media.filename"
                    target="_blank"
                    rel="noopener"
                    class="chat-message__doc"
                  >
                    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    <span class="chat-message__doc-name">{{ msg.media.filename }}</span>
                  </a>
                </template>
                <div v-if="msg.text" class="chat-message__text">{{ msg.text }}</div>
                <div class="chat-message__time">{{ formatMessageTime(msg.timestamp) }}</div>
              </div>
            </div>
          </template>
        </div>

        <!-- Attachment preview before sending -->
        <div v-if="attachment" class="chat-attachment">
          <img v-if="attachmentIsImage" :src="attachmentPreview" class="chat-attachment__thumb" alt="preview" />
          <div v-else class="chat-attachment__icon">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <span class="chat-attachment__name">{{ attachment.name }}</span>
          <button class="chat-attachment__remove" @click="clearAttachment">&times;</button>
        </div>

        <div class="chat-input-row">
          <button
            class="chat-attach-btn"
            title="Attach file"
            :disabled="!whatsappConnected || sendingMessage"
            @click="$refs.fileInput.click()"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
            </svg>
          </button>
          <input
            ref="fileInput"
            type="file"
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
            class="chat-file-input"
            @change="onFileSelected"
          />
          <input
            v-model="messageInput"
            type="text"
            class="chat-input"
            placeholder="Type a message"
            @keyup.enter="sendMessage"
            :disabled="!whatsappConnected || sendingMessage"
          />
          <button
            class="chat-send-btn"
            @click="sendMessage"
            :disabled="(!messageInput.trim() && !attachment) || !whatsappConnected || sendingMessage"
            title="Send"
          >
            <svg v-if="!sendingMessage" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
            <span v-else class="chat-send-spinner"></span>
          </button>
        </div>
      </div>
    </Modal>

    <!-- Incoming call notification -->
    <Modal v-model="showCall" title="WHATSAPP" width="360px">
      <div class="call-card">
        <div class="call-avatar">{{ (incomingCall?.name || incomingCall?.number || '?').charAt(0).toUpperCase() }}</div>
        <div class="call-name">{{ incomingCall?.name || 'Unknown' }}</div>
        <div class="call-number">{{ incomingCall?.number }}</div>
        <div class="call-status">Incoming voice call…</div>
        <button class="call-reject" title="Reject call" @click="rejectIncomingCall">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M21 15.46l-5.27-.61-2.52 2.52a15.045 15.045 0 01-6.59-6.59l2.53-2.53L8.54 3H3.03C2.45 13.18 10.82 21.55 21 20.97v-5.51z"/>
          </svg>
        </button>
      </div>
    </Modal>

    <!-- Compose to any number -->
    <Modal v-model="showCompose" title="Message a Number" width="480px">
      <FormField
        v-model="composeNumber"
        label="Phone Number"
        placeholder="e.g. 923001234567 (country code, digits only)"
      />
      <p v-if="matchedCustomer" class="compose-match">
        Matches customer: <strong>{{ matchedCustomer.name }}</strong>
      </p>
      <template #footer>
        <button class="ui-btn ui-btn--ghost" @click="showCompose = false">Cancel</button>
        <button
          class="ui-btn ui-btn--primary"
          :disabled="normalizeNumber(composeNumber).length < 7"
          @click="startComposeChat"
        >
          Start Chat
        </button>
      </template>
    </Modal>

    <!-- Customer order details -->
    <Modal v-model="showOrders" :title="`Orders — ${ordersCustomer?.name || ''}`" width="640px">
      <p v-if="ordersLoading" class="ord-hint">Loading orders…</p>
      <template v-else>
        <div class="ord-summary">
          <div><span>Total Orders</span><strong>{{ customerOrders.length }}</strong></div>
          <div><span>Total Spent</span><strong>{{ money(customerOrdersTotal) }}</strong></div>
          <div><span>Contact</span><strong>{{ ordersCustomer?.contact || "—" }}</strong></div>
          <div><span>Date of Birth</span><strong>{{ formatDate(ordersCustomer?.date_of_birth) }}</strong></div>
        </div>

        <div class="ord-detail">
          <span>Address</span>
          <p>{{ ordersCustomer?.address || "—" }}</p>
        </div>

        <p v-if="!customerOrders.length" class="ord-hint">This customer has no orders yet.</p>

        <div v-for="o in customerOrders" :key="o.id" class="ord-card">
          <div class="ord-card__head">
            <strong>Order #{{ o.id }}</strong>
            <span class="ui-badge" :class="statusClass(o.status)">{{ o.status || "—" }}</span>
            <span class="ui-badge" :class="o.paid ? 'ui-badge--success' : 'ui-badge--muted'">
              {{ o.paid ? "Paid" : "Unpaid" }}
            </span>
            <span class="ord-card__type">{{ typeLabel(o.type) }}</span>
            <span class="ord-card__date">{{ dateTime(o.order_datetime) }}</span>
          </div>

          <table class="data-table ord-items">
            <thead>
              <tr>
                <th>Item</th>
                <th style="text-align: center">Qty</th>
                <th style="text-align: right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!orderLines(o).length">
                <td colspan="3" class="data-table__empty">No items on this order.</td>
              </tr>
              <tr v-for="it in orderLines(o)" :key="it.id">
                <td>
                  {{ itemName(it.fooditems_id) }}
                  <small v-if="it.add_note" class="ord-note">{{ it.add_note }}</small>
                </td>
                <td style="text-align: center">{{ it.quantity }}</td>
                <td style="text-align: right">{{ money(it.sub_total) }}</td>
              </tr>
            </tbody>
          </table>

          <div class="ord-card__foot">
            <span>Grand Total</span>
            <strong>{{ money(o.grand_total) }}</strong>
          </div>
        </div>
      </template>

      <template #footer>
        <button class="ui-btn ui-btn--ghost" @click="showOrders = false">Close</button>
      </template>
    </Modal>

    <!-- Customer call history -->
    <Modal v-model="showCalls" :title="`Calls — ${callsCustomer?.name || ''}`" width="440px">
      <p class="ord-summary ord-summary--calls">
        <span>{{ customerCalls.length }} recent call{{ customerCalls.length === 1 ? '' : 's' }}</span>
      </p>
      <p v-if="!customerCalls.length" class="ord-hint">No recent calls for this number.</p>
      <ul v-else class="call-list">
        <li v-for="(c, i) in customerCalls" :key="c.id || c.callId || i" class="call-list__item">
          <span class="call-list__icon" :class="`call-list__icon--${callDirection(c)}`">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
            </svg>
          </span>
          <span class="call-list__meta">
            <span class="call-list__dir">{{ callDirection(c) === 'outgoing' ? 'Outgoing' : 'Incoming' }} call</span>
            <span class="call-list__time">{{ formatMessageTime(callTime(c)) }}</span>
          </span>
          <span class="ui-badge" :class="callStatusClass(c.status)">{{ c.status || "—" }}</span>
        </li>
      </ul>

      <template #footer>
        <button class="ui-btn ui-btn--ghost" @click="showCalls = false">Close</button>
      </template>
    </Modal>

    <!-- Image lightbox -->
    <div v-if="lightboxUrl" class="chat-lightbox" @click="closeImage">
      <img :src="lightboxUrl" class="chat-lightbox__img" alt="attachment" />
    </div>
  </div>
</template>

<script setup>
import { alertDialog, confirmDialog } from "../composables/useNotifications";
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from "vue";
import { router, useForm } from "@inertiajs/vue3";
import AdminLayout from "../layouts/AdminLayout.vue";
import { whatsapp } from "../services/whatsapp";
import PageHeader from "../components/ui/PageHeader.vue";
import DataTable from "../components/ui/DataTable.vue";
import Pagination from "../components/ui/Pagination.vue";
import Modal from "../components/ui/Modal.vue";
import FormField from "../components/ui/FormField.vue";
import { usePermissions } from "../composables/usePermissions";

defineOptions({ layout: AdminLayout });

const { can } = usePermissions();

const props = defineProps({
  // Laravel paginator: { data, links, from, to, total, current_page, ... }.
  // The full customer table is never shipped — only the current 20-row slice.
  customers: { type: Object, default: () => ({ data: [] }) },
  filters: { type: Object, default: () => ({ search: "" }) },
  orders: { type: Array, default: () => [] },
  foodItems: { type: Array, default: () => [] },
});

const columns = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "contact", label: "Contact" },
];

// The visible slice for the current page. After any create/update/delete the
// controller redirects back and Inertia refreshes this prop automatically.
const rows = computed(() => props.customers?.data ?? []);

// Server-driven search: typing issues a debounced partial reload that re-runs
// the paginated query (only the `customers` prop) with the new term, resetting
// to page 1. The whole table is far too large to filter client-side.
const search = ref(props.filters?.search ?? "");
let searchTimer = null;
watch(search, (value) => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    router.get(
      "/customers",
      { search: value || undefined },
      { preserveState: true, preserveScroll: true, replace: true, only: ["customers", "filters"] }
    );
  }, 300);
});

const showModal = ref(false);
const form = useForm({ id: null, name: "", email: "", contact: "", address: "", date_of_birth: "" });

// ---- WhatsApp chat state ----
const showChat = ref(false);
const chatCustomer = ref(null);
const messages = ref([]);
const messageInput = ref("");
const loadingMessages = ref(false);
const sendingMessage = ref(false);
const whatsappConnected = ref(false);
const conversations = ref([]); // used only for unread-count badges
const messagesContainer = ref(null);
let pollTimer = null;

// ---- Media attachment state ----
const fileInput = ref(null);
const attachment = ref(null);
const attachmentPreview = ref("");
const attachmentIsImage = computed(() => !!attachment.value?.type?.startsWith("image/"));

const onFileSelected = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  attachment.value = file;
  // Only images need an inline preview thumbnail.
  attachmentPreview.value = file.type.startsWith("image/") ? URL.createObjectURL(file) : "";
};

const clearAttachment = () => {
  if (attachmentPreview.value) URL.revokeObjectURL(attachmentPreview.value);
  attachment.value = null;
  attachmentPreview.value = "";
  if (fileInput.value) fileInput.value.value = "";
};

// ---- Message normalisation (works for both live-API and DB shapes) ----
const MEDIA_KINDS = ["image", "video", "audio", "sticker", "document"];
// Leading media-type label the API prefixes captions with: "[Image] …",
// "[Document: file.pdf] …". Stripped so only the real caption remains.
const LABEL_PREFIX_RE = /^\[(image|photo|video|audio|voice|document|file|sticker|gif|media)(:[^\]]*)?\]\s*/i;
// Protocol / unsupported system messages that carry no user-visible content.
const NOISE_RE = /^\[(unsupported|protocolmessage|messagecontextinfo|null)[^\]]*\]$/i;

const fileNameFromUrl = (url) => {
  try {
    return decodeURIComponent(url.split("?")[0].split("/").pop()) || "file";
  } catch {
    return "file";
  }
};

/** Strip media labels and drop protocol noise from a caption/text. */
const cleanText = (raw) => {
  const stripped = (raw || "").trim().replace(LABEL_PREFIX_RE, "").trim();
  if (!stripped || NOISE_RE.test(stripped)) return "";
  return stripped;
};

/** Collapse a raw message into a uniform shape for rendering. */
const normalizeMessage = (msg, index) => {
  const rawUrl = msg.media_url || msg.mediaUrl || msg.media?.url || null;
  const mime = (msg.media_mime || msg.media?.mimetype || "").toLowerCase();
  let kind = (msg.messageType || msg.message_type || msg.type || "").toLowerCase();

  if (rawUrl && !MEDIA_KINDS.includes(kind)) {
    if (mime.startsWith("image/")) kind = "image";
    else if (mime.startsWith("video/")) kind = "video";
    else if (mime.startsWith("audio/")) kind = "audio";
    else kind = "document";
  }

  const caption = msg.media?.caption || msg.caption || "";
  const text = cleanText(caption || msg.text || msg.message || "");

  return {
    key: msg.id || `m${index}`,
    direction: msg.direction === "outgoing" ? "outgoing" : "incoming",
    timestamp: msg.timestamp,
    text,
    media: rawUrl ? { kind, url: rawUrl, mime, filename: fileNameFromUrl(rawUrl) } : null,
  };
};

// Drop protocol/empty messages that have neither text nor media to show.
const displayMessages = computed(() =>
  messages.value.map(normalizeMessage).filter((m) => m.text || m.media)
);

// ---- Image lightbox ----
const lightboxUrl = ref("");
const openImage = (url) => { lightboxUrl.value = url; };
const closeImage = () => { lightboxUrl.value = ""; };

// ---- Incoming call detection ----
const showCall = ref(false);
const incomingCall = ref(null);
let callTimer = null;
const handledCallIds = new Set();

const matchCustomerName = async (number) => {
  const c = await lookupCustomer(number);
  return c?.name || null;
};

// One poll drives both the incoming-call popup and the per-customer call
// counts. The in-flight guard stops requests stacking up when the WhatsApp
// server is slow to respond.
let callsInFlight = false;
const refreshCalls = async () => {
  if (callsInFlight) return;
  callsInFlight = true;
  try {
    const res = await whatsapp.calls({ limit: 100 });
    const calls = res.calls || [];
    allCalls.value = calls;
    // Surface the newest ringing/offer call we haven't handled/dismissed yet.
    const call = calls.find(
      (c) => !handledCallIds.has(c.id || c.callId) && (c.status === "ringing" || c.status === "offer")
    );
    if (call) {
      const number = normalizeNumber(call.from || call.number || call.callerJid);
      incomingCall.value = {
        id: call.id || call.callId,
        callerJid: call.callerJid || call.from,
        number,
        name: null,
      };
      showCall.value = true;
      // Resolve the caller's name on demand (the full customer list is no
      // longer held client-side). Guard against a newer call replacing this one
      // before the lookup resolves.
      const pendingId = incomingCall.value.id;
      matchCustomerName(number).then((name) => {
        if (name && incomingCall.value && incomingCall.value.id === pendingId) {
          incomingCall.value.name = name;
        }
      });
    }
  } catch (err) {
    // Silent — call endpoint may be unavailable.
  } finally {
    callsInFlight = false;
  }
};

const rejectIncomingCall = async () => {
  const call = incomingCall.value;
  showCall.value = false;
  if (!call) return;
  handledCallIds.add(call.id);
  try {
    await whatsapp.rejectCall(call.id, { callerJid: call.callerJid });
  } catch (err) {
    // Silent — best effort.
  }
  incomingCall.value = null;
};

// ---- Compose to any number ----
const showCompose = ref(false);
const composeNumber = ref("");

const openCompose = () => {
  composeNumber.value = "";
  showCompose.value = true;
};

// If the typed number matches a known customer, show their name. The full
// customer list isn't held client-side, so resolve it on demand (debounced)
// via /customers/lookup.
const matchedCustomer = ref(null);
let composeLookupTimer = null;
watch(composeNumber, (value) => {
  clearTimeout(composeLookupTimer);
  matchedCustomer.value = null;
  const num = normalizeNumber(value);
  if (num.length < 7) return;
  composeLookupTimer = setTimeout(async () => {
    const c = await lookupCustomer(num);
    // Ignore a stale result if the input changed while the request was in flight.
    if (c && normalizeNumber(composeNumber.value) === num) {
      matchedCustomer.value = c;
    }
  }, 300);
});

const startComposeChat = () => {
  const num = normalizeNumber(composeNumber.value);
  if (num.length < 7) return;
  showCompose.value = false;
  openChat(
    matchedCustomer.value || { name: num, contact: num }
  );
};

/** Digits-only phone number (country code, no + or spaces). */
const normalizeNumber = (n) => (n || "").replace(/\D+/g, "");

/**
 * Resolve a single customer by phone number via the server (trailing-digit
 * match). Replaces the former client-side scan of the whole customer list.
 * Returns { id, name, contact } or null.
 */
const lookupCustomer = async (number) => {
  const num = normalizeNumber(number);
  if (num.length < 7) return null;
  try {
    const res = await fetch(`/customers/lookup?contact=${encodeURIComponent(num)}`, {
      headers: { Accept: "application/json", "X-Requested-With": "XMLHttpRequest" },
      credentials: "same-origin",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
};

const getUnreadCount = (contact) => {
  const num = normalizeNumber(contact);
  if (!num) return 0;
  const conv = conversations.value.find((c) => normalizeNumber(c.number) === num);
  return conv?.unreadCount || 0;
};

// ---- Shared formatting helpers ----
const money = (v) => `$${Number(v || 0).toFixed(2)}`;
const dateTime = (v) => (v ? new Date(v).toLocaleString() : "—");
const TYPE_LABELS = { delivery: "Delivery", dining: "Dining", "on-way": "On the way" };
const typeLabel = (t) => TYPE_LABELS[t] || t || "—";
const statusClass = (s) => {
  const v = String(s || "").toLowerCase();
  if (["completed", "paid", "done"].includes(v)) return "ui-badge--success";
  if (["on-way", "on the way", "delivering", "shipped"].includes(v)) return "ui-badge--warning";
  if (["preparing", "pending", "processing", "in progress"].includes(v)) return "ui-badge--info";
  return "ui-badge--muted";
};

// ---- Customer order details ----
const showOrders = ref(false);
const ordersCustomer = ref(null);
// Orders + menu items now arrive as page props (previously fetched on demand),
// so the modal opens instantly with no loading state.
const ordersLoading = ref(false);
const allOrders = computed(() => props.orders);
const foodItems = computed(() => props.foodItems);

const itemName = (id) => foodItems.value.find((i) => i.id === id)?.name || `Item #${id}`;
const orderLines = (o) => o.order_items || o.orderItems || [];

// Orders belonging to the currently-open customer, newest first.
const customerOrders = computed(() => {
  const cid = ordersCustomer.value?.id;
  if (!cid) return [];
  return allOrders.value
    .filter((o) => o.customer_id === cid)
    .slice()
    .sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
});

const customerOrdersTotal = computed(() =>
  customerOrders.value.reduce((s, o) => s + Number(o.grand_total || 0), 0)
);

// Fetch orders + menu items once, then reuse for every customer.
const openOrders = (customer) => {
  ordersCustomer.value = customer;
  showOrders.value = true;
};

// ---- Customer call history ----
const showCalls = ref(false);
const callsCustomer = ref(null);
const allCalls = ref([]); // recent calls (all statuses) for per-customer counts

const callTime = (c) => c.timestamp || c.time || c.createdAt || c.date || null;
const callDirection = (c) =>
  (c.direction || c.type || "").toLowerCase() === "outgoing" ? "outgoing" : "incoming";
const callStatusClass = (s) => {
  const v = String(s || "").toLowerCase();
  if (["ringing", "offer"].includes(v)) return "ui-badge--info";
  if (["rejected", "missed", "declined"].includes(v)) return "ui-badge--muted";
  if (["accepted", "answered"].includes(v)) return "ui-badge--success";
  return "ui-badge--muted";
};

const callsForNumber = (contact) => {
  const num = normalizeNumber(contact);
  if (!num) return [];
  const tail = num.slice(-10);
  return allCalls.value.filter((c) => {
    const cn = normalizeNumber(c.from || c.number || c.callerJid);
    return cn && (cn === num || cn.endsWith(tail));
  });
};

const getCallCount = (contact) => callsForNumber(contact).length;

const customerCalls = computed(() => {
  const list = callsForNumber(callsCustomer.value?.contact);
  return list
    .slice()
    .sort((a, b) => new Date(callTime(b) || 0) - new Date(callTime(a) || 0));
});

const openCalls = (customer) => {
  callsCustomer.value = customer;
  showCalls.value = true;
};

const loadConnectionAndConversations = async () => {
  try {
    const status = await whatsapp.status();
    whatsappConnected.value = !!status.connected;
    const res = await whatsapp.conversations();
    conversations.value = res.conversations || [];
  } catch (err) {
    whatsappConnected.value = false;
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    const el = messagesContainer.value;
    if (el) el.scrollTop = el.scrollHeight;
  });
};

const loadMessages = async () => {
  const num = normalizeNumber(chatCustomer.value?.contact);
  if (!num) return;
  try {
    const res = await whatsapp.messages(num, { limit: 100 });
    // API returns newest first — reverse for chronological display.
    messages.value = (res.messages || []).slice().reverse();
    scrollToBottom();
  } catch (err) {
    console.error(err);
  }
};

const openChat = async (customer) => {
  const num = normalizeNumber(customer.contact);
  if (!num) {
    alertDialog("This customer has no valid contact number.");
    return;
  }
  chatCustomer.value = customer;
  messages.value = [];
  showChat.value = true;
  loadingMessages.value = true;
  await loadConnectionAndConversations();
  await loadMessages();
  loadingMessages.value = false;
  // Poll for new messages every 5s while the chat is open.
  clearInterval(pollTimer);
  pollTimer = setInterval(loadMessages, 5000);
};

const sendMessage = async () => {
  const text = messageInput.value.trim();
  const num = normalizeNumber(chatCustomer.value?.contact);
  if ((!text && !attachment.value) || !num) return;
  sendingMessage.value = true;
  try {
    let res;
    if (attachment.value) {
      const fd = new FormData();
      fd.append("number", num);
      fd.append("file", attachment.value);
      if (text) fd.append("caption", text);
      // Backend infers the media type (image/video/audio/document) from the
      // file's MIME type and routes to the right send-* endpoint.
      res = await whatsapp.sendMedia(fd);
    } else {
      res = await whatsapp.sendMessage({ number: num, message: text });
    }
    if (res.success) {
      messageInput.value = "";
      clearAttachment();
      await loadMessages();
    } else {
      alertDialog(res.message || "Failed to send message.");
    }
  } catch (err) {
    alertDialog(err.data?.message || err.message || "Failed to send message.");
  } finally {
    sendingMessage.value = false;
  }
};

const formatMessageTime = (ts) => {
  if (!ts) return "";
  return new Date(ts).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const openModal = () => {
  form.clearErrors();
  form.id = null;
  form.name = "";
  form.email = "";
  form.contact = "";
  form.address = "";
  form.date_of_birth = "";
  showModal.value = true;
};

const editCustomer = (c) => {
  form.clearErrors();
  form.id = c.id;
  form.name = c.name ?? "";
  form.email = c.email ?? "";
  form.contact = c.contact ?? "";
  form.address = c.address ?? "";
  // date_of_birth may arrive as an ISO datetime; the date input needs YYYY-MM-DD.
  form.date_of_birth = c.date_of_birth ? String(c.date_of_birth).slice(0, 10) : "";
  showModal.value = true;
};

const saveCustomer = () => {
  const opts = {
    preserveScroll: true,
    onSuccess: () => { showModal.value = false; },
  };
  if (form.id) {
    form.put(`/customers/${form.id}`, opts);
  } else {
    form.post("/customers", opts);
  }
};

const deleteCustomer = async (id) => {
  if (!(await confirmDialog("Are you sure?"))) return;
  router.delete(`/customers/${id}`, { preserveScroll: true });
};

const formatDate = (v) => (v ? new Date(v).toLocaleDateString() : "—");

// Stop polling and clear any pending attachment once the chat modal closes.
watch(showChat, (open) => {
  if (!open) {
    clearInterval(pollTimer);
    pollTimer = null;
    clearAttachment();
  }
});

onMounted(() => {
  loadConnectionAndConversations(); // populate unread badges
  // A single 5s poll drives both incoming-call detection and the count badges.
  refreshCalls();
  callTimer = setInterval(refreshCalls, 5000);
});

onBeforeUnmount(() => {
  clearInterval(pollTimer);
  clearInterval(callTimer);
});
</script>

<style scoped>
.ui-btn-icon {
  position: relative;
  color: #25d366;
}
.ui-btn-icon:hover {
  color: #1da851;
}
.unread-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background: #ef4444;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  line-height: 18px;
  text-align: center;
}
.has-unread {
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.35);
}

/* ---- Clickable customer name ---- */
.cust-name-btn {
  border: none;
  background: transparent;
  padding: 0;
  font: inherit;
  font-weight: 600;
  color: var(--brand, #4f46e5);
  cursor: pointer;
  text-align: left;
}
.cust-name-btn:hover {
  text-decoration: underline;
}

/* ---- Call icon + badge ---- */
.ui-btn-icon--call {
  color: #2563eb;
}
.ui-btn-icon--call:hover {
  color: #1d4ed8;
}
.call-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background: #2563eb;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  line-height: 18px;
  text-align: center;
}
.has-calls {
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.35);
}

/* ---- Orders / calls modals ---- */
.ord-hint {
  color: var(--text-soft);
  font-size: 0.875rem;
  padding: 8px 0;
}
.ord-summary {
  display: flex;
  gap: 28px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--border);
}
.ord-summary--calls {
  margin: 0 0 10px;
  border: none;
  padding: 0;
  color: var(--text-soft);
  font-size: 0.875rem;
}
.ord-summary > div {
  display: flex;
  flex-direction: column;
}
.ord-summary span {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-soft);
}
.ord-summary strong {
  font-size: 1.1rem;
}
.ord-detail {
  padding: 12px 0 2px;
  border-bottom: 1px solid var(--border);
}
.ord-detail span {
  display: block;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-soft);
  margin-bottom: 2px;
}
.ord-detail p {
  margin: 0;
  font-size: 0.95rem;
  white-space: pre-wrap;
  word-break: break-word;
}
.ord-card {
  border: 1px solid var(--border);
  border-radius: var(--radius-sm, 8px);
  padding: 12px 14px;
  margin-top: 14px;
}
.ord-card__head {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}
.ord-card__type {
  font-size: 0.8rem;
  color: var(--text-soft);
}
.ord-card__date {
  margin-left: auto;
  font-size: 0.78rem;
  color: var(--text-soft);
}
.ord-items {
  width: 100%;
  margin: 4px 0 10px;
}
.ord-note {
  display: block;
  color: var(--text-soft);
  font-size: 0.75rem;
}
.ord-card__foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--border);
  padding-top: 8px;
  font-size: 0.95rem;
}

/* ---- Call list ---- */
.call-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.call-list__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm, 8px);
}
.call-list__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(37, 99, 235, 0.12);
  color: #2563eb;
  flex-shrink: 0;
}
.call-list__icon--outgoing {
  background: rgba(16, 185, 129, 0.14);
  color: #059669;
}
.call-list__meta {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}
.call-list__dir {
  font-size: 0.875rem;
  font-weight: 600;
}
.call-list__time {
  font-size: 0.78rem;
  color: var(--text-soft);
}

/* ---- WhatsApp header ---- */
.chat-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: linear-gradient(135deg, #0b8577 0%, #128c7e 55%, #1aa588 100%);
  color: #fff;
}
.chat-header__avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  border: 2px solid rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  flex-shrink: 0;
}
.chat-header__info {
  flex: 1;
  min-width: 0;
}
.chat-header__name {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.2;
}
.chat-header__number {
  font-size: 13px;
  opacity: 0.9;
}
.chat-header__close {
  border: none;
  background: transparent;
  color: #fff;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  padding: 0 4px;
  opacity: 0.9;
}
.chat-header__close:hover {
  opacity: 1;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 500px;
}
.chat-notice {
  margin: auto;
  font-size: 13px;
  padding: 8px 16px;
  border-radius: 8px;
  background: rgba(255, 248, 225, 0.95);
  color: #8a6d3b;
}
.chat-notice--error {
  background: #fee2e2;
  color: #991b1b;
}
.chat-banner {
  flex-shrink: 0;
  margin: 0 0 6px;
  padding: 6px 12px;
  border-radius: 8px;
  background: #fff3cd;
  color: #8a6d3b;
  font-size: 12px;
  text-align: center;
}
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 12px 12px 8px;
  background-color: #e5ddd5;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cg fill='%23d9cfc4' fill-opacity='0.35'%3E%3Ccircle cx='4' cy='4' r='1.5'/%3E%3C/g%3E%3C/svg%3E");
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.chat-message {
  display: flex;
}
.chat-message--outgoing {
  justify-content: flex-end;
}
.chat-message__bubble {
  position: relative;
  max-width: 75%;
  padding: 6px 9px 4px;
  border-radius: 8px;
  font-size: 14px;
  background: #fff;
  box-shadow: 0 1px 0.5px rgba(11, 20, 26, 0.13);
}
.chat-message--outgoing .chat-message__bubble {
  background: #d9fdd3;
}
.chat-message__text {
  word-break: break-word;
  color: #111b21;
  line-height: 1.35;
}
.chat-message__time {
  display: block;
  font-size: 10px;
  color: #667781;
  text-align: right;
  margin-top: 2px;
}
.chat-empty {
  margin: auto;
  color: #667781;
  font-size: 13px;
  background: rgba(255, 255, 255, 0.7);
  padding: 6px 14px;
  border-radius: 8px;
}

/* ---- Input row ---- */
.chat-input-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #f0f2f5;
}
.chat-input {
  flex: 1;
  border: none;
  outline: none;
  background: #fff;
  border-radius: 22px;
  padding: 11px 18px;
  font-size: 14px;
  color: #111b21;
}
.chat-input::placeholder {
  color: #8696a0;
}
.chat-send-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  flex-shrink: 0;
  border: none;
  border-radius: 50%;
  background: #128c7e;
  color: #fff;
  cursor: pointer;
  transition: background 0.15s;
}
.chat-send-btn:hover:not(:disabled) {
  background: #0e7266;
}
.chat-send-btn:disabled {
  background: #a8c5c0;
  cursor: not-allowed;
}
.chat-send-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-top-color: #fff;
  border-radius: 50%;
  animation: chat-spin 0.7s linear infinite;
}
@keyframes chat-spin {
  to { transform: rotate(360deg); }
}

.compose-match {
  margin-top: 8px;
  font-size: 13px;
  color: #166534;
}

/* ---- Media messages ---- */
.chat-message__image {
  display: block;
  max-width: 220px;
  max-height: 240px;
  border-radius: 6px;
  cursor: pointer;
  margin-bottom: 4px;
  object-fit: cover;
}
.chat-message__image--sticker {
  max-width: 130px;
  max-height: 130px;
  object-fit: contain;
  background: transparent;
}
.chat-message__video {
  display: block;
  max-width: 240px;
  max-height: 260px;
  border-radius: 6px;
  margin-bottom: 4px;
  background: #000;
}
.chat-message__audio {
  display: block;
  width: 240px;
  max-width: 100%;
  margin-bottom: 4px;
}
.chat-message__doc {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  margin-bottom: 4px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.05);
  color: #128c7e;
  text-decoration: none;
  max-width: 240px;
}
.chat-message__doc:hover {
  background: rgba(0, 0, 0, 0.09);
}
.chat-message__doc-name {
  font-size: 13px;
  color: #111b21;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ---- Attachment preview ---- */
.chat-attachment {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: #f0f2f5;
  border-top: 1px solid #e2e5e9;
}
.chat-attachment__thumb {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid #d1d7db;
}
.chat-attachment__icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e2e8f0;
  color: #128c7e;
  flex-shrink: 0;
}
.chat-attachment__name {
  flex: 1;
  font-size: 13px;
  color: #3b4a54;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.chat-attachment__remove {
  border: none;
  background: transparent;
  font-size: 22px;
  line-height: 1;
  color: #ef4444;
  cursor: pointer;
}

/* ---- Attach button + hidden file input ---- */
.chat-attach-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border: none;
  background: transparent;
  color: #54656f;
  cursor: pointer;
  transform: rotate(45deg);
}
.chat-attach-btn:hover:not(:disabled) {
  color: #128c7e;
}
.chat-attach-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.chat-file-input {
  display: none;
}

/* ---- Image lightbox ---- */
.chat-lightbox {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);
  cursor: zoom-out;
}
.chat-lightbox__img {
  max-width: 90vw;
  max-height: 90vh;
  border-radius: 8px;
}

/* ---- Incoming call card ---- */
.call-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 8px 8px;
}
.call-avatar {
  width: 84px;
  height: 84px;
  border-radius: 50%;
  background: #25d366;
  color: #fff;
  font-size: 36px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}
.call-name {
  font-size: 18px;
  font-weight: 600;
  color: #111b21;
}
.call-number {
  font-size: 13px;
  color: #667781;
}
.call-status {
  font-size: 13px;
  color: #25d366;
  margin-bottom: 12px;
}
.call-reject {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border: none;
  border-radius: 50%;
  background: #ef4444;
  color: #fff;
  cursor: pointer;
  transform: rotate(135deg);
  transition: background 0.15s;
}
.call-reject:hover {
  background: #dc2626;
}
</style>
