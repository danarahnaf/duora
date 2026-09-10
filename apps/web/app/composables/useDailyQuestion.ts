import { DAILY_PATHS, type DailyHistoryItem, type DailyToday } from '@couple/contracts';

export function useDailyQuestion() {
  const api = useApi();

  const state = useAsyncData<DailyToday>('daily:today', () => api<DailyToday>(DAILY_PATHS.today), {
    server: false,
  });

  async function answer(questionId: string, body: string) {
    const res = await api<DailyToday>(DAILY_PATHS.answer, {
      method: 'POST',
      body: { questionId, body },
    });
    state.data.value = res;
    return res;
  }

  return { ...state, today: state.data, answer };
}

export function useDailyHistory() {
  const api = useApi();
  return useAsyncData('daily:history', () =>
    api<{ items: DailyHistoryItem[]; nextCursor: string | null }>(DAILY_PATHS.history), {
    server: false,
  });
}
