import './login.css';

import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/login')({
  component: LoginPage,
});

const COLS = 53;
const ROWS = 7;
const DOT = 10;
const GAP = 3;
const STEP = DOT + GAP;

function seededRand(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

type Dot = { r: number; c: number; level: number };

const DOTS: Dot[] = Array.from({ length: ROWS * COLS }, (_, i) => {
  const r = Math.floor(i / COLS);
  const c = i % COLS;
  const rand = seededRand(i);
  const rand2 = seededRand(i + 500);
  let level = 0;
  if (c < 7) {
    level = rand > 0.62 ? 1 : 0;
  } else if (c < 22) {
    level = rand > 0.38 ? Math.ceil(rand2 * 2) : 0;
  } else if (c < 38) {
    level = rand > 0.22 ? Math.ceil(rand2 * 3) : 0;
  } else if (c < 48) {
    level = rand > 0.12 ? Math.ceil(rand2 * 4) : 0;
  } else {
    level = rand > 0.08 ? 4 : rand2 > 0.25 ? 3 : 0;
  }
  return { r, c, level };
});

function Mascot() {
  return (
    <svg width="72" height="72" viewBox="0 0 100 100" aria-hidden className="login-mascot">
      {/* body */}
      <circle cx="50" cy="58" r="34" fill="#f59e0b" />
      {/* shine */}
      <ellipse cx="38" cy="40" rx="12" ry="7" fill="#fcd34d" opacity="0.55" />
      {/* left eye */}
      <ellipse cx="37" cy="54" rx="9" ry="10" fill="white" />
      <circle cx="38.5" cy="55.5" r="5.5" fill="#141926" />
      <circle cx="40.5" cy="52.5" r="2" fill="white" />
      {/* right eye */}
      <ellipse cx="63" cy="54" rx="9" ry="10" fill="white" />
      <circle cx="64.5" cy="55.5" r="5.5" fill="#141926" />
      <circle cx="66.5" cy="52.5" r="2" fill="white" />
      {/* blush */}
      <ellipse cx="24" cy="65" rx="8" ry="5" fill="#f87171" opacity="0.28" />
      <ellipse cx="76" cy="65" rx="8" ry="5" fill="#f87171" opacity="0.28" />
      {/* smile + teeth */}
      <path
        d="M33 72 Q50 90 67 72"
        stroke="#141926"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M36 74 Q50 86 64 74 Q50 88 36 74Z" fill="white" />
      {/* left arm */}
      <path
        d="M20 58 Q7 52 4 40"
        stroke="#f59e0b"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="4" cy="37" r="7" fill="#f59e0b" />
      {/* right arm waving */}
      <path
        d="M80 56 Q93 46 96 33"
        stroke="#f59e0b"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="97" cy="30" r="7" fill="#f59e0b" />
      {/* sparkle */}
      <path
        d="M85 16 L87 22 L93 20 L88 25 L90 31 L85 27 L80 31 L82 25 L77 20 L83 22Z"
        fill="#fcd34d"
        opacity="0.9"
      />
    </svg>
  );
}

// level → fill color
const DOT_FILL = ['#141c30', '#1a3866', '#2563eb', '#d97706', '#f59e0b'] as const;
const DOT_OPACITY = [0.55, 0.75, 0.85, 1, 1] as const;
const LEGEND_LEVELS = [0, 1, 2, 3, 4] as const;

const SVG_W = COLS * STEP - GAP;
const SVG_H = ROWS * STEP - GAP;

function LoginPage() {
  function handleGoogleSignIn() {
    const base = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '');
    window.location.href = `${base}/api/auth/google`;
  }

  return (
    <div className="login-root">
      {/* ── Left decorative panel ── */}
      <div className="login-left">
        <div className="login-logo">
          <span className="login-logo-mark" aria-hidden />
          <span className="login-logo-name">HabitTrack</span>
        </div>

        <div className="login-grid-section">
          <svg
            width={SVG_W}
            height={SVG_H}
            aria-hidden
            className="login-grid-svg"
            style={{ maxWidth: '100%' }}
          >
            {DOTS.map(({ r, c, level }) => (
              <rect
                key={`${r}-${c}`}
                x={c * STEP}
                y={r * STEP}
                width={DOT}
                height={DOT}
                rx={2}
                fill={DOT_FILL[level]}
                opacity={DOT_OPACITY[level]}
              />
            ))}
          </svg>

          <div className="login-grid-meta">
            <p className="login-grid-label">52 weeks of consistency</p>
            <div className="login-legend" aria-hidden>
              {LEGEND_LEVELS.map((lv) => (
                <svg key={lv} width={DOT} height={DOT}>
                  <rect
                    width={DOT}
                    height={DOT}
                    rx={2}
                    fill={DOT_FILL[lv]}
                    opacity={DOT_OPACITY[lv]}
                  />
                </svg>
              ))}
            </div>
          </div>
        </div>

        <p className="login-left-footer">
          Track what matters. <br />
          Show up every day.
        </p>
      </div>

      {/* ── Right sign-in panel ── */}
      <div className="login-right">
        <div className="login-card">
          {/* Logo shown only on mobile */}
          <div className="login-card-logo" aria-hidden>
            <span className="login-card-logo-mark" />
            <span className="login-card-logo-name">HabitTrack</span>
          </div>

          <Mascot />

          <h1 className="login-headline">
            Build habits,
            <br />
            <em>one day</em>
            <br />
            at a time.
          </h1>

          <p className="login-subtext">
            Track your daily progress. Watch your streaks grow. Stay consistent — one check-in at a
            time.
          </p>

          <span className="login-divider" aria-hidden />

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

          <p className="login-fine-print">By continuing, you agree to our Terms of Service.</p>
        </div>
      </div>
    </div>
  );
}
