<script setup lang="ts">
definePageMeta({ middleware: 'couple-required' });
useHead({ title: 'Surat' });

const { items, lockedItems, openedItems, status, error, refresh } = useLetters();
const coupleStore = useCoupleStore();
const today = computed(() => localDate(coupleStore.timezone));

function authorName(id: string) {
  return coupleStore.members.find(m => m.id === id)?.displayName ?? 'Anggota';
}
</script>

<template>
  <div>
    <NavAppHeader title="Surat" />

    <div class="px-4 py-4">
      <BaseSkeleton v-if="status === 'pending'" variant="card" :count="3" />
      <BaseErrorState v-else-if="error" :error="error" title="Surat gagal dimuat" @retry="refresh()" />

      <BaseEmptyState
        v-else-if="!items.length"
        icon="mail" title="Belum ada surat"
        description="Tulis sesuatu untuk dibaca nanti — bulan depan, atau tahun depan."
        action-label="Tulis surat" action-to="/letters/new"
      />

      <div v-else class="flex flex-col gap-7">
        <section v-if="lockedItems.length">
          <h2 class="mb-2.5 section-label">
            Terkunci · {{ lockedItems.length }}
          </h2>
          <div class="flex flex-col gap-2">
            <NuxtLink
              v-for="l in lockedItems" :key="l.id" :to="`/letters/${l.id}`"
              class="solid-card pressable flex items-center gap-3 p-4"
            >
              <span class="grid size-10 shrink-0 place-items-center rounded-[var(--radius-field)] bg-[var(--color-line)] text-[var(--color-ink-soft)]">
                <BaseIcon name="lock" :size="18" />
              </span>
              <span class="min-w-0 flex-1">
                <span class="block truncate text-[15px] font-medium">{{ l.title }}</span>
                <span class="mt-0.5 block text-[13px] text-[var(--color-ink-soft)]">
                  dari {{ authorName(l.authorId) }} · terbuka {{ formatDate(l.unlockOn) }}
                </span>
              </span>
              <BaseChip size="sm">{{ diffDays(today, l.unlockOn) }} hari</BaseChip>
            </NuxtLink>
          </div>
        </section>

        <section v-if="openedItems.length">
          <h2 class="mb-2.5 section-label">
            Sudah terbuka · {{ openedItems.length }}
          </h2>
          <div class="flex flex-col gap-2">
            <NuxtLink
              v-for="l in openedItems" :key="l.id" :to="`/letters/${l.id}`"
              class="solid-card pressable flex items-center gap-3 p-4"
            >
              <span class="grid size-10 shrink-0 place-items-center rounded-[var(--radius-field)] bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                <BaseIcon name="mail" :size="18" />
              </span>
              <span class="min-w-0 flex-1">
                <span class="block truncate text-[15px] font-medium">{{ l.title }}</span>
                <span class="mt-0.5 block text-[13px] text-[var(--color-ink-soft)]">
                  dari {{ authorName(l.authorId) }}
                  <span v-if="l.openedAt"> · dibuka {{ relativeTime(l.openedAt) }}</span>
                </span>
              </span>
              <BaseIcon name="chevronRight" :size="16" class="text-[var(--color-ink-soft)]" />
            </NuxtLink>
          </div>
        </section>
      </div>
    </div>

    <NuxtLink
      to="/letters/new"
      class="pressable fixed right-4 bottom-24 z-30 grid size-14 place-items-center rounded-full
             bg-[var(--color-primary)] text-[var(--color-primary-ink)] shadow-[var(--shadow-card)] md:bottom-8"
      aria-label="Tulis surat"
    ><BaseIcon name="plus" :size="24" /></NuxtLink>
  </div>
</template>
