<script setup lang="ts">
import { DialogContent, DialogDescription, DialogOverlay, DialogPortal, DialogRoot, DialogTitle } from 'reka-ui';

/**
 * Bottom sheet dengan swipe-to-dismiss bermomentum.
 * Keputusan dismiss memakai VELOCITY (px/ms), bukan jarak: flick pendek tapi cepat
 * harus menutup, drag panjang tapi lambat tidak. Threshold 0.11 px/ms.
 * Drag ke atas mendapat damping supaya sheet terasa punya batas fisik.
 */
const open = defineModel<boolean>('open', { required: true });

const props = withDefaults(defineProps<{
  title: string;
  description?: string;
  /** sembunyikan judul secara visual tapi tetap ada untuk screen reader */
  hideTitle?: boolean;
}>(), {});

const VELOCITY_THRESHOLD = 0.11;
const DISTANCE_FALLBACK = 0.45; // 45% tinggi sheet

const dragY = ref(0);
const dragging = ref(false);
let startY = 0;
let startedAt = 0;
let pointerId: number | null = null;

function damp(value: number) {
  // drag ke atas (negatif) ditahan progresif
  return value < 0 ? -Math.log1p(-value / 8) * 8 : value;
}

function onPointerDown(e: PointerEvent) {
  const target = e.target as HTMLElement;
  // jangan bajak scroll di dalam body sheet
  if (target.closest('[data-sheet-scroll]')) {
    const scroller = target.closest('[data-sheet-scroll]') as HTMLElement;
    if (scroller.scrollTop > 0) return;
  }
  if (target.closest('input, textarea, select, button, a')) return;
  pointerId = e.pointerId;
  startY = e.clientY;
  startedAt = performance.now();
  dragging.value = true;
}

function onPointerMove(e: PointerEvent) {
  if (!dragging.value || e.pointerId !== pointerId) return;
  dragY.value = damp(e.clientY - startY);
}

function onPointerUp(e: PointerEvent) {
  if (!dragging.value || e.pointerId !== pointerId) return;
  const elapsed = Math.max(1, performance.now() - startedAt);
  const distance = dragY.value;
  const velocity = distance / elapsed;
  const height = (e.currentTarget as HTMLElement | null)?.offsetHeight ?? 1;

  dragging.value = false;
  pointerId = null;

  if (velocity > VELOCITY_THRESHOLD || distance > height * DISTANCE_FALLBACK) {
    open.value = false;
  }
  dragY.value = 0;
}

watch(open, (v) => { if (!v) dragY.value = 0; });

const style = computed(() => ({
  transform: dragY.value ? `translate3d(0, ${dragY.value}px, 0)` : undefined,
  transition: dragging.value ? 'none' : undefined,
}));
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay class="sheet-overlay fixed inset-0 z-40 bg-black/35" />
      <DialogContent
        class="sheet glass-2 fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[92dvh] w-full
               max-w-lg flex-col rounded-t-[var(--radius-sheet)] pb-[env(safe-area-inset-bottom)]
               shadow-[var(--shadow-sheet)] focus:outline-none"
        :style="style"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
      >
        <div class="grid shrink-0 place-items-center pt-3 pb-1 touch-none">
          <span class="h-1.5 w-10 rounded-full bg-[var(--color-line-strong)]" />
        </div>

        <header class="flex shrink-0 items-start justify-between gap-3 px-5 pb-3">
          <div>
            <DialogTitle :class="hideTitle ? 'sr-only' : 'text-base font-semibold'">
              {{ title }}
            </DialogTitle>
            <DialogDescription v-if="description" class="mt-1 text-[15px] text-[var(--color-ink-soft)]">
              {{ description }}
            </DialogDescription>
          </div>
          <button
            type="button" aria-label="Tutup"
            class="close tap-target -mr-2 -mt-1 grid place-items-center rounded-full p-2 text-[var(--color-ink-soft)]"
            @click="open = false"
          >
            <BaseIcon name="close" :size="18" />
          </button>
        </header>

        <div data-sheet-scroll class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5">
          <slot />
        </div>

        <footer v-if="$slots.footer" class="shrink-0 border-t border-[var(--color-line)] px-5 py-4">
          <slot name="footer" />
        </footer>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
/* §4.3: slide, ease-drawer. Transition (bukan keyframe) supaya interupsi bisa di-retarget. */
.sheet {
  transition: transform var(--dur-sheet) var(--ease-drawer);
  will-change: transform;
}
.sheet[data-state='open'] { animation: sheet-in var(--dur-sheet) var(--ease-drawer); }
.sheet[data-state='closed'] { animation: sheet-out 220ms var(--ease-drawer); }

@keyframes sheet-in { from { transform: translate3d(0, 100%, 0); } }
@keyframes sheet-out { to { transform: translate3d(0, 100%, 0); } }

.sheet-overlay { transition: opacity 220ms var(--ease-out); }
.sheet-overlay[data-state='open'] { animation: fade-in 220ms var(--ease-out); }
.sheet-overlay[data-state='closed'] { animation: fade-out 200ms var(--ease-out); }
@keyframes fade-in { from { opacity: 0; } }
@keyframes fade-out { to { opacity: 0; } }

.close { transition: color var(--dur-pop) var(--ease-out), transform var(--dur-press) var(--ease-out); }
.close:active { transform: scale(0.97); }
</style>
