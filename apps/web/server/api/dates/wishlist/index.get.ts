import { db } from '../../../mocks/db';
import { toWishlist } from '../../../mocks/map';
import { delay, maybeFail } from '../../../mocks/simulate';
import { currentCouple, failRate } from '../../../utils/currentUser';

export default defineEventHandler(async (event) => {
  await delay();
  maybeFail(failRate(event));
  const { couple } = currentCouple(event);
  const items = db.wishlist
    .filter(w => w.coupleId === couple.id)
    .sort((a, b) => Number(a.isDone) - Number(b.isDone) || (a.createdAt < b.createdAt ? 1 : -1));
  return { items: items.map(toWishlist) };
});
