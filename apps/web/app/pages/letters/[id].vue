<script setup lang="ts">
import LockedLetter from '~/components/letters/LockedLetter.vue';
import UnlockReveal from '~/components/letters/UnlockReveal.vue';

definePageMeta({ middleware: 'couple-required' });

const route = useRoute();
const id = computed(() => String(route.params.id));

const { data: letter, status, error, refresh, open } = useLetter(id);
const coupleStore = useCoupleStore();
const ui = useUiStore();

useHead({ title: () => letter.value?.title ?? 'Surat' });

const today = computed(() => localDate(coupleStore.timezone));
const opening = ref(false);
/** Animasi unlock hanya untuk pembukaan pertama di sesi ini. */
const justOpened = ref(false);

const authorName = computed(() =>
  coupleStore.members.find(m => m.id === letter.value?.authorId)?.displayName ?? 'Anggota');

/**
 * Endpoint mengirim 423 dengan body null saat terkunci. Itu keadaan normal,
 * bukan error — useAsyncData menaruhnya di `error`, jadi kita baca datanya
 * dari payload error tersebut.
 */
const lockedFromError = computed(() => {
  const e = error.value as { statusCode?: number; data?: { isLocked?: boolean; unlockOn?: string; title?: string; authorId?: string; unlockType?: string; openedAt?: string | null; createdAt?: string; id?: string } } | null;
  return e?.statusCode === 423 && e.data?.unlockOn ? e.data : null;
});

const lockedLetter = computed(() => {
  if (letter.value?.isLocked) return letter.value;
  const d = lockedFromError.value;
  if (!d) return null;
  return {
    id: String(d.id ?? id.value),
    title: String(d.title ?? 'Surat terkunci'),
    authorId: String(d.authorId ?? ''),
    unlockType: (d.unlockType ?? 'DATE') as 'DATE' | 'ANNIVERSARY' | 'BIRTHDAY' | 'CUSTOM',
    unlockOn: String(d.unlockOn),
    isLocked: true,
    openedAt: d.openedAt ?? null,
    createdAt: String(d.createdAt ?? new Date().toISOString()),
  };
});

const wasOpenedBefore = computed(() => Boolean(letter.value?.openedAt));

async function onOpen() {
  opening.value = true;
  try {
    await open();
    justOpened.value = true;
  } catch (e) {
    ui.toast(apiErrorMessage(e, 'Surat belum bisa dibuka.'), 'danger');
  } finally {
    opening.value = false;
  }
}
</script>

<template>
  <div>
    <NavAppHeader title="Surat" back="/letters" />

    <div class="px-4 py-4">
      <div v-if="status === 'pending'" class="flex flex-col gap-3">
        <BaseSkeleton variant="title" />
        <BaseSkeleton variant="text" :count="5" />
      </div>

      <LockedLetter
        v-else-if="lockedLetter"
        :letter="lockedLetter" :today-ymd="today"
        :author-name="coupleStore.members.find(m => m.id === lockedLetter!.authorId)?.displayName ?? 'Pasanganmu'"
      />

      <BaseErrorState v-else-if="error" :error="error" title="Surat gagal dimuat" @retry="refresh()" />

      <article v-else-if="letter">
        <p class="text-[13px] text-[var(--color-ink-soft)]">
          Dari {{ authorName }} · disegel {{ formatDate(letter.createdAt.slice(0, 10)) }}
        </p>
        <h1 class="text-display mt-2 text-2xl">{{ letter.title }}</h1>

        <div v-if="letter.body" class="mt-6">
          <UnlockReveal :body="letter.body" :animate="justOpened" />
          <p v-if="letter.openedAt" class="mt-6 text-[13px] text-[var(--color-ink-soft)]">
            Dibuka {{ relativeTime(letter.openedAt) }}
          </p>
        </div>

        <div v-else class="mt-8 grid place-items-center text-center">
          <span class="grid size-16 place-items-center rounded-[var(--radius-card)] bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
            <BaseIcon name="unlock" :size="28" />
          </span>
          <p class="mt-4 text-[15px]">Waktunya sudah tiba.</p>
          <BaseButton class="mt-4" :loading="opening" @click="onOpen">Buka surat</BaseButton>
          <p v-if="wasOpenedBefore" class="mt-2 text-[13px] text-[var(--color-ink-soft)]">
            Surat ini pernah dibuka sebelumnya.
          </p>
        </div>
      </article>
    </div>
  </div>
</template>
