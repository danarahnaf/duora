<script setup lang="ts">
import type { Answer, PublicUser } from '@couple/contracts';

/** Satu dari tiga surface yang boleh delight (§4.3): crossfade + blur. */
const props = defineProps<{ answers: Answer[]; members: PublicUser[] }>();

function author(id: string) {
  return props.members.find(m => m.id === id) ?? null;
}
</script>

<template>
  <div class="mt-5 grid gap-3 sm:grid-cols-2">
    <article
      v-for="(a, i) in answers" :key="a.authorId"
      class="reveal-in rounded-[var(--radius-card)] border border-[var(--color-line)] p-4"
      :style="{ animationDelay: `${i * 90}ms` }"
    >
      <div class="flex items-center gap-2">
        <BaseAvatar :name="author(a.authorId)?.displayName ?? '—'" :src="author(a.authorId)?.avatarUrl" size="sm" />
        <span class="text-[13px] font-medium">{{ author(a.authorId)?.displayName ?? 'Anggota' }}</span>
      </div>
      <p class="prose-measure mt-3 text-[15px] leading-relaxed whitespace-pre-line">{{ a.body }}</p>
      <p class="mt-2.5 text-[13px] text-[var(--color-ink-soft)]">{{ relativeTime(a.createdAt) }}</p>
    </article>
  </div>
</template>
