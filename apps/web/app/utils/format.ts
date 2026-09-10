export function formatIdr(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', maximumFractionDigits: 0,
  }).format(value);
}

/** "Rp250rb" untuk chip sempit. */
export function formatIdrShort(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  if (value >= 1_000_000) return `Rp${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}jt`;
  if (value >= 1_000) return `Rp${Math.round(value / 1_000)}rb`;
  return `Rp${value}`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value);
}

/** "2 hari lagi" / "3 hari lalu" / "Hari ini" — argumen YYYY-MM-DD. */
export function relativeDate(ymd: string, todayYmd: string): string {
  const d = diffDays(todayYmd, ymd);
  if (d === 0) return 'Hari ini';
  if (d === 1) return 'Besok';
  if (d === -1) return 'Kemarin';
  if (d > 1 && d <= 30) return `${d} hari lagi`;
  if (d < -1 && d >= -30) return `${Math.abs(d)} hari lalu`;
  return formatDate(ymd);
}

/** "3 jam lalu" dari ISO datetime. */
export function relativeTime(iso: string, now: Date = new Date()): string {
  const diff = (now.getTime() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'baru saja';
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  const days = Math.floor(diff / 86400);
  if (days < 30) return `${days} hari lalu`;
  return formatDate(new Date(iso).toISOString().slice(0, 10));
}

export function initials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
}

export function truncate(text: string, max = 120): string {
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

export function pluralId(count: number, word: string): string {
  return `${formatNumber(count)} ${word}`;
}
