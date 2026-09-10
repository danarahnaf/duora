<script setup lang="ts">
import JournalList from '~/components/journal/JournalList.vue';
import type { JournalVisibility } from '@couple/contracts';

definePageMeta({ middleware: 'couple-required' });
useHead({ title: 'Jurnal' });

const filter = ref('all');
const visibility = computed<JournalVisibility | undefined>(() =>
  filter.value === 'all' ? undefined : (filter.value as JournalVisibility));

const { items, status, error, refresh } = useJournal(visibility);
const coupleStore = useCoupleStore();

const FILTERS = [
  { value: 'all', label: 'Semua' },
  { value: 'PRIVATE', label: 'Pribadi' },
  { value: 'SHARED', label: 'Bersama' },
];
</script>

<template>
  <div>
    <NavAppHeader title="Jurnal" />

    <div class="px-4 py-4">
      <BaseSegmented v-model="filter" :options="FILTERS" class="mb-5" />

      <BaseSkeleton v-if="status === 'pending'" variant="card" :count="4" />
      <BaseErrorState v-else-if="error" :error="error" title="Jurnal gagal dimuat" @retry="refresh()" />

      <BaseEmptyState
        v-else-if="!items.length && filter === 'PRIVATE'"
        icon="lock" title="Belum ada catatan pribadi"
        description="Catatan pribadi hanya bisa dibaca penulisnya. Partner tidak melihat keberadaannya."
        action-label="Tulis catatan" action-to="/journal/new"
      />
      <BaseEmptyState
        v-else-if="!items.length && filter === 'SHARED'"
        icon="users" title="Belum ada catatan bersama"
        description="Catatan bersama bisa dibaca kalian berdua."
        action-label="Tulis catatan" action-to="/journal/new"
      />
      <BaseEmptyState
        v-else-if="!items.length"
        icon="book" title="Jurnal masih kosong"
        description="Satu paragraf pun sudah cukup untuk mulai."
        action-label="Tulis catatan" action-to="/journal/new"
      />

      <JournalList v-else :items="items" :members="coupleStore.members" />
    </div>

    <NuxtLink
      to="/journal/new"
      class="pressable fixed right-4 bottom-24 z-30 grid size-14 place-items-center rounded-full
             bg-[var(--color-primary)] text-[var(--color-primary-ink)] shadow-[var(--shadow-card)] md:bottom-8"
      aria-label="Tulis catatan"
    ><BaseIcon name="plus" :size="24" /></NuxtLink>
  </div>
</template>
