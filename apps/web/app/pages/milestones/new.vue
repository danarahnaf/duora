<script setup lang="ts">
import { CreateMilestoneSchema } from '@couple/contracts';

definePageMeta({ middleware: 'couple-required' });
useHead({ title: 'Milestone baru' });

const { create } = useMilestones();
const ui = useUiStore();

const ICONS = ['💍', '🎂', '🏔️', '✈️', '🏠', '☕', '🎉', '👋', '⭐', '🌱'];

const form = reactive({ title: '', date: localDate(), note: '', icon: '⭐' });
const errors = reactive<Record<string, string | null>>({ title: null, date: null });
const saving = ref(false);
const topError = ref<string | null>(null);

async function submit() {
  errors.title = errors.date = null;
  topError.value = null;

  const parsed = CreateMilestoneSchema.safeParse({
    title: form.title.trim(),
    date: form.date,
    note: form.note.trim() || null,
    icon: form.icon,
  });
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? '');
      if (key in errors) errors[key] = issue.message;
    }
    return;
  }

  saving.value = true;
  try {
    await create(parsed.data);
    ui.toast('Milestone ditambahkan', 'success');
    await navigateTo('/milestones');
  } catch (e) {
    topError.value = apiErrorMessage(e);
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div>
    <NavAppHeader title="Milestone baru" back="/milestones" />

    <form class="flex flex-col gap-5 px-4 py-4" novalidate @submit.prevent="submit">
      <p
        v-if="topError"
        class="rounded-[var(--radius-field)] bg-[var(--color-danger)]/12 px-3.5 py-2.5 text-[13px] text-[var(--color-danger)]"
        role="alert"
      >{{ topError }}</p>

      <BaseField v-model="form.title" label="Judul" :maxlength="120" :error="errors.title" placeholder="Pindah rumah" required />
      <BaseField v-model="form.date" type="date" label="Tanggal" :error="errors.date" required />
      <BaseField v-model="form.note" type="textarea" label="Catatan" :rows="3" :maxlength="1000" />

      <div>
        <p class="mb-2 text-[13px] font-medium">Ikon</p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="i in ICONS" :key="i" type="button"
            class="ico tap-target grid size-11 place-items-center rounded-[var(--radius-field)] border text-lg"
            :class="form.icon === i ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)]' : 'border-[var(--color-line-strong)]'"
            :aria-pressed="form.icon === i"
            @click="form.icon = i"
          >{{ i }}</button>
        </div>
      </div>

      <BaseButton type="submit" block size="lg" :loading="saving">Simpan milestone</BaseButton>
    </form>
  </div>
</template>

<style scoped>
.ico { transition: background-color var(--dur-pop) var(--ease-out), border-color var(--dur-pop) var(--ease-out); }
.ico:active { transform: scale(0.97); }
</style>
