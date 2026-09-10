<script setup lang="ts">
import type { IconName } from '~/utils/icons';

withDefaults(defineProps<{
  icon?: IconName;
  title: string;
  description?: string;
  actionLabel?: string;
  actionTo?: string;
}>(), { icon: 'sparkle' });

const emit = defineEmits<{ action: [] }>();
</script>

<template>
  <div class="grid place-items-center px-6 py-12 text-center">
    <div
      class="grid size-16 place-items-center rounded-[var(--radius-card)] bg-[var(--color-primary-soft)]
             text-[var(--color-primary)]"
      aria-hidden="true"
    >
      <BaseIcon :name="icon" :size="28" />
    </div>
    <h3 class="mt-4 text-[15px] font-semibold">
      {{ title }}
    </h3>
    <p v-if="description" class="mt-1.5 max-w-xs text-[15px] text-[var(--color-ink-soft)]">
      {{ description }}
    </p>
    <BaseButton
      v-if="actionLabel" class="mt-5" size="sm" :to="actionTo"
      @click="!actionTo && emit('action')"
    >
      {{ actionLabel }}
    </BaseButton>
    <div v-if="$slots.default" class="mt-4">
      <slot />
    </div>
  </div>
</template>
