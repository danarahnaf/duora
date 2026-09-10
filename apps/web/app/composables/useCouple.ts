import {
  COUPLES_PATHS, INVITES_PATHS,
  type Couple, type CreateCouple, type Invite,
} from '@couple/contracts';

export function useCouple() {
  const api = useApi();
  const store = useCoupleStore();
  const session = useSessionStore();

  const state = useAsyncData<Couple | null>('couple:me', async () => {
    const res = await api<Couple | null>(COUPLES_PATHS.me);
    store.set(res);
    return res;
  }, { server: false, default: () => null });

  async function create(body: CreateCouple) {
    const res = await api<Couple>(COUPLES_PATHS.create, { method: 'POST', body });
    store.set(res);
    if (session.user) session.setUser({ ...session.user, hasCouple: true });
    return res;
  }

  async function update(body: Partial<CreateCouple> & { theme?: string }) {
    const res = await api<Couple>(COUPLES_PATHS.me, { method: 'PATCH', body });
    store.set(res);
    return res;
  }

  async function leave() {
    await api(COUPLES_PATHS.leave, { method: 'POST' });
    store.set(null);
    if (session.user) session.setUser({ ...session.user, hasCouple: false });
  }

  async function createInvite() {
    return api<Invite>(INVITES_PATHS.create, { method: 'POST' });
  }

  async function activeInvite() {
    return api<Invite | null>(INVITES_PATHS.active);
  }

  async function revokeInvite(id: string) {
    return api(INVITES_PATHS.byId(id), { method: 'DELETE' });
  }

  /** Melempar error dengan code: INVITE_INVALID | INVITE_EXPIRED | INVITE_USED | COUPLE_FULL */
  async function redeemInvite(code: string) {
    const res = await api<Couple>(INVITES_PATHS.redeem, { method: 'POST', body: { code } });
    store.set(res);
    if (session.user) session.setUser({ ...session.user, hasCouple: true });
    return res;
  }

  const partner = computed(() => store.partnerOf(session.userId));

  return { ...state, couple: state.data, partner, create, update, leave, createInvite, activeInvite, revokeInvite, redeemInvite };
}
