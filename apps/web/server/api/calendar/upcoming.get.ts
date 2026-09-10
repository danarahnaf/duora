import { db } from '../../mocks/db';
import { toEvent } from '../../mocks/map';
import { delay, maybeFail } from '../../mocks/simulate';
import { currentCouple, failRate } from '../../utils/currentUser';
import { serverLocalDate } from '../../utils/clock';

export default defineEventHandler(async (event) => {
  await delay();
  maybeFail(failRate(event));
  const { couple } = currentCouple(event);
  const today = serverLocalDate(couple.timezone);

  const items = db.events
    .filter(e => e.coupleId === couple.id && e.date >= today)
    .sort((a, b) => (a.date === b.date ? (a.time ?? '').localeCompare(b.time ?? '') : a.date < b.date ? -1 : 1))
    .slice(0, 5);

  return { items: items.map(toEvent) };
});
