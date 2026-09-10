import { db } from '../../mocks/db';
import { toJournal } from '../../mocks/map';
import { delay, fail } from '../../mocks/simulate';
import { currentCouple } from '../../utils/currentUser';

export default defineEventHandler(async (event) => {
  await delay(200);
  const { me, couple } = currentCouple(event);
  const id = getRouterParam(event, 'id');
  const row = db.journal.find(j => j.id === id && j.coupleId === couple.id);
  // entri privat milik partner: 404, bukan 403 — jangan bocorkan keberadaannya
  if (!row || (row.visibility === 'PRIVATE' && row.authorId !== me.id)) {
    fail(404, 'NOT_FOUND', 'Catatan tidak ditemukan.');
  }
  return toJournal(row);
});
