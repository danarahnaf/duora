<script setup lang="ts">
import type { MoodCheckin, MoodLevel } from '@couple/contracts';

const props = defineProps<{ current?: MoodCheckin | null; loading?: boolean }>();
const emit = defineEmits<{ submit: [payload: { level: MoodLevel; note: string | null }] }>();

const level = ref<MoodLevel | null>(props.current?.level ?? null);
const note = ref(props.current?.note ?? '');

watch(() => props.current, (v) => {
  level.value = v?.level ?? null;
  note.value = v?.note ?? '';
});

function submit() {
  if (!level.value) return;
  emit('submit', { level: level.value, note: note.value.trim() || null });
}
</script>

<template>
  <form @submit.prevent="submit">
    <div class="grid grid-cols-5 gap-2">
      <button
        v-for="l in MOOD_ORDER" :key="l" type="button"
        class="lvl tap-target flex flex-col items-center gap-1.5 rounded-[var(--radius-field)] border py-3"
        :class="level === l
          ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)]'
          : 'border-[var(--color-line-strong)]'"
        :aria-pressed="level === l"
        @click="level = l"
      >
        <span class="text-2xl" aria-hidden="true">{{ MOOD_META[l].emoji }}</span>
        <span class="text-[11px] leading-tight text-[var(--color-ink-soft)]">{{ MOOD_META[l].label }}</span>
      </button>
    </div>

    <BaseField
      v-model="note" class="mt-4" type="textarea" :rows="2" :maxlength="280"
      label="Catatan (opsional)" placeholder="Satu kalimat saja."
    />

    <BaseButton class="mt-3" type="submit" block :loading="loading" :disabled="!level">
      {{ current ? 'Perbarui check-in' : 'Simpan check-in' }}
    </BaseButton>
  </form>
</template>

<style scoped>
.lvl { transition: background-color var(--dur-pop) var(--ease-out), border-color var(--dur-pop) var(--ease-out); }
.lvl:active { transform: scale(0.97); }
</style>
