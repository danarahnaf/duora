<script setup lang="ts">
import EventForm from '~/components/calendar/EventForm.vue';
import type { CreateEvent } from '@couple/contracts';

definePageMeta({ middleware: 'couple-required' });

const route = useRoute();
const editId = computed(() => (route.query.id ? String(route.query.id) : null));
const defaultDate = computed(() => (route.query.date ? String(route.query.date) : undefined));

useHead({ title: () => (editId.value ? 'Ubah acara' : 'Acara baru') });

const coupleStore = useCoupleStore();
const month = computed(() => (defaultDate.value ?? localDate(coupleStore.timezone)).slice(0, 7));
const { create, update } = useCalendar(month);
const existing = editId.value ? useCalendarEvent(() => editId.value ?? '') : null;
const ui = useUiStore();

const saving = ref(false);
const formError = ref<string | null>(null);

async function onSubmit(payload: CreateEvent) {
  saving.value = true;
  formError.value = null;
  try {
    if (editId.value) {
      const saved = await update(editId.value, payload);
      ui.toast('Acara diperbarui', 'success');
      await navigateTo(`/calendar/${saved.id}`);
    } else {
      const saved = await create(payload);
      ui.toast('Acara ditambahkan', 'success');
      await navigateTo(`/calendar/${saved.id}`);
    }
  } catch (e) {
    formError.value = apiErrorMessage(e);
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div>
    <NavAppHeader :title="editId ? 'Ubah acara' : 'Acara baru'" back="/calendar" />

    <div class="px-4 py-4">
      <p
        v-if="formError"
        class="mb-4 rounded-[var(--radius-field)] bg-[var(--color-danger)]/12 px-3.5 py-2.5 text-[13px] text-[var(--color-danger)]"
        role="alert"
      >{{ formError }}</p>

      <BaseSkeleton v-if="existing && existing.status.value === 'pending'" variant="card" :count="3" />
      <BaseErrorState
        v-else-if="existing && existing.error.value"
        :error="existing.error.value" title="Acara tidak ditemukan"
        @retry="existing.refresh()"
      />
      <EventForm
        v-else
        :initial="existing?.data.value ?? null"
        :default-date="defaultDate"
        :loading="saving"
        :submit-label="editId ? 'Simpan perubahan' : 'Simpan acara'"
        @submit="onSubmit"
      />
    </div>
  </div>
</template>
