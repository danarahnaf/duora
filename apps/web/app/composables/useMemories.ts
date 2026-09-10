import {
  MEMORIES_PATHS, type CreateMemory, type Memory, type SignedUpload,
} from '@couple/contracts';

export function useMemories(month?: MaybeRefOrGetter<string | undefined>) {
  const api = useApi();
  const monthRef = computed(() => toValue(month));

  const state = useAsyncData(
    () => `memories:${monthRef.value ?? 'all'}`,
    () => api<{ items: Memory[]; nextCursor: string | null }>(MEMORIES_PATHS.list, {
      query: monthRef.value ? { month: monthRef.value } : undefined,
    }),
    { server: false, watch: [monthRef] },
  );

  const items = computed<Memory[]>(() => state.data.value?.items ?? []);

  /** Group per bulan untuk timeline dengan sticky year header. */
  const grouped = computed(() => {
    const map = new Map<string, Memory[]>();
    for (const m of items.value) {
      const key = m.happenedAt.slice(0, 7);
      const bucket = map.get(key);
      if (bucket) bucket.push(m);
      else map.set(key, [m]);
    }
    return [...map.entries()]
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([ym, list]) => ({ ym, year: ym.slice(0, 4), label: monthLabel(ym), items: list }));
  });

  async function create(body: CreateMemory) {
    const res = await api<Memory>(MEMORIES_PATHS.create, { method: 'POST', body });
    await state.refresh();
    return res;
  }

  async function requestUploadUrls(files: { filename: string; mimeType: string; sizeBytes: number }[]) {
    return api<{ uploads: SignedUpload[] }>(MEMORIES_PATHS.uploadUrl, {
      method: 'POST',
      body: { files },
    });
  }

  async function remove(id: string) {
    await api(MEMORIES_PATHS.byId(id), { method: 'DELETE' });
    await state.refresh();
  }

  async function toggleFavorite(id: string, isFavorite: boolean) {
    const res = await api<Memory>(MEMORIES_PATHS.byId(id), {
      method: 'PATCH',
      body: { isFavorite },
    });
    await state.refresh();
    return res;
  }

  return { ...state, items, grouped, create, requestUploadUrls, remove, toggleFavorite };
}

export function useMemory(id: MaybeRefOrGetter<string>) {
  const api = useApi();
  const idRef = computed(() => toValue(id));
  return useAsyncData(
    () => `memory:${idRef.value}`,
    () => api<Memory>(MEMORIES_PATHS.byId(idRef.value)),
    { server: false, watch: [idRef] },
  );
}
