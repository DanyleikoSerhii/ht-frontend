import { z } from 'zod';

import { HabitId, HexColor, IsoDateTime } from '@/shared/api/primitives';

export const HabitFrequency = z.enum(['daily', 'weekdays', 'weekends', 'custom']);
export type HabitFrequency = z.infer<typeof HabitFrequency>;

// 0 = Sunday, 6 = Saturday (matches Date.prototype.getDay())
export const Weekday = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
]);
export type Weekday = z.infer<typeof Weekday>;

export const HabitKind = z.enum(['boolean', 'counter']);
export type HabitKind = z.infer<typeof HabitKind>;

const HabitObject = z.object({
  id: HabitId,
  title: z.string().min(1).max(100),
  description: z.string().max(500).nullable(),
  color: HexColor,
  icon: z.string().min(1).max(48).nullable(),
  kind: HabitKind,
  targetPerDay: z.number().int().positive(),
  frequency: HabitFrequency,
  customDays: z.array(Weekday).nullable(),
  reminderTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
    .nullable(),
  sortOrder: z.number().int(),
  createdAt: IsoDateTime,
  archivedAt: IsoDateTime.nullable(),
});

export const HabitSchema = HabitObject.refine(
  (h) => h.frequency !== 'custom' || (h.customDays !== null && h.customDays.length > 0),
  { message: 'customDays required when frequency=custom', path: ['customDays'] },
).refine((h) => h.kind === 'counter' || h.targetPerDay === 1, {
  message: 'targetPerDay must be 1 for boolean habits',
  path: ['targetPerDay'],
});
export type Habit = z.infer<typeof HabitSchema>;

export const CreateHabitInput = HabitObject.omit({
  id: true,
  createdAt: true,
  archivedAt: true,
  sortOrder: true,
}).extend({
  sortOrder: z.number().int().optional(),
});
export type CreateHabitInput = z.infer<typeof CreateHabitInput>;

export const UpdateHabitInput = CreateHabitInput.partial();
export type UpdateHabitInput = z.infer<typeof UpdateHabitInput>;
