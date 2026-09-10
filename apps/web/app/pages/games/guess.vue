<script setup lang="ts">
import GamePlay from '~/components/games/GamePlay.vue';

definePageMeta({ middleware: 'couple-required' });
useHead({ title: 'Guess My Answer' });
</script>

<template>
  <GamePlay game-key="guess" title="Guess My Answer" layout="options" />
</template>
