<script setup lang="ts">
import type { CalendarEvent, EventCategory } from '@couple/contracts';

const props = defineProps<{
  month: string;                              // YYYY-MM
  byDate: Map<string, CalendarEvent[]>;
  selected: string | null;
  today: string;
}>();
const emit = defineEmits<{ select: [ymd: string] }>();

const DAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

const weeks = computed(() => monthMatrix(props.month));

const CATEGORY_COLOR: Record<EventCategory, string> = {
  DATE: 'var(--color-primary)',
  ANNIVERSARY: 'var(--color-accent)',
  BIRTHDAY: 'var(--color-success)',
  TRIP: 'oklch(0.62 0.13 250)',
  REMINDER: 'var(--color-ink-soft)',
  PERSONAL: 'oklch(0.62 0.12 300)',
  IMPORTANT: 'var(--color-danger)',
};

function dots(ymd: string) {
  return (props.byDate.get(ymd) ?? []).slice(0, 3);
}
</script>

<template>
  <div>
    <div class="mb-1 grid grid-cols-7 text-center text-[11px] font-medium text-[var(--color-ink-soft)]">
      <span v-for="d in DAYS" :key="d">{{ d }}</span>
    </div>

    <div class="grid grid-cols-7 gap-0.5">
      <template v-for="(week, wi) in weeks" :key="wi">
        <button
          v-for="ymd in week" :key="ymd" type="button"
          class="cell flex h-12 flex-col items-center justify-center gap-1 rounded-[var(--radius-inner)] text-[13px]"
          :class="[
            ymd.slice(0, 7) !== month && 'text-[var(--color-ink-soft)] opacity-45',
            selected === ymd && 'bg-[var(--color-primary)] text-[var(--color-primary-ink)]',
            selected !== ymd && ymd === today && 'ring-1 ring-[var(--color-primary)]',
          ]"
          :aria-label="formatDateLong(ymd)"
          :aria-current="ymd === today ? 'date' : undefined"
          @click="emit('select', ymd)"
        >
          <span class="tabular-nums">{{ Number(ymd.slice(8, 10)) }}</span>
          <span class="flex h-1.5 items-center gap-0.5">
            <span
              v-for="e in dots(ymd)" :key="e.id"
              class="size-1 rounded-full"
              :style="{ background: selected === ymd ? 'currentColor' : CATEGORY_COLOR[e.category] }"
            />
          </span>
        </button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.cell { transition: background-color var(--dur-pop) var(--ease-out), color var(--dur-pop) var(--ease-out); }
.cell:active { transform: scale(0.97); }
</style>
