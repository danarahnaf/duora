import { db } from '../../../mocks/db';
import { toPlan } from '../../../mocks/map';
import { delay, fail } from '../../../mocks/simulate';
import { currentCouple } from '../../../utils/currentUser';

export default defineEventHandler(async (event) => {
  await delay(200);
  const { couple } = currentCouple(event);
  const id = getRouterParam(event, 'id');
  const row = db.plans.find(p => p.id === id && p.coupleId === couple.id);
  if (!row) fail(404, 'NOT_FOUND', 'Rencana tidak ditemukan.');
  return toPlan(row);
});
