import { db } from '../../mocks/db';
import { toNotification } from '../../mocks/map';
import { delay, maybeFail } from '../../mocks/simulate';
import { currentUser, failRate } from '../../utils/currentUser';

const PAGE = 20;

export default defineEventHandler(async (event) => {
  await delay(260);
  maybeFail(failRate(event));
  const me = currentUser(event);
  const { cursor } = getQuery(event) as { cursor?: string };

  const all = db.notifications
    .filter(n => n.userId === me.id)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  const start = cursor ? all.findIndex(n => n.id === cursor) + 1 : 0;
  const page = all.slice(start, start + PAGE);

  return {
    items: page.map(toNotification),
    nextCursor: start + PAGE < all.length ? (page.at(-1)?.id ?? null) : null,
    unreadCount: all.filter(n => !n.readAt).length,
  };
});
