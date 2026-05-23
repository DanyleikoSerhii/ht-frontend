import { api } from '@/shared/api/client';
import type { User as BackendUser } from '@/shared/api/types';

import {
  LogoutResponseSchema,
  MeResponseSchema,
  type LogoutResponse,
  type MeResponse,
} from './schemas';

export async function getMe(): Promise<MeResponse> {
  const json = await api.get('auth/me').json();
  const result = MeResponseSchema.parse(json);
  void (result.user satisfies BackendUser);
  return result;
}

export async function logout(): Promise<LogoutResponse> {
  const json = await api.post('auth/logout').json();
  return LogoutResponseSchema.parse(json);
}
