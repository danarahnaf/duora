# Fase 2 — Backend NestJS + Prisma

> **Target fase:** menggantikan mock server satu modul per satu, tanpa aplikasi pernah mati.
> **Prasyarat:** `packages/contracts` sudah dibekukan di akhir Fase 1.
> **Peran Supabase di fase ini:** hanya PostgreSQL + Object Storage. Auth ditangani NestJS sendiri.

---

## 1. Stack

```text
NestJS 11           modular, dependency injection
Prisma 6            ORM + migration
PostgreSQL          Supabase (dev: bisa Docker lokal)
zod                 validasi via packages/contracts
argon2              password hashing (bukan bcrypt)
@nestjs/jwt         access + refresh token
@nestjs/throttler   rate limit
@nestjs/swagger     OpenAPI, dipakai untuk verifikasi kontrak
pino                structured logging
```

Pakai **argon2id**, bukan bcrypt. bcrypt memotong password di 72 byte dan lebih lemah terhadap
serangan GPU.

Validasi tetap pakai zod dari `packages/contracts` lewat custom `ZodValidationPipe`, bukan
`class-validator`. Alasannya satu: satu definisi dipakai frontend dan backend, jadi kontrak tidak
bisa diam-diam melenceng.

---

## 2. Bootstrap

```bash
cd apps
pnpm dlx @nestjs/cli new api --package-manager pnpm --skip-git
cd api
pnpm add @nestjs/config @nestjs/jwt @nestjs/passport passport passport-jwt \
         @nestjs/throttler @nestjs/swagger argon2 zod nestjs-pino pino-http \
         @supabase/supabase-js
pnpm add -D prisma @types/passport-jwt
pnpm add @couple/contracts --workspace
pnpm prisma init --datasource-provider postgresql
```

Dev lokal pakai Postgres Docker dulu, jangan langsung Supabase. Iterasi migration jauh lebih cepat
dan tidak menghabiskan kuota koneksi.

```bash
docker run -d --name couple-db -p 5432:5432 \
  -e POSTGRES_PASSWORD=dev -e POSTGRES_DB=couple postgres:16-alpine
```

`apps/api/.env`:

```env
DATABASE_URL="postgresql://postgres:dev@localhost:5432/couple"
DIRECT_URL="postgresql://postgres:dev@localhost:5432/couple"

JWT_ACCESS_SECRET="..."
JWT_REFRESH_SECRET="..."
ACCESS_TTL="15m"
REFRESH_TTL="30d"

GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

SUPABASE_URL="https://xxx.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="..."       # backend only, JANGAN pernah ke frontend
STORAGE_BUCKET_MEMORIES="memories"

CORS_ORIGINS="http://localhost:3000"
DEFAULT_TIMEZONE="Asia/Jakarta"
```

---

## 3. Struktur folder `apps/api`

```text
prisma/
├── schema.prisma
├── migrations/
└── seed.ts                    # 300+ daily question, konten 4 game

src/
├── common/
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── couple-member.guard.ts     ← inti keamanan aplikasi ini
│   ├── decorators/
│   │   ├── current-user.decorator.ts
│   │   ├── couple-scope.decorator.ts
│   │   └── public.decorator.ts
│   ├── pipes/zod-validation.pipe.ts
│   ├── filters/all-exceptions.filter.ts
│   └── interceptors/logging.interceptor.ts
├── infra/
│   ├── prisma/prisma.service.ts
│   ├── storage/storage.service.ts     # signed upload URL Supabase
│   └── clock/clock.service.ts         # localDate(timezone) — jangan pakai new Date() liar
├── modules/
│   ├── auth/       register login refresh logout google
│   ├── users/      profil, avatar, timezone
│   ├── couples/    create, profil, relationship date, leave
│   ├── invites/    generate, redeem, revoke
│   ├── daily/      question hari ini, answer, reveal, riwayat
│   ├── memories/   CRUD + signed upload
│   ├── journal/    private & shared
│   ├── mood/       check-in harian
│   ├── calendar/   CRUD event
│   ├── dates/      wishlist + date plan
│   ├── milestones/
│   ├── letters/    love letter + gating unlock
│   ├── games/      sesi game
│   ├── streak/     kalkulasi, dipanggil interceptor
│   ├── notifications/
│   └── billing/    stub di fase ini
├── app.module.ts
└── main.ts

test/
├── e2e/            satu file per modul
└── fixtures/
```

