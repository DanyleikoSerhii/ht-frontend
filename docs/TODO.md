# TODO — пошаговая реализация Habit Tracker (frontend)

Источник истины: [PLAN.md](./PLAN.md). Чек-лист идёт строго по милстоунам M0→M8. Каждая задача — атомарная, с явным критерием готовности.

**Легенда:** `[ ]` не начато · `[~]` в работе · `[x]` готово · `(BLK)` блокер на внешнего

---

## M0 · Bootstrap (~0.5 дня)

### M0.1 · Инициализация репо

- [x] `git init` в `/Users/user/www/projects/ht-frontend`
- [x] Создать `.gitignore` (node_modules, dist, .env\*, .DS_Store, coverage, .vite, .turbo)
- [x] Создать удалённый репозиторий на GitHub `OWNER/ht-frontend`, привязать `git remote add origin git@github.com:DanyleikoSerhii/ht-frontend.git`
- [x] Защитить `main`: require PR + status checks (typecheck, lint)

### M0.2 · Скаффолд Vite + React + TS

- [x] `pnpm create vite . --template react-ts`
- [x] `pnpm install` и проверка `pnpm dev` → открывается `localhost:5173`
- [x] Удалить дефолтный `App.tsx`/`index.css`/логотипы — оставить пустой каркас
- [x] В `tsconfig.json` включить `"strict": true`, `"noUncheckedIndexedAccess": true`, `"verbatimModuleSyntax": true`
- [x] Настроить alias `@/* → src/*` (`vite.config.ts` + `tsconfig.json` paths)

### M0.3 · Tailwind v4 + shadcn/ui

- [x] Установить Tailwind v4: `pnpm add tailwindcss @tailwindcss/vite`, подключить в `vite.config.ts`
- [x] Создать `src/index.css` с `@import "tailwindcss";` и базовыми CSS-переменными темы
- [x] `pnpm dlx shadcn@latest init` — выбрать stone/zinc базу, Tailwind v4, CSS variables
- [x] Добавить минимальные shadcn-примитивы: `button card dialog input label select switch dropdown-menu sonner tooltip` (`pnpm dlx shadcn@latest add …`)

### M0.4 · ESLint + Prettier + EditorConfig

- [x] Установить `eslint @eslint/js typescript-eslint eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-jsx-a11y prettier eslint-config-prettier` через `pnpm add -D`
- [x] Создать `eslint.config.js` (flat config), включить rules для react, hooks, a11y, no-any
- [x] Создать `.prettierrc` (singleQuote, trailingComma all, printWidth 100)
- [x] `.editorconfig`: utf-8, lf, 2 пробела
- [x] `pnpm lint` и `pnpm format` в `package.json`

### M0.6 · Структура каталогов

- [x] Создать пустые директории: `src/app`, `src/routes`, `src/features/{habits,entries,streaks,heatmap,stats,auth}`, `src/shared/{ui,api,lib,config,stores}`, `src/locales/{ru,en}`
- [x] Положить `.gitkeep` в пустые папки

### M0.7 · TanStack Router + Query (skeleton)

- [x] `pnpm add @tanstack/react-router @tanstack/react-query @tanstack/router-devtools @tanstack/react-query-devtools`
- [x] `pnpm add -D @tanstack/router-plugin` и подключить `tanstackRouter()` в `vite.config.ts`
- [x] Создать `src/routes/__root.tsx` с `Outlet` и Devtools (dev-only)
- [x] Создать `src/routes/index.tsx` — placeholder "Hello"
- [x] `src/app/router.tsx` — `createRouter` с `routeTree`
- [x] `src/app/providers.tsx` — `QueryClientProvider` + `RouterProvider`
- [x] `src/main.tsx` — обернуть `<App />` в providers
- [x] **DoD:** `pnpm dev` показывает страницу, router devtools работает

### M0.8 · Health endpoint

- [x] Создать `public/health` с содержимым `ok` (без перевода строки)
- [x] **DoD:** после `pnpm build` файл есть в `dist/health`

### M0.9 · Базовый layout

- [x] `src/app/layout.tsx` — header (logo, user menu placeholder), sidebar (nav), main (Outlet)
- [x] Mobile breakpoint: sidebar превращается в bottom-nav на `md:` < 768
- [x] Подключить в `__root.tsx`

### M0.10 · Verification gate M0

