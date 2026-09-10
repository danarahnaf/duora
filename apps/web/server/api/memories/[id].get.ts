import { db } from '../../mocks/db';
import { toMemory } from '../../mocks/map';
import { delay, fail, maybeFail } from '../../mocks/simulate';
import { currentCouple, failRate } from '../../utils/currentUser';

export default defineEventHandler(async (event) => {
  await delay();
  maybeFail(failRate(event));
  const { couple } = currentCouple(event);
  const id = getRouterParam(event, 'id');
  // couple scoping: id yang bukan milik couple ini tampak seperti tidak ada
  const row = db.memories.find(m => m.id === id && m.coupleId === couple.id);
  if (!row) fail(404, 'NOT_FOUND', 'Memori tidak ditemukan.');
  return toMemory(row);
});
