<script setup lang="ts">
import type { Game } from '@couple/contracts';

defineProps<{ game: Game }>();
</script>

<template>
  <NuxtLink :to="`/games/${game.key}`" class="solid-card pressable flex items-start gap-3 p-4">
    <span class="grid size-11 shrink-0 place-items-center rounded-[var(--radius-field)] bg-[var(--color-primary-soft)] text-xl">
      {{ game.emoji }}
    </span>
    <span class="min-w-0 flex-1">
      <span class="block text-[15px] font-semibold">{{ game.title }}</span>
      <span class="mt-0.5 block text-[13px] text-[var(--color-ink-soft)]">{{ game.description }}</span>
      <span class="mt-2 flex flex-wrap items-center gap-1.5">
        <BaseChip size="sm">{{ game.roundCount }} ronde</BaseChip>
        <BaseChip v-if="game.bestScore !== null" size="sm" tone="accent">
          skor terbaik {{ game.bestScore }}
        </BaseChip>
        <span v-if="game.lastPlayedAt" class="text-[11px] text-[var(--color-ink-soft)]">
          {{ relativeTime(game.lastPlayedAt) }}
        </span>
      </span>
    </span>
    <BaseIcon name="chevronRight" :size="16" class="text-[var(--color-ink-soft)]" />
  </NuxtLink>
</template>
