<script setup lang="ts">
import ChoiceCard from '~/components/onboarding/ChoiceCard.vue';
import StepHeading from '~/components/onboarding/StepHeading.vue';

definePageMeta({ layout: 'onboarding', step: 1 });
useHead({ title: 'Mulai' });

const session = useSessionStore();
</script>

<template>
  <div>
    <StepHeading
      title="Halo, mau mulai dari mana?"
      description="Satu orang membuat ruangnya, satu lagi tinggal masuk pakai kode."
    />

    <div class="flex flex-col gap-3">
      <ChoiceCard
        icon="heart" to="/onboarding/setup"
        title="Buat ruang baru"
        description="Isi tanggal mulai, lalu undang pasanganmu."
      />
      <ChoiceCard
        icon="users" to="/onboarding/join"
        title="Punya kode undangan"
        description="Masukkan kode dari pasanganmu."
      />
    </div>

    <p class="mt-8 text-center text-[13px] text-[var(--color-ink-soft)]">
      Masuk sebagai {{ session.user?.displayName ?? '—' }} ·
      <NuxtLink to="/settings" class="underline underline-offset-2">Setelan</NuxtLink>
    </p>
  </div>
</template>
