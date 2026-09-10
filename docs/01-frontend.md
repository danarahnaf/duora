# Fase 1 — Frontend + Dummy Data (Lokal)

> **Target fase:** semua layar bisa diklik dan terasa seperti aplikasi jadi, tanpa satu baris backend.
> **Aturan besar:** tidak ada database, tidak ada auth nyata, tidak ada SDK AI, tidak ada payment gateway.

---

## 1. Stack

```text
Nuxt 4              (SSR/hybrid, Nitro)
Vue 3               (Composition API, <script setup>)
TypeScript          strict: true, noUncheckedIndexedAccess: true
Tailwind CSS v4     (CSS-first config via @theme)
reka-ui             headless primitives (dialog, popover, tabs, drawer)
Pinia               state client
VueUse              useSwipe, useMediaQuery, usePreferredReducedMotion
@vite-pwa/nuxt      manifest + service worker
zod                 validasi form, dipakai bersama packages/contracts
```

Kenapa **reka-ui** dan bukan komponen buatan sendiri: focus trap, scroll lock, dan variabel
`--reka-popover-content-transform-origin` sudah benar. Variabel origin itu wajib untuk animasi
popover yang origin-aware (lihat §4.3).

Kenapa **tidak** pakai library UI jadi (Vuetify/PrimeVue): design direction "premium romantic +
liquid glass" akan bertabrakan dengan opini visual library, dan kamu akan menghabiskan lebih
banyak waktu meng-override daripada membangun.

---

## 2. Bootstrap

```bash
# root monorepo
mkdir couple-app && cd couple-app
pnpm init
printf 'packages:\n  - "apps/*"\n  - "packages/*"\n' > pnpm-workspace.yaml

# contracts dulu, sebelum app
mkdir -p packages/contracts/src && cd packages/contracts
pnpm init && pnpm add zod
cd ../..

# app web
pnpm create nuxt apps/web
cd apps/web
pnpm add @vueuse/nuxt @pinia/nuxt reka-ui zod
pnpm add -D @vite-pwa/nuxt @nuxtjs/tailwindcss
pnpm add @couple/contracts --workspace
```

`apps/web/.env`:

```env
NUXT_PUBLIC_API_BASE=""          # kosong = pakai Nitro mock lokal
NUXT_PUBLIC_ENABLE_DEV_TOOLS=true
NUXT_PUBLIC_MOCK_LATENCY_MS=450
```

Jalankan: `pnpm --filter web dev` → `http://localhost:3000`

---

## 3. Struktur folder `apps/web`

```text
app/
├── assets/css/
│   ├── tokens.css          # warna, radius, tipografi, easing, durasi
│   ├── glass.css           # utility .glass-1 .glass-2 (dibatasi 2 layer)
│   └── motion.css          # keyframes + prefers-reduced-motion override
├── components/
│   ├── base/               # BaseButton BaseSheet BaseDialog BaseField BaseSkeleton
│   ├── couple/             # RelationshipCounter PartnerAvatar StreakBadge CoupleHeader
│   ├── daily/              # QuestionCard AnswerComposer WaitingState RevealPanel
│   ├── memory/             # MemoryCard MemoryTimeline MemoryUploadSheet MemoryDetail
│   ├── calendar/           # MonthGrid EventPill EventForm UpcomingList
│   ├── journal/            # JournalEditor JournalList VisibilityToggle
│   ├── mood/               # MoodPicker PartnerMoodCard
│   ├── dates/              # PlannerForm PlannerResult WishlistItem
│   ├── games/              # GameCard QuizRunner ThisOrThat ResultScreen
│   ├── letters/            # LetterCompose LockedLetter UnlockReveal
│   ├── ai/                 # AssistantSheet PromptChips MockResponse
│   ├── billing/            # Paywall PlanCompare
│   └── dev/                # DevUserSwitcher  ← hanya saat NUXT_PUBLIC_ENABLE_DEV_TOOLS
├── composables/
│   ├── useSession.ts       useCouple.ts       useDailyQuestion.ts
│   ├── useMemories.ts      useCalendar.ts     useJournal.ts
│   ├── useMood.ts          useDatePlanner.ts  useWishlist.ts
│   ├── useMilestones.ts    useGames.ts        useLetters.ts
│   └── useApi.ts           # wrapper $fetch tunggal, satu-satunya tempat baseURL
├── layouts/
│   ├── default.vue         # bottom nav mobile / sidebar desktop
│   ├── auth.vue            # centered, tanpa nav
│   └── onboarding.vue      # progress step
├── middleware/
│   ├── auth.global.ts      # redirect ke /login kalau belum ada session
│   └── couple-required.ts  # redirect ke /onboarding kalau belum punya couple
├── pages/                  # lihat §6
├── stores/
│   ├── session.ts          # user aktif (di Fase 1 bisa di-switch)
│   ├── couple.ts           # couple aktif + relationship date
│   └── ui.ts               # sheet terbuka, toast, theme
└── utils/
    ├── date.ts             # daysTogether(), localDate() — timezone-aware
    └── format.ts           # formatIdr(), relativeDate()

server/                     # MOCK SERVER — dihapus total di akhir Fase 2
├── api/                    # struktur path MIRROR 1:1 dengan NestJS
│   ├── auth/login.post.ts
│   ├── couples/index.get.ts
│   ├── daily/today.get.ts
│   └── ...
├── mocks/
│   ├── db.ts               # in-memory store, reset saat restart
│   ├── seed.ts             # DANAR & NIA, 847 hari, 37 memories, 12 events
│   └── simulate.ts         # delay() + maybeFail()
└── utils/currentUser.ts    # baca header X-Dev-User
```