- [x] `pnpm typecheck` → 0 errors
- [x] `pnpm lint` → 0 errors, 0 warnings
- [x] `pnpm build` → собирается, `dist/health` существует

---

## M1 · Auth (BFF, ~1 день) `(BLK на бэкенд)`

### M1.1 · HTTP-клиент

- [x] `pnpm add ky` (ky v2.0.2 — в v2 опция `prefixUrl` переименована в `prefix`, hooks получают state object)
- [x] `src/shared/api/client.ts` — экземпляр `ky.create({ prefix: import.meta.env.VITE_API_BASE_URL, credentials: 'include', retry: 0, hooks: { … } })`
- [x] Hook `beforeRequest` — добавляет `Accept: application/json`, в dev (`import.meta.env.DEV`) логирует `[api] METHOD URL` через `console.debug`
- [x] Hook `afterResponse` — на `!response.ok` бросает `ApiError.fromResponse(response)` (минимальный `ApiError` создан в `src/shared/api/errors.ts`; M1.2 расширит схемой и helpers)
- [x] **DoD:** `pnpm typecheck && pnpm lint && pnpm build` зелёные; `pnpm dev` логирует `[api] GET ...` в dev-консоли

### M1.2 · Errors

- [x] `src/shared/api/errors.ts` — `ApiErrorBodySchema` (zod), `ApiError` class (status, body, retryAfterSeconds, requestId), `ApiErrorKind` discriminated union, `toApiErrorKind(err)` helper (см. PLAN §6.6)
- [x] **DoD:** `pnpm typecheck && pnpm lint && pnpm build` зелёные; ручная проверка через `pnpm dev` (отправить запрос, увидеть `ApiError` в DevTools)

### M1.3 · Env-валидация

- [ ] `src/shared/config/env.ts` — `EnvSchema`, `env = EnvSchema.parse(import.meta.env)`
- [ ] При ошибке валидации — внятное сообщение в консоли
- [ ] Создать `.env.example` со списком ключей (без значений)
- [ ] Создать локальный `.env.development.local` (в `.gitignore`) с реальными значениями

### M1.4 · Auth схемы

- [x] `src/features/auth/schemas.ts` — `UserSchema`, `MeResponseSchema`, `AuthProvider`, `LogoutResponseSchema` (по PLAN 6.2)
- [x] `src/shared/api/primitives.ts` — `UserId`, `HabitId`, `LocalDate`, `IsoDateTime`, `HexColor`, `Timezone` (по PLAN 6.1; нужны для UserSchema)

### M1.5 · Auth API + хук

- [x] `src/features/auth/api.ts` — `getMe()` (GET `/auth/me` → `MeResponseSchema.parse`), `logout()` (POST `/auth/logout` → `LogoutResponseSchema.parse`)
- [x] `src/features/auth/hooks.ts` — `useAuth()` (TanStack Query, `staleTime: Infinity`, `retry: false`), `useLogout()` mutation (`onSuccess`: `queryClient.removeQueries({ queryKey: queryKeys.auth.me() })`)
- [x] Query key: `queryKeys.auth.me()` из `src/shared/api/query-keys.ts`

### M1.6 · Login страница

- [x] `src/routes/login.tsx` — центрированная карточка с кнопкой "Войти через Google"
- [x] Кнопка: `window.location.href = \`\${env.VITE_API_BASE_URL}/auth/google\``(использован`import.meta.env.VITE_API_BASE_URL` напрямую до M1.3)
- [x] `src/routes/auth.callback.tsx` — спиннер + `invalidate(['auth', 'me'])` + redirect на `/`

### M1.7 · Auth guard (layout route)

- [x] Создать `src/routes/_authenticated/route.tsx` с `beforeLoad`: ensure `auth.me` query → если 401 throw `redirect({ to: '/login' })`
- [x] Перенести `index.tsx` под `_authenticated`
- [x] В layout добавить avatar пользователя из `useAuth()` + кнопка Logout (вызывает `useLogout` → редирект на `/login`)

### M1.8 · Verification gate M1

- [x] Manual smoke: неавторизованный пользователь на `/` → редирект на `/login` (Chrome DevTools MCP, fetch mock 401)
- [x] Manual smoke: после `auth.me` 200 — `/` рендерится (Chrome DevTools MCP, fetch mock 200 user)
- [x] Логаут чистит query cache и редиректит на `/login` (Chrome DevTools MCP, mock POST /auth/logout 200 — observers refetched after removeQueries)
- [x] typecheck/lint/build зелёные