---

## 4. Prisma + Supabase: konfigurasi yang menjatuhkan banyak orang

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")   // runtime, via pooler
  directUrl = env("DIRECT_URL")     // migration, koneksi langsung
}
```

Di produksi (Supabase):

```env
DATABASE_URL="postgresql://postgres.[ref]:[pass]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.[ref]:[pass]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
```

| Kesalahan | Akibat |
|---|---|
| Tanpa `?pgbouncer=true` | Error prepared statement acak dan sulit direproduksi di produksi |
| Tanpa `connection_limit=1` | Kuota koneksi Supabase habis begitu ada beberapa instance |
| Tanpa `directUrl` | `prisma migrate` gagal karena pooler tidak mendukung DDL sesi |
| Pakai port 5432 untuk runtime | Koneksi cepat habis pada host serverless/autoscale |

Uji konfigurasi ini di staging **sebelum** menulis banyak modul. Ini bug yang muncul hanya di
produksi kalau ditunda.

---

## 5. Schema awal

Titik awal, bukan final. Turunan dari §29 spec produk.

```prisma
generator client { provider = "prisma-client-js" }

enum CoupleRole        { OWNER MEMBER }
enum MemoryType        { PHOTO VIDEO TEXT LOCATION }
enum JournalVisibility { PRIVATE SHARED }
enum MoodLevel         { GREAT GOOD OKAY BAD TERRIBLE }
enum EventCategory     { DATE ANNIVERSARY BIRTHDAY TRIP REMINDER PERSONAL IMPORTANT }
enum QuestionCategory  { FUN ROMANTIC DEEP FUTURE MEMORIES RELATIONSHIP RANDOM LDR FUNNY }
enum LetterUnlockType  { DATE ANNIVERSARY BIRTHDAY CUSTOM }
enum DatePlanStatus    { DRAFT SAVED COMPLETED }
enum DatePlanSource    { MANUAL AI }

model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String?
  googleId     String?  @unique
  displayName  String
  avatarPath   String?
  timezone     String   @default("Asia/Jakarta")
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  membership     CoupleMember?
  refreshTokens  RefreshToken[]
  moods          MoodCheckin[]
  journalEntries JournalEntry[]
}

model RefreshToken {
  id        String    @id @default(uuid())
  userId    String
  tokenHash String    @unique
  familyId  String                     // deteksi reuse token
  expiresAt DateTime
  revokedAt DateTime?
  createdAt DateTime  @default(now())
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId])
}

model Couple {
  id                    String    @id @default(uuid())
  name                  String?
  photoPath             String?
  relationshipDate      DateTime  @db.Date
  relationshipDateLabel String    @default("official")
  theme                 String    @default("rose")
  timezone              String    @default("Asia/Jakarta")
  streakCount           Int       @default(0)
  streakLastActiveOn    DateTime? @db.Date
  createdAt             DateTime  @default(now())
  deletedAt             DateTime?

  members     CoupleMember[]
  invites     CoupleInvite[]
  memories    Memory[]
  journal     JournalEntry[]
  moods       MoodCheckin[]
  events      CalendarEvent[]
  datePlans   DatePlan[]
  wishlist    DateWishlistItem[]
  milestones  Milestone[]
  letters     LoveLetter[]
  dailies     CoupleDailyQuestion[]
  gameSessions GameSession[]
}

