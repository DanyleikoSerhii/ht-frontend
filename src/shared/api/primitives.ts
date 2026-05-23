import { z } from 'zod';

export const UserId = z.string().uuid().brand<'UserId'>();
export type UserId = z.infer<typeof UserId>;

export const HabitId = z.string().uuid().brand<'HabitId'>();
export type HabitId = z.infer<typeof HabitId>;

export const EntryId = z.string().uuid().brand<'EntryId'>();
export type EntryId = z.infer<typeof EntryId>;

export const LocalDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'expected YYYY-MM-DD')
  .brand<'LocalDate'>();
export type LocalDate = z.infer<typeof LocalDate>;

export const IsoDateTime = z.string().datetime({ offset: true }).brand<'IsoDateTime'>();
export type IsoDateTime = z.infer<typeof IsoDateTime>;

export const HexColor = z
  .string()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'expected #RGB or #RRGGBB')
  .brand<'HexColor'>();
export type HexColor = z.infer<typeof HexColor>;

export const Timezone = z.string().min(1).brand<'Timezone'>();
export type Timezone = z.infer<typeof Timezone>;
