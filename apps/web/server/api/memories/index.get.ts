import { db } from '../../mocks/db';
import { toMemory } from '../../mocks/map';
import { delay, maybeFail } from '../../mocks/simulate';
import { currentCouple, failRate } from '../../utils/currentUser';

const PAGE = 24;

export default defineEventHandler(async (event) => {
  await delay();
  maybeFail(failRate(event));
  const { couple } = currentCouple(event);
  const q = getQuery(event) as { cursor?: string; month?: string; favorite?: string };

  let all = db.memories.filter(m => m.coupleId === couple.id);
  if (q.month) all = all.filter(m => m.happenedAt.startsWith(q.month!));
  if (q.favorite === 'true') all = all.filter(m => m.isFavorite);
  all = all.sort((a, b) => (a.happenedAt < b.happenedAt ? 1 : -1));

  const start = q.cursor ? all.findIndex(m => m.id === q.cursor) + 1 : 0;
  const page = all.slice(start, start + PAGE);

  return {
    items: page.map(toMemory),
    nextCursor: start + PAGE < all.length ? (page.at(-1)?.id ?? null) : null,
  };
});
