# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is `pnpm@11.2.2` (pinned via `packageManager` field). Node 22 in CI/EC2.

- `pnpm dev` — Vite dev server on **port 8000** (see `vite.config.ts`).
- `pnpm build` — runs `tsr generate && tsc -b && vite build`. Route tree generation is part of build; do not edit `src/routeTree.gen.ts`.
- `pnpm typecheck` — `tsr generate && tsc -b --noEmit`. Always regenerates routes first.
- `pnpm lint` — ESLint with `--max-warnings=0`. Treat warnings as errors.
- `pnpm test` — composite gate: `typecheck && format:check && lint`. There is **no unit-test runner wired yet** (Vitest is planned but not installed); `pnpm test` is the green-CI gate.
- `pnpm fix` — `prettier --write . && eslint --fix`.
- `pnpm routes:generate` — regenerate TanStack Router file-based tree (`src/routeTree.gen.ts`) without a full build.
- `pnpm deploy:dry` — local equivalent of CI (`typecheck && lint && build`).

Required env vars (see `.env.example`): `VITE_API_BASE_URL`, `VITE_PUBLIC_DOMAIN`, `VITE_SENTRY_DSN`. `import.meta.env.VITE_API_BASE_URL` is consumed directly by `ky` as the request `prefix`; a typed `env` module is planned (M1.3) but not yet present.

## Architecture

### Stack

React 19 + TS 6 + Vite 8 + Tailwind v4 (`@tailwindcss/vite`, no `tailwind.config`; tokens live in `src/index.css`) + shadcn/ui (New York style, base color `zinc`, alias `@/shared/ui`). Server state via TanStack Query v5; client/UI state via Zustand. Routing via TanStack Router (file-based, `autoCodeSplitting`). Forms via react-hook-form + zod. HTTP via `ky`.

### Layering (feature-folders, not FSD)

- `src/app/` — application shell: `providers.tsx` (QueryClient + RouterProvider + Toaster), `router.tsx` (`createRouter` with typed `RouterContext = { queryClient }`), `layout.tsx` (header + sidebar/bottom-nav shell, used by `_authenticated` layout route).
- `src/routes/` — file-based routes. `__root.tsx` uses `createRootRouteWithContext<RouterContext>()` and lazy-loads devtools only in dev. `_authenticated/route.tsx` is the auth guard layout route — its `beforeLoad` calls `queryClient.ensureQueryData({ queryKey: queryKeys.auth.me(), queryFn: getMe })` and `throw redirect({ to: '/login' })` on `ApiError` 401. **Authenticated pages live under `src/routes/_authenticated/`**; there is no `src/routes/index.tsx` at the top level (it was moved under the guard).
- `src/features/<domain>/` — colocated `api.ts`, `hooks.ts`, `schemas.ts`, `components/`. Current domains: `auth`, `habits`. Stubs (`.gitkeep`) for `entries`, `streaks`, `heatmap`, `stats` per the roadmap.
- `src/shared/` — primitives shared across features:
  - `shared/api/client.ts` — single `ky` instance: `prefix` from env, `credentials: 'include'` (BFF cookie auth), `retry: 0`, `afterResponse` hook throws `ApiError.fromResponse(response)` on non-2xx.
  - `shared/api/errors.ts` — `ApiError` class + `ApiErrorBodySchema` (zod) + `toApiErrorKind()` discriminated-union helper (`unauthorized | validation | rateLimited | ...`). Use `err instanceof ApiError` for status checks; use `toApiErrorKind` only when branching on category in UI code.
  - `shared/api/primitives.ts` — branded zod types: `UserId`, `HabitId`, `EntryId`, `LocalDate` (`YYYY-MM-DD`), `IsoDateTime`, `HexColor`, `Timezone`, plus a `Page<T>` schema factory.
  - `shared/api/query-keys.ts` — **single source of truth for query keys**. All `useQuery`/`invalidate` callsites must go through `queryKeys.*`; do not write key arrays inline.
  - `shared/ui/` — shadcn primitives. `cn()` lives in `@/lib/utils`.
  - `shared/stores/ui-store.ts` — Zustand store for ephemeral UI (modal kind, selected date).
- `src/lib/utils.ts` — shadcn helper bucket. Note the alias split in `components.json`: shadcn writes components to `@/shared/ui` but utils to `@/lib`.

### Data-flow conventions (load-bearing, follow when adding features)

1. **All API responses are parsed through zod schemas at the boundary.** Never trust raw `.json()` — see `features/habits/api.ts` for the pattern (`SomeSchema.parse(await api.get(...).json())`).
2. **Mutations call `invalidateQueries({ queryKey: queryKeys.<domain>.all() })`** on success and surface success/error through `sonner` toasts. See `features/habits/hooks.ts`.
3. **Auth query is special:** `staleTime: Infinity`, `retry: false`. Logout uses `queryClient.removeQueries` (not invalidate) to drop cached `me`.
4. **Reserved JS words in API modules:** export `remove` (not `delete`) and re-import as `deleteHabit` at the call site.
5. **Branded primitives are not assignable from raw strings.** Construct via `HabitId.parse(value)` when crossing untyped boundaries.

### Routing specifics

- `defaultPreload: 'intent'` + `scrollRestoration: true` are set on the router.
- Route context type lives in `src/app/router.tsx` and is registered globally via `declare module '@tanstack/react-router'`. New routes that need the query client should consume `context.queryClient` from `beforeLoad`/`loader`.
- The router-plugin (`@tanstack/router-plugin/vite`) auto-regenerates `routeTree.gen.ts` in dev. If you add a route file, restart dev or run `pnpm routes:generate`.

### TS / lint constraints (will fail CI)

- `strict`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`, `noUnusedLocals/Parameters` are all on.
- `@typescript-eslint/no-explicit-any: error`. Use `unknown` + narrowing.
- `consistent-type-imports` with `fixStyle: 'inline-type-imports'` — write `import { type Foo } from '...'` (inline), not separate `import type`.
- ESLint runs with `--max-warnings=0`.

## Deploy

EC2 + PM2 + `serve` static-host model (no Docker, no SSR). `.github/workflows/deploy.yml` SSHes to EC2, runs `git reset --hard origin/main`, `pnpm install --frozen-lockfile`, writes `.env.production` from GitHub secrets, builds, then `pm2 reload` per `ecosystem.config.cjs` (`npx serve dist --single --listen 8000`). Workflow records previous SHA before mutation and has a `rollback` job that fires on `deploy` failure. Health check is `GET https://$DOMAIN/health.txt` expecting body `ok` — the file is in `public/health.txt` (the rename from `public/health` is intentional, see commit `e1089d6`: `serve` returned the extensionless path as a directory listing). When changing the health asset, update both the file and the workflow probe.

## Source-of-truth docs

- `docs/PLAN.md` — architecture decisions, ADRs, domain schemas (sections 6.1–6.7 enumerate every zod schema by milestone). Consult before introducing a new domain type.
- `docs/TODO.md` — milestone checklist (M0–M8). `[x]` = done, `[~]` = in progress, `(BLK)` = blocked on backend. Update status here when finishing a milestone task.
