import { UpdateWishlistItemSchema } from '@couple/contracts';
import { db } from '../../../mocks/db';
import { toWishlist } from '../../../mocks/map';
import { delay, fail } from '../../../mocks/simulate';
import { currentCouple } from '../../../utils/currentUser';
import { parseBody } from '../../../utils/validate';
import { nowIso } from '../../../utils/clock';

export default defineEventHandler(async (event) => {
  await delay(200);
  const { couple } = currentCouple(event);
  const id = getRouterParam(event, 'id');
  const row = db.wishlist.find(w => w.id === id && w.coupleId === couple.id);
  if (!row) fail(404, 'NOT_FOUND', 'Item tidak ditemukan.');

  const body = parseBody(UpdateWishlistItemSchema, await readBody(event));
  if (body.title !== undefined) row.title = body.title;
  if (body.note !== undefined) row.note = body.note;
  if (body.estimatedIdr !== undefined) row.estimatedIdr = body.estimatedIdr;
  if (body.isDone !== undefined) {
    row.isDone = body.isDone;
    row.doneAt = body.isDone ? nowIso() : null;
  }
  return toWishlist(row);
});
