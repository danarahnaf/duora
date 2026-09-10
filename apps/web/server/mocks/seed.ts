import { QUESTIONS, questionForDate } from './questions';
import { GAME_ROUNDS } from './gamecontent';
import { mulberry32 } from './simulate';
import { dateToYmd, isoAt, serverLocalDate, shiftYmd, ymdToDate } from '../utils/clock';
import type { MockDb } from './db';
import type {
  DailyRow, EventRow, JournalRow, LetterRow, MemoryRow, MilestoneRow, MoodRow,
  NotificationRow, PrefRow, WishlistRow,
} from './types';
import type { MoodLevel, NotificationCategory } from '@couple/contracts';

const TZ = 'Asia/Jakarta';

/**
 * ID seed WAJIB berbentuk UUID: kontrak memakai z.string().uuid(), dan Fase 2
 * memakai kolom uuid Prisma. Deterministik supaya restart tidak mengubah tautan.
 */
let seq = 0;
function sid(bucket: number): string {
  seq += 1;
  const b = bucket.toString(16).padStart(4, '0');
  const n = seq.toString(16).padStart(12, '0');
  return `0000${b}-0000-4000-a000-${n}`;
}

export const IDS = {
  danar: '11111111-1111-4111-a111-111111111111',
  nia: '22222222-2222-4222-a222-222222222222',
  /** dua user tanpa couple — supaya alur create + redeem VALID bisa diuji utuh */
  alya: '33333333-3333-4333-a333-333333333333',
  bima: '44444444-4444-4444-a444-444444444444',
  couple: 'aaaaaaaa-0000-4000-a000-aaaaaaaaaaaa',
} as const;

const LOCATIONS = [
  'Kopi Kalyan, Malang', 'Pantai Balekambang', 'Bromo — Penanjakan',
  'Taman Bunga Selecta', 'Bioskop Malang Town Square', 'Rumah Nenek, Blitar',
  'Ubud, Bali', 'Alun-alun Kota Batu',
];

const MEMORY_CAPTIONS = [
  'Hujan turun tepat waktu kita keluar. Nggak ada yang menyesal.',
  'Kamu ketiduran di jalan dan aku motret diam-diam.',
  'Kopi pertama yang kita sepakat enak.',
  'Sunrise-nya telat, tapi tanganmu hangat.',
  'Kita salah jalan tiga kali dan tetap ketawa.',
  'Foto ini blur, tapi ini yang paling aku suka.',
  'Kamu bilang "ayo lagi tahun depan". Aku pegang janjinya.',
  'Nggak ada rencana. Ternyata itu bagusnya.',
  'Bekal buatanmu, pertama kali.',
  'Aku ingat baunya lebih dulu daripada tempatnya.',
  'Kita duduk dua jam cuma buat lihat orang lewat.',
  'Hari biasa yang jadi favorit.',
];

const JOURNAL_SHARED = [
  { title: 'Rencana rumah kecil', body: 'Ngobrol soal rumah lagi. Kesepakatan sementara: dapur harus muat dua orang berdiri bareng, sisanya negotiable. Aku catat supaya nggak lupa waktu kita mulai serius nabung.' },
  { title: 'Kesepakatan kalau sedang berantem', body: 'Tiga hal: nggak ada yang tidur sebelum satu dari kita bilang "aku masih di sini", nggak bawa-bawa masa lalu, dan boleh minta jeda 20 menit tanpa dianggap kabur.' },
  { title: 'Catatan liburan Bromo', body: 'Yang berhasil: bawa jaket dobel, sewa jeep dari Tumpang. Yang gagal: berharap sunrise jam 5 tepat. Tahun depan datang sehari lebih awal.' },
  { title: 'Daftar makanan yang harus dicoba', body: 'Rawon Nguling, tahu telur depan pasar, dan tempat sate yang kamu ceritain terus tapi belum pernah kita datangi.' },
  { title: 'Hal kecil yang aku syukuri minggu ini', body: 'Kamu mengangkat telepon walaupun sedang sibuk. Itu saja, tapi itu banyak.' },
];

