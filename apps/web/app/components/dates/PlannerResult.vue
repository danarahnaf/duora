<script setup lang="ts">
import type { DatePlan } from '@couple/contracts';

const props = defineProps<{ plan: DatePlan }>();

const diff = computed(() => props.plan.input.budgetIdr - props.plan.totalIdr);
</script>

<template>
  <div>
    <h1 class="text-display text-2xl">{{ plan.title }}</h1>
    <div class="mt-2 flex flex-wrap gap-1.5">
      <BaseChip size="sm" icon="clock">{{ plan.input.durationHours }} jam</BaseChip>
      <BaseChip size="sm" icon="mapPin">{{ plan.input.area }}</BaseChip>
      <BaseChip v-if="plan.status !== 'DRAFT'" size="sm" tone="success" icon="check">Tersimpan</BaseChip>
    </div>

    <ol class="mt-6 flex flex-col">
      <li v-for="(s, i) in plan.steps" :key="i" class="flex gap-4">
        <div class="flex flex-col items-center">
          <span class="grid size-2.5 place-items-center rounded-full bg-[var(--color-primary)]" />
          <span v-if="i < plan.steps.length - 1" class="w-px flex-1 bg-[var(--color-line-strong)]" />
        </div>
        <div class="pb-6">
          <p class="text-display text-[15px] text-[var(--color-primary)]">{{ s.time }}</p>
          <p class="mt-0.5 text-[15px] font-medium">{{ s.title }}</p>
          <p class="mt-1 text-[13px] text-[var(--color-ink-soft)]">{{ s.detail }}</p>
          <p v-if="s.costIdr" class="mt-1.5 text-[13px]">{{ formatIdr(s.costIdr) }}</p>
        </div>
      </li>
    </ol>

    <div class="solid-card flex items-baseline justify-between p-4">
      <span class="text-[13px] text-[var(--color-ink-soft)]">Total perkiraan</span>
      <span class="text-display text-xl">{{ formatIdr(plan.totalIdr) }}</span>
    </div>
    <p class="mt-2 text-[13px] text-[var(--color-ink-soft)]">
      Budget {{ formatIdr(plan.input.budgetIdr) }} ·
      <span v-if="diff >= 0">sisa {{ formatIdr(diff) }}</span>
      <span v-else class="text-[var(--color-danger)]">lebih {{ formatIdr(-diff) }}</span>
    </p>
  </div>
</template>
