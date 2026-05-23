import { type ReactElement } from 'react';
import { ResponsiveContainer } from 'recharts';

import { cn } from '@/lib/utils';

export type ChartTooltipProps = {
  active?: boolean;
  payload?: ReadonlyArray<{ value?: unknown }>;
  label?: string | number;
};

type Props = {
  children: ReactElement;
  height?: number;
  className?: string;
};

export function ChartContainer({ children, height = 240, className }: Props) {
  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}
