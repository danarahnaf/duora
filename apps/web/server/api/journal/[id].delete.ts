import { db } from '../../mocks/db';
import { delay, fail } from '../../mocks/simulate';
import { currentCouple } from '../../utils/currentUser';

export default defineEventHandler(async (event) => {
  await delay(200);
  const { me, couple } = currentCouple(event);
  const id = getRouterParam(event, 'id');
  const row = db.journal.find(j => j.id === id && j.coupleId === couple.id);
  if (!row) fail(404, 'NOT_FOUND', 'Catatan tidak ditemukan.');
  if (row.authorId !== me.id) fail(403, 'FORBIDDEN', 'Hanya penulisnya yang bisa menghapus.');
  db.journal = db.journal.filter(j => j.id !== id);
  return { ok: true };
});
