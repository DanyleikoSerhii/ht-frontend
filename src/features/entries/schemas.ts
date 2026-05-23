import { z } from 'zod';

import { EntryId, HabitId, HexColor, IsoDateTime, LocalDate } from '@/shared/api/primitives';

export const HabitEntrySchema = z.object({
  id: EntryId,
  habitId: HabitId,
  date: LocalDate,
  count: z.number().int().nonnegative(),
  note: z.string().max(1000).nullable(),
  createdAt: IsoDateTime,
  updatedAt: IsoDateTime,
});
export type HabitEntry = z.infer<typeof HabitEntrySchema>;

export const UpsertEntryInput = z.object({
  count: z.number().int().nonnegative(),
  note: z.string().max(1000).nullish(),
});
export type UpsertEntryInput = z.infer<typeof UpsertEntryInput>;

export const EntriesRangeQuery = z.object({
  habitId: HabitId,
  from: LocalDate,
  to: LocalDate,
});
export type EntriesRangeQuery = z.infer<typeof EntriesRangeQuery>;

export const TodayEntrySchema = z.object({
  count: z.number().int().nonnegative(),
  note: z.string().max(1000).nullable(),
});
export type TodayEntry = z.infer<typeof TodayEntrySchema>;

export const TodayItemSchema = z.object({
  habitId: HabitId,
  title: z.string(),
  color: HexColor,
  icon: z.string().nullable(),
  kind: z.enum(['boolean', 'counter']),
  targetPerDay: z.number().int().positive(),
  frequency: z.enum(['daily', 'weekdays', 'weekends', 'custom']),
  isDue: z.boolean(),
  entry: TodayEntrySchema.nullable(),
});
export type TodayItem = z.infer<typeof TodayItemSchema>;

export const TodayResponseSchema = z.object({
  date: LocalDate,
  items: z.array(TodayItemSchema),
});
export type TodayResponse = z.infer<typeof TodayResponseSchema>;
