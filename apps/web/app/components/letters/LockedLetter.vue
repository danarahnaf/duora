<script setup lang="ts">
import type { LetterListItem } from '@couple/contracts';

const props = defineProps<{ letter: LetterListItem; todayYmd: string; authorName: string }>();

const daysLeft = computed(() => diffDays(props.todayYmd, props.letter.unlockOn));
</script>

<template>
  <div class="glass-1 relative grid place-items-center px-6 py-10 text-center">
    <span class="grid size-16 place-items-center rounded-[var(--radius-card)] bg-[var(--color-line)] text-[var(--color-ink-soft)]">
      <BaseIcon name="lock" :size="28" />
    </span>

    <h1 class="text-display mt-4 text-2xl">{{ letter.title }}</h1>
    <p class="mt-1.5 text-[13px] text-[var(--color-ink-soft)]">Dari {{ authorName }}</p>

    <p class="text-display mt-6 text-4xl">{{ daysLeft }}</p>
    <p class="mt-1 text-[13px] text-[var(--color-ink-soft)]">
      hari lagi · terbuka {{ formatDate(letter.unlockOn) }}
    </p>

    <p class="mt-6 max-w-xs text-[13px] text-[var(--color-ink-soft)]">
      Isinya belum dikirim ke perangkat ini. Tidak ada cara membukanya lebih awal —
      itu memang bagian dari idenya.
    </p>

    <BaseButton class="mt-6" disabled>Belum bisa dibuka</BaseButton>
  </div>
</template>
