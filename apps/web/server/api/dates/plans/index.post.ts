import { PlannerInputSchema } from '@couple/contracts';
import { db, uid } from '../../../mocks/db';
import { toPlan } from '../../../mocks/map';
import { generatePlan } from '../../../mocks/planner';
import { delay, maybeFail } from '../../../mocks/simulate';
import { currentCouple, failRate } from '../../../utils/currentUser';
import { parseBody } from '../../../utils/validate';
import { nowIso } from '../../../utils/clock';

export default defineEventHandler(async (event) => {
  // sengaja lebih lambat: layar hasil punya state "menyusun rencana"
  await delay(900);
  maybeFail(failRate(event));
  const { couple } = currentCouple(event);
  const input = parseBody(PlannerInputSchema, await readBody(event));
  const generated = generatePlan(input);

  const row = {
    id: uid(),
    coupleId: couple.id,
    title: generated.title,
    status: 'DRAFT' as const,
    source: 'MANUAL' as const,
    input,
    steps: generated.steps,
    totalIdr: generated.totalIdr,
    createdAt: nowIso(),
  };
  db.plans.unshift(row);

  setResponseStatus(event, 201);
  return toPlan(row);
});
