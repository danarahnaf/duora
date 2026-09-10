import { defineStore } from 'pinia';

export type ThemeMode = 'light' | 'dark' | 'system';
export type AccentKey = 'rose' | 'sunset' | 'lavender' | 'forest';

export interface Toast {
  id: string;
  message: string;
  tone: 'default' | 'success' | 'danger';
}

const LS_KEY = 'couple.ui.v1';

export const useUiStore = defineStore('ui', {
  state: () => ({
    theme: 'system' as ThemeMode,
    accent: 'rose' as AccentKey,
    toasts: [] as Toast[],
    /** id sheet yang terbuka — dipakai supaya tidak dua sheet bertumpuk (budget glass) */
    openSheet: null as string | null,
  }),

  actions: {
    hydrate() {
      if (!import.meta.client) return;
      try {
        const raw = localStorage.getItem(LS_KEY);
        if (raw) {
          const p = JSON.parse(raw) as { theme?: ThemeMode; accent?: AccentKey };
          this.theme = p.theme ?? 'system';
          this.accent = p.accent ?? 'rose';
        }
      } catch { /* biarkan default */ }
      this.applyTheme();
    },

    applyTheme() {
      if (!import.meta.client) return;
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const dark = this.theme === 'dark' || (this.theme === 'system' && prefersDark);
      document.documentElement.dataset.theme = dark ? 'dark' : 'light';
      document.documentElement.dataset.accent = this.accent;
      localStorage.setItem(LS_KEY, JSON.stringify({ theme: this.theme, accent: this.accent }));
    },

    setTheme(theme: ThemeMode) {
      this.theme = theme;
      this.applyTheme();
    },

    setAccent(accent: AccentKey) {
      this.accent = accent;
      this.applyTheme();
    },

    toast(message: string, tone: Toast['tone'] = 'default') {
      const id = Math.random().toString(36).slice(2);
      this.toasts.push({ id, message, tone });
      if (import.meta.client) setTimeout(() => this.dismiss(id), 3200);
    },

    dismiss(id: string) {
      this.toasts = this.toasts.filter(t => t.id !== id);
    },
  },
});
