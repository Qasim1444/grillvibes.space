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
    <p class="auth-card__subtitle">Sign in to manage your GrillVibes restaurant workspace.</p>

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

const demoCredentials = page.props.demoCredentials ?? {};
const form = useForm({
  email: demoCredentials.email ?? "",
  password: demoCredentials.password ?? "",
  remember: false,
});

watch(logoUrl, () => { logoFailed.value = false; });

const submit = () => {
  form.post("/login", {
    onFinish: () => form.reset("password"),
  });
};
</script>

<style scoped>
.login-card {
  width: min(100%, 460px);
  padding: clamp(24px, 3vw, 38px);
  border: 1px solid #303430;
  border-radius: 20px;
  background: #171917;
  box-shadow: 0 28px 72px rgba(0, 0, 0, .24);
}

.login-card__brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 34px;
}

.login-card__logo {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: #e94e2f;
  color: #fff;
  font-weight: 800;
  font-size: 1.12rem;
  overflow: hidden;
  box-shadow: 0 10px 28px rgba(233, 78, 47, .2);
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
  color: #9ba19a;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.login-card__brand strong {
  display: block;
  color: #f3f4f1;
  font-size: 1.02rem;
  margin-top: 2px;
}

.login-card__eyebrow {
  display: inline-flex;
  margin: 0 0 10px;
  padding: 6px 10px;
  border-radius: 999px;
  background: #35221b;
  color: #ff9b76;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.login-card :deep(.auth-card__title) {
  color: #f3f4f1;
  font-size: clamp(1.85rem, 4vw, 2.25rem);
  letter-spacing: -0.045em;
  margin-bottom: 8px;
}

.login-card :deep(.auth-card__subtitle) {
  max-width: 380px;
  color: #aeb4ad;
  line-height: 1.65;
  margin-bottom: 28px;
}

.login-card :deep(.ui-field) {
  margin-bottom: 15px;
}

.login-card__remember {
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 2px 0 18px;
  color: #c8ccc7;
  font-size: 0.82rem;
  font-weight: 700;
}

.login-card__remember input {
  width: 16px;
  height: 16px;
  accent-color: #f97316;
  width: 18px;
  height: 18px;
}

.login-card :deep(.ui-btn--primary) {
  min-height: 48px;
  border-radius: 10px;
  background: #e94e2f;
  box-shadow: 0 10px 24px rgba(233, 78, 47, .18);
  transition: transform .16s ease, background-color .16s ease, box-shadow .16s ease;
}

.login-card :deep(.ui-btn--primary:hover:not(:disabled)) {
  background: #d94124;
  box-shadow: 0 14px 30px rgba(233, 78, 47, .25);
  transform: translateY(-1px);
}

.login-card :deep(.ui-input) {
  min-height: 46px;
  border-color: #414641;
  border-radius: 10px;
  background: #101210;
  color: #f3f4f1;
}

.login-card :deep(.ui-input:focus) {
  border-color: #ff704c;
  box-shadow: 0 0 0 3px rgba(255, 112, 76, .17);
}

.login-card :deep(.ui-input::placeholder) {
  color: #7d847d;
}

.login-card :deep(.ui-label) {
  color: #e0e3de;
}

.login-card :deep(.auth-card__footer) {
  margin-top: 22px;
}

@media (max-width: 560px) {
  .login-card {
    padding: 24px 20px;
    border-radius: 16px;
  }

  .login-card :deep(.auth-card__title) {
    font-size: 1.72rem;
  }
}
</style>
