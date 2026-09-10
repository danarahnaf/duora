<script setup lang="ts">
import type { Invite } from '@couple/contracts';
import StepHeading from '~/components/onboarding/StepHeading.vue';

definePageMeta({ layout: 'onboarding', step: 4 });
useHead({ title: 'Menunggu pasangan' });

const { couple, refresh, activeInvite } = useCouple();
const session = useSessionStore();
const ui = useUiStore();

const invite = ref<Invite | null>(null);
const joined = ref(false);

onMounted(async () => {
  invite.value = await activeInvite().catch(() => null);

  const timer = setInterval(async () => {
    await refresh();
    if (couple.value?.isComplete) {
      clearInterval(timer);
      joined.value = true;
      setTimeout(() => navigateTo('/home'), 1400);
    }
  }, 4000);

  onScopeDispose(() => clearInterval(timer));
});

async function copy() {
  if (!invite.value) return;
  await navigator.clipboard.writeText(invite.value.code).then(
    () => ui.toast('Kode disalin', 'success'),
    () => ui.toast('Tidak bisa menyalin otomatis', 'danger'),
  );
}
</script>

<template>
  <div class="flex min-h-[60dvh] flex-col justify-center text-center">
    <template v-if="joined">
      <span class="mx-auto grid size-16 place-items-center rounded-[var(--radius-card)] bg-[var(--color-success)]/15 text-[var(--color-success)]">
        <BaseIcon name="check" :size="28" />
      </span>
      <h1 class="text-display mt-4 text-2xl">Pasanganmu sudah masuk</h1>
      <p class="mt-2 text-[15px] text-[var(--color-ink-soft)]">Membuka ruang kalian…</p>
    </template>

    <template v-else>
      <div class="mx-auto flex items-center -space-x-3">
        <BaseAvatar :name="session.user?.displayName ?? 'Kamu'" :src="session.user?.avatarUrl" size="lg" ring />
        <span
          class="pulse grid size-14 place-items-center rounded-full border border-dashed
                 border-[var(--color-line-strong)] text-[var(--color-ink-soft)]"
          aria-hidden="true"
        >
          <BaseIcon name="users" :size="20" />
        </span>
      </div>

      <StepHeading
        class="mt-6"
        title="Menunggu pasanganmu"
        description="Halaman ini akan lanjut sendiri begitu dia masuk pakai kodenya."
      />

      <p v-if="invite" class="text-display text-lg tracking-[0.12em] select-all">{{ invite.code }}</p>

      <div class="mt-6 flex flex-col gap-2">
        <BaseButton v-if="invite" variant="ghost" icon="copy" @click="copy">Salin kode lagi</BaseButton>
        <NuxtLink to="/home" class="text-[13px] text-[var(--color-ink-soft)] underline underline-offset-2">
          Lanjut sendiri dulu
        </NuxtLink>
      </div>
    </template>
  </div>
</template>

<style scoped>
/* Denyut tenang — bukan spinner besar. */
.pulse { animation: waiting-pulse 2.4s var(--ease-in-out) infinite; }
@keyframes waiting-pulse {
  0%, 100% { opacity: 0.55; }
  50% { opacity: 1; }
}
</style>
