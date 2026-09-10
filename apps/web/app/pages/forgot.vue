<script setup lang="ts">
definePageMeta({ layout: 'auth' });
useHead({ title: 'Lupa password' });

const { forgotPassword } = useSession();

const email = ref('');
const error = ref<string | null>(null);
const sent = ref(false);
const loading = ref(false);

async function submit() {
  error.value = null;
  if (!/^\S+@\S+\.\S+$/.test(email.value)) {
    error.value = 'Email tidak valid';
    return;
  }
  loading.value = true;
  try {
    await forgotPassword(email.value);
    sent.value = true;
  } catch (e) {
    error.value = apiErrorMessage(e);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div>
    <template v-if="!sent">
      <h1 class="text-display text-2xl">Lupa password</h1>
      <p class="mt-1.5 text-[15px] text-[var(--color-ink-soft)]">
        Masukkan emailmu. Kami kirim tautan untuk mengatur ulang.
      </p>

      <form class="mt-7 flex flex-col gap-4" novalidate @submit.prevent="submit">
        <BaseField v-model="email" label="Email" type="email" autocomplete="email" :error="error" placeholder="kamu@email.com" required />
        <BaseButton type="submit" block size="lg" :loading="loading">Kirim tautan</BaseButton>
      </form>
    </template>

    <div v-else class="text-center">
      <span class="mx-auto grid size-16 place-items-center rounded-[var(--radius-card)] bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
        <BaseIcon name="mail" :size="28" />
      </span>
      <h1 class="text-display mt-4 text-2xl">Cek email kamu</h1>
      <p class="mt-2 text-[15px] text-[var(--color-ink-soft)]">
        Kalau <span class="font-medium text-[var(--color-ink)]">{{ email }}</span> terdaftar,
        tautannya sudah dikirim. Cek juga folder spam.
      </p>
      <BaseButton class="mt-6" variant="ghost" block @click="sent = false">Kirim ulang</BaseButton>
    </div>

    <p class="mt-6 text-center text-[13px]">
      <NuxtLink to="/login" class="text-[var(--color-ink-soft)] underline underline-offset-2">Kembali ke masuk</NuxtLink>
    </p>
  </div>
</template>
