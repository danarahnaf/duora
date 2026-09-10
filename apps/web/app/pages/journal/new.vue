<script setup lang="ts">
import JournalEditor from '~/components/journal/JournalEditor.vue';
import type { CreateJournal } from '@couple/contracts';

definePageMeta({ middleware: 'couple-required' });
useHead({ title: 'Catatan baru' });

const { create } = useJournal();
const ui = useUiStore();

const saving = ref(false);
const error = ref<string | null>(null);
const dirty = ref(false);
const leaveDialog = ref(false);
const pendingLeave = ref<(() => void) | null>(null);

async function onSubmit(payload: CreateJournal) {
  saving.value = true;
  error.value = null;
  try {
    await create(payload);
    dirty.value = false;
    ui.toast('Catatan tersimpan', 'success');
    await navigateTo('/journal');
  } catch (e) {
    error.value = apiErrorMessage(e);
  } finally {
    saving.value = false;
  }
}

onBeforeRouteLeave((to) => {
  if (!dirty.value || saving.value) return true;
  leaveDialog.value = true;
  pendingLeave.value = () => navigateTo(to.fullPath);
  return false;
});

function discard() {
  dirty.value = false;
  leaveDialog.value = false;
  pendingLeave.value?.();
}
</script>

<template>
  <div>
    <NavAppHeader title="Catatan baru" back="/journal" />

    <div class="px-4 py-4">
      <p
        v-if="error"
        class="mb-4 rounded-[var(--radius-field)] bg-[var(--color-danger)]/12 px-3.5 py-2.5 text-[13px] text-[var(--color-danger)]"
        role="alert"
      >{{ error }}</p>

      <JournalEditor :loading="saving" submit-label="Simpan catatan" @submit="onSubmit" @dirty="dirty = $event" />
    </div>

    <BaseDialog
      v-model:open="leaveDialog"
      title="Buang tulisan ini?" description="Yang sudah kamu ketik belum tersimpan."
      confirm-label="Buang" cancel-label="Lanjut menulis" tone="danger"
      @confirm="discard"
    />
  </div>
</template>
