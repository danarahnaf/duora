<script setup lang="ts">
import type { JournalVisibility } from '@couple/contracts';

const model = defineModel<JournalVisibility>({ required: true });

const OPTIONS: { value: JournalVisibility; label: string; hint: string }[] = [
  { value: 'PRIVATE', label: 'Pribadi', hint: 'Hanya kamu yang bisa membaca. Partner tidak melihatnya sama sekali.' },
  { value: 'SHARED', label: 'Bersama', hint: 'Partner bisa membaca catatan ini.' },
];

const hint = computed(() => OPTIONS.find(o => o.value === model.value)?.hint ?? '');
</script>

<template>
  <div>
    <p class="mb-2 text-[13px] font-medium">Siapa yang bisa baca</p>
    <div class="grid grid-cols-2 gap-2">
      <button
        v-for="o in OPTIONS" :key="o.value" type="button"
        class="opt tap-target flex items-center justify-center gap-2 rounded-[var(--radius-pill)] border py-2.5 text-[13px]"
        :class="model === o.value
          ? 'border-transparent bg-[var(--color-primary)] text-[var(--color-primary-ink)]'
          : 'border-[var(--color-line-strong)] text-[var(--color-ink-soft)]'"
        @click="model = o.value"
      >
        <BaseIcon :name="o.value === 'PRIVATE' ? 'lock' : 'users'" :size="15" />{{ o.label }}
      </button>
    </div>
    <p class="mt-2 text-[13px] text-[var(--color-ink-soft)]">{{ hint }}</p>
  </div>
</template>

<style scoped>
.opt { transition: background-color var(--dur-pop) var(--ease-out), border-color var(--dur-pop) var(--ease-out), color var(--dur-pop) var(--ease-out); }
.opt:active { transform: scale(0.97); }
</style>
