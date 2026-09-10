# Konvensi implementasi — Fase 1

Sumber: `docs/01-frontend.md`. Dokumen ini merangkum fondasi yang SUDAH ADA
supaya setiap layar tidak mengarang ulang. Jangan mengubah file fondasi
tanpa alasan kuat; tambahkan yang belum ada.

## Aturan mutlak

1. Semua data lewat `useApi()` / composable. **Tidak ada** komponen yang import fixture JSON.
2. Logika reveal / gating ada di server. Frontend hanya menampilkan apa yang dikirim.
3. Tanggal: pakai `utils/date.ts` (`localDate`, `daysTogether`, `formatDate`, `monthMatrix`, …).
   Jangan `new Date()` untuk menghitung hari.
4. Uang: `formatIdr()` / `formatIdrShort()` dari `utils/format.ts`.
5. **Setiap layar wajib 4 state**: loading (skeleton menyerupai konten), empty, error + retry, ideal.
6. Nol pelanggaran tabel §4.4 (lihat "Motion" di bawah).
7. Bahasa UI: Indonesia, kalimat pendek, tanpa emoji berlebihan.

## Struktur

```
app/pages/…              satu file per route
app/components/<fitur>/  komponen milik fitur itu (couple, daily, memory, calendar, …)
app/composables/         SUDAH ADA, jangan bikin duplikat
```

Komponen fitur di-import **eksplisit** supaya tidak bergantung pada penamaan auto-import:

```ts
import QuestionCard from '~/components/daily/QuestionCard.vue';
```

Komponen `base/` dan `nav/` dipakai lewat auto-import: `<BaseButton>`, `<BaseSheet>`,
`<BaseDialog>`, `<BaseField>`, `<BaseSkeleton>`, `<BaseEmptyState>`, `<BaseErrorState>`,
`<BaseCard>`, `<BaseChip>`, `<BaseAvatar>`, `<BaseIcon>`, `<BaseSegmented>`,
`<BaseSwitch>`, `<BasePopover>`, `<NavAppHeader>`.

## Token & kelas

Warna selalu lewat CSS var: `var(--color-bg|surface|surface-solid|ink|ink-soft|primary|
primary-ink|primary-soft|accent|accent-ink|line|line-strong|danger|danger-ink|success)`.
Radius: `var(--radius-card|sheet|pill|field)`. Easing: `var(--ease-out|in-out|drawer)`.
Durasi: `var(--dur-press|pop|sheet|reveal)`.

Utility yang tersedia: `text-display` (font serif untuk angka besar & headline emosional),
`tap-target` (44×44), `pressable` (scale .97 saat aktif), `hoverable` (hover hanya untuk
pointer halus), `safe-bottom`, `scrollbar-none`, `glass-1`, `glass-2`, `solid-card`.

**Budget glass (§4.2)**: maksimal 2 layer per layar dan nav sudah memakai satu.
Kartu di dalam list panjang (timeline memory, journal, notifikasi) WAJIB
`solid-card` / `<BaseCard variant="solid">`, bukan glass.

Materialnya turunan prinsip Liquid Glass (iOS 26), disusun di `glass.css`:
backdrop-filter (blur + saturate + brightness) supaya warna latar terbawa,
rim inset spekular sebagai tepi material — **bukan** border 1px rata, dan
gradien kilau di 42% teratas. Elevasi tidak ikut di material: shadow luar
hanya untuk permukaan yang benar-benar melayang (sheet, dialog, popover).
Jangan tambahkan `border` pada elemen glass; rim sudah menjadi tepinya.

`glass-interactive` + `useGlassSheen()` adalah padanan `.interactive()`:
kilau mengikuti pointer, hanya untuk pointer halus dan hanya pada kaca yang
benar-benar bisa ditekan. Tersedia lewat `<BaseButton variant="glass">`, dan
masuk akal hanya di atas latar yang punya sesuatu untuk dibiaskan (gradien
halaman, gambar) — di atas permukaan rata kaca cuma menurunkan kontras.
FAB tetap solid: kaca di atas list yang sedang di-scroll memaksa backdrop
dihitung ulang tiap frame.

## Motion — yang harus ditolak di review (§4.4)

| Jangan | Lakukan |
|---|---|
| `transition: all` | sebut properti: `transition: transform 200ms var(--ease-out)` |
| `scale(0)` | `scale(0.95)` + `opacity: 0` |
| `ease-in` pada UI | `var(--ease-out)` |
| animasi `height`/`padding`/`width` | `transform` + `opacity` |
| `transform-origin: center` pada popover | var origin dari reka-ui (sudah di `BasePopover`) |
| keyframe pada elemen yang sering re-trigger | CSS transition |
| durasi UI > 300ms | 150–250ms |
| `:hover` tanpa media query | `@media (hover: hover) and (pointer: fine)` |

Boleh delight hanya di: daily question reveal (`.reveal-in`), love letter unlock
(`.letter-unwrap`), yearly recap (`.recap-rise`), dan landing page (marketing).

## Komponen dasar — API

