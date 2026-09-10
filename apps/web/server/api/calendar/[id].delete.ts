import { db } from '../../mocks/db';
import { delay, fail } from '../../mocks/simulate';
import { currentCouple } from '../../utils/currentUser';

export default defineEventHandler(async (event) => {
  await delay(200);
  const { couple } = currentCouple(event);
  const id = getRouterParam(event, 'id');
  if (!db.events.some(e => e.id === id && e.coupleId === couple.id)) {
    fail(404, 'NOT_FOUND', 'Acara tidak ditemukan.');
  }
  db.events = db.events.filter(e => e.id !== id);
  return { ok: true };
});
