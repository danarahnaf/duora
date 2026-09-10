import { db } from '../../mocks/db';
import { questionForDate } from '../../mocks/questions';
import { delay, maybeFail } from '../../mocks/simulate';
import { currentCouple, failRate } from '../../utils/currentUser';
import { serverLocalDate } from '../../utils/clock';

const PAGE = 20;

export default defineEventHandler(async (event) => {
  await delay();
  maybeFail(failRate(event));
  const { couple } = currentCouple(event);
  const { cursor } = getQuery(event) as { cursor?: string };
  const today = serverLocalDate(couple.timezone);

  const all = db.dailies
    .filter(d => d.coupleId === couple.id && d.localDate < today && d.answers.length > 0)
    .sort((a, b) => (a.localDate < b.localDate ? 1 : -1));

  const start = cursor ? all.findIndex(d => d.localDate === cursor) + 1 : 0;
  const page = all.slice(start, start + PAGE);

  return {
    items: page.map((d) => {
      const q = questionForDate(d.localDate);
      const revealed = d.answers.length === 2;
      return {
        questionId: q.id,
        localDate: d.localDate,
        category: q.category,
        text: q.text,
        revealed,
        answers: revealed ? d.answers : null,
      };
    }),
    nextCursor: start + PAGE < all.length ? (page.at(-1)?.localDate ?? null) : null,
  };
});
