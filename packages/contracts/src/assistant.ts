import { z } from 'zod';
import { IsoDateTime } from './common';

/**
 * Fase 1: seluruh respons berasal dari fixture. Tidak ada SDK AI.
 * Kontrak sudah disiapkan supaya Fase 3 hanya menukar implementasi server.
 */
export const AssistantKindSchema = z.enum(['CHAT', 'DATE_IDEA', 'QUESTION']);
export type AssistantKind = z.infer<typeof AssistantKindSchema>;

export const AssistantAskSchema = z.object({
  kind: AssistantKindSchema.default('CHAT'),
  prompt: z.string().min(1).max(1000),
});

export const AssistantReplySchema = z.object({
  id: z.string(),
  kind: AssistantKindSchema,
  text: z.string(),
  suggestions: z.array(z.string()),
  /** true selama Fase 1 — UI wajib menampilkan label "contoh" */
  isMock: z.literal(true),
  createdAt: IsoDateTime,
});
export type AssistantReply = z.infer<typeof AssistantReplySchema>;

export const ASSISTANT_PATHS = {
  ask: '/assistant/ask',
  chips: '/assistant/chips',
} as const;
