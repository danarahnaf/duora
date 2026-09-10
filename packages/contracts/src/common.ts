import { z } from 'zod';

/** UUID v4 */
export const Uuid = z.string().uuid();
/** ISO 8601 datetime, selalu UTC dari server */
export const IsoDateTime = z.string().datetime();
/** YYYY-MM-DD — tanggal lokal couple, dihitung server. Jangan pernah dari new Date() browser. */
export const LocalDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'harus YYYY-MM-DD');
/** HH:mm 24 jam */
export const LocalTime = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'harus HH:mm');

export const ApiErrorSchema = z.object({
  statusCode: z.number().int(),
  code: z.string(),
  message: z.string(),
  details: z.record(z.string(), z.array(z.string())).optional(),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;

/** Pagination pakai cursor, bukan offset. */
export function paginated<T extends z.ZodTypeAny>(item: T) {
  return z.object({
    items: z.array(item),
    nextCursor: z.string().nullable(),
  });
}
export const CursorQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const CoupleRoleSchema = z.enum(['OWNER', 'MEMBER']);
export const MemoryTypeSchema = z.enum(['PHOTO', 'VIDEO', 'TEXT', 'LOCATION']);
export const JournalVisibilitySchema = z.enum(['PRIVATE', 'SHARED']);
export const MoodLevelSchema = z.enum(['GREAT', 'GOOD', 'OKAY', 'BAD', 'TERRIBLE']);
export const EventCategorySchema = z.enum([
  'DATE', 'ANNIVERSARY', 'BIRTHDAY', 'TRIP', 'REMINDER', 'PERSONAL', 'IMPORTANT',
]);
export const QuestionCategorySchema = z.enum([
  'FUN', 'ROMANTIC', 'DEEP', 'FUTURE', 'MEMORIES', 'RELATIONSHIP', 'RANDOM', 'LDR', 'FUNNY',
]);
export const LetterUnlockTypeSchema = z.enum(['DATE', 'ANNIVERSARY', 'BIRTHDAY', 'CUSTOM']);
export const DatePlanStatusSchema = z.enum(['DRAFT', 'SAVED', 'COMPLETED']);
export const DatePlanSourceSchema = z.enum(['MANUAL', 'AI']);
export const RelationshipDateLabelSchema = z.enum([
  'first_met', 'first_date', 'official', 'engagement', 'wedding',
]);

export type CoupleRole = z.infer<typeof CoupleRoleSchema>;
export type MemoryType = z.infer<typeof MemoryTypeSchema>;
export type JournalVisibility = z.infer<typeof JournalVisibilitySchema>;
export type MoodLevel = z.infer<typeof MoodLevelSchema>;
export type EventCategory = z.infer<typeof EventCategorySchema>;
export type QuestionCategory = z.infer<typeof QuestionCategorySchema>;
export type LetterUnlockType = z.infer<typeof LetterUnlockTypeSchema>;
export type DatePlanStatus = z.infer<typeof DatePlanStatusSchema>;
export type DatePlanSource = z.infer<typeof DatePlanSourceSchema>;
export type RelationshipDateLabel = z.infer<typeof RelationshipDateLabelSchema>;