model CoupleMember {
  id       String     @id @default(uuid())
  coupleId String
  userId   String     @unique          // MVP: 1 user = 1 couple aktif
  role     CoupleRole @default(MEMBER)
  joinedAt DateTime   @default(now())

  couple Couple @relation(fields: [coupleId], references: [id], onDelete: Cascade)
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([coupleId, userId])
  @@index([coupleId])
}

model CoupleInvite {
  id          String    @id @default(uuid())
  coupleId    String
  codeHash    String    @unique        // hash, bukan kode mentah
  createdById String
  expiresAt   DateTime
  usedAt      DateTime?
  usedById    String?
  revokedAt   DateTime?
  createdAt   DateTime  @default(now())
  couple      Couple    @relation(fields: [coupleId], references: [id], onDelete: Cascade)
  @@index([coupleId])
}

model QuestionBank {
  id       String           @id @default(uuid())
  category QuestionCategory
  text     String
  locale   String           @default("id")
  isActive Boolean          @default(true)
  dailies  CoupleDailyQuestion[]
}

model CoupleDailyQuestion {
  id         String    @id @default(uuid())
  coupleId   String
  questionId String
  localDate  DateTime  @db.Date
  revealedAt DateTime?

  couple   Couple        @relation(fields: [coupleId], references: [id], onDelete: Cascade)
  question QuestionBank  @relation(fields: [questionId], references: [id])
  answers  DailyAnswer[]

  @@unique([coupleId, localDate])       // satu pertanyaan per couple per hari
  @@index([coupleId, localDate])
}

model DailyAnswer {
  id        String   @id @default(uuid())
  dailyId   String
  authorId  String
  body      String
  createdAt DateTime @default(now())
  daily     CoupleDailyQuestion @relation(fields: [dailyId], references: [id], onDelete: Cascade)
  @@unique([dailyId, authorId])         // satu jawaban per orang
}

model Memory {
  id         String     @id @default(uuid())
  coupleId   String
  authorId   String
  type       MemoryType @default(PHOTO)
  title      String?
  caption    String?
  happenedAt DateTime
  placeName  String?
  lat        Float?
  lng        Float?
  createdAt  DateTime   @default(now())
  deletedAt  DateTime?

  couple Couple        @relation(fields: [coupleId], references: [id], onDelete: Cascade)
  media  MemoryMedia[]

  @@index([coupleId, happenedAt(sort: Desc)])
}

model MemoryMedia {
  id          String @id @default(uuid())
  memoryId    String
  storagePath String
  mimeType    String
  width       Int?
  height      Int?
  sizeBytes   Int
  order       Int    @default(0)
  memory      Memory @relation(fields: [memoryId], references: [id], onDelete: Cascade)
  @@index([memoryId])
}

model JournalEntry {
  id         String            @id @default(uuid())
  coupleId   String
  authorId   String
  visibility JournalVisibility
  body       String
  entryDate  DateTime          @db.Date
  createdAt  DateTime          @default(now())
  updatedAt  DateTime          @updatedAt
  deletedAt  DateTime?

  couple Couple @relation(fields: [coupleId], references: [id], onDelete: Cascade)
  author User   @relation(fields: [authorId], references: [id], onDelete: Cascade)

  @@index([coupleId, entryDate(sort: Desc)])
  @@index([authorId, visibility])
}

model MoodCheckin {
  id        String    @id @default(uuid())
  coupleId  String
  userId    String
  level     MoodLevel
  note      String?
  localDate DateTime  @db.Date
  createdAt DateTime  @default(now())

  couple Couple @relation(fields: [coupleId], references: [id], onDelete: Cascade)
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, localDate])
  @@index([coupleId, localDate(sort: Desc)])
}

model CalendarEvent {
  id              String        @id @default(uuid())
  coupleId        String
  createdById     String
  title           String
  category        EventCategory @default(DATE)
  startAt         DateTime
  endAt           DateTime?
  allDay          Boolean       @default(false)
  placeName       String?
  budgetIdr       Int?
  notes           String?
  remindMinutes   Int?
  deletedAt       DateTime?
  couple          Couple        @relation(fields: [coupleId], references: [id], onDelete: Cascade)
  @@index([coupleId, startAt])
}

