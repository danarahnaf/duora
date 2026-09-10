import { db } from '../../mocks/db';
import { delay, fail } from '../../mocks/simulate';
import { currentCouple } from '../../utils/currentUser';
import { nowIso } from '../../utils/clock';

export default defineEventHandler(async (event) => {
  await delay(200);
  const { couple } = currentCouple(event);
  const id = getRouterParam(event, 'id');
  const invite = db.invites.find(i => i.id === id && i.coupleId === couple.id);
  if (!invite) fail(404, 'NOT_FOUND', 'Kode tidak ditemukan.');
  invite.revokedAt = nowIso();
  return { ok: true };
});
