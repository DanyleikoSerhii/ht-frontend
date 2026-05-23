import { createFileRoute } from '@tanstack/react-router';

import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';

export const Route = createFileRoute('/login')({
  component: LoginPage,
});

function LoginPage() {
  function handleGoogleSignIn() {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/google`;
  }

  return (
    <div className="flex min-h-[60svh] items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Build habits, one day at a time</CardTitle>
          <CardDescription>Sign in to start tracking your daily progress.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" size="lg" className="w-full" onClick={handleGoogleSignIn}>
            Continue with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
