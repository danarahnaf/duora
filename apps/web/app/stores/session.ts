import { defineStore } from 'pinia';
import type { Me } from '@couple/contracts';

const LS_KEY = 'couple.session.v1';

interface Persisted {
  token: string | null;
  refreshToken: string | null;
  user: Me | null;
  devUserId: string;
}

/** Fase 1: token dari mock server. Bentuk store sudah sama dengan Fase 2. */
export const useSessionStore = defineStore('session', {
  state: (): Persisted => ({
    token: null,
    refreshToken: null,
    user: null,
    // dipakai mock server untuk menentukan "aku siapa" (header X-Dev-User)
    devUserId: '',
  }),

  getters: {
    isAuthenticated: (s): boolean => Boolean(s.token && s.user),
    hasCouple: (s): boolean => Boolean(s.user?.hasCouple),
    userId: (s): string => s.user?.id ?? '',
  },

  actions: {
    hydrate() {
      if (!import.meta.client) return;
      try {
        const raw = localStorage.getItem(LS_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw) as Partial<Persisted>;
        this.token = parsed.token ?? null;
        this.refreshToken = parsed.refreshToken ?? null;
        this.user = parsed.user ?? null;
        this.devUserId = parsed.devUserId ?? parsed.user?.id ?? '';
      } catch {
        localStorage.removeItem(LS_KEY);
      }
    },

    persist() {
      if (!import.meta.client) return;
      localStorage.setItem(LS_KEY, JSON.stringify({
        token: this.token,
        refreshToken: this.refreshToken,
        user: this.user,
        devUserId: this.devUserId,
      } satisfies Persisted));
    },

    setSession(payload: { accessToken: string; refreshToken: string; user: Me }) {
      this.token = payload.accessToken;
      this.refreshToken = payload.refreshToken;
      this.user = payload.user;
      this.devUserId = payload.user.id;
      this.persist();
    },

    setUser(user: Me) {
      this.user = user;
      this.persist();
    },

    /** Dev only — dipakai DevUserSwitcher. */
    switchDevUser(userId: string) {
      this.devUserId = userId;
      this.persist();
    },

    clear() {
      this.token = null;
      this.refreshToken = null;
      this.user = null;
      this.devUserId = '';
      if (import.meta.client) localStorage.removeItem(LS_KEY);
    },
  },
});