---

## M2 · Habits CRUD (~1.5 дня)

### M2.1 · Schemas

- [x] `src/shared/api/primitives.ts` — `HabitId`, `EntryId`, `UserId`, `LocalDate`, `IsoDateTime`, `HexColor`, `Timezone`, `Page` (PLAN 6.1)
- [x] `src/features/habits/schemas.ts` — `HabitSchema`, `HabitFrequency`, `Weekday`, `HabitKind`, `CreateHabitInput`, `UpdateHabitInput` (PLAN 6.3)

### M2.2 · API

- [x] `src/features/habits/api.ts` — `list({archived})`, `get(id)`, `create(input)`, `update(id, input)`, `delete(id)`, `archive(id)` (экспортирован как `remove` — `delete` зарезервирован в JS)
- [x] Все ответы прогоняются через `Schema.parse(...)`

### M2.3 · Хуки

- [x] `useHabits({archived})`, `useHabit(id)` queries
- [x] `useCreateHabit`, `useUpdateHabit`, `useDeleteHabit`, `useArchiveHabit` mutations с `onSuccess: invalidate(queryKeys.habits.all())`
- [x] Toast (`sonner`) на success/error

### M2.4 · HabitForm

- [x] `src/features/habits/components/habit-form.tsx` — RHF + zodResolver на `CreateHabitInput`
- [x] Поля: title, description, color (color picker), icon (select из 24 lucide-иконок), kind (radio), targetPerDay (показывать только для counter), frequency (select), customDays (показывать только при custom), reminderTime
- [x] Server-side fieldErrors → `setError` в RHF

### M2.5 · HabitList и HabitCard

- [x] `src/features/habits/components/habit-card.tsx` — карточка с icon, title, frequency, actions menu (edit, archive, delete)
- [x] `src/features/habits/components/habit-list.tsx` — grid из карточек, empty state, loading skeleton
- [x] Подтверждение delete через AlertDialog

### M2.6 · Страница /habits

- [x] `src/routes/_authenticated/habits.tsx` — header с кнопкой "+ Привычка", `<HabitList>`, search (search param `q`), filter archived
- [x] Dialog с `HabitForm` для create/edit (управление через local route state; UI-store modal — M2.7)

### M2.7 · Стор модалок

- [x] `src/shared/stores/ui-store.ts` — Zustand-стор с `ModalKind` (PLAN 6.7), `selectedDate`, actions

### M2.8 · Verification gate M2

- [ ] typecheck/lint/build зелёные
- [ ] Manual smoke в dev: полный CRUD-цикл работает (создал → отредактировал → удалил → archived)

---

## M3 · Today + Entries (~1 день)

### M3.1 · Schemas

- [x] `src/features/entries/schemas.ts` — `HabitEntrySchema`, `UpsertEntryInput`, `EntriesRangeQuery`, `TodayItemSchema` (PLAN 6.4)

### M3.2 · Date helpers

- [x] `npm i dayjs`
- [x] `src/shared/lib/date.ts` — `getLocalDateISO(date?)`, `parseLocalDate(s)`, `addDays(d, n)`, `formatHumanDate(d, locale)`

### M3.3 · API + хуки

- [x] `src/features/entries/api.ts` — `getToday(date)`, `upsertEntry(habitId, input)`, `deleteEntry(habitId, date)`
- [x] `useTodayItems(date)` query
- [x] `useToggleEntry()` mutation с **optimistic update**:
  - `onMutate`: snapshot query, мгновенно обновить TodayItem entry
  - `onError`: rollback из snapshot
  - `onSettled`: `invalidateQueries(['today']) + (['habits', id, 'stats'])`

### M3.4 · Today UI

- [x] `src/routes/_authenticated/index.tsx` — заголовок с `DateSwitcher` (← сегодня →)
- [x] `DateSwitcher` использует `selectedDate` из ui-store
- [x] Список `TodayItem` карточек: чекбокс (boolean) или counter (− N +); note button открывает модалку
- [x] `isDue=false` элементы — отдельная секция "Не на сегодня" (свёрнута)

### M3.5 · Verification gate M3

- [x] typecheck/lint/build зелёные
- [ ] Manual smoke: toggle → optimistic UI обновляется до ответа сервера; network fail → rollback видим; свитч даты подгружает день

---

## M4 · Streaks + Heatmap (~1.5 дня)

### M4.1 · Schemas

