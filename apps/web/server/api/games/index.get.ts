import { GAME_META, GAME_ROUNDS } from '../../mocks/gamecontent';
import { db } from '../../mocks/db';
import { delay, maybeFail } from '../../mocks/simulate';
import { currentCouple, failRate } from '../../utils/currentUser';
import type { GameKey } from '@couple/contracts';

export default defineEventHandler(async (event) => {
  await delay();
  maybeFail(failRate(event));
  const { couple } = currentCouple(event);
  const keys = Object.keys(GAME_META) as GameKey[];

  return {
    items: keys.map((key) => {
      const sessions = db.games.filter(g => g.coupleId === couple.id && g.key === key && g.finishedAt);
      const meta = GAME_META[key];
      return {
        key,
        title: meta.title,
        description: meta.description,
        emoji: meta.emoji,
        roundCount: (GAME_ROUNDS[key] ?? []).length,
        lastPlayedAt: sessions.at(0)?.finishedAt ?? null,
        bestScore: sessions.length ? Math.max(...sessions.map(s => s.score ?? 0)) : null,
      };
    }),
  };
});
