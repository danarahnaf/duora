<script setup lang="ts">
import type { CreateJournal, JournalEntry, JournalVisibility } from '@couple/contracts';
import { CreateJournalSchema } from '@couple/contracts';
import VisibilityToggle from '~/components/journal/VisibilityToggle.vue';

const props = defineProps<{
  initial?: JournalEntry | null;
  loading?: boolean;
  submitLabel?: string;
}>();
const emit = defineEmits<{ submit: [payload: CreateJournal]; dirty: [value: boolean] }>();

const title = ref(props.initial?.title ?? '');
const body = ref(props.initial?.body ?? '');
const visibility = ref<JournalVisibility>(props.initial?.visibility ?? 'PRIVATE');
const error = ref<string | null>(null);

const words = computed(() => (body.value.trim() ? body.value.trim().split(/\s+/).length : 0));

watch([title, body, visibility], () => {
  const changed = title.value !== (props.initial?.title ?? '')
    || body.value !== (props.initial?.body ?? '')
    || visibility.value !== (props.initial?.visibility ?? 'PRIVATE');
  emit('dirty', changed);
});

function submit() {
  error.value = null;
  const parsed = CreateJournalSchema.safeParse({
    title: title.value.trim() || null,
    body: body.value.trim(),
    visibility: visibility.value,
  });
  if (!parsed.success) {
    error.value = parsed.error.issues[0]?.message ?? 'Isian belum benar';
    return;
  }
  emit('submit', parsed.data);
}
</script>

<template>
  <form class="flex flex-col gap-5" novalidate @submit.prevent="submit">
    <p v-if="error" class="text-[13px] text-[var(--color-danger)]" role="alert">{{ error }}</p>

    <BaseField v-model="title" label="Judul (opsional)" :maxlength="120" placeholder="Catatan malam ini" />

    <div>
      <BaseField
        v-model="body" type="textarea" label="Isi" :rows="12" :maxlength="20000"
        placeholder="Tulis apa adanya."
      />
      <p class="mt-1.5 text-[13px] text-[var(--color-ink-soft)]">{{ words }} kata</p>
    </div>

    <VisibilityToggle v-model="visibility" />

    <BaseButton type="submit" block size="lg" :loading="loading">{{ submitLabel ?? 'Simpan' }}</BaseButton>
  </form>
</template>