model DatePlan {
  id              String          @id @default(uuid())
  coupleId        String
  createdById     String
  title           String
  budgetIdr       Int?
  city            String?
  durationMinutes Int?
  mood            String?
  transport       String?
  status          DatePlanStatus  @default(DRAFT)
  source          DatePlanSource  @default(MANUAL)
  calendarEventId String?
  createdAt       DateTime        @default(now())
  couple          Couple          @relation(fields: [coupleId], references: [id], onDelete: Cascade)
  items           DatePlanItem[]
  @@index([coupleId])
}

model DatePlanItem {
  id               String   @id @default(uuid())
  planId           String
  order            Int
  startTime        String            // "16:30"
  title            String
  placeName        String?
  estimatedCostIdr Int?
  plan             DatePlan @relation(fields: [planId], references: [id], onDelete: Cascade)
  @@index([planId])
}

model DateWishlistItem {
  id          String    @id @default(uuid())
  coupleId    String
  createdById String
  title       String
  notes       String?
  isDone      Boolean   @default(false)
  doneAt      DateTime?
  order       Int       @default(0)
  couple      Couple    @relation(fields: [coupleId], references: [id], onDelete: Cascade)
  @@index([coupleId])
}

model Milestone {
  id         String   @id @default(uuid())
  coupleId   String
  title      String
  type       String
  happenedAt DateTime @db.Date
  note       String?
  memoryId   String?
  couple     Couple   @relation(fields: [coupleId], references: [id], onDelete: Cascade)
  @@index([coupleId, happenedAt])
}

model LoveLetter {
  id          String           @id @default(uuid())
  coupleId    String
  authorId    String
  recipientId String
  title       String
  body        String
  unlockType  LetterUnlockType
  unlockAt    DateTime
  openedAt    DateTime?
  createdAt   DateTime         @default(now())
  couple      Couple           @relation(fields: [coupleId], references: [id], onDelete: Cascade)
  @@index([coupleId, unlockAt])
  @@index([recipientId])
}

model GameSession {
  id          String    @id @default(uuid())
  coupleId    String
  gameKey     String
  startedById String
  status      String    @default("ACTIVE")
  payload     Json
  score       Int?
  completedAt DateTime?
  createdAt   DateTime  @default(now())
  couple      Couple    @relation(fields: [coupleId], references: [id], onDelete: Cascade)
  @@index([coupleId])
}

model Notification {
  id        String    @id @default(uuid())
  userId    String
  coupleId  String?
  type      String
  title     String
  body      String?
  data      Json?
  readAt    DateTime?
  createdAt DateTime  @default(now())
  @@index([userId, createdAt(sort: Desc)])
}
```

Keputusan yang sengaja diambil dan perlu kamu setujui:

| Keputusan | Konsekuensi |
|---|---|
| `CoupleMember.userId @unique` | Satu user hanya bisa punya satu couple aktif. Menyederhanakan seluruh scoping. Kalau nanti user putus dan mau couple baru, butuh flow "leave couple" yang mengarsipkan data lama |
| `localDate @db.Date` di daily & mood | "Hari ini" ditentukan server dengan timezone couple, bukan timestamp UTC. Tanpa ini pasangan beda timezone akan melihat pertanyaan berbeda |
| Soft delete (`deletedAt`) di Memory, Journal, Event | Data emosional. Hard delete tidak bisa dibatalkan dan hampir pasti akan disesali user |
| `codeHash` di CoupleInvite | Kode mentah tidak disimpan. Kalau DB bocor, invite lama tidak bisa dipakai |
| `storagePath`, bukan URL | URL Supabase adalah signed dan kadaluarsa. Simpan path, generate URL saat dibaca |

---

## 6. Invariant keamanan — kerjakan sebelum modul bisnis apa pun

Ini bagian paling penting di seluruh Fase 2. Kebocoran data pasangan lain adalah kegagalan
terburuk yang bisa dialami produk ini.

### 6.1 Couple scoping otomatis

```ts
// common/guards/couple-member.guard.ts
@Injectable()
export class CoupleMemberGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest();
    const membership = await this.prisma.coupleMember.findUnique({
      where: { userId: req.user.sub },
      select: { coupleId: true, role: true },
    });
    if (!membership) throw new ForbiddenException('NO_COUPLE');

    // coupleId HANYA dari token/DB, tidak pernah dari body atau param
    req.coupleId = membership.coupleId;
    return true;
  }
}
```

Setiap query berisi `where: { coupleId: req.coupleId }`. `coupleId` tidak boleh pernah dibaca dari
`body`, `query`, atau `param`. Kalau bisa dibaca dari request, siapa pun bisa membaca data
pasangan lain hanya dengan menukar satu UUID.

Terapkan `CoupleMemberGuard` sebagai **global guard** pada semua controller kecuali `auth`,
`users/me`, dan `couples/create`. Default harus aman, bukan opt-in.

### 6.2 Reveal gate di server

```ts
const answers = await this.prisma.dailyAnswer.findMany({ where: { dailyId } });
const revealed = answers.length === 2;

