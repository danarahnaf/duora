import { CreateJournalSchema } from '@couple/contracts';
import { db, uid } from '../../mocks/db';
import { toJournal } from '../../mocks/map';
import { delay, maybeFail } from '../../mocks/simulate';
import { currentCouple, failRate } from '../../utils/currentUser';
import { parseBody } from '../../utils/validate';
import { nowIso, serverLocalDate } from '../../utils/clock';
import { touchStreak } from '../../utils/streak';

export default defineEventHandler(async (event) => {
  await delay();
  maybeFail(failRate(event));
  const { me, couple } = currentCouple(event);
  const body = parseBody(CreateJournalSchema, await readBody(event));

  const row = {
    id: uid(),
    coupleId: couple.id,
    authorId: me.id,
    title: body.title,
    body: body.body,
    visibility: body.visibility,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  db.journal.unshift(row);
  touchStreak(couple, serverLocalDate(couple.timezone));

  setResponseStatus(event, 201);
  return toJournal(row);
});
