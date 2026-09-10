<script setup lang="ts">
import AssistantSheet from '~/components/ai/AssistantSheet.vue';

definePageMeta({ middleware: 'couple-required' });
useHead({ title: 'Ide kencan' });

const { messages, sending, chips, ask } = useAssistant('DATE_IDEA');
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
    <NavAppHeader title="Ide kencan" back="/assistant" />

    <div class="px-4 py-4">
      <AssistantSheet
        :messages="messages" :sending="sending"
        :chips="chips?.items ?? []"
        note="Asisten ini belum terhubung ke model AI. Semua jawabannya contoh dari fixture, supaya alurnya bisa diuji lebih dulu."
        @ask="onAsk"
      >
        <template #reply-actions>
          <BaseButton size="sm" variant="ghost" to="/dates/planner">Buka planner</BaseButton>
        </template>
      </AssistantSheet>

      <p class="mt-6 text-[13px] text-[var(--color-ink-soft)]">
        Untuk jadwal dengan jam dan biaya yang bisa disimpan ke kalender, pakai
        <NuxtLink to="/dates/planner" class="text-[var(--color-primary)]">planner</NuxtLink>.
      </p>
    </div>
  </div>
</template>
