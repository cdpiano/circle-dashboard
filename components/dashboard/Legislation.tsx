'use client';

import { useEffect, useState } from 'react';
import { Scale } from 'lucide-react';

interface RegulatoryItem {
  title: string;
  region: string;
  status: 'positive' | 'neutral' | 'negative' | 'pending';
  impact: 'high' | 'medium' | 'low';
  date: string;
  description: string;
}

const STATUS_COLORS: Record<string, string> = {
  positive: 'bg-[var(--green-light)] text-[var(--green)]',
  neutral: 'bg-[var(--muted-light)] text-[var(--muted)]',
  negative: 'bg-[var(--red-light)] text-[var(--red)]',
  pending: 'bg-amber-500/10 text-amber-500',
};

const STATUS_LABELS: Record<string, string> = {
  positive: 'Passed',
  neutral: 'Neutral',
  negative: 'Blocked',
  pending: 'Pending',
};

export default function Legislation() {
  const [items, setItems] = useState<RegulatoryItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/regulatory');
        const json = await res.json();
        const updates = json.updates || json.data?.updates || (Array.isArray(json) ? json : []);
        if (updates.length > 0) {
          const sorted = [...updates].sort((a: RegulatoryItem, b: RegulatoryItem) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          setItems(sorted.slice(0, 8));
        }
      } catch { /* keep empty */ }
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <Scale className="w-4 h-4 text-[var(--primary)]" />
        <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">Legislation</span>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0 grid grid-cols-2 lg:grid-cols-4 gap-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2 p-2 rounded-lg hover:bg-[var(--muted-light)] transition-colors">
            <span className={`text-xs px-1.5 py-0.5 rounded font-medium shrink-0 mt-0.5 ${STATUS_COLORS[item.status]}`}>
              {STATUS_LABELS[item.status]}
            </span>
            <div className="min-w-0">
              <div className="text-sm font-medium text-[var(--foreground)] leading-tight line-clamp-2">{item.title}</div>
              <div className="text-xs text-[var(--muted)] mt-0.5">{item.region || (item as any).country} · {new Date(item.date).toLocaleDateString()}</div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-sm text-[var(--muted)] text-center py-8 col-span-4">Loading...</div>
        )}
      </div>
    </div>
  );
}
