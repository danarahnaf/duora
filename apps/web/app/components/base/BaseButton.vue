<script setup lang="ts">
import { NuxtLink } from '#components';
import type { IconName } from '~/utils/icons';

const props = withDefaults(defineProps<{
  variant?: 'primary' | 'ghost' | 'danger' | 'subtle' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: IconName;
  iconRight?: IconName;
  to?: string;
  type?: 'button' | 'submit';
  block?: boolean;
}>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
});

const VARIANT: Record<string, string> = {
  primary: 'bg-[var(--color-primary)] text-[var(--color-primary-ink)] border-transparent',
  subtle: 'bg-[var(--color-primary-soft)] text-[var(--color-primary)] border-transparent',
  ghost: 'bg-transparent text-[var(--color-ink)] border-[var(--color-line-strong)]',
  // Padanan .buttonStyle(.glass): hanya masuk akal di atas latar yang punya
  // sesuatu untuk dibiaskan — gradien halaman atau gambar. Di atas permukaan
  // rata, kaca tidak membiaskan apa pun dan cuma menurunkan kontras.
  glass: 'glass-2 glass-interactive relative text-[var(--color-ink)] border-transparent',
  danger: 'bg-[var(--color-danger)] text-[var(--color-danger-ink)] border-transparent',
};

const SIZE: Record<string, string> = {
  sm: 'h-9 px-3.5 text-[13px] gap-1.5',
  md: 'h-11 px-5 text-[15px] gap-2',
  lg: 'h-13 px-6 text-[15px] gap-2',
};

const isDisabled = computed(() => props.disabled || props.loading);

// Kilau spekular mengikuti pointer, hanya untuk variant glass.
const { onPointerMove, onPointerLeave } = useGlassSheen();
</script>

<template>
  <component
    :is="to ? NuxtLink : 'button'"
    :to="to"
    :type="to ? undefined : type"
    :disabled="to ? undefined : isDisabled"
    :aria-busy="loading || undefined"
    class="btn tap-target inline-flex items-center justify-center rounded-[var(--radius-pill)]
           border font-medium select-none
           disabled:opacity-50 disabled:pointer-events-none"
    :class="[VARIANT[variant], SIZE[size], block && 'w-full']"
    @pointermove="variant === 'glass' && onPointerMove($event)"
    @pointerleave="variant === 'glass' && onPointerLeave()"
  >
    <span v-if="loading" class="spinner" aria-hidden="true" />
    <BaseIcon v-else-if="icon" :name="icon" :size="size === 'sm' ? 16 : 18" />
    <span><slot /></span>
    <BaseIcon v-if="iconRight && !loading" :name="iconRight" :size="size === 'sm' ? 16 : 18" />
  </component>
</template>

<style scoped>
/* §4.4: properti eksplisit, bukan `all`. Press feedback wajib ada. */
.btn {
  transition:
    transform var(--dur-press) var(--ease-out),
    opacity var(--dur-press) var(--ease-out),
    background-color var(--dur-pop) var(--ease-out);
}
.btn:active:not(:disabled) { transform: scale(0.97); }

@media (hover: hover) and (pointer: fine) {
  .btn:hover:not(:disabled) { filter: brightness(1.04); }
}

.spinner {
  width: 1em;
  height: 1em;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 999px;
  animation: spin 620ms linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
