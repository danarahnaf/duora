<script setup lang="ts">
withDefaults(defineProps<{
  name: string;
  src?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  ring?: boolean;
}>(), { size: 'md' });

const SIZES: Record<string, string> = {
  sm: 'size-8 text-[11px]',
  md: 'size-11 text-[15px]',
  lg: 'size-14 text-base',
  xl: 'size-20 text-xl',
};
</script>

<template>
  <span
    class="grid shrink-0 place-items-center overflow-hidden rounded-full
           bg-[var(--color-primary-soft)] font-semibold text-[var(--color-primary)]"
    :class="[SIZES[size], ring && 'ring-2 ring-[var(--color-surface-solid)]']"
  >
    <img v-if="src" :src="src" :alt="name" class="size-full object-cover" loading="lazy">
    <span v-else aria-hidden="true">{{ initials(name) }}</span>
    <span v-if="!src" class="sr-only">{{ name }}</span>
  </span>
</template>
