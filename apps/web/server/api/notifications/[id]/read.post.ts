import { db } from '../../../mocks/db';
import { delay, fail } from '../../../mocks/simulate';
import { currentUser } from '../../../utils/currentUser';
import { nowIso } from '../../../utils/clock';

export default defineEventHandler(async (event) => {
  await delay(120);
  const me = currentUser(event);
  const id = getRouterParam(event, 'id');
  const row = db.notifications.find(n => n.id === id && n.userId === me.id);
  if (!row) fail(404, 'NOT_FOUND', 'Notifikasi tidak ditemukan.');
  row.readAt ??= nowIso();
  return { ok: true };
});
