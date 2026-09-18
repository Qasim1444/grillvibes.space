<template>
  <div class="page">
    <PageHeader title="Profile" subtitle="Your account information." />

    <div class="profile-grid">
      <div class="ui-card ui-card-pad">
        <h3 class="profile__section-title">Personal Info</h3>
        <div v-if="profileForm.recentlySuccessful" class="ui-alert ui-alert--success">
          Profile updated successfully.
        </div>

        <FormField v-model="profileForm.name" label="Name" placeholder="Name" :error="profileForm.errors.name" />
        <FormField v-model="profileForm.email" label="Email" type="email" placeholder="Email" :error="profileForm.errors.email" />
        <FormField v-model="profileForm.phone" label="Phone" placeholder="Phone" :error="profileForm.errors.phone" />
        <FormField
          v-model="profileForm.address"
          label="Address"
          type="textarea"
          placeholder="Address"
          :error="profileForm.errors.address"
        />

        <button v-if="can('profile.update')" class="ui-btn ui-btn--primary" :disabled="profileForm.processing" @click="updateProfile">
          {{ profileForm.processing ? "Saving…" : "Update Profile" }}
        </button>
      </div>

      <div v-if="can('change-password.update')" class="ui-card">
        <div class="ui-card-header">
          <span>Change Password</span>
        </div>
        <div class="ui-card-pad">
          <div v-if="passwordForm.recentlySuccessful" class="ui-alert ui-alert--success">
            Password changed successfully.
          </div>

          <FormField
            v-model="passwordForm.current_password"
            label="Current Password"
            type="password"
            placeholder="••••••••"
            :error="passwordForm.errors.current_password"
          />
          <FormField
            v-model="passwordForm.password"
            label="New Password"
            type="password"
            placeholder="••••••••"
            :error="passwordForm.errors.password"
          />
          <FormField
            v-model="passwordForm.password_confirmation"
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
          />

          <button class="ui-btn ui-btn--primary" :disabled="passwordForm.processing" @click="changePassword">
            {{ passwordForm.processing ? "Updating…" : "Change Password" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useForm, usePage } from "@inertiajs/vue3";
import AdminLayout from "../layouts/AdminLayout.vue";
import PageHeader from "../components/ui/PageHeader.vue";
import FormField from "../components/ui/FormField.vue";
import { usePermissions } from "../composables/usePermissions";

defineOptions({ layout: AdminLayout });

// The signed-in user is shared globally as `auth.user`; seed the form from it.
const user = usePage().props.auth?.user ?? {};
const { can } = usePermissions();

const profileForm = useForm({
  name: user.name ?? "",
  email: user.email ?? "",
  phone: user.phone ?? "",
  address: user.address ?? "",
});

const passwordForm = useForm({
  current_password: "",
  password: "",
  password_confirmation: "",
});

const updateProfile = () => {
  profileForm.put("/profile", { preserveScroll: true });
};

const changePassword = () => {
  passwordForm.post("/change-password", {
    preserveScroll: true,
    onSuccess: () => passwordForm.reset(),
  });
};
</script>

<style scoped>
.profile-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.profile__section-title {
  margin: 0 0 16px;
  font-size: 1rem;
}
@media (max-width: 768px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
}
</style>
