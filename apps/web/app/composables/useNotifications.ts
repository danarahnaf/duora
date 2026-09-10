import {
  NOTIFICATIONS_PATHS,
  type Notification, type NotificationPreferences,
} from '@couple/contracts';

export function useNotifications() {
  const api = useApi();

  const state = useAsyncData('notifications', () =>
    api<{ items: Notification[]; nextCursor: string | null; unreadCount: number }>(
      NOTIFICATIONS_PATHS.list,
    ), { server: false });

  const items = computed<Notification[]>(() => state.data.value?.items ?? []);
  const unreadCount = computed(() => state.data.value?.unreadCount ?? 0);

  async function markRead(id: string) {
    await api(NOTIFICATIONS_PATHS.read(id), { method: 'POST' });
    await state.refresh();
  }

  return { ...state, items, unreadCount, markRead };
}

export function useNotificationPreferences() {
  const api = useApi();

  const state = useAsyncData('notifications:prefs', () =>
    api<NotificationPreferences>(NOTIFICATIONS_PATHS.preferences), { server: false });

  async function update(body: Partial<NotificationPreferences>) {
    const res = await api<NotificationPreferences>(NOTIFICATIONS_PATHS.preferences, {
      method: 'PATCH',
      body,
    });
    state.data.value = res;
    return res;
  }

  return { ...state, update };
}
