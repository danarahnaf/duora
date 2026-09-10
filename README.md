# couple-app — Fase 1 (Frontend + Dummy Data)

Implementasi `docs/01-frontend.md` (spesifikasi lengkap Fase 1–3 ada di `docs/`). Tidak ada database, tidak ada auth nyata,
tidak ada SDK AI, tidak ada payment gateway. 47 layar, semuanya jalan di atas
mock server Nitro yang path-nya mirror 1:1 dengan NestJS di Fase 2.

## Jalankan

Jalankan dari folder ini (`couple-app`), bukan dari folder induk:

```bash
cd H:\Danar\@CODING\project\couple-app
pnpm install
pnpm dev              # http://localhost:3000
pnpm dev:lan          # dengar di semua network interface, untuk uji di HP fisik
```

`pnpm dev:lan` mencetak URL LAN (mis. `http://192.168.1.x:3000`). Buka URL itu di
HP yang satu Wi-Fi. Kalau tidak terbuka, izinkan Node lewat Windows Defender
Firewall untuk jaringan privat.

## Verifikasi

```bash
pnpm verify           # motion + kontrak + typecheck + build
pnpm lint:motion      # grep aturan §4.4 (transition:all, ease-in, scale(0), dll)
pnpm lint:contracts   # setiap path kontrak punya route mock yang mirror
pnpm typecheck
pnpm build
```

## Struktur

| Folder | Isi |
|---|---|
| `packages/contracts` | **Source of truth** (zod). Frontend & backend Fase 2 mengimpor file yang sama. |
| `apps/web/app` | Layar, komponen, composable, store, design token. |
| `apps/web/server` | **MOCK SERVER** — dihapus total di akhir Fase 2. |
| `scripts` | Pemeriksa aturan motion & kontrak. |
| `AGENTS.md` | Konvensi implementasi + akun/kode uji. |

## Akun uji

Password apa saja (minimal 8 karakter).

- `danar@example.com` — sudah menjawab pertanyaan hari ini
- `nia@example.com` — belum menjawab (untuk menguji reveal)
- `alya@example.com`, `bima@example.com` — belum punya couple

Tombol dev di kanan bawah ("Jadi Danar / Jadi Nia") mengganti identitas tanpa
logout. Tanpa itu, reveal pertanyaan harian, waiting state, mood partner,
dan privasi jurnal tidak bisa diuji.

Kode invite: `JOIN-8F4K2` (couple penuh) · `JOIN-EXPRD` (kedaluwarsa) ·
`JOIN-USED1` (sudah dipakai). Untuk redeem yang sukses: Alya buat ruang → buat
kode → masuk sebagai Bima → gabung.

Kirim header `x-mock-fail-rate: 1` untuk memaksa error state.
`POST /api/mock/reset` mengembalikan seed ke kondisi awal.

## Kalau terasa lambat saat dev

`pnpm dev` meng-compile tiap route saat pertama dibuka, jadi navigasi pertama ke
sebuah layar memang lebih lambat. Untuk menilai kecepatan sebenarnya:

```bash
pnpm build && pnpm preview
```

Dua hal lain yang sengaja memperlambat, dan cara mematikannya:

| Sumber | Kendali |
|---|---|
| Latency buatan mock server (default 180ms) | `NUXT_PUBLIC_MOCK_LATENCY_MS=0` di `apps/web/.env` |
| Nuxt DevTools | mati secara default; nyalakan dengan `NUXT_DEVTOOLS=true pnpm dev` |

Jangan set latency ke 0 permanen — skeleton dan error state hanya bisa dinilai
benar kalau requestnya punya jeda (§5.3).

## Catatan

- `node_modules` tidak ikut di repo. Di Windows jalankan `pnpm install` sendiri;
  verifikasi di atas dijalankan di lingkungan Linux, jadi binary native
  (esbuild, rollup) perlu di-install ulang di mesinmu.
- Gambar memori di Fase 1 adalah SVG placeholder yang digenerate server
  (`/api/mock/media/...`), jadi timeline tetap benar saat offline.
