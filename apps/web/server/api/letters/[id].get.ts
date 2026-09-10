import { db } from '../../mocks/db';
import { isLetterLocked, toLetterDetail } from '../../mocks/map';
import { delay, fail } from '../../mocks/simulate';
import { currentCouple } from '../../utils/currentUser';
import { serverLocalDate } from '../../utils/clock';

/**
 * Gating letter (§6.3) ada di server. Kalau masih terkunci: 423 Locked,
 * dan body tidak pernah dikirim. UI tidak boleh jadi penentu.
 */
export default defineEventHandler(async (event) => {
  await delay();
  const { couple } = currentCouple(event);
  const id = getRouterParam(event, 'id');
  const row = db.letters.find(l => l.id === id && l.coupleId === couple.id);
  if (!row) fail(404, 'NOT_FOUND', 'Surat tidak ditemukan.');

  const today = serverLocalDate(couple.timezone);
  if (isLetterLocked(row, today)) {
    setResponseStatus(event, 423);
    return toLetterDetail(row, today); // body: null
  }
  return toLetterDetail(row, today);
});
