import { db } from '../../mocks/db';
import { toMood } from '../../mocks/map';
import { delay, maybeFail } from '../../mocks/simulate';
import { currentCouple, failRate } from '../../utils/currentUser';
import { serverLocalDate } from '../../utils/clock';

export default defineEventHandler(async (event) => {
  await delay();
  maybeFail(failRate(event));
  const { me, couple, partnerId } = currentCouple(event);
  const localDate = serverLocalDate(couple.timezone);
  const rows = db.moods.filter(m => m.coupleId === couple.id && m.localDate === localDate);

  return {
    localDate,
    mine: rows.filter(m => m.userId === me.id).map(toMood)[0] ?? null,
    partner: partnerId ? (rows.filter(m => m.userId === partnerId).map(toMood)[0] ?? null) : null,
  };
});
