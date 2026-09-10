import { z } from 'zod';
import {
  DatePlanSourceSchema, DatePlanStatusSchema, IsoDateTime, LocalDate, LocalTime, Uuid,
} from './common';

export const WishlistItemSchema = z.object({
  id: Uuid,
  title: z.string(),
  note: z.string().nullable(),
  estimatedIdr: z.number().int().nonnegative().nullable(),
  isDone: z.boolean(),
  addedById: Uuid,
  doneAt: IsoDateTime.nullable(),
  createdAt: IsoDateTime,
});
export type WishlistItem = z.infer<typeof WishlistItemSchema>;

export const CreateWishlistItemSchema = z.object({
  title: z.string().min(1, 'judul wajib diisi').max(120),
  note: z.string().max(500).nullable().default(null),
  estimatedIdr: z.number().int().nonnegative().nullable().default(null),
});
export const UpdateWishlistItemSchema = CreateWishlistItemSchema.partial().extend({
  isDone: z.boolean().optional(),
});

export const PlannerInputSchema = z.object({
  budgetIdr: z.number().int().min(0).max(50_000_000),
  area: z.string().min(1, 'lokasi wajib diisi').max(80),
  durationHours: z.number().int().min(1).max(12),
  mood: z.enum(['ROMANTIC', 'FUN', 'CHILL', 'ADVENTURE', 'FOODIE']),
  transport: z.enum(['WALK', 'MOTORBIKE', 'CAR', 'PUBLIC']),
  date: LocalDate.optional(),
});
export type PlannerInput = z.infer<typeof PlannerInputSchema>;

export const PlanStepSchema = z.object({
  time: LocalTime,
  title: z.string(),
  detail: z.string(),
  costIdr: z.number().int().nonnegative(),
});
export type PlanStep = z.infer<typeof PlanStepSchema>;

export const DatePlanSchema = z.object({
  id: Uuid,
  title: z.string(),
  status: DatePlanStatusSchema,
  source: DatePlanSourceSchema,
  input: PlannerInputSchema,
  steps: z.array(PlanStepSchema),
  totalIdr: z.number().int().nonnegative(),
  createdAt: IsoDateTime,
});
export type DatePlan = z.infer<typeof DatePlanSchema>;

export const UpdateDatePlanSchema = z.object({
  status: DatePlanStatusSchema.optional(),
  title: z.string().min(1).max(120).optional(),
});

export const DATES_PATHS = {
  wishlist: '/dates/wishlist',
  wishlistById: (id: string) => `/dates/wishlist/${id}`,
  plans: '/dates/plans',
  planById: (id: string) => `/dates/plans/${id}`,
} as const;
