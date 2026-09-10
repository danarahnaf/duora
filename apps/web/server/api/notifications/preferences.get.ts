import { db } from '../../mocks/db';
import { delay, maybeFail } from '../../mocks/simulate';
import { currentUser, failRate } from '../../utils/currentUser';

export default defineEventHandler(async (event) => {
  await delay(220);
  maybeFail(failRate(event));
  const me = currentUser(event);
  return {
    items: db.prefs
      .filter(p => p.userId === me.id)
      .map(p => ({ category: p.category, push: p.push, email: p.email })),
    quietHours: db.quietHours,
  };
});
