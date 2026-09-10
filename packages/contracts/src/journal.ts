import { z } from 'zod';
import { IsoDateTime, JournalVisibilitySchema, Uuid, paginated } from './common';

export const JournalEntrySchema = z.object({
  id: Uuid,
  title: z.string().nullable(),
  body: z.string(),
  visibility: JournalVisibilitySchema,
  authorId: Uuid,
  createdAt: IsoDateTime,
  updatedAt: IsoDateTime,
});
export type JournalEntry = z.infer<typeof JournalEntrySchema>;

export const JournalListSchema = paginated(JournalEntrySchema);
export const JournalQuerySchema = z.object({
  cursor: z.string().optional(),
  visibility: JournalVisibilitySchema.optional(),
});

export const CreateJournalSchema = z.object({
  title: z.string().max(120).nullable().default(null),
  body: z.string().min(1, 'tulis sesuatu dulu').max(20000),
  visibility: JournalVisibilitySchema.default('PRIVATE'),
});
export type CreateJournal = z.infer<typeof CreateJournalSchema>;
export const UpdateJournalSchema = CreateJournalSchema.partial();

export const JOURNAL_PATHS = {
  list: '/journal',
  create: '/journal',
  byId: (id: string) => `/journal/${id}`,
} as const;
