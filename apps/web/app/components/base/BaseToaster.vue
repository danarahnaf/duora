<script setup lang="ts">
/** Toast: enter & exit dari arah yang sama, transition (bukan keyframe). §4.3 */
const ui = useUiStore();
</script>

<template>
  <div
    class="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4"
    role="status" aria-live="polite"
  >
    <TransitionGroup name="toast">
      <div
        v-for="t in ui.toasts" :key="t.id"
        class="pointer-events-auto flex max-w-sm items-center gap-2 rounded-[var(--radius-pill)]
               px-4 py-2.5 text-[13px] shadow-[var(--shadow-card)]"
        :class="{
          'bg-[var(--color-ink)] text-[var(--color-bg)]': t.tone === 'default',
          'bg-[var(--color-success)] text-white': t.tone === 'success',
          'bg-[var(--color-danger)] text-[var(--color-danger-ink)]': t.tone === 'danger',
        }"
      >
        <BaseIcon v-if="t.tone === 'success'" name="check" :size="16" />
        <span>{{ t.message }}</span>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: opacity 200ms var(--ease-out), transform 200ms var(--ease-out);
}
/* arah masuk dan keluar sama: dari bawah */
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
.toast-move { transition: transform 200ms var(--ease-out); }
</style>