const JOURNAL_PRIVATE = [
  { title: 'Overthinking jam 1 pagi', body: 'Aku mikir soal kerjaan lagi dan ujungnya mikir soal kita. Nggak ada yang salah, cuma capek. Besok cerita ke dia kalau masih terasa.' },
  { title: 'Catatan buat diri sendiri', body: 'Jangan menunda ngobrol soal uang. Bukan karena mendesak, tapi karena lebih mudah dibicarakan sekarang daripada nanti.' },
  { title: 'Ide kado', body: 'Album cetak isi 12 foto, satu per bulan. Jangan bocor sampai Februari.' },
  { title: 'Yang belum aku bilang', body: 'Aku takut kalau semuanya terasa terlalu baik. Tapi mungkin memang boleh baik-baik saja.' },
];

const MOOD_NOTES: Record<MoodLevel, string[]> = {
  GREAT: ['Hari ini ringan banget', 'Kerjaan kelar cepat', 'Ketemu kamu = reset'],
  GOOD: ['Aman', 'Cukup produktif', 'Biasa tapi enak'],
  OKAY: ['Datar aja', 'Agak ngantuk', 'Nggak ada cerita'],
  BAD: ['Capek dan sensitif', 'Meeting panjang', 'Kurang tidur'],
  TERRIBLE: ['Berat, nanti aku cerita', 'Butuh dipeluk'],
};

