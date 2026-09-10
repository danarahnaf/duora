import { db } from '../../mocks/db';
import { toMe } from '../../mocks/map';
import { delay } from '../../mocks/simulate';
import { IDS } from '../../mocks/seed';

/** Tombol Google di Fase 1 langsung masuk sebagai Danar. */
export default defineEventHandler(async () => {
  await delay(300);
  const user = db.users.find(u => u.id === IDS.danar)!;
  return {
    accessToken: `mock.${user.id}`,
    refreshToken: `mockrefresh.${user.id}`,
    expiresIn: 900,
    user: toMe(user),
  };
});
