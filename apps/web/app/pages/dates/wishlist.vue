<script setup lang="ts">
import WishlistItemRow from '~/components/dates/WishlistItem.vue';
import { CreateWishlistItemSchema } from '@couple/contracts';

definePageMeta({ middleware: 'couple-required' });
useHead({ title: 'Wishlist kencan' });

const { items, pendingItems, doneItems, status, error, refresh, add, toggle, remove } = useWishlist();
const coupleStore = useCoupleStore();
const ui = useUiStore();

const sheetOpen = ref(false);
const showDone = ref(false);
const saving = ref(false);
const busyId = ref<string | null>(null);
const removeTarget = ref<string | null>(null);
const removing = ref(false);

const form = reactive({ title: '', note: '', estimated: '' });
const formError = ref<string | null>(null);

function addedBy(userId: string) {
  return coupleStore.members.find(m => m.id === userId)?.displayName ?? 'anggota';
}

async function onAdd() {
  formError.value = null;
  const digits = form.estimated.replace(/\D/g, '');
  const parsed = CreateWishlistItemSchema.safeParse({
    title: form.title.trim(),
    note: form.note.trim() || null,
    estimatedIdr: digits ? Number(digits) : null,
  });
  if (!parsed.success) {
    formError.value = parsed.error.issues[0]?.message ?? 'Isian belum benar';
    return;
  }

  saving.value = true;
  try {
    await add(parsed.data);
    form.title = form.note = form.estimated = '';
    sheetOpen.value = false;
    ui.toast('Ditambahkan ke wishlist', 'success');
  } catch (e) {
    formError.value = apiErrorMessage(e);
  } finally {
    saving.value = false;
  }
}

/** Optimistik: centang harus terasa instan, lalu direkonsiliasi. */
async function onToggle(id: string, current: boolean) {
  const item = items.value.find(i => i.id === id);
  if (item) item.isDone = !current;
  busyId.value = id;
  try {
    await toggle(id, !current);
  } catch (e) {
    if (item) item.isDone = current;
    ui.toast(apiErrorMessage(e), 'danger');
  } finally {
    busyId.value = null;
  }
}

async function onRemove() {
  if (!removeTarget.value) return;
  removing.value = true;
  try {
    await remove(removeTarget.value);
    ui.toast('Item dihapus', 'success');
  } catch (e) {
    ui.toast(apiErrorMessage(e), 'danger');
  } finally {
    removing.value = false;
    removeTarget.value = null;
  }
}
</script>

<template>
  <div>
    <NavAppHeader title="Wishlist kencan" />

    <div class="px-4 py-4">
      <BaseSkeleton v-if="status === 'pending'" variant="card" :count="4" />
      <BaseErrorState v-else-if="error" :error="error" title="Wishlist gagal dimuat" @retry="refresh()" />

      <BaseEmptyState
        v-else-if="!items.length"
        icon="heart" title="Wishlist masih kosong"
        description="Tulis satu hal yang ingin kalian lakukan. Tidak perlu mahal."
        action-label="Tambah item" @action="sheetOpen = true"
      />

      <template v-else>
        <section>
          <h2 class="mb-2.5 section-label">
            Belum · {{ pendingItems.length }}
          </h2>
          <div class="flex flex-col gap-2">
            <WishlistItemRow
              v-for="i in pendingItems" :key="i.id"
              :item="i" :added-by="addedBy(i.addedById)" :busy="busyId === i.id"
              @toggle="onToggle(i.id, i.isDone)" @remove="removeTarget = i.id"
            />
          </div>
          <p v-if="!pendingItems.length" class="text-[13px] text-[var(--color-ink-soft)]">
            Semua sudah dicoret. Waktunya menambah yang baru.
          </p>
        </section>

        <section v-if="doneItems.length" class="mt-7">
          <button
            type="button" class="flex w-full items-center justify-between text-left"
            :aria-expanded="showDone" @click="showDone = !showDone"
          >
            <span class="section-label">
              Selesai · {{ doneItems.length }}
            </span>
            <BaseIcon name="chevronDown" :size="18" class="chev text-[var(--color-ink-soft)]" :class="showDone && 'rotate-180'" />
          </button>
          <div v-if="showDone" class="mt-2.5 flex flex-col gap-2">
            <WishlistItemRow
              v-for="i in doneItems" :key="i.id"
              :item="i" :added-by="addedBy(i.addedById)" :busy="busyId === i.id"
              @toggle="onToggle(i.id, i.isDone)" @remove="removeTarget = i.id"
            />
          </div>
        </section>
      </template>
    </div>

    <button
      type="button" aria-label="Tambah item"
      class="pressable fixed right-4 bottom-24 z-30 grid size-14 place-items-center rounded-full
             bg-[var(--color-primary)] text-[var(--color-primary-ink)] shadow-[var(--shadow-card)] md:bottom-8"
      @click="sheetOpen = true"
    ><BaseIcon name="plus" :size="24" /></button>

    <BaseSheet v-model:open="sheetOpen" title="Tambah ke wishlist">
      <form class="flex flex-col gap-4 pb-2" novalidate @submit.prevent="onAdd">
        <p v-if="formError" class="text-[13px] text-[var(--color-danger)]" role="alert">{{ formError }}</p>
        <BaseField v-model="form.title" label="Mau ngapain?" :maxlength="120" placeholder="Piknik sunrise di Selecta" required />
        <BaseField v-model="form.note" label="Catatan" :maxlength="500" placeholder="Bawa termos dan roti" />
        <BaseField v-model="form.estimated" label="Perkiraan biaya" inputmode="numeric" placeholder="120000" />
        <BaseButton type="submit" block :loading="saving">Tambah</BaseButton>
      </form>
    </BaseSheet>

    <BaseDialog
      :open="removeTarget !== null"
      title="Hapus item ini?" description="Item akan hilang dari wishlist kalian."
      confirm-label="Hapus" tone="danger" :loading="removing"
      @update:open="(v: boolean) => { if (!v) removeTarget = null; }"
      @confirm="onRemove"
    />
  </div>
</template>

<style scoped>
.chev { transition: transform var(--dur-pop) var(--ease-out); }
</style>
