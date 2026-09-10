<script setup lang="ts">
import type { Memory } from '@couple/contracts';

/**
 * Kartu ini hidup di dalam list yang bisa 100+ item, jadi WAJIB solid-card:
 * tanpa backdrop-filter, dengan aspect-ratio tetap supaya scroll tidak bergeser.
 */
defineProps<{ memory: Memory; eager?: boolean }>();
</script>

<template>
  <NuxtLink :to="`/memories/${memory.id}`" class="solid-card pressable block overflow-hidden">
    <div class="relative aspect-4/3 bg-[var(--color-line)]">
      <img
        v-if="memory.media[0]"
        :src="memory.media[0].url" alt="" class="size-full object-cover"
        :loading="eager ? 'eager' : 'lazy'" decoding="async" width="800" height="600"
      >
      <div v-else class="grid size-full place-items-center text-[var(--color-ink-soft)]">
        <BaseIcon name="book" :size="24" />
      </div>

      <span
        v-if="memory.media.length > 1"
        class="absolute top-2 right-2 rounded-[var(--radius-pill)] bg-black/45 px-2 py-0.5 text-[11px] text-white"
      >{{ memory.media.length }} foto</span>
      <span
        v-if="memory.isFavorite"
        class="absolute top-2 left-2 grid size-6 place-items-center rounded-full bg-black/45 text-white"
        aria-label="Favorit"
      ><BaseIcon name="star" :size="13" /></span>
    </div>

    <div class="p-3">
      <p class="text-[13px] text-[var(--color-ink-soft)]">{{ formatDate(memory.happenedAt) }}</p>
      <p v-if="memory.caption" class="mt-1 text-[13px] leading-snug">{{ truncate(memory.caption, 72) }}</p>
      <p v-if="memory.location" class="mt-1.5 flex items-center gap-1 text-[13px] text-[var(--color-ink-soft)]">
        <BaseIcon name="mapPin" :size="12" />{{ truncate(memory.location, 28) }}
      </p>
    </div>
  </NuxtLink>
</template>
