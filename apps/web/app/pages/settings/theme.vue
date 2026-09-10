<script setup lang="ts">
import type { AccentKey, ThemeMode } from '~/stores/ui';

useHead({ title: 'Tampilan' });

const ui = useUiStore();

const MODES: { value: ThemeMode; label: string; icon: 'sun' | 'moon' | 'settings' }[] = [
  { value: 'system', label: 'Ikuti sistem', icon: 'settings' },
  { value: 'light', label: 'Terang', icon: 'sun' },
  { value: 'dark', label: 'Gelap', icon: 'moon' },
];

const ACCENTS: { value: AccentKey; label: string; swatch: string }[] = [
  { value: 'rose', label: 'Rose', swatch: 'oklch(0.55 0.16 15)' },
  { value: 'sunset', label: 'Sunset', swatch: 'oklch(0.62 0.17 45)' },
  { value: 'lavender', label: 'Lavender', swatch: 'oklch(0.55 0.13 300)' },
  { value: 'forest', label: 'Forest', swatch: 'oklch(0.48 0.10 155)' },
];
</script>

<template>
  <div>
    <NavAppHeader title="Tampilan" back="/settings" />

    <div class="flex flex-col gap-7 px-4 py-4">
      <section>
        <h2 class="mb-2.5 section-label">Mode</h2>
        <div class="solid-card divide-y divide-[var(--color-line)]">
          <button
            v-for="m in MODES" :key="m.value" type="button"
            class="row flex w-full items-center gap-3 p-4 text-left text-[15px]"
            @click="ui.setTheme(m.value)"
          >
            <BaseIcon :name="m.icon" :size="18" class="text-[var(--color-ink-soft)]" />
            <span class="flex-1">{{ m.label }}</span>
            <BaseIcon v-if="ui.theme === m.value" name="check" :size="18" class="text-[var(--color-primary)]" />
          </button>
        </div>
      </section>

      <section>
        <h2 class="mb-2.5 section-label">Warna aksen</h2>
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="a in ACCENTS" :key="a.value" type="button"
            class="accent pressable flex items-center gap-3 rounded-[var(--radius-card)] border p-3.5 text-left"
            :class="ui.accent === a.value ? 'border-[var(--color-primary)]' : 'border-[var(--color-line-strong)]'"
            @click="ui.setAccent(a.value)"
          >
            <span class="size-6 shrink-0 rounded-full" :style="{ background: a.swatch }" />
            <span class="flex-1 text-[15px]">{{ a.label }}</span>
            <BaseIcon v-if="ui.accent === a.value" name="check" :size="16" class="text-[var(--color-primary)]" />
          </button>
        </div>
      </section>

      <section>
        <h2 class="mb-2.5 section-label">Pratinjau</h2>
        <div class="glass-1 relative p-5">
          <p class="text-display text-3xl">847</p>
          <p class="mt-1 text-[13px] text-[var(--color-ink-soft)]">hari · sejak jadian</p>
          <div class="mt-4 flex flex-wrap items-center gap-2">
            <BaseChip tone="primary" size="sm">Romantis</BaseChip>
            <BaseChip tone="accent" size="sm">14 hari</BaseChip>
          </div>
          <BaseButton class="mt-4" size="sm">Contoh tombol</BaseButton>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.row, .accent { transition: background-color var(--dur-pop) var(--ease-out), border-color var(--dur-pop) var(--ease-out); }
</style>
