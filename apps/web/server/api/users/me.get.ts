import { toMe } from '../../mocks/map';
import { delay, maybeFail } from '../../mocks/simulate';
import { currentUser, failRate } from '../../utils/currentUser';

export default defineEventHandler(async (event) => {
  await delay(150);
  maybeFail(failRate(event));
  return toMe(currentUser(event));
});
