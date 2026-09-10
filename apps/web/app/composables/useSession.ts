import {
  AUTH_PATHS, USERS_PATHS, type Credentials, type Me, type Register, type Session,
} from '@couple/contracts';

export function useSession() {
  const api = useApi();
  const session = useSessionStore();
  const couple = useCoupleStore();

  async function login(payload: Credentials) {
    const res = await api<Session>(AUTH_PATHS.login, { method: 'POST', body: payload });
    session.setSession(res);
    return res;
  }

  async function register(payload: Register) {
    const res = await api<Session>(AUTH_PATHS.register, { method: 'POST', body: payload });
    session.setSession(res);
    return res;
  }

  async function forgotPassword(email: string) {
    return api<{ ok: true }>(AUTH_PATHS.forgot, { method: 'POST', body: { email } });
  }

  async function fetchMe() {
    const me = await api<Me>(USERS_PATHS.me);
    session.setUser(me);
    return me;
  }

  async function updateMe(body: { displayName?: string; timezone?: string }) {
    const me = await api<Me>(USERS_PATHS.me, { method: 'PATCH', body });
    session.setUser(me);
    return me;
  }

  async function logout() {
    try {
      await api(AUTH_PATHS.logout, { method: 'POST' });
    } finally {
      session.clear();
      couple.set(null);
      await navigateTo('/login');
    }
  }

  return { login, register, forgotPassword, fetchMe, updateMe, logout };
}
