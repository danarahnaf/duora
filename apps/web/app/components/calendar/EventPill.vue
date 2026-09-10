<script setup lang="ts">
import type { CalendarEvent, EventCategory } from '@couple/contracts';

defineProps<{ event: CalendarEvent }>();

const CATEGORY_LABEL: Record<EventCategory, string> = {
  DATE: 'Kencan', ANNIVERSARY: 'Anniversary', BIRTHDAY: 'Ulang tahun', TRIP: 'Perjalanan',
  REMINDER: 'Pengingat', PERSONAL: 'Pribadi', IMPORTANT: 'Penting',
};
</script>

<template>
  <NuxtLink :to="`/calendar/${event.id}`" class="solid-card pressable flex items-center gap-3 p-3">
    <span class="w-12 shrink-0 text-center">
      <span v-if="event.time" class="text-display block text-[15px]">{{ event.time }}</span>
      <span v-else class="text-[11px] text-[var(--color-ink-soft)]">seharian</span>
    </span>
    <span class="h-9 w-px bg-[var(--color-line)]" />
    <span class="min-w-0 flex-1">
      <span class="block truncate text-[15px] font-medium">{{ event.title }}</span>
      <span class="mt-0.5 flex flex-wrap items-center gap-1.5 text-[13px] text-[var(--color-ink-soft)]">
        <span>{{ CATEGORY_LABEL[event.category] }}</span>
        <span v-if="event.location">· {{ truncate(event.location, 24) }}</span>
        <span v-if="event.budgetIdr">· {{ formatIdrShort(event.budgetIdr) }}</span>
      </span>
    </span>
    <BaseIcon name="chevronRight" :size="16" class="text-[var(--color-ink-soft)]" />
  </NuxtLink>
</template>
