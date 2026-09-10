<script setup lang="ts">
import MemoryDetail from '~/components/memory/MemoryDetail.vue';

definePageMeta({ middleware: 'couple-required' });

const route = useRoute();
const id = computed(() => String(route.params.id));

const { data: memory, status, error, refresh } = useMemory(id);
const { toggleFavorite, remove } = useMemories();
const coupleStore = useCoupleStore();
const ui = useUiStore();

useHead({ title: () => (memory.value?.caption ? truncate(memory.value.caption, 40) : 'Memori') });

const confirming = ref(false);
const deleting = ref(false);
const favBusy = ref(false);

async function onToggleFavorite() {
  if (!memory.value) return;
  favBusy.value = true;
  try {
    memory.value = await toggleFavorite(memory.value.id, !memory.value.isFavorite);
  } catch (e) {
    ui.toast(apiErrorMessage(e), 'danger');
  } finally {
    favBusy.value = false;
  }
}

async function onDelete() {
  if (!memory.value) return;
  deleting.value = true;
  try {
    await remove(memory.value.id);
    ui.toast('Memori dihapus', 'success');
    await navigateTo('/memories');
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
    <NavAppHeader title="Memori" back="/memories">
      <template #actions>
        <button
          v-if="memory" type="button" class="act tap-target rounded-full p-2"
          :disabled="favBusy"
          :aria-label="memory.isFavorite ? 'Hapus dari favorit' : 'Jadikan favorit'"
          :class="memory.isFavorite ? 'text-[var(--color-accent-ink)]' : 'text-[var(--color-ink-soft)]'"
          @click="onToggleFavorite"
        ><BaseIcon name="star" :size="19" /></button>
        <button
          v-if="memory" type="button" aria-label="Hapus memori"
          class="act tap-target rounded-full p-2 text-[var(--color-ink-soft)]"
          @click="confirming = true"
        ><BaseIcon name="trash" :size="19" /></button>
      </template>
    </NavAppHeader>

    <div class="px-4 py-4">
      <div v-if="status === 'pending'" class="flex flex-col gap-4">
        <BaseSkeleton variant="thumb" />
        <BaseSkeleton variant="text" :count="3" />
      </div>

      <BaseErrorState v-else-if="error" :error="error" title="Memori tidak bisa dibuka" @retry="refresh()" />

      <MemoryDetail v-else-if="memory" :memory="memory" :members="coupleStore.members" />
    </div>

    <BaseDialog
      v-model:open="confirming"
      title="Hapus memori ini?"
      description="Foto dan ceritanya ikut hilang. Tindakan ini tidak bisa dibatalkan."
      confirm-label="Hapus" tone="danger" :loading="deleting"
      @confirm="onDelete"
    />
  </div>
</template>

<style scoped>
.act { transition: color var(--dur-pop) var(--ease-out), transform var(--dur-press) var(--ease-out); }
.act:active { transform: scale(0.97); }
</style>
