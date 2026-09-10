import { z } from 'zod';
import { IsoDateTime, LocalDate, MemoryTypeSchema, Uuid, paginated } from './common';

export const MediaSchema = z.object({
  id: Uuid,
  storagePath: z.string(),
  /** signed URL berumur pendek, digenerate saat response */
  url: z.string(),
  width: z.number().int().positive().nullable(),
  height: z.number().int().positive().nullable(),
});
export type Media = z.infer<typeof MediaSchema>;

export const MemorySchema = z.object({
  id: Uuid,
  type: MemoryTypeSchema,
  caption: z.string().nullable(),
  happenedAt: LocalDate,
  location: z.string().nullable(),
  isFavorite: z.boolean(),
  createdById: Uuid,
  createdAt: IsoDateTime,
  media: z.array(MediaSchema),
});
export type Memory = z.infer<typeof MemorySchema>;

export const MemoryListSchema = paginated(MemorySchema);
export const MemoryQuerySchema = z.object({
  cursor: z.string().optional(),
  /** YYYY-MM */
  month: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  favorite: z.coerce.boolean().optional(),
});

export const CreateMemorySchema = z.object({
  type: MemoryTypeSchema.default('PHOTO'),
  caption: z.string().max(1000).nullable().default(null),
  happenedAt: LocalDate,
  location: z.string().max(120).nullable().default(null),
  media: z.array(z.object({
    storagePath: z.string().min(1),
    width: z.number().int().positive().nullable().default(null),
    height: z.number().int().positive().nullable().default(null),
  })).max(10).default([]),
});
export type CreateMemory = z.infer<typeof CreateMemorySchema>;

export const UpdateMemorySchema = CreateMemorySchema.partial().extend({
  isFavorite: z.boolean().optional(),
});

export const MemoryUploadUrlSchema = z.object({
  files: z.array(z.object({
    filename: z.string().min(1),
    mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'video/mp4']),
    sizeBytes: z.number().int().positive().max(10 * 1024 * 1024, 'maksimal 10MB per file'),
  })).min(1).max(10),
});

export const MEMORIES_PATHS = {
  list: '/memories',
  create: '/memories',
  uploadUrl: '/memories/upload-url',
  byId: (id: string) => `/memories/${id}`,
} as const;
