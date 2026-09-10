import { SubmitGamePicksSchema } from '@couple/contracts';
import { db } from '../../../mocks/db';
import { scoreSession, toGameSession } from '../../../mocks/games';
import { delay, fail } from '../../../mocks/simulate';
import { currentCouple } from '../../../utils/currentUser';
import { parseBody } from '../../../utils/validate';
import { nowIso, serverLocalDate } from '../../../utils/clock';
import { touchStreak } from '../../../utils/streak';

export default defineEventHandler(async (event) => {
  await delay(300);
  const { me, couple } = currentCouple(event);
  const id = getRouterParam(event, 'id');
  const row = db.games.find(g => g.id === id && g.coupleId === couple.id);
  if (!row) fail(404, 'NOT_FOUND', 'Sesi tidak ditemukan.');

  const body = parseBody(SubmitGamePicksSchema, await readBody(event));
  row.picks[me.id] = { ...(row.picks[me.id] ?? {}), ...body.picks };

  if (body.finish && !row.finishedBy.includes(me.id)) row.finishedBy.push(me.id);

  const members = db.members.filter(m => m.coupleId === couple.id).map(m => m.userId);
  const bothDone = members.length === 2 && members.every(uid => row.finishedBy.includes(uid));
  if (bothDone && !row.finishedAt) {
    row.score = scoreSession(row, members);
    row.finishedAt = nowIso();
    touchStreak(couple, serverLocalDate(couple.timezone));
  }

  return toGameSession(row, me.id);
});
