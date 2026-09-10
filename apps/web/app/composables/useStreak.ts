import { STREAK_PATHS, type Recap, type Streak } from '@couple/contracts';

export function useStreak() {
  const api = useApi();
  return useAsyncData('streak', () => api<Streak>(STREAK_PATHS.streak), { server: false });
}

export function useRecap(year: MaybeRefOrGetter<number | string>) {
  const api = useApi();
  const yearRef = computed(() => toValue(year));
  return useAsyncData(
    () => `recap:${yearRef.value}`,
    () => api<Recap>(STREAK_PATHS.recap(yearRef.value)),
    { server: false, watch: [yearRef] },
  );
}
