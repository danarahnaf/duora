import { z } from 'zod';

export const PlanKeySchema = z.enum(['FREE', 'PREMIUM_MONTHLY', 'PREMIUM_YEARLY']);
export type PlanKey = z.infer<typeof PlanKeySchema>;

export const PlanSchema = z.object({
  key: PlanKeySchema,
  name: z.string(),
  priceIdr: z.number().int().nonnegative(),
  period: z.enum(['FOREVER', 'MONTH', 'YEAR']),
  badge: z.string().nullable(),
  features: z.array(z.object({ label: z.string(), included: z.boolean() })),
});
export type Plan = z.infer<typeof PlanSchema>;

export const BillingStateSchema = z.object({
  currentPlan: PlanKeySchema,
  plans: z.array(PlanSchema),
  limits: z.object({
    memoriesUsed: z.number().int().nonnegative(),
    memoriesLimit: z.number().int().positive().nullable(),
    lettersUsed: z.number().int().nonnegative(),
    lettersLimit: z.number().int().positive().nullable(),
  }),
});
export type BillingState = z.infer<typeof BillingStateSchema>;

export const BILLING_PATHS = { state: '/billing/state' } as const;