---

## 4. Design System

Diturunkan dari prinsip **emil-design-eng**: keputusan motion berasal dari *seberapa sering
user melihatnya*, bukan dari selera. Detail yang tidak disadari user justru yang menumpuk
jadi kesan "aplikasi ini enak dipakai".

### 4.1 Token visual — `app/assets/css/tokens.css`

```css
@theme {
  /* Light — warm, bukan pink */
  --color-bg:          oklch(0.985 0.008 70);    /* warm cream */
  --color-surface:     oklch(1 0 0 / 0.72);      /* glass base */
  --color-ink:         oklch(0.22 0.02 20);
  --color-ink-soft:    oklch(0.48 0.02 20);
  --color-primary:     oklch(0.55 0.16 15);      /* rose */
  --color-primary-ink: oklch(0.98 0.01 15);
  --color-accent:      oklch(0.82 0.07 85);      /* champagne */
  --color-line:        oklch(0.22 0.02 20 / 0.08);

  /* Radius */
  --radius-card: 24px;
  --radius-sheet: 28px;
  --radius-pill: 999px;
  --radius-field: 16px;

  /* Type */
  --font-display: "Instrument Serif", Georgia, serif;   /* angka counter, headline emosional */
  --font-sans: "Geist", ui-sans-serif, system-ui;       /* seluruh UI */

  /* Motion */
  --ease-out:     cubic-bezier(0.23, 1, 0.32, 1);
  --ease-in-out:  cubic-bezier(0.77, 0, 0.175, 1);
  --ease-drawer:  cubic-bezier(0.32, 0.72, 0, 1);
  --dur-press: 160ms;
  --dur-pop:   180ms;
  --dur-sheet: 300ms;
  --dur-reveal: 500ms;
}

:root[data-theme="dark"] {
  --color-bg:      oklch(0.18 0.03 20);   /* deep burgundy / charcoal */
  --color-surface: oklch(1 0 0 / 0.08);
  --color-ink:     oklch(0.96 0.01 70);
  --color-ink-soft: oklch(0.72 0.02 70);
  --color-line:    oklch(1 0 0 / 0.10);
}
```

Tipografi punya dua peran saja. `--font-display` khusus angka besar (`847 DAYS`) dan headline
emosional. Sisanya `--font-sans`. Jangan tambah typeface ketiga.

### 4.2 Budget glass — `glass.css`

```css
.glass-1 {
  background: var(--color-surface);
  backdrop-filter: blur(16px) saturate(140%);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-card);
}
.glass-2 { /* untuk sheet/nav di atas glass-1 */
  background: var(--color-surface);
  backdrop-filter: blur(20px) saturate(150%);
}
```

**Aturan keras:**

