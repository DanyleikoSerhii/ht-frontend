import {
  ArchiveIcon,
  ArchiveRestoreIcon,
  MoreHorizontalIcon,
  PencilIcon,
  Trash2Icon,
  type LucideIcon,
} from 'lucide-react';
import * as Icons from 'lucide-react';
import { createElement } from 'react';

import { cn } from '@/lib/utils';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';

import { type Habit } from '../schemas';

const FREQUENCY_LABEL: Record<Habit['frequency'], string> = {
  daily: 'Every day',
  weekdays: 'Weekdays',
  weekends: 'Weekends',
  custom: 'Custom days',
};

type HabitCardProps = {
  habit: Habit;
  onEdit?: (habit: Habit) => void;
  onArchive?: (habit: Habit) => void;
  onDelete?: (habit: Habit) => void;
};

export function HabitCard({ habit, onEdit, onArchive, onDelete }: HabitCardProps) {
  const iconComponent = resolveIcon(habit.icon);
  const isArchived = habit.archivedAt !== null;
  const isCounter = habit.kind === 'counter';

  return (
    <Card
      data-archived={isArchived || undefined}
      className={cn('calm gap-3 py-4', isArchived && 'opacity-60')}
    >
      <CardHeader className="flex flex-row items-start gap-3 px-4 has-data-[slot=card-action]:grid-cols-[auto_1fr_auto]">
        <span
          aria-hidden
          className="flex size-11 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${habit.color}1f`, color: habit.color }}
        >
          {createElement(iconComponent, { className: 'size-5' })}
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <CardTitle className="truncate text-base font-semibold">{habit.title}</CardTitle>
          {habit.description ? (
            <CardDescription className="line-clamp-2">{habit.description}</CardDescription>
          ) : null}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${habit.title}`}>
              <MoreHorizontalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onEdit?.(habit)}>
              <PencilIcon />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onArchive?.(habit)}>
              {isArchived ? <ArchiveRestoreIcon /> : <ArchiveIcon />}
              {isArchived ? 'Restore' : 'Archive'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={() => onDelete?.(habit)}>
              <Trash2Icon />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-1.5 px-4">
        <Pill>{FREQUENCY_LABEL[habit.frequency]}</Pill>
        {isCounter ? <Pill>target {habit.targetPerDay}/day</Pill> : null}
        {habit.reminderTime ? <Pill>reminder {habit.reminderTime}</Pill> : null}
      </CardContent>
    </Card>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
      {children}
    </span>
  );
}

function resolveIcon(name: string | null): LucideIcon {
  if (!name) return Icons.CircleDashedIcon;
  const map = Icons as unknown as Record<string, LucideIcon | undefined>;
  return map[name] ?? Icons.CircleDashedIcon;
}
