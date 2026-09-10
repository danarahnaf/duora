import { db } from '../../mocks/db';
import { delay, maybeFail } from '../../mocks/simulate';
import { currentCouple, failRate } from '../../utils/currentUser';
import { serverLocalDate, shiftYmd } from '../../utils/clock';

const BADGES = [
  { key: 'first-week', title: 'Minggu pertama', description: '7 hari berturut-turut', emoji: '🌱', threshold: 7 },
  { key: 'two-weeks', title: 'Dua minggu', description: '14 hari berturut-turut', emoji: '🔥', threshold: 14 },
  { key: 'one-month', title: 'Sebulan', description: '30 hari berturut-turut', emoji: '🏅', threshold: 30 },
  { key: 'hundred', title: 'Seratus', description: '100 hari berturut-turut', emoji: '👑', threshold: 100 },
];

export default defineEventHandler(async (event) => {
  await delay();
  maybeFail(failRate(event));
  const { couple } = currentCouple(event);
  const today = serverLocalDate(couple.timezone);

  const activeDates = new Set<string>([
    ...db.dailies.filter(d => d.coupleId === couple.id && d.answers.length > 0).map(d => d.localDate),
    ...db.moods.filter(m => m.coupleId === couple.id).map(m => m.localDate),
  ]);

  const last14 = Array.from({ length: 14 }, (_, i) => {
    const localDate = shiftYmd(today, -(13 - i));
    return { localDate, active: activeDates.has(localDate) };
  });

  return {
    current: couple.streakCount,
    longest: couple.streakLongest,
    lastActiveOn: couple.streakLastActiveOn,
    atRisk: !activeDates.has(today),
    last14,
    badges: BADGES.map(b => ({
      ...b,
      unlockedOn: couple.streakLongest >= b.threshold ? couple.streakLastActiveOn : null,
    })),
  };
});
