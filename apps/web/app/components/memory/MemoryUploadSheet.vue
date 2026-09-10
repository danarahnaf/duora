<script setup lang="ts">
import type { SignedUpload } from '@couple/contracts';

/**
 * Alur upload yang sama persis dengan Fase 2:
 *   requestUploadUrls() → PUT ke signed URL (progress di sini) → create().
 * Jangan ganti jadi "kirim base64 ke API" — itu tidak akan jalan nanti.
 */
const emit = defineEmits<{ done: [] }>();

const { create, requestUploadUrls } = useMemories();
const ui = useUiStore();

const MAX_FILES = 10;
const MAX_BYTES = 10 * 1024 * 1024;

interface Picked {
  file: File;
  preview: string;
  progress: number;
  error: string | null;
}

const picked = ref<Picked[]>([]);
const caption = ref('');
const happenedAt = ref(localDate());
const location = ref('');
const submitting = ref(false);
const formError = ref<string | null>(null);

onBeforeUnmount(() => picked.value.forEach(p => URL.revokeObjectURL(p.preview)));

function onPick(e: Event) {
  const input = e.target as HTMLInputElement;
  const files = [...(input.files ?? [])];
  input.value = '';

  for (const file of files) {
    if (picked.value.length >= MAX_FILES) {
      ui.toast(`Maksimal ${MAX_FILES} foto`, 'danger');
      break;
    }
    picked.value.push({
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
      error: file.size > MAX_BYTES ? 'Lebih dari 10MB' : null,
    });
  }
}

function removeAt(i: number) {
  const [gone] = picked.value.splice(i, 1);
  if (gone) URL.revokeObjectURL(gone.preview);
}

const hasBadFile = computed(() => picked.value.some(p => p.error));
const overall = computed(() => {
  if (!picked.value.length) return 0;
  return Math.round(picked.value.reduce((s, p) => s + p.progress, 0) / picked.value.length);
});

function put(url: string, file: File, onProgress: (pct: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url);
    xhr.upload.addEventListener('progress', (ev) => {
      if (ev.lengthComputable) onProgress(Math.round((ev.loaded / ev.total) * 100));
    });
    xhr.addEventListener('load', () => (xhr.status < 400 ? resolve() : reject(new Error('Gagal mengunggah'))));
    xhr.addEventListener('error', () => reject(new Error('Gagal mengunggah')));
    xhr.send(file);
  });
}

async function submit() {
  formError.value = null;
  if (hasBadFile.value) {
    formError.value = 'Hapus dulu file yang terlalu besar.';
    return;
  }
  if (!happenedAt.value) {
    formError.value = 'Tanggal wajib diisi.';
    return;
  }

  submitting.value = true;
  try {
    const media: { storagePath: string; width: number | null; height: number | null }[] = [];

    if (picked.value.length) {
      const { uploads } = await requestUploadUrls(picked.value.map(p => ({
        filename: p.file.name,
        mimeType: p.file.type,
        sizeBytes: p.file.size,
      })));

      await Promise.all(uploads.map(async (u: SignedUpload, i: number) => {
        const item = picked.value[i];
        if (!item) return;
        await put(u.uploadUrl, item.file, (pct) => { item.progress = pct; });
        media.push({ storagePath: u.storagePath, width: null, height: null });
      }));
    }

    await create({
      type: media.length ? 'PHOTO' : 'TEXT',
      caption: caption.value.trim() || null,
      happenedAt: happenedAt.value,
      location: location.value.trim() || null,
      media,
    });

    ui.toast('Memori tersimpan', 'success');
    emit('done');
  } catch (e) {
    formError.value = apiErrorMessage(e, 'Memori gagal disimpan.');
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <form class="flex flex-col gap-5" novalidate @submit.prevent="submit">
    <p
      v-if="formError"
      class="rounded-[var(--radius-field)] bg-[var(--color-danger)]/12 px-3.5 py-2.5 text-[13px] text-[var(--color-danger)]"
      role="alert"
    >{{ formError }}</p>

    <div>
      <div class="mb-2 flex items-baseline justify-between">
        <span class="text-[13px] font-medium">Foto</span>
        <span class="text-[11px] text-[var(--color-ink-soft)]">{{ picked.length }}/{{ MAX_FILES }}</span>
      </div>

      <div class="grid grid-cols-3 gap-2">
        <div
          v-for="(p, i) in picked" :key="p.preview"
          class="relative aspect-square overflow-hidden rounded-[var(--radius-field)] bg-[var(--color-line)]"
        >
          <img :src="p.preview" alt="" class="size-full object-cover">
          <button
            type="button" aria-label="Hapus foto" :disabled="submitting"
            class="absolute top-1 right-1 grid size-6 place-items-center rounded-full bg-black/55 text-white"
            @click="removeAt(i)"
          ><BaseIcon name="close" :size="13" /></button>

          <div v-if="p.error" class="absolute inset-x-0 bottom-0 bg-[var(--color-danger)] px-1.5 py-1 text-[11px] text-white">
            {{ p.error }}
          </div>
          <div v-else-if="submitting" class="absolute inset-x-0 bottom-0 h-1 bg-black/25">
            <div
              class="progress h-full w-full origin-left bg-[var(--color-primary)]"
              :style="{ transform: `scaleX(${p.progress / 100})` }"
            />
          </div>
        </div>

        <label
          v-if="picked.length < MAX_FILES"
          class="grid aspect-square cursor-pointer place-items-center rounded-[var(--radius-field)] border border-dashed
                 border-[var(--color-line-strong)] text-[var(--color-ink-soft)]"
        >
          <BaseIcon name="plus" :size="20" />
          <span class="sr-only">Tambah foto</span>
          <input type="file" accept="image/*" multiple class="hidden" :disabled="submitting" @change="onPick">
        </label>
      </div>
      <p class="mt-2 text-[13px] text-[var(--color-ink-soft)]">Maksimal 10MB per foto.</p>
    </div>

    <BaseField v-model="caption" type="textarea" label="Cerita singkat" :rows="3" :maxlength="1000" placeholder="Apa yang terjadi hari itu?" />
    <BaseField v-model="happenedAt" type="date" label="Tanggal kejadian" required />
    <BaseField v-model="location" label="Lokasi" :maxlength="120" placeholder="Kopi Kalyan, Malang" />

    <div v-if="submitting && picked.length" class="text-[13px] text-[var(--color-ink-soft)]">
      Mengunggah {{ overall }}%
    </div>

    <BaseButton type="submit" block size="lg" :loading="submitting">Simpan memori</BaseButton>
  </form>
</template>

<style scoped>
.progress { transition: transform 160ms linear; }
</style>
