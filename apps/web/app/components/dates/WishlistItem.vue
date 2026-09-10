<script setup lang="ts">
import type { WishlistItem } from '@couple/contracts';

defineProps<{ item: WishlistItem; addedBy: string; busy?: boolean }>();
const emit = defineEmits<{ toggle: []; remove: [] }>();
</script>

<template>
  <div class="solid-card flex items-start gap-3 p-3.5">
    <button
      type="button" :disabled="busy"
      class="check tap-target mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border"
      :class="item.isDone
        ? 'border-transparent bg-[var(--color-success)] text-white'
        : 'border-[var(--color-line-strong)] text-transparent'"
      :aria-pressed="item.isDone"
      :aria-label="item.isDone ? 'Tandai belum selesai' : 'Tandai selesai'"
      @click="emit('toggle')"
    ><BaseIcon name="check" :size="14" /></button>

    <div class="min-w-0 flex-1">
      <p class="text-[15px] font-medium" :class="item.isDone && 'text-[var(--color-ink-soft)] line-through'">
        {{ item.title }}
      </p>
      <p v-if="item.note" class="mt-0.5 text-[13px] text-[var(--color-ink-soft)]">{{ item.note }}</p>
      <div class="mt-1.5 flex flex-wrap items-center gap-1.5">
        <BaseChip v-if="item.estimatedIdr" size="sm" icon="wallet">{{ formatIdrShort(item.estimatedIdr) }}</BaseChip>
        <span class="text-[11px] text-[var(--color-ink-soft)]">ditambahkan {{ addedBy }}</span>
      </div>
    </div>

    <button
      type="button" aria-label="Hapus item" :disabled="busy"
      class="del tap-target rounded-full p-1.5 text-[var(--color-ink-soft)]"
      @click="emit('remove')"
    ><BaseIcon name="trash" :size="16" /></button>
  </div>
</template>

<style scoped>
.check, .del { transition: background-color var(--dur-pop) var(--ease-out), color var(--dur-pop) var(--ease-out), transform var(--dur-press) var(--ease-out); }
.check:active, .del:active { transform: scale(0.97); }
</style>
