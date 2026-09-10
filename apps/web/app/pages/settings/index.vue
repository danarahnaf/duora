<script setup lang="ts">
import type { RelationshipDateLabel } from '@couple/contracts';

// Sengaja TANPA couple-required: user tanpa couple harus tetap bisa keluar akun.
useHead({ title: 'Setelan' });

const session = useSessionStore();
const coupleStore = useCoupleStore();
const ui = useUiStore();
const { updateMe, logout } = useSession();
const { couple, update, leave, refresh } = useCouple();
const billing = useBilling();

const LABELS: { value: RelationshipDateLabel; label: string }[] = [
  { value: 'first_met', label: 'Pertama bertemu' },
  { value: 'first_date', label: 'Kencan pertama' },
  { value: 'official', label: 'Jadian' },
  { value: 'engagement', label: 'Tunangan' },
  { value: 'wedding', label: 'Menikah' },
];

const profileSheet = ref(false);
const coupleSheet = ref(false);
const leaveDialog = ref(false);
const busy = ref(false);

const profileForm = reactive({ displayName: '' });
const coupleForm = reactive({
  name: '',
  relationshipDate: '',
  relationshipDateLabel: 'official' as RelationshipDateLabel,
});

watch(profileSheet, (open) => {
  if (open) profileForm.displayName = session.user?.displayName ?? '';
});
watch(coupleSheet, (open) => {
  if (open && couple.value) {
    coupleForm.name = couple.value.name ?? '';
    coupleForm.relationshipDate = couple.value.relationshipDate;
    coupleForm.relationshipDateLabel = couple.value.relationshipDateLabel;
  }
});

const partner = computed(() => coupleStore.partnerOf(session.userId));
const planLabel = computed(() => (billing.data.value?.currentPlan === 'FREE' ? 'Gratis' : 'Premium'));

async function saveProfile() {
  busy.value = true;
  try {
    await updateMe({ displayName: profileForm.displayName.trim() });
    profileSheet.value = false;
    ui.toast('Profil diperbarui', 'success');
  } catch (e) {
    ui.toast(apiErrorMessage(e), 'danger');
  } finally {
    busy.value = false;
  }
}

async function saveCouple() {
  busy.value = true;
  try {
    await update({
      name: coupleForm.name.trim() || undefined,
      relationshipDate: coupleForm.relationshipDate,
      relationshipDateLabel: coupleForm.relationshipDateLabel,
    });
    await refresh();
    coupleSheet.value = false;
    ui.toast('Data couple diperbarui', 'success');
  } catch (e) {
    ui.toast(apiErrorMessage(e), 'danger');
  } finally {
    busy.value = false;
  }
}

async function onLeave() {
  busy.value = true;
  try {
    await leave();
    ui.toast('Kamu keluar dari ruang ini', 'success');
    await navigateTo('/onboarding/couple');
  } catch (e) {
    ui.toast(apiErrorMessage(e), 'danger');
  } finally {
    busy.value = false;
    leaveDialog.value = false;
  }
}
</script>

