import { db } from '../../mocks/db';
import { delay } from '../../mocks/simulate';
import { currentCouple } from '../../utils/currentUser';

export default defineEventHandler(async (event) => {
  await delay(160);
  const { couple } = currentCouple(event);
  const invite = db.invites.find(i =>
    i.coupleId === couple.id && !i.usedAt && !i.revokedAt && new Date(i.expiresAt) > new Date());
  if (!invite) return null;

  return {
    id: invite.id,
    code: invite.code,
    expiresAt: invite.expiresAt,
    usedAt: null,
    shareUrl: `https://couple.app/join/${invite.code}`,
  };
});
