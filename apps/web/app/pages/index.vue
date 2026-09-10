<script setup lang="ts">
definePageMeta({ layout: false });
useHead({ title: 'Ruang untuk dua orang' });

const session = useSessionStore();
const signedIn = ref(false);
onMounted(() => {
  session.hydrate();
  signedIn.value = session.isAuthenticated;
});

const VALUES = [
  { title: 'Memori yang tidak hilang', body: 'Foto, tanggal, dan tempat tersimpan rapi dalam satu linimasa — bukan tersebar di galeri dua HP yang berbeda.' },
  { title: 'Satu pertanyaan tiap hari', body: 'Jawaban kalian baru terbuka setelah dua-duanya menjawab. Tidak ada yang bisa mengintip duluan.' },
  { title: 'Rencana yang benar-benar jadi', body: 'Wishlist, kalender, dan rencana kencan dengan jam dan perkiraan biaya yang masuk akal.' },
];

const STEPS = [
  { n: 1, title: 'Buat ruang', body: 'Isi tanggal mulai kalian.' },
  { n: 2, title: 'Undang pasangan', body: 'Bagikan satu kode. Selesai.' },
  { n: 3, title: 'Isi pelan-pelan', body: 'Satu pertanyaan sehari sudah cukup.' },
];
</script>

<template>
  <div class="mx-auto w-full max-w-4xl px-5">
    <header class="flex h-16 items-center justify-between">
      <span class="flex items-center gap-2">
        <img
          src="/logo-mark.png" alt="" width="263" height="204"
          class="h-8 w-auto shrink-0"
        >
        <span class="text-display text-lg">Couple</span>
      </span>
      <BaseButton v-if="signedIn" size="sm" to="/home" variant="subtle">Buka aplikasi</BaseButton>
      <BaseButton v-else size="sm" to="/login" variant="ghost">Masuk</BaseButton>
    </header>

    <section class="py-14 sm:py-20">
      <h1 class="text-display text-4xl leading-[1.1] sm:text-6xl">
        Tempat menyimpan hal-hal kecil<br class="hidden sm:block">
        yang ternyata paling diingat.
      </h1>
      <p class="mt-5 max-w-md text-[15px] text-[var(--color-ink-soft)]">
        Memori, pertanyaan harian, kalender, dan rencana kencan — dalam satu ruang
        yang cuma bisa dibuka kalian berdua.
      </p>
      <div class="mt-8 flex flex-wrap gap-3">
        <BaseButton size="lg" :to="signedIn ? '/home' : '/register'" icon-right="arrowRight">
          {{ signedIn ? 'Buka aplikasi' : 'Mulai gratis' }}
        </BaseButton>
        <BaseButton v-if="!signedIn" size="lg" variant="glass" to="/login">Sudah punya akun</BaseButton>
      </div>
    </section>

    <section class="pb-16">
      <div class="border-t border-[var(--color-line)]">
        <article
          v-for="(v, i) in VALUES" :key="v.title"
          class="flex flex-col gap-2 border-b border-[var(--color-line)] py-7 sm:flex-row sm:gap-10 sm:py-9"
        >
          <h2
            class="text-display shrink-0 leading-tight sm:w-2/5"
            :class="i === 0 ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'"
          >{{ v.title }}</h2>
          <p
            class="prose-measure text-[var(--color-ink-soft)]"
            :class="i === 0 ? 'text-[15px] sm:text-base' : 'text-[15px]'"
          >{{ v.body }}</p>
        </article>
      </div>
    </section>

    <section class="border-t border-[var(--color-line)] py-14">
      <h2 class="text-display text-2xl">Tiga langkah, sekali saja</h2>
      <ol class="mt-6 grid gap-6 sm:grid-cols-3">
        <li v-for="s in STEPS" :key="s.n">
          <span class="text-display text-3xl text-[var(--color-primary)]">{{ s.n }}</span>
          <h3 class="mt-1 text-[15px] font-semibold">{{ s.title }}</h3>
          <p class="mt-1 text-[15px] text-[var(--color-ink-soft)]">{{ s.body }}</p>
        </li>
      </ol>
    </section>

    <section class="border-t border-[var(--color-line)] py-14 text-center">
      <h2 class="text-display text-2xl">Mulai dari hari ini</h2>
      <p class="mx-auto mt-2 max-w-sm text-[15px] text-[var(--color-ink-soft)]">
        Tidak perlu langsung lengkap. Satu memori dan satu jawaban sudah jadi awal.
      </p>
      <BaseButton class="mt-6" size="lg" :to="signedIn ? '/home' : '/register'">
        {{ signedIn ? 'Buka aplikasi' : 'Buat ruang kalian' }}
      </BaseButton>
    </section>

    <footer class="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-line)] py-6 text-[13px] text-[var(--color-ink-soft)]">
      <span>Couple · versi awal</span>
      <NuxtLink to="/premium" class="underline underline-offset-2">Lihat paket</NuxtLink>
    </footer>
  </div>
</template>
