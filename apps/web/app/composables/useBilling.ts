import { BILLING_PATHS, type BillingState } from '@couple/contracts';

/** Fase 1: tanpa payment gateway. Paywall hanya UI + state dari fixture. */
export function useBilling() {
  const api = useApi();
  return useAsyncData('billing', () => api<BillingState>(BILLING_PATHS.state), { server: false });
}
