<script setup lang="ts">
import { AccordionContent, AccordionHeader, AccordionItem, AccordionRoot, AccordionTrigger } from 'reka-ui';
import Paywall from '~/components/billing/Paywall.vue';
import PlanCompare from '~/components/billing/PlanCompare.vue';

// Route publik: bisa dilihat sebelum punya couple.
useHead({ title: 'Premium' });

const { data, status, error, refresh } = useBilling();
const dialogOpen = ref(false);

const FAQ = [
  {
    q: 'Apakah data saya hilang kalau berhenti berlangganan?',
    a: 'Tidak. Memori dan catatan tetap ada dan bisa dibaca. Yang dibatasi hanya penambahan baru di atas kuota gratis.',
  },
  {
    q: 'Satu langganan untuk berdua?',
    a: 'Ya. Premium berlaku untuk ruang kalian, bukan per akun.',
  },
  {
    q: 'Kenapa tombolnya belum bisa ditekan?',
    a: 'Versi ini belum tersambung ke pembayaran. Halaman ini ada supaya alur dan batasannya bisa diuji lebih dulu.',
  },
];
</script>

<template>
  <div class="mx-auto w-full max-w-3xl">
    <NavAppHeader title="Premium" back="/settings" />

    <div class="flex flex-col gap-8 px-4 py-4">
      <div v-if="status === 'pending'" class="flex flex-col gap-4">
        <BaseSkeleton variant="title" width="60%" />
        <BaseSkeleton variant="card" :count="3" />
      </div>

      <BaseErrorState v-else-if="error" :error="error" title="Paket gagal dimuat" @retry="refresh()" />

      <template v-else-if="data">
        <Paywall :state="data" />

        <PlanCompare :plans="data.plans" :current-plan="data.currentPlan" @choose="dialogOpen = true" />

        <section>
          <h2 class="mb-2.5 section-label">
            Pertanyaan umum
          </h2>

          <AccordionRoot type="single" collapsible class="solid-card divide-y divide-[var(--color-line)]">
            <AccordionItem v-for="(f, i) in FAQ" :key="f.q" :value="String(i)">
              <AccordionHeader>
                <AccordionTrigger
                  class="trigger flex w-full items-center justify-between gap-3 p-4 text-left text-[15px] font-medium"
                >
                  {{ f.q }}
                  <BaseIcon name="chevronDown" :size="17" class="chev shrink-0 text-[var(--color-ink-soft)]" />
                </AccordionTrigger>
              </AccordionHeader>
              <AccordionContent class="content overflow-hidden">
                <p class="px-4 pb-4 text-[13px] text-[var(--color-ink-soft)]">{{ f.a }}</p>
              </AccordionContent>
            </AccordionItem>
          </AccordionRoot>
        </section>

        <p class="text-center text-[13px] text-[var(--color-ink-soft)]">
          Pembayaran belum aktif di versi ini.
        </p>
      </template>
    </div>

    <BaseDialog
      v-model:open="dialogOpen"
      title="Pembayaran belum tersedia"
      description="Versi ini belum tersambung ke penyedia pembayaran, jadi paket belum bisa diaktifkan. Halaman ini ada untuk menguji alurnya dulu."
      confirm-label="Mengerti" cancel-label="Tutup"
      @confirm="dialogOpen = false"
    />
  </div>
</template>

<style scoped>
.trigger { transition: background-color var(--dur-pop) var(--ease-out); }
.trigger[data-state='open'] .chev { transform: rotate(180deg); }
.chev { transition: transform var(--dur-pop) var(--ease-out); }

/* Hanya opacity + transform; height tidak dianimasikan (§4.4). */
.content[data-state='open'] { animation: acc-in 200ms var(--ease-out); }
.content[data-state='closed'] { animation: acc-out 160ms var(--ease-out); }
@keyframes acc-in { from { opacity: 0; transform: translateY(-4px); } }
@keyframes acc-out { to { opacity: 0; transform: translateY(-4px); } }
</style>
