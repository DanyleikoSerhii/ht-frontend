import { z } from 'zod';

import { EntryId, HabitId, IsoDateTime, LocalDate } from '@/shared/api/primitives';
import { HabitSchema } from '@/features/habits/schemas';

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
  date: LocalDate,
  count: z.number().int().nonnegative(),
  note: z.string().max(1000).optional(),
});
export type UpsertEntryInput = z.infer<typeof UpsertEntryInput>;

export const EntriesRangeQuery = z.object({
  habitId: HabitId,
  from: LocalDate,
  to: LocalDate,
});
export type EntriesRangeQuery = z.infer<typeof EntriesRangeQuery>;

export const TodayItemSchema = z.object({
  habit: HabitSchema,
  entry: HabitEntrySchema.nullable(),
  isDue: z.boolean(),
});
export type TodayItem = z.infer<typeof TodayItemSchema>;
