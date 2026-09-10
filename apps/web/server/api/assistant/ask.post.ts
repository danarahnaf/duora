import { uid } from '../../mocks/db';
import { AssistantAskSchema } from '@couple/contracts';
import { CHIPS, mockReply } from '../../mocks/assistant';
import { delay, maybeFail } from '../../mocks/simulate';
import { currentCouple, failRate } from '../../utils/currentUser';
import { parseBody } from '../../utils/validate';
import { nowIso } from '../../utils/clock';

/** Fase 3 menukar isi handler ini dengan SDK. Kontrak tidak berubah. */
export default defineEventHandler(async (event) => {
  await delay(1100);
  maybeFail(failRate(event));
  currentCouple(event);
  const body = parseBody(AssistantAskSchema, await readBody(event));

  return {
    id: uid(),
    kind: body.kind,
    text: mockReply(body.kind, body.prompt),
    suggestions: CHIPS[body.kind].slice(0, 3),
    isMock: true as const,
    createdAt: nowIso(),
  };
});
