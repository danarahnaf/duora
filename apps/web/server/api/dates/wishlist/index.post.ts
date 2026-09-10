import { CreateWishlistItemSchema } from '@couple/contracts';
import { db, uid } from '../../../mocks/db';
import { toWishlist } from '../../../mocks/map';
import { delay, maybeFail } from '../../../mocks/simulate';
import { currentCouple, failRate } from '../../../utils/currentUser';
import { parseBody } from '../../../utils/validate';
import { nowIso } from '../../../utils/clock';

export default defineEventHandler(async (event) => {
  await delay();
  maybeFail(failRate(event));
  const { me, couple } = currentCouple(event);
  const body = parseBody(CreateWishlistItemSchema, await readBody(event));

  const row = {
    id: uid(),
    coupleId: couple.id,
    title: body.title,
    note: body.note,
    estimatedIdr: body.estimatedIdr,
    isDone: false,
    addedById: me.id,
    doneAt: null,
    createdAt: nowIso(),
  };
  db.wishlist.unshift(row);
  setResponseStatus(event, 201);
  return toWishlist(row);
});
