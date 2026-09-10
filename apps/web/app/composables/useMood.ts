import {
  MOOD_PATHS, type MoodHistory, type MoodLevel, type MoodToday,
} from '@couple/contracts';

export const MOOD_META: Record<MoodLevel, { emoji: string; label: string; score: number }> = {
  GREAT:    { emoji: '🥰', label: 'Bahagia banget', score: 5 },
  GOOD:     { emoji: '🙂', label: 'Baik',           score: 4 },
  OKAY:     { emoji: '😐', label: 'Biasa aja',      score: 3 },
  BAD:      { emoji: '😔', label: 'Kurang baik',    score: 2 },
  TERRIBLE: { emoji: '😢', label: 'Berat',          score: 1 },
};

export const MOOD_ORDER: MoodLevel[] = ['GREAT', 'GOOD', 'OKAY', 'BAD', 'TERRIBLE'];

export function useMood() {
  const api = useApi();

  const state = useAsyncData<MoodToday>('mood:today', () => api<MoodToday>(MOOD_PATHS.today), {
    server: false,
  });

  async function checkin(level: MoodLevel, note: string | null = null) {
    const res = await api<MoodToday>(MOOD_PATHS.create, { method: 'POST', body: { level, note } });
    state.data.value = res;
    return res;
  }

  return { ...state, today: state.data, checkin };
}

export function useMoodHistory(days = 14) {
  const api = useApi();
  return useAsyncData(`mood:history:${days}`, () =>
    api<MoodHistory>(MOOD_PATHS.history, { query: { days } }), { server: false });
}
