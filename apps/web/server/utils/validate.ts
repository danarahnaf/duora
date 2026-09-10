import type { z } from 'zod';
import { fail } from '../mocks/simulate';

/** Fase 2: ZodValidationPipe NestJS memakai schema yang sama dari packages/contracts. */
export function parseBody<T extends z.ZodTypeAny>(schema: T, body: unknown): z.infer<T> {
  const res = schema.safeParse(body);
  if (!res.success) {
    const details: Record<string, string[]> = {};
    for (const issue of res.error.issues) {
      const key = issue.path.join('.') || '_';
      (details[key] ??= []).push(issue.message);
    }
    fail(422, 'VALIDATION_ERROR', 'Ada isian yang belum benar.', details);
  }
  return res.data;
}
