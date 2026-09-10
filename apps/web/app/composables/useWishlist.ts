import { DATES_PATHS, type WishlistItem } from '@couple/contracts';

export function useWishlist() {
  const api = useApi();

  const state = useAsyncData('dates:wishlist', () =>
    api<{ items: WishlistItem[] }>(DATES_PATHS.wishlist), { server: false });

  const items = computed<WishlistItem[]>(() => state.data.value?.items ?? []);
  const pending = computed(() => items.value.filter(i => !i.isDone));
  const done = computed(() => items.value.filter(i => i.isDone));

  async function add(body: { title: string; note?: string | null; estimatedIdr?: number | null }) {
    const res = await api<WishlistItem>(DATES_PATHS.wishlist, { method: 'POST', body });
    await state.refresh();
    return res;
  }

  async function toggle(id: string, isDone: boolean) {
    const res = await api<WishlistItem>(DATES_PATHS.wishlistById(id), {
      method: 'PATCH',
      body: { isDone },
    });
    await state.refresh();
    return res;
  }

  async function remove(id: string) {
    await api(DATES_PATHS.wishlistById(id), { method: 'DELETE' });
    await state.refresh();
  }

  return { ...state, items, pendingItems: pending, doneItems: done, add, toggle, remove };
}
