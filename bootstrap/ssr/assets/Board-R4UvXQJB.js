import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-BOaGB7Aw.js";
import { computed, mergeProps, onMounted, onUnmounted, ref, useSSRContext, watch } from "vue";
import { ssrIncludeBooleanAttr, ssrInterpolate, ssrLooseContain, ssrLooseEqual, ssrRenderAttr, ssrRenderAttrs, ssrRenderClass, ssrRenderList, ssrRenderStyle } from "vue/server-renderer";
//#region resources/js/pages/KDS/Board.vue
var POLL_MS = 5e3;
var _sfc_main = /*@__PURE__*/ Object.assign({ layout: null }, {
	__name: "Board",
	__ssrInlineRender: true,
	props: {
		stations: {
			type: Array,
			default: () => []
		},
		branches: {
			type: Array,
			default: () => []
		},
		initialStationId: {
			type: Number,
			default: null
		},
		initialBranchId: {
			type: Number,
			default: null
		}
	},
	setup(__props) {
		const props = __props;
		const selectedStation = ref(props.initialStationId ?? "");
		const selectedBranch = ref(props.initialBranchId ?? "");
		const tickets = ref([]);
		const recalled = ref([]);
		const selectedRecallOrderId = ref("");
		const recallError = ref("");
		const recallingOrder = ref(false);
		const restoredRecallItemIds = ref(/* @__PURE__ */ new Set());
		const loading = ref(true);
		const polling = ref(false);
		const clock = ref("");
		const activeStation = computed(() => props.stations.find((s) => s.id === selectedStation.value) ?? null);
		let clockTimer = null;
		const updateClock = () => {
			clock.value = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-PK", {
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit"
			});
		};
		let pollTimer = null;
		const fetchTickets = async () => {
			polling.value = true;
			try {
				const params = new URLSearchParams();
				if (selectedStation.value) params.set("station_id", selectedStation.value);
				if (selectedBranch.value) params.set("branch_id", selectedBranch.value);
				const res = await fetch(`/kds/board/tickets?${params}`, {
					headers: {
						Accept: "application/json",
						"X-Requested-With": "XMLHttpRequest"
					},
					credentials: "same-origin"
				});
				if (!res.ok) return;
				const data = await res.json();
				tickets.value = data.tickets ?? [];
			} catch (e) {} finally {
				loading.value = false;
				polling.value = false;
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
			try {
				const savedIds = JSON.parse(sessionStorage.getItem("kds-restored-recall-item-ids") || "[]");
				if (Array.isArray(savedIds)) restoredRecallItemIds.value = new Set(savedIds.map(String));
			} catch {}
			updateClock();
			clockTimer = setInterval(updateClock, 1e3);
			startPolling();
		});
		onUnmounted(() => {
			clearInterval(pollTimer);
			clearInterval(clockTimer);
		});
		const recallOrderValue = (item) => String(item.order_id ?? item.order_number ?? "").replace(/^#/, "");
		const statusStepClass = (item, step) => {
			const currentStep = {
				new: 0,
				sent: 0,
				preparing: 1,
				ready: 2
			}[item.kds_status] ?? 0;
			return {
				"is-complete": currentStep > step,
				"is-current": currentStep === step,
				"is-next": currentStep + 1 === step
			};
		};
		const TICKET_COLORS = {
			new: "#64748b",
			sent: "#6366f1",
			preparing: "#f59e0b",
			ready: "#10b981"
		};
		const ticketHeaderBg = (t) => {
			if (t.age_seconds > 600) return "#dc2626";
			const colors = [...new Set(t.items.map((i) => i.station_color).filter(Boolean))];
			if (colors.length === 1) return colors[0];
			return TICKET_COLORS[t.kds_status] ?? "#6366f1";
		};
		const stationLabel = (t) => {
			const names = [...new Set(t.items.map((i) => i.station_name).filter(Boolean))];
			return names.length === 1 ? names[0] : names.length > 1 ? "Mixed" : "";
		};
		const stationColor = (item) => item.station_color ?? "var(--kds-accent)";
		const ticketClass = (t) => ({
			"kds__ticket--new": t.kds_status === "new",
			"kds__ticket--sent": t.kds_status === "sent",
			"kds__ticket--preparing": t.kds_status === "preparing",
			"kds__ticket--ready": t.kds_status === "ready",
			"kds__ticket--urgent": t.age_seconds > 600
		});
		const ageClass = (s) => s > 600 ? "kds__age--danger" : s > 300 ? "kds__age--warn" : "kds__age--ok";
		const fmtAge = (s) => s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
		const fmtTime = (iso) => iso ? new Date(iso).toLocaleTimeString("en-PK", {
			hour: "2-digit",
			minute: "2-digit"
		}) : "";
		const typeLabel = (t) => ({
			dining: "🍽 Dine-in",
			"on-way": "🥡 Takeaway",
			delivery: "🚚 Delivery"
		})[t] ?? t;
		return (_ctx, _push, _parent, _attrs) => {
			_push(`<div${ssrRenderAttrs(mergeProps({
				class: "kds",
				style: { "--kds-accent": activeStation.value?.color ?? "#6366f1" }
			}, _attrs))} data-v-7878235a><div class="kds__topbar" data-v-7878235a><div class="kds__topbar-left" data-v-7878235a><span class="kds__logo" data-v-7878235a>🍳 KDS</span><select class="kds__select" data-v-7878235a><option value="" data-v-7878235a${ssrIncludeBooleanAttr(Array.isArray(selectedStation.value) ? ssrLooseContain(selectedStation.value, "") : ssrLooseEqual(selectedStation.value, "")) ? " selected" : ""}>All Stations</option><!--[-->`);
			ssrRenderList(props.stations, (s) => {
				_push(`<option${ssrRenderAttr("value", s.id)} data-v-7878235a${ssrIncludeBooleanAttr(Array.isArray(selectedStation.value) ? ssrLooseContain(selectedStation.value, s.id) : ssrLooseEqual(selectedStation.value, s.id)) ? " selected" : ""}>${ssrInterpolate(s.name)}</option>`);
			});
			_push(`<!--]--></select><select class="kds__select" data-v-7878235a><option value="" data-v-7878235a${ssrIncludeBooleanAttr(Array.isArray(selectedBranch.value) ? ssrLooseContain(selectedBranch.value, "") : ssrLooseEqual(selectedBranch.value, "")) ? " selected" : ""}>All Branches</option><!--[-->`);
			ssrRenderList(props.branches, (b) => {
				_push(`<option${ssrRenderAttr("value", b.id)} data-v-7878235a${ssrIncludeBooleanAttr(Array.isArray(selectedBranch.value) ? ssrLooseContain(selectedBranch.value, b.id) : ssrLooseEqual(selectedBranch.value, b.id)) ? " selected" : ""}>${ssrInterpolate(b.name)}</option>`);
			});
			_push(`<!--]--></select></div><div class="kds__topbar-right" data-v-7878235a><span class="kds__clock" data-v-7878235a>${ssrInterpolate(clock.value)}</span><span class="${ssrRenderClass([{ "kds__poll--live": polling.value }, "kds__poll"])}" data-v-7878235a>● LIVE</span><a href="/kds/stations" class="kds__cfg-btn" data-v-7878235a>⚙ Stations</a></div></div><div class="kds__board" data-v-7878235a><div${ssrRenderAttrs({
				name: "ticket-fade",
				class: "kds__grid"
			})} data-v-7878235a>`);
			ssrRenderList(tickets.value, (ticket) => {
				_push(`<div class="${ssrRenderClass([ticketClass(ticket), "kds__ticket"])}" data-v-7878235a><div class="kds__ticket-hdr" style="${ssrRenderStyle({ background: ticketHeaderBg(ticket) })}" data-v-7878235a><div class="kds__ticket-id" data-v-7878235a>${ssrInterpolate(ticket.order_number)}</div><div class="kds__ticket-meta" data-v-7878235a><span class="kds__ticket-type" data-v-7878235a>${ssrInterpolate(typeLabel(ticket.type))}</span>`);
				if (stationLabel(ticket)) _push(`<span class="kds__ticket-station" data-v-7878235a>🏷 ${ssrInterpolate(stationLabel(ticket))}</span>`);
				else _push(`<!---->`);
				_push(`<span class="${ssrRenderClass([ageClass(ticket.age_seconds), "kds__ticket-age"])}" data-v-7878235a>${ssrInterpolate(fmtAge(ticket.age_seconds))}</span></div><button class="kds__bump-all" title="Bump entire order" data-v-7878235a> ✓ All Done </button></div><div class="kds__items" data-v-7878235a><!--[-->`);
				ssrRenderList(ticket.items, (item) => {
					_push(`<div class="${ssrRenderClass(["kds__item--" + item.kds_status, "kds__item"])}" data-v-7878235a><div class="kds__item-left" data-v-7878235a><span class="kds__item-qty" style="${ssrRenderStyle({ color: stationColor(item) })}" data-v-7878235a>× ${ssrInterpolate(item.qty)}</span><div class="kds__item-detail" data-v-7878235a><span class="kds__item-name" data-v-7878235a>${ssrInterpolate(item.name)}</span>`);
					if (item.note) _push(`<span class="kds__item-note" data-v-7878235a>📝 ${ssrInterpolate(item.note)}</span>`);
					else _push(`<!---->`);
					_push(`</div></div><div class="kds__item-actions kds__item-status-flow" data-v-7878235a><button class="${ssrRenderClass([statusStepClass(item, 0), "kds__step"])}" disabled data-v-7878235a>Pending</button><button class="${ssrRenderClass([statusStepClass(item, 1), "kds__step"])}"${ssrIncludeBooleanAttr(!["new", "sent"].includes(item.kds_status)) ? " disabled" : ""} data-v-7878235a>Prep</button><button class="${ssrRenderClass([statusStepClass(item, 2), "kds__step"])}"${ssrIncludeBooleanAttr(item.kds_status !== "preparing") ? " disabled" : ""} data-v-7878235a>Ready</button><button class="${ssrRenderClass([statusStepClass(item, 3), "kds__step kds__step--done"])}"${ssrIncludeBooleanAttr(item.kds_status !== "ready") ? " disabled" : ""} data-v-7878235a>✓</button></div></div>`);
				});
				_push(`<!--]--></div><div class="kds__ticket-ftr" data-v-7878235a><span class="kds__status-badge kds__status-badge--{{ ticket.kds_status }}" data-v-7878235a>${ssrInterpolate(ticket.kds_status.toUpperCase())}</span><span class="kds__placed" data-v-7878235a>${ssrInterpolate(fmtTime(ticket.placed_at))}</span></div></div>`);
			});
			_push(`</div>`);
			if (!loading.value && tickets.value.length === 0) _push(`<div class="kds__empty" data-v-7878235a><div class="kds__empty-icon" data-v-7878235a>✅</div><p data-v-7878235a>No active tickets — kitchen is clear!</p></div>`);
			else _push(`<!---->`);
			if (loading.value && tickets.value.length === 0) _push(`<div class="kds__empty" data-v-7878235a><div class="kds__spin" data-v-7878235a></div><p data-v-7878235a>Loading tickets…</p></div>`);
			else _push(`<!---->`);
			_push(`</div>`);
			if (recalled.value.length) {
				_push(`<div class="kds__recall-bar" data-v-7878235a><span class="kds__recall-label" data-v-7878235a>Recalled:</span><button class="kds__recall-all"${ssrIncludeBooleanAttr(recallingOrder.value) ? " disabled" : ""} data-v-7878235a>↩ Recall All</button><!--[-->`);
				ssrRenderList(recalled.value, (item) => {
					_push(`<button class="${ssrRenderClass([{ "is-selected": selectedRecallOrderId.value === recallOrderValue(item) }, "kds__recall-chip"])}" data-v-7878235a> ↩ Order #${ssrInterpolate(item.order_number)} · ${ssrInterpolate(item.name)}</button>`);
				});
				_push(`<!--]--><button class="kds__last-recall"${ssrIncludeBooleanAttr(recallingOrder.value) ? " disabled" : ""} data-v-7878235a>${ssrInterpolate(recallingOrder.value ? "Recalling…" : "Last Recall")}</button>`);
				if (recallError.value) _push(`<span class="kds__recall-error" role="alert" data-v-7878235a>${ssrInterpolate(recallError.value)}</span>`);
				else _push(`<!---->`);
				_push(`</div>`);
			} else _push(`<!---->`);
			_push(`</div>`);
		};
	}
});
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/pages/KDS/Board.vue");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var Board_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["__scopeId", "data-v-7878235a"]]);
//#endregion
export { Board_default as default };
