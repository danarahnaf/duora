import { CreateCoupleSchema } from '@couple/contracts';
import { db, uid } from '../../mocks/db';
import { toCouple } from '../../mocks/map';
import { delay, fail, maybeFail } from '../../mocks/simulate';
import { currentUser, failRate } from '../../utils/currentUser';
import { parseBody } from '../../utils/validate';
import { nowIso } from '../../utils/clock';

export default defineEventHandler(async (event) => {
  await delay();
  maybeFail(failRate(event));
  const me = currentUser(event);

  if (db.members.some(m => m.userId === me.id)) {
    fail(409, 'ALREADY_IN_COUPLE', 'Kamu sudah terhubung dengan seseorang.');
  }

  const body = parseBody(CreateCoupleSchema, await readBody(event));
  const couple = {
    id: uid(),
    name: body.name ?? me.displayName,
    photoPath: null,
    relationshipDate: body.relationshipDate,
    relationshipDateLabel: body.relationshipDateLabel,
    theme: 'rose',
    timezone: body.timezone,
    streakCount: 0,
    streakLongest: 0,
    streakLastActiveOn: null,
    createdAt: nowIso(),
  };
  db.couples.push(couple);
  db.members.push({ coupleId: couple.id, userId: me.id, role: 'OWNER', joinedAt: nowIso() });

  return toCouple(couple);
});
