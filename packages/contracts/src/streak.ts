import { z } from 'zod';
import { LocalDate } from './common';

export const BadgeSchema = z.object({
  key: z.string(),
  title: z.string(),
  description: z.string(),
  emoji: z.string(),
  threshold: z.number().int().positive(),
  unlockedOn: LocalDate.nullable(),
});
export type Badge = z.infer<typeof BadgeSchema>;

export const StreakSchema = z.object({
  current: z.number().int().nonnegative(),
  longest: z.number().int().nonnegative(),
  lastActiveOn: LocalDate.nullable(),
  /** true kalau hari ini belum ada aktivitas yang menjaga streak */
  atRisk: z.boolean(),
  /** 14 hari terakhir, urut lama → baru */
  last14: z.array(z.object({ localDate: LocalDate, active: z.boolean() })),
  badges: z.array(BadgeSchema),
});
export type Streak = z.infer<typeof StreakSchema>;

export const RecapSchema = z.object({
  year: z.number().int(),
  memories: z.number().int().nonnegative(),
  dates: z.number().int().nonnegative(),
  questionsAnswered: z.number().int().nonnegative(),
  journalEntries: z.number().int().nonnegative(),
  longestStreak: z.number().int().nonnegative(),
  topLocation: z.string().nullable(),
  topMoodLevel: z.string().nullable(),
  totalSpentIdr: z.number().int().nonnegative(),
  highlights: z.array(z.object({ label: z.string(), value: z.string() })),
});
export type Recap = z.infer<typeof RecapSchema>;

export const STREAK_PATHS = {
  streak: '/streak',
  recap: (year: number | string) => `/streak/recap/${year}`,
} as const;
