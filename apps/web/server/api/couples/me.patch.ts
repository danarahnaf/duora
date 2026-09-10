import { UpdateCoupleSchema } from '@couple/contracts';
import { toCouple } from '../../mocks/map';
import { delay, maybeFail } from '../../mocks/simulate';
import { currentCouple, failRate } from '../../utils/currentUser';
import { parseBody } from '../../utils/validate';

export default defineEventHandler(async (event) => {
  await delay();
  maybeFail(failRate(event));
  const { couple } = currentCouple(event);
  const body = parseBody(UpdateCoupleSchema, await readBody(event));

  if (body.name !== undefined) couple.name = body.name ?? null;
  if (body.relationshipDate !== undefined) couple.relationshipDate = body.relationshipDate;
  if (body.relationshipDateLabel !== undefined) couple.relationshipDateLabel = body.relationshipDateLabel;
  if (body.timezone !== undefined) couple.timezone = body.timezone;
  if (body.theme !== undefined) couple.theme = body.theme;
  if (body.photoPath !== undefined) couple.photoPath = body.photoPath;

  return toCouple(couple);
});
