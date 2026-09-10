<script setup lang="ts">
import AnswerComposer from '~/components/daily/AnswerComposer.vue';
import QuestionCard from '~/components/daily/QuestionCard.vue';
import RevealPanel from '~/components/daily/RevealPanel.vue';
import WaitingState from '~/components/daily/WaitingState.vue';

definePageMeta({ middleware: 'couple-required' });
useHead({ title: 'Pertanyaan hari ini' });

const { today, status, error, refresh, answer } = useDailyQuestion();
const history = useDailyHistory();
const coupleStore = useCoupleStore();
const session = useSessionStore();
const { public: cfg } = useRuntimeConfig();

const sending = ref(false);
const sendError = ref<string | null>(null);
const showHistory = ref(false);

const partnerName = computed(() => coupleStore.partnerOf(session.userId)?.displayName ?? 'Partner');

async function onSubmit(body: string) {
  if (!today.value) return;
  sending.value = true;
  sendError.value = null;
  try {
    await answer(today.value.questionId, body);
  } catch (e) {
    sendError.value = apiErrorMessage(e);
  } finally {
    sending.value = false;
  }
}
</script>

<template>
  <div>
    <NavAppHeader title="Hari ini" />

    <div class="px-4 py-4">
      <div v-if="status === 'pending'" class="flex flex-col gap-4">
        <BaseSkeleton variant="title" width="35%" />
        <BaseSkeleton variant="text" :count="2" />
        <BaseSkeleton variant="card" />
      </div>

      <BaseErrorState v-else-if="error" :error="error" title="Pertanyaan gagal dimuat" @retry="refresh()" />

      <template v-else-if="today">
        <p class="mb-3 text-[13px] text-[var(--color-ink-soft)]">{{ formatDateLong(today.localDate) }}</p>

        <QuestionCard :category="today.category" :text="today.text" />

        <!-- 1. belum jawab -->
        <AnswerComposer
          v-if="!today.myAnswer"
          :loading="sending" :error="sendError"
          @submit="onSubmit"
        />

        <!-- 2. menunggu partner: server mengirim answers=null, UI tidak mengarang -->
        <WaitingState
          v-else-if="!today.revealed"
          :partner-name="partnerName" :my-answer="today.myAnswer"
        />

        <!-- 3. terbuka -->
        <RevealPanel
          v-else-if="today.answers"
          :answers="today.answers" :members="coupleStore.members"
        />

        <section class="mt-9 border-t border-[var(--color-line)] pt-5">
          <button
            type="button"
            class="flex w-full items-center justify-between text-left text-[15px] font-semibold"
            :aria-expanded="showHistory"
            @click="showHistory = !showHistory"
          >
            Riwayat pertanyaan
            <BaseIcon name="chevronDown" :size="18" :class="showHistory && 'rotate-180'" class="chev text-[var(--color-ink-soft)]" />
          </button>

          <div v-if="showHistory" class="mt-4 flex flex-col gap-3">
            <BaseSkeleton v-if="history.status.value === 'pending'" variant="card" :count="3" />
            <BaseErrorState
              v-else-if="history.error.value" :error="history.error.value"
              @retry="history.refresh()"
            />
            <BaseEmptyState
              v-else-if="!history.data.value?.items.length"
              icon="chat" title="Belum ada riwayat"
              description="Riwayat muncul setelah pertanyaan hari-hari sebelumnya terjawab."
            />
            <article
              v-for="h in history.data.value?.items ?? []" :key="h.questionId + h.localDate"
              class="solid-card p-4"
            >
              <p class="text-[13px] text-[var(--color-ink-soft)]">{{ formatDate(h.localDate) }}</p>
              <p class="mt-1 text-[15px] font-medium">{{ h.text }}</p>
              <div v-if="h.answers" class="mt-3 flex flex-col gap-2.5">
                <div v-for="a in h.answers" :key="a.authorId" class="text-[13px]">
                  <span class="font-medium">
                    {{ coupleStore.members.find(m => m.id === a.authorId)?.displayName ?? 'Anggota' }}:
                  </span>
                  <span class="text-[var(--color-ink-soft)]"> {{ a.body }}</span>
                </div>
              </div>
              <p v-else class="mt-2 text-[13px] text-[var(--color-ink-soft)]">Tidak terbuka — hanya satu yang menjawab.</p>
            </article>
          </div>
        </section>

        <p
          v-if="cfg.enableDevTools"
          class="mt-8 rounded-[var(--radius-field)] border border-dashed border-[var(--color-line-strong)] p-3 text-[13px] text-[var(--color-ink-soft)]"
        >
          Uji alur reveal dengan tombol dev di kanan bawah: jawab sebagai Danar, lalu jadi Nia dan jawab juga.
        </p>
      </template>
    </div>
  </div>
</template>

<style scoped>
.chev { transition: transform var(--dur-pop) var(--ease-out); }
</style>
