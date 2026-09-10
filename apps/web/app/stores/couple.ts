import { defineStore } from 'pinia';
import type { Couple, PublicUser } from '@couple/contracts';
import { DEFAULT_TZ } from '~/utils/date';

export const useCoupleStore = defineStore('couple', {
  state: () => ({
    couple: null as Couple | null,
  }),

  getters: {
    timezone: (s): string => s.couple?.timezone ?? DEFAULT_TZ,
    /** Angka resmi datang dari server; ini hanya untuk render optimistis. */
    daysTogether: (s): number => s.couple?.daysTogether ?? 0,
    isComplete: (s): boolean => Boolean(s.couple?.isComplete),
    members: (s): PublicUser[] => (s.couple?.members ?? []).map(m => m.user),
  },

  actions: {
    set(couple: Couple | null) {
      this.couple = couple;
    },
    partnerOf(userId: string): PublicUser | null {
      return (this.couple?.members ?? []).map(m => m.user).find(u => u.id !== userId) ?? null;
    },
  },
});
