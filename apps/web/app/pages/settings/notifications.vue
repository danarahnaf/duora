<script setup lang="ts">
import type { NotificationCategory } from '@couple/contracts';

useHead({ title: 'Notifikasi' });

const { data, status, error, refresh, update } = useNotificationPreferences();
const ui = useUiStore();

const LABELS: Record<NotificationCategory, string> = {
  DAILY_QUESTION: 'Pertanyaan harian',
  PARTNER_ANSWERED: 'Partner menjawab',
  MEMORY: 'Memori baru',
  EVENT_REMINDER: 'Pengingat acara',
  MOOD: 'Mood partner',
  LETTER_UNLOCKED: 'Surat terbuka',
  MILESTONE: 'Milestone',
  STREAK: 'Streak',
  SYSTEM: 'Sistem',
};

const quietOn = computed({
  get: () => Boolean(data.value?.quietHours),
  set: (on: boolean) => {
    void save({ quietHours: on ? { from: '22:00', to: '07:00' } : null });
  },
});

const quietFrom = ref('22:00');
const quietTo = ref('07:00');

watch(data, (v) => {
  if (v?.quietHours) {
    quietFrom.value = v.quietHours.from;
    quietTo.value = v.quietHours.to;
  }
}, { immediate: true });

async function save(body: Parameters<typeof update>[0]) {
  try {
    await update(body);
    ui.toast('Tersimpan', 'success');
  } catch (e) {
    ui.toast(apiErrorMessage(e), 'danger');
    await refresh();
  }
}

function toggle(category: NotificationCategory, channel: 'push' | 'email', value: boolean) {
  const item = data.value?.items.find(i => i.category === category);
  if (!item) return;
  const next = { ...item, [channel]: value };
  void save({ items: [next] });
}
</script>

<template>
  <div>
    <NavAppHeader title="Notifikasi" back="/settings" />

    <div class="px-4 py-4">
      <BaseSkeleton v-if="status === 'pending'" variant="card" :count="3" />
      <BaseErrorState v-else-if="error" :error="error" title="Preferensi gagal dimuat" @retry="refresh()" />

      <template v-else-if="data">
        <div class="mb-2 flex items-center justify-end gap-8 pr-1 text-[11px] font-medium text-[var(--color-ink-soft)]">
          <span>Push</span><span>Email</span>
        </div>

        <div class="solid-card divide-y divide-[var(--color-line)]">
          <div v-for="p in data.items" :key="p.category" class="flex items-center gap-4 p-4">
            <span class="min-w-0 flex-1 text-[15px]">{{ LABELS[p.category] }}</span>
            <BaseSwitch
              :model-value="p.push"
              @update:model-value="(v: boolean) => toggle(p.category, 'push', v)"
            />
            <BaseSwitch
              :model-value="p.email"
              @update:model-value="(v: boolean) => toggle(p.category, 'email', v)"
            />
          </div>
        </div>

        <section class="mt-7">
          <h2 class="mb-2.5 section-label">Jam tenang</h2>
          <div class="solid-card p-4">
            <BaseSwitch
              v-model="quietOn"
              label="Aktifkan jam tenang"
              description="Notifikasi ditahan sampai pagi."
            />
            <div v-if="quietOn" class="mt-4 grid grid-cols-2 gap-3">
              <BaseField
                v-model="quietFrom" type="time" label="Mulai"
                @update:model-value="save({ quietHours: { from: quietFrom, to: quietTo } })"
              />
              <BaseField
                v-model="quietTo" type="time" label="Selesai"
                @update:model-value="save({ quietHours: { from: quietFrom, to: quietTo } })"
              />
            </div>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>
