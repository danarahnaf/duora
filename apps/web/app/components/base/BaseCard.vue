<script setup lang="ts">
import { NuxtLink } from '#components';

/**
 * `glass` HANYA untuk kartu yang tidak berada di dalam list panjang (budget §4.2).
 * Kartu di dalam timeline/list wajib `variant="solid"`.
 */
withDefaults(defineProps<{
  variant?: 'glass' | 'solid' | 'plain';
  to?: string;
  padded?: boolean;
}>(), { variant: 'solid', padded: true });
</script>

<template>
  <component
    :is="to ? NuxtLink : 'div'"
    :to="to"
    class="block"
    :class="[
      variant === 'glass' && 'glass-1 relative',
      variant === 'solid' && 'solid-card',
      variant === 'plain' && 'rounded-[var(--radius-card)] border border-[var(--color-line)]',
      padded && 'p-4',
      to && 'pressable',
    ]"
  >
    <slot />
  </component>
</template>
