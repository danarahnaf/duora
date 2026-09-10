# Fase 3 — Deploy

> **Target fase:** aplikasi jalan di domain sendiri, bisa dipakai dua orang nyata di dua HP berbeda,
> dengan backup yang sudah terbukti bisa direstore.

---

## 1. Koreksi asumsi

**Supabase tidak bisa menghosting Nuxt maupun NestJS.** Supabase menyediakan Postgres, Storage,
Auth, dan Edge Functions (Deno). NestJS adalah aplikasi Node yang butuh container atau VM.

Dengan pilihan arsitektur kamu, "deploy di Supabase" hanya mencakup lapisan data:

| Komponen | Host | Peran |
|---|---|---|
| PostgreSQL | **Supabase** | Database utama |
| Object Storage | **Supabase** | Foto & video memory, avatar |
| NestJS API | Railway / Fly.io / Render / VPS | Butuh runtime Node |
| Nuxt 4 | Vercel / Cloudflare Pages / VPS yang sama | SSR + PWA |
| Supabase Auth | **tidak dipakai** | Auth ditangani NestJS (Fase 2 §6.7) |

Ini bukan masalah. Justru lebih murah dan lebih portabel: kalau nanti pindah dari Supabase, yang
berubah hanya connection string.

---

## 2. Topologi produksi

```text
                        Cloudflare DNS
                              │
              ┌───────────────┴───────────────┐
              │                               │
     app.brand.com                    api.brand.com
     Vercel / CF Pages                Railway / Fly.io (ap-southeast-1)
     Nuxt 4 SSR + PWA                 NestJS + Prisma
              │                               │
              └──────── HTTPS + CORS ─────────┘
                                              │
                              ┌───────────────┴──────────────┐
                              │                              │
                    Supabase Postgres              Supabase Storage
                    ap-southeast-1                 bucket private
                    pooler :6543 (runtime)         signed URL 1 jam
                    direct :5432 (migrate)
```

Semua komponen di region **Singapore (ap-southeast-1)**. Ini yang terdekat dari Indonesia dan
selisihnya terasa: memilih region US menambah 150–200ms per request.

---

## 3. Setup Supabase

### 3.1 Project

1. Buat project baru, region **Southeast Asia (Singapore)**
2. Simpan database password di password manager. Supabase tidak menampilkannya lagi
3. Buat **dua project terpisah**: `brand-staging` dan `brand-prod`. Jangan berbagi database antar
   environment. Satu `migrate reset` yang salah sasaran akan menghapus data produksi

### 3.2 Connection string

Settings → Database → Connection string:

```env
# Runtime — transaction pooler
DATABASE_URL="postgresql://postgres.[ref]:[pass]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# Migration — session pooler / direct
DIRECT_URL="postgresql://postgres.[ref]:[pass]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
```

Verifikasi sebelum lanjut:

```bash
pnpm --filter api prisma migrate deploy    # harus sukses → DIRECT_URL benar
pnpm --filter api start:prod               # panggil /health beberapa kali → DATABASE_URL benar
```

Kalau muncul error prepared statement yang muncul-hilang, `pgbouncer=true` belum terpasang.

### 3.3 Storage

Storage → New bucket, semua **private**:

| Bucket | Isi | Batas |
|---|---|---|
| `memories` | Foto & video memory | 10MB/file |
| `avatars` | Avatar user | 2MB/file |
| `couple-photos` | Foto couple | 5MB/file |

Struktur path wajib `{coupleId}/{uuid}.{ext}`. Prefix `coupleId` itulah yang diverifikasi backend
(Fase 2 §8 langkah 6).

Karena akses hanya lewat service role key dari backend, tidak ada policy yang perlu mengizinkan
klien. Tetap **aktifkan RLS** pada semua tabel dan bucket sebagai lapisan kedua, seandainya suatu
hari ada klien yang terhubung langsung.

### 3.4 Backup

| Tier | Backup |
|---|---|
| Free | Daily, retensi 7 hari, tanpa PITR |
| Pro | Daily + **Point-in-time recovery** |

Naikkan ke Pro sebelum user nyata masuk. Produk ini menyimpan foto dan tulisan yang tidak bisa
dibuat ulang. Kehilangan data di sini bukan sekadar bug, tapi kehilangan kepercayaan yang permanen.

**Uji restore satu kali secara nyata** sebelum launch. Backup yang belum pernah direstore belum
bisa disebut backup.

