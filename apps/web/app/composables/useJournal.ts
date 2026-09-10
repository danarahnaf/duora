import {
  JOURNAL_PATHS, type CreateJournal, type JournalEntry, type JournalVisibility,
} from '@couple/contracts';

export function useJournal(visibility?: MaybeRefOrGetter<JournalVisibility | undefined>) {
  const api = useApi();
  const visRef = computed(() => toValue(visibility));

  const state = useAsyncData(
    () => `journal:${visRef.value ?? 'all'}`,
    () => api<{ items: JournalEntry[]; nextCursor: string | null }>(JOURNAL_PATHS.list, {
      query: visRef.value ? { visibility: visRef.value } : undefined,
    }),
    { server: false, watch: [visRef] },
  );

  const items = computed<JournalEntry[]>(() => state.data.value?.items ?? []);

  async function create(body: CreateJournal) {
    const res = await api<JournalEntry>(JOURNAL_PATHS.create, { method: 'POST', body });
    await state.refresh();
    return res;
  }

  async function update(id: string, body: Partial<CreateJournal>) {
    const res = await api<JournalEntry>(JOURNAL_PATHS.byId(id), { method: 'PATCH', body });
    await state.refresh();
    return res;
  }

  async function remove(id: string) {
    await api(JOURNAL_PATHS.byId(id), { method: 'DELETE' });
    await state.refresh();
  }

  return { ...state, items, create, update, remove };
}

export function useJournalEntry(id: MaybeRefOrGetter<string>) {
  const api = useApi();
  const idRef = computed(() => toValue(id));
  return useAsyncData(
    () => `journal:entry:${idRef.value}`,
    () => api<JournalEntry>(JOURNAL_PATHS.byId(idRef.value)),
    { server: false, watch: [idRef] },
  );
}
