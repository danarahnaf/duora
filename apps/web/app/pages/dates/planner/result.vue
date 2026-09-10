<script setup lang="ts">
import PlannerResult from '~/components/dates/PlannerResult.vue';

definePageMeta({ middleware: 'couple-required' });
useHead({ title: 'Hasil rencana' });

const route = useRoute();
const { lastPlan, save } = useDatePlanner();
const coupleStore = useCoupleStore();
const api = useApi();
const ui = useUiStore();

const queryId = computed(() => (route.query.id ? String(route.query.id) : ''));
const fallback = queryId.value ? useDatePlan(queryId) : null;

const plan = computed(() => lastPlan.value ?? fallback?.data.value ?? null);

const saving = ref(false);
const adding = ref(false);

async function onSave() {
  if (!plan.value) return;
  saving.value = true;
  try {
    await save(plan.value.id);
    ui.toast('Rencana disimpan', 'success');
  } catch (e) {
    ui.toast(apiErrorMessage(e), 'danger');
  } finally {
    saving.value = false;
  }
}

async function addToCalendar() {
  if (!plan.value) return;
  adding.value = true;
  try {
    const p = plan.value;
    await api('/calendar', {
      method: 'POST',
      body: {
        title: p.title,
        category: 'DATE',
        date: p.input.date ?? localDate(coupleStore.timezone),
        time: p.steps[0]?.time ?? null,
        location: p.input.area,
        budgetIdr: p.totalIdr,
        notes: p.steps.map(s => `${s.time} — ${s.title}`).join('\n'),
        reminderMinutes: 60,
        isAllDay: false,
      },
    });
    ui.toast('Ditambahkan ke kalender', 'success');
    await navigateTo('/calendar');
  } catch (e) {
    ui.toast(apiErrorMessage(e), 'danger');
  } finally {
    adding.value = false;
  }
}
</script>

<template>
  <div>
    <NavAppHeader title="Rencana" back="/dates/planner" />

    <div class="px-4 py-4">
      <BaseSkeleton v-if="fallback && fallback.status.value === 'pending'" variant="card" :count="3" />
      <BaseErrorState
        v-else-if="fallback && fallback.error.value"
        :error="fallback.error.value" title="Rencana tidak ditemukan"
        @retry="fallback.refresh()"
      />

      <BaseEmptyState
        v-else-if="!plan"
        icon="sparkle" title="Belum ada rencana"
        description="Isi dulu batasannya di halaman planner."
        action-label="Buat rencana" action-to="/dates/planner"
      />

      <template v-else>
        <PlannerResult :plan="plan" />

        <div class="mt-6 flex flex-col gap-2">
          <BaseButton block :loading="saving" :disabled="plan.status !== 'DRAFT'" @click="onSave">
            {{ plan.status === 'DRAFT' ? 'Simpan rencana' : 'Sudah tersimpan' }}
          </BaseButton>
          <BaseButton variant="subtle" block icon="calendar" :loading="adding" @click="addToCalendar">
            Tambah ke kalender
          </BaseButton>
          <BaseButton variant="ghost" block to="/dates/planner">Coba lagi</BaseButton>
        </div>
      </template>
    </div>
  </div>
</template>
