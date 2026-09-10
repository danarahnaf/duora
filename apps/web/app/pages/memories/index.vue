<script setup lang="ts">
import MemoryTimeline from '~/components/memory/MemoryTimeline.vue';

definePageMeta({ middleware: 'couple-required' });
useHead({ title: 'Memori' });

const { items, grouped, status, error, refresh } = useMemories();

const filter = ref('all');
const FILTERS = [
  { value: 'all', label: 'Semua' },
  { value: 'favorite', label: 'Favorit' },
];

const groups = computed(() => {
  if (filter.value === 'all') return grouped.value;
  return grouped.value
    .map(g => ({ ...g, items: g.items.filter(m => m.isFavorite) }))
    .filter(g => g.items.length > 0);
});

const visibleCount = computed(() => groups.value.reduce((s, g) => s + g.items.length, 0));
</script>

<template>
  <div>
    <NavAppHeader title="Memori">
      <template #actions>
        <span class="text-[13px] text-[var(--color-ink-soft)]">{{ items.length }} total</span>
      </template>
    </NavAppHeader>

    <div class="px-4 py-4">
      <BaseSegmented v-model="filter" :options="FILTERS" class="mb-5" />

      <div v-if="status === 'pending'" class="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <BaseSkeleton v-for="i in 6" :key="i" variant="thumb" />
      </div>

      <BaseErrorState v-else-if="error" :error="error" title="Memori gagal dimuat" @retry="refresh()" />

      <BaseEmptyState
        v-else-if="!items.length"
        icon="image" title="Belum ada memori"
        description="Mulai dari satu foto. Sisanya menyusul sendiri."
        action-label="Tambah memori" action-to="/memories/new"
      />

      <BaseEmptyState
        v-else-if="!visibleCount"
        icon="star" title="Belum ada favorit"
        description="Tandai memori dengan bintang di halaman detailnya."
      />

      <MemoryTimeline v-else :groups="groups" />
    </div>

    <NuxtLink
      to="/memories/new"
      class="fab pressable fixed right-4 bottom-24 z-30 grid size-14 place-items-center rounded-full
             bg-[var(--color-primary)] text-[var(--color-primary-ink)] shadow-[var(--shadow-card)] md:bottom-8"
      aria-label="Tambah memori"
    >
      <BaseIcon name="plus" :size="24" />
    </NuxtLink>
  </div>
</template>
