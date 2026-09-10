<script setup lang="ts">
const props = defineProps<{ text: string }>();
const ui = useUiStore();

async function copy() {
  try {
    await navigator.clipboard.writeText(props.text);
    ui.toast('Disalin', 'success');
  } catch {
    ui.toast('Tidak bisa menyalin otomatis', 'danger');
  }
}
</script>

<template>
  <div class="solid-card p-4">
    <div class="flex items-center gap-2">
      <BaseChip size="sm">contoh</BaseChip>
      <span class="text-[11px] text-[var(--color-ink-soft)]">bukan jawaban dari model AI</span>
    </div>
    <p class="prose-measure mt-3 text-[15px] leading-relaxed whitespace-pre-line">{{ text }}</p>
    <div class="mt-3 flex gap-2">
      <BaseButton size="sm" variant="ghost" icon="copy" @click="copy">Salin</BaseButton>
      <slot name="actions" />
    </div>
  </div>
</template>
