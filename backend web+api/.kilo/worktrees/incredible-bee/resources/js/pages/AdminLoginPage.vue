<template>
  <div class="login-shell">
    <div class="login-card">
      <div class="login-card__header">
        <div class="brand-mark">J</div>
        <div>
          <h1>Admin login</h1>
          <p>Access your workspace</p>
        </div>
      </div>

      <div class="account-tabs" aria-label="Account type selector">
        <button type="button" :class="{ active: selectedRole === 'SUPER_ADMIN' }" @click="selectedRole = 'SUPER_ADMIN'">
          Super Admin
        </button>
        <button type="button" :class="{ active: selectedRole === 'SUB_ADMIN' }" @click="selectedRole = 'SUB_ADMIN'">
          Sub-Admin
        </button>
      </div>

      <div v-if="authError" class="error-banner" role="alert">{{ authError }}</div>

      <form class="login-form" @submit.prevent="submitLogin">
        <div class="field">
          <label for="email">Email</label>
          <input id="email" v-model.trim="form.email" type="email" placeholder="admin@grillvibes.io" @blur="validateEmail" />
          <small v-if="errors.email" class="field-error">{{ errors.email }}</small>
        </div>

        <div class="field">
          <label for="password">Password</label>
          <input id="password" v-model="form.password" type="password" placeholder="Enter your password" @blur="validatePassword" />
          <small v-if="errors.password" class="field-error">{{ errors.password }}</small>
        </div>

        <div class="login-form__meta">
          <label class="checkbox">
            <input v-model="form.remember" type="checkbox" />
            <span>Remember me</span>
          </label>
          <button type="button" class="link-button">Forgot password?</button>
        </div>

        <button type="submit" class="primary-button" :disabled="isSubmitting">
          {{ isSubmitting ? 'Signing in…' : 'Sign in' }}
        </button>
      </form>

      <div class="demo-box">
        <p>Demo accounts</p>
        <span>Super Admin: super@grillvibes.io / password123</span>
        <span>Sub-Admin: subadmin@grillvibes.io / password123</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const selectedRole = ref('SUPER_ADMIN');
const isSubmitting = ref(false);
const authError = ref('');

const form = reactive({
  email: '',
  password: '',
  remember: true,
});

const errors = reactive({
  email: '',
  password: '',
});

const validateEmail = () => {
  const value = form.email.trim();
  errors.email = !value ? 'Email is required.' : /.+@.+\..+/.test(value) ? '' : 'Please enter a valid email.';
};

const validatePassword = () => {
  const value = form.password;
  errors.password = !value ? 'Password is required.' : value.length >= 8 ? '' : 'Password must be at least 8 characters.';
};

const submitLogin = () => {
  validateEmail();
  validatePassword();

  if (errors.email || errors.password) {
    authError.value = 'Please fix the highlighted fields.';
    return;
  }

  const expectedEmail = selectedRole.value === 'SUPER_ADMIN' ? 'super@grillvibes.io' : 'subadmin@grillvibes.io';
  const validPassword = 'password123';

  isSubmitting.value = true;
  authError.value = '';

  setTimeout(() => {
    isSubmitting.value = false;

    if (form.email.trim().toLowerCase() !== expectedEmail || form.password !== validPassword) {
      authError.value = 'Invalid email or password for the selected account type.';
      return;
    }

    localStorage.setItem('grillvibes_admin_token', 'demo-token');
    localStorage.setItem('grillvibes_admin_role', selectedRole.value);
    router.push('/admin');
  }, 600);
};
</script>

<style scoped>
.login-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: radial-gradient(circle at top, rgba(79, 70, 229, 0.14), transparent 35%), #f8fafc;
}

.login-card {
  width: min(100%, 480px);
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 28px;
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.08);
  padding: 28px;
}

.login-card__header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 18px;
}

.brand-mark {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  font-weight: 800;
  background: linear-gradient(135deg, #4f46e5, #8b5cf6);
  color: white;
}

.login-card__header h1 {
  margin: 0;
  font-size: 1.8rem;
}

.login-card__header p {
  margin: 4px 0 0;
  color: #64748b;
}

.account-tabs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  background: #eef2ff;
  border-radius: 14px;
  padding: 6px;
  margin-bottom: 18px;
}

.account-tabs button {
  border: 0;
  background: transparent;
  padding: 10px 12px;
  border-radius: 10px;
  font: inherit;
  font-weight: 700;
  color: #475569;
  cursor: pointer;
}

.account-tabs button.active {
  background: white;
  color: #111827;
  box-shadow: 0 3px 12px rgba(15, 23, 42, 0.08);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.field label {
  font-size: 0.82rem;
  font-weight: 700;
  color: #334155;
}

.field input {
  width: 100%;
  border: 1px solid #dbe2ee;
  border-radius: 12px;
  padding: 12px 14px;
  font: inherit;
  background: white;
}

.field input:focus {
  outline: 2px solid rgba(79, 70, 229, 0.18);
  border-color: #6366f1;
}

.field-error {
  color: #dc2626;
  font-size: 0.75rem;
}

.login-form__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin: 8px 0 4px;
}

.checkbox {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #475569;
  font-size: 0.82rem;
}

.link-button {
  border: 0;
  background: transparent;
  color: #4338ca;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.primary-button {
  border: 0;
  border-radius: 12px;
  padding: 13px 18px;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  margin-top: 8px;
}

.primary-button:disabled {
  opacity: 0.7;
  cursor: wait;
}

.error-banner {
  margin-bottom: 16px;
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: 10px 12px;
  font-size: 0.82rem;
  font-weight: 600;
}

.demo-box {
  margin-top: 18px;
  padding: 12px 14px;
  border: 1px dashed #c7d2fe;
  background: #eef2ff;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: #374151;
  font-size: 0.8rem;
}

.demo-box p {
  margin: 0;
  font-weight: 800;
  color: #1f2937;
}
</style>
