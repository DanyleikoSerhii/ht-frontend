import { api } from '@/shared/api/client';
import { ApiError } from '@/shared/api/errors';
import type { User as BackendUser } from '@/shared/api/types';

import { isAuthMocked, mockMeResponse } from './mock';
import {
  LogoutResponseSchema,
  MeResponseSchema,
  type LogoutResponse,
  type MeResponse,
} from './schemas';

const MOCK_AUTH_FLAG = 'mock-auth:signed-in';

export async function getMe(): Promise<MeResponse> {
  if (isAuthMocked) {
    if (typeof window !== 'undefined' && window.sessionStorage.getItem(MOCK_AUTH_FLAG) !== '1') {
      throw new ApiError({
        status: 401,
        body: { code: 'unauthorized', message: 'Unauthorized' },
      });
    }

    return mockMeResponse;
  }

  const json = await api.get('auth/me').json();
  const result = MeResponseSchema.parse(json);
  void (result.user satisfies BackendUser);
  return result;
}

export async function logout(): Promise<LogoutResponse> {
  if (isAuthMocked) {
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(MOCK_AUTH_FLAG);
    }

    return { ok: true };
  }

  const json = await api.post('auth/logout').json();
  return LogoutResponseSchema.parse(json);
}

export function mockSignIn(): void {
  if (typeof window !== 'undefined') {
    window.sessionStorage.setItem(MOCK_AUTH_FLAG, '1');
  }
}
