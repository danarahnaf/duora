<script setup lang="ts">
import { CreateEventSchema, type CalendarEvent, type CreateEvent, type EventCategory } from '@couple/contracts';

const props = defineProps<{
  initial?: CalendarEvent | null;
  defaultDate?: string;
  loading?: boolean;
  submitLabel?: string;
}>();
const emit = defineEmits<{ submit: [payload: CreateEvent] }>();

const CATEGORIES: { value: EventCategory; label: string }[] = [
  { value: 'DATE', label: 'Kencan' },
  { value: 'ANNIVERSARY', label: 'Anniversary' },
  { value: 'BIRTHDAY', label: 'Ulang tahun' },
  { value: 'TRIP', label: 'Perjalanan' },
  { value: 'REMINDER', label: 'Pengingat' },
  { value: 'PERSONAL', label: 'Pribadi' },
  { value: 'IMPORTANT', label: 'Penting' },
];

const REMINDERS: { value: number | null; label: string }[] = [
  { value: null, label: 'Tanpa pengingat' },
  { value: 15, label: '15 menit' },
  { value: 60, label: '1 jam' },
  { value: 1440, label: '1 hari' },
];

const form = reactive({
  title: props.initial?.title ?? '',
  category: (props.initial?.category ?? 'DATE') as EventCategory,
  date: props.initial?.date ?? props.defaultDate ?? localDate(),
  time: props.initial?.time ?? '19:00',
  isAllDay: props.initial?.isAllDay ?? false,
  location: props.initial?.location ?? '',
  budget: props.initial?.budgetIdr != null ? String(props.initial.budgetIdr) : '',
  notes: props.initial?.notes ?? '',
  reminderMinutes: (props.initial?.reminderMinutes ?? 60) as number | null,
});

const errors = reactive<Record<string, string | null>>({ title: null, date: null, time: null, budgetIdr: null });

const budgetPreview = computed(() => {
  const n = Number(form.budget.replace(/\D/g, ''));
  return form.budget && n > 0 ? formatIdr(n) : null;
});

function submit() {
  for (const k of Object.keys(errors)) errors[k] = null;

  const digits = form.budget.replace(/\D/g, '');
  const payload = {
    title: form.title.trim(),
    category: form.category,
    date: form.date,
    time: form.isAllDay ? null : form.time,
    location: form.location.trim() || null,
    budgetIdr: digits ? Number(digits) : null,
    notes: form.notes.trim() || null,
    reminderMinutes: form.reminderMinutes,
    isAllDay: form.isAllDay,
  };

  const parsed = CreateEventSchema.safeParse(payload);
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
  <form class="flex flex-col gap-5" novalidate @submit.prevent="submit">
    <BaseField v-model="form.title" label="Judul" :maxlength="120" :error="errors.title" placeholder="Date night" required />

    <div>
      <p class="mb-2 text-[13px] font-medium">Kategori</p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="c in CATEGORIES" :key="c.value" type="button"
          class="chip tap-target rounded-[var(--radius-pill)] border px-3.5 py-2 text-[13px]"
          :class="form.category === c.value
            ? 'border-transparent bg-[var(--color-primary)] text-[var(--color-primary-ink)]'
            : 'border-[var(--color-line-strong)] text-[var(--color-ink-soft)]'"
          @click="form.category = c.value"
        >{{ c.label }}</button>
      </div>
    </div>

    <BaseField v-model="form.date" type="date" label="Tanggal" :error="errors.date" required />

    <BaseSwitch v-model="form.isAllDay" label="Sepanjang hari" description="Tanpa jam tertentu." />
    <BaseField v-if="!form.isAllDay" v-model="form.time" type="time" label="Jam" :error="errors.time" />

    <BaseField v-model="form.location" label="Lokasi" :maxlength="120" placeholder="Kopi Kalyan, Malang" />

    <div>
      <BaseField v-model="form.budget" label="Budget" inputmode="numeric" placeholder="250000" :error="errors.budgetIdr" />
      <p v-if="budgetPreview" class="mt-1.5 text-[13px] text-[var(--color-ink-soft)]">{{ budgetPreview }}</p>
    </div>

    <BaseField v-model="form.notes" type="textarea" label="Catatan" :rows="3" :maxlength="2000" />

    <div>
      <p class="mb-2 text-[13px] font-medium">Pengingat</p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="r in REMINDERS" :key="String(r.value)" type="button"
          class="chip tap-target rounded-[var(--radius-pill)] border px-3.5 py-2 text-[13px]"
          :class="form.reminderMinutes === r.value
            ? 'border-transparent bg-[var(--color-primary)] text-[var(--color-primary-ink)]'
            : 'border-[var(--color-line-strong)] text-[var(--color-ink-soft)]'"
          @click="form.reminderMinutes = r.value"
        >{{ r.label }}</button>
      </div>
    </div>

    <BaseButton type="submit" block size="lg" :loading="loading">{{ submitLabel ?? 'Simpan acara' }}</BaseButton>
  </form>
</template>

<style scoped>
.chip { transition: background-color var(--dur-pop) var(--ease-out), border-color var(--dur-pop) var(--ease-out), color var(--dur-pop) var(--ease-out); }
.chip:active { transform: scale(0.97); }
</style>
