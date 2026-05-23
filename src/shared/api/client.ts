import ky from 'ky';

import { ApiError } from './errors';

const prefix = import.meta.env.VITE_API_BASE_URL;
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
