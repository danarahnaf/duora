import { db } from '../../mocks/db';
import { toCouple } from '../../mocks/map';
import { delay, maybeFail } from '../../mocks/simulate';
import { currentUser, failRate } from '../../utils/currentUser';

/** null (bukan 404) supaya onboarding bisa membedakan "belum punya" dari error. */
export default defineEventHandler(async (event) => {
  await delay(160);
  maybeFail(failRate(event));
  const me = currentUser(event);
  const membership = db.members.find(m => m.userId === me.id);
  if (!membership) return null;
  const couple = db.couples.find(c => c.id === membership.coupleId);
  return couple ? toCouple(couple) : null;
});
