<script setup lang="ts">
import type { Invite } from '@couple/contracts';
import StepHeading from '~/components/onboarding/StepHeading.vue';

definePageMeta({ layout: 'onboarding', step: 3 });
useHead({ title: 'Undang pasangan' });

const { createInvite, activeInvite } = useCouple();
const ui = useUiStore();

const invite = ref<Invite | null>(null);
const status = ref<'pending' | 'success' | 'error'>('pending');
const error = ref<unknown>(null);
const regenerating = ref(false);
const canShare = ref(false);

async function load() {
  status.value = 'pending';
  error.value = null;
  try {
    invite.value = (await activeInvite()) ?? (await createInvite());
    status.value = 'success';
  } catch (e) {
    error.value = e;
    status.value = 'error';
  }
}

onMounted(() => {
  canShare.value = typeof navigator !== 'undefined' && 'share' in navigator;
  load();
});

async function regenerate() {
  regenerating.value = true;
  try {
    invite.value = await createInvite();
    ui.toast('Kode baru dibuat', 'success');
  } catch (e) {
    ui.toast(apiErrorMessage(e), 'danger');
  } finally {
    regenerating.value = false;
  }
}

async function copy() {
  if (!invite.value) return;
  try {
    await navigator.clipboard.writeText(invite.value.code);
    ui.toast('Kode disalin', 'success');
  } catch {
    ui.toast('Tidak bisa menyalin otomatis', 'danger');
  }
}

const waText = computed(() =>
  invite.value
    ? `Aku buatin ruang buat kita. Kodenya ${invite.value.code} — buka ${invite.value.shareUrl}`
    : '');

async function nativeShare() {
  if (!invite.value) return;
  try {
    await navigator.share({ title: 'Gabung ke ruang kita', text: waText.value, url: invite.value.shareUrl });
  } catch { /* dibatalkan user */ }
}
</script>

<template>
  <div>
    <StepHeading title="Undang pasanganmu" description="Satu kode, sekali pakai, berlaku 7 hari." />

    <BaseSkeleton v-if="status === 'pending'" variant="card" :count="2" />
    <BaseErrorState v-else-if="status === 'error'" :error="error" title="Kode gagal dibuat" @retry="load" />

    <div v-else-if="invite" class="flex flex-col gap-4">
      <div class="glass-1 relative grid place-items-center px-5 py-8 text-center">
        <p class="text-[13px] text-[var(--color-ink-soft)]">Kode undangan</p>
        <p class="text-display mt-2 text-3xl tracking-[0.12em] select-all">{{ invite.code }}</p>
        <p class="mt-3 text-[13px] text-[var(--color-ink-soft)]">
          Berlaku sampai {{ formatDate(invite.expiresAt.slice(0, 10)) }}
        </p>
      </div>

      <div class="grid grid-cols-2 gap-2">
        <BaseButton variant="ghost" icon="copy" @click="copy">Salin</BaseButton>
        <BaseButton
          variant="ghost" icon="share" :to="`https://wa.me/?text=${encodeURIComponent(waText)}`"
          target="_blank" rel="noopener"
        >WhatsApp</BaseButton>
      </div>

      <BaseButton v-if="canShare" variant="subtle" block icon="share" @click="nativeShare">
        Bagikan lewat aplikasi lain
      </BaseButton>

      <BaseButton variant="ghost" block :loading="regenerating" icon="refresh" @click="regenerate">
        Buat kode baru
      </BaseButton>

      <BaseButton block size="lg" to="/onboarding/waiting" icon-right="arrowRight">Lanjut</BaseButton>
    </div>
  </div>
</template>
