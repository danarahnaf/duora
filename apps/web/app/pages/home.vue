<script setup lang="ts">
import CoupleHeader from '~/components/couple/CoupleHeader.vue';
import QuestionCard from '~/components/daily/QuestionCard.vue';
import RelationshipCounter from '~/components/couple/RelationshipCounter.vue';
import StreakBadge from '~/components/couple/StreakBadge.vue';

definePageMeta({ middleware: 'couple-required' });
useHead({ title: 'Home' });

const coupleStore = useCoupleStore();
const session = useSessionStore();

const daily = useDailyQuestion();
const streak = useStreak();
const upcoming = useUpcomingEvents();
const memories = useMemories();
const mood = useMood();
const { unreadCount } = useNotifications();

const couple = computed(() => coupleStore.couple);
const partnerName = computed(() => coupleStore.partnerOf(session.userId)?.displayName ?? 'Partner');
const isMilestone = computed(() => {
  const d = couple.value?.daysTogether ?? 0;
  return d > 0 && d % 100 === 0;
});

/**
 * Aset paling kuat di aplikasi ini adalah foto mereka sendiri, jadi foto
 * terbaru menjadi latar hero — bukan thumbnail 36px di dasar halaman.
 * Kalau belum ada foto, hero jatuh ke gradien dan seluruh teks kembali
 * memakai warna tinta biasa.
 */
const heroPhoto = computed(() =>
  memories.items.value.find(m => m.media.length > 0)?.media[0] ?? null);
const heroTone = computed<'ink' | 'on-image'>(() => (heroPhoto.value ? 'on-image' : 'ink'));

/** Sisa memori untuk strip; yang sudah jadi latar hero tidak diulang. */
const strip = computed(() => {
  const items = memories.items.value;
  const heroId = items.find(m => m.media.length > 0)?.id;
  return items.filter(m => m.id !== heroId).slice(0, 8);
});

const nextEvent = computed(() => upcoming.data.value?.items[0] ?? null);
const today = computed(() => localDate(coupleStore.timezone));
</script>

