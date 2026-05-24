import { MeResponseSchema, type MeResponse } from './schemas';

export const isAuthMocked = import.meta.env.VITE_MOCK_AUTH === '1';

export const mockMeResponse: MeResponse = MeResponseSchema.parse({
  user: {
    id: 'mock-user-1',
    email: 'sergeydanyleuko@gmail.com',
    name: 'Serhii Danyleiko',
    avatarUrl:
      'https://lh3.googleusercontent.com/a/ACg8ocKZRIP8OYK-dx9bw5aCrrQ0KvHJi8rMhqBJdzHBrfksgtfwK7Gp=s96-c',
    timezone: 'UTC',
    locale: 'en',
    createdAt: '2026-05-24T14:35:39.000Z',
    updatedAt: '2026-05-24T14:35:39.000Z',
  },
});
