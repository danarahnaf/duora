<script setup lang="ts">
import MoodStrip from '~/components/mood/MoodStrip.vue';
import PartnerMoodCard from '~/components/mood/PartnerMoodCard.vue';

definePageMeta({ middleware: 'couple-required' });
useHead({ title: 'Mood partner' });

const { today, status, error, refresh } = useMood();
const history = useMoodHistory(14);
const coupleStore = useCoupleStore();
const session = useSessionStore();

const partnerName = computed(() => coupleStore.partnerOf(session.userId)?.displayName ?? 'Partner');
const endDate = computed(() => today.value?.localDate ?? localDate(coupleStore.timezone));
const needsCare = computed(() => {
  const level = today.value?.partner?.level;
  return level === 'BAD' || level === 'TERRIBLE';
});
</script>

<template>
  <div>
    <NavAppHeader title="Mood partner" back="/mood" />

    <div class="flex flex-col gap-7 px-4 py-4">
      <BaseSkeleton v-if="status === 'pending'" variant="card" :count="2" />
      <BaseErrorState v-else-if="error" :error="error" title="Mood gagal dimuat" @retry="refresh()" />

      <template v-else>
        <PartnerMoodCard :mood="today?.partner ?? null" :partner-name="partnerName" />

        <section v-if="needsCare">
          <h2 class="mb-2.5 section-label">
            Kalau mau menemani
          </h2>
          <div class="flex flex-col gap-2">
            <NuxtLink to="/assistant" class="solid-card pressable flex items-center gap-3 p-3.5">
              <BaseIcon name="chat" :size="18" class="text-[var(--color-ink-soft)]" />
              <span class="flex-1 text-[15px]">Cari kalimat untuk memulai</span>
              <BaseIcon name="chevronRight" :size="16" class="text-[var(--color-ink-soft)]" />
            </NuxtLink>
            <NuxtLink to="/dates/planner" class="solid-card pressable flex items-center gap-3 p-3.5">
              <BaseIcon name="mapPin" :size="18" class="text-[var(--color-ink-soft)]" />
              <span class="flex-1 text-[15px]">Rencanakan jalan sore</span>
              <BaseIcon name="chevronRight" :size="16" class="text-[var(--color-ink-soft)]" />
            </NuxtLink>
          </div>
        </section>

        <section>
          <h2 class="mb-3 section-label">
            14 hari terakhir
          </h2>
          <BaseSkeleton v-if="history.status.value === 'pending'" variant="card" />
          <div v-else-if="history.data.value" class="solid-card p-4">
            <MoodStrip :items="history.data.value.partner" :days="14" :end-date="endDate" :label="partnerName" />
          </div>
        </section>
      </template>
    </div>
  </div>
</template>
