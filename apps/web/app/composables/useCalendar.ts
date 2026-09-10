import {
  CALENDAR_PATHS, type CalendarEvent, type CreateEvent,
} from '@couple/contracts';

export function useCalendar(month: MaybeRefOrGetter<string>) {
  const api = useApi();
  const monthRef = computed(() => toValue(month));

  const state = useAsyncData(
    () => `calendar:${monthRef.value}`,
    () => api<{ items: CalendarEvent[] }>(CALENDAR_PATHS.list, {
      query: { from: `${monthRef.value}-01`, to: endOfMonth(`${monthRef.value}-01`) },
    }),
    { server: false, watch: [monthRef] },
  );

  const items = computed<CalendarEvent[]>(() => state.data.value?.items ?? []);

  /** date (YYYY-MM-DD) -> event[] untuk dot indikator di MonthGrid. */
  const byDate = computed(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of items.value) {
      const bucket = map.get(e.date);
      if (bucket) bucket.push(e);
      else map.set(e.date, [e]);
    }
    return map;
  });

  async function create(body: CreateEvent) {
    const res = await api<CalendarEvent>(CALENDAR_PATHS.create, { method: 'POST', body });
    await state.refresh();
    return res;
  }

  async function update(id: string, body: Partial<CreateEvent>) {
    const res = await api<CalendarEvent>(CALENDAR_PATHS.byId(id), { method: 'PATCH', body });
    await state.refresh();
    return res;
  }

  async function remove(id: string) {
    await api(CALENDAR_PATHS.byId(id), { method: 'DELETE' });
    await state.refresh();
  }

  return { ...state, items, byDate, create, update, remove };
}

export function useUpcomingEvents() {
  const api = useApi();
  return useAsyncData('calendar:upcoming', () =>
    api<{ items: CalendarEvent[] }>(CALENDAR_PATHS.upcoming), { server: false });
}

export function useCalendarEvent(id: MaybeRefOrGetter<string>) {
  const api = useApi();
  const idRef = computed(() => toValue(id));
  return useAsyncData(
    () => `event:${idRef.value}`,
    () => api<CalendarEvent>(CALENDAR_PATHS.byId(idRef.value)),
    { server: false, watch: [idRef] },
  );
}
