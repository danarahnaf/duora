<script setup lang="ts">
import { ICON_PATHS, type IconName } from '~/utils/icons';

const props = withDefaults(defineProps<{ name: IconName; size?: number | string }>(), {
  size: 20,
});

const d = computed(() => ICON_PATHS[props.name]);
</script>

<template>
  <svg
    :width="size" :height="size" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"
    aria-hidden="true" focusable="false" class="shrink-0"
  >
    <path :d="d" />
  </svg>
</template>
