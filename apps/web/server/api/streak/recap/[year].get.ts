import { db } from '../../../mocks/db';
import { delay, fail, maybeFail } from '../../../mocks/simulate';
import { currentCouple, failRate } from '../../../utils/currentUser';
import { MOOD_SCORE } from '../../../mocks/moodscore';

export default defineEventHandler(async (event) => {
  await delay(600);
  maybeFail(failRate(event));
  const { couple } = currentCouple(event);
  const year = String(getRouterParam(event, 'year') ?? '');
  if (!/^\d{4}$/.test(year)) fail(404, 'NOT_FOUND', 'Tahun tidak valid.');

  const mine = { coupleId: couple.id };
  const memories = db.memories.filter(m => m.coupleId === mine.coupleId && m.happenedAt.startsWith(year));
  const events = db.events.filter(e => e.coupleId === mine.coupleId && e.date.startsWith(year));
  const dailies = db.dailies.filter(d =>
    d.coupleId === mine.coupleId && d.localDate.startsWith(year) && d.answers.length > 0);
  const journal = db.journal.filter(j => j.coupleId === mine.coupleId && j.createdAt.startsWith(year));
  const moods = db.moods.filter(m => m.coupleId === mine.coupleId && m.localDate.startsWith(year));

  const locationCount = new Map<string, number>();
  for (const m of memories) {
    if (m.location) locationCount.set(m.location, (locationCount.get(m.location) ?? 0) + 1);
  }
  const topLocation = [...locationCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const moodCount = new Map<string, number>();
  for (const m of moods) moodCount.set(m.level, (moodCount.get(m.level) ?? 0) + 1);
  const topMoodLevel = [...moodCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const dates = events.filter(e => e.category === 'DATE');
  const totalSpentIdr = events.reduce((sum, e) => sum + (e.budgetIdr ?? 0), 0);
  const photoCount = memories.reduce((sum, m) => sum + m.media.length, 0);
  const avgMood = moods.length
    ? moods.reduce((s, m) => s + MOOD_SCORE[m.level], 0) / moods.length
    : 0;

  return {
    year: Number(year),
    memories: memories.length,
    dates: dates.length,
    questionsAnswered: dailies.length,
    journalEntries: journal.length,
    longestStreak: couple.streakLongest,
    topLocation,
    topMoodLevel,
    totalSpentIdr,
    highlights: [
      { label: 'Foto tersimpan', value: String(photoCount) },
      { label: 'Tempat berbeda', value: String(locationCount.size) },
      { label: 'Rata-rata mood', value: avgMood ? `${avgMood.toFixed(1)} / 5` : '—' },
      { label: 'Acara di kalender', value: String(events.length) },
    ],
  };
});
