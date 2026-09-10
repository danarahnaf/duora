<script setup lang="ts">
import { CreateCoupleSchema, type RelationshipDateLabel, type SignedUpload } from '@couple/contracts';
import StepHeading from '~/components/onboarding/StepHeading.vue';

definePageMeta({ layout: 'onboarding', step: 2 });
useHead({ title: 'Atur ruang' });

const { create } = useCouple();
const api = useApi();
const ui = useUiStore();

const LABELS: { value: RelationshipDateLabel; label: string }[] = [
  { value: 'first_met', label: 'Pertama bertemu' },
  { value: 'first_date', label: 'Kencan pertama' },
  { value: 'official', label: 'Jadian' },
  { value: 'engagement', label: 'Tunangan' },
  { value: 'wedding', label: 'Menikah' },
];

const form = reactive({
  name: '',
  relationshipDate: '',
  relationshipDateLabel: 'official' as RelationshipDateLabel,
});
const errors = reactive<Record<string, string | null>>({ relationshipDate: null });
const topError = ref<string | null>(null);
const loading = ref(false);

const photoPreview = ref<string | null>(null);
const photoProgress = ref<number | null>(null);
const photoPath = ref<string | null>(null);
const today = localDate();

onBeforeUnmount(() => {
  if (photoPreview.value) URL.revokeObjectURL(photoPreview.value);
});

async function onPhoto(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    ui.toast('Foto maksimal 5MB', 'danger');
    return;
  }
  if (photoPreview.value) URL.revokeObjectURL(photoPreview.value);
  photoPreview.value = URL.createObjectURL(file);
  photoProgress.value = 0;

  try {
    const signed = await api<SignedUpload>('/users/me/avatar-url', {
      method: 'POST',
      body: { filename: file.name, mimeType: file.type, sizeBytes: file.size },
    });
    await uploadWithProgress(signed.uploadUrl, file, (p) => { photoProgress.value = p; });
    photoPath.value = signed.storagePath;
  } catch (err) {
    ui.toast(apiErrorMessage(err, 'Foto gagal diunggah'), 'danger');
    photoPath.value = null;
  } finally {
    photoProgress.value = null;
  }
}

function uploadWithProgress(url: string, file: File, onProgress: (pct: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url);
    xhr.upload.addEventListener('progress', (ev) => {
      if (ev.lengthComputable) onProgress(Math.round((ev.loaded / ev.total) * 100));
    });
    xhr.addEventListener('load', () => (xhr.status < 400 ? resolve() : reject(new Error('upload gagal'))));
    xhr.addEventListener('error', () => reject(new Error('upload gagal')));
    xhr.send(file);
  });
}

async function submit() {
  errors.relationshipDate = null;
  topError.value = null;

  if (!form.relationshipDate) {
    errors.relationshipDate = 'Tanggal wajib diisi';
    return;
  }
  if (form.relationshipDate > today) {
    errors.relationshipDate = 'Tanggal tidak boleh di masa depan';
    return;
  }

  const parsed = CreateCoupleSchema.safeParse({
    name: form.name || undefined,
    relationshipDate: form.relationshipDate,
    relationshipDateLabel: form.relationshipDateLabel,
    timezone: DEFAULT_TZ,
  });
  if (!parsed.success) {
    errors.relationshipDate = parsed.error.issues[0]?.message ?? 'Isian belum benar';
    return;
  }

  loading.value = true;
  try {
    await create(parsed.data);
    await navigateTo('/onboarding/invite');
  } catch (e) {
    topError.value = apiErrorMessage(e);
  } finally {
    loading.value = false;
  }
}

const daysPreview = computed(() =>
  form.relationshipDate && form.relationshipDate <= today
    ? diffDays(form.relationshipDate, today)
    : null);
</script>

<template>
  <div>
    <StepHeading title="Sejak kapan?" description="Angka ini yang nanti muncul besar di halaman utama." />

    <form class="flex flex-col gap-5" novalidate @submit.prevent="submit">
      <p
        v-if="topError"
        class="rounded-[var(--radius-field)] bg-[var(--color-danger)]/12 px-3.5 py-2.5 text-[13px] text-[var(--color-danger)]"
        role="alert"
      >{{ topError }}</p>

      <div class="flex items-center gap-4">
        <label class="cursor-pointer">
          <span class="sr-only">Pilih foto couple</span>
          <span
            class="grid size-20 place-items-center overflow-hidden rounded-full border border-dashed
                   border-[var(--color-line-strong)] bg-[var(--color-surface-solid)] text-[var(--color-ink-soft)]"
          >
            <img v-if="photoPreview" :src="photoPreview" alt="" class="size-full object-cover">
            <BaseIcon v-else name="image" :size="22" />
          </span>
          <input type="file" accept="image/*" class="hidden" @change="onPhoto">
        </label>
        <div class="text-[13px] text-[var(--color-ink-soft)]">
          <p class="font-medium text-[var(--color-ink)]">Foto couple (opsional)</p>
          <p v-if="photoProgress !== null">Mengunggah… {{ photoProgress }}%</p>
          <p v-else-if="photoPath">Terunggah</p>
          <p v-else>JPG atau PNG, maksimal 5MB.</p>
        </div>
      </div>

      <BaseField v-model="form.name" label="Nama ruang (opsional)" placeholder="Danar & Nia" :maxlength="60" />

      <div>
        <BaseField
          v-model="form.relationshipDate" label="Tanggal mulai" type="date"
          :error="errors.relationshipDate" required
        />
        <p v-if="daysPreview !== null" class="mt-1.5 text-[13px] text-[var(--color-ink-soft)]">
          {{ formatNumber(daysPreview) }} hari sampai hari ini.
        </p>
      </div>

      <div>
        <p class="mb-2 text-[13px] font-medium">Tanggal ini artinya</p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="l in LABELS" :key="l.value" type="button"
            class="chip tap-target rounded-[var(--radius-pill)] border px-3.5 py-2 text-[13px]"
            :class="form.relationshipDateLabel === l.value
              ? 'border-transparent bg-[var(--color-primary)] text-[var(--color-primary-ink)]'
              : 'border-[var(--color-line-strong)] text-[var(--color-ink-soft)]'"
            @click="form.relationshipDateLabel = l.value"
          >{{ l.label }}</button>
        </div>
      </div>

      <BaseButton type="submit" block size="lg" :loading="loading">Lanjut</BaseButton>
      <NuxtLink to="/onboarding/couple" class="text-center text-[13px] text-[var(--color-ink-soft)] underline underline-offset-2">
        Kembali
      </NuxtLink>
    </form>
  </div>
</template>

<style scoped>
.chip { transition: background-color var(--dur-pop) var(--ease-out), border-color var(--dur-pop) var(--ease-out), color var(--dur-pop) var(--ease-out); }
.chip:active { transform: scale(0.97); }
</style>