```vue
<BaseButton variant="primary|ghost|danger|subtle" size="sm|md|lg" :loading icon="plus"
            icon-right="arrowRight" to="/path" block type="submit" />
<BaseSheet v-model:open="open" title="…" description="…" hide-title>
  konten<template #footer>…</template>
</BaseSheet>
<BaseDialog v-model:open="open" title="…" description="…" confirm-label="Hapus"
            tone="danger" :loading @confirm="…" />
<BaseField v-model="value" label="…" type="text|email|password|number|date|time|textarea"
           :error="err" helper="…" :maxlength="120" :rows="4" placeholder="…" required />
<BaseSkeleton variant="text|title|card|avatar|thumb|line" :count="3" width="60%" />
<BaseEmptyState icon="image" title="…" description="…" action-label="Tambah" action-to="/x"
                @action="…" />
<BaseErrorState :error="error" @retry="refresh()" />
<BaseCard variant="glass|solid|plain" :padded to="/x" />
<BaseChip tone="default|primary|accent|danger|success" icon="clock" size="sm|md" />
<BaseAvatar :name="user.displayName" :src="user.avatarUrl" size="sm|md|lg|xl" ring />
<BaseSegmented v-model="tab" :options="[{ value:'a', label:'A', count:3 }]" />
<BaseSwitch v-model="on" label="…" description="…" />
<BasePopover align="end" side="bottom"><template #trigger><button/></template>…</BasePopover>
<NavAppHeader title="…" :back="true | '/home'" transparent><template #actions>…</template></NavAppHeader>
```

Nama ikon (`BaseIcon`): home heart image calendar chat book smile sparkle gift flame trophy
settings bell plus check close chevronLeft chevronRight chevronDown lock unlock mapPin clock
wallet users copy share search trash edit star logout arrowRight refresh moon sun mail crown.

## Composables yang sudah ada

```ts
useApi()                        // $fetch instance; apiErrorMessage(e), apiErrorCode(e)
useSession()                    // login, register, forgotPassword, fetchMe, updateMe, logout
useCouple()                     // couple, partner, create, update, leave,
                                // createInvite, activeInvite, revokeInvite, redeemInvite
useDailyQuestion()              // today, answer(questionId, body), status/refresh/error
useDailyHistory()
useMemories(monthRef?)          // items, grouped, create, requestUploadUrls, remove, toggleFavorite
useMemory(idRef)
useCalendar(monthRef)           // items, byDate (Map), create, update, remove
useUpcomingEvents(), useCalendarEvent(idRef)
useJournal(visibilityRef?)      // items, create, update, remove
useJournalEntry(idRef)
useMood()                       // today {mine, partner}, checkin(level, note); MOOD_META, MOOD_ORDER
useMoodHistory(days)
useDatePlanner()                // lastPlan, generate(input), save(id)
useDatePlans(), useDatePlan(idRef)
useWishlist()                   // items, pendingItems, doneItems, add, toggle, remove
useMilestones()                 // items, byYear, create, remove
useGames(), useGameSession(key) // start(), submit(picks, finish)
useLetters()                    // items, lockedItems, openedItems, create
useLetter(idRef)                // data, open()
useStreak(), useRecap(yearRef)
useNotifications()              // items, unreadCount, markRead
useNotificationPreferences()
useAssistant(kind)              // messages, sending, chips, ask(prompt)
useBilling()
```

Store: `useSessionStore()` (token, user, devUserId, isAuthenticated, hasCouple, userId),
`useCoupleStore()` (couple, timezone, daysTogether, members, partnerOf(id)),
`useUiStore()` (theme, accent, setTheme, setAccent, toast(msg, tone), openSheet).

Semua composable data memakai `useAsyncData` → tersedia `data`, `status`, `error`, `refresh`.
Pola standar per layar:

```vue
<script setup lang="ts">
const { items, status, error, refresh } = useMemories();
</script>
<template>
  <BaseSkeleton v-if="status === 'pending'" variant="thumb" :count="4" />
  <BaseErrorState v-else-if="error" :error="error" @retry="refresh()" />
  <BaseEmptyState v-else-if="!items.length" … />
  <div v-else>…</div>
</template>
```

## Layout & meta

```ts
definePageMeta({ layout: 'auth' });                       // login/register/forgot
definePageMeta({ layout: 'onboarding', step: 2 });        // onboarding (step 1..4)
definePageMeta({ middleware: 'couple-required' });        // semua layar yang butuh couple
definePageMeta({ layout: false });                        // landing page
useHead({ title: 'Memori' });                             // judul tab, tiap layar
```

`auth.global.ts` sudah menangani redirect ke `/login`. Route publik:
`/`, `/login`, `/register`, `/forgot`, `/offline`, `/premium`.

## Data mock

Login (password apa saja, ≥8 karakter):

| Email | Peran |
|---|---|
| `danar@example.com` | anggota couple utama, sudah menjawab pertanyaan hari ini |
| `nia@example.com` | pasangannya, belum menjawab hari ini |
| `alya@example.com` | belum punya couple — untuk menguji alur "buat ruang" |
| `bima@example.com` | belum punya couple — untuk menguji redeem kode yang VALID |

Kode invite uji: `JOIN-8F4K2` (valid, tapi couple Danar & Nia sudah penuh → `COUPLE_FULL`) ·
`JOIN-EXPRD` kedaluwarsa · `JOIN-USED1` sudah dipakai · kode ngawur → `INVITE_INVALID`.
Alur redeem yang benar-benar sukses: masuk sebagai Alya → buat ruang → buat kode →
masuk sebagai Bima → gabung. Error code ada di `apiErrorCode(e)`.

Semua id di seed berbentuk UUID karena kontrak memakai `z.string().uuid()`, dan
`mocks/map.ts` memvalidasi setiap respons terhadap skema kontrak — kalau mapper
melenceng, servernya langsung 500 dengan code `CONTRACT_DRIFT`.

Kirim header `x-mock-fail-rate: 1` (lewat DevTools) untuk memaksa error state.
`POST /api/mock/reset` mengembalikan seed.
