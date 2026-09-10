<script setup lang="ts">
import StepHeading from '~/components/onboarding/StepHeading.vue';
import type { IconName } from '~/utils/icons';

definePageMeta({ layout: 'onboarding', step: 3 });
useHead({ title: 'Gabung' });

const { redeemInvite } = useCouple();
const { public: cfg } = useRuntimeConfig();

const raw = ref('');
const loading = ref(false);
const failure = ref<{ code: string; title: string; body: string; icon: IconName } | null>(null);

const FAILURES: Record<string, { title: string; body: string; icon: IconName }> = {
  INVITE_INVALID: {
    title: 'Kode ini tidak ditemukan',
    body: 'Cek lagi hurufnya — kode selalu berbentuk JOIN- diikuti 5 karakter.',
    icon: 'search',
  },
  INVITE_EXPIRED: {
    title: 'Kode sudah kedaluwarsa',
    body: 'Kode hanya berlaku 7 hari. Minta pasanganmu membuat kode baru.',
    icon: 'clock',
  },
  INVITE_USED: {
    title: 'Kode sudah dipakai',
    body: 'Satu kode hanya bisa dipakai sekali. Minta kode yang baru.',
    icon: 'check',
  },
  COUPLE_FULL: {
    title: 'Ruang itu sudah lengkap',
    body: 'Sudah ada dua orang di dalamnya. Pastikan kodenya benar dari pasanganmu.',
    icon: 'users',
  },
  ALREADY_IN_COUPLE: {
    title: 'Kamu sudah punya ruang',
    body: 'Keluar dari ruang lama dulu lewat Setelan kalau mau pindah.',
    icon: 'heart',
  },
};

/** Normalisasi: user sering mengetik tanpa prefix atau dengan huruf kecil. */
const normalized = computed(() => {
  const v = raw.value.trim().toUpperCase().replace(/\s+/g, '');
  if (!v) return '';
  return v.startsWith('JOIN-') ? v : `JOIN-${v.replace(/^JOIN/, '')}`;
});

async function submit() {
  failure.value = null;
  if (normalized.value.length < 6) {
    failure.value = { code: 'INVITE_INVALID', ...FAILURES.INVITE_INVALID! };
    return;
  }
  loading.value = true;
  try {
    await redeemInvite(normalized.value);
    await navigateTo('/home');
  } catch (e) {
    const code = apiErrorCode(e) ?? 'INVITE_INVALID';
    const meta = FAILURES[code] ?? {
      title: 'Gagal bergabung',
      body: apiErrorMessage(e),
      icon: 'close' as IconName,
    };
    failure.value = { code, ...meta };
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div>
    <StepHeading title="Masukkan kode" description="Kode dari pasanganmu, bentuknya JOIN-XXXXX." />

    <form class="flex flex-col gap-4" novalidate @submit.prevent="submit">
      <div>
        <BaseField
          v-model="raw" label="Kode undangan" placeholder="JOIN-8F4K2"
          autocomplete="off" :maxlength="12" required
        />
        <p v-if="raw && normalized !== raw.toUpperCase()" class="mt-1.5 text-[13px] text-[var(--color-ink-soft)]">
          Akan dikirim sebagai <span class="font-medium text-[var(--color-ink)]">{{ normalized }}</span>
        </p>
      </div>

      <div
        v-if="failure"
        class="flex items-start gap-3 rounded-[var(--radius-card)] border border-[var(--color-line-strong)] p-4"
        role="alert"
      >
        <span class="grid size-9 shrink-0 place-items-center rounded-[var(--radius-inner)] bg-[var(--color-danger)]/12 text-[var(--color-danger)]">
          <BaseIcon :name="failure.icon" :size="18" />
        </span>
        <div class="min-w-0">
          <p class="text-[15px] font-semibold">{{ failure.title }}</p>
          <p class="mt-1 text-[13px] text-[var(--color-ink-soft)]">{{ failure.body }}</p>
          <NuxtLink
            v-if="failure.code === 'ALREADY_IN_COUPLE'"
            to="/settings" class="mt-2 inline-block text-[13px] font-medium text-[var(--color-primary)]"
          >Buka Setelan</NuxtLink>
        </div>
      </div>

      <BaseButton type="submit" block size="lg" :loading="loading">Gabung</BaseButton>
      <NuxtLink to="/onboarding/couple" class="text-center text-[13px] text-[var(--color-ink-soft)] underline underline-offset-2">
        Kembali
      </NuxtLink>
    </form>

    <div
      v-if="cfg.enableDevTools"
      class="mt-8 rounded-[var(--radius-field)] border border-dashed border-[var(--color-line-strong)] p-3 text-[13px] text-[var(--color-ink-soft)]"
    >
      <p class="font-semibold">Kode uji</p>
      <p class="mt-1">JOIN-8F4K2 valid · JOIN-EXPRD kedaluwarsa · JOIN-USED1 sudah dipakai</p>
    </div>
  </div>
</template>
