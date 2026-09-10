<script setup lang="ts">
import { PRIMARY_NAV, isActive } from '~/utils/nav';

/**
 * Tab bar melayang. Bentuknya kapsul yang terlepas dari tepi layar, dengan
 * sorotan lembut di item aktif — pola tab bar iOS 26.
 *
 * §4.3 tetap berlaku: tab ini dilihat puluhan kali sehari, jadi TIDAK ada
 * animasi posisi. Sorotan tidak meluncur antar tab; yang bertransisi hanya
 * warna dan opacity, 120ms. Sorotan yang meluncur terlihat mahal di demo dan
 * melelahkan di pemakaian nyata.
 */
const route = useRoute();
const session = useSessionStore();
const { unreadCount } = useNotifications();

function badgeFor(to: string): number {
  return to === '/settings' ? unreadCount.value : 0;
}
</script>

<template>
  <nav
    class="safe-bottom fixed inset-x-0 bottom-0 z-30 md:hidden"
    aria-label="Navigasi utama"
  >
    <ul
      class="glass-2 relative mx-4 mb-2 flex items-stretch gap-1 rounded-[var(--radius-pill)]
             px-3 py-2.5 shadow-[var(--shadow-card)]"
    >
      <li v-for="item in PRIMARY_NAV" :key="item.to" class="min-w-0 flex-1">
        <NuxtLink
          :to="item.to"
          class="tab tap-target flex flex-col items-center gap-1.5 rounded-[var(--radius-field)] px-1 py-1.5"
          :class="isActive(item, route.path)
            ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]'
            : 'text-[var(--color-ink-soft)]'"
          :aria-current="isActive(item, route.path) ? 'page' : undefined"
        >
          <span class="relative grid size-6 place-items-center">
            <!-- Slot terakhir memakai wajah, bukan ikon: itu tujuan paling personal di nav. -->
            <BaseAvatar
              v-if="item.to === '/settings' && session.user"
              :name="session.user.displayName" :src="session.user.avatarUrl" size="sm"
              class="size-[22px] text-[9px]"
              :class="isActive(item, route.path) && 'ring-2 ring-[var(--color-primary)]'"
            />
            <BaseIcon v-else :name="item.icon" :size="22" />

            <span
              v-if="badgeFor(item.to) > 0"
              class="badge absolute -top-1.5 -right-2 grid h-4 min-w-4 place-items-center
                     rounded-[var(--radius-pill)] bg-[var(--color-primary)] px-1
                     text-[10px] font-semibold text-[var(--color-primary-ink)]"
              :aria-label="`${badgeFor(item.to)} belum dibaca`"
            >{{ badgeFor(item.to) > 99 ? '99+' : badgeFor(item.to) }}</span>
          </span>

          <span class="w-full truncate text-center text-[11px] leading-none font-medium">{{ item.label }}</span>
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
/*
 * §4.3: tab switch dilihat puluhan kali/hari → tanpa animasi posisi.
 * Hanya warna dan opacity.
 */
.tab {
  transition:
    color 120ms ease,
    background-color 120ms ease,
    opacity 120ms ease;
}
.tab:active { opacity: 0.7; }

/* Badge hanya boleh muncul, tidak boleh melompat: item ini sering re-render. */
.badge {
  box-shadow: 0 0 0 2px var(--color-surface-solid);
}
</style>
