<script setup lang="ts">
import type { JournalEntry, PublicUser } from '@couple/contracts';

const props = defineProps<{ items: JournalEntry[]; members: PublicUser[] }>();

function authorName(id: string) {
  return props.members.find(m => m.id === id)?.displayName ?? 'Anggota';
}

function preview(entry: JournalEntry) {
  return truncate(entry.body.replace(/\s+/g, ' ').trim(), 110);
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <NuxtLink
      v-for="e in items" :key="e.id" :to="`/journal/${e.id}`"
      class="solid-card pressable block p-4"
    >
      <div class="flex items-start justify-between gap-3">
        <p class="min-w-0 flex-1 text-[15px] font-medium">
          {{ e.title || truncate(e.body.split('\n')[0] ?? '', 48) }}
        </p>
        <BaseChip v-if="e.visibility === 'PRIVATE'" size="sm" icon="lock">Pribadi</BaseChip>
      </div>
      <p class="mt-1.5 text-[13px] text-[var(--color-ink-soft)]">{{ preview(e) }}</p>
      <p class="mt-2 text-[13px] text-[var(--color-ink-soft)]">
        {{ relativeTime(e.createdAt) }}
        <span v-if="e.visibility === 'SHARED'"> · {{ authorName(e.authorId) }}</span>
      </p>
    </NuxtLink>
  </div>
</template>