### 3.5 Yang tidak boleh dilakukan

- `SUPABASE_SERVICE_ROLE_KEY` tidak boleh pernah masuk ke bundle Nuxt. Grep bundle produksi untuk
  memastikan
- Jangan expose `anon key` sama sekali. Arsitektur ini tidak membutuhkannya
- Jangan jalankan `prisma migrate dev` menunjuk ke produksi. Hanya `migrate deploy`
- Jangan jalankan migration dari laptop. Selalu lewat CI

---

## 4. Matriks environment

| Variable | Local | Staging | Production |
|---|---|---|---|
| `DATABASE_URL` | Postgres Docker | staging pooler | prod pooler |
| `DIRECT_URL` | Postgres Docker | staging direct | prod direct |
| `JWT_ACCESS_SECRET` | dev | unik | unik, dirotasi tahunan |
| `JWT_REFRESH_SECRET` | dev | unik | unik |
| `SUPABASE_SERVICE_ROLE_KEY` | staging | staging | prod |
| `CORS_ORIGINS` | `http://localhost:3000` | `https://staging.brand.com` | `https://app.brand.com` |
| `NUXT_PUBLIC_API_BASE` | `""` (mock) | `https://api-staging.brand.com/v1` | `https://api.brand.com/v1` |
| `NUXT_PUBLIC_ENABLE_DEV_TOOLS` | `true` | `true` | **`false`** |
| `SWAGGER_ENABLED` | `true` | `true` | **`false`** |
| `DEFAULT_TIMEZONE` | `Asia/Jakarta` | sama | sama |

Secret disimpan di secret manager host (Railway Variables / Fly Secrets / Vercel Env). Tidak pernah
di repo, termasuk tidak di `.env.staging` yang ikut ter-commit.

---

## 5. Migration lewat CI

```yaml
# .github/workflows/migrate.yml
name: migrate
on:
  workflow_dispatch:
    inputs:
      environment: { type: choice, options: [staging, production] }

jobs:
  migrate:
    runs-on: ubuntu-latest
    environment: ${{ inputs.environment }}     # production butuh approval reviewer
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter api prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          DIRECT_URL: ${{ secrets.DIRECT_URL }}
```

Aturan migration setelah ada user nyata:

| Perubahan | Cara aman |
|---|---|
| Tambah kolom nullable | Langsung aman |
| Tambah kolom NOT NULL | Dua langkah: tambah nullable + backfill, lalu set NOT NULL di migration berikutnya |
| Rename kolom | Tiga langkah: tambah baru, tulis ke keduanya, hapus lama setelah deploy stabil |
| Hapus kolom | Tunggu minimal satu rilis setelah kode berhenti memakainya |

Migration harus selalu **backward compatible** dengan versi API yang masih berjalan, karena
migration dan deploy tidak pernah benar-benar atomik.

---

## 6. Deploy NestJS

### 6.1 Dockerfile

```dockerfile
FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/contracts/package.json packages/contracts/
COPY apps/api/package.json apps/api/
RUN pnpm install --frozen-lockfile

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm --filter contracts build \
 && pnpm --filter api prisma generate \
 && pnpm --filter api build

FROM base AS runtime
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/prisma ./prisma
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3001/v1/health || exit 1
CMD ["node", "dist/main.js"]
```

### 6.2 Konfigurasi host

| Item | Nilai |
|---|---|
| Region | Singapore |
| Memory | 512MB cukup untuk awal, monitor lalu naikkan |
| Instance | 1. Jangan autoscale dulu, `connection_limit=1` per instance harus dihitung ulang |
| Healthcheck | `GET /v1/health` |
| Graceful shutdown | `app.enableShutdownHooks()` + tangani `SIGTERM`, agar request berjalan tidak terpotong |

### 6.3 Hardening `main.ts`

```ts
app.setGlobalPrefix('v1');
app.use(helmet());
app.enableCors({
  origin: process.env.CORS_ORIGINS!.split(','),
  credentials: true,                        // wajib, refresh token via cookie
});
app.use(cookieParser());
app.enableShutdownHooks();
if (process.env.SWAGGER_ENABLED === 'true') setupSwagger(app);
```

Trust proxy harus aktif di belakang reverse proxy, kalau tidak rate limit akan membaca IP proxy
dan memblokir semua user sekaligus.

---

## 7. Deploy Nuxt