export function seed(): MockDb {
  seq = 0;
  const rnd = mulberry32(20260909);
  const today = serverLocalDate(TZ);
  const relationshipDate = shiftYmd(today, -847);

  const users = [
    { id: IDS.danar, email: 'danar@example.com', displayName: 'Danar', avatarPath: 'avatars/danar', timezone: TZ, createdAt: isoAt(shiftYmd(today, -900), 8) },
    { id: IDS.nia, email: 'nia@example.com', displayName: 'Nia', avatarPath: 'avatars/nia', timezone: TZ, createdAt: isoAt(shiftYmd(today, -898), 8) },
    { id: IDS.alya, email: 'alya@example.com', displayName: 'Alya', avatarPath: null, timezone: TZ, createdAt: isoAt(shiftYmd(today, -30), 8) },
    { id: IDS.bima, email: 'bima@example.com', displayName: 'Bima', avatarPath: null, timezone: TZ, createdAt: isoAt(shiftYmd(today, -28), 8) },
  ];

  const couple = {
    id: IDS.couple,
    name: 'Danar & Nia',
    photoPath: 'couples/danar-nia',
    relationshipDate,
    relationshipDateLabel: 'official' as const,
    theme: 'rose',
    timezone: TZ,
    streakCount: 14,
    streakLongest: 31,
    streakLastActiveOn: today,
    createdAt: isoAt(shiftYmd(today, -847), 20),
  };

  const members = [
    { coupleId: couple.id, userId: IDS.danar, role: 'OWNER' as const, joinedAt: couple.createdAt },
    { coupleId: couple.id, userId: IDS.nia, role: 'MEMBER' as const, joinedAt: isoAt(shiftYmd(today, -846), 9) },
  ];

  // Invite: satu aktif, satu expired, satu sudah dipakai. Kode "penuh" diuji
  // lewat couple yang sudah 2 anggota (COUPLE_FULL).
  const invites = [
    { id: sid(0x10), coupleId: couple.id, code: 'JOIN-8F4K2', createdById: IDS.danar, expiresAt: isoAt(shiftYmd(today, 7), 20), usedAt: null, usedById: null, revokedAt: null },
    { id: sid(0x10), coupleId: couple.id, code: 'JOIN-EXPRD', createdById: IDS.danar, expiresAt: isoAt(shiftYmd(today, -3), 20), usedAt: null, usedById: null, revokedAt: null },
    { id: sid(0x10), coupleId: couple.id, code: 'JOIN-USED1', createdById: IDS.danar, expiresAt: isoAt(shiftYmd(today, 20), 20), usedAt: isoAt(shiftYmd(today, -846), 9), usedById: IDS.nia, revokedAt: null },
  ];

  // ---- Memories: 37, tersebar 2025–2026, 8 lokasi, 3 trip -------------------
  const memories: MemoryRow[] = [];
  const TRIPS = [
    { location: 'Bromo — Penanjakan', offset: -320, days: 3, caption: 'Trip Bromo' },
    { location: 'Ubud, Bali', offset: -180, days: 4, caption: 'Trip Bali' },
    { location: 'Pantai Balekambang', offset: -60, days: 2, caption: 'Trip pantai' },
  ];
  let mi = 0;
  for (const trip of TRIPS) {
    for (let d = 0; d < trip.days; d++) {
      const happenedAt = shiftYmd(today, trip.offset + d);
      memories.push({
        id: sid(0x20),
        coupleId: couple.id,
        type: 'PHOTO',
        caption: `${trip.caption} · hari ${d + 1}. ${MEMORY_CAPTIONS[mi % MEMORY_CAPTIONS.length]}`,
        happenedAt,
        location: trip.location,
        isFavorite: d === 0,
        createdById: mi % 2 ? IDS.danar : IDS.nia,
        createdAt: isoAt(happenedAt, 20),
        media: Array.from({ length: 1 + Math.floor(rnd() * 3) }, (_, k) => ({
          id: sid(0x21),
          storagePath: `${couple.id}/mem-${mi}-${k}`,
          width: 1200,
          height: 900,
        })),
      });
    }
  }
  while (memories.length < 37) {
    mi++;
    const happenedAt = shiftYmd(today, -Math.floor(rnd() * 600) - 5);
    const type = mi % 11 === 0 ? 'TEXT' : 'PHOTO';
    memories.push({
      id: sid(0x20),
      coupleId: couple.id,
      type,
      caption: MEMORY_CAPTIONS[mi % MEMORY_CAPTIONS.length] ?? null,
      happenedAt,
      location: LOCATIONS[mi % LOCATIONS.length] ?? null,
      isFavorite: mi % 7 === 0,
      createdById: mi % 2 ? IDS.danar : IDS.nia,
      createdAt: isoAt(happenedAt, 19),
      media: type === 'TEXT' ? [] : [{
        id: sid(0x21),
        storagePath: `${couple.id}/mem-${mi}-0`,
        width: 1200,
        height: 900,
      }],
    });
  }
  memories.sort((a, b) => (a.happenedAt < b.happenedAt ? 1 : -1));

  // ---- Daily questions: 30 hari terakhir terjawab, hari ini baru Danar ------
  const dailies: DailyRow[] = [];
  for (let i = 30; i >= 1; i--) {
    const localDate = shiftYmd(today, -i);
    const q = questionForDate(localDate);
    dailies.push({
      id: sid(0x30),
      coupleId: couple.id,
      questionId: q.id,
      localDate,
      answers: [
        { authorId: IDS.danar, body: answerFor(q.id, 'Danar', rnd), createdAt: isoAt(localDate, 21) },
        { authorId: IDS.nia, body: answerFor(q.id, 'Nia', rnd), createdAt: isoAt(localDate, 22) },
      ],
    });
  }
  const todayQ = questionForDate(today);
  dailies.push({
    id: sid(0x30),
    coupleId: couple.id,
    questionId: todayQ.id,
    localDate: today,
    answers: [
      { authorId: IDS.danar, body: 'Aku jawab dulu ya. Penasaran jawabanmu.', createdAt: isoAt(today, 9) },
    ],
  });

  // ---- Events: 12, 2 upcoming --------------------------------------------
  const events: EventRow[] = [
    ev('Date Night', 'DATE', nextSaturday(today), '19:00', 'Kopi Kalyan, Malang', 250_000, 'Meja di pojok, seperti biasa.', 120),
    ev('Ulang tahun Nia', 'BIRTHDAY', shiftYmd(today, 12), null, null, null, 'Kado sudah disiapkan.', 1440, true),
    ev('Nonton bareng', 'DATE', shiftYmd(today, -4), '20:30', 'Malang Town Square', 120_000, null, 60),
    ev('Anniversary ke-2', 'ANNIVERSARY', shiftYmd(today, -84), null, null, 500_000, 'Makan malam di tempat pertama kali.', 1440, true),
    ev('Kontrol dokter', 'IMPORTANT', shiftYmd(today, -20), '08:00', 'Klinik Sehat', null, null, 120),
    ev('Trip pantai', 'TRIP', shiftYmd(today, -60), '06:00', 'Pantai Balekambang', 800_000, 'Bawa tikar dan air banyak.', 720),
    ev('Reuni SMA Danar', 'PERSONAL', shiftYmd(today, -35), '18:00', 'Kota Batu', 150_000, null, 60),
    ev('Bayar sewa', 'REMINDER', shiftYmd(today, -9), '09:00', null, 1_500_000, null, 1440),
    ev('Kencan pasar malam', 'DATE', shiftYmd(today, -46), '18:30', 'Alun-alun Kota Batu', 90_000, null, 60),
    ev('Ke rumah nenek', 'TRIP', shiftYmd(today, -120), '07:00', 'Rumah Nenek, Blitar', 300_000, null, 720),
    ev('Servis motor', 'REMINDER', shiftYmd(today, -15), '10:00', null, 200_000, null, 120),
    ev('Piknik pagi', 'DATE', shiftYmd(today, -75), '07:30', 'Taman Bunga Selecta', 75_000, null, 60),
  ];

  // ---- Journal: 9 (5 shared, 4 private milik Danar) -----------------------
  const journal: JournalRow[] = [
    ...JOURNAL_SHARED.map((j, i) => jr(j, 'SHARED', i % 2 ? IDS.nia : IDS.danar, shiftYmd(today, -(i * 9 + 3)))),
    ...JOURNAL_PRIVATE.map((j, i) => jr(j, 'PRIVATE', IDS.danar, shiftYmd(today, -(i * 6 + 2)))),
  ];

  // ---- Mood: 14 hari terakhir, dua user ----------------------------------
  const LEVELS: MoodLevel[] = ['GREAT', 'GOOD', 'OKAY', 'BAD', 'TERRIBLE'];
  const moods: MoodRow[] = [];
  for (let i = 13; i >= 0; i--) {
    const localDate = shiftYmd(today, -i);
    for (const userId of [IDS.danar, IDS.nia]) {
      // hari ini: Nia sudah check-in, Danar belum → state "kamu belum check-in"
      if (i === 0 && userId === IDS.danar) continue;
      const level = LEVELS[Math.floor(rnd() * (i === 0 ? 2 : LEVELS.length))] ?? 'GOOD';
      const notes = MOOD_NOTES[level];
      moods.push({
        id: sid(0x40),
        coupleId: couple.id,
        userId,
        level,
        note: rnd() > 0.35 ? (notes[Math.floor(rnd() * notes.length)] ?? null) : null,
        localDate,
        createdAt: isoAt(localDate, 21),
      });
    }
  }

  // ---- Wishlist: 6 item, 2 selesai ---------------------------------------
  const wishlist: WishlistRow[] = [
    wl('Piknik sunrise di Selecta', 'Bawa termos dan roti', 120_000, false, IDS.nia, -40),
    wl('Kelas masak pasta bareng', null, 350_000, false, IDS.danar, -33),
    wl('Nonton konser', 'Yang mana saja, penting bareng', 900_000, false, IDS.nia, -25),
    wl('Sewa sepeda keliling kota', null, 60_000, false, IDS.danar, -18),
    wl('Coba rawon Nguling', 'Katanya paling enak pagi', 80_000, true, IDS.danar, -70),
    wl('Foto studio konyol', 'Yang pakai properti aneh', 250_000, true, IDS.nia, -95),
  ];

  // ---- Milestones ---------------------------------------------------------
  const milestones: MilestoneRow[] = [
    ms('First Met', shiftYmd(relationshipDate, -62), 'Kenalan di acara kampus, ngobrol dua jam soal hal receh.', '👋', true),
    ms('First Date', shiftYmd(relationshipDate, -21), 'Kopi Kalyan. Kamu datang 15 menit lebih awal.', '☕', true),
    ms('Official', relationshipDate, 'Sejak hari ini dihitung.', '💍', true),
    ms('1 Year', shiftYmd(relationshipDate, 365), 'Makan malam sederhana, kue gagal.', '🎂', true),
    ms('First Trip', shiftYmd(today, -320), 'Bromo. Sunrise telat, tetap worth it.', '🏔️', false),
    ms('2 Year', shiftYmd(relationshipDate, 730), 'Kembali ke tempat pertama.', '🎉', true),
  ];

  // ---- Letters: 1 terkunci (14 Feb tahun depan), 1 sudah terbuka ---------
  const nextFeb = `${Number(today.slice(0, 4)) + 1}-02-14`;
  const letters: LetterRow[] = [
    {
      id: sid(0x60),
      coupleId: couple.id,
      authorId: IDS.nia,
      title: 'Untuk Danar, buka 14 Februari',
      body: 'Kalau kamu baca ini, berarti kita sudah melewati satu tahun lagi. Aku nggak akan bilang semuanya mudah, tapi aku akan bilang aku memilih ini lagi. Terima kasih untuk hari-hari yang biasa saja — itu bagian favoritku.',
      unlockType: 'DATE',
      unlockOn: nextFeb,
      openedAt: null,
      createdAt: isoAt(shiftYmd(today, -30), 22),
    },
    {
      id: sid(0x60),
      coupleId: couple.id,
      authorId: IDS.danar,
      title: 'Untuk anniversary kedua',
      body: 'Dua tahun. Aku masih ingat kamu bilang "jangan buru-buru" dan aku masih memegang itu. Nanti kalau kita lupa alasannya, baca ini lagi.',
      unlockType: 'ANNIVERSARY',
      unlockOn: shiftYmd(relationshipDate, 730),
      openedAt: isoAt(shiftYmd(relationshipDate, 730), 21),
      createdAt: isoAt(shiftYmd(relationshipDate, 700), 22),
    },
  ];

  // ---- Notifications ------------------------------------------------------
  const notifications: NotificationRow[] = [
    nt('DAILY_QUESTION', 'Pertanyaan hari ini sudah siap', 'Jawab sebelum tengah malam biar streak aman.', '/daily', 0, false),
    nt('PARTNER_ANSWERED', 'Nia sudah check-in mood', 'Lihat bagaimana harinya.', '/mood/partner', 0, false),
    nt('EVENT_REMINDER', 'Date Night Sabtu 19:00', 'Kopi Kalyan · Rp250.000', '/calendar', 1, true),
    nt('MEMORY', 'Nia menambahkan memori baru', 'Trip pantai · hari 1', '/memories', 2, true),
    nt('STREAK', 'Streak 14 hari 🔥', 'Jangan putus hari ini.', '/streak', 2, true),
    nt('MILESTONE', 'Besok 850 hari', 'Ada rencana kecil?', '/milestones', 3, true),
    nt('MOOD', 'Nia sedang butuh ditemani', 'Catatannya: "Butuh dipeluk"', '/mood/partner', 5, true),
    nt('LETTER_UNLOCKED', 'Surat terbuka', 'Surat "Untuk anniversary kedua" sudah bisa dibaca.', '/letters', 8, true),
  ];

  const CATEGORIES: NotificationCategory[] = [
    'DAILY_QUESTION', 'PARTNER_ANSWERED', 'MEMORY', 'EVENT_REMINDER',
    'MOOD', 'LETTER_UNLOCKED', 'MILESTONE', 'STREAK', 'SYSTEM',
  ];
  const prefs: PrefRow[] = [];
  for (const userId of [IDS.danar, IDS.nia]) {
    for (const category of CATEGORIES) {
      prefs.push({ userId, category, push: category !== 'SYSTEM', email: category === 'EVENT_REMINDER' });
    }
  }

  // satu sesi game selesai supaya /games punya bestScore
  const games = [{
    id: sid(0x70),
    coupleId: couple.id,
    key: 'this-or-that' as const,
    roundIds: (GAME_ROUNDS['this-or-that'] ?? []).map(r => r.id),
    picks: {
      [IDS.danar]: { 'tt-1': 'b', 'tt-2': 'a', 'tt-3': 'b', 'tt-4': 'a', 'tt-5': 'a', 'tt-6': 'a' },
      [IDS.nia]: { 'tt-1': 'b', 'tt-2': 'a', 'tt-3': 'a', 'tt-4': 'a', 'tt-5': 'b', 'tt-6': 'a' },
    },
    finishedBy: [IDS.danar, IDS.nia],
    score: 4,
    finishedAt: isoAt(shiftYmd(today, -6), 21),
    createdAt: isoAt(shiftYmd(today, -6), 20),
  }];

  return {
    users,
    couples: [couple],
    members,
    invites,
    dailies,
    memories,
    journal,
    moods,
    events,
    wishlist,
    plans: [],
    milestones,
    letters,
    games,
    notifications,
    prefs,
    quietHours: { from: '22:00', to: '07:00' },
    plan: 'FREE',
  };

  // ---- helpers ----------------------------------------------------------
  function ev(
    title: string, category: EventRow['category'], date: string, time: string | null,
    location: string | null, budgetIdr: number | null, notes: string | null,
    reminderMinutes: number | null, isAllDay = false,
  ): EventRow {
    return {
      id: sid(0x50),
      coupleId: couple.id, title, category, date, time, location, budgetIdr, notes,
      reminderMinutes, isAllDay,
      createdById: IDS.danar,
      createdAt: isoAt(shiftYmd(date, -7), 10),
    };
  }

  function jr(
    j: { title: string; body: string }, visibility: JournalRow['visibility'],
    authorId: string, date: string,
  ): JournalRow {
    return {
      id: sid(0x80),
      coupleId: couple.id, authorId, title: j.title, body: j.body, visibility,
      createdAt: isoAt(date, 22), updatedAt: isoAt(date, 22),
    };
  }

  function wl(
    title: string, note: string | null, estimatedIdr: number | null,
    isDone: boolean, addedById: string, dayOffset: number,
  ): WishlistRow {
    const created = shiftYmd(today, dayOffset);
    return {
      id: sid(0x90),
      coupleId: couple.id, title, note, estimatedIdr, isDone, addedById,
      doneAt: isDone ? isoAt(shiftYmd(created, 10), 20) : null,
      createdAt: isoAt(created, 12),
    };
  }

  function ms(
    title: string, date: string, note: string | null, icon: string, isAutoGenerated: boolean,
  ): MilestoneRow {
    return {
      id: sid(0xa0),
      coupleId: couple.id, title, date, note, icon, isAutoGenerated,
      createdAt: isoAt(date, 9),
    };
  }

  function nt(
    category: NotificationCategory, title: string, body: string,
    link: string | null, dayOffset: number, read: boolean,
  ): NotificationRow {
    const date = shiftYmd(today, -dayOffset);
    return {
      id: sid(0xb0),
      coupleId: couple.id,
      userId: IDS.danar,
      category, title, body, link,
      readAt: read ? isoAt(date, 12) : null,
      createdAt: isoAt(date, 8, 30),
    };
  }
}

