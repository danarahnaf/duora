import { z } from 'zod';
import { MeSchema } from './users';

export const CredentialsSchema = z.object({
  email: z.string().email('email tidak valid'),
  password: z.string().min(8, 'minimal 8 karakter').max(128),
});
export type Credentials = z.infer<typeof CredentialsSchema>;

export const RegisterSchema = CredentialsSchema.extend({
  displayName: z.string().min(1, 'nama wajib diisi').max(60),
});
export type Register = z.infer<typeof RegisterSchema>;

export const ForgotPasswordSchema = z.object({ email: z.string().email() });

export const SessionSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number().int().positive(),
  user: MeSchema,
});
export type Session = z.infer<typeof SessionSchema>;

export const RefreshSchema = z.object({ refreshToken: z.string().min(1) });

export const AUTH_PATHS = {
  register: '/auth/register',
  login: '/auth/login',
  refresh: '/auth/refresh',
  logout: '/auth/logout',
  forgot: '/auth/forgot-password',
  google: '/auth/google',
} as const;
