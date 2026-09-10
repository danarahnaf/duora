<script setup lang="ts">
import JournalEditor from '~/components/journal/JournalEditor.vue';
import type { CreateJournal } from '@couple/contracts';

definePageMeta({ middleware: 'couple-required' });

const route = useRoute();
const id = computed(() => String(route.params.id));

const { data: entry, status, error, refresh } = useJournalEntry(id);
const { update, remove } = useJournal();
const session = useSessionStore();
const coupleStore = useCoupleStore();
const ui = useUiStore();

useHead({ title: () => entry.value?.title ?? 'Catatan' });

const editing = ref(false);
const saving = ref(false);
const confirming = ref(false);
const deleting = ref(false);

const isMine = computed(() => entry.value?.authorId === session.userId);
const notFound = computed(() => {
  const e = error.value as { statusCode?: number } | null;
  return e?.statusCode === 404;
});
const authorName = computed(() =>
  coupleStore.members.find(m => m.id === entry.value?.authorId)?.displayName ?? 'Anggota');

async function onSubmit(payload: CreateJournal) {
  if (!entry.value) return;
  saving.value = true;
  try {
    entry.value = await update(entry.value.id, payload);
    editing.value = false;
    ui.toast('Catatan diperbarui', 'success');
  } catch (e) {
    ui.toast(apiErrorMessage(e), 'danger');
  } finally {
    saving.value = false;
  }
}

async function onDelete() {
  if (!entry.value) return;
  deleting.value = true;
  try {
    await remove(entry.value.id);
    ui.toast('Catatan dihapus', 'success');
    await navigateTo('/journal');
  } catch (e) {
    ui.toast(apiErrorMessage(e), 'danger');
  } finally {
    deleting.value = false;
    confirming.value = false;
  }
}
</script>

<template>
  <div>
    <NavAppHeader title="Catatan" back="/journal">
      <template #actions>
        <button
          v-if="entry && isMine && !editing" type="button" aria-label="Ubah catatan"
          class="act tap-target rounded-full p-2 text-[var(--color-ink-soft)]"
          @click="editing = true"
        ><BaseIcon name="edit" :size="19" /></button>
        <button
          v-if="entry && isMine" type="button" aria-label="Hapus catatan"
          class="act tap-target rounded-full p-2 text-[var(--color-ink-soft)]"
          @click="confirming = true"
        ><BaseIcon name="trash" :size="19" /></button>
      </template>
    </NavAppHeader>

    <div class="px-4 py-4">
      <div v-if="status === 'pending'" class="flex flex-col gap-3">
        <BaseSkeleton variant="title" />
        <BaseSkeleton variant="text" :count="5" />
      </div>

      <BaseEmptyState
        v-else-if="notFound"
        icon="lock" title="Catatan ini tidak bisa dibuka"
        description="Mungkin catatan pribadi milik partner, atau sudah dihapus."
        action-label="Kembali ke jurnal" action-to="/journal"
      />

      <BaseErrorState v-else-if="error" :error="error" title="Catatan gagal dimuat" @retry="refresh()" />

      <template v-else-if="entry">
        <JournalEditor
          v-if="editing"
          :initial="entry" :loading="saving" submit-label="Simpan perubahan"
          @submit="onSubmit"
        />

        <article v-else>
          <div class="flex flex-wrap items-center gap-2">
            <BaseChip size="sm" :icon="entry.visibility === 'PRIVATE' ? 'lock' : 'users'">
              {{ entry.visibility === 'PRIVATE' ? 'Pribadi' : 'Bersama' }}
            </BaseChip>
            <span class="text-[13px] text-[var(--color-ink-soft)]">
              {{ formatDateLong(entry.createdAt.slice(0, 10)) }} · {{ authorName }}
            </span>
          </div>

          <h1 v-if="entry.title" class="text-display mt-3 text-2xl">{{ entry.title }}</h1>
          <p class="prose-measure mt-4 text-[15px] leading-relaxed whitespace-pre-line">{{ entry.body }}</p>
        </article>

        <BaseButton v-if="editing" class="mt-3" variant="ghost" block @click="editing = false">Batal</BaseButton>
      </template>
    </div>

    <BaseDialog
      v-model:open="confirming"
      title="Hapus catatan ini?" description="Tulisannya hilang permanen."
      confirm-label="Hapus" tone="danger" :loading="deleting"
      @confirm="onDelete"
    />
  </div>
</template>

<style scoped>
.act { transition: color var(--dur-pop) var(--ease-out), transform var(--dur-press) var(--ease-out); }
.act:active { transform: scale(0.97); }
</style>