<template>
  <div class="pb-2">
    <!--
      HERO. Tanpa kaca: §4.2 melarang kaca pada elemen yang ikut scroll, dan
      backdrop-filter di atas foto sambil di-scroll adalah kasus termahalnya.
      Foto + scrim memberi kedalaman tanpa biaya itu.
    -->
    <section class="relative isolate overflow-hidden rounded-b-[var(--radius-card)]">
      <div class="relative h-[330px] sm:h-[380px]">
        <img
          v-if="heroPhoto"
          :src="heroPhoto.url" alt="" class="absolute inset-0 size-full object-cover"
          width="800" height="600" fetchpriority="high" decoding="async"
        >
        <div
          v-else
          class="absolute inset-0"
          style="background:
            radial-gradient(70% 60% at 20% 10%, var(--color-primary-soft), transparent 70%),
            linear-gradient(160deg, var(--color-bg), var(--color-bg-deep))"
        />
        <!-- Scrim: teks di atas foto harus tetap ≥4.5:1 apa pun fotonya. -->
        <div
          v-if="heroPhoto"
          class="absolute inset-0"
          style="background: linear-gradient(180deg, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.08) 38%, rgba(0,0,0,0.62) 100%)"
        />

        <div class="relative flex h-full flex-col justify-between p-4">
          <div class="flex items-start justify-between gap-3">
            <CoupleHeader v-if="couple" :couple="couple" :tone="heroTone" />
            <div v-else class="flex items-center gap-3">
              <BaseSkeleton variant="avatar" />
            </div>

            <NuxtLink
              to="/notifications" aria-label="Notifikasi"
              class="relative tap-target grid place-items-center rounded-full p-2"
              :class="heroPhoto ? 'bg-black/25 text-white backdrop-blur-[6px]' : 'text-[var(--color-ink)]'"
            >
              <BaseIcon name="bell" :size="19" />
              <span
                v-if="unreadCount > 0"
                class="absolute top-1 right-1 size-2 rounded-full bg-[var(--color-primary)]"
              />
            </NuxtLink>
          </div>

          <div class="flex flex-col items-center gap-3 pb-11">
            <RelationshipCounter
              v-if="couple"
              :days="couple.daysTogether" :label="couple.relationshipDateLabel"
              :milestone="isMilestone" :tone="heroTone"
            />
            <BaseSkeleton v-else variant="title" width="55%" />

            <StreakBadge
              v-if="streak.data.value"
              :count="streak.data.value.current" :at-risk="streak.data.value.atRisk"
              :tone="heroTone"
            />
          </div>
        </div>
      </div>
    </section>

    <!--
      Pertanyaan harian adalah ritual utama produk ini, jadi ia blok terbesar
      dan satu-satunya yang naik menimpa hero. Tanpa label seksi: kartunya
      sudah menyebut kategorinya sendiri.
    -->
    <section class="relative z-10 -mt-7 px-4">
      <BaseSkeleton v-if="daily.status.value === 'pending'" variant="card" />
      <BaseErrorState v-else-if="daily.error.value" :error="daily.error.value" @retry="daily.refresh()" />

      <NuxtLink
        v-else-if="daily.today.value" to="/daily"
        class="solid-card-raised pressable block p-5"
      >
        <QuestionCard :category="daily.today.value.category" :text="daily.today.value.text" />

        <p v-if="!daily.today.value.myAnswer" class="mt-4 text-[15px] font-medium text-[var(--color-primary)]">
          Jawab sekarang →
        </p>
        <p v-else-if="!daily.today.value.revealed" class="mt-4 flex items-center gap-1.5 text-[13px] text-[var(--color-ink-soft)]">
          <BaseIcon name="clock" :size="14" />{{ partnerName }} belum menjawab
        </p>
        <p v-else class="mt-4 flex items-center gap-1.5 text-[13px] text-[var(--color-success)]">
          <BaseIcon name="check" :size="14" />Jawaban kalian sudah terbuka
        </p>
      </NuxtLink>
    </section>

    <!-- Acara & mood dipadatkan berdampingan: dua kabar singkat, bukan dua seksi. -->
    <section class="mt-4 grid grid-cols-2 gap-3 px-4">
      <NuxtLink
        v-if="nextEvent" :to="`/calendar/${nextEvent.id}`"
        class="solid-card pressable flex flex-col justify-between gap-2 p-3.5"
      >
        <span class="flex items-center gap-1.5 text-[11px] text-[var(--color-ink-soft)]">
          <BaseIcon name="calendar" :size="13" />{{ relativeDate(nextEvent.date, today) }}
        </span>
        <span>
          <span class="block truncate text-[15px] font-medium">{{ nextEvent.title }}</span>
          <span class="mt-0.5 block truncate text-[11px] text-[var(--color-ink-soft)]">
            <template v-if="nextEvent.time">{{ nextEvent.time }} · </template>{{ nextEvent.location ?? 'tanpa lokasi' }}
          </span>
        </span>
      </NuxtLink>
      <NuxtLink
        v-else to="/calendar/new"
        class="solid-card pressable flex flex-col justify-between gap-2 p-3.5"
      >
        <span class="flex items-center gap-1.5 text-[11px] text-[var(--color-ink-soft)]">
          <BaseIcon name="calendar" :size="13" />Kalender
        </span>
        <span class="block text-[15px] font-medium">Belum ada rencana</span>
      </NuxtLink>

      <NuxtLink
        :to="mood.today.value?.mine ? '/mood/partner' : '/mood'"
        class="solid-card pressable flex flex-col justify-between gap-2 p-3.5"
      >
        <span class="flex items-center gap-1.5 text-[11px] text-[var(--color-ink-soft)]">
          <BaseIcon name="smile" :size="13" />Mood
        </span>
        <span class="flex items-center gap-2">
          <span
            v-if="mood.today.value?.mine && mood.today.value.partner"
            class="text-xl" aria-hidden="true"
          >{{ MOOD_META[mood.today.value.partner.level].emoji }}</span>
          <span class="block min-w-0 truncate text-[15px] font-medium">
            {{ !mood.today.value?.mine
              ? 'Check-in yuk'
              : mood.today.value.partner
                ? MOOD_META[mood.today.value.partner.level].label
                : `${partnerName} belum` }}
          </span>
        </span>
      </NuxtLink>
    </section>

    <!-- Memori: thumbnail cukup besar untuk dikenali, bukan sekadar petak warna. -->
    <section class="mt-7">
      <div class="mb-2.5 flex items-baseline justify-between px-4">
        <h2 class="section-label">Memori terbaru</h2>
        <NuxtLink to="/memories" class="text-[13px] font-medium text-[var(--color-primary)]">Semua</NuxtLink>
      </div>

      <div v-if="memories.status.value === 'pending'" class="flex gap-3 px-4">
        <BaseSkeleton v-for="i in 3" :key="i" variant="thumb" class="w-40 shrink-0" />
      </div>

      <div v-else-if="strip.length" class="scrollbar-none flex snap-x gap-3 overflow-x-auto px-4 pb-1">
        <NuxtLink
          v-for="m in strip" :key="m.id" :to="`/memories/${m.id}`"
          class="solid-card pressable w-40 shrink-0 snap-start overflow-hidden"
        >
          <span class="block aspect-4/3 bg-[var(--color-line)]">
            <img
              v-if="m.media[0]" :src="m.media[0].url" alt=""
              class="size-full object-cover" loading="lazy" decoding="async"
              width="800" height="600"
            >
          </span>
          <span class="block p-2.5">
            <span class="block text-[11px] text-[var(--color-ink-soft)]">{{ formatDate(m.happenedAt) }}</span>
            <span v-if="m.caption" class="mt-0.5 block truncate text-[13px]">{{ truncate(m.caption, 32) }}</span>
          </span>
        </NuxtLink>
      </div>

      <div v-else class="px-4">
        <BaseEmptyState
          icon="image" title="Belum ada memori"
          description="Satu foto pun sudah cukup untuk mulai."
          action-label="Tambah memori" action-to="/memories/new"
        />
      </div>
    </section>
  </div>
</template>
