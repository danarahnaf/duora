<script setup lang="ts">
import MoodPicker from '~/components/mood/MoodPicker.vue';
import MoodStrip from '~/components/mood/MoodStrip.vue';
import type { MoodLevel } from '@couple/contracts';

definePageMeta({ middleware: 'couple-required' });
useHead({ title: 'Mood' });

const { today, status, error, refresh, checkin } = useMood();
const history = useMoodHistory(14);
const coupleStore = useCoupleStore();
const session = useSessionStore();
const ui = useUiStore();

const saving = ref(false);
const editing = ref(false);

const partnerName = computed(() => coupleStore.partnerOf(session.userId)?.displayName ?? 'Partner');
const endDate = computed(() => today.value?.localDate ?? localDate(coupleStore.timezone));

async function onSubmit(payload: { level: MoodLevel; note: string | null }) {
  saving.value = true;
  try {
    await checkin(payload.level, payload.note);
    await history.refresh();
    editing.value = false;
    ui.toast('Mood tersimpan', 'success');
  } catch (e) {
    ui.toast(apiErrorMessage(e), 'danger');
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div>
    <NavAppHeader title="Mood" />

    <div class="flex flex-col gap-7 px-4 py-4">
      <section>
        <h2 class="mb-3 section-label">
          Hari ini
        </h2>

        <div v-if="status === 'pending'" class="flex flex-col gap-3">
          <BaseSkeleton variant="card" />
        </div>
        <BaseErrorState v-else-if="error" :error="error" title="Mood gagal dimuat" @retry="refresh()" />

        <template v-else>
          <MoodPicker
            v-if="!today?.mine || editing"
            :current="today?.mine ?? null" :loading="saving" @submit="onSubmit"
          />

          <div v-else class="solid-card flex items-center gap-4 p-4">
            <span class="text-3xl" aria-hidden="true">{{ MOOD_META[today.mine.level].emoji }}</span>
            <div class="min-w-0 flex-1">
              <p class="text-[15px] font-semibold">{{ MOOD_META[today.mine.level].label }}</p>
              <p v-if="today.mine.note" class="mt-0.5 text-[13px] text-[var(--color-ink-soft)]">
                “{{ today.mine.note }}”
              </p>
            </div>
            <BaseButton size="sm" variant="ghost" @click="editing = true">Ubah</BaseButton>
          </div>
        </template>
      </section>

      <section>
        <div class="mb-3 flex items-baseline justify-between">
          <h2 class="section-label">14 hari terakhir</h2>
          <NuxtLink to="/mood/partner" class="text-[13px] text-[var(--color-primary)]">Mood partner</NuxtLink>
        </div>

        <BaseSkeleton v-if="history.status.value === 'pending'" variant="card" :count="2" />
        <BaseErrorState v-else-if="history.error.value" :error="history.error.value" @retry="history.refresh()" />

        <div v-else-if="history.data.value" class="solid-card flex flex-col gap-4 p-4">
          <MoodStrip :items="history.data.value.mine" :days="14" :end-date="endDate" label="Aku" />
          <MoodStrip :items="history.data.value.partner" :days="14" :end-date="endDate" :label="partnerName" />

          <div class="flex flex-wrap items-center gap-3 border-t border-[var(--color-line)] pt-3">
            <span v-for="l in MOOD_ORDER" :key="l" class="flex items-center gap-1 text-[11px] text-[var(--color-ink-soft)]">
              <span aria-hidden="true">{{ MOOD_META[l].emoji }}</span>{{ MOOD_META[l].label }}
            </span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
