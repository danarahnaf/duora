import { DailyTodaySchema, SubmitAnswerSchema } from '@couple/contracts';
import { db, uid } from '../../mocks/db';
import { toDailyToday } from '../../mocks/map';
import { questionForDate } from '../../mocks/questions';
import { delay, fail, maybeFail } from '../../mocks/simulate';
import { currentCouple, failRate } from '../../utils/currentUser';
import { nowIso, serverLocalDate } from '../../utils/clock';
import { touchStreak } from '../../utils/streak';
import { parseBody } from '../../utils/validate';

export default defineEventHandler(async (event) => {
  await delay();
  maybeFail(failRate(event));
  const { me, couple } = currentCouple(event);
  const body = parseBody(SubmitAnswerSchema, await readBody(event));
  const localDate = serverLocalDate(couple.timezone);

  if (body.questionId !== questionForDate(localDate).id) {
    fail(409, 'QUESTION_STALE', 'Pertanyaan sudah berganti. Muat ulang halaman.');
  }

  let row = db.dailies.find(d => d.coupleId === couple.id && d.localDate === localDate);
  if (!row) {
    row = { id: uid(), coupleId: couple.id, questionId: body.questionId, localDate, answers: [] };
    db.dailies.push(row);
  }
  if (row.answers.some(a => a.authorId === me.id)) {
    fail(409, 'ALREADY_ANSWERED', 'Kamu sudah menjawab hari ini.');
  }

  row.answers.push({ authorId: me.id, body: body.body, createdAt: nowIso() });
  touchStreak(couple, localDate);

  return DailyTodaySchema.parse(toDailyToday(row, me.id));
});
