import type { H3Event } from 'h3';
import { db } from '../mocks/db';
import { fail } from '../mocks/simulate';

/**
 * Fase 1: identitas dari header X-Dev-User (dipasang DevUserSwitcher),
 * fallback ke subject di Bearer token mock. Fase 2 diganti JwtAuthGuard.
 */
export function currentUser(event: H3Event) {
  const devUser = getHeader(event, 'x-dev-user');
  const auth = getHeader(event, 'authorization');
  const fromToken = auth?.startsWith('Bearer mock.') ? auth.slice('Bearer mock.'.length) : null;
  const id = devUser || fromToken;

  if (!id) {
    fail(401, 'UNAUTHENTICATED', 'Sesi berakhir. Masuk lagi ya.');
  }
  const user = db.users.find(u => u.id === id);
  if (!user) {
    fail(401, 'UNAUTHENTICATED', 'Sesi berakhir. Masuk lagi ya.');
  }
  return user;
}

/** Guard couple — cikal bakal CoupleMemberGuard di Fase 2 (§6.1). */
export function currentCouple(event: H3Event) {
  const me = currentUser(event);
  const membership = db.members.find(m => m.userId === me.id);
  if (!membership) {
    fail(409, 'NO_COUPLE', 'Kamu belum terhubung dengan siapa pun.');
  }
  const couple = db.couples.find(c => c.id === membership.coupleId);
  if (!couple) {
    fail(409, 'NO_COUPLE', 'Kamu belum terhubung dengan siapa pun.');
  }
  const partnerId = db.members.find(m => m.coupleId === couple.id && m.userId !== me.id)?.userId ?? null;
  return { me, couple, partnerId };
}

/** rate dari header, untuk menguji error state tanpa mengubah kode. */
export function failRate(event: H3Event): number {
  return Number(getHeader(event, 'x-mock-fail-rate') ?? 0);
}
