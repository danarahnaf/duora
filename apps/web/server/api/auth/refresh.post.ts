import { db } from '../../mocks/db';
import { toMe } from '../../mocks/map';
import { delay, fail } from '../../mocks/simulate';

export default defineEventHandler(async (event) => {
  await delay(120);
  const body = await readBody<{ refreshToken?: string }>(event);
  const id = body?.refreshToken?.replace('mockrefresh.', '');
  const user = id ? db.users.find(u => u.id === id) : undefined;
  if (!user) fail(401, 'INVALID_REFRESH', 'Sesi berakhir. Masuk lagi ya.');

  return {
    accessToken: `mock.${user.id}`,
    refreshToken: `mockrefresh.${user.id}`,
    expiresIn: 900,
    user: toMe(user),
  };
});
