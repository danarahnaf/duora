import { UpdateDatePlanSchema } from '@couple/contracts';
import { db } from '../../../mocks/db';
import { toPlan } from '../../../mocks/map';
import { delay, fail } from '../../../mocks/simulate';
import { currentCouple } from '../../../utils/currentUser';
import { parseBody } from '../../../utils/validate';

export default defineEventHandler(async (event) => {
  await delay(250);
  const { couple } = currentCouple(event);
  const id = getRouterParam(event, 'id');
  const row = db.plans.find(p => p.id === id && p.coupleId === couple.id);
  if (!row) fail(404, 'NOT_FOUND', 'Rencana tidak ditemukan.');

  const body = parseBody(UpdateDatePlanSchema, await readBody(event));
  if (body.status !== undefined) row.status = body.status;
  if (body.title !== undefined) row.title = body.title;
  return toPlan(row);
});
