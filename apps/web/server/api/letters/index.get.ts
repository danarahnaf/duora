import { db } from '../../mocks/db';
import { toLetterListItem } from '../../mocks/map';
import { delay, maybeFail } from '../../mocks/simulate';
import { currentCouple, failRate } from '../../utils/currentUser';
import { serverLocalDate } from '../../utils/clock';

export default defineEventHandler(async (event) => {
  await delay();
  maybeFail(failRate(event));
  const { couple } = currentCouple(event);
  const today = serverLocalDate(couple.timezone);

  const items = db.letters
    .filter(l => l.coupleId === couple.id)
    .sort((a, b) => (a.unlockOn < b.unlockOn ? 1 : -1));

  // body tidak ikut di list, apa pun statusnya
  return { items: items.map(l => toLetterListItem(l, today)) };
});