| Aturan | Alasan |
|---|---|
| `blur()` maksimal **20px** | Di atas itu biaya render naik tajam, terutama Safari iOS |
| Maksimal **2 layer glass bertumpuk** per layar | Layer ketiga = compositing berlapis, scroll drop frame |
| Jangan pasang glass pada elemen yang ikut scroll panjang | Blur dihitung ulang tiap frame |
| Nav bawah dan sheet boleh glass; kartu di dalam list **tidak** | List memory bisa 100+ item |

Ini bukan detail kosmetik. Design direction kamu glass-heavy, dan ini titik paling mungkin
bikin aplikasi terasa lambat di HP 3 tahun ke atas.

### 4.3 Budget motion

Keputusan diambil dari frekuensi user melihat animasi tersebut:

| Surface | Frekuensi | Keputusan | Nilai |
|---|---|---|---|
| Bottom nav tab switch | puluhan×/hari | **Tanpa animasi posisi.** Opacity saja | `opacity 120ms ease` |
| Button / card press | konstan | Feedback tekan wajib | `scale(0.97)`, `var(--dur-press) var(--ease-out)` |
| Bottom sheet (`+ Add`) | occasional | Slide + swipe-to-dismiss | `translateY(100%)→0`, `var(--dur-sheet) var(--ease-drawer)` |
| Modal konfirmasi | occasional | Scale dari tengah | `scale(0.95)+opacity`, 200ms, `transform-origin: center` |
| Popover / dropdown | occasional | Origin-aware dari trigger | 180ms, `transform-origin: var(--reka-popover-content-transform-origin)` |
| Toast | occasional | Enter & exit arah sama | transition, bukan keyframe |
| **Daily Question reveal** | 1×/hari | **Boleh delight** | crossfade + `blur(8px)→0`, `var(--dur-reveal)` |
| **Love Letter unlock** | rare | **Boleh delight** | `clip-path: inset(0 0 100% 0)→inset(0)`, 700ms `--ease-in-out` |
| **Yearly recap** | 1×/tahun | **Boleh delight** | stagger panjang diizinkan |
| Relationship counter | tiap buka app | **Tidak** count-up tiap kunjungan | animasi hanya saat milestone tercapai |
| Streak badge | harian | Animasi hanya saat angka naik | tidak tiap render |
| Timeline item enter | occasional | Stagger pendek, dibatasi | 50ms antar item, maksimal 6 item pertama |
| Skeleton shimmer | konstan | `linear`, cepat | spinner cepat membuat load terasa lebih cepat |

### 4.4 Aturan yang harus ditolak di review

| Jangan | Lakukan | Kenapa |
|---|---|---|
| `transition: all 300ms` | `transition: transform 200ms var(--ease-out)` | `all` menganimasi properti tak terduga dan memicu layout |
| `transform: scale(0)` | `transform: scale(0.95); opacity: 0` | Tidak ada benda nyata yang muncul dari nol |
| `ease-in` pada UI | `var(--ease-out)` | `ease-in` menunda gerakan awal, tepat di detik user paling memperhatikan |
| Animasi `height` / `padding` | `transform` + `opacity` | Hanya keduanya yang lewat GPU, melewati layout & paint |
| `transform-origin: center` pada popover | variabel origin dari reka-ui | Popover harus tumbuh dari trigger-nya. Modal justru **tetap** center |
| Keyframe pada elemen yang sering re-trigger | CSS transition | Keyframe restart dari nol saat diinterupsi, transition retarget mulus |
| Durasi UI > 300ms | 150–250ms | Kecuali 3 surface delight di §4.3 |
| `:hover` tanpa media query | `@media (hover: hover) and (pointer: fine)` | Layar sentuh memicu hover saat tap, jadi false positive |
| Animasi pada aksi keyboard | hapus animasinya | Aksi yang diulang ratusan kali/hari harus instan |

