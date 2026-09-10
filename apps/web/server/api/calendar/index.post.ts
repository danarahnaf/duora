import { CreateEventSchema } from '@couple/contracts';
import { db, uid } from '../../mocks/db';
import { toEvent } from '../../mocks/map';
import { delay, maybeFail } from '../../mocks/simulate';
import { currentCouple, failRate } from '../../utils/currentUser';
import { parseBody } from '../../utils/validate';
import { nowIso } from '../../utils/clock';

export default defineEventHandler(async (event) => {
  await delay();
  maybeFail(failRate(event));
  const { me, couple } = currentCouple(event);
  const body = parseBody(CreateEventSchema, await readBody(event));

  const row = {
    id: uid(),
    coupleId: couple.id,
    ...body,
    createdById: me.id,
    createdAt: nowIso(),
  };
  db.events.push(row);

  setResponseStatus(event, 201);
  return toEvent(row);
});
