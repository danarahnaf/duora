import { LETTERS_PATHS, type CreateLetter, type LetterDetail, type LetterListItem } from '@couple/contracts';

export function useLetters() {
  const api = useApi();

  const state = useAsyncData('letters', () =>
    api<{ items: LetterListItem[] }>(LETTERS_PATHS.list), { server: false });

  const items = computed<LetterListItem[]>(() => state.data.value?.items ?? []);
  const locked = computed(() => items.value.filter(l => l.isLocked));
  const opened = computed(() => items.value.filter(l => !l.isLocked));

  async function create(body: CreateLetter) {
    const res = await api<LetterListItem>(LETTERS_PATHS.create, { method: 'POST', body });
    await state.refresh();
    return res;
  }

  return { ...state, items, lockedItems: locked, openedItems: opened, create };
}

export function useLetter(id: MaybeRefOrGetter<string>) {
  const api = useApi();
  const idRef = computed(() => toValue(id));

  const state = useAsyncData(
    () => `letter:${idRef.value}`,
    () => api<LetterDetail>(LETTERS_PATHS.byId(idRef.value)),
    { server: false, watch: [idRef] },
  );

  /** Server memutuskan boleh dibuka atau tidak (423 kalau masih terkunci). */
  async function open() {
    const res = await api<LetterDetail>(LETTERS_PATHS.open(idRef.value), { method: 'POST' });
    state.data.value = res;
    return res;
  }

  return { ...state, open };
}
