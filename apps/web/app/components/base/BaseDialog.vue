<script setup lang="ts">
import { DialogContent, DialogDescription, DialogOverlay, DialogPortal, DialogRoot, DialogTitle } from 'reka-ui';

/** Modal konfirmasi: scale dari 0.95, transform-origin TETAP center (§4.4). */
const open = defineModel<boolean>('open', { required: true });

withDefaults(defineProps<{
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'default' | 'danger';
  loading?: boolean;
}>(), {
  confirmLabel: 'Lanjutkan',
  cancelLabel: 'Batal',
  tone: 'default',
});

const emit = defineEmits<{ confirm: [] }>();
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay class="dialog-overlay fixed inset-0 z-40 bg-black/35" />
      <DialogContent
        class="dialog glass-2 fixed top-1/2 left-1/2 z-50 w-[calc(100%-2.5rem)] max-w-sm
               -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-card)] p-5
               shadow-[var(--shadow-card)] focus:outline-none"
      >
        <DialogTitle class="text-base font-semibold">
          {{ title }}
        </DialogTitle>
        <DialogDescription v-if="description" class="mt-2 text-[15px] text-[var(--color-ink-soft)]">
          {{ description }}
        </DialogDescription>

        <div v-if="$slots.default" class="mt-4">
          <slot />
        </div>

        <div class="mt-5 flex gap-2">
          <BaseButton variant="ghost" block :disabled="loading" @click="open = false">
            {{ cancelLabel }}
          </BaseButton>
          <BaseButton
            :variant="tone === 'danger' ? 'danger' : 'primary'"
            block :loading="loading"
            @click="emit('confirm')"
          >
            {{ confirmLabel }}
          </BaseButton>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
.dialog[data-state='open'] { animation: dialog-in 200ms var(--ease-out); }
.dialog[data-state='closed'] { animation: dialog-out 160ms var(--ease-out); }

/* origin center: modal tidak punya trigger spasial, beda dari popover. */
@keyframes dialog-in {
  from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
}
@keyframes dialog-out {
  to { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
}

.dialog-overlay[data-state='open'] { animation: fade-in 200ms var(--ease-out); }
.dialog-overlay[data-state='closed'] { animation: fade-out 160ms var(--ease-out); }
@keyframes fade-in { from { opacity: 0; } }
@keyframes fade-out { to { opacity: 0; } }
</style>
