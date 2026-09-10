import { ForgotPasswordSchema } from '@couple/contracts';
import { delay } from '../../mocks/simulate';
import { parseBody } from '../../utils/validate';

/** Selalu sukses — jangan bocorkan apakah email terdaftar. */
export default defineEventHandler(async (event) => {
  await delay();
  parseBody(ForgotPasswordSchema, await readBody(event));
  return { ok: true };
});
