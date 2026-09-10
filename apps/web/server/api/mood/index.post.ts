import { SubmitMoodSchema } from '@couple/contracts';
import { db, uid } from '../../mocks/db';
import { toMood } from '../../mocks/map';
import { delay, maybeFail } from '../../mocks/simulate';
import { currentCouple, failRate } from '../../utils/currentUser';
import { parseBody } from '../../utils/validate';
import { nowIso, serverLocalDate } from '../../utils/clock';
import { touchStreak } from '../../utils/streak';

/** Satu check-in per user per hari lokal; kirim ulang = memperbarui. */
export default defineEventHandler(async (event) => {
  await delay();
  maybeFail(failRate(event));
  const { me, couple, partnerId } = currentCouple(event);
  const body = parseBody(SubmitMoodSchema, await readBody(event));
  const localDate = serverLocalDate(couple.timezone);

  const existing = db.moods.find(m =>
    m.coupleId === couple.id && m.userId === me.id && m.localDate === localDate);

  if (existing) {
    existing.level = body.level;
    existing.note = body.note;
    existing.createdAt = nowIso();
  } else {
    db.moods.push({
      id: uid(),
      coupleId: couple.id,
      userId: me.id,
      level: body.level,
      note: body.note,
      localDate,
      createdAt: nowIso(),
    });
  }
  touchStreak(couple, localDate);

  const rows = db.moods.filter(m => m.coupleId === couple.id && m.localDate === localDate);
  return {
    localDate,
    mine: rows.filter(m => m.userId === me.id).map(toMood)[0] ?? null,
    partner: partnerId ? (rows.filter(m => m.userId === partnerId).map(toMood)[0] ?? null) : null,
  };
});
