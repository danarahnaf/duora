import { UpdateMemorySchema } from '@couple/contracts';
import { db } from '../../mocks/db';
import { toMemory } from '../../mocks/map';
import { delay, fail } from '../../mocks/simulate';
import { currentCouple } from '../../utils/currentUser';
import { parseBody } from '../../utils/validate';

export default defineEventHandler(async (event) => {
  await delay(220);
  const { couple } = currentCouple(event);
  const id = getRouterParam(event, 'id');
  const row = db.memories.find(m => m.id === id && m.coupleId === couple.id);
  if (!row) fail(404, 'NOT_FOUND', 'Memori tidak ditemukan.');

  const body = parseBody(UpdateMemorySchema, await readBody(event));
  if (body.caption !== undefined) row.caption = body.caption;
  if (body.happenedAt !== undefined) row.happenedAt = body.happenedAt;
  if (body.location !== undefined) row.location = body.location;
  if (body.isFavorite !== undefined) row.isFavorite = body.isFavorite;

  return toMemory(row);
});
