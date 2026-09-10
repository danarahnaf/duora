import { MILESTONES_PATHS, type Milestone } from '@couple/contracts';

export function useMilestones() {
  const api = useApi();

  const state = useAsyncData('milestones', () =>
    api<{ items: Milestone[] }>(MILESTONES_PATHS.list), { server: false });

  const items = computed<Milestone[]>(() => state.data.value?.items ?? []);

  /** Group per tahun untuk timeline tahunan. */
  const byYear = computed(() => {
    const map = new Map<string, Milestone[]>();
    for (const m of items.value) {
      const y = m.date.slice(0, 4);
      const bucket = map.get(y);
      if (bucket) bucket.push(m);
      else map.set(y, [m]);
    }
    return [...map.entries()]
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([year, list]) => ({ year, items: list.sort((a, b) => (a.date < b.date ? 1 : -1)) }));
  });

  async function create(body: { title: string; date: string; note?: string | null; icon?: string | null }) {
    const res = await api<Milestone>(MILESTONES_PATHS.create, { method: 'POST', body });
    await state.refresh();
    return res;
  }

  async function remove(id: string) {
    await api(MILESTONES_PATHS.byId(id), { method: 'DELETE' });
    await state.refresh();
  }

  return { ...state, items, byYear, create, remove };
}
