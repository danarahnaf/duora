<script setup lang="ts">
withDefaults(defineProps<{ loading?: boolean; error?: string | null }>(), {});
const emit = defineEmits<{ submit: [body: string] }>();

const body = ref('');
const canSubmit = computed(() => body.value.trim().length > 0 && body.value.length <= 2000);
</script>

<template>
  <form class="mt-5 flex flex-col gap-3" @submit.prevent="canSubmit && emit('submit', body.trim())">
    <BaseField
      v-model="body" type="textarea" :rows="5" :maxlength="2000" :error="error"
      placeholder="Tulis apa adanya. Tidak ada yang menilai."
    />
    <BaseButton type="submit" block :loading="loading" :disabled="!canSubmit">
      Kirim jawaban
    </BaseButton>
    <p class="text-center text-[13px] text-[var(--color-ink-soft)]">
      Jawaban pasanganmu baru terbuka setelah kalian berdua menjawab.
    </p>
  </form>
</template>
