/**
 * Redirect ke /onboarding kalau belum punya couple.
 * Dipasang per-halaman: definePageMeta({ middleware: 'couple-required' })
 */
export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) return;
  const session = useSessionStore();
  if (session.isAuthenticated && !session.hasCouple) {
    return navigateTo('/onboarding/couple');
  }
});
