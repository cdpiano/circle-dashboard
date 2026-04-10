import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GridCardProps {
  children: ReactNode;
  colSpan?: number;
  rowSpan?: number;
  className?: string;
}

const colSpanMap: Record<number, string> = {
  1: 'col-span-1',
  2: 'col-span-2',
  3: 'col-span-3',
  4: 'col-span-4',
  5: 'col-span-5',
  6: 'col-span-6',
};

const rowSpanMap: Record<number, string> = {
  1: 'row-span-1',
  2: 'row-span-2',
  3: 'row-span-3',
  4: 'row-span-4',
};

export default function GridCard({
  children,
  colSpan = 1,
  rowSpan = 1,
  className,
}: GridCardProps) {
  return (
    <div
      className={cn(
        'dashboard-card overflow-hidden flex flex-col',
        colSpanMap[colSpan],
        rowSpanMap[rowSpan],
        className
      )}
    >
      {children}
    </div>
  );
}
