<script setup lang="ts">
import type { BillingState } from '@couple/contracts';

defineProps<{ state: BillingState }>();
</script>

<template>
  <section>
    <h1 class="text-display text-3xl leading-tight">
      Ruang kalian, tanpa batas.
    </h1>
    <p class="mt-3 max-w-md text-[15px] text-[var(--color-ink-soft)]">
      Versi gratis sudah cukup untuk memulai. Premium melepas batas memori,
      surat terkunci, dan recap tahunan.
    </p>

    <div v-if="state.limits.memoriesLimit || state.limits.lettersLimit" class="mt-6 flex flex-col gap-3">
      <div v-if="state.limits.memoriesLimit" class="solid-card p-4">
        <div class="flex items-baseline justify-between text-[13px]">
          <span>Memori</span>
          <span class="tabular-nums text-[var(--color-ink-soft)]">
            {{ state.limits.memoriesUsed }} / {{ state.limits.memoriesLimit }}
          </span>
        </div>
        <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--color-line)]">
          <div
            class="bar h-full w-full origin-left rounded-full bg-[var(--color-primary)]"
            :style="{ transform: `scaleX(${Math.min(1, state.limits.memoriesUsed / state.limits.memoriesLimit)})` }"
          />
        </div>
      </div>

      <div v-if="state.limits.lettersLimit" class="solid-card p-4">
        <div class="flex items-baseline justify-between text-[13px]">
          <span>Surat terkunci</span>
          <span class="tabular-nums text-[var(--color-ink-soft)]">
            {{ state.limits.lettersUsed }} / {{ state.limits.lettersLimit }}
          </span>
        </div>
        <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--color-line)]">
          <div
            class="bar h-full w-full origin-left rounded-full bg-[var(--color-primary)]"
            :style="{ transform: `scaleX(${Math.min(1, state.limits.lettersUsed / state.limits.lettersLimit)})` }"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* transform, bukan width: lewat GPU, tidak memicu layout (§4.4). */
.bar { transition: transform 240ms var(--ease-out); }
</style>
