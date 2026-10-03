<template>
  <div class="auth-card">
    <h1 class="auth-card__title">Forgot password</h1>
    <p class="auth-card__subtitle">
      Enter your email to receive a reset code, then set a new password.
    </p>

    <div v-if="message" class="ui-alert ui-alert--success">{{ message }}</div>
    <div v-if="error" class="ui-alert ui-alert--danger">{{ error }}</div>

    <form @submit.prevent="requestSent ? resetPassword() : sendResetCode()">
      <FormField v-model="form.email" label="Email" type="email" placeholder="you@example.com" />

      <template v-if="requestSent">
        <FormField v-model="form.otp" label="Reset Code" placeholder="4-digit code" />
        <FormField v-model="form.password" label="New Password" type="password" placeholder="••••••••" />
        <FormField
          v-model="form.password_confirmation"
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
        />
      </template>

      <button type="submit" class="ui-btn ui-btn--primary ui-btn--block" :disabled="loading">
        {{ requestSent ? "Reset Password" : "Send Reset Code" }}
      </button>
    </form>

    <div class="auth-card__footer">
      Remember your password? <router-link to="/login">Sign in</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { auth } from "../services/api";
import FormField from "../components/ui/FormField.vue";

const router = useRouter();
const form = ref({ email: "", otp: "", password: "", password_confirmation: "" });
const requestSent = ref(false);
const loading = ref(false);
const message = ref("");
const error = ref("");

const sendResetCode = async () => {
  error.value = "";
  message.value = "";
  loading.value = true;
  try {
    await auth.forgotPassword({ email: form.value.email });
    requestSent.value = true;
    message.value = "Reset code sent. Check your email.";
  } catch (e) {
    error.value = e.response?.data?.message || "Failed to send reset code.";
  } finally {
    loading.value = false;
  }
};

const resetPassword = async () => {
  error.value = "";
  message.value = "";
  loading.value = true;
  try {
    const data = await auth.resetPassword(form.value);
    message.value = data.message || "Password reset.";
    if (data.status === "success") router.push("/login");
  } catch (e) {
    error.value = e.response?.data?.message || "Failed to reset password.";
  } finally {
    loading.value = false;
  }
};
</script>
