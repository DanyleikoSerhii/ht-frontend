import ky from 'ky';

import { ApiError } from './errors';

function getApiPrefix(): string {
  if (import.meta.env.DEV) {
    return '/api';
  }

  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  if (!baseUrl) {
    throw new Error('VITE_API_BASE_URL is required outside development');
  }

  return `${baseUrl.replace(/\/$/, '')}/api`;
}

const prefix = getApiPrefix();
const isDev = import.meta.env.DEV;

export const api = ky.create({
  prefix,
  credentials: 'include',
  retry: 0,
  hooks: {
    beforeRequest: [
      ({ request }) => {
        request.headers.set('Accept', 'application/json');
        if (isDev) {
          console.debug(`[api] ${request.method} ${request.url}`);
        }
      },
    ],
    afterResponse: [
      async ({ response }) => {
        if (!response.ok) {
          throw await ApiError.fromResponse(response);
        }
      },
    ],
  },
});
