/**
 * Latency artifisial itu penting (§5.3). Tanpa itu skeleton dan error state
 * hanya ditempel di akhir dan selalu salah.
 */
export const delay = (ms?: number) =>
  new Promise<void>((r) => {
    setTimeout(r, ms ?? Number(process.env.NUXT_PUBLIC_MOCK_LATENCY_MS ?? 450));
  });

/** Kirim header `x-mock-fail-rate: 1` dari DevTools untuk menguji error state. */
export function maybeFail(rate = 0) {
  if (rate > 0 && Math.random() < rate) {
    throw createError({
      statusCode: 500,
      data: { statusCode: 500, code: 'MOCK_FAILURE', message: 'Mock failure — ini disengaja.' },
    });
  }
}

/** PRNG deterministik supaya seed selalu sama di setiap restart. */
export function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function fail(statusCode: number, code: string, message: string, details?: unknown): never {
  throw createError({ statusCode, data: { statusCode, code, message, details } });
}
