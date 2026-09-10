/**
 * Satu-satunya tempat baseURL. Fase 2 cukup mengubah NUXT_PUBLIC_API_BASE
 * dan menghapus header X-Dev-User — komponen tidak berubah satu baris.
 */
export function useApi() {
  const { public: cfg } = useRuntimeConfig();
  const session = useSessionStore();

  return $fetch.create({
    baseURL: cfg.apiBase || '/api',
    retry: 0,
    onRequest({ options }) {
      const headers = new Headers(options.headers as HeadersInit | undefined);
      if (session.token) headers.set('Authorization', `Bearer ${session.token}`);
      // Fase 1 only: dipakai mock server untuk menentukan "aku siapa"
      if (cfg.enableDevTools && session.devUserId) headers.set('X-Dev-User', session.devUserId);
      options.headers = headers;
    },
    onResponseError({ response }) {
      if (response.status === 401) {
        session.clear();
        if (import.meta.client) navigateTo('/login');
      }
    },
  });
}

/** Pesan error yang aman ditampilkan ke user, dari FetchError apa pun. */
export function apiErrorMessage(error: unknown, fallback = 'Ada yang salah. Coba lagi.'): string {
  const e = error as { data?: { message?: string; code?: string }; statusMessage?: string } | null;
  return e?.data?.message ?? e?.statusMessage ?? fallback;
}

export function apiErrorCode(error: unknown): string | null {
  const e = error as { data?: { code?: string } } | null;
  return e?.data?.code ?? null;
}
