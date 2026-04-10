'use client';

import { useEffect, useState } from 'react';
import { Activity, Clock } from 'lucide-react';
import ThemeToggle from '@/components/theme/ThemeToggle';
import { formatCurrency } from '@/lib/utils';

export default function Header() {
  const [price, setPrice] = useState<number | null>(null);
  const [change, setChange] = useState<number>(0);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch('/api/stock?type=quote');
        const data = await res.json();
        if (data.success && data.data) {
          setPrice(data.data.price);
          setChange(data.data.changePercent);
        }
      } catch { /* use existing values */ }
    };
    fetchPrice();
    const interval = setInterval(fetchPrice, 60_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]">
      <div className="max-w-[1600px] mx-auto px-3 h-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-[var(--primary)]" />
          <span className="font-semibold text-[var(--foreground)]">Circle Signal</span>
          {price !== null && (
            <div className="flex items-center gap-2 ml-4 text-sm">
              <span className="font-mono font-medium text-[var(--foreground)]">
                CRCL {formatCurrency(price)}
              </span>
              <span
                className={`font-mono text-xs px-1.5 py-0.5 rounded ${
                  change >= 0
                    ? 'bg-[var(--green-light)] text-[var(--green)]'
                    : 'bg-[var(--red-light)] text-[var(--red)]'
                }`}
              >
                {change >= 0 ? '+' : ''}{change.toFixed(2)}%
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-[var(--muted)]">
            <Clock className="w-3.5 h-3.5" />
            <span>Updated {new Date().toLocaleTimeString()}</span>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
