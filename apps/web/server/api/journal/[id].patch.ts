import { UpdateJournalSchema } from '@couple/contracts';
import { db } from '../../mocks/db';
import { toJournal } from '../../mocks/map';
import { delay, fail } from '../../mocks/simulate';
import { currentCouple } from '../../utils/currentUser';
import { parseBody } from '../../utils/validate';
import { nowIso } from '../../utils/clock';

export default defineEventHandler(async (event) => {
  await delay(220);
  const { me, couple } = currentCouple(event);
  const id = getRouterParam(event, 'id');
  const row = db.journal.find(j => j.id === id && j.coupleId === couple.id);
  if (!row) fail(404, 'NOT_FOUND', 'Catatan tidak ditemukan.');
  if (row.authorId !== me.id) fail(403, 'FORBIDDEN', 'Hanya penulisnya yang bisa mengubah.');

  const body = parseBody(UpdateJournalSchema, await readBody(event));
  if (body.title !== undefined) row.title = body.title;
  if (body.body !== undefined) row.body = body.body;
  if (body.visibility !== undefined) row.visibility = body.visibility;
  row.updatedAt = nowIso();

  return toJournal(row);
});
