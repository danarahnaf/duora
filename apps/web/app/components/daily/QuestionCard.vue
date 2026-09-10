<script setup lang="ts">
import type { QuestionCategory } from '@couple/contracts';

withDefaults(defineProps<{
  category: QuestionCategory;
  text: string;
  compact?: boolean;
}>(), {});

const LABELS: Record<QuestionCategory, string> = {
  FUN: 'Seru', ROMANTIC: 'Romantis', DEEP: 'Dalam', FUTURE: 'Masa depan',
  MEMORIES: 'Kenangan', RELATIONSHIP: 'Hubungan', RANDOM: 'Acak',
  LDR: 'Jarak jauh', FUNNY: 'Lucu',
};
</script>

<template>
  <div>
    <BaseChip tone="primary" size="sm">{{ LABELS[category] }}</BaseChip>
    <p class="text-display mt-2.5" :class="compact ? 'text-lg' : 'text-2xl leading-snug'">
      {{ text }}
    </p>
  </div>
</template>
