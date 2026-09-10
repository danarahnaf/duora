<script setup lang="ts">
import { SwitchRoot, SwitchThumb } from 'reka-ui';

const model = defineModel<boolean>({ required: true });
defineProps<{ label?: string; description?: string; disabled?: boolean }>();
const id = useId();
</script>

<template>
  <div class="flex items-start justify-between gap-4">
    <div v-if="label" class="min-w-0">
      <label :for="id" class="block text-[15px] font-medium">{{ label }}</label>
      <p v-if="description" class="mt-0.5 text-[13px] text-[var(--color-ink-soft)]">
        {{ description }}
      </p>
    </div>
    <SwitchRoot
      :id="id" v-model="model" :disabled="disabled"
      class="track relative h-6.5 w-11 shrink-0 rounded-full border border-[var(--color-line)]
             disabled:opacity-50"
      :class="model ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-line-strong)]'"
    >
      <SwitchThumb
        class="thumb block size-5 rounded-full bg-white shadow-sm"
        :class="model ? 'translate-x-5.5' : 'translate-x-0.5'"
      />
    </SwitchRoot>
  </div>
</template>

<style scoped>
.track { transition: background-color var(--dur-pop) var(--ease-out); }
.thumb { transition: transform var(--dur-pop) var(--ease-out); }
</style>
