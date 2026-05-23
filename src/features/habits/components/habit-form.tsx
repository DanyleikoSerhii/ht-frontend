import { zodResolver } from '@hookform/resolvers/zod';
import * as Icons from 'lucide-react';
import { useEffect, type ReactNode } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import type { z } from 'zod';

import { cn } from '@/lib/utils';
import { ApiError } from '@/shared/api/errors';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';

import { CreateHabitInput, type Weekday } from '../schemas';

const COLOR_SWATCHES = [
  '#f59e0b',
  '#10b981',
  '#fb7185',
  '#a78bfa',
  '#60a5fa',
  '#ef4444',
  '#fbbf24',
  '#34d399',
] as const;

const ICON_NAMES = [
  'Activity',
  'Apple',
  'Book',
  'Briefcase',
  'Coffee',
  'Droplet',
  'Dumbbell',
  'Footprints',
  'GraduationCap',
  'Heart',
  'Languages',
  'Leaf',
  'Moon',
  'Music',
  'Palette',
  'Pencil',
  'Phone',
  'Smile',
  'Sparkles',
  'Star',
  'Sun',
  'Target',
  'Trophy',
  'Zap',
] as const;

type IconName = (typeof ICON_NAMES)[number];
const NO_ICON_VALUE = '__none';

const WEEKDAY_LABELS: readonly string[] = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const WEEKDAY_NAMES: readonly string[] = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Every day' },
  { value: 'weekdays', label: 'Weekdays (Mon–Fri)' },
  { value: 'weekends', label: 'Weekends (Sat–Sun)' },
  { value: 'custom', label: 'Custom days' },
] as const;

// CreateHabitInput omits the two HabitSchema refines (frequency=custom needs days,
// boolean kind needs targetPerDay=1) because they live on HabitSchema. Re-add them
// here so the form validates the same invariants client-side before the round-trip.
const FormSchema = CreateHabitInput.refine(
  (v) => v.frequency !== 'custom' || (v.customDays !== null && v.customDays.length > 0),
  { message: 'Pick at least one day', path: ['customDays'] },
).refine((v) => v.kind === 'counter' || v.targetPerDay === 1, {
  message: 'Boolean habits must have target = 1',
  path: ['targetPerDay'],
});

type FormValues = z.input<typeof CreateHabitInput>;
type SubmitValues = z.output<typeof CreateHabitInput>;

const DEFAULTS: FormValues = {
  title: '',
  description: null,
  color: '#f59e0b',
  icon: 'Activity',
  kind: 'boolean',
  targetPerDay: 1,
  frequency: 'daily',
  customDays: null,
  reminderTime: null,
};

type HabitFormProps = {
  defaultValues?: Partial<FormValues>;
  submitLabel?: string;
  onSubmit: (values: SubmitValues) => Promise<void>;
};

