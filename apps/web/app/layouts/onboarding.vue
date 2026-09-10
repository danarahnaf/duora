<script setup lang="ts">
/** Progress step diambil dari meta route: definePageMeta({ step: 2 }) */
const route = useRoute();
const TOTAL = 4;
const step = computed(() => Number(route.meta.step ?? 1));
</script>

<template>
  <div class="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 py-6">
    <div class="mb-8 flex items-center gap-2" role="progressbar" :aria-valuenow="step" :aria-valuemax="TOTAL">
      <span
        v-for="i in TOTAL" :key="i"
        class="bar h-1 flex-1 rounded-full"
        :class="i <= step ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-line-strong)]'"
      />
      <span class="sr-only">Langkah {{ step }} dari {{ TOTAL }}</span>
    </div>
    <div class="flex-1">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.bar { transition: background-color 200ms var(--ease-out); }
</style>
