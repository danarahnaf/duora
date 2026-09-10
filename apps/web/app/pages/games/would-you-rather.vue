<script setup lang="ts">
import GamePlay from '~/components/games/GamePlay.vue';

definePageMeta({ middleware: 'couple-required' });
useHead({ title: 'Would You Rather' });
</script>

<template>
  <GamePlay game-key="would-you-rather" title="Would You Rather" layout="stacked" />
</template>
