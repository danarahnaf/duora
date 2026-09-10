import { RedeemInviteSchema } from '@couple/contracts';
import { db } from '../../mocks/db';
import { toCouple } from '../../mocks/map';
import { delay, fail, maybeFail } from '../../mocks/simulate';
import { currentUser, failRate } from '../../utils/currentUser';
import { parseBody } from '../../utils/validate';
import { nowIso } from '../../utils/clock';

/**
 * Empat kondisi yang wajib bisa diuji di Fase 1 (§7):
 * valid, expired, sudah dipakai, couple penuh.
 * Kode uji: JOIN-8F4K2 (valid) · JOIN-EXPRD (expired) · JOIN-USED1 (dipakai)
 */
export default defineEventHandler(async (event) => {
  await delay();
  maybeFail(failRate(event));
  const me = currentUser(event);
  const { code } = parseBody(RedeemInviteSchema, await readBody(event));

  if (db.members.some(m => m.userId === me.id)) {
    fail(409, 'ALREADY_IN_COUPLE', 'Kamu sudah terhubung dengan seseorang.');
  }

  const invite = db.invites.find(i => i.code === code && !i.revokedAt);
  if (!invite) fail(404, 'INVITE_INVALID', 'Kode ini tidak ditemukan.');
  if (invite.usedAt) fail(409, 'INVITE_USED', 'Kode ini sudah dipakai.');
  if (new Date(invite.expiresAt) < new Date()) fail(410, 'INVITE_EXPIRED', 'Kode ini sudah kedaluwarsa.');

  const couple = db.couples.find(c => c.id === invite.coupleId);
  if (!couple) fail(404, 'INVITE_INVALID', 'Kode ini tidak ditemukan.');

  const count = db.members.filter(m => m.coupleId === couple.id).length;
  if (count >= 2) fail(409, 'COUPLE_FULL', 'Couple ini sudah lengkap.');

  db.members.push({ coupleId: couple.id, userId: me.id, role: 'MEMBER', joinedAt: nowIso() });
  invite.usedAt = nowIso();
  invite.usedById = me.id;

  return toCouple(couple);
});
