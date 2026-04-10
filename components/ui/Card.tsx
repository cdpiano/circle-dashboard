'use client';

import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className, hover = true }: CardProps) {
  return (
    <div className={cn('dashboard-card', hover && 'hover:shadow-md', className)}>
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  subColor?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({ label, value, subValue, subColor, icon, className }: StatCardProps) {
  return (
    <div className={cn('stat-card', className)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted font-medium">{label}</span>
        {icon && <span className="text-muted">{icon}</span>}
      </div>
      <div className="text-xl font-semibold tracking-tight truncate">{value}</div>
      {subValue && (
        <div className={cn('text-sm mt-1 font-medium', subColor || 'text-muted')}>
          {subValue}
        </div>
      )}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} />;
}

export function SectionHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center text-primary">
        {icon}
      </div>
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
      </div>
    </div>
  );
}
