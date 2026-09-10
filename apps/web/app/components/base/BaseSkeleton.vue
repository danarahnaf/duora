<script setup lang="ts">
/**
 * Bentuk skeleton harus MENIRU konten akhir (§4.5). Karena itu skeleton di sini
 * berupa preset per konteks, bukan kotak generik.
 */
withDefaults(defineProps<{
  variant?: 'text' | 'title' | 'card' | 'avatar' | 'thumb' | 'line';
  count?: number;
  width?: string;
}>(), {
  variant: 'text',
  count: 1,
});
</script>

<template>
  <div class="flex flex-col gap-2" role="status" aria-label="Memuat">
    <template v-if="variant === 'card'">
      <div v-for="i in count" :key="i" class="sk h-28 rounded-[var(--radius-card)]" />
    </template>
    <template v-else-if="variant === 'thumb'">
      <div v-for="i in count" :key="i" class="sk aspect-4/3 w-full rounded-[var(--radius-card)]" />
    </template>
    <template v-else-if="variant === 'avatar'">
      <div class="sk size-11 rounded-full" />
    </template>
    <template v-else-if="variant === 'title'">
      <div class="sk h-6 rounded-[var(--radius-xs)]" :style="{ width: width ?? '60%' }" />
    </template>
    <template v-else>
      <div
        v-for="i in count" :key="i" class="sk h-3.5 rounded"
        :style="{ width: width ?? (i === count && count > 1 ? '70%' : '100%') }"
      />
    </template>
  </div>
</template>

<style scoped>
/* Shimmer linear & cepat: spinner cepat membuat load terasa lebih cepat (§4.3). */
.sk {
  position: relative;
  overflow: hidden;
  background: var(--color-line);
}
.sk::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, oklch(1 0 0 / 0.28), transparent);
  animation: skeleton-sweep 900ms linear infinite;
}
</style>
