<script setup lang="ts">
import LetterCompose from '~/components/letters/LetterCompose.vue';
import type { CreateLetter } from '@couple/contracts';

definePageMeta({ middleware: 'couple-required' });
useHead({ title: 'Surat baru' });

const { create } = useLetters();
const ui = useUiStore();

const saving = ref(false);
const serverError = ref<string | null>(null);

async function onSubmit(payload: CreateLetter) {
  saving.value = true;
  serverError.value = null;
  try {
    await create(payload);
    ui.toast('Surat disegel', 'success');
    await navigateTo('/letters');
  } catch (e) {
    serverError.value = apiErrorCode(e) === 'UNLOCK_IN_PAST'
      ? 'Tanggal buka harus setelah hari ini'
      : apiErrorMessage(e);
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div>
    <NavAppHeader title="Surat baru" back="/letters" />
    <div class="px-4 py-4">
      <LetterCompose :loading="saving" :server-error="serverError" @submit="onSubmit" />
    </div>
  </div>
</template>
