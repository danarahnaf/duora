import { AssistantKindSchema } from '@couple/contracts';
import { CHIPS } from '../../mocks/assistant';
import { delay } from '../../mocks/simulate';
import { currentCouple } from '../../utils/currentUser';

export default defineEventHandler(async (event) => {
  await delay(180);
  currentCouple(event);
  const kind = AssistantKindSchema.catch('CHAT').parse((getQuery(event) as { kind?: string }).kind);
  return { items: CHIPS[kind] };
});
