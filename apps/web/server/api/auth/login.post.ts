import { CredentialsSchema } from '@couple/contracts';
import { db } from '../../mocks/db';
import { toMe } from '../../mocks/map';
import { delay, fail, maybeFail } from '../../mocks/simulate';
import { failRate } from '../../utils/currentUser';
import { parseBody } from '../../utils/validate';

/**
 * Auth mock. Password apa pun diterima selama email terdaftar —
 * Fase 1 tidak boleh punya auth nyata (argon2 + JWT ada di Fase 2).
 */
export default defineEventHandler(async (event) => {
  await delay();
  maybeFail(failRate(event));

  const body = parseBody(CredentialsSchema, await readBody(event));
  const user = db.users.find(u => u.email.toLowerCase() === body.email.toLowerCase());
  if (!user) {
    fail(401, 'INVALID_CREDENTIALS', 'Email atau password salah.');
  }

  return {
    accessToken: `mock.${user.id}`,
    refreshToken: `mockrefresh.${user.id}`,
    expiresIn: 900,
    user: toMe(user),
  };
});