return {
  myAnswer: answers.find(a => a.authorId === userId) ?? null,
  partnerAnswered: answers.some(a => a.authorId !== userId),
  revealed,
  answers: revealed ? answers : null,   // null, bukan array kosong
};
```

Kalau gate ini ada di frontend, jawaban partner terbaca dari network tab dan seluruh mekanik
fitur utama produk ini rusak.

### 6.3 Love letter gating

Endpoint list hanya mengirim metadata (`title`, `unlockAt`, `authorId`). Endpoint detail menolak
dengan `423 Locked` kalau `unlockAt > now`. `body` tidak pernah dikirim sebelum waktunya.

### 6.4 Private journal

```ts
where: {
  coupleId,
  deletedAt: null,
  OR: [
    { visibility: 'SHARED' },
    { visibility: 'PRIVATE', authorId: userId },
  ],
}
```

Difilter di query, bukan disembunyikan di UI.

### 6.5 Invite code

- Kode 8 karakter, alfabet tanpa karakter ambigu (`0/O`, `1/I/l`)
- Simpan `sha256(code)`, bukan kodenya
- TTL 48 jam, single-use, revocable
- Rate limit redeem: 5 percobaan / 10 menit / IP
- Tolak jika couple sudah punya 2 member, atau jika user sudah punya membership
- Redeem dalam satu transaksi dengan pemeriksaan kapasitas di dalamnya, supaya dua orang tidak
  bisa redeem serentak dan couple jadi berisi 3 orang

### 6.6 Waktu dan streak dihitung server

```ts
// infra/clock/clock.service.ts
localDate(timezone: string, at = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(at);                       // → "2026-09-09"
}
```

Streak naik saat ada aktivitas yang dihitung (jawab pertanyaan, journal, mood, game, memory) pada
`localDate` couple. Streak putus tidak boleh memblokir fitur apa pun. Ini prinsip produk §39.7
dan harus dijaga di kode, bukan hanya di dokumen.

### 6.7 Auth

| Item | Nilai |
|---|---|
| Password hash | argon2id |
| Access token | JWT 15 menit, dikirim via `Authorization` header |
| Refresh token | 30 hari, httpOnly + Secure + SameSite=Lax cookie |
| Rotasi refresh | Setiap refresh mengeluarkan token baru, yang lama di-revoke |
| Deteksi reuse | Kalau token yang sudah revoked dipakai, revoke seluruh `familyId` |
| Rate limit login | 10 / 15 menit / IP + email |
| Google OAuth | `googleId` unik, digabung ke akun kalau email sama dan sudah terverifikasi |

---

## 7. Peta endpoint

Semua di bawah prefix `/v1`. Path harus **identik** dengan mock di `apps/web/server/api`.

| Modul | Endpoint |
|---|---|
| auth | `POST /auth/register` `POST /auth/login` `POST /auth/refresh` `POST /auth/logout` `GET /auth/google` `GET /auth/google/callback` |
| users | `GET /users/me` `PATCH /users/me` `POST /users/me/avatar-url` |
| couples | `POST /couples` `GET /couples/me` `PATCH /couples/me` `POST /couples/me/leave` |
| invites | `POST /invites` `GET /invites/active` `POST /invites/redeem` `DELETE /invites/:id` |
| daily | `GET /daily/today` `POST /daily/answer` `GET /daily/history?cursor=` |
| memories | `GET /memories?cursor=&month=` `POST /memories` `GET /memories/:id` `PATCH /memories/:id` `DELETE /memories/:id` `POST /memories/upload-url` |
| journal | `GET /journal?visibility=` `POST /journal` `GET /journal/:id` `PATCH /journal/:id` `DELETE /journal/:id` |
| mood | `GET /mood/today` `POST /mood` `GET /mood/history?days=14` |
| calendar | `GET /calendar?from=&to=` `POST /calendar` `GET /calendar/:id` `PATCH /calendar/:id` `DELETE /calendar/:id` `GET /calendar/upcoming` |
| dates | `GET /dates/wishlist` `POST /dates/wishlist` `PATCH /dates/wishlist/:id` `DELETE /dates/wishlist/:id` `POST /dates/plans` `GET /dates/plans` `GET /dates/plans/:id` `PATCH /dates/plans/:id` |
| milestones | `GET /milestones` `POST /milestones` `PATCH /milestones/:id` `DELETE /milestones/:id` |
| letters | `GET /letters` `POST /letters` `GET /letters/:id` (423 jika terkunci) `POST /letters/:id/open` |
| games | `GET /games` `POST /games/:key/sessions` `PATCH /games/sessions/:id` `GET /games/sessions/:id` |
| streak | `GET /streak` |
| notifications | `GET /notifications` `POST /notifications/:id/read` `GET /notifications/preferences` `PATCH /notifications/preferences` |
| health | `GET /health` (tanpa auth, untuk healthcheck host) |

Pagination pakai **cursor**, bukan offset. Timeline memory akan tumbuh terus dan offset makin
lambat serta bisa melewatkan item saat ada penambahan.

---

## 8. Upload media

Browser upload **langsung** ke Supabase Storage. Backend tidak pernah menerima file.

```text
1. Web  → POST /memories/upload-url  { filename, mimeType, sizeBytes }
2. API  → validasi: mime whitelist, maks 10MB/file, maks 10 file/memory, kuota plan
3. API  → supabase.storage.from('memories')
             .createSignedUploadUrl(`${coupleId}/${uuid}.${ext}`)
