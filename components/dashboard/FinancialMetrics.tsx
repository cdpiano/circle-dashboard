'use client';

import { useEffect, useState } from 'react';
import { ComposedChart, Line, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { mockFinancialMetrics, mockQuarterlyRevenue } from '@/lib/mock-data';
import type { FinancialMetrics as FinancialMetricsType, QuarterlyRevenue } from '@/lib/types';

export default function FinancialMetrics() {
  const [metrics, setMetrics] = useState<FinancialMetricsType>(mockFinancialMetrics);
  const [quarterly, setQuarterly] = useState<QuarterlyRevenue[]>(mockQuarterlyRevenue);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/financials');
        const json = await res.json();
        const data = json.data || json;
        if (data.metrics) setMetrics(data.metrics);
        if (data.quarterly) {
          setQuarterly(data.quarterly.map((d: any) => ({
            ...d,
            adjEbitda: d.adjEbitda ?? d.adj_ebitda,
            rldcMargin: d.rldcMargin ?? d.rldc_margin,
          })));
        }
      } catch { /* keep mock */ }
    };
    fetchData();
  }, []);

  const isDark = typeof document !== 'undefined'
    ? document.documentElement.getAttribute('data-theme') === 'dark'
    : true;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-2">
        <DollarSign className="w-4 h-4 text-[var(--primary)]" />
        <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">Financials</span>
        <span className="text-xs text-[var(--muted)] ml-auto">{metrics.period}</span>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={quarterly}>
            <XAxis
              dataKey="quarter"
              tick={{ fontSize: 9, fill: 'var(--muted)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 9, fill: 'var(--muted)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${(v / 1e6).toFixed(0)}M`}
              width={55}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 9, fill: '#F59E0B' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
              domain={[30, 60]}
              width={40}
            />
            <Tooltip
              contentStyle={{
                background: isDark ? '#1E293B' : '#FFFFFF',
                border: `1px solid ${isDark ? '#334155' : '#E5E7EB'}`,
                borderRadius: 8,
                fontSize: 11,
              }}
              formatter={(val: number, name: string) => {
                if (name === 'rldcMargin') return [`${val.toFixed(1)}%`, 'RLDC Margin'];
                const labels: Record<string, string> = {
                  revenue: 'Revenue',
                  netIncome: 'Net Income',
                  adjEbitda: 'Adj EBITDA',
                };
                return [formatCurrency(val, 0), labels[name] || name];
              }}
            />
            <Legend
              iconSize={8}
              wrapperStyle={{ fontSize: 10, color: 'var(--muted)' }}
              formatter={(value) => {
                const labels: Record<string, string> = {
                  revenue: 'Revenue',
                  netIncome: 'Net Income',
                  adjEbitda: 'Adj EBITDA',
                  rldcMargin: 'RLDC Margin',
                };
                return labels[value] || value;
              }}
            />
            <Bar yAxisId="left" dataKey="revenue" fill="#3B82F6" opacity={0.7} radius={[2, 2, 0, 0]} />
            <Bar yAxisId="left" dataKey="netIncome" fill="#22C55E" opacity={0.7} radius={[2, 2, 0, 0]} />
            <Bar yAxisId="left" dataKey="adjEbitda" fill="#A855F7" opacity={0.7} radius={[2, 2, 0, 0]} />
            <Line yAxisId="right" type="monotone" dataKey="rldcMargin" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
