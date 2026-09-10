<script setup lang="ts">
import type { Plan, PlanKey } from '@couple/contracts';

defineProps<{ plans: Plan[]; currentPlan: PlanKey }>();
const emit = defineEmits<{ choose: [key: PlanKey] }>();

const PERIOD: Record<Plan['period'], string> = {
  FOREVER: 'selamanya',
  MONTH: '/bln',
  YEAR: '/thn',
};
</script>

<template>
  <div class="grid gap-3 sm:grid-cols-3">
    <div
      v-for="p in plans" :key="p.key"
      class="rounded-[var(--radius-card)] border p-5"
      :class="p.key === currentPlan
        ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)]'
        : 'border-[var(--color-line-strong)] bg-[var(--color-surface-solid)]'"
    >
      <div class="flex items-center gap-2">
        <h3 class="text-[15px] font-semibold">{{ p.name }}</h3>
        <BaseChip v-if="p.badge" size="sm" tone="accent">{{ p.badge }}</BaseChip>
        <BaseChip v-if="p.key === currentPlan" size="sm" tone="primary">Paket kamu</BaseChip>
      </div>

      <p class="text-display mt-2 text-2xl">
        {{ p.priceIdr === 0 ? 'Gratis' : formatIdr(p.priceIdr) }}
        <span class="text-[13px] font-normal text-[var(--color-ink-soft)]">{{ PERIOD[p.period] }}</span>
      </p>

      <ul class="mt-4 flex flex-col gap-2">
        <li v-for="f in p.features" :key="f.label" class="flex items-start gap-2 text-[13px]">
          <BaseIcon
            :name="f.included ? 'check' : 'close'" :size="15"
            :class="f.included ? 'mt-0.5 text-[var(--color-success)]' : 'mt-0.5 text-[var(--color-ink-soft)]'"
          />
          <span :class="!f.included && 'text-[var(--color-ink-soft)]'">{{ f.label }}</span>
        </li>
      </ul>

      <BaseButton
        v-if="p.key !== currentPlan" class="mt-5" block size="sm"
        :variant="p.key === 'FREE' ? 'ghost' : 'primary'"
        @click="emit('choose', p.key)"
      >Pilih {{ p.name }}</BaseButton>
    </div>
  </div>
</template>
