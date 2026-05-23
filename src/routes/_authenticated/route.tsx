import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import { AppLayout } from '@/app/layout';
import { getMe } from '@/features/auth/api';
import { ApiError } from '@/shared/api/errors';
import { queryKeys } from '@/shared/api/query-keys';

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ context }) => {
    try {
      await context.queryClient.ensureQueryData({
        queryKey: queryKeys.auth.me(),
        queryFn: getMe,
        staleTime: Infinity,
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        throw redirect({ to: '/login' });
      }
      throw err;
    }
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
