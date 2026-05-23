import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Loader2Icon } from 'lucide-react';
import { useEffect } from 'react';

import { queryKeys } from '@/shared/api/query-keys';

export const Route = createFileRoute('/auth/callback')({
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    async function run() {
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
      if (cancelled) return;
      await navigate({ to: '/', replace: true });
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [queryClient, navigate]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[60svh] items-center justify-center"
    >
      <div className="flex items-center gap-3 text-muted-foreground">
        <Loader2Icon className="size-5 animate-spin" aria-hidden />
        <span>Signing you in…</span>
      </div>
    </div>
  );
}
