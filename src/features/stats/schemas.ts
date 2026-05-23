import { z } from 'zod';

import { HabitId, LocalDate } from '@/shared/api/primitives';

export const HabitStatsSchema = z.object({
  currentStreak: z.number().int().nonnegative(),
  bestStreak: z.number().int().nonnegative(),
  completionRate: z.number().min(0).max(1),
  totalCompleted: z.number().int().nonnegative(),
  totalDue: z.number().int().nonnegative(),
});
export type HabitStats = z.infer<typeof HabitStatsSchema>;

export const HeatmapCellSchema = z.object({
  date: LocalDate,
  count: z.number().int().nonnegative(),
  level: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
});
export type HeatmapCell = z.infer<typeof HeatmapCellSchema>;

export const HeatmapResponseSchema = z.object({
  cells: z.array(HeatmapCellSchema),
});
export type HeatmapResponse = z.infer<typeof HeatmapResponseSchema>;

export const StatsPeriod = z.enum(['7d', '30d', '90d', '365d']);
export type StatsPeriod = z.infer<typeof StatsPeriod>;

export const DashboardSummaryHabitSchema = z.object({
  habitId: HabitId,
  title: z.string(),
  completionRate: z.number().min(0).max(1),
  currentStreak: z.number().int().nonnegative(),
});
export type DashboardSummaryHabit = z.infer<typeof DashboardSummaryHabitSchema>;

export const DashboardSummarySchema = z.object({
  period: StatsPeriod,
  activeHabits: z.number().int().nonnegative(),
  avgCompletionRate: z.number().min(0).max(1),
  habits: z.array(DashboardSummaryHabitSchema),
});
export type DashboardSummary = z.infer<typeof DashboardSummarySchema>;

export const CompletionTrendPointSchema = z.object({
  date: LocalDate,
  rate: z.number().min(0).max(1),
  doneCount: z.number().int().nonnegative(),
  dueCount: z.number().int().nonnegative(),
});
export type CompletionTrendPoint = z.infer<typeof CompletionTrendPointSchema>;

export const CompletionTrendSchema = z.object({
  period: StatsPeriod,
  data: z.array(CompletionTrendPointSchema),
});
export type CompletionTrend = z.infer<typeof CompletionTrendSchema>;

export const WeekdayBreakdownItemSchema = z.object({
  weekday: z.number().int().min(0).max(6),
  rate: z.number().min(0).max(1),
  doneCount: z.number().int().nonnegative(),
  dueCount: z.number().int().nonnegative(),
});
export type WeekdayBreakdownItem = z.infer<typeof WeekdayBreakdownItemSchema>;

export const WeekdayBreakdownSchema = z.object({
  period: StatsPeriod,
  data: z.array(WeekdayBreakdownItemSchema),
});
export type WeekdayBreakdown = z.infer<typeof WeekdayBreakdownSchema>;
