<script setup lang="ts">
import type { Memory } from '@couple/contracts';
import MemoryCard from '~/components/memory/MemoryCard.vue';

defineProps<{
  groups: { ym: string; year: string; label: string; items: Memory[] }[];
}>();

/** Stagger dibatasi 6 item pertama, 50ms (§4.3) — dan hanya sekali. */
const staggered = ref(true);
onMounted(() => setTimeout(() => { staggered.value = false; }, 800));
</script>

<template>
  <div class="flex flex-col gap-7">
    <section v-for="(g, gi) in groups" :key="g.ym">
      <header class="sticky top-14 z-10 -mx-1 mb-3 bg-[var(--color-bg)] px-1 py-1.5">
        <h2 class="text-[13px] font-semibold">
          {{ g.label }}
          <span class="ml-1 font-normal text-[var(--color-ink-soft)]">{{ g.items.length }} memori</span>
        </h2>
      </header>

      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div
          v-for="(m, i) in g.items" :key="m.id"
          :class="staggered && gi === 0 && i < 6 && 'enter'"
          :style="staggered && gi === 0 && i < 6 ? { animationDelay: `${i * 50}ms` } : undefined"
        >
          <MemoryCard :memory="m" :eager="gi === 0 && i < 4" />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.enter { animation: card-in 240ms var(--ease-out) both; }
@keyframes card-in {
  from { opacity: 0; transform: translateY(8px); }
}
</style>
