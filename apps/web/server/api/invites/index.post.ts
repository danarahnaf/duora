import { db, uid } from '../../mocks/db';
import { delay, maybeFail } from '../../mocks/simulate';
import { currentCouple, failRate } from '../../utils/currentUser';
import { nowIso } from '../../utils/clock';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // tanpa I, O, 0, 1

export default defineEventHandler(async (event) => {
  await delay();
  maybeFail(failRate(event));
  const { me, couple } = currentCouple(event);

  // revoke kode aktif sebelumnya — satu couple satu kode hidup
  for (const inv of db.invites) {
    if (inv.coupleId === couple.id && !inv.usedAt && !inv.revokedAt) inv.revokedAt = nowIso();
  }

  const code = `JOIN-${Array.from({ length: 5 }, () =>
    ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join('')}`;

  const invite = {
    id: uid(),
    coupleId: couple.id,
    code,
    createdById: me.id,
    expiresAt: new Date(Date.now() + 7 * 86_400_000).toISOString(),
    usedAt: null,
    usedById: null,
    revokedAt: null,
  };
  db.invites.push(invite);

  return {
    id: invite.id,
    code: invite.code,
    expiresAt: invite.expiresAt,
    usedAt: null,
    shareUrl: `https://couple.app/join/${invite.code}`,
  };
});
