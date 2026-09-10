<script setup lang="ts">
import { PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from 'reka-ui';

/**
 * Popover WAJIB tumbuh dari trigger-nya. reka-ui menyediakan
 * --reka-popover-content-transform-origin; jangan ganti jadi center (§4.4).
 */
withDefaults(defineProps<{ align?: 'start' | 'center' | 'end'; side?: 'top' | 'bottom' }>(), {
  align: 'end',
  side: 'bottom',
});
</script>

<template>
  <PopoverRoot>
    <PopoverTrigger as-child>
      <slot name="trigger" />
    </PopoverTrigger>
    <PopoverPortal>
      <PopoverContent
        :side="side" :align="align" :side-offset="8"
        class="popover glass-2 z-50 min-w-44 rounded-[var(--radius-field)] p-1.5 shadow-[var(--shadow-card)]
               focus:outline-none"
      >
        <slot />
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>

<style scoped>
.popover {
  transform-origin: var(--reka-popover-content-transform-origin);
}
.popover[data-state='open'] { animation: pop-in var(--dur-pop) var(--ease-out); }
.popover[data-state='closed'] { animation: pop-out 140ms var(--ease-out); }
@keyframes pop-in { from { opacity: 0; transform: scale(0.95); } }
@keyframes pop-out { to { opacity: 0; transform: scale(0.95); } }
</style>
