<script setup lang="ts">
withDefaults(defineProps<{
  title?: string;
  back?: string | boolean;
  /** header transparan untuk layar hero (home) */
  transparent?: boolean;
}>(), {});

const router = useRouter();

function goBack(target: string | boolean) {
  if (typeof target === 'string') return navigateTo(target);
  return router.back();
}
</script>

<template>
  <header
    class="sticky top-0 z-20 flex h-14 items-center gap-2 px-4"
    :class="transparent ? '' : 'glass-2'"
  >
    <button
      v-if="back"
      type="button" aria-label="Kembali"
      class="back tap-target -ml-2 grid place-items-center rounded-full p-2"
      @click="goBack(back)"
    >
      <BaseIcon name="chevronLeft" :size="20" />
    </button>
    <h1 v-if="title" class="min-w-0 flex-1 truncate text-[15px] font-semibold">
      {{ title }}
    </h1>
    <div v-else class="flex-1" />
    <slot name="actions" />
  </header>
</template>

<style scoped>
.back { transition: transform var(--dur-press) var(--ease-out), background-color var(--dur-pop) var(--ease-out); }
.back:active { transform: scale(0.97); }
</style>
