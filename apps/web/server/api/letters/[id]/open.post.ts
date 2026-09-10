import { db } from '../../../mocks/db';
import { isLetterLocked, toLetterDetail } from '../../../mocks/map';
import { delay, fail } from '../../../mocks/simulate';
import { currentCouple } from '../../../utils/currentUser';
import { nowIso, serverLocalDate } from '../../../utils/clock';

export default defineEventHandler(async (event) => {
  await delay(400);
  const { couple } = currentCouple(event);
  const id = getRouterParam(event, 'id');
  const row = db.letters.find(l => l.id === id && l.coupleId === couple.id);
  if (!row) fail(404, 'NOT_FOUND', 'Surat tidak ditemukan.');

  const today = serverLocalDate(couple.timezone);
  if (isLetterLocked(row, today)) {
    fail(423, 'LETTER_LOCKED', 'Surat ini belum waktunya dibuka.');
  }
  row.openedAt ??= nowIso();
  return toLetterDetail(row, today);
});
