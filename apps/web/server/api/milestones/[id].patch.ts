import { UpdateMilestoneSchema } from '@couple/contracts';
import { db } from '../../mocks/db';
import { toMilestone } from '../../mocks/map';
import { delay, fail } from '../../mocks/simulate';
import { currentCouple } from '../../utils/currentUser';
import { parseBody } from '../../utils/validate';

export default defineEventHandler(async (event) => {
  await delay(220);
  const { couple } = currentCouple(event);
  const id = getRouterParam(event, 'id');
  const row = db.milestones.find(m => m.id === id && m.coupleId === couple.id);
  if (!row) fail(404, 'NOT_FOUND', 'Milestone tidak ditemukan.');

  const body = parseBody(UpdateMilestoneSchema, await readBody(event));
  if (body.title !== undefined) row.title = body.title;
  if (body.date !== undefined) row.date = body.date;
  if (body.note !== undefined) row.note = body.note;
  if (body.icon !== undefined) row.icon = body.icon;
  return toMilestone(row);
});
