<script setup lang="ts">
/**
 * Angka datang dari server (couple.daysTogether). §4.3: TIDAK count-up tiap
 * kunjungan — animasi hanya saat milestone tercapai.
 */
const props = withDefaults(defineProps<{
  days: number;
  label: string;
  milestone?: boolean;
  /** `on-image` dipakai saat counter berdiri di atas foto. */
  tone?: 'ink' | 'on-image';
}>(), { tone: 'ink' });

const LABELS: Record<string, string> = {
  first_met: 'sejak pertama bertemu',
  first_date: 'sejak kencan pertama',
  official: 'sejak jadian',
  engagement: 'sejak tunangan',
  wedding: 'sejak menikah',
};
const caption = computed(() => LABELS[props.label] ?? 'hari bersama');
</script>

<template>
  <div class="text-center">
    <p
      class="text-display text-6xl leading-none sm:text-7xl"
      :class="[milestone && 'counter-pulse', tone === 'on-image' && 'text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]']"
    >{{ formatNumber(days) }}</p>
    <p
      class="mt-2 text-[13px] tracking-wide uppercase"
      :class="tone === 'on-image' ? 'text-white/85' : 'text-[var(--color-ink-soft)]'"
    >hari · {{ caption }}</p>
  </div>
</template>
