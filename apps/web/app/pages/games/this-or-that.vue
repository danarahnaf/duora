<script setup lang="ts">
import GamePlay from '~/components/games/GamePlay.vue';

definePageMeta({ middleware: 'couple-required' });
useHead({ title: 'This or That' });
</script>

<template>
  <GamePlay game-key="this-or-that" title="This or That" layout="duo" />
</template>
