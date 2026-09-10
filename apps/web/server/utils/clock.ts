/** Waktu selalu dihitung server (§6.6). localDate memakai timezone couple. */
export function serverLocalDate(tz = 'Asia/Jakarta', at: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(at);
}

export function ymdToDate(ymd: string): Date {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1, 12));
}

export function dateToYmd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function shiftYmd(ymd: string, days: number): string {
  const d = ymdToDate(ymd);
  d.setUTCDate(d.getUTCDate() + days);
  return dateToYmd(d);
}

export function diffYmd(from: string, to: string): number {
  return Math.round((ymdToDate(to).getTime() - ymdToDate(from).getTime()) / 86_400_000);
}

export function nowIso(): string {
  return new Date().toISOString();
}

/** ISO datetime pada tanggal lokal tertentu, jam tertentu. */
export function isoAt(ymd: string, hour = 9, minute = 0): string {
  const d = ymdToDate(ymd);
  d.setUTCHours(hour - 7, minute, 0, 0); // Asia/Jakarta = UTC+7
  return d.toISOString();
}
