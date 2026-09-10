<script setup lang="ts">
import type { GameKey, GameSession } from '@couple/contracts';
import QuizRunner from '~/components/games/QuizRunner.vue';

/**
 * Badan permainan yang dipakai keempat layar game. Halaman hanya memilih
 * gameKey, judul, dan layout — sisanya sama.
 */
const props = defineProps<{
  gameKey: GameKey;
  title: string;
  layout: 'options' | 'duo' | 'stacked';
}>();

const { session, starting, error, start, submit } = useGameSession(props.gameKey);
const lastSession = useState<GameSession | null>('games:last', () => null);
const ui = useUiStore();

const picks = reactive<Record<string, string>>({});
const finishing = ref(false);

onMounted(() => { start().catch(() => {}); });

function onPick(roundId: string, optionId: string) {
  picks[roundId] = optionId;
}

async function onFinish() {
  finishing.value = true;
  try {
    const res = await submit({ ...picks }, true);
    lastSession.value = res;
    await navigateTo('/games/result');
  } catch (e) {
    ui.toast(apiErrorMessage(e), 'danger');
  } finally {
    finishing.value = false;
  }
}
</script>

<template>
  <div>
    <NavAppHeader :title="title" back="/games" />

    <div class="px-4 py-4">
      <BaseSkeleton v-if="starting && !session" variant="card" :count="3" />
      <BaseErrorState v-else-if="error && !session" :error="error" title="Permainan gagal dimulai" @retry="start()" />

      <QuizRunner
        v-else-if="session"
        :session="session" :layout="layout" :loading="finishing"
        @pick="onPick" @finish="onFinish"
      />

      <BaseEmptyState
        v-else icon="sparkle" title="Belum ada ronde"
        description="Konten permainan ini belum tersedia."
        action-label="Kembali" action-to="/games"
      />
    </div>
  </div>
</template>
