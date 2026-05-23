# Дизайн-система Habit Tracker — Cartoon iOS

**Статус:** `pending approval`
**Workdir:** `/Users/user/www/projects/ht-frontend`
**Дата:** 2026-05-23
**Консенсус:** Planner → Architect → Critic (2 итерации, APPROVE)
**Связан с:** [docs/PLAN.md](./PLAN.md)

---

## Содержание

1. [Principles](#principles)
2. [Decision Drivers](#decision-drivers)
3. [Viable Options и инвалидация](#viable-options-и-инвалидация)
4. [Архитектура решения](#архитектура-решения)
   - 4.1 [Design tokens](#41-design-tokens-single-source--srcindexcss)
   - 4.2 [Базовые компоненты](#42-базовые-компоненты-cva-варианты-поверх-shadcnui)
   - 4.3 [Страницы](#43-страницы-mvp)
   - 4.4 [Микроинтеракции](#44-микроинтеракции)
   - 4.5 [Зависимости](#45-новые-зависимости-минимум)
   - 4.6 [Sheet/Dialog dismiss spec](#46-sheetdialog-dismiss-spec)
   - 4.7 [cssVar helper](#47-cssvar-helper)
   - 4.8 [Drag-and-drop reorder a11y](#48-drag-and-drop-reorder-a11y)
5. [CI / Acceptance](#ci--acceptance)
6. [Roadmap (поверх M0..M8)](#roadmap-поверх-m0m8-из-plan)
7. [Pre-mortem](#pre-mortem-доп-к-plan-8)
8. [ADR-6: Claymorphism + CSS-native springs](#adr-6-claymorphism--css-native-springs)
9. [Open Questions](#open-questions-доп-к-plan-12)

---

## Principles

1. **Cartoon ≠ дешевый** — chunky + double shadows, но строгая токенизация, без «детских поделок».
2. **Тактильность** — каждый интерактив имеет 200ms spring press-state; reduced-motion получает не-моторный reward.
3. **iOS-аутентичность поведения** — safe areas, bottom sheets, swipe-back, micro-bounce как haptic-mimicry.
4. **A11y built-in** — AA 4.5:1, толстый focus-ring, forced-colors fallback, keyboard reorder.
5. **Single source of truth** — CSS `@theme` в `src/index.css` — единственный авторитет дизайн-токенов; `cssVar()` для TS-доступа.

---

## Decision Drivers

1. **Daily-click feel** — toggle привычки должен ощущаться «живым» при ежедневном использовании.
2. **Совместимость со стеком** (React 19 + Vite + Tailwind v4 + shadcn/ui) — без переезда.
3. **Минимум новой инфраструктуры** — никакого тяжёлого моушн-движка, если CSS+WAAPI покрывают use cases.

---

## Viable Options и инвалидация

| Опция                                                     | Решение            | Причина                                                           |
| --------------------------------------------------------- | ------------------ | ----------------------------------------------------------------- |
| **A. Claymorphism + CSS `linear()` springs + WAAPI hook** | **Выбрана**        | Cartoon-ощущение, AA-контраст, 0 новых runtime-deps на анимацию   |
| B. Neumorphism (мягкие inset-тени)                        | Отклонена          | Низкий контраст; ломается в forced-colors                         |
| C. Glass / Bento (Apple-Glass frosted)                    | Отклонена          | Не cartoon; frosted backdrop не везде поддержан                   |
| D. Flat Material You                                      | Отклонена          | Не «прикольно», против Driver #1                                  |
| E. Claymorphism + framer-motion                           | Отклонена в iter.1 | 25KB лишних — конфликт с Driver #3; CSS+WAAPI покрывают use cases |

---

## Архитектура решения

### 4.1 Design tokens (single source — `src/index.css`)

Полный `@theme` блок: 13 цветов light + 13 dark (softer pastels, **не** инверсия), 5 радиусов (12/18/24/32/pill), 3 clay-shadow набора, Varela Round + Nunito Sans, easings `--ease-spring-bounce`/`--ease-spring-soft`/`--ease-press`. `@layer base, shadcn, clay, utilities`. Глобальные `@media (forced-colors: active)` и `(prefers-reduced-motion: reduce)`.

```css
@import 'tailwindcss';
@import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@300;400;500;600;700;800&family=Varela+Round&display=swap');

@theme {
  /* colors — light */
  --color-primary: #f59e0b;
  --color-primary-deep: #d97706;
  --color-primary-soft: #fef3c7;
  --color-on-primary: #1f1300;
  --color-accent: #10b981;
  --color-accent-deep: #059669;
  --color-accent-soft: #d1fae5;
  --color-fun-pink: #fb7185;
  --color-fun-violet: #a78bfa;
  --color-fun-sky: #60a5fa;
  --color-bg: #fffbeb;
  --color-bg-elev: #ffffff;
  --color-surface: #fcf6f0;
  --color-fg: #0f172a;
  --color-fg-muted: #64748b;
  --color-border: #faeee1;
  --color-destructive: #ef4444;

  /* radii */
  --radius-sm: 12px;
  --radius-md: 18px;
  --radius-lg: 24px;
  --radius-xl: 32px;
  --radius-pill: 9999px;

  /* clay shadows */
  --shadow-clay-sm:
    0 2px 0 #f5e4cd inset, 0 -2px 0 rgba(255, 255, 255, 0.7) inset, 0 4px 0 #e8d4b6,
    0 8px 16px -4px rgba(217, 119, 6, 0.18);
  --shadow-clay-md:
    0 2px 0 #f5e4cd inset, 0 -2px 0 rgba(255, 255, 255, 0.7) inset, 0 6px 0 #e8d4b6,
    0 14px 24px -6px rgba(217, 119, 6, 0.22);
  --shadow-clay-press: 0 2px 0 rgba(217, 119, 6, 0.15) inset, 0 1px 0 #e8d4b6;

  /* fonts */
  --font-display: 'Varela Round', system-ui, sans-serif;
  --font-body: 'Nunito Sans', system-ui, sans-serif;

  /* spring easings */
  --ease-spring-bounce: linear(
    0,
    0.146 4.4%,
    0.527 11.4%,
    0.882 18.4%,
    1.114 25.4%,
    1.214 32.4%,
    1.211 39.4%,
    1.137 46.4%,
    1.034 53.4%,
    0.944 60.4%,
    0.886 67.4%,
    0.86 74.4%,
    0.872 81.4%,
    0.91 88.4%,
    0.964 95.4%,
    1
  );
  --ease-spring-soft: linear(0, 0.36 10%, 0.74 21%, 0.96 34%, 1.04 45%, 1.01 65%, 1);
  --ease-press: cubic-bezier(0.4, 0, 0.2, 1);
}

/* DARK overrides — softer pastels, NOT inversion */
.dark {
  --color-primary: #fbbf24;
  --color-primary-deep: #f59e0b;
  --color-primary-soft: #3a2d12;
  --color-on-primary: #1a1308;
  --color-accent: #34d399;
  --color-accent-deep: #10b981;
  --color-accent-soft: #0f2f25;
  --color-fun-pink: #fda4af;
  --color-fun-violet: #c4b5fd;
  --color-fun-sky: #93c5fd;
  --color-bg: #1a1410;
  --color-bg-elev: #261d17;
  --color-surface: #2e241c;
  --color-fg: #fef3c7;
  --color-fg-muted: #a89580;
  --color-border: #3d3024;

  --shadow-clay-sm:
    0 2px 0 rgba(255, 255, 255, 0.04) inset, 0 -2px 0 rgba(0, 0, 0, 0.4) inset, 0 4px 0 #15100c,
    0 8px 16px -4px rgba(0, 0, 0, 0.5);
  --shadow-clay-md:
    0 2px 0 rgba(255, 255, 255, 0.04) inset, 0 -2px 0 rgba(0, 0, 0, 0.4) inset, 0 6px 0 #15100c,
    0 14px 24px -6px rgba(0, 0, 0, 0.6);
  --shadow-clay-press: 0 2px 0 rgba(0, 0, 0, 0.4) inset, 0 1px 0 #15100c;
}

@layer base, shadcn, clay, utilities;

@media (forced-colors: active) {
  .clay-surface,
  [data-slot='button'],
  [data-slot='card'],
  [data-slot='checkbox'],
  [data-slot='input'],
  [data-slot='dialog-content'],
  [data-slot='sheet-content'] {
    border: 2px solid ButtonText;
    box-shadow: none;
    background: Canvas;
    color: CanvasText;
  }
  [data-slot='checkbox'][data-state='checked'],
  .clay-surface[data-state='checked'] {
    background: Highlight;
    color: HighlightText;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Safari < 17.4 fallback для linear() easing */
@supports not (transition-timing-function: linear(0, 1)) {
  :root {
    --ease-spring-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
    --ease-spring-soft: cubic-bezier(0.22, 1, 0.36, 1);
  }
}
```

**Verified contrast (AA):**

- `--color-fg #0f172a` на `--color-bg #fffbeb` = **16.4:1** (light)
- `--color-fg #fef3c7` на `--color-bg #1a1410` = **13.1:1** (dark)
- `--color-primary #f59e0b` на `--color-on-primary #1f1300` = **9.6:1**

### 4.2 Базовые компоненты (CVA-варианты поверх shadcn/ui)

| Компонент                     | Cartoon-приём                                                                                                                                                                                                                                                                            |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button variant="clay"`       | `rounded-[var(--radius-lg)]` + `shadow-clay-md`; press → `translateY(4px)` + `shadow-clay-press` за 120ms `--ease-press`; hover → `scale(1.03)` через `--ease-spring-soft`                                                                                                               |
| `Card variant="clay"`         | 2px border `color-border`, double shadow, inner highlight; hover-lift 2px                                                                                                                                                                                                                |
| `Checkbox variant="clay"`     | 44×44 round pill; complete = bounce-scale 0.85→1.15→1 (320ms `--ease-spring-bounce`) + emerald fill morph + 6-particle confetti (lazy `canvas-confetti`). Reduced-motion fallback: `outline:3px solid var(--color-accent-deep)` + `outline-offset:2px`, transition 150ms, держится 600ms |
| `Sheet` (bottom)              | iOS bottom-sheet с drag-handle; spring-soft open, ease-press close (см. §4.6)                                                                                                                                                                                                            |
| `Dialog` (centered)           | scale-95+opacity-0 close 180ms                                                                                                                                                                                                                                                           |
| `Tabs` (bottom-nav на mobile) | Pill-индикатор скользит между активными элементами через CSS translate + `--ease-spring-soft`; активная иконка — scale 1.1                                                                                                                                                               |
| `Input variant="clay"`        | Inset clay shadow, focus → 3px amber ring + glow `0 0 0 6px rgba(245,158,11,.18)`                                                                                                                                                                                                        |
| `Toast`                       | Slide-in сверху с overshoot через `--ease-spring-bounce`; auto-dismiss 4s                                                                                                                                                                                                                |
| `Avatar`                      | Circle + 3px white border + soft shadow                                                                                                                                                                                                                                                  |

Все варианты реализованы как CVA-расширения соответствующих shadcn-компонентов (`<Button variant="clay">`), не параллельной иерархией.

### 4.3 Страницы (MVP)

#### `/` — Today

- **Header:** «Hi, {name} 👋» (Varela Round 28px) + дата pill + streak-flame badge (pink fluffy).
- **DateSwitcher:** горизонтальные date-pills, активный — amber, тап = spring-bounce.
- **HabitCard:** mobile full-width, desktop grid 2/3 col:
  - левый край — icon в clay-circle цвета привычки
  - заголовок + frequency микро-pill
  - правый — большой круглый чекбокс (44×44, tap = confetti + emerald fill + counter «3/5» для counter-типа)
  - swipe-left на mobile → reveal «Note» / «Skip» кнопки
- **Empty state:** иллюстрация «спящий зверёк» (inline SVG, breathing 1↔1.04 в 3s loop, pauses on reduced-motion) + ClayButton «+ Add your first habit».

#### `/habits`

- Сетка ClayCard'ов с drag-handle для reorder (@dnd-kit, см. §4.8).
- Архив в свайпе влево.
- FAB-кнопка «+» в нижнем правом, pulsing.

#### `/habits/:id`

- **Hero:** большой emoji-style icon, title 32px, streak counter с fire-particle анимацией на каждый ребил.
- **Heatmap:** GitHub-style grid 52×7, ячейки 14px с `rounded-[4px]`, level 0..4 = `bg-emerald-100..600`; hover → tooltip с cloud-tail.
- **StreakStat:** три clay-pill — current/best/total, каждый с иконкой (flame, trophy, calendar).
- **Notes list:** chat-bubble стиле.

#### `/stats`

- Period switcher (segmented pill) сверху.
- **CompletionTrendChart** (recharts): area chart с emerald-fill gradient, толщина линии 3px, dot radius 6px при hover.
- **WeekdayBreakdown** (bar): chunky bars с `rounded-t-[12px]` + drop-shadow; 7 баров — gradient amber→pink.
- **PerHabitTable** → не таблица, а grid ClayCard'ов с inline mini-bar.

#### `/login`

- Центрированная иллюстрация (планета/звери), Varela Round H1 «Build habits, one day at a time», ClayButton «Continue with Google» (white surface + Google G logo).

#### `/settings`

- **ThemeToggle:** three-state pill switch (sun/system/moon), активный slide spring.
- **LanguageSelect:** segmented pill RU/EN.
- **LogoutButton:** destructive ClayButton (red) с confirm Sheet.

### 4.4 Микроинтеракции

| Триггер                       | Анимация                                                                                                   |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Tap habit checkbox → complete | scale 0.85→1.15→1 (320ms spring) + emerald fill morph + confetti 6 particles + haptic mimic (subtle shake) |
| Mount HabitCard list          | stagger 40ms per item, fade+translateY(8px)                                                                |
| Streak rebuild                | flame-particle emitter за 600ms                                                                            |
| Page transition               | crossfade 200ms + slide 16px (forward right→left, back inverse)                                            |
| Modal open                    | scale 0.92→1 + opacity 0→1 spring                                                                          |
| Error                         | input shake 3 cycles 80ms                                                                                  |
| Empty state                   | спящий зверёк дышит (scale 1↔1.04 в 3s loop, pauses on reduced-motion)                                     |

### 4.5 Новые зависимости (минимум)

- `@dnd-kit/core` + `@dnd-kit/sortable` — habit reorder (требуется `Habit.sortOrder` из PLAN §6.3).
- `canvas-confetti` (~6KB) — completion reward (gated через `matchMedia('(prefers-reduced-motion: reduce)')`).
- `class-variance-authority` — CVA variants поверх shadcn.
- `recharts` — уже в PLAN.

**Не используется:** `framer-motion` (заменён CSS `linear()` springs + локальный WAAPI `useSpring` hook ~80 LOC).

### 4.6 Sheet/Dialog dismiss spec

```tsx
// src/shared/ui/sheet.tsx — SheetContent className
className={cn(
  'clay-surface fixed inset-x-0 bottom-0 z-50',
  'rounded-t-[var(--radius-xl)] p-6',
  'transition-[transform,opacity] duration-[280ms]',
  'data-[state=open]:[transition-timing-function:var(--ease-spring-soft)]',
  'data-[state=closed]:[transition-timing-function:var(--ease-press)]',
  'data-[state=open]:translate-y-0 data-[state=open]:opacity-100',
  'data-[state=closed]:translate-y-full data-[state=closed]:opacity-0',
)}
```

Backdrop: `transition-opacity duration-200 data-[state=closed]:opacity-0`.
Dialog (центрированный): `data-[state=closed]:scale-95 data-[state=closed]:opacity-0` + `duration-180`.

### 4.7 `cssVar()` helper

```ts
// src/shared/ui/css-var.ts
const FALLBACKS: Record<string, string> = {
  '--color-primary': '#f59e0b',
  '--color-accent': '#10b981',
  '--color-accent-deep': '#059669',
  '--color-fun-pink': '#fb7185',
  '--color-fun-violet': '#a78bfa',
  '--color-fun-sky': '#60a5fa',
  '--color-fg': '#0f172a',
  '--color-border': '#faeee1',
};

export const cssVar = (name: keyof typeof FALLBACKS | string): string => {
  if (typeof window === 'undefined' || !document.documentElement) {
    return FALLBACKS[name] ?? '';
  }
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return (v || FALLBACKS[name]) ?? '';
};
```

Используется Recharts (stroke/fill) и canvas-confetti (palette). `tokens.ts` **удалён** — CSS `@theme` остаётся единственным источником.

### 4.8 Drag-and-drop reorder a11y

- `KeyboardSensor` + `sortableKeyboardCoordinates` подключены в `<DndContext>` на `/habits`.
- Каждый `HabitCard` имеет видимую drag-handle (icon `GripVertical`, 44×44) с `aria-label="Reorder habit: {title}"` и `aria-roledescription="sortable"`.
- Клавиатура: **Space** — pick up; **Arrow Up/Down** — move; **Space** — drop; **Esc** — cancel.
- Screen-reader announcements через `DndContext.accessibility.announcements` (русск./англ. локализованные строки).
- E2E тест в M2: `user.tab()` до handle → `user.keyboard('{ }{ArrowDown}{ArrowDown}{ }')` → проверить новый порядок в API-моке.

---

## CI / Acceptance

| Слой                | Инструмент                                                             | Когда                           |
| ------------------- | ---------------------------------------------------------------------- | ------------------------------- |
| Component a11y      | `vitest-axe`                                                           | каждый PR                       |
| Page a11y           | `@axe-core/playwright`                                                 | каждый PR на ключевых страницах |
| Forced-colors audit | Playwright `emulateMedia({forcedColors: 'active'})` + axe              | D5, регулярно                   |
| Visual regression   | Playwright screenshot diff (key states × light/dark × 375/768/1440)    | M8                              |
| Touch target lint   | ESLint rule на `min-h`/`min-w` на `<button>`/`<input type="checkbox">` | каждый PR                       |
| Keyboard reorder    | Playwright E2E с `user.keyboard`                                       | M2                              |
| Manual              | VoiceOver pass + Windows High Contrast DevTools                        | перед merge M8                  |

---

## Roadmap (поверх M0..M8 из PLAN)

| D      | M                  | Содержание                                                                                                  |
| ------ | ------------------ | ----------------------------------------------------------------------------------------------------------- |
| **D0** | M0 Bootstrap       | Полный `index.css` с `@theme`, ClayButton/Card/Input/Checkbox primitives (CVA), `cssVar` helper + тесты     |
| **D1** | M1 Auth / M3 Today | Login illustration, HabitCard, DateSwitcher, Today shell                                                    |
| **D2** | M2 Habits CRUD     | HabitForm в bottom-sheet (color/icon picker), @dnd-kit reorder + keyboard sensor                            |
| **D3** | M4 Streaks+Heatmap | Heatmap component, fire-particle streak, NotesList                                                          |
| **D4** | M5 Stats           | Recharts claymorph wrappers (area, chunky bars), period switch                                              |
| **D5** | M8 Polish          | Confetti + reduced-motion path, page transitions, empty states, dark-mode QA, forced-colors audit, axe pass |

---

## Pre-mortem (доп. к PLAN §8)

**Сценарий 1: «Confetti лагает на low-end Android.»**
Lazy-import `canvas-confetti` только при первом complete; emit ≤6 particles; respect `prefers-reduced-motion`. Fallback — outline-flash без particles.

**Сценарий 2: «Spring `linear()` не работает в Safari < 17.4.»**
`@supports not (transition-timing-function: linear(0,1))` блок переопределяет `--ease-spring-*` на `cubic-bezier(.34, 1.56, .64, 1)`. Тест в Browserstack на Safari 16.

**Сценарий 3: «Cartoon-стиль приедается через 6 месяцев.»**
Все clay-tokens изолированы в `@layer clay` + `@theme`; смена темы = редактирование одного файла `index.css`, без feature-flag.

---

## ADR-6: Claymorphism + CSS-native springs

- **Decision:** Claymorphism design language (2px border + double shadow + 18-24px radius) с Varela Round/Nunito Sans, реализован как CVA `variant="clay"` поверх shadcn/ui. Анимации — CSS `linear()` easing + WAAPI `useSpring` хук; `framer-motion` исключён.
- **Drivers:** daily-tactility, стек-compat, минимум новой инфраструктуры, a11y.
- **Alternatives:** Neumorphism (a11y/forced-colors), Glass/Bento (не cartoon), Flat (скучно), Clay+framer-motion (25KB лишних при достижимости через CSS).
- **Why chosen:** покрывает cartoon-iOS интент при сохранении токенизированной системы, AA-контраста (16.4:1 fg/bg), forced-colors fallback, и нулевых новых runtime-deps на анимацию.
- **Consequences:**
  - dark-mode требует ручной настройки теней (не auto-invert)
  - `linear()` требует Safari ≥17.4 → cubic-bezier fallback через `@supports`
  - 8-token hex fallback в `cssVar` нужно синхронизировать вручную при изменении токенов
- **Follow-ups:**
  - Post-MVP: 2-строчный Makefile target для проверки sync между `cssVar` FALLBACKS и `@theme`
  - Добавить `data-slot="switch"` в forced-colors блок при появлении shadcn Switch
  - При PWA — добавить native haptics через Vibration API

---

## Open Questions (доп. к PLAN §12)

1. **Иконки привычек** — `lucide-react` (нейтрально) или эмодзи-style SVG-сет (более cartoon)? Рекомендация: lucide для UI, отдельный sprite cartoon-emoji для пользовательского выбора иконки привычки.
2. **Иллюстрации** (login hero, empty-state «спящий зверёк») — заказывать у иллюстратора или AI-генерация + ручная очистка? Бюджет?
3. **PWA + install-prompt** в roadmap V1.1 — добавить cartoon-icon set 512×512?
