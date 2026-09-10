<script setup lang="ts">
definePageMeta({ middleware: 'couple-required' });

const route = useRoute();
const year = computed(() => String(route.params.year));

const { data, status, error, refresh } = useRecap(year);
const coupleStore = useCoupleStore();

useHead({ title: () => `Recap ${year.value}` });

const currentYear = new Date().getFullYear();
const firstYear = computed(() => Number(coupleStore.couple?.relationshipDate.slice(0, 4) ?? currentYear));
const canPrev = computed(() => Number(year.value) - 1 >= firstYear.value);
const canNext = computed(() => Number(year.value) + 1 <= currentYear);

/**
 * Recap dilihat sekali setahun, jadi stagger panjang diizinkan (§4.3) —
 * tapi tujuh entrance identik bukan "satu momen", itu tujuh momen kembar.
 * Judul tahun memegang momennya sendiri; sisi lain masuk sebagai kelompok.
 */
function delay(group: number) {
  return { animationDelay: `${240 + group * 140}ms` };
}

const stats = computed(() => {
  const d = data.value;
  if (!d) return [];
  return [
    { label: 'Memori', value: formatNumber(d.memories) },
    { label: 'Kencan', value: formatNumber(d.dates) },
    { label: 'Pertanyaan terjawab', value: formatNumber(d.questionsAnswered) },
    { label: 'Catatan jurnal', value: formatNumber(d.journalEntries) },
    { label: 'Streak terpanjang', value: `${d.longestStreak} hari` },
  ];
});

const topMood = computed(() => {
  const level = data.value?.topMoodLevel;
  if (!level) return null;
  return MOOD_META[level as keyof typeof MOOD_META] ?? null;
});
</script>

<template>
  <div>
    <NavAppHeader :title="`Recap ${year}`" back="/streak">
      <template #actions>
        <NuxtLink
          v-if="canPrev" :to="`/recap/${Number(year) - 1}`" class="tap-target grid place-items-center rounded-full p-2"
          aria-label="Tahun sebelumnya"
        ><BaseIcon name="chevronLeft" :size="18" /></NuxtLink>
        <NuxtLink
          v-if="canNext" :to="`/recap/${Number(year) + 1}`" class="tap-target grid place-items-center rounded-full p-2"
          aria-label="Tahun berikutnya"
        ><BaseIcon name="chevronRight" :size="18" /></NuxtLink>
      </template>
    </NavAppHeader>

    <div class="px-4 py-4">
      <div v-if="status === 'pending'" class="flex flex-col gap-4">
        <BaseSkeleton variant="title" width="50%" />
        <BaseSkeleton variant="card" :count="3" />
      </div>

      <BaseErrorState v-else-if="error" :error="error" title="Recap gagal dimuat" @retry="refresh()" />

      <div v-else-if="data" class="flex flex-col gap-6">
        <section class="recap-open">
          <p class="text-display text-5xl">{{ data.year }}</p>
          <p class="mt-1 text-[15px] text-[var(--color-ink-soft)]">kalian</p>
        </section>

        <section class="recap-rise grid grid-cols-2 gap-2" :style="delay(0)">
          <div v-for="s in stats" :key="s.label" class="solid-card p-4">
            <p class="text-display text-2xl">{{ s.value }}</p>
            <p class="mt-1 text-[13px] text-[var(--color-ink-soft)]">{{ s.label }}</p>
          </div>
        </section>

        <section v-if="data.topLocation" class="recap-rise solid-card p-4" :style="delay(1)">
          <p class="text-[13px] text-[var(--color-ink-soft)]">Tempat paling sering</p>
          <p class="text-display mt-1 text-xl">{{ data.topLocation }}</p>
        </section>

        <section v-if="topMood" class="recap-rise solid-card flex items-center gap-4 p-4" :style="delay(1)">
          <span class="text-3xl" aria-hidden="true">{{ topMood.emoji }}</span>
          <div>
            <p class="text-[13px] text-[var(--color-ink-soft)]">Mood paling sering</p>
            <p class="text-[15px] font-medium">{{ topMood.label }}</p>
          </div>
        </section>

        <section class="recap-rise solid-card p-4" :style="delay(1)">
          <p class="text-[13px] text-[var(--color-ink-soft)]">Total tercatat di kalender</p>
          <p class="text-display mt-1 text-2xl">{{ formatIdr(data.totalSpentIdr) }}</p>
        </section>

        <section class="recap-rise" :style="delay(2)">
          <h2 class="mb-2.5 section-label">Lainnya</h2>
          <div class="solid-card divide-y divide-[var(--color-line)]">
            <div v-for="h in data.highlights" :key="h.label" class="flex items-center justify-between p-4 text-[15px]">
              <span class="text-[var(--color-ink-soft)]">{{ h.label }}</span>
              <span class="font-medium">{{ h.value }}</span>
            </div>
          </div>
        </section>

        <p class="recap-rise text-center text-[13px] text-[var(--color-ink-soft)]" :style="delay(2)">
          Angka di atas dihitung dari yang tercatat di aplikasi ini saja.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Satu momen yang diarang: angka tahun tumbuh dari blur, sekali. */
.recap-open {
  animation: recap-open 900ms var(--ease-out) both;
}
@keyframes recap-open {
  from { opacity: 0; filter: blur(10px); transform: scale(0.96); }
  to   { opacity: 1; filter: blur(0);    transform: scale(1); }
}
</style>
