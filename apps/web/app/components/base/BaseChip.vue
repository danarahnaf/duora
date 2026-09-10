<script setup lang="ts">
import type { IconName } from '~/utils/icons';

withDefaults(defineProps<{
  icon?: IconName;
  tone?: 'default' | 'primary' | 'accent' | 'danger' | 'success';
  size?: 'sm' | 'md';
}>(), { tone: 'default', size: 'md' });

const TONES: Record<string, string> = {
  default: 'bg-[var(--color-line)] text-[var(--color-ink-soft)]',
  primary: 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]',
  accent: 'bg-[var(--color-accent)]/35 text-[var(--color-accent-ink)]',
  danger: 'bg-[var(--color-danger)]/12 text-[var(--color-danger)]',
  success: 'bg-[var(--color-success)]/15 text-[var(--color-success)]',
};
</script>

<template>
  <span
    class="inline-flex items-center gap-1 rounded-[var(--radius-pill)] font-medium whitespace-nowrap"
    :class="[TONES[tone], size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-[13px]']"
  >
    <BaseIcon v-if="icon" :name="icon" :size="size === 'sm' ? 12 : 14" />
    <slot />
  </span>
</template>
