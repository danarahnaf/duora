<script setup lang="ts">
import GameCard from '~/components/games/GameCard.vue';

definePageMeta({ middleware: 'couple-required' });
useHead({ title: 'Games' });

const { data, status, error, refresh } = useGames();
</script>

<template>
  <div>
    <NavAppHeader title="Games" />

    <div class="px-4 py-4">
      <p class="mb-5 text-[13px] text-[var(--color-ink-soft)]">
        Semua permainan butuh dua orang. Jawaban partner terbuka setelah kalian berdua selesai.
      </p>

      <BaseSkeleton v-if="status === 'pending'" variant="card" :count="4" />
      <BaseErrorState v-else-if="error" :error="error" title="Games gagal dimuat" @retry="refresh()" />

      <BaseEmptyState
        v-else-if="!data?.items.length"
        icon="sparkle" title="Belum ada permainan"
        description="Nanti muncul di sini."
      />

      <div v-else class="flex flex-col gap-2">
        <GameCard v-for="g in data.items" :key="g.key" :game="g" />
      </div>
    </div>
  </div>
</template>
