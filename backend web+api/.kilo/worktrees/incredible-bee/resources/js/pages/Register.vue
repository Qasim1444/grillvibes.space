<template>
  <div class="auth-card">
    <h1 class="auth-card__title">Create account</h1>
    <p class="auth-card__subtitle">Register a new admin account.</p>

    <div v-if="error" class="ui-alert ui-alert--danger">{{ error }}</div>

    <form @submit.prevent="register">
      <FormField v-model="form.name" label="Name" placeholder="Full name" />
      <FormField v-model="form.email" label="Email" type="email" placeholder="you@example.com" />
      <FormField v-model="form.password" label="Password" type="password" placeholder="••••••••" />
      <FormField
        v-model="form.password_confirmation"
        label="Confirm Password"
        type="password"
        placeholder="••••••••"
      />

      <button type="submit" class="ui-btn ui-btn--primary ui-btn--block" :disabled="loading">
        {{ loading ? "Creating…" : "Register" }}
      </button>
    </form>

    <div class="auth-card__footer">
      Already have an account? <router-link to="/login">Sign in</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { auth } from "../services/api";
import FormField from "../components/ui/FormField.vue";

const router = useRouter();
const form = ref({ name: "", email: "", password: "", password_confirmation: "" });
const loading = ref(false);
const error = ref("");

const register = async () => {
  error.value = "";
  loading.value = true;
  try {
    await auth.register(form.value);
    router.push("/login");
  } catch (e) {
    if (e.response?.data?.errors) {
      error.value = Object.values(e.response.data.errors).flat().join(" ");
    } else {
      error.value = e.response?.data?.message || "Registration failed.";
    }
  } finally {
    loading.value = false;
  }
};
</script>
