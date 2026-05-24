import './login.css';

import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute, useRouter } from '@tanstack/react-router';

import { mockSignIn } from '@/features/auth/api';
import { isAuthMocked, mockMeResponse } from '@/features/auth/mock';
import { queryKeys } from '@/shared/api/query-keys';

export const Route = createFileRoute('/login')({
  component: LoginPage,
});

function Mascot() {
  return (
    <svg width="92" height="92" viewBox="0 0 120 120" aria-hidden className="login-mascot">
      <ellipse cx="60" cy="108" rx="28" ry="4" fill="#22203a" opacity="0.08" />
      <path
        d="M60 8 C 51 16, 46 24, 52 34 C 57 30, 65 30, 70 34 C 76 24, 69 16, 60 8 Z"
        fill="#6cc99a"
      />
      <path d="M60 8 C 60 18, 60 26, 60 34" stroke="#54b687" strokeWidth="1.4" fill="none" />
      <circle cx="60" cy="70" r="38" fill="#f08a55" />
      <ellipse cx="46" cy="52" rx="12" ry="7" fill="#fde2d2" opacity="0.65" />
      <ellipse cx="48" cy="66" rx="8" ry="9.5" fill="#ffffff" />
      <ellipse cx="72" cy="66" rx="8" ry="9.5" fill="#ffffff" />
      <circle cx="49.5" cy="67.5" r="4.5" fill="#22203a" />
      <circle cx="73.5" cy="67.5" r="4.5" fill="#22203a" />
      <circle cx="51" cy="65.5" r="1.5" fill="#ffffff" />
      <circle cx="75" cy="65.5" r="1.5" fill="#ffffff" />
      <ellipse cx="32" cy="78" rx="7" ry="4" fill="#e26c84" opacity="0.32" />
      <ellipse cx="88" cy="78" rx="7" ry="4" fill="#e26c84" opacity="0.32" />
      <path
        d="M48 82 Q60 94 72 82"
        stroke="#22203a"
        strokeWidth="2.6"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  function handleGoogleSignIn() {
    if (isAuthMocked) {
      mockSignIn();
      queryClient.setQueryData(queryKeys.auth.me(), mockMeResponse);
      void router.navigate({ to: '/' });
      return;
    }

    const authUrl = import.meta.env.DEV
      ? '/api/auth/google'
      : `${import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')}/api/auth/google`;
    window.location.href = authUrl;
  }

  return (
    <div className="login-root">
      <div className="login-card">
        <div className="login-brand">
          <span className="login-brand-mark" aria-hidden>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3 C 8 6, 6 9, 8 13 C 10 11, 14 11, 16 13 C 18 9, 16 6, 12 3 Z" />
              <circle cx="12" cy="17" r="4" />
            </svg>
          </span>
          <span>Habit Garden</span>
        </div>

        <div className="login-mascot-wrap">
          <Mascot />
        </div>

        <h1 className="login-headline">
          Grow good habits,
          <br />
          <em>one day</em> at a time
        </h1>

        <p className="login-subtext">
          Plant tiny daily routines. Watch them sprout. Stay kind to yourself.
        </p>

        <button type="button" className="login-google-btn" onClick={handleGoogleSignIn}>
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
            <path
              d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"
              fill="#4285F4"
            />
            <path
              d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"
              fill="#34A853"
            />
            <path
              d="M4.5 10.48A4.84 4.84 0 0 1 4.5 7.5V5.43H1.83a8 8 0 0 0 0 7.12L4.5 10.48z"
              fill="#FBBC05"
            />
            <path
              d="M8.98 3.58c1.32 0 2.5.45 3.44 1.35L14.5 2.8A8 8 0 0 0 1.83 5.43L4.5 7.5c.66-1.97 2.52-3.92 4.48-3.92z"
              fill="#EA4335"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <p className="login-fine-print">
          By continuing you agree to our <span>Terms</span> &amp; <span>Privacy</span>.
        </p>
      </div>
    </div>
  );
}
