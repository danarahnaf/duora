/**
 * Redirect ke /login kalau belum ada session.
 * Hanya jalan di client: session Fase 1 tersimpan di localStorage.
 */
const PUBLIC_ROUTES = ['/', '/login', '/register', '/forgot', '/offline', '/premium'];

export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return;

  const session = useSessionStore();
  if (!session.token) session.hydrate();

  const isPublic = PUBLIC_ROUTES.includes(to.path);

  if (!session.isAuthenticated && !isPublic) {
    return navigateTo({ path: '/login', query: { next: to.fullPath } });
  }

  // Sudah login tapi membuka layar auth → lempar ke tempat yang benar.
  if (session.isAuthenticated && ['/login', '/register', '/forgot'].includes(to.path)) {
    return navigateTo(session.hasCouple ? '/home' : '/onboarding/couple');
  }
});
