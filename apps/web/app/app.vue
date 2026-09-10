<script setup lang="ts">
const ui = useUiStore();
const session = useSessionStore();

// Hydrate sekali di client. Tidak di server: localStorage tidak ada di sana.
onMounted(() => {
  session.hydrate();
  ui.hydrate();
});

useHead({
  titleTemplate: (title) => (title ? `${title} · Couple` : 'Couple'),
});
</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <BaseToaster />
    <DevUserSwitcher />
  </div>
</template>
