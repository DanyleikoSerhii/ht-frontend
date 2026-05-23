import { z } from 'zod';

import { IsoDateTime, Timezone, UserId } from '@/shared/api/primitives';

export const AuthProvider = z.enum(['google']);
export type AuthProvider = z.infer<typeof AuthProvider>;

export const UserSchema = z.object({
  id: UserId,
  email: z.string().email(),
  name: z.string().min(1),
  avatarUrl: z.string().url().nullable(),
  provider: AuthProvider,
  timezone: Timezone,
  locale: z.enum(['ru', 'en']),
  createdAt: IsoDateTime,
});
export type User = z.infer<typeof UserSchema>;

export const MeResponseSchema = z.object({
  user: UserSchema,
  csrfToken: z.string().optional(),
});
export type MeResponse = z.infer<typeof MeResponseSchema>;

export const LogoutResponseSchema = z.object({ ok: z.literal(true) });
export type LogoutResponse = z.infer<typeof LogoutResponseSchema>;
