import { db } from '../../mocks/db';
import { toJournal } from '../../mocks/map';
import { delay, maybeFail } from '../../mocks/simulate';
import { currentCouple, failRate } from '../../utils/currentUser';

const PAGE = 20;

/**
 * Private journal (§6.4): entri PRIVATE hanya keluar untuk penulisnya.
 * Filter ini ada di server, bukan di komponen.
 */
export default defineEventHandler(async (event) => {
  await delay();
  maybeFail(failRate(event));
  const { me, couple } = currentCouple(event);
  const q = getQuery(event) as { cursor?: string; visibility?: 'PRIVATE' | 'SHARED' };

  let all = db.journal.filter(j =>
    j.coupleId === couple.id && (j.visibility === 'SHARED' || j.authorId === me.id));
  if (q.visibility) all = all.filter(j => j.visibility === q.visibility);
  all = all.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  const start = q.cursor ? all.findIndex(j => j.id === q.cursor) + 1 : 0;
  const page = all.slice(start, start + PAGE);

  return {
    items: page.map(toJournal),
    nextCursor: start + PAGE < all.length ? (page.at(-1)?.id ?? null) : null,
  };
});
