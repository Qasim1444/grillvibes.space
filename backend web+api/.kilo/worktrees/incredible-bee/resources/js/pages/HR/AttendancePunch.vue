<template>
  <div class="page punch-page">
    <PageHeader title="Attendance punch" :subtitle="`Hello ${props.employee.name}. Your location is checked before each punch.`" />

    <div class="punch-panel ui-card ui-card-pad">
      <div class="punch-panel__status" :class="`punch-panel__status--${props.state}`">
        <span class="punch-panel__dot" aria-hidden="true"></span>
        <div>
          <strong>{{ stateTitle }}</strong>
          <p>{{ stateMessage }}</p>
        </div>
      </div>

      <p v-if="props.branch" class="punch-panel__branch">
        {{ props.branch.name }} · allowed within {{ props.branch.attendance_radius_meters }}m
      </p>
      <p v-else-if="props.locationIssue === 'no_place'" class="ui-alert ui-alert--danger">
        Your employee profile has no place assigned. Ask HR to assign your place and branch.
      </p>
      <p v-else-if="props.locationIssue === 'no_branch'" class="ui-alert ui-alert--danger">
        Your assigned place has no branch. Ask HR to assign this place to a branch.
      </p>
      <p v-else-if="props.locationIssue === 'not_configured'" class="ui-alert ui-alert--danger">
        Your branch has not configured an attendance location.
      </p>
      <p v-if="form.errors.location" class="ui-alert ui-alert--danger">{{ form.errors.location }}</p>
      <p v-if="form.recentlySuccessful" class="ui-alert ui-alert--success">Attendance updated.</p>

      <button
        class="ui-btn ui-btn--primary punch-panel__button"
        :disabled="form.processing || props.state === 'complete' || !props.branch"
        @click="punch"
      >
        {{ form.processing ? "Checking location…" : buttonLabel }}
      </button>

      <p class="punch-panel__privacy">Only the coordinates, accuracy, distance, and time needed to verify attendance are recorded.</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useForm } from "@inertiajs/vue3";
import AdminLayout from "../../layouts/AdminLayout.vue";
import PageHeader from "../../components/ui/PageHeader.vue";

defineOptions({ layout: AdminLayout });

const props = defineProps({
  employee: { type: Object, default: () => ({ name: "Employee" }) },
  branch: { type: Object, default: null },
  state: { type: String, default: "check_in" },
  locationIssue: { type: String, default: null },
});

const form = useForm({ latitude: null, longitude: null, accuracy: null });
const stateTitle = computed(() => ({ check_in: "Ready to check in", check_out: "Ready to check out", complete: "Attendance complete" }[props.state]));
const stateMessage = computed(() => ({ check_in: "Allow location access, then record your arrival.", check_out: "Allow location access, then record your departure.", complete: "Both check-in and check-out are already recorded for today." }[props.state]));
const buttonLabel = computed(() => props.state === "check_out" ? "Check out" : "Check in");

const punch = () => {
  form.clearErrors();
  if (!navigator.geolocation) {
    form.setError("location", "This browser does not support location services.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      form.latitude = position.coords.latitude;
      form.longitude = position.coords.longitude;
      form.accuracy = position.coords.accuracy;
      form.post("/hr/attendance/punch", { preserveScroll: true });
    },
    (error) => {
      const message = error.code === error.PERMISSION_DENIED
        ? "Location permission was denied. Enable it for this site and try again."
        : "Could not get a precise location. Move somewhere with a clearer GPS signal and try again.";
      form.setError("location", message);
    },
    { enableHighAccuracy: true, maximumAge: 0, timeout: 30000 }
  );
};
</script>

<style scoped>
.punch-panel {
  max-width: 560px;
}

.punch-panel__status {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.punch-panel__dot {
  width: 12px;
  height: 12px;
  flex: 0 0 12px;
  margin-top: 5px;
  border-radius: 50%;
  background: var(--text-muted);
}

.punch-panel__status--check_in .punch-panel__dot { background: var(--success, #16803c); }
.punch-panel__status--check_out .punch-panel__dot { background: var(--warning, #b7791f); }
.punch-panel__status--complete .punch-panel__dot { background: var(--text-muted); }
.punch-panel__status p { margin: 4px 0 0; color: var(--text-muted); }
.punch-panel__branch { margin: 20px 0; color: var(--text-muted); }
.punch-panel__button { min-width: 150px; }
.punch-panel__privacy { margin: 18px 0 0; font-size: 0.8rem; color: var(--text-muted); }
</style>
