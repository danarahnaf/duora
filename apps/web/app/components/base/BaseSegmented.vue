<script setup lang="ts">
/** Segmented control (filter private/shared, dsb). Opacity-only, tanpa animasi posisi. */
const model = defineModel<string>({ required: true });

defineProps<{
  options: { value: string; label: string; count?: number }[];
}>();
</script>

<template>
  <div
    class="inline-flex w-full rounded-[var(--radius-pill)] border border-[var(--color-line)]
           bg-[var(--color-surface-solid)] p-1"
    role="tablist"
  >
    <button
      v-for="o in options" :key="o.value" type="button" role="tab"
      :aria-selected="model === o.value"
      class="seg tap-target flex-1 rounded-[var(--radius-pill)] px-3 py-1.5 text-[13px] font-medium"
      :class="model === o.value
        ? 'bg-[var(--color-primary)] text-[var(--color-primary-ink)]'
        : 'text-[var(--color-ink-soft)]'"
      @click="model = o.value"
    >
      {{ o.label }}
      <span v-if="o.count !== undefined" class="ml-1 tabular-nums opacity-70">{{ o.count }}</span>
    </button>
  </div>
</template>

<style scoped>
.seg {
  transition: background-color var(--dur-pop) var(--ease-out), color var(--dur-pop) var(--ease-out);
}
.seg:active { transform: scale(0.97); }
</style>
