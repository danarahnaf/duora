<script setup lang="ts">
defineProps<{ title: string; description?: string }>();
</script>

<template>
  <header class="mb-7">
    <h1 class="text-display text-2xl">{{ title }}</h1>
    <p v-if="description" class="mt-1.5 text-[15px] text-[var(--color-ink-soft)]">{{ description }}</p>
  </header>
</template>
