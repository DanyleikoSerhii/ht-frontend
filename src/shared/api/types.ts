import type { components } from './schema.d.ts';

export type User = components['schemas']['User'];
export type UpdateUserInput = components['schemas']['UpdateUserInput'];

export type Habit = components['schemas']['Habit'];
export type CreateHabitInput = components['schemas']['CreateHabitInput'];
export type UpdateHabitInput = components['schemas']['UpdateHabitInput'];

export type Entry = components['schemas']['Entry'];
export type UpsertEntryInput = components['schemas']['UpsertEntryInput'];

export type HabitStats = components['schemas']['HabitStats'];

export type HeatmapResponse = components['schemas']['HeatmapResponse'];
export type HeatmapCell = components['schemas']['HeatmapCell'];

export type DashboardSummary = components['schemas']['DashboardSummary'];
export type CompletionTrend = components['schemas']['CompletionTrend'];
export type WeekdayBreakdown = components['schemas']['WeekdayBreakdown'];

export type TodayResponse = components['schemas']['TodayResponse'];
export type TodayItem = components['schemas']['TodayItem'];
export type TodayEntry = components['schemas']['TodayEntry'];
