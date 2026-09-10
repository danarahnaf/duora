import { db } from '../../mocks/db';
import { toMood } from '../../mocks/map';
import { delay, maybeFail } from '../../mocks/simulate';
import { currentCouple, failRate } from '../../utils/currentUser';
import { serverLocalDate, shiftYmd } from '../../utils/clock';

export default defineEventHandler(async (event) => {
  await delay();
  maybeFail(failRate(event));
  const { me, couple, partnerId } = currentCouple(event);
  const days = Math.min(90, Math.max(1, Number((getQuery(event) as { days?: string }).days ?? 14)));
  const from = shiftYmd(serverLocalDate(couple.timezone), -(days - 1));

  const rows = db.moods
    .filter(m => m.coupleId === couple.id && m.localDate >= from)
    .sort((a, b) => (a.localDate < b.localDate ? -1 : 1));

  return {
    days,
    mine: rows.filter(m => m.userId === me.id).map(toMood),
    partner: partnerId ? rows.filter(m => m.userId === partnerId).map(toMood) : [],
  };
});
