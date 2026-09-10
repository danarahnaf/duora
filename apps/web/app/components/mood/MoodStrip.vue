<script setup lang="ts">
import type { MoodCheckin } from '@couple/contracts';

const props = defineProps<{ items: MoodCheckin[]; days: number; label: string; endDate: string }>();

const COLORS: Record<string, string> = {
  GREAT: 'oklch(0.72 0.14 145)',
  GOOD: 'oklch(0.80 0.10 120)',
  OKAY: 'oklch(0.85 0.05 85)',
  BAD: 'oklch(0.75 0.11 45)',
  TERRIBLE: 'oklch(0.62 0.15 25)',
};

const cells = computed(() => {
  const byDate = new Map(props.items.map(i => [i.localDate, i]));
  return Array.from({ length: props.days }, (_, i) => {
    const ymd = addDays(props.endDate, -(props.days - 1 - i));
    const mood = byDate.get(ymd) ?? null;
    return { ymd, mood, color: mood ? COLORS[mood.level] : null };
  });
});
</script>

<template>
  <div>
    <p class="mb-1.5 text-[13px] font-medium text-[var(--color-ink-soft)]">{{ label }}</p>
    <div class="flex gap-1">
      <div
        v-for="(c, i) in cells" :key="c.ymd"
        class="flex flex-1 flex-col items-center gap-1"
      >
        <span
          class="aspect-square w-full rounded-[var(--radius-xs)]"
          :style="{ background: c.color ?? 'var(--color-line)' }"
          :title="c.mood ? `${formatDate(c.ymd)} · ${MOOD_META[c.mood.level].label}` : `${formatDate(c.ymd)} · tidak ada`"
        />
        <span v-if="i % 2 === 0" class="text-[9px] text-[var(--color-ink-soft)]">{{ Number(c.ymd.slice(8, 10)) }}</span>
        <span v-else class="text-[9px] opacity-0">·</span>
      </div>
    </div>
  </div>
</template>
