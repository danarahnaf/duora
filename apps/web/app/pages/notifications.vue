<script setup lang="ts">
import type { Notification, NotificationCategory } from '@couple/contracts';
import type { IconName } from '~/utils/icons';

definePageMeta({ middleware: 'couple-required' });
useHead({ title: 'Notifikasi' });

const { items, unreadCount, status, error, refresh, markRead } = useNotifications();
const coupleStore = useCoupleStore();

const ICONS: Record<NotificationCategory, IconName> = {
  DAILY_QUESTION: 'chat', PARTNER_ANSWERED: 'chat', MEMORY: 'image',
  EVENT_REMINDER: 'calendar', MOOD: 'smile', LETTER_UNLOCKED: 'mail',
  MILESTONE: 'star', STREAK: 'flame', SYSTEM: 'settings',
};

const today = computed(() => localDate(coupleStore.timezone));

const groups = computed(() => {
  const map = new Map<string, Notification[]>();
  for (const n of items.value) {
    const key = relativeDate(n.createdAt.slice(0, 10), today.value);
    const bucket = map.get(key);
    if (bucket) bucket.push(n);
    else map.set(key, [n]);
  }
  return [...map.entries()].map(([label, list]) => ({ label, items: list }));
});

const markingAll = ref(false);

async function open(n: Notification) {
  if (!n.readAt) await markRead(n.id).catch(() => {});
  if (n.link) await navigateTo(n.link);
}

async function markAll() {
  markingAll.value = true;
  try {
    await Promise.all(items.value.filter(n => !n.readAt).map(n => markRead(n.id)));
  } finally {
    markingAll.value = false;
  }
}
</script>

<template>
  <div>
    <NavAppHeader title="Notifikasi">
      <template #actions>
        <BaseButton
          v-if="unreadCount > 0" size="sm" variant="ghost" :loading="markingAll" @click="markAll"
        >Tandai terbaca</BaseButton>
      </template>
    </NavAppHeader>

    <div class="px-4 py-4">
      <BaseSkeleton v-if="status === 'pending'" variant="card" :count="5" />
      <BaseErrorState v-else-if="error" :error="error" title="Notifikasi gagal dimuat" @retry="refresh()" />

      <BaseEmptyState
        v-else-if="!items.length"
        icon="bell" title="Belum ada notifikasi"
        description="Pengingat acara dan kabar dari partner muncul di sini."
      />

      <div v-else class="flex flex-col gap-6">
        <section v-for="g in groups" :key="g.label">
          <h2 class="mb-2 section-label">
            {{ g.label }}
          </h2>
          <div class="flex flex-col gap-1.5">
            <button
              v-for="n in g.items" :key="n.id" type="button"
              class="row flex w-full items-start gap-3 rounded-[var(--radius-card)] border border-[var(--color-line)]
                     bg-[var(--color-surface-solid)] p-3.5 text-left"
              @click="open(n)"
            >
              <span
                class="grid size-9 shrink-0 place-items-center rounded-[var(--radius-inner)]"
                :class="n.readAt ? 'bg-[var(--color-line)] text-[var(--color-ink-soft)]' : 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]'"
              ><BaseIcon :name="ICONS[n.category]" :size="17" /></span>

              <span class="min-w-0 flex-1">
                <span class="block text-[15px] font-medium">{{ n.title }}</span>
                <span class="mt-0.5 block text-[13px] text-[var(--color-ink-soft)]">{{ n.body }}</span>
                <span class="mt-1 block text-[11px] text-[var(--color-ink-soft)]">{{ relativeTime(n.createdAt) }}</span>
              </span>

              <span v-if="!n.readAt" class="mt-1.5 size-2 shrink-0 rounded-full bg-[var(--color-primary)]" aria-label="Belum dibaca" />
            </button>
          </div>
        </section>

        <NuxtLink to="/settings/notifications" class="text-center text-[13px] text-[var(--color-primary)]">
          Atur preferensi notifikasi
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.row { transition: background-color var(--dur-pop) var(--ease-out), transform var(--dur-press) var(--ease-out); }
.row:active { transform: scale(0.99); }
</style>
