<script setup lang="ts">
import type { Couple } from '@couple/contracts';

/**
 * WAJIB di Fase 1 (§5.4). Tanpa ini reveal daily question, waiting state,
 * mood partner, invite redeem, letter penerima, dan private journal tidak bisa diuji.
 * Di-gate env dan di-tree-shake saat produksi.
 */
const { public: cfg } = useRuntimeConfig();
const session = useSessionStore();
const coupleStore = useCoupleStore();
const ui = useUiStore();
const api = useApi();

const open = ref(false);
const busy = ref(false);

const members = computed(() => coupleStore.members);
const activeName = computed(() =>
  members.value.find(m => m.id === session.devUserId)?.displayName ?? 'dev',
);

async function switchTo(userId: string) {
  if (userId === session.devUserId) return;
  busy.value = true;
  try {
    session.switchDevUser(userId);
    // ambil ulang identitas + couple, lalu invalidasi semua data
    const me = await api<import('@couple/contracts').Me>('/users/me');
    session.setUser(me);
    coupleStore.set(await api<Couple | null>('/couples/me'));
    await refreshNuxtData();
    ui.toast(`Sekarang kamu ${me.displayName}`, 'success');
  } finally {
    busy.value = false;
    open.value = false;
  }
}
</script>

<template>
  <div v-if="cfg.enableDevTools && session.isAuthenticated" class="fixed right-3 bottom-24 z-[70] md:bottom-4">
    <BasePopover align="end" side="top">
      <template #trigger>
        <button
          type="button"
          class="fab flex items-center gap-1.5 rounded-[var(--radius-pill)] border border-dashed
                 border-[var(--color-line-strong)] bg-[var(--color-surface-solid)] px-3 py-2
                 text-[11px] font-semibold shadow-[var(--shadow-card)]"
        >
          <BaseIcon name="users" :size="14" />
          {{ activeName }}
        </button>
      </template>

      <p class="px-2.5 pt-1 pb-2 text-[11px] font-semibold tracking-wide text-[var(--color-ink-soft)] uppercase">
        Dev · jadi siapa?
      </p>
      <button
        v-for="m in members" :key="m.id" type="button" :disabled="busy"
        class="item flex w-full items-center gap-2 rounded-[var(--radius-field)] px-2.5 py-2 text-left text-[13px]"
        :class="m.id === session.devUserId && 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]'"
        @click="switchTo(m.id)"
      >
        <BaseAvatar :name="m.displayName" :src="m.avatarUrl" size="sm" />
        Jadi {{ m.displayName }}
      </button>
      <p v-if="!members.length" class="px-2.5 pb-2 text-[13px] text-[var(--color-ink-soft)]">
        Belum ada couple.
      </p>
    </BasePopover>
  </div>
</template>

<style scoped>
.fab { transition: transform var(--dur-press) var(--ease-out); }
.fab:active { transform: scale(0.97); }
.item { transition: background-color var(--dur-pop) var(--ease-out); }
</style>
