<script setup lang="ts">
import { PRIMARY_NAV, SECONDARY_NAV, isActive } from '~/utils/nav';

const route = useRoute();
const coupleStore = useCoupleStore();
const session = useSessionStore();
const { unreadCount } = useNotifications();

const partner = computed(() => coupleStore.partnerOf(session.userId));
</script>

<template>
  <aside
    class="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-6 border-r border-[var(--color-line)]
           px-4 py-6 md:flex"
    aria-label="Navigasi"
  >
    <NuxtLink to="/home" class="flex items-center gap-2 px-2">
      <img
        src="/logo-mark.png" alt="" width="263" height="204"
        class="h-8 w-auto shrink-0"
      >
      <span class="text-display text-lg">Couple</span>
    </NuxtLink>

    <div class="min-h-0 flex-1 overflow-y-auto scrollbar-none">
      <ul class="flex flex-col gap-0.5">
        <li v-for="item in PRIMARY_NAV" :key="item.to">
          <NuxtLink
            :to="item.to"
            class="row hoverable flex items-center gap-3 rounded-[var(--radius-field)] px-3 py-2.5 text-[15px]"
            :class="isActive(item, route.path)
              ? 'bg-[var(--color-primary-soft)] font-semibold text-[var(--color-primary)]'
              : 'text-[var(--color-ink-soft)]'"
          >
            <BaseIcon :name="item.icon" :size="18" />{{ item.label }}
          </NuxtLink>
        </li>
      </ul>

      <p class="mt-5 mb-1.5 px-3 text-[11px] font-semibold text-[var(--color-ink-soft)]">
        Lainnya
      </p>
      <ul class="flex flex-col gap-0.5">
        <li v-for="item in SECONDARY_NAV" :key="item.to">
          <NuxtLink
            :to="item.to"
            class="row hoverable flex items-center gap-3 rounded-[var(--radius-field)] px-3 py-2.5 text-[15px]"
            :class="isActive(item, route.path)
              ? 'bg-[var(--color-primary-soft)] font-semibold text-[var(--color-primary)]'
              : 'text-[var(--color-ink-soft)]'"
          >
            <BaseIcon :name="item.icon" :size="18" />
            {{ item.label }}
            <span
              v-if="item.to === '/notifications' && unreadCount > 0"
              class="ml-auto rounded-full bg-[var(--color-primary)] px-1.5 text-[11px] font-semibold text-[var(--color-primary-ink)]"
            >{{ unreadCount }}</span>
          </NuxtLink>
        </li>
      </ul>
    </div>

    <div v-if="session.user" class="flex items-center gap-2.5 rounded-[var(--radius-field)] px-2 py-2">
      <BaseAvatar :name="session.user.displayName" :src="session.user.avatarUrl" size="sm" />
      <div class="min-w-0 text-[13px] leading-tight">
        <p class="truncate font-medium">
          {{ session.user.displayName }}
        </p>
        <p class="truncate text-[var(--color-ink-soft)]">
          {{ partner ? `& ${partner.displayName}` : 'Belum ada partner' }}
        </p>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.row { transition: background-color var(--dur-pop) var(--ease-out), color var(--dur-pop) var(--ease-out); }
</style>
