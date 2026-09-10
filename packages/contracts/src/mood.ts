import { z } from 'zod';
import { IsoDateTime, LocalDate, MoodLevelSchema, Uuid } from './common';

export const MoodCheckinSchema = z.object({
  id: Uuid,
  userId: Uuid,
  level: MoodLevelSchema,
  note: z.string().nullable(),
  localDate: LocalDate,
  createdAt: IsoDateTime,
});
export type MoodCheckin = z.infer<typeof MoodCheckinSchema>;

export const MoodTodaySchema = z.object({
  localDate: LocalDate,
  mine: MoodCheckinSchema.nullable(),
  partner: MoodCheckinSchema.nullable(),
});
export type MoodToday = z.infer<typeof MoodTodaySchema>;

export const SubmitMoodSchema = z.object({
  level: MoodLevelSchema,
  note: z.string().max(280).nullable().default(null),
});

export const MoodHistorySchema = z.object({
  days: z.number().int(),
  mine: z.array(MoodCheckinSchema),
  partner: z.array(MoodCheckinSchema),
});
export type MoodHistory = z.infer<typeof MoodHistorySchema>;

export const MOOD_PATHS = {
  today: '/mood/today',
  create: '/mood',
  history: '/mood/history',
} as const;
