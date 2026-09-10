import { db } from '../../mocks/db';
import { toEvent } from '../../mocks/map';
import { delay, maybeFail } from '../../mocks/simulate';
import { currentCouple, failRate } from '../../utils/currentUser';

export default defineEventHandler(async (event) => {
  await delay();
  maybeFail(failRate(event));
  const { couple } = currentCouple(event);
  const { from, to } = getQuery(event) as { from?: string; to?: string };

  const items = db.events
    .filter(e => e.coupleId === couple.id)
    .filter(e => (!from || e.date >= from) && (!to || e.date <= to))
    .sort((a, b) => (a.date === b.date ? (a.time ?? '').localeCompare(b.time ?? '') : a.date < b.date ? -1 : 1));

  return { items: items.map(toEvent) };
});
