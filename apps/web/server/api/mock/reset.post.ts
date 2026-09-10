import { reset } from '../../mocks/db';

/** Dipakai DevTools untuk mengembalikan seed tanpa restart server. */
export default defineEventHandler(() => {
  reset();
  return { ok: true };
});
