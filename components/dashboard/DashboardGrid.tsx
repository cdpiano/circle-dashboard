import { ReactNode } from 'react';

export default function DashboardGrid({ children }: { children: ReactNode }) {
  return (
    <div className="dashboard-grid">
      {children}
    </div>
  );
}
