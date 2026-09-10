<script setup lang="ts">
import AssistantSheet from '~/components/ai/AssistantSheet.vue';

definePageMeta({ middleware: 'couple-required' });
useHead({ title: 'Asisten' });

const { messages, sending, chips, ask } = useAssistant('CHAT');
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
    <NavAppHeader title="Asisten" />

    <div class="px-4 py-4">
      <AssistantSheet
        :messages="messages" :sending="sending"
        :chips="chips?.items ?? []"
        note="Asisten ini belum terhubung ke model AI. Semua jawabannya contoh dari fixture, supaya alurnya bisa diuji lebih dulu."
        @ask="onAsk"
      />

      <div class="mt-7 grid grid-cols-2 gap-2">
        <NuxtLink to="/assistant/date" class="solid-card pressable p-3.5">
          <p class="text-[15px] font-medium">Ide kencan</p>
          <p class="mt-0.5 text-[13px] text-[var(--color-ink-soft)]">Sesuai budget dan waktu</p>
        </NuxtLink>
        <NuxtLink to="/assistant/question" class="solid-card pressable p-3.5">
          <p class="text-[15px] font-medium">Ide pertanyaan</p>
          <p class="mt-0.5 text-[13px] text-[var(--color-ink-soft)]">Untuk ngobrol malam ini</p>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
