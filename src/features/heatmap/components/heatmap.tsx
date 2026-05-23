import dayjs from 'dayjs';
import { useMemo } from 'react';

import { type HeatmapCell } from '@/features/stats/schemas';
import { type LocalDate } from '@/shared/api/primitives';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/tooltip';

const CELL_SIZE = 11;
const CELL_GAP = 3;
const DAY_LABELS_SHORT = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

type GridCell = {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
  inRange: boolean;
  dayIndex: number;
  weekIndex: number;
};

type Props = {
  cells: HeatmapCell[];
  habitColor: string;
  from: LocalDate;
  to: LocalDate;
};

export function Heatmap({ cells, habitColor, from, to }: Props) {
  const { gridCells, inRangeCells, numWeeks, monthLabels } = useMemo(() => {
    const cellMap = new Map<string, HeatmapCell>(cells.map((c) => [c.date, c]));

    const fromDay = dayjs(from);
    const fromDow = fromDay.day(); // 0=Sun, 1=Mon ... 6=Sat
    const mondayOffset = fromDow === 0 ? 6 : fromDow - 1;
    const gridStart = fromDay.subtract(mondayOffset, 'day');

    const toDay = dayjs(to);
    const toDow = toDay.day();
    const sundayOffset = toDow === 0 ? 0 : 7 - toDow;
    const gridEnd = toDay.add(sundayOffset, 'day');

    const totalDays = gridEnd.diff(gridStart, 'day') + 1;
    const numWeeks = Math.ceil(totalDays / 7);

    const gridCells: GridCell[] = [];
    const weekStarts: dayjs.Dayjs[] = [];

    for (let wi = 0; wi < numWeeks; wi++) {
      const weekStart = gridStart.add(wi * 7, 'day');
      weekStarts.push(weekStart);
      for (let di = 0; di < 7; di++) {
        const d = weekStart.add(di, 'day');
        const dateStr = d.format('YYYY-MM-DD');
        const inRange = dateStr >= from && dateStr <= to;
        const cellData = inRange ? cellMap.get(dateStr) : undefined;
        gridCells.push({
          date: dateStr,
          count: cellData?.count ?? 0,
          level: cellData?.level ?? 0,
          inRange,
          dayIndex: di,
          weekIndex: wi,
        });
      }
    }

    const monthLabels: Array<{ weekIndex: number; label: string }> = [];
    weekStarts.forEach((ws, wi) => {
      if (wi === 0 || ws.month() !== weekStarts[wi - 1]!.month()) {
        monthLabels.push({ weekIndex: wi, label: ws.format('MMM') });
      }
    });

    const inRangeCells = gridCells.filter((c) => c.inRange);
    return { gridCells, inRangeCells, numWeeks, monthLabels };
  }, [cells, from, to]);

  function cellBg(level: 0 | 1 | 2 | 3 | 4, inRange: boolean): string {
    if (!inRange) return 'transparent';
    if (level === 0) return 'var(--color-border)';
    return `color-mix(in srgb, ${habitColor} ${level * 25}%, transparent)`;
  }

  const baseStyle = { width: `${CELL_SIZE}px`, height: `${CELL_SIZE}px`, borderRadius: '2px' };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="overflow-x-auto">
        <div className="inline-flex min-w-max flex-col gap-1">
          {/* Month labels */}
          <div
            aria-hidden
            className="flex text-[9px] leading-tight text-muted-foreground"
            style={{ marginLeft: '20px', gap: `${CELL_GAP}px` }}
          >
            {Array.from({ length: numWeeks }, (_, wi) => (
              <div
                key={wi}
                style={{ width: `${CELL_SIZE}px`, minWidth: `${CELL_SIZE}px` }}
                className="overflow-visible"
              >
                {monthLabels.find((m) => m.weekIndex === wi)?.label ?? ''}
              </div>
            ))}
          </div>

          <div className="flex gap-1">
            {/* Day-of-week labels */}
            <div
              aria-hidden
              className="flex flex-col text-[9px] text-muted-foreground"
              style={{ gap: `${CELL_GAP}px`, width: '16px' }}
            >
              {DAY_LABELS_SHORT.map((label, i) => (
                <div
                  key={i}
                  style={{ height: `${CELL_SIZE}px`, lineHeight: `${CELL_SIZE}px` }}
                  className="text-right"
                >
                  {i % 2 === 0 ? label : ''}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div
              role="grid"
              aria-label="Activity heatmap"
              aria-rowcount={7}
              aria-colcount={numWeeks}
              style={{
                display: 'grid',
                gridTemplateRows: `repeat(7, ${CELL_SIZE}px)`,
                gridAutoFlow: 'column',
                gap: `${CELL_GAP}px`,
              }}
            >
              {gridCells.map((cell) =>
                cell.inRange ? (
                  <Tooltip key={cell.date}>
                    <TooltipTrigger asChild>
                      <div
                        role="gridcell"
                        tabIndex={0}
                        aria-label={`${cell.date}: ${cell.count} ${cell.count === 1 ? 'time' : 'times'}`}
                        aria-rowindex={cell.dayIndex + 1}
                        aria-colindex={cell.weekIndex + 1}
                        style={{
                          ...baseStyle,
                          backgroundColor: cellBg(cell.level, true),
                          cursor: 'default',
                        }}
                        onKeyDown={(e) => {
                          const idx = inRangeCells.findIndex((c) => c.date === cell.date);
                          let next: GridCell | undefined;
                          if (e.key === 'ArrowRight') next = inRangeCells[idx + 7];
                          else if (e.key === 'ArrowLeft') next = inRangeCells[idx - 7];
                          else if (e.key === 'ArrowDown') next = inRangeCells[idx + 1];
                          else if (e.key === 'ArrowUp') next = inRangeCells[idx - 1];
                          if (next) {
                            e.preventDefault();
                            document
                              .querySelector<HTMLElement>(`[aria-label^="${next.date}:"]`)
                              ?.focus();
                          }
                        }}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <span className="font-medium">{cell.date}</span>
                      {cell.count > 0 && (
                        <span className="ml-1 opacity-70">
                          · {cell.count} {cell.count === 1 ? 'time' : 'times'}
                        </span>
                      )}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <div key={cell.date} role="presentation" style={baseStyle} />
                ),
              )}
            </div>
          </div>

          {/* Level legend */}
          <div
            aria-hidden
            className="flex items-center justify-end gap-1 text-[9px] text-muted-foreground"
          >
            <span>Less</span>
            {([0, 1, 2, 3, 4] as const).map((level) => (
              <div
                key={level}
                style={{
                  ...baseStyle,
                  backgroundColor:
                    level === 0
                      ? 'var(--color-border)'
                      : `color-mix(in srgb, ${habitColor} ${level * 25}%, transparent)`,
                }}
              />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
