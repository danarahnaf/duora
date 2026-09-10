import { db } from '../../../mocks/db';
import { toGameSession } from '../../../mocks/games';
import { delay, fail } from '../../../mocks/simulate';
import { currentCouple } from '../../../utils/currentUser';

export default defineEventHandler(async (event) => {
  await delay(200);
  const { me, couple } = currentCouple(event);
  const id = getRouterParam(event, 'id');
  const row = db.games.find(g => g.id === id && g.coupleId === couple.id);
  if (!row) fail(404, 'NOT_FOUND', 'Sesi tidak ditemukan.');
  return toGameSession(row, me.id);
});
