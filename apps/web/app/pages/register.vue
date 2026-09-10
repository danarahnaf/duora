<script setup lang="ts">
import { RegisterSchema } from '@couple/contracts';

definePageMeta({ layout: 'auth' });
useHead({ title: 'Daftar' });

const { register } = useSession();

const form = reactive({ displayName: '', email: '', password: '', confirm: '' });
const errors = reactive<Record<string, string | null>>({
  displayName: null, email: null, password: null, confirm: null,
});
const topError = ref<string | null>(null);
const loading = ref(false);

async function submit() {
  for (const k of Object.keys(errors)) errors[k] = null;
  topError.value = null;

  const parsed = RegisterSchema.safeParse(form);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? '');
      if (key in errors) errors[key] = issue.message;
    }
    return;
  }
  if (form.confirm !== form.password) {
    errors.confirm = 'Password belum sama';
    return;
  }

  loading.value = true;
  try {
    await register(parsed.data);
    await navigateTo('/onboarding/couple');
  } catch (e) {
    topError.value = apiErrorMessage(e);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div>
    <h1 class="text-display text-2xl">Buat akun</h1>
    <p class="mt-1.5 text-[15px] text-[var(--color-ink-soft)]">Satu akun untuk satu orang. Ruangnya dibuat setelah ini.</p>

    <form class="mt-7 flex flex-col gap-4" novalidate @submit.prevent="submit">
      <p
        v-if="topError"
        class="rounded-[var(--radius-field)] bg-[var(--color-danger)]/12 px-3.5 py-2.5 text-[13px] text-[var(--color-danger)]"
        role="alert"
      >{{ topError }}</p>

      <BaseField v-model="form.displayName" label="Nama panggilan" :maxlength="60" :error="errors.displayName" placeholder="Danar" required />
      <BaseField v-model="form.email" label="Email" type="email" autocomplete="email" :error="errors.email" placeholder="kamu@email.com" required />
      <BaseField v-model="form.password" label="Password" type="password" autocomplete="new-password" :error="errors.password" helper="Minimal 8 karakter" required />
      <BaseField v-model="form.confirm" label="Ulangi password" type="password" autocomplete="new-password" :error="errors.confirm" required />

      <BaseButton type="submit" block size="lg" :loading="loading">Daftar</BaseButton>
    </form>

    <p class="mt-6 text-center text-[13px] text-[var(--color-ink-soft)]">
      Sudah punya akun?
      <NuxtLink to="/login" class="font-medium text-[var(--color-primary)]">Masuk</NuxtLink>
    </p>
  </div>
</template>
