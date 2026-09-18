<template>
  <div class="auth-card login-card">
    <div class="login-card__brand">
      <div class="login-card__logo" :class="{ 'login-card__logo--image': logoUrl && !logoFailed }">
        <img v-if="logoUrl && !logoFailed" :src="logoUrl" :alt="`${brandName} logo`" @error="logoFailed = true" />
        <span v-else>{{ brandInitial }}</span>
      </div>
      <div>
        <span>Secure workspace</span>
        <strong>{{ brandName }}</strong>
      </div>
    </div>

    <p class="login-card__eyebrow">Admin sign in</p>
    <h1 class="auth-card__title">Welcome back</h1>
    <p class="auth-card__subtitle">Access POS, kitchen display, inventory, procurement, HR, finance, CRM, reservations, and reports.</p>

    <div class="login-card__features" aria-label="Available modules">
      <span v-for="feature in features" :key="feature">{{ feature }}</span>
    </div>

    <form @submit.prevent="submit">
      <FormField
        v-model="form.email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        :error="form.errors.email"
      />
      <FormField
        v-model="form.password"
        label="Password"
        type="password"
        placeholder="••••••••"
        :error="form.errors.password"
      />

      <label class="login-card__remember">
        <input v-model="form.remember" type="checkbox" />
        <span>Keep me signed in</span>
      </label>

      <button type="submit" class="ui-btn ui-btn--primary ui-btn--block" :disabled="form.processing">
        {{ form.processing ? "Signing in…" : "Enter GrillVibes" }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useForm, usePage } from "@inertiajs/vue3";
import LoginLayout from "../layouts/LoginLayout.vue";
import FormField from "../components/ui/FormField.vue";

defineOptions({ layout: LoginLayout });

const page = usePage();
const logoFailed = ref(false);
const logoUrl = computed(() => page.props.branding?.logo ?? null);
const brandName = computed(() => page.props.branding?.company || page.props.branding?.name || "GrillVibes");
const brandInitial = computed(() => brandName.value.trim().charAt(0).toUpperCase() || "G");

const features = ["POS", "QR Menu", "KDS", "Inventory", "Payroll", "Finance", "CRM", "Reports"];

const form = useForm({ email: "", password: "", remember: false });

watch(logoUrl, () => { logoFailed.value = false; });

const submit = () => {
  form.post("/login", {
    onFinish: () => form.reset("password"),
  });
};
</script>

<style scoped>
.login-card {
  max-width: 460px;
  padding: 34px;
  border: 1px solid rgba(209, 213, 219, 0.88);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.12);
  backdrop-filter: blur(18px);
}

.login-card__brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 26px;
}

.login-card__logo {
  display: grid;
  place-items: center;
  width: 50px;
  height: 50px;
  border-radius: 14px;
  background: #4f46e5;
  color: #fff;
  font-weight: 800;
  font-size: 1.12rem;
  overflow: hidden;
  box-shadow: 0 14px 30px rgba(79, 70, 229, 0.2);
}

.login-card__logo--image {
  background: transparent;
  border: 0;
  padding: 0;
}

.login-card__logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.login-card__brand span {
  display: block;
  color: #64748b;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.login-card__brand strong {
  display: block;
  color: #0f172a;
  font-size: 1.02rem;
  margin-top: 2px;
}

.login-card__eyebrow {
  display: inline-flex;
  margin: 0 0 10px;
  padding: 6px 10px;
  border-radius: 999px;
  background: #eef2ff;
  color: #4338ca;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.login-card :deep(.auth-card__title) {
  color: #0f172a;
  font-size: 2rem;
  letter-spacing: -0.04em;
  margin-bottom: 8px;
}

.login-card :deep(.auth-card__subtitle) {
  max-width: 380px;
  color: #64748b;
  line-height: 1.65;
  margin-bottom: 22px;
}

.login-card__features {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0 0 24px;
}

.login-card__features span {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 6px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  background: #f8fafc;
  color: #475569;
  font-size: 0.72rem;
  font-weight: 700;
}

.login-card :deep(.ui-field) {
  margin-bottom: 15px;
}

.login-card__remember {
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 2px 0 18px;
  color: #475569;
  font-size: 0.82rem;
  font-weight: 700;
}

.login-card__remember input {
  width: 16px;
  height: 16px;
  accent-color: #4f46e5;
}

.login-card :deep(.ui-btn--primary) {
  min-height: 46px;
  border-radius: 12px;
  box-shadow: 0 14px 28px rgba(79, 70, 229, 0.2);
}

.login-card :deep(.auth-card__footer) {
  margin-top: 22px;
}

@media (max-width: 560px) {
  .login-card {
    padding: 24px;
    border-radius: 18px;
  }

  .login-card :deep(.auth-card__title) {
    font-size: 1.72rem;
  }
}
</style>
