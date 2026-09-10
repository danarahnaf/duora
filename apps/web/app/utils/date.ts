/**
 * Semua perhitungan tanggal lewat sini. Jangan pakai `new Date()` liar di komponen:
 * user LDR bisa berada di timezone berbeda dari timezone couple, dan "hari ini"
 * yang dipakai daily question ditentukan oleh timezone couple.
 */
export const DEFAULT_TZ = 'Asia/Jakarta';

/** YYYY-MM-DD pada timezone tertentu. */
export function localDate(tz: string = DEFAULT_TZ, at: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(at);
  return parts; // en-CA => YYYY-MM-DD
}

/** Parse YYYY-MM-DD sebagai tanggal kalender (UTC noon, aman dari DST). */
export function parseLocalDate(ymd: string): Date {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1, 12));
}

export function toYmd(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Selisih hari kalender, bukan selisih milidetik / 86400000. */
export function diffDays(fromYmd: string, toYmdStr: string): number {
  const a = parseLocalDate(fromYmd).getTime();
  const b = parseLocalDate(toYmdStr).getTime();
  return Math.round((b - a) / 86_400_000);
}

/** Hari bersama, inklusif hari pertama. */
export function daysTogether(relationshipDate: string, tz: string = DEFAULT_TZ): number {
  return Math.max(0, diffDays(relationshipDate, localDate(tz)));
}

export function addDays(ymd: string, days: number): string {
  const d = parseLocalDate(ymd);
  d.setUTCDate(d.getUTCDate() + days);
  return toYmd(d);
}

export function startOfMonth(ymd: string): string {
  return `${ymd.slice(0, 7)}-01`;
}

export function endOfMonth(ymd: string): string {
  const [y, m] = ymd.split('-').map(Number);
  return toYmd(new Date(Date.UTC(y ?? 1970, m ?? 1, 0, 12)));
}

export function monthKey(ymd: string): string {
  return ymd.slice(0, 7);
}

const ID_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];
const ID_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export function monthName(month1to12: number): string {
  return ID_MONTHS[month1to12 - 1] ?? '';
}

export function monthLabel(ymOrYmd: string): string {
  const [y, m] = ymOrYmd.split('-').map(Number);
  return `${monthName(m ?? 1)} ${y}`;
}

export function dayName(ymd: string): string {
  return ID_DAYS[parseLocalDate(ymd).getUTCDay()] ?? '';
}

export function dayNameShort(ymd: string): string {
  return dayName(ymd).slice(0, 3);
}

/** "19 Feb 2026" */
export function formatDate(ymd: string): string {
  const [y, m, d] = ymd.split('-').map(Number);
  return `${d} ${(monthName(m ?? 1)).slice(0, 3)} ${y}`;
}

/** "Sabtu, 19 Februari 2026" */
export function formatDateLong(ymd: string): string {
  const [y, m, d] = ymd.split('-').map(Number);
  return `${dayName(ymd)}, ${d} ${monthName(m ?? 1)} ${y}`;
}

/** Matriks 6x7 untuk MonthGrid. Minggu dimulai Senin. */
export function monthMatrix(ym: string): string[][] {
  const first = parseLocalDate(`${ym}-01`);
  const offset = (first.getUTCDay() + 6) % 7; // Senin = 0
  const start = new Date(first);
  start.setUTCDate(start.getUTCDate() - offset);
  const weeks: string[][] = [];
  for (let w = 0; w < 6; w++) {
    const row: string[] = [];
    for (let d = 0; d < 7; d++) {
      row.push(toYmd(start));
      start.setUTCDate(start.getUTCDate() + 1);
    }
    weeks.push(row);
  }
  return weeks;
}
