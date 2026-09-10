import { db } from '../../mocks/db';
import { toMilestone } from '../../mocks/map';
import { delay, maybeFail } from '../../mocks/simulate';
import { currentCouple, failRate } from '../../utils/currentUser';

export default defineEventHandler(async (event) => {
  await delay();
  maybeFail(failRate(event));
  const { couple } = currentCouple(event);
  const items = db.milestones
    .filter(m => m.coupleId === couple.id)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
  return { items: items.map(toMilestone) };
});
