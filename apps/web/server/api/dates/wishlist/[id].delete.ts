import { db } from '../../../mocks/db';
import { delay, fail } from '../../../mocks/simulate';
import { currentCouple } from '../../../utils/currentUser';

export default defineEventHandler(async (event) => {
  await delay(200);
  const { couple } = currentCouple(event);
  const id = getRouterParam(event, 'id');
  if (!db.wishlist.some(w => w.id === id && w.coupleId === couple.id)) {
    fail(404, 'NOT_FOUND', 'Item tidak ditemukan.');
  }
  db.wishlist = db.wishlist.filter(w => w.id !== id);
  return { ok: true };
});
