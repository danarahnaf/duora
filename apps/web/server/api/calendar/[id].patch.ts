import { UpdateEventSchema } from '@couple/contracts';
import { db } from '../../mocks/db';
import { toEvent } from '../../mocks/map';
import { delay, fail } from '../../mocks/simulate';
import { currentCouple } from '../../utils/currentUser';
import { parseBody } from '../../utils/validate';

export default defineEventHandler(async (event) => {
  await delay(220);
  const { couple } = currentCouple(event);
  const id = getRouterParam(event, 'id');
  const row = db.events.find(e => e.id === id && e.coupleId === couple.id);
  if (!row) fail(404, 'NOT_FOUND', 'Acara tidak ditemukan.');

  const body = parseBody(UpdateEventSchema, await readBody(event));
  Object.assign(row, body);
  return toEvent(row);
});
