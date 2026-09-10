import { z } from 'zod';
import { IsoDateTime, LetterUnlockTypeSchema, LocalDate, Uuid } from './common';

/** Bentuk list: body TIDAK pernah ikut kalau masih terkunci. */
export const LetterListItemSchema = z.object({
  id: Uuid,
  title: z.string(),
  authorId: Uuid,
  unlockType: LetterUnlockTypeSchema,
  unlockOn: LocalDate,
  isLocked: z.boolean(),
  openedAt: IsoDateTime.nullable(),
  createdAt: IsoDateTime,
});
export type LetterListItem = z.infer<typeof LetterListItemSchema>;

/** GET /letters/:id — body null selama isLocked. Server yang memutuskan, bukan UI. */
export const LetterDetailSchema = LetterListItemSchema.extend({
  body: z.string().nullable(),
});
export type LetterDetail = z.infer<typeof LetterDetailSchema>;

export const CreateLetterSchema = z.object({
  title: z.string().min(1, 'judul wajib diisi').max(120),
  body: z.string().min(1, 'isi surat tidak boleh kosong').max(20000),
  unlockType: LetterUnlockTypeSchema.default('DATE'),
  unlockOn: LocalDate,
});
export type CreateLetter = z.infer<typeof CreateLetterSchema>;

export const LETTERS_PATHS = {
  list: '/letters',
  create: '/letters',
  byId: (id: string) => `/letters/${id}`,
  open: (id: string) => `/letters/${id}/open`,
} as const;
