<script setup lang="ts">
import type { Memory, PublicUser } from '@couple/contracts';

const props = defineProps<{ memory: Memory; members: PublicUser[] }>();

const gallery = ref<HTMLElement | null>(null);
const active = ref(0);

function onScroll() {
  const el = gallery.value;
  if (!el || !el.clientWidth) return;
  active.value = Math.round(el.scrollLeft / el.clientWidth);
}

const author = computed(() =>
  props.members.find(m => m.id === props.memory.createdById)?.displayName ?? 'Anggota');
</script>

<template>
  <div>
    <div v-if="memory.media.length" class="relative">
      <div
        ref="gallery"
        class="scrollbar-none flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-[var(--radius-card)]"
        @scroll.passive="onScroll"
      >
        <img
          v-for="m in memory.media" :key="m.id"
          :src="m.url" alt="" class="aspect-4/3 w-full shrink-0 snap-center object-cover"
          loading="lazy" decoding="async"
        >
      </div>

      <div v-if="memory.media.length > 1" class="mt-2.5 flex justify-center gap-1.5">
        <span
          v-for="(m, i) in memory.media" :key="m.id"
          class="dot size-1.5 rounded-full"
          :class="i === active ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-line-strong)]'"
        />
      </div>
    </div>

    <div class="mt-5">
      <div class="flex flex-wrap items-center gap-2">
        <BaseChip icon="calendar" size="sm">{{ formatDateLong(memory.happenedAt) }}</BaseChip>
        <BaseChip v-if="memory.location" icon="mapPin" size="sm">{{ memory.location }}</BaseChip>
        <BaseChip v-if="memory.isFavorite" tone="accent" icon="star" size="sm">Favorit</BaseChip>
      </div>

      <p v-if="memory.caption" class="prose-measure mt-4 text-[15px] leading-relaxed whitespace-pre-line">
        {{ memory.caption }}
      </p>

      <p class="mt-4 text-[13px] text-[var(--color-ink-soft)]">
        Ditambahkan {{ author }} · {{ relativeTime(memory.createdAt) }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.dot { transition: background-color 160ms var(--ease-out); }
</style>
