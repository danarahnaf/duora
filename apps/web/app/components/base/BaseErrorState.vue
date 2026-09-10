<script setup lang="ts">
/** Error state dengan retry — wajib ada di setiap layar (§7). */
const props = defineProps<{
  error?: unknown;
  title?: string;
}>();

const emit = defineEmits<{ retry: [] }>();
const message = computed(() => apiErrorMessage(props.error));
</script>

<template>
  <div class="grid place-items-center px-6 py-10 text-center">
    <div
      class="grid size-14 place-items-center rounded-[var(--radius-card)] bg-[var(--color-danger)]/12 text-[var(--color-danger)]"
      aria-hidden="true"
    >
      <BaseIcon name="refresh" :size="24" />
    </div>
    <h3 class="mt-4 text-[15px] font-semibold">
      {{ title ?? 'Gagal memuat' }}
    </h3>
    <p class="mt-1.5 max-w-xs text-[15px] text-[var(--color-ink-soft)]">
      {{ message }}
    </p>
    <BaseButton class="mt-5" size="sm" variant="ghost" icon="refresh" @click="emit('retry')">
      Coba lagi
    </BaseButton>
  </div>
</template>
