<script setup lang="ts">
import type { IconName } from '~/utils/icons';

defineProps<{ icon: IconName; title: string; description: string; to: string }>();
</script>

<template>
  <NuxtLink
    :to="to"
    class="card pressable flex items-center gap-4 rounded-[var(--radius-card)] border
           border-[var(--color-line-strong)] bg-[var(--color-surface-solid)] p-4 text-left"
  >
    <span class="grid size-12 shrink-0 place-items-center rounded-[var(--radius-field)] bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
      <BaseIcon :name="icon" :size="22" />
    </span>
    <span class="min-w-0 flex-1">
      <span class="block text-[15px] font-semibold">{{ title }}</span>
      <span class="mt-0.5 block text-[13px] text-[var(--color-ink-soft)]">{{ description }}</span>
    </span>
    <BaseIcon name="chevronRight" :size="18" class="text-[var(--color-ink-soft)]" />
  </NuxtLink>
</template>

<style scoped>
.card { transition: border-color var(--dur-pop) var(--ease-out), transform var(--dur-press) var(--ease-out); }
@media (hover: hover) and (pointer: fine) {
  .card:hover { border-color: var(--color-primary); }
}
</style>
