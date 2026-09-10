import { z } from 'zod';
import { IsoDateTime, LocalDate, QuestionCategorySchema, Uuid, paginated } from './common';

export const AnswerSchema = z.object({
  authorId: Uuid,
  body: z.string().min(1).max(2000),
  createdAt: IsoDateTime,
});
export type Answer = z.infer<typeof AnswerSchema>;

export const DailyTodaySchema = z.object({
  questionId: Uuid,
  category: QuestionCategorySchema,
  text: z.string(),
  localDate: LocalDate,
  myAnswer: AnswerSchema.nullable(),
  partnerAnswered: z.boolean(),
  revealed: z.boolean(),
  /** null sebelum revealed — server tidak boleh mengirim jawaban partner lebih awal */
  answers: z.array(AnswerSchema).nullable(),
});
export type DailyToday = z.infer<typeof DailyTodaySchema>;

export const SubmitAnswerSchema = z.object({
  questionId: Uuid,
  body: z.string().min(1, 'jawaban tidak boleh kosong').max(2000),
});

export const DailyHistoryItemSchema = z.object({
  questionId: Uuid,
  localDate: LocalDate,
  category: QuestionCategorySchema,
  text: z.string(),
  revealed: z.boolean(),
  answers: z.array(AnswerSchema).nullable(),
});
export const DailyHistorySchema = paginated(DailyHistoryItemSchema);
export type DailyHistoryItem = z.infer<typeof DailyHistoryItemSchema>;

export const DAILY_PATHS = {
  today: '/daily/today',
  answer: '/daily/answer',
  history: '/daily/history',
} as const;
