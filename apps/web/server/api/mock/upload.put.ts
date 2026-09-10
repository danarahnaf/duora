/** Menerima PUT dari komponen upload supaya progress bar bisa diuji sungguhan. */
export default defineEventHandler(async (event) => {
  await readRawBody(event).catch(() => null);
  await new Promise(r => setTimeout(r, 400));
  return { ok: true, path: (getQuery(event) as { path?: string }).path ?? null };
});
