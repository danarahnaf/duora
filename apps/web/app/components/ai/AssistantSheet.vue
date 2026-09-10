<script setup lang="ts">
import MockResponse from '~/components/ai/MockResponse.vue';
import PromptChips from '~/components/ai/PromptChips.vue';

defineProps<{
  messages: { role: 'me' | 'assistant'; text: string; id: string }[];
  sending: boolean;
  chips: string[];
  note: string;
}>();
const emit = defineEmits<{ ask: [prompt: string] }>();

const draft = ref('');

function send(prompt?: string) {
  const text = (prompt ?? draft.value).trim();
  if (!text) return;
  draft.value = '';
  emit('ask', text);
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <p class="rounded-[var(--radius-field)] border border-dashed border-[var(--color-line-strong)] p-3 text-[13px] text-[var(--color-ink-soft)]">
      {{ note }}
    </p>

    <PromptChips :items="chips" :disabled="sending" @pick="send" />

    <div v-if="messages.length" class="flex flex-col gap-3">
      <template v-for="m in messages" :key="m.id">
        <div v-if="m.role === 'me'" class="flex justify-end">
          <p class="max-w-[85%] rounded-[var(--radius-card)] bg-[var(--color-primary)] px-4 py-2.5 text-[15px] text-[var(--color-primary-ink)]">
            {{ m.text }}
          </p>
        </div>
        <MockResponse v-else :text="m.text">
          <template #actions><slot name="reply-actions" :text="m.text" /></template>
        </MockResponse>
      </template>
    </div>

    <div v-if="sending" class="flex items-center gap-2 text-[13px] text-[var(--color-ink-soft)]">
      <span class="typing size-1.5 rounded-full bg-[var(--color-ink-soft)]" />
      <span class="typing size-1.5 rounded-full bg-[var(--color-ink-soft)]" style="animation-delay: 140ms" />
      <span class="typing size-1.5 rounded-full bg-[var(--color-ink-soft)]" style="animation-delay: 280ms" />
      <span class="ml-1">menyusun jawaban</span>
    </div>

    <form class="flex items-end gap-2" @submit.prevent="send()">
      <div class="flex-1">
        <BaseField v-model="draft" type="textarea" :rows="2" :maxlength="1000" placeholder="Tulis pertanyaanmu" />
      </div>
      <BaseButton type="submit" :loading="sending" :disabled="!draft.trim()" icon="arrowRight">
        <span class="sr-only">Kirim</span>
      </BaseButton>
    </form>
  </div>
</template>

<style scoped>
.typing { animation: typing 900ms var(--ease-in-out) infinite; }
@keyframes typing {
  0%, 100% { opacity: 0.35; }
  50% { opacity: 1; }
}
</style>