function nextSaturday(todayYmd: string): string {
  const d = ymdToDate(todayYmd);
  const delta = (6 - d.getUTCDay() + 7) % 7 || 7;
  return dateToYmd(new Date(d.getTime() + delta * 86_400_000));
}

const ANSWER_BANK = [
  'Waktu kamu nungguin aku di depan gedung padahal hujan. Aku nggak bilang apa-apa saat itu, tapi aku ingat sampai sekarang.',
  'Jujur, aku baru sadar belakangan. Pelan-pelan, bukan tiba-tiba.',
  'Yang jelas bukan yang besar-besar. Yang bikin aku yakin itu hal-hal kecil yang kamu lakukan tanpa diminta.',
  'Aku mikir agak lama buat jawab ini. Mungkin karena jawabannya lebih sederhana dari yang aku duga.',
  'Kalau aku jujur: aku takut, tapi aku tetap mau.',
  'Ingat nggak waktu kita salah naik angkot? Itu jawabanku.',
  'Aku pilih yang tenang. Tapi kalau kamu ikut, apa saja jadi menarik.',
  'Rasanya seperti pulang ke tempat yang belum pernah aku datangi.',
];

function answerFor(questionId: string, who: string, rnd: () => number): string {
  const base = ANSWER_BANK[Math.floor(rnd() * ANSWER_BANK.length)] ?? ANSWER_BANK[0]!;
  const q = QUESTIONS.find(x => x.id === questionId);
  return q && rnd() > 0.7 ? `${base} (${who})` : base;
}
