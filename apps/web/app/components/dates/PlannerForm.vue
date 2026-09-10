<script setup lang="ts">
import { PlannerInputSchema, type PlannerInput } from '@couple/contracts';
import type { IconName } from '~/utils/icons';

defineProps<{ loading?: boolean }>();
const emit = defineEmits<{ submit: [input: PlannerInput] }>();

const MOODS: { value: PlannerInput['mood']; label: string; icon: IconName }[] = [
  { value: 'ROMANTIC', label: 'Romantis', icon: 'heart' },
  { value: 'FUN', label: 'Seru', icon: 'sparkle' },
  { value: 'CHILL', label: 'Santai', icon: 'moon' },
  { value: 'ADVENTURE', label: 'Jalan-jalan', icon: 'mapPin' },
  { value: 'FOODIE', label: 'Kuliner', icon: 'gift' },
];

const TRANSPORTS: { value: PlannerInput['transport']; label: string }[] = [
  { value: 'WALK', label: 'Jalan kaki' },
  { value: 'MOTORBIKE', label: 'Motor' },
  { value: 'CAR', label: 'Mobil' },
  { value: 'PUBLIC', label: 'Transportasi umum' },
];

const DURATIONS = [2, 3, 4, 6, 8];

const form = reactive({
  budget: 250_000,
  area: '',
  durationHours: 4,
  mood: 'ROMANTIC' as PlannerInput['mood'],
  transport: 'MOTORBIKE' as PlannerInput['transport'],
  date: '',
});
const errors = reactive<Record<string, string | null>>({ area: null, budgetIdr: null });

function submit() {
  errors.area = errors.budgetIdr = null;
  const parsed = PlannerInputSchema.safeParse({
    budgetIdr: form.budget,
    area: form.area.trim(),
    durationHours: form.durationHours,
    mood: form.mood,
    transport: form.transport,
    date: form.date || undefined,
  });
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? '');
      if (key in errors) errors[key] = issue.message;
    }
    return;
  }
  emit('submit', parsed.data);
}
</script>

<template>
  <form class="flex flex-col gap-6" novalidate @submit.prevent="submit">
    <div>
      <div class="mb-2 flex items-baseline justify-between">
        <label for="budget" class="text-[13px] font-medium">Budget</label>
        <span class="text-display text-[15px]">{{ formatIdr(form.budget) }}</span>
      </div>
      <input
        id="budget" v-model.number="form.budget" type="range"
        min="0" max="2000000" step="25000"
        class="w-full accent-[var(--color-primary)]"
      >
      <p v-if="errors.budgetIdr" class="mt-1.5 text-[13px] text-[var(--color-danger)]">{{ errors.budgetIdr }}</p>
    </div>

    <BaseField v-model="form.area" label="Daerah" :error="errors.area" placeholder="Malang kota" :maxlength="80" required />

    <div>
      <p class="mb-2 text-[13px] font-medium">Durasi</p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="d in DURATIONS" :key="d" type="button"
          class="chip tap-target rounded-[var(--radius-pill)] border px-4 py-2 text-[13px]"
          :class="form.durationHours === d
            ? 'border-transparent bg-[var(--color-primary)] text-[var(--color-primary-ink)]'
            : 'border-[var(--color-line-strong)] text-[var(--color-ink-soft)]'"
          @click="form.durationHours = d"
        >{{ d }} jam</button>
      </div>
    </div>

    <div>
      <p class="mb-2 text-[13px] font-medium">Suasana</p>
      <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <button
          v-for="m in MOODS" :key="m.value" type="button"
          class="chip tap-target flex items-center gap-2 rounded-[var(--radius-field)] border px-3 py-2.5 text-[13px]"
          :class="form.mood === m.value
            ? 'border-transparent bg-[var(--color-primary)] text-[var(--color-primary-ink)]'
            : 'border-[var(--color-line-strong)] text-[var(--color-ink-soft)]'"
          @click="form.mood = m.value"
        ><BaseIcon :name="m.icon" :size="16" />{{ m.label }}</button>
      </div>
    </div>

    <div>
      <p class="mb-2 text-[13px] font-medium">Transportasi</p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="t in TRANSPORTS" :key="t.value" type="button"
          class="chip tap-target rounded-[var(--radius-pill)] border px-3.5 py-2 text-[13px]"
          :class="form.transport === t.value
            ? 'border-transparent bg-[var(--color-primary)] text-[var(--color-primary-ink)]'
            : 'border-[var(--color-line-strong)] text-[var(--color-ink-soft)]'"
          @click="form.transport = t.value"
        >{{ t.label }}</button>
      </div>
    </div>

    <BaseField v-model="form.date" type="date" label="Tanggal (opsional)" />

    <BaseButton type="submit" block size="lg" :loading="loading">
      {{ loading ? 'Menyusun rencana…' : 'Buatkan rencana' }}
    </BaseButton>
  </form>
</template>

<style scoped>
.chip { transition: background-color var(--dur-pop) var(--ease-out), border-color var(--dur-pop) var(--ease-out), color var(--dur-pop) var(--ease-out); }
.chip:active { transform: scale(0.97); }
</style>
