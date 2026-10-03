<template>
  <div class="page">
    <PageHeader title="Change Password" subtitle="Update the password for your account." />

    <div class="ui-card ui-card-pad" style="max-width: 520px">
      <div v-if="form.recentlySuccessful" class="ui-alert ui-alert--success">
        Password changed successfully.
      </div>

      <form @submit.prevent="changePassword">
        <FormField
          v-model="form.current_password"
          label="Current Password"
          type="password"
          placeholder="••••••••"
          :error="form.errors.current_password"
        />
        <FormField
          v-model="form.password"
          label="New Password"
          type="password"
          placeholder="••••••••"
          :error="form.errors.password"
        />
        <FormField
          v-model="form.password_confirmation"
          label="Confirm New Password"
          type="password"
          placeholder="••••••••"
        />

        <button v-if="can('change-password.update')" type="submit" class="ui-btn ui-btn--primary" :disabled="form.processing">
          {{ form.processing ? "Updating…" : "Update Password" }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { useForm } from "@inertiajs/vue3";
import AdminLayout from "../layouts/AdminLayout.vue";
import PageHeader from "../components/ui/PageHeader.vue";
import FormField from "../components/ui/FormField.vue";
import { usePermissions } from "../composables/usePermissions";

// Persistent layout — renders the sidebar + topbar around this page.
defineOptions({ layout: AdminLayout });

const { can } = usePermissions();

const form = useForm({
  current_password: "",
  password: "",
  password_confirmation: "",
});

const changePassword = () => {
  form.post("/change-password", {
    preserveScroll: true,
    onSuccess: () => form.reset(),
  });
};
</script>
