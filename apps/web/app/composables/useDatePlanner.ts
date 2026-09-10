import { DATES_PATHS, type DatePlan, type PlannerInput } from '@couple/contracts';

export function useDatePlanner() {
  const api = useApi();
  /** Hasil terakhir disimpan di state supaya /dates/planner/result bisa dibaca tanpa refetch. */
  const lastPlan = useState<DatePlan | null>('planner:last', () => null);

  async function generate(input: PlannerInput) {
    const res = await api<DatePlan>(DATES_PATHS.plans, { method: 'POST', body: input });
    lastPlan.value = res;
    return res;
  }

  async function save(id: string) {
    const res = await api<DatePlan>(DATES_PATHS.planById(id), {
      method: 'PATCH',
      body: { status: 'SAVED' },
    });
    if (lastPlan.value?.id === id) lastPlan.value = res;
    return res;
  }

  return { lastPlan, generate, save };
}

export function useDatePlans() {
  const api = useApi();
  return useAsyncData('dates:plans', () =>
    api<{ items: DatePlan[] }>(DATES_PATHS.plans), { server: false });
}

export function useDatePlan(id: MaybeRefOrGetter<string>) {
  const api = useApi();
  const idRef = computed(() => toValue(id));
  return useAsyncData(
    () => `dates:plan:${idRef.value}`,
    () => api<DatePlan>(DATES_PATHS.planById(idRef.value)),
    { server: false, watch: [idRef] },
  );
}
