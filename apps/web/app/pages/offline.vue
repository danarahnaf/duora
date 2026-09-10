<script setup lang="ts">
definePageMeta({ layout: false });
useHead({ title: 'Sedang offline' });
</script>

<template>
  <div class="grid min-h-dvh place-items-center px-6 text-center">
    <div class="max-w-sm">
      <span class="mx-auto grid size-16 place-items-center rounded-[var(--radius-card)] bg-[var(--color-line)] text-[var(--color-ink-soft)]">
        <BaseIcon name="refresh" :size="28" />
      </span>
      <h1 class="text-display mt-4 text-2xl">Sedang offline</h1>
      <p class="mt-2 text-[15px] text-[var(--color-ink-soft)]">
        Koneksi terputus. Halaman yang sudah pernah dibuka tetap bisa dilihat,
        tapi data baru menunggu koneksi kembali.
      </p>
      <BaseButton class="mt-6" block @click="$router.go(0)">Coba lagi</BaseButton>
    </div>
  </div>
</template>
