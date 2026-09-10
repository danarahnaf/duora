import { delay } from '../../mocks/simulate';

export default defineEventHandler(async () => {
  await delay(120);
  return { ok: true };
});
