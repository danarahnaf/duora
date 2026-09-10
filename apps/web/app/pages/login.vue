<script setup lang="ts">
import { CredentialsSchema, type Session } from '@couple/contracts';

definePageMeta({ layout: 'auth' });
useHead({ title: 'Masuk' });

const route = useRoute();
const session = useSessionStore();
const { login } = useSession();
const api = useApi();
const { public: cfg } = useRuntimeConfig();

const form = reactive({ email: '', password: '' });
const errors = reactive<Record<string, string | null>>({ email: null, password: null });
const topError = ref<string | null>(null);
const loading = ref(false);

function afterLogin() {
  const next = route.query.next;
  return navigateTo(typeof next === 'string' && next ? next : session.hasCouple ? '/home' : '/onboarding/couple');
}

async function submit() {
  errors.email = errors.password = null;
  topError.value = null;

  const parsed = CredentialsSchema.safeParse(form);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? '');
      if (key in errors) errors[key] = issue.message;
    }
    return;
  }

  loading.value = true;
  try {
    await login(parsed.data);
    await afterLogin();
  } catch (e) {
    topError.value = apiErrorMessage(e, 'Email atau password salah.');
  } finally {
    loading.value = false;
  }
}

async function google() {
  loading.value = true;
  try {
    session.setSession(await api<Session>('/auth/google'));
    await afterLogin();
  } catch (e) {
    topError.value = apiErrorMessage(e);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div>
    <h1 class="text-display text-2xl">Masuk</h1>
    <p class="mt-1.5 text-[15px] text-[var(--color-ink-soft)]">Lanjutkan ke ruang kalian.</p>

    <form class="mt-7 flex flex-col gap-4" novalidate @submit.prevent="submit">
      <p
        v-if="topError"
        class="rounded-[var(--radius-field)] bg-[var(--color-danger)]/12 px-3.5 py-2.5 text-[13px] text-[var(--color-danger)]"
        role="alert"
      >{{ topError }}</p>

      <BaseField
        v-model="form.email" label="Email" type="email" autocomplete="email"
        placeholder="kamu@email.com" :error="errors.email" required
      />
      <BaseField
        v-model="form.password" label="Password" type="password" autocomplete="current-password"
        placeholder="minimal 8 karakter" :error="errors.password" required
      />

      <div class="flex justify-end">
        <NuxtLink to="/forgot" class="text-[13px] text-[var(--color-ink-soft)] underline underline-offset-2">
          Lupa password?
        </NuxtLink>
      </div>

      <BaseButton type="submit" block size="lg" :loading="loading">Masuk</BaseButton>
    </form>

    <div class="my-5 flex items-center gap-3 text-[13px] text-[var(--color-ink-soft)]">
      <span class="h-px flex-1 bg-[var(--color-line)]" />atau<span class="h-px flex-1 bg-[var(--color-line)]" />
    </div>

    <BaseButton variant="ghost" block :disabled="loading" @click="google">Masuk dengan Google</BaseButton>

    <p class="mt-6 text-center text-[13px] text-[var(--color-ink-soft)]">
      Belum punya akun?
      <NuxtLink to="/register" class="font-medium text-[var(--color-primary)]">Daftar</NuxtLink>
    </p>

    <div
      v-if="cfg.enableDevTools"
      class="mt-8 rounded-[var(--radius-field)] border border-dashed border-[var(--color-line-strong)] p-3 text-[13px] text-[var(--color-ink-soft)]"
    >
      <p class="font-semibold">Data mock</p>
      <p class="mt-1">danar@example.com · nia@example.com — password apa saja (min 8 karakter).</p>
    </div>
  </div>
</template>
