import { db } from '../../../mocks/db';
import { delay } from '../../../mocks/simulate';
import { currentCouple } from '../../../utils/currentUser';

export default defineEventHandler(async (event) => {
  await delay();
  const { me, couple } = currentCouple(event);
  db.members = db.members.filter(m => !(m.coupleId === couple.id && m.userId === me.id));
  return { ok: true };
});
