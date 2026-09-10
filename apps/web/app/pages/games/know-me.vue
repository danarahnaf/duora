<script setup lang="ts">
import GamePlay from '~/components/games/GamePlay.vue';

definePageMeta({ middleware: 'couple-required' });
useHead({ title: 'How Well Do You Know Me' });
</script>

<template>
  <GamePlay game-key="know-me" title="How Well Do You Know Me" layout="options" />
</template>
