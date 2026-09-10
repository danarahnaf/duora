<script setup lang="ts">
definePageMeta({ middleware: 'couple-required' });
useHead({ title: 'Streak' });

const { data, status, error, refresh } = useStreak();
const coupleStore = useCoupleStore();

const year = new Date().getFullYear();
const DAY_INITIALS = ['M', 'S', 'S', 'R', 'K', 'J', 'S'];

function initial(ymd: string) {
  return DAY_INITIALS[parseLocalDate(ymd).getUTCDay()] ?? '';
}
</script>

<template>
  <div>
    <NavAppHeader title="Streak" />

    <div class="flex flex-col gap-7 px-4 py-4">
      <div v-if="status === 'pending'" class="flex flex-col gap-4">
        <BaseSkeleton variant="title" width="40%" />
        <BaseSkeleton variant="card" :count="2" />
      </div>

      <BaseErrorState v-else-if="error" :error="error" title="Streak gagal dimuat" @retry="refresh()" />

      <template v-else-if="data">
        <section class="glass-1 relative px-5 py-7 text-center">
          <div class="flex items-center justify-center gap-2 text-[var(--color-primary)]">
            <BaseIcon name="flame" :size="26" />
            <p class="text-display text-6xl leading-none">{{ data.current }}</p>
          </div>
          <p class="mt-2 text-[13px] tracking-wide text-[var(--color-ink-soft)] uppercase">hari berturut-turut</p>
          <p class="mt-3 text-[13px] text-[var(--color-ink-soft)]">Terpanjang {{ data.longest }} hari</p>
        </section>

        <section v-if="data.atRisk" class="solid-card border-[var(--color-danger)]/40 p-4">
          <p class="text-[15px] font-semibold text-[var(--color-danger)]">Streak belum aman hari ini</p>
          <p class="mt-1 text-[13px] text-[var(--color-ink-soft)]">
            Cukup satu dari dua ini untuk menjaga hitungannya.
          </p>
          <div class="mt-3 flex flex-wrap gap-2">
            <BaseButton size="sm" to="/daily">Jawab pertanyaan</BaseButton>
            <BaseButton size="sm" variant="ghost" to="/mood">Check-in mood</BaseButton>
          </div>
        </section>

        <section>
          <h2 class="mb-2.5 section-label">
            14 hari terakhir
          </h2>
          <div class="solid-card flex gap-1 p-4">
            <div v-for="d in data.last14" :key="d.localDate" class="flex flex-1 flex-col items-center gap-1.5">
              <span
                class="aspect-square w-full rounded-[var(--radius-xs)]"
                :class="d.active ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-line)]'"
                :title="`${formatDate(d.localDate)} · ${d.active ? 'aktif' : 'kosong'}`"
              />
              <span class="text-[9px] text-[var(--color-ink-soft)]">{{ initial(d.localDate) }}</span>
            </div>
          </div>
        </section>

        <section>
          <h2 class="mb-2.5 section-label">Badge</h2>
          <div class="grid grid-cols-2 gap-2">
            <div
              v-for="b in data.badges" :key="b.key"
              class="solid-card p-4 text-center"
              :class="!b.unlockedOn && 'opacity-55'"
            >
              <p class="text-2xl" aria-hidden="true">{{ b.emoji }}</p>
              <p class="mt-1.5 text-[15px] font-medium">{{ b.title }}</p>
              <p class="mt-0.5 text-[13px] text-[var(--color-ink-soft)]">
                {{ b.unlockedOn ? formatDate(b.unlockedOn) : `butuh ${b.threshold} hari` }}
              </p>
            </div>
          </div>
        </section>

        <NuxtLink :to="`/recap/${year}`" class="solid-card pressable flex items-center gap-3 p-4">
          <BaseIcon name="sparkle" :size="18" class="text-[var(--color-ink-soft)]" />
          <span class="flex-1 text-[15px]">Lihat recap {{ year }}</span>
          <BaseIcon name="chevronRight" :size="16" class="text-[var(--color-ink-soft)]" />
        </NuxtLink>
      </template>
    </div>
  </div>
</template>
