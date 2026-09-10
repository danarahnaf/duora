import { db } from '../../mocks/db';
import { delay, maybeFail } from '../../mocks/simulate';
import { currentCouple, failRate } from '../../utils/currentUser';

/** Fase 1: tanpa payment gateway. Hanya bentuk data untuk paywall. */
export default defineEventHandler(async (event) => {
  await delay(300);
  maybeFail(failRate(event));
  const { couple } = currentCouple(event);
  const memoriesUsed = db.memories.filter(m => m.coupleId === couple.id).length;
  const lettersUsed = db.letters.filter(l => l.coupleId === couple.id).length;

  return {
    currentPlan: db.plan,
    plans: [
      {
        key: 'FREE', name: 'Gratis', priceIdr: 0, period: 'FOREVER', badge: null,
        features: [
          { label: '50 memori', included: true },
          { label: 'Pertanyaan harian', included: true },
          { label: 'Kalender & wishlist', included: true },
          { label: 'Surat terkunci tanpa batas', included: false },
          { label: 'Asisten rencana kencan', included: false },
          { label: 'Recap tahunan', included: false },
        ],
      },
      {
        key: 'PREMIUM_MONTHLY', name: 'Premium', priceIdr: 39_000, period: 'MONTH', badge: null,
        features: [
          { label: 'Memori tanpa batas', included: true },
          { label: 'Pertanyaan harian', included: true },
          { label: 'Kalender & wishlist', included: true },
          { label: 'Surat terkunci tanpa batas', included: true },
          { label: 'Asisten rencana kencan', included: true },
          { label: 'Recap tahunan', included: true },
        ],
      },
      {
        key: 'PREMIUM_YEARLY', name: 'Premium Tahunan', priceIdr: 349_000, period: 'YEAR',
        badge: 'Hemat 25%',
        features: [
          { label: 'Semua fitur Premium', included: true },
          { label: 'Album cetak tahunan (diskon)', included: true },
          { label: 'Tema eksklusif', included: true },
          { label: 'Prioritas fitur baru', included: true },
          { label: 'Surat terkunci tanpa batas', included: true },
          { label: 'Recap tahunan', included: true },
        ],
      },
    ],
    limits: {
      memoriesUsed,
      memoriesLimit: db.plan === 'FREE' ? 50 : null,
      lettersUsed,
      lettersLimit: db.plan === 'FREE' ? 3 : null,
    },
  };
});