`motion.css` wajib berisi:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-property: opacity, background-color, color !important;
    transition-duration: 150ms !important;
  }
}
```

Reduced motion berarti **lebih sedikit dan lebih lembut**, bukan nol. Transisi opacity dan warna
yang membantu pemahaman tetap dipertahankan; yang dibuang adalah pergerakan posisi.

### 4.5 Komponen dasar yang harus selesai lebih dulu

Sebelum menyentuh layar apa pun, selesaikan 6 ini. Semua layar bergantung padanya:

1. **BaseButton** — variant primary/ghost/danger, state loading, `:active { scale(.97) }`, hit area minimal 44×44px
2. **BaseSheet** — bottom sheet, `translateY(100%)`, swipe-to-dismiss dengan momentum (`velocity = |drag| / elapsed`, dismiss jika `> 0.11` tanpa peduli jarak), damping saat drag melewati batas atas
3. **BaseDialog** — center, scale dari 0.95, focus trap
4. **BaseField** — label, error, helper, counter karakter
5. **BaseSkeleton** — bentuknya harus meniru konten akhir, bukan kotak generik
6. **BaseEmptyState** — ilustrasi + satu CTA

Swipe-to-dismiss pada BaseSheet adalah komponen paling berisiko di seluruh fase ini. Uji di HP
fisik, bukan di DevTools. Jangan lanjut ke batch 1B sebelum ini terasa benar.

---

## 5. Contract-first & lapisan mock

### 5.1 `packages/contracts`

Ini source of truth. Frontend dan backend nanti mengimpor file yang sama.

```ts
// packages/contracts/src/daily.ts
import { z } from 'zod';

export const AnswerSchema = z.object({
  authorId: z.string().uuid(),
  body: z.string().min(1).max(2000),
  createdAt: z.string().datetime(),
});

export const DailyTodaySchema = z.object({
  questionId: z.string().uuid(),
  category: z.enum(['FUN','ROMANTIC','DEEP','FUTURE','MEMORIES','RELATIONSHIP','RANDOM','LDR','FUNNY']),
  text: z.string(),
  localDate: z.string(),               // YYYY-MM-DD
  myAnswer: AnswerSchema.nullable(),
  partnerAnswered: z.boolean(),
  revealed: z.boolean(),
  answers: z.array(AnswerSchema).nullable(),  // null sebelum revealed
});

export type DailyToday = z.infer<typeof DailyTodaySchema>;

export const DAILY_PATHS = {
  today:  '/daily/today',
  answer: '/daily/answer',
} as const;
```

Perhatikan `answers: nullable`. Kontrak sudah memaksakan bahwa jawaban partner **tidak dikirim**
sebelum reveal. Kalau dibiarkan `array` biasa, di Fase 2 mudah lolos dan jawaban partner bisa
dibaca dari network tab.

### 5.2 `useApi.ts` — satu-satunya tempat baseURL

```ts
export function useApi() {
  const { public: cfg } = useRuntimeConfig();
  const session = useSessionStore();

  return $fetch.create({
    baseURL: cfg.apiBase || '/api',
    onRequest({ options }) {
      options.headers = {
        ...options.headers,
        ...(session.token ? { Authorization: `Bearer ${session.token}` } : {}),
        // Fase 1 only: dipakai mock server untuk menentukan "aku siapa"
        ...(cfg.enableDevTools ? { 'X-Dev-User': session.devUserId } : {}),
      };
    },
    onResponseError({ response }) {
      if (response.status === 401) session.clear();
    },
  });
}
```

Fase 2 = ganti `NUXT_PUBLIC_API_BASE` jadi `https://api.brand.com/v1`, hapus header `X-Dev-User`.
Komponen tidak berubah satu baris.

### 5.3 Mock server dengan latency dan error nyata

```ts
// server/mocks/simulate.ts
export const delay = () =>
  new Promise(r => setTimeout(r, Number(process.env.NUXT_PUBLIC_MOCK_LATENCY_MS ?? 450)));

export function maybeFail(rate = 0) {
  if (Math.random() < rate) throw createError({ statusCode: 500, message: 'Mock failure' });
}
```

```ts
// server/api/daily/today.get.ts
export default defineEventHandler(async (event) => {
  await delay();
  maybeFail(Number(getHeader(event, 'x-mock-fail-rate') ?? 0));
  const me = currentUser(event);
  const q = db.dailyToday(me.coupleId);
  const bothAnswered = q.answers.length === 2;
  return DailyTodaySchema.parse({
    ...q,
    myAnswer: q.answers.find(a => a.authorId === me.id) ?? null,
    partnerAnswered: q.answers.some(a => a.authorId !== me.id),
    revealed: bothAnswered,
    answers: bothAnswered ? q.answers : null,
  });
});
```

