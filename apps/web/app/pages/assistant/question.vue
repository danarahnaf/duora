<script setup lang="ts">
import AssistantSheet from '~/components/ai/AssistantSheet.vue';

definePageMeta({ middleware: 'couple-required' });
useHead({ title: 'Ide pertanyaan' });

const { messages, sending, chips, ask } = useAssistant('QUESTION');
const ui = useUiStore();

async function onAsk(prompt: string) {
  try {
    await ask(prompt);
  } catch (e) {
    ui.toast(apiErrorMessage(e), 'danger');
  }
}
</script>

<template>
  <div>
    <NavAppHeader title="Ide pertanyaan" back="/assistant" />

    <div class="px-4 py-4">
      <AssistantSheet
        :messages="messages" :sending="sending"
        :chips="chips?.items ?? []"
        note="Asisten ini belum terhubung ke model AI. Semua jawabannya contoh dari fixture, supaya alurnya bisa diuji lebih dulu."
        @ask="onAsk"
      >
        <template #reply-actions>
          <BaseButton size="sm" variant="ghost" to="/daily">Buka pertanyaan hari ini</BaseButton>
        </template>
      </AssistantSheet>
    </div>
  </div>
</template>
