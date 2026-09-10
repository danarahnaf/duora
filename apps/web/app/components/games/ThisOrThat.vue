<script setup lang="ts">
import type { GameRound } from '@couple/contracts';

defineProps<{ round: GameRound; picked: string | undefined; stacked?: boolean }>();
const emit = defineEmits<{ pick: [optionId: string] }>();
</script>

<template>
  <div class="grid gap-3" :class="stacked ? 'grid-cols-1' : 'grid-cols-2'">
    <button
      v-for="o in round.options" :key="o.id" type="button"
      class="panel flex items-center justify-center rounded-[var(--radius-card)] border px-4 text-center text-[15px] font-medium"
      :class="[
        stacked ? 'min-h-24' : 'min-h-40',
        picked === o.id
          ? 'border-transparent bg-[var(--color-primary)] text-[var(--color-primary-ink)]'
          : 'border-[var(--color-line-strong)]',
      ]"
      :aria-pressed="picked === o.id"
      @click="emit('pick', o.id)"
    >{{ o.label }}</button>
  </div>
</template>

<style scoped>
.panel { transition: background-color var(--dur-pop) var(--ease-out), border-color var(--dur-pop) var(--ease-out), color var(--dur-pop) var(--ease-out); }
.panel:active { transform: scale(0.98); }
</style>