Latency artifisial itu penting. Tanpa itu skeleton dan error state hanya ditempel di akhir dan
selalu salah.

### 5.4 Dev user switcher (wajib)

Tombol floating: **"Jadi Danar / Jadi Nia"**. Mengganti `session.devUserId`, lalu `refreshNuxtData()`.

Tanpa ini kamu tidak bisa menguji:
- Daily question reveal (butuh dua jawaban)
- Waiting state ("Nia belum menjawab")
- Mood partner
- Invite code redeem
- Love letter dari sisi penerima
- Private journal yang tidak boleh terlihat partner

Bungkus dengan `<div v-if="cfg.enableDevTools">` dan pastikan tree-shaken di build produksi.

### 5.5 Seed data

Pakai contoh dari spec supaya screenshot langsung enak dilihat:

```text
Couple      : DANAR & NIA
Sejak       : 847 hari (relationshipDate = today - 847d)
Memories    : 37 (tersebar 2025–2026, 8 lokasi, 3 trip)
Events      : 12 (2 upcoming, termasuk "Date Night · Sab 19:00 · Rp250.000")
Journal     : 9 entri (5 shared, 4 private milik Danar)
Mood        : 14 hari terakhir, dua user
Questions   : 30 hari terakhir terjawab, hari ini baru Danar yang jawab
Wishlist    : 6 item, 2 selesai
Milestones  : First Met, First Date, Official, 1 Year, First Trip, 2 Year
Letters     : 1 terkunci (14 Feb 2027), 1 sudah terbuka
Streak      : 14
```

---

## 6. Inventaris layar (~46 layar)

Kerjakan **berurutan per batch**. Jangan buka batch berikutnya sebelum batch sebelumnya
lulus checklist §7.

### Batch 1A — P0 (20 layar)

| Route | Layar | Catatan |
|---|---|---|
| `/` | Landing | Hero, value prop, CTA. Boleh animasi lebih bebas (marketing) |
| `/login` | Login | Email + Google button (mock) |
| `/register` | Register | |
| `/forgot` | Forgot password | Cukup sampai state "email terkirim" |
| `/onboarding/couple` | Create atau Join | Dua pilihan besar |
| `/onboarding/invite` | Invite code + share sheet | Tampilkan `JOIN-8F4K2`, copy, WhatsApp share |
| `/onboarding/join` | Masukkan kode | State: valid, expired, sudah dipakai, penuh |
| `/onboarding/setup` | Relationship date, nama, foto | Label date: first met / first date / official / engagement / wedding |
| `/onboarding/waiting` | Menunggu partner join | Polling mock |
| `/home` | Dashboard | Counter, today's question, memory terbaru, event malam ini |
| `/memories` | Timeline | Group per bulan, sticky year header |
| `/memories/[id]` | Detail | Galeri, lokasi, tanggal, caption |
| `/memories/new` | Upload sheet | Multi-foto, caption, tanggal, lokasi |
| `/calendar` | Month grid | Dot indikator, tap tanggal → list |
| `/calendar/[id]` | Event detail | |
| `/calendar/new` | Event form | Judul, tanggal, jam, lokasi, budget, notes, reminder |
| `/daily` | Question hari ini | 3 state: belum jawab, menunggu partner, revealed |
| `/dates/wishlist` | Wishlist | Checklist, tambah, siapa yang menambahkan |
| `/dates/planner` | Planner input | Budget, lokasi, durasi, mood, transport |
| `/dates/planner/result` | Hasil rencana | Timeline jam, total biaya, save / add to calendar |
| `/settings` | Settings dasar | Profil, couple, theme, logout |

### Batch 1B — P1 (16 layar)

| Route | Layar |
|---|---|
| `/journal` | List, filter private/shared |
| `/journal/new`, `/journal/[id]` | Editor + detail, toggle visibility |
| `/mood` | Check-in hari ini + riwayat 14 hari |
| `/mood/partner` | Mood partner + catatan |
| `/milestones` | Timeline tahunan |
| `/milestones/new` | Form milestone |
| `/games` | Hub |
| `/games/know-me` | How Well Do You Know Me |
| `/games/this-or-that` | This or That |
| `/games/would-you-rather` | Would You Rather |
| `/games/guess` | Guess My Answer |
| `/games/result` | Hasil + skor |
| `/notifications` | Notification center |
| `/settings/notifications` | Preferensi per kategori |