- [x] `src/features/stats/schemas.ts` — `HabitStatsSchema`, `HeatmapCellSchema`, `HeatmapResponseSchema` (PLAN 6.5)

### M4.2 · API + хуки

- [x] `useHabitStats(id)`, `useHeatmap(id, from, to)` queries

### M4.3 · StreakStat

- [x] `src/features/streaks/components/streak-stat.tsx` — карточка: currentStreak (большая цифра + flame), bestStreak, completionRate30d
- [x] Skeleton на загрузке

### M4.4 · Heatmap

- [x] `src/features/heatmap/components/heatmap.tsx` — 7×52 grid (год), ячейки 11×11px с gap 3px, скруглённые
- [x] Цвет: `level=0` → muted, 1..4 → лесенка opacity цвета привычки
- [x] Tooltip на ячейке: дата + count
- [x] A11y: `role="grid"`, ячейка `role="gridcell"`, `aria-label="2026-05-15: N times"`, навигация стрелками
- [x] Mobile: горизонтальный скролл с указанием месяцев сверху

### M4.5 · Страница /habits/:id

- [x] `src/routes/_authenticated/habits.$id.tsx` — header с title привычки, `<StreakStat>`, `<Heatmap>` (год), список последних 20 entries с заметками
- [x] `notFound` страница если habit не найден

### M4.6 · Verification gate M4

- [ ] Manual smoke: захожу в habit → вижу streak и heatmap; отмечаю сегодня → currentStreak +1 (invalidate)
- [x] typecheck/lint/build зелёные

---

## M5 · Stats dashboard (~1 день)

### M5.1 · Schemas

- [x] `DashboardSummarySchema`, `CompletionTrendSchema`, `WeekdayBreakdownSchema`, `StatsPeriod` (PLAN 6.5)

### M5.2 · API + хуки

- [x] `useDashboardSummary(period)`, `useCompletionTrend(period)`, `useWeekdayBreakdown(period)`

### M5.3 · Recharts setup

- [x] `npm i recharts`
- [x] Обёртка `src/features/stats/components/chart-container.tsx` — `ResponsiveContainer` + общие отступы/тема
- [x] Цвета берутся из CSS-переменных темы → работает в dark/light

### M5.4 · Графики

- [x] `CompletionTrendChart` — Area / Line по `completionRate` × дни
- [x] `WeekdayBreakdownChart` — Bar по 7 дням недели
- [x] `SummaryCards` — 4 цифровых KPI вверху

### M5.5 · Страница /stats

- [x] `src/routes/_authenticated/stats.tsx` — period selector (segmented control 7d/30d/90d/365d, в search params)
- [x] Skeletons на загрузке, empty-state если нет данных

### M5.6 · Verification gate M5

- [x] typecheck/lint/build зелёные
- [x] Manual: переключение period обновляет графики

---

## M6 · Theme + i18n + Settings (~0.5 дня)

### M6.1 · Theme

- [x] `pnpm i next-themes`
- [x] Обернуть в `ThemeProvider` в `providers.tsx` (`attribute="class"`, defaultTheme "system")
- [x] `src/shared/ui/theme-toggle.tsx` — dropdown light/dark/system

### M6.2 · i18n

