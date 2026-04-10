'use client';

import { useEffect, useState, useMemo } from 'react';
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip } from 'recharts';
import { Coins } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { mockUsdcData } from '@/lib/mock-data';

function aggregateMonthly(data: { date: string; value: number }[]) {
  if (!data || data.length === 0) return [];
  const months = new Map<string, { sum: number; count: number }>();
  for (const d of data) {
    const key = d.date.slice(0, 7); // "2025-04"
    const entry = months.get(key) || { sum: 0, count: 0 };
    entry.sum += d.value;
    entry.count += 1;
    months.set(key, entry);
  }
  return Array.from(months.entries()).map(([month, { sum, count }]) => ({
    date: month,
    value: Math.round(sum / count),
  }));
}

export default function UsdcCirculation() {
  const [data, setData] = useState(mockUsdcData);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/usdc');
        const json = await res.json();
        if (json.success && json.data) setData(json.data);
      } catch { /* keep mock */ }
    };
    fetchData();
  }, []);

  const monthlyData = useMemo(() => aggregateMonthly(data.marketCapHistory), [data.marketCapHistory]);
  const change = data.marketCapChange24h;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-2">
        <Coins className="w-4 h-4 text-[var(--primary)]" />
        <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">USDC Supply</span>
      </div>
      <div className="text-2xl font-bold font-mono text-[var(--foreground)]">
        {formatCurrency(data.circulatingSupply, 1)}
      </div>
      <div className={`text-sm font-mono mt-1 ${change >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
        {change >= 0 ? '+' : ''}{change.toFixed(2)}% MoM
      </div>
      <div className="flex-1 min-h-0 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={monthlyData}>
            <defs>
              <linearGradient id="usdcGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 9, fill: 'var(--muted)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(d) => {
                const [, m] = d.split('-');
                const months = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                return months[parseInt(m)];
              }}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                fontSize: 12,
                color: 'var(--foreground)',
              }}
              formatter={(val: number) => [formatCurrency(val, 1), 'Supply']}
              labelFormatter={(d) => {
                const [y, m] = d.split('-');
                const months = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                return `${months[parseInt(m)]} ${y}`;
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--primary)"
              strokeWidth={2}
              fill="url(#usdcGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
