<script setup lang="ts">
import { CreateLetterSchema, type CreateLetter, type LetterUnlockType } from '@couple/contracts';

const props = defineProps<{ loading?: boolean; serverError?: string | null }>();
const emit = defineEmits<{ submit: [payload: CreateLetter] }>();

const coupleStore = useCoupleStore();
const today = computed(() => localDate(coupleStore.timezone));

const TYPES: { value: LetterUnlockType; label: string; hint: string }[] = [
  { value: 'DATE', label: 'Tanggal tertentu', hint: 'Pilih tanggalnya sendiri.' },
  { value: 'ANNIVERSARY', label: 'Anniversary berikutnya', hint: 'Dihitung dari tanggal mulai kalian.' },
  { value: 'BIRTHDAY', label: 'Ulang tahun', hint: 'Pilih tanggal ulang tahunnya.' },
  { value: 'CUSTOM', label: 'Momen tertentu', hint: 'Momen yang kalian tentukan sendiri.' },
];

/** Anniversary dihitung lewat utils/date, bukan aritmetika Date mentah. */
const nextAnniversary = computed(() => {
  const couple = coupleStore.couple;
  if (!couple) return addDays(today.value, 365);
  const years = Math.floor(couple.daysTogether / 365) + 1;
  return addDays(couple.relationshipDate, years * 365);
});

const title = ref('');
const body = ref('');
const unlockType = ref<LetterUnlockType>('DATE');
const unlockOn = ref(addDays(today.value, 30));
const error = ref<string | null>(null);
const confirmOpen = ref(false);

watch(unlockType, (t) => {
  if (t === 'ANNIVERSARY') unlockOn.value = nextAnniversary.value;
});

const resolvedDate = computed(() =>
  unlockType.value === 'ANNIVERSARY' ? nextAnniversary.value : unlockOn.value);

const dateError = computed(() => props.serverError ?? error.value);

function validate(): CreateLetter | null {
  error.value = null;
  const parsed = CreateLetterSchema.safeParse({
    title: title.value.trim(),
    body: body.value.trim(),
    unlockType: unlockType.value,
    unlockOn: resolvedDate.value,
  });
  if (!parsed.success) {
    error.value = parsed.error.issues[0]?.message ?? 'Isian belum benar';
    return null;
  }
  if (resolvedDate.value <= today.value) {
    error.value = 'Tanggal buka harus setelah hari ini';
    return null;
  }
  return parsed.data;
}

function askConfirm() {
  if (validate()) confirmOpen.value = true;
}

function confirmed() {
  const payload = validate();
  confirmOpen.value = false;
  if (payload) emit('submit', payload);
}
</script>

<template>
  <form class="flex flex-col gap-5" novalidate @submit.prevent="askConfirm">
    <BaseField v-model="title" label="Judul" :maxlength="120" placeholder="Untuk kamu, nanti" required />
    <BaseField
      v-model="body" type="textarea" label="Isi surat" :rows="12" :maxlength="20000"
      placeholder="Tulis untuk dia yang membacanya nanti."
    />

    <div>
      <p class="mb-2 text-[13px] font-medium">Terbuka saat</p>
      <div class="flex flex-col gap-2">
        <button
          v-for="t in TYPES" :key="t.value" type="button"
          class="opt flex items-start gap-3 rounded-[var(--radius-card)] border p-3.5 text-left"
          :class="unlockType === t.value ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)]' : 'border-[var(--color-line-strong)]'"
          @click="unlockType = t.value"
        >
          <span class="min-w-0 flex-1">
            <span class="block text-[15px] font-medium">{{ t.label }}</span>
            <span class="mt-0.5 block text-[13px] text-[var(--color-ink-soft)]">{{ t.hint }}</span>
          </span>
          <BaseIcon v-if="unlockType === t.value" name="check" :size="17" class="text-[var(--color-primary)]" />
        </button>
      </div>
    </div>

    <div v-if="unlockType === 'ANNIVERSARY'" class="solid-card p-3.5">
      <p class="text-[13px] text-[var(--color-ink-soft)]">Anniversary berikutnya</p>
      <p class="mt-0.5 text-[15px] font-medium">{{ formatDateLong(nextAnniversary) }}</p>
    </div>
    <BaseField v-else v-model="unlockOn" type="date" label="Tanggal buka" :error="dateError" required />

    <p v-if="dateError && unlockType === 'ANNIVERSARY'" class="text-[13px] text-[var(--color-danger)]">{{ dateError }}</p>

    <BaseButton type="submit" block size="lg" :loading="loading">Segel surat</BaseButton>

    <BaseDialog
      v-model:open="confirmOpen"
      title="Segel surat ini?"
      :description="`Setelah disegel, isinya tidak bisa dibaca atau diubah — olehmu juga — sampai ${formatDate(resolvedDate)}.`"
      confirm-label="Segel" :loading="loading"
      @confirm="confirmed"
    />
  </form>
</template>

<style scoped>
.opt { transition: background-color var(--dur-pop) var(--ease-out), border-color var(--dur-pop) var(--ease-out); }
.opt:active { transform: scale(0.99); }
</style>
