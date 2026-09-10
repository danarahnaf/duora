import { DailyTodaySchema } from '@couple/contracts';
import { db, uid } from '../../mocks/db';
import { toDailyToday } from '../../mocks/map';
import { questionForDate } from '../../mocks/questions';
import { delay, maybeFail } from '../../mocks/simulate';
import { currentCouple, failRate } from '../../utils/currentUser';
import { serverLocalDate } from '../../utils/clock';

export default defineEventHandler(async (event) => {
  await delay();
  maybeFail(failRate(event));
  const { me, couple } = currentCouple(event);
  const localDate = serverLocalDate(couple.timezone);

  let row = db.dailies.find(d => d.coupleId === couple.id && d.localDate === localDate);
  if (!row) {
    row = {
      id: uid(),
      coupleId: couple.id,
      questionId: questionForDate(localDate).id,
      localDate,
      answers: [],
    };
    db.dailies.push(row);
  }

  // parse: kontrak yang memaksakan answers=null sebelum reveal, bukan komentar
  return DailyTodaySchema.parse(toDailyToday(row, me.id));
});
