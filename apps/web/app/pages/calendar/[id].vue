<script setup lang="ts">
import type { EventCategory } from '@couple/contracts';

definePageMeta({ middleware: 'couple-required' });

const route = useRoute();
const id = computed(() => String(route.params.id));
const { data: event, status, error, refresh } = useCalendarEvent(id);

const coupleStore = useCoupleStore();
const month = computed(() => (event.value?.date ?? localDate(coupleStore.timezone)).slice(0, 7));
const { remove } = useCalendar(month);
const ui = useUiStore();

useHead({ title: () => event.value?.title ?? 'Acara' });

const CATEGORY_LABEL: Record<EventCategory, string> = {
  DATE: 'Kencan', ANNIVERSARY: 'Anniversary', BIRTHDAY: 'Ulang tahun', TRIP: 'Perjalanan',
  REMINDER: 'Pengingat', PERSONAL: 'Pribadi', IMPORTANT: 'Penting',
};

function reminderLabel(minutes: number | null): string {
  if (minutes === null) return 'Tanpa pengingat';
  if (minutes < 60) return `Ingatkan ${minutes} menit sebelum`;
  if (minutes < 1440) return `Ingatkan ${minutes / 60} jam sebelum`;
  return `Ingatkan ${minutes / 1440} hari sebelum`;
}

const creator = computed(() =>
  coupleStore.members.find(m => m.id === event.value?.createdById)?.displayName ?? 'Anggota');

const confirming = ref(false);
const deleting = ref(false);

async function onDelete() {
  if (!event.value) return;
  deleting.value = true;
  try {
    await remove(event.value.id);
    ui.toast('Acara dihapus', 'success');
    await navigateTo('/calendar');
  } catch (e) {
    ui.toast(apiErrorMessage(e), 'danger');
  } finally {
    deleting.value = false;
    confirming.value = false;
  }
}
</script>

<template>
  <div>
    <NavAppHeader title="Acara" back="/calendar">
      <template #actions>
        <NuxtLink
          v-if="event" :to="`/calendar/new?id=${event.id}`"
          class="act tap-target grid place-items-center rounded-full p-2 text-[var(--color-ink-soft)]"
          aria-label="Ubah acara"
        ><BaseIcon name="edit" :size="19" /></NuxtLink>
        <button
          v-if="event" type="button" aria-label="Hapus acara"
          class="act tap-target rounded-full p-2 text-[var(--color-ink-soft)]"
          @click="confirming = true"
        ><BaseIcon name="trash" :size="19" /></button>
      </template>
    </NavAppHeader>

    <div class="px-4 py-4">
      <div v-if="status === 'pending'" class="flex flex-col gap-3">
        <BaseSkeleton variant="title" />
        <BaseSkeleton variant="text" :count="3" />
      </div>

      <BaseErrorState v-else-if="error" :error="error" title="Acara tidak ditemukan" @retry="refresh()" />

      <article v-else-if="event">
        <BaseChip tone="primary" size="sm">{{ CATEGORY_LABEL[event.category] }}</BaseChip>
        <h1 class="text-display mt-2.5 text-2xl">{{ event.title }}</h1>

        <dl class="mt-6 flex flex-col gap-3.5 text-[15px]">
          <div class="flex gap-3">
            <dt class="w-28 shrink-0 text-[var(--color-ink-soft)]">Tanggal</dt>
            <dd>{{ formatDateLong(event.date) }}<span v-if="event.time"> · {{ event.time }}</span>
              <span v-else class="text-[var(--color-ink-soft)]"> · seharian</span>
            </dd>
          </div>
          <div v-if="event.location" class="flex gap-3">
            <dt class="w-28 shrink-0 text-[var(--color-ink-soft)]">Lokasi</dt>
            <dd>{{ event.location }}</dd>
          </div>
          <div v-if="event.budgetIdr !== null" class="flex gap-3">
            <dt class="w-28 shrink-0 text-[var(--color-ink-soft)]">Budget</dt>
            <dd>{{ formatIdr(event.budgetIdr) }}</dd>
          </div>
          <div class="flex gap-3">
            <dt class="w-28 shrink-0 text-[var(--color-ink-soft)]">Pengingat</dt>
            <dd>{{ reminderLabel(event.reminderMinutes) }}</dd>
          </div>
          <div v-if="event.notes" class="flex gap-3">
            <dt class="w-28 shrink-0 text-[var(--color-ink-soft)]">Catatan</dt>
            <dd class="whitespace-pre-line">{{ event.notes }}</dd>
          </div>
        </dl>

        <p class="mt-6 text-[13px] text-[var(--color-ink-soft)]">
          Dibuat {{ creator }} · {{ relativeTime(event.createdAt) }}
        </p>
      </article>
    </div>

    <BaseDialog
      v-model:open="confirming"
      title="Hapus acara ini?" description="Acara akan hilang dari kalender kalian."
      confirm-label="Hapus" tone="danger" :loading="deleting"
      @confirm="onDelete"
    />
  </div>
</template>

<style scoped>
.act { transition: color var(--dur-pop) var(--ease-out), transform var(--dur-press) var(--ease-out); }
.act:active { transform: scale(0.97); }
</style>
