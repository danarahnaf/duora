import { UpdateNotificationPreferencesSchema } from '@couple/contracts';
import { db } from '../../mocks/db';
import { delay } from '../../mocks/simulate';
import { currentUser } from '../../utils/currentUser';
import { parseBody } from '../../utils/validate';

export default defineEventHandler(async (event) => {
  await delay(220);
  const me = currentUser(event);
  const body = parseBody(UpdateNotificationPreferencesSchema, await readBody(event));

  for (const item of body.items ?? []) {
    const row = db.prefs.find(p => p.userId === me.id && p.category === item.category);
    if (row) {
      row.push = item.push;
      row.email = item.email;
    } else {
      db.prefs.push({ userId: me.id, ...item });
    }
  }
  if (body.quietHours !== undefined) db.quietHours = body.quietHours;

  return {
    items: db.prefs
      .filter(p => p.userId === me.id)
      .map(p => ({ category: p.category, push: p.push, email: p.email })),
    quietHours: db.quietHours,
  };
});