<template>
  <div>
    <NavAppHeader title="Setelan" />

    <div class="flex flex-col gap-7 px-4 py-4">
      <section>
        <h2 class="mb-2.5 section-label">Profil</h2>
        <div class="solid-card divide-y divide-[var(--color-line)]">
          <button type="button" class="row flex w-full items-center gap-3 p-4 text-left" @click="profileSheet = true">
            <BaseAvatar :name="session.user?.displayName ?? '—'" :src="session.user?.avatarUrl" />
            <span class="min-w-0 flex-1">
              <span class="block text-[15px] font-medium">{{ session.user?.displayName ?? '—' }}</span>
              <span class="block truncate text-[13px] text-[var(--color-ink-soft)]">{{ session.user?.email }}</span>
            </span>
            <BaseIcon name="edit" :size="17" class="text-[var(--color-ink-soft)]" />
          </button>
          <div class="flex items-center justify-between p-4 text-[15px]">
            <span class="text-[var(--color-ink-soft)]">Zona waktu</span>
            <span>{{ session.user?.timezone ?? '—' }}</span>
          </div>
        </div>
      </section>

      <section v-if="couple">
        <h2 class="mb-2.5 section-label">Couple</h2>
        <div class="solid-card divide-y divide-[var(--color-line)]">
          <button type="button" class="row flex w-full items-center gap-3 p-4 text-left" @click="coupleSheet = true">
            <span class="min-w-0 flex-1">
              <span class="block text-[15px] font-medium">{{ couple.name ?? 'Tanpa nama' }}</span>
              <span class="block text-[13px] text-[var(--color-ink-soft)]">
                {{ formatDate(couple.relationshipDate) }} ·
                {{ LABELS.find(l => l.value === couple!.relationshipDateLabel)?.label }} ·
                {{ formatNumber(couple.daysTogether) }} hari
              </span>
            </span>
            <BaseIcon name="edit" :size="17" class="text-[var(--color-ink-soft)]" />
          </button>

          <div class="flex items-center gap-3 p-4">
            <BaseAvatar v-if="partner" :name="partner.displayName" :src="partner.avatarUrl" size="sm" />
            <span class="min-w-0 flex-1 text-[15px]">
              <span v-if="partner">{{ partner.displayName }}</span>
              <span v-else class="text-[var(--color-ink-soft)]">Belum ada partner</span>
            </span>
            <NuxtLink
              v-if="!couple.isComplete" to="/onboarding/invite"
              class="text-[13px] font-medium text-[var(--color-primary)]"
            >Undang</NuxtLink>
          </div>
        </div>
      </section>

      <section v-else>
        <div class="solid-card p-4">
          <p class="text-[15px] font-medium">Belum punya ruang</p>
          <p class="mt-1 text-[13px] text-[var(--color-ink-soft)]">Buat ruang baru atau masuk pakai kode undangan.</p>
          <BaseButton class="mt-3" size="sm" to="/onboarding/couple">Mulai</BaseButton>
        </div>
      </section>

      <section>
        <h2 class="mb-2.5 section-label">Aplikasi</h2>
        <div class="solid-card divide-y divide-[var(--color-line)]">
          <NuxtLink to="/settings/theme" class="row flex items-center gap-3 p-4">
            <BaseIcon name="moon" :size="18" class="text-[var(--color-ink-soft)]" />
            <span class="flex-1 text-[15px]">Tampilan</span>
            <BaseIcon name="chevronRight" :size="16" class="text-[var(--color-ink-soft)]" />
          </NuxtLink>
          <NuxtLink to="/settings/notifications" class="row flex items-center gap-3 p-4">
            <BaseIcon name="bell" :size="18" class="text-[var(--color-ink-soft)]" />
            <span class="flex-1 text-[15px]">Notifikasi</span>
            <BaseIcon name="chevronRight" :size="16" class="text-[var(--color-ink-soft)]" />
          </NuxtLink>
          <NuxtLink to="/premium" class="row flex items-center gap-3 p-4">
            <BaseIcon name="crown" :size="18" class="text-[var(--color-ink-soft)]" />
            <span class="flex-1 text-[15px]">Paket</span>
            <BaseChip size="sm" :tone="planLabel === 'Premium' ? 'accent' : 'default'">{{ planLabel }}</BaseChip>
            <BaseIcon name="chevronRight" :size="16" class="text-[var(--color-ink-soft)]" />
          </NuxtLink>
        </div>
      </section>

      <section>
        <h2 class="mb-2.5 section-label">Akun</h2>
        <div class="solid-card divide-y divide-[var(--color-line)]">
          <button
            v-if="couple" type="button"
            class="row flex w-full items-center gap-3 p-4 text-left text-[15px] text-[var(--color-danger)]"
            @click="leaveDialog = true"
          >
            <BaseIcon name="users" :size="18" />Keluar dari couple
          </button>
          <button
            type="button" class="row flex w-full items-center gap-3 p-4 text-left text-[15px]"
            @click="logout()"
          >
            <BaseIcon name="logout" :size="18" class="text-[var(--color-ink-soft)]" />Keluar akun
          </button>
        </div>
      </section>
    </div>

    <BaseSheet v-model:open="profileSheet" title="Ubah profil">
      <form class="flex flex-col gap-4 pb-2" @submit.prevent="saveProfile">
        <BaseField v-model="profileForm.displayName" label="Nama panggilan" :maxlength="60" required />
        <BaseButton type="submit" block :loading="busy">Simpan</BaseButton>
      </form>
    </BaseSheet>

    <BaseSheet v-model:open="coupleSheet" title="Ubah data couple">
      <form class="flex flex-col gap-4 pb-2" @submit.prevent="saveCouple">
        <BaseField v-model="coupleForm.name" label="Nama ruang" :maxlength="60" placeholder="Danar & Nia" />
        <BaseField v-model="coupleForm.relationshipDate" type="date" label="Tanggal mulai" required />
        <div>
          <p class="mb-2 text-[13px] font-medium">Tanggal ini artinya</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="l in LABELS" :key="l.value" type="button"
              class="chip tap-target rounded-[var(--radius-pill)] border px-3.5 py-2 text-[13px]"
              :class="coupleForm.relationshipDateLabel === l.value
                ? 'border-transparent bg-[var(--color-primary)] text-[var(--color-primary-ink)]'
                : 'border-[var(--color-line-strong)] text-[var(--color-ink-soft)]'"
              @click="coupleForm.relationshipDateLabel = l.value"
            >{{ l.label }}</button>
          </div>
        </div>
        <BaseButton type="submit" block :loading="busy">Simpan</BaseButton>
      </form>
    </BaseSheet>

    <BaseDialog
      v-model:open="leaveDialog"
      title="Keluar dari couple?"
      description="Kamu tidak lagi bisa melihat memori, jurnal, dan kalender bersama. Data tidak dihapus."
      confirm-label="Keluar" tone="danger" :loading="busy"
      @confirm="onLeave"
    />
  </div>
</template>

<style scoped>
.row { transition: background-color var(--dur-pop) var(--ease-out); }
.chip { transition: background-color var(--dur-pop) var(--ease-out), border-color var(--dur-pop) var(--ease-out), color var(--dur-pop) var(--ease-out); }
</style>
