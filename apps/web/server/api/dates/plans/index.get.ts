import { db } from '../../../mocks/db';
import { toPlan } from '../../../mocks/map';
import { delay, maybeFail } from '../../../mocks/simulate';
import { currentCouple, failRate } from '../../../utils/currentUser';

export default defineEventHandler(async (event) => {
  await delay();
  maybeFail(failRate(event));
  const { couple } = currentCouple(event);
  const items = db.plans
    .filter(p => p.coupleId === couple.id && p.status !== 'DRAFT')
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return { items: items.map(toPlan) };
});
