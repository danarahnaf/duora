<script setup lang="ts">
import PlannerForm from '~/components/dates/PlannerForm.vue';
import type { PlannerInput } from '@couple/contracts';

definePageMeta({ middleware: 'couple-required' });
useHead({ title: 'Rencana kencan' });

const { generate } = useDatePlanner();
const saved = useDatePlans();

const loading = ref(false);
const error = ref<string | null>(null);

async function onSubmit(input: PlannerInput) {
  loading.value = true;
  error.value = null;
  try {
    await generate(input);
    await navigateTo('/dates/planner/result');
  } catch (e) {
    error.value = apiErrorMessage(e, 'Rencana gagal dibuat.');
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div>
    <NavAppHeader title="Rencana kencan" />

    <div class="px-4 py-4">
      <p class="mb-6 text-[13px] text-[var(--color-ink-soft)]">
        Isi batasannya, nanti disusun jadi jadwal dengan jam dan perkiraan biaya.
      </p>

      <p
        v-if="error"
        class="mb-4 rounded-[var(--radius-field)] bg-[var(--color-danger)]/12 px-3.5 py-2.5 text-[13px] text-[var(--color-danger)]"
        role="alert"
      >{{ error }}</p>

      <PlannerForm :loading="loading" @submit="onSubmit" />

      <section class="mt-9 border-t border-[var(--color-line)] pt-5">
        <h2 class="mb-3 section-label">
          Rencana tersimpan
        </h2>

        <BaseSkeleton v-if="saved.status.value === 'pending'" variant="card" :count="2" />
        <BaseErrorState v-else-if="saved.error.value" :error="saved.error.value" @retry="saved.refresh()" />

        <div v-else-if="saved.data.value?.items.length" class="flex flex-col gap-2">
          <NuxtLink
            v-for="p in saved.data.value.items" :key="p.id"
            :to="`/dates/planner/result?id=${p.id}`"
            class="solid-card pressable flex items-center justify-between gap-3 p-3.5"
          >
            <span class="min-w-0">
              <span class="block truncate text-[15px] font-medium">{{ p.title }}</span>
              <span class="text-[13px] text-[var(--color-ink-soft)]">
                {{ p.steps.length }} langkah · {{ formatIdr(p.totalIdr) }}
              </span>
            </span>
            <BaseIcon name="chevronRight" :size="16" class="text-[var(--color-ink-soft)]" />
          </NuxtLink>
        </div>

        <p v-else class="text-[13px] text-[var(--color-ink-soft)]">
          Belum ada rencana yang disimpan.
        </p>
      </section>
    </div>
  </div>
</template>
