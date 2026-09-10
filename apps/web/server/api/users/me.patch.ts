import { UpdateMeSchema } from '@couple/contracts';
import { toMe } from '../../mocks/map';
import { delay, maybeFail } from '../../mocks/simulate';
import { currentUser, failRate } from '../../utils/currentUser';
import { parseBody } from '../../utils/validate';

export default defineEventHandler(async (event) => {
  await delay();
  maybeFail(failRate(event));
  const me = currentUser(event);
  const body = parseBody(UpdateMeSchema, await readBody(event));

  if (body.displayName !== undefined) me.displayName = body.displayName;
  if (body.timezone !== undefined) me.timezone = body.timezone;
  if (body.avatarPath !== undefined) me.avatarPath = body.avatarPath;

  return toMe(me);
});
