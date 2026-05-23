import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { Suspense, lazy } from 'react';

import { type RouterContext } from '@/app/router';

const Devtools = import.meta.env.PROD
  ? null
  : lazy(async () => {
      const [{ TanStackRouterDevtools }, { ReactQueryDevtools }] = await Promise.all([
        import('@tanstack/react-router-devtools'),
        import('@tanstack/react-query-devtools'),
      ]);
      function DevtoolsBundle() {
        return (
          <>
            <TanStackRouterDevtools position="bottom-right" />
            <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
          </>
        );
      }
      return { default: DevtoolsBundle };
    });

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <Outlet />
      {Devtools && (
        <Suspense fallback={null}>
          <Devtools />
        </Suspense>
      )}
    </>
  );
}
