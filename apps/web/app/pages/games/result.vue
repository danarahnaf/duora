<script setup lang="ts">
import ResultScreen from '~/components/games/ResultScreen.vue';
import type { GameSession } from '@couple/contracts';

definePageMeta({ middleware: 'couple-required' });
useHead({ title: 'Hasil' });

const lastSession = useState<GameSession | null>('games:last', () => null);
const coupleStore = useCoupleStore();
const session = useSessionStore();

const partnerName = computed(() => coupleStore.partnerOf(session.userId)?.displayName ?? 'Partner');
</script>

<template>
  <div>
    <NavAppHeader title="Hasil" back="/games" />

    <div class="px-4 py-4">
      <BaseEmptyState
        v-if="!lastSession"
        icon="trophy" title="Belum ada hasil"
        description="Mainkan satu permainan dulu."
        action-label="Pilih permainan" action-to="/games"
      />

      <template v-else>
        <ResultScreen :session="lastSession" :partner-name="partnerName" />

        <div v-if="lastSession.partnerPicks" class="mt-7 flex flex-col gap-2">
          <BaseButton block :to="`/games/${lastSession.key}`">Main lagi</BaseButton>
          <BaseButton variant="ghost" block to="/games">Kembali ke hub</BaseButton>
        </div>
      </template>
    </div>
  </div>
</template>