### Batch 1C — P2/P3 shell (10 layar)

| Route | Layar | Batas fase ini |
|---|---|---|
| `/letters` | List surat | |
| `/letters/new` | Compose + pilih unlock | |
| `/letters/[id]` | Locked / unlocked | Animasi unlock (delight) |
| `/streak` | Streak + badges | |
| `/recap/[year]` | Yearly recap | Statistik dari seed |
| `/settings/theme` | Theme picker | |
| `/assistant` | AI assistant shell | Respons **kaleng dari fixture**. Tanpa SDK AI |
| `/assistant/date`, `/assistant/question` | Generator shell | Chip prompt → fixture |
| `/premium` | Paywall + plan compare | Tanpa payment gateway |

Untuk 1C, "shell" berarti UI penuh dengan data fixture. Menyambungkan AI atau pembayaran di fase
ini hanya menambah biaya dan variabel yang belum perlu.

---

## 7. Definition of Done

Fase 1 selesai kalau semua ini terpenuhi:

- [ ] Semua route reachable dari navigasi. Tidak ada dead-end tanpa tombol kembali
- [ ] **Setiap layar punya 4 state**: loading (skeleton menyerupai konten), empty, error dengan retry, ideal
- [ ] Flow reveal daily question terbukti benar lewat dev user switcher
- [ ] Flow invite terbukti untuk 4 kondisi: valid, expired, sudah dipakai, couple penuh
- [ ] Private journal Danar tidak muncul saat switch ke Nia
- [ ] BaseSheet swipe-to-dismiss terasa benar di **HP fisik** via IP LAN
- [ ] Nol pelanggaran tabel §4.4 (bikin grep sederhana untuk `transition: all`, `ease-in`, `scale(0)`)
- [ ] Dark mode benar di semua layar, bukan hanya di home
- [ ] `prefers-reduced-motion` diuji dengan flag OS menyala
- [ ] Lighthouse mobile ≥ 90, PWA installable, offline fallback muncul
- [ ] Scroll timeline 37 memory tetap 60fps di HP fisik
- [ ] `packages/contracts` lengkap untuk semua endpoint yang dipakai, dan **dibekukan**
- [ ] Semua route mock di `server/api` mirror 1:1 dengan path di contracts

Poin terakhir menentukan kelancaran Fase 2. Review kontrak seolah kamu adalah tim backend
berbeda yang harus mengimplementasikannya tanpa bertanya.

---

## 8. Estimasi

| Batch | Isi | Hari kerja |
|---|---|---|
| 0 | Monorepo, contracts, tokens, 6 komponen dasar | 2–3 |
| 1A | 20 layar P0 | 6–8 |
| 1B | 16 layar P1 | 5–6 |
| 1C | 10 layar shell | 3–4 |
| | **Total Fase 1** | **16–21** |

Batch 0 sering diremehkan. Kalau BaseSheet dan token motion belum benar, 46 layar setelahnya akan
mewarisi kesalahan yang sama dan biaya perbaikannya berkali lipat.

---

## 9. Jebakan yang paling sering kena

| Jebakan | Pencegahan |
|---|---|
| Komponen langsung import fixture JSON | Semua data lewat `useApi()`. Tanpa pengecualian |
| Logika reveal ditaruh di frontend | Kontrak sudah `answers: nullable`. Mock server yang memutuskan |
| `daysTogether` dihitung dengan `new Date()` browser | Pakai `utils/date.ts` yang timezone-aware sejak awal |
| Glass ditumpuk 3 lapis di home | Budget 2 layer, diuji di HP fisik tiap batch |
| Dev user switcher lolos ke build produksi | Gate dengan env + cek bundle sebelum Fase 3 |
| Semua layar dikerjakan paralel, tidak ada yang selesai | Satu batch tuntas dan lulus checklist, baru lanjut |
| Games dikerjakan lebih dulu karena lebih menyenangkan | Urutan batch adalah urutan nilai produk |
