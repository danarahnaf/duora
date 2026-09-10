<script setup lang="ts">
defineProps<{ items: string[]; disabled?: boolean }>();
const emit = defineEmits<{ pick: [prompt: string] }>();
</script>

<template>
  <div class="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4">
    <button
      v-for="c in items" :key="c" type="button" :disabled="disabled"
      class="chip shrink-0 rounded-[var(--radius-pill)] border border-[var(--color-line-strong)]
             px-3.5 py-2 text-[13px] whitespace-nowrap text-[var(--color-ink-soft)] disabled:opacity-50"
      @click="emit('pick', c)"
    >{{ c }}</button>
  </div>
</template>

<style scoped>
.chip { transition: background-color var(--dur-pop) var(--ease-out), border-color var(--dur-pop) var(--ease-out); }
.chip:active { transform: scale(0.97); }
</style>
