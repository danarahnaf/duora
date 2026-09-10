import { z } from 'zod';
import { CoupleRoleSchema, IsoDateTime, LocalDate, RelationshipDateLabelSchema, Uuid } from './common';
import { PublicUserSchema } from './users';

export const CoupleMemberSchema = z.object({
  user: PublicUserSchema,
  role: CoupleRoleSchema,
  joinedAt: IsoDateTime,
});

export const CoupleSchema = z.object({
  id: Uuid,
  name: z.string().nullable(),
  photoUrl: z.string().nullable(),
  relationshipDate: LocalDate,
  relationshipDateLabel: RelationshipDateLabelSchema,
  theme: z.string(),
  timezone: z.string(),
  /** dihitung server dari timezone couple */
  daysTogether: z.number().int().nonnegative(),
  streakCount: z.number().int().nonnegative(),
  members: z.array(CoupleMemberSchema).min(1).max(2),
  isComplete: z.boolean(),
  createdAt: IsoDateTime,
});
export type Couple = z.infer<typeof CoupleSchema>;

export const CreateCoupleSchema = z.object({
  name: z.string().min(1).max(60).optional(),
  relationshipDate: LocalDate,
  relationshipDateLabel: RelationshipDateLabelSchema.default('official'),
  timezone: z.string().default('Asia/Jakarta'),
});
export type CreateCouple = z.infer<typeof CreateCoupleSchema>;

export const UpdateCoupleSchema = CreateCoupleSchema.partial().extend({
  theme: z.string().optional(),
  photoPath: z.string().optional(),
});

export const COUPLES_PATHS = {
  create: '/couples',
  me: '/couples/me',
  leave: '/couples/me/leave',
} as const;
