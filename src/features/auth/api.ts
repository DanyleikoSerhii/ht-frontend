import { api } from '@/shared/api/client';

import {
  LogoutResponseSchema,
  MeResponseSchema,
  type LogoutResponse,
  type MeResponse,
} from './schemas';

export async function getMe(): Promise<MeResponse> {
  const json = await api.get('auth/me').json();
  return MeResponseSchema.parse(json);
}

export async function logout(): Promise<LogoutResponse> {
  const json = await api.post('auth/logout').json();
  return LogoutResponseSchema.parse(json);
}