Vercel atau Cloudflare Pages, keduanya cukup. Root directory `apps/web`, build command
`pnpm --filter web build`.

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE,
      enableDevTools: process.env.NUXT_PUBLIC_ENABLE_DEV_TOOLS === 'true',
    },
  },
  routeRules: {
    '/':        { isr: 3600 },   // landing di-cache
    '/home':    { ssr: true },
    '/login':   { prerender: true },
    '/memories/**': { ssr: true },
  },
});
```

Landing page harus cepat karena itu satu-satunya halaman yang dilihat orang sebelum memutuskan
mendaftar. Halaman di dalam app tidak perlu prerender, datanya per-couple.

Sebelum deploy pertama, verifikasi bahwa `apps/web/server/` sudah tidak ada dan
`DevUserSwitcher` tidak ikut ke bundle:

```bash
pnpm --filter web build
grep -ri "devuser\|X-Dev-User\|DANAR" apps/web/.output/ && echo "GAGAL: artefak dev ikut" || echo "OK"
```

---

## 8. PWA produksi

```ts
pwa: {
  registerType: 'prompt',        // bukan autoUpdate; reload paksa di tengah menulis journal itu buruk
  manifest: {
    name: 'Brand', short_name: 'Brand',
    theme_color: '#2b0f16', background_color: '#fdfcf9',
    display: 'standalone', orientation: 'portrait', start_url: '/home',
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,woff2,svg,png}'],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/api\.brand\.com\/v1\/.*/,
        handler: 'NetworkFirst',
        options: { cacheName: 'api', networkTimeoutSeconds: 5,
                   expiration: { maxEntries: 100, maxAgeSeconds: 300 } },
      },
      {
        urlPattern: /supabase\.co\/storage\/.*/,
        handler: 'CacheFirst',
        options: { cacheName: 'media', expiration: { maxEntries: 200, maxAgeSeconds: 604800 } },
      },
    ],
  },
}
```

`registerType: 'prompt'` bukan detail sepele. Update otomatis bisa me-reload halaman saat user
sedang menulis journal atau love letter, dan tulisan yang hilang di aplikasi seperti ini terasa
jauh lebih menyakitkan daripada di aplikasi biasa.

Signed URL Supabase punya query param yang berubah, jadi cache media harus memakai key tanpa
query, atau pakai TTL signed URL yang sama panjang dengan TTL cache.

**Checklist ikon:** 192px, 512px, dan 512px **maskable** (dengan safe area). Tanpa versi maskable,
ikon di Android akan terpotong.

---

## 9. Observability

| Kebutuhan | Tool | Yang dipantau |
|---|---|---|
| Error | Sentry (Nuxt + NestJS) | Kaitkan dengan `requestId` yang sama di dua sisi |
| Uptime | Better Stack / UptimeRobot | `GET /v1/health` tiap 1 menit |
| Log | Log host + pino | Structured, dengan `requestId` |
| DB | Supabase dashboard | Koneksi aktif, slow query, disk |
| Produk | PostHog / Umami | Event aktivasi di bawah |

Event produk yang wajib ada sejak hari pertama (dari spec §37–38):

```text
signup_completed
couple_created
invite_sent
partner_joined          ← EVENT AKTIVASI UTAMA
both_answered_first     ← interaksi bersama pertama
first_memory_created
first_event_created
returned_next_day
```

Metrik yang diukur adalah **active couples**, bukan registered users. 10.000 user dengan 2.000
couple aktif adalah produk yang berbeda dari 10.000 user dengan 4.500 couple aktif, dan hanya
angka kedua yang menentukan apakah produk ini hidup.

Alert minimal: error rate > 2% selama 5 menit, p95 latency > 1.5s, koneksi DB > 70% kuota,
healthcheck gagal 2× berurutan.

**Jangan log** isi journal, jawaban daily question, atau body love letter. Log biasanya berakhir di
layanan pihak ketiga, dan ini data paling privat di aplikasi.

---

## 10. Estimasi biaya bulanan (awal)

| Item | Biaya |
|---|---|
| Supabase Pro (wajib untuk PITR) | ~$25 |
| Railway / Fly.io API 512MB | ~$5–10 |
| Vercel Hobby atau CF Pages | $0 |
| Domain | ~$12/tahun |
| Sentry / PostHog free tier | $0 |
| **Total** | **~$30–35/bulan** |

Dengan target harga premium Rp19.900–29.900 per couple, break-even sekitar **20 couple berbayar**.

---

## 11. Checklist go-live

### Blocker (harus selesai sebelum apa pun)

- [ ] **Nama brand final.** Cek trademark, domain, handle sosial, dan produk sejenis yang sudah ada.
      Nama "CoupleOS" tidak boleh dipakai
- [ ] Domain terdaftar, DNS aktif
- [ ] Privacy policy & Terms of Service terpublikasi. **Wajib** untuk verifikasi Google OAuth
- [ ] Google OAuth consent screen sudah approved. Prosesnya bisa berhari-hari, ajukan di hari
      pertama Fase 3

### Teknis

- [ ] Staging berjalan penuh dan sudah dites end-to-end
- [ ] `prisma migrate deploy` sukses di produksi
- [ ] Bucket private, path prefix diverifikasi backend
- [ ] Backup Pro aktif dan **restore sudah diuji sekali**
- [ ] Semua secret di secret manager, nol secret di repo
- [ ] `SWAGGER_ENABLED=false` di produksi
- [ ] `NUXT_PUBLIC_ENABLE_DEV_TOOLS=false`, bundle sudah di-grep bersih
- [ ] `apps/web/server/` sudah dihapus
- [ ] Seed DANAR & NIA **tidak** ada di database produksi
- [ ] CORS hanya mengizinkan domain produksi
- [ ] Rate limit aktif di `auth` dan `invites/redeem`
- [ ] Cookie: httpOnly + Secure + SameSite=Lax
- [ ] Sentry menerima error dari kedua sisi
- [ ] Uptime monitor aktif

### Uji nyata sebelum diumumkan

- [ ] **Dua HP fisik berbeda, dua akun nyata, dua jaringan berbeda**
- [ ] Register → create couple → invite → join → setup → home, lancar tanpa jalan buntu
- [ ] Kedua orang menjawab daily question, reveal muncul di kedua sisi
- [ ] Upload 5 foto sekaligus di jaringan 4G, progress bar benar, tidak timeout
- [ ] Buat event, reminder tiba
- [ ] Install PWA di iOS Safari dan Android Chrome, buka dari home screen
- [ ] Airplane mode: offline fallback muncul, tidak layar putih
- [ ] iPhone lama (atau throttle CPU 4×): scroll timeline masih mulus dengan glass aktif

Item terakhir adalah tempat design direction glass paling mungkin gagal. Kalau drop frame, kurangi
layer glass sesuai budget di dokumen frontend §4.2.

---

## 12. Rencana rollback

| Masalah | Tindakan |
|---|---|
| API rusak setelah deploy | Rollback ke image sebelumnya di host (Railway/Fly menyimpan riwayat) |
| Web rusak | Vercel instant rollback ke deployment sebelumnya |
| Migration merusak data | Restore PITR ke titik sebelum migration. **Ini alasan PITR wajib** |
| Kuota koneksi DB habis | Turunkan instance ke 1, pastikan `connection_limit=1`, cek koneksi menganggur |
| Storage bocor / path salah | Rotasi service role key, audit objek dengan prefix tidak sesuai |

Migration dan deploy kode dipisah menjadi dua langkah, dengan migration selalu backward
compatible. Dengan begitu rollback kode tidak pernah membutuhkan rollback database.

---

## 13. Estimasi

| Blok | Hari kerja |
|---|---|
| Supabase prod + staging, verifikasi connection string | 1 |
| Dockerfile, deploy API, domain, CORS, hardening | 1–2 |
| Deploy web, PWA produksi, ikon | 1 |
| Observability + analytics event | 1 |
| Uji restore backup + uji dua HP + perbaikan temuan | 1–2 |
| **Total Fase 3** | **5–7** |

Google OAuth verification berjalan paralel dan bisa lebih lama dari seluruh fase ini. Ajukan di
hari pertama, jangan di hari terakhir.

---

## 14. Setelah launch

Dua minggu pertama, hanya lihat empat angka:

```text
partner_activation_rate   = partner_joined / couple_created
first_interaction_rate    = both_answered_first / partner_joined
D1 couple retention
D7 couple retention
```

Kalau `partner_activation_rate` rendah, masalahnya ada di flow invite, bukan di jumlah fitur.
Menambah fitur baru sebelum angka ini sehat adalah cara tercepat membuang waktu, karena separuh
user tidak akan pernah sampai ke fitur mana pun.
