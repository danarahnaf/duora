<script setup lang="ts">
import MonthGrid from '~/components/calendar/MonthGrid.vue';
import EventPill from '~/components/calendar/EventPill.vue';
import UpcomingList from '~/components/calendar/UpcomingList.vue';

definePageMeta({ middleware: 'couple-required' });
useHead({ title: 'Kalender' });

const coupleStore = useCoupleStore();
const today = computed(() => localDate(coupleStore.timezone));

const month = ref(today.value.slice(0, 7));
const selected = ref<string | null>(today.value);

const { items, byDate, status, error, refresh } = useCalendar(month);
const upcoming = useUpcomingEvents();

function shiftMonth(delta: number) {
  const first = `${month.value}-01`;
  month.value = addDays(delta > 0 ? endOfMonth(first) : first, delta > 0 ? 1 : -1).slice(0, 7);
  selected.value = null;
}

function goToday() {
  month.value = today.value.slice(0, 7);
  selected.value = today.value;
}

const dayEvents = computed(() => (selected.value ? byDate.value.get(selected.value) ?? [] : []));
</script>

<template>
  <div>
    <NavAppHeader title="Kalender">
      <template #actions>
        <BaseButton size="sm" variant="ghost" @click="goToday">Hari ini</BaseButton>
      </template>
    </NavAppHeader>

    <div class="px-4 py-4">
      <div class="mb-3 flex items-center justify-between">
        <button type="button" class="nav tap-target rounded-full p-2" aria-label="Bulan sebelumnya" @click="shiftMonth(-1)">
          <BaseIcon name="chevronLeft" :size="18" />
        </button>
        <h2 class="text-display text-lg">{{ monthLabel(month) }}</h2>
        <button type="button" class="nav tap-target rounded-full p-2" aria-label="Bulan berikutnya" @click="shiftMonth(1)">
          <BaseIcon name="chevronRight" :size="18" />
        </button>
      </div>

      <BaseSkeleton v-if="status === 'pending'" variant="card" :count="2" />
      <BaseErrorState v-else-if="error" :error="error" title="Kalender gagal dimuat" @retry="refresh()" />

      <template v-else>
        <MonthGrid :month="month" :by-date="byDate" :selected="selected" :today="today" @select="selected = $event" />

        <section v-if="selected" class="mt-6">
          <h3 class="mb-2.5 text-[13px] font-semibold">{{ formatDateLong(selected) }}</h3>
          <div v-if="dayEvents.length" class="flex flex-col gap-2">
            <EventPill v-for="e in dayEvents" :key="e.id" :event="e" />
          </div>
          <p v-else class="text-[13px] text-[var(--color-ink-soft)]">
            Tidak ada acara.
            <NuxtLink :to="`/calendar/new?date=${selected}`" class="font-medium text-[var(--color-primary)]">Tambah</NuxtLink>
          </p>
        </section>

        <p v-if="!items.length" class="mt-6 text-[13px] text-[var(--color-ink-soft)]">
          Bulan ini masih kosong.
        </p>
      </template>

      <section class="mt-8 border-t border-[var(--color-line)] pt-5">
        <h3 class="mb-3 section-label">Akan datang</h3>
        <BaseSkeleton v-if="upcoming.status.value === 'pending'" variant="card" :count="2" />
        <BaseErrorState v-else-if="upcoming.error.value" :error="upcoming.error.value" @retry="upcoming.refresh()" />
        <UpcomingList
          v-else-if="upcoming.data.value?.items.length"
          :items="upcoming.data.value.items" :today="today"
        />
        <BaseEmptyState
          v-else icon="calendar" title="Belum ada rencana"
          description="Satu acara saja sudah membuat minggu depan terasa berbeda."
          action-label="Tambah acara" action-to="/calendar/new"
        />
      </section>
    </div>

    <NuxtLink
      :to="selected ? `/calendar/new?date=${selected}` : '/calendar/new'"
      class="pressable fixed right-4 bottom-24 z-30 grid size-14 place-items-center rounded-full
             bg-[var(--color-primary)] text-[var(--color-primary-ink)] shadow-[var(--shadow-card)] md:bottom-8"
      aria-label="Tambah acara"
    ><BaseIcon name="plus" :size="24" /></NuxtLink>
  </div>
</template>

<style scoped>
.nav { transition: background-color var(--dur-pop) var(--ease-out), transform var(--dur-press) var(--ease-out); }
.nav:active { transform: scale(0.97); }
</style>
