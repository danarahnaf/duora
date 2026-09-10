import { GAMES_PATHS, type Game, type GameKey, type GameSession } from '@couple/contracts';

export function useGames() {
  const api = useApi();
  return useAsyncData('games', () => api<{ items: Game[] }>(GAMES_PATHS.list), { server: false });
}

export function useGameSession(key: GameKey) {
  const api = useApi();
  const session = ref<GameSession | null>(null);
  const starting = ref(false);
  const error = ref<unknown>(null);

  async function start() {
    starting.value = true;
    error.value = null;
    try {
      session.value = await api<GameSession>(GAMES_PATHS.sessions(key), { method: 'POST' });
      return session.value;
    } catch (e) {
      error.value = e;
      throw e;
    } finally {
      starting.value = false;
    }
  }

  async function submit(picks: Record<string, string>, finish = false) {
    if (!session.value) throw new Error('sesi belum dimulai');
    const res = await api<GameSession>(GAMES_PATHS.sessionById(session.value.id), {
      method: 'PATCH',
      body: { picks, finish },
    });
    session.value = res;
    return res;
  }

  return { session, starting, error, start, submit };
}
