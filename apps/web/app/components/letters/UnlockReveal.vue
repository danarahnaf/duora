<script setup lang="ts">
/** Satu dari tiga surface delight (§4.3): clip-path 700ms, hanya saat pertama dibuka. */
defineProps<{ body: string; animate: boolean }>();
</script>

<template>
  <div :class="animate && 'letter-unwrap'">
    <p class="prose-measure text-[17px] leading-relaxed whitespace-pre-line">{{ body }}</p>
  </div>
</template>
