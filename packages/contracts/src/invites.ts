import { z } from 'zod';
import { IsoDateTime, Uuid } from './common';

export const InviteSchema = z.object({
  id: Uuid,
  /** kode mentah hanya dikembalikan ke pembuat, sekali saat generate */
  code: z.string().regex(/^JOIN-[A-Z0-9]{5}$/),
  expiresAt: IsoDateTime,
  usedAt: IsoDateTime.nullable(),
  shareUrl: z.string(),
});
export type Invite = z.infer<typeof InviteSchema>;

export const RedeemInviteSchema = z.object({
  code: z.string().trim().toUpperCase().min(5).max(20),
});

/** Empat kondisi yang wajib bisa diuji di Fase 1. */
export const InviteErrorCodeSchema = z.enum([
  'INVITE_INVALID', 'INVITE_EXPIRED', 'INVITE_USED', 'COUPLE_FULL', 'ALREADY_IN_COUPLE',
]);
export type InviteErrorCode = z.infer<typeof InviteErrorCodeSchema>;

export const INVITES_PATHS = {
  create: '/invites',
  active: '/invites/active',
  redeem: '/invites/redeem',
  byId: (id: string) => `/invites/${id}`,
} as const;
