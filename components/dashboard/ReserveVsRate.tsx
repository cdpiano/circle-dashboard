'use client';

import { useState } from 'react';
import { XAxis, YAxis, ResponsiveContainer, Tooltip, Line, ComposedChart } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { mockReserveVsRateData } from '@/lib/mock-data';

export default function ReserveVsRate() {
  const [data] = useState(mockReserveVsRateData.quarters);

  const latestSpread = data[data.length - 1]?.spread ?? 0;
  const isDark = typeof document !== 'undefined'
    ? document.documentElement.getAttribute('data-theme') === 'dark'
    : true;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="w-4 h-4 text-[var(--primary)]" />
        <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">Reserve Yield vs Fed Rate</span>
        <span className="text-xs font-mono text-[var(--muted)] ml-auto">
          Spread: <span className={latestSpread >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'}>
            {latestSpread >= 0 ? '+' : ''}{(latestSpread * 100).toFixed(0)}bps
          </span>
        </span>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <XAxis dataKey="quarter" tick={{ fontSize: 10, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 10, fill: 'var(--muted)' }}
              axisLine={false}
              tickLine={false}
              domain={['auto', 'auto']}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                background: isDark ? '#1E293B' : '#FFFFFF',
                border: `1px solid ${isDark ? '#334155' : '#E5E7EB'}`,
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(val, name) => [`${Number(val).toFixed(2)}%`, name === 'fedRate' ? 'Fed Rate' : 'Reserve Yield'] as [string, string]}
            />
            <Line type="monotone" dataKey="fedRate" stroke="var(--red)" strokeWidth={2} dot={{ r: 3 }} name="fedRate" />
            <Line type="monotone" dataKey="reserveYield" stroke="var(--primary)" strokeWidth={2} dot={{ r: 3 }} name="reserveYield" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