- [x] `pnpm i i18next react-i18next i18next-browser-languagedetector`
- [x] `src/shared/lib/i18n.ts` — init с ресурсами из `src/locales/{ru,en}/common.json`
- [x] Перевести все строки UI (label'ы, кнопки, сообщения, empty/error states)
- [x] `LanguageSelect` компонент

### M6.3 · Prefs store

- [x] `src/shared/stores/prefs-store.ts` — Zustand с `persist` middleware (localStorage), хранит `theme`, `locale`
- [x] При смене locale → `i18n.changeLanguage` + обновить `<html lang>`

### M6.4 · Страница /settings

- [x] `src/routes/_authenticated/settings.tsx` — секции "Тема", "Язык", "Аккаунт" (email + logout)
- [x] Сохранение настроек на бэке (опц., если есть endpoint `PATCH /me`)

### M6.5 · Verification gate M6

- [x] typecheck/lint/build зелёные
- [ ] Manual: смена темы и языка работает, persist после reload

---

## M7 · CI/CD + EC2 (~1 день)

### M7.1 · EC2 подготовка (one-time)

- [x] Запустить EC2, Amazon Linux 2023 или Ubuntu 22.04
- [x] Security group: 22 (SSH), 8000 (только от ALB SG)
- [x] nvm + node 22, pm2 + serve, директории `/services/ht-frontend`, `/var/log/services/ht-frontend`
- [x] SSH-ключ GHA → `authorized_keys` деплой-юзера; секрет `EC2_SSH_KEY` в GitHub
- [x] Репо клонировано/инициализировано в `/services/ht-frontend` (workflow делает `git init` + `git remote` если не существует)

### M7.2 · PM2 ecosystem

- [x] `ecosystem.config.cjs` в корне репо — `serve dist --single --listen 8000`, cwd `/services/ht-frontend`, логи в `/var/log/services/ht-frontend/`
- [x] На EC2: `pm2 start ecosystem.config.cjs && pm2 save`
- [x] Проверить `curl http://localhost:8000/health.txt` → `ok` (файл `public/health.txt`, не `/health`)

### M7.3 · ALB

- [x] ALB в VPC (2 AZ minimum)
- [x] Target group → HTTP:8000, health check `/health.txt` (body `ok`), interval 15s
- [x] EC2 instance зарегистрирован в target group
- [x] ACM-сертификат на домен (валидация через DNS)
- [x] HTTPS listener :443 → forward в target group
- [x] HTTP listener :80 → 301 redirect на :443
- [x] Route53 A-alias → ALB
- [x] **DoD:** `https://$DOMAIN/health.txt` → 200, body `ok`

### M7.4 · GitHub Actions workflow

- [x] `.github/workflows/deploy.yml` — jobs: `ci` (typecheck · lint · test · build), `deploy` (SSH via appleboy), `rollback` (on deploy failure)
- [x] Секреты: `EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY`, `VITE_API_BASE_URL`, `VITE_SENTRY_DSN`
- [x] Variables: `PUBLIC_DOMAIN`
- [x] Environment `production` с URL `https://$PUBLIC_DOMAIN`

### M7.5 · SSH ключ GHA → EC2

- [x] ed25519-ключ сгенерирован без passphrase
- [x] Public part → `authorized_keys` деплой-юзера на EC2cc -cxx
- [x] Private part → GitHub Secret `EC2_SSH_KEY`

### M7.6 · CSP / security headers

- [x] `serve.json` в корне репо (serve CLI подхватывает из cwd автоматически)
- [x] Заголовки: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, `HSTS: max-age=31536000; includeSubDomains`

### M7.7 · Первый деплой

- [x] `git push origin main` → workflow стартует автоматически (триггер `push: branches: [main]`)
- [x] CI job: `pnpm test && pnpm build` с placeholder env; deploy job: SSH-скрипт пишет `.env.production`, собирает, делает `pm2 reload --update-env`
- [x] Rollback job: срабатывает при `failure()` deploy, сбрасывает на `$(cat .previous_sha)` и пересобирает

### M7.8 · Verification gate M7

- [x] Прод-домен открывается, login flow работает end-to-end
- [x] ALB health check `GET /health.txt` проходит (20 попыток × 3s в workflow)
- [x] Логи пишутся в `/var/log/services/ht-frontend/{out,err}.log` через PM2 (`time: true`, `merge_logs: true`)

---

## Параллельные / cross-cutting задачи

### Backend coordination `(BLK)`

- [ ] Зафиксировать с backend-командой контракт OpenAPI / JSON schemas всех эндпоинтов из PLAN 6.11
- [ ] Согласовать timezone policy (LocalDate vs IsoDateTime)
- [ ] BFF endpoints `/auth/google`, `/auth/callback`, `/auth/me`, `/auth/logout` — готовы до M1
- [ ] CORS на бэке: allow `https://app.example.com` + `credentials: true`

### Документация — обновляется по ходу

- [ ] Все ADR-решения, которые отклонились от PLAN.md → дописать в PLAN раздел 11
- [ ] CHANGELOG.md (Keep a Changelog format) если будут релизы

---

## Definition of Done (на каждый PR)

- [ ] `pnpm typecheck` зелёный
- [ ] `pnpm lint` зелёный (0 warnings)
- [ ] `pnpm build` зелёный
- [ ] Manual smoke в dev по затронутой фиче
- [ ] Изменения в публичных контрактах (schemas, env, api endpoints) — отражены в PLAN.md
- [ ] Нет TODO/FIXME без issue
- [ ] Нет `console.log` (кроме error reporting)
- [ ] PR описание содержит: что, зачем, как тестировать
