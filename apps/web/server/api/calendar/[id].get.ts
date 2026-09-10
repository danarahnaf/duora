import { db } from '../../mocks/db';
import { toEvent } from '../../mocks/map';
import { delay, fail, maybeFail } from '../../mocks/simulate';
import { currentCouple, failRate } from '../../utils/currentUser';

export default defineEventHandler(async (event) => {
  await delay();
  maybeFail(failRate(event));
  const { couple } = currentCouple(event);
  const id = getRouterParam(event, 'id');
  const row = db.events.find(e => e.id === id && e.coupleId === couple.id);
  if (!row) fail(404, 'NOT_FOUND', 'Acara tidak ditemukan.');
  return toEvent(row);
});
