import { z } from 'zod';
import { EventCategorySchema, IsoDateTime, LocalDate, LocalTime, Uuid } from './common';

export const CalendarEventSchema = z.object({
  id: Uuid,
  title: z.string(),
  category: EventCategorySchema,
  date: LocalDate,
  time: LocalTime.nullable(),
  location: z.string().nullable(),
  budgetIdr: z.number().int().nonnegative().nullable(),
  notes: z.string().nullable(),
  reminderMinutes: z.number().int().nonnegative().nullable(),
  isAllDay: z.boolean(),
  createdById: Uuid,
  createdAt: IsoDateTime,
});
export type CalendarEvent = z.infer<typeof CalendarEventSchema>;

export const CalendarQuerySchema = z.object({ from: LocalDate, to: LocalDate });

export const CreateEventSchema = z.object({
  title: z.string().min(1, 'judul wajib diisi').max(120),
  category: EventCategorySchema.default('DATE'),
  date: LocalDate,
  time: LocalTime.nullable().default(null),
  location: z.string().max(120).nullable().default(null),
  budgetIdr: z.number().int().nonnegative().max(1_000_000_000).nullable().default(null),
  notes: z.string().max(2000).nullable().default(null),
  reminderMinutes: z.number().int().nonnegative().nullable().default(60),
  isAllDay: z.boolean().default(false),
});
export type CreateEvent = z.infer<typeof CreateEventSchema>;
export const UpdateEventSchema = CreateEventSchema.partial();

export const CALENDAR_PATHS = {
  list: '/calendar',
  create: '/calendar',
  upcoming: '/calendar/upcoming',
  byId: (id: string) => `/calendar/${id}`,
} as const;
