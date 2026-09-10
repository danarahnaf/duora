import { db } from '../../mocks/db';
import { delay, fail } from '../../mocks/simulate';
import { currentCouple } from '../../utils/currentUser';

export default defineEventHandler(async (event) => {
  await delay(220);
  const { couple } = currentCouple(event);
  const id = getRouterParam(event, 'id');
  const exists = db.memories.some(m => m.id === id && m.coupleId === couple.id);
  if (!exists) fail(404, 'NOT_FOUND', 'Memori tidak ditemukan.');
  db.memories = db.memories.filter(m => m.id !== id);
  return { ok: true };
});
