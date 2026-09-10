<script setup lang="ts">
import type { MoodCheckin } from '@couple/contracts';

defineProps<{ mood: MoodCheckin | null; partnerName: string }>();
</script>

<template>
  <div class="solid-card p-5">
    <template v-if="mood">
      <div class="flex items-center gap-4">
        <span class="text-4xl" aria-hidden="true">{{ MOOD_META[mood.level].emoji }}</span>
        <div class="min-w-0">
          <p class="text-[15px] font-semibold">
            {{ partnerName }} sedang {{ MOOD_META[mood.level].label.toLowerCase() }}
          </p>
          <p class="mt-0.5 text-[13px] text-[var(--color-ink-soft)]">
            check-in {{ relativeTime(mood.createdAt) }}
          </p>
        </div>
      </div>
      <p v-if="mood.note" class="mt-4 text-[15px] leading-relaxed">“{{ mood.note }}”</p>
    </template>

    <div v-else class="flex items-center gap-4">
      <span class="text-4xl" aria-hidden="true">🕒</span>
      <div>
        <p class="text-[15px] font-semibold">{{ partnerName }} belum check-in hari ini</p>
        <p class="mt-0.5 text-[13px] text-[var(--color-ink-soft)]">Nanti muncul di sini kalau sudah.</p>
      </div>
    </div>
  </div>
</template>
