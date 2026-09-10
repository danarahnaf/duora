import type { CoupleRow } from '../mocks/types';
import { diffYmd } from './clock';

/**
 * Streak dihitung server (§6.6). Aktivitas apa pun yang "menjaga hari"
 * (jawab pertanyaan, check-in mood, tambah memori) memanggil ini.
 */
export function touchStreak(couple: CoupleRow, localDate: string) {
  const last = couple.streakLastActiveOn;
  if (last === localDate) return;

  const gap = last ? diffYmd(last, localDate) : Infinity;
  couple.streakCount = gap === 1 ? couple.streakCount + 1 : 1;
  couple.streakLongest = Math.max(couple.streakLongest, couple.streakCount);
  couple.streakLastActiveOn = localDate;
}