export function HabitForm({ defaultValues, submitLabel = 'Save', onSubmit }: HabitFormProps) {
  const form = useForm<FormValues, unknown, SubmitValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: { ...DEFAULTS, ...defaultValues },
  });

  const kind = useWatch({ control: form.control, name: 'kind' });
  const frequency = useWatch({ control: form.control, name: 'frequency' });
  const currentColor = useWatch({ control: form.control, name: 'color' }) ?? '';
  const currentIcon = useWatch({ control: form.control, name: 'icon' });

  // Keep hidden fields in a valid state when their visibility-toggle flips.
  useEffect(() => {
    if (kind === 'boolean' && form.getValues('targetPerDay') !== 1) {
      form.setValue('targetPerDay', 1, { shouldValidate: true });
    }
  }, [kind, form]);

  useEffect(() => {
    if (frequency !== 'custom' && form.getValues('customDays') !== null) {
      form.setValue('customDays', null, { shouldValidate: true });
    }
  }, [frequency, form]);

  async function handleSubmit(values: SubmitValues) {
    try {
      await onSubmit(values);
    } catch (err) {
      if (err instanceof ApiError && err.body.fieldErrors) {
        for (const [field, messages] of Object.entries(err.body.fieldErrors)) {
          const message = messages[0];
          if (!message) continue;
          form.setError(field as keyof FormValues, { type: 'server', message });
        }
        return;
      }
      throw err;
    }
  }

  const IconPreview = currentIcon ? Icons[currentIcon as IconName] : null;
  const errors = form.formState.errors;

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4" noValidate>
      <Field label="Title" error={errors.title?.message} htmlFor="habit-title">
        <Input id="habit-title" {...form.register('title')} />
      </Field>

      <Field label="Description" error={errors.description?.message} htmlFor="habit-description">
        <Controller
          control={form.control}
          name="description"
          render={({ field }) => (
            <textarea
              id="habit-description"
              rows={3}
              value={field.value ?? ''}
              onChange={(e) => field.onChange(e.target.value.length > 0 ? e.target.value : null)}
              onBlur={field.onBlur}
              ref={field.ref}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
          )}
        />
      </Field>

      <Field label="Color" error={errors.color?.message}>
        <div className="flex flex-wrap items-center gap-2">
          {COLOR_SWATCHES.map((swatch) => (
            <button
              key={swatch}
              type="button"
              aria-label={`Color ${swatch}`}
              aria-pressed={currentColor === swatch}
              onClick={() =>
                form.setValue('color', swatch, { shouldValidate: true, shouldDirty: true })
              }
              className={cn(
                'size-8 rounded-full border-2 transition-transform hover:scale-110',
                currentColor === swatch ? 'border-foreground' : 'border-transparent',
              )}
              style={{ backgroundColor: swatch }}
            />
          ))}
          <Input
            aria-label="Hex color"
            type="text"
            className="ml-2 w-28 font-mono text-sm"
            placeholder="#hex"
            value={currentColor}
            onChange={(e) =>
              form.setValue('color', e.target.value, { shouldValidate: true, shouldDirty: true })
            }
          />
        </div>
      </Field>

      <Field label="Icon" error={errors.icon?.message}>
        <div className="flex items-center gap-3">
          <div
            className="flex size-10 items-center justify-center rounded-md border border-input bg-muted"
            aria-hidden
          >
            {IconPreview ? <IconPreview className="size-5 text-foreground" /> : null}
          </div>
          <Controller
            control={form.control}
            name="icon"
            render={({ field }) => (
              <Select
                value={field.value ?? NO_ICON_VALUE}
                onValueChange={(v) => field.onChange(v === NO_ICON_VALUE ? null : v)}
              >
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="Pick an icon" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_ICON_VALUE}>No icon</SelectItem>
                  {ICON_NAMES.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </Field>

      <Field label="Type" error={errors.kind?.message}>
        <div role="radiogroup" aria-label="Type" className="flex gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" value="boolean" className="size-4" {...form.register('kind')} />
            Boolean
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" value="counter" className="size-4" {...form.register('kind')} />
            Counter
          </label>
        </div>
      </Field>

      {kind === 'counter' && (
        <Field label="Target per day" error={errors.targetPerDay?.message} htmlFor="habit-target">
          <Input
            id="habit-target"
            type="number"
            min={1}
            className="w-24"
            {...form.register('targetPerDay', { valueAsNumber: true })}
          />
        </Field>
      )}

      <Field label="Frequency" error={errors.frequency?.message}>
        <Controller
          control={form.control}
          name="frequency"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FREQUENCY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </Field>

      {frequency === 'custom' && (
        <Field label="Days of week" error={errors.customDays?.message}>
          <Controller
            control={form.control}
            name="customDays"
            render={({ field }) => <WeekdayPicker value={field.value} onChange={field.onChange} />}
          />
        </Field>
      )}

      <Field label="Reminder time" error={errors.reminderTime?.message} htmlFor="habit-reminder">
        <Controller
          control={form.control}
          name="reminderTime"
          render={({ field }) => (
            <Input
              id="habit-reminder"
              type="time"
              className="w-32"
              value={field.value ?? ''}
              onChange={(e) => field.onChange(e.target.value.length > 0 ? e.target.value : null)}
              onBlur={field.onBlur}
              ref={field.ref}
            />
          )}
        />
      </Field>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

type FieldProps = {
  label: string;
  error?: string;
  htmlFor?: string;
  children: ReactNode;
};

function Field({ label, error, htmlFor, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

type WeekdayPickerProps = {
  value: Weekday[] | null;
  onChange: (value: Weekday[] | null) => void;
};

function WeekdayPicker({ value, onChange }: WeekdayPickerProps) {
  const selected = new Set(value ?? []);

  function toggle(day: Weekday) {
    const next = new Set(selected);
    if (next.has(day)) {
      next.delete(day);
    } else {
      next.add(day);
    }
    const arr = Array.from(next).sort((a, b) => a - b);
    onChange(arr.length > 0 ? arr : null);
  }

  return (
    <div role="group" aria-label="Days of week" className="flex gap-1">
      {WEEKDAY_LABELS.map((label, idx) => {
        const day = idx as Weekday;
        const isOn = selected.has(day);
        return (
          <button
            key={idx}
            type="button"
            aria-label={WEEKDAY_NAMES[idx]}
            aria-pressed={isOn}
            onClick={() => toggle(day)}
            className={cn(
              'size-9 rounded-md border text-sm font-medium transition-colors',
              isOn
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-input bg-background hover:bg-accent',
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
