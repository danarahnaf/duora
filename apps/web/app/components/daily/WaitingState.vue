<script setup lang="ts">
import type { Answer } from '@couple/contracts';

defineProps<{ partnerName: string; myAnswer: Answer }>();
</script>

<template>
  <div class="mt-5 flex flex-col gap-4">
    <div class="rounded-[var(--radius-card)] border border-[var(--color-line)] p-4">
      <p class="text-[13px] font-medium text-[var(--color-ink-soft)]">Jawabanmu</p>
      <p class="prose-measure mt-2 text-[15px] whitespace-pre-line">{{ myAnswer.body }}</p>
      <p class="mt-2 text-[13px] text-[var(--color-ink-soft)]">{{ relativeTime(myAnswer.createdAt) }}</p>
    </div>

    <div class="flex items-start gap-3 rounded-[var(--radius-card)] bg-[var(--color-line)] p-4">
      <span class="grid size-9 shrink-0 place-items-center rounded-[var(--radius-inner)] bg-[var(--color-surface-solid)] text-[var(--color-ink-soft)]">
        <BaseIcon name="clock" :size="18" />
      </span>
      <div>
        <p class="text-[15px] font-semibold">{{ partnerName }} belum menjawab</p>
        <p class="mt-1 text-[13px] text-[var(--color-ink-soft)]">
          Begitu dia menjawab, kedua jawaban terbuka bersamaan. Tidak ada yang bisa membaca duluan.
        </p>
      </div>
    </div>
  </div>
</template>
