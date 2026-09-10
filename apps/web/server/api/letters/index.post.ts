import { CreateLetterSchema } from '@couple/contracts';
import { db, uid } from '../../mocks/db';
import { toLetterListItem } from '../../mocks/map';
import { delay, fail, maybeFail } from '../../mocks/simulate';
import { currentCouple, failRate } from '../../utils/currentUser';
import { parseBody } from '../../utils/validate';
import { nowIso, serverLocalDate } from '../../utils/clock';

export default defineEventHandler(async (event) => {
  await delay();
  maybeFail(failRate(event));
  const { me, couple } = currentCouple(event);
  const body = parseBody(CreateLetterSchema, await readBody(event));
  const today = serverLocalDate(couple.timezone);

  if (body.unlockOn <= today) {
    fail(422, 'UNLOCK_IN_PAST', 'Tanggal buka harus setelah hari ini.');
  }

  const row = {
    id: uid(),
    coupleId: couple.id,
    authorId: me.id,
    title: body.title,
    body: body.body,
    unlockType: body.unlockType,
    unlockOn: body.unlockOn,
    openedAt: null,
    createdAt: nowIso(),
  };
  db.letters.push(row);

  setResponseStatus(event, 201);
  return toLetterListItem(row, today);
});
