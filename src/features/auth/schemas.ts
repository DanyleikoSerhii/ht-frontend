import { z } from 'zod';

import { IsoDateTime, Timezone, UserId } from '@/shared/api/primitives';

export const UserSchema = z.object({
  id: UserId,
  email: z.string().email(),
  name: z.string().min(1),
  avatarUrl: z.string().url().nullable(),
  timezone: Timezone,
  locale: z.enum(['ru', 'en']),
  createdAt: IsoDateTime,
  updatedAt: IsoDateTime,
});
export type User = z.infer<typeof UserSchema>;

export const MeResponseSchema = z.object({
  user: UserSchema,
});
export type MeResponse = z.infer<typeof MeResponseSchema>;

export const LogoutResponseSchema = z.object({ ok: z.literal(true) });
export type LogoutResponse = z.infer<typeof LogoutResponseSchema>;
