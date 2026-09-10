import { z } from 'zod';
import { IsoDateTime, Uuid } from './common';

export const PublicUserSchema = z.object({
  id: Uuid,
  displayName: z.string().min(1).max(60),
  avatarUrl: z.string().nullable(),
});
export type PublicUser = z.infer<typeof PublicUserSchema>;

export const MeSchema = PublicUserSchema.extend({
  email: z.string().email(),
  timezone: z.string(),
  hasCouple: z.boolean(),
  createdAt: IsoDateTime,
});
export type Me = z.infer<typeof MeSchema>;

export const UpdateMeSchema = z.object({
  displayName: z.string().min(1).max(60).optional(),
  timezone: z.string().min(1).optional(),
  avatarPath: z.string().min(1).optional(),
});
export type UpdateMe = z.infer<typeof UpdateMeSchema>;

export const AvatarUrlRequestSchema = z.object({
  filename: z.string().min(1),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
  sizeBytes: z.number().int().positive().max(5 * 1024 * 1024),
});
export const SignedUploadSchema = z.object({
  uploadUrl: z.string().url(),
  storagePath: z.string(),
  expiresAt: IsoDateTime,
});
export type SignedUpload = z.infer<typeof SignedUploadSchema>;

export const USERS_PATHS = {
  me: '/users/me',
  avatarUrl: '/users/me/avatar-url',
} as const;
