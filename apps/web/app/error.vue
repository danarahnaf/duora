<script setup lang="ts">
import type { NuxtError } from '#app';

const props = defineProps<{ error: NuxtError }>();
const is404 = computed(() => props.error.statusCode === 404);
</script>

<template>
  <div class="grid min-h-dvh place-items-center px-6">
    <div class="w-full max-w-sm text-center">
      <p class="text-display text-6xl text-[var(--color-primary)]">
        {{ error.statusCode }}
      </p>
      <h1 class="mt-3 text-lg font-semibold">
        {{ is404 ? 'Halaman tidak ditemukan' : 'Ada yang salah' }}
      </h1>
      <p class="mt-2 text-[15px] text-[var(--color-ink-soft)]">
        {{ is404 ? 'Tautannya mungkin sudah berubah.' : error.message || 'Coba beberapa saat lagi.' }}
      </p>
      <BaseButton class="mt-6 w-full" @click="clearError({ redirect: '/home' })">
        Kembali ke Home
      </BaseButton>
    </div>
  </div>
</template>
