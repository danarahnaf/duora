import { RegisterSchema } from '@couple/contracts';
import { db, uid } from '../../mocks/db';
import { toMe } from '../../mocks/map';
import { delay, fail, maybeFail } from '../../mocks/simulate';
import { failRate } from '../../utils/currentUser';
import { parseBody } from '../../utils/validate';
import { nowIso } from '../../utils/clock';

export default defineEventHandler(async (event) => {
  await delay();
  maybeFail(failRate(event));

  const body = parseBody(RegisterSchema, await readBody(event));
  if (db.users.some(u => u.email.toLowerCase() === body.email.toLowerCase())) {
    fail(409, 'EMAIL_TAKEN', 'Email ini sudah terdaftar.');
  }

  const user = {
    id: uid(),
    email: body.email,
    displayName: body.displayName,
    avatarPath: null,
    timezone: 'Asia/Jakarta',
    createdAt: nowIso(),
  };
  db.users.push(user);

  return {
    accessToken: `mock.${user.id}`,
    refreshToken: `mockrefresh.${user.id}`,
    expiresIn: 900,
    user: toMe(user),
  };
});
