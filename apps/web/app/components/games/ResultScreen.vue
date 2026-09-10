<script setup lang="ts">
import type { GameSession } from '@couple/contracts';

const props = defineProps<{ session: GameSession; partnerName: string }>();

function label(roundId: string, optionId: string | undefined) {
  if (!optionId) return '—';
  const r = props.session.rounds.find(x => x.id === roundId);
  return r?.options.find(o => o.id === optionId)?.label ?? '—';
}
</script>

<template>
  <div>
    <!-- partnerPicks null = server belum membuka. Jangan mengarang di UI. -->
    <template v-if="session.partnerPicks">
      <div class="text-center">
        <p class="text-display text-5xl">{{ session.score ?? 0 }}<span class="text-2xl text-[var(--color-ink-soft)]">/{{ session.rounds.length }}</span></p>
        <p class="mt-1.5 text-[13px] text-[var(--color-ink-soft)]">jawaban kalian sama</p>
      </div>

      <div class="mt-7 flex flex-col gap-2">
        <div v-for="r in session.rounds" :key="r.id" class="solid-card p-3.5">
          <p class="text-[13px] font-medium">{{ r.prompt }}</p>
          <div class="mt-2 grid grid-cols-2 gap-2 text-[13px]">
            <div>
              <p class="text-[11px] text-[var(--color-ink-soft)]">Aku</p>
              <p>{{ label(r.id, session.myPicks[r.id]) }}</p>
            </div>
            <div>
              <p class="text-[11px] text-[var(--color-ink-soft)]">{{ partnerName }}</p>
              <p>{{ label(r.id, session.partnerPicks[r.id]) }}</p>
            </div>
          </div>
          <BaseChip
            class="mt-2" size="sm"
            :tone="session.myPicks[r.id] === session.partnerPicks[r.id] ? 'success' : 'default'"
          >
            {{ session.myPicks[r.id] === session.partnerPicks[r.id] ? 'Sama' : 'Beda' }}
          </BaseChip>
        </div>
      </div>
    </template>

    <BaseEmptyState
      v-else
      icon="clock" :title="`Menunggu ${partnerName} menyelesaikan`"
      description="Hasil dan jawaban dia baru terbuka setelah kalian berdua selesai."
      action-label="Kembali ke games" action-to="/games"
    />
  </div>
</template>
