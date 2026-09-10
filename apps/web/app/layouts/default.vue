<script setup lang="ts">
/**
 * Bottom nav di mobile, sidebar di desktop. Hanya SATU layer glass di layout
 * (nav), supaya layar masih punya sisa 1 layer untuk sheet (budget §4.2).
 */
const session = useSessionStore();
const coupleStore = useCoupleStore();
const api = useApi();

// Ambil couple sekali per sesi navigasi; store dipakai lintas layar.
await useAsyncData('layout:couple', async () => {
  if (!session.token) return null;
  const couple = await api<import('@couple/contracts').Couple | null>('/couples/me').catch(() => null);
  coupleStore.set(couple);
  return couple;
}, { server: false });
</script>

<template>
  <div class="mx-auto flex w-full max-w-6xl">
    <NavSideNav />
    <div class="min-w-0 flex-1 pb-24 md:pb-8">
      <slot />
    </div>
    <NavBottomNav />
  </div>
</template>