4. Web  → PUT file ke signed URL (progress bar di sini)
5. Web  → POST /memories { caption, happenedAt, media: [{ storagePath, ... }] }
6. API  → verifikasi objek benar ada dan prefix path == coupleId, lalu simpan row
```

Langkah 6 tidak boleh dilewati. Tanpa verifikasi prefix, klien bisa mengklaim path milik couple
lain. Bucket harus **private**; pembacaan selalu lewat signed URL berumur pendek (misal 1 jam)
yang digenerate saat response.

---

## 9. Cutover dari mock ke API nyata

Jangan matikan mock sekaligus. Migrasi per modul:

1. Aktifkan Swagger di NestJS, generate `openapi.json`
2. Bandingkan dengan `packages/contracts`. Selisihnya adalah kontrak yang harus disepakati sebelum
   lanjut, bukan setelah
3. Implementasi modul, jalankan e2e-nya
4. Di `apps/web`, **hapus** folder `server/api/<modul>/`
5. Karena `useApi()` mem-fallback ke `/api`, path yang sudah dihapus akan 404 dan langsung terlihat.
   Setelah `NUXT_PUBLIC_API_BASE` diarahkan ke NestJS, seluruh path pindah sekaligus

Untuk masa transisi, jalankan dua base URL berdampingan dengan aturan per-prefix di `useApi()`:

```ts
const REAL = ['/auth', '/users', '/couples', '/invites'];   // tambah seiring modul selesai
const base = REAL.some(p => path.startsWith(p)) ? cfg.apiBase : '/api';
```

Hapus mekanisme ini beserta seluruh folder `server/` di akhir fase.

**Urutan modul** (jangan diacak, ada dependensi):

```text
1. auth + users            (4–5 hari, termasuk guard & rotasi refresh)
2. couples + invites       (2–3 hari)
3. daily                   (2 hari, logika reveal + localDate)
4. memories + storage      (2–3 hari)
5. calendar                (1–2 hari)
6. dates (wishlist + plan) (2 hari)
7. journal + mood + milestones (2 hari)
8. games + streak + letters    (2–3 hari)
9. notifications + billing stub (1–2 hari)
```

Modul 1 terlihat kecil tapi di dalamnya ada guard, scoping, rotasi refresh, dan Google OAuth.
Jangan dikompres. Semua modul setelahnya mewarisi kebenarannya.

---

## 10. Testing

Prioritaskan e2e per modul di atas unit test. Yang berisiko di aplikasi ini adalah **otorisasi**,
bukan kalkulasi.

Skenario yang wajib ada:

- [ ] User A tidak bisa membaca memory milik couple B (uji dengan menukar UUID di URL)
- [ ] `GET /daily/today` tidak mengembalikan `answers` sebelum keduanya menjawab
- [ ] Jawaban kedua untuk pertanyaan yang sama ditolak (`@@unique([dailyId, authorId])`)
- [ ] `GET /letters/:id` mengembalikan 423 sebelum `unlockAt`
- [ ] Private journal A tidak muncul di list B
- [ ] Invite: expired, sudah dipakai, direvoke, couple penuh, dua redeem serentak
- [ ] Refresh token yang sudah dipakai memicu revoke seluruh family
- [ ] `localDate` benar untuk couple bertimezone berbeda dari server
- [ ] Streak putus tidak memblokir endpoint apa pun
- [ ] `upload-url` menolak path dengan prefix coupleId lain

Pakai Testcontainers untuk Postgres. Jangan tes terhadap Supabase, kuota koneksi akan habis dan
tes jadi lambat serta flaky.

---

## 11. Definition of Done

- [ ] Seluruh path di `packages/contracts` terimplementasi dan lolos validasi zod di dua arah
- [ ] `apps/web/server/` sudah dihapus total
- [ ] `CoupleMemberGuard` terpasang global; controller yang dikecualikan didaftar eksplisit dan direview
- [ ] 10 skenario §10 lulus
- [ ] `prisma migrate deploy` sukses di staging Supabase dengan pooler config §4
- [ ] Seed berisi minimal 300 pertanyaan (agar tidak berulang dalam setahun) dan konten 4 game
- [ ] Swagger tersedia di staging, ditutup di produksi
- [ ] Rate limit aktif di `auth` dan `invites/redeem`
- [ ] Structured logging dengan `requestId`, tanpa mencetak token/password/isi journal
- [ ] Semua error mengembalikan bentuk yang sama dan tidak membocorkan stack trace

Catatan logging: jangan pernah log isi journal, jawaban daily question, atau body love letter.
Ini data paling privat di aplikasi ini dan log biasanya berakhir di pihak ketiga.

---

## 12. Estimasi

| Blok | Hari kerja |
|---|---|
| Setup, Prisma schema, migration awal, guard & scoping | 3–4 |
| Modul 1–4 (auth, couples, daily, memories) | 8–10 |
| Modul 5–9 | 6–8 |
| Testing e2e + cutover + perapian | 3–4 |
| **Total Fase 2** | **20–26** |

Lebih panjang dari estimasi awal karena auth + guard dinaikkan jadi 4–5 hari. Memangkas bagian
ini adalah penghematan yang paling mahal di proyek seperti ini.
