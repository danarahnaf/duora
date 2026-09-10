import { GameKeySchema } from '@couple/contracts';
import { GAME_ROUNDS } from '../../../mocks/gamecontent';
import { db, uid } from '../../../mocks/db';
import { toGameSession } from '../../../mocks/games';
import { delay, fail, maybeFail } from '../../../mocks/simulate';
import { currentCouple, failRate } from '../../../utils/currentUser';
import { nowIso } from '../../../utils/clock';

export default defineEventHandler(async (event) => {
  await delay();
  maybeFail(failRate(event));
  const { me, couple } = currentCouple(event);
  const parsed = GameKeySchema.safeParse(getRouterParam(event, 'key'));
  if (!parsed.success) fail(404, 'NOT_FOUND', 'Game tidak ditemukan.');
  const key = parsed.data;

  // sesi belum selesai dipakai ulang, supaya partner bergabung ke sesi yang sama
  const existing = db.games.find(g => g.coupleId === couple.id && g.key === key && !g.finishedAt);
  if (existing) return toGameSession(existing, me.id);

  const row = {
    id: uid(),
    coupleId: couple.id,
    key,
    roundIds: (GAME_ROUNDS[key] ?? []).map(r => r.id),
    picks: {} as Record<string, Record<string, string>>,
    finishedBy: [] as string[],
    score: null,
    finishedAt: null,
    createdAt: nowIso(),
  };
  db.games.unshift(row);

  setResponseStatus(event, 201);
  return toGameSession(row, me.id);
});
