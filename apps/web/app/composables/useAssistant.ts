import { ASSISTANT_PATHS, type AssistantKind, type AssistantReply } from '@couple/contracts';

/**
 * Fase 1: semua respons dari fixture di mock server. Tidak ada SDK AI.
 * UI wajib menampilkan label "contoh" karena `isMock: true`.
 */
export function useAssistant(kind: AssistantKind = 'CHAT') {
  const api = useApi();
  const messages = ref<{ role: 'me' | 'assistant'; text: string; id: string }[]>([]);
  const sending = ref(false);
  const error = ref<unknown>(null);

  const chips = useAsyncData(`assistant:chips:${kind}`, () =>
    api<{ items: string[] }>(ASSISTANT_PATHS.chips, { query: { kind } }), { server: false });

  async function ask(prompt: string) {
    sending.value = true;
    error.value = null;
    messages.value.push({ role: 'me', text: prompt, id: `me-${Date.now()}` });
    try {
      const res = await api<AssistantReply>(ASSISTANT_PATHS.ask, {
        method: 'POST',
        body: { kind, prompt },
      });
      messages.value.push({ role: 'assistant', text: res.text, id: res.id });
      return res;
    } catch (e) {
      error.value = e;
      throw e;
    } finally {
      sending.value = false;
    }
  }

  return { messages, sending, error, chips: chips.data, ask };
}
