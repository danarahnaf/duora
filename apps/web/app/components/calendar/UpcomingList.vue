<script setup lang="ts">
import type { CalendarEvent } from '@couple/contracts';
import EventPill from '~/components/calendar/EventPill.vue';

defineProps<{ items: CalendarEvent[]; today: string }>();
</script>

<template>
  <div class="flex flex-col gap-2">
    <div v-for="e in items" :key="e.id">
      <p class="mb-1 text-[11px] font-medium text-[var(--color-ink-soft)]">
        {{ relativeDate(e.date, today) }} · {{ formatDate(e.date) }}
      </p>
      <EventPill :event="e" />
    </div>
  </div>
</template>
